# ===============================
# IMPORTS
# ===============================

import os
import joblib
import pandas as pd

from datetime import datetime

from dotenv import load_dotenv
from supabase import create_client

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from src.image_prediction import predict_water_image



# ===============================
# FASTAPI APP
# ===============================

app = FastAPI(
    title="Discus Water Quality Risk API"
)



# ===============================
# BASIC ROUTES
# ===============================

@app.get("/")
def home():

    return {
        "message":
        "Discus Water Quality Risk API is running"
    }



@app.get("/health")
def health_check():

    return {
        "status":
        "healthy",

        "message":
        "Backend connected"
    }



# ===============================
# ENV + SUPABASE
# ===============================

load_dotenv()

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("SUPABASE URL =", SUPABASE_URL)

SUPABASE_URL = os.getenv(
    "SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "SUPABASE_KEY"
)


if not SUPABASE_URL or not SUPABASE_KEY:

    raise RuntimeError(
        "SUPABASE_URL or SUPABASE_KEY missing in .env"
    )


supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

print(
    "SUPABASE CONNECT:",
    SUPABASE_URL
)



# ===============================
# CORS
# ===============================

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)



# ===============================
# FILE PATHS
# ===============================


MODEL_PATH = (
    "models/best_water_quality_model.pkl"
)


ENCODER_PATH = (
    "models/label_encoder.pkl"
)



HISTORY_PATH = (
    "history/prediction_history.csv"
)


IMAGE_HISTORY_PATH = (
    "history/image_prediction_history.csv"
)




# ===============================
# LOAD MODEL
# ===============================


model = joblib.load(
    MODEL_PATH
)


label_encoder = joblib.load(
    ENCODER_PATH
)




# ===============================
# INPUT SCHEMA
# ===============================

# Fallback values used only when the user does not have a
# manual reading for a parameter. These are NOT sensor readings.
DEFAULT_PH = 6.8
DEFAULT_AMMONIA = 0.02
DEFAULT_NITRITE = 0.01
DEFAULT_NITRATE = 15.0


class WaterQualityInput(BaseModel):

    ph: Optional[float] = None

    temperature_c: float

    ammonia_mg_l: Optional[float] = None

    nitrite_mg_l: Optional[float] = None

    nitrate_mg_l: Optional[float] = None

class SensorTemperatureInput(BaseModel):
    temperature_c: float

class SensorPHInput(BaseModel):
    ph: float

latest_temperature = {
    "temperature_c": None,
    "updated_at": None
}

latest_ph = {
    "ph": None,
    "updated_at": None
}
    # ===============================
# WATER APPEARANCE ESTIMATION
# ===============================


def estimate_water_appearance(
    ph,
    temp,
    ammonia,
    nitrite,
    nitrate
):

    if ammonia > 0.1 and nitrate > 20:

        return {

            "estimated_water_color":
                "Yellowish / Cloudy",

            "color_reason":
                "High nitrate and ammonia values may indicate organic waste buildup and unstable water conditions."
        }


    if ammonia > 0.1 or nitrite > 0.1:

        return {

            "estimated_water_color":
                "Cloudy / Unsafe",

            "color_reason":
                "High ammonia or nitrite levels may indicate poor biological filtration and unsafe water quality."
        }


    if nitrate > 40:

        return {

            "estimated_water_color":
                "Yellowish",

            "color_reason":
                "High nitrate levels may indicate organic waste accumulation and the need for a water change."
        }


    if nitrate > 20:

        return {

            "estimated_water_color":
                "Slightly Yellowish",

            "color_reason":
                "Moderate nitrate buildup may cause slight yellowish water appearance over time."
        }


    if ph < 6.0 or ph > 7.5:

        return {

            "estimated_water_color":
                "Unstable / Possible Stress Condition",

            "color_reason":
                "Abnormal pH can indicate unstable aquarium conditions."
        }


    if temp < 28 or temp > 31:

        return {

            "estimated_water_color":
                "Clear but Temperature-Stressed",

            "color_reason":
                "Temperature is outside the ideal Discus range."
        }


    return {

        "estimated_water_color":
            "Clear / Normal",

        "color_reason":
            "Water parameters are within recommended Discus ranges."
    }





