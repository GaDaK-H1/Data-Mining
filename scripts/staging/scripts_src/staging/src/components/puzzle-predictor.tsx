"use client";

import { useState, useMemo } from "react";
import {
  Brain,
  Sparkles,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  Cpu,
  GitBranch,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { TreeNode, ScalerExport, DecisionPathStep } from "@/lib/decision-tree";
import { predictWithTree } from "@/lib/decision-tree";

const CLASS_COLORS: Record<string, string> = {
  Easy: "#10b981",
  Medium: "#f59e0b",
  Hard: "#f97316",
  Expert: "#ef4444",
};

// The top ~12 themes that show up in the tree or are important.
const PREDICTOR_THEMES = [
  "mate", "mateIn1", "mateIn2", "endgame", "middlegame",
  "short", "long", "oneMove", "fork", "crushing",
  "advantage", "quietMove",
];

interface Props {
  tree: TreeNode;
  scaler: ScalerExport;
  classNames: string[];
}

export function PuzzlePredictor({ tree, scaler, classNames }: Props) {
  // Numeric metadata inputs (raw values, not standardised — the predictor
  // applies the scaler internally before walking the tree).
  const [nbPlays, setNbPlays] = useState(1000);
  const [ratingDeviation, setRatingDeviation] = useState(80);
  const [popularity, setPopularity] = useState(85);
  // Theme flags (0 / 1)
  const [themes, setThemes] = useState<Record<string, boolean>>({});
  // Board-feature defaults — for the predictor we use reasonable median values
  // since users can't easily input these without picking a position. These
  // defaults mirror roughly where the median puzzle in the dataset sits.
  const defaultBoardFeatures = {
    WhiteMaterial: 7,
    BlackMaterial: 7,
    MaterialBalance: 0,
    TotalPieces: 14,
    WhitePawns: 4,
    BlackPawns: 4,
    IsWhiteTurn: 1,
    LegalMoveCount: 25,
    InCheck: 0,
    WhiteKingAttackers: 1,
    BlackKingAttackers: 1,
    KingDistance: 4,
    WhiteCastled: 1,
    WhiteDoubledPawns: 0,
  };
  const [boardFeatures] = useState(defaultBoardFeatures);

  // Build the feature vector
  const featureVector = useMemo(() => {
    const fv: Record<string, number> = {
      NbPlays: nbPlays,
      RatingDeviation: ratingDeviation,
      Popularity: popularity,
      ...boardFeatures,
    };
    // Add theme flags (1 if set, 0 otherwise)
    PREDICTOR_THEMES.forEach((t) => {
      fv[t] = themes[t] ? 1 : 0;
    });
    return fv;
  }, [nbPlays, ratingDeviation, popularity, themes, boardFeatures]);

  // Run the prediction (in browser — no network call)
  const result = useMemo(
    () => predictWithTree(tree, scaler, featureVector),
    [tree, scaler, featureVector]
  );

  const reset = () => {
    setNbPlays(1000);
    setRatingDeviation(80);
    setPopularity(85);
    setThemes({});
  };

  const totalSamples = result.distribution?.reduce((a, b) => a + b, 0) ?? 0;
  const classProbs = result.distribution
    ? classNames.map((c, i) => ({
        class: c,
        count: result.distribution![i] ?? 0,
        pct: totalSamples > 0 ? ((result.distribution![i] ?? 0) / totalSamples) * 100 : 0,
      }))
    : [];

  return (
    <section id="predictor" className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8">
        <div className="mb-2 text-sm font-medium uppercase tracking-wider text-emerald-600">
          Interactive
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Puzzle Predictor</h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Adjust the puzzle's metadata and toggle its tactical themes — the website walks the
          trained Decision Tree (depth 10, 643 leaves, accuracy {`60.60%`}) right here in your
          browser and shows the predicted difficulty class plus the decision path it followed.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Cpu className="h-5 w-5 text-emerald-600" /> Puzzle Features
            </CardTitle>
            <CardDescription>
              Three metadata sliders + 12 theme flags. Board features use sensible median defaults.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Numeric sliders */}
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-sm">Number of plays (NbPlays)</Label>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {nbPlays.toLocaleString()}
                  </Badge>
                </div>
                <Slider
                  value={[Math.log10(nbPlays)]}
                  onValueChange={(v) => setNbPlays(Math.round(Math.pow(10, v[0])))}
                  min={0}
                  max={5}
                  step={0.05}
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>1 play</span>
                  <span>100,000 plays</span>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-sm">Rating deviation</Label>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {ratingDeviation}
                  </Badge>
                </div>
                <Slider
                  value={[ratingDeviation]}
                  onValueChange={(v) => setRatingDeviation(v[0])}
                  min={40}
                  max={200}
                  step={1}
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>40 (well-known)</span>
                  <span>200 (brand new)</span>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-sm">Popularity</Label>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {popularity}
                  </Badge>
                </div>
                <Slider
                  value={[popularity]}
                  onValueChange={(v) => setPopularity(v[0])}
                  min={0}
                  max={100}
                  step={1}
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>0 (disliked)</span>
                  <span>100 (loved)</span>
                </div>
              </div>
            </div>

            {/* Theme toggles */}
            <div>
              <Label className="mb-2 block text-sm">Tactical themes</Label>
              <div className="flex flex-wrap gap-2">
                {PREDICTOR_THEMES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setThemes((s) => ({ ...s, [t]: !s[t] }))}
                    className={`rounded-full border px-3 py-1 text-xs font-mono transition-colors ${
                      themes[t]
                        ? "border-emerald-500 bg-emerald-100 text-emerald-700"
                        : "border-border bg-background text-muted-foreground hover:border-emerald-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={reset} className="w-full">
              <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset to defaults
            </Button>
          </CardContent>
        </Card>

        {/* Output */}
        <div className="space-y-6">
          <Card className="border-emerald-200 bg-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-emerald-900">
                <Sparkles className="h-5 w-5" /> Predicted Difficulty
              </CardTitle>
              <CardDescription className="text-emerald-700">
                Decision Tree (depth 10) · walks in ~μs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold" style={{ color: CLASS_COLORS[result.prediction] }}>
                {result.prediction}
              </div>
              {totalSamples > 0 && (
                <div className="mt-3 text-xs text-emerald-800">
                  Based on {totalSamples.toLocaleString()} training samples that reached this leaf
                </div>
              )}
              {/* Class distribution bar */}
              {classProbs.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  {classProbs.map((p) => (
                    <div key={p.class}>
                      <div className="mb-0.5 flex justify-between text-[10px]">
                        <span style={{ color: CLASS_COLORS[p.class] }} className="font-medium">
                          {p.class}
                        </span>
                        <span className="font-mono text-muted-foreground">
                          {p.pct.toFixed(1)}% ({p.count.toLocaleString()})
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${p.pct}%`, background: CLASS_COLORS[p.class] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Decision path */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GitBranch className="h-5 w-5 text-amber-600" /> Decision Path
              </CardTitle>
              <CardDescription>The sequence of splits the tree walked to reach its leaf.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-72 space-y-1 overflow-y-auto pr-2">
                {result.path.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Tree reached a leaf directly.</div>
                ) : (
                  result.path.map((step, i) => <PathStep key={i} step={step} index={i} />)
                )}
                <div className="mt-2 flex items-center gap-2 rounded-md bg-emerald-100 p-2 text-xs">
                  <ChevronRight className="h-3.5 w-3.5 text-emerald-700" />
                  <span className="font-medium text-emerald-800">→ {result.prediction}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function PathStep({ step, index }: { step: DecisionPathStep; index: number }) {
  const [open, setOpen] = useState(false);
  const condMet = step.direction === "left";
  return (
    <div className="rounded-md border border-border p-2 text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-muted-foreground">#{index + 1}</span>
          <span className="font-mono text-xs">{step.feature}</span>
          <span className="text-muted-foreground">≤ / &gt;</span>
          <span className="font-mono text-xs">{step.threshold.toFixed(3)}</span>
        </span>
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
      {open && (
        <div className="mt-2 space-y-1 border-t border-border pt-2 text-[11px] text-muted-foreground">
          <div>Value: <span className="font-mono">{step.value.toFixed(4)}</span> {step.standardised && <span className="text-amber-600">(standardised)</span>}</div>
          <div>Branch taken: <span className="font-medium" style={{ color: condMet ? "#10b981" : "#f97316" }}>{step.direction}</span></div>
          <div>Interpretation: {condMet ? "feature is small/absent" : "feature is large/present"} {step.standardised && "(below/above threshold in standardised space)"}</div>
        </div>
      )}
    </div>
  );
}
