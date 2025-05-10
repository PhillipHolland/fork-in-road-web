import { Metadata } from 'next';
import './globals.css';
import ClientMenu from './components/ClientMenu';

export const metadata: Metadata = {
  title: 'Fork in Road',
  description: 'Search and chat with Grok and Brave',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientMenu>{children}</ClientMenu>
      </body>
    </html>
  );
}