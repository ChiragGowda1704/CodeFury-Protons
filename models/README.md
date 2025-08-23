# Pretrained Models

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
