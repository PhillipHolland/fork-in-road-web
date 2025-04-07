// src/components/SearchForm.tsx
"use client";

import { useState, useEffect } from "react";
import { searchEngines, SearchEngine } from "@/lib/searchEngines";
import Image from "next/image";

export default function SearchForm() {
  const [query, setQuery] = useState<string>("");
  const [defaultEngine, setDefaultEngine] = useState<SearchEngine | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Detect browser and preselect a likely default engine
  useEffect(() => {
    const storedEngine = localStorage.getItem("defaultSearchEngine") as SearchEngine;
    if (storedEngine && storedEngine in searchEngines) {
      console.log("Using stored default engine:", storedEngine);
      setDefaultEngine(storedEngine);
    } else {
      // Detect browser via user agent
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

  // Ensure defaultEngine is never null
  if (!defaultEngine) {
    console.log("Falling back to default engine: google");
    setDefaultEngine("google");
  }

  const getGrokUrl = (q: string) => {
    const url = new URL("https://grok.com/");
    url.searchParams.set("q", q);
    return url.toString();
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
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="container">
      <style jsx>{`
        .container {
          width: 100%; /* Take full viewport width on smaller screens */
          max-width: 850px; /* Cap at 850px (15% narrower than 1000px) */
          margin: 0 auto;
          padding: 20px;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
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
          box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28); /* Subtle shadow like Google's search bar */
          transition: box-shadow 0.3s ease; /* Smooth transition for hover effect */
        }

        .search-input:hover {
          box-shadow: 0 2px 8px rgba(32, 33, 36, 0.4); /* Slightly stronger shadow on hover */
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
          box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28); /* Match search bar's default shadow */
          transition: background 0.3s, box-shadow 0.3s ease; /* Smooth transition for hover effect */
        }

        .search-button:hover {
          background: #333;
          box-shadow: 0 4px 12px rgba(32, 33, 36, 0.5); /* More pronounced shadow on hover */
        }

        .search-button.button-disabled {
          background: #ccc;
          color: #666;
          cursor: not-allowed;
          box-shadow: none; /* Remove shadow when disabled */
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
          font-size: 18px;
          margin-bottom: 20px;
          color: #000;
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
          box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28); /* Match search bar's default shadow */
          transition: background 0.3s, box-shadow 0.3s ease; /* Smooth transition for hover effect */
        }

        .modal-button:hover {
          background: #333;
          box-shadow: 0 4px 12px rgba(32, 33, 36, 0.5); /* More pronounced shadow on hover */
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

        /* Responsive adjustments for mobile screens */
        @media (max-width: 850px) {
          .container {
            padding: 15px;
          }

          .header img {
            width: 80px;
            height: 80px;
          }

          .header h1 {
            font-size: 14px;
          }

          .search-input {
            padding: 8px 35px 8px 8px;
            font-size: 14px;
          }

          .search-icon {
            width: 18px;
            height: 18px;
            right: 8px;
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
            font-size: 16px;
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

          .download-button img {
            width: 120px;
            height: 24px;
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
          autoComplete="on"
          autoCorrect="on"
          autoCapitalize="on"
        />
        <span className="search-icon">🔍</span>
      </div>

      <div className="search-label">search with...</div>

      <div className="search-buttons">
        <a
          href={query ? getGrokUrl(query) : "#"}
          target="_blank"
          rel="noopener noreferrer"
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
                href={getGrokUrl(query)}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-button"
                onClick={closeModal}
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

      <div className="download-section">
        <div className="download-text">Get the Fork in Road Safari extension.</div>
        <a
          href="https://apps.apple.com/us/app/fork-in-road/id6742797455"
          target="_blank"
          rel="noopener noreferrer"
          className="download-button"
        >
          <Image src="/black.svg" alt="Download Fork in Road Extension" width={150} height={30} />
        </a>
      </div>
    </div>
  );
}