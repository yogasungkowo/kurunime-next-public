<div align="center">

# 🎬 KURUNIME NEXT

### All-in-One Asian Pop Culture & Entertainment Streaming Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Turbopack](https://img.shields.io/badge/Bundler-Turbopack-orange?style=for-the-badge)](https://turbo.build/pack)
[![Cloudflare Turnstile](https://img.shields.io/badge/Security-Cloudflare_Turnstile-F38020?style=for-the-badge&logo=cloudflare)](https://developers.cloudflare.com/turnstile/)

<p align="center">
  A blazing-fast, modern streaming and reading web application uniting <b>Anime</b>, <b>Movies & TV Series</b>, <b>Manga & Manhwa</b>, and <b>Short Dramas</b> with sub-second page transitions, dark cinematic aesthetics, and airtight bot defense.
</p>

[Explore Features](#-key-features) •
[Architecture](#-architecture--microservices) •
[Quickstart](#-getting-started) •
[Configuration](#-environment-variables) •
[Folder Structure](#-folder-structure)

</div>

---

## 🌟 Key Features

### 1. 📺 Unified Multi-Media Streaming Hub
- **Anime Streaming**: Ongoing series, completed classics, comprehensive episode playlists, and daily release schedules (*Jadwal Rilis*).
- **Movies & Box Office Series**: Curated trending hero carousels, genre taxonomy filters, and paginated catalogs powered by high-throughput Rust microservices.
- **Manga & Webtoons**: Fast, distraction-free vertical chapter reader with chapter navigation and bookmarking.
- **Short Dramas (ReelShort)**: Dedicated vertical series section optimized for mobile-first storytelling.

### 2. ⚡ Modern Architecture & Performance
- Built on **Next.js 16 (App Router)** utilizing **Turbopack** for instant Hot Module Replacement and optimized compilation.
- Hybrid data fetching utilizing **Incremental Static Regeneration (ISR)** for high-traffic catalog pages and on-demand Server-Side Rendering (SSR) for dynamic streams.
- Resilient client and server error boundaries with graceful offline fallbacks.

### 3. 🛡️ Zero-Exposure Cloudflare Turnstile Protection
- **No Client-Side Key Leakage**: Site keys and secret keys are strictly isolated to the server environment without `NEXT_PUBLIC_` prefixes.
- **Dynamic Cryptographic Handshake**: The client retrieves an ephemeral XOR-masked challenge payload with a randomized nonce over `/api/turnstile/challenge`. The raw site key is never exposed in plain text in DevTools Network tab, static JS chunks, or DOM attributes.
- **Explicit DOM-Free Rendering**: Mounts via Turnstile explicit mode, completely omitting identifying `data-sitekey` attributes from HTML.
- **Cryptographic Clearance**: Issues a signed HMAC session cookie (`httpOnly`, `sameSite: lax`, 24h validity) to verify legitimate users without intrusive repeated challenges.

### 4. 🎨 Cinematic Dark UI/UX
- Immersive dark aesthetic with glowing crimson and amber accents, tailored for video and comic consumption.
- **Universal Command Palette (`⌘K` / `Ctrl+K`)**: Cross-category search across Anime, Movies, Comics, and Dramas in real time.
- **Zero Layout Shift History & Bookmarks**: LocalStorage-persisted bookmarks and watch history drawers.
- **Saweria Creator Support**: Interactive overlay modal supporting QRIS donations for platform sustenance.

### 5. 📈 Production-Grade SEO & Web Vitals
- Complete **JSON-LD Schema (WebSite & Organization)** for search engine rich snippets.
- Dynamic OpenGraph and Twitter card generation per route.
- Automated `robots.txt` and `sitemap.xml` generators.
- Native Google Search Console site verification integration.

---

## 🏗 Architecture & Microservices

```
                        ┌────────────────────────┐
                        │   User / Web Browser   │
                        └───────────┬────────────┘
                                    │  HTTPS / CDN
                                    ▼
                     ┌──────────────────────────────┐
                     │    Kurunime Next Frontend    │
                     │  (Next.js 16 + Turbopack)    │
                     └──────────────┬───────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│  Anime API   │             │  Movie API   │             │  Manga API   │
│ Scraper Svcs │             │  Rust Axum   │             │ Scraper Svcs │
└──────────────┘             └──────────────┘             └──────────────┘
                                    │
                                    ▼
                             ┌──────────────┐
                             │  Drama API   │
                             │  Rust Axum   │
                             └──────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher (tested on `v20` and `v26`)
- **Package Manager**: [`pnpm`](https://pnpm.io/) (recommended: `pnpm@9` or `pnpm@12`), `npm`, or `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/kurunime-next.git
cd kurunime-next
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Configure Environment Variables
Copy the `.env.example` template to `.env.local`:
```bash
cp .env.example .env.local
```
*(Refer to the [Environment Variables](#-environment-variables) section below to adjust API endpoints and keys).*

### 4. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
# Compile and optimize for production
pnpm build

# Start production server
pnpm start
```
*Alternatively, you can manage the application with PM2 using the included `ecosystem.config.js`:*
```bash
pm2 start ecosystem.config.js
```

---

## 🔐 Environment Variables

| Variable | Required | Default / Example | Description |
| :--- | :---: | :--- | :--- |
| `MOVIE_API_URL` | Yes | `http://localhost:3004/v1/api` | Rust Axum Movie backend endpoint (server-side) |
| `NEXT_PUBLIC_MOVIE_API_URL` | Yes | `http://localhost:3004/v1/api` | Rust Axum Movie backend endpoint (client-side) |
| `ANIME_API_URL` | Yes | `https://anime-api.prasunk.my.id/otakudesu` | Anime scraper backend API endpoint |
| `NEXT_PUBLIC_ANIME_API_URL` | Yes | `https://anime-api.prasunk.my.id/otakudesu` | Anime scraper client-side endpoint |
| `MANGA_API_URL` | Yes | `https://manga-api.prasunk.my.id` | Manga/Comic scraper backend API endpoint |
| `NEXT_PUBLIC_MANGA_API_URL` | Yes | `https://manga-api.prasunk.my.id` | Manga scraper client-side endpoint |
| `DRAMA_API_URL` | Optional | `http://localhost:8080` | Short Drama Rust Axum backend |
| `NEXT_PUBLIC_SITE_URL` | Yes | `http://localhost:3000` | Canonical site base URL for SEO and sitemaps |
| `SAWERIA_STREAM_KEY` | Optional | `your_saweria_stream_key` | Stream key for Saweria QRIS overlay |
| `CLOUDFLARE_TURNSTILE_SITE_KEY` | Optional | `your_turnstile_site_key` | Cloudflare Turnstile Site Key (server-only) |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | Optional | `your_turnstile_secret_key`| Cloudflare Turnstile Secret Key (server-only) |
| `PORT` | Optional | `3000` | Web server listening port |
| `HOST` | Optional | `0.0.0.0` | Server host binding |

---

## 📁 Folder Structure

```
kurunime-next/
├── app/                        # Next.js App Router (Pages, Layouts, API Routes)
│   ├── anime/                  # Anime detail & video player views
│   ├── api/                    # Internal API routes (Proxy, Turnstile, Saweria)
│   ├── bookmark/               # User bookmark manager
│   ├── drama/                  # Short drama catalog & chapter viewer
│   ├── genre/                  # Genre taxonomies
│   ├── jadwal/                 # Anime daily release calendar
│   ├── komik/                  # Manga reader & catalog
│   ├── list/                   # Ongoing & Completed anime listings
│   ├── movie/                  # Cinema, TV series & film catalogs
│   ├── search/                 # Dedicated search result view
│   ├── layout.tsx              # Root HTML shell, JSON-LD, and security gates
│   └── page.tsx                # Cinematic Home landing page
├── components/                 # Reusable UI components & drawers
│   ├── BookmarkDrawer.tsx      # Slide-out bookmark manager
│   ├── HistoryDrawer.tsx       # Watch & reading history drawer
│   ├── Navbar.tsx              # Responsive navigation & mobile menu
│   ├── SearchModal.tsx         # Universal ⌘K command palette
│   ├── TurnstileGate.tsx       # Bot-protection modal gate
│   └── TurnstileWidget.tsx     # Explicit-render Turnstile component
├── lib/                        # Core utilities & API wrappers
│   ├── api/                    # Typed API clients (Anime, Movie, Drama, Comic)
│   ├── turnstile.ts            # Server-side challenge & HMAC signer
│   └── turnstile-crypto.ts     # Client-safe in-memory key reconstructor
├── public/                     # Static assets (Favicons, Logo, Manifest)
├── .env.example                # Documented configuration template
├── ecosystem.config.js         # PM2 production cluster configuration
├── next.config.ts              # Next.js configuration & image domains
├── package.json                # Project dependencies and scripts
└── tsconfig.json               # TypeScript strict configuration
```

---

## 🛡️ Security & Disclaimers

- This repository is published for **portfolio, educational, and showcase purposes**.
- **Content Disclaimer**: Kurunime Next does not host any video or image files directly on its web servers; all media is aggregated through external endpoints or embedded scrapers.
- All trademarks and copyrights belong to their respective owners.

---

<div align="center">
  <b>Designed & Developed with ❤️ for Asian Pop Culture Enthusiasts.</b>
</div>
