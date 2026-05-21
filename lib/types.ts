export type ObfuscationType =
  | 'jsfuck'
  | 'eval-wrapped'
  | 'obfuscator-io'
  | 'base64'
  | 'hex'
  | 'unicode'
  | 'packed'
  | 'clean';

export interface DecodeLayer {
  type: ObfuscationType;
  input: string;
  output: string;
  iteration: number;
}

export interface DecodeResult {
  output: string;
  layers: DecodeLayer[];
  iterationCount: number;
  error?: string;
}

export interface LogEntry {
  message: string;
  kind: 'detecting' | 'decoding' | 'success' | 'error';
  timestamp: number;
}
