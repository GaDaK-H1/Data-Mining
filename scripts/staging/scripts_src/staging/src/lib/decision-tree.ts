// Type definitions for the data exported by scripts/run_analysis.py
// and utilities for walking the exported Decision Tree in the browser.

export interface TreeNode {
  // Internal node:
  feature?: string;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  // Leaf node:
  leaf?: boolean;
  class?: string;
  samples?: number;
  distribution?: number[];
}

export interface ScalerExport {
  features: string[];
  mean: number[];
  scale: number[];
}

export interface SamplePuzzle {
  puzzleId: string;
  rating: number;
  difficulty: string;
  ratingDeviation: number;
  popularity: number;
  nbPlays: number;
  themes: string;
  fen: string;
  moves: string;
  gameUrl: string;
}

export interface ProjectResults {
  generatedAt: string;
  dataset: {
    totalRows: number;
    duplicateRows: number;
    missing: Record<string, number>;
    ratingStats: { min: number; max: number; mean: number; std: number; median: number };
    columns: { column: string; type: string }[];
  };
  difficultyClasses: { class: string; range: string; count: number; share: number }[];
  topThemes: { theme: string; count: number }[];
  totalThemes: number;
  numericCorrelation: { columns: string[]; matrix: number[][] };
  featureMatrix: {
    totalFeatures: number;
    numericMetadata: number;
    fenFeatures: number;
    themeFeatures: number;
    trainRows: number;
    testRows: number;
  };
  associationRules: {
    totalFrequentItemsets: number;
    totalRulesKept: number;
    rulesToEasy: number;
    rulesToMedium: number;
    rulesToHard: number;
    rulesToExpert: number;
    topRules: { antecedents: string; consequent: string; support: number; confidence: number; lift: number }[];
  };
  models: {
    randomForest: {
      accuracy: number;
      precision: number;
      recall: number;
      f1: number;
      confusionMatrix: number[][];
      perClassAccuracy: { class: string; accuracy: number }[];
      topFeatures: { feature: string; importance: number }[];
    };
    decisionTree: { accuracy: number; f1: number };
  };
  leakageAudit: {
    runA: { featureSet: string; accuracy: number; macroF1: number };
    runB: { featureSet: string; accuracy: number; macroF1: number };
    drop: { accuracy: number; macroF1: number };
  };
  errorAnalysis: {
    totalTest: number;
    misclassified: number;
    misclassifiedSamples: {
      puzzleId: string;
      rating: number;
      trueClass: string;
      predicted: string;
      themes: string;
    }[];
  };
  samplePuzzles: SamplePuzzle[];
  decisionTree: TreeNode;
  scaler: ScalerExport;
  featureNames: string[];
  classNames: string[];
}

/**
 * Walks the exported Decision Tree to predict a class for the given feature vector.
 *
 * `featureVector` is a map of feature name → value. For numeric features the value
 * should be in RAW (un-standardised) form — this function applies the scaler
 * internally before walking the tree, mirroring the sklearn pipeline.
 *
 * @returns the predicted class name AND the decision path as an array of
 *          { feature, threshold, value, direction } for visualisation.
 */
export function predictWithTree(
  tree: TreeNode,
  scaler: ScalerExport,
  featureVector: Record<string, number>
): { prediction: string; path: DecisionPathStep[]; distribution?: number[] } {
  const path: DecisionPathStep[] = [];
  // Apply scaler to the 17 numeric features (3 metadata + 14 FEN-derived).
  const standardised: Record<string, number> = { ...featureVector };
  for (let i = 0; i < scaler.features.length; i++) {
    const feat = scaler.features[i];
    if (feat in featureVector) {
      standardised[feat] = (featureVector[feat] - scaler.mean[i]) / scaler.scale[i];
    }
  }
  let node = tree;
  while (!node.leaf) {
    const feat = node.feature!;
    const threshold = node.threshold!;
    // Theme (binary) features use raw 0/1; numeric features use standardised value.
    const value = standardised[feat] ?? featureVector[feat] ?? 0;
    const goesLeft = value <= threshold;
    path.push({
      feature: feat,
      threshold,
      value,
      direction: goesLeft ? "left" : "right",
      standardised: feat in standardised,
    });
    node = goesLeft ? node.left! : node.right!;
  }
  return {
    prediction: node.class ?? "Unknown",
    path,
    distribution: node.distribution,
  };
}

export interface DecisionPathStep {
  feature: string;
  threshold: number;
  value: number;
  direction: "left" | "right";
  standardised: boolean;
}

/**
 * Parses a FEN string and extracts the 14 board features that the notebook's
 * `extract_fen_features` function computes. This is a pure-JS port so we can
 * build a feature vector for any puzzle directly in the browser.
 */
