import torch
import torch.nn as nn

from torchvision import models, transforms
from PIL import Image



MODEL_PATH = "models/water_condition_model.pth"



classes = [
    "brown_water",
    "clear_water",
    "cloudy_water",
    "green_water",
    "yellow_water"
]



device = torch.device(
    "cuda" if torch.cuda.is_available()
    else "cpu"
)



model = models.efficientnet_b0(
    weights=None
)


model.classifier[1] = nn.Linear(
    model.classifier[1].in_features,
    len(classes)
)



checkpoint = torch.load(
    MODEL_PATH,
    map_location=device
)



model.load_state_dict(
    checkpoint["model_state_dict"]
)



model.to(device)

model.eval()





transform = transforms.Compose([

    transforms.Resize((224,224)),

    transforms.ToTensor(),

    transforms.Normalize(
        [0.485,0.456,0.406],
        [0.229,0.224,0.225]
    )

])





# ==============================
# Recommendation Logic
# ==============================

def generate_water_analysis(condition):


    if condition == "green_water":

        return {

            "risk_level": "Moderate",

            "reason":
            "Possible algae accumulation detected from water appearance.",

            "water_change":
            "20-30% partial water change recommended",

            "next_check":
            "Recheck water condition after 3-5 days",

            "recommendations":[

                "Check nitrate and phosphate levels.",

                "Reduce excessive lighting duration.",

                "Clean algae from aquarium surfaces.",

                "Improve filtration if required.",

                "Monitor water clarity regularly."

            ]

        }



    elif condition == "yellow_water":

        return {

            "risk_level":"Moderate",

            "reason":
            "Possible organic waste buildup detected.",

            "water_change":
            "20-30% partial water change recommended",

            "next_check":
            "Recheck water condition after 3 days",

            "recommendations":[

                "Perform a partial water change.",

                "Check feeding amount.",

                "Remove organic waste.",

                "Monitor nitrate levels."

            ]

        }




    elif condition == "brown_water":

        return {

            "risk_level":"High",

            "reason":
            "Possible high organic waste accumulation.",

            "water_change":
            "30-50% partial water change recommended",

            "next_check":
            "Check within 24-48 hours",

            "recommendations":[

                "Perform immediate partial water change.",

                "Clean aquarium substrate.",

                "Check filtration system.",

                "Monitor fish behaviour."

            ]

        }





    elif condition == "cloudy_water":

        return {

            "risk_level":"High",

            "reason":
            "Possible bacterial bloom or unstable water condition.",

            "water_change":
            "20-30% partial water change recommended",

            "next_check":
            "Recheck after 1-3 days",

            "recommendations":[

                "Check ammonia and nitrite levels.",

                "Improve biological filtration.",

                "Avoid overfeeding.",

                "Monitor water clarity."

            ]

        }





    else:

        return {

            "risk_level":"Low",

            "reason":
            "Water appearance looks clear and stable.",

            "water_change":
            "Maintain regular water change schedule",

            "next_check":
            "Recheck after 7 days",

            "recommendations":[

                "Continue regular maintenance.",

                "Monitor fish health.",

                "Maintain stable water parameters."

            ]

        }






# ==============================
# Prediction Function
# ==============================


def predict_water_image(image_path):


    image = Image.open(
        image_path
    ).convert("RGB")



    image = transform(image)


    image = image.unsqueeze(0).to(device)





    with torch.no_grad():


        output = model(image)



        probabilities = torch.softmax(
            output,
            dim=1
        )



        confidence, prediction = torch.max(
            probabilities,
            1
        )





    water_condition = classes[
        prediction.item()
    ]



    confidence_score = round(
        confidence.item()*100,
        2
    )



    analysis = generate_water_analysis(
        water_condition
    )





    return {


        "prediction":
        water_condition,


        "confidence":
        confidence_score,


        "water_condition":
        analysis

    }