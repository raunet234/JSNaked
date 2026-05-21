import { describe, it, expect } from 'vitest';
import { decodeEncoding } from '@/lib/engine/encoding';

describe('decodeEncoding', () => {
  it('decodes atob base64 calls inline', () => {
    // atob("aGVsbG8=") === "hello"
    const input = 'var x = atob("aGVsbG8=");';
    const result = decodeEncoding(input);
    expect(result).toContain('"hello"');
    expect(result).not.toContain('atob(');
  });

  it('decodes hex escape sequences', () => {
    const input = '"\\x68\\x65\\x6c\\x6c\\x6f"';
    const result = decodeEncoding(input);
    expect(result).toBe('"hello"');
  });

  it('decodes unicode escape sequences', () => {
    const input = '"\\u0068\\u0065\\u006c\\u006c\\u006f"';
    const result = decodeEncoding(input);
    expect(result).toBe('"hello"');
  });

  it('decodes mixed hex and unicode', () => {
    const input = '"\\x68\\u0065llo"';
    const result = decodeEncoding(input);
    expect(result).toBe('"hello"');
  });

  it('returns code unchanged if no encoding patterns', () => {
    const input = 'var x = "hello";';
    expect(decodeEncoding(input)).toBe(input);
  });
});
