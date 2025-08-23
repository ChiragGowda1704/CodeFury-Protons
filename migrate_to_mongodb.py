#!/usr/bin/env python3
"""
Migration script: SQLite to MongoDB
Migrates all existing data from SQLite database to MongoDB
"""

import asyncio
import sqlite3
import sys
import os
from datetime import datetime
from bson import ObjectId

# Add the backend directory to Python path
sys.path.append('/Users/adi/Desktop/Adi/Hackathons/Protons/backend')

from app.utils.mongodb_database import connect_to_mongo, close_mongo_connection
from app.models.mongodb_models import User, Artwork, ClassificationMetrics, StyleTransferLog

class DatabaseMigrator:
    def __init__(self, sqlite_db_path="artist_showcase.db"):
        self.sqlite_db_path = sqlite_db_path
        self.user_id_mapping = {}  # SQLite ID -> MongoDB ObjectId mapping
        
    def connect_sqlite(self):
        """Connect to SQLite database"""
        try:
            self.sqlite_conn = sqlite3.connect(self.sqlite_db_path)
            self.sqlite_conn.row_factory = sqlite3.Row  # Enable column access by name
            print(f"✅ Connected to SQLite: {self.sqlite_db_path}")
        except Exception as e:
            print(f"❌ Failed to connect to SQLite: {e}")
            raise

    def close_sqlite(self):
        """Close SQLite connection"""
        if hasattr(self, 'sqlite_conn'):
            self.sqlite_conn.close()
            print("✅ SQLite connection closed")

    async def migrate_users(self):
        """Migrate users from SQLite to MongoDB"""
        print("📦 Migrating users...")
        
        cursor = self.sqlite_conn.cursor()
        cursor.execute("SELECT * FROM users")
        sqlite_users = cursor.fetchall()
        
        migrated_count = 0
        
        for sqlite_user in sqlite_users:
            try:
                # Create MongoDB user document
                mongo_user = User(
                    username=sqlite_user['username'],
                    email=sqlite_user['email'],
                    hashed_password=sqlite_user['hashed_password'],
                    is_active=bool(sqlite_user['is_active']),
                    created_at=datetime.fromisoformat(sqlite_user['created_at'].replace('Z', '+00:00')) if sqlite_user['created_at'] else datetime.utcnow()
                )
                
                # Insert to MongoDB
                await mongo_user.insert()
                
                # Store ID mapping for foreign key relationships
                self.user_id_mapping[sqlite_user['id']] = str(mongo_user.id)
                
                migrated_count += 1
                print(f"  ✅ Migrated user: {sqlite_user['username']} ({sqlite_user['id']} -> {mongo_user.id})")
                
            except Exception as e:
                print(f"  ❌ Failed to migrate user {sqlite_user['username']}: {e}")
        
        print(f"📊 Users migration complete: {migrated_count}/{len(sqlite_users)} migrated")

    async def migrate_artworks(self):
        """Migrate artworks from SQLite to MongoDB"""
        print("🎨 Migrating artworks...")
        
        cursor = self.sqlite_conn.cursor()
        cursor.execute("SELECT * FROM artworks")
        sqlite_artworks = cursor.fetchall()
        
        migrated_count = 0
        
        for sqlite_artwork in sqlite_artworks:
            try:
                # Get MongoDB user ID from mapping
                mongo_user_id = self.user_id_mapping.get(sqlite_artwork['user_id'])
                if not mongo_user_id:
                    print(f"  ⚠️ Skipping artwork {sqlite_artwork['id']}: User {sqlite_artwork['user_id']} not found")
                    continue
                
                # Create MongoDB artwork document
                mongo_artwork = Artwork(
                    title=sqlite_artwork['title'],
                    description=sqlite_artwork['description'],
                    filename=sqlite_artwork['filename'],
                    file_path=sqlite_artwork['file_path'],
                    predicted_style=sqlite_artwork['predicted_style'],
                    confidence_score=sqlite_artwork['confidence_score'],
                    user_id=mongo_user_id,
                    created_at=datetime.fromisoformat(sqlite_artwork['created_at'].replace('Z', '+00:00')) if sqlite_artwork['created_at'] else datetime.utcnow()
                )
                
                # Insert to MongoDB
                await mongo_artwork.insert()
                
                migrated_count += 1
                print(f"  ✅ Migrated artwork: {sqlite_artwork['title']} (ID: {sqlite_artwork['id']} -> {mongo_artwork.id})")
                
            except Exception as e:
                print(f"  ❌ Failed to migrate artwork {sqlite_artwork['id']}: {e}")
        
        print(f"📊 Artworks migration complete: {migrated_count}/{len(sqlite_artworks)} migrated")

    async def migrate_classification_metrics(self):
        """Migrate classification metrics from SQLite to MongoDB"""
        print("📈 Migrating classification metrics...")
        
        cursor = self.sqlite_conn.cursor()
        cursor.execute("SELECT * FROM classification_metrics")
        sqlite_metrics = cursor.fetchall()
        
        migrated_count = 0
        
        for sqlite_metric in sqlite_metrics:
            try:
                # Create MongoDB metrics document
                # Note: Converting old field names to new ones
                mongo_metric = ClassificationMetrics(
                    model_version=sqlite_metric['model_version'],
                    accuracy=sqlite_metric['accuracy'],
                    precision_folk_art=sqlite_metric.get('precision_warli'),  # Old field mapping
                    precision_modern_art=sqlite_metric.get('precision_madhubani'),
                    precision_classical_art=sqlite_metric.get('precision_pithora'),
                    recall_folk_art=sqlite_metric.get('recall_warli'),
                    recall_modern_art=sqlite_metric.get('recall_madhubani'),
                    recall_classical_art=sqlite_metric.get('recall_pithora'),
                    f1_folk_art=sqlite_metric.get('f1_warli'),
                    f1_modern_art=sqlite_metric.get('f1_madhubani'),
                    f1_classical_art=sqlite_metric.get('f1_pithora'),
                    created_at=datetime.fromisoformat(sqlite_metric['created_at'].replace('Z', '+00:00')) if sqlite_metric['created_at'] else datetime.utcnow()
                )
                
                # Insert to MongoDB
                await mongo_metric.insert()
                
                migrated_count += 1
                print(f"  ✅ Migrated metric: {sqlite_metric['model_version']} (ID: {sqlite_metric['id']} -> {mongo_metric.id})")
                
            except Exception as e:
                print(f"  ❌ Failed to migrate metric {sqlite_metric['id']}: {e}")
        
        print(f"📊 Classification metrics migration complete: {migrated_count}/{len(sqlite_metrics)} migrated")

    async def migrate_style_transfer_logs(self):
        """Migrate style transfer logs from SQLite to MongoDB"""
        print("🎭 Migrating style transfer logs...")
        
        cursor = self.sqlite_conn.cursor()
        cursor.execute("SELECT * FROM style_transfer_logs")
        sqlite_logs = cursor.fetchall()
        
        migrated_count = 0
        
        for sqlite_log in sqlite_logs:
            try:
                # Get MongoDB user ID from mapping
                mongo_user_id = self.user_id_mapping.get(sqlite_log['user_id'])
                if not mongo_user_id:
                    print(f"  ⚠️ Skipping style transfer log {sqlite_log['id']}: User {sqlite_log['user_id']} not found")
                    continue
                
                # Create MongoDB style transfer log document
                mongo_log = StyleTransferLog(
                    input_image_path=sqlite_log['input_image_path'],
                    output_image_path=sqlite_log['output_image_path'],
                    target_style=sqlite_log['target_style'],
                    transfer_score=sqlite_log['transfer_score'],
                    processing_time=sqlite_log['processing_time'],
                    user_id=mongo_user_id,
                    created_at=datetime.fromisoformat(sqlite_log['created_at'].replace('Z', '+00:00')) if sqlite_log['created_at'] else datetime.utcnow()
                )
                
                # Insert to MongoDB
                await mongo_log.insert()
                
                migrated_count += 1
                print(f"  ✅ Migrated style transfer log: {sqlite_log['target_style']} (ID: {sqlite_log['id']} -> {mongo_log.id})")
                
            except Exception as e:
                print(f"  ❌ Failed to migrate style transfer log {sqlite_log['id']}: {e}")
        
        print(f"📊 Style transfer logs migration complete: {migrated_count}/{len(sqlite_logs)} migrated")

    async def run_migration(self):
        """Run the complete migration process"""
        print("🚀 Starting SQLite to MongoDB migration...")
        print("=" * 50)
        
        try:
            # Connect to databases
            self.connect_sqlite()
            await connect_to_mongo()
            
            # Run migrations in order (users first due to foreign keys)
            await self.migrate_users()
            print()
            await self.migrate_artworks()
            print()
            await self.migrate_classification_metrics()
            print()
            await self.migrate_style_transfer_logs()
            
            print()
            print("=" * 50)
            print("🎉 Migration completed successfully!")
            print(f"📋 User ID mappings: {len(self.user_id_mapping)}")
            
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise
        finally:
            # Clean up connections
            self.close_sqlite()
            await close_mongo_connection()

async def main():
    """Main migration function"""
    # Change to backend directory
    os.chdir('/Users/adi/Desktop/Adi/Hackathons/Protons/backend')
    
    migrator = DatabaseMigrator()
    await migrator.run_migration()

if __name__ == "__main__":
    print("🔄 Database Migration: SQLite → MongoDB")
    print("This will migrate all existing data to MongoDB")
    print()
    
    # Run migration
    asyncio.run(main())
