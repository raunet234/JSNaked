import { decodeViaSandbox } from '@/lib/engine/sandbox';

export async function unpackEval(code: string): Promise<string> {
  return decodeViaSandbox(code);
}