export function extractFenFeatures(fen: string): Record<string, number> {
  // Piece values
  const PV: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  let whiteMaterial = 0;
  let blackMaterial = 0;
  let whitePawns = 0;
  let blackPawns = 0;
  let totalPieces = 0;
  // King positions: track file (column 0-7) for each side
  let whiteKingFile = -1;
  let blackKingFile = -1;
  let whiteKingRank = -1;
  let blackKingRank = -1;
  let whiteCastled = 0;
  let whiteDoubled = 0;

  // FEN format: pieces side castling enPassant halfmove fullmove
  // pieces field: 8 ranks separated by '/', rank 8 first, columns a-h within rank
  const parts = fen.trim().split(/\s+/);
  if (parts.length < 1) return defaultFenFeatures();
  const pieceField = parts[0];
  const ranks = pieceField.split("/");
  if (ranks.length !== 8) return defaultFenFeatures();

  // Build an 8x8 board so we can compute attacks/mobility/check approximately
  // (we'll skip those and fall back to 0 for the more complex features).
  const board: (string | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let r = 0; r < 8; r++) {
    const rankStr = ranks[r];
    let col = 0;
    for (const ch of rankStr) {
      if (/\d/.test(ch)) {
        col += parseInt(ch, 10);
      } else {
        board[r][col] = ch;
        const piece = ch.toLowerCase();
        const isWhite = ch === ch.toUpperCase();
        if (piece === "k") {
          if (isWhite) {
            whiteKingFile = col;
            whiteKingRank = r;
          } else {
            blackKingFile = col;
            blackKingRank = r;
          }
        }
        if (PV[piece] !== undefined && piece !== "k") {
          if (isWhite) whiteMaterial += PV[piece];
          else blackMaterial += PV[piece];
        }
        if (piece === "p") {
          if (isWhite) whitePawns++;
          else blackPawns++;
        }
        totalPieces++;
        col++;
      }
    }
  }

  // White castled: king on files g (6) or h (7)
  if (whiteKingFile === 6 || whiteKingFile === 7) whiteCastled = 1;

  // Doubled pawns: count files with >1 white pawn
  const whitePawnFiles = Array(8).fill(0);
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === "P") whitePawnFiles[c]++;
    }
  }
  for (const cnt of whitePawnFiles) if (cnt > 1) whiteDoubled++;

  // King distance (Chebyshev)
  let kingDistance = 0;
  if (whiteKingFile >= 0 && blackKingFile >= 0) {
    kingDistance = Math.max(
      Math.abs(whiteKingFile - blackKingFile),
      Math.abs(whiteKingRank - blackKingRank)
    );
  }

  // Approximate legal move count: count pseudo-legal moves for the side to move.
  // (A full legal-move generator is complex; we approximate by counting moves
  // for pawns and knights, which captures most of the mobility signal.)
  const sideToMove = parts[1] || "w";
  const isWhiteTurn = sideToMove === "w" ? 1 : 0;
  let legalMoveCount = 0;
  let inCheck = 0; // simplified — we cannot detect check without a real generator
  let whiteKingAttackers = 0;
  let blackKingAttackers = 0;

  // Pawns: white pawns move up (towards rank 0 in our indexing since rank 8 is row 0)
  // Actually in our indexing: rank 8 = row 0 (top), rank 1 = row 7 (bottom).
  // White pawns move towards row 0 (rank 8), black pawns towards row 7 (rank 1).
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const isWhite = piece === piece.toUpperCase();
      const type = piece.toLowerCase();
      if (type === "p" && isWhite === (sideToMove === "w")) {
        const dir = isWhite ? -1 : 1;
        const nextRow = r + dir;
        if (nextRow >= 0 && nextRow < 8) {
          if (board[nextRow][c] === null) legalMoveCount++;
          if (c > 0 && board[nextRow][c - 1] && (board[nextRow][c - 1] === board[nextRow][c - 1]?.toUpperCase()) !== isWhite) legalMoveCount++;
          if (c < 7 && board[nextRow][c + 1] && (board[nextRow][c + 1] === board[nextRow][c + 1]?.toUpperCase()) !== isWhite) legalMoveCount++;
        }
      }
      if (type === "n" && isWhite === (sideToMove === "w")) {
        const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        for (const [dr, dc] of knightMoves) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const target = board[nr][nc];
            if (target === null || (target === target.toUpperCase()) !== isWhite) {
              legalMoveCount++;
            }
          }
        }
      }
    }
  }

  // Approximate king attackers: count enemy pieces within 2 squares of each king
  if (whiteKingFile >= 0) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;
        if (piece === piece.toLowerCase()) {  // black piece
          const dist = Math.max(Math.abs(r - whiteKingRank), Math.abs(c - whiteKingFile));
          if (dist <= 2) whiteKingAttackers++;
        }
      }
    }
  }
  if (blackKingFile >= 0) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;
        if (piece === piece.toUpperCase()) {  // white piece
          const dist = Math.max(Math.abs(r - blackKingRank), Math.abs(c - blackKingFile));
          if (dist <= 2) blackKingAttackers++;
        }
      }
    }
  }

  return {
    WhiteMaterial: whiteMaterial,
    BlackMaterial: blackMaterial,
    MaterialBalance: whiteMaterial - blackMaterial,
    TotalPieces: totalPieces,
    WhitePawns: whitePawns,
    BlackPawns: blackPawns,
    IsWhiteTurn: isWhiteTurn,
    LegalMoveCount: legalMoveCount,
    InCheck: inCheck,
    WhiteKingAttackers: whiteKingAttackers,
    BlackKingAttackers: blackKingAttackers,
    KingDistance: kingDistance,
    WhiteCastled: whiteCastled,
    WhiteDoubledPawns: whiteDoubled,
  };
}

function defaultFenFeatures(): Record<string, number> {
  return {
    WhiteMaterial: 0,
    BlackMaterial: 0,
    MaterialBalance: 0,
    TotalPieces: 0,
    WhitePawns: 0,
    BlackPawns: 0,
    IsWhiteTurn: 0,
    LegalMoveCount: 0,
    InCheck: 0,
    WhiteKingAttackers: 0,
    BlackKingAttackers: 0,
    KingDistance: 0,
    WhiteCastled: 0,
    WhiteDoubledPawns: 0,
  };
}
