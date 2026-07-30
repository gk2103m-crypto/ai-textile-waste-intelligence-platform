"""
Fabric Condition Classification Model Trainer
---------------------------------------------
Trains a lightweight CNN model (MobileNetV2 Transfer Learning) to classify
textile damage and condition categories from industrial dataset images.
"""

import os
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2

# Configuration and Hyperparameters
DATASET_DIR = r"D:\Fabric_Condition_Dataset"
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 5
SEED = 123
MODEL_SAVE_PATH = "condition_classifier.h5"


def main():
    global DATASET_DIR

    # Smart Auto-Resolver: Fixes the single-class nested folder bug automatically
    nested_path = os.path.join(DATASET_DIR, "Dataset")
    if os.path.exists(nested_path) and os.path.isdir(nested_path):
        DATASET_DIR = nested_path
        print(f"[INFO] Resolved nested dataset directory: {DATASET_DIR}")
    else:
        print(f"[INFO] Initializing dataset pipeline from: {DATASET_DIR}")

    # Load training and validation datasets (80/20 split)
    train_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="training",
        seed=SEED,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="validation",
        seed=SEED,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
    )

    class_names = train_ds.class_names
    print(
        f"[INFO] Detected Condition Classes ({len(class_names)}): {class_names}"
    )

    if len(class_names) <= 1:
        print(
            "[ERROR] Only 1 class detected! Please check your dataset folder"
            " structure."
        )
        return

    # Configure dataset for high-performance data loading
    autotune = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(buffer_size=autotune)
    val_ds = val_ds.prefetch(buffer_size=autotune)

    # Build lightweight transfer learning architecture using MobileNetV2
    print(
        "[INFO] Building MobileNetV2 architecture with custom classification"
        " head..."
    )
    base_model = MobileNetV2(
        input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3),
        include_top=False,
        weights="imagenet",
    )
    base_model.trainable = False  # Freeze pretrained weights

    model = models.Sequential([
        layers.Rescaling(1.0 / 255, input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3)),
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(64, activation="relu"),
        layers.Dropout(0.3),
        layers.Dense(len(class_names), activation="softmax"),
    ])

    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    # Execute training loop
    print(f"[INFO] Starting model training for {EPOCHS} epochs...")
    model.fit(train_ds, validation_data=val_ds, epochs=EPOCHS)

    # Save trained artifact
    model.save(MODEL_SAVE_PATH)
    print(f"[SUCCESS] Trained model artifact saved to: {MODEL_SAVE_PATH}")
    print(f"[INFO] Class Order Mapping for inference service: {class_names}")


if __name__ == "__main__":
    main()