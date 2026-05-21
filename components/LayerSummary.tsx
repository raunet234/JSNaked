import type { DecodeLayer } from '@/lib/types';

const TYPE_LABELS: Record<string, string> = {
  jsfuck: 'JSFuck',
  'eval-wrapped': 'eval/Function Wrapper',
  'obfuscator-io': 'obfuscator.io String Arrays',
  base64: 'Base64 (atob)',
  hex: 'Hex Escapes (\\xNN)',
  unicode: 'Unicode Escapes (\\uNNNN)',
  packed: 'Dean Edwards Packer',
};

interface Props {
  layers: DecodeLayer[];
}

export default function LayerSummary({ layers }: Props) {
  if (layers.length === 0) return null;

  return (
    <div className="mt-4 rounded-lg border border-dark-border bg-dark-panel p-4">
      <p className="text-xs text-gray-600 uppercase tracking-widest mb-3">
        Layers Decoded ({layers.length})
      </p>
      <ol className="space-y-1">
        {layers.map((layer, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <span className="text-neon font-bold w-5 text-right">{i + 1}.</span>
            <span className="text-gray-300">
              {TYPE_LABELS[layer.type] ?? layer.type}
            </span>
            <span className="text-gray-600 text-xs ml-auto">
              {layer.input.length.toLocaleString()} → {layer.output.length.toLocaleString()} chars
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
