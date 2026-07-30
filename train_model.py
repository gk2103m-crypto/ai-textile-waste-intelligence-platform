import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# 1. Dataset Path
DATA_DIR = "dataset/material_data/fabrics_dataset"
IMG_SIZE = (224, 224)
BATCH_SIZE = 16

print("Loading Dataset...")
# Preprocessing and Augmentation
datagen = ImageDataGenerator(rescale=1./255, validation_split=0.2)

train_generator = datagen.flow_from_directory(
    DATA_DIR, target_size=IMG_SIZE, batch_size=BATCH_SIZE, 
    class_mode='categorical', subset='training'
)

val_generator = datagen.flow_from_directory(
    DATA_DIR, target_size=IMG_SIZE, batch_size=BATCH_SIZE, 
    class_mode='categorical', subset='validation'
)

# Class names saving
class_names = list(train_generator.class_indices.keys())
print(f"Classes Found: {class_names}")

# 2. Transfer Learning using MobileNetV2
print("Building MobileNetV2 Model...")
base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
base_model.trainable = False  # Freeze pre-trained weights

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation='relu')(x)
predictions = Dense(len(class_names), activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=predictions)
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# 3. Training the Model
print("Starting Training...")
model.fit(train_generator, validation_data=val_generator, epochs=5)

# 4. Save the actual model
model.save("material_classifier.h5")
print("Real Model Saved Successfully as 'material_classifier.h5'")


