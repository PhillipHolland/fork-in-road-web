// src/app/page.tsx
"use client";

import Head from "next/head";
import SearchForm from "@/components/SearchForm";

export default function Home() {
  return (
    <>
      <Head>
        <title>Fork in Road: Search with Grok or Your Default Engine</title>
        <meta
          name="description"
          content="Fork in Road lets you search with Grok or your default engine. Choose your path and explore smarter search options today!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen" style={{ flexShrink: 0 }}>
        <style jsx global>{`
          body {
            background: #F8F7F5;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        `}</style>
        <SearchForm />
      </div>
    </>
  );
}