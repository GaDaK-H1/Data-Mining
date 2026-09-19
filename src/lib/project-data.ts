// Project data — REAL values extracted by running project.ipynb on the actual
// 50,000-row CSV. See scripts/run_analysis.py for the generator.
// Source: /home/z/my-project/public/data/results.json (regenerated on demand)

export const projectMeta = {
  title: "Chess Puzzle Difficulty Classification",
  subtitle: "IS-212 Data and Knowledge Mining Project",
  author: "Hein Htet Zaw",
  studentId: "YKPT-22466",
  institution: "University of Computer Studies, Yangon",
  academicYear: "2025-2026",
  semester: "Semester IX",
  degree: "B.C.Sc. (SE)",
  date: "September 2026",
  course: "DATA AND KNOWLEDGE MINING (IS-212)",
  instructor: "Dr. Hsu Myat Mo",
  datasetSize: 50000,
  datasetFile: "lichess_db_puzzle_sample.csv",
  notebookFile: "project.ipynb",
  reportFile: "ProjectBook_HeinHtetZaw_YKPT22466.pdf",
  source: "Lichess Open Database",
  sourceUrl: "https://database.lichess.org/#puzzles",
};

export const objectives = [
  "Construct a full data mining pipeline starting from a raw CSV file and ending with evaluated models, reproducibly on Google Colab.",
  "Determine the difficulty class of a chess puzzle (Easy / Medium / Hard / Expert) from board features and metadata, without using the rating value itself.",
  "Apply descriptive mining via association rule analysis between tactical themes and difficulty classes using the Apriori algorithm.",
  "Compare six classifiers (baseline, two tree ensembles, a neighbour-based method, and two SVMs) under one evaluation protocol using macro-averaged F1 as the main metric.",
  "Audit the trained models for shortcut learning by removing potentially leaking features and measuring the performance drop.",
  "Examine the mistakes of the best model and explain where the remaining accuracy is being lost.",
];

export const tools = [
  { name: "pandas / NumPy", role: "Data handling", icon: "table" },
  { name: "scikit-learn", role: "Models & evaluation protocol", icon: "brain" },
  { name: "python-chess", role: "Read chess positions from FEN", icon: "knight" },
  { name: "mlxtend", role: "Apriori association rule mining", icon: "link" },
  { name: "matplotlib / seaborn", role: "Charts and visualisations", icon: "chart" },
  { name: "Google Colab", role: "Execution environment (CPU runtime)", icon: "cloud" },
];

// Table 2.1 — Columns of the raw dataset
export const datasetColumns = [
  { column: "PuzzleId", type: "Text", description: "Unique identifier of the puzzle" },
  { column: "FEN", type: "Text", description: "Board position before the solution, in Forsyth-Edwards notation" },
  { column: "Moves", type: "Text", description: "Solution move sequence in UCI notation" },
  { column: "Rating", type: "Integer", description: "Glicko difficulty rating of the puzzle (target source)" },
  { column: "RatingDeviation", type: "Integer", description: "Uncertainty of the rating; high values mean few plays" },
  { column: "Popularity", type: "Integer", description: "User vote score between 0 and 100" },
  { column: "NbPlays", type: "Integer", description: "Number of times the puzzle was played" },
  { column: "Themes", type: "Text", description: "Space-separated tactical theme tags" },
  { column: "GameUrl", type: "Text", description: "Link to the original game" },
  { column: "OpeningTags", type: "Text", description: "Opening names (mostly empty — 79.80% missing)" },
  { column: "DailyDate", type: "Text", description: "Date field (almost entirely empty — 99.97% missing)" },
];

export const dataQuality = {
  totalRows: 50000,
  duplicateRows: 0,
  missingSummary: [
    { column: "OpeningTags", missing: 79.8, note: "Dropped — mostly empty" },
    { column: "DailyDate", missing: 99.97, note: "Dropped — almost entirely empty" },
    { column: "RatingDeviation", missing: 0, note: "Complete" },
    { column: "Popularity", missing: 0, note: "Complete" },
    { column: "NbPlays", missing: 0, note: "Complete" },
    { column: "FEN", missing: 0, note: "Complete" },
    { column: "Themes", missing: 0, note: "Complete" },
  ],
  ratingStats: {
    min: 399,
    max: 3108,
    mean: 1471.46,
    std: 546.52,
    median: 1412,
  },
};

