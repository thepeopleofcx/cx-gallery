import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

// Self-hosted (OFL) instead of next/font/google: Google Fonts started serving
// multi-query /l/font?kit=… URLs that Turbopack's google-font loader rejects
// ("next/font/google queries have exactly one entry"), failing every build.
const inter = localFont({
  src: './fonts/inter-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = localFont({
  src: [
    { path: './fonts/cormorant-garamond-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/cormorant-garamond-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/cormorant-garamond-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/cormorant-garamond-latin-600-italic.woff2', weight: '600', style: 'italic' },
    { path: './fonts/cormorant-garamond-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: './fonts/cormorant-garamond-latin-700-italic.woff2', weight: '700', style: 'italic' },
  ],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CX Gallery',
  description: 'Beautiful photo galleries from CX events',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased scroll-smooth">
        {children}
      </body>
    </html>
  );
}
