import Link from "next/link";

export const metadata = {
  title: "Movie Not Found - MoodMatch",
  description:
    "This movie could not be found. Please try searching for another movie.",
};

export default function NotFound() {
  return (
    <main className="main-content">
      <div className="container">
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
          }}
        >
          <div className="empty-icon">🎥</div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "800",
              marginBottom: "16px",
              background: "linear-gradient(135deg, #fff, #ccc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Movie Not Found
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
            The movie you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              background: "var(--accent)",
              color: "white",
              borderRadius: "var(--radius-md)",
              fontWeight: "600",
              transition: "var(--transition)",
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
