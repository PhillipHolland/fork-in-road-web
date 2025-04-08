import { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Fork in Road: Search with Grok or Your Default Engine",
  description: "Fork in Road lets you search with Grok or your default engine. Choose your path and explore smarter search options today!",
  icons: {
    icon: "/favicon.ico?v=3", // Add cache-busting query parameter
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" style={{ backgroundColor: "#F8F7F5" }}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover"
        />
        <meta name="theme-color" content="#F8F7F5" />
        <meta name="apple-mobile-web-app-status-bar-style" content="#F8F7F5" />
        <link rel="icon" href="/favicon.ico?v=3" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" type="image/x-icon" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function setBackgroundColor() {
                document.documentElement.style.backgroundColor = "#F8F7F5";
                document.body.style.backgroundColor = "#F8F7F5";
                // Set background color on all parent elements
                let element = document.body;
                while (element) {
                  element.style.backgroundColor = "#F8F7F5";
                  element = element.parentElement;
                }
                // Set viewport meta tag dynamically
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                  viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover');
                }
              })();
            `,
          }}
        />
      </head>
      <body style={{ backgroundColor: "#F8F7F5", margin: 0, padding: 0 }}>
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#F8F7F5",
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}