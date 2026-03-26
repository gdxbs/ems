from fastapi import APIRouter
from app.schema.user_schema import UserCreate, UserLogin, UserResponse
from app.controller.user_controller import register_new_user, login_user

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate):
    return register_new_user(user)

@router.post("/login")
def login(user: UserLogin):
    return login_user(user)

