"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Trophy,
  RefreshCw,
  Eye,
  Crown,
  Brain,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SamplePuzzle, TreeNode, ScalerExport } from "@/lib/decision-tree";
import { predictWithTree, extractFenFeatures } from "@/lib/decision-tree";

const CLASS_COLORS: Record<string, string> = {
  Easy: "#10b981",
  Medium: "#f59e0b",
  Hard: "#f97316",
  Expert: "#ef4444",
};

const CLASS_RANGES: Record<string, string> = {
  Easy: "≤ 1200",
  Medium: "1201 - 1600",
  Hard: "1601 - 2000",
  Expert: "> 2000",
};

const CLASSES = ["Easy", "Medium", "Hard", "Expert"];

interface Props {
  puzzles: SamplePuzzle[];
  tree: TreeNode;
  scaler: ScalerExport;
}

export function TryPuzzle({ puzzles, tree, scaler }: Props) {
  // Pick a random puzzle on first render and on demand
  const [puzzleIdx, setPuzzleIdx] = useState(() => Math.floor(Math.random() * puzzles.length));
  const puzzle = puzzles[puzzleIdx];

  const [userGuess, setUserGuess] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  // Run the decision tree on the puzzle's features (in-browser)
  const modelPrediction = useMemo(() => {
    if (!puzzle) return null;
    // Build the feature vector for this puzzle.
    const fenFeatures = extractFenFeatures(puzzle.fen);
    const themeList = puzzle.themes ? puzzle.themes.split(/\s+/) : [];
    const featureVector: Record<string, number> = {
      NbPlays: puzzle.nbPlays,
      RatingDeviation: puzzle.ratingDeviation,
      Popularity: puzzle.popularity,
      ...fenFeatures,
    };
    // Set all known themes to 1 (default 0 for unknown).
    Object.keys(featureVector).forEach((k) => {
      if (themeList.includes(k)) featureVector[k] = 1;
    });
    // Add the theme flags that are not already in the vector
    const allThemeFlags = new Set<string>([
      "mate", "mateIn1", "mateIn2", "mateIn3", "endgame", "middlegame",
      "short", "long", "oneMove", "fork", "crushing", "advantage",
      "quietMove", "discoveredAttack", "defensiveMove", "kingsideAttack",
      "pin", "skewer", "backRankMate", " zugZwang", "veryLong",
      "master", "masterVsMaster", "attacking", "sacrifice", "xRayAttack",
      "Passed pawn" /* not real */,
    ]);
    // For the tree to walk correctly, every theme flag that exists in the
    // tree's feature set must be in the feature vector (default 0).
    // The full set is the 73 themes from MultiLabelBinarizer — we approximate
    // by adding all themes that appear in any puzzle's theme list as keys=0,
    // then setting the ones this puzzle has to 1.
    puzzles.forEach((p) => {
      if (p.themes) {
        p.themes.split(/\s+/).forEach((t) => {
          if (!(t in featureVector)) featureVector[t] = 0;
        });
      }
    });
    // Now set this puzzle's themes to 1
    themeList.forEach((t) => {
      featureVector[t] = 1;
    });
    return predictWithTree(tree, scaler, featureVector);
  }, [puzzle, puzzles, tree, scaler]);

  const nextPuzzle = useCallback(() => {
    let next = Math.floor(Math.random() * puzzles.length);
    if (next === puzzleIdx) next = (next + 1) % puzzles.length;
    setPuzzleIdx(next);
    setUserGuess(null);
    setRevealed(false);
  }, [puzzles.length, puzzleIdx]);

  const guess = (cls: string) => {
    if (revealed) return;
    setUserGuess(cls);
    setRevealed(true);
    const correct = cls === puzzle.difficulty;
    setStats((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  };

  const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;

  if (!puzzle) {
    return (
      <section id="try" className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center text-muted-foreground">
          Loading puzzles…
        </div>
      </section>
    );
  }

  const userCorrect = userGuess === puzzle.difficulty;
  const modelCorrect = modelPrediction?.prediction === puzzle.difficulty;

  return (
    <section id="try" className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <div className="mb-2 text-sm font-medium uppercase tracking-wider text-emerald-600">
            Game
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Try a Puzzle</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            A random puzzle is shown below. Try to guess its difficulty class from the position
            and themes alone — then see how your guess compares to the actual rating, the
            Decision Tree's prediction, and your running score.
          </p>
        </div>

        {/* Stats bar */}
        <Card className="mb-6">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <div className="text-sm">
                <span className="font-semibold">{stats.correct}</span>
                <span className="text-muted-foreground"> / {stats.total} correct</span>
                {stats.total > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({accuracy.toFixed(0)}% accuracy)
                  </span>
                )}
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={nextPuzzle}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> New puzzle
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Puzzle card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="font-mono text-base">{puzzle.puzzleId}</CardTitle>
                  <CardDescription className="mt-1">
                    {revealed ? (
                      <span>
                        Rating: <span className="font-mono font-semibold">{puzzle.rating}</span> ·{" "}
                        <span style={{ color: CLASS_COLORS[puzzle.difficulty] }}>
                          {puzzle.difficulty} ({CLASS_RANGES[puzzle.difficulty]})
                        </span>
                      </span>
                    ) : (
                      "Guess the difficulty from the position and themes"
                    )}
                  </CardDescription>
                </div>
                {revealed && (
                  <Badge variant="outline" className="font-mono text-xs">
                    RdDev {puzzle.ratingDeviation} · Pop {puzzle.popularity} · {puzzle.nbPlays.toLocaleString()} plays
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* FEN display */}
              <div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Board position (FEN)
                </div>
                <code className="block rounded-md bg-stone-900 p-3 font-mono text-xs text-stone-100 break-all">
                  {puzzle.fen}
                </code>
                <div className="mt-2 text-xs text-muted-foreground">
                  Paste this FEN into a chess viewer (e.g. lichess.org/analysis) to see the position.
                </div>
              </div>

              {/* Themes */}
              <div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Themes
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {puzzle.themes.split(/\s+/).map((t) => (
                    <Badge key={t} variant="secondary" className="font-mono text-[10px]">{t}</Badge>
                  ))}
                </div>
              </div>

              {/* Reveal rating hint */}
              {!revealed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRevealed(true)}
                  className="w-full text-muted-foreground"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" /> Reveal rating without guessing
                </Button>
              )}

              {revealed && (
                <Button asChild variant="outline" size="sm" className="w-full">
                  <a href={puzzle.gameUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View full puzzle on Lichess
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Guess panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="h-5 w-5 text-emerald-600" /> Your Guess
              </CardTitle>
              <CardDescription>
                {revealed ? "Result" : "Pick the class you think this puzzle belongs to"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {CLASSES.map((c) => {
                const isGuessed = userGuess === c;
                const isActual = c === puzzle.difficulty;
                const isModelPick = modelPrediction?.prediction === c;
                let style = "border-border bg-background hover:border-emerald-300";
                if (revealed) {
                  if (isActual) style = "border-emerald-500 bg-emerald-50";
                  else if (isGuessed) style = "border-red-400 bg-red-50";
                  else style = "border-border bg-background opacity-60";
                }
                return (
                  <button
                    key={c}
                    onClick={() => guess(c)}
                    disabled={revealed}
                    className={`flex w-full items-center justify-between rounded-md border p-3 text-left transition-all ${style} ${
                      !revealed ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ background: CLASS_COLORS[c] }}
                      />
                      <span className="font-medium">{c}</span>
                      <span className="text-xs text-muted-foreground">({CLASS_RANGES[c]})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isModelPick && (
                        <Badge variant="outline" className="border-amber-400 text-amber-700 text-[10px]">
                          <Brain className="mr-1 h-2.5 w-2.5" /> Tree
                        </Badge>
                      )}
                      {revealed && isActual && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      )}
                      {revealed && isGuessed && !isActual && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Result summary */}
              {revealed && (
                <div className="mt-4 space-y-2 rounded-md border border-border bg-muted/50 p-4 text-sm">
                  <div className="flex items-center gap-2">
                    {userCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {userCorrect ? "Correct!" : `Off by one bin`}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    You guessed <span style={{ color: CLASS_COLORS[userGuess || ""] }} className="font-medium">{userGuess}</span>
                    {" · "}Tree predicted <span style={{ color: CLASS_COLORS[modelPrediction?.prediction || ""] }} className="font-medium">{modelPrediction?.prediction}</span>
                    {" · "}Actual <span style={{ color: CLASS_COLORS[puzzle.difficulty] }} className="font-medium">{puzzle.difficulty}</span>
                  </div>
                  {modelCorrect !== userCorrect && (
                    <div className="flex items-start gap-2 pt-2 text-xs">
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                      <span className="text-muted-foreground">
                        {modelCorrect && !userCorrect
                          ? "The Decision Tree got this one right while you missed — the puzzle's features (NbPlays, RatingDeviation, themes) are strong signals."
                          : !modelCorrect && userCorrect
                            ? "You beat the model! The tree was misled by features that don't apply to this specific position."
                            : "Both you and the model missed — likely this puzzle sits near a class boundary."}
                      </span>
                    </div>
                  )}
                  <Button size="sm" className="w-full" onClick={nextPuzzle}>
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Next puzzle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
