import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import LabelEncoder

def label_patient_profile(
    age_group,
    has_braces,
    has_implants_bridges,
    bleeding_gums,
    gum_recession,
    tooth_sensitivity,
    limited_dexterity,
    plaque_buildup
):
    """
    Assign clinical brushing technique target label according to ADA & periodontal protocols:
    1. Charters Technique: Orthodontic hardware (braces, archwires, implants, bridges).
    2. Fones Technique: Simplified circular motions for young children, seniors, or limited dexterity.
    3. Modified Stillman Technique: Gum recession, exposed root dentin, or high tooth sensitivity.
    4. Modified Bass Technique: Standard sulcular cleaning for gingivitis, bleeding gums, high plaque, or general hygiene.
    """
    # 1. Orthodontic Hardware / Implants / Bridges
    if has_braces == 1 or has_implants_bridges == 1:
        return "Charters Technique"

    # 2. Limited Dexterity / Young Children / Seniors with motor impairment
    if limited_dexterity == 1:
        return "Fones Technique"
    if age_group == 0 and gum_recession == 0 and tooth_sensitivity == 0:
        return "Fones Technique"

    # 3. Gum Recession & Tooth Sensitivity
    if gum_recession >= 1 or tooth_sensitivity >= 1:
        return "Modified Stillman Technique"

    # 4. Standard Sulcular / Bleeding Gums / Plaque Buildup / General Adult Hygiene
    return "Modified Bass Technique"

def generate_synthetic_dataset(n_samples=6000, seed=42):
    np.random.seed(seed)
    
    # Random sampling across 8 feature domains
    age_group = np.random.choice([0, 1, 2], size=n_samples, p=[0.25, 0.50, 0.25])
    has_braces = np.random.choice([0, 1], size=n_samples, p=[0.75, 0.25])
    has_implants_bridges = np.random.choice([0, 1], size=n_samples, p=[0.80, 0.20])
    bleeding_gums = np.random.choice([0, 1, 2], size=n_samples, p=[0.40, 0.40, 0.20])
    gum_recession = np.random.choice([0, 1, 2], size=n_samples, p=[0.50, 0.35, 0.15])
    tooth_sensitivity = np.random.choice([0, 1, 2], size=n_samples, p=[0.50, 0.35, 0.15])
    limited_dexterity = np.random.choice([0, 1], size=n_samples, p=[0.75, 0.25])
    plaque_buildup = np.random.choice([0, 1, 2], size=n_samples, p=[0.30, 0.45, 0.25])

    X = []
    y = []

    for i in range(n_samples):
        feat = [
            int(age_group[i]),
            int(has_braces[i]),
            int(has_implants_bridges[i]),
            int(bleeding_gums[i]),
            int(gum_recession[i]),
            int(tooth_sensitivity[i]),
            int(limited_dexterity[i]),
            int(plaque_buildup[i])
        ]
        label = label_patient_profile(*feat)
        X.append(feat)
        y.append(label)

    return np.array(X), np.array(y)

def train_and_export_model():
    print("[INFO] Synthesizing 6,000 ADA-compliant patient clinical profiles...")
    X, y = generate_synthetic_dataset(n_samples=6000, seed=42)

    feature_names = [
        "age_group",
        "has_braces",
        "has_implants_bridges",
        "bleeding_gums",
        "gum_recession",
        "tooth_sensitivity",
        "limited_dexterity",
        "plaque_buildup"
    ]

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    target_names = list(label_encoder.classes_)

    print(f"[DATASET] Class distribution: {dict(zip(target_names, np.bincount(y_encoded)))}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    print("[TRAIN] Training RandomForestClassifier (100 trees)...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        random_state=42,
        class_weight="balanced"
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n[SUCCESS] Model Training Complete. Test Accuracy: {accuracy * 100:.2f}%\n")
    print("Evaluation Report:")
    print(classification_report(y_test, y_pred, target_names=target_names))

    if accuracy < 0.97:
        raise ValueError(f"Model accuracy {accuracy * 100:.2f}% is below required 97.00% target threshold.")

    artifact = {
        "model": model,
        "feature_names": feature_names,
        "target_names": target_names,
        "label_encoder": label_encoder,
        "accuracy": accuracy
    }

    output_path = os.path.join(os.path.dirname(__file__), "technique_recommender_model.pkl")
    joblib.dump(artifact, output_path)
    print(f"[EXPORT] Model artifact successfully saved to: {output_path}")

if __name__ == "__main__":
    train_and_export_model()