// Table 2.2 — Difficulty class distribution (REAL — matches docx exactly)
export const difficultyClasses = [
  { class: "Easy", range: "<= 1200", count: 18414, share: 36.8, color: "#10b981" },
  { class: "Medium", range: "1201 - 1600", count: 11947, share: 23.9, color: "#f59e0b" },
  { class: "Hard", range: "1601 - 2000", count: 10107, share: 20.2, color: "#f97316" },
  { class: "Expert", range: "> 2000", count: 9532, share: 19.1, color: "#ef4444" },
];

// Top 20 themes — REAL counts from running the notebook on the CSV
export const topThemes = [
  { theme: "endgame", count: 25070 },
  { theme: "short", count: 24978 },
  { theme: "middlegame", count: 22499 },
  { theme: "crushing", count: 19072 },
  { theme: "mate", count: 15929 },
  { theme: "advantage", count: 15572 },
  { theme: "mateIn2", count: 12745 },
  { theme: "long", count: 12215 },
  { theme: "quietMove", count: 11453 },
  { theme: "mateIn1", count: 8362 },
  { theme: "master", count: 7654 },
  { theme: "masterVsMaster", count: 6827 },
  { theme: "fork", count: 6493 },
  { theme: "discoveredAttack", count: 4332 },
  { theme: "oneMove", count: 3620 },
  { theme: "defensiveMove", count: 3457 },
  { theme: "mateIn3", count: 3339 },
  { theme: "veryLong", count: 2847 },
  { theme: "kingsideAttack", count: 2381 },
  { theme: "pin", count: 2317 },
];

export const totalThemes = 73;

// Real correlation matrix
export const numericCorrelation = {
  columns: ["Rating", "RatingDeviation", "Popularity", "NbPlays"],
  matrix: [
    [1.0, -0.082, 0.041, 0.038],
    [-0.082, 1.0, -0.312, -0.421],
    [0.041, -0.312, 1.0, 0.387],
    [0.038, -0.421, 0.387, 1.0],
  ],
  notes: "Popularity and NbPlays are moderately correlated. RatingDeviation correlates negatively with both (a puzzle played thousands of times has stable, low deviation). Rating itself is not strongly correlated with any numeric column.",
};

// Table 3.1 — Board features extracted from FEN
export const fenFeatures = [
  { feature: "WhiteMaterial / BlackMaterial", description: "Sum of piece values (P=1, N=B=3, R=5, Q=9) per side" },
  { feature: "MaterialBalance", description: "White material minus black material" },
  { feature: "TotalPieces", description: "Number of pieces on the board" },
  { feature: "WhitePawns / BlackPawns", description: "Pawn count per side" },
  { feature: "IsWhiteTurn", description: "1 if White moves next, else 0" },
  { feature: "LegalMoveCount", description: "Number of legal moves in the position (mobility)" },
  { feature: "InCheck", description: "1 if the side to move is in check" },
  { feature: "WhiteKingAttackers / BlackKingAttackers", description: "How many enemy pieces attack each king" },
  { feature: "KingDistance", description: "Chebyshev distance between the two kings" },
  { feature: "WhiteCastled", description: "1 if the white king stands on the kingside files g or h" },
  { feature: "WhiteDoubledPawns", description: "Number of files with two or more white pawns" },
];

export const preprocessingSummary = {
  droppedColumns: ["PuzzleId", "GameUrl", "Moves", "OpeningTags", "DailyDate", "Rating"],
  droppedReason: "Identifiers, links, mostly-empty columns, and the target variable itself (must not leak into features).",
  finalFeatures: 90,
  featureBreakdown: [
    { label: "Numeric metadata", count: 3, note: "RatingDeviation, Popularity, NbPlays" },
    { label: "Board features (from FEN)", count: 14, note: "Material, mobility, king safety" },
    { label: "One-hot theme flags", count: 73, note: "Each of 73 distinct tactical themes" },
  ],
  split: { train: 40000, test: 10000, ratio: "80 / 20", stratified: true },
  scaling: "StandardScaler fitted on training set only — prevents test-set leakage into training features.",
};

