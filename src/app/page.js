import HomeClient from "./HomeClient";
import { getPopularMovies, getGenres } from "@/lib/services/tmdb";

export const metadata = {
  title: "Popular Movies - MoodMatch",
  description: "Browse and discover popular movies on MoodMatch",
};

async function getInitialMovies() {
  try {
    const [moviesData, genresData] = await Promise.all([
      getPopularMovies(1),
      getGenres(),
    ]);
    return {
      movies: moviesData.results || [],
      totalPages: moviesData.total_pages || 1,
      totalResults: moviesData.total_results || 0,
      genres: genresData || {},
    };
  } catch (error) {
    console.error("Failed to fetch initial movies:", error);
    return {
      movies: [],
      totalPages: 1,
      totalResults: 0,
      genres: {},
    };
  }
}

export default async function Home() {
  const initialData = await getInitialMovies();

  return <HomeClient initialData={initialData} />;
}
