# Organic Editorial — Personal Homepage

> A premium, magazine-style personal portfolio & curation platform built with a focus on editorial aesthetics and liquid interactions.

[![Deploy to GitHub Pages](https://github.com/LaplaceYoung/myself/actions/workflows/deploy.yml/badge.svg)](https://github.com/LaplaceYoung/myself/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 Design Philosophy

This project moves away from generic "AI-generated" aesthetics (monotone backgrounds, standard rounded cards) to embrace an **"Organic Editorial"** vibe:

- **Surface & Texture**: A custom `#F7F5F0` parchment background with a subtle SVG noise overlay for a tactile, paper-like feel.
- **Typography Tension**: High-contrast pairing of elegant serifs (`Playfair Display`) and clean, modern sans-serifs (`Plus Jakarta Sans`).
- **Liquid Interactivity**: Custom smooth-scrolling (`Lenis`), parallax reveals, and physics-based interactions powered by `Framer Motion`.

---

## 🛠 Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: CSS Modules (Vanilla CSS for maximum control)
- **Animation**: Framer Motion
- **Scrolling**: Studio Freight Lenis
- **Bundler**: Vite
- **CMS**: Local Node.js Meta-Scraper (Admin OS)
- **Deployment**: GitHub Actions

---

## 🖥 The "Local CMS" Workflow (Admin OS)

Since GitHub Pages is a static host, this project utilizes a **Remote Cloud + Local Management** hybrid architecture.

### 1. Local Management

Run the local Admin OS to manage your writings and curations:

```bash
npm run admin
```

The Admin Panel features:

- **Intelligent Scraping**: Auto-fetch metadata and high-definition covers from Douban, TMDB, and Google Books.
- **Markdown Studio**: A robust split-pane Markdown editor with direct drag-and-drop/paste image upload support.
- **Content Persistence**: Automatically updates `src/data/content.json` and saves assets to `public/uploads/`.

### 2. Live Sync

1. Edit content locally via Admin OS.
2. Commit and push: `git add . && git commit -m "update logs" && git push`.
3. GitHub Actions will automatically rebuild the site and deploy it to GitHub Pages.

---

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
# Start both Vite dev server and Admin backend
npm run admin
```

### Static Build

```bash
npm run build
```

---

## 🏗 Directory Structure

```text
├── .github/workflows/    # CI/CD Pipeline
├── scripts/              # CMS Backend & Scrapers
├── src/
│   ├── components/       # Editorial UI Components
│   ├── data/             # Content JSON (The Database)
│   ├── pages/            # Route Views
│   └── main.tsx          # App Entry
├── public/
│   └── uploads/          # Locally managed image assets
└── gemini.md             # AI Memory & Dev Logs (Internal)
```

---

## ⚖️ License

Distributed under the MIT License. Styled with ❤️ for the open-web.
