import os
import pandas as pd
import matplotlib.pyplot as plt

dataset_path = "fabrics_dataset" 

print(f" Scanning '{dataset_path}' and all its hidden sub-folders...")

class_counts = {}

# os.walk will search everywhere inside the folder
if os.path.exists(dataset_path):
    for root, dirs, files in os.walk(dataset_path):
        img_count = sum(1 for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.webp')))
        
        if img_count > 0:
            # Get the exact folder name where images are found
            folder_name = os.path.basename(root)
            class_counts[folder_name] = class_counts.get(folder_name, 0) + img_count

    if class_counts:
        # Convert dictionary to lists
        fabric_types = list(class_counts.keys())
        image_counts = list(class_counts.values())
        
        # Create CSV
        df = pd.DataFrame({'Fabric_Class': fabric_types, 'Total_Images': image_counts})
        df.to_csv('fabrics_summary.csv', index=False)
        print("\n SUCCESS: 'fabrics_summary.csv' created! (Open in Excel)")
        
        # Create Chart
        plt.figure(figsize=(12,6))
        plt.bar(df['Fabric_Class'], df['Total_Images'], color='#FF9800')
        plt.title('EDA: The Fabrics Dataset - Class Distribution')
        plt.xlabel('Fabric Categories')
        plt.ylabel('Number of Images')
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        plt.savefig('fabrics_eda_chart.png')
        print(" SUCCESS: 'fabrics_eda_chart.png' created!\n")
    else:
        print(" Still no images found! Bro, check if the zip file was extracted completely.")
else:
    print(f" Folder '{dataset_path}' not found!")