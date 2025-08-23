# Art Datasets

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
