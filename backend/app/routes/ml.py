# Artist Showcase Platform - ML Routes
# This file contains a dataset-based classifier and image enhancer.

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import sys
import traceback
import random
from datetime import datetime
import asyncio
from PIL import Image, ImageEnhance, ImageFilter, ImageOps, ImageDraw
import io
import base64
import numpy as np

# Add ML models to path - for future use if needed
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml_models'))

from ..models.mongodb_models import ClassificationMetrics
from ..utils.mongodb_auth import get_current_user_mongo_by_token
from ..utils.dataset_classifier import dataset_classifier

router = APIRouter()
security = HTTPBearer()

def get_style_suggestions(style: str) -> list:
    """Return style-specific suggestions for artists"""
    suggestions = {
        "warli": [
            "Try using simple geometric shapes",
            "Focus on storytelling elements",
            "Use earthy colors like ochre and white",
            "Incorporate traditional tribal elements"
        ],
        "madhubani": [
            "Include more intricate patterns and borders",
            "Use vibrant colors with flat color fields",
            "Add symbolic elements like fish, peacocks, or lotus",
            "Consider geometric patterns with religious motifs"
        ],
        "pithora": [
            "Include mythological elements and deities",
            "Use bold outlines with bright colors",
            "Add more ceremonial figures and horses",
            "Consider ritual elements in your composition"
        ]
    }
    return suggestions.get(style, suggestions["warli"])  # Default to warli if unknown

