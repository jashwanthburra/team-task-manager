from database import users_collection
from models.user import UserCreate, UserResponse
from utils.security import hash_password, verify_password, create_access_token
from fastapi import HTTPException

async def register_user(data: UserCreate) -> UserResponse:
    # Check if email already taken
    existing = await users_collection.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password before storing
    user = data.model_dump()
    user["password"] = hash_password(user["password"])

    # Insert into MongoDB
    result = await users_collection.insert_one(user)

    # Return UserResponse (no password, _id converted to string)
    return UserResponse(
        id=str(result.inserted_id),
        name=data.name,
        email=data.email,
        role=data.role,
    )

async def login_user(email: str, password: str):
    user = await users_collection.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    return {"access_token": token, "token_type": "bearer"}
