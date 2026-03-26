from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
from app.config.database import db
from app.model.employee_model import get_all_employees, get_employee_by_id, get_employees_by_department, update_employee, delete_employee, create_employee
from app.schema.employee_schema import Employee, EmployeeCreate

app = FastAPI(title = "Employee Management System API", version="1.0")
app.include_router(employee_routes, prefix="/employees")

SECRET_KEY = "[ENCRYPTION_KEY]"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

#Create a new user
class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    full_name: Optional[str] = None

#User model for database
class User(BaseModel):
    username: str
    hashed_password: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = False

#Token response model
class Token(BaseModel):
    access_token: str
    token_type: str

#Create a new user
@app.post("/users", response_model=User)
def create_user(user: UserCreate):
    #Check if user already exists
    existing_user = db.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    #Hash the password
    hashed_password = pwd_context.hash(user.password)
    
    #Create user in database
    db.users.insert_one({
        "username": user.username,
        "hashed_password": hashed_password,
        "email": user.email,
        "full_name": user.full_name,
        "disabled": False
    })
    
    return User(
        username=user.username,
        hashed_password=hashed_password,
        email=user.email,
        full_name=user.full_name,
        disabled=False
    )

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_user(username: str):
    return db.users.find_one({"username": username})

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt