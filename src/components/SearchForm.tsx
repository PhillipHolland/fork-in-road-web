"use client";

import { useState, useEffect } from "react";
import { searchEngines, SearchEngine } from "@/lib/searchEngines";
import Image from "next/image";
import { marked } from "marked"; // Import marked for markdown parsing
import DOMPurify from "dompurify"; // Import DOMPurify for HTML sanitization

export default function SearchForm() {
  const [query, setQuery] = useState<string>("");
  const [defaultEngine, setDefaultEngine] = useState<SearchEngine | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showExtensionModal, setShowExtensionModal] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [grokResult, setGrokResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Prevent zoom on touch for the search input
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const input = document.getElementById("query");
    if (input) {
      input.addEventListener("touchstart", preventZoom, { passive: false });
      input.addEventListener("touchmove", preventZoom, { passive: false });
    }

    return () => {
      if (input) {
        input.removeEventListener("touchstart", preventZoom);
        input.removeEventListener("touchmove", preventZoom);
      }
    };
  }, []);

  // Detect browser and preselect a likely default engine
  useEffect(() => {
    const storedEngine = localStorage.getItem("defaultSearchEngine") as SearchEngine;
    if (storedEngine && storedEngine in searchEngines) {
      console.log("Using stored default engine:", storedEngine);
      setDefaultEngine(storedEngine);
    } else {
      const userAgent = navigator.userAgent.toLowerCase();
      let preselectedEngine: SearchEngine = "google"; // Default to Google
      if (userAgent.includes("edg")) {
        preselectedEngine = "bing"; // Microsoft Edge often defaults to Bing
      } else if (userAgent.includes("firefox")) {
        preselectedEngine = "google"; // Firefox often defaults to Google
      } else if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
        preselectedEngine = "google"; // Safari often defaults to Google
      }
      console.log("Preselected default engine:", preselectedEngine);
      setDefaultEngine(preselectedEngine);
      localStorage.setItem("defaultSearchEngine", preselectedEngine);
    }
  }, []);

  // Fetch autocomplete suggestions from Wikipedia's API
  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const debounceFetch = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json&origin=*`
        );
        const data = await response.json();
        const suggestionList = data[1] || []; // data[1] contains the suggestions
        setSuggestions(suggestionList);
        setShowSuggestions(suggestionList.length > 0);
      } catch (error) {
        console.error("Error fetching autocomplete suggestions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // Debounce to avoid excessive API calls

    return () => clearTimeout(debounceFetch);
  }, [query]);

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  // Ensure defaultEngine is never null
  if (!defaultEngine) {
    console.log("Falling back to default engine: google");
    setDefaultEngine("google");
  }

  // Utility to detect mobile devices
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Utility to detect iOS/iPadOS devices
  const isIOSDevice = () => {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  const getDefaultEngineUrl = (q: string, engine: SearchEngine) => {
    const searchEngine = searchEngines[engine];
    const url = new URL(searchEngine.baseUrl);
    url.searchParams.set(searchEngine.queryParam, q);
    return url.toString();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query) {
      setShowModal(true);
      setShowSuggestions(false); // Hide suggestions on Enter
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const closeExtensionModal = () => {
    setShowExtensionModal(false);
    // Proceed to fetch and display Grok results after closing
    fetchGrokResult(query);
  };

  // Fetch Grok 3 API result via the server-side proxy
  const fetchGrokResult = async (q: string) => {
    setIsLoading(true);
    setError("");
    setGrokResult("");

    try {
      const response = await fetch("/api/grok", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: q }),
      });

      console.log("Grok API Response Status:", response.status);

      const data = await response.json();

      console.log("Grok API Response Data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch Grok response");
      }

      setGrokResult(data.result || "No response received from Grok.");
    } catch (err) {
      console.error("Error in fetchGrokResult:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while fetching the response.");
      } else {
        setError("An error occurred while fetching the response.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Grok search by fetching and displaying results locally
  const handleGrokSearch = (q: string) => {
    // Check if the user is on iOS/iPadOS and if the extension modal has been shown this session
    const hasShownExtensionModal = sessionStorage.getItem("hasShownExtensionModal");
    if (isIOSDevice() && !hasShownExtensionModal) {
      setShowExtensionModal(true);
      sessionStorage.setItem("hasShownExtensionModal", "true");
    } else {
      fetchGrokResult(q); // Fetch and display results locally
    }
  };

  // Combined handler for "With Grok" button in modal
  const handleGrokModalClick = () => {
    handleGrokSearch(query); // Call handleGrokSearch on all devices
    closeModal();
  };

  // Convert markdown to HTML and sanitize it
  const renderMarkdown = (markdown: string) => {
    const html = marked.parse(markdown);
    const sanitizedHtml = DOMPurify.sanitize(html);
    return { __html: sanitizedHtml };
  };

  return (
    <div className="container">
      <style jsx>{`
        .container {
          width: 100%; /* Take full viewport width on smaller screens */
          max-width: 850px; /* Cap at 850px (15% narrower than 1000px) */
          margin: 0 auto;
          padding: 20px; /* Restore original padding */
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
          box-sizing: border-box; /* Ensure padding is included in width */
        }

        /* Ensure the container is at least 850px wide on desktop screens */
        @media (min-width: 850px) {
          .container {
            min-width: 850px;
          }
        }

        .header {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .header img {
          width: 100px;
          height: 100px;
          margin-bottom: 10px;
        }

        .header h1 {
          font-size: 16px;
          font-weight: normal;
          color: #000;
        }

        .search-container {
          position: relative;
          margin-bottom: 10px;
        }

        .search-input {
          width: 100%;
          padding: 10px 40px 10px 10px;
          border: 1px solid #ccc;
          border-radius: 20px;
          font-size: 16px;
          box-sizing: border-box;
          background: #fff;
          box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
          transition: box-shadow 0.3s ease;
          touch-action: pan-y; /* Ensure no zooming on touch */
        }

        .search-input:hover {
          box-shadow: 0 2px 8px rgba(32, 33, 36, 0.4);
        }

        .search-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #666;
        }

        .suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid #ccc;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(32, 33, 36, 0.28);
          z-index: 1000;
          max-height: 200px;
          overflow-y: auto;
        }

        .suggestion-item {
          padding: 10px;
          font-size: 14px;
          color: #333;
          cursor: pointer;
          border-bottom: 1px solid #eee;
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .suggestion-item:hover {
          background: #f0f0f0;
        }

        .results-container {
          margin-top: 20px;
          padding: 15px;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
          max-height: 300px;
          overflow-y: auto;
          text-align: left;
          font-size: 14px;
          color: #333;
          line-height: 1.6;
        }

        /* Markdown styling for rendered HTML */
        .results-container h1 {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 12px;
          color: #000;
        }

        .results-container h2 {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #000;
        }

        .results-container h3 {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #000;
        }

        .results-container p {
          margin-bottom: 10px;
        }

        .results-container strong {
          font-weight: bold;
        }

        .results-container em {
          font-style: italic;
        }

        .results-container ul {
          list-style-type: disc;
          margin-left: 20px;
          margin-bottom: 10px;
        }

        .results-container ol {
          list-style-type: decimal;
          margin-left: 20px;
          margin-bottom: 10px;
        }

        .results-container li {
          margin-bottom: 5px;
        }

        .results-container a {
          color: #007bff;
          text-decoration: underline;
        }

        .results-container a:hover {
          color: #0056b3;
        }

        .results-container blockquote {
          border-left: 4px solid #ccc;
          padding-left: 10px;
          margin: 10px 0;
          color: #666;
          font-style: italic;
        }

        .results-container code {
          background: #f4f4f4;
          padding: 2px 4px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
        }

        .results-container pre {
          background: #f4f4f4;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
          font-family: monospace;
          font-size: 13px;
          margin-bottom: 10px;
        }

        .loading-bar-container {
          margin-top: 20px;
          width: 200px;
          height: 8px;
          background: #eee;
          border-radius: 4px;
          overflow: hidden;
          margin-left: auto;
          margin-right: auto;
        }

        .loading-bar {
          width: 30%;
          height: 100%;
          background: #e7cf2c;
          border-radius: 4px;
          animation: cylon 1.5s infinite ease-in-out;
        }

        @keyframes cylon {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(233.33%); /* (100% container width - 30% bar width) / 30% bar width * 100 */
          }
          100% {
            transform: translateX(0);
          }
        }

        .error-message {
          margin-top: 20px;
          padding: 10px;
          background: #ffe6e6;
          border: 1px solid #ff0000;
          border-radius: 5px;
          font-size: 16px;
          font-weight: bold;
          color: #ff0000;
          text-align: center;
        }

        .ad-container {
          margin-top: 20px;
          text-align: center;
        }

        .ad-placeholder {
          font-size: 12px;
          color: #666;
          padding: 10px;
          border: 1px solid #eee;
          border-radius: 5px;
          display: inline-block;
        }

        .search-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 20px;
        }

        .search-buttons {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .search-button {
          padding: 10px 20px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 20px;
          font-size: 16px;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
          transition: background 0.3s, box-shadow 0.3s ease;
        }

        .search-button:hover {
          background: #333;
          box-shadow: 0 4px 12px rgba(32, 33, 36, 0.5);
        }

        .search-button.button-disabled {
          background: #ccc;
          color: #666;
          cursor: not-allowed;
          box-shadow: none;
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: #fff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          text-align: center;
          max-width: 400px;
          width: 90%;
        }

        .modal-title {
          font-size: 20px;
          margin-bottom: 20px;
          color: #000;
        }

        .modal-text {
          font-size: 16px;
          color: #666;
          margin-bottom: 20px;
        }

        .modal-buttons {
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        .modal-button {
          padding: 10px 20px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 20px;
          font-size: 16px;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
          transition: background 0.3s, box-shadow 0.3s ease;
        }

        .modal-button:hover {
          background: #333;
          box-shadow: 0 4px 12px rgba(32, 33, 36, 0.5);
        }

        .download-section {
          margin-top: 20px;
        }

        .download-text {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }

        .download-button {
          display: inline-block;
        }

        @media (max-width: 850px) {
          .container {
            padding: 15px; /* Restore original padding for mobile */
          }

          .header img {
            width: 80px;
            height: 80px;
          }

          .header h1 {
            font-size: 14px;
          }

          .search-container {
            width: 90%; /* Match the search-input width */
            margin-left: auto;
            margin-right: auto;
          }

          .search-input {
            width: 100%; /* Full width within the container */
            padding: 8px 35px 8px 8px;
            font-size: 16px; /* Ensure font-size is 16px to prevent iOS Safari zooming */
            touch-action: pan-y; /* Ensure no zooming on touch */
          }

          .search-icon {
            width: 18px;
            height: 18px;
            right: 8px; /* Adjust to fit within the search bar */
          }

          .suggestion-item {
            padding: 8px;
            font-size: 12px;
          }

          .results-container {
            padding: 10px;
            font-size: 12px;
            max-height: 200px;
          }

          .results-container h1 {
            font-size: 18px;
            margin-bottom: 10px;
          }

          .results-container h2 {
            font-size: 16px;
            margin-bottom: 8px;
          }

          .results-container h3 {
            font-size: 14px;
            margin-bottom: 6px;
          }

          .results-container p {
            margin-bottom: 8px;
          }

          .results-container ul,
          .results-container ol {
            margin-left: 15px;
            margin-bottom: 8px;
          }

          .results-container li {
            margin-bottom: 4px;
          }

          .results-container pre {
            padding: 8px;
            font-size: 12px;
          }

          .results-container code {
            font-size: 12px;
          }

          .loading-bar-container {
            width: 150px;
            height: 6px;
          }

          .error-message {
            font-size: 14px;
            padding: 8px;
          }

          .ad-placeholder {
            font-size: 10px;
            padding: 8px;
          }

          .search-label {
            font-size: 12px;
            margin-bottom: 15px;
          }

          .search-button {
            padding: 8px 15px;
            font-size: 14px;
          }

          .modal-content {
            padding: 15px;
            max-width: 300px;
          }

          .modal-title {
            font-size: 18px;
            margin-bottom: 15px;
          }

          .modal-text {
            font-size: 14px;
            margin-bottom: 15px;
          }

          .modal-button {
            padding: 8px 15px;
            font-size: 14px;
          }

          .download-text {
            font-size: 12px;
            margin-bottom: 8px;
          }
        }
      `}</style>

      <div className="header">
        <Image src="/settings512.png" alt="Fork in Road Logo" width={100} height={100} />
        <h1>choose your path</h1>
      </div>

      <div className="search-container">
        <input
          type="text"
          id="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="search-input"
          placeholder="search"
          autoComplete="off" // Disable browser autocomplete to avoid conflicts
          autoCorrect="on"
          autoCapitalize="on"
        />
        <span className="search-icon">🔍</span>
        {showSuggestions && (
          <div className="suggestions">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="loading-bar-container">
          <div className="loading-bar"></div>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
      {grokResult && (
        <>
          <div
            className="results-container"
            dangerouslySetInnerHTML={renderMarkdown(grokResult)}
          />
          <div className="ad-container">
            <div className="ad-placeholder">Sponsored Ad Placeholder (Carbon Ads)</div>
          </div>
        </>
      )}

      <div className="search-label">search with...</div>

      <div className="search-buttons">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault(); // Prevent default navigation on all devices
            if (query) {
              handleGrokSearch(query);
            }
          }}
          className={`search-button ${!query ? "button-disabled" : ""}`}
        >
          Grok
        </a>
        <a
          href={query ? getDefaultEngineUrl(query, defaultEngine ?? "google") : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={`search-button ${!query ? "button-disabled" : ""}`}
        >
          Default Engine
        </a>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-title">How do you want to search?</div>
            <div className="modal-buttons">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault(); // Prevent default navigation on all devices
                  handleGrokModalClick();
                }}
                className="modal-button"
              >
                With Grok
              </a>
              <a
                href={getDefaultEngineUrl(query, defaultEngine ?? "google")}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-button"
                onClick={closeModal}
              >
                Default Engine
              </a>
            </div>
          </div>
        </div>
      )}

      {showExtensionModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-title">iOS Safari Limitations</div>
            <p className="modal-text">
              iOS can’t search directly in Safari—let’s fix that! Get our extension to choose your path.
            </p>
            <a
              href="https://apps.apple.com/us/app/fork-in-road/id6742797455"
              target="_blank"
              rel="noopener noreferrer"
              className="download-button"
            >
              <Image src="/black.svg" alt="Download Fork in Road Extension" width={165} height={36.3} />
            </a>
            <div className="modal-buttons" style={{ marginTop: "10px" }}>
              <button onClick={closeExtensionModal} className="modal-button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="download-section">
        <div className="download-text">Get the Fork in Road Safari extension.</div>
        <a
          href="https://apps.apple.com/us/app/fork-in-road/id6742797455"
          target="_blank"
          rel="noopener noreferrer"
          className="download-button"
        >
          <Image src="/black.svg" alt="Download Fork in Road Extension" width={150} height={33} />
        </a>
      </div>
    </div>
  );
}