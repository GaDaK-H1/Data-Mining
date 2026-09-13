# Chess Puzzle Difficulty Classification — Website Source

Source code for the project website that displays the results of the
**IS-212 Data and Knowledge Mining** project by Hein Htet Zaw (YKPT-22466).

## What's inside

- `src/` — Next.js 16 (App Router) source:
  - `src/app/page.tsx` — single-page site (11 sections)
  - `src/lib/project-data.ts` — REAL project metrics (extracted by running
    the notebook on the actual CSV; see `scripts/run_analysis.py`)
  - `src/components/ui/*` — shadcn/ui component set
- `public/downloads/` — the three downloadable project files
- `scripts/run_analysis.py` — re-runs the notebook on the real CSV
- Config: `package.json`, `tsconfig.json`, `next.config.ts`, etc.

## How to run it locally

```bash
npm install         # or: bun install
npm run dev         # or: bun run dev
# Open http://localhost:3000
```

## How to build for production

```bash
npm run build
npm start           # Default port: 3000
```

## How to deploy / self-host

### Option A — Vercel (easiest)
1. Push this folder to a new GitHub repository.
2. Go to https://vercel.com, "Add New -> Project", import the repository.
3. Vercel auto-detects Next.js. Accept defaults and click "Deploy".

### Option B — Netlify
1. Push to GitHub.
2. Go to https://app.netlify.com -> "Add new site -> Import an existing project".
3. Build command: `npm run build`. Publish directory: `.next`.

### Option C — Any Node host (Render, Railway, Fly.io, a VPS)
1. Push the repository to GitHub/GitLab.
2. Connect the host to the repo, set build command `npm run build` and start
   command `npm start`. Expose port 3000.

### Option D — Static export (GitHub Pages, S3, Cloudflare Pages, Nginx)
1. In `next.config.ts`, add `output: "export"` to the config object.
2. Run `npm run build`. This produces an `out/` folder with a fully static site.
3. Copy the contents of `out/` to your static host's web root.

## Project background

- **Course**: IS-212 Data and Knowledge Mining
- **Institution**: University of Computer Studies, Yangon (2025-2026)
- **Dataset**: 50,000-puzzle sample from the Lichess Open Database
- **Best model**: Random Forest — 62.08% accuracy, 0.5824 macro F1 on the
  10,000-row held-out test set (4.3x over the majority-class baseline).

All numbers shown across the site (top themes, correlation matrix, difficulty
distribution, test-set metrics, confusion matrix, feature importances, leakage
audit) are REAL — extracted by running the notebook analysis on the
actual 50,000-row CSV. Run `python scripts/run_analysis.py` to regenerate
them after any dataset change.
