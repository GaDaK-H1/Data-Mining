#!/usr/bin/env python3
"""
Run the actual analysis from project.ipynb on the real CSV dataset.
Extracts real statistics, trains real models, runs Apriori, and exports
everything as JSON for the website to consume.

This script mirrors the cells of project.ipynb but persists results to disk
instead of displaying them inline.
"""
import json
import os
import warnings
from collections import Counter

import numpy as np
import pandas as pd
import chess
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder, MultiLabelBinarizer
from sklearn.tree import DecisionTreeClassifier, _tree
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)
from mlxtend.frequent_patterns import apriori, association_rules

warnings.filterwarnings("ignore")

CSV_PATH = "/home/z/my-project/upload/lichess_db_puzzle_sample.csv"
OUT_DIR = "/home/z/my-project/public/data"
os.makedirs(OUT_DIR, exist_ok=True)

print("=" * 60)
print("Loading CSV...")
df = pd.read_csv(CSV_PATH)
print(f"  rows: {len(df)}")
print(f"  cols: {list(df.columns)}")

# ─── Difficulty assignment (mirrors notebook cell 10) ─────────────────────────
def assign_difficulty(rating):
    if rating <= 1200:
        return "Easy"
    elif rating <= 1600:
        return "Medium"
    elif rating <= 2000:
        return "Hard"
    else:
        return "Expert"


df["Difficulty"] = df["Rating"].apply(assign_difficulty)
diff_order = ["Easy", "Medium", "Hard", "Expert"]

# ─── 1. Basic dataset stats ────────────────────────────────────────────────────
print("\n[1/8] Dataset stats...")
rating_stats = {
    "min": int(df["Rating"].min()),
    "max": int(df["Rating"].max()),
    "mean": round(float(df["Rating"].mean()), 2),
    "std": round(float(df["Rating"].std()), 2),
    "median": int(df["Rating"].median()),
}

missing = {col: round(float(df[col].isnull().sum() / len(df) * 100), 2) for col in df.columns}
duplicates = int(df.duplicated().sum())

# ─── 2. Difficulty class distribution ──────────────────────────────────────────
print("[2/8] Difficulty class distribution...")
diff_counts = df["Difficulty"].value_counts().reindex(diff_order)
difficulty_classes = [
    {
        "class": c,
        "range": r,
        "count": int(diff_counts[c]),
        "share": round(float(diff_counts[c] / len(df) * 100), 1),
    }
    for c, r in zip(diff_order, ["<= 1200", "1201 - 1600", "1601 - 2000", "> 2000"])
]

# ─── 3. Top 20 themes (REAL counts) ────────────────────────────────────────────
print("[3/8] Top 20 themes...")
theme_lists = df["Themes"].fillna("").str.split()
all_themes = [t for themes in theme_lists for t in themes if t]
theme_counter = Counter(all_themes)
top_themes = [
    {"theme": t, "count": int(c)}
    for t, c in theme_counter.most_common(20)
]
total_themes = len(theme_counter)
print(f"  total distinct themes: {total_themes}")

# ─── 4. Numeric correlation (REAL) ─────────────────────────────────────────────
print("[4/8] Numeric correlations...")
num_cols = ["Rating", "RatingDeviation", "Popularity", "NbPlays"]
corr_df = df[num_cols].corr()
numeric_correlation = {
    "columns": num_cols,
    "matrix": [[round(float(corr_df.iloc[i, j]), 3) for j in range(len(num_cols))] for i in range(len(num_cols))],
}

# ─── 5. FEN feature extraction (mirrors notebook cell 15) ──────────────────────
print("[5/8] Extracting FEN features (this takes ~30s)...")


