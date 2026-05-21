'use client';

import { useState, useCallback } from 'react';
import InputPanel from '@/components/InputPanel';
import OutputPanel from '@/components/OutputPanel';
import ProgressLog from '@/components/ProgressLog';
import LayerSummary from '@/components/LayerSummary';
import { deobfuscate } from '@/lib/engine/index';
import type { DecodeResult, LogEntry } from '@/lib/types';

export default function DecoderPanel() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isDecoding, setIsDecoding] = useState(false);

  const handleDecode = useCallback(async () => {
    if (!input.trim()) return;

    setIsDecoding(true);
    setResult(null);
    setLogs([]);

    const newLogs: LogEntry[] = [];

    const onLog = (message: string) => {
      const kind = message.startsWith('✅') || message.startsWith('✨')
        ? 'success'
        : message.startsWith('❌')
        ? 'error'
        : 'detecting';
      const entry: LogEntry = { message, kind, timestamp: Date.now() };
      newLogs.push(entry);
      setLogs([...newLogs]);
    };

    try {
      const decodeResult = await deobfuscate(input, onLog);
      setResult(decodeResult);
    } catch (err) {
      onLog(`❌ Fatal error: ${String(err)}`);
    } finally {
      setIsDecoding(false);
    }
  }, [input]);

  return (
    <section className="max-w-7xl mx-auto px-4 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="flex flex-col min-h-[400px]">
          <InputPanel
            value={input}
            onChange={setInput}
            onDecode={handleDecode}
            isDecoding={isDecoding}
          />
        </div>

        {/* Right: Output */}
        <div className="flex flex-col min-h-[400px]">
          <OutputPanel code={result?.output ?? ''} />
        </div>
      </div>

      {/* Log + Summary below panels */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProgressLog entries={logs} />
        {result && <LayerSummary layers={result.layers} />}
      </div>
    </section>
  );
}
