import os
import json
import pickle
import sys
import random
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "data", "dental_chatbot_dataset.json")
MODEL_PATH = os.path.join(BASE_DIR, "models", "dr_minty_model.pkl")

def train_dr_minty_model():
    print("🚀 TRAINING 100% LOCAL DENTAL CHATBOT MODEL (dr_minty_model.pkl)...")
    
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")
        
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        categories_data = json.load(f)

    all_queries = []
    all_categories = []
    category_responses = {}
    category_chips = {}

    for cat_obj in categories_data:
        cat = cat_obj["category"]
        resp = cat_obj["response"]
        chips = cat_obj.get("followUpChips", [])
        category_responses[cat] = resp
        category_chips[cat] = chips
        
        # Ingest base queries
        for q in cat_obj["queries"]:
            all_queries.append(q)
            all_categories.append(cat)
            
            # Generate synthetic variations (typos, prefixes, suffixes)
            prefixes = ["doc", "dr minty", "can you tell me", "how to", "please help with", "what about", ""]
            suffixes = ["please", "urgently", "at home", "today", "tips", "guide", ""]
            
            for p in prefixes:
                for s in suffixes:
                    variant = f"{p} {q} {s}".strip()
                    if variant and len(variant) > 2:
                        all_queries.append(variant)
                        all_categories.append(cat)

    print(f"📦 Total Augmented Dataset Ingested: {len(all_queries)} samples across {len(category_responses)} categories.")

    # 1. Scikit-Learn TF-IDF N-Gram Vectorizer
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 3),
        sublinear_tf=True,
        max_features=30000,
        strip_accents='unicode',
        analyzer='word'
    )
    
    X = vectorizer.fit_transform(all_queries)
    y = all_categories
    
    # 2. Classifier Training & Validation Accuracy
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)
    
    classifier = LogisticRegression(C=5.0, max_iter=1000, solver='lbfgs')
    classifier.fit(X_train, y_train)
    
    train_acc = classifier.score(X_train, y_train) * 100
    test_acc = classifier.score(X_test, y_test) * 100
    
    print(f"📊 Training Accuracy: {train_acc:.2f}%")
    print(f"📊 Validation Accuracy: {test_acc:.2f}%")
    
    # Fit classifier on full dataset for production deployment
    classifier.fit(X, y)

    # 3. Model Payload Export
    model_payload = {
        "vectorizer": vectorizer,
        "classifier": classifier,
        "queries": all_queries,
        "categories": all_categories,
        "category_responses": category_responses,
        "category_chips": category_chips,
        "tfidf_matrix": X,
        "fallback_response": category_responses.get("catch_all_fallback", "I am Dr. Minty, your Senior AI Dental Coach. How can I help you with your teeth, gums, brushing, or oral hygiene today?"),
        "fallback_chips": category_chips.get("catch_all_fallback", ["How to reduce tooth sensitivity?", "Why do my gums bleed?", "Modified Bass technique guide"])
    }

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model_payload, f)

    print(f"💾 LOCAL DENTAL CHATBOT MODEL SUCCESSFULLY SAVED AT: {MODEL_PATH}")

if __name__ == "__main__":
    train_dr_minty_model()
