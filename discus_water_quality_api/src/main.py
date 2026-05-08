import joblib
import pandas as pd
import os
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Discus Water Quality Risk API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "models/best_water_quality_model.pkl"
ENCODER_PATH = "models/label_encoder.pkl"
HISTORY_PATH = "history/prediction_history.csv"

model = joblib.load(MODEL_PATH)
label_encoder = joblib.load(ENCODER_PATH)


class WaterQualityInput(BaseModel):
    ph: float
    temperature_c: float
    ammonia_mg_l: float
    nitrite_mg_l: float
    nitrate_mg_l: float


def estimate_water_appearance(ph, temp, ammonia, nitrite, nitrate):
    """
    Rule-based estimated water appearance.
    This is NOT image-based detection.
    It estimates possible water appearance using water parameter values.
    """

    if ammonia > 0.1 and nitrate > 20:
        return {
            "estimated_water_color": "Yellowish / Cloudy",
            "color_reason": "High nitrate and ammonia values may indicate organic waste buildup and unstable water conditions."
        }

    if ammonia > 0.1 or nitrite > 0.1:
        return {
            "estimated_water_color": "Cloudy / Unsafe",
            "color_reason": "High ammonia or nitrite levels may indicate poor biological filtration and unsafe water quality."
        }

    if nitrate > 40:
        return {
            "estimated_water_color": "Yellowish",
            "color_reason": "High nitrate levels may indicate organic waste accumulation and the need for a water change."
        }

    if nitrate > 20:
        return {
            "estimated_water_color": "Slightly Yellowish",
            "color_reason": "Moderate nitrate buildup may cause slight yellowish water appearance over time."
        }

    if ph < 6.0 or ph > 7.5:
        return {
            "estimated_water_color": "Unstable / Possible Stress Condition",
            "color_reason": "Abnormal pH can indicate unstable aquarium conditions, even if water appears visually clear."
        }

    if temp < 28 or temp > 31:
        return {
            "estimated_water_color": "Clear but Temperature-Stressed",
            "color_reason": "Water may appear clear, but the temperature is outside the ideal Discus range."
        }

    return {
        "estimated_water_color": "Clear / Normal",
        "color_reason": "Water parameters are within or close to recommended Discus ranges."
    }


def generate_recommendations(ph, temp, ammonia, nitrite, nitrate, risk_level):
    recommendations = []

    if ph < 6.0:
        recommendations.append("pH is too low. Increase pH gradually.")
    elif ph > 7.5:
        recommendations.append("pH is too high. Reduce pH slowly.")

    if temp < 28:
        recommendations.append("Temperature is low. Maintain Discus tank temperature around 28–30°C.")
    elif temp > 31:
        recommendations.append("Temperature is high. Improve aeration and reduce temperature slowly.")

    if ammonia > 0.1:
        recommendations.append("High ammonia detected. Perform a partial water change immediately and check filtration.")
    elif ammonia > 0.05:
        recommendations.append("Ammonia is rising. Reduce feeding and monitor water quality closely.")

    if nitrite > 0.1:
        recommendations.append("High nitrite detected. Improve biological filtration and perform a partial water change.")
    elif nitrite > 0.05:
        recommendations.append("Nitrite is rising. Check filter bacteria cycle and avoid overfeeding.")

    if nitrate > 40:
        recommendations.append("High nitrate detected. Clean organic waste and perform a water change.")
    elif nitrate > 20:
        recommendations.append("Moderate nitrate buildup. Reduce feeding and schedule regular water changes.")

    if risk_level == "High Risk":
        recommendations.append("High risk detected. Take immediate action and monitor the tank frequently.")
    elif risk_level == "Moderate Risk":
        recommendations.append("Moderate risk detected. Monitor parameters daily and take preventive action.")
    else:
        recommendations.append("Water condition appears stable. Continue regular monitoring.")

    return recommendations


