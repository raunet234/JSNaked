import { describe, it, expect, vi } from 'vitest';
import { unpackEval } from '@/lib/engine/eval-unpacker';

vi.mock('@/lib/engine/sandbox', () => ({
  decodeViaSandbox: vi.fn().mockResolvedValue('var x = 1;'),
}));

describe('unpackEval', () => {
  it('delegates eval-wrapped code to sandbox', async () => {
    const result = await unpackEval('eval("var x = 1;")');
    expect(result).toBe('var x = 1;');
  });
});
