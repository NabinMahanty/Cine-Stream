# 🎬 MoodMatch - Next.js 15 SSR Movie App

> **A Next.js 15 migration of Cine-Stream** featuring Server-Side Rendering, dynamic SEO metadata, and production-ready architecture.

![Status](https://img.shields.io/badge/status-completed-green?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![License](https://img.shields.io/badge/license-ISC-blue?style=flat-square)

---

## 🚀 Quick Start (2 Minutes)

### 1️⃣ Get API Key

Get your free TMDB API key: https://www.themoviedb.org/settings/api

### 2️⃣ Configure App

```bash
# Edit .env.local and add your key
NEXT_PUBLIC_TMDB_API_KEY=your_free_api_key
```

### 3️⃣ Run App

```bash
npm install
npm run dev
```

**Open:** http://localhost:3000 ✨

---

## 📖 Documentation

| Document                             | Purpose                              |
| ------------------------------------ | ------------------------------------ |
| [SETUP.md](./SETUP.md)               | ⚡ Quick start guide                 |
| [MIGRATION.md](./MIGRATION.md)       | 🔧 Technical details                 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 🏗️ Data flow & architecture          |
| [CHECKLIST.md](./CHECKLIST.md)       | ✅ Complete implementation checklist |

---

## ✨ Key Features

### Level 1: Beginner ✅

- [x] Next.js 15 project with App Router
- [x] Responsive UI with dark theme
- [x] File-based routing: `/`, `/favorites`, `/movie/[id]`

### Level 2: Intermediate ✅

- [x] Server Components for secure data fetching
- [x] Client Components for interactive features
- [x] Debounced search (500ms)
- [x] Real-time favorites with LocalStorage

### Level 3: Advanced ✅

- [x] Dynamic SSR routes: `/movie/[id]`
- [x] Dynamic metadata generation (`generateMetadata`)
- [x] SEO optimization with unique titles & descriptions
- [x] OpenGraph metadata for social sharing

---

## 🎯 What Changed

### Before (Vite - CSR)

```html
❌ Google sees:
<html>
  <head>
    <title>MoodMatch</title>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

### After (Next.js - SSR)

```html
✅ Google sees (for /movie/550):
<html>
  <head>
    <title>Inception - MoodMatch</title>
    <meta name="description" content="A thief who steals..." />
    <meta property="og:image" content="poster.jpg" />
  </head>
  <body>
    <!-- Full HTML content -->
  </body>
</html>
```

**Result:** ✅ Full SEO support!

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.js                 # Home (SSR + Client)
│   ├── layout.js               # Root layout
│   ├── globals.css             # All styles
│   ├── favorites/page.js       # Favorites page
│   └── movie/[id]/page.js      # Dynamic SSR + metadata ⭐
├── components/
│   ├── Navbar.js               # Navigation
│   ├── SearchBar.js            # Search (client)
│   ├── MovieCard.js            # Movie card (client)
│   └── MovieGrid.js            # Grid layout
└── lib/
    ├── services/tmdb.js        # TMDB API (server-side)
    └── utils/helpers.js        # Utilities
```

---

## 🔑 Setup Instructions

### Step 1: Get TMDB API Key (Free)

1. Visit: https://www.themoviedb.org/settings/api
2. Sign up for free account
3. Generate API key

### Step 2: Configure Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here
```

### Step 3: Run App

```bash
npm install
npm run dev
```

Visit: **http://localhost:3000**

---

## 🧪 Features to Test

### Home Page (`/`)

- ✅ Popular movies load on page
- ✅ Search works with debounce
- ✅ Favorite button toggles

### Movie Detail (`/movie/550`)

- ✅ Page shows Inception details
- ✅ Check page source → See title & description
- ✅ Try different movie IDs

### Favorites (`/favorites`)

- ✅ Saved movies display
- ✅ Real-time updates
- ✅ Empty state shows correctly

---

## 🏆 Architecture Highlights

**Server Components (No 'use client')**

- Initial page load with SSR
- Popular movies fetching
- Movie details fetching

**Client Components ('use client')**

- SearchBar (input state)
- MovieCard (favorite button)
- Navbar (active state)

**Result:** ✅ Optimal performance + security

---

## 🔐 Security

- [x] API keys NEVER exposed to browser
- [x] All TMDB calls via server-side code
- [x] Environment variables properly configured
- [x] Rate limiting on server

---

## 📊 Tech Stack

- **Next.js 15** - React framework with SSR
- **React 19** - UI library
- **TMDB API** - Movie database
- **CSS (Custom)** - Dark theme (no Tailwind)

---

## 🚀 Deploy to Vercel

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to vercel.com → New Project
# 3. Connect your GitHub repo
# 4. Add env var: NEXT_PUBLIC_TMDB_API_KEY
# 5. Deploy! 🎉
```

---

## 📚 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TMDB API](https://developer.themoviedb.org/)

---

## ❓ Troubleshooting

**Q: Movies don't show?**

- Check `.env.local` has your API key
- Restart dev server

**Q: Search not working?**

- Clear browser cache
- Check F12 Console for errors

**Q: SEO not visible?**

- Right-click → View Page Source
- Should see full HTML with metadata

---

## 🎉 Ready!

```bash
# 1. Add API key to .env.local
# 2. npm install && npm run dev
# 3. Visit http://localhost:3000
# 4. Enjoy! 🎬
```

---

**Made with ❤️ for developers learning Next.js 15**
