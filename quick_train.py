#!/usr/bin/env python3
"""
Quick training script for art classifier
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import torchvision.transforms as transforms
from PIL import Image
import os
import sys

# Add ml_models to path
sys.path.append('/Users/adi/Desktop/Adi/Hackathons/Protons/ml_models')

from classifier.art_classifier import ArtStyleCNN

class SimpleArtDataset(Dataset):
    def __init__(self, data_dir):
        self.data_dir = data_dir
        self.classes = ['folk_art', 'modern_art', 'classical_art']
        self.class_to_idx = {cls: idx for idx, cls in enumerate(self.classes)}
        
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])
        
        self.samples = []
        self._load_samples()
    
    def _load_samples(self):
        for class_name in self.classes:
            class_dir = os.path.join(self.data_dir, class_name)
            if os.path.exists(class_dir):
                for filename in os.listdir(class_dir):
                    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                        filepath = os.path.join(class_dir, filename)
                        label = self.class_to_idx[class_name]
                        self.samples.append((filepath, label))
    
    def __len__(self):
        return len(self.samples)
    
    def __getitem__(self, idx):
        filepath, label = self.samples[idx]
        try:
            image = Image.open(filepath).convert('RGB')
            if self.transform:
                image = self.transform(image)
            return image, label
        except Exception as e:
            print(f"Error loading {filepath}: {e}")
            # Return a dummy image
            dummy_image = torch.zeros((3, 224, 224))
            return dummy_image, label

def quick_train():
    print("🎨 Quick training art classifier...")
    
    # Setup
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Dataset
    dataset = SimpleArtDataset('/Users/adi/Desktop/Adi/Hackathons/Protons/datasets/art_classification')
    print(f"Dataset size: {len(dataset)} samples")
    
    if len(dataset) == 0:
        print("❌ No samples found in dataset!")
        return
    
    dataloader = DataLoader(dataset, batch_size=4, shuffle=True)
    
    # Model
    model = ArtStyleCNN(num_classes=3).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    # Training loop (minimal)
    model.train()
    for epoch in range(3):
        total_loss = 0
        for batch_idx, (data, target) in enumerate(dataloader):
            data, target = data.to(device), target.to(device)
            
            optimizer.zero_grad()
            output = model(data)
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
        
        avg_loss = total_loss / len(dataloader)
        print(f"Epoch {epoch+1}/3, Loss: {avg_loss:.4f}")
    
    # Save model
    model_dir = '/Users/adi/Desktop/Adi/Hackathons/Protons/models'
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'art_classifier.pth')
    
    torch.save({
        'model_state_dict': model.state_dict(),
        'classes': dataset.classes,
        'class_to_idx': dataset.class_to_idx
    }, model_path)
    
    print(f"✅ Model saved to: {model_path}")
    print("🎉 Training complete!")

if __name__ == "__main__":
    quick_train()
