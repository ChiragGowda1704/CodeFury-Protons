# Training utilities for the art style classifier

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import torchvision.transforms as transforms
from PIL import Image
import os
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

class ArtDataset(Dataset):
    """Custom dataset for art style classification"""
    
    def __init__(self, data_dir, transform=None):
        self.data_dir = data_dir
        self.transform = transform
        self.classes = ['folk_art', 'modern_art', 'classical_art']
        self.class_to_idx = {cls: idx for idx, cls in enumerate(self.classes)}
        
        self.samples = []
        self._load_samples()
    
    def _load_samples(self):
        """Load all image samples with labels"""
        for class_name in self.classes:
            class_dir = os.path.join(self.data_dir, class_name)
            if not os.path.exists(class_dir):
                print(f"Warning: Directory {class_dir} not found")
                continue
            
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
            print(f"Error loading image {filepath}: {e}")
            # Return a dummy sample
            dummy_image = torch.zeros(3, 224, 224)
            return dummy_image, label

class ArtStyleTrainer:
    """Trainer class for art style classifier"""
    
    def __init__(self, model, device='cpu'):
        self.model = model
        self.device = device
        self.model.to(self.device)
        
        # Define transforms
        self.train_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomRotation(degrees=15),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])
        
        self.val_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])
    
    def prepare_data(self, train_dir, val_dir, batch_size=32):
        """Prepare training and validation data loaders"""
        train_dataset = ArtDataset(train_dir, self.train_transform)
        val_dataset = ArtDataset(val_dir, self.val_transform)
        
        self.train_loader = DataLoader(
            train_dataset, batch_size=batch_size, shuffle=True, num_workers=2
        )
        self.val_loader = DataLoader(
            val_dataset, batch_size=batch_size, shuffle=False, num_workers=2
        )
        
        print(f"Training samples: {len(train_dataset)}")
        print(f"Validation samples: {len(val_dataset)}")
        
        return self.train_loader, self.val_loader
    
    def train(self, num_epochs=20, learning_rate=0.001, weight_decay=1e-4):
        """Train the model"""
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(self.model.parameters(), 
                              lr=learning_rate, weight_decay=weight_decay)
        scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=7, gamma=0.1)
        
        best_val_acc = 0.0
        train_losses = []
        val_accuracies = []
        
        for epoch in range(num_epochs):
            print(f'\nEpoch {epoch+1}/{num_epochs}')
            print('-' * 50)
            
            # Training phase
            self.model.train()
            running_loss = 0.0
            correct_train = 0
            total_train = 0
            
            for images, labels in self.train_loader:
                images, labels = images.to(self.device), labels.to(self.device)
                
                optimizer.zero_grad()
                outputs = self.model(images)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()
                
                running_loss += loss.item()
                _, predicted = torch.max(outputs.data, 1)
                total_train += labels.size(0)
                correct_train += (predicted == labels).sum().item()
            
            epoch_loss = running_loss / len(self.train_loader)
            train_acc = correct_train / total_train
            
            # Validation phase
            val_acc = self.validate()
            
            print(f'Train Loss: {epoch_loss:.4f}, Train Acc: {train_acc:.4f}')
            print(f'Val Acc: {val_acc:.4f}')
            
            # Save best model
            if val_acc > best_val_acc:
                best_val_acc = val_acc
                torch.save(self.model.state_dict(), 'best_art_classifier.pth')
                print(f'New best model saved with validation accuracy: {val_acc:.4f}')
            
            train_losses.append(epoch_loss)
            val_accuracies.append(val_acc)
            scheduler.step()
        
        print(f'\nTraining completed. Best validation accuracy: {best_val_acc:.4f}')
        return train_losses, val_accuracies
    
    def validate(self):
        """Validate the model"""
        self.model.eval()
        correct = 0
        total = 0
        
        with torch.no_grad():
            for images, labels in self.val_loader:
                images, labels = images.to(self.device), labels.to(self.device)
                outputs = self.model(images)
                _, predicted = torch.max(outputs, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
        
        return correct / total
    
    def evaluate_detailed(self, test_loader):
        """Detailed evaluation with confusion matrix and classification report"""
        self.model.eval()
        all_predictions = []
        all_labels = []
        
        with torch.no_grad():
            for images, labels in test_loader:
                images, labels = images.to(self.device), labels.to(self.device)
                outputs = self.model(images)
                _, predicted = torch.max(outputs, 1)
                
                all_predictions.extend(predicted.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())
        
        # Classification report
        class_names = ['warli', 'madhubani', 'pithora']
        report = classification_report(all_labels, all_predictions, 
                                     target_names=class_names, output_dict=True)
        
        # Confusion matrix
        cm = confusion_matrix(all_labels, all_predictions)
        
        return report, cm
    
    def plot_confusion_matrix(self, cm, class_names):
        """Plot confusion matrix"""
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=class_names, yticklabels=class_names)
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.title('Art Style Classification - Confusion Matrix')
        plt.tight_layout()
        plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.show()

def create_sample_data_structure():
    """Create sample directory structure for training data"""
    print("Creating sample data structure...")
    print("Expected directory structure:")
    print("data/")
    print("├── train/")
    print("│   ├── warli/")
    print("│   ├── madhubani/")
    print("│   └── pithora/")
    print("└── val/")
    print("    ├── warli/")
    print("    ├── madhubani/")
    print("    └── pithora/")
    print("\nPlace your training images in the respective folders.")

if __name__ == "__main__":
    # Example usage
    from art_classifier import ArtStyleCNN
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = ArtStyleCNN(num_classes=3)
    trainer = ArtStyleTrainer(model, device)
    
    # To train (uncomment when you have data):
    # train_loader, val_loader = trainer.prepare_data('data/train', 'data/val')
    # train_losses, val_accuracies = trainer.train(num_epochs=20)
    
    create_sample_data_structure()
