from fastapi import APIRouter
from pydantic import BaseModel
from models.user import UserCreate, UserLogin, UserResponse
from services import auth_service
from database import users_collection

router = APIRouter(prefix="/auth", tags=["Auth"])

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

@router.post("/register", response_model=UserResponse, status_code=201)
async def register(data: UserCreate):
    return await auth_service.register_user(data)

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    return await auth_service.login_user(data.email, data.password)

@router.post("/make-admin")
async def make_admin(email: str):
    """Temporary: promote any user to admin by email. Remove in production."""
    result = await users_collection.update_one(
        {"email": email},
        {"$set": {"role": "admin"}}
    )
    if result.matched_count == 0:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"{email} is now an admin"}
