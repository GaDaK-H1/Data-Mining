# Chess Puzzle Difficulty Classification — Website Source

This is the source code for the project website that displays the results of the
**IS-212 Data Mining** project by Hein Htet Zaw (YKPT-22466).

## What's inside

- `src/` — Next.js 16 (App Router) source: the single-page site (`src/app/page.tsx`)
  plus the project data module (`src/lib/project-data.ts`) and shadcn/ui components.
- `public/downloads/` — the three downloadable project files
  (`project.ipynb`, `lichess_db_puzzle_sample.csv`, `ProjectBook_HeinHtetZaw_YKPT22466.docx`).
- Config files: `package.json`, `tsconfig.json`, `next.config.ts`,
  `postcss.config.mjs`, `tailwind.config.ts`, `eslint.config.mjs`, `components.json`.

## How to run it locally

You need Node.js 18+ (or Bun) installed.

```bash
# 1. Install dependencies
npm install         # or: bun install

# 2. Start the dev server
npm run dev         # or: bun run dev
# Open http://localhost:3000
```

## How to build for production

```bash
# Production build
npm run build

# Start the production server
npm start
# Default port: 3000
```

## How to deploy / self-host

### Option A — Vercel (easiest)
1. Push this folder to a new GitHub repository.
2. Go to https://vercel.com, "Add New -> Project", import the repository.
3. Vercel auto-detects Next.js. Accept defaults and click "Deploy".

### Option B — Netlify
1. Push to GitHub (as above).
2. Go to https://app.netlify.com -> "Add new site -> Import an existing project".
3. Build command: `npm run build`. Publish directory: `.next`.

### Option C — Any Node host (Render, Railway, Fly.io, a VPS)
1. Push the repository to GitHub/GitLab.
2. Connect the host to the repo, set build command `npm run build` and start command `npm start`.
3. Expose port 3000.

### Option D — Static export (for GitHub Pages, S3, Cloudflare Pages, Nginx)
1. In `next.config.ts`, add `output: "export"` to the config object.
2. Run `npm run build`. This produces an `out/` folder with a fully static site.
3. Copy the contents of `out/` to your static host's web root.

> Note: with `output: "export"`, the three downloadable files in `public/downloads/`
> are automatically copied into the static `out/` folder — visitors can still download
> them from any static host.

## Project background

- **Course**: IS-212 Data and Knowledge Mining
- **Institution**: University of Computer Studies, Yangon (2025-2026)
- **Dataset**: 50,000-puzzle sample from the Lichess Open Database
- **Goal**: Predict puzzle difficulty (Easy / Medium / Hard / Expert) from board features
  and metadata without using the rating value itself, plus descriptive Apriori mining.
- **Best model**: Random Forest — 62.83% accuracy, 0.5909 macro F1 on the 10,000-row
  held-out test set (4.4x over the majority-class baseline).

See the live website or `ProjectBook_HeinHtetZaw_YKPT22466.docx` for the full write-up.
