# Data Mining - Chess Puzzle Difficulty Classification

## Project Overview

A dataminig project that predicts chess puzzle difficulty (Easy / Medium / Hard / Expert) using machine learning, built with Next.js and deployed on Vercel.

## Features

- **Puzzle Difficulty Classification** - Upload or input chess puzzles and get instant difficulty predictions
- **Multiple ML Models** - Random Forest, Decision Tree, KNN, SVM comparisons
- **Interactive Dashboard** - Visualize predictions, feature importance, and model performance
- **Chess Puzzle Analysis** - Extract 15 features from FEN positions using python-chess
- **Association Rule Mining** - Discover frequent theme patterns using Apriori algorithm

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS, Shadcn/UI
- **Backend:** Prisma ORM, PostgreSQL
- **ML:** scikit-learn, pandas, python-chess
- **Deployment:** Vercel

## Project Structure

```
Data-Mining/
├── src/                 # Next.js source code
├── prisma/              # Database schema
├── db/                  # Database files
├── scripts/             # ML training scripts
├── tests/               # Test files
├── public/              # Static assets
├── package.json
├── vercel.json
└── next.config.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

```bash
cd Data-Mining
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Deployment

This project is configured for Vercel deployment. The `vercel.json` sets the root directory to `Data-Mining/`.

## Dataset

50,000 chess puzzles from [Lichess.org](https://lichess.org/) with difficulty ratings from 400 to 3100.

## Classification Categories

| Category | Rating Range |
|----------|--------------|
| Easy     | 0 - 1200     |
| Medium   | 1201 - 1600  |
| Hard     | 1601 - 2000  |
| Expert   | 2001+        |

## License

Educational project for Data Mining coursework.
