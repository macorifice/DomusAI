import type { Metadata } from 'next';
import './globals.css';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'DomusAI Workflow Console',
  description: 'Workflow UI powered by Next.js App Router',
};

const themeInitScript = `(function(){try{var k='domus-theme',t=localStorage.getItem(k);if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;return}if(window.matchMedia('(prefers-color-scheme: light)').matches){document.documentElement.dataset.theme='light';document.documentElement.style.colorScheme='light'}else{document.documentElement.dataset.theme='dark';document.documentElement.style.colorScheme='dark'}}catch(e){document.documentElement.dataset.theme='dark';document.documentElement.style.colorScheme='dark'}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <div className="appChrome">
          <ThemeToggle />
        </div>
        {children}
      </body>
    </html>
  );
}
