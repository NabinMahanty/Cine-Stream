"use client";

import { useState, useEffect } from "react";
import MovieGrid from "@/components/MovieGrid";
import { getFavorites } from "@/lib/services/favorites";
import { getGenres } from "@/lib/services/tmdb";

export default function FavoritesClient() {
  const [favorites, setFavorites] = useState([]);
  const [genres, setGenres] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favs = getFavorites();
        setFavorites(favs);
        const g = await getGenres();
        setGenres(g);
      } catch (error) {
        console.error("Failed to load favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();

    // Listen for changes to favorites
    const handleFavoritesChanged = (e) => {
      const { movieId, added } = e.detail;
      if (!added) {
        // Movie was removed, update the list
        setFavorites((prev) => prev.filter((m) => m.id !== movieId));
      } else {
        // Movie was added
        const favs = getFavorites();
        setFavorites(favs);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("favorites-changed", handleFavoritesChanged);
      return () =>
        window.removeEventListener("favorites-changed", handleFavoritesChanged);
    }
  }, []);

  const emptyMessage =
    favorites.length === 0
      ? "Start adding movies to your favorites by clicking the heart icon!"
      : "No favorites yet";

  return (
    <main className="main-content">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">❤️ My Favorites</h2>
          {favorites.length > 0 && (
            <span className="section-badge">
              {favorites.length} movie{favorites.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <MovieGrid
          movies={favorites}
          genres={genres}
          loading={loading}
          emptyMessage={emptyMessage}
        />
      </div>
    </main>
  );
}
