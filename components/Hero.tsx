export default function Hero() {
  return (
    <header className="relative py-16 px-6 text-center overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(#00ff41 1px, transparent 1px), linear-gradient(90deg, #00ff41 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-5xl font-bold neon-text tracking-widest">
            {'{ JSNaked }'}
          </span>
        </div>

        <p className="text-lg text-gray-400 mb-6">
          Strip away JavaScript obfuscation,{' '}
          <span className="text-neon">layer by layer</span>
        </p>

        <div className="flex flex-wrap gap-3 justify-center text-xs text-gray-500">
          {[
            'JSFuck',
            'eval wrapper',
            'obfuscator.io',
            'Base64',
            'Hex/Unicode',
            'Dean Edwards',
          ].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 border border-dark-border rounded-full bg-dark-surface"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
