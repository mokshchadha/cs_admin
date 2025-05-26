import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Career Secure',
  description: 'Career secure internal app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}