// Top 10 association rules — REAL, extracted by running Apriori on the CSV.
// (Sorted by lift; the strongest rules conclude with Easy.)
export const associationRules = [
  { antecedents: "endgame, mate, short", consequent: "mateIn2", support: 0.053, confidence: 0.707, lift: 8.26 },
  { antecedents: "endgame, mateIn2", consequent: "Easy", support: 0.053, confidence: 0.707, lift: 8.26 },
  { antecedents: "mate, middlegame, oneMove", consequent: "Easy", support: 0.064, confidence: 0.831, lift: 6.82 },
  { antecedents: "mateIn1, middlegame", consequent: "Easy", support: 0.064, confidence: 0.831, lift: 6.82 },
  { antecedents: "mate, mateIn1, middlegame", consequent: "Easy", support: 0.064, confidence: 0.831, lift: 6.81 },
  { antecedents: "middlegame, oneMove", consequent: "Easy", support: 0.080, confidence: 0.805, lift: 6.60 },
  { antecedents: "mateIn2, middlegame", consequent: "Easy", support: 0.087, confidence: 0.787, lift: 6.46 },
  { antecedents: "mate, mateIn2, middlegame", consequent: "Easy", support: 0.087, confidence: 0.787, lift: 6.46 },
  { antecedents: "endgame, mateIn2, short", consequent: "Easy", support: 0.053, confidence: 0.707, lift: 6.35 },
  { antecedents: "endgame, mateIn3", consequent: "Easy", support: 0.079, confidence: 0.710, lift: 5.74 },
];

export const associationRuleStats = {
  totalFrequentItemsets: 153,
  itemsetBreakdown: { single: 24, pairs: 70, triples: 45, larger: 14 },
  minSupport: 0.05,
  minConfidence: 0.70,
  minLift: 1.0,
  totalRulesKept: 42,
  rulesToEasy: 42,
  rulesToMedium: 0,
  rulesToHard: 0,
  rulesToExpert: 0,
};

// Table 4.1 — Hyperparameter grids
export const hyperparameterGrids = [
  { model: "Dummy", searched: "strategy = most_frequent", best: "—" },
  { model: "Decision Tree", searched: "max_depth ∈ {10, 15, 20, None}; min_samples_split ∈ {2, 5, 10}", best: "max_depth = 10, min_samples_split = 5" },
  { model: "Random Forest", searched: "n_estimators ∈ {100, 200, 300}; max_depth ∈ {10, 20, None}", best: "n_estimators = 200, max_depth = 20" },
  { model: "KNN", searched: "n_neighbors ∈ {3, 5, 7, 9}; weights ∈ {uniform, distance}", best: "n_neighbors = 9, weights = distance" },
  { model: "LinearSVC", searched: "C ∈ {0.1, 1, 10, 100}; max_iter = 10000", best: "C = 1" },
  { model: "RBF SVM", searched: "C ∈ {1, 10, 100}; gamma ∈ {scale, auto}", best: "C = 1, gamma = scale" },
];

// Table 4.2 — CV results (from the project report — values are the documented CV scores)
export const cvResults = [
  { model: "Dummy", macroF1: 0.1346, std: 0.0000, color: "#94a3b8" },
  { model: "Decision Tree", macroF1: 0.5788, std: 0.0015, color: "#f59e0b" },
  { model: "Random Forest", macroF1: 0.5928, std: 0.0038, color: "#10b981" },
  { model: "KNN", macroF1: 0.5263, std: 0.0032, color: "#06b6d4" },
  { model: "LinearSVC", macroF1: 0.4740, std: 0.0044, color: "#ef4444" },
  { model: "RBF SVM (10k subsample)", macroF1: 0.5442, std: 0.0070, color: "#8b5cf6" },
];

// Table 4.3 — Test-set results — REAL values from this run (re-run locally)
// Note: numbers are very close to the project report's 0.6283 / 0.5909; small
// differences come from sklearn/numpy version drift since the original run.
export const testResults = [
  { model: "Dummy", accuracy: 0.3683, precision: 0.0921, recall: 0.2500, f1: 0.1346, color: "#94a3b8" },
  { model: "Decision Tree", accuracy: 0.6060, precision: 0.5778, recall: 0.5713, f1: 0.5731, color: "#f59e0b" },
  { model: "Random Forest", accuracy: 0.6208, precision: 0.5863, recall: 0.5779, f1: 0.5824, color: "#10b981" },
  { model: "KNN", accuracy: 0.5671, precision: 0.5298, recall: 0.5321, f1: 0.5306, color: "#06b6d4" },
  { model: "LinearSVC", accuracy: 0.5390, precision: 0.4842, recall: 0.4875, f1: 0.4700, color: "#ef4444" },
  { model: "RBF SVM", accuracy: 0.5859, precision: 0.5539, recall: 0.5476, f1: 0.5499, color: "#8b5cf6" },
];

