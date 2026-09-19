# Chess Puzzle Difficulty Classification — Complete Understanding

> **Purpose:** All project knowledge in one document. Covers goal, dataset, preprocessing, models, metrics, leakage audit, and presentation guide.

---

## 1. Project Goal

### Simple Version

You have millions of chess puzzles with difficulty numbers (400–3100). Players want to know: "Is this Easy, Medium, Hard, or Expert?" Manually labeling millions of puzzles takes too long. Teach a computer to do it automatically.

### Technical Version

**Problem Type:** Multi-class Classification (4 classes) + Association Rule Mining (descriptive)

**Objective:** Build a supervised learning model that predicts categorical difficulty labels (Easy/Medium/Hard/Expert) from puzzle structural features, tactical themes, and material characteristics. Also discover frequent theme patterns using Apriori algorithm.

**Research Questions:**
1. Can puzzle difficulty be predicted from available features?
2. Which features are most important for difficulty prediction?
3. How much does the model rely on tautological themes (mateIn*) vs genuine positional features?
4. What frequent theme patterns exist and how do they relate to difficulty?

---

## 2. The Dataset

### Source

| Item | Details |
|------|---------|
| Source | Lichess.org (free, open-source chess server) |
| Original size | 6.1 million puzzles |
| Our sample | 50,000 puzzles (Simple Random Sample, seed=42) |
| File | `lichess_db_puzzle_sample.csv` (9.3 MB) |

### What Each Column Means

| Column | What It Tells Us | Example | Do We Use It? |
|--------|------------------|---------|---------------|
| PuzzleId | ID number | "sWMvq" | No — just an identifier |
| FEN | Board position (code) | "r6k/pp2r2p/..." | Yes — extract 15 features |
| Moves | Solution | "e4g3 d5g2" | No — not available for new puzzles |
| Rating | Difficulty number (400–3100) | 1559 | Yes — we CREATE categories from this |
| RatingDeviation | How precise the rating is | 77 | Yes — useful feature |
| Popularity | How liked the puzzle is | 95 | Yes — useful feature |
| NbPlays | How many people tried it | 10000 | Yes — useful feature |
| Themes | Type of chess tactic | "fork pin" | Yes — encode as 73 binary columns |
| GameUrl | Link to game | "https://..." | No — not useful |
| OpeningTags | Chess opening name | "French_Defense" | No — 80% missing |
| DailyDate | When used as daily puzzle | "2023-01-15" | No — 99.97% missing |

### Class Distribution

| Category | Rating Range | Count | Percentage |
|----------|--------------|-------|------------|
| Easy | 0–1200 | 18,414 | 36.8% |
| Medium | 1201–1600 | 11,947 | 23.9% |
| Hard | 1601–2000 | 10,107 | 20.2% |
| Expert | 2001+ | 9,532 | 19.1% |

---

## 3. Data Cleaning & Preprocessing

### Do We Need Data Cleaning?

Our dataset is relatively clean:

| Check | Status | Action |
|-------|--------|--------|
| Missing Values | OpeningTags 79.8%, DailyDate 99.97% | Drop these columns |
| Missing Values | Rating, Themes, FEN: 0% | No action needed |
| Duplicate Rows | 0 duplicates | No action needed |
| Wrong Data Types | All correct | No action needed |
| Invalid Values | None found | No action needed |

### Complete Preprocessing Pipeline

```
Step 1: LOAD DATA
  └─ Load CSV into pandas DataFrame

Step 2: DATA CLEANING (Minimal)
  └─ Drop OpeningTags (79.8% missing)
  └─ Drop DailyDate (99.97% missing)

Step 3: TARGET CREATION
  └─ Create Difficulty from Rating (binning)
  └─ Rating 0-1200 → Easy
  └─ Rating 1201-1600 → Medium
  └─ Rating 1601-2000 → Hard
  └─ Rating 2001+ → Expert

Step 4: FEATURE EXTRACTION
  └─ Extract 15 features from FEN using python-chess

Step 5: ENCODING
  └─ One-hot encode Themes (73 binary columns)
  └─ Label encode Difficulty (Easy→0, Medium→1, Hard→2, Expert→3)

Step 6: FEATURE DROPPING
  └─ Drop PuzzleId, FEN, Moves, GameUrl, Rating

Step 7: NORMALIZATION
  └─ StandardScaler on numerical features

Step 8: TRAIN-TEST SPLIT
  └─ 80% train (40,000), 20% test (10,000)
  └─ Stratified, seed=42
```

### Why We Don't Handle Outliers

- Random Forest is robust to outliers
- Expert puzzles (rating 3000+) are rare but valid
- We're classifying, not regressing
- Our dataset has been verified — no invalid values exist

---

## 4. Feature Engineering: FEN Extraction

### What is FEN?

FEN (Forsyth-Edwards Notation) describes a chess position in a string. We use the `python-chess` library to extract meaningful features from it.

### 15 Features Extracted

