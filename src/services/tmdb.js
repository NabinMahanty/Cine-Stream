// ===== Movie API Service (TMDB + OMDB compatibility) =====

const API_KEY_RAW = (import.meta.env.VITE_TMDB_API_KEY || "").trim();
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const OMDB_BASE_URL = "https://www.omdbapi.com/";
const IMG_BASE = "https://image.tmdb.org/t/p";

function getProviderAndKey(rawValue) {
  if (!rawValue) return { provider: "tmdb", key: "" };

  const looksLikeOmdbUrl = rawValue.includes("omdbapi.com");
  if (looksLikeOmdbUrl) {
    try {
      const url = new URL(rawValue);
      const extracted = url.searchParams.get("apikey") || "";
      return { provider: "omdb", key: extracted };
    } catch {
      return { provider: "omdb", key: "" };
    }
  }

  return { provider: "tmdb", key: rawValue };
}

const { provider: API_PROVIDER, key: API_KEY } = getProviderAndKey(API_KEY_RAW);

export const IMAGE_SIZES = {
  poster: `${IMG_BASE}/w500`,
  backdrop: `${IMG_BASE}/w1280`,
  thumb: `${IMG_BASE}/w200`,
};

function mapOmdbMovie(item) {
  return {
    id: item.imdbID,
    title: item.Title,
    poster_path: item.Poster && item.Poster !== "N/A" ? item.Poster : null,
    release_date: item.Year ? `${item.Year}-01-01` : "",
    vote_average: 0,
    overview: "",
    genre_ids: [],
  };
}

function mapOmdbMovieDetails(item) {
  const year = item.Year && item.Year !== "N/A" ? item.Year : "";
  const imdbRating =
    item.imdbRating && item.imdbRating !== "N/A" ? Number(item.imdbRating) : 0;

  return {
    id: item.imdbID,
    title: item.Title,
    poster_path: item.Poster && item.Poster !== "N/A" ? item.Poster : null,
    release_date: year ? `${year}-01-01` : "",
    vote_average: Number.isFinite(imdbRating) ? imdbRating : 0,
    overview: item.Plot && item.Plot !== "N/A" ? item.Plot : "",
    genre_ids: [],
  };
}

function toOmdbDetailModel(item) {
  const mapped = mapOmdbMovieDetails(item);
  return {
    ...mapped,
    raw: item,
  };
}

async function fetchOmdbMovieDetails(imdbID) {
  const res = await fetch(
    `${OMDB_BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=short`,
  );
  if (!res.ok) throw new Error(`OMDB Error: ${res.status}`);

  const data = await res.json();
  if (data.Response === "False") {
    throw new Error(data.Error || "OMDB detail lookup failed");
  }

  return mapOmdbMovieDetails(data);
}

async function fetchOmdbMovieFullDetails(imdbID) {
  const res = await fetch(
    `${OMDB_BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`,
  );
  if (!res.ok) throw new Error(`OMDB Error: ${res.status}`);

  const data = await res.json();
  if (data.Response === "False") {
    throw new Error(data.Error || "OMDB detail lookup failed");
  }

  return toOmdbDetailModel(data);
}

async function fetchOmdbSearch(query, page = 1) {
  const res = await fetch(
    `${OMDB_BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie&page=${page}`,
  );
  if (!res.ok) throw new Error(`OMDB Error: ${res.status}`);

  const data = await res.json();
  if (data.Response === "False") {
    return {
      page,
      total_pages: 1,
      total_results: 0,
      results: [],
    };
  }

  const totalResults = Number(data.totalResults || 0);
  const searchResults = data.Search || [];

  const enrichedResults = await Promise.all(
    searchResults.map(async (item) => {
      try {
        return await fetchOmdbMovieDetails(item.imdbID);
      } catch {
        return mapOmdbMovie(item);
      }
    }),
  );

  return {
    page,
    total_pages: Math.max(1, Math.ceil(totalResults / 10)),
    total_results: totalResults,
    results: enrichedResults,
  };
}

/**
 * Fetch popular movies (paginated)
 */
export async function getPopularMovies(page = 1) {
  if (API_PROVIDER === "omdb") {
    return fetchOmdbSearch("movie", page);
  }

  const res = await fetch(
    `${TMDB_BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`,
  );
  if (!res.ok) throw new Error(`TMDB Error: ${res.status}`);
  return res.json();
}

/**
 * Search movies by query (paginated)
 */
export async function searchMovies(query, page = 1) {
  if (API_PROVIDER === "omdb") {
    return fetchOmdbSearch(query, page);
  }

  const res = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
      query,
    )}&page=${page}`,
  );
  if (!res.ok) throw new Error(`TMDB Error: ${res.status}`);
  return res.json();
}

/**
 * Get genre list for mapping IDs to names
 */
let genreCache = null;
export async function getGenres() {
  if (API_PROVIDER === "omdb") {
    return {};
  }

  if (genreCache) return genreCache;
  const res = await fetch(
    `${TMDB_BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`,
  );
  if (!res.ok) throw new Error(`TMDB Error: ${res.status}`);
  const data = await res.json();
  genreCache = {};
  data.genres.forEach((g) => (genreCache[g.id] = g.name));
  return genreCache;
}

/**
 * Get full movie details by ID for modal view
 */
export async function getMovieDetails(movieId) {
  if (!movieId) throw new Error("Missing movie ID");

  if (API_PROVIDER === "omdb") {
    return fetchOmdbMovieFullDetails(movieId);
  }

  const res = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`,
  );
  if (!res.ok) throw new Error(`TMDB Error: ${res.status}`);
  const data = await res.json();

  return {
    ...data,
    raw: data,
  };
}
