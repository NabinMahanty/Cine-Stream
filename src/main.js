// ===== Main Application Entry Point =====
// Movie Mood Matcher — All levels implemented:
//   L1: Popular movies grid + search
//   L2: Infinite scroll, debounced search, favorites with LocalStorage

import {
  getPopularMovies,
  searchMovies,
  getGenres,
  getMovieDetails,
  IMAGE_SIZES,
} from "./services/tmdb.js";
import { getFavorites } from "./services/favorites.js";
import { createMovieCard } from "./components/MovieCard.js";
import { debounce, getYear, showToast } from "./utils/helpers.js";

// ===== STATE =====
const state = {
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  searchQuery: "",
  currentRoute: "home", // 'home' | 'favorites'
  genres: {},
};

// ===== DOM REFERENCES =====
const $ = (sel) => document.querySelector(sel);
const movieGrid = $("#movie-grid");
const searchInput = $("#search-input");
const clearBtn = $("#clear-search");
const loader = $("#loader");
const emptyState = $("#empty-state");
const sectionTitle = $("#section-title");
const sectionBadge = $("#section-badge");
const sectionHeader = $("#section-header");
const scrollSentinel = $("#scroll-sentinel");
const hero = $("header.hero");
const navLinks = document.querySelectorAll(".nav-link");
const movieModal = $("#movie-modal");
const movieModalBody = $("#movie-modal-body");
const movieModalClose = $("#movie-modal-close");

// ===== INITIALIZATION =====
async function init() {
  state.genres = await getGenres().catch(() => ({}));

  setupRouter();
  setupSearch();
  setupInfiniteScroll();
  setupMovieModal();

  // Initial route
  handleRoute();
}

// ===== ROUTER =====
function setupRouter() {
  window.addEventListener("hashchange", handleRoute);
}

function handleRoute() {
  const hash = window.location.hash || "#/";

  // Update nav active state
  navLinks.forEach((link) => {
    const route = link.dataset.route;
    link.classList.toggle(
      "active",
      hash === `#/${route === "home" ? "" : route}`,
    );
  });

  if (hash === "#/favorites") {
    state.currentRoute = "favorites";
    showFavorites();
  } else {
    state.currentRoute = "home";
    showHome();
  }
}

// ===== HOME VIEW =====
function showHome() {
  hero.classList.remove("hidden");
  scrollSentinel.classList.remove("hidden");

  // Reset and load
  if (state.searchQuery) {
    performSearch(state.searchQuery, true);
  } else {
    loadPopular(true);
  }
}

async function loadPopular(reset = false) {
  if (reset) {
    state.currentPage = 1;
    movieGrid.innerHTML = "";
  }

  sectionTitle.textContent = "Popular Movies";
  sectionBadge.textContent = "";
  await fetchMovies(() => getPopularMovies(state.currentPage));
}

// ===== SEARCH (L1 + L2 Debounce) =====
function setupSearch() {
  const debouncedSearch = debounce((query) => {
    state.searchQuery = query.trim();

    if (state.searchQuery) {
      clearBtn.classList.remove("hidden");
      performSearch(state.searchQuery, true);
    } else {
      clearBtn.classList.add("hidden");
      loadPopular(true);
    }
  }, 500);

  searchInput.addEventListener("input", (e) => {
    debouncedSearch(e.target.value);
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    state.searchQuery = "";
    clearBtn.classList.add("hidden");
    loadPopular(true);
    searchInput.focus();
  });
}

async function performSearch(query, reset = false) {
  if (reset) {
    state.currentPage = 1;
    movieGrid.innerHTML = "";
  }

  sectionTitle.textContent = `Results for "${query}"`;
  sectionBadge.textContent = "";
  await fetchMovies(() => searchMovies(query, state.currentPage));
}

// ===== GENERIC FETCH & RENDER =====
async function fetchMovies(fetchFn) {
  if (state.isLoading) return;
  state.isLoading = true;
  showLoader(true);
  emptyState.classList.add("hidden");

  try {
    const data = await fetchFn();
    state.totalPages = data.total_pages;

    if (data.results.length === 0 && state.currentPage === 1) {
      emptyState.classList.remove("hidden");
    }

    sectionBadge.textContent =
      data.total_results > 0
        ? `${data.total_results.toLocaleString()} movies`
        : "";

    renderMovies(data.results);
  } catch (err) {
    console.error("Fetch error:", err);
    showToast("Failed to load movies. Check your API key.");
  } finally {
    state.isLoading = false;
    showLoader(false);
  }
}

function renderMovies(movies) {
  const fragment = document.createDocumentFragment();
  movies.forEach((movie) => {
    fragment.appendChild(createMovieCard(movie, state.genres, openMovieModal));
  });
  movieGrid.appendChild(fragment);
}

function showLoader(show) {
  loader.classList.toggle("hidden", !show);
}

// ===== INFINITE SCROLL (L2) =====
function setupInfiniteScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (
        entry.isIntersecting &&
        !state.isLoading &&
        state.currentPage < state.totalPages &&
        state.currentRoute === "home"
      ) {
        state.currentPage++;

        if (state.searchQuery) {
          fetchMovies(() => searchMovies(state.searchQuery, state.currentPage));
        } else {
          fetchMovies(() => getPopularMovies(state.currentPage));
        }
      }
    },
    { rootMargin: "300px" },
  );

  observer.observe(scrollSentinel);
}