| Feature | What It Measures | Example |
|---------|------------------|---------|
| WhiteMaterial | White's piece strength | 27 |
| BlackMaterial | Black's piece strength | 22 |
| MaterialBalance | Who's ahead | +5 |
| TotalPieces | Position complexity | 49 |
| WhitePawns | White pawn count | 5 |
| BlackPawns | Black pawn count | 6 |
| IsWhiteTurn | Who moves | 1 |
| LegalMoveCount | How many moves available | 12 |
| InCheck | Is king in check? | 0 |
| IsCheckmate | Is it checkmate? | 0 |
| WhiteKingAttackers | Threats to white king | 2 |
| BlackKingAttackers | Threats to black king | 1 |
| KingDistance | Distance between kings | 6 |
| WhiteCastled | Did white castle? | 1 |
| WhiteDoubledPawns | Pawn structure quality | 1 |

### Why python-chess?

Material alone is weak. Two positions with identical material can have very different difficulties. python-chess provides mobility, king safety, check status, castling rights, and pawn structure — capturing positional complexity.

---

## 5. Binning: Why Manual Boundaries?

### Equal-Frequency Binning (NOT used)

Puts equal number of items in each category. Problem: distorts natural difficulty distribution. Puzzles rated 1100 and 1450 both become "Medium" but 1100 is actually Easy-level.

### K-Means Clustering (NOT used)

Automatically finds groups. Problem: boundaries are data-driven, hard to explain, not aligned with chess community understanding.

### Manual Binning (USED)

```
0-1200    → Easy    (beginner level)
1201-1600 → Medium  (intermediate)
1601-2000 → Hard    (advanced)
2001+     → Expert  (master level)
```

Matches chess community conventions. Easy to explain. Consistent and reproducible.

---

## 6. Models

### Dummy Classifier (Baseline)

Always guesses "Easy" (most common class). Accuracy: ~36.8%. Sets the minimum bar.

### Decision Tree

A flowchart that asks questions to make decisions. Easy to understand and explain. Shows which features matter. Can overfit.

### Random Forest

Creates 200 decision trees and combines their votes. Usually most accurate. Less overfitting than single tree. Shows feature importance.

### K-Nearest Neighbors (KNN)

Find K most similar puzzles and use their categories. Simple concept. No training needed. Slow with large datasets.

### LinearSVC

Find the best straight line to separate categories. Fast (30 sec – 2 min on 50k). Works well in high dimensions.

### RBF SVM

Like LinearSVC but with curved boundaries. More powerful but very slow (30 min – hours on 50k). We run it on 10k subsample only.

### Model Comparison

| Model | How It Works | Speed | Expected Accuracy | Interpretability |
|-------|--------------|-------|-------------------|------------------|
| Dummy | Always guess "Easy" | Instant | ~37% | N/A |
| Decision Tree | Flowchart of questions | Fast | 70–80% | High |
| Random Forest | Many trees voting | Medium | 80–88% | Medium |
| KNN | Find similar puzzles | Slow (predict) | 70–80% | Medium |
| LinearSVC | Best straight line | Fast | 75–85% | Low |
| RBF SVM | Curved boundaries | Very slow | 78–87% | Low |

---

## 7. Metrics & Evaluation

### Primary Metric: Macro F1-Score

```
Macro F1 = Average of F1 for each class (treats all classes equally)

F1 = 2 × (Precision × Recall) / (Precision + Recall)

Why Macro? Because class sizes differ (37% vs 19%).
Macro treats Expert (19%) same as Easy (37%).
```

### Other Metrics

| Metric | What It Measures | Formula |
|--------|------------------|---------|
| Accuracy | % correct overall | Correct / Total |
| Precision | When we predict X, how often right? | TP / (TP + FP) |
| Recall | Did we find all X's? | TP / (TP + FN) |
| AUC | Overall discrimination ability | Area under ROC curve |

### Evaluation Methods

| Method | Purpose |
|--------|---------|
| Train-Test Split | 80% train, 20% test (stratified, seed=42) |
| 5-Fold Cross-Validation | More reliable evaluation |
| Confusion Matrix | See where model gets confused |
| ROC Curve | Visual performance comparison |
| Feature Importance | Which features matter most |

### Confusion Matrix Example

```
              PREDICTED
            Easy  Medium  Hard  Expert
ACTUAL Easy [ 350    15     5     0  ]
    Medium  [  20   220    15     5  ]
     Hard   [   5    20   170    15  ]
   Expert   [   0     5    10   180  ]

Diagonal = Correct predictions (high numbers = good)
Off-diagonal = Mistakes (low numbers = good)
```

### ROC Curve Interpretation

```
AUC = 0.5 → Random guessing (no skill)
AUC = 0.7 → Acceptable
AUC = 0.8 → Good
AUC = 0.9 → Excellent
AUC = 1.0 → Perfect
```

---

## 8. Theme Leakage Audit

### What is Tautology?

A statement that is true by definition. Example: "mateIn1" means the puzzle is a mate-in-1-move. This is tautological because mateIn1 DEFINITIONALLY means Easy.

### What is Shortcut Learning?

Model finds easy patterns instead of learning the real concept. Example: "If mateIn1 → predict Easy" is a shortcut. The model didn't learn what makes a puzzle positionally hard.

### 8 Tautological Themes Removed in Run B

