from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from database import users_collection
from utils.dependencies import require_admin
from bson import ObjectId

router = APIRouter(prefix="/admin", tags=["Admin"])

class RoleUpdateRequest(BaseModel):
    email: EmailStr
    role: str  # "admin" or "member"

@router.get("/users")
async def list_all_users(user=Depends(require_admin)):
    """Admin only: get all registered users."""
    cursor = users_collection.find({}, {"password": 0})  # exclude password
    users = []
    async for u in cursor:
        u["id"] = str(u.pop("_id"))
        users.append(u)
    return users

@router.patch("/users/role")
async def update_user_role(body: RoleUpdateRequest, user=Depends(require_admin)):
    """Admin only: promote or demote any user."""
    if body.role not in ("admin", "member"):
        raise HTTPException(status_code=400, detail="Role must be 'admin' or 'member'")
    result = await users_collection.update_one(
        {"email": body.email},
        {"$set": {"role": body.role}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"{body.email} is now '{body.role}'"}
