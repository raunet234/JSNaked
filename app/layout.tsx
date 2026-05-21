import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JSNaked — JavaScript Deobfuscator',
  description:
    'Strip away JavaScript obfuscation layer by layer. Decode JSFuck, eval wrappers, obfuscator.io, base64, hex, unicode, and Dean Edwards packer.',
  keywords: ['javascript', 'deobfuscator', 'JSFuck', 'eval unpacker', 'obfuscator.io'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-dark-bg min-h-screen antialiased">{children}</body>
    </html>
  );
}
