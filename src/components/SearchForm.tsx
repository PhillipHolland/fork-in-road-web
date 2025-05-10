"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { marked } from "marked";
import DOMPurify from "dompurify";

// Configure marked to run synchronously
marked.setOptions({
  async: false,
});

interface RecentSearch {
  query: string;
  result: string;
}

interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
}

export default function SearchForm() {
  const [query, setQuery] = useState<string>("");
  const [showRefineModal, setShowRefineModal] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [grokResult, setGrokResult] = useState<string>("");
  const [braveResults, setBraveResults] = useState<BraveSearchResult[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [totalFetchedResults, setTotalFetchedResults] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const resultsPerPage = 20;
  const maxTotalResults = 200;
  const [originalQuery, setOriginalQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [shareMessage, setShareMessage] = useState<string>("");
  const [refineInput, setRefineInput] = useState<string>("");
  const [viewMode, setViewMode] = useState<"rendered" | "raw">("rendered");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Refs for IntersectionObserver
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Debounce Intersection Observer to prevent rapid fetches
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const storedSearches = localStorage.getItem("recentSearches");
    if (storedSearches) {
      try {
        setRecentSearches(JSON.parse(storedSearches));
      } catch (err) {
        console.error("Error parsing recent searches from localStorage:", err);
        setRecentSearches([]);
      }
    }
  }, []);

  // Save recent searches to localStorage when they change
  useEffect(() => {
    if (grokResult && originalQuery) {
      const newSearch: RecentSearch = { query: originalQuery, result: grokResult };
      setRecentSearches((prevSearches) => {
        const updatedSearches = [newSearch, ...prevSearches].slice(0, 3);
        try {
          localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
        } catch (err) {
          console.error("Error saving recent searches to localStorage:", err);
        }
        return updatedSearches;
      });
    }
  }, [grokResult, originalQuery]);

  // Fetch autocomplete suggestions from Wikipedia's API
  useEffect(() => {
    if (!query || query.length < 2 || query === selectedSuggestion) {
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      return;
    }

    const debounceFetch = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json&origin=*`
        );
        const data = await response.json();
        const suggestionList = data[1] || [];
        setSuggestions(suggestionList);
        setShowSuggestions(suggestionList.length > 0);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error("Error fetching autocomplete suggestions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [query, selectedSuggestion]);

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

  // Handle suggestion selection and trigger search
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestion(suggestion);
    setHighlightedIndex(-1);
    handleSearch(suggestion);
  };

  // Clear selected suggestion when the user types manually
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (selectedSuggestion && e.target.value !== selectedSuggestion) {
      setSelectedSuggestion(null);
    }
  };

  // Handle keyboard navigation and selection
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query) {
      e.preventDefault();
      if (showSuggestions && highlightedIndex >= 0) {
        handleSuggestionClick(suggestions[highlightedIndex]);
      } else {
        handleSearch(query);
      }
      // Hide suggestions after Enter is pressed
      setShowSuggestions(false);
      setSuggestions([]);
      setHighlightedIndex(-1);
      setSelectedSuggestion(query); // Set the current query as selected to prevent suggestions until new text is entered
      return;
    }

    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    }
  };

  // Utility to detect mobile devices
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const closeRefineModal = () => {
    setShowRefineModal(false);
    setRefineInput("");
  };

  // Fetch Grok 3 API result via the server-side proxy and Brave Search results via server-side API route
  const fetchResults = async (q: string, page: number = 1, append: boolean = false, retryCount: number = resultsPerPage) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError("");

    try {
      if (!append) {
        setGrokResult("");
        setBraveResults([]);
        setTotalFetchedResults(0);
      }

      let finalQuery = q;
      if (refineInput && originalQuery && grokResult) {
        finalQuery = `Original query: ${originalQuery}. Original result: ${grokResult}. Refine based on: ${refineInput}`;
      }

      // Fetch Grok results only on the first page
      if (page === 1) {
        const grokResponse = await fetch("/api/grok", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: finalQuery }),
        });

        console.log("Grok API Response Status:", grokResponse.status);

        const grokData = await grokResponse.json();

        console.log("Grok API Response Data:", grokData);

        if (!grokResponse.ok) {
          throw new Error(grokData.error || "Failed to fetch Grok response");
        }

        setGrokResult(grokData.result || "No response received from Grok.");
        setOriginalQuery(q);
      }

      // Fetch Brave Search results
      const offset = (page - 1) * resultsPerPage;
      const braveResponse = await fetch(
        `/api/brave-search?query=${encodeURIComponent(q)}&count=${retryCount}&offset=${offset}`
      );

      console.log("Brave API Response Status:", braveResponse.status);

      const braveData = await braveResponse.json();

      console.log("Brave API Response Data:", braveData);

      if (!braveResponse.ok) {
        throw new Error(braveData.error || "Failed to fetch Brave Search results");
      }

      // Append new results if appending, otherwise reset
      const newResults = braveData.results || [];
      setBraveResults((prevResults) =>
        append ? [...prevResults, ...newResults] : newResults
      );
      setTotalResults(braveData.total || 0);

      // Update total fetched results
      setTotalFetchedResults((prev) => prev + newResults.length);

      // Log debugging info
      console.log("Fetch Results Debug:", {
        query: q,
        page,
        count: retryCount,
        offset,
        resultsLength: newResults.length,
        total: braveData.total,
        totalFetched: totalFetchedResults + newResults.length,
        hasMore: newResults.length > 0 && (totalFetchedResults + newResults.length) < Math.min(braveData.total || 0, maxTotalResults),
      });

      // Update hasMore based on total fetched results and a maximum cap
      const hasMoreResults = newResults.length > 0 && (totalFetchedResults + newResults.length) < Math.min(braveData.total || 0, maxTotalResults);
      setHasMore(hasMoreResults);

      // Retry with a smaller count if no results are returned but more are expected
      if (newResults.length === 0 && hasMoreResults && retryCount > 1) {
        const newRetryCount = Math.floor(retryCount / 2);
        console.log(`Retrying with smaller count: ${newRetryCount}`);
        await fetchResults(q, page, append, newRetryCount);
      }
    } catch (err) {
      console.error("Error in fetchResults:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while fetching the response.");
      } else {
        setError("An error occurred while fetching the response.");
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Handle search (used by both button click, Enter key, magnifying glass click, and autocomplete selection)
  const handleSearch = (q: string) => {
    setCurrentPage(1);
    setHasMore(true);
    fetchResults(q, 1);
  };

  // Handle magnifying glass click
  const handleMagnifyingGlassClick = () => {
    if (query) {
      handleSearch(query);
      // Hide suggestions after magnifying glass click
      setShowSuggestions(false);
      setSuggestions([]);
      setHighlightedIndex(-1);
      setSelectedSuggestion(query); // Prevent suggestions until new text is entered
    }
  };

  // Handle refine submit
  const handleRefineSubmit = () => {
    if (refineInput.trim()) {
      setCurrentPage(1);
      setHasMore(true);
      fetchResults(query, 1);
      closeRefineModal();
    }
  };

  // Toggle history visibility
  const toggleHistory = () => {
    setShowHistory((prev) => !prev);
  };

  // Debounced fetch handler for Intersection Observer
  const debouncedFetch = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setCurrentPage((prevPage) => {
        const nextPage = prevPage + 1;
        console.log("Fetching page:", nextPage);
        fetchResults(query, nextPage, true);
        return nextPage;
      });
    }, 300);
  }, [query]);

  // Set up Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      console.log("IntersectionObserver Triggered:", {
        isIntersecting: target.isIntersecting,
        hasMore,
        isLoadingMore,
      });
      if (target.isIntersecting && hasMore && !isLoadingMore) {
        debouncedFetch();
      }
    },
    [hasMore, isLoadingMore, debouncedFetch]
  );

  useEffect(() => {
    if (!loadMoreRef.current || !containerRef.current) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: containerRef.current,
      rootMargin: "0px",
      threshold: 0.1,
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [handleObserver]);

  // Handle copy button click
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(grokResult);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
      setError("Failed to copy text to clipboard.");
    }
  };

  // Handle share button click
  const handleShare = async () => {
    const shareData = {
      title: "Fork in Road Search Result",
      text: grokResult,
      url: "https://forkinroad.app",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(grokResult);
        setShareMessage("Share not supported; copied to clipboard instead.");
        setTimeout(() => setShareMessage(""), 2000);
      } catch (err) {
        console.error("Failed to copy text:", err);
        setError("Failed to copy text to clipboard.");
      }
    }
  };

  // Handle clear results
  const handleClearResults = () => {
    setGrokResult("");
    setBraveResults([]);
    setOriginalQuery("");
    setQuery("");
    setError("");
    setIsLoading(false);
    setIsLoadingMore(false);
    setIsCopied(false);
    setShareMessage("");
    setFeedbackMessage("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestion(null);
    setHighlightedIndex(-1);
    setCurrentPage(1);
    setTotalResults(0);
    setTotalFetchedResults(0);
    setHasMore(true);
    setRefineInput("");
  };

  // Handle recent search click
  const handleRecentSearchClick = (search: RecentSearch) => {
    setGrokResult(search.result);
    setBraveResults([]);
    setOriginalQuery(search.query);
    setQuery(search.query);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestion(search.query);
    setHighlightedIndex(-1);
    setCurrentPage(1);
    setTotalResults(0);
    setTotalFetchedResults(0);
    setHasMore(true);
  };

  // Clear recent searches
  const handleClearHistory = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("recentSearches");
    } catch (err) {
      console.error("Error clearing recent searches from localStorage:", err);
    }
  };

  // Handle feedback (thumbs up/down)
  const handleFeedback = (rating: "up" | "down") => {
    try {
      const feedback = { query: originalQuery, result: grokResult, rating, timestamp: Date.now() };
      const existingFeedback = localStorage.getItem("feedback");
      const feedbackArray = existingFeedback ? JSON.parse(existingFeedback) : [];
      feedbackArray.push(feedback);
      localStorage.setItem("feedback", JSON.stringify(feedbackArray));
    } catch (err) {
      console.error("Error saving feedback to localStorage:", err);
    }
    setFeedbackMessage("Thanks for your feedback!");
    setTimeout(() => setFeedbackMessage(""), 2000);
  };

  // Convert markdown to HTML and sanitize it (synchronous)
  const renderMarkdown = (markdown: string) => {
    const html = marked.parse(markdown) as string;
    const sanitizedHtml = DOMPurify.sanitize(html);
    return { __html: sanitizedHtml };
  };

  return (
    <div className="container">
      <style jsx>{`
        .container {
          width: 100%;
          max-width: 850px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
          box-sizing: border-box;
        }

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
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
          touch-action: pan-y;
        }

        .search-input:hover {
          box-shadow: 0 2px 8px rgba(32, 33, 36, 0.4);
        }

        .search-input.has-text {
          border-color: #e7cf2c;
        }

        .search-icon {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #666;
          background: none;
          border: none;
          padding: 0;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-icon:hover {
          color: #e7cf2c;
        }

        .loading-bar-container {
          position: absolute;
          bottom: -16px;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 8px;
          background: #eee;
          border-radius: 4px;
          overflow: hidden;
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
            transform: translateX(233.33%);
          }
          100% {
            transform: translateX(0);
          }
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
          margin-top: 20px;
        }

        .suggestion-item {
          padding: 10px;
          font-size: 14px;
          color: #333;
          cursor: pointer;
          border-bottom: 1px solid #eee;
          transition: background 0.2s, color 0.2s;
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .suggestion-item:hover {
          background: #e7cf2c;
          color: #000;
        }

        .suggestion-item-highlighted {
          background: #f5e050;
          color: #000;
        }

        .results-container {
          position: relative;
          margin-top: 10px;
          padding: 15px;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
          max-height: 400px;
          overflow-y: auto;
          text-align: left;
          font-size: 14px;
          color: #333;
          line-height: 1.6;
          will-change: transform;
          -webkit-overflow-scrolling: touch;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .results-header-text {
          font-size: 16px;
          font-weight: bold;
          color: #000;
        }

        .url-results-header {
          font-size: 16px;
          font-weight: bold;
          color: #000;
          margin-top: 20px;
          margin-bottom: 10px;
          text-align: left;
        }

        .url-results-container {
          padding: 15px;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
          text-align: left;
          font-size: 14px;
          color: #333;
          line-height: 1.6;
          max-height: 600px;
          overflow-y: auto;
          will-change: transform;
          -webkit-overflow-scrolling: touch;
        }

        .url-result-item {
          margin-bottom: 15px;
          contain: content;
        }

        .url-result-item:last-child {
          margin-bottom: 0;
        }

        .url-result-title {
          font-size: 14px;
          font-weight: bold;
          color: #007bff;
          text-decoration: none;
          display: block;
        }

        .url-result-title:hover {
          text-decoration: underline;
        }

        .url-result-url {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
          word-break: break-all;
          display: block;
        }

        .url-result-description {
          font-size: 14px;
          color: #333;
          display: block;
        }

        .loading-more {
          text-align: center;
          padding: 10px;
          font-size: 14px;
          color: #666;
        }

        .view-toggle {
          font-size: 14px;
          color: #666;
        }

        .view-toggle span {
          cursor: pointer;
          padding: 2px 5px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .view-toggle span.active {
          background: #e7cf2c;
          color: #000;
        }

        .view-toggle span:hover {
          background: #f0f0f0;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-button {
          display: flex;
          align-items: center;
          padding: 4px 8px;
          background: #f0f0f0;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 12px;
          color: #333;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }

        .action-button:hover {
          background: #e7cf2c;
          color: #000;
        }

        .action-button:active {
          transform: scale(0.95);
          background: #d4bc25;
        }

        .action-button svg {
          margin-right: 4px;
        }

        .feedback-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
        }

        .feedback-button {
          cursor: pointer;
          color: #666;
          font-size: 20px;
          transition: color 0.2s;
        }

        .feedback-button:hover {
          color: #000;
        }

        .feedback-message {
          font-size: 12px;
          color: green;
        }

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
          white-space: pre-wrap;
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

        .recent-searches {
          margin-top: 0;
          margin-bottom: 15px;
          text-align: left;
        }

        .recent-searches-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .recent-searches-title {
          font-size: 14px;
          font-weight: bold;
          color: #333;
        }

        .clear-history {
          padding: 4px 8px;
          background: #f0f0f0;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 12px;
          color: #333;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }

        .clear-history:hover {
          background: #ff4d4d;
          color: #fff;
          border-color: #ff4d4d;
        }

        .recent-search-item {
          padding: 8px;
          background: #f9f9f9;
          border: 1px solid #eee;
          border-radius: 4px;
          margin-bottom: 5px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .recent-search-item:hover {
          background: #f0f0f0;
        }

        .show-history-container {
          text-align: left;
          margin-top: 0;
          margin-bottom: 0;
        }

        .show-history-button {
          padding: 4px 8px;
          background: #f0f0f0;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 12px;
          color: #333;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          margin-top: 0;
          margin-bottom: 5px;
          display: inline-block;
        }

        .show-history-button:hover {
          background: #e7cf2c;
          color: #000;
          border-color: #e7cf2c;
        }

        .refine-modal-input-container {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
        }

        .refine-modal-input {
          width: 100%;
          max-width: 90%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 20px;
          font-size: 16px;
          box-sizing: border-box;
          background: #fff;
          box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
          transition: box-shadow 0.3s ease;
        }

        .refine-modal-input:hover {
          box-shadow: 0 2px 8px rgba(32, 33, 36, 0.4);
        }

        .search-buttons {
          display: flex;
          justify-content: center;
          margin-bottom: 15px;
          margin-top: 18px; /* Fixed distance: 10px (search-container margin-bottom) + 18px = 28px below search input */
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
          text-align: center;
        }

        .download-text {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }

        .download-button {
          display: inline-block;
        }

        .powered-by {
          margin-top: 10px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }

        .powered-by a {
          color: #007bff;
          text-decoration: none;
        }

        .powered-by a:hover {
          text-decoration: underline;
        }

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

          .search-container {
            width: 90%;
            margin-left: auto;
            margin-right: auto;
            margin-bottom: 10px;
          }

          .search-input {
            width: 100%;
            padding: 8px 35px 8px 8px;
            font-size: 16px;
            touch-action: pan-y;
          }

          .search-icon {
            width: 18px;
            height: 18px;
            right: 12px;
            font-size: 18px;
          }

          .loading-bar-container {
            bottom: -14px;
            width: 150px;
            height: 6px;
          }

          .suggestions {
            margin-top: 18px;
          }

          .suggestion-item {
            padding: 8px;
            font-size: 12px;
          }

          .results-container {
            padding: 10px;
            font-size: 12px;
            max-height: 300px;
          }

          .results-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }

          .results-header-text {
            font-size: 14px;
          }

          .url-results-header {
            font-size: 14px;
            margin-bottom: 8px;
          }

          .url-results-container {
            padding: 10px;
            font-size: 12px;
            max-height: 500px;
          }

          .url-result-item {
            margin-bottom: 10px;
          }

          .url-result-title {
            font-size: 12px;
          }

          .url-result-url {
            font-size: 10px;
            margin-bottom: 4px;
          }

          .url-result-description {
            font-size: 12px;
          }

          .loading-more {
            padding: 8px;
            font-size: 12px;
          }

          .view-toggle {
            font-size: 12px;
          }

          .action-buttons {
            gap: 6px;
            flex-wrap: wrap;
            justify-content: flex-end;
          }

          .action-button {
            padding: 3px 6px;
            font-size: 10px;
          }

          .action-button svg {
            margin-right: 3px;
            width: 14px;
            height: 14px;
          }

          .feedback-section {
            gap: 8px;
          }

          .feedback-button {
            font-size: 16px;
          }

          .feedback-message {
            font-size: 10px;
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

          .recent-searches {
            margin-bottom: 15px;
          }

          .recent-searches-title {
            font-size: 12px;
          }

          .clear-history {
            padding: 3px 6px;
            font-size: 10px;
          }

          .recent-search-item {
            padding: 6px;
            font-size: 12px;
            margin-bottom: 4px;
          }

          .show-history-button {
            padding: 3px 6px;
            font-size: 10px;
            margin-bottom: 5px;
          }

          .refine-modal-input-container {
            margin-bottom: 8px;
          }

          .refine-modal-input {
            padding: 8px;
            font-size: 14px;
            max-width: 100%;
          }

          .search-buttons {
            margin-top: 18px; /* Consistent spacing: 10px (search-container margin-bottom) + 18px = 28px below search input */
            margin-bottom: 15px;
          }

          .search-button {
            padding: 8px 15px;
            font-size: 14px;
          }

          .error-message {
            font-size: 14px;
            padding: 8px;
          }

          .ad-placeholder {
            font-size: 10px;
            padding: 8px;
          }

          .modal-content {
            padding: 15px;
            max-width: 300px;
          }

          .modal-title {
            font-size: 18px;
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

          .powered-by {
            font-size: 10px;
          }
        }
      `}</style>

      <div className="header">
        <Image src="/settings512.png" alt="Fork in Road Logo" width={100} height={100} />
        <h1>choose</h1>
      </div>

      <div className="search-container">
        <input
          type="text"
          id="query"
          value={query}
          onChange={handleQueryChange}
          onKeyDown={handleKeyDown}
          className={`search-input ${query ? "has-text" : ""}`}
          placeholder="search"
          autoComplete="off"
          autoCorrect="on"
          autoCapitalize="on"
        />
        <button
          className="search-icon"
          onClick={handleMagnifyingGlassClick}
          disabled={!query}
          aria-label="Search"
        >
          🔍
        </button>
        {isLoading && (
          <div className="loading-bar-container">
            <div className="loading-bar"></div>
          </div>
        )}
        {showSuggestions && (
          <div className="suggestions">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`suggestion-item ${index === highlightedIndex ? "suggestion-item-highlighted" : ""}`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {recentSearches.length > 0 && (
        <div className="show-history-container">
          <button className="show-history-button" onClick={toggleHistory}>
            {showHistory ? "Hide History" : "Show History"}
          </button>
          {showHistory && (
            <div className="recent-searches">
              <div className="recent-searches-header">
                <div className="recent-searches-title">Recent Searches</div>
                <div className="clear-history" onClick={handleClearHistory}>
                  Clear History
                </div>
              </div>
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className="recent-search-item"
                  onClick={() => handleRecentSearchClick(search)}
                >
                  {search.query}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="search-buttons">
        <button
          onClick={() => handleSearch(query)}
          className={`search-button ${!query ? "button-disabled" : ""}`}
          disabled={!query}
        >
          Fork It
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {grokResult && (
        <>
          <div className="results-header">
            <div className="results-header-text">Grok Results</div>
            <div className="action-buttons">
              <div className="action-button" onClick={handleCopy}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                {isCopied ? "Copied!" : "Copy"}
              </div>
              <div className="action-button" onClick={handleShare}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                {shareMessage || "Share"}
              </div>
              <div className="action-button" onClick={() => setShowRefineModal(true)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Refine
              </div>
              <div className="action-button" onClick={handleClearResults}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Clear
              </div>
            </div>
          </div>
          <div
            className="results-container"
            style={viewMode === "raw" ? { whiteSpace: "pre-wrap" } : {}}
          >
            {viewMode === "rendered" ? (
              <div dangerouslySetInnerHTML={renderMarkdown(grokResult)} />
            ) : (
              <pre>{grokResult}</pre>
            )}
          </div>
          {braveResults.length > 0 && (
            <>
              <div className="url-results-header">Web Results</div>
              <div className="url-results-container" ref={containerRef}>
                {braveResults.map((result, index) => (
                  <div key={`${result.url}-${index}`} className="url-result-item">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="url-result-title"
                    >
                      {result.title}
                    </a>
                    <div className="url-result-url">{result.url}</div>
                    <div className="url-result-description">{result.description}</div>
                  </div>
                ))}
                <div className="loading-more" ref={loadMoreRef}>
                  {isLoadingMore ? "Loading more..." : hasMore ? "Scroll to load more..." : "No more results"}
                </div>
              </div>
            </>
          )}
          <div className="feedback-section">
            <span
              className="feedback-button"
              onClick={() => handleFeedback("up")}
              role="img"
              aria-label="Thumbs Up"
            >
              👍
            </span>
            <span
              className="feedback-button"
              onClick={() => handleFeedback("down")}
              role="img"
              aria-label="Thumbs Down"
            >
              👎
            </span>
            {feedbackMessage && <span className="feedback-message">{feedbackMessage}</span>}
          </div>
          <div className="ad-container">
            <div className="ad-placeholder">Sponsored Ad Placeholder (Carbon Ads)</div>
          </div>
        </>
      )}

      {showRefineModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-title">Refine Your Result</div>
            <div className="refine-modal-input-container">
              <input
                type="text"
                className="refine-modal-input"
                value={refineInput}
                onChange={(e) => setRefineInput(e.target.value)}
                placeholder="Enter refinement instruction"
              />
            </div>
            <div className="modal-buttons">
              <button onClick={handleRefineSubmit} className="modal-button">
                Submit
              </button>
              <button onClick={closeRefineModal} className="modal-button">
                Cancel
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
        <div className="powered-by">
          Powered by{" "}
          <a href="https://x.ai" target="_blank" rel="noopener noreferrer">
            Grok
          </a>{" "}
          and{" "}
          <a href="https://brave.com" target="_blank" rel="noopener noreferrer">
            Brave
          </a>
        </div>
      </div>
    </div>
  );
}