# { JSNaked }

> Strip away JavaScript obfuscation, layer by layer.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)

JSNaked is a client-side JavaScript deobfuscator that automatically detects and strips multiple layers of obfuscation — all in the browser, no server required.

## Supported Obfuscation Types

- ✅ JSFuck (`[]()!+` character sets)
- ✅ eval / new Function wrappers
- ✅ obfuscator.io `_0x` string arrays
- ✅ Base64 (`atob()` calls)
- ✅ Hex escape sequences (`\xNN`)
- ✅ Unicode escape sequences (`\uNNNN`)
- ✅ Dean Edwards Packer

## Screenshots

_Coming soon_

## How It Works

1. Paste or upload obfuscated JavaScript
2. JSNaked detects the obfuscation type
3. Applies the correct decoder
4. Checks if the output is still obfuscated → loops if yes
5. Beautifies and displays the clean result

All decoding happens in your browser. Your code is **never sent to any server**.

For JSFuck, eval, and packer decoding, JSNaked uses a sandboxed iframe with `sandbox="allow-scripts"` and intercepts `Function`/`eval` via postMessage — so malicious code cannot escape the sandbox.

## Running Locally

```bash
git clone https://github.com/raunet234/JSNaked.git
cd JSNaked
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Running Tests

```bash
npm run test:run
```

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [js-beautify](https://github.com/beautify-web/js-beautify)
- [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)
- [Vitest](https://vitest.dev/) + [@testing-library/react](https://testing-library.com/)

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit changes: `git commit -m "feat: add my feature"`
4. Push and open a PR

## Author

**Rauneet Raj** — [github.com/raunet234](https://github.com/raunet234)

## License

MIT
