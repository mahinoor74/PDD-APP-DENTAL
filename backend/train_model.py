"""
train_model.py
──────────────
Trains the full 10,000-sample Dental AI model (dr_minty_10k_model.pkl).

Run:
    D:\\python.exe train_model.py
"""

import os
import sys
import json
import pickle
import numpy as np
from collections import defaultdict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "dental_10000_dataset.json")
MODEL_PATH = os.path.join(BASE_DIR, "models", "dr_minty_10k_model.pkl")

# ─────────────────────────────────────────────
# Augmentation helpers
# ─────────────────────────────────────────────
PREFIXES = ["doc", "dr minty", "how to", ""]
SUFFIXES = ["please", "today", ""]


def augment_query(query: str) -> list[str]:
    """Generate lightweight synthetic variants for a single query string."""
    variants = [query]
    q_lower = query.lower()
    for p in PREFIXES:
        for s in SUFFIXES:
            v = f"{p} {q_lower} {s}".strip()
            if v and v != q_lower:
                variants.append(v)
    return variants


# ─────────────────────────────────────────────
# Main training function
# ─────────────────────────────────────────────
def train_dental_ml_model():
    print("🚀 STARTING DR. MINTY 10K MODEL TRAINING …")
    print(f"   Dataset  : {DATASET_PATH}")
    print(f"   Output   : {MODEL_PATH}")

    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(
            f"Dataset not found at {DATASET_PATH}.\n"
            "Run dataset_generator.py first."
        )

    # ── Load dataset ──────────────────────────
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    raw_queries   = [item["query"]    for item in dataset]
    raw_categories = [item["category"] for item in dataset]
    raw_responses  = [item["response"] for item in dataset]

    unique_cats = len(set(raw_categories))
    print(f"📦 Loaded {len(raw_queries)} samples across {unique_cats} clinical categories.")

    # ── Build category → representative response map ──
    category_response_map: dict[str, str] = {}
    category_chips_map: dict[str, list[str]] = {}

    cat_to_responses: dict[str, list[str]] = defaultdict(list)
    for cat, resp in zip(raw_categories, raw_responses):
        cat_to_responses[cat].append(resp)

    for cat, resps in cat_to_responses.items():
        # Pick the longest response as the representative one
        category_response_map[cat] = max(resps, key=len)

    # Derive follow-up chips from category names (prettified)
    CHIP_OVERRIDES = {
        "toothache":              ["What relieves toothache fast?", "Can I take painkillers for toothache?", "When should I see a dentist for pain?"],
        "gum_bleeding":           ["Why are my gums bleeding?", "How to stop gum bleeding at home?", "Is gum bleeding dangerous?"],
        "sensitivity":            ["How to reduce tooth sensitivity?", "Best toothpaste for sensitive teeth?", "What causes sudden sensitivity?"],
        "brushing_technique":     ["Show me Modified Bass technique", "How long should I brush?", "Soft vs hard bristle toothbrush?"],
        "root_canal":             ["Is root canal painful?", "Root canal recovery tips", "How long does RCT take?"],
        "whitening":              ["Safe home whitening methods", "Whitening strips vs trays", "How long does whitening last?"],
        "braces_care":            ["How to clean around braces?", "Foods to avoid with braces?", "Braces pain relief tips"],
        "implants":               ["Are dental implants permanent?", "Implant aftercare guide", "Implant vs bridge differences"],
        "bad_breath":             ["Causes of persistent bad breath", "How to cure morning breath?", "Best mouthwash for bad breath?"],
        "greetings":              ["How to reduce tooth sensitivity?", "Why do my gums bleed?", "Modified Bass technique guide"],
        "catch_all_fallback":     ["How to reduce tooth sensitivity?", "Why do my gums bleed?", "Modified Bass technique guide", "How to care for braces?"],
    }
    for cat in set(raw_categories):
        if cat in CHIP_OVERRIDES:
            category_chips_map[cat] = CHIP_OVERRIDES[cat]
        else:
            pretty = cat.replace("_", " ").title()
            category_chips_map[cat] = [
                f"Tell me more about {pretty}",
                f"What causes {pretty.lower()}?",
                f"{pretty} prevention tips",
            ]

    fallback_resp = category_response_map.get(
        "catch_all_fallback",
        "I am Dr. Minty, your AI Dental Coach. How can I help with your teeth, gums, or oral hygiene today?"
    )
    fallback_chips = CHIP_OVERRIDES.get("catch_all_fallback", [
        "How to reduce tooth sensitivity?",
        "Why do my gums bleed?",
        "Modified Bass technique guide",
    ])

    # ── Data Augmentation ──────────────────────
    print("🔄 Augmenting dataset with synthetic query variants …")
    aug_queries:    list[str] = []
    aug_categories: list[str] = []
    aug_responses:  list[str] = []

    for q, cat, resp in zip(raw_queries, raw_categories, raw_responses):
        for v in augment_query(q):
            aug_queries.append(v)
            aug_categories.append(cat)
            aug_responses.append(resp)

    print(f"📦 Augmented corpus: {len(aug_queries)} samples.")

    # ── TF-IDF Vectorisation ──────────────────
    print("🔢 Fitting TF-IDF vectoriser (ngram 1-3, max_features=40000) …")
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 3),
        sublinear_tf=True,
        max_features=40_000,
        strip_accents="unicode",
        analyzer="word",
        min_df=1,
    )
    X = vectorizer.fit_transform(aug_queries)
    y = aug_categories

    # ── Train / Validation Split ───────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.1, random_state=42, stratify=y
    )

    # ── Logistic Regression Classifier ────────
    print("🧠 Training Logistic Regression classifier …")
    clf = LogisticRegression(C=5.0, max_iter=1000, solver="lbfgs")
    clf.fit(X_train, y_train)

    train_acc = clf.score(X_train, y_train) * 100
    test_acc  = clf.score(X_test,  y_test)  * 100
    print(f"   Training accuracy   : {train_acc:.2f}%")
    print(f"   Validation accuracy : {test_acc:.2f}%")

    # Final fit on full augmented corpus
    print("🔄 Re-fitting on full augmented corpus for production deployment …")
    clf.fit(X, y)

    # ── Cosine Similarity Reference Matrix ────
    # Use only the ORIGINAL 10k samples for retrieval (avoids duplicate augmented hits)
    print("🔢 Building cosine-similarity matrix over original 10k samples …")
    X_orig = vectorizer.transform(raw_queries)

    # ── Assemble payload ───────────────────────
    model_payload = {
        "vectorizer":           vectorizer,
        "classifier":           clf,
        "queries":              raw_queries,
        "categories":           raw_categories,
        "responses":            raw_responses,
        "tfidf_matrix":         X_orig,       # reference: original 10k
        "category_response_map": category_response_map,
        "category_chips_map":   category_chips_map,
        "fallback_response":    fallback_resp,
        "fallback_chips":       fallback_chips,
        "dataset_size":         len(raw_queries),
    }

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model_payload, f)

    print(f"\n💾 MODEL SAVED → {MODEL_PATH}")
    print(f"   Total categories : {unique_cats}")
    print(f"   Dataset samples  : {len(raw_queries)}")
    print(f"   Augmented corpus : {len(aug_queries)}")

    # ── Spot-check inferences ─────────────────
    test_inputs = [
        "hi dr minty",
        "my tooth hurts when drinking cold water",
        "how do I brush with braces?",
        "gums are bleeding a lot",
        "what is root canal treatment?",
        "how to whiten teeth at home?",
        "rct procedure steps",
        "bad breath cure",
        "help me my tooth fell out",
    ]
    print("\n🧪 SPOT-CHECK INFERENCES:")
    for ti in test_inputs:
        vec = vectorizer.transform([ti])
        cat = clf.predict(vec)[0]
        sims = cosine_similarity(vec, X_orig)[0]
        top_idx = int(np.argmax(sims))
        top_sim = float(sims[top_idx])
        print(f"   '{ti}' → [{cat}] (cosine: {top_sim:.3f})")

    print("\n✅ DR. MINTY 10K MODEL TRAINING COMPLETE!")


if __name__ == "__main__":
    train_dental_ml_model()
