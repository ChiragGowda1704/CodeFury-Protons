from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Optional
import os
import shutil
from datetime import datetime
import uuid
from app.models.mongodb_models import User, UserProfile, Artwork, Order
from app.utils.mongodb_auth import get_current_user_mongo

router = APIRouter()

@router.get("/")
async def get_profile(current_user: User = Depends(get_current_user_mongo)):
    """Get user profile information"""
    try:
        user_id = str(current_user.id)
        
        # Get or create user profile
        profile = await UserProfile.find_one(UserProfile.user_id == user_id)
        if not profile:
            # Create a new profile if none exists
            profile = UserProfile(user_id=user_id)
            await profile.save()
        
        # Get user's artworks
        artworks = await Artwork.find(Artwork.user_id == user_id).to_list()
        
        # Get user's orders
        orders = await Order.find(Order.user_id == user_id).to_list()
        
        # Calculate statistics
        uploads_count = len(artworks)
        sold_artworks = sum(1 for artwork in artworks if artwork.sold)
        
        # Calculate total revenue
        total_revenue = 0
        for order in orders:
            for item in order.items:
                if item.get("artist_id") == user_id:
                    total_revenue += item.get("item_total", 0)
        
        return {
            "user": {
                "id": str(current_user.id),
                "username": current_user.username,
                "email": current_user.email,
                "badges": current_user.badges,
                "total_uploads": current_user.total_uploads,
                "created_at": current_user.created_at
            },
            "profile": {
                "id": str(profile.id) if profile else None,
                "full_name": profile.full_name if profile else None,
                "bio": profile.bio if profile else None,
                "profile_picture_url": profile.profile_picture_url if profile else None,
                "location": profile.location if profile else None
            },
            "stats": {
                "uploads": uploads_count,
                "sold_artworks": sold_artworks,
                "total_revenue": total_revenue
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")

@router.post("/update")
async def update_profile(
    full_name: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    profile_picture: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user_mongo)
):
    """Update user profile information"""
    try:
        user_id = str(current_user.id)
        
        # Get or create user profile
        profile = await UserProfile.find_one(UserProfile.user_id == user_id)
        if not profile:
            profile = UserProfile(user_id=user_id)
        
        # Update fields if provided
        if full_name is not None:
            profile.full_name = full_name
            
        if bio is not None:
            profile.bio = bio
            
        if location is not None:
            profile.location = location
            
        # Process profile picture if uploaded
        if profile_picture:
            # Create uploads directory if it doesn't exist
            os.makedirs('uploads/profiles', exist_ok=True)
            
            # Generate unique filename
            file_ext = profile_picture.filename.split('.')[-1]
            unique_filename = f"{uuid.uuid4()}.{file_ext}"
            file_path = f"uploads/profiles/{unique_filename}"
            
            # Save uploaded file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(profile_picture.file, buffer)
            
            # Update profile with picture URL
            profile.profile_picture_url = f"/uploads/profiles/{unique_filename}"
            
        # Save updated profile
        await profile.save()
        
        return {
            "message": "Profile updated successfully",
            "profile": {
                "id": str(profile.id),
                "full_name": profile.full_name,
                "bio": profile.bio,
                "profile_picture_url": profile.profile_picture_url,
                "location": profile.location
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")
