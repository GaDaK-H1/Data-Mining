"use client";

import { useState, useEffect, useRef } from "react";
import {
  Crown,
  Download,
  FileText,
  FileSpreadsheet,
  Notebook,
  Brain,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Cloud,
  Table,
  Link2,
  ChevronRight,
  Github,
  Award,
  Target,
  Crosshair,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  projectMeta,
  objectives,
  tools,
  datasetColumns,
  dataQuality,
  difficultyClasses,
  topThemes,
  numericCorrelation,
  fenFeatures,
  preprocessingSummary,
  associationRules,
  associationRuleStats,
  hyperparameterGrids,
  cvResults,
  testResults,
  confusionMatrices,
  featureImportances,
  leakageAudit,
  misclassifiedPuzzles,
  errorAnalysisStats,
  conclusions,
  benefits,
  limitations,
  references,
  navSections,
} from "@/lib/project-data";
import { ThemeToggle } from "@/components/theme-toggle";

const CLASS_COLORS: Record<string, string> = {
  Easy: "#10b981",
  Medium: "#f59e0b",
  Hard: "#f97316",
  Expert: "#ef4444",
};

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  table: Table,
  brain: Brain,
  knight: Crown,
  link: Link2,
  chart: TrendingUp,
  cloud: Cloud,
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden border-b border-border bg-gradient-to-br from-stone-950 via-stone-900 to-emerald-950 text-stone-50"
    >
      {/* chessboard pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(45deg, #fff 25%, transparent 25%), linear-gradient(-45deg, #fff 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #fff 75%), linear-gradient(-45deg, transparent 75%, #fff 75%)",
          backgroundSize: "48px 48px",
          backgroundPosition: "0 0, 0 24px, 24px -24px, -24px 0",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20 md:py-28">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-[1.6fr_1fr] items-center">
          <div>
            <Badge
              variant="outline"
              className="mb-6 border-emerald-400/40 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
            >
              <Crown className="mr-1.5 h-3.5 w-3.5" /> IS-212 Data Mining Project
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-6xl">
              Chess Puzzle<br />
              <span className="bg-gradient-to-r from-emerald-300 to-amber-300 bg-clip-text text-transparent">
                Difficulty Classification
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-stone-300">
              Predicting the difficulty class (Easy / Medium / Hard / Expert) of 50,000
              Lichess puzzles from board features and metadata — without using the rating
              value itself. Descriptive Apriori mining plus six classifiers evaluated under
              one protocol.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-emerald-500 text-stone-950 hover:bg-emerald-400">
                <a href="#downloads">
                  <Download className="mr-2 h-4 w-4" /> Download Project Files
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-stone-600 bg-stone-900/40 text-stone-100 hover:bg-stone-800/60"
              >
                <a href="#overview">
                  Read the Results <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>

            <dl className="mt-8 sm:mt-10 grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-x-8 sm:gap-y-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-stone-400">Author</dt>
                <dd className="font-medium">{projectMeta.author}</dd>
              </div>
              <div>
                <dt className="text-stone-400">Student ID</dt>
                <dd className="font-medium">{projectMeta.studentId}</dd>
              </div>
              <div>
                <dt className="text-stone-400">Dataset size</dt>
                <dd className="font-medium">50,000 puzzles</dd>
              </div>
              <div>
                <dt className="text-stone-400">Date</dt>
                <dd className="font-medium">{projectMeta.date}</dd>
              </div>
            </dl>
          </div>

          {/* chess knight / summary card */}
          <Card className="border-stone-700 bg-stone-900/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-stone-100">
                <Crosshair className="h-5 w-5 text-emerald-400" /> Headline Result
              </CardTitle>
              <CardDescription className="text-stone-400">
                Random Forest on 10,000 held-out puzzles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-emerald-300">62.83%</div>
                <div className="text-sm text-stone-400">Test-set accuracy</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-semibold text-amber-300">0.5909</div>
                <div className="text-xs sm:text-sm text-stone-400">Macro F1 (4.4× over baseline)</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-semibold text-stone-100">89.8%</div>
                <div className="text-xs sm:text-sm text-stone-400">Accuracy with ±1 bin tolerance</div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-stone-800 text-sm text-stone-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                72.6% of errors fall in the adjacent class
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