def save_prediction_history(input_values, risk_level, confidence, recommendations, water_appearance):
    os.makedirs("history", exist_ok=True)

    history_row = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        **input_values,
        "risk_level": risk_level,
        "confidence": confidence,
        "estimated_water_color": water_appearance["estimated_water_color"],
        "color_reason": water_appearance["color_reason"],
        "recommendations": " | ".join(recommendations)
    }

    df = pd.DataFrame([history_row])

    if os.path.exists(HISTORY_PATH):
        df.to_csv(HISTORY_PATH, mode="a", header=False, index=False)
    else:
        df.to_csv(HISTORY_PATH, index=False)


@app.get("/")
def home():
    return {"message": "Discus Water Quality Risk API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Backend connected"}


@app.post("/predict")
def predict_risk(data: WaterQualityInput):
    ph = data.ph
    temp = data.temperature_c
    ammonia = data.ammonia_mg_l
    nitrite = data.nitrite_mg_l
    nitrate = data.nitrate_mg_l

    input_data = pd.DataFrame([{
        "ph": ph,
        "temperature_c": temp,
        "ammonia_mg_l": ammonia,
        "nitrite_mg_l": nitrite,
        "nitrate_mg_l": nitrate,

        "ph_rolling_3": ph,
        "ph_rolling_7": ph,
        "ph_change_rate": 0.0,

        "temperature_c_rolling_3": temp,
        "temperature_c_rolling_7": temp,
        "temperature_c_change_rate": 0.0,

        "ammonia_mg_l_rolling_3": ammonia,
        "ammonia_mg_l_rolling_7": ammonia,
        "ammonia_mg_l_change_rate": 0.0,

        "nitrite_mg_l_rolling_3": nitrite,
        "nitrite_mg_l_rolling_7": nitrite,
        "nitrite_mg_l_change_rate": 0.0,

        "nitrate_mg_l_rolling_3": nitrate,
        "nitrate_mg_l_rolling_7": nitrate,
        "nitrate_mg_l_change_rate": 0.0,

        "water_stability_index": 0.0
    }])

    prediction = model.predict(input_data)[0]
    risk_level = label_encoder.inverse_transform([prediction])[0]

    probabilities = model.predict_proba(input_data)[0]
    confidence = round(float(max(probabilities)) * 100, 2)

    water_appearance = estimate_water_appearance(
        ph, temp, ammonia, nitrite, nitrate
    )

    recommendations = generate_recommendations(
        ph, temp, ammonia, nitrite, nitrate, risk_level
    )

    input_values = {
        "ph": ph,
        "temperature_c": temp,
        "ammonia_mg_l": ammonia,
        "nitrite_mg_l": nitrite,
        "nitrate_mg_l": nitrate
    }

    save_prediction_history(
        input_values,
        risk_level,
        confidence,
        recommendations,
        water_appearance
    )

    return {
        "risk_level": risk_level,
        "confidence": confidence,
        "estimated_water_color": water_appearance["estimated_water_color"],
        "color_reason": water_appearance["color_reason"],
        "recommendations": recommendations,
        "message": f"Predicted water quality risk level is {risk_level}"
    }


@app.get("/history")
def get_history():

    history_file = "history/prediction_history.csv"

    if not os.path.exists(history_file):
        return []

    try:
        df = pd.read_csv(history_file)

        records = df.fillna("").to_dict(orient="records")

        return records

    except Exception as e:
        return {
            "error": str(e)
        }

@app.get("/analytics")
def get_analytics():
    history_file = "history/prediction_history.csv"

    if not os.path.exists(history_file):
        return {
            "ph": [],
            "temperature": [],
            "ammonia": [],
            "nitrite": [],
            "nitrate": [],
            "risk": [],
            "timestamps": []
        }

    df = pd.read_csv(history_file)

    return {
        "ph": df["ph"].fillna(0).tolist(),
        "temperature": df["temperature_c"].fillna(0).tolist(),
        "ammonia": df["ammonia_mg_l"].fillna(0).tolist(),
        "nitrite": df["nitrite_mg_l"].fillna(0).tolist(),
        "nitrate": df["nitrate_mg_l"].fillna(0).tolist(),
        "risk": df["risk_level"].fillna("").tolist(),
        "timestamps": df["timestamp"].fillna("").tolist()
    }