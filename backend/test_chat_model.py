from dental_ai_model import global_dental_ai_model

tests = [
    "hi",
    "my tooth hurts a lot",
    "how to brush with braces",
    "gums bleeding after brushing",
    "what is root canal",
    "how to whiten teeth at home",
    "bad breath morning",
]

print("=== DR. MINTY 10K LOCAL MODEL INFERENCE TEST ===")
for t in tests:
    r = global_dental_ai_model.predict(t)
    print(f"Q: {repr(t)}")
    print(f"   Category   : {r['category']}")
    print(f"   Confidence : {r['confidence']}")
    print(f"   Response   : {r['response'][:90]}...")
    print()
