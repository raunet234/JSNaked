import { decodeViaSandbox } from '@/lib/engine/sandbox';

export async function unpackPacker(code: string): Promise<string> {
  return decodeViaSandbox(code);
}
