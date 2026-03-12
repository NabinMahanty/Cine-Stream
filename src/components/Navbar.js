"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [isHome, setIsHome] = useState(true);

  useEffect(() => {
    setIsHome(pathname === "/");
  }, [pathname]);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="nav-logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">MoodMatch</span>
        </Link>
        <div className="nav-links">
          <Link
            href="/"
            className={`nav-link ${isHome ? "active" : ""}`}
            data-route="home"
          >
            Home
          </Link>
          <Link
            href="/favorites"
            className={`nav-link ${!isHome ? "active" : ""}`}
            data-route="favorites"
          >
            ❤️ Favorites
          </Link>
        </div>
      </div>
    </nav>
  );
}
