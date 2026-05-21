import { decodeViaSandbox } from '@/lib/engine/sandbox';

export async function decodeJSFuck(code: string): Promise<string> {
  return decodeViaSandbox(code);
}
