from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import os
import shutil
import uuid

app = FastAPI(title="Discus Disease Detection API")

# Folders
UPLOAD_DIR = "uploads"
RESULT_DIR = "results"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULT_DIR, exist_ok=True)

# Load YOLO model
model = YOLO("best.pt")


@app.get("/")
def home():
    return {
        "message": "Discus Disease Detection API is running"
    }


@app.post("/predict")
async def predict_disease(file: UploadFile = File(...)):
    try:
        # save uploaded image
        file_ext = file.filename.split(".")[-1]
        unique_name = f"{uuid.uuid4()}.{file_ext}"
        image_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # run prediction
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

        # highest confidence detection
        best_detection = max(detections, key=lambda x: x["confidence"])

        if best_detection["class_name"] == "healthy_fish":
            final_output = "Healthy Fish"
            is_healthy = True
        else:
            final_output = f"Disease : {best_detection['display_name']}"
            is_healthy = False

        return {
            "status": "success",
            "prediction": final_output,
            "is_healthy": is_healthy,
            "confidence": best_detection["confidence"],
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