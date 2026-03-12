"use client";

import { useState, Fragment } from "react";
import { IMAGE_SIZES } from "@/lib/services/tmdb";
import { isFavorite, toggleFavorite } from "@/lib/services/favorites";
import { getYear } from "@/lib/utils/helpers";

/* Returns true only when the value is a real non-empty, non-"N/A" string */
function ok(val) {
  const s = String(val ?? "").trim();
  return s !== "" && s !== "N/A";
}

/* True when raw data looks like an OMDB response */
function isOmdb(raw) {
  return raw != null && typeof raw.Director !== "undefined";
}

const pillStyle = {
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  color: "var(--text-secondary)",
  fontSize: "0.85rem",
  fontWeight: "600",
  padding: "5px 14px",
  borderRadius: "20px",
};

function SectionHeading({ children }) {
  return (
    <h2
      style={{
        fontSize: "0.8rem",
        fontWeight: "700",
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "1px",
        marginBottom: "12px",
        borderBottom: "1px solid var(--border)",
        paddingBottom: "8px",
      }}
    >
      {children}
    </h2>
  );
}

function PeopleRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "8px",
        flexWrap: "wrap",
        alignItems: "baseline",
      }}
    >
      <span
        style={{
          color: "var(--text-muted)",
          fontWeight: "700",
          fontSize: "0.82rem",
          minWidth: "64px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
        {value}
      </span>
    </div>
  );
}