# ===============================
# RECOMMENDATION GENERATION
# ===============================


def generate_recommendations(
    ph,
    temp,
    ammonia,
    nitrite,
    nitrate,
    risk_level
):

    recommendations = []

    # ===============================
    # pH RECOMMENDATIONS
    # ===============================

    if ph < 6.0:
        recommendations.append(
            "pH is too low. Increase pH gradually."
        )

    elif ph > 7.5:
        recommendations.append(
            "pH is too high. Reduce pH slowly."
        )


    # ===============================
    # TEMPERATURE RECOMMENDATIONS
    # ===============================

    if temp < 28:
        recommendations.append(
            "Temperature is low. Maintain Discus tank temperature around 28-30°C."
        )

    elif temp > 31:
        recommendations.append(
            "Temperature is high. Improve aeration and reduce temperature slowly."
        )


    # ===============================
    # AMMONIA RECOMMENDATIONS
    # ===============================

    if ammonia > 0.1:
        recommendations.append(
            "High ammonia detected. Perform partial water change and check filtration."
        )

    elif ammonia > 0.05:
        recommendations.append(
            "Ammonia is increasing. Reduce feeding and monitor."
        )


    # ===============================
    # NITRITE RECOMMENDATIONS
    # ===============================

    if nitrite > 0.1:
        recommendations.append(
            "High nitrite detected. Improve biological filtration."
        )

    elif nitrite > 0.05:
        recommendations.append(
            "Nitrite is increasing. Check filter cycle."
        )


    # ===============================
    # NITRATE RECOMMENDATIONS
    # ===============================

    if nitrate > 40:
        recommendations.append(
            "High nitrate detected. Perform water change."
        )

    elif nitrate > 20:
        recommendations.append(
            "Moderate nitrate buildup detected."
        )


    # =========================================================
    # RISK-BASED WATER CHANGE + RE-CHECK RECOMMENDATION
    # =========================================================

    if risk_level == "High Risk":

        recommendations.append(
            "High risk: perform a 30–50% partial water change now."
        )

        recommendations.append(
            "Re-check water parameters within 6–12 hours."
        )


    elif risk_level == "Moderate Risk":

        recommendations.append(
            "Moderate risk: perform a 20–30% partial water change within 24 hours."
        )

        recommendations.append(
            "Re-check water parameters within 24–48 hours."
        )


    else:

        recommendations.append(
            "Low risk: no immediate water change is required. "
            "Continue routine 20–25% partial water changes about once a week."
        )

        recommendations.append(
            "Re-check water parameters within 7 days."
        )


    return recommendations




# ===============================
# SAVE PARAMETER PREDICTION
# ===============================


def save_prediction_history(
    input_values,
    risk_level,
    confidence,
    recommendations,
    water_appearance
):

    timestamp = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )


    supabase_data = {

        "ph":
            input_values["ph"],

        "temperature_c":
            input_values["temperature_c"],

        "ammonia_mg_l":
            input_values["ammonia_mg_l"],

        "nitrite_mg_l":
            input_values["nitrite_mg_l"],

        "nitrate_mg_l":
            input_values["nitrate_mg_l"],

        "risk_level":
            risk_level,

        "confidence":
            confidence,

        "estimated_water_color":
            water_appearance["estimated_water_color"],

        "color_reason":
            water_appearance["color_reason"],

        "recommendations":
            " | ".join(recommendations)

    }


    try:

        supabase.table(
            "water_quality_predictions"
        ).insert(
            supabase_data
        ).execute()


        print(
            "Parameter saved to Supabase"
        )


    except Exception as e:

        print(
            "Parameter Supabase error:",
            e
        )



    # CSV backup

    csv_data = {

        "timestamp":
            timestamp,

        **input_values,

        "risk_level":
            risk_level,

        "confidence":
            confidence,

        "estimated_water_color":
            water_appearance["estimated_water_color"],

        "color_reason":
            water_appearance["color_reason"],

        "recommendations":
            " | ".join(recommendations)

    }


    df = pd.DataFrame(
        [csv_data]
    )


    if os.path.exists(HISTORY_PATH):

        df.to_csv(
            HISTORY_PATH,
            mode="a",
            header=False,
            index=False
        )

    else:

        df.to_csv(
            HISTORY_PATH,
            index=False
        )




