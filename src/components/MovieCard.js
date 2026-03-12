"use client";

import { IMAGE_SIZES } from "@/lib/services/tmdb";
import { isFavorite, toggleFavorite } from "@/lib/services/favorites";
import { getYear } from "@/lib/utils/helpers";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Movie Card Component
 * @param {Object} movie - Movie data from TMDB
 * @param {Object} genres - Genre ID-to-name map
 * @param {function} onCardClick - Optional click handler
 */
export default function MovieCard({ movie, genres = {}, onCardClick = null }) {
  const router = useRouter();
  const [isFav, setIsFav] = useState(() => isFavorite(movie.id));

  const year = getYear(movie.release_date);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
  const genreNames = (movie.genre_ids || [])
    .slice(0, 2)
    .map((id) => genres[id] || "")
    .filter(Boolean)
    .join(", ");

  const posterSrc = movie.poster_path
    ? movie.poster_path.startsWith("http")
      ? movie.poster_path
      : `${IMAGE_SIZES.poster}${movie.poster_path}`
    : null;

  const handleFavClick = (e) => {
    e.stopPropagation();
    const added = toggleFavorite(movie);
    setIsFav(added);

    // Dispatch custom event for favorites page to update
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("favorites-changed", {
          detail: { movieId: movie.id, added },
        }),
      );
    }
  };

  const handleCardClick = () => {
    if (typeof onCardClick === "function") {
      onCardClick(movie);
      return;
    }

    if (movie?.id) {
      router.push(`/movie/${movie.id}`);
    }
  };

  const handleCardKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      className="movie-card fade-in"
      data-id={movie.id}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${movie.title}`}
    >
      <div className="card-poster-wrapper">
        {posterSrc ? (
          <img
            className="card-poster"
            src={posterSrc}
            alt={movie.title}
            loading="lazy"
          />
        ) : (
          <div className="no-poster">
            <span>🎬</span>
            <span>No Poster</span>
          </div>
        )}
        <div className="card-overlay">
          <p className="card-overlay-text">
            {movie.overview || "No description available."}
          </p>
        </div>
        <div className="card-hover-info">
          <h3 className="card-hover-title">{movie.title}</h3>
          <div className="card-hover-meta">
            <span className="card-year">{year}</span>
            <span className="card-score">⭐ {rating}</span>
          </div>
        </div>
        <div className="card-rating">
          <span className="star">★</span> {rating}
        </div>
        <button
          className={`card-fav-btn ${isFav ? "is-fav" : ""}`}
          title={isFav ? "Remove from favorites" : "Add to favorites"}
          onClick={handleFavClick}
        >
          {isFav ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="card-info">
        <h3 className="card-title">{movie.title}</h3>
        <div className="card-meta">
          <span className="card-year">{year}</span>
          <span className="card-score">⭐ {rating}</span>
          {genreNames && <span className="card-genre">{genreNames}</span>}
        </div>
      </div>
    </div>
  );
}
