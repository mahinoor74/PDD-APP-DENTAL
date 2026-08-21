import sys
import os
import re
import pickle
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Primary model trained on 10,000 dental dataset
MODEL_PATH = os.path.join(BASE_DIR, "models", "dr_minty_10k_model.pkl")
# Fallback: old chatbot model
FALLBACK_MODEL_PATH = os.path.join(BASE_DIR, "models", "dr_minty_model.pkl")

# Import persona intent handler
from ai_service import handle_conversational_and_persona_intents

# ─────────────────────────────────────────────
# Typo & Slang Normalization Dictionary
# ─────────────────────────────────────────────
TYPOS_MAP = {
    "hlo": "hello", "hlw": "hello", "hii": "hi", "hiii": "hi",
    "helo": "hello", "heyy": "hey", "yo": "hi", "hola": "hello",
    "namaste": "hello", "gm": "good morning", "goodmrng": "good morning",
    "gn": "good night", "ge": "good evening", "tq": "thank you",
    "thx": "thanks", "thanks": "thank you", "byee": "bye", "byy": "bye",
    "whos this": "who are you", "who u": "who are you",
    "what u do": "what can you do", "how r u": "how are you",
    "rct": "root canal treatment", "brsh": "brush", "brshing": "brushing",
    "sensitiv": "sensitive", "cavty": "cavity", "whitning": "whitening",
    "dentst": "dentist", "flos": "floss", "tootache": "toothache",
    "gumsbleed": "gums bleed", "gumbleed": "gum bleed", "swallon": "swollen",
    "swelln": "swollen", "ache": "ache", "painn": "pain",
    "infectn": "infection", "infect": "infection", "braces": "braces",
    "implnt": "implant", "implantt": "implant", "crownn": "crown",
    "floss": "floss", "mouthwash": "mouthwash", "mouthwsh": "mouthwash",
    "bleachng": "bleaching", "whiten": "whitening",
}

# ─────────────────────────────────────────────
# Confidence thresholds
# ─────────────────────────────────────────────
HIGH_CONFIDENCE_THRESHOLD = 0.35
COSINE_THRESHOLD = 0.12

# Intelligent clinical fallback when confidence is too low
CLINICAL_FALLBACK_RESPONSES = [
    "I am Dr. Minty, your AI Dental Coach. Could you describe your dental concern in more detail? For example: tooth pain, bleeding gums, brushing technique, or sensitivity?",
    "As Dr. Minty, I'm here to help with all your dental needs. Could you be more specific? I can guide you on brushing techniques, gum health, cavities, root canals, implants, and more.",
    "I didn't quite catch that! I'm Dr. Minty. You can ask me about toothache, gum bleeding, whitening, braces care, root canal, or brushing technique advice.",
    "Could you rephrase that? I'm Dr. Minty, your virtual Senior Oral Dentist. I specialise in brushing techniques, sensitivity, gum health, extractions, and emergency dental first aid.",
]

CLINICAL_FALLBACK_CHIPS = [
    "How to reduce tooth sensitivity?",
    "Why do my gums bleed?",
    "Modified Bass technique guide",
    "How to care for braces?",
    "What causes toothache?",
    "Tell me a dental joke",
]


