import Hero from '@/components/Hero';
import DecoderPanel from '@/components/DecoderPanel';

export default function Home() {
  return (
    <main>
      <Hero />
      <DecoderPanel />
      <footer className="text-center py-8 text-xs text-gray-700 border-t border-dark-border">
        <div className="flex items-center justify-center gap-4">
          <a
            href="https://github.com/raunet234/JSNaked"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neon transition-colors"
          >
            GitHub
          </a>
          <span>•</span>
          <span>Built by Rauneet Raj</span>
          <span>•</span>
          <span>MIT License</span>
        </div>
      </footer>
    </main>
  );
}
