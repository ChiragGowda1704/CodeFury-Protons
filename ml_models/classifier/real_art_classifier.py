#!/usr/bin/env python3
"""
Real Art Classification Model
Based on the provided notebook, simplified for 3 classes: Madhubani, Warli, Pithora
"""

import numpy as np
import os
import tensorflow as tf

# Enable eager execution
tf.config.run_functions_eagerly(True)

from tensorflow.keras.preprocessing.image import ImageDataGenerator, load_img, img_to_array
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.optimizers import Adam
import json
import cv2
from PIL import Image
import io

class RealArtClassifier:
    def __init__(self, model_path='real_art_model.h5'):
        """Initialize the real art classifier"""
        self.model_path = model_path
        self.model = None
        self.class_names = ['madhubani', 'warli', 'pithora']  # Fixed: No more "others"
        self.img_size = (150, 150)
        
        # Try to load existing model first
        if os.path.exists(model_path):
            try:
                self.model = load_model(model_path)
                print(f"✅ Loaded existing model from {model_path}")
            except Exception as e:
                print(f"⚠️ Could not load existing model: {e}")
                print("Will create new model...")
        
        if self.model is None:
            self.create_model()
    
    def create_model(self):
        """Create CNN model architecture based on the notebook"""
        print("🏗️ Creating new CNN model...")
        
        self.model = Sequential([
            # First convolutional layer
            Conv2D(32, (3, 3), activation='relu', input_shape=(150, 150, 3)),
            MaxPooling2D((2, 2)),
            
            # Second convolutional layer  
            Conv2D(64, (3, 3), activation='relu'),
            MaxPooling2D((2, 2)),
            
            # Third convolutional layer
            Conv2D(128, (3, 3), activation='relu'),
            MaxPooling2D((2, 2)),
            
            # Flatten and dense layers
            Flatten(),
            Dense(512, activation='relu'),
            Dropout(0.5),  # Add dropout for better generalization
            Dense(3, activation='softmax')  # 3 classes
        ])
        
        # Compile the model
        self.model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        print("✅ Model created successfully")
        print(self.model.summary())
        return self.model
    
    def preprocess_image(self, image_input):
        """
        Preprocess image for classification
        Args:
            image_input: Can be file path, PIL Image, or numpy array
        Returns:
            Preprocessed image array
        """
        try:
            # Handle different input types
            if isinstance(image_input, str):
                # File path
                img = load_img(image_input, target_size=self.img_size)
            elif isinstance(image_input, bytes):
                # Bytes data
                img = Image.open(io.BytesIO(image_input))
                img = img.resize(self.img_size)
            elif hasattr(image_input, 'read'):
                # File-like object
                img = Image.open(image_input)
                img = img.resize(self.img_size)
            else:
                # Assume PIL Image or numpy array
                if hasattr(image_input, 'resize'):
                    img = image_input.resize(self.img_size)
                else:
                    img = Image.fromarray(image_input).resize(self.img_size)
            
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Convert to array and normalize
            img_array = img_to_array(img)
            img_array = img_array / 255.0  # Normalize to [0,1]
            img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
            
            return img_array
            
        except Exception as e:
            print(f"❌ Error preprocessing image: {e}")
            raise
    
    def classify_image(self, image_input):
        """
        Classify an image into art categories
        Args:
            image_input: Image file path, PIL Image, or bytes
        Returns:
            Classification results dictionary
        """
        try:
            if self.model is None:
                raise ValueError("Model not loaded")
            
            # Preprocess image
            processed_img = self.preprocess_image(image_input)
            
            # Make prediction
            predictions = self.model.predict(processed_img, verbose=0)
            predicted_class_idx = np.argmax(predictions[0])
            confidence_score = float(predictions[0][predicted_class_idx])
            predicted_style = self.class_names[predicted_class_idx]
            
            # Get all class probabilities
            all_predictions = {
                self.class_names[i]: float(predictions[0][i]) 
                for i in range(len(self.class_names))
            }
            
            # Analyze image features
            features = self.analyze_image_features(image_input)
            
            result = {
                'predicted_style': predicted_style,
                'confidence_score': confidence_score,
                'all_predictions': all_predictions,
                'features': features,
                'model_version': '3-class-cnn',
                'timestamp': tf.timestamp().numpy().item()
            }
            
            print(f"🎨 Classification: {predicted_style} ({confidence_score:.3f} confidence)")
            return result
            
        except Exception as e:
            print(f"❌ Error during classification: {e}")
            import traceback
            traceback.print_exc()
            
            # Return fallback result
            return {
                'predicted_style': 'others',
                'confidence_score': 0.33,
                'all_predictions': {name: 0.33 for name in self.class_names},
                'features': {'error': str(e)},
                'model_version': '3-class-cnn-fallback',
                'timestamp': tf.timestamp().numpy().item()
            }
    
    def analyze_image_features(self, image_input):
        """Analyze image features for additional insights"""
        try:
            # Load image for analysis
            if isinstance(image_input, str):
                img = cv2.imread(image_input)
            else:
                # Convert to OpenCV format
                pil_img = Image.open(io.BytesIO(image_input)) if isinstance(image_input, bytes) else image_input
                img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
            
            if img is None:
                return {"error": "Could not load image for analysis"}
            
            # Calculate basic features
            height, width = img.shape[:2]
            
            # Color analysis
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            mean_hue = np.mean(hsv[:, :, 0])
            mean_saturation = np.mean(hsv[:, :, 1])
            mean_value = np.mean(hsv[:, :, 2])
            
            # Edge detection
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / (height * width)
            
            # Geometric pattern detection (simple)
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            geometric_complexity = len(contours) / (height * width) * 10000
            
            features = {
                'dimensions': {'width': int(width), 'height': int(height)},
                'color_features': {
                    'mean_hue': float(mean_hue),
                    'mean_saturation': float(mean_saturation),
                    'mean_brightness': float(mean_value)
                },
                'pattern_features': {
                    'edge_density': float(edge_density),
                    'geometric_complexity': float(geometric_complexity),
                    'contour_count': len(contours)
                }
            }
            
            return features
            
        except Exception as e:
            return {"error": f"Feature analysis failed: {str(e)}"}
    
    def train_model(self, dataset_path, epochs=15, batch_size=32):
        """Train the model on the real dataset"""
        print(f"🚀 Training model on dataset: {dataset_path}")
        
        # Create data generators with augmentation
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            horizontal_flip=True,
            validation_split=0.2
        )
        
        # Prepare training data
        train_generator = train_datagen.flow_from_directory(
            dataset_path,
            target_size=self.img_size,
            batch_size=batch_size,
            class_mode='categorical',
            subset='training',
            classes=['madhubani painting', 'warli painting', 'others']  # Map to our 3 classes
        )
        
        # Prepare validation data
        validation_generator = train_datagen.flow_from_directory(
            dataset_path,
            target_size=self.img_size,
            batch_size=batch_size,
            class_mode='categorical',
            subset='validation',
            classes=['madhubani painting', 'warli painting', 'others']
        )
        
        # Train the model
        history = self.model.fit(
            train_generator,
            steps_per_epoch=train_generator.samples // batch_size,
            validation_data=validation_generator,
            validation_steps=validation_generator.samples // batch_size,
            epochs=epochs,
            verbose=1
        )
        
        # Save the trained model
        self.model.save(self.model_path)
        print(f"✅ Model saved to {self.model_path}")
        
        return history

def test_classifier():
    """Test the classifier with sample images"""
    print("🧪 Testing Real Art Classifier...")
    
    classifier = RealArtClassifier()
    
    # Test with dataset images if available
    dataset_path = "/Users/adi/Desktop/Adi/Hackathons/Protons/datasets/art_classification"
    
    if os.path.exists(dataset_path):
        # Test with actual dataset images
        for style_folder in ['madhubani painting', 'warli painting', 'modern_art']:
            folder_path = os.path.join(dataset_path, style_folder)
            if os.path.exists(folder_path):
                images = [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
                if images:
                    test_image = os.path.join(folder_path, images[0])
                    print(f"\n📸 Testing with {style_folder}: {images[0]}")
                    result = classifier.classify_image(test_image)
                    print(f"Result: {result['predicted_style']} ({result['confidence_score']:.3f})")
    
    print("✅ Classifier test completed")

if __name__ == "__main__":
    test_classifier()
