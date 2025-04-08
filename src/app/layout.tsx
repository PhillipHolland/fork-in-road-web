import { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Fork in Road: Search with Grok or Your Default Engine",
  description: "Fork in Road lets you search with Grok or your default engine. Choose your path and explore smarter search options today!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" style={{ backgroundColor: "#F8F7F5" }}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
        <meta name="theme-color" content="#F8F7F5" />
      </head>
      <body style={{ backgroundColor: "#F8F7F5" }}>{children}</body>
    </html>
  );
}