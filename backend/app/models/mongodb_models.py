# MongoDB models using Beanie (async ODM)

from beanie import Document, Link
from pydantic import Field, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional, Dict, List
from bson import ObjectId
from enum import Enum

class BadgeType(str, Enum):
    PREMIUM = "premium"  # 3+ uploads
    GOLD = "gold"        # 5+ uploads
    DIAMOND = "diamond"  # 10+ uploads

class User(Document):
    """User document for authentication"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr = Field(...)
    hashed_password: str
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # Premium badge system
    badges: List[BadgeType] = Field(default_factory=list)
    total_uploads: int = Field(default=0)
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    class Settings:
        name = "users"
        # Remove indexes temporarily to avoid conflicts
        # indexes = [
        #     "username",
        #     "email",
        # ]

class Artwork(Document):
    """Artwork document for storing uploaded art pieces"""
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    filename: str
    file_path: str
    predicted_style: Optional[str] = None
    confidence_score: Optional[float] = None
    user_id: str = Field(..., description="Reference to User document ID")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # Shopping functionality
    price: Optional[float] = Field(default=0.0, description="Price in INR")
    is_for_sale: bool = Field(default=True, description="Whether artwork is available for purchase")
    sold: bool = Field(default=False)
    artist_name: Optional[str] = None
    # Likes functionality
    likes: List[str] = Field(default_factory=list, description="List of user IDs who liked this artwork")
    like_count: int = Field(default=0, description="Total number of likes")
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    class Settings:
        name = "artworks"
        # Remove indexes temporarily
        # indexes = [
        #     "user_id",
        #     "predicted_style",
        #     "created_at",
        # ]

class ClassificationMetrics(Document):
    """Document to store classification model metrics"""
    model_version: str
    accuracy: float
    style: Optional[str] = None  # For individual predictions
    confidence: Optional[float] = None  # For individual predictions
    user_id: Optional[str] = None  # User who triggered the classification
    image_path: Optional[str] = None
    all_predictions: Optional[Dict[str, float]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # Overall model metrics
    precision_folk_art: Optional[float] = None
    precision_modern_art: Optional[float] = None
    precision_classical_art: Optional[float] = None
    recall_folk_art: Optional[float] = None
    recall_modern_art: Optional[float] = None
    recall_classical_art: Optional[float] = None
    f1_folk_art: Optional[float] = None
    f1_modern_art: Optional[float] = None
    f1_classical_art: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    class Settings:
        name = "classification_metrics"
        indexes = [
            "model_version",
            "style",
            "created_at",
            "timestamp",
        ]



class CartItem(Document):
    """Shopping cart item"""
    user_id: str = Field(..., description="Reference to User document ID")
    artwork_id: str = Field(..., description="Reference to Artwork document ID")
    quantity: int = Field(default=1)
    added_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    class Settings:
        name = "cart_items"
        indexes = [
            "user_id",
            "artwork_id",
        ]

class Order(Document):
    """Order information for purchased artworks"""
    user_id: str = Field(..., description="Reference to User document ID")
    items: List[Dict] = Field(..., description="List of purchased items with details")
    total_amount: float = Field(..., description="Total order amount")
    shipping_address: Dict = Field(..., description="Shipping address details")
    payment_method: str = Field(..., description="Payment method used")
    order_status: str = Field(default="pending", description="Order status")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    class Settings:
        name = "orders"
        indexes = [
            "user_id",
            "created_at",
            "order_status"
        ]

class UserProfile(Document):
    """Extended user profile information"""
    user_id: str = Field(..., description="Reference to User document ID")
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None
    location: Optional[str] = None
    
    class Settings:
        name = "user_profiles"
        indexes = ["user_id"]
