'use client';

import { useRef, type ChangeEvent, type DragEvent } from 'react';

interface Props {
  value: string;
  onChange: (code: string) => void;
  onDecode: () => void;
  isDecoding: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function InputPanel({ value, onChange, onDecode, isDecoding }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (file.size > MAX_FILE_SIZE) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string ?? '');
    reader.readAsText(file);
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-widest">
          Input
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs px-3 py-1 border border-dark-border rounded hover:border-neon hover:text-neon transition-colors"
          >
            Upload .js / .txt
          </button>
          <button
            onClick={() => onChange('')}
            className="text-xs px-3 py-1 border border-dark-border rounded hover:border-red-500 hover:text-red-400 transition-colors"
          >
            Clear
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".js,.txt"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      <div
        className="flex-1 relative"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste obfuscated JavaScript here, or drag & drop a file..."
          className="w-full h-full min-h-[300px] code-panel p-4 resize-none bg-dark-surface text-gray-300 placeholder-gray-700 focus:outline-none focus:border-neon focus:shadow-neon transition-all"
          spellCheck={false}
        />
      </div>

      <button
        onClick={onDecode}
        disabled={isDecoding || !value.trim()}
        className="w-full py-3 font-bold tracking-widest text-sm uppercase transition-all rounded
          bg-transparent border border-neon text-neon
          hover:bg-neon hover:text-black hover:shadow-neon
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neon disabled:hover:shadow-none"
      >
        {isDecoding ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⚙</span> Decoding...
          </span>
        ) : (
          '[ Decode ]'
        )}
      </button>
    </div>
  );
}
