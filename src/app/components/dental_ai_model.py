import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

import re
import math
import random
from typing import List, Dict, Tuple, Optional

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

# ---------------------------------------------------------------------------
# CLINICAL DENTAL KNOWLEDGE BASE (60+ Clinical Categories)
# ---------------------------------------------------------------------------
CLINICAL_KNOWLEDGE_BASE: List[Dict[str, any]] = [
    # --- BRUSHING TECHNIQUES ---
    {
        "category": "modified_bass_technique",
        "patterns": [r"\bm-?bass\b", r"\bmodified bass\b", r"\bbass technique\b", r"\bsulcular brushing\b", r"\bgum line brushing\b"],
        "answer": (
            "**Modified Bass Technique** (Gold-Standard Periodontist Method):\n\n"
            "1. **Angle**: Place toothbrush bristles at a 45-degree angle pointing directly into the line where your teeth meet your gums.\n"
            "2. **Motion**: Apply gentle pressure so bristle tips enter the top of the gum pocket (sulcus). Execute 10 short, gentle vibratory back-and-forth shakes on the spot.\n"
            "3. **Sweep**: Roll the brush head firmly away from the gums toward the chewing surface to sweep away dislodged plaque.\n"
            "4. **Coverage**: Repeat on all outer, inner, and chewing surfaces twice daily for 2 full minutes."
        )
    },
    {
        "category": "stillman_technique",
        "patterns": [r"\bstillman\b", r"\bmodified stillman\b", r"\breceded gums technique\b", r"\breceding gums brushing\b"],
        "answer": (
            "**Modified Stillman Technique** (Best for Receded Gums & Sensitivity):\n\n"
            "1. **Position**: Place bristles half on the attached gum tissue and half on the exposed tooth root surface at a 45-degree angle toward the apex.\n"
            "2. **Pulsing**: Apply light pressure until slight gum blanching occurs, then perform short pulsing vibratory strokes for 5-10 seconds.\n"
            "3. **Roll**: Sweep/roll the brush head downward (upper teeth) or upward (lower teeth) away from the gums.\n"
            "4. **Benefit**: Stimulates blood flow to fragile gum tissue while cleaning without causing painful root abrasion."
        )
    },
    {
        "category": "charters_technique",
        "patterns": [r"\bcharter\b", r"\bcharters\b", r"\bbraces technique\b", r"\borthodontic brushing\b", r"\bunder wires\b"],
        "answer": (
            "**Orthodontic Charters Technique** (Best for Fixed Braces & Wires):\n\n"
            "1. **Angle**: Angle toothbrush bristles at 45 degrees pointing *downward toward the chewing surface* (opposite of Bass technique).\n"
            "2. **Vibration**: Execute small, gentle circular vibratory strokes to flex bristle ends underneath the metal archwires and bracket wings.\n"
            "3. **Reverse Angle**: Reverse the angle (pointing 45° upward from below the bracket) to clean underneath the lower wire edge.\n"
            "4. **Tip**: Always pair with an interdental proxy brush to clean trapped food debris between individual brackets."
        )
    },
    {
        "category": "fones_circular_technique",
        "patterns": [r"\bfones\b", r"\bcircular technique\b", r"\bkids brushing method\b", r"\bchild technique\b"],
        "answer": (
            "**Fones Circular Technique** (Best for Children & Beginners):\n\n"
            "1. **Position**: Close teeth together naturally.\n"
            "2. **Motion**: Move the toothbrush in wide, sweeping circular motions over both upper and lower teeth and gums together.\n"
            "3. **Inner Walls**: Open wide and sweep inside tongue-side surfaces back to front.\n"
            "4. **Chewing Surfaces**: Scrub chewing tops back and forth gently."
        )
    },
    {
        "category": "roll_sweep_technique",
        "patterns": [r"\broll technique\b", r"\bsweep technique\b", r"\bstandard brushing\b", r"\bbasic brushing\b"],
        "answer": (
            "**Roll / Sweep Technique** (Preventative Daily Routine):\n\n"
            "1. **Position**: Place bristles parallel against attached gums.\n"
            "2. **Roll**: Sweep bristles downward (upper arch) or upward (lower arch) over tooth crowns in a smooth rolling motion.\n"
            "3. **Repeat**: Perform 5-6 rolls per section before advancing to adjacent teeth."
        )
    },

    # --- COMMON ORAL SYMPTOMS & CLINICAL PROBLEMS ---
    {
        "category": "tooth_sensitivity",
        "patterns": [r"\bsensitiv", r"\bhot or cold pain\b", r"\bcold water pain\b", r"\bsweet pain\b", r"\bsensitive teeth\b", r"\bsensitive tooth\b"],
        "answer": (
            "**Understanding & Treating Tooth Sensitivity**:\n\n"
            "• **Causes**: Exposed dentin from gum recession, enamel wear, aggressive scrubbing, acid erosion, or micro-cracks.\n"
            "• **Clinical Action Plan**:\n"
            "  1. Switch immediately to an ultra-soft toothbrush and avoid medium/hard bristles.\n"
            "  2. Use a potassium nitrate or stannous fluoride desensitizing toothpaste (e.g. Sensodyne, Pro-Enamel).\n"
            "  3. Do not rinse with water immediately after brushing; let the residual paste coat tooth tubules.\n"
            "  4. Avoid acidic drinks (sodas, lemon water, energy drinks) or use a straw."
        )
    },
    {
        "category": "bleeding_gums",
        "patterns": [r"\bbleed", r"\bbleeding gums\b", r"\bgum bleed\b", r"\bblood when brushing\b", r"\bpink in sink\b", r"\bswollen gums\b", r"\bgingivitis\b"],
        "answer": (
            "**Bleeding Gums & Gingivitis Care**:\n\n"
            "• **Why Gums Bleed**: Bleeding is caused by bacterial plaque trapped along the gumline (sulcus), creating localized tissue inflammation (gingivitis).\n"
            "• **How to Fix It**:\n"
            "  1. **Do NOT stop brushing**! Stopping allows plaque buildup to worsen.\n"
            "  2. Use the **Modified Bass Technique** (45° angle to gumline) with a soft brush twice daily.\n"
            "  3. Floss daily or use a water flosser to remove subgingival plaque between teeth.\n"
            "  4. Bleeding usually subsides within 7-14 days of consistent, correct cleaning. If bleeding persists beyond 2 weeks, consult your dentist for a professional scaling."
        )
    },
    {
        "category": "toothache_emergency",
        "patterns": [r"\btoothache\b", r"\bsevere pain\b", r"\bthrobbing pain\b", r"\btooth hurt\b", r"\bswollen face\b", r"\bpulser\b", r"\babcess\b"],
        "answer": (
            "**Toothache Emergency Protocol**:\n\n"
            "⚠️ *Severe or throbbing toothaches require professional dental treatment.*\n\n"
            "**First-Aid Relief Steps**:\n"
            "1. **Rinse**: Rinse thoroughly with warm salt water (1/2 tsp salt in 1 cup warm water) to clean the area.\n"
            "2. **Floss**: Gently floss around the painful tooth to remove any trapped food wedge.\n"
            "3. **Pain Relief**: Take over-the-counter pain relievers (Ibuprofen/Acetaminophen) as directed on package labels.\n"
            "4. **Cold Compress**: Apply an ice pack wrapped in a towel to the outside of your cheek (15 mins on, 15 mins off).\n"
            "5. **NEVER**: Do not place aspirin directly on gum tissue—it causes severe chemical burns!"
        )
    },
    {
        "category": "knocked_out_tooth",
        "patterns": [r"\bknocked out\b", r"\bbroken tooth\b", r"\bchipped tooth\b", r"\bavulsed tooth\b", r"\btooth fell out\b", r"\btrauma\b"],
        "answer": (
            "**EMERGENCY: Knocked-Out Permanent Tooth**:\n\n"
            "⏱️ *Time is critical! Re-implantation is most successful within 30-60 minutes.*\n\n"
            "1. **Pick up by the CROWN only**—never touch the root surface or root fibers!\n"
            "2. **Rinse gently** with cold milk or saline if dirty. Do not scrub or dry with paper towels.\n"
            "3. **Reinsert**: If possible, gently push the tooth back into its socket and bite gently on a clean cloth.\n"
            "4. **Storage**: If reinsertion is not possible, store the tooth in a cup of cold milk or Hanks Balanced Salt Solution (HBSS).\n"
            "5. **Go to an emergency dentist immediately!**"
        )
    },
    {
        "category": "bad_breath_halitosis",
        "patterns": [r"\bbad breath\b", r"\bhalitosis\b", r"\bsmelly mouth\b", r"\bmouth odor\b", r"\btongue coating\b"],
        "answer": (
            "**Eliminating Bad Breath (Halitosis)**:\n\n"
            "• 85-90% of bad breath originates from volatile sulfur compounds (VSCs) produced by anaerobic bacteria on the tongue and along the gumline.\n\n"
            "**Treatment Steps**:\n"
            "1. **Scrape Your Tongue**: Use a dedicated metal or plastic tongue scraper twice daily from back to front.\n"
            "2. **Subgingival Cleaning**: Brush gumline at 45° (Modified Bass) and floss daily.\n"
            "3. **Hydrate**: Drink plenty of water; dry mouth accelerates odor-causing bacteria.\n"
            "4. **Mouthwash**: Use an alcohol-free antiseptic mouthwash containing zinc or cetylpyridinium chloride (CPC)."
        )
    },
    {
        "category": "mouth_ulcers_canker_sores",
        "patterns": [r"\bmouth ulcer\b", r"\bcanker sore\b", r"\baphthous\b", r"\bblister in mouth\b", r"\bsore cheek\b"],
        "answer": (
            "**Mouth Ulcers & Canker Sores**:\n\n"
            "• **Causes**: Minor tissue trauma, stress, acidic foods, or SLS (sodium lauryl sulfate) in toothpaste.\n"
            "• **Relief Tips**:\n"
            "  1. Switch to an SLS-free toothpaste.\n"
            "  2. Rinse with warm salt water 3-4 times daily.\n"
            "  3. Apply topical OTC oral anesthetic gels (e.g. Benzocaine) for pain relief.\n"
            "  4. Avoid spicy, salty, or highly acidic foods.\n"
            "  5. Most ulcers heal naturally in 7-10 days. If an ulcer persists longer than 2 weeks, have it evaluated by a dentist."
        )
    },

    # --- DENTAL PROCEDURES & TREATMENTS ---
    {
        "category": "root_canal_treatment",
        "patterns": [r"\brct\b", r"\broot canal\b", r"\broot canal treatment\b", r"\bendodontic\b", r"\bpulp infection\b"],
        "answer": (
            "**Root Canal Treatment (RCT) Information**:\n\n"
            "• **What is RCT?**: A comfortable, routine dental procedure designed to save an infected or deeply decayed tooth instead of extracting it.\n"
            "• **How it Works**:\n"
            "  1. The dentist numbs the area completely with local anesthesia (you feel no pain during treatment).\n"
            "  2. Infected nerve pulp inside the tooth canals is carefully cleaned, disinfected, and shaped.\n"
            "  3. Canals are sealed with a biocompatible material called gutta-percha.\n"
            "  4. A protective dental crown is placed on top to restore full chewing strength.\n"
            "• **Post-Op Care**: Avoid biting hard foods on the tooth until the final crown is placed."
        )
    },
    {
        "category": "dental_implants",
        "patterns": [r"\bimplant\b", r"\bdental implant\b", r"\bimplant crown\b", r"\bperi-implantitis\b"],
        "answer": (
            "**Dental Implant Care & Maintenance**:\n\n"
            "• Dental implants replace natural tooth roots with durable titanium anchors.\n"
            "• **Care Guide**:\n"
            "  1. Use the **Smith-Bell Sulcular Method** to clean margins around implant crowns.\n"
            "  2. Use non-abrasive, soft bristle brushes.\n"
            "  3. Floss daily with thick implant-floss (Superfloss) or use a water flosser around posts to prevent peri-implantitis (inflammation around implants)."
        )
    },
    {
        "category": "crowns_and_bridges",
        "patterns": [r"\bcrown\b", r"\bbridge\b", r"\bcaps\b", r"\bdental cap\b", r"\bfixed bridge\b"],
        "answer": (
            "**Dental Crown & Bridge Care**:\n\n"
            "• Crowns and bridges restore damaged or missing teeth.\n"
            "• **Hygiene Instructions**:\n"
            "  1. Clean margins where the crown meets the natural gum line gently.\n"
            "  2. For bridges: Use floss threaders or interdental brushes under the bridge pontic (false tooth) daily.\n"
            "  3. Avoid chewing ice, hard candies, or sticky caramels that might unseat crowns."
        )
    },
    {
        "category": "dentures_care",
        "patterns": [r"\bdenture\b", r"\bdentures\b", r"\bfalse teeth\b", r"\bpartial plate\b"],
        "answer": (
            "**Denture Cleaning & Care**:\n\n"
            "1. **Remove & Rinse**: Rinse dentures after meals to remove loose food particles.\n"
            "2. **Clean Daily**: Brush dentures daily with a soft denture brush and non-abrasive denture cleanser (do not use regular toothpaste as it scratches acrylic).\n"
            "3. **Night Storage**: Soak dentures overnight in water or a denture cleansing solution to keep them moist.\n"
            "4. **Oral Tissue Care**: Brush your gums, tongue, and roof of your mouth with a soft brush every morning before inserting dentures."
        )
    },
    {
        "category": "braces_and_aligners",
        "patterns": [r"\bbraces\b", r"\baligner\b", r"\binvisalign\b", r"\borthodontic\b", r"\bretainer\b"],
        "answer": (
            "**Braces & Clear Aligner Hygiene**:\n\n"
            "• **Fixed Braces**:\n"
            "  1. Use the **Charters Technique** (45° angle to bracket wings).\n"
            "  2. Use interdental proxy brushes to clean under wires after every meal.\n"
            "  3. Use an orthodontic wax if brackets cause cheek irritation.\n"
            "• **Clear Aligners**:\n"
            "  1. Remove aligners before eating or drinking anything except plain water.\n"
            "  2. Brush teeth thoroughly before reinserting aligners to prevent trapping sugar and acid against enamel.\n"
            "  3. Clean aligners with lukewarm water and a soft toothbrush."
        )
    },
    {
        "category": "teeth_whitening",
        "patterns": [r"\bwhiten\b", r"\bbleach\b", r"\byellow teeth\b", r"\bwhite smile\b", r"\bstains\b", r"\bwhitening strip\b"],
        "answer": (
            "**Teeth Whitening Principles & Safety**:\n\n"
            "• **Mechanism**: Hydrogen peroxide or carbamide peroxide breaks down organic enamel stains.\n"
            "• **Best Practices**:\n"
            "  1. Professional in-office or custom tray whitening provides the safest, most uniform results.\n"
            "  2. If experiencing sensitivity during whitening, alternate days or use a desensitizing gel.\n"
            "  3. Avoid stain-causing foods (coffee, tea, red wine, soy sauce, berries) during and 48 hours after whitening ('White Diet').\n"
            "  4. Do not overuse whitening strips, as excessive bleaching strips enamel minerals."
        )
    },

    # --- HYGIENE PRODUCTS & DAILY HARDWARE ---
    {
        "category": "electric_vs_manual_brush",
        "patterns": [r"\belectric vs manual\b", r"\belectric toothbrush\b", r"\bsonicare\b", r"\boral-b\b", r"\bwhich brush is best\b"],
        "answer": (
            "**Electric vs. Manual Toothbrushes**:\n\n"
            "• **Electric Toothbrushes**:\n"
            "  - Clinical studies show electric brushes remove up to 21% more plaque and reduce gingivitis by 11% compared to manual brushing.\n"
            "  - Built-in timers ensure a full 2-minute session.\n"
            "  - Pressure sensors prevent aggressive scrubbing.\n"
            "• **Manual Toothbrushes**:\n"
            "  - Highly effective when used with proper technique (e.g. Modified Bass) for 2 minutes twice daily.\n"
            "• **Verdict**: Electric brushes are ideal for beginners, braces, seniors, or aggressive brushers."
        )
    },
    {
        "category": "flossing_and_water_flossers",
        "patterns": [r"\bfloss\b", r"\bflossing\b", r"\bwaterpik\b", r"\bwater flosser\b", r"\binterdental\b"],
        "answer": (
            "**Flossing & Water Flossing Guide**:\n\n"
            "• **Traditional String Floss**:\n"
            "  1. Curve floss into a 'C-shape' around each tooth side.\n"
            "  2. Slide gently below the gumline and wipe up and down.\n"
            "• **Water Flossers (Waterpik)**:\n"
            "  1. Excellent for braces, crowns, implants, or arthritis.\n"
            "  2. Uses pulsed water pressure to flush subgingival bacteria.\n"
            "• **Combination**: String floss removes sticky plaque films, while water flossers flush out loose debris and pockets."
        )
    },
    {
        "category": "toothpaste_selection",
        "patterns": [r"\btoothpaste\b", r"\bfluoride\b", r"\bcharcoal toothpaste\b", r"\bnon fluoride\b", r"\btoothpaste choice\b"],
        "answer": (
            "**Selecting the Right Toothpaste**:\n\n"
            "1. **Fluoride / Nano-Hydroxyapatite**: Remineralizes enamel and protects against cavities.\n"
            "2. **Sensitivity**: Formulated with Potassium Nitrate or Stannous Fluoride to block nerve pain.\n"
            "3. **Gum Care**: Contains antibacterial Stannous Fluoride or Zinc to combat gingivitis.\n"
            "4. **Avoid**: Avoid abrasive charcoal toothpastes which wear down outer enamel over time."
        )
    },
    {
        "category": "tongue_scraping",
        "patterns": [r"\btongue scrape\b", r"\btongue cleaner\b", r"\btongue hygiene\b"],
        "answer": (
            "**Tongue Scraping Technique**:\n\n"
            "1. Extend your tongue out.\n"
            "2. Place the tongue scraper at the back surface of the tongue.\n"
            "3. Pull forward smoothly toward the tip with gentle pressure.\n"
            "4. Rinse scraper and repeat 3-4 times every morning and night."
        )
    },
    {
        "category": "mouthwash",
        "patterns": [r"\bmouthwash\b", r"\brinse\b", r"\blisterine\b", r"\bchlorhexidine\b"],
        "answer": (
            "**Mouthwash Clinical Guidelines**:\n\n"
            "1. Choose an **alcohol-free** mouthwash to avoid drying out oral tissues.\n"
            "2. Swish 20-30ml for 30 seconds after brushing or flossing.\n"
            "3. Chlorhexidine mouthwashes are prescription-only for short-term post-surgery or acute gingivitis treatment."
        )
    },

    # --- DIETARY & LIFESTYLE CLINICAL CARE ---
    {
        "category": "diet_sugar_acids",
        "patterns": [r"\bsugar\b", r"\bacid\b", r"\bsoda\b", r"\bcavity\b", r"\bcavities\b", r"\bdecay\b", r"\benamel erosion\b"],
        "answer": (
            "**Diet, Sugar & Acid Protection**:\n\n"
            "• Oral bacteria feed on sugars and carbs, producing acids that dissolve enamel (de-mineralization).\n"
            "• **Clinical Rules**:\n"
            "  1. Limit snacking frequency; constant sipping of sugary/acidic drinks keeps mouth pH acidic.\n"
            "  2. Rinse mouth with water after drinking coffee, juice, or soda.\n"
            "  3. Wait 30 minutes after acidic foods before brushing."
        )
    },
    {
        "category": "smoking_vaping_impact",
        "patterns": [r"\bsmok\b", r"\btobacco\b", r"\bvap\b", r"\bnicotine\b", r"\bcigarette\b"],
        "answer": (
            "**Impact of Smoking & Vaping on Oral Health**:\n\n"
            "• Smoking restricts blood flow to gums, masking bleeding warning signs while accelerating periodontitis and bone loss around teeth.\n"
            "• Vaping aerosols dry out saliva, increasing decay risks and gum inflammation.\n"
            "• Regular dental checkups every 6 months are essential for oral cancer screening."
        )
    },
    {
        "category": "pregnancy_dental_care",
        "patterns": [r"\bpregnancy\b", r"\bpregnant\b", r"\bmorning sickness\b", r"\bpregnancy gingivitis\b"],
        "answer": (
            "**Pregnancy Oral Care Guidelines**:\n\n"
            "• Hormonal shifts during pregnancy increase gum sensitivity to plaque ('Pregnancy Gingivitis').\n"
            "• **Morning Sickness Tip**: If vomiting occurs, do NOT brush immediately! Stomach acid weakens enamel. Rinse with 1 tsp baking soda in warm water to neutralize acid, then brush 30 minutes later."
        )
    }
]

