"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Filter,
  X,
  ExternalLink,
  Database,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SamplePuzzle } from "@/lib/decision-tree";

const CLASS_COLORS: Record<string, string> = {
  Easy: "#10b981",
  Medium: "#f59e0b",
  Hard: "#f97316",
  Expert: "#ef4444",
};

type SortKey = "puzzleId" | "rating" | "ratingDeviation" | "popularity" | "nbPlays" | "difficulty";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 12;

interface Props {
  puzzles: SamplePuzzle[];
}

interface SortHeaderProps {
  k: SortKey;
  label: string;
  sortKey: SortKey;
  sortDir: SortDir;
  onToggle: (k: SortKey) => void;
}

function SortHeader({ k, label, sortKey, sortDir, onToggle }: SortHeaderProps) {
  return (
    <TableHead className="cursor-pointer select-none" onClick={() => onToggle(k)}>
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === k ? (
          sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronsUpDown className="h-3 w-3 opacity-40" />
        )}
      </span>
    </TableHead>
  );
}

export function DataExplorer({ puzzles }: Props) {
  const [search, setSearch] = useState("");
  const [themeFilter, setThemeFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [ratingRange, setRatingRange] = useState<{ min: string; max: string }>({ min: "", max: "" });
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [selectedPuzzle, setSelectedPuzzle] = useState<SamplePuzzle | null>(null);

  // Build the list of distinct themes from the dataset
  const allThemes = useMemo(() => {
    const set = new Set<string>();
    puzzles.forEach((p) => {
      if (p.themes) p.themes.split(/\s+/).forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [puzzles]);

  // Apply filters + sort
  const filtered = useMemo(() => {
    let result = puzzles;

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.puzzleId.toLowerCase().includes(q) ||
          p.themes.toLowerCase().includes(q) ||
          p.fen.toLowerCase().includes(q)
      );
    }

    // Theme filter
    if (themeFilter !== "all") {
      result = result.filter((p) => p.themes.split(/\s+/).includes(themeFilter));
    }

    // Difficulty filter
    if (difficultyFilter !== "all") {
      result = result.filter((p) => p.difficulty === difficultyFilter);
    }

    // Rating range
    const min = parseInt(ratingRange.min, 10);
    const max = parseInt(ratingRange.max, 10);
    if (!Number.isNaN(min)) result = result.filter((p) => p.rating >= min);
    if (!Number.isNaN(max)) result = result.filter((p) => p.rating <= max);

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "puzzleId") cmp = a.puzzleId.localeCompare(b.puzzleId);
      else if (sortKey === "difficulty") cmp = a.difficulty.localeCompare(b.difficulty);
      else cmp = (a[sortKey] as number) - (b[sortKey] as number);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [puzzles, search, themeFilter, difficultyFilter, ratingRange, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  // Wrap every state-changing setter to also reset the page to 0, so users
  // never find themselves on an out-of-range page after a filter change.
  const updateSearch = useCallback((v: string) => { setSearch(v); setPage(0); }, []);
  const updateTheme = useCallback((v: string) => { setThemeFilter(v); setPage(0); }, []);
  const updateDifficulty = useCallback((v: string) => { setDifficultyFilter(v); setPage(0); }, []);
  const updateRatingRange = useCallback((v: { min: string; max: string }) => { setRatingRange(v); setPage(0); }, []);

  const toggleSort = useCallback((key: SortKey) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortDir("desc");
      }
      return key;
    });
    setPage(0);
  }, []);

  const clearAll = useCallback(() => {
    setSearch("");
    setThemeFilter("all");
    setDifficultyFilter("all");
    setRatingRange({ min: "", max: "" });
    setSortKey("rating");
    setSortDir("desc");
    setPage(0);
  }, []);

  return (
    <section id="explorer" className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <div className="mb-2 text-sm font-medium uppercase tracking-wider text-emerald-600">
            Interactive
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Data Explorer</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Browse a sample of {puzzles.length} real puzzles from the dataset. Filter by theme,
            difficulty, rating range, or search by Puzzle ID / FEN / theme keyword. Click any row
            for full details.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-5 w-5 text-emerald-600" /> Filters & Search
            </CardTitle>
            <CardDescription>
              Showing {filtered.length} of {puzzles.length} puzzles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <Label htmlFor="search" className="mb-1.5 block text-xs">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="PuzzleId, FEN, or theme..."
                    value={search}
                    onChange={(e) => updateSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="theme" className="mb-1.5 block text-xs">
                  Theme
                </Label>
                <select
                  id="theme"
                  value={themeFilter}
                  onChange={(e) => updateTheme(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="all">All themes</option>
                  {allThemes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="difficulty" className="mb-1.5 block text-xs">
                  Difficulty
                </Label>
                <select
                  id="difficulty"
                  value={difficultyFilter}
                  onChange={(e) => updateDifficulty(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="all">All classes</option>
                  <option value="Easy">Easy (≤ 1200)</option>
                  <option value="Medium">Medium (1201-1600)</option>
                  <option value="Hard">Hard (1601-2000)</option>
                  <option value="Expert">Expert (&gt; 2000)</option>
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Min rating</Label>
                <Input
                  type="number"
                  placeholder="399"
                  value={ratingRange.min}
                  onChange={(e) => updateRatingRange({ ...ratingRange, min: e.target.value })}
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Max rating</Label>
                <Input
                  type="number"
                  placeholder="3108"
                  value={ratingRange.max}
                  onChange={(e) => updateRatingRange({ ...ratingRange, max: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <Button variant="outline" size="sm" onClick={clearAll} className="w-full">
                  <X className="mr-1 h-3.5 w-3.5" /> Clear filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <TableUI>
                <TableHeader>
                  <TableRow>
                    <SortHeader k="puzzleId" label="PuzzleId" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                    <SortHeader k="rating" label="Rating" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                    <SortHeader k="difficulty" label="Difficulty" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                    <SortHeader k="ratingDeviation" label="RdDev" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                    <SortHeader k="popularity" label="Pop." sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                    <SortHeader k="nbPlays" label="Plays" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                    <TableHead>Themes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                        No puzzles match these filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paged.map((p) => (
                      <TableRow
                        key={p.puzzleId}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedPuzzle(p)}
                      >
                        <TableCell className="font-mono text-xs font-medium">{p.puzzleId}</TableCell>
                        <TableCell className="font-mono text-xs">{p.rating}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            style={{
                              color: CLASS_COLORS[p.difficulty],
                              borderColor: CLASS_COLORS[p.difficulty],
                            }}
                          >
                            {p.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{p.ratingDeviation}</TableCell>
                        <TableCell className="font-mono text-xs">{p.popularity}</TableCell>
                        <TableCell className="font-mono text-xs">{p.nbPlays.toLocaleString()}</TableCell>
                        <TableCell className="max-w-[200px] truncate font-mono text-[10px] text-muted-foreground">
                          {p.themes}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </TableUI>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-3 text-sm">
              <div className="text-xs text-muted-foreground">
                Page {currentPage + 1} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail modal */}
      {selectedPuzzle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedPuzzle(null)}
        >
          <Card
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="font-mono text-lg">{selectedPuzzle.puzzleId}</CardTitle>
                  <CardDescription className="mt-1">
                    Rating {selectedPuzzle.rating} ·{" "}
                    <span style={{ color: CLASS_COLORS[selectedPuzzle.difficulty] }}>
                      {selectedPuzzle.difficulty}
                    </span>
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPuzzle(null)}
                  className="-mr-2 -mt-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-md border border-border p-3">
                  <div className="text-xs text-muted-foreground">Rating Deviation</div>
                  <div className="font-mono text-lg">{selectedPuzzle.ratingDeviation}</div>
                </div>
                <div className="rounded-md border border-border p-3">
                  <div className="text-xs text-muted-foreground">Popularity</div>
                  <div className="font-mono text-lg">{selectedPuzzle.popularity}</div>
                </div>
                <div className="rounded-md border border-border p-3">
                  <div className="text-xs text-muted-foreground">Plays</div>
                  <div className="font-mono text-lg">{selectedPuzzle.nbPlays.toLocaleString()}</div>
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">FEN</div>
                <code className="block rounded-md bg-muted p-3 font-mono text-xs break-all">
                  {selectedPuzzle.fen}
                </code>
              </div>
              <div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Moves (UCI)</div>
                <code className="block rounded-md bg-muted p-3 font-mono text-xs break-all">
                  {selectedPuzzle.moves}
                </code>
              </div>
              <div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Themes</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPuzzle.themes.split(/\s+/).map((t) => (
                    <Badge key={t} variant="secondary" className="font-mono text-[10px]">{t}</Badge>
                  ))}
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <a href={selectedPuzzle.gameUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-3.5 w-3.5" /> View on Lichess
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