def extract_fen_features(fen):
    try:
        board = chess.Board(fen)
        piece_values = {chess.PAWN: 1, chess.KNIGHT: 3, chess.BISHOP: 3,
                        chess.ROOK: 5, chess.QUEEN: 9, chess.KING: 0}

        def material(color):
            return (
                sum(piece_values[chess.KNIGHT] for _ in board.pieces(chess.KNIGHT, color))
                + sum(piece_values[chess.BISHOP] for _ in board.pieces(chess.BISHOP, color))
                + sum(piece_values[chess.ROOK] for _ in board.pieces(chess.ROOK, color))
                + sum(piece_values[chess.QUEEN] for _ in board.pieces(chess.QUEEN, color))
                + sum(1 for _ in board.pieces(chess.PAWN, color))
            )

        white_material = material(chess.WHITE)
        black_material = material(chess.BLACK)
        white_pawns = len(list(board.pieces(chess.PAWN, chess.WHITE)))
        black_pawns = len(list(board.pieces(chess.PAWN, chess.BLACK)))
        white_king = board.king(chess.WHITE)
        black_king = board.king(chess.BLACK)
        king_distance = 0
        if white_king is not None and black_king is not None:
            king_distance = chess.square_distance(white_king, black_king)
        white_attackers = 0
        black_attackers = 0
        if white_king is not None:
            white_attackers = len(board.attackers(chess.BLACK, white_king))
        if black_king is not None:
            black_attackers = len(board.attackers(chess.WHITE, black_king))
        total_pieces = sum(1 for _ in board.piece_map())
        white_castled = 0
        if white_king is not None:
            white_castled = 1 if chess.square_file(white_king) in [6, 7] else 0
        white_doubled = 0
        for file_idx in range(8):
            pawns_on_file = [p for p in board.pieces(chess.PAWN, chess.WHITE) if chess.square_file(p) == file_idx]
            if len(pawns_on_file) > 1:
                white_doubled += 1
        return {
            "WhiteMaterial": white_material,
            "BlackMaterial": black_material,
            "MaterialBalance": white_material - black_material,
            "TotalPieces": total_pieces,
            "WhitePawns": white_pawns,
            "BlackPawns": black_pawns,
            "IsWhiteTurn": 1 if board.turn == chess.WHITE else 0,
            "LegalMoveCount": board.legal_moves.count(),
            "InCheck": 1 if board.is_check() else 0,
            "WhiteKingAttackers": black_attackers,
            "BlackKingAttackers": white_attackers,
            "KingDistance": king_distance,
            "WhiteCastled": white_castled,
            "WhiteDoubledPawns": white_doubled,
        }
    except Exception:
        return {
            "WhiteMaterial": 0, "BlackMaterial": 0, "MaterialBalance": 0,
            "TotalPieces": 0, "WhitePawns": 0, "BlackPawns": 0,
            "IsWhiteTurn": 0, "LegalMoveCount": 0, "InCheck": 0,
            "WhiteKingAttackers": 0, "BlackKingAttackers": 0,
            "KingDistance": 0, "WhiteCastled": 0, "WhiteDoubledPawns": 0,
        }


fen_features_list = df["FEN"].apply(extract_fen_features)
fen_features = pd.DataFrame(list(fen_features_list))
print(f"  features extracted: {fen_features.shape}")

# ─── 6. Build feature matrix (90 cols = 3 metadata + 14 FEN + 73 themes) ──────
print("[6/8] Building feature matrix...")
mlb = MultiLabelBinarizer()
theme_binary = mlb.fit_transform(theme_lists.apply(lambda x: [t for t in x if t]))
theme_df = pd.DataFrame(theme_binary, columns=mlb.classes_)
print(f"  theme features: {theme_df.shape}")

X_numerical = df[["RatingDeviation", "Popularity", "NbPlays"]].copy().reset_index(drop=True)
X = pd.concat(
    [X_numerical, fen_features.reset_index(drop=True), theme_df.reset_index(drop=True)],
    axis=1,
)
y = df["Difficulty"].copy()
print(f"  final feature matrix: {X.shape}")

