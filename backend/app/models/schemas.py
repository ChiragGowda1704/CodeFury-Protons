# Pydantic models for API request/response schemas

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Any
from datetime import datetime
from bson import ObjectId

# User Authentication Models
class UserCreate(BaseModel):
    """Schema for user registration"""
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    """Schema for user login"""
    username: str
    password: str

class User(BaseModel):
    """Schema for user response"""
    id: str = Field(..., description="User ID")
    username: str
    email: str
    created_at: datetime
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Schema for token data"""
    username: Optional[str] = None

# Artwork Models
class ArtworkCreate(BaseModel):
    """Schema for artwork upload"""
    title: str
    description: Optional[str] = None

class Artwork(BaseModel):
    """Schema for artwork response"""
    id: str = Field(..., description="Artwork ID")
    title: str
    description: Optional[str]
    filename: str
    file_path: str
    predicted_style: Optional[str]
    confidence_score: Optional[float]
    user_id: str
    created_at: datetime
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

# ML Model Response Schemas
class ClassificationResult(BaseModel):
    """Schema for art style classification result"""
    predicted_style: str
    confidence_score: float
    all_predictions: dict

class StyleTransferRequest(BaseModel):
    """Schema for style transfer request"""
    target_style: str

class StyleTransferResult(BaseModel):
    """Schema for style transfer result"""
    output_image_path: str
    transfer_score: float
    processing_time: float

# Dashboard Models
class DashboardMetrics(BaseModel):
    """Schema for dashboard metrics"""
    total_artworks: int
    total_users: int
    classification_accuracy: float
    style_distribution: dict
    recent_uploads: List[Artwork]

class ConfusionMatrixData(BaseModel):
    """Schema for confusion matrix data"""
    matrix: List[List[int]]
    labels: List[str]
    accuracy: float
