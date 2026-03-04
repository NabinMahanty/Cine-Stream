# Cine-Stream

AI-powered movie discovery and mood-based recommendations.

## Description

Cine-Stream (a.k.a. Movie Mood Matcher) helps you discover movies using The Movie Database (TMDB) and simple mood-matching logic.

## Features

- Browse movies from TMDB
- Save favorites locally
- Mood-driven discovery using simple heuristics

## Quick start

Prerequisites: Node.js (18+ recommended) and a package manager (pnpm recommended).

Install dependencies:

```bash
pnpm install
```

Run the dev server:

```bash
pnpm dev
# or with npm: npm run dev
```

Build for production:

```bash
pnpm build
```

Preview production build:

```bash
pnpm preview
```

## Project structure (high level)

- `index.html` — app entry
- `src/main.js` — application bootstrap
- `src/components/MovieCard.js` — UI component for movie cards
- `src/services/tmdb.js` — TMDB API helper
- `src/services/favorites.js` — favorites handling
- `src/services/llm.js` — (optional) local LLM helper
- `src/styles/main.css` — styles

## Notes

- The project uses Vite for development (`vite` is in devDependencies). See `package.json` scripts for available commands.
- Use your TMDB API key in the appropriate service file when integrating live API access.

## License

MIT-style (check `package.json` for license field)
