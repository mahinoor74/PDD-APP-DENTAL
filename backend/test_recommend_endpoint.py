import asyncio
from main import app, load_technique_model, recommend_technique_endpoint, QuestionnaireInput

async def test_recommendations():
    load_technique_model()
    
    test_cases = [
        {
            "name": "Orthodontic Patient (Braces)",
            "input": QuestionnaireInput(
                age_group=1,
                has_braces=1,
                has_implants_bridges=0,
                bleeding_gums=1,
                gum_recession=0,
                tooth_sensitivity=0,
                limited_dexterity=0,
                plaque_buildup=1
            )
        },
        {
            "name": "Gum Recession & Sensitive Teeth Patient",
            "input": QuestionnaireInput(
                age_group=1,
                has_braces=0,
                has_implants_bridges=0,
                bleeding_gums=0,
                gum_recession=2,
                tooth_sensitivity=2,
                limited_dexterity=0,
                plaque_buildup=0
            )
        },
        {
            "name": "Pediatric / Limited Dexterity Patient",
            "input": QuestionnaireInput(
                age_group=0,
                has_braces=0,
                has_implants_bridges=0,
                bleeding_gums=0,
                gum_recession=0,
                tooth_sensitivity=0,
                limited_dexterity=1,
                plaque_buildup=1
            )
        },
        {
            "name": "Gingivitis / Sulcular Bleeding Patient",
            "input": QuestionnaireInput(
                age_group=1,
                has_braces=0,
                has_implants_bridges=0,
                bleeding_gums=2,
                gum_recession=0,
                tooth_sensitivity=0,
                limited_dexterity=0,
                plaque_buildup=2
            )
        }
    ]

    print("=== TESTING POST /api/technique/recommend ML MODEL ENDPOINT ===")
    for test in test_cases:
        res = await recommend_technique_endpoint(test["input"])
        print(f"\n[Test Case]: {test['name']}")
        print(f"  Recommended Technique: {res['recommended_technique']}")
        print(f"  Confidence Score:      {res['confidence_score']}%")
        print(f"  Clinical Rationale:    {res['clinical_rationale']}")
        print(f"  Key Features:          {res['key_features']}")

if __name__ == "__main__":
    asyncio.run(test_recommendations())
