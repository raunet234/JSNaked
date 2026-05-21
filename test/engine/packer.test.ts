import { describe, it, expect, vi } from 'vitest';
import { unpackPacker } from '@/lib/engine/packer';

vi.mock('@/lib/engine/sandbox', () => ({
  decodeViaSandbox: vi.fn().mockResolvedValue('function hello(){return "world"}'),
}));

describe('unpackPacker', () => {
  it('delegates packed code to sandbox', async () => {
    const packed = 'eval(function(p,a,c,k,e,d){})';
    const result = await unpackPacker(packed);
    expect(result).toBe('function hello(){return "world"}');
  });
});
