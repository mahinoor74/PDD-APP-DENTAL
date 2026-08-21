/**
 * questionTranslations.ts
 * ───────────────────────
 * Contains ALL translated assessment questions for child / adult / senior modes
 * across all 12 supported languages.
 *
 * Structure per entry:
 *   question : string           – question text
 *   options  : { text, conditionKey, value }[]
 *
 * Import usage:
 *   import { getQuestions } from "./questionTranslations";
 *   const questions = getQuestions("child", "hi");
 */

export interface QuestionOption {
  text: string;
  conditionKey: string;
  value: boolean;
  emoji?: string;
}

export interface Question {
  id: number;
  question: string;
  emoji?: string;          // used in kid-mode header badge
  funLabel?: string;       // short fun label shown above question in kid mode
  options: QuestionOption[];
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGLISH
// ─────────────────────────────────────────────────────────────────────────────
const en = {
  child: [
    {
      id: 1,
      question: "Do you have cool metal train tracks (braces) or wires on your teeth? 🚂",
      emoji: "🚂", funLabel: "Braces Check",
      options: [
        { text: "Yes! I have braces! 😎", conditionKey: "hasBraces", value: true },
        { text: "Nope, no braces! 😁", conditionKey: "hasBraces", value: false },
      ],
    },
    {
      id: 2,
      question: "When you brush, do your gums look red or feel ouchy? 😬",
      emoji: "😬", funLabel: "Gum Feelings",
      options: [
        { text: "Yes, they hurt! 😢", conditionKey: "bleedingGums", value: true },
        { text: "Nope, all good! 🙂", conditionKey: "bleedingGums", value: false },
      ],
    },
    {
      id: 3,
      question: "Do you ever see pink or red color in the sink after brushing? 🩸",
      emoji: "🩸", funLabel: "Sink Check",
      options: [
        { text: "Yes, pretty often! 😮", conditionKey: "bleedingGums", value: true },
        { text: "Sometimes... 🤔", conditionKey: "bleedingGums", value: true },
        { text: "Never! 🎉", conditionKey: "bleedingGums", value: false },
      ],
    },
    {
      id: 4,
      question: "Is it hard to clean food stuck between your braces or teeth? 🍕",
      emoji: "🍕", funLabel: "Food Trap",
      options: [
        { text: "Yes, super tricky! 😅", conditionKey: "hasBraces", value: true },
        { text: "Easy peasy! 💪", conditionKey: "hasBraces", value: false },
      ],
    },
    {
      id: 5,
      question: "Rub your tongue on your teeth — how do they feel RIGHT NOW? 👅",
      emoji: "👅", funLabel: "Tongue Test",
      options: [
        { text: "Fuzzy and not clean! 😬", conditionKey: "preventative", value: true },
        { text: "Smooth and squeaky clean! 😁", conditionKey: "preventative", value: false },
      ],
    },
    {
      id: 6,
      question: "Do you brush super fast — like whoosh and done in under 2 minutes? ⏱️",
      emoji: "⏱️", funLabel: "Speed Brusher?",
      options: [
        { text: "Yes, I brush lightning fast! 🏃", conditionKey: "preventative", value: true },
        { text: "Nope, I take my time! 😊", conditionKey: "preventative", value: false },
      ],
    },
    {
      id: 7,
      question: "Do you scrub really hard back and forth like cleaning a dirty floor? 🧹",
      emoji: "🧹", funLabel: "Brushing Style",
      options: [
        { text: "Yes, I scrub super hard! 💪", conditionKey: "aggressiveBrusher", value: true },
        { text: "Nope, I'm gentle! 🌸", conditionKey: "aggressiveBrusher", value: false },
      ],
    },
    {
      id: 8,
      question: "Do you eat lots of sweets, candies, or sugary drinks every day? 🍬",
      emoji: "🍬", funLabel: "Sweet Tooth",
      options: [
        { text: "Yes, every single day! 😋", conditionKey: "preventative", value: true },
        { text: "Sometimes! 🤷", conditionKey: "preventative", value: false },
      ],
    },
    {
      id: 9,
      question: "Do you sometimes forget to brush before going to sleep? 🌙",
      emoji: "🌙", funLabel: "Night Routine",
      options: [
        { text: "Yes, I forget most nights! 😅", conditionKey: "preventative", value: true },
        { text: "Never! I always brush! 🌟", conditionKey: "preventative", value: false },
      ],
    },
    {
      id: 10,
      question: "Does a grown-up help you brush your teeth to make sure they're super clean? 🧑‍🤝‍🧑",
      emoji: "🧑‍🤝‍🧑", funLabel: "Brush Buddy",
      options: [
        { text: "No, I do it ALL alone! 💪", conditionKey: "manualDexterity", value: true },
        { text: "Yes, they help me! 😊", conditionKey: "manualDexterity", value: false },
      ],
    },
  ],

  adult: [
    {
      id: 1,
      question: "Are you currently wearing fixed orthodontic brackets, wires, or clear aligners?",
      options: [
        { text: "Yes, I have fixed metal/ceramic braces", conditionKey: "hasBraces", value: true },
        { text: "Yes, I use clear aligners", conditionKey: "hasBraces", value: true },
        { text: "No, but I have a permanent retainer wire", conditionKey: "hasBraces", value: true },
        { text: "No orthodontic hardware at all", conditionKey: "hasBraces", value: false },
      ],
    },
    {
      id: 2,
      question: "Do your gums bleed during standard brushing or flossing routines?",
      options: [
        { text: "Yes, frequently", conditionKey: "bleedingGums", value: true },
        { text: "Sometimes", conditionKey: "bleedingGums", value: true },
        { text: "Rarely or Never", conditionKey: "bleedingGums", value: false },
      ],
    },
    {
      id: 3,
      question: "Have you noticed your gums shifting or shrinking back, exposing more of the tooth surface?",
      options: [
        { text: "Yes, severe recession", conditionKey: "recededGums", value: true },
        { text: "A little bit", conditionKey: "recededGums", value: true },
        { text: "No, my gumline looks stable", conditionKey: "recededGums", value: false },
      ],
    },
    {
      id: 4,
      question: "Do you have active dental implants, fixed structural bridges, or dental crowns?",
      options: [
        { text: "Yes, I have implants", conditionKey: "hasImplants", value: true },
        { text: "Yes, dental bridges or partials", conditionKey: "hasImplants", value: true },
        { text: "I have single crowns or fillings", conditionKey: "hasImplants", value: false },
        { text: "None of the above", conditionKey: "hasImplants", value: false },
      ],
    },
    {
      id: 5,
      question: "Are your gum tissues frequently swollen, tender, painful, or deep red in color?",
      options: [
        { text: "Yes, they feel inflamed", conditionKey: "bleedingGums", value: true },
        { text: "Occasionally", conditionKey: "bleedingGums", value: true },
        { text: "No, they look healthy", conditionKey: "bleedingGums", value: false },
      ],
    },
    {
      id: 6,
      question: "Do you experience sharp sensitivity or pain when drinking hot or cold fluids?",
      options: [
        { text: "Yes, highly sensitive", conditionKey: "sensitivity", value: true },
        { text: "Mild discomfort", conditionKey: "sensitivity", value: true },
        { text: "No sensitivity at all", conditionKey: "sensitivity", value: false },
      ],
    },
    {
      id: 7,
      question: "Do you find food particles consistently wedging around your dental appliances or braces?",
      options: [
        { text: "Yes, all the time", conditionKey: "hasBraces", value: true },
        { text: "Sometimes", conditionKey: "hasBraces", value: true },
        { text: "No, clearing debris is easy", conditionKey: "hasBraces", value: false },
      ],
    },
    {
      id: 8,
      question: "Is it difficult for you to safely reach and clean the margins beneath your dental crowns or bridges?",
      options: [
        { text: "Yes, access is restricted", conditionKey: "hasImplants", value: true },
        { text: "No problem to clean", conditionKey: "hasImplants", value: false },
      ],
    },
    {
      id: 9,
      question: "Do you use a medium or hard bristle toothbrush head for daily routine hygiene?",
      options: [
        { text: "Yes, medium or hard bristles", conditionKey: "aggressiveBrusher", value: true },
        { text: "No, I use soft/ultra-soft ones", conditionKey: "aggressiveBrusher", value: false },
      ],
    },
    {
      id: 10,
      question: "How many times do you brush your teeth daily?",
      options: [
        { text: "Twice or more daily", conditionKey: "preventative", value: false },
        { text: "Once or less", conditionKey: "preventative", value: true },
      ],
    },
  ],

  senior: [
    {
      id: 1,
      question: "Are your gum tissues tender, raw, sore, or uncomfortable during daily activities?",
      options: [
        { text: "Yes, very uncomfortable", conditionKey: "bleedingGums", value: true },
        { text: "Sometimes", conditionKey: "bleedingGums", value: true },
        { text: "No, they feel comfortable", conditionKey: "bleedingGums", value: false },
      ],
    },
    {
      id: 2,
      question: "Do you have full dentures, partial plates, or active dental implants installed?",
      options: [
        { text: "I have fixed dental implants", conditionKey: "hasImplants", value: true },
        { text: "Partial plates or bridges", conditionKey: "hasImplants", value: true },
        { text: "Full removable dentures", conditionKey: "hasImplants", value: true },
        { text: "No dental work / natural teeth", conditionKey: "hasImplants", value: false },
      ],
    },
    {
      id: 3,
      question: "Have you noticed your gums shrinking back, making roots visible or teeth look longer?",
      options: [
        { text: "Yes, noticeable recession", conditionKey: "recededGums", value: true },
        { text: "No change observed", conditionKey: "recededGums", value: false },
      ],
    },
    {
      id: 4,
      question: "Does your mouth frequently feel dry, or do you take medications that reduce your saliva?",
      options: [
        { text: "Yes, constantly dry mouth", conditionKey: "hasImplants", value: true },
        { text: "No, feels normal", conditionKey: "hasImplants", value: false },
      ],
    },
    {
      id: 5,
      question: "Do you experience pain or tenderness along your gumlines when chewing solid foods?",
      options: [
        { text: "Yes, frequently", conditionKey: "bleedingGums", value: true },
        { text: "No discomfort", conditionKey: "bleedingGums", value: false },
      ],
    },
    {
      id: 6,
      question: "Do you have trouble holding or manipulating your toothbrush handle comfortably?",
      options: [
        { text: "Yes, grip is difficult", conditionKey: "manualDexterity", value: true },
        { text: "No trouble at all", conditionKey: "manualDexterity", value: false },
      ],
    },
    {
      id: 7,
      question: "Do you find food debris consistently trapped underneath your dental bridges or implant crowns?",
      options: [
        { text: "Yes, it gets trapped easily", conditionKey: "hasImplants", value: true },
        { text: "No issues clearing food", conditionKey: "hasImplants", value: false },
      ],
    },
    {
      id: 8,
      question: "Do you feel any sharp pain or sensitivity when exposing teeth to hot or cold temperatures?",
      options: [
        { text: "Yes, sensitive teeth", conditionKey: "sensitivity", value: true },
        { text: "No sensitivity", conditionKey: "sensitivity", value: false },
      ],
    },
    {
      id: 9,
      question: "Is it visually or physically difficult to reach and focus on cleaning your back molars?",
      options: [
        { text: "Yes, hard to reach", conditionKey: "preventative", value: true },
        { text: "No, accessible", conditionKey: "preventative", value: false },
      ],
    },
    {
      id: 10,
      question: "Do you smoke regularly or deal with tough, chronic plaque buildup?",
      options: [
        { text: "Yes, regularly", conditionKey: "heavySmoker", value: true },
        { text: "No, never", conditionKey: "heavySmoker", value: false },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// HINDI (hi)
// ─────────────────────────────────────────────────────────────────────────────
const hi = {
  child: [
    { id: 1, question: "क्या तुम्हारे दांतों में ब्रेसेज (धातु के तार) लगे हैं? 🚂", emoji: "🚂", funLabel: "ब्रेसेज जांच",
      options: [{ text: "हाँ, मेरे ब्रेसेज हैं! 😎", conditionKey: "hasBraces", value: true }, { text: "नहीं, बिल्कुल नहीं! 😁", conditionKey: "hasBraces", value: false }] },
    { id: 2, question: "ब्रश करते समय क्या तुम्हारे मसूड़े लाल हो जाते हैं या दर्द करते हैं? 😬", emoji: "😬", funLabel: "मसूड़ों की जांच",
      options: [{ text: "हाँ, दर्द होता है! 😢", conditionKey: "bleedingGums", value: true }, { text: "नहीं, ठीक है! 🙂", conditionKey: "bleedingGums", value: false }] },
    { id: 3, question: "ब्रश के बाद सिंक में कभी गुलाबी या लाल रंग देखा? 🩸", emoji: "🩸", funLabel: "सिंक जांच",
      options: [{ text: "हाँ, अक्सर! 😮", conditionKey: "bleedingGums", value: true }, { text: "कभी-कभी 🤔", conditionKey: "bleedingGums", value: true }, { text: "कभी नहीं! 🎉", conditionKey: "bleedingGums", value: false }] },
    { id: 4, question: "क्या दांतों या ब्रेसेज के बीच फंसा खाना साफ करना मुश्किल है? 🍕", emoji: "🍕", funLabel: "खाना फंसा?",
      options: [{ text: "हाँ, बहुत मुश्किल! 😅", conditionKey: "hasBraces", value: true }, { text: "आसान है! 💪", conditionKey: "hasBraces", value: false }] },
    { id: 5, question: "अपनी जीभ से दांत रगड़ो — कैसा लग रहा है? 👅", emoji: "👅", funLabel: "जीभ परीक्षण",
      options: [{ text: "रुखरा और गंदा! 😬", conditionKey: "preventative", value: true }, { text: "चिकना और साफ! 😁", conditionKey: "preventative", value: false }] },
    { id: 6, question: "क्या तुम 2 मिनट से कम में बहुत तेज़ ब्रश करते हो? ⏱️", emoji: "⏱️", funLabel: "स्पीड ब्रशर?",
      options: [{ text: "हाँ, मैं बहुत तेज़ ब्रश करता हूँ! 🏃", conditionKey: "preventative", value: true }, { text: "नहीं, मैं समय लेता हूँ! 😊", conditionKey: "preventative", value: false }] },
    { id: 7, question: "क्या तुम दांतों को बहुत ज़ोर से रगड़ते हो? 🧹", emoji: "🧹", funLabel: "ब्रश करने का तरीका",
      options: [{ text: "हाँ, बहुत ज़ोर से! 💪", conditionKey: "aggressiveBrusher", value: true }, { text: "नहीं, धीरे से! 🌸", conditionKey: "aggressiveBrusher", value: false }] },
    { id: 8, question: "क्या तुम हर दिन बहुत मिठाई, चॉकलेट या मीठे पेय पीते हो? 🍬", emoji: "🍬", funLabel: "मीठे का शौक",
      options: [{ text: "हाँ, रोज़! 😋", conditionKey: "preventative", value: true }, { text: "कभी-कभी! 🤷", conditionKey: "preventative", value: false }] },
    { id: 9, question: "क्या तुम कभी-कभी रात को सोने से पहले ब्रश करना भूल जाते हो? 🌙", emoji: "🌙", funLabel: "रात की दिनचर्या",
      options: [{ text: "हाँ, ज़्यादातर रातें! 😅", conditionKey: "preventative", value: true }, { text: "कभी नहीं! मैं हमेशा ब्रश करता हूँ! 🌟", conditionKey: "preventative", value: false }] },
    { id: 10, question: "क्या कोई बड़ा तुम्हारे दांत ब्रश करने में मदद करता है? 🧑‍🤝‍🧑", emoji: "🧑‍🤝‍🧑", funLabel: "ब्रश मित्र",
      options: [{ text: "नहीं, मैं खुद करता हूँ! 💪", conditionKey: "manualDexterity", value: true }, { text: "हाँ, वे मदद करते हैं! 😊", conditionKey: "manualDexterity", value: false }] },
  ],
  adult: [
    { id: 1, question: "क्या आप वर्तमान में ब्रेसेज, तार, या क्लियर अलाइनर पहन रहे हैं?",
      options: [{ text: "हाँ, धातु/सिरेमिक ब्रेसेज", conditionKey: "hasBraces", value: true }, { text: "हाँ, क्लियर अलाइनर", conditionKey: "hasBraces", value: true }, { text: "नहीं, लेकिन रिटेनर है", conditionKey: "hasBraces", value: true }, { text: "कोई नहीं", conditionKey: "hasBraces", value: false }] },
    { id: 2, question: "क्या ब्रश या फ्लॉस करते समय मसूड़ों से खून आता है?",
      options: [{ text: "हाँ, अक्सर", conditionKey: "bleedingGums", value: true }, { text: "कभी-कभी", conditionKey: "bleedingGums", value: true }, { text: "कभी नहीं", conditionKey: "bleedingGums", value: false }] },
    { id: 3, question: "क्या आपके मसूड़े सिकुड़ रहे हैं, जिससे दांत की जड़ दिखती है?",
      options: [{ text: "हाँ, गंभीर रूप से", conditionKey: "recededGums", value: true }, { text: "थोड़ा", conditionKey: "recededGums", value: true }, { text: "नहीं", conditionKey: "recededGums", value: false }] },
    { id: 4, question: "क्या आपके दांतों में इम्प्लांट, ब्रिज, या क्राउन हैं?",
      options: [{ text: "हाँ, इम्प्लांट", conditionKey: "hasImplants", value: true }, { text: "हाँ, ब्रिज", conditionKey: "hasImplants", value: true }, { text: "केवल क्राउन", conditionKey: "hasImplants", value: false }, { text: "कोई नहीं", conditionKey: "hasImplants", value: false }] },
    { id: 5, question: "क्या आपके मसूड़े सूजे हुए, दर्दनाक या गहरे लाल रंग के हैं?",
      options: [{ text: "हाँ, सूजन है", conditionKey: "bleedingGums", value: true }, { text: "कभी-कभी", conditionKey: "bleedingGums", value: true }, { text: "नहीं, स्वस्थ दिखते हैं", conditionKey: "bleedingGums", value: false }] },
    { id: 6, question: "क्या गर्म या ठंडे पेय पीने पर तेज़ दर्द या संवेदनशीलता होती है?",
      options: [{ text: "हाँ, बहुत संवेदनशील", conditionKey: "sensitivity", value: true }, { text: "हल्की असुविधा", conditionKey: "sensitivity", value: true }, { text: "बिल्कुल नहीं", conditionKey: "sensitivity", value: false }] },
    { id: 7, question: "क्या ब्रेसेज या अप्लायंस के आसपास खाना फंसता है?",
      options: [{ text: "हाँ, हमेशा", conditionKey: "hasBraces", value: true }, { text: "कभी-कभी", conditionKey: "hasBraces", value: true }, { text: "नहीं", conditionKey: "hasBraces", value: false }] },
    { id: 8, question: "क्या क्राउन या ब्रिज के नीचे सफाई करना मुश्किल है?",
      options: [{ text: "हाँ, मुश्किल है", conditionKey: "hasImplants", value: true }, { text: "नहीं, आसान है", conditionKey: "hasImplants", value: false }] },
    { id: 9, question: "क्या आप कड़े या मध्यम ब्रिस्टल वाला ब्रश उपयोग करते हैं?",
      options: [{ text: "हाँ, कड़े/मध्यम", conditionKey: "aggressiveBrusher", value: true }, { text: "नहीं, मुलायम", conditionKey: "aggressiveBrusher", value: false }] },
    { id: 10, question: "आप दिन में कितनी बार ब्रश करते हैं?",
      options: [{ text: "दो या अधिक बार", conditionKey: "preventative", value: false }, { text: "एक बार या कम", conditionKey: "preventative", value: true }] },
  ],
  senior: [
    { id: 1, question: "क्या आपके मसूड़े दैनिक गतिविधियों में कोमल या दर्दनाक हैं?",
      options: [{ text: "हाँ, बहुत असुविधाजनक", conditionKey: "bleedingGums", value: true }, { text: "कभी-कभी", conditionKey: "bleedingGums", value: true }, { text: "नहीं", conditionKey: "bleedingGums", value: false }] },
    { id: 2, question: "क्या आपके पूर्ण डेंचर, आंशिक प्लेट, या इम्प्लांट हैं?",
      options: [{ text: "डेंटल इम्प्लांट", conditionKey: "hasImplants", value: true }, { text: "आंशिक प्लेट/ब्रिज", conditionKey: "hasImplants", value: true }, { text: "पूर्ण डेंचर", conditionKey: "hasImplants", value: true }, { text: "कोई नहीं", conditionKey: "hasImplants", value: false }] },
    { id: 3, question: "क्या मसूड़े सिकुड़ रहे हैं, जड़ें दिख रही हैं?",
      options: [{ text: "हाँ, ध्यान देने योग्य", conditionKey: "recededGums", value: true }, { text: "कोई परिवर्तन नहीं", conditionKey: "recededGums", value: false }] },
    { id: 4, question: "क्या आपका मुंह अक्सर सूखा रहता है या आप ऐसी दवाएं लेते हैं जो लार कम करती हैं?",
      options: [{ text: "हाँ, हमेशा सूखा", conditionKey: "hasImplants", value: true }, { text: "नहीं, सामान्य", conditionKey: "hasImplants", value: false }] },
    { id: 5, question: "क्या ठोस खाना चबाते समय मसूड़ों में दर्द होता है?",
      options: [{ text: "हाँ, अक्सर", conditionKey: "bleedingGums", value: true }, { text: "नहीं", conditionKey: "bleedingGums", value: false }] },
    { id: 6, question: "क्या ब्रश पकड़ने में कठिनाई होती है?",
      options: [{ text: "हाँ, मुश्किल है", conditionKey: "manualDexterity", value: true }, { text: "नहीं", conditionKey: "manualDexterity", value: false }] },
    { id: 7, question: "क्या ब्रिज या इम्प्लांट के नीचे खाना फंसता है?",
      options: [{ text: "हाँ, आसानी से फंसता है", conditionKey: "hasImplants", value: true }, { text: "नहीं", conditionKey: "hasImplants", value: false }] },
    { id: 8, question: "क्या गर्म/ठंडे से दांतों में दर्द होता है?",
      options: [{ text: "हाँ, संवेदनशील", conditionKey: "sensitivity", value: true }, { text: "नहीं", conditionKey: "sensitivity", value: false }] },
    { id: 9, question: "क्या पीछे के दांत (दाढ़) साफ करना मुश्किल है?",
      options: [{ text: "हाँ, पहुंचना मुश्किल", conditionKey: "preventative", value: true }, { text: "नहीं, आसान है", conditionKey: "preventative", value: false }] },
    { id: 10, question: "क्या आप नियमित धूम्रपान करते हैं या कठोर प्लाक की समस्या है?",
      options: [{ text: "हाँ, नियमित", conditionKey: "heavySmoker", value: true }, { text: "नहीं", conditionKey: "heavySmoker", value: false }] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// TELUGU (te)
// ─────────────────────────────────────────────────────────────────────────────
const te = {
  child: [
    { id: 1, question: "మీ దంతాలకు బ్రేసెస్ (లోహపు తీగలు) ఉన్నాయా? 🚂", emoji: "🚂", funLabel: "బ్రేసెస్ తనిఖీ",
      options: [{ text: "అవును, నాకు బ్రేసెస్ ఉన్నాయి! 😎", conditionKey: "hasBraces", value: true }, { text: "లేదు! 😁", conditionKey: "hasBraces", value: false }] },
    { id: 2, question: "బ్రష్ చేసేటప్పుడు మీ చిగుళ్ళు ఎరుపెక్కుతాయా లేదా నొప్పి కలుగుతుందా? 😬", emoji: "😬", funLabel: "చిగుళ్ళ పరీక్ష",
      options: [{ text: "అవును, నొప్పి కలుగుతుంది! 😢", conditionKey: "bleedingGums", value: true }, { text: "లేదు, సరిగా ఉంది! 🙂", conditionKey: "bleedingGums", value: false }] },
    { id: 3, question: "బ్రష్ చేసిన తర్వాత సింక్‌లో గులాబీ రంగు కనిపిస్తుందా? 🩸", emoji: "🩸", funLabel: "సింక్ తనిఖీ",
      options: [{ text: "అవును, తరచుగా! 😮", conditionKey: "bleedingGums", value: true }, { text: "కొన్నిసార్లు 🤔", conditionKey: "bleedingGums", value: true }, { text: "ఎప్పుడూ లేదు! 🎉", conditionKey: "bleedingGums", value: false }] },
    { id: 4, question: "బ్రేసెస్ లేదా దంతాల మధ్య ఇరుక్కున్న ఆహారాన్ని శుభ్రపరచడం కష్టంగా ఉందా? 🍕", emoji: "🍕", funLabel: "ఆహారం ఇరుకు",
      options: [{ text: "అవును, చాలా కష్టం! 😅", conditionKey: "hasBraces", value: true }, { text: "సులభం! 💪", conditionKey: "hasBraces", value: false }] },
    { id: 5, question: "మీ నాలుకను దంతాలపై రుద్దండి — ఎలా అనిపిస్తోంది? 👅", emoji: "👅", funLabel: "నాలుక పరీక్ష",
      options: [{ text: "ఉత్తుత్తు మరియు మురికిగా! 😬", conditionKey: "preventative", value: true }, { text: "చదునుగా శుభ్రంగా! 😁", conditionKey: "preventative", value: false }] },
    { id: 6, question: "మీరు 2 నిమిషాల కంటే తక్కువలో వేగంగా బ్రష్ చేస్తారా? ⏱️", emoji: "⏱️", funLabel: "వేగ బ్రషర్?",
      options: [{ text: "అవును, చాలా వేగంగా! 🏃", conditionKey: "preventative", value: true }, { text: "లేదు, సమయం తీసుకుంటాను! 😊", conditionKey: "preventative", value: false }] },
    { id: 7, question: "మీరు దంతాలను చాలా గట్టిగా రుద్దుతారా? 🧹", emoji: "🧹", funLabel: "బ్రష్ శైలి",
      options: [{ text: "అవును, చాలా గట్టిగా! 💪", conditionKey: "aggressiveBrusher", value: true }, { text: "లేదు, నెమ్మదిగా! 🌸", conditionKey: "aggressiveBrusher", value: false }] },
    { id: 8, question: "మీరు రోజూ చాలా స్వీట్లు, చాకోలేట్లు తింటారా? 🍬", emoji: "🍬", funLabel: "తీపి పిచ్చి",
      options: [{ text: "అవును, రోజూ! 😋", conditionKey: "preventative", value: true }, { text: "కొన్నిసార్లు! 🤷", conditionKey: "preventative", value: false }] },
    { id: 9, question: "మీరు నిద్రపోవడానికి ముందు బ్రష్ చేయడం మర్చిపోతారా? 🌙", emoji: "🌙", funLabel: "రాత్రి దినచర్య",
      options: [{ text: "అవును, చాలా రాత్రులు! 😅", conditionKey: "preventative", value: true }, { text: "ఎప్పుడూ లేదు! నేను ఎల్లప్పుడూ బ్రష్ చేస్తాను! 🌟", conditionKey: "preventative", value: false }] },
    { id: 10, question: "పెద్దవారు మీ దంతాలు బ్రష్ చేయడంలో సహాయం చేస్తారా? 🧑‍🤝‍🧑", emoji: "🧑‍🤝‍🧑", funLabel: "బ్రష్ మిత్రుడు",
      options: [{ text: "లేదు, నేను ఒంటరిగా చేస్తాను! 💪", conditionKey: "manualDexterity", value: true }, { text: "అవును, వారు సహాయం చేస్తారు! 😊", conditionKey: "manualDexterity", value: false }] },
  ],
  adult: en.adult, // fallback to English for adult/senior Telugu (user can extend later)
  senior: en.senior,
};

// ─────────────────────────────────────────────────────────────────────────────
// TAMIL (ta)
// ─────────────────────────────────────────────────────────────────────────────
const ta = {
  child: [
    { id: 1, question: "உங்கள் பற்களில் உலோக ரயில் தடங்கள் (பிரேஸ்) உள்ளதா? 🚂", emoji: "🚂", funLabel: "பிரேஸ் சோதனை",
      options: [{ text: "ஆம்! என்னிடம் பிரேஸ் உள்ளது! 😎", conditionKey: "hasBraces", value: true }, { text: "இல்லை! 😁", conditionKey: "hasBraces", value: false }] },
    { id: 2, question: "தேய்க்கும்போது ஈறுகள் சிவக்கின்றதா அல்லது வலிக்கின்றதா? 😬", emoji: "😬", funLabel: "ஈறு சோதனை",
      options: [{ text: "ஆம், வலிக்கிறது! 😢", conditionKey: "bleedingGums", value: true }, { text: "இல்லை, நன்றாக உள்ளது! 🙂", conditionKey: "bleedingGums", value: false }] },
    { id: 3, question: "தேய்த்த பிறகு குழாயில் சிவப்பு நிறம் தெரிகிறதா? 🩸", emoji: "🩸", funLabel: "குழாய் சோதனை",
      options: [{ text: "ஆம், அடிக்கடி! 😮", conditionKey: "bleedingGums", value: true }, { text: "சில நேரம் 🤔", conditionKey: "bleedingGums", value: true }, { text: "ஒருபோதும் இல்லை! 🎉", conditionKey: "bleedingGums", value: false }] },
    { id: 4, question: "பிரேஸ் அல்லது பற்களுக்கிடையே சிக்கிய உணவை சுத்தம் செய்வது கஷ்டமா? 🍕", emoji: "🍕", funLabel: "உணவு சிக்கல்",
      options: [{ text: "ஆம், மிகவும் கஷ்டம்! 😅", conditionKey: "hasBraces", value: true }, { text: "எளிது! 💪", conditionKey: "hasBraces", value: false }] },
    { id: 5, question: "நாக்கை பற்களில் தேய்க்கவும் — எப்படி உணர்கிறீர்கள்? 👅", emoji: "👅", funLabel: "நாக்கு சோதனை",
      options: [{ text: "கரடுமுரடாக உள்ளது! 😬", conditionKey: "preventative", value: true }, { text: "சுத்தமாக உள்ளது! 😁", conditionKey: "preventative", value: false }] },
    { id: 6, question: "2 நிமிடத்திற்கும் குறைவாக மிக வேகமாக தேய்க்கிறீர்களா? ⏱️", emoji: "⏱️", funLabel: "வேக தேய்ப்பாளர்?",
      options: [{ text: "ஆம், மிக வேகமாக! 🏃", conditionKey: "preventative", value: true }, { text: "இல்லை, நேரம் எடுக்கிறேன்! 😊", conditionKey: "preventative", value: false }] },
    { id: 7, question: "மிகவும் கடினமாக தேய்க்கிறீர்களா? 🧹", emoji: "🧹", funLabel: "தேய்க்கும் முறை",
      options: [{ text: "ஆம், மிகவும் கடினமாக! 💪", conditionKey: "aggressiveBrusher", value: true }, { text: "இல்லை, மெதுவாக! 🌸", conditionKey: "aggressiveBrusher", value: false }] },
    { id: 8, question: "தினமும் நிறைய இனிப்புகள், மிட்டாய், சர்க்கரை பானங்கள் குடிக்கிறீர்களா? 🍬", emoji: "🍬", funLabel: "இனிப்பு பித்தம்",
      options: [{ text: "ஆம், தினமும்! 😋", conditionKey: "preventative", value: true }, { text: "சில நேரம்! 🤷", conditionKey: "preventative", value: false }] },
    { id: 9, question: "தூங்குவதற்கு முன் தேய்க்க மறந்துவிடுவீர்களா? 🌙", emoji: "🌙", funLabel: "இரவு வழக்கம்",
      options: [{ text: "ஆம், பெரும்பாலான இரவுகளில்! 😅", conditionKey: "preventative", value: true }, { text: "ஒருபோதும் இல்லை! 🌟", conditionKey: "preventative", value: false }] },
    { id: 10, question: "ஒரு பெரியவர் உங்கள் பற்களை தேய்க்க உதவுகிறார்களா? 🧑‍🤝‍🧑", emoji: "🧑‍🤝‍🧑", funLabel: "தேய்ப்பு நண்பர்",
      options: [{ text: "இல்லை, நான் தனியாக செய்கிறேன்! 💪", conditionKey: "manualDexterity", value: true }, { text: "ஆம், அவர்கள் உதவுகிறார்கள்! 😊", conditionKey: "manualDexterity", value: false }] },
  ],
  adult: en.adult,
  senior: en.senior,
};

// ─────────────────────────────────────────────────────────────────────────────
// KANNADA (kn)
// ─────────────────────────────────────────────────────────────────────────────
const kn = {
  child: [
    { id: 1, question: "ನಿಮ್ಮ ಹಲ್ಲುಗಳಲ್ಲಿ ಬ್ರೇಸ್‌ಗಳು (ಲೋಹದ ತಂತಿ) ಇವೆಯೇ? 🚂", emoji: "🚂", funLabel: "ಬ್ರೇಸ್ ಪರೀಕ್ಷೆ",
      options: [{ text: "ಹೌದು! ನನಗೆ ಬ್ರೇಸ್ ಇದೆ! 😎", conditionKey: "hasBraces", value: true }, { text: "ಇಲ್ಲ! 😁", conditionKey: "hasBraces", value: false }] },
    { id: 2, question: "ಹಲ್ಲು ತಿಕ್ಕುವಾಗ ವಸಡುಗಳು ಕೆಂಪಗಾಗುತ್ತವೆಯೇ ಅಥವಾ ನೋವು ಆಗುತ್ತದೆಯೇ? 😬", emoji: "😬", funLabel: "ವಸಡಿನ ಪರೀಕ್ಷೆ",
      options: [{ text: "ಹೌದು, ನೋವಾಗುತ್ತದೆ! 😢", conditionKey: "bleedingGums", value: true }, { text: "ಇಲ್ಲ, ಚೆನ್ನಾಗಿದೆ! 🙂", conditionKey: "bleedingGums", value: false }] },
    { id: 3, question: "ಬ್ರಷ್ ಮಾಡಿದ ನಂತರ ಸಿಂಕ್‌ನಲ್ಲಿ ಕೆಂಪು ಬಣ್ಣ ಕಾಣಿಸುತ್ತದೆಯೇ? 🩸", emoji: "🩸", funLabel: "ಸಿಂಕ್ ಪರೀಕ್ಷೆ",
      options: [{ text: "ಹೌದು, ಆಗಾಗ! 😮", conditionKey: "bleedingGums", value: true }, { text: "ಕೆಲವೊಮ್ಮೆ 🤔", conditionKey: "bleedingGums", value: true }, { text: "ಎಂದಿಗೂ ಇಲ್ಲ! 🎉", conditionKey: "bleedingGums", value: false }] },
    { id: 4, question: "ಬ್ರೇಸ್ ಅಥವಾ ಹಲ್ಲುಗಳ ನಡುವೆ ಸಿಕ್ಕಿಕೊಂಡ ಆಹಾರ ತೆಗೆಯಲು ಕಷ್ಟವಾಗುತ್ತದೆಯೇ? 🍕", emoji: "🍕", funLabel: "ಆಹಾರ ಸಿಕ್ಕಿಕೊಂಡಿದೆ",
      options: [{ text: "ಹೌದು, ತುಂಬಾ ಕಷ್ಟ! 😅", conditionKey: "hasBraces", value: true }, { text: "ಸುಲಭ! 💪", conditionKey: "hasBraces", value: false }] },
    { id: 5, question: "ನಿಮ್ಮ ನಾಲಿಗೆಯನ್ನು ಹಲ್ಲುಗಳ ಮೇಲೆ ಉಜ್ಜಿ — ಹೇಗನ್ನಿಸುತ್ತದೆ? 👅", emoji: "👅", funLabel: "ನಾಲಿಗೆ ಪರೀಕ್ಷೆ",
      options: [{ text: "ಒರಟಾಗಿ ಮತ್ತು ಕೊಳಕಾಗಿ! 😬", conditionKey: "preventative", value: true }, { text: "ನಯವಾಗಿ ಮತ್ತು ಶುಭ್ರವಾಗಿ! 😁", conditionKey: "preventative", value: false }] },
    { id: 6, question: "2 ನಿಮಿಷಕ್ಕಿಂತ ಕಡಿಮೆ ಸಮಯದಲ್ಲಿ ವೇಗವಾಗಿ ಬ್ರಷ್ ಮಾಡುತ್ತೀರಾ? ⏱️", emoji: "⏱️", funLabel: "ವೇಗದ ಬ್ರಷರ್?",
      options: [{ text: "ಹೌದು, ತುಂಬಾ ವೇಗವಾಗಿ! 🏃", conditionKey: "preventative", value: true }, { text: "ಇಲ್ಲ, ಸಮಯ ತೆಗೆದುಕೊಳ್ಳುತ್ತೇನೆ! 😊", conditionKey: "preventative", value: false }] },
    { id: 7, question: "ತುಂಬಾ ಜೋರಾಗಿ ಉಜ್ಜುತ್ತೀರಾ? 🧹", emoji: "🧹", funLabel: "ಬ್ರಷ್ ಶೈಲಿ",
      options: [{ text: "ಹೌದು, ತುಂಬಾ ಜೋರಾಗಿ! 💪", conditionKey: "aggressiveBrusher", value: true }, { text: "ಇಲ್ಲ, ಮೃದುವಾಗಿ! 🌸", conditionKey: "aggressiveBrusher", value: false }] },
    { id: 8, question: "ಪ್ರತಿದಿನ ಸಿಹಿ ತಿಂಡಿ, ಚಾಕೊಲೇಟ್ ತಿನ್ನುತ್ತೀರಾ? 🍬", emoji: "🍬", funLabel: "ಸಿಹಿ ಹುಚ್ಚು",
      options: [{ text: "ಹೌದು, ಪ್ರತಿದಿನ! 😋", conditionKey: "preventative", value: true }, { text: "ಕೆಲವೊಮ್ಮೆ! 🤷", conditionKey: "preventative", value: false }] },
    { id: 9, question: "ಮಲಗುವ ಮುನ್ನ ಬ್ರಷ್ ಮಾಡಲು ಮರೆಯುತ್ತೀರಾ? 🌙", emoji: "🌙", funLabel: "ರಾತ್ರಿ ದಿನಚರಿ",
      options: [{ text: "ಹೌದು, ಹೆಚ್ಚಿನ ರಾತ್ರಿ! 😅", conditionKey: "preventative", value: true }, { text: "ಎಂದಿಗೂ ಇಲ್ಲ! 🌟", conditionKey: "preventative", value: false }] },
    { id: 10, question: "ದೊಡ್ಡವರು ನಿಮ್ಮ ಹಲ್ಲು ಬ್ರಷ್ ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತಾರೆಯೇ? 🧑‍🤝‍🧑", emoji: "🧑‍🤝‍🧑", funLabel: "ಬ್ರಷ್ ಗೆಳೆಯ",
      options: [{ text: "ಇಲ್ಲ, ನಾನು ಒಂಟಿಯಾಗಿ ಮಾಡುತ್ತೇನೆ! 💪", conditionKey: "manualDexterity", value: true }, { text: "ಹೌದು, ಅವರು ಸಹಾಯ ಮಾಡುತ್ತಾರೆ! 😊", conditionKey: "manualDexterity", value: false }] },
  ],
  adult: en.adult,
  senior: en.senior,
};

// ─────────────────────────────────────────────────────────────────────────────
// SPANISH (es)
// ─────────────────────────────────────────────────────────────────────────────
const es = {
  child: [
    { id: 1, question: "¿Tienes frenos (alambres metálicos) en tus dientes? 🚂", emoji: "🚂", funLabel: "¡Revisa tus frenos!",
      options: [{ text: "¡Sí, tengo frenos! 😎", conditionKey: "hasBraces", value: true }, { text: "¡No, sin frenos! 😁", conditionKey: "hasBraces", value: false }] },
    { id: 2, question: "¿Se ponen rojas o duelen tus encías cuando te cepillas? 😬", emoji: "😬", funLabel: "¡Encías felices?",
      options: [{ text: "¡Sí, me duelen! 😢", conditionKey: "bleedingGums", value: true }, { text: "¡No, todo bien! 🙂", conditionKey: "bleedingGums", value: false }] },
    { id: 3, question: "¿Ves color rosado o rojo en el lavabo después de cepillarte? 🩸", emoji: "🩸", funLabel: "Revisión del lavabo",
      options: [{ text: "¡Sí, a menudo! 😮", conditionKey: "bleedingGums", value: true }, { text: "A veces 🤔", conditionKey: "bleedingGums", value: true }, { text: "¡Nunca! 🎉", conditionKey: "bleedingGums", value: false }] },
    { id: 4, question: "¿Es difícil limpiar comida atrapada entre tus frenos o dientes? 🍕", emoji: "🍕", funLabel: "¡Comida atascada!",
      options: [{ text: "¡Sí, muy difícil! 😅", conditionKey: "hasBraces", value: true }, { text: "¡Fácil! 💪", conditionKey: "hasBraces", value: false }] },
    { id: 5, question: "Pasa tu lengua por los dientes — ¿cómo se sienten AHORA? 👅", emoji: "👅", funLabel: "Prueba de lengua",
      options: [{ text: "¡Peludos y sucios! 😬", conditionKey: "preventative", value: true }, { text: "¡Lisos y limpios! 😁", conditionKey: "preventative", value: false }] },
    { id: 6, question: "¿Te cepillas muy rápido en menos de 2 minutos? ⏱️", emoji: "⏱️", funLabel: "¿Cepillado rápido?",
      options: [{ text: "¡Sí, súper rápido! 🏃", conditionKey: "preventative", value: true }, { text: "¡No, me tomo mi tiempo! 😊", conditionKey: "preventative", value: false }] },
    { id: 7, question: "¿Friegas muy fuerte hacia adelante y atrás? 🧹", emoji: "🧹", funLabel: "Estilo de cepillado",
      options: [{ text: "¡Sí, muy fuerte! 💪", conditionKey: "aggressiveBrusher", value: true }, { text: "¡No, suavemente! 🌸", conditionKey: "aggressiveBrusher", value: false }] },
    { id: 8, question: "¿Comes muchos dulces, chocolates o bebidas azucaradas cada día? 🍬", emoji: "🍬", funLabel: "¡Diente dulce!",
      options: [{ text: "¡Sí, todos los días! 😋", conditionKey: "preventative", value: true }, { text: "¡A veces! 🤷", conditionKey: "preventative", value: false }] },
    { id: 9, question: "¿Olvidas cepillarte antes de dormir? 🌙", emoji: "🌙", funLabel: "Rutina nocturna",
      options: [{ text: "¡Sí, casi siempre! 😅", conditionKey: "preventative", value: true }, { text: "¡Nunca! ¡Siempre me cepillo! 🌟", conditionKey: "preventative", value: false }] },
    { id: 10, question: "¿Te ayuda un adulto a cepillarte los dientes? 🧑‍🤝‍🧑", emoji: "🧑‍🤝‍🧑", funLabel: "Amigo del cepillo",
      options: [{ text: "¡No, lo hago solo! 💪", conditionKey: "manualDexterity", value: true }, { text: "¡Sí, me ayudan! 😊", conditionKey: "manualDexterity", value: false }] },
  ],
  adult: [
    { id: 1, question: "¿Usa actualmente brackets fijos, alambres, o alineadores transparentes?",
      options: [{ text: "Sí, brackets metálicos/cerámicos", conditionKey: "hasBraces", value: true }, { text: "Sí, alineadores transparentes", conditionKey: "hasBraces", value: true }, { text: "No, pero tengo retenedor", conditionKey: "hasBraces", value: true }, { text: "Ninguno", conditionKey: "hasBraces", value: false }] },
    { id: 2, question: "¿Sus encías sangran al cepillarse o usar hilo dental?",
      options: [{ text: "Sí, frecuentemente", conditionKey: "bleedingGums", value: true }, { text: "A veces", conditionKey: "bleedingGums", value: true }, { text: "Casi nunca", conditionKey: "bleedingGums", value: false }] },
    { id: 3, question: "¿Ha notado que sus encías se retraen exponiendo más superficie del diente?",
      options: [{ text: "Sí, recesión severa", conditionKey: "recededGums", value: true }, { text: "Un poco", conditionKey: "recededGums", value: true }, { text: "No, estables", conditionKey: "recededGums", value: false }] },
    { id: 4, question: "¿Tiene implantes dentales, puentes fijos o coronas?",
      options: [{ text: "Sí, implantes", conditionKey: "hasImplants", value: true }, { text: "Sí, puentes", conditionKey: "hasImplants", value: true }, { text: "Solo coronas", conditionKey: "hasImplants", value: false }, { text: "Ninguno", conditionKey: "hasImplants", value: false }] },
    { id: 5, question: "¿Sus encías están inflamadas, dolorosas o de color rojo intenso?",
      options: [{ text: "Sí, inflamadas", conditionKey: "bleedingGums", value: true }, { text: "Ocasionalmente", conditionKey: "bleedingGums", value: true }, { text: "No, saludables", conditionKey: "bleedingGums", value: false }] },
    { id: 6, question: "¿Experimenta sensibilidad o dolor agudo con líquidos calientes o fríos?",
      options: [{ text: "Sí, muy sensible", conditionKey: "sensitivity", value: true }, { text: "Leve molestia", conditionKey: "sensitivity", value: true }, { text: "Ninguna sensibilidad", conditionKey: "sensitivity", value: false }] },
    { id: 7, question: "¿Se le queda comida atrapada alrededor de sus aparatos o frenos?",
      options: [{ text: "Sí, siempre", conditionKey: "hasBraces", value: true }, { text: "A veces", conditionKey: "hasBraces", value: true }, { text: "No", conditionKey: "hasBraces", value: false }] },
    { id: 8, question: "¿Le es difícil limpiar los márgenes bajo sus coronas o puentes?",
      options: [{ text: "Sí, acceso restringido", conditionKey: "hasImplants", value: true }, { text: "No, sin problemas", conditionKey: "hasImplants", value: false }] },
    { id: 9, question: "¿Usa un cepillo de cerdas medianas o duras?",
      options: [{ text: "Sí, medianas o duras", conditionKey: "aggressiveBrusher", value: true }, { text: "No, suaves", conditionKey: "aggressiveBrusher", value: false }] },
    { id: 10, question: "¿Cuántas veces se cepilla los dientes al día?",
      options: [{ text: "Dos o más veces", conditionKey: "preventative", value: false }, { text: "Una vez o menos", conditionKey: "preventative", value: true }] },
  ],
  senior: en.senior,
};

// ─────────────────────────────────────────────────────────────────────────────
// FRENCH (fr)
// ─────────────────────────────────────────────────────────────────────────────
const fr = {
  child: [
    { id: 1, question: "As-tu des rails métalliques (appareils dentaires) sur tes dents? 🚂", emoji: "🚂", funLabel: "Vérification appareil",
      options: [{ text: "Oui, j'ai un appareil! 😎", conditionKey: "hasBraces", value: true }, { text: "Non, pas d'appareil! 😁", conditionKey: "hasBraces", value: false }] },
    { id: 2, question: "Tes gencives deviennent-elles rouges ou douloureuses quand tu te brosses? 😬", emoji: "😬", funLabel: "Gencives heureuses?",
      options: [{ text: "Oui, ça fait mal! 😢", conditionKey: "bleedingGums", value: true }, { text: "Non, tout va bien! 🙂", conditionKey: "bleedingGums", value: false }] },
    { id: 3, question: "Vois-tu du rose ou du rouge dans le lavabo après te brosser? 🩸", emoji: "🩸", funLabel: "Vérification lavabo",
      options: [{ text: "Oui, souvent! 😮", conditionKey: "bleedingGums", value: true }, { text: "Parfois 🤔", conditionKey: "bleedingGums", value: true }, { text: "Jamais! 🎉", conditionKey: "bleedingGums", value: false }] },
    { id: 4, question: "Est-il difficile de nettoyer les aliments coincés entre tes brackets? 🍕", emoji: "🍕", funLabel: "Nourriture coincée!",
      options: [{ text: "Oui, très difficile! 😅", conditionKey: "hasBraces", value: true }, { text: "Facile! 💪", conditionKey: "hasBraces", value: false }] },
    { id: 5, question: "Passe ta langue sur tes dents — comment ça se sent MAINTENANT? 👅", emoji: "👅", funLabel: "Test de langue",
      options: [{ text: "Rugueux et pas propre! 😬", conditionKey: "preventative", value: true }, { text: "Lisse et propre! 😁", conditionKey: "preventative", value: false }] },
    { id: 6, question: "Te brosses-tu très vite en moins de 2 minutes? ⏱️", emoji: "⏱️", funLabel: "Brossage rapide?",
      options: [{ text: "Oui, super vite! 🏃", conditionKey: "preventative", value: true }, { text: "Non, je prends mon temps! 😊", conditionKey: "preventative", value: false }] },
    { id: 7, question: "Frottes-tu très fort en va-et-vient? 🧹", emoji: "🧹", funLabel: "Style de brossage",
      options: [{ text: "Oui, très fort! 💪", conditionKey: "aggressiveBrusher", value: true }, { text: "Non, doucement! 🌸", conditionKey: "aggressiveBrusher", value: false }] },
    { id: 8, question: "Manges-tu beaucoup de bonbons, chocolats ou boissons sucrées? 🍬", emoji: "🍬", funLabel: "Dent sucrée!",
      options: [{ text: "Oui, chaque jour! 😋", conditionKey: "preventative", value: true }, { text: "Parfois! 🤷", conditionKey: "preventative", value: false }] },
    { id: 9, question: "Oublies-tu de te brosser avant de dormir? 🌙", emoji: "🌙", funLabel: "Routine du soir",
      options: [{ text: "Oui, la plupart des nuits! 😅", conditionKey: "preventative", value: true }, { text: "Jamais! Je me brosse toujours! 🌟", conditionKey: "preventative", value: false }] },
    { id: 10, question: "Un adulte t'aide-t-il à te brosser les dents? 🧑‍🤝‍🧑", emoji: "🧑‍🤝‍🧑", funLabel: "Ami du brossage",
      options: [{ text: "Non, je le fais seul! 💪", conditionKey: "manualDexterity", value: true }, { text: "Oui, ils m'aident! 😊", conditionKey: "manualDexterity", value: false }] },
  ],
  adult: en.adult,
  senior: en.senior,
};

// ─────────────────────────────────────────────────────────────────────────────
// GERMAN (de)
// ─────────────────────────────────────────────────────────────────────────────
const de = {
  child: [
    { id: 1, question: "Hast du Zahnspange (Metalldrähte) an deinen Zähnen? 🚂", emoji: "🚂", funLabel: "Zahnspangen-Check",
      options: [{ text: "Ja, ich habe eine Zahnspange! 😎", conditionKey: "hasBraces", value: true }, { text: "Nein, keine Zahnspange! 😁", conditionKey: "hasBraces", value: false }] },
    { id: 2, question: "Werden dein Zahnfleisch beim Zähneputzen rot oder tut es weh? 😬", emoji: "😬", funLabel: "Zahnfleisch-Test",
      options: [{ text: "Ja, es tut weh! 😢", conditionKey: "bleedingGums", value: true }, { text: "Nein, alles gut! 🙂", conditionKey: "bleedingGums", value: false }] },
    { id: 3, question: "Siehst du nach dem Zähneputzen Rotes im Waschbecken? 🩸", emoji: "🩸", funLabel: "Waschbecken-Check",
      options: [{ text: "Ja, oft! 😮", conditionKey: "bleedingGums", value: true }, { text: "Manchmal 🤔", conditionKey: "bleedingGums", value: true }, { text: "Nie! 🎉", conditionKey: "bleedingGums", value: false }] },
    { id: 4, question: "Ist es schwer, Essen zwischen deinen Zähnen oder Zahnspangen zu entfernen? 🍕", emoji: "🍕", funLabel: "Essens-Falle",
      options: [{ text: "Ja, sehr schwer! 😅", conditionKey: "hasBraces", value: true }, { text: "Einfach! 💪", conditionKey: "hasBraces", value: false }] },
    { id: 5, question: "Reibe deine Zunge über die Zähne — wie fühlen sie sich an? 👅", emoji: "👅", funLabel: "Zungen-Test",
      options: [{ text: "Rau und schmutzig! 😬", conditionKey: "preventative", value: true }, { text: "Glatt und sauber! 😁", conditionKey: "preventative", value: false }] },
    { id: 6, question: "Putzt du super schnell in unter 2 Minuten? ⏱️", emoji: "⏱️", funLabel: "Schnell-Putzer?",
      options: [{ text: "Ja, super schnell! 🏃", conditionKey: "preventative", value: true }, { text: "Nein, ich nehme mir Zeit! 😊", conditionKey: "preventative", value: false }] },
    { id: 7, question: "Schrubbt du sehr hart hin und her? 🧹", emoji: "🧹", funLabel: "Putz-Stil",
      options: [{ text: "Ja, sehr hart! 💪", conditionKey: "aggressiveBrusher", value: true }, { text: "Nein, sanft! 🌸", conditionKey: "aggressiveBrusher", value: false }] },
    { id: 8, question: "Isst du täglich viele Süßigkeiten oder zuckerhaltige Getränke? 🍬", emoji: "🍬", funLabel: "Süßer Zahn!",
      options: [{ text: "Ja, jeden Tag! 😋", conditionKey: "preventative", value: true }, { text: "Manchmal! 🤷", conditionKey: "preventative", value: false }] },
    { id: 9, question: "Vergisst du manchmal, vor dem Schlafen die Zähne zu putzen? 🌙", emoji: "🌙", funLabel: "Abendroutine",
      options: [{ text: "Ja, meistens! 😅", conditionKey: "preventative", value: true }, { text: "Nie! Ich putze immer! 🌟", conditionKey: "preventative", value: false }] },
    { id: 10, question: "Hilft dir ein Erwachsener beim Zähneputzen? 🧑‍🤝‍🧑", emoji: "🧑‍🤝‍🧑", funLabel: "Putz-Freund",
      options: [{ text: "Nein, ich mache es alleine! 💪", conditionKey: "manualDexterity", value: true }, { text: "Ja, sie helfen mir! 😊", conditionKey: "manualDexterity", value: false }] },
  ],
  adult: en.adult,
  senior: en.senior,
};

// For remaining languages (ml, mr, gu, bn) — use English questions with kid fun emojis preserved
const ml = { child: en.child, adult: en.adult, senior: en.senior };
const mr = { child: en.child, adult: en.adult, senior: en.senior };
const gu = { child: en.child, adult: en.adult, senior: en.senior };
const bn = { child: en.child, adult: en.adult, senior: en.senior };

// ─────────────────────────────────────────────────────────────────────────────
// Language Map
// ─────────────────────────────────────────────────────────────────────────────
const questionMap: Record<string, { child: Question[]; adult: Question[]; senior: Question[] }> = {
  en, hi, te, ta, kn, es, fr, de, ml, mr, gu, bn,
};

/**
 * Returns the correct question set for a given mode and language.
 * Falls back to English if the language is not found.
 */
export function getQuestions(
  mode: "child" | "adult" | "senior",
  lang: string
): Question[] {
  const langSet = questionMap[lang] || questionMap.en;
  return langSet[mode] || langSet.adult;
}
