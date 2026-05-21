import type { DecodeResult, DecodeLayer, ObfuscationType } from '@/lib/types';
import { detectObfuscationType, isClean } from '@/lib/engine/detector';
import { decodeJSFuck } from '@/lib/engine/jsfuck';
import { unpackEval } from '@/lib/engine/eval-unpacker';
import { resolveObfuscatorIO } from '@/lib/engine/obfuscatorio';
import { decodeEncoding } from '@/lib/engine/encoding';
import { unpackPacker } from '@/lib/engine/packer';
import { beautify } from '@/lib/engine/beautifier';

const MAX_ITERATIONS = 20;

type LogFn = (message: string) => void;

async function decodeLayer(
  code: string,
  type: ObfuscationType,
  log: LogFn
): Promise<string> {
  switch (type) {
    case 'jsfuck':
      log('⚙️ Decoding JSFuck layer...');
      return decodeJSFuck(code);
    case 'eval-wrapped':
      log('⚙️ Unpacking eval/Function wrapper...');
      return unpackEval(code);
    case 'obfuscator-io':
      log('⚙️ Resolving obfuscator.io string arrays...');
      return resolveObfuscatorIO(code);
    case 'base64':
      log('⚙️ Decoding base64 (atob) calls...');
      return decodeEncoding(code);
    case 'hex':
      log('⚙️ Decoding hex escape sequences...');
      return decodeEncoding(code);
    case 'unicode':
      log('⚙️ Decoding unicode escape sequences...');
      return decodeEncoding(code);
    case 'packed':
      log('⚙️ Unpacking Dean Edwards packer...');
      return unpackPacker(code);
    default:
      return code;
  }
}

export async function deobfuscate(
  input: string,
  onLog: LogFn
): Promise<DecodeResult> {
  let current = input;
  const layers: DecodeLayer[] = [];
  let iteration = 0;

  while (iteration < MAX_ITERATIONS) {
    onLog('🔍 Detecting obfuscation...');
    const type = detectObfuscationType(current);

    if (isClean(current)) {
      onLog(`✅ Clean code! ${layers.length} layer${layers.length !== 1 ? 's' : ''} decoded.`);
      break;
    }

    onLog(`🔍 Detected: ${type}`);

    const input_snapshot = current;
    try {
      current = await decodeLayer(current, type, onLog);
    } catch (err) {
      onLog(`❌ Error decoding ${type}: ${String(err)}`);
      break;
    }

    layers.push({
      type,
      input: input_snapshot,
      output: current,
      iteration,
    });

    iteration++;
  }

  if (iteration === MAX_ITERATIONS) {
    onLog('⚠️ Max iterations (20) reached. Stopping.');
  }

  onLog('✨ Applying code beautifier...');
  const output = beautify(current);

  return {
    output,
    layers,
    iterationCount: iteration,
  };
}