# ─── 7. Train/test split + scaling ─────────────────────────────────────────────
print("[7/8] Splitting + scaling...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
le = LabelEncoder()
y_train_enc = le.fit_transform(y_train)
y_test_enc = le.transform(y_test)
class_names = list(le.classes_)
print(f"  classes: {class_names}")

scaler = StandardScaler()
num_features = ["RatingDeviation", "Popularity", "NbPlays"] + list(fen_features.columns)
X_train = X_train.copy()
X_test = X_test.copy()
X_train[num_features] = scaler.fit_transform(X_train[num_features])
X_test[num_features] = scaler.transform(X_test[num_features])

# Convert to float32 to save memory + speed up (mirrors notebook cell 24)
X_train_f32 = X_train.astype(np.float32)
X_test_f32 = X_test.astype(np.float32)

# ─── 8. Train Decision Tree + Random Forest ────────────────────────────────────
print("[8/8] Training models (this takes ~3 min for RF)...")
print("  training Decision Tree...")
dt = DecisionTreeClassifier(max_depth=10, min_samples_split=5, random_state=42)
dt.fit(X_train_f32, y_train_enc)
dt_pred = dt.predict(X_test_f32)
dt_acc = accuracy_score(y_test_enc, dt_pred)
dt_f1 = f1_score(y_test_enc, dt_pred, average="macro")
print(f"  DT: acc={dt_acc:.4f} f1={dt_f1:.4f}")

print("  training Random Forest (200 trees)...")
rf = RandomForestClassifier(n_estimators=200, max_depth=20, random_state=42, n_jobs=-1)
rf.fit(X_train_f32, y_train_enc)
rf_pred = rf.predict(X_test_f32)
rf_acc = accuracy_score(y_test_enc, rf_pred)
rf_f1 = f1_score(y_test_enc, rf_pred, average="macro")
rf_prec = precision_score(y_test_enc, rf_pred, average="macro")
rf_rec = recall_score(y_test_enc, rf_pred, average="macro")
print(f"  RF: acc={rf_acc:.4f} f1={rf_f1:.4f}")

# Real confusion matrix for RF
cm_rf = confusion_matrix(y_test_enc, rf_pred)
cm_rf_list = cm_rf.tolist()

# Real feature importances from RF
importances = pd.Series(rf.feature_importances_, index=X_train.columns)
top15_features = [
    {"feature": f, "importance": round(float(v), 4)}
    for f, v in importances.nlargest(15).items()
]

# ─── Apriori on real data ──────────────────────────────────────────────────────
print("\nRunning Apriori...")
theme_assoc = theme_df.copy().astype(bool)
diff_onehot = pd.get_dummies(df["Difficulty"], prefix="Diff").astype(bool)
theme_assoc = pd.concat([theme_assoc, diff_onehot], axis=1)

frequent = apriori(theme_assoc, min_support=0.05, use_colnames=True, low_memory=True)
print(f"  frequent itemsets: {len(frequent)}")

rules = association_rules(frequent, metric="confidence", min_threshold=0.70)
rules = rules[rules["lift"] > 1.0]
diff_cols = {"Diff_Easy", "Diff_Medium", "Diff_Hard", "Diff_Expert"}
rules = rules[rules["consequents"].apply(lambda s: any(c in diff_cols for c in s))]
rules = rules.sort_values("lift", ascending=False)
print(f"  kept rules (difficulty in consequent): {len(rules)}")

top_rules = []
for _, r in rules.head(20).iterrows():
    top_rules.append({
        "antecedents": ", ".join(sorted([c.replace("Diff_", "") if c.startswith("Diff_") else c for c in r["antecedents"]])),
        "consequent": next(iter(r["consequents"])).replace("Diff_", ""),
        "support": round(float(r["support"]), 3),
        "confidence": round(float(r["confidence"]), 3),
        "lift": round(float(r["lift"]), 2),
    })

# ─── Export single decision tree as JSON for in-browser predictor ─────────────
print("\nExporting decision tree as JSON for in-browser predictor...")


def tree_to_json(tree, feature_names, class_names):
    """Recursively export sklearn tree to a JSON structure walkable in JS."""
    tree_ = tree.tree_
    feature_names = list(feature_names)

    def recurse(node):
        if tree_.feature[node] != _tree.TREE_UNDEFINED:
            return {
                "feature": feature_names[tree_.feature[node]],
                "threshold": round(float(tree_.threshold[node]), 4),
                "left": recurse(tree_.children_left[node]),
                "right": recurse(tree_.children_right[node]),
            }
        else:
            # In sklearn >=1.4, tree_.value[node][0] holds class *probabilities*
            # (summing to 1.0 for unweighted samples) rather than raw counts.
            # Multiply by n_node_samples to get the actual integer counts.
            probs = tree_.value[node][0]
            n_samples = int(tree_.n_node_samples[node])
            counts = (probs * n_samples).astype(int)
            predicted = int(np.argmax(counts))
            return {
                "leaf": True,
                "class": class_names[predicted],
                "samples": n_samples,
                "distribution": [int(v) for v in counts],
            }

    return recurse(0)


tree_json = tree_to_json(dt, X_train.columns, class_names)

# Also export the scaler means/scales for the 17 numeric features so the
# browser can standardise inputs the same way before walking the tree.
scaler_export = {
    "features": num_features,
    "mean": [round(float(m), 4) for m in scaler.mean_],
    "scale": [round(float(s), 4) for s in scaler.scale_],
}

# ─── Sample 500 puzzles for the Data Explorer ──────────────────────────────────
print("\nSampling 500 puzzles for Data Explorer...")
sample_df = df.sample(n=500, random_state=42).reset_index(drop=True)
sample_puzzles = []
for i, row in sample_df.iterrows():
    sample_puzzles.append({
        "puzzleId": row["PuzzleId"],
        "rating": int(row["Rating"]),
        "difficulty": row["Difficulty"],
        "ratingDeviation": int(row["RatingDeviation"]),
        "popularity": int(row["Popularity"]),
        "nbPlays": int(row["NbPlays"]),
        "themes": row["Themes"] if pd.notna(row["Themes"]) else "",
        "fen": row["FEN"],
        "moves": row["Moves"],
        "gameUrl": row["GameUrl"],
    })

# ─── Leakage audit (Run A vs Run B) ────────────────────────────────────────────
print("\nRunning leakage audit...")
tautological = ["mateIn1", "mateIn2", "mateIn3", "mateIn4", "mateIn5", "oneMove", "short", "long"]
non_taut_cols = [c for c in theme_df.columns if c not in tautological]
X_runB = X[[c for c in X.columns if c not in tautological]].copy()
print(f"  Run A: {X.shape[1]} features, Run B: {X_runB.shape[1]} features")
X_trB, X_teB, y_trB, y_teB = train_test_split(X_runB, y, test_size=0.2, random_state=42, stratify=y)
y_trB_enc = le.transform(y_trB)
y_teB_enc = le.transform(y_teB)
scalerB = StandardScaler()
num_f_B = [c for c in num_features if c in X_trB.columns]
X_trB = X_trB.copy()
X_teB = X_teB.copy()
X_trB[num_f_B] = scalerB.fit_transform(X_trB[num_f_B])
X_teB[num_f_B] = scalerB.transform(X_teB[num_f_B])
rfB = RandomForestClassifier(n_estimators=200, max_depth=20, random_state=42, n_jobs=-1)
rfB.fit(X_trB.astype(np.float32), y_trB_enc)
accA = rf_acc  # already computed
f1A = rf_f1
accB = accuracy_score(y_teB_enc, rfB.predict(X_teB.astype(np.float32)))
f1B = f1_score(y_teB_enc, rfB.predict(X_teB.astype(np.float32)), average="macro")
print(f"  Run A: acc={accA:.4f} f1={f1A:.4f}")
print(f"  Run B: acc={accB:.4f} f1={f1B:.4f}")

# ─── Misclassified sample ──────────────────────────────────────────────────────
print("\nCollecting misclassified samples...")
misclassified_idx = np.where(rf_pred != y_test_enc)[0]
sample_idx = np.random.RandomState(42).choice(misclassified_idx, size=min(20, len(misclassified_idx)), replace=False)
misclassified = []
for i, idx in enumerate(sample_idx):
    orig_idx = X_test.index[idx]
    row = df.loc[orig_idx]
    misclassified.append({
        "puzzleId": row["PuzzleId"],
        "rating": int(row["Rating"]),
        "trueClass": row["Difficulty"],
        "predicted": class_names[rf_pred[idx]],
        "themes": row["Themes"] if pd.notna(row["Themes"]) else "",
    })

# Per-class accuracy from the RF confusion matrix
per_class_acc = []
for i, c in enumerate(class_names):
    total = cm_rf[i].sum()
    correct = cm_rf[i][i]
    per_class_acc.append({"class": c, "accuracy": round(float(correct / total * 100), 1) if total > 0 else 0})

# ─── Write everything to results.json ──────────────────────────────────────────
print("\n" + "=" * 60)
print("Writing results.json...")

results = {
    "generatedAt": "2026-09-13",
    "dataset": {
        "totalRows": int(len(df)),
        "duplicateRows": duplicates,
        "missing": missing,
        "ratingStats": rating_stats,
        "columns": [
            {"column": c, "type": str(t)} for c, t in df.dtypes.items()
        ],
    },
    "difficultyClasses": difficulty_classes,
    "topThemes": top_themes,
    "totalThemes": total_themes,
    "numericCorrelation": numeric_correlation,
    "featureMatrix": {
        "totalFeatures": int(X.shape[1]),
        "numericMetadata": 3,
        "fenFeatures": 14,
        "themeFeatures": int(theme_df.shape[1]),
        "trainRows": int(X_train.shape[0]),
        "testRows": int(X_test.shape[0]),
    },
    "associationRules": {
        "totalFrequentItemsets": int(len(frequent)),
        "totalRulesKept": int(len(rules)),
        "rulesToEasy": int((rules["consequents"].apply(lambda s: "Diff_Easy" in s)).sum()),
        "rulesToMedium": int((rules["consequents"].apply(lambda s: "Diff_Medium" in s)).sum()),
        "rulesToHard": int((rules["consequents"].apply(lambda s: "Diff_Hard" in s)).sum()),
        "rulesToExpert": int((rules["consequents"].apply(lambda s: "Diff_Expert" in s)).sum()),
        "topRules": top_rules,
    },
    "models": {
        "randomForest": {
            "accuracy": round(float(rf_acc), 4),
            "precision": round(float(rf_prec), 4),
            "recall": round(float(rf_rec), 4),
            "f1": round(float(rf_f1), 4),
            "confusionMatrix": cm_rf_list,
            "perClassAccuracy": per_class_acc,
            "topFeatures": top15_features,
        },
        "decisionTree": {
            "accuracy": round(float(dt_acc), 4),
            "f1": round(float(dt_f1), 4),
        },
    },
    "leakageAudit": {
        "runA": {
            "featureSet": "All 90 features",
            "accuracy": round(float(accA), 4),
            "macroF1": round(float(f1A), 4),
        },
        "runB": {
            "featureSet": f"{X_runB.shape[1]} features (8 tautological themes removed)",
            "accuracy": round(float(accB), 4),
            "macroF1": round(float(f1B), 4),
        },
        "drop": {
            "accuracy": round(float(accA - accB), 4),
            "macroF1": round(float(f1A - f1B), 4),
        },
    },
    "errorAnalysis": {
        "totalTest": int(len(y_test_enc)),
        "misclassified": int(len(misclassified_idx)),
        "misclassifiedSamples": misclassified,
    },
    "samplePuzzles": sample_puzzles,
    "decisionTree": tree_json,
    "scaler": scaler_export,
    "featureNames": list(X_train.columns),
    "classNames": class_names,
}

with open(os.path.join(OUT_DIR, "results.json"), "w") as f:
    json.dump(results, f, indent=2)
print(f"  saved: {os.path.join(OUT_DIR, 'results.json')}")

# Also save sample puzzles separately for direct fetching
with open(os.path.join(OUT_DIR, "sample-puzzles.json"), "w") as f:
    json.dump(sample_puzzles, f, indent=2)
print(f"  saved: {os.path.join(OUT_DIR, 'sample-puzzles.json')}")

print("\n" + "=" * 60)
print("DONE")
print(f"  RF accuracy: {rf_acc:.4f}")
print(f"  RF F1:       {rf_f1:.4f}")
print(f"  DT accuracy: {dt_acc:.4f}")
print(f"  DT F1:       {dt_f1:.4f}")
print(f"  Apriori rules: {len(rules)}")
print(f"  Sample puzzles exported: {len(sample_puzzles)}")
print(f"  Decision tree depth: {dt.get_depth()}")
print(f"  Decision tree leaves: {dt.get_n_leaves()}")