# ===============================
# PARAMETER PREDICTION ENDPOINT
# ===============================


@app.post("/predict")
def predict_risk(
    data: WaterQualityInput
):

    # =========================================================
    # Resolve optional values
    # =========================================================
    # Temperature must come from the ESP32/frontend.
    # Other parameters are optional. If a value is missing,
    # a predefined baseline value is used so the existing ML
    # model can still receive all required numeric features.

    ph = data.ph if data.ph is not None else DEFAULT_PH
    ammonia = (
        data.ammonia_mg_l
        if data.ammonia_mg_l is not None
        else DEFAULT_AMMONIA
    )
    nitrite = (
        data.nitrite_mg_l
        if data.nitrite_mg_l is not None
        else DEFAULT_NITRITE
    )
    nitrate = (
        data.nitrate_mg_l
        if data.nitrate_mg_l is not None
        else DEFAULT_NITRATE
    )
    temp = data.temperature_c

    # =========================================================
    # Validate resolved values
    # =========================================================

    if ph < 0 or ph > 14:
        return {"error": "pH must be between 0 and 14."}

    if temp < 15 or temp > 40:
        return {"error": "Temperature must be between 15°C and 40°C."}

    if ammonia < 0 or nitrite < 0 or nitrate < 0:
        return {"error": "Chemical values cannot be negative."}

    # =========================================================
    # MODEL INPUT
    # =========================================================

    input_data = pd.DataFrame([{

        "ph": ph,

        "temperature_c": temp,

        "ammonia_mg_l": ammonia,

        "nitrite_mg_l": nitrite,

        "nitrate_mg_l": nitrate,

        "ph_rolling_3": ph,

        "ph_rolling_7": ph,

        "ph_change_rate": 0,

        "temperature_c_rolling_3": temp,

        "temperature_c_rolling_7": temp,

        "temperature_c_change_rate": 0,

        "ammonia_mg_l_rolling_3": ammonia,

        "ammonia_mg_l_rolling_7": ammonia,

        "ammonia_mg_l_change_rate": 0,

        "nitrite_mg_l_rolling_3": nitrite,

        "nitrite_mg_l_rolling_7": nitrite,

        "nitrite_mg_l_change_rate": 0,

        "nitrate_mg_l_rolling_3": nitrate,

        "nitrate_mg_l_rolling_7": nitrate,

        "nitrate_mg_l_change_rate": 0,

        "water_stability_index": 0

    }])

    prediction = model.predict(
        input_data
    )[0]

    risk_level = label_encoder.inverse_transform(
        [prediction]
    )[0]

    probabilities = model.predict_proba(
        input_data
    )[0]

    confidence = round(
        float(max(probabilities)) * 100,
        2
    )

    # =========================================================
    # WATER APPEARANCE + RECOMMENDATIONS
    # =========================================================

    appearance = estimate_water_appearance(
        ph,
        temp,
        ammonia,
        nitrite,
        nitrate
    )

    recommendations = generate_recommendations(
        ph,
        temp,
        ammonia,
        nitrite,
        nitrate,
        risk_level
    )

    # Save the values the user actually supplied.
    # Missing optional values remain None in history.
    input_values = data.model_dump()

    save_prediction_history(
        input_values,
        risk_level,
        confidence,
        recommendations,
        appearance
    )

    return {

        "risk_level":
            risk_level,

        "confidence":
            confidence,

        "estimated_water_color":
            appearance["estimated_water_color"],

        "color_reason":
            appearance["color_reason"],

        "recommendations":
            recommendations,

        "used_default_values": {
            "ph": data.ph is None,
            "ammonia_mg_l": data.ammonia_mg_l is None,
            "nitrite_mg_l": data.nitrite_mg_l is None,
            "nitrate_mg_l": data.nitrate_mg_l is None
        }
    }


