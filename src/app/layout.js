import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "MoodMatch - Movie Discovery",
  description:
    "Discover your next favorite movie with MoodMatch - AI-powered movie discovery powered by TMDB",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
