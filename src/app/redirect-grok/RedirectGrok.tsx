"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function RedirectGrok() {
  const searchParams = useSearchParams();
  const encodedUrl = searchParams.get("url");

  useEffect(() => {
    if (encodedUrl) {
      const url = decodeURIComponent(encodedUrl);
      window.open(url, "_blank");
    }
  }, [encodedUrl]);

  return (
    <div>
      <p>Redirecting to Grok...</p>
    </div>
  );
}