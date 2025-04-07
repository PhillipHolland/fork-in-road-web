// Handle Grok search to avoid deep linking on mobile
const handleGrokSearch = (q: string) => {
  const url = getGrokUrl(q);
  if (isMobileDevice()) {
    // On mobile, use a redirect to avoid deep linking
    // Create a temporary redirect page to force browser navigation
    const redirectPage = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Redirecting...</title>
          <script>
            window.location.href = "${url}";
          </script>
        </head>
        <body>
          <p>Redirecting to Grok...</p>
        </body>
      </html>
    `;
    const redirectUrl = "data:text/html," + encodeURIComponent(redirectPage);
    window.open(redirectUrl, "_blank");
  } else {
    // On desktop, open directly in a new tab
    window.open(url, "_blank", "noopener,noreferrer");
  }
};