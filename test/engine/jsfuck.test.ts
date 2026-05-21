import { describe, it, expect, vi } from 'vitest';
import { decodeJSFuck } from '@/lib/engine/jsfuck';

vi.mock('@/lib/engine/sandbox', () => ({
  decodeViaSandbox: vi.fn().mockResolvedValue('alert(1)'),
}));

describe('decodeJSFuck', () => {
  it('delegates to sandbox and returns decoded string', async () => {
    const result = await decodeJSFuck('[][(![]+[])[+[]]]');
    expect(result).toBe('alert(1)');
  });
});
