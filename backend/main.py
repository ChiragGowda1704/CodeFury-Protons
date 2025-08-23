# Artist Showcase Platform Backend

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import MongoDB connection utilities
from app.utils.mongodb_database import connect_to_mongo, close_mongo_connection

# Import route modules
from app.routes.auth import router as auth_router
from app.routes.upload import router as upload_router
from app.routes.gallery import router as gallery_router
from app.routes.ml import router as ml_router
from app.routes.dashboard import router as dashboard_router
from app.routes.cart import router as cart_router
from app.routes.artists import router as artists_router
from app.routes.profile import router as profile_router

# Lifespan event handler for MongoDB connection
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application lifespan events"""
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

# Create FastAPI app with lifespan
app = FastAPI(
    title="Artist Showcase Platform",
    description="A platform for showcasing Indian folk art with ML-powered features",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:3002",
        "https://*.vercel.app",
        "https://proton-frontend-xyz.vercel.app"  # Replace with your actual Vercel URL
    ],  # React dev server and production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving uploaded images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(upload_router, prefix="/api/v1/upload", tags=["Upload"])
app.include_router(gallery_router, prefix="/api/v1/gallery", tags=["Gallery"])
app.include_router(ml_router, prefix="/api/v1/ml", tags=["Machine Learning"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(cart_router, prefix="/api/v1/cart", tags=["Shopping Cart"])
app.include_router(artists_router, prefix="/api/v1/artists", tags=["Artists"])
app.include_router(profile_router, prefix="/api/v1/profile", tags=["User Profile"])

@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {"message": "Artist Showcase Platform API is running with MongoDB!"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "API is operational with MongoDB"}

@app.get("/api/v1/health")
async def api_health_check():
    """API health check endpoint"""
    return {"status": "healthy", "message": "API is operational with MongoDB"}

if __name__ == "__main__":
    # Create uploads directory if it doesn't exist
    os.makedirs("uploads", exist_ok=True)
    
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