// ===== FAVORITES VIEW (L2) =====
function showFavorites() {
  hero.classList.add("hidden");
  scrollSentinel.classList.add("hidden");
  movieGrid.innerHTML = "";

  sectionTitle.textContent = "❤️ My Favorites";
  sectionBadge.textContent = "";
  emptyState.classList.add("hidden");
  showLoader(false);

  const favs = getFavorites();

  if (favs.length === 0) {
    emptyState.querySelector("h3").textContent = "No favorites yet";
    emptyState.querySelector("p").textContent =
      "Start adding movies to your favorites by clicking the heart icon!";
    emptyState.classList.remove("hidden");
    return;
  }

  sectionBadge.textContent = `${favs.length} movie${favs.length !== 1 ? "s" : ""}`;
  renderMovies(favs);

  // Listen for removals while on favorites page
  const handler = (e) => {
    if (!e.detail.added && state.currentRoute === "favorites") {
      showFavorites(); // re-render
    }
  };
  window.addEventListener("favorites-changed", handler, { once: false });
}

function setupMovieModal() {
  if (!movieModal || !movieModalBody || !movieModalClose) return;

  movieModal.addEventListener("click", (event) => {
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      target.hasAttribute("data-close-modal")
    ) {
      closeMovieModal();
    }
  });

  movieModalClose.addEventListener("click", closeMovieModal);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !movieModal.classList.contains("hidden")) {
      closeMovieModal();
    }
  });
}

function openMovieModalShell() {
  if (!movieModal || !movieModalBody) return;
  movieModal.classList.remove("hidden");
  movieModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  movieModalBody.innerHTML = `<p>Loading movie details...</p>`;
}

function closeMovieModal() {
  if (!movieModal) return;
  movieModal.classList.add("hidden");
  movieModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDetailKey(key) {
  return String(key)
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
}

function formatObjectInline(obj) {
  const entries = Object.entries(obj || {}).filter(
    ([, itemValue]) =>
      itemValue !== null && itemValue !== undefined && itemValue !== "",
  );

  if (entries.length === 0) return "N/A";

  if ("Source" in obj && "Value" in obj) {
    return `${escapeHtml(obj.Source)}: ${escapeHtml(obj.Value)}`;
  }

  return entries
    .map(([itemKey, itemValue]) => {
      return `${escapeHtml(formatDetailKey(itemKey))}: ${escapeHtml(String(itemValue))}`;
    })
    .join(" • ");
}

function formatDetailValueHtml(value) {
  if (value === null || value === undefined || value === "") return "N/A";

  if (Array.isArray(value)) {
    if (value.length === 0) return "N/A";

    const items = value.map((item) => {
      if (item && typeof item === "object") {
        return `<li>${formatObjectInline(item)}</li>`;
      }
      return `<li>${escapeHtml(String(item))}</li>`;
    });

    return `<ul class="movie-data-array">${items.join("")}</ul>`;
  }

  if (typeof value === "object") {
    return formatObjectInline(value);
  }

  return escapeHtml(String(value));
}

function resolvePosterSrc(movie) {
  if (!movie?.poster_path) return "";
  if (String(movie.poster_path).startsWith("http")) return movie.poster_path;
  return `${IMAGE_SIZES.poster}${movie.poster_path}`;
}

function renderMovieModal(details) {
  if (!movieModalBody) return;

  const rawData = details?.raw || details || {};
  const title = details?.title || rawData?.Title || "Unknown Title";
  const year = getYear(
    details?.release_date || rawData?.Released || rawData?.Year,
  );
  const ratingValue = details?.vote_average || Number(rawData?.imdbRating || 0);
  const rating = ratingValue ? Number(ratingValue).toFixed(1) : "N/A";
  const overview =
    details?.overview || rawData?.Plot || "No description available.";
  const posterSrc = resolvePosterSrc(details);

  const detailRows = Object.entries(rawData)
    .map(([key, value]) => {
      return `
        <div class="movie-data-key">${escapeHtml(formatDetailKey(key))}</div>
        <div class="movie-data-value">${formatDetailValueHtml(value)}</div>
      `;
    })
    .join("");

  movieModalBody.innerHTML = `
    <div>
      ${
        posterSrc
          ? `<img class="movie-modal-poster" src="${escapeHtml(posterSrc)}" alt="${escapeHtml(title)}" />`
          : `<div class="movie-modal-poster no-poster"><span>🎬</span><span>No Poster</span></div>`
      }
    </div>
    <div>
      <h2 class="movie-modal-heading" id="movie-modal-title">${escapeHtml(title)}</h2>
      <div class="movie-modal-summary">
        <span>Year: ${escapeHtml(year)}</span>
        <span>Rating: ⭐ ${escapeHtml(rating)}</span>
      </div>
      <p class="movie-modal-overview">${escapeHtml(overview)}</p>
      <div class="movie-data-list">${detailRows}</div>
    </div>
  `;
}

async function openMovieModal(movie) {
  openMovieModalShell();

  try {
    const details = await getMovieDetails(movie.id);
    renderMovieModal(details);
  } catch (error) {
    console.error("Movie details error:", error);
    if (movieModalBody) {
      movieModalBody.innerHTML = `<p>Failed to load movie details. Please try again.</p>`;
    }
  }
}

// ===== BOOT =====
init();