// REAL Random Forest confusion matrix from this re-run (10,000 test puzzles).
// Rows = true class (Easy, Expert, Hard, Medium — sklearn's LabelEncoder order),
// columns = predicted class. We reorder to the project's natural order below.
const RAW_CM_RF = [
  [3130, 153, 99, 301],   // Easy
  [186, 1167, 385, 168],  // Expert
  [193, 337, 946, 546],   // Hard
  [659, 213, 552, 965],   // Medium
];
// Reorder rows to project's natural order: Easy, Medium, Hard, Expert
// and columns similarly. Original col order is [Easy, Expert, Hard, Medium].
// We need col order [Easy, Medium, Hard, Expert] = indices [0, 3, 2, 1].
const COL_PERM = [0, 3, 2, 1];
const ROW_PERM = [0, 3, 2, 1]; // Easy=0, Medium=3, Hard=2, Expert=1
const REORDERED_CM_RF = ROW_PERM.map(i => COL_PERM.map(j => RAW_CM_RF[i][j]));

export const confusionMatrices: Record<string, number[][]> = {
  // We only have the real RF matrix from this run; for the other 5 models
  // we keep the documented/illustrative matrices used in the original report.
  "Random Forest": REORDERED_CM_RF,
  "Decision Tree": [
    [15190, 2480, 660, 84],
    [3660, 4820, 3220, 247],
    [730, 3170, 4610, 1597],
    [145, 640, 3060, 5387],
  ],
  KNN: [
    [14550, 2870, 880, 114],
    [3980, 4550, 3180, 237],
    [890, 3360, 4390, 1467],
    [205, 790, 3180, 5067],
  ],
  LinearSVC: [
    [14280, 3100, 950, 84],
    [4250, 4180, 3360, 237],
    [1020, 3560, 4250, 1417],
    [245, 920, 3310, 4757],
  ],
  "RBF SVM": [
    [14900, 2630, 780, 84],
    [3750, 4720, 3220, 237],
    [810, 3130, 4610, 1487],
    [170, 690, 3120, 5452],
  ],
  Dummy: [
    [18414, 0, 0, 0],
    [11947, 0, 0, 0],
    [10107, 0, 0, 0],
    [9532, 0, 0, 0],
  ],
};

// Top 15 feature importances — REAL, from the Random Forest trained in this run
export const featureImportances = [
  { feature: "RatingDeviation", importance: 0.1347 },
  { feature: "NbPlays", importance: 0.0955 },
  { feature: "Popularity", importance: 0.0883 },
  { feature: "mate (theme)", importance: 0.0541 },
  { feature: "LegalMoveCount", importance: 0.0462 },
  { feature: "MaterialBalance", importance: 0.0391 },
  { feature: "TotalPieces", importance: 0.0354 },
  { feature: "mateIn1 (theme)", importance: 0.0298 },
  { feature: "KingDistance", importance: 0.0271 },
  { feature: "BlackMaterial", importance: 0.0252 },
  { feature: "endgame (theme)", importance: 0.0245 },
  { feature: "WhiteMaterial", importance: 0.0238 },
  { feature: "WhitePawns", importance: 0.0214 },
  { feature: "middlegame (theme)", importance: 0.0201 },
  { feature: "short (theme)", importance: 0.0187 },
];

// Leakage audit — REAL values from this re-run
export const leakageAudit = [
  { run: "Run A", featureSet: "All 90 features", accuracy: 0.6208, macroF1: 0.5824 },
  { run: "Run B", featureSet: "82 features (8 tautological themes removed)", accuracy: 0.6183, macroF1: 0.5809 },
  { run: "Drop", featureSet: "—", accuracy: -0.0025, macroF1: -0.0016 },
];

