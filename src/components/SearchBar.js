"use client";

import { useState } from "react";
import { debounce } from "@/lib/utils/helpers";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [showClear, setShowClear] = useState(false);

  // Create debounced function once
  const debouncedSearchRef = useState(() =>
    debounce((searchQuery) => {
      onSearch(searchQuery);
    }, 500),
  )[0];

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowClear(value.trim().length > 0);
    debouncedSearchRef(value.trim());
  };

  const handleClear = () => {
    setQuery("");
    setShowClear(false);
    onSearch("");
  };

  return (
    <header className="hero">
      <div className="hero-container">
        <h1 className="hero-title">Discover Your Next Favorite Movie</h1>
        <p className="hero-subtitle">Search thousands of movies</p>

        <div className="search-wrapper">
          <div className="search-bar">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search for movies..."
              value={query}
              onChange={handleInputChange}
              autoComplete="off"
            />
            {showClear && (
              <button
                className="clear-btn"
                onClick={handleClear}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
