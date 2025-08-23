# Authentication routes - Login, Signup, JWT management

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from datetime import timedelta
from pydantic import BaseModel, EmailStr

from ..models.mongodb_models import User as UserDB
from ..utils.mongodb_auth import (
    get_password_hash,
    authenticate_user_mongo,
    create_access_token,
    get_current_user_mongo,
    get_current_user_mongo_by_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

# Initialize security scheme
security = HTTPBearer()

# Pydantic models for requests/responses
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    created_at: str

router = APIRouter()

@router.post("/signup")
async def signup(user_data: UserCreate):
    """Register a new user"""
    # Check if username already exists
    existing_user = await UserDB.find_one(UserDB.username == user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    existing_email = await UserDB.find_one(UserDB.email == user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = UserDB(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    # Insert user to MongoDB
    await db_user.insert()
    
    # Convert to response model
    return {
        "id": str(db_user.id),
        "username": db_user.username,
        "email": db_user.email,
        "created_at": db_user.created_at.isoformat() if db_user.created_at else None
    }

@router.post("/login")
async def login(user_data: UserLogin):
    """Login user and return JWT token"""
    user = await authenticate_user_mongo(user_data.username, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
async def get_current_user_info(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user information"""
    # Verify user authentication
    current_user = await get_current_user_mongo_by_token(credentials.credentials)
    
    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "email": current_user.email,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }

@router.post("/refresh-token")
async def refresh_token(current_user: UserDB = Depends(get_current_user_mongo)):
    """Refresh access token"""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