# ===============================
# SAVE IMAGE PREDICTION
# ===============================


def save_image_prediction_history(
    result
):

    os.makedirs(
        "history",
        exist_ok=True
    )


    timestamp = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )


    water_condition = result["water_condition"]



    supabase_data = {

        "prediction":
            result["prediction"],

        "confidence":
            result["confidence"],

        "risk_level":
            water_condition["risk_level"],

        "reason":
            water_condition["reason"],

        "water_change":
            water_condition["water_change"],

        "next_check":
            water_condition["next_check"],

        "recommendations":
            " | ".join(
                water_condition["recommendations"]
            )

    }



    try:

        supabase.table(
            "water_image_predictions"
        ).insert(
            supabase_data
        ).execute()


        print(
            "Image saved to Supabase"
        )


    except Exception as e:

        print(
            "Image Supabase error:",
            e
        )



    # CSV BACKUP

    csv_data = {

        "timestamp":
            timestamp,

        "prediction":
            result["prediction"],

        "confidence":
            result["confidence"],

        "risk_level":
            water_condition["risk_level"],

        "reason":
            water_condition["reason"],

        "water_change":
            water_condition["water_change"],

        "next_check":
            water_condition["next_check"],

        "recommendations":
            " | ".join(
                water_condition["recommendations"]
            )

    }


    df = pd.DataFrame(
        [csv_data]
    )


    if os.path.exists(IMAGE_HISTORY_PATH):

        df.to_csv(
            IMAGE_HISTORY_PATH,
            mode="a",
            header=False,
            index=False
        )

    else:

        df.to_csv(
            IMAGE_HISTORY_PATH,
            index=False
        )





# ===============================
# HISTORY ENDPOINT
# ===============================


@app.get("/history")
def get_history():

    records = []

    try:

        # ===============================
        # PARAMETER PREDICTIONS
        # ===============================

        parameter_response = (
            supabase
            .table("water_quality_predictions")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )


        for row in parameter_response.data or []:

            records.append({

                "timestamp":
                    row.get("created_at", ""),

                "type":
                    "parameter",

                "ph":
                    row.get("ph", ""),

                "temperature_c":
                    row.get("temperature_c", ""),

                "ammonia_mg_l":
                    row.get("ammonia_mg_l", ""),

                "nitrite_mg_l":
                    row.get("nitrite_mg_l", ""),

                "nitrate_mg_l":
                    row.get("nitrate_mg_l", ""),

                "risk_level":
                    row.get("risk_level", ""),

                "confidence":
                    row.get("confidence", ""),

                "estimated_water_color":
                    row.get("estimated_water_color", ""),

                "color_reason":
                    row.get("color_reason", ""),

                "recommendations":
                    row.get("recommendations", "")
            })


        # ===============================
        # IMAGE PREDICTIONS
        # ===============================

        image_response = (
            supabase
            .table("water_image_predictions")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )


        for row in image_response.data or []:

            records.append({

                "timestamp":
                    row.get("created_at", ""),

                "type":
                    "image",

                "prediction":
                    row.get("prediction", ""),

                "confidence":
                    row.get("confidence", ""),

                "risk_level":
                    row.get("risk_level", ""),

                "reason":
                    row.get("reason", ""),

                "water_change":
                    row.get("water_change", ""),

                "next_check":
                    row.get("next_check", ""),

                "recommendations":
                    row.get("recommendations", ""),

                "image_url":
                    row.get("image_url", "")
            })


        # ===============================
        # SORT ALL RECORDS
        # ===============================

        records = sorted(
            records,
            key=lambda x: x.get(
                "timestamp",
                ""
            ),
            reverse=True
        )


        return records


    except Exception as e:

        print(
            "History Supabase error:",
            e
        )

        return []




