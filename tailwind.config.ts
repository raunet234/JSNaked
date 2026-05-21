import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: '#00ff41',
        'neon-dim': '#00cc33',
        'dark-bg': '#0a0a0a',
        'dark-surface': '#111111',
        'dark-border': '#1a1a1a',
        'dark-panel': '#0d0d0d',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 10px #00ff41, 0 0 20px #00ff4133',
        'neon-sm': '0 0 5px #00ff4188',
      },
    },
  },
  plugins: [],
};

export default config;
