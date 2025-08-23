# Upload routes - File upload functionality

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import Optional
from datetime import datetime
import os
import sys
import shutil
from pathlib import Path
import requests

# Add ML models to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml_models'))

from ..models.mongodb_models import User, Artwork, ClassificationMetrics, BadgeType
from ..utils.mongodb_auth import get_current_user_mongo, get_current_user_mongo_by_token
from ..utils.dataset_classifier import dataset_classifier
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer()
router = APIRouter()

def validate_image_file(file: UploadFile):
    """Validate uploaded image file"""
    if not file.content_type or not file.content_type.startswith('image/'):
        # Check file extension as fallback
        if file.filename and not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            raise HTTPException(status_code=400, detail="File must be an image")
        print("⚠️ Content type validation skipped for upload, using filename extension")
    
    if file.size and file.size > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large")

def save_uploaded_file(file: UploadFile) -> str:
    """Save uploaded file to disk"""
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    
    file_path = upload_dir / file.filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return str(file_path)

@router.post("/artwork")
async def upload_artwork(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    price: Optional[float] = Form(500.0),  # Default price in INR
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Upload artwork with automatic classification and pricing"""
    try:
        # Verify user authentication
        current_user = await get_current_user_mongo_by_token(credentials.credentials)
        
        # Validate file
        validate_image_file(file)
        
        # Save uploaded file
        file_path = save_uploaded_file(file)
        
        # Classify the uploaded image automatically using dataset-based classification
        predicted_style = "warli"  # default
        confidence_score = 0.0
        
        try:
            # Reset file position and read image data
            await file.seek(0)
            image_data = await file.read()
            
            # Use dataset-based classifier
            print("🎨 Using dataset-based classifier for upload")
            classification_result = dataset_classifier.classify_image(image_data, file.filename)
            
            predicted_style = classification_result['predicted_style']
            confidence_score = classification_result['confidence_score']
            
            print(f"🎨 Auto-classified upload as: {predicted_style} ({confidence_score:.3f})")
            
            # Save classification metrics
            try:
                metrics = ClassificationMetrics(
                    model_version=classification_result.get('model_version', 'dataset-upload-v1'),
                    style=predicted_style,
                    confidence=confidence_score,
                    accuracy=confidence_score,  # Use confidence as accuracy proxy
                    timestamp=datetime.utcnow(),
                    user_id=str(current_user.id)
                )
                await metrics.save()
            except Exception as e:
                print(f"⚠️ Could not save classification metrics: {e}")
                
        except Exception as e:
            print(f"⚠️ Classification failed during upload: {e}")
            # Use default values
        
        # Create artwork record in database with classification
        artwork = Artwork(
            title=title,
            description=description,
            filename=file.filename,
            file_path=file_path,
            predicted_style=predicted_style,
            confidence_score=confidence_score,
            user_id=str(current_user.id),
            created_at=datetime.utcnow(),
            price=price if price and price > 0 else 500.0,  # Default price in INR
            is_for_sale=True,
            artist_name=current_user.username,  # Use current user's username as artist name
            likes=[],  # Initialize empty likes
            like_count=0  # Initialize like count
        )
        
        # Save to MongoDB
        await artwork.save()
        
        # Update user's upload count and badge system
        current_user.total_uploads += 1
        
        # Award badges based on upload count (only for 3+ uploads)
        if current_user.total_uploads >= 10 and BadgeType.DIAMOND not in current_user.badges:
            current_user.badges.append(BadgeType.DIAMOND)
            print(f"🏆 Awarded DIAMOND badge to {current_user.username} for {current_user.total_uploads} uploads")
        elif current_user.total_uploads >= 5 and BadgeType.GOLD not in current_user.badges:
            current_user.badges.append(BadgeType.GOLD)
            print(f"🏆 Awarded GOLD badge to {current_user.username} for {current_user.total_uploads} uploads")
        elif current_user.total_uploads >= 3 and BadgeType.PREMIUM not in current_user.badges:
            current_user.badges.append(BadgeType.PREMIUM)
            print(f"🏆 Awarded PREMIUM badge to {current_user.username} for {current_user.total_uploads} uploads")
        
        await current_user.save()
        
        # Return response
        artwork_dict = {
            "id": str(artwork.id),
            "title": artwork.title,
            "description": artwork.description,
            "filename": artwork.filename,
            "file_path": artwork.file_path,
            "predicted_style": artwork.predicted_style,
            "confidence_score": artwork.confidence_score,
            "user_id": str(artwork.user_id),
            "created_at": artwork.created_at.isoformat() if artwork.created_at else None,
            "price": artwork.price,
            "is_for_sale": artwork.is_for_sale,
            "artist_name": artwork.artist_name,
            "user_badges": current_user.badges,
            "total_uploads": current_user.total_uploads
        }
        
        return artwork_dict
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/user-artworks")
async def get_user_artworks(
    current_user: User = Depends(get_current_user_mongo)
):
    """Get artworks uploaded by current user"""
    try:
        # Get user's artworks
        artworks = await Artwork.find(Artwork.user_id == str(current_user.id)).sort("-created_at").to_list()
        
        # Convert to response format
        result = []
        for artwork in artworks:
            artwork_dict = {
                "id": str(artwork.id),
                "title": artwork.title,
                "description": artwork.description,
                "filename": artwork.filename,
                "file_path": artwork.file_path,
                "predicted_style": artwork.predicted_style,
                "confidence_score": artwork.confidence_score,
                "user_id": str(artwork.user_id),
                "created_at": artwork.created_at.isoformat() if artwork.created_at else None,
                "price": artwork.price,
                "is_for_sale": artwork.is_for_sale,
                "artist_name": artwork.artist_name
            }
            result.append(artwork_dict)
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ User artworks error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch user artworks: {str(e)}")
