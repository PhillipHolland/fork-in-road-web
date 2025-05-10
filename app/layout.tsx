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
        <div className="layout-container">
          <ClientMenu />
          {children}
        </div>

        <style jsx>{`
          .layout-container {
            min-height: 100vh;
            position: relative;
          }
        `}</style>
      </body>
    </html>
  );
}