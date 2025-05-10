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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body>
        <ClientMenu>{children}</ClientMenu>
      </body>
    </html>
  );
}