# ===============================
# ANALYTICS ENDPOINT
# ===============================

@app.get("/analytics")
def get_analytics():

    response = {

        "ph": [],
        "temperature": [],
        "ammonia": [],
        "nitrite": [],
        "nitrate": [],

        "risk": [],
        "timestamps": [],

        "water_conditions": [],
        "image_confidences": [],

        "total_predictions": 0,
        "total_image_predictions": 0
    }


    try:

        # ===============================
        # PARAMETER ANALYTICS
        # ===============================

        parameter_data = (
            supabase
            .table("water_quality_predictions")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )


        parameter_rows = parameter_data.data or []


        for row in parameter_rows:

            response["ph"].append(
                row.get("ph", 0)
            )

            response["temperature"].append(
                row.get("temperature_c", 0)
            )

            response["ammonia"].append(
                row.get("ammonia_mg_l", 0)
            )

            response["nitrite"].append(
                row.get("nitrite_mg_l", 0)
            )

            response["nitrate"].append(
                row.get("nitrate_mg_l", 0)
            )

            response["risk"].append(
                row.get("risk_level", "")
            )

            response["timestamps"].append(
                row.get("created_at", "")
            )


        response["total_predictions"] = len(
            parameter_rows
        )


        # ===============================
        # IMAGE ANALYTICS
        # ===============================

        image_data = (
            supabase
            .table("water_image_predictions")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )


        image_rows = image_data.data or []


        for row in image_rows:

            response["water_conditions"].append(
                row.get("prediction", "")
            )

            response["image_confidences"].append(
                row.get("confidence", 0)
            )


        response["total_image_predictions"] = len(
            image_rows
        )


        return response


    except Exception as e:

        print(
            "Analytics Supabase error:",
            e
        )

        return response

# ===============================
# ESP32 TEMPERATURE SENSOR
# ===============================

@app.post("/sensor/temperature")
def receive_temperature(
    data: SensorTemperatureInput
):

    global latest_temperature

    latest_temperature = {

        "temperature_c":
            data.temperature_c,

        "updated_at":
            datetime.now().isoformat()

    }


    return {

        "status":
            "success",

        "temperature_c":
            data.temperature_c
    }



@app.get("/sensor/temperature/latest")
def get_latest_temperature():

    return latest_temperature

# ===============================
# ESP32 pH SENSOR
# ===============================

@app.post("/sensor/ph")
def receive_ph(
    data: SensorPHInput
):
    global latest_ph

    latest_ph = {
        "ph": data.ph,
        "updated_at": datetime.now().isoformat()
    }

    return {
        "status": "success",
        "ph": data.ph
    }


@app.get("/sensor/ph/latest")
def get_latest_ph():
    return latest_ph
# ===============================
# WATER IMAGE PREDICTION ENDPOINT
# ===============================


@app.post("/predict-water-image")
async def predict_water_condition(
    file: UploadFile = File(...)
):


    image_path = f"temp_{file.filename}"



    try:


        # Save uploaded image temporarily

        with open(
            image_path,
            "wb"
        ) as buffer:


            buffer.write(
                await file.read()
            )



        # AI prediction

        result = predict_water_image(
            image_path
        )



        # Save history

        save_image_prediction_history(
            result
        )



        return {


            "prediction":
                result["prediction"],


            "confidence":
                result["confidence"],


            "water_condition":
                result["water_condition"],


            "message":
                "Water condition predicted successfully"

        }



    except Exception as e:


        return {

            "error":
                str(e)

        }



    finally:


        if os.path.exists(image_path):

            os.remove(
                image_path
            )