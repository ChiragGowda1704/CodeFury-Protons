# MongoDB database configuration and connection

import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.mongodb_models import User, Artwork, ClassificationMetrics, CartItem, Order, UserProfile

# MongoDB configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "artist_showcase")

# Global database client
client = None
database = None

async def init_mongodb():
    """Initialize MongoDB connection and Beanie ODM"""
    return await connect_to_mongo()

async def connect_to_mongo():
    """Create database connection"""
    global client, database
    
    try:
        # Create Motor client
        client = AsyncIOMotorClient(MONGODB_URL)
        database = client[DATABASE_NAME]
        
        # Initialize Beanie with the models
        await init_beanie(
            database=database,
            document_models=[
                User,
                Artwork,
                ClassificationMetrics,
                CartItem,
                Order,
                UserProfile
            ]
        )
        
        print(f"✅ Connected to MongoDB: {DATABASE_NAME}")
        
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    global client
    
    if client:
        client.close()
        print("✅ MongoDB connection closed")

async def get_database():
    """Get database instance"""
    global database
    return database

# Dependency for FastAPI
async def get_mongo_db():
    """Dependency to get database in FastAPI routes"""
    return database
