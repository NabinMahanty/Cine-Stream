// ===== Favorites Manager (LocalStorage) =====

const STORAGE_KEY = "moodmatch_favorites";

/**
 * Get all favorites from localStorage
 * @returns {Array} Array of movie objects
 */
export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Check if a movie is already in favorites
 * @param {number} movieId
 * @returns {boolean}
 */
export function isFavorite(movieId) {
  return getFavorites().some((m) => m.id === movieId);
}

/**
 * Toggle a movie in/out of favorites
 * @param {Object} movie - Movie object to toggle
 * @returns {boolean} - true if added, false if removed
 */
export function toggleFavorite(movie) {
  const favs = getFavorites();
  const index = favs.findIndex((m) => m.id === movie.id);

  if (index > -1) {
    favs.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
    return false; // removed
  } else {
    // Store only necessary fields
    favs.push({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      overview: movie.overview,
      genre_ids: movie.genre_ids || [],
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
    return true; // added
  }
}
