import os
import torch
import torch.nn as nn
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, random_split
from sklearn.metrics import accuracy_score, classification_report
from tqdm import tqdm


# ==========================
# Paths
# ==========================

DATASET_PATH = "../water_image_dataset"
MODEL_PATH = "models/water_condition_model.pth"


# ==========================
# Settings
# ==========================

IMG_SIZE = 224
BATCH_SIZE = 16
EPOCHS = 30
LEARNING_RATE = 0.0001


# ==========================
# Image Transformations
# ==========================

transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])


# ==========================
# Dataset Loading
# ==========================

dataset = datasets.ImageFolder(
    DATASET_PATH,
    transform=transform
)

print("Classes:")
print(dataset.classes)

print("Total Images:", len(dataset))


# ==========================
# Train Validation Split
# ==========================

train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size


train_dataset, val_dataset = random_split(
    dataset,
    [train_size, val_size]
)


train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True
)


val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False
)


# ==========================
# EfficientNet Model
# ==========================

device = torch.device(
    "cuda" if torch.cuda.is_available()
    else "cpu"
)

print("Using:", device)


model = models.efficientnet_b0(
    weights="DEFAULT"
)


# Replace classifier

num_classes = len(dataset.classes)

model.classifier[1] = nn.Linear(
    model.classifier[1].in_features,
    num_classes
)


model = model.to(device)


# ==========================
# Loss & Optimizer
# ==========================

criterion = nn.CrossEntropyLoss()

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=LEARNING_RATE
)


# ==========================
# Training
# ==========================

best_accuracy = 0


for epoch in range(EPOCHS):

    model.train()

    running_loss = 0

    for images, labels in tqdm(
        train_loader,
        desc=f"Epoch {epoch+1}/{EPOCHS}"
    ):

        images = images.to(device)
        labels = labels.to(device)


        optimizer.zero_grad()


        outputs = model(images)

        loss = criterion(
            outputs,
            labels
        )


        loss.backward()

        optimizer.step()


        running_loss += loss.item()


    # Validation

    model.eval()

    predictions = []
    actual = []


    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(device)

            outputs = model(images)

            _, predicted = torch.max(
                outputs,
                1
            )


            predictions.extend(
                predicted.cpu().numpy()
            )

            actual.extend(
                labels.numpy()
            )


    accuracy = accuracy_score(
        actual,
        predictions
    )


    print(
        f"Epoch {epoch+1} Accuracy: {accuracy:.4f}"
    )


    # Save best model

    if accuracy > best_accuracy:

        best_accuracy = accuracy

        torch.save(
            {
                "model_state_dict": model.state_dict(),
                "classes": dataset.classes
            },
            MODEL_PATH
        )


        print("Best model saved!")


print("\nTraining Completed")
print(
    "Best Accuracy:",
    best_accuracy
)


print(
    classification_report(
        actual,
        predictions,
        target_names=dataset.classes
    )
)