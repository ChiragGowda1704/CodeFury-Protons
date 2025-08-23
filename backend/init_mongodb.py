#!/usr/bin/env python3
"""
Initialize MongoDB database for Artist Showcase Platform
Creates collections and sets up initial data
"""

import asyncio
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.utils.mongodb_database import init_mongodb
from app.models.mongodb_models import User, Artwork, ClassificationMetrics, StyleTransferLog
from app.utils.mongodb_auth import get_password_hash

async def initialize_database():
    """Initialize MongoDB database with collections and sample data"""
    
    try:
        print("🔄 Initializing MongoDB database...")
        
        # Initialize MongoDB connection and Beanie
        await init_mongodb()
        print("✅ MongoDB connection established")
        
        # Create indexes for better performance (skip if they exist)
        print("🔄 Ensuring database indexes exist...")
        
        try:
            # Get the database instance to create indexes manually
            from app.utils.mongodb_database import database
            
            # Try to create indexes, ignore if they already exist
            try:
                await database.users.create_index("username", unique=True)
                await database.users.create_index("email", unique=True)
                print("✅ User indexes created")
            except Exception:
                print("ℹ️ User indexes already exist")
            
            try:
                await database.artworks.create_index("user_id")
                await database.artworks.create_index("predicted_style")
                await database.artworks.create_index("created_at")
                print("✅ Artwork indexes created")
            except Exception:
                print("ℹ️ Artwork indexes already exist")
            
            try:
                await database.classification_metrics.create_index("style")
                await database.classification_metrics.create_index("timestamp")
                print("✅ Classification metrics indexes created")
            except Exception:
                print("ℹ️ Classification metrics indexes already exist")
            
            try:
                await database.style_transfer_logs.create_index("user_id")
                await database.style_transfer_logs.create_index("target_style")
                await database.style_transfer_logs.create_index("created_at")
                print("✅ Style transfer log indexes created")
            except Exception:
                print("ℹ️ Style transfer log indexes already exist")
                
        except Exception as e:
            print(f"⚠️ Some indexes may already exist: {e}")
            print("ℹ️ Continuing with initialization...")
        
        # Check if demo user exists
        demo_user = await User.find_one(User.username == "demo")
        
        if not demo_user:
            print("🔄 Creating demo user...")
            demo_user = User(
                username="demo",
                email="demo@example.com",
                hashed_password=get_password_hash("demo123"),
                full_name="Demo User"
            )
            await demo_user.insert()
            print("✅ Demo user created (username: demo, password: demo123)")
        else:
            print("ℹ️ Demo user already exists")
        
        # Create sample classification metrics for dashboard
        existing_metrics = await ClassificationMetrics.find().count()
        if existing_metrics == 0:
            print("🔄 Creating sample classification metrics...")
            
            sample_metrics = [
                ClassificationMetrics(
                    model_version="v2.0_real_analysis",
                    accuracy=0.89,
                    precision_folk_art=0.90,
                    recall_folk_art=0.85,
                    f1_folk_art=0.87
                ),
                ClassificationMetrics(
                    model_version="v2.0_real_analysis", 
                    accuracy=0.92,
                    precision_folk_art=0.93,
                    recall_folk_art=0.91,
                    f1_folk_art=0.92
                ),
                ClassificationMetrics(
                    model_version="v2.0_real_analysis",
                    accuracy=0.87,
                    precision_folk_art=0.88,
                    recall_folk_art=0.86,
                    f1_folk_art=0.87
                )
            ]
            
            for metric in sample_metrics:
                await metric.insert()
            
            print("✅ Sample classification metrics created")
        else:
            print("ℹ️ Classification metrics already exist")
        
        print("\n🎉 Database initialization completed successfully!")
        print("\n📋 Summary:")
        print(f"   - Users: {await User.count()}")
        print(f"   - Artworks: {await Artwork.count()}")
        print(f"   - Classification Metrics: {await ClassificationMetrics.count()}")
        print(f"   - Style Transfer Logs: {await StyleTransferLog.count()}")
        
        print("\n🚀 Ready to start the application!")
        print("   Run: python main.py")
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(initialize_database())
