import { getMovieDetails, getGenres } from "@/lib/services/tmdb";
import MovieDetailClient from "./MovieDetailClient";
import { notFound } from "next/navigation";

// This function generates metadata dynamically based on the movie data
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const movieId = resolvedParams?.id;

  if (!movieId) {
    return {
      title: "Movie - MoodMatch",
      description: "View movie details on MoodMatch",
    };
  }

  try {
    const movie = await getMovieDetails(movieId);

    if (!movie) {
      return {
        title: "Movie Not Found - MoodMatch",
        description: "This movie could not be found.",
      };
    }

    return {
      title: `${movie.title} - MoodMatch`,
      description: movie.overview || `Watch ${movie.title} on MoodMatch`,
      openGraph: {
        title: movie.title,
        description: movie.overview || `Watch ${movie.title}`,
        images: movie.poster_path
          ? [`https://image.tmdb.org/t/p/w500${movie.poster_path}`]
          : [],
      },
    };
  } catch (error) {
    console.error("Failed to generate metadata for movie:", movieId, error);
    return {
      title: "Movie - MoodMatch",
      description: "View movie details on MoodMatch",
    };
  }
}

async function getMovieData(id) {
  if (!id) {
    return null;
  }

  try {
    const [movie, genres] = await Promise.all([
      getMovieDetails(id),
      getGenres(),
    ]);

    if (!movie) {
      return null;
    }

    return { movie, genres };
  } catch (error) {
    console.error("Failed to fetch movie data:", error);
    return null;
  }
}

export default async function MovieDetailPage({ params }) {
  const resolvedParams = await params;
  const movieId = resolvedParams?.id;
  const data = await getMovieData(movieId);

  if (!data) {
    notFound();
  }

  return <MovieDetailClient movie={data.movie} genres={data.genres} />;
}