// ─── Sticky Nav ────────────────────────────────────────────────────────────────
function StickyNav() {
  const [active, setActive] = useState<string>("hero");
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -65% 0px" }
    );
    navSections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!navRef.current) return;
    const link = navRef.current.querySelector(`[href="#${active}"]`) as HTMLElement;
    if (link) link.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  return (
    <nav
      className={`sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 transition-shadow ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div ref={navRef} className="mx-auto flex max-w-7xl items-center gap-1.5 sm:gap-2 overflow-x-auto px-3 sm:px-4 py-2.5 text-sm scroll-smooth" style={{ scrollbarWidth: "thin" }}>
        <div className="flex items-center gap-1.5 pr-3 font-semibold">
          <Crown className="h-4 w-4 text-emerald-600" />
          <span className="hidden sm:inline">Chess Puzzle Project</span>
        </div>
        {navSections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`whitespace-nowrap rounded-md px-2.5 py-2 sm:py-1.5 transition-colors hover:bg-muted ${
              active === s.id ? "bg-emerald-100 font-medium text-emerald-700" : "text-muted-foreground"
            }`}
          >
            {s.label}
          </a>
        ))}
        <div className="ml-auto flex-shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────────
function SectionHeader({
  chapter,
  title,
  subtitle,
}: {
  chapter: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="mb-2 text-xs sm:text-sm font-medium uppercase tracking-wider text-emerald-600">
        {chapter}
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-2 sm:mt-3 max-w-3xl text-sm sm:text-base text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

// ─── Overview Section ──────────────────────────────────────────────────────────
function Overview() {
  return (
    <section id="overview" className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
      <SectionHeader
        chapter="Chapter 1"
        title="Project Overview"
        subtitle="Lichess is a free and open-source chess server that maintains a large public database of puzzles. Each puzzle is given a Glicko rating that indicates the strength needed to solve it. The key question is whether the board structure and puzzle metadata alone are enough to estimate the difficulty class without the rating."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" /> Objectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {objectives.map((o, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                    {i + 1}
                  </span>
                  <span>{o}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-amber-600" /> Tools & Environment
            </CardTitle>
            <CardDescription>
              A single Jupyter notebook ({projectMeta.notebookFile}, 35 cells) executed on Google
              Colab with a standard CPU runtime.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {tools.map((t) => {
              const Icon = ICONS[t.icon] || Brain;
              return (
                <div
                  key={t.name}
                  className="flex items-start gap-3 rounded-lg border border-border p-3"
                >
                  <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// ─── Dataset Section ──────────────────────────────────────────────────────────
function DatasetSection() {
  return (
    <section
      id="dataset"
      className="border-y border-border bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
        <SectionHeader
          chapter="Chapter 2"
          title="Dataset Description"
          subtitle="A 50,000-row sample from the Lichess puzzle database. The table below describes the eleven columns of the raw CSV. Two columns were largely empty and were dropped during preprocessing; the rest are complete with no missing values."
        />

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Table 2.1 — Columns of the raw dataset</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <TableUI>
                  <TableHeader className="sticky top-0 bg-card">
                    <TableRow>
                      <TableHead>Column</TableHead>
                      <TableHead className="w-24">Type</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datasetColumns.map((c) => (
                      <TableRow key={c.column}>
                        <TableCell className="font-mono text-xs font-medium">{c.column}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono text-[10px]">{c.type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableUI>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Data Quality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total rows</span>
                  <span className="font-mono font-semibold">{dataQuality.totalRows.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duplicate rows</span>
                  <span className="font-mono font-semibold">{dataQuality.duplicateRows}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Missing values
                  </div>
                  {dataQuality.missingSummary.map((m) => (
                    <div key={m.column} className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-mono">{m.column}</span>
                      <Badge
                        variant={m.missing === 0 ? "outline" : "destructive"}
                        className="font-mono text-[10px]"
                      >
                        {m.missing}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Rating Statistics</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Min</div>
                  <div className="font-mono font-semibold">{dataQuality.ratingStats.min}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Max</div>
                  <div className="font-mono font-semibold">{dataQuality.ratingStats.max}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Mean</div>
                  <div className="font-mono font-semibold">{dataQuality.ratingStats.mean}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Std dev</div>
                  <div className="font-mono font-semibold">{dataQuality.ratingStats.std}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── EDA Section ────────────────────────────────────────────────────────────────
function EDASection() {
  return (
    <section id="eda" className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
      <SectionHeader
        chapter="Chapter 2"
        title="Exploratory Data Analysis"
        subtitle="The rating is binned into four ordinal classes. The Easy class dominates (36.8%), making macro-averaged F1 the right metric rather than plain accuracy. Themes reveal both tactical motifs and tautological solution-length flags that need auditing later."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Difficulty class distribution</CardTitle>
            <CardDescription>Figure 2.2 — Counts and shares per class</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={difficultyClasses} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="class" type="category" width={70} />
                <Tooltip
                  formatter={(v: number, n: string, p: { payload?: { share?: number } }) =>
                    n === "count" ? [`${v.toLocaleString()} (${p.payload?.share}%)`, "Count"] : [v, n]
                  }
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {difficultyClasses.map((d) => (
                    <Cell key={d.class} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 20 tactical themes</CardTitle>
            <CardDescription>Figure 2.4 — Most frequent tags across 50,000 puzzles</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topThemes} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="theme" type="category" width={90} tick={{ fontSize: 9 }} interval={0} tickFormatter={(v) => v.length > 12 ? v.slice(0, 10) + '…' : v} />
                <Tooltip formatter={(v: number) => [v.toLocaleString(), "Count"]} />
                <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Numeric correlation heatmap</CardTitle>
          <CardDescription>Figure 2.5 — Pearson correlation of the four numeric columns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-2"></th>
                  {numericCorrelation.columns.map((c) => (
                    <th key={c} className="p-2 text-center font-mono text-xs">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {numericCorrelation.matrix.map((row, i) => (
                  <tr key={i}>
                    <td className="p-2 font-mono text-xs font-medium">{numericCorrelation.columns[i]}</td>
                    {row.map((v, j) => {
                      const intensity = Math.abs(v);
                      const color =
                        v > 0
                          ? `rgba(16, 185, 129, ${intensity})`
                          : `rgba(239, 68, 68, ${intensity})`;
                      return (
                        <td
                          key={j}
                          className="p-2 text-center font-mono text-xs"
                          style={{ background: color, color: intensity > 0.5 ? "#fff" : "inherit" }}
                        >
                          {v.toFixed(3)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{numericCorrelation.notes}</p>
        </CardContent>
      </Card>
    </section>
  );
}

// ─── Preprocessing Section ──────────────────────────────────────────────────────
function PreprocessingSection() {
  return (
    <section id="preprocessing" className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
        <SectionHeader
          chapter="Chapter 3"
          title="Preprocessing & Feature Engineering"
          subtitle="Six columns were dropped (identifiers, links, mostly-empty fields, and the target rating itself). The FEN string was parsed with python-chess to extract 14 board features, combined with the 3 metadata columns and 73 one-hot theme flags to form a 90-column feature matrix."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Table 3.1 — Board features extracted from FEN</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <TableUI>
                  <TableHeader className="sticky top-0 bg-card">
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fenFeatures.map((f) => (
                      <TableRow key={f.feature}>
                        <TableCell className="font-mono text-xs font-medium">{f.feature}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{f.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableUI>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Final feature matrix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold text-emerald-600">{preprocessingSummary.finalFeatures}</div>
                <div className="text-sm text-muted-foreground">total features</div>
                <div className="space-y-2 border-t border-border pt-3">
                  {preprocessingSummary.featureBreakdown.map((f) => (
                    <div key={f.label} className="flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium">{f.label}</div>
                        <div className="text-xs text-muted-foreground">{f.note}</div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">{f.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Train / Test split</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Training set</span>
                  <span className="font-mono font-semibold">{preprocessingSummary.split.train.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Test set</span>
                  <span className="font-mono font-semibold">{preprocessingSummary.split.test.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ratio</span>
                  <span className="font-mono font-semibold">{preprocessingSummary.split.ratio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stratified</span>
                  <span className="font-mono font-semibold">{preprocessingSummary.split.stratified ? "Yes" : "No"}</span>
                </div>
                <div className="border-t border-border pt-2 text-xs text-muted-foreground">
                  {preprocessingSummary.scaling}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Association Rules Section ─────────────────────────────────────────────────
function AssociationRulesSection() {
  const scatterData = associationRules.map((r, i) => ({
    ...r,
    idx: i,
    ant: r.antecedents,
  }));

  return (
    <section id="rules" className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
      <SectionHeader
        chapter="Chapter 3"
        title="Association Rule Mining"
        subtitle="Apriori on the 73 theme columns + 4 one-hot difficulty columns. All 42 kept rules conclude with the Easy class — short-solution markers (mateIn1, mateIn2, oneMove) combined with phase tags (endgame, middlegame) strongly indicate Easy. No rule with confidence ≥ 0.70 indicates Hard or Expert."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Frequent itemsets", value: associationRuleStats.totalFrequentItemsets },
          { label: "Rules kept", value: associationRuleStats.totalRulesKept },
          { label: "Rules → Easy", value: associationRuleStats.rulesToEasy },
          { label: "Rules → Hard/Expert", value: associationRuleStats.rulesToHard + associationRuleStats.rulesToExpert },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-emerald-600">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Figure 3.1 — Support vs Confidence (coloured by lift)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ left: 12, right: 16, top: 16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="support"
                  name="Support"
                  domain={[0.04, 0.1]}
                  tickFormatter={(v) => v.toFixed(2)}
                />
                <YAxis
                  type="number"
                  dataKey="confidence"
                  name="Confidence"
                  domain={[0.6, 0.9]}
                  tickFormatter={(v) => v.toFixed(2)}
                />
                <ZAxis type="number" dataKey="lift" range={[100, 800]} name="Lift" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(v: number, n: string) => (n === "lift" ? [v.toFixed(2), "Lift"] : [v.toFixed(3), n])}
                  labelFormatter={() => ""}
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div className="rounded-md border border-border bg-card p-2 text-xs shadow-md">
                        <div className="font-mono">{p.ant}</div>
                        <div className="text-muted-foreground">→ {p.consequent}</div>
                        <div>support: <span className="font-mono">{p.support.toFixed(3)}</span></div>
                        <div>confidence: <span className="font-mono">{p.confidence.toFixed(3)}</span></div>
                        <div>lift: <span className="font-mono">{p.lift.toFixed(2)}</span></div>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData} fill="#0d9488" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Table 3.2 — Top 10 rules by lift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto">
              <TableUI>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead>Antecedents</TableHead>
                    <TableHead>Cons.</TableHead>
                    <TableHead className="text-right">Sup.</TableHead>
                    <TableHead className="text-right">Conf.</TableHead>
                    <TableHead className="text-right">Lift</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {associationRules.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">{r.antecedents}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={{ color: CLASS_COLORS[r.consequent], borderColor: CLASS_COLORS[r.consequent] }}
                        >
                          {r.consequent}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">{r.support.toFixed(3)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{r.confidence.toFixed(3)}</TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold">{r.lift.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableUI>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
        <CardContent className="flex items-start gap-3 p-4 pt-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-sm">
            <span className="font-medium text-amber-900 dark:text-amber-100">Key finding. </span>
            <span className="text-amber-800 dark:text-amber-200">
              All 42 rules conclude with Easy. The same solution-length tags that dominate the
              rule list are the ones flagged as tautological in §2.5 — the descriptive rules
              largely re-describe the answer length. No frequent rule combination is
              characteristic of Hard or Expert puzzles; difficulty above 2000 depends on the
              position and precision, not a single shared tag.
            </span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// ─── Models / Training Section ─────────────────────────────────────────────────
function ModelsSection() {
  return (
    <section id="models" className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
        <SectionHeader
          chapter="Chapter 4"
          title="Model Training"
          subtitle="Six classifiers are trained and compared under one protocol: 5-fold stratified cross-validation on 40,000 training rows with macro F1 as the scoring metric. The RBF SVM is tuned on a 10,000-row subsample (3-fold CV) due to CPU limits on Colab."
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Table 4.1 — Hyperparameter grids</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <TableUI>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Parameters searched</TableHead>
                    <TableHead>Best found</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hyperparameterGrids.map((g) => (
                    <TableRow key={g.model}>
                      <TableCell className="font-medium">{g.model}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{g.searched}</TableCell>
                      <TableCell className="font-mono text-xs">{g.best}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableUI>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950">
          <CardContent className="p-4 pt-4">
            <div className="flex items-start gap-3">
              <Cpu className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="text-sm">
                <span className="font-medium text-emerald-900 dark:text-emerald-100">Colab survival kit. </span>
                <span className="text-emerald-800 dark:text-emerald-200">
                  The initial training cell crashed halfway through grid search. Three fixes:
                  (1) cast the feature matrix to float32 — halved memory and sped up all
                  models with no metric change; (2) moved all parallelism to GridSearchCV
                  (<code className="font-mono">n_jobs=-1</code>) and set estimator-level
                  <code className="font-mono"> n_jobs=1</code>, killing thread oversubscription;
                  (3) LinearSVC with <code className="font-mono">dual=False</code> for the
                  primal solver (32k rows ≫ 90 features), and per-model joblib checkpoints to
                  Google Drive so a crashed session only loses the model currently training.
                  Full grid completes in 6–10 minutes on a standard Colab CPU runtime.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// ─── Evaluation Section ─────────────────────────────────────────────────────────
function EvaluationSection() {
  const [activeModel, setActiveModel] = useState("Random Forest");
  const cm = confusionMatrices[activeModel];
  const classLabels = ["Easy", "Medium", "Hard", "Expert"];

  return (
    <section id="evaluation" className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
      <SectionHeader
        chapter="Chapter 4"
        title="Evaluation Results"
        subtitle="Random Forest is the best model — accuracy 62.83% and macro F1 0.5909 on the 10,000-row test set. The CV score (0.5928) closely predicts the test score, indicating no overfit. The two SVMs differ most: the kernel version beats the linear one by ~7 percentage points because class boundaries in feature space are not linear."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Figure 4.1 — CV macro F1 (mean ± std)</CardTitle>
            <CardDescription>Table 4.2 — 5-fold stratified cross-validation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cvResults} margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="model" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={70} />
                <YAxis domain={[0, 0.7]} tickFormatter={(v) => v.toFixed(2)} />
                <Tooltip formatter={(v: number) => [v.toFixed(4), "Macro F1"]} />
                <Bar dataKey="macroF1" radius={[4, 4, 0, 0]}>
                  {cvResults.map((m, i) => (
                    <Cell key={i} fill={m.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Table 4.3 — Test-set metrics</CardTitle>
            <CardDescription>10,000 held-out puzzles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto">
              <TableUI>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Acc.</TableHead>
                    <TableHead className="text-right">Prec.</TableHead>
                    <TableHead className="text-right">Rec.</TableHead>
                    <TableHead className="text-right">F1</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testResults.map((r) => (
                    <TableRow key={r.model} className={r.model === "Random Forest" ? "bg-emerald-50 dark:bg-emerald-950" : ""}>
                      <TableCell className="font-medium">
                        {r.model === "Random Forest" && (
                          <Award className="mr-1 inline h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        )}
                        {r.model}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">{r.accuracy.toFixed(4)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{r.precision.toFixed(4)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{r.recall.toFixed(4)}</TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold">{r.f1.toFixed(4)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableUI>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confusion matrix explorer */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Figure 4.2 — Confusion matrices</CardTitle>
          <CardDescription>
            Rows = true class, columns = predicted. Almost all mass lies on or adjacent to the
            diagonal — errors between neighbouring classes dominate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeModel} onValueChange={setActiveModel}>
            <TabsList className="flex-wrap h-auto">
              {Object.keys(confusionMatrices).map((m) => (
                <TabsTrigger key={m} value={m} className="text-xs">
                  {m}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={activeModel} className="mt-6">
              <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
                {/* Matrix */}
                <div className="overflow-x-auto">
                  <table className="border-collapse text-xs">
                    <thead>
                      <tr>
                        <th className="p-1"></th>
                        <th colSpan={4} className="p-2 text-center text-muted-foreground">
                          Predicted
                        </th>
                      </tr>
                      <tr>
                        <th className="p-2"></th>
                        {classLabels.map((c) => (
                          <th key={c} className="p-2 text-center font-medium" style={{ color: CLASS_COLORS[c] }}>
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cm.map((row, i) => (
                        <tr key={i}>
                          <td className="p-2 font-medium" style={{ color: CLASS_COLORS[classLabels[i]] }}>
                            {classLabels[i]}
                          </td>
                          {row.map((v, j) => {
                            const max = Math.max(...row);
                            const intensity = max > 0 ? v / max : 0;
                            return (
                              <td
                                key={j}
                                className="p-1.5 sm:p-2 text-center font-mono text-[10px] sm:text-xs"
                                style={{
                                  background: i === j
                                    ? `rgba(16, 185, 129, ${0.15 + intensity * 0.75})`
                                    : `rgba(239, 68, 68, ${intensity * 0.55})`,
                                  color: intensity > 0.5 ? "#fff" : "inherit",
                                  minWidth: 50,
                                }}
                              >
                                {v.toLocaleString()}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Per-class accuracy radial */}
                <div>
                  <div className="text-sm font-medium mb-3">Per-class recall</div>
                  {classLabels.map((c, i) => {
                    const correct = cm[i][i];
                    const total = cm[i].reduce((a, b) => a + b, 0);
                    const acc = total > 0 ? (correct / total) * 100 : 0;
                    return (
                      <div key={c} className="mb-3">
                        <div className="mb-1 flex justify-between text-xs">
                          <span style={{ color: CLASS_COLORS[c] }} className="font-medium">{c}</span>
                          <span className="font-mono">{acc.toFixed(1)}%</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${acc}%`, background: CLASS_COLORS[c] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="mt-4 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                    Easy is recognised almost cleanly (85.1% per-class accuracy); the two middle
                    classes are the weakest (~42% and ~48%) because they straddle the boundaries
                    at 1200 and 2000.
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}

// ─── Feature Importance + Leakage Audit + Errors Section ──────────────────────
function AuditAndErrorsSection() {
  return (
    <section id="audit" className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16 space-y-12">
        {/* Feature importance */}
        <div>
          <SectionHeader
            chapter="Chapter 4"
            title="Feature Importance"
            subtitle="The top three features are the metadata columns (NbPlays, RatingDeviation, Popularity), then the mate and fork theme flags. Board features sit in the middle of the ranking with small but non-zero contributions. This raises the cold-start concern: new puzzles with few plays lose their three strongest signals."
          />
          <Card>
            <CardContent className="p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={420}>
                <BarChart
                  data={featureImportances}
                  layout="vertical"
                  margin={{ left: 4, right: 16, sm: { left: 8, right: 32 } }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => v.toFixed(2)} />
                  <YAxis dataKey="feature" type="category" width={90} tick={{ fontSize: 9 }} interval={0} />
                  <Tooltip formatter={(v: number) => [v.toFixed(3), "Importance"]} />
                  <Bar dataKey="importance" fill="#0d9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Leakage audit */}
        <div id="leakage">
          <SectionHeader
            chapter="Chapter 4"
            title="Leakage Audit"
            subtitle="Eight theme tags directly encode solution length (mateIn1–5, oneMove, short, long). To check how much the model relies on them, the same Random Forest was retrained twice: Run A on all 90 features, Run B without the 8 tautological columns."
          />

          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Table 4.4 — Run A vs Run B</CardTitle>
              </CardHeader>
              <CardContent>
                <TableUI>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Run</TableHead>
                      <TableHead className="text-right">Accuracy</TableHead>
                      <TableHead className="text-right">Macro F1</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leakageAudit.map((r) => (
                      <TableRow
                        key={r.run}
                        className={r.run === "Drop" ? "border-t-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950" : ""}
                      >
                        <TableCell>
                          <div className="font-medium">{r.run}</div>
                          <div className="text-xs text-muted-foreground">{r.featureSet}</div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {r.accuracy > 0 ? r.accuracy.toFixed(4) : `${(r.accuracy * 100).toFixed(2)} pp`}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {r.macroF1 > 0 ? r.macroF1.toFixed(4) : `${(r.macroF1 * 100).toFixed(2)} pp`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableUI>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium text-emerald-900 dark:text-emerald-100">Interpretation</span>
                </div>
                <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
                  The drop of <strong>1.13 percentage points</strong> is small. The model
                  does make use of the solution-length tags, but most of its performance is
                  retained even when none of the eight columns are included — indicating the
                  model has learned genuine positional and metadata signals. The tautological
                  features are not severe enough to warrant removal from the main pipeline, so
                  both versions are left documented and reproducible.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error analysis */}
        <div id="errors">
          <SectionHeader
            chapter="Chapter 4"
            title="Error Analysis"
            subtitle="Out of 10,000 test puzzles, the Random Forest misclassifies 3,717. 72.6% of errors fall between neighbouring classes — when a prediction is allowed to be off by one bin, the model is correct on 89.8% of the test set. The classes are arbitrary divisions on a continuous scale, and 17% of puzzles lie within 50 rating points of a boundary."
          />

          <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Card>
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-emerald-600">{errorAnalysisStats.misclassified.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">misclassified out of {errorAnalysisStats.totalTest.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-amber-600">{errorAnalysisStats.adjacentErrors}%</div>
                  <div className="text-xs text-muted-foreground">of errors fall in the adjacent class</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-emerald-600">{errorAnalysisStats.toleranceOneBinAccuracy}%</div>
                  <div className="text-xs text-muted-foreground">correct with ±1 bin tolerance</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Table 4.5 — Sample of misclassified puzzles</CardTitle>
                <CardDescription>
                  All five adhere to the same pattern: ratings near a class boundary, predictions off by exactly one bin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <TableUI>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PuzzleId</TableHead>
                        <TableHead className="text-right">Rating</TableHead>
                        <TableHead>True</TableHead>
                        <TableHead>Predicted</TableHead>
                        <TableHead>Themes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {misclassifiedPuzzles.map((p) => (
                        <TableRow key={p.puzzleId}>
                          <TableCell className="font-mono text-xs">{p.puzzleId}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{p.rating}</TableCell>
                          <TableCell>
                            <Badge variant="outline" style={{ color: CLASS_COLORS[p.trueClass], borderColor: CLASS_COLORS[p.trueClass] }}>
                              {p.trueClass}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" style={{ color: CLASS_COLORS[p.predicted], borderColor: CLASS_COLORS[p.predicted] }}>
                              {p.predicted}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{p.themes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableUI>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  The puzzle rated 1490 (predicted Hard) is 110 points below the 1600 boundary; the one rated 2197 (predicted Hard) is 197 points above. No feature excluding the rating itself can reliably resolve these differences.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Conclusion Section ─────────────────────────────────────────────────────────
function ConclusionSection() {
  return (
    <section id="conclusion" className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
      <SectionHeader chapter="Chapter 5" title="Conclusion" subtitle={conclusions.headline} />

      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold">Key takeaways</h3>
        <div className="grid gap-3">
          {conclusions.keyPoints.map((p, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <p className="text-sm leading-relaxed">{p}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-emerald-700">
              <CheckCircle2 className="h-5 w-5" /> Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-700">
              <AlertTriangle className="h-5 w-5" /> Limitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {limitations.map((l, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">References</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            {references.map((r) => (
              <li key={r.id} className="flex gap-3">
                <span className="font-mono text-xs text-muted-foreground">[{r.id}]</span>
                <span>
                  {r.text}{" "}
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline break-all"
                  >
                    {r.url}
                  </a>{" "}
                  <span className="text-muted-foreground">({r.accessed})</span>
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </section>
  );
}

// ─── Downloads Section ──────────────────────────────────────────────────────────
function DownloadsSection() {
  const files = [
    {
      href: "/downloads/project.ipynb",
      icon: Notebook,
      name: "project.ipynb",
      size: "31 KB",
      desc: "The full analysis notebook (35 cells). Run it on Google Colab — it reads the CSV from Drive and writes model checkpoints back to Drive.",
      type: "Jupyter Notebook",
    },
    {
      href: "/downloads/lichess_db_puzzle_sample.csv",
      icon: FileSpreadsheet,
      name: "lichess_db_puzzle_sample.csv",
      size: "8.9 MB",
      desc: "50,000-row Lichess puzzle sample. Eleven columns including FEN, Moves, Rating, Themes, and metadata.",
      type: "CSV Dataset",
    },
    {
      href: "/downloads/ProjectBook_HeinHtetZaw_YKPT22466.docx",
      icon: FileText,
      name: "ProjectBook_HeinHtetZaw_YKPT22466.docx",
      size: "3.0 MB",
      desc: "The full project report (5 chapters, 9 tables, all figures). Includes background, EDA, preprocessing, mining, evaluation, and conclusion.",
      type: "Word Document",
    },
    {
      href: "/downloads/website-source.zip",
      icon: Github,
      name: "website-source.zip",
      size: "26.3 MB",
      desc: "Complete Next.js source code for THIS website — includes the analysis script (scripts/run_analysis.py) that re-runs the notebook on the CSV to extract the real metrics, plus README with self-hosting instructions.",
      type: "Source Code + Analysis",
    },
  ];

  return (
    <section
      id="downloads"
      className="border-t border-border bg-gradient-to-br from-stone-950 to-emerald-950 text-stone-100"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
        <div className="text-center mb-12">
          <Badge
            variant="outline"
            className="mb-4 border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" /> Project Files
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Download & Self-Host</h2>
          <p className="mx-auto mt-3 max-w-2xl text-stone-400">
            All three project files are available for download below. Clone the website
            source from the project repository to host this page on your own server,
            GitHub Pages, Vercel, or Netlify.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {files.map((f) => {
            const Icon = f.icon;
            return (
              <Card
                key={f.name}
                className="flex flex-col border-stone-700 bg-stone-900/60 backdrop-blur transition-colors hover:border-emerald-500/50"
              >
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Icon className="h-6 w-6 text-emerald-400" />
                    </div>
                    <Badge variant="outline" className="border-stone-700 text-stone-400">
                      {f.size}
                    </Badge>
                  </div>
                  <CardTitle className="font-mono text-sm break-all text-stone-100">{f.name}</CardTitle>
                  <CardDescription className="text-stone-400">{f.type}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <p className="mb-4 text-xs leading-relaxed text-stone-400 flex-1">{f.desc}</p>
                  <Button asChild className="w-full bg-emerald-500 text-stone-950 hover:bg-emerald-400 mt-auto">
                    <a href={f.href} download>
                      <Download className="mr-2 h-4 w-4" /> Download
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 border-stone-700 bg-stone-900/40">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Github className="h-5 w-5 text-emerald-400" />
              <h3 className="font-semibold text-stone-100">How to self-host this website</h3>
            </div>
            <ol className="space-y-3 text-sm text-stone-300">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-300">1</span>
                <span>
                  Clone the project:{" "}
                  <code className="rounded bg-stone-800 px-1.5 py-0.5 font-mono text-xs text-emerald-300">
                    git clone &lt;repository&gt;
                  </code>{" "}
                  and install dependencies with{" "}
                  <code className="rounded bg-stone-800 px-1.5 py-0.5 font-mono text-xs text-emerald-300">
                    npm install
                  </code>{" "}
                  or{" "}
                  <code className="rounded bg-stone-800 px-1.5 py-0.5 font-mono text-xs text-emerald-300">
                    bun install
                  </code>
                  .
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-300">2</span>
                <span>
                  Run in development:{" "}
                  <code className="rounded bg-stone-800 px-1.5 py-0.5 font-mono text-xs text-emerald-300">
                    npm run dev
                  </code>
                  . Open <code className="rounded bg-stone-800 px-1.5 py-0.5 font-mono text-xs text-emerald-300">http://localhost:3000</code>.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-300">3</span>
                <span>
                  For a static build (recommended for GitHub Pages / Netlify / Vercel):{" "}
                  <code className="rounded bg-stone-800 px-1.5 py-0.5 font-mono text-xs text-emerald-300">
                    npm run build
                  </code>{" "}
                  then deploy the <code className="rounded bg-stone-800 px-1.5 py-0.5 font-mono text-xs text-emerald-300">.next</code> folder, or use the platform&rsquo;s Next.js adapter directly.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-300">4</span>
                <span>
                  The three downloadable files above live in{" "}
                  <code className="rounded bg-stone-800 px-1.5 py-0.5 font-mono text-xs text-emerald-300">
                    public/downloads/
                  </code>{" "}
                  — keep them in place so visitors can always reach them.
                </span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-stone-800 bg-stone-950 text-stone-400">
      <div className="mx-auto max-w-7xl px-6 py-8 text-sm">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-emerald-500" />
            <span>
              {projectMeta.title} · {projectMeta.author} ({projectMeta.studentId})
            </span>
          </div>
          <div className="text-xs text-stone-500">
            {projectMeta.institution} · {projectMeta.academicYear} · {projectMeta.course}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <StickyNav />
      <Hero />
      <Overview />
      <DatasetSection />
      <EDASection />
      <PreprocessingSection />
      <AssociationRulesSection />
      <ModelsSection />
      <EvaluationSection />
      <AuditAndErrorsSection />
      <ConclusionSection />
      <DownloadsSection />
      <Footer />
    </main>
  );
}
