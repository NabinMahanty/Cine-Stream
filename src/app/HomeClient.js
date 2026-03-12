"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import MovieGrid from "@/components/MovieGrid";
import { getPopularMovies, searchMovies } from "@/lib/services/tmdb";

function dedupeMoviesById(movieList = []) {
  const seen = new Set();

  return movieList.filter((movie) => {
    const movieId = movie?.id;
    if (!movieId || seen.has(movieId)) {
      return false;
    }
    seen.add(movieId);
    return true;
  });
}

export default function HomeClient({ initialData }) {
  const router = useRouter();
  const sentinelRef = useRef(null);
  const [movies, setMovies] = useState(() =>
    dedupeMoviesById(initialData.movies || []),
  );
  const [genres, setGenres] = useState(initialData.genres);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [totalResults, setTotalResults] = useState(initialData.totalResults);
  const [sectionTitle, setSectionTitle] = useState("Popular Movies");
  const [sectionBadge, setSectionBadge] = useState(
    initialData.totalResults > 0
      ? `${initialData.totalResults.toLocaleString()} movies`
      : "",
  );

  // Listen for favorites changes to update UI if needed
  useEffect(() => {
    const handleFavoritesChanged = () => {
      // Component re-renders when favorites change
    };

    if (typeof window !== "undefined") {
      window.addEventListener("favorites-changed", handleFavoritesChanged);
      return () =>
        window.removeEventListener("favorites-changed", handleFavoritesChanged);
    }
  }, []);

  const handleCardClick = useCallback(
    (movie) => {
      if (!movie?.id) return;
      router.push(`/movie/${movie.id}`);
    },
    [router],
  );

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setLoading(true);

    try {
      let data;
      if (query.trim()) {
        setSectionTitle(`Results for "${query}"`);
        data = await searchMovies(query, 1);
      } else {
        setSectionTitle("Popular Movies");
        data = await getPopularMovies(1);
      }

      setMovies(dedupeMoviesById(data.results || []));
      setTotalPages(data.total_pages || 1);
      setTotalResults(data.total_results || 0);
      setSectionBadge(
        data.total_results > 0
          ? `${data.total_results.toLocaleString()} movies`
          : "",
      );
    } catch (error) {
      console.error("Search failed:", error);
      setMovies([]);
      setSectionBadge("");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreMovies = useCallback(async () => {
    if (loading || loadingMore || currentPage >= totalPages) {
      return;
    }

    setLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      const data = searchQuery.trim()
        ? await searchMovies(searchQuery, nextPage)
        : await getPopularMovies(nextPage);

      const nextResults = data.results || [];

      if (nextResults.length > 0) {
        setMovies((prev) => dedupeMoviesById([...prev, ...nextResults]));
      }

      setCurrentPage(data.page || nextPage);
      setTotalPages(data.total_pages || totalPages);
      setTotalResults(data.total_results || totalResults);
      setSectionBadge(
        (data.total_results || 0) > 0
          ? `${(data.total_results || 0).toLocaleString()} movies`
          : "",
      );
    } catch (error) {
      console.error("Failed to load more movies:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [
    loading,
    loadingMore,
    currentPage,
    totalPages,
    searchQuery,
    totalResults,
  ]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadMoreMovies();
        }
      },
      {
        root: null,
        rootMargin: "300px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [loadMoreMovies]);

  const hasMore = currentPage < totalPages;

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <main className="main-content">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{sectionTitle}</h2>
            <span className="section-badge">{sectionBadge}</span>
          </div>

          <MovieGrid
            movies={movies}
            genres={genres}
            loading={loading}
            onCardClick={handleCardClick}
            emptyMessage={
              searchQuery
                ? "Try a different search or explore popular movies."
                : "No movies available."
            }
          />

          {loadingMore && (
            <div className="infinite-status">
              <div className="spinner spinner-small"></div>
              <p>Loading more movies...</p>
            </div>
          )}

          {hasMore && <div ref={sentinelRef} className="scroll-sentinel"></div>}
        </div>
      </main>
    </div>
  );
}
