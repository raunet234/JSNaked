'use client';

import { useEffect, useRef } from 'react';
import type { LogEntry } from '@/lib/types';

interface Props {
  entries: LogEntry[];
}

export default function ProgressLog({ entries }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <div className="mt-4 rounded-lg border border-dark-border bg-dark-panel p-4 max-h-48 overflow-y-auto">
      <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">
        Decode Log
      </p>
      {entries.map((entry, i) => (
        <div
          key={i}
          className={`text-sm font-mono py-0.5 ${
            entry.kind === 'success'
              ? 'text-neon'
              : entry.kind === 'error'
              ? 'text-red-400'
              : 'text-gray-400'
          }`}
        >
          {entry.message}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
