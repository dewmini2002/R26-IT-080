from fastapi import FastAPI, File, UploadFile
from ultralytics import YOLO
import cv2
import numpy as np
import math
import shutil
import os

app = FastAPI(title="Discus Fish Analyzer API")

model = YOLO("best.pt")

STICKER_REAL_SIZE_CM = 5
THICKNESS_RATIO = 0.2


@app.get("/")
def home():
    return {"message": "Discus Fish Analyzer API Running"}


def analyze_image_file(image_path: str):
    img = cv2.imread(image_path)

    if img is None:
        return {"error": "Image not found"}

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    lower_blue = np.array([85, 30, 80])
    upper_blue = np.array([115, 255, 255])

    mask = cv2.inRange(hsv, lower_blue, upper_blue)

    contours, _ = cv2.findContours(
        mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    if len(contours) == 0:
        return {"error": "Sticker not detected"}

    largest = max(contours, key=cv2.contourArea)
    sx, sy, sw, sh = cv2.boundingRect(largest)

    sticker_px = (sw + sh) / 2
    cm_per_pixel = STICKER_REAL_SIZE_CM / sticker_px

    results = model(image_path)
    result = results[0]

    fish_data = []
    total_volume = 0

    for i, box in enumerate(result.boxes, start=1):
        x1, y1, x2, y2 = box.xyxy[0]

        fish_width_px = int(x2 - x1)
        fish_height_px = int(y2 - y1)

        fish_length_cm = fish_width_px * cm_per_pixel
        fish_height_cm = fish_height_px * cm_per_pixel
        fish_thickness_cm = THICKNESS_RATIO * fish_height_cm

        volume_cm3 = (
            (4 / 3)
            * math.pi
            * (fish_length_cm / 2)
            * (fish_height_cm / 2)
            * (fish_thickness_cm / 2)
        )

        total_volume += volume_cm3

        fish_data.append({
            "fish_id": i,
            "length_cm": round(fish_length_cm, 2),
            "height_cm": round(fish_height_cm, 2),
            "thickness_cm": round(fish_thickness_cm, 2),
            "volume_cm3": round(volume_cm3, 2)
        })

    fish_count = len(fish_data)

    avg_length = (
        sum(f["length_cm"] for f in fish_data) / fish_count
        if fish_count > 0 else 0
    )

    return {
        "fish_count": fish_count,
        "average_length_cm": round(avg_length, 2),
        "total_volume_cm3": round(total_volume, 2),
        "cm_per_pixel": round(cm_per_pixel, 5),
        "sticker_width_px": sw,
        "sticker_height_px": sh,
        "fish_details": fish_data
    }


@app.post("/analyze")
async def analyze(image: UploadFile = File(...)):
    image_path = f"temp_{image.filename}"

    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    result = analyze_image_file(image_path)

    if os.path.exists(image_path):
        os.remove(image_path)

    return result


@app.post("/analyze-multiple")
async def analyze_multiple(
    image1: UploadFile = File(...),
    image2: UploadFile = File(...),
    image3: UploadFile = File(...)
):
    images = [image1, image2, image3]
    all_results = []

    for image in images:
        image_path = f"temp_{image.filename}"

        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        result = analyze_image_file(image_path)
        result["image_name"] = image.filename
        all_results.append(result)

        if os.path.exists(image_path):
            os.remove(image_path)

    valid_results = [r for r in all_results if "error" not in r]

    if len(valid_results) == 0:
        return {
            "error": "No valid image results",
            "all_results": all_results
        }

    best_result = max(valid_results, key=lambda r: r["average_length_cm"])

    average_fish_count = (
        sum(r["fish_count"] for r in valid_results) / len(valid_results)
    )

    average_total_volume = (
        sum(r["total_volume_cm3"] for r in valid_results) / len(valid_results)
    )

    return {
        "total_images_uploaded": len(images),
        "valid_images_analyzed": len(valid_results),

        "final_estimated_length_cm": best_result["average_length_cm"],
        "final_total_volume_cm3": best_result["total_volume_cm3"],
        "final_fish_count": best_result["fish_count"],

        # "best_image": best_result["image_name"],
        # "best_image_result": best_result,

        # "average_fish_count_across_images": round(average_fish_count, 2),
        # "average_total_volume_across_images_cm3": round(average_total_volume, 2),

        # "selection_method": "Best image selected using highest average fish length as closest side-view approximation",
        # "all_results": all_results
    }