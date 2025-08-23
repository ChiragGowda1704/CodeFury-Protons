#!/usr/bin/env python3

import asyncio
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent
sys.path.append(str(backend_path))

from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime
from bson import ObjectId

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def fix_database():
    """Clean database and create proper test data"""
    
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.artist_showcase
    
    print("🧹 Cleaning database...")
    
    # Drop all collections to start fresh
    await db.users.drop()
    await db.artworks.drop() 
    await db.classification_metrics.drop()
    await db.style_transfer_logs.drop()
    
    print("✅ Database cleaned")
    
    # Create demo user
    print("👤 Creating demo user...")
    demo_user_id = ObjectId()
    hashed_password = pwd_context.hash("demo123")
    
    demo_user = {
        "_id": demo_user_id,
        "username": "demo",
        "email": "demo@example.com", 
        "hashed_password": hashed_password,
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(demo_user)
    print(f"✅ Demo user created with ID: {demo_user_id}")
    
    # Create sample artworks with proper string IDs
    print("🎨 Creating sample artworks...")
    artworks = [
        {
            "_id": ObjectId(),
            "title": "Traditional Madhubani Art",
            "description": "Beautiful folk art from Bihar",
            "filename": "madhubani_sample.jpg", 
            "file_path": "/uploads/madhubani_sample.jpg",
            "predicted_style": "madhubani",
            "confidence_score": 0.95,
            "user_id": str(demo_user_id),  # Store as string
            "created_at": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "title": "Warli Tribal Art",
            "description": "Traditional tribal art from Maharashtra", 
            "filename": "warli_sample.jpg",
            "file_path": "/uploads/warli_sample.jpg",
            "predicted_style": "warli",
            "confidence_score": 0.88,
            "user_id": str(demo_user_id),  # Store as string
            "created_at": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "title": "Modern Abstract Art",
            "description": "Contemporary abstract painting",
            "filename": "modern_sample.jpg",
            "file_path": "/uploads/modern_sample.jpg", 
            "predicted_style": "others",
            "confidence_score": 0.76,
            "user_id": str(demo_user_id),  # Store as string
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.artworks.insert_many(artworks)
    print(f"✅ Created {len(artworks)} sample artworks")
    
    # Create proper classification metrics
    print("📊 Creating classification metrics...")
    
    # Individual prediction metrics
    prediction_metrics = [
        {
            "_id": ObjectId(),
            "model_version": "CNN_v1.0",  # Required field
            "accuracy": 0.87,  # Required field  
            "style": "madhubani",
            "confidence": 0.95,
            "image_path": "/uploads/madhubani_sample.jpg",
            "all_predictions": {
                "madhubani": 0.95,
                "warli": 0.03,
                "others": 0.02
            },
            "timestamp": datetime.utcnow(),
            "created_at": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "model_version": "CNN_v1.0",  # Required field
            "accuracy": 0.87,  # Required field
            "style": "warli", 
            "confidence": 0.88,
            "image_path": "/uploads/warli_sample.jpg",
            "all_predictions": {
                "madhubani": 0.05,
                "warli": 0.88,
                "others": 0.07
            },
            "timestamp": datetime.utcnow(),
            "created_at": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "model_version": "CNN_v1.0",  # Required field
            "accuracy": 0.87,  # Required field
            "style": "others",
            "confidence": 0.76,
            "image_path": "/uploads/modern_sample.jpg", 
            "all_predictions": {
                "madhubani": 0.12,
                "warli": 0.12,
                "others": 0.76
            },
            "timestamp": datetime.utcnow(),
            "created_at": datetime.utcnow()
        }
    ]
    
    # Overall model performance metrics
    overall_metrics = {
        "_id": ObjectId(),
        "model_version": "CNN_v1.0",  # Required field
        "accuracy": 0.87,  # Required field (overall model accuracy)
        "style": None,  # Not for individual prediction
        "confidence": None,  # Not for individual prediction
        "image_path": None,
        "all_predictions": None,
        "timestamp": datetime.utcnow(),
        
        # Per-class metrics
        "precision_folk_art": 0.89,
        "precision_modern_art": 0.83,
        "precision_classical_art": 0.91,
        "recall_folk_art": 0.85,
        "recall_modern_art": 0.88,
        "recall_classical_art": 0.89,
        "f1_folk_art": 0.87,
        "f1_modern_art": 0.85,
        "f1_classical_art": 0.90,
        "created_at": datetime.utcnow()
    }
    
    all_metrics = prediction_metrics + [overall_metrics]
    await db.classification_metrics.insert_many(all_metrics)
    print(f"✅ Created {len(all_metrics)} classification metrics")
    
    # Create style transfer logs
    print("🎭 Creating style transfer logs...")
    transfer_logs = [
        {
            "_id": ObjectId(),
            "input_image_path": "/uploads/input1.jpg",
            "output_image_path": "/uploads/styled_output1.jpg", 
            "target_style": "madhubani",
            "transfer_score": 0.82,
            "processing_time": 4.5,
            "user_id": str(demo_user_id),  # Store as string
            "created_at": datetime.utcnow()
        },
        {
            "_id": ObjectId(),
            "input_image_path": "/uploads/input2.jpg",
            "output_image_path": "/uploads/styled_output2.jpg",
            "target_style": "warli", 
            "transfer_score": 0.78,
            "processing_time": 3.8,
            "user_id": str(demo_user_id),  # Store as string
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.style_transfer_logs.insert_many(transfer_logs)
    print(f"✅ Created {len(transfer_logs)} style transfer logs")
    
    # Create indexes for better performance
    print("🗂️ Creating indexes...")
    await db.users.create_index("username", unique=True)
    await db.users.create_index("email", unique=True)
    await db.artworks.create_index("user_id")
    await db.artworks.create_index("predicted_style")
    await db.artworks.create_index("created_at")
    await db.classification_metrics.create_index("model_version")
    await db.classification_metrics.create_index("style")
    await db.classification_metrics.create_index("created_at")
    await db.style_transfer_logs.create_index("user_id")
    await db.style_transfer_logs.create_index("target_style")
    await db.style_transfer_logs.create_index("created_at")
    
    print("✅ Indexes created")
    
    # Verify data
    print("\n🔍 Verifying data...")
    user_count = await db.users.count_documents({})
    artwork_count = await db.artworks.count_documents({})
    metrics_count = await db.classification_metrics.count_documents({})
    logs_count = await db.style_transfer_logs.count_documents({})
    
    print(f"👥 Users: {user_count}")
    print(f"🎨 Artworks: {artwork_count}")
    print(f"📊 Metrics: {metrics_count}")
    print(f"🎭 Transfer logs: {logs_count}")
    
    # Test login
    print(f"\n🔐 Test login credentials:")
    print(f"Username: demo")
    print(f"Password: demo123")
    print(f"Email: demo@example.com")
    
    client.close()
    print("\n✅ Database setup complete!")

if __name__ == "__main__":
    asyncio.run(fix_database())
