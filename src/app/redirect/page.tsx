"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function RedirectPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");

  useEffect(() => {
    if (q) {
      // Redirect to the Grok URL
      window.location.href = `https://grok.com/?q=${encodeURIComponent(q)}`;
    }
  }, [q]);

  return (
    <div>
      <p>Redirecting to Grok...</p>
    </div>
  );
}