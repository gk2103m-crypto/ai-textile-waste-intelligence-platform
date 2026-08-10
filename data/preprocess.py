import cv2
import albumentations as A
import os

class TextileDataPreprocessor:
    def __init__(self, target_size=(224, 224)):
        self.target_size = target_size
        
        # Defining the AI Image Augmentation Pipeline
        self.transform = A.Compose([
            A.Resize(width=self.target_size[0], height=self.target_size[1]),
            A.HorizontalFlip(p=0.5),
            A.RandomBrightnessContrast(p=0.2),
            A.Rotate(limit=30, p=0.5)
        ])
        print(f" Textile Data Pipeline Initialized. Target Image Size: {self.target_size}")

    def process_image(self, image_path):
        """Loads an image and applies transformations."""
        # Read image using OpenCV
        image = cv2.imread(image_path)
        if image is None:
            return None
            
        # Convert BGR to RGB (OpenCV uses BGR by default)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Apply Albumentations transformations
        augmented = self.transform(image=image)
        return augmented['image']

# Test the pipeline initialization
if __name__ == "__main__":
    pipeline = TextileDataPreprocessor()
    print("Ready to process Kaggle Textile Datasets!")