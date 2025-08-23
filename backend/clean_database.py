#!/usr/bin/env python3
"""
Clean and fix the MongoDB database
"""

import asyncio
import motor.motor_asyncio
from pymongo.errors import DuplicateKeyError
from bson import ObjectId
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = "artist_showcase"

async def clean_database():
    """Clean and fix the database"""
    print("🧹 Starting database cleanup...")
    
    # Connect to MongoDB
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
    db = client[DATABASE_NAME]
    
    try:
        # Drop all collections and start fresh
        collections = await db.list_collection_names()
        print(f"Found collections: {collections}")
        
        for collection_name in collections:
            await db[collection_name].drop()
            print(f"✅ Dropped collection: {collection_name}")
        
        # Create fresh collections with proper indexes
        print("\n📦 Creating fresh collections...")
        
        # Users collection
        users_collection = db.users
        await users_collection.create_index("username", unique=True)
        await users_collection.create_index("email", unique=True)
        print("✅ Created users collection with indexes")
        
        # Artworks collection  
        artworks_collection = db.artworks
        await artworks_collection.create_index([("created_at", -1)])
        await artworks_collection.create_index("user_id")
        await artworks_collection.create_index("predicted_style")
        print("✅ Created artworks collection with indexes")
        
        # Classification metrics collection
        metrics_collection = db.classification_metrics
        await metrics_collection.create_index([("timestamp", -1)])
        print("✅ Created classification_metrics collection with indexes")
        
        # Style transfer logs collection
        logs_collection = db.style_transfer_logs
        await logs_collection.create_index([("timestamp", -1)])
        await logs_collection.create_index("user_id")
        print("✅ Created style_transfer_logs collection with indexes")
        
        # Insert demo user with proper ObjectId
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        demo_user_id = ObjectId()
        demo_user = {
            "_id": demo_user_id,
            "username": "demo",
            "email": "demo@example.com",
            "hashed_password": pwd_context.hash("demo123"),
            "is_active": True,
            "created_at": "2025-08-23T00:00:00"
        }
        
        await users_collection.insert_one(demo_user)
        print(f"✅ Created demo user with ID: {demo_user_id}")
        
        # Insert sample classification metrics with proper structure
        sample_metrics = [
            {
                "_id": ObjectId(),
                "style": "madhubani",
                "confidence_score": 0.95,
                "timestamp": "2025-08-23T10:00:00",
                "user_id": str(demo_user_id)
            },
            {
                "_id": ObjectId(),
                "style": "warli", 
                "confidence_score": 0.88,
                "timestamp": "2025-08-23T11:00:00",
                "user_id": str(demo_user_id)
            },
            {
                "_id": ObjectId(),
                "style": "others",
                "confidence_score": 0.72,
                "timestamp": "2025-08-23T12:00:00", 
                "user_id": str(demo_user_id)
            }
        ]
        
        await metrics_collection.insert_many(sample_metrics)
        print(f"✅ Inserted {len(sample_metrics)} sample classification metrics")
        
        # Insert sample artworks with all required fields
        sample_artworks = [
            {
                "_id": ObjectId(),
                "title": "Sample Madhubani Art",
                "description": "Beautiful traditional Madhubani painting with intricate patterns",
                "filename": "madhubani_sample.jpg",
                "file_path": "/uploads/madhubani_sample.jpg",
                "predicted_style": "madhubani",
                "confidence_score": 0.95,
                "user_id": str(demo_user_id),
                "created_at": "2025-08-23T10:00:00"
            },
            {
                "_id": ObjectId(),
                "title": "Sample Warli Art", 
                "description": "Traditional Warli tribal art with geometric patterns",
                "filename": "warli_sample.jpg",
                "file_path": "/uploads/warli_sample.jpg",
                "predicted_style": "warli",
                "confidence_score": 0.88,
                "user_id": str(demo_user_id),
                "created_at": "2025-08-23T11:00:00"
            },
            {
                "_id": ObjectId(),
                "title": "Sample Modern Art",
                "description": "Contemporary artistic expression with modern elements", 
                "filename": "modern_sample.jpg",
                "file_path": "/uploads/modern_sample.jpg",
                "predicted_style": "others",
                "confidence_score": 0.72,
                "user_id": str(demo_user_id),
                "created_at": "2025-08-23T12:00:00"
            }
        ]
        
        await artworks_collection.insert_many(sample_artworks)
        print(f"✅ Inserted {len(sample_artworks)} sample artworks")
        
        print("\n🎉 Database cleanup completed successfully!")
        print(f"📊 Collections created: {len(collections) + 4}")
        print(f"👤 Demo user: demo / demo123")
        print(f"🎨 Sample artworks: {len(sample_artworks)}")
        print(f"📈 Sample metrics: {len(sample_metrics)}")
        
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(clean_database())
