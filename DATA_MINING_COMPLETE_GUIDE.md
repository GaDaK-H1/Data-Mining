# Data Mining Complete Guide — Chess Puzzle Difficulty Classification

> **Purpose:** Every data mining term used in this project, explained in detail. Covers every chapter of the project book, every phase of the website, and how to read every chart and table.

---

# TABLE OF CONTENTS

1. [Chapter 1: Introduction & Project Background](#chapter-1-introduction--project-background)
2. [Chapter 2: Dataset Description & Exploratory Data Analysis](#chapter-2-dataset-description--exploratory-data-analysis)
3. [Chapter 3: Data Preprocessing & Descriptive Mining](#chapter-3-data-preprocessing--descriptive-mining)
4. [Chapter 4: Predictive Mining & Evaluation](#chapter-4-predictive-mining--evaluation)
5. [Chapter 5: Conclusion](#chapter-5-conclusion)
6. [Website Phase-by-Phase Explanation](#website-phase-by-phase-explanation)
7. [How to Read Every Chart and Table](#how-to-read-every-chart-and-table)
8. [Glossary of All Data Mining Terms](#glossary-of-all-data-mining-terms)

---

# Chapter 1: Introduction & Project Background

## 1.1 What Is Data Mining?

**Data mining** is the process of discovering patterns, trends, and useful information from large datasets. It combines statistics, machine learning, and database systems to extract knowledge from data.

**In simple terms:** Like digging through dirt to find gold — you have a huge pile of raw data, and data mining helps you find the valuable nuggets hidden inside.

**Two types of data mining:**

| Type | What It Does | Example in This Project |
|------|-------------|------------------------|
| **Descriptive Mining** | Discovers patterns and relationships that already exist in data | Finding that puzzles with "mateIn1" theme are usually Easy |
| **Predictive Mining** | Uses patterns to predict future outcomes | Predicting whether a new puzzle is Easy/Medium/Hard/Expert |

**This project does BOTH:** descriptive mining (Apriori association rules) AND predictive mining (6 classifiers).

---

## 1.2 Classification — The Core Task

**Classification** is a supervised learning task where the computer learns from labeled examples to predict the category of new, unseen data.

**What "supervised" means:** You give the computer examples with answers (labels), and it learns the pattern. Like showing a child many pictures of cats and dogs with labels, then asking "is this a cat or dog?"

**In this project:**
- **Input (features):** Board position, themes, metadata
- **Output (label):** Easy / Medium / Hard / Expert
- **The computer learns:** "When a puzzle has these features, it's usually Easy"

**Why not regression?** Regression predicts a number (like "rating = 1523"). Classification predicts a category (like "Medium"). The project chose classification because:
- Chess apps need categories for their UI ("Easy" is clearer than "1523")
- Evaluation is clearer ("62% accuracy" vs "average error of 127 points")
- Classification has well-established metrics

---

## 1.3 Multi-Class Classification

**Binary classification** = 2 categories (spam vs not spam)
**Multi-class classification** = 3+ categories (Easy/Medium/Hard/Expert)

This project has **4 classes** — making it harder than binary because the model must distinguish between more categories.

---

## 1.4 The Dataset — Lichess Puzzles

**What is Lichess?** A free, open-source chess server with millions of puzzles.

**What is a chess puzzle?** A position from a real game where one side has a winning move. You find the best move.

**What is a FEN string?** Forsyth-Edwards Notation — a text code that describes a chess position. Example:
```
r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2PP/PPP5/2K5 w - - 0 24
```
This tells you: which pieces are where, whose turn it is, castling rights, etc.

**What is a Glicko rating?** A number (400–3100) indicating how hard a puzzle is. Higher = harder. This is what we're trying to predict (indirectly, by predicting the class).

**What are Themes?** Tags describing the tactical motif: "fork", "pin", "mateIn1", "endgame", etc. Each puzzle can have multiple themes.

---

## 1.5 Tools Used

| Tool | What It Is | Why Used |
|------|-----------|----------|
| **pandas** | Python library for data manipulation | Loading CSV, cleaning data, building tables |
| **NumPy** | Python library for numerical computing | Math operations, array handling |
| **scikit-learn** | Python ML library | All 6 models, evaluation, preprocessing |
| **python-chess** | Python chess library | Reading FEN strings, extracting board features |
| **mlxtend** | Python ML extensions | Apriori association rule mining |
| **matplotlib/seaborn** | Python plotting libraries | Charts and visualizations |
| **Google Colab** | Free cloud Jupyter notebook environment | Running the notebook (CPU runtime) |
| **Jupyter Notebook** | Interactive code document | The entire analysis in 35 cells |

---

# Chapter 2: Dataset Description & Exploratory Data Analysis

## 2.1 Dataset Overview

**What is a dataset?** A structured collection of data, usually in a table format (rows = observations, columns = variables).

**This dataset:**
- **50,000 rows** (each row = one chess puzzle)
- **11 columns** (each column = one attribute of the puzzle)
- **Source:** Lichess Open Database
- **Sampling:** Simple Random Sample with seed=42 (reproducible)

**What is Simple Random Sample?** Every puzzle in the Lichess database has an equal chance of being selected. Like drawing names from a hat.

**What is seed=42?** A random number seed that ensures the same "random" sample is generated every time. Without it, you'd get different puzzles each run.

---

## 2.2 The 11 Columns Explained

| Column | Type | What It Means | Used? | Why/Why Not |
|--------|------|--------------|-------|-------------|
| **PuzzleId** | Text | Unique ID like "sWMvq" | No | Just an identifier, no predictive value |
| **FEN** | Text | Board position code | Yes | Extract 14 board features from it |
| **Moves** | Text | Solution in UCI notation | No | Not available for new puzzles |
| **Rating** | Integer | Difficulty number (400–3100) | **TARGET** | We CREATE categories from this; can't use as input |
| **RatingDeviation** | Integer | Uncertainty of rating | Yes | High = few plays, unstable rating |
| **Popularity** | Integer | User vote score (0–100) | Yes | How liked the puzzle is |
| **NbPlays** | Integer | How many times played | Yes | Popularity indicator |
| **Themes** | Text | Tactical theme tags | Yes | One-hot encode → 73 binary columns |
| **GameUrl** | Text | Link to original game | No | Not useful for prediction |
| **OpeningTags** | Text | Opening names | No | 79.8% missing |
| **DailyDate** | Text | Daily puzzle date | No | 99.97% missing |

---

## 2.3 Data Quality Check

**What is data quality?** How clean, complete, and accurate your data is.

**Checks performed:**

| Check | What We Looked For | Result |
|-------|-------------------|--------|
| **Missing values** | Cells with no data | OpeningTags: 79.8% missing, DailyDate: 99.97% missing |
| **Duplicates** | Identical rows | 0 duplicates — all 50,000 are unique |
| **Wrong data types** | Numbers stored as text, etc. | All correct |
| **Invalid values** | Negative ages, impossible ratings, etc. | None found |

**What is a missing value?** A cell in the table that has no data. Example: if a puzzle has no OpeningTags, that cell is empty/NaN.

**What is a duplicate?** Two or more rows that are exactly the same. Bad for analysis because it inflates counts.

**What did we do about missing values?**
- OpeningTags (79.8% missing) → **Dropped the entire column** (too much missing to be useful)
- DailyDate (99.97% missing) → **Dropped the entire column**
- All other columns → 0% missing, no action needed

---

## 2.4 Target Variable — Difficulty Classes

**What is a target variable?** The thing you're trying to predict. In this project, it's the difficulty class.

**What is binning?** Converting a continuous number (rating 400–3100) into categories (Easy/Medium/Hard/Expert).

**Why binning instead of predicting the exact rating?**
- Chess apps need categories for their UI
- Classification metrics are clearer
- The boundaries match chess community conventions

**The 4 classes:**

| Class | Rating Range | Count | Percentage | What It Means |
|-------|-------------|-------|------------|---------------|
| **Easy** | ≤ 1200 | 18,414 | 36.8% | Beginner level — simple tactics |
| **Medium** | 1201–1600 | 11,947 | 23.9% | Intermediate — some calculation needed |
| **Hard** | 1601–2000 | 10,107 | 20.2% | Advanced — deep calculation |
| **Expert** | > 2000 | 9,532 | 19.1% | Master level — very complex |

**What is class imbalance?** When some categories have more examples than others. Here, Easy has 36.8% but Expert only has 19.1%.

**Why does imbalance matter?** A model that always guesses "Easy" would be right 36.8% of the time — but that's useless. We need a metric that treats all classes equally.

---

## 2.5 Exploratory Data Analysis (EDA)

**What is EDA?** Looking at your data visually and statistically BEFORE building any models. Like inspecting ingredients before cooking.

**Why EDA?**
- Understand the data structure
- Find patterns and anomalies
- Check assumptions
- Decide what preprocessing is needed

### EDA Step 1: Rating Distribution

**What we did:** Drew a histogram showing how many puzzles have each rating.

**What we found:**
- Ratings range from 399 to 3108
- Mean: 1471.46, Median: 1412
- The distribution has a long tail to the right (a few very hard puzzles)
- The three cut-off points (1200, 1600, 2000) divide the data into 4 groups

### EDA Step 2: Difficulty Distribution

**What we did:** Bar chart showing how many puzzles in each class.

**What we found:**
- Easy dominates (36.8%) — most puzzles are easy
- Expert is smallest (19.1%) — few very hard puzzles
- This imbalance is why we use **macro F1** instead of plain accuracy

### EDA Step 3: Theme Frequency

**What we did:** Counted how often each theme appears across all 50,000 puzzles.

**Top 5 themes:**
1. **endgame** — 25,070 puzzles (50.1%)
2. **short** — 24,978 puzzles (49.9%)
3. **middlegame** — 22,499 puzzles (45.0%)
4. **crushing** — 19,072 puzzles (38.1%)
5. **mate** — 15,929 puzzles (31.9%)

**What is a theme?** A tag describing the tactical motif of the puzzle. Example: "fork" means one piece attacks two enemy pieces simultaneously.

**Why themes matter:** They might help predict difficulty. A puzzle with "mateIn1" (mate in 1 move) is probably Easy.

### EDA Step 4: Correlation Analysis

**What is correlation?** A number between -1 and +1 that measures how two variables move together.

| Correlation | Meaning | Example |
|-------------|---------|---------|
| **+1.0** | Perfect positive — both go up together | Temperature and ice cream sales |
| **0.0** | No relationship | Shoe size and IQ |
| **-1.0** | Perfect negative — one goes up, other goes down | Speed and travel time |

**What we found:**
- Popularity ↔ NbPlays: **+0.387** (moderate positive — popular puzzles get played more)
- RatingDeviation ↔ NbPlays: **-0.421** (moderate negative — puzzles played many times have stable ratings)
- Rating ↔ everything: **weak** (rating isn't strongly correlated with any single number → the task is genuinely hard)

**What is a heatmap?** A color-coded table showing correlations. Red = positive, Blue = negative, White = no correlation.

---

## 2.6 Potentially Leaking Themes

**What is data leakage?** When information from the answer accidentally gets into the features. Like a student seeing the test answers before the exam.

**What are tautological themes?** Tags that directly encode the answer length:

| Theme | Why It's Tautological |
|-------|----------------------|
| **mateIn1** | Mate in 1 move = definitionally Easy |
| **mateIn2** | Usually Easy/Medium |
| **mateIn3** | Usually Hard |
| **mateIn4** | Usually Hard/Expert |
| **mateIn5** | Usually Expert |
| **oneMove** | Same as mateIn1 |
| **short** | Few moves = easier |
| **long** | Many moves = harder |

**The risk:** If the model learns "mateIn1 → Easy", it's using a shortcut instead of learning what makes a position difficult.

**What we did:** We did NOT remove these themes from the main feature set (they're legitimately present in real data), but we did a **leakage audit** in Chapter 4 to measure the impact.

---

# Chapter 3: Data Preprocessing & Descriptive Mining

## 3.1 What Is Preprocessing?

**Preprocessing** is cleaning and transforming raw data into a format that machine learning models can understand.

**Why preprocessing is needed:**
- Models can't read text (need numbers)
- Models can't handle missing values
- Models work better when features are on similar scales
- Models can't use irrelevant columns

---

## 3.2 Column Dropping — What We Removed

| Column | Why Dropped |
|--------|------------|
| **PuzzleId** | Just an identifier — no predictive value |
| **GameUrl** | A link — not useful for prediction |
| **Moves** | Solution moves — not available for new puzzles |
| **OpeningTags** | 79.8% missing — too incomplete to use |
| **DailyDate** | 99.97% missing — almost entirely empty |
| **Rating** | The TARGET variable — using it as a feature would be cheating |

**What is the target variable?** The thing you're trying to predict. Using it as an input feature is called **data leakage** — the model would just look at the answer.

---

## 3.3 Feature Engineering — Creating New Features

**What is feature engineering?** Creating new, useful input variables from existing data.

### FEN Feature Extraction

**What is FEN?** Forsyth-Edwards Notation — a text string describing a chess position.

Example: `r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2PP/PPP5/2K5 w - - 0 24`

This encodes: piece positions, whose turn, castling rights, en passant, move counters.

**What we extracted (14 features):**

| Feature | What It Measures | Chess Meaning |
|---------|-----------------|---------------|
| **WhiteMaterial** | Total value of white pieces | How strong white is (P=1, N=B=3, R=5, Q=9) |
| **BlackMaterial** | Total value of black pieces | How strong black is |
| **MaterialBalance** | White - Black material | Who's ahead in material |
| **TotalPieces** | Number of pieces on board | Position complexity |
| **WhitePawns** | Number of white pawns | Pawn structure |
| **BlackPawns** | Number of black pawns | Pawn structure |
| **IsWhiteTurn** | 1 if white moves, 0 if black | Who has the initiative |
| **LegalMoveCount** | Number of legal moves | Mobility — how free the position is |
| **InCheck** | 1 if king is in check | Tactical urgency |
| **WhiteKingAttackers** | Enemies attacking white king | King safety |
| **BlackKingAttackers** | Enemies attacking black king | King safety |
| **KingDistance** | Distance between kings | Endgame indicator |
| **WhiteCastled** | 1 if white king on g/h file | King safety |
| **WhiteDoubledPawns** | Files with 2+ white pawns | Pawn structure weakness |

**Why python-chess?** It can read FEN strings and compute these features automatically. Without it, we'd have to write thousands of lines of chess logic.

---

## 3.4 Encoding — Converting Text to Numbers

**What is encoding?** Converting non-numeric data into numbers that models can process.

### One-Hot Encoding (Themes)

**What is one-hot encoding?** Creating a binary column (0 or 1) for each category.

**Example:**
```
Puzzle 1 themes: "fork pin"
Puzzle 2 themes: "mateIn1 endgame"

After one-hot encoding:
         fork  pin  mateIn1  endgame  ...
Puzzle 1:  1    1      0       0
Puzzle 2:  0    0      1       1
```

**Result:** 73 theme columns (one per unique theme), each containing 0 or 1.

### Label Encoding (Difficulty)

**What is label encoding?** Converting categories to numbers in order.

```
Easy   → 0
Medium → 1
Hard   → 2
Expert → 3
```

**Why not one-hot for the target?** Because the model needs to output a single number (0, 1, 2, or 3), not 4 separate columns.

---

## 3.5 The Final Feature Matrix

**What is a feature matrix?** A table where:
- Each row = one puzzle
- Each column = one feature (input variable)
- The values are all numbers

**Our feature matrix:**

| Feature Type | Count | Examples |
|-------------|-------|---------|
| Numeric metadata | 3 | RatingDeviation, Popularity, NbPlays |
| Board features (from FEN) | 14 | WhiteMaterial, LegalMoveCount, InCheck, etc. |
| One-hot theme flags | 73 | fork, pin, mateIn1, endgame, etc. |
| **TOTAL** | **90** | |

**50,000 rows × 90 columns = 4.5 million numbers**

---

## 3.6 Normalization — StandardScaler

**What is normalization?** Scaling numerical features so they're on similar scales.

**Why it matters:**
- RatingDeviation ranges from 0 to ~300
- NbPlays ranges from 1 to 175,098
- Without scaling, NbPlays would dominate just because its numbers are bigger

**What is StandardScaler?** A normalization method that:
1. Subtract the mean (center at 0)
2. Divide by the standard deviation (unit variance)

**Formula:** `scaled_value = (value - mean) / standard_deviation`

**Important:** The scaler is fitted ONLY on the training set. If we fitted it on the entire dataset, information from the test set would leak into training.

---

## 3.7 Train-Test Split

**What is a train-test split?** Dividing data into two parts:
- **Training set (80% = 40,000 puzzles):** Used to teach the model
- **Test set (20% = 10,000 puzzles):** Used to evaluate the model

**Why split?** If you test on the same data you trained on, the model might just memorize the answers. The test set is "unseen" data — like a final exam.

**What is stratified split?** Ensuring both sets have the same proportion of each class. Without stratification, one set might have too many Easy puzzles.

**What is random_state=42?** A seed that ensures the same split every time. Reproducibility.

---

## 3.8 Association Rule Mining (Descriptive Task)

### What Is Association Rule Mining?

**Association rule mining** finds "if-then" patterns in data. Example: "If a customer buys bread and butter, they often buy milk."

**In this project:** "If a puzzle has themes fork + pin → it's probably Medium difficulty."

---

### The Apriori Algorithm

**What is Apriori?** An algorithm that finds frequent itemsets (groups of items that appear together often) and generates association rules from them.

**Step-by-step process:**

```
Step 1: Convert themes to binary format (one-hot encoding)
Step 2: One-hot encode Difficulty as boolean columns
Step 3: Find frequent itemsets (support >= 5%)
Step 4: Generate association rules (confidence >= 70%)
Step 5: Filter by lift > 1.0 (surprising patterns)
Step 6: Keep only rules where Difficulty is in consequent
```

### Key Metrics Explained

| Metric | What It Means | Formula | Our Threshold |
|--------|--------------|---------|---------------|
| **Support** | How common is this pattern? | (Times pattern appears) / (Total transactions) | ≥ 0.05 (5%) |
| **Confidence** | If pattern appears, how often is the rule true? | (Support of rule) / (Support of antecedent) | ≥ 0.70 (70%) |
| **Lift** | Is this pattern surprising? | (Confidence) / (Expected confidence if independent) | > 1.0 |

**What is an antecedent?** The "if" part of the rule. Example: {fork, pin}
**What is a consequent?** The "then" part of the rule. Example: {Medium}

**What does lift mean?**
- Lift = 1.0: The pattern is as common as you'd expect by random chance
- Lift > 1.0: The pattern is MORE common than expected (surprising!)
- Lift < 1.0: The pattern is LESS common than expected

### Our Results

- **153 frequent itemsets** found
- **42 rules** kept (all with confidence ≥ 0.70, lift > 1.0, and difficulty in consequent)
- **ALL 42 rules conclude with Easy** — no rule predicts Medium, Hard, or Expert

**Why?** Easy puzzles have obvious patterns (short mates, common themes). Hard/Expert puzzles depend on the specific position — no simple theme combination predicts them.

---

# Chapter 4: Predictive Mining & Evaluation

## 4.1 What Is Predictive Mining?

**Predictive mining** uses historical data to build a model that predicts outcomes for new, unseen data.

**In this project:** We train models on 40,000 puzzles (with known difficulty) and predict the difficulty of 10,000 unseen puzzles.

---

## 4.2 The 6 Classifiers Explained

### 1. Dummy Classifier (Baseline)

**What it does:** Always predicts the most common class (Easy).

**Why include it?** To set the最低 bar. Any useful model must beat this.

**Performance:** 36.8% accuracy, 0.1346 macro F1

### 2. Decision Tree

**What it is:** A flowchart-like structure that asks yes/no questions to make decisions.

**How it works:**
```
Is mateIn1 = 1?
├── Yes → Easy
└── No → Is NbPlays > 5000?
    ├── Yes → Medium
    └── No → Is MaterialBalance > 5?
        ├── Yes → Hard
        └── No → Expert
```

**Strengths:** Easy to understand, fast to train, shows which features matter.
**Weaknesses:** Can overfit (memorize training data), unstable (small data changes → different tree).

**Our settings:** max_depth=10, min_samples_split=5

### 3. Random Forest

**What it is:** An ensemble of 200 decision trees. Each tree votes, and the majority wins.

**How it works:**
1. Create 200 random subsets of the training data
2. Train one decision tree on each subset
3. Each tree votes on the class
4. Majority vote = final prediction

**Why better than a single tree?** Reduces overfitting. One tree might be wrong, but 200 trees agreeing is usually right.

**Our settings:** n_estimators=200, max_depth=20

### 4. K-Nearest Neighbors (KNN)

**What it is:** Finds the K most similar puzzles from training data and copies their answer.

**How it works:**
1. New puzzle arrives
2. Calculate distance to all 40,000 training puzzles
3. Find the 9 nearest neighbors
4. Majority vote among those 9

**Strengths:** Simple concept, no training needed.
**Weaknesses:** Slow at prediction (must compare to all training data), sensitive to irrelevant features.

**Our settings:** n_neighbors=9, weights='distance'

### 5. LinearSVC

**What it is:** Finds the best straight line (hyperplane) to separate classes.

**How it works:** Draws boundaries in 90-dimensional space to separate Easy from Medium from Hard from Expert.

**Strengths:** Fast, works well in high dimensions.
**Weaknesses:** Can only draw straight boundaries — if classes need curves, it fails.

**Our settings:** C=1, dual=False, max_iter=10000

### 6. RBF SVM (Support Vector Machine)

**What it is:** Like LinearSVC but can draw curved boundaries using the "kernel trick."

**How it works:** Maps data into higher dimensions where straight lines become curves.

**Strengths:** More powerful than LinearSVC.
**Weaknesses:** Very slow (trained on 10k subsample only).

**Our settings:** C=1, gamma='scale'

---

## 4.3 Hyperparameter Tuning

**What is a hyperparameter?** A setting you choose before training (not learned from data).

**What is GridSearchCV?** Tries every combination of hyperparameters and picks the best one.

**Example:**
```
Random Forest grid:
  n_estimators: [100, 200, 300]
  max_depth: [10, 20, None]

GridSearchCV tries all 6 combinations:
  (100, 10), (100, 20), (100, None),
  (200, 10), (200, 20), (200, None),
  (300, 10), (300, 20), (300, None)

Picks the combination with highest macro F1.
```

**What is cross-validation?** Splitting training data into K folds, training on K-1, testing on 1, rotating.

**5-fold stratified cross-validation:**
```
Fold 1: Train on folds 2-5, test on fold 1
Fold 2: Train on folds 1,3-5, test on fold 2
Fold 3: Train on folds 1-2,4-5, test on fold 3
Fold 4: Train on folds 1-3,5, test on fold 4
Fold 5: Train on folds 1-4, test on fold 5

Final score = average of all 5 folds
```

**Why cross-validation?** More reliable than a single train/test split. If you're lucky with one split, you might get a misleading score.

---

## 4.4 Evaluation Metrics Explained

### Accuracy

**What it is:** Percentage of correct predictions.

**Formula:** `Accuracy = Correct predictions / Total predictions`

**Problem with imbalanced data:** If 36.8% are Easy, a model that always guesses Easy gets 36.8% accuracy — but it's useless.

### Precision

**What it is:** When the model predicts X, how often is it right?

**Formula:** `Precision = True Positives / (True Positives + False Positives)`

**Example:** If the model predicts "Hard" 100 times, and 70 are actually Hard → precision = 70%.

### Recall

**What it is:** Of all actual X puzzles, how many did the model find?

**Formula:** `Recall = True Positives / (True Positives + False Negatives)`

**Example:** If there are 200 actual Hard puzzles, and the model finds 140 → recall = 70%.

### F1 Score

**What it is:** The harmonic mean of precision and recall.

**Formula:** `F1 = 2 × (Precision × Recall) / (Precision + Recall)`

**Why harmonic mean?** It penalizes extreme values. If precision=1.0 but recall=0.1, F1=0.18 (low) — not 0.55 (average).

### Macro F1 (Main Metric)

**What it is:** Calculate F1 for each class separately, then average them.

**Why macro?** Treats all classes equally, regardless of size. Expert (19.1%) gets the same weight as Easy (36.8%).

**Why not plain accuracy?** Because of class imbalance. Macro F1 is the right metric for imbalanced multi-class problems.

---

## 4.5 Cross-Validation Results (Table 4.2)

**What the table shows:** How each model performed during 5-fold cross-validation.

| Model | CV macro F1 (mean) | Std | How to Read |
|-------|-------------------|-----|-------------|
| Dummy | 0.1346 | 0.0000 | Baseline — always guessing Easy |
| Decision Tree | 0.5788 | 0.0015 | Single tree — decent |
| **Random Forest** | **0.5928** | **0.0038** | **Best — 200 trees voting** |
| KNN | 0.5263 | 0.0032 | Finds similar puzzles |
| LinearSVC | 0.4740 | 0.0044 | Straight lines only |
| RBF SVM | 0.5442 | 0.0070 | Curved boundaries (10k subsample) |

**What "std" means:** Standard deviation — how much the score varied across the 5 folds. Lower = more stable.

**Key insight:** Random Forest (0.5928) beats Decision Tree (0.5788) by only 0.014 — this means the tree structure itself contains most of the signal, and bagging (combining many trees) provides only a minor improvement.

---

## 4.6 Test Set Results (Table 4.3)

**What the table shows:** How each model performed on the 10,000 unseen test puzzles.

| Model | Accuracy | Precision | Recall | F1 | How to Read |
|-------|----------|-----------|--------|-----|-------------|
| Dummy | 0.3683 | 0.0921 | 0.2500 | 0.1346 | Always guesses Easy |
| Decision Tree | 0.6060 | 0.5778 | 0.5713 | 0.5731 | Decent — single tree |
| **Random Forest** | **0.6208** | **0.5863** | **0.5779** | **0.5824** | **Best overall** |
| KNN | 0.5671 | 0.5298 | 0.5321 | 0.5306 | Middle performance |
| LinearSVC | 0.5390 | 0.4842 | 0.4875 | 0.4700 | Weakest real model |
| RBF SVM | 0.5859 | 0.5539 | 0.5476 | 0.5499 | Good but trained on subsample |

**Key observations:**
1. Random Forest is best across all metrics
2. CV score (0.5928) closely predicts test score (0.5824) — no overfitting
3. LinearSVC is weakest because class boundaries aren't linear
4. RBF SVM beats LinearSVC by 7 points because curved boundaries work better

---

## 4.7 Confusion Matrix Explained

**What is a confusion matrix?** A table showing what the model predicted vs what was actually true.

```
                  PREDICTED
               Easy  Medium  Hard  Expert
ACTUAL Easy   [3130   659   193   186]   ← 85.1% correct
     Medium    [153   965   552   213]   ← 39.5% correct
      Hard      [99   546   946   337]   ← 44.8% correct
    Expert     [301   168   385  1167]   ← 67.5% correct
```

**How to read it:**
- **Diagonal (green):** Correct predictions (high numbers = good)
- **Off-diagonal (red):** Mistakes (low numbers = good)
- **Rows = actual class, Columns = predicted class**

**What we found:**
- Easy is recognized well (85.1%)
- Expert is recognized reasonably (67.5%)
- Medium and Hard are weakest (~42% and ~48%) — they straddle boundaries at 1200 and 2000
- **72.6% of errors are adjacent** — the model confuses neighboring classes, rarely distant ones

---

## 4.8 ROC Curves and AUC

**What is an ROC curve?** A graph showing how well the model separates each class from all others.

**What is AUC?** Area Under the Curve — a single number measuring discrimination ability.

| AUC | Meaning |
|-----|---------|
| 0.5 | Random guessing (no skill) |
| 0.7 | Acceptable |
| 0.8 | Good |
| 0.9 | Excellent |
| 1.0 | Perfect |

**Our results:** Random Forest achieves AUC=0.924 for Easy (excellent) and ~0.78 for Medium (acceptable).

---

## 4.9 Feature Importance

**What is feature importance?** A ranking of which input variables the model relies on most.

**Our top 15 features (Random Forest):**

| Rank | Feature | Importance | What It Means |
|------|---------|------------|---------------|
| 1 | RatingDeviation | 0.1347 | How uncertain the rating is |
| 2 | NbPlays | 0.0955 | How many times played |
| 3 | Popularity | 0.0883 | User vote score |
| 4 | mate (theme) | 0.0541 | Whether "mate" theme is present |
| 5 | LegalMoveCount | 0.0462 | How many legal moves exist |
| 6 | MaterialBalance | 0.0391 | Who's ahead in material |
| 7 | TotalPieces | 0.0354 | Number of pieces on board |
| 8 | mateIn1 (theme) | 0.0298 | Whether "mateIn1" theme is present |
| 9 | KingDistance | 0.0271 | Distance between kings |
| 10 | BlackMaterial | 0.0252 | Black's piece strength |

**Key insight:** The top 3 features are **metadata** (how uncertain the rating is, how many times played, popularity) — NOT the board position itself. This raises the **cold-start concern**: new puzzles with few plays won't have these signals.

---

## 4.10 Leakage Audit (Run A vs Run B)

**What is a leakage audit?** Testing whether the model relies on "cheating" features.

**The experiment:**
- **Run A:** All 90 features → 62.08% accuracy, 0.5824 F1
- **Run B:** 82 features (removed 8 tautological themes) → 61.83% accuracy, 0.5809 F1

**The 8 removed themes:** mateIn1, mateIn2, mateIn3, mateIn4, mateIn5, oneMove, short, long

**Result:** Drop of only 0.25 percentage points — the model learned genuine chess knowledge, not just shortcuts.

**Interpretation scale:**
- Drop < 3 points → Model learned genuine difficulty ✓
- Drop 3–8 points → Some shortcut learning ⚠️
- Drop > 8 points → Heavy shortcut learning ✗

**Our result: 0.25 points → ✓ Genuine learning**

---

## 4.11 Error Analysis

**What is error analysis?** Studying the model's mistakes to understand WHY it fails.

**Our findings:**
- **3,792 misclassified** out of 10,000 test puzzles
- **72.6% of errors are adjacent** (e.g., Easy↔Medium, Hard↔Expert)
- **89.8% accuracy with ±1 bin tolerance** — most "errors" are off by one class
- **17% of puzzles** are within 50 rating points of a boundary

**Sample misclassified puzzles:**

| PuzzleId | Rating | True | Predicted | Why It Failed |
|----------|--------|------|-----------|---------------|
| czIDl | 1490 | Medium | Hard | 110 points below 1600 boundary |
| CUVwr | 2063 | Expert | Hard | 63 points above 2000 boundary |
| VV6zH | 2197 | Expert | Hard | 197 points above 2000 boundary |
| Zvfgn | 1304 | Medium | Hard | 296 points below 1600 boundary |
| A2uyB | 1430 | Medium | Hard | 170 points below 1600 boundary |

**Pattern:** All misclassifications are near class boundaries. Puzzles rated 1580 and 1620 are essentially the same difficulty but in different classes.

---

# Chapter 5: Conclusion

## 5.1 Key Results

| Metric | Value | What It Means |
|--------|-------|---------------|
| Best model | Random Forest | 200 trees voting together |
| Test accuracy | 62.08% | Correct on 6,208 of 10,000 puzzles |
| Test macro F1 | 0.5824 | Balanced score across all 4 classes |
| Improvement over baseline | 4.3× | vs Dummy classifier's 0.1346 F1 |
| Adjacent errors | 72.6% | Most mistakes are off by one class |
| ±1 bin tolerance | 89.8% | Correct when allowed one class off |
| Leakage audit drop | 0.25 pp | Model learned genuine knowledge |

## 5.2 Benefits

1. **Fully reproducible** — one notebook, fixed seeds, all numbers regenerable
2. **Both types of mining** — descriptive (Apriori) + predictive (6 classifiers)
3. **Honest evaluation** — macro F1, Dummy baseline, leakage audit, error analysis
4. **Feature analysis** — identifies what makes puzzles difficult

## 5.3 Limitations

1. **Boundary problems** — puzzles rated 1599 and 1601 are the same difficulty but in different classes
2. **Cold start** — top features are metadata; new puzzles lack these signals
3. **Shallow features** — no engine evaluation, tactical depth, or solution analysis
4. **Arbitrary thresholds** — 1200/1600/2000 chosen by design, not learned

---

# Website Phase-by-Phase Explanation

## Phase 1: Hero Section

**What you see:**
- Project title: "Chess Puzzle Difficulty Classification"
- Author: Hein Htet Zaw (YKPT-22466)
- 3 headline stats:
  - **62.83%** test-set accuracy
  - **0.5909** macro F1 (4.4× over baseline)
  - **89.8%** accuracy with ±1 bin tolerance
- 2 CTA buttons: "Download Project Files" and "Read the Results"
- Background: chessboard pattern overlay

**How to explain:** "This project predicts chess puzzle difficulty. Our best model gets 62.8% accuracy — meaning it correctly classifies about 6 out of 10 puzzles. When allowed to be off by one difficulty level, it's right 89.8% of the time."

---

## Phase 2: Overview Section

**What you see:**
- 6 numbered objectives
- 6 tools with icons and descriptions

**How to explain:** "We had 6 goals: build a reproducible pipeline, predict difficulty without the rating, find pattern rules, compare 6 AI models, check for cheating features, and analyze mistakes. We used Python libraries on Google Colab."

---

## Phase 3: Dataset Section

**What you see:**
- Table 2.1: 11 columns with types and descriptions
- Data quality card: 50,000 rows, 0 duplicates
- Missing values card: OpeningTags 79.8% missing, DailyDate 99.97% missing
- Rating statistics: min 399, max 3108, mean 1471

**How to explain:** "We used 50,000 puzzles from Lichess. Each has 11 columns. Two columns were mostly empty and dropped. The rest are complete. Ratings range from 399 to 3108."

---

## Phase 4: EDA Section

**What you see:**
- Bar chart: Difficulty class distribution (Easy 36.8%, Medium 23.9%, Hard 20.2%, Expert 19.1%)
- Bar chart: Top 20 themes (endgame, short, middlegame...)
- Heatmap: Correlation between numeric columns

**How to explain:** "Easy puzzles dominate at 36.8%. The most common themes are 'endgame' and 'short'. The correlation matrix shows that popularity and number of plays are moderately related, but rating itself isn't strongly correlated with any single number — making the task genuinely hard."

---

## Phase 5: Preprocessing Section

**What you see:**
- Table 3.1: 14 board features extracted from FEN
- Feature matrix breakdown: 3 metadata + 14 board + 73 themes = 90 features
- Train/test split: 40,000 train, 10,000 test, 80/20 ratio

**How to explain:** "We converted the chess board position into 14 numbers (material, king safety, mobility, etc.). Combined with 3 metadata columns and 73 theme flags, we have 90 features per puzzle. We split 80% for training, 20% for testing."

---

## Phase 6: Association Rules Section

**What you see:**
- 4 stat cards: 153 itemsets, 42 rules, all → Easy
- Scatter chart: Support vs Confidence (coloured by lift)
- Table 3.2: Top 10 rules by lift
- Warning card: All 42 rules conclude with Easy

**How to explain:** "We found 42 patterns that predict difficulty. ALL of them predict Easy — for example, 'mateIn1 + middlegame → Easy' with 83% confidence. No pattern predicts Hard or Expert because those depend on the specific position, not simple themes."

---

## Phase 7: Models Section

**What you see:**
- Table 4.1: Hyperparameter grids for each model
- Colab survival kit card (how the crash was fixed)

**How to explain:** "We tested 6 different AI methods. Each was tuned to find its best settings. The initial code crashed on Colab due to memory issues — we fixed it by using float32, saving checkpoints, and optimizing parallelism."

---

## Phase 8: Evaluation Section

**What you see:**
- Bar chart: CV macro F1 for all 6 models
- Table 4.3: Test-set metrics (accuracy, precision, recall, F1)
- Confusion matrix explorer (tabbed by model)
- Per-class accuracy bars

**How to explain:** "Random Forest is the best model with 62.8% accuracy and 0.5824 F1. The confusion matrix shows most predictions are on or near the diagonal — errors between neighboring classes dominate. Easy is recognized 85.1% of the time; Medium and Hard are weakest because they straddle class boundaries."

---

## Phase 9: Feature Importance Section

**What you see:**
- Horizontal bar chart: Top 15 features by importance

**How to explain:** "The model relies most on metadata (how uncertain the rating is, how many times played, popularity) — not the board position itself. This is a concern for new puzzles with few plays, where these signals are missing."

---

## Phase 10: Leakage Audit Section

**What you see:**
- Table 4.4: Run A (90 features) vs Run B (82 features)
- Interpretation card: Drop of 1.13 pp is small

**How to explain:** "We removed 8 'cheating' themes that directly encode answer length. The model's accuracy dropped only 0.25 percentage points — proving it learned genuine chess knowledge, not just shortcuts."

---

## Phase 11: Error Analysis Section

**What you see:**
- 3 stat cards: 3,792 misclassified, 72.6% adjacent, 89.8% tolerance
- Table 4.5: 5 sample misclassified puzzles

**How to explain:** "Most mistakes are off by just one class. For example, a puzzle rated 1490 (Medium) was predicted as Hard — it's only 110 points below the 1600 boundary. The model can't distinguish puzzles that are essentially the same difficulty but sit on opposite sides of a line."

---

## Phase 12: Conclusion Section

**What you see:**
- 5 key takeaways
- Benefits list
- Limitations list
- References

**How to explain:** "The project successfully built a classification system from raw data. Random Forest achieved 4.3× improvement over baseline. The model learns genuine positional knowledge, not shortcuts. Most errors are near class boundaries — an inherent limitation of binning a continuous scale."

---

## Phase 13: Downloads Section

**What you see:**
- 4 download cards: notebook, CSV, report, source code
- Self-host instructions

**How to explain:** "All project files are downloadable. You can run the notebook on Google Colab yourself, or clone the website source to host it locally."

---

# How to Read Every Chart and Table

## Bar Charts

### Difficulty Class Distribution (Figure 2.2)
- **X-axis:** Count of puzzles
- **Y-axis:** Difficulty class (Easy/Medium/Hard/Expert)
- **How to read:** Longer bar = more puzzles in that class
- **Key insight:** Easy has the longest bar (18,414 puzzles = 36.8%)

### Top 20 Themes (Figure 2.4)
- **X-axis:** Count of puzzles with that theme
- **Y-axis:** Theme name
- **How to read:** Longer bar = more common theme
- **Key insight:** "endgame" (25,070) and "short" (24,978) dominate

### CV Macro F1 (Figure 4.1)
- **X-axis:** Model name
- **Y-axis:** Macro F1 score (0 to 0.7)
- **How to read:** Taller bar = better model
- **Key insight:** Random Forest (green) is tallest at 0.5928

### Feature Importance (Figure 4.4)
- **X-axis:** Importance score (0 to 0.14)
- **Y-axis:** Feature name
- **How to read:** Longer bar = more important feature
- **Key insight:** RatingDeviation (0.1347) is most important — metadata, not board position

## Scatter Charts

### Association Rules (Figure 3.1)
- **X-axis:** Support (how common the rule is)
- **Y-axis:** Confidence (how accurate the rule is)
- **Dot size:** Lift (how surprising the rule is)
- **How to read:** Top-right corner = high support + high confidence = strong rule
- **Key insight:** All dots cluster in moderate support (0.05–0.12) and high confidence (0.7–0.9)

## Tables

### Table 2.1 (Dataset Columns)
- Each row = one column in the CSV
- Columns: Name, Type, Description
- How to read: Understand what each piece of data means

### Table 4.2 (CV Results)
- Each row = one model
- Columns: Model name, CV F1 mean, Standard deviation
- How to read: Higher F1 = better. Lower std = more stable.

### Table 4.3 (Test Results)
- Each row = one model
- Columns: Accuracy, Precision, Recall, F1
- How to read: All metrics should be high. F1 is the main metric.

### Table 4.4 (Leakage Audit)
- 3 rows: Run A, Run B, Drop
- Columns: Run name, Feature set, Accuracy, Macro F1
- How to read: Small "Drop" values = model isn't cheating

### Table 4.5 (Misclassified Puzzles)
- Each row = one wrong prediction
- Columns: PuzzleId, Rating, True class, Predicted class, Themes
- How to read: Look for patterns (all are near class boundaries)

## Heatmaps

### Correlation Heatmap (Figure 2.5)
- **Rows/Columns:** Numeric features
- **Cell color:** Red = positive correlation, Blue = negative
- **Cell value:** Correlation coefficient (-1 to +1)
- How to read: Dark red = strong positive, Dark blue = strong negative, White = no correlation

## Confusion Matrices (Figure 4.2)

### How to Read
```
                  PREDICTED
               Easy  Medium  Hard  Expert
ACTUAL Easy   [3130   659   193   186]
     Medium    [153   965   552   213]
      Hard      [99   546   946   337]
    Expert     [301   168   385  1167]
```

- **Diagonal (top-left to bottom-right):** Correct predictions
- **Off-diagonal:** Mistakes
- **Row totals:** How many actual puzzles in each class
- **Column totals:** How many predictions in each class
- **Key insight:** Most mass is on or near the diagonal → errors are adjacent

---

# Glossary of All Data Mining Terms

| Term | Definition | In This Project |
|------|-----------|-----------------|
| **Accuracy** | % of correct predictions | 62.83% for Random Forest |
| **Association Rule** | If-then pattern in data | {mateIn1, middlegame} → Easy |
| **Apriori** | Algorithm for finding frequent itemsets | Used to find 42 rules |
| **AUC** | Area Under the ROC Curve | 0.924 for Easy class |
| **Baseline** | Minimum performance bar | Dummy classifier (always Easy) |
| **Binning** | Converting continuous to categories | Rating → Easy/Medium/Hard/Expert |
| **Class Imbalance** | Unequal category sizes | Easy 36.8% vs Expert 19.1% |
| **Classification** | Predicting categories | Easy/Medium/Hard/Expert |
| **Confidence** | Accuracy of an association rule | ≥ 70% threshold |
| **Confusion Matrix** | Table of predictions vs actuals | Shows where model gets confused |
| **Cross-Validation** | Testing on multiple data splits | 5-fold stratified CV |
| **Data Leakage** | Answer accidentally in features | Rating used as input would be leakage |
| **Decision Tree** | Flowchart-like classifier | One of 6 models tested |
| **EDA** | Exploratory Data Analysis | Looking at data before modeling |
| **Feature** | Input variable | 90 features per puzzle |
| **Feature Engineering** | Creating new features | Extracting 14 features from FEN |
| **Feature Importance** | Ranking of feature usefulness | RatingDeviation is #1 |
| **F1 Score** | Harmonic mean of precision and recall | Main metric (macro F1) |
| **Frequent Itemset** | Group of items appearing together often | 153 itemsets found |
| **FEN** | Forsyth-Edwards Notation | Chess position description |
| **GridSearchCV** | Trying all hyperparameter combinations | Used for all models except Dummy |
| **Glicko Rating** | Difficulty number system | 400–3100 scale |
| **Hyperparameter** | Setting chosen before training | max_depth, n_estimators, etc. |
| **KNN** | K-Nearest Neighbors algorithm | Finds 9 similar puzzles |
| **Label Encoding** | Converting categories to numbers | Easy→0, Medium→1, Hard→2, Expert→3 |
| **Lift** | How surprising an association rule is | > 1.0 means surprising |
| **Leakage Audit** | Testing for shortcut learning | Run A vs Run B comparison |
| **LinearSVC** | Linear Support Vector Classifier | Draws straight boundaries |
| **Macro F1** | Average F1 across all classes | Main evaluation metric |
| **Multi-Class** | 3+ categories | Easy/Medium/Hard/Expert |
| **Normalization** | Scaling features to similar ranges | StandardScaler on numerical features |
| **One-Hot Encoding** | Binary columns for categories | 73 theme columns |
| **Overfitting** | Model memorizes training data | Cross-validation helps detect |
| **Precision** | When predicting X, how often right? | 0.5863 for Random Forest |
| **Preprocessing** | Cleaning data for modeling | Dropping columns, encoding, scaling |
| **Random Forest** | Ensemble of decision trees | 200 trees, best model |
| **Random State/Seed** | Ensures reproducibility | seed=42 throughout |
| **RBF SVM** | Kernel Support Vector Machine | Curved boundaries |
| **Recall** | Of all actual X, how many found? | 0.5779 for Random Forest |
| **Regression** | Predicting numbers | Not used (we do classification) |
| **ROC Curve** | Receiver Operating Characteristic curve | Shows discrimination ability |
| **StandardScaler** | Zero mean, unit variance normalization | Applied to 17 numerical features |
| **Stratified Split** | Maintaining class proportions | 80/20 split with equal class ratios |
| **Support** | Frequency of an itemset | ≥ 5% threshold |
| **Supervised Learning** | Learning from labeled data | All 6 classifiers |
| **Target Variable** | What we're predicting | Difficulty class |
| **Tautological** | True by definition | mateIn1 = definitionally Easy |
| **Test Set** | Unseen data for evaluation | 10,000 puzzles |
| **Theme** | Chess tactical tag | fork, pin, mateIn1, etc. |
| **Train-Test Split** | Dividing data for training and testing | 80% train, 20% test |
| **Training Set** | Data used to teach the model | 40,000 puzzles |
| **Tolerance** | Allowing off-by-one predictions | 89.8% with ±1 bin |

---

*Document created: September 2026*
*For the IS-212 Data and Knowledge Mining course project*
*Author: Hein Htet Zaw (YKPT-22466)*
