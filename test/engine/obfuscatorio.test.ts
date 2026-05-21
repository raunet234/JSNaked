import { describe, it, expect } from 'vitest';
import { resolveObfuscatorIO } from '@/lib/engine/obfuscatorio';

describe('resolveObfuscatorIO', () => {
  it('resolves string array references to their values', () => {
    // Simple case: no rotation, direct lookup
    const code = `var _0xabc = ['hello', 'world', 'console'];
var _0x123 = function(_0xi) {
  _0xi = _0xi - 0x0;
  return _0xabc[_0xi];
};
_0x123('0x0');
_0x123('0x1');`.trim();
    const result = resolveObfuscatorIO(code);
    expect(result).toContain("'hello'");
    expect(result).toContain("'world'");
  });

  it('returns code unchanged if no _0x pattern found', () => {
    const code = 'var x = 1;';
    expect(resolveObfuscatorIO(code)).toBe(code);
  });
});
