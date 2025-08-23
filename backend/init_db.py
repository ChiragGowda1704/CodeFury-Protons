#!/usr/bin/env python3
"""
Database initialization script for Artist Showcase Platform
"""

import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.utils.database import create_tables, engine
from app.models.database import Base

def init_database():
    """Initialize the database with all tables"""
    print("Initializing Artist Showcase Platform database...")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        
        # Create uploads directory
        os.makedirs("uploads", exist_ok=True)
        os.makedirs("uploads/style_transfer", exist_ok=True)
        os.makedirs("uploads/style_transfer/input", exist_ok=True)
        os.makedirs("uploads/style_transfer/output", exist_ok=True)
        print("✅ Upload directories created successfully!")
        
        print("\n🎨 Artist Showcase Platform database is ready!")
        print("You can now start the server with: python main.py")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        return False
    
    return True

if __name__ == "__main__":
    init_database()
