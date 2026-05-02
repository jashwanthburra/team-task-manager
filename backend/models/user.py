from pydantic import BaseModel, EmailStr, ConfigDict
from enum import Enum

class Role(str, Enum):
    admin = "admin"
    member = "member"

class UserCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")  # reject unknown fields

    name: str
    email: EmailStr
    password: str
    role: Role = Role.member

class UserLogin(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: Role
    # password is intentionally excluded
