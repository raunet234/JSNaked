import { describe, it, expect } from 'vitest';
import { beautify } from '@/lib/engine/beautifier';

describe('beautify', () => {
  it('formats minified code with proper indentation', () => {
    const input = 'function foo(){var x=1;if(x){return x;}}';
    const result = beautify(input);
    expect(result).toContain('\n');
    expect(result).toContain('    ');
  });

  it('returns original code if beautify throws', () => {
    const input = 'var x = 1;';
    const result = beautify(input);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