export default function MovieDetailClient({ movie, genres }) {
  const [isFav, setIsFav] = useState(() => isFavorite(movie.id));
  const raw = movie.raw || {};
  const omdb = isOmdb(raw);

  const handleFavClick = () => {
    const added = toggleFavorite(movie);
    setIsFav(added);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("favorites-changed", {
          detail: { movieId: movie.id, added },
        }),
      );
    }
  };

  const year = getYear(movie.release_date);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  /* ── Genre string ── */
  let genreString = "";
  if (omdb) {
    genreString = ok(raw.Genre) ? raw.Genre : "";
  } else {
    genreString = Array.isArray(raw.genres)
      ? raw.genres.map((g) => g.name).join(", ")
      : (movie.genre_ids || [])
          .map((id) => genres[id])
          .filter(Boolean)
          .join(", ");
  }

  /* ── Poster ── */
  const posterSrc = movie.poster_path
    ? movie.poster_path.startsWith("http")
      ? movie.poster_path
      : `${IMAGE_SIZES.poster}${movie.poster_path}`
    : null;

  /* ── Backdrop (TMDB only) ── */
  const backdropSrc =
    !omdb && raw.backdrop_path
      ? `${IMAGE_SIZES.backdrop}${raw.backdrop_path}`
      : null;

  /* ── Runtime ── */
  const runtime = omdb
    ? ok(raw.Runtime)
      ? raw.Runtime
      : ""
    : raw.runtime
      ? `${raw.runtime} min`
      : "";

  /* ── Multi-source ratings (OMDB) ── */
  const externalRatings = omdb && Array.isArray(raw.Ratings) ? raw.Ratings : [];

  /* ── Details table rows ── */
  const detailRows = [];
  if (omdb) {
    if (ok(raw.Released))
      detailRows.push({ label: "Released", value: raw.Released });
    if (ok(raw.Language))
      detailRows.push({ label: "Language", value: raw.Language });
    if (ok(raw.Country))
      detailRows.push({ label: "Country", value: raw.Country });
    if (ok(raw.Awards)) detailRows.push({ label: "Awards", value: raw.Awards });
    if (ok(raw.BoxOffice))
      detailRows.push({ label: "Box Office", value: raw.BoxOffice });
    if (ok(raw.Rated))
      detailRows.push({ label: "Content Rating", value: raw.Rated });
    if (ok(raw.imdbVotes))
      detailRows.push({ label: "IMDb Votes", value: raw.imdbVotes });
    if (ok(raw.imdbID))
      detailRows.push({ label: "IMDb ID", value: raw.imdbID });
    if (ok(raw.Metascore))
      detailRows.push({ label: "Metascore", value: `${raw.Metascore}/100` });
    if (ok(raw.DVD)) detailRows.push({ label: "DVD", value: raw.DVD });
    if (ok(raw.Production))
      detailRows.push({ label: "Production", value: raw.Production });
    if (ok(raw.Website))
      detailRows.push({ label: "Website", value: raw.Website });
    if (ok(raw.Type)) detailRows.push({ label: "Type", value: raw.Type });
  } else {
    if (movie.release_date)
      detailRows.push({
        label: "Release Date",
        value: new Date(movie.release_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      });
    if (ok(raw.status)) detailRows.push({ label: "Status", value: raw.status });
    if (raw.runtime)
      detailRows.push({ label: "Runtime", value: `${raw.runtime} min` });
    if (raw.budget > 0)
      detailRows.push({
        label: "Budget",
        value: `$${raw.budget.toLocaleString()}`,
      });
    if (raw.revenue > 0)
      detailRows.push({
        label: "Revenue",
        value: `$${raw.revenue.toLocaleString()}`,
      });
    if (raw.vote_count)
      detailRows.push({
        label: "Vote Count",
        value: raw.vote_count.toLocaleString(),
      });
    if (
      Array.isArray(raw.production_companies) &&
      raw.production_companies.length > 0
    )
      detailRows.push({
        label: "Production",
        value: raw.production_companies.map((c) => c.name).join(", "),
      });
    if (
      Array.isArray(raw.production_countries) &&
      raw.production_countries.length > 0
    )
      detailRows.push({
        label: "Countries",
        value: raw.production_countries.map((c) => c.name).join(", "),
      });
    if (Array.isArray(raw.spoken_languages) && raw.spoken_languages.length > 0)
      detailRows.push({
        label: "Languages",
        value: raw.spoken_languages
          .map((l) => l.english_name || l.name)
          .join(", "),
      });
  }

  return (
    <main className="main-content" style={{ paddingTop: "0" }}>
      {/* ── Backdrop banner (TMDB only) ── */}
      {backdropSrc && (
        <div
          style={{
            position: "relative",
            width: "100%",
            maxHeight: "340px",
            overflow: "hidden",
          }}
        >
          <img
            src={backdropSrc}
            alt=""
            style={{ width: "100%", objectFit: "cover", display: "block" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(0deg, var(--bg-primary) 0%, transparent 60%)",
            }}
          />
        </div>
      )}

      <div className="container" style={{ paddingTop: "32px" }}>
        {/* ── Back button ── */}
        <div style={{ marginBottom: "28px" }}>
          <a
            href="/"
            style={{
              color: "var(--accent)",
              fontSize: "0.9rem",
              fontWeight: "600",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ← Back to Movies
          </a>
        </div>

        {/* ── Main two-column layout ── */}
        <div className="detail-layout">
          {/* ── Left column: poster + fav + ratings ── */}
          <div className="detail-sidebar">
            {posterSrc ? (
              <img
                src={posterSrc}
                alt={movie.title}
                style={{
                  width: "100%",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  marginBottom: "16px",
                  boxShadow: "var(--shadow)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "2/3",
                  background:
                    "linear-gradient(135deg, var(--bg-secondary), var(--bg-card))",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem",
                  marginBottom: "16px",
                }}
              >
                🎬
              </div>
            )}

            {/* Favourite button */}
            <button
              onClick={handleFavClick}
              style={{
                width: "100%",
                padding: "12px 20px",
                background: isFav ? "var(--heart-bg)" : "var(--accent)",
                color: isFav ? "var(--heart)" : "white",
                border: isFav ? "1px solid rgba(255,64,129,0.3)" : "none",
                borderRadius: "var(--radius-md)",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "var(--transition)",
              }}
            >
              {isFav ? "❤️ Remove from Favorites" : "🤍 Add to Favorites"}
            </button>

            {/* Multi-source ratings block (OMDB) */}
            {externalRatings.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <SectionHeading>Ratings</SectionHeading>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {externalRatings.map((r) => (
                    <div
                      key={r.Source}
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        padding: "9px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--text-muted)",
                          lineHeight: "1.3",
                        }}
                      >
                        {r.Source === "Internet Movie Database"
                          ? "IMDb"
                          : r.Source}
                      </span>
                      <span
                        style={{
                          fontWeight: "700",
                          color: "var(--gold)",
                          fontSize: "0.9rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.Value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right column: all info ── */}
          <div className="detail-body">
            {/* Title */}
            <h1
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.8rem)",
                fontWeight: "800",
                marginBottom: "6px",
                letterSpacing: "-0.5px",
                lineHeight: "1.2",
              }}
            >
              {movie.title}
            </h1>

            {/* Tagline (TMDB) */}
            {!omdb && ok(raw.tagline) && (
              <p
                style={{
                  color: "var(--text-muted)",
                  fontStyle: "italic",
                  fontSize: "1rem",
                  marginBottom: "16px",
                }}
              >
                &ldquo;{raw.tagline}&rdquo;
              </p>
            )}

            {/* Meta pills */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "18px",
                alignItems: "center",
              }}
            >
              {year && <span style={pillStyle}>📅 {year}</span>}
              {rating !== "N/A" && (
                <span
                  style={{
                    ...pillStyle,
                    color: "var(--gold)",
                    borderColor: "rgba(255,215,0,0.2)",
                  }}
                >
                  ⭐ {rating}/10
                </span>
              )}
              {runtime && <span style={pillStyle}>🕐 {runtime}</span>}
              {omdb && ok(raw.Rated) && (
                <span
                  style={{
                    ...pillStyle,
                    background: "rgba(229,9,20,0.1)",
                    borderColor: "rgba(229,9,20,0.25)",
                    color: "var(--accent)",
                  }}
                >
                  {raw.Rated}
                </span>
              )}
            </div>

            {/* Genre tags */}
            {genreString && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "26px",
                }}
              >
                {genreString.split(", ").map((g) => (
                  <span
                    key={g}
                    style={{
                      background: "rgba(229,9,20,0.08)",
                      border: "1px solid rgba(229,9,20,0.2)",
                      color: "var(--text-secondary)",
                      fontSize: "0.78rem",
                      fontWeight: "600",
                      padding: "4px 12px",
                      borderRadius: "20px",
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Overview / Plot */}
            {movie.overview && (
              <section style={{ marginBottom: "28px" }}>
                <SectionHeading>Overview</SectionHeading>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    lineHeight: "1.85",
                    fontSize: "0.97rem",
                  }}
                >
                  {movie.overview}
                </p>
              </section>
            )}

            {/* People section (OMDB) */}
            {omdb && (ok(raw.Director) || ok(raw.Writer) || ok(raw.Actors)) && (
              <section style={{ marginBottom: "28px" }}>
                <SectionHeading>Cast &amp; Crew</SectionHeading>
                {ok(raw.Director) && (
                  <PeopleRow label="Director" value={raw.Director} />
                )}
                {ok(raw.Writer) && (
                  <PeopleRow label="Writer" value={raw.Writer} />
                )}
                {ok(raw.Actors) && (
                  <PeopleRow label="Actors" value={raw.Actors} />
                )}
              </section>
            )}

            {/* Details table */}
            {detailRows.length > 0 && (
              <section>
                <SectionHeading>Details</SectionHeading>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "max-content 1fr",
                    gap: "10px 24px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "20px",
                  }}
                >
                  {detailRows.map(({ label, value }) => (
                    <Fragment key={label}>
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontWeight: "700",
                          fontSize: "0.82rem",
                          paddingTop: "2px",
                          whiteSpace: "nowrap",
                          textTransform: "uppercase",
                          letterSpacing: "0.4px",
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          color: "var(--text-primary)",
                          fontSize: "0.9rem",
                          lineHeight: "1.55",
                        }}
                      >
                        {value}
                      </span>
                    </Fragment>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
