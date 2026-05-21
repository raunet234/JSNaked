import type { ObfuscationType } from '@/lib/types';

export function isJSFuck(code: string): boolean {
  return /^[\s\[\]()+!]+$/.test(code.trim()) && code.trim().length > 0;
}

export function isEvalWrapped(code: string): boolean {
  return (
    /^\s*eval\s*\(/.test(code) ||
    /^\s*new\s+Function\s*\(/.test(code) ||
    /setTimeout\s*\(\s*['"]/.test(code) ||
    /setInterval\s*\(\s*['"]/.test(code)
  );
}

export function isObfuscatorIO(code: string): boolean {
  return /_0x[a-f0-9]+/i.test(code) && /\(['"]0x[0-9a-f]+['"]\)/.test(code);
}

export function isBase64Encoded(code: string): boolean {
  return /atob\s*\(\s*['"]/.test(code);
}

export function isHexEncoded(code: string): boolean {
  return /\\x[0-9a-fA-F]{2}/.test(code);
}

export function isUnicodeEncoded(code: string): boolean {
  return /\\u[0-9a-fA-F]{4}/.test(code);
}

export function isPacked(code: string): boolean {
  return /eval\s*\(\s*function\s*\(\s*p\s*,\s*a\s*,\s*c\s*,\s*k\s*,\s*e\s*,/.test(code);
}

export function isClean(code: string): boolean {
  return (
    !isJSFuck(code) &&
    !isEvalWrapped(code) &&
    !isObfuscatorIO(code) &&
    !isBase64Encoded(code) &&
    !isHexEncoded(code) &&
    !isUnicodeEncoded(code) &&
    !isPacked(code)
  );
}

export function detectObfuscationType(code: string): ObfuscationType {
  if (isJSFuck(code)) return 'jsfuck';
  if (isPacked(code)) return 'packed';
  if (isEvalWrapped(code)) return 'eval-wrapped';
  if (isObfuscatorIO(code)) return 'obfuscator-io';
  if (isBase64Encoded(code)) return 'base64';
  if (isHexEncoded(code)) return 'hex';
  if (isUnicodeEncoded(code)) return 'unicode';
  return 'clean';
}
