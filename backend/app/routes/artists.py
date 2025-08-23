from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.models.mongodb_models import User, Artwork, BadgeType
from app.utils.mongodb_auth import get_current_user_mongo

router = APIRouter()

@router.get("/list")
async def get_artists():
    """Get a list of all artists with their badges"""
    try:
        # Get all users who have uploaded artwork
        artists = await User.find_all().project({
            "username": 1, 
            "badges": 1, 
            "total_uploads": 1,
            "created_at": 1
        }).to_list()
        
        # Format the response
        artist_list = []
        for artist in artists:
            # Skip users with no uploads
            if artist.total_uploads == 0:
                continue
                
            artist_list.append({
                "id": str(artist.id),
                "username": artist.username,
                "badges": artist.badges,
                "total_uploads": artist.total_uploads,
                "joined": artist.created_at
            })
        
        return artist_list
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching artists: {str(e)}")
        
@router.get("/{artist_id}/artworks")
async def get_artist_artworks(artist_id: str):
    """Get artworks by a specific artist"""
    try:
        # Verify artist exists
        artist = await User.get(artist_id)
        if not artist:
            raise HTTPException(status_code=404, detail="Artist not found")
            
        # Get artist's artworks
        artworks = await Artwork.find(Artwork.user_id == artist_id).to_list()
        
        # Format response
        artwork_list = []
        for artwork in artworks:
            artwork_list.append({
                "id": str(artwork.id),
                "title": artwork.title,
                "description": artwork.description,
                "filename": artwork.filename,
                "file_path": artwork.file_path,
                "predicted_style": artwork.predicted_style,
                "confidence_score": artwork.confidence_score,
                "price": artwork.price,
                "is_for_sale": artwork.is_for_sale,
                "sold": artwork.sold,
                "created_at": artwork.created_at
            })
        
        return {
            "artist": {
                "id": str(artist.id),
                "username": artist.username,
                "badges": artist.badges,
                "total_uploads": artist.total_uploads
            },
            "artworks": artwork_list
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching artist artworks: {str(e)}")
