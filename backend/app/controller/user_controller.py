from fastapi import HTTPException, status
from app.schema.user_schema import UserCreate, UserLogin
from app.model.user_model import get_user_by_username, create_user, capture_user_activity
from app.utils.utils import get_password_hash, verify_password, create_access_token
from datetime import timedelta
import os

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

def register_new_user(user_data: UserCreate):
    existing_user = get_user_by_username(user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="Username already registered"
        )
    
    # Use fallback for Pydantic v1 vs v2 compatibility
    try:
        user_dict = user_data.model_dump()
    except AttributeError:
        user_dict = user_data.dict()
        
    user_dict["password"] = get_password_hash(user_dict["password"])
    user_dict["role"] = "user"
    
    new_user = create_user(user_dict)
    
    if not new_user:
         raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to create user"
        )
         
    capture_user_activity(new_user["userid"], "User registered")
    return new_user

def login_user(user_data: UserLogin):
    db_user = get_user_by_username(user_data.username)
    if not db_user or not verify_password(user_data.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    capture_user_activity(db_user["userid"], "User logged in")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user["username"], "userid": db_user["userid"], "role": db_user["role"]}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