@router.post("/classify")
async def classify_artwork(
    file: UploadFile = File(...),
    model_type: str = Form(default="standard"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Classifies uploaded artwork using dataset comparison.
    Compares uploaded image with reference images from the dataset.
    """
    try:
        current_user = await get_current_user_mongo_by_token(credentials.credentials)
        
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Read image data
        image_data = await file.read()
        
        # Use dataset-based classifier
        classification_result = dataset_classifier.classify_image(image_data, file.filename)
        
        predicted_style = classification_result['predicted_style']
        confidence_score = classification_result['confidence_score']

        result = {
            "predicted_style": predicted_style,
            "confidence_score": confidence_score,
            "model_version": classification_result.get('model_version', 'dataset-comparison-v1'),
            "style_scores": classification_result.get('style_scores', {}),
            "dataset_info": classification_result.get('dataset_counts', {})
        }

        # Save classification metrics to database to simulate model tracking
        try:
            metrics = ClassificationMetrics(
                model_version=result['model_version'],
                style=result['predicted_style'],
                confidence=result['confidence_score'],
                accuracy=result['confidence_score'],
                timestamp=datetime.utcnow(),
                user_id=str(current_user.id)
            )
            await metrics.save()
        except Exception as e:
            print(f"⚠️ Could not save metrics: {e}")
        
        result.update({
            'message': f'Image classified as {result["predicted_style"]} with {result["confidence_score"]:.1%} confidence',
            'suggestions': get_style_suggestions(result['predicted_style']),
            'user_id': str(current_user.id),
            'filename': file.filename
        })
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Classification error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")


@router.post("/enhance")
async def enhance_image(
    file: UploadFile = File(...),
    effects: list[str] = Form([]),
    strength: float = Form(0.6),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Image enhancement pipeline with various cool and creative effects.
    """
    try:
        await get_current_user_mongo_by_token(credentials.credentials)

        image_data = await file.read()
        img = Image.open(io.BytesIO(image_data)).convert('RGB')

        # Apply default enhancement if no effects selected
        if not effects:
            effects = ['default']
            
        # Apply selected effects
        if 'default' in effects:
            # Default enhancement with balanced adjustments
            img = img.filter(ImageFilter.MedianFilter(size=3))  # Light denoise
            img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=int(150*strength), threshold=3))
            contrast = ImageEnhance.Contrast(img)
            img = contrast.enhance(1.0 + 0.3*strength)
            color = ImageEnhance.Color(img)
            img = color.enhance(1.0 + 0.2*strength)
        
        if 'sharpen' in effects:
            img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=int(150*strength), threshold=3))
        
        if 'contrast' in effects:
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.0 + 0.4*strength)
        
        if 'brightness' in effects:
            enhancer = ImageEnhance.Brightness(img)
            img = enhancer.enhance(1.0 + 0.3*strength)
        
        if 'denoise' in effects:
            img = img.filter(ImageFilter.MedianFilter(size=3))
        
        if 'vintage' in effects:
            # Sepia effect with warm tones
            sepia = np.array(img.convert('L'))
            sepia = np.stack([sepia]*3, axis=-1)
            sepia[:,:,0] = (sepia[:,:,0]*1.1).clip(0,255)  # More red
            sepia[:,:,1] = (sepia[:,:,1]*0.9).clip(0,255)  # Less green
            sepia[:,:,2] = (sepia[:,:,2]*0.7).clip(0,255)  # Less blue
            img = Image.fromarray(sepia.astype('uint8'))
            
            # Add some grain for vintage feel
            if random.random() > 0.5:  # 50% chance of adding grain
                noise = np.random.normal(0, 10, (img.height, img.width, 3)).astype(np.uint8)
                noise_img = Image.fromarray(np.clip(np.array(img) + noise, 0, 255).astype(np.uint8))
                img = Image.blend(img, noise_img, 0.1)
        
        if 'vignette' in effects:
            # Create a dark vignette effect around edges
            width, height = img.size
            gradient = Image.new('L', (width, height), 0)
            draw = ImageDraw.Draw(gradient)
            radius = max(width, height) / 2
            for i in range(int(radius)):
                draw.ellipse((i, i, width - i, height - i), fill=255 - int(255 * i / radius))
            alpha = gradient.resize(img.size)
            black_image = Image.new(img.mode, img.size, 0)
            img = Image.composite(img, black_image, alpha)
        
        if 'sketch' in effects:
            # Create a pencil sketch effect
            img_gray = img.convert('L')
            img_gray_inv = ImageOps.invert(img_gray)
            img_blur = img_gray_inv.filter(ImageFilter.GaussianBlur(21))
            img_blend = Image.fromarray(np.uint8(np.clip(np.array(img_gray).astype('float') * 255 / (255.1 - np.array(img_blur).astype('float')), 0, 255)))
            img = img_blend.convert('RGB')
        
        if 'grayscale' in effects:
            img = ImageOps.grayscale(img).convert('RGB')
        
        if 'invert' in effects:
            img = ImageOps.invert(img)
            
        if 'posterize' in effects:
            # Reduce colors for poster/pop-art effect
            img = ImageOps.posterize(img, 3)
            
        if 'solarize' in effects:
            # Create solarize effect (invert all pixel values above threshold)
            img = ImageOps.solarize(img, threshold=80)
            
        if 'emboss' in effects:
            # Create embossed effect for texture
            img = img.filter(ImageFilter.EMBOSS)
            
        if 'watercolor' in effects:
            # Simulate watercolor painting effect
            blurred = img.filter(ImageFilter.GaussianBlur(2))
            img = Image.blend(img, blurred, 0.4)
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.2)
            color_enhancer = ImageEnhance.Color(img)
            img = color_enhancer.enhance(1.3)
            
        if 'oil_painting' in effects:
            # Create oil painting effect with reduced detail and smoothed colors
            img = img.filter(ImageFilter.ModeFilter(5))
            img = img.filter(ImageFilter.SMOOTH_MORE)
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(1.5)
            
        if 'comic' in effects:
            # Comic book style effect
            # Increase contrast and find edges
            enhancer = ImageEnhance.Contrast(img)
            img_contrast = enhancer.enhance(2.0)
            edges = img_contrast.filter(ImageFilter.FIND_EDGES)
            edges = edges.convert('L')
            
            # Posterize colors
            color_img = ImageOps.posterize(img, 4)
            
            # Blend edges with color image
            edges_inv = ImageOps.invert(edges)
            img = Image.composite(color_img, Image.new('RGB', img.size, (0,0,0)), edges_inv)

        # Save and return the enhanced image
        ts = datetime.now().strftime('%Y%m%d_%H%M%S')
        out_dir = 'uploads/enhancements'
        os.makedirs(out_dir, exist_ok=True)
        
        # Create a short effects summary for the filename
        effect_summary = '_'.join([e[:5] for e in effects[:3]]) if effects else 'default'
        if len(effects) > 3:
            effect_summary += f"_plus{len(effects)-3}"
            
        out_name = f"enhanced_{ts}_{effect_summary}.jpg"
        out_path = os.path.join(out_dir, out_name)
        img.save(out_path, quality=95)

        # Create base64 preview for frontend display
        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=92)
        b64 = base64.b64encode(buf.getvalue()).decode('utf-8')

        return {
            'status': 'completed',
            'message': f'Image enhanced with: {", ".join(effects)}',
            'effects_applied': effects,
            'strength_used': strength,
            'output_url': f"/uploads/enhancements/{out_name}",
            'image_base64': f"data:image/jpeg;base64,{b64}",
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Enhance error: {e}")
        raise HTTPException(status_code=500, detail=f"Enhancement failed: {e}")


@router.get("/classification-metrics")
async def get_classification_metrics(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get classification performance metrics (simulated)"""
    try:
        await get_current_user_mongo_by_token(credentials.credentials)
        
        metrics = await ClassificationMetrics.find().to_list()
        
        if not metrics:
            return {
                "total_classifications": 0,
                "average_confidence": 0.0,
                "style_distribution": {},
                "recent_classifications": []
            }
        
        total_classifications = len(metrics)
        average_confidence = sum(m.confidence for m in metrics) / total_classifications if total_classifications > 0 else 0
        
        style_distribution = {}
        for metric in metrics:
            style = metric.style
            style_distribution[style] = style_distribution.get(style, 0) + 1
        
        recent_metrics = sorted(metrics, key=lambda x: x.timestamp, reverse=True)[:10]
        recent_classifications = [
            {
                "style": m.style,
                "confidence": m.confidence,
                "timestamp": m.timestamp,
                "user_id": str(m.user_id) if m.user_id else "N/A"
            }
            for m in recent_metrics
        ]
        
        return {
            "total_classifications": total_classifications,
            "average_confidence": average_confidence,
            "style_distribution": style_distribution,
            "recent_classifications": recent_classifications
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Metrics error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {e}")
