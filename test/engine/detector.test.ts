import { describe, it, expect } from 'vitest';
import {
  isJSFuck,
  isEvalWrapped,
  isObfuscatorIO,
  isBase64Encoded,
  isHexEncoded,
  isUnicodeEncoded,
  isPacked,
  isClean,
  detectObfuscationType,
} from '@/lib/engine/detector';

describe('isJSFuck', () => {
  it('returns true for JSFuck-like code', () => {
    expect(isJSFuck('[][(![]+[])[+[]]]')).toBe(true);
  });
  it('returns false for normal code', () => {
    expect(isJSFuck('var x = 1;')).toBe(false);
  });
  it('returns false for code with letters', () => {
    expect(isJSFuck('alert(1)')).toBe(false);
  });
});

describe('isEvalWrapped', () => {
  it('detects eval() wrapper', () => {
    expect(isEvalWrapped('eval("alert(1)")')).toBe(true);
  });
  it('detects new Function() wrapper', () => {
    expect(isEvalWrapped('new Function("return 1")()')).toBe(true);
  });
  it('detects setTimeout with string', () => {
    expect(isEvalWrapped('setTimeout("alert(1)", 0)')).toBe(true);
  });
  it('returns false for normal code', () => {
    expect(isEvalWrapped('function foo() { return 1; }')).toBe(false);
  });
});

describe('isObfuscatorIO', () => {
  it('detects _0x patterns', () => {
    expect(isObfuscatorIO("_0x1a2b('0x0')")).toBe(true);
  });
  it('returns false for normal code', () => {
    expect(isObfuscatorIO('var x = 1;')).toBe(false);
  });
});

describe('isBase64Encoded', () => {
  it('detects atob() calls', () => {
    expect(isBase64Encoded('atob("aGVsbG8=")')).toBe(true);
  });
  it('returns false for normal code', () => {
    expect(isBase64Encoded('var x = 1;')).toBe(false);
  });
});

describe('isHexEncoded', () => {
  it('detects hex escape sequences', () => {
    expect(isHexEncoded('"\\x68\\x65\\x6c\\x6c\\x6f"')).toBe(true);
  });
  it('returns false for normal code', () => {
    expect(isHexEncoded('var x = 1;')).toBe(false);
  });
});

describe('isUnicodeEncoded', () => {
  it('detects unicode escape sequences', () => {
    expect(isUnicodeEncoded('"\\u0068\\u0065\\u006c\\u006c\\u006f"')).toBe(true);
  });
  it('returns false for normal code', () => {
    expect(isUnicodeEncoded('var x = 1;')).toBe(false);
  });
});

describe('isPacked', () => {
  it('detects Dean Edwards packer pattern', () => {
    expect(isPacked('eval(function(p,a,c,k,e,d){}')).toBe(true);
  });
  it('returns false for normal code', () => {
    expect(isPacked('var x = 1;')).toBe(false);
  });
});

describe('isClean', () => {
  it('returns true for normal code', () => {
    expect(isClean('function hello() { return "world"; }')).toBe(true);
  });
  it('returns false for obfuscated code', () => {
    expect(isClean('eval("alert(1)")')).toBe(false);
  });
});

describe('detectObfuscationType', () => {
  it('returns jsfuck for JSFuck code', () => {
    expect(detectObfuscationType('[][(![]+[])[+[]]]')).toBe('jsfuck');
  });
  it('returns packed before eval-wrapped', () => {
    expect(detectObfuscationType('eval(function(p,a,c,k,e,d){}')).toBe('packed');
  });
  it('returns eval-wrapped for eval code', () => {
    expect(detectObfuscationType('eval("hello")')).toBe('eval-wrapped');
  });
  it('returns clean for normal code', () => {
    expect(detectObfuscationType('var x = 1;')).toBe('clean');
  });
});
