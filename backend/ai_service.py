import re
from typing import Optional

def handle_conversational_and_persona_intents(prompt: str) -> Optional[str]:
    """
    Local conversational intent handler for identity, age, origin,
    silly questions, greetings, emotional gestures, and quick dental queries.
    Runs 100% locally with zero external API dependencies.
    """
    if not prompt:
        return "Hello there! How can I help you take care of your teeth and gums today?"

    p_clean = prompt.lower().strip()
    p_nopunct = re.sub(r'[^a-zA-Z0-9\s]', '', p_clean)

    # 1. Small talk: how are you
    if any(phrase in p_clean for phrase in ["how are you", "how r u", "how do you do", "how is it going", "how r ya", "how are u"]) or \
       any(phrase in p_nopunct for phrase in ["how are you", "how r u", "how do you do", "how is it going"]):
        return "I'm feeling minty fresh and ready to help! How are your teeth and brushing routines going today?"

    # Identity & Name
    if any(q in p_nopunct for q in ["what is your name", "who are you", "ur name", "call you", "whats your name"]):
        return "I'm Dr. Minty, your personal AI dental assistant here to guide your brushing habits and answer all your oral hygiene questions!"

    # Age & Origin / Location
    if any(q in p_nopunct for q in ["what is your age", "how old are you", "ur age"]):
        return "I'm ageless in human years, but I'm always up-to-date with the latest clinically approved dental techniques!"

    if any(q in p_nopunct for q in ["where do you live", "where are you from", "where are you living", "where do u stay", "where u live"]):
        return "I live right inside your app, ready 24/7 to help you protect your teeth and brighten your smile!"

    if any(q in p_nopunct for q in ["are you a real doctor", "are you a human", "are you a bot", "are you ai", "are u real"]):
        return "I am an AI-powered dental health guide! While I provide clinically accurate dental information, always visit a human dentist for physical checkups and clinical treatments."

    # Greetings & Gestures
    if any(p_nopunct == g or p_nopunct.startswith(g + " ") for g in ["hi", "hello", "hey", "hlo", "holla", "good morning", "good evening", "good afternoon", "sup", "yo"]):
        return "Hello there! How can I help you take care of your teeth and gums today?"

    if any(q in p_nopunct for q in ["what are you doing", "what u doing", "what r u doing", "what are u doing"]):
        return "I'm ready and waiting to answer your dental questions and help you brush properly! What's on your mind?"

    if any(q in p_nopunct for q in ["thank you", "thanks", "tq", "thank u", "thx", "appreciate it"]):
        return "You're very welcome! Keep up that great brushing streak, and let me know whenever you have another question."

    if any(q in p_nopunct for q in ["bye", "goodbye", "good night", "gn", "see you", "cya"]):
        return "Goodbye! Don't forget to brush for two full minutes before bed. Keep smiling!"

    # Silly & Casual Questions
    if any(q in p_clean for q in ["do you brush teeth", "do you have teeth", "have teeth"]):
        return "I don't have teeth of my own, but I spend all day making sure yours stay sparkling clean and cavity-free!"

    if any(q in p_clean for q in ["tell me a joke", "dental joke", "make me laugh", "funny joke"]):
        return "Why did the smartphone go to the dentist? Because it had a Bluetooth! Remember to floss daily!"

    if any(q in p_clean for q in ["what do you eat", "can you eat", "what u eat"]):
        return "I only consume data and good oral hygiene habits! No sugary snacks for me, which keeps me 100% cavity-free."

    if any(q in p_clean for q in ["favourite colour", "favorite color", "fav color"]):
        return "Mint green, of course! It reminds me of clean teeth and fresh breath."

    return None
