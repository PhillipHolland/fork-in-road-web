"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function RedirectClient() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");

  useEffect(() => {
    if (url) {
      window.location.href = url;
    }
  }, [url]);

  return (
    <div>
      <p>Redirecting...</p>
    </div>
  );
}