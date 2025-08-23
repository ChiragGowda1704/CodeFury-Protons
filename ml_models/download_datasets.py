#!/usr/bin/env python3
"""
Download sample datasets for ML models
"""

import os
import requests
import zipfile
import shutil
from pathlib import Path
import urllib.request
from PIL import Image
import numpy as np

def create_directories():
    """Create necessary directories for datasets"""
    directories = [
        "datasets/art_classification",
        "datasets/art_classification/folk_art",
        "datasets/art_classification/modern_art", 
        "datasets/art_classification/classical_art",
        "datasets/style_transfer",
        "datasets/style_transfer/style_images",
        "datasets/style_transfer/content_images"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✅ Created directory: {directory}")

def download_sample_art_images():
    """Download sample art images from various sources"""
    
    # Sample URLs for different art styles (using placeholder service for demo)
    art_samples = {
        "folk_art": [
            "https://picsum.photos/400/400?random=1",
            "https://picsum.photos/400/400?random=2", 
            "https://picsum.photos/400/400?random=3",
            "https://picsum.photos/400/400?random=4",
            "https://picsum.photos/400/400?random=5"
        ],
        "modern_art": [
            "https://picsum.photos/400/400?random=6",
            "https://picsum.photos/400/400?random=7",
            "https://picsum.photos/400/400?random=8", 
            "https://picsum.photos/400/400?random=9",
            "https://picsum.photos/400/400?random=10"
        ],
        "classical_art": [
            "https://picsum.photos/400/400?random=11",
            "https://picsum.photos/400/400?random=12",
            "https://picsum.photos/400/400?random=13",
            "https://picsum.photos/400/400?random=14",
            "https://picsum.photos/400/400?random=15"
        ]
    }
    
    # Style transfer sample images
    style_images = [
        "https://picsum.photos/512/512?random=21",
        "https://picsum.photos/512/512?random=22", 
        "https://picsum.photos/512/512?random=23",
        "https://picsum.photos/512/512?random=24"
    ]
    
    content_images = [
        "https://picsum.photos/512/512?random=31",
        "https://picsum.photos/512/512?random=32",
        "https://picsum.photos/512/512?random=33", 
        "https://picsum.photos/512/512?random=34"
    ]
    
    print("📥 Downloading sample art classification images...")
    
    # Download classification samples
    for category, urls in art_samples.items():
        for i, url in enumerate(urls):
            try:
                response = requests.get(url, timeout=10)
                filename = f"datasets/art_classification/{category}/sample_{i+1}.jpg"
                with open(filename, 'wb') as f:
                    f.write(response.content)
                print(f"  ✅ Downloaded {category} sample {i+1}")
            except Exception as e:
                print(f"  ❌ Failed to download {category} sample {i+1}: {e}")
    
    print("📥 Downloading style transfer images...")
    
    # Download style images
    for i, url in enumerate(style_images):
        try:
            response = requests.get(url, timeout=10)
            filename = f"datasets/style_transfer/style_images/style_{i+1}.jpg"
            with open(filename, 'wb') as f:
                f.write(response.content)
            print(f"  ✅ Downloaded style image {i+1}")
        except Exception as e:
            print(f"  ❌ Failed to download style image {i+1}: {e}")
    
    # Download content images  
    for i, url in enumerate(content_images):
        try:
            response = requests.get(url, timeout=10)
            filename = f"datasets/style_transfer/content_images/content_{i+1}.jpg"
            with open(filename, 'wb') as f:
                f.write(response.content)
            print(f"  ✅ Downloaded content image {i+1}")
        except Exception as e:
            print(f"  ❌ Failed to download content image {i+1}: {e}")

def create_sample_labels():
    """Create sample labels and metadata for datasets"""
    
    # Create labels.txt for classification
    classification_labels = """# Art Classification Dataset Labels
# Format: filename,category,description

# Folk Art Samples
sample_1.jpg,folk_art,Traditional folk art pattern
sample_2.jpg,folk_art,Cultural folk design
sample_3.jpg,folk_art,Regional folk artwork
sample_4.jpg,folk_art,Ethnic art style
sample_5.jpg,folk_art,Folk painting tradition

# Modern Art Samples  
sample_1.jpg,modern_art,Contemporary abstract art
sample_2.jpg,modern_art,Modern artistic expression
sample_3.jpg,modern_art,Digital art creation
sample_4.jpg,modern_art,Contemporary style
sample_5.jpg,modern_art,Modern artistic technique

# Classical Art Samples
sample_1.jpg,classical_art,Traditional classical painting
sample_2.jpg,classical_art,Historical art style
sample_3.jpg,classical_art,Renaissance influence
sample_4.jpg,classical_art,Classical composition
sample_5.jpg,classical_art,Academic art tradition
"""
    
    with open("datasets/art_classification/labels.txt", "w") as f:
        f.write(classification_labels)
    
    # Create README for datasets
    readme_content = """# Art Datasets

## Classification Dataset
- **Location**: `datasets/art_classification/`
- **Categories**: folk_art, modern_art, classical_art
- **Images**: 5 samples per category
- **Labels**: See `labels.txt`

## Style Transfer Dataset  
- **Style Images**: `datasets/style_transfer/style_images/`
- **Content Images**: `datasets/style_transfer/content_images/`
- **Usage**: For neural style transfer experiments

## Usage

### Training Classification Model
```python
from ml_models.classifier.train_classifier import train_model
train_model("datasets/art_classification")
```

### Running Style Transfer
```python  
from ml_models.style_transfer.neural_style_transfer import NeuralStyleTransfer
nst = NeuralStyleTransfer()
result = nst.transfer_style("content.jpg", "style.jpg")
```

## Adding More Data
- Add images to respective category folders
- Update labels.txt with new entries
- Retrain models with expanded dataset
"""
    
    with open("datasets/README.md", "w") as f:
        f.write(readme_content)
    
    print("✅ Created labels and documentation")

def download_pretrained_models():
    """Download or create placeholder for pretrained models"""
    
    models_dir = "models"
    os.makedirs(models_dir, exist_ok=True)
    
    # Create model info file
    model_info = """# Pretrained Models

## Art Classifier
- **File**: `art_classifier.pth`
- **Architecture**: CNN (3 classes: folk_art, modern_art, classical_art)
- **Input Size**: 224x224 RGB
- **Accuracy**: Training required

## Style Transfer Model
- **Architecture**: Neural Style Transfer (VGG-based)
- **Input Size**: Variable (recommended 512x512)
- **Styles**: Configurable

## Training
Run the training scripts to generate model files:

```bash
# Train classifier
python ml_models/classifier/train_classifier.py

# Style transfer is pre-implemented (no training needed)
```
"""
    
    with open("models/README.md", "w") as f:
        f.write(model_info)
    
    print("✅ Created model documentation")

def main():
    """Main function to download and setup datasets"""
    print("🎨 Setting up ML datasets for Artist Showcase Platform...")
    
    create_directories()
    download_sample_art_images()
    create_sample_labels()
    download_pretrained_models()
    
    print("\n🎉 Dataset setup complete!")
    print("\n📂 Directory structure:")
    print("datasets/")
    print("├── art_classification/")
    print("│   ├── folk_art/ (5 samples)")
    print("│   ├── modern_art/ (5 samples)") 
    print("│   ├── classical_art/ (5 samples)")
    print("│   └── labels.txt")
    print("├── style_transfer/")
    print("│   ├── style_images/ (4 samples)")
    print("│   ├── content_images/ (4 samples)")
    print("│   └── README.md")
    print("└── README.md")
    print("\n🚀 Ready to train models and run experiments!")

if __name__ == "__main__":
    main()
