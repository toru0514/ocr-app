import type { Metadata } from 'next';
import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: '経理取引前処理アプリ（MVP）',
  description: 'Phase A の骨組み実装',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen bg-background text-foreground">
          <header className="border-b bg-card">
            <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
              <Link href="/documents" className="text-base font-semibold">
                経理前処理アプリ（MVP）
              </Link>
              <div className="flex gap-4 text-sm font-medium">
                <Link href="/documents">PDF一覧</Link>
                <Link href="/export">CSV出力</Link>
              </div>
            </nav>
          </header>
          <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
