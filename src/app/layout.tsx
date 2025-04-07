export const metadata = {
  title: "Fork in Road: Search with Grok or Your Default Engine",
  description: "Fork in Road lets you search with Grok or your default engine. Choose your path and explore smarter search options today!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}