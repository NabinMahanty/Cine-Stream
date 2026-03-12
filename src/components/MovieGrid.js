"use client";

import { useEffect, useState } from "react";
import MovieCard from "./MovieCard";

export default function MovieGrid({
  movies,
  genres,
  loading,
  onCardClick,
  emptyMessage,
}) {
  const [displayMovies, setDisplayMovies] = useState(movies);

  useEffect(() => {
    setDisplayMovies(movies);
  }, [movies]);

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
        <p>Loading movies...</p>
      </div>
    );
  }

  if (displayMovies.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">🎥</span>
        <h3>No movies found</h3>
        <p>
          {emptyMessage || "Try a different search or explore popular movies."}
        </p>
      </div>
    );
  }

  return (
    <div className="movie-grid">
      {displayMovies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          genres={genres}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}
