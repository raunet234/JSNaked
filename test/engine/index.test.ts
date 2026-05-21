import { describe, it, expect, vi } from 'vitest';
import { deobfuscate } from '@/lib/engine/index';

// Mock all decoders
vi.mock('@/lib/engine/jsfuck', () => ({ decodeJSFuck: vi.fn() }));
vi.mock('@/lib/engine/eval-unpacker', () => ({ unpackEval: vi.fn() }));
vi.mock('@/lib/engine/obfuscatorio', () => ({ resolveObfuscatorIO: vi.fn() }));
vi.mock('@/lib/engine/encoding', () => ({ decodeEncoding: vi.fn() }));
vi.mock('@/lib/engine/packer', () => ({ unpackPacker: vi.fn() }));
vi.mock('@/lib/engine/beautifier', () => ({ beautify: vi.fn((c: string) => c) }));

import { decodeJSFuck } from '@/lib/engine/jsfuck';
import { unpackEval } from '@/lib/engine/eval-unpacker';
import { resolveObfuscatorIO } from '@/lib/engine/obfuscatorio';
import { decodeEncoding } from '@/lib/engine/encoding';
import { unpackPacker } from '@/lib/engine/packer';
import { beautify } from '@/lib/engine/beautifier';

describe('deobfuscate', () => {
  it('returns clean code unchanged (just beautified)', async () => {
    vi.mocked(beautify).mockReturnValue('var x = 1;');
    const logs: string[] = [];
    const result = await deobfuscate('var x = 1;', (msg) => logs.push(msg));
    expect(result.layers).toHaveLength(0);
    expect(result.output).toBe('var x = 1;');
  });

  it('decodes one layer of eval-wrapped code', async () => {
    vi.mocked(unpackEval).mockResolvedValue('var x = 1;');
    vi.mocked(beautify).mockReturnValue('var x = 1;');
    const result = await deobfuscate('eval("var x = 1;")', () => {});
    expect(result.layers).toHaveLength(1);
    expect(result.layers[0].type).toBe('eval-wrapped');
    expect(result.output).toBe('var x = 1;');
  });

  it('stops after MAX_ITERATIONS to prevent infinite loop', async () => {
    // Always returns eval-wrapped code
    vi.mocked(unpackEval).mockResolvedValue('eval("still obfuscated")');
    vi.mocked(beautify).mockReturnValue('eval("still obfuscated")');
    const result = await deobfuscate('eval("still obfuscated")', () => {});
    expect(result.iterationCount).toBeLessThanOrEqual(20);
  });
});
