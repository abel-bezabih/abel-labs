import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppShell } from '../components/app-shell';
import { Analytics } from '../components/analytics';
import { ChatWidget } from '../components/chat-widget';
import { ErrorBoundary } from '../components/error-boundary';
import { WebpackErrorHandler } from '../components/webpack-error-handler';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Abel Labs - Client Portal',
  description: 'Manage your projects and communicate with Abel Labs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ErrorBoundary>
          <WebpackErrorHandler />
          <Analytics />
          <AppShell>{children}</AppShell>
          <ChatWidget />
        </ErrorBoundary>
      </body>
    </html>
  );
}

