import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

DATASET_PATH = "dataset/discus_water_quality_features_only.csv"
BEST_MODEL_PATH = "models/best_water_quality_model.pkl"
ENCODER_PATH = "models/label_encoder.pkl"
MODEL_INFO_PATH = "models/model_info.pkl"

df = pd.read_csv(DATASET_PATH)

print("Dataset shape:", df.shape)
print("\nClass distribution:")
print(df["risk_level"].value_counts())

X = df.drop("risk_level", axis=1)
y = df["risk_level"]

label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_encoded,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)

models = {
    "Random Forest": RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight="balanced"
    ),
    "Gradient Boosting": GradientBoostingClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=3,
        random_state=42
    )
}

results = {}

for model_name, model in models.items():
    print(f"\n==============================")
    print(f"Training: {model_name}")
    print(f"==============================")

    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)
    results[model_name] = {
        "model": model,
        "accuracy": accuracy
    }

    print("Accuracy:", accuracy)
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

best_model_name = max(results, key=lambda name: results[name]["accuracy"])
best_model = results[best_model_name]["model"]
best_accuracy = results[best_model_name]["accuracy"]

joblib.dump(best_model, BEST_MODEL_PATH)
joblib.dump(label_encoder, ENCODER_PATH)
joblib.dump(
    {
        "best_model_name": best_model_name,
        "best_accuracy": best_accuracy,
        "features": X.columns.tolist()
    },
    MODEL_INFO_PATH
)

print("\n==============================")
print("BEST MODEL SELECTED")
print("==============================")
print("Best Model:", best_model_name)
print("Best Accuracy:", best_accuracy)
print("Saved:", BEST_MODEL_PATH)