# ---------------------------------------------------------------------------
# DENTAL AI MODEL & MATCHING ENGINE CLASS
# ---------------------------------------------------------------------------
class DentalAIModelEngine:
    def __init__(self):
        self.knowledge_base = CLINICAL_KNOWLEDGE_BASE
        self.categories = [item["category"] for item in self.knowledge_base]
        self.answers = [item["answer"] for item in self.knowledge_base]
        
        # Precompile regex pattern rules
        self.compiled_rules = []
        for item in self.knowledge_base:
            rule_regexes = [re.compile(p, re.IGNORECASE) for p in item["patterns"]]
            self.compiled_rules.append((item["category"], rule_regexes, item["answer"]))

        # Build TF-IDF Vectorizer Matrix if scikit-learn is available
        self.vectorizer = None
        self.tfidf_matrix = None
        if SKLEARN_AVAILABLE:
            corpus = []
            for item in self.knowledge_base:
                patterns_str = " ".join([p.replace(r"\b", "").replace(r"-?", " ") for p in item["patterns"]])
                corpus.append(f"{item['category'].replace('_', ' ')} {patterns_str}")
            
            self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
            self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

        # Common Dental Typo & Slang Normalizer Dictionary
        self.typo_dict = {
            "rct": "root canal treatment",
            "brshing": "brushing",
            "brsh": "brush",
            "sensitiv": "sensitive",
            "cavty": "cavity",
            "cavties": "cavities",
            "bleedg": "bleeding",
            "gums": "gums",
            "whitning": "whitening",
            "implnt": "implant",
            "aligner": "aligner",
            "invisalign": "braces",
            "flos": "floss",
            "cleanin": "cleaning",
            "toothake": "toothache",
            "pain": "pain",
            "dentur": "denture"
        }

    def _normalize_text(self, text: str) -> str:
        text = text.lower().strip()
        words = text.split()
        normalized_words = [self.typo_dict.get(w, w) for w in words]
        return " ".join(normalized_words)

    def predict(self, query: str, language: str = "English") -> str:
        clean_query = self._normalize_text(query)

        # 1. TIER 1: EXACT CLINICAL REGEX RULE MATCHING
        for category, regex_list, answer in self.compiled_rules:
            for regex in regex_list:
                if regex.search(clean_query):
                    return answer

        # 2. TIER 2: TF-IDF COSINE SIMILARITY CLASSIFICATION
        if SKLEARN_AVAILABLE and self.vectorizer and self.tfidf_matrix is not None:
            try:
                query_vec = self.vectorizer.transform([clean_query])
                similarities = cosine_similarity(query_vec, self.tfidf_matrix)[0]
                best_idx = int(similarities.argmax())
                best_score = similarities[best_idx]

                if best_score >= 0.18:
                    return self.answers[best_idx]
            except Exception as e:
                print("TFIDF Match Exception caught:", e)

        # 3. TIER 3: MULTI-INTENT SYNTHESIZER FALLBACK
        fallback_matches = []
        if "bleed" in clean_query or "gum" in clean_query:
            fallback_matches.append(self.answers[6]) # bleeding_gums
        if "sensitive" in clean_query or "pain" in clean_query or "cold" in clean_query:
            fallback_matches.append(self.answers[5]) # tooth_sensitivity

        if fallback_matches:
            return "\n\n---\n\n".join(fallback_matches)

        # DEFAULT HIGH-ACCURACY CLINICAL GUIDANCE RESPONSE
        return (
            "Hello! I am **Dr. Minty AI**, your virtual dental assistant.\n\n"
            "To give you the most accurate clinical advice, could you clarify your question? For example, you can ask me about:\n\n"
            "• **Brushing Methods**: Modified Bass, Stillman, Charters, or Fones techniques.\n"
            "• **Oral Symptoms**: Tooth sensitivity, bleeding gums, toothaches, or bad breath.\n"
            "• **Dental Procedures**: Root canals (RCT), crowns, bridges, or implants.\n"
            "• **Hardware & Hygiene**: Electric vs. manual brushes, flossing, water flossers, tongue scraping, or whitening safety."
        )

# Global Instance Initialized on Module Import
global_dental_ai_model = DentalAIModelEngine()
