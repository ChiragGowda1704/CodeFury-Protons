# Authentication routes - Login, Signup, JWT management

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from datetime import timedelta

from app.models.schemas import UserCreate, UserLogin, User, Token
from app.models.mongodb_models import User as UserDB
from app.utils.mongodb_auth import (
    get_password_hash,
    authenticate_user_mongo,
    create_access_token,
    get_current_user_mongo,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()

@router.post("/signup", response_model=User)
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
    return User(
        id=str(db_user.id),
        username=db_user.username,
        email=db_user.email,
        created_at=db_user.created_at
    )

# Authentication routes - Login, Signup, JWT management

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from datetime import timedelta

from app.models.schemas import UserCreate, UserLogin, User, Token
from app.models.mongodb_models import User as UserDB
from app.utils.mongodb_auth import (
    get_password_hash,
    authenticate_user_mongo,
    create_access_token,
    get_current_user_mongo,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()

@router.post("/signup", response_model=User)
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
    return User(
        id=str(db_user.id),
        username=db_user.username,
        email=db_user.email,
        created_at=db_user.created_at
    )

@router.post("/login", response_model=Token)
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

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: UserDB = Depends(get_current_user_mongo)):
    """Get current user information"""
    return User(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        created_at=current_user.created_at
    )

@router.post("/refresh-token", response_model=Token)
async def refresh_token(current_user: UserDB = Depends(get_current_user_mongo)):
    """Refresh access token"""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: UserDB = Depends(get_current_user_mongo)):
    """Get current user information"""
    return User(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        created_at=current_user.created_at
    )

@router.post("/refresh-token", response_model=Token)
async def refresh_token(current_user: UserDB = Depends(get_current_user_mongo)):
    """Refresh access token"""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
    
    return db_user

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token"""
    user = authenticate_user(db, user_data.username, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: UserDB = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.post("/refresh-token", response_model=Token)
async def refresh_token(current_user: UserDB = Depends(get_current_user)):
    """Refresh JWT token for authenticated user"""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
