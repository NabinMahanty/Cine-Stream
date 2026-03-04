// ===== Movie Card Component =====

import { IMAGE_SIZES } from "../services/tmdb.js";
import { isFavorite, toggleFavorite } from "../services/favorites.js";
import { getYear, showToast } from "../utils/helpers.js";

/**
 * Create a movie card DOM element with lazy-loaded poster
 * @param {Object} movie - Movie data from TMDB
 * @param {Object} genres - Genre ID-to-name map
 * @param {(movie: Object) => void} [onCardClick] - Optional click handler
 * @returns {HTMLElement} Movie card element
 */
export function createMovieCard(movie, genres = {}, onCardClick = null) {
  const card = document.createElement("div");
  card.className = "movie-card fade-in";
  card.dataset.id = movie.id;

  const year = getYear(movie.release_date);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
  const fav = isFavorite(movie.id);
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

  const posterHTML = posterSrc
    ? `<img
        class="card-poster"
        src="${posterSrc}"
        alt="${movie.title}"
        loading="lazy"
      />`
    : `<div class="no-poster">
        <span>🎬</span>
        <span>No Poster</span>
      </div>`;

  card.innerHTML = `
    <div class="card-poster-wrapper">
      ${posterHTML}
      <div class="card-overlay">
        <p class="card-overlay-text">${movie.overview || "No description available."}</p>
      </div>
      <div class="card-hover-info">
        <h3 class="card-hover-title">${movie.title}</h3>
        <div class="card-hover-meta">
          <span class="card-year">${year}</span>
          <span class="card-score">⭐ ${rating}</span>
        </div>
      </div>
      <div class="card-rating">
        <span class="star">★</span> ${rating}
      </div>
      <button class="card-fav-btn ${fav ? "is-fav" : ""}" title="${fav ? "Remove from favorites" : "Add to favorites"}">
        ${fav ? "❤️" : "🤍"}
      </button>
    </div>
    <div class="card-info">
      <h3 class="card-title">${movie.title}</h3>
      <div class="card-meta">
        <span class="card-year">${year}</span>
        <span class="card-score">⭐ ${rating}</span>
        ${genreNames ? `<span class="card-genre">${genreNames}</span>` : ""}
      </div>
    </div>
  `;

  // Favorite toggle handler
  const favBtn = card.querySelector(".card-fav-btn");
  favBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const added = toggleFavorite(movie);
    favBtn.classList.toggle("is-fav", added);
    favBtn.innerHTML = added ? "❤️" : "🤍";
    favBtn.title = added ? "Remove from favorites" : "Add to favorites";
    showToast(
      added
        ? `"${movie.title}" added to favorites!`
        : `"${movie.title}" removed from favorites.`,
    );

    // Dispatch custom event for favorites page
    window.dispatchEvent(
      new CustomEvent("favorites-changed", {
        detail: { movieId: movie.id, added },
      }),
    );
  });

  card.addEventListener("click", () => {
    if (typeof onCardClick === "function") {
      onCardClick(movie);
    }
  });

  return card;
}
