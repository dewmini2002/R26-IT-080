from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from symptom_validation import match_symptoms
import os
import shutil
import uuid
import json
import ast

app = FastAPI(title="Discus Disease Detection API")

UPLOAD_DIR = "uploads"
RESULT_DIR = "results"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULT_DIR, exist_ok=True)

model = YOLO("best.pt")


@app.get("/")
def home():
    return {"message": "Discus Disease Detection API is running"}


def parse_symptoms(symptoms: str):
    try:
        print("RAW SYMPTOMS:", symptoms)

        if symptoms is None or symptoms.strip() == "":
            return []

        symptoms_clean = symptoms.strip()

        # Case 1: JSON list
        try:
            parsed = json.loads(symptoms_clean)
            if isinstance(parsed, list):
                parsed = [str(s).strip() for s in parsed if str(s).strip() != ""]
                print("PARSED USER SYMPTOMS:", parsed)
                return parsed
        except Exception:
            pass

        # Case 2: Python list string
        try:
            parsed = ast.literal_eval(symptoms_clean)
            if isinstance(parsed, list):
                parsed = [str(s).strip() for s in parsed if str(s).strip() != ""]
                print("PARSED USER SYMPTOMS:", parsed)
                return parsed
        except Exception:
            pass

        # Case 3: comma-separated string
        parsed = [
            s.strip()
            for s in symptoms_clean.split(",")
            if s.strip() != ""
        ]

        print("PARSED USER SYMPTOMS:", parsed)
        return parsed

    except Exception as e:
        print("SYMPTOM PARSE ERROR:", e)
        return []


@app.post("/predict")
async def predict_disease(
    file: UploadFile = File(...),
    symptoms: str = Form("[]")
):
    try:
        user_symptoms = parse_symptoms(symptoms)

        file_ext = file.filename.split(".")[-1]
        unique_name = f"{uuid.uuid4()}.{file_ext}"
        image_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        results = model.predict(
            source=image_path,
            conf=0.25,
            save=True,
            project=RESULT_DIR,
            name="predictions",
            exist_ok=True
        )

        result = results[0]

        if len(result.boxes) == 0:
            return JSONResponse({
                "status": "success",
                "prediction": "No Disease Detected",
                "is_healthy": False,
                "confidence": 0,
                "symptom_validation": match_symptoms("unknown", user_symptoms),
                "detections": []
            })

        detections = []

        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            raw_name = result.names[class_id]
            clean_name = raw_name.replace("_", " ").title()

            x1, y1, x2, y2 = map(int, box.xyxy[0])

            detections.append({
                "class_name": raw_name,
                "display_name": clean_name,
                "confidence": round(confidence, 2),
                "bbox": {
                    "x1": x1,
                    "y1": y1,
                    "x2": x2,
                    "y2": y2
                }
            })

        best_detection = max(detections, key=lambda x: x["confidence"])

        if best_detection["class_name"] == "healthy_fish":
            final_output = "Healthy Fish"
            is_healthy = True
        else:
            final_output = f"Disease : {best_detection['display_name']}"
            is_healthy = False

        symptom_result = match_symptoms(
            best_detection["class_name"],
            user_symptoms
        )

        return {
            "status": "success",
            "prediction": final_output,
            "is_healthy": is_healthy,
            "confidence": best_detection["confidence"],
            "symptom_validation": symptom_result,
            "detections": detections
        }

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": str(e)
            }
        )