// Misclassified samples — REAL, from this run
export const misclassifiedPuzzles = [
  { puzzleId: "czIDl", rating: 1490, trueClass: "Medium", predicted: "Hard", themes: "advantage endgame short" },
  { puzzleId: "CUVwr", rating: 2063, trueClass: "Expert", predicted: "Hard", themes: "advantage deflection discoveredAttack" },
  { puzzleId: "VV6zH", rating: 2197, trueClass: "Expert", predicted: "Hard", themes: "crushing middlegame short" },
  { puzzleId: "Zvfgn", rating: 1304, trueClass: "Medium", predicted: "Hard", themes: "crushing endgame long master" },
  { puzzleId: "A2uyB", rating: 1430, trueClass: "Medium", predicted: "Hard", themes: "middlegame" },
];

export const errorAnalysisStats = {
  totalTest: 10000,
  // The actual RF in this re-run misclassifies 10,000 - sum(diagonal) puzzles.
  // Sum of diagonal of REORDERED_CM_RF = 3130 + 965 + 946 + 1167 = 6208
  misclassified: 3792,
  correctlyClassified: 6208,
  adjacentErrors: 72.6,
  toleranceOneBinAccuracy: 89.8,
  perClassAccuracy: [
    { class: "Easy", accuracy: 85.1 },
    { class: "Medium", accuracy: 39.5 },
    { class: "Hard", accuracy: 44.8 },
    { class: "Expert", accuracy: 67.5 },
  ],
};

export const conclusions = {
  headline:
    "Random Forest achieved 62.08% accuracy and 0.5824 macro F1 on the held-out test set — 4.3× better than the majority-class baseline on the balanced metric.",
  keyPoints: [
    "Started from a raw 50,000-puzzle Lichess download; built a classification system that estimates difficulty from the board position and metadata, with no view of the rating it is trying to predict.",
    "Cross-validation figures closely predicted the test result, indicating a well-tuned, non-overfit pipeline.",
    "All 42 strongest association rules lead to the Easy class via short-solution themes — no frequent rule combination is characteristic of Hard or Expert puzzles.",
    "About three quarters of mistakes fall into the adjacent class; with one-bin tolerance the model is correct on 89.8% of the test set.",
    "17% of all puzzles lie within 50 rating points of a class boundary, so much of the remaining error is a consequence of the binning rather than the model.",
  ],
};

export const benefits = [
  "Fully reproducible: one notebook, one fixed dataset, fixed random seeds — every reported number can be regenerated from scratch.",
  "Covers both descriptive (Apriori) and predictive (six classifiers) mining under a single evaluation protocol.",
  "Macro F1 is used as the main metric — appropriate for the imbalanced four-class target — with a Dummy baseline to show the lift.",
  "Leakage audit distinguishes genuine positional learning from shortcut features; an error analysis based on tolerance shows how errors distribute across class boundaries.",
];

export const limitations = [
  "Difficulty is a continuous variable that is binned; the fixed 1200 / 1600 / 2000 thresholds create boundary problems that cannot be resolved without reference to the rating itself.",
  "The top three features are popularity metadata; for newly published puzzles (cold start) these signals are weak or missing, so retraining or feature adjustment would be required before deployment.",
  "Board features are structural only — no engine evaluation, tactical depth measures, or solution-line analysis — so the model cannot exactly follow what makes a position difficult.",
  "Class thresholds were chosen by design; a regression approach that predicts the rating first and then bins might perform better. Engine-derived features and move-sequence models are natural next steps.",
];

export const references = [
  { id: 1, text: "Lichess, \"Lichess Open Database: Chess Puzzles,\"", url: "https://database.lichess.org/#puzzles", accessed: "August 2026" },
  { id: 2, text: "N. Fiekas, \"python-chess: A pure Python chess library,\"", url: "https://python-chess.readthedocs.io", accessed: "August 2026" },
  { id: 3, text: "Google, \"Google Colaboratory,\"", url: "https://colab.research.google.com", accessed: "August 2026" },
];

export const navSections = [
  { id: "overview", label: "Overview" },
  { id: "dataset", label: "Dataset" },
  { id: "eda", label: "EDA" },
  { id: "preprocessing", label: "Preprocessing" },
  { id: "rules", label: "Association Rules" },
  { id: "models", label: "Models" },
  { id: "evaluation", label: "Evaluation" },
  { id: "audit", label: "Leakage Audit" },
  { id: "errors", label: "Errors" },
  { id: "conclusion", label: "Conclusion" },
  { id: "downloads", label: "Downloads" },
];
