from fastapi import APIRouter, HTTPException, status
from datetime import timedelta

from app.schemas.auth import UserRegister, UserLogin, TokenResponse
from app.core.security import hash_password, create_access_token


router = APIRouter(prefix="/auth", tags=["auth"])

# Temporary in-memory user storage (replace with database)
fake_users_db = {}


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    """Register a new user"""
    if user_data.email in fake_users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = hash_password(user_data.password)
    
    # Store user (in real app, save to database)
    user_id = len(fake_users_db) + 1
    fake_users_db[user_data.email] = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "hashed_password": hashed_password
    }
    
    # Create token
    access_token = create_access_token(
        data={"sub": user_data.email},
        expires_delta=timedelta(hours=24)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": user_data.name,
            "email": user_data.email
        }
    }


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user"""
    user = fake_users_db.get(credentials.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    from app.core.security import verify_password
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create token
    access_token = create_access_token(
        data={"sub": credentials.email},
        expires_delta=timedelta(hours=24)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }
