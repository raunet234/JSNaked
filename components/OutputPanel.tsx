'use client';

import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface Props {
  code: string;
}

export default function OutputPanel({ code }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decoded.js';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-widest">
          Output
        </span>
        {code && (
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1 border border-dark-border rounded hover:border-neon hover:text-neon transition-colors"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="text-xs px-3 py-1 border border-dark-border rounded hover:border-neon hover:text-neon transition-colors"
            >
              Download .js
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 code-panel overflow-auto min-h-[300px]">
        {code ? (
          <SyntaxHighlighter
            language="javascript"
            style={atomOneDark}
            customStyle={{
              background: 'transparent',
              padding: '1rem',
              margin: 0,
              fontSize: '0.85rem',
              lineHeight: '1.6',
              height: '100%',
            }}
            showLineNumbers
            lineNumberStyle={{ color: '#333', minWidth: '2.5em' }}
          >
            {code}
          </SyntaxHighlighter>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-700 text-sm">
            Decoded output will appear here
          </div>
        )}
      </div>
    </div>
  );
}
