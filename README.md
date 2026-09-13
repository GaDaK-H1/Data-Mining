# Data-Mining-

Chess Puzzle Difficulty Classification — an IS-212 Data and Knowledge Mining course project.

Classifies 50,000 Lichess chess puzzles into four difficulty classes (Easy / Medium / Hard / Expert) using six machine learning classifiers, Apriori association rule mining, and feature importance analysis.

**Author:** Hein Htet Zaw (YKPT-22466)
**Institution:** University of Computer Studies, Yangon
**Course:** DATA AND KNOWLEDGE MINING (IS-212) — Dr. Hsu Myat Mo
**Academic Year:** 2025-2026, Semester IX

## Live Demo

[https://data-mining-one.vercel.app](https://data-mining-one.vercel.app)

## Results

| Model | Macro F1 | Accuracy |
|-------|----------|----------|
| Random Forest | **0.5824** | **62.08%** |
| Decision Tree | 0.5731 | 60.60% |
| RBF SVM | 0.5499 | 58.59% |
| KNN | 0.5306 | 56.71% |
| LinearSVC | 0.4700 | 53.90% |
| Dummy Baseline | 0.1346 | 36.83% |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI:** Tailwind CSS 4, shadcn/ui
- **Charts:** Recharts
- **Database:** SQLite via Prisma (boilerplate, not used by the page)
- **Runtime:** Bun
- **Deployment:** Vercel

## Dataset

50,000 puzzles from the [Lichess Open Database](https://database.lichess.org/#puzzles) with 11 columns including FEN, Moves, Rating, Themes, and metadata.

**Difficulty distribution:**
- Easy (<= 1200): 36.8%
- Medium (1201-1600): 23.9%
- Hard (1601-2000): 20.2%
- Expert (> 2000): 19.1%

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main page (all sections)
│   │   ├── layout.tsx        # Root layout
│   │   └── api/route.ts      # Hello world API
│   ├── components/ui/        # shadcn/ui components
│   └── lib/
│       ├── project-data.ts   # All project data & results
│       └── utils.ts          # cn() utility
├── public/downloads/         # Downloadable project files
├── prisma/                   # Schema (SQLite)
├── scripts/                  # Analysis scripts
├── upload/                   # Dataset & notebook
└── vercel.json               # Vercel config
```

## Self-Hosting

```bash
# Install dependencies
bun install

# Set up database
bun run db:generate
bun run db:push

# Start dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push to GitHub
2. Import repository on [vercel.com/new](https://vercel.com/new)
3. Set environment variable: `DATABASE_URL=file:./db/custom.db`
4. Deploy

## Downloadable Files

| File | Size | Description |
|------|------|-------------|
| `project.ipynb` | 31 KB | Jupyter notebook (35 cells) |
| `lichess_db_puzzle_sample.csv` | 8.9 MB | 50,000-row dataset |
| `ProjectBook_HeinHtetZaw_YKPT22466.docx` | 3.0 MB | Full project report |
| `website-source.zip` | 26.3 MB | Complete source code |

## Key Findings

- Random Forest achieved 4.3x improvement over the majority-class baseline on macro F1
- Top 3 features are metadata (RatingDeviation, NbPlays, Popularity) — not board state
- 72.6% of misclassifications are into adjacent difficulty classes
- With one-bin tolerance, accuracy reaches 89.8%
- All 42 strongest association rules lead to the Easy class via short-solution themes

## License

Academic project — for educational purposes only.
