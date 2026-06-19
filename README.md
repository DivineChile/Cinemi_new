# 🎬 Cinemi

Cinemi is a high-fidelity, ultra-responsive anime streaming web application built with React, styled with Tailwind CSS, and optimized with a serverless Cloudflare Workers caching layer.

The entire platform is built for speed, running entirely on Cloudflare's global edge network (Cloudflare Pages + Workers) to deliver sub-10ms metadata caching and smooth, zero-lag browsing interfaces.

## 🏗️ System Architecture

Cinemi bypasses heavy backend infrastructures by leveraging a proxy-caching model at the network edge:

```text
[ Cinemi React Frontend ] (Hosted on Cloudflare Pages)
            │
            │ (Requests via VITE_PROXY_API_URL)
            ▼
[ Cloudflare Workers Edge Proxy ]
            │
            ├───► [ Cache HIT ] ───► (Instant sub-10ms edge response)
            └───► [ Cache MISS ] ───► [ Upstream API ] ───► (Fetches, saves to edge, returns data)
```

## ⚡ Core Features

- **Built-in Edge Caching:** Leverages Cloudflare's native `caches.default` engine to store API collections and streaming mappings globally for 10 minutes.
- **Fluid Layout Architecture:** Eliminates annoying mobile horizontal overflow scrollbars by using dynamic aspect ratios (`aspect-[3/2]`) instead of rigid pixel frames.
- **Cinematic Micro-Interactions:** Component tracks leverage Tailwind `group-hover` utility layers to handle independent inner node image scale zooms and interactive slide-in overlay panels.
- **High-Performance Carousel Rails:** Embla Carousel integration with `dragFree: true` for mobile touch-momentum velocity swiping and smart responsive desktop navigation arrows.
- **Content Filtering Guard:** Pre-render filtering routines process API responses instantly to eliminate explicit categories (`Hentai`) prior to rendering elements.
- **Smart Asset Pipeline:** Employs progressive native lazy loading weights (`index === 0 ? 'eager' : 'lazy'`) to drastically optimize Largest Contentful Paint (LCP) performance scores.

## 🔑 Environment Variables Setup

Create a `.env` file in the root directory of your React folder to connect your development server to the edge proxy engine:

```env
VITE_PROXY_API_URL=https://workers.dev
```

> ⚠️ **Security Warning**: Do not commit your `.env` file to public source control. Ensure it is actively blocked inside your `.gitignore` configuration boundaries.

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com
cd cinemi
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development environment

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to explore the layout.

## 🚀 Deployment to Cloudflare Pages

Cinemi is fully configured for deployment on **Cloudflare Pages**:

1. Connect your GitHub repository inside your Cloudflare Dashboard under **Workers & Pages**.
2. Select the **Vite** preset framework option.
3. Configure the build parameters:
   - **Build Command:** `npm run build`
   - **Build Output Directory:** `dist`
4. Inject your `VITE_PROXY_API_URL` under the project environment configuration sidebar before initiating the deployment run.

## 🗂️ Component Blueprint Dictionary

- **`HeroCarousel`**: Large top banner carousel with dynamic text asset fading and an active progress bar layout.
- **`CarouselRow`**: Universal layout rail holding automated item loading skeleton cards, dynamic filtering arrays, and independent desktop boundary arrows.
- **`ContentCard`**: Cinematic poster block featuring inner link structure safety boundaries, text truncation guards, and play overlay buttons.
- **`GenreCard`**: Aspect-ratio locked fluid container displaying category backdrop images with micro-zoom triggers.

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).

## ⚠️ Disclaimer

All content on this platform is not self-hosted. All materials and resources are sourced from free, third-party libraries.
