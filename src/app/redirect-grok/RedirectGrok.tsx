"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function RedirectGrok() {
  const searchParams = useSearchParams();
  const encodedUrl = searchParams.get("url");

  useEffect(() => {
    if (encodedUrl) {
      try {
        const url = decodeURIComponent(encodedUrl);
        console.log("Attempting to redirect to:", url);

        // Try to open in a new tab
        const newTab = window.open(url, "_blank");
        if (!newTab) {
          console.warn("window.open failed, falling back to window.location.href");
          // Fallback to direct navigation in the current tab
          window.location.href = url;
        }
      } catch (error) {
        console.error("Error during redirect:", error);
      }
    } else {
      console.error("No URL provided in query parameters");
    }
  }, [encodedUrl]);

  return (
    <div>
      <p>Redirecting to Grok...</p>
    </div>
  );
}