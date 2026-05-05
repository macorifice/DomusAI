import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DomusAI Workflow Console',
  description: 'Workflow UI powered by Next.js App Router',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
