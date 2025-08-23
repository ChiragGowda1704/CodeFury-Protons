# Database models using SQLAlchemy

from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    """User table for authentication"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship to artworks
    artworks = relationship("Artwork", back_populates="user")

class Artwork(Base):
    """Artwork table for storing uploaded art pieces"""
    __tablename__ = "artworks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    predicted_style = Column(String(100), nullable=True)
    confidence_score = Column(Float, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship to user
    user = relationship("User", back_populates="artworks")

class ClassificationMetrics(Base):
    """Table to store classification model metrics"""
    __tablename__ = "classification_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    model_version = Column(String(50), nullable=False)
    accuracy = Column(Float, nullable=False)
    precision_warli = Column(Float, nullable=True)
    precision_madhubani = Column(Float, nullable=True)
    precision_pithora = Column(Float, nullable=True)
    recall_warli = Column(Float, nullable=True)
    recall_madhubani = Column(Float, nullable=True)
    recall_pithora = Column(Float, nullable=True)
    f1_warli = Column(Float, nullable=True)
    f1_madhubani = Column(Float, nullable=True)
    f1_pithora = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StyleTransferLog(Base):
    """Table to log style transfer operations"""
    __tablename__ = "style_transfer_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    input_image_path = Column(String(500), nullable=False)
    output_image_path = Column(String(500), nullable=False)
    target_style = Column(String(100), nullable=False)
    transfer_score = Column(Float, nullable=True)
    processing_time = Column(Float, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
