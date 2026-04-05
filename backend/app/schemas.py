from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    department: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    full_name: str
    student_no: Optional[str]
    department: Optional[str]
    role: str
    is_verified: bool


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


# ── Club Schemas ──────────────────────────────────────────────────────────────

class ClubCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None


class ClubResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: Optional[str]
    category: Optional[str]
    status: str
    logo_url: Optional[str]
    banner_url: Optional[str]
    university_id: UUID
    created_at: datetime
    follower_count: int = 0


class ClubMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    club_id: UUID
    role: str
    permissions: Optional[dict]
    joined_at: datetime
