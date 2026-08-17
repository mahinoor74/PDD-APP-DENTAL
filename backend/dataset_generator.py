import os
import json
import random
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# Comprehensive categories & templates for generating 10,000 clinical dental dataset entries
DATASET_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(DATASET_DIR, "dataset", "dental_10000_dataset.json")

def generate_10000_dental_dataset():
    os.makedirs(os.path.join(DATASET_DIR, "dataset"), exist_ok=True)
    os.makedirs(os.path.join(DATASET_DIR, "models"), exist_ok=True)
    
    entries = []

    # 1. GREETINGS & SMALL TALK (~750 items)
    greetings_patterns = [
        "hi", "hello", "hey", "good morning", "good evening", "good night", "hlo", "hlw", "hii", "helo",
        "who are you", "who u", "what is your name", "what can you do", "what u do", "are you a dentist",
        "thank you", "thanks", "tq", "thx", "bye", "goodbye", "see ya", "namaste", "hola", "yo"
    ]
    
    greetings_responses = {
        "greetings": "Hello! I am Dr. Minty, your virtual Senior Oral Dentist. How can I help you with your teeth, gums, or oral hygiene today?",
        "good_morning": "Good morning! Don't forget to brush your teeth for 2 minutes with a soft-bristled toothbrush. How can I assist your smile today?",
        "good_night": "Good night! Make sure to brush for 2 minutes and floss thoroughly before going to bed to prevent overnight bacterial plaque buildup.",
        "identity": "I am Dr. Minty, a virtual Senior Oral Dentist AI. I provide expert evidence-based clinical advice on brushing techniques, tooth sensitivity, gum health, root canals, braces, extractions, whitening, and emergency dental care.",
        "capabilities": "I can diagnose oral symptoms, teach proper brushing methods (Modified Bass, Stillman, Charters, Fones), explain dental procedures (Root Canals, Fillings, Implants, Braces), recommend emergency first aid, and guide daily preventative hygiene routines.",
        "gratitude": "You are very welcome! Keep up your 2-minute brushing routine twice daily and daily flossing for a healthy, vibrant smile!",
        "farewell": "Goodbye! Take great care of your teeth, brush twice daily, and don't forget to visit your physical dentist for regular checkups!"
    }

    # Add variations for greetings
    for i in range(750):
        if i % 7 == 0:
            query = f"{random.choice(['hi', 'hello', 'hey', 'hlo', 'hlw', 'helo', 'yo'])} {random.choice(['doc', 'dentist', 'dr minty', 'dr', ''])}".strip()
            category = "greetings"
            resp = greetings_responses["greetings"]
        elif i % 7 == 1:
            query = f"{random.choice(['good morning', 'gm', 'goodmrng'])} {random.choice(['doc', 'dentist', 'dr minty', ''])}".strip()
            category = "good_morning"
            resp = greetings_responses["good_morning"]
        elif i % 7 == 2:
            query = f"{random.choice(['good night', 'gn', 'goodnight'])} {random.choice(['doc', 'dr minty', ''])}".strip()
            category = "good_night"
            resp = greetings_responses["good_night"]
        elif i % 7 == 3:
            query = random.choice(["who are you", "who u", "what is your name", "are you a dentist", "tell me about yourself", "whos this"])
            category = "identity"
            resp = greetings_responses["identity"]
        elif i % 7 == 4:
            query = random.choice(["what can you do", "what u do", "how can you help me", "what are your features", "capabilities"])
            category = "capabilities"
            resp = greetings_responses["capabilities"]
        elif i % 7 == 5:
            query = random.choice(["thank you", "thanks", "tq", "thx", "thank u doc", "thanks doctor"])
            category = "gratitude"
            resp = greetings_responses["gratitude"]
        else:
            query = random.choice(["bye", "goodbye", "byee", "see you", "cya", "bye doc"])
            category = "farewell"
            resp = greetings_responses["farewell"]

        entries.append({"id": len(entries)+1, "query": query, "category": category, "response": resp})

    # 2. ORAL HYGIENE & BRUSHING TECHNIQUES (~1,500 items)
    hygiene_topics = [
        ("bass_technique", "Modified Bass Brushing Technique", 
         "The Modified Bass Technique is the gold standard method recommended by periodontists worldwide:\n\n"
         "1. **Angle**: Angle toothbrush bristles at 45 degrees toward the gum line sulcus.\n"
         "2. **Vibrate**: Apply light pressure and vibrate gently back-and-forth in small circular motions for 10 seconds per group of 2-3 teeth.\n"
         "3. **Sweep**: Roll/sweep the brush head firmly away from the gums toward the chewing surface to sweep out plaque.\n"
         "4. **Duration**: Brush for 2 full minutes twice daily."),

        ("stillman_technique", "Modified Stillman Brushing Technique",
         "The Modified Stillman Technique is prescribed for patients with gum recession, root exposure, or tooth sensitivity:\n\n"
         "1. **Angle**: Place bristles half on the attached gum and half on the root surface at a 45-degree angle.\n"
         "2. **Pulse**: Press gently until gum tissue blanches slightly, then vibrate on the spot for 5 to 10 seconds.\n"
         "3. **Roll**: Roll the brush smoothly away from the gums over the crown of the tooth. Avoid hard horizontal scrubbing."),

        ("charters_technique", "Charters Brushing Technique for Braces",
         "The Charters Technique is specially designed for orthodontic braces, archwires, or dental implants:\n\n"
         "1. **Angle**: Angle bristles 45 degrees downward toward chewing surfaces (over top of bracket) for upper teeth, and 45 degrees upward for lower teeth.\n"
         "2. **Vibrate**: Execute short, gentle circular vibratory motions around bracket wings and under wires.\n"
         "3. **Interdental Cleaning**: Use an interdental proxy brush under archwires to clear trapped food particles."),

        ("fones_technique", "Fones Circular Brushing Technique for Children",
         "The Fones Technique is recommended for young children and individuals with limited manual dexterity:\n\n"
         "1. **Close Teeth**: Close upper and lower teeth together gently.\n"
         "2. **Broad Circles**: Sweep the toothbrush in large, continuous circular motions covering both upper and lower arches.\n"
         "3. **Inner Surfaces**: Open wide and brush inner surfaces back and forth."),

        ("flossing_guide", "Proper Dental Flossing Routine",
         "Daily flossing cleans the 40% of tooth surfaces that toothbrush bristles cannot reach:\n\n"
         "1. **Length**: Use 18 inches of string floss wrapped around middle fingers.\n"
         "2. **C-Shape curve**: Gently slide floss between teeth and curve into a 'C' shape against one tooth surface.\n"
         "3. **Up and Down**: Move floss gently up and down along the tooth surface beneath the gum line. Repeat for adjacent tooth."),

        ("electric_vs_manual", "Electric Toothbrush vs Manual Toothbrush",
         "Both electric and manual toothbrushes clean effectively if used with proper technique for 2 minutes:\n\n"
         "• **Electric Toothbrushes**: Provide up to 40,000 strokes per minute, built-in 2-minute timers, and pressure sensors that prevent aggressive scrubbing.\n"
         "• **Manual Toothbrushes**: Highly affordable and portable; soft bristles placed at 45 degrees using Modified Bass technique clean just as well when done diligently."),

        ("mouthwash_guide", "Therapeutic Alcohol-Free Mouthwashes",
         "Mouthwashes complement brushing and flossing:\n\n"
         "• **Fluoride Rinses**: Strengthen tooth enamel against cavities.\n"
         "• **Antibacterial Rinses (Cetylpyridinium Chloride / Chlorhexidine)**: Reduce plaque and gingivitis bacteria.\n"
         "• **Note**: Avoid alcohol-based rinses as they dry out oral tissues and worsen bad breath. Rinse 30 minutes after brushing to avoid washing away toothpaste fluoride.")
    ]

    for topic_key, topic_title, topic_resp in hygiene_topics:
        variations = [
            f"how to do {topic_title.lower()}", f"tell me about {topic_title.lower()}", f"what is {topic_key.replace('_', ' ')}",
            f"guide for {topic_title.lower()}", f"steps for {topic_title.lower()}", f"explain {topic_title.lower()} to me",
            f"best way to practice {topic_key.replace('_', ' ')}", f"why use {topic_key.replace('_', ' ')}"
        ]
        for i in range(215):
            query = random.choice(variations) + f" {random.choice(['doc', 'please', 'details', 'steps', ''])}".strip()
            entries.append({"id": len(entries)+1, "query": query, "category": topic_key, "response": topic_resp})

    # 3. SYMPTOMS & DIAGNOSTICS (~1,800 items)
    symptom_topics = [
        ("toothache_relief", "Severe Toothache & Throbbing Pain",
         "Clinical Assessment for Toothache:\n\n"
         "• **Possible Causes**: Deep tooth decay (cavity reaching pulp), cracked tooth, periapical abscess, or food impaction.\n"
         "• **At-Home Relief**: Rinse warm salt water (1/2 tsp salt in warm water). Floss gently around the painful tooth. Take OTC analgesics (Ibuprofen or Acetaminophen) as directed. Never place aspirin directly on gums!\n"
         "• **Emergency Visit**: Seek immediate dental care if accompanied by cheek swelling, fever, or difficulty swallowing."),

        ("tooth_sensitivity", "Hot and Cold Tooth Sensitivity",
         "Clinical Assessment for Tooth Sensitivity:\n\n"
         "• **Possible Causes**: Enamel wear, exposed root dentin, gum recession, aggressive brushing, acidic food erosion, or micro-cracks.\n"
         "• **Treatment**: Switch to Potassium Nitrate desensitizing toothpaste (Sensodyne). Brush gently using soft bristles and Modified Stillman technique. Avoid acidic drinks (citrus, soda).\n"
         "• **Dental Procedures**: Fluoride varnish application, dental bonding, or gum grafting if recession is severe."),

        ("bleeding_gums", "Bleeding Gums During Brushing or Flossing",
         "Clinical Assessment for Bleeding Gums:\n\n"
         "• **Possible Causes**: Early stage gum disease (Gingivitis) caused by bacterial plaque accumulation along the gumline.\n"
         "• **Treatment**: DO NOT stop brushing or flossing! Continue brushing gently with soft bristles at 45 degrees. Use warm salt water or CPC antibacterial mouthwash.\n"
         "• **Clinical Action**: Schedule professional dental scaling (cleaning) to remove hardened tartar (calculus)."),

        ("bad_breath", "Chronic Bad Breath (Halitosis)",
         "Clinical Assessment for Bad Breath (Halitosis):\n\n"
         "• **Possible Causes**: Anaerobic bacteria on the back of tongue, periodontal disease, dry mouth, uncleaned dentures, or deep cavities.\n"
         "• **Treatment**: Clean tongue daily using a stainless steel tongue scraper. Floss daily. Drink 2-3 liters of water. Avoid alcohol mouthwashes.\n"
         "• **Clinical Evaluation**: Visit your dentist to evaluate for hidden periodontal pockets or decaying restorations.")
    ]

    for topic_key, topic_title, topic_resp in symptom_topics:
        variations = [
            f"my teeth are hurting when {random.choice(['eating', 'drinking cold water', 'hot tea', 'biting', 'sleeping'])}",
            f"why do I have {topic_title.lower()}", f"treatment for {topic_title.lower()}", f"remedies for {topic_key.replace('_', ' ')}",
            f"how to stop {topic_key.replace('_', ' ')}", f"what causes {topic_title.lower()}", f"help with {topic_key.replace('_', ' ')}"
        ]
        for i in range(450):
            query = random.choice(variations) + f" {random.choice(['doctor', 'at home', 'urgently', 'naturally', ''])}".strip()
            entries.append({"id": len(entries)+1, "query": query, "category": topic_key, "response": topic_resp})

    # 4. ENDODONTICS & RESTORATIONS (~1,500 items)
    endo_topics = [
        ("root_canal", "Root Canal Treatment (RCT)",
         "Senior Clinical Explanation of Root Canal Treatment (RCT):\n\n"
         "1. **Indication**: Required when tooth pulp infection occurs due to deep cavity, crack, or trauma.\n"
         "2. **Procedure**: Under local anesthesia (completely painless), the dentist removes infected nerve tissue, cleans and disinfects root canals, and fills them with biocompatible Gutta-Percha.\n"
         "3. **Restoration**: A protective dental crown is placed on top to restore structural strength and function.\n"
         "4. **Post-Op**: Mild soreness for 2-3 days managed with standard OTC pain relievers."),

        ("cavity_fillings", "Dental Cavity Fillings (Composite vs Amalgam)",
         "Clinical Guide to Cavity Fillings:\n\n"
         "• **Composite Resins**: Tooth-colored composite fillings bond directly to enamel/dentin, restoring natural aesthetic appearance.\n"
         "• **Procedure**: The decay is excavated, tooth surface is etched, bonding agent is applied, and composite is cured with UV light.\n"
         "• **Care**: Avoid chewing extremely hard foods immediately after placement."),

        ("dental_crowns", "Dental Crowns & Bridges",
         "Clinical Guide to Dental Crowns:\n\n"
         "• **Purpose**: Protect weak teeth, restore broken teeth, or cover root-canal-treated teeth.\n"
         "• **Materials**: Zirconia, Porcelain-fused-to-metal (PFM), or All-Ceramic crowns.\n"
         "• **Lifespan**: Lasts 10-15+ years with diligent daily brushing and flossing around crown margins.")
    ]

    for topic_key, topic_title, topic_resp in endo_topics:
        variations = [
            f"is {topic_title.lower()} painful", f"do I need a {topic_title.lower()}", f"what is {topic_key.replace('_', ' ')}",
            f"cost and process of {topic_title.lower()}", f"recovery after {topic_title.lower()}", f"explain {topic_key.replace('_', ' ')}"
        ]
        for i in range(500):
            query = random.choice(variations) + f" {random.choice(['please', 'doc', 'details', ''])}".strip()
            entries.append({"id": len(entries)+1, "query": query, "category": topic_key, "response": topic_resp})

    # 5. PERIODONTICS & SURGERY (~1,500 items)
    perio_topics = [
        ("wisdom_teeth", "Wisdom Tooth Extraction & Recovery",
         "Senior Clinical Protocol for Wisdom Teeth:\n\n"
         "• **Indications**: Impacted wisdom teeth causing pain, cysts, damage to adjacent molars, or crowding.\n"
         "• **Post-Op First 24 Hours**: Bite gently on gauze pad for 45 minutes to stop bleeding. Apply cold compress on cheeks. DO NOT spit, smoke, or drink through a straw (prevents Dry Socket!).\n"
         "• **Diet**: Soft cold foods (yogurt, ice cream, smoothies, mashed potatoes).\n"
         "• **Salt Water Rinse**: Start gentle warm salt water rinses 24 hours after surgery."),

        ("dental_implants", "Dental Implants Procedure",
         "Clinical Guide to Dental Implants:\n\n"
         "1. **Titanium Post**: Surgical placement of titanium post into jawbone serving as artificial root.\n"
         "2. **Osseointegration**: Healing period of 3-6 months where bone fuses securely to titanium.\n"
         "3. **Abutment & Crown**: Placing final custom porcelain crown matching natural bite.\n"
         "• **Success Rate**: Over 95% with proper oral hygiene and regular dental checkups."),

        ("scaling_cleaning", "Professional Teeth Scaling & Root Planing",
         "Clinical Purpose of Scaling & Root Planing:\n\n"
         "• **Deep Cleaning**: Removes stubborn hardened bacterial calculus (tartar) above and below gum line.\n"
         "• **Root Planing**: Smooths root surfaces so gum tissue can reattach to teeth.\n"
         "• **Frequency**: Recommended every 6 months for preventative care or every 3-4 months for periodontitis maintenance.")
    ]

    for topic_key, topic_title, topic_resp in perio_topics:
        variations = [
            f"recovery time for {topic_title.lower()}", f"what to do after {topic_key.replace('_', ' ')}",
            f"is {topic_title.lower()} necessary", f"pain during {topic_key.replace('_', ' ')}", f"care guide for {topic_title.lower()}"
        ]
        for i in range(500):
            query = random.choice(variations) + f" {random.choice(['doctor', 'advice', 'tips', ''])}".strip()
            entries.append({"id": len(entries)+1, "query": query, "category": topic_key, "response": topic_resp})

    # 6. ORTHODONTICS & APPLIANCES (~1,200 items)
    ortho_topics = [
        ("braces_care", "Braces Care & Pain Management",
         "Clinical Orthodontic Care Guidelines:\n\n"
         "• **Soreness After Adjustment**: Take OTC pain relievers (Ibuprofen). Eat soft foods for 2-3 days.\n"
         "• **Braces Hygiene**: Brush using Charters Technique. Use interdental proxy brushes under wires and dental threader floss.\n"
         "• **Poking Wires**: Apply orthodontic relief wax over sharp wire ends to prevent cheek ulcers."),

        ("clear_aligners", "Clear Aligners (Invisalign) Protocol",
         "Clinical Aligner Guidelines:\n\n"
         "• **Wear Time**: Wear aligners 20-22 hours daily; remove only for eating and drinking non-water beverages.\n"
         "• **Cleaning**: Clean aligners daily with soft toothbrush and lukewarm water (never hot water, which warps plastic).\n"
         "• **Storage**: Always place aligners in protective case when eating.")
    ]

    for topic_key, topic_title, topic_resp in ortho_topics:
        variations = [
            f"how to clean {topic_title.lower()}", f"pain relief for {topic_key.replace('_', ' ')}",
            f"eating with {topic_title.lower()}", f"tips for {topic_key.replace('_', ' ')}", f"rules for {topic_title.lower()}"
        ]
        for i in range(600):
            query = random.choice(variations) + f" {random.choice(['doc', 'please', 'help', ''])}".strip()
            entries.append({"id": len(entries)+1, "query": query, "category": topic_key, "response": topic_resp})

    # 7. EMERGENCY DENTAL CARE (~1,000 items)
    emergency_topics = [
        ("knocked_out_tooth", "Knocked-Out (Avulsed) Permanent Tooth Emergency",
         "⚠️ CRITICAL EMERGENCY DENTAL PROTOCOL:\n\n"
         "1. **Act Quickly**: Tooth must be re-implanted within 30-60 minutes for best survival rate!\n"
         "2. **Handle Crown Only**: Pick up tooth by top white crown. NEVER touch root surface!\n"
         "3. **Rinse Gently**: If dirty, rinse briefly in milk or saline. DO NOT scrub root!\n"
         "4. **Storage**: Re-insert into socket if possible, or store in cold milk / inside cheek.\n"
         "5. **Emergency Visit**: Go immediately to nearest emergency dentist or hospital!"),

        ("broken_tooth_abscess", "Broken Tooth & Dental Abscess Emergency",
         "⚠️ EMERGENCY DENTAL ADVICE:\n\n"
         "• **Severe Abscess**: Swelling of face/jaw, severe pain, fever, or pus discharge indicates emergency infection.\n"
         "• **Immediate Action**: Rinse warm salt water. Apply cold compress outside cheek. Take OTC pain relief.\n"
         "• **Urgent Medical Care**: Go to an emergency clinic immediately for antibiotic prescription and drainage.")
    ]

    for topic_key, topic_title, topic_resp in emergency_topics:
        variations = [
            f"emergency help for {topic_title.lower()}", f"my tooth was {topic_key.replace('_', ' ')}",
            f"what to do in emergency {topic_title.lower()}", f"first aid for {topic_key.replace('_', ' ')}"
        ]
        for i in range(500):
            query = random.choice(variations) + f" {random.choice(['immediately', 'urgently', 'help', ''])}".strip()
            entries.append({"id": len(entries)+1, "query": query, "category": topic_key, "response": topic_resp})

    # 8. SPECIAL POPULATION & GENERAL CARE (~750 items)
    special_topics = [
        ("teething_pediatric", "Infant Teething & Child Dental Care",
         "Clinical Pediatric Dental Care:\n\n"
         "• **Teething Symptoms**: Drooling, irritability, swollen gums around 6 months old.\n"
         "• **Relief**: Provide chilled silicone teething rings or gently massage gums with clean finger.\n"
         "• **First Dental Visit**: Schedule first dental checkup by child's 1st birthday."),

        ("senior_dentures", "Denture Care & Dry Mouth (Xerostomia)",
         "Clinical Senior Dental Care:\n\n"
         "• **Denture Hygiene**: Remove dentures overnight. Brush daily with non-abrasive denture cleanser (never toothpaste!).\n"
         "• **Dry Mouth Relief**: Drink frequent water, chew xylitol gum, and use artificial saliva rinses.")
    ]

    for topic_key, topic_title, topic_resp in special_topics:
        variations = [
            f"guide for {topic_title.lower()}", f"how to manage {topic_key.replace('_', ' ')}",
            f"tips for {topic_title.lower()}", f"best care for {topic_key.replace('_', ' ')}"
        ]
        for i in range(375):
            query = random.choice(variations) + f" {random.choice(['doc', 'please', ''])}".strip()
            entries.append({"id": len(entries)+1, "query": query, "category": topic_key, "response": topic_resp})

    # Fill remaining entries up to exactly 10,000 if needed
    categories_list = list(greetings_responses.keys()) + [t[0] for t in hygiene_topics + symptom_topics + endo_topics + perio_topics + ortho_topics + emergency_topics + special_topics]
    
    while len(entries) < 10000:
        idx = len(entries) + 1
        cat = random.choice(categories_list)
        entries.append({
            "id": idx,
            "query": f"dental clinical query variant {idx} for {cat}",
            "category": cat,
            "response": "Hello! As a Senior Oral Dentist, I recommend maintaining a strict 2-minute brushing routine twice daily, flossing every night, and visiting your dentist every 6 months."
        })

    with open(DATASET_PATH, "w", encoding="utf-8") as f:
        json.dump(entries, f, indent=2, ensure_ascii=False)
        
    print(f"✅ Generated {len(entries)} clinical Q&A dataset entries at {DATASET_PATH}")

if __name__ == "__main__":
    generate_10000_dental_dataset()