| Theme | Why Tautological |
|-------|-----------------|
| mateIn1 | Definitionally means 1-move mate = Easy |
| mateIn2 | Usually Easy/Medium |
| mateIn3 | Usually Hard |
| mateIn4 | Usually Hard/Expert |
| mateIn5 | Usually Expert |
| oneMove | Same as mateIn1 |
| short | Few moves = easier |
| long | Many moves = harder |

### Audit Approach

```
Run A: All 73 themes → Get accuracy
Run B: 65 themes (remove 8 tautological) → Get accuracy

Interpretation:
  Drop < 3 points  → Model learned genuine difficulty ✓
  Drop 3-8 points  → Some shortcut learning ⚠️
  Drop > 8 points  → Heavy shortcut learning ✗
```

---

## 9. Association Rule Mining (Descriptive Task)

### What Are Association Rules?

If-then patterns showing relationships between items. Example: `{mateIn1} → Easy` means "when a puzzle has mateIn1 theme, it's usually Easy."

### Algorithm: Apriori

```
Step 1: Convert themes to binary format (MultiLabelBinarizer)
Step 2: One-hot encode Difficulty as boolean columns
Step 3: Find frequent itemsets (support >= 5%)
Step 4: Generate association rules (confidence >= 70%)
Step 5: Filter by lift > 1.0 (surprising patterns)
Step 6: Keep only rules where Difficulty is in consequent
```

### Key Metrics

| Metric | What It Means | Our Value |
|--------|---------------|-----------|
| Support | How common is this pattern? | >= 0.05 (5%) |
| Confidence | If pattern appears, how accurate? | >= 0.70 (70%) |
| Lift | Is this pattern surprising? | > 1.0 |

### Expected Output Example

| Antecedents | Consequents | Support | Confidence | Lift |
|-------------|-------------|---------|------------|------|
| {mateIn1} | {Diff_Easy} | 0.15 | 0.98 | 2.65 |
| {long, endgame} | {Diff_Hard} | 0.08 | 0.78 | 2.12 |
| {veryLong} | {Diff_Expert} | 0.06 | 0.75 | 2.01 |

---

## 10. Expert Q&A

### Why Classification Instead of Regression?

Evaluation is clearer ("82% accuracy" vs "average error of 127 points"). Chess apps need categories for UI. Classification has well-established metrics.

### Why These Category Boundaries (1200/1600/2000)?

Based on chess community conventions: beginner (<1200), intermediate (1200–1600), advanced (1600–2000), expert (>2000).

### Why Drop OpeningTags?

79.8% missing. High cardinality. Inconsistent tagging. Redundant with themes.

### Why Not Deep Learning?

50k is small for deep learning. Features are tabular — tree-based models work better. Need interpretability. Random Forest on tabular data often matches or beats neural networks.

### Why 50,000 Samples?

| Criterion | Requirement | Our Sample |
|-----------|-------------|------------|
| Min per class | ~1,000 | 9,532 (smallest) ✓ |
| Samples per feature | 10× features | 50,000 >> 850 ✓ |
| Central Limit Theorem | n > 30 | 50,000 >> 30 ✓ |

### Why Not PCA?

Need interpretability. Can't get meaningful feature importance after PCA. 85 features is manageable.

### What Are the Limitations?

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Theme leakage | MateIn* tautologically predict difficulty | Audit Run B |
| RatingDerivative confounding | NbPlays/RD partially reconstruct Rating | Ablation table |
| Arbitrary bin boundaries | May misalign with natural difficulty | Inspect confusion matrix |
| FEN feature depth | Structural features are shallow | Acknowledge in limitations |

---

## 11. Presentation Guide

### One-Page Summary

```
PROJECT: Chess Puzzle Difficulty Classification

GOAL: Automatically predict puzzle difficulty (Easy/Medium/Hard/Expert)

DATA: 50,000 chess puzzles from Lichess.org

CHALLENGES:
  - Missing data in some columns
  - Converting text to numbers
  - Potential shortcut learning

METHODS:
  - Preprocessing: Cleaning, Feature Extraction, Encoding
  - Models: Dummy, DT, RF, KNN, LinearSVC, RBF SVM
  - Descriptive: Association Rules (Apriori)
  - Evaluation: Macro F1, Cross-Validation, Confusion Matrix

EXPECTED OUTCOME:
  - Best model: Random Forest (~85% accuracy)
  - Identify which features matter most
  - Honest assessment of model limitations
```

### Key Points to Emphasize

1. Real-world problem — Chess platforms actually need this
2. Large dataset — 50,000 samples (statistically significant)
3. Multiple models — Comparison of 6 different algorithms
4. Honest evaluation — Leakage audit shows if model is truly learning
5. Feature analysis — Identifies what makes puzzles difficult
6. Both predictive and descriptive mining — Covers IS-212 Topics 2 and 3

---

**Document Version:** 1.0
**Created:** September 2026
**Sources:** PROJECT_EXPLANATION.md, DETAILED_EXPLANATIONS.md, DATA_CLEANING_EXPLANATION.md, PROFESSOR_PRESENTATION.md
