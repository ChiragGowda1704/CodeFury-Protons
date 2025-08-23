# Gallery routes - Browse and explore artworks

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional

from ..models.mongodb_models import Artwork, User
from ..utils.mongodb_auth import get_current_user_mongo_by_token, get_current_user_mongo
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer()
router = APIRouter()

@router.get("/artworks")
async def get_all_artworks(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    style_filter: Optional[str] = Query(None)
):
    """Get all artworks with pagination and optional style filtering"""
    try:
        # Build query - only show artworks for sale
        query = {"is_for_sale": True, "sold": False}
        if style_filter:
            query["predicted_style"] = style_filter
        
        # Get artworks with pagination, ordered by creation date (newest first)
        artworks = await Artwork.find(query).sort("-created_at").skip(skip).limit(limit).to_list()
        
        # Convert to response format with artist info
        result = []
        for artwork in artworks:
            # Get artist info
            artist = await User.get(artwork.user_id)
            
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
                "artist_name": artwork.artist_name or (artist.username if artist else "Unknown"),
                "artist_badges": artist.badges if artist else [],
                "like_count": artwork.like_count or 0,
                "likes": artwork.likes or []
            }
            result.append(artwork_dict)
        
        return result
    except Exception as e:
        print(f"❌ Gallery error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch artworks: {str(e)}")

@router.get("/artworks/recent")
async def get_recent_artworks(
    limit: int = Query(5, ge=1, le=20)
):
    """Get recently uploaded artworks"""
    try:
        # Get recent artworks that are for sale
        artworks = await Artwork.find({"is_for_sale": True, "sold": False}).sort("-created_at").limit(limit).to_list()
        
        # Convert to response format with artist info
        result = []
        for artwork in artworks:
            # Get artist info
            artist = await User.get(artwork.user_id)
            
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
                "artist_name": artwork.artist_name or (artist.username if artist else "Unknown"),
                "artist_badges": artist.badges if artist else [],
                "like_count": artwork.like_count or 0,
                "likes": artwork.likes or []
            }
            result.append(artwork_dict)
        
        return result
    except Exception as e:
        print(f"❌ Recent artworks error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch recent artworks: {str(e)}")

@router.get("/artworks/{artwork_id}")
async def get_artwork_by_id(artwork_id: str):
    """Get a specific artwork by ID"""
    try:
        artwork = await Artwork.get(artwork_id)
        if not artwork:
            raise HTTPException(status_code=404, detail="Artwork not found")
        
        artwork_dict = {
            "id": str(artwork.id),
            "title": artwork.title,
            "description": artwork.description,
            "filename": artwork.filename,
            "file_path": artwork.file_path,
            "predicted_style": artwork.predicted_style,
            "confidence_score": artwork.confidence_score,
            "user_id": str(artwork.user_id),
            "created_at": artwork.created_at.isoformat() if artwork.created_at else None
        }
        
        return artwork_dict
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Artwork fetch error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch artwork: {str(e)}")

@router.get("/artworks/user/{user_id}")
async def get_user_artworks(
    user_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    """Get artworks by a specific user"""
    try:
        # Get user artworks
        artworks = await Artwork.find(Artwork.user_id == user_id).sort("-created_at").skip(skip).limit(limit).to_list()
        
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
                "like_count": artwork.like_count or 0,
                "likes": artwork.likes or []
            }
            result.append(artwork_dict)
        
        return result
    except Exception as e:
        print(f"❌ User artworks error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch user artworks: {str(e)}")

@router.get("/styles")
async def get_artwork_styles():
    """Get list of available art styles"""
    try:
        # Get distinct styles from database
        styles = await Artwork.distinct("predicted_style")
        # Filter out None values
        styles = [style for style in styles if style is not None]
        return {"styles": styles}
    except Exception as e:
        print(f"❌ Styles error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch styles: {str(e)}")

@router.get("/stats")
async def get_gallery_stats():
    """Get gallery statistics"""
    try:
        total_artworks = await Artwork.count()
        styles = await Artwork.distinct("predicted_style")
        styles_count = len([style for style in styles if style is not None])
        
        # Get style distribution
        style_stats = {}
        for style in styles:
            if style:
                count = await Artwork.find(Artwork.predicted_style == style).count()
                style_stats[style] = count
        
        return {
            "total_artworks": total_artworks,
            "total_styles": styles_count,
            "style_distribution": style_stats
        }
    except Exception as e:
        print(f"❌ Stats error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")

@router.get("/artists")
async def get_all_artists():
    """Get all artists with their badges and stats"""
    try:
        artists = await User.find(User.total_uploads > 0).sort("-total_uploads").to_list()
        
        result = []
        for artist in artists:
            # Calculate total likes across all artworks by this artist
            artist_artworks = await Artwork.find(Artwork.user_id == str(artist.id)).to_list()
            total_likes = sum(artwork.like_count or 0 for artwork in artist_artworks)
            
            result.append({
                "id": str(artist.id),
                "username": artist.username,
                "badges": artist.badges,
                "total_uploads": artist.total_uploads,
                "total_likes": total_likes,
                "created_at": artist.created_at.isoformat() if artist.created_at else None
            })
        
        return result
    except Exception as e:
        print(f"❌ Artists error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch artists: {str(e)}")

@router.post("/artworks/{artwork_id}/like")
async def like_artwork(
    artwork_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Like or unlike an artwork"""
    try:
        # Get current user
        current_user = await get_current_user_mongo_by_token(credentials.credentials)
        
        # Get artwork
        artwork = await Artwork.get(artwork_id)
        if not artwork:
            raise HTTPException(status_code=404, detail="Artwork not found")
        
        # Initialize likes if not present
        if not hasattr(artwork, 'likes') or artwork.likes is None:
            artwork.likes = []
        if not hasattr(artwork, 'like_count') or artwork.like_count is None:
            artwork.like_count = 0
        
        user_id = str(current_user.id)
        
        # Toggle like
        if user_id in artwork.likes:
            # Unlike
            artwork.likes.remove(user_id)
            artwork.like_count = max(0, artwork.like_count - 1)
            liked = False
        else:
            # Like
            artwork.likes.append(user_id)
            artwork.like_count += 1
            liked = True
        
        # Save artwork
        await artwork.save()
        
        return {
            "liked": liked,
            "like_count": artwork.like_count,
            "message": "Liked" if liked else "Unliked"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Like artwork error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to like artwork: {str(e)}")

@router.delete("/artworks/{artwork_id}")
async def delete_artwork(
    artwork_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Delete an artwork (only by owner)"""
    try:
        # Get current user
        current_user = await get_current_user_mongo_by_token(credentials.credentials)
        
        # Get artwork
        artwork = await Artwork.get(artwork_id)
        if not artwork:
            raise HTTPException(status_code=404, detail="Artwork not found")
        
        # Check if user owns this artwork
        if str(artwork.user_id) != str(current_user.id):
            raise HTTPException(status_code=403, detail="You can only delete your own artworks")
        
        # Delete the artwork file if it exists
        import os
        if artwork.file_path and os.path.exists(artwork.file_path):
            try:
                os.remove(artwork.file_path)
            except Exception as e:
                print(f"⚠️ Could not delete file {artwork.file_path}: {e}")
        
        # Delete from database
        await artwork.delete()
        
        # Update user's upload count
        current_user.total_uploads = max(0, current_user.total_uploads - 1)
        await current_user.save()
        
        return {"message": "Artwork deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Delete artwork error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete artwork: {str(e)}")