class DrMintyLocalModel:
    """
    100% Local, Offline Dental AI Engine.
    Trained on dental_10000_dataset.json → dr_minty_10k_model.pkl

    Pipeline:
      1. Persona & Conversational intent matching (ai_service.py)
      2. Typo & slang normalization
      3. TF-IDF N-Gram Vectorisation (unigram–trigram, max 40,000 features)
      4. Logistic Regression intent classification
      5. Cosine Similarity nearest-neighbour response retrieval
      6. Intelligent clinical fallback
    """

    def __init__(self):
        self.vectorizer = None
        self.classifier = None
        self.queries = []
        self.categories = []
        self.responses = []
        self.category_response_map = {}
        self.category_chips_map = {}
        self.tfidf_matrix = None
        self.fallback_response = CLINICAL_FALLBACK_RESPONSES[0]
        self.fallback_chips = CLINICAL_FALLBACK_CHIPS
        self.is_loaded = False
        self._fallback_cycle = 0

    # ────────────────────────────────────────
    # Model Loading
    # ────────────────────────────────────────
    def load_model(self) -> bool:
        """Load dr_minty_10k_model.pkl. Auto-trains if not found."""
        if not os.path.exists(MODEL_PATH):
            print(f"⚠️  10K model not found at {MODEL_PATH}. Auto-training from dental_10000_dataset.json …")
            try:
                from train_model import train_dental_ml_model
                train_dental_ml_model()
            except Exception as train_err:
                print(f"❌ Auto-training failed: {train_err}")

        # Try primary 10K model
        if os.path.exists(MODEL_PATH):
            try:
                with open(MODEL_PATH, "rb") as f:
                    data = pickle.load(f)
                self._ingest_model(data)
                self.is_loaded = True
                print(f"✅ DR. MINTY 10K LOCAL MODEL LOADED ({len(self.queries)} samples, "
                      f"{len(self.category_response_map)} categories)")
                return True
            except Exception as err:
                print(f"❌ Error loading 10K model: {err}")

        # Try legacy fallback model
        if os.path.exists(FALLBACK_MODEL_PATH):
            try:
                with open(FALLBACK_MODEL_PATH, "rb") as f:
                    data = pickle.load(f)
                self._ingest_model(data)
                self.is_loaded = True
                print(f"⚠️  Loaded fallback chatbot model ({len(self.queries)} samples)")
                return True
            except Exception as err:
                print(f"❌ Error loading fallback model: {err}")

        print("❌ No model available. Running in pure fallback mode.")
        return False

    def _ingest_model(self, data: dict):
        """Populate instance fields from a pickle payload."""
        self.vectorizer = data.get("vectorizer")
        self.classifier = data.get("classifier")
        self.queries = data.get("queries", [])
        self.categories = data.get("categories", [])
        self.responses = data.get("responses", [])
        self.tfidf_matrix = data.get("tfidf_matrix")

        # Build category → best response map from dataset
        self.category_response_map = data.get("category_response_map", {})
        self.category_chips_map = data.get("category_chips_map", {})

        if not self.category_response_map and self.queries:
            seen = {}
            for q, cat, resp in zip(self.queries, self.categories, self.responses):
                if cat not in seen:
                    seen[cat] = resp
            self.category_response_map = seen

        self.fallback_response = data.get("fallback_response", CLINICAL_FALLBACK_RESPONSES[0])
        self.fallback_chips = data.get("fallback_chips", CLINICAL_FALLBACK_CHIPS)

    # ────────────────────────────────────────
    # Text Pre-processing
    # ────────────────────────────────────────
    @staticmethod
    def _preprocess(text: str) -> str:
        clean = text.strip().lower()
        clean = re.sub(r"[^\w\s]", " ", clean)
        words = clean.split()
        words = [TYPOS_MAP.get(w, w) for w in words]
        return " ".join(words)

    # ────────────────────────────────────────
    # Main Inference
    # ────────────────────────────────────────
    def predict(self, user_query: str) -> dict:
        """
        Sub-10ms Local Inference.
        Returns: { response, text, category, confidence, followUpChips }
        """
        if not self.is_loaded:
            self.load_model()

        raw = user_query.strip() if user_query else ""
        if not raw:
            return self._greet_response()

        # 1. Persona & Conversational Matrix Check (ai_service.py)
        persona_resp = handle_conversational_and_persona_intents(raw)
        if persona_resp:
            return {
                "response": persona_resp,
                "text": persona_resp,
                "category": "persona_conversational",
                "confidence": 1.0,
                "followUpChips": CLINICAL_FALLBACK_CHIPS,
            }

        normalized = self._preprocess(raw)

        # Model not available → intelligent clinical fallback
        if not self.vectorizer or not self.classifier:
            return self._clinical_fallback()

        try:
            # 2. Vectorise
            query_vec = self.vectorizer.transform([normalized])

            # 3. Logistic Regression intent classification
            predicted_cat = str(self.classifier.predict(query_vec)[0])
            probs = self.classifier.predict_proba(query_vec)[0]
            lr_confidence = float(np.max(probs))

            # 4. Cosine Similarity nearest-neighbour retrieval
            sims = cosine_similarity(query_vec, self.tfidf_matrix)[0]
            top_idx = int(np.argmax(sims))
            top_sim = float(sims[top_idx])

            # 5. Decide response strategy
            if top_sim > COSINE_THRESHOLD or lr_confidence > HIGH_CONFIDENCE_THRESHOLD:

                if top_sim > COSINE_THRESHOLD and self.responses:
                    best_response = self.responses[top_idx]
                else:
                    best_response = self.category_response_map.get(
                        predicted_cat, self.fallback_response
                    )

                chips = self.category_chips_map.get(predicted_cat, self.fallback_chips)
                final_confidence = float(round(max(lr_confidence, top_sim), 3))

                return {
                    "response": str(best_response),
                    "text": str(best_response),
                    "category": str(predicted_cat),
                    "confidence": final_confidence,
                    "followUpChips": [str(c) for c in chips],
                }

        except Exception as exc:
            print(f"Prediction error: {exc}")

        return self._clinical_fallback()

    # ────────────────────────────────────────
    # Fallback Helpers
    # ────────────────────────────────────────
    def _greet_response(self) -> dict:
        resp = self.category_response_map.get(
            "greetings",
            "Hello there! How can I help you take care of your teeth and gums today?"
        )
        return {
            "response": resp, "text": resp,
            "category": "greetings", "confidence": 1.0,
            "followUpChips": CLINICAL_FALLBACK_CHIPS,
        }

    def _clinical_fallback(self) -> dict:
        resp = CLINICAL_FALLBACK_RESPONSES[self._fallback_cycle % len(CLINICAL_FALLBACK_RESPONSES)]
        self._fallback_cycle += 1
        return {
            "response": resp, "text": resp,
            "category": "catch_all_fallback", "confidence": 0.0,
            "followUpChips": CLINICAL_FALLBACK_CHIPS,
        }


# ─────────────────────────────────────────────
# Singleton instance (imported by main.py)
# ─────────────────────────────────────────────
global_dental_ai_model = DrMintyLocalModel()
global_dental_ai_model.load_model()
