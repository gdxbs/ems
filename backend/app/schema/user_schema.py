from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class ActivityLog(BaseModel):
    action: str
    timestamp: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: str = "user"

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    userid: str
    username: str
    email: str
    role: str
    activitylog: List[ActivityLog] = []
