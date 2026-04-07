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
    email: str
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


# ── Event Schemas ─────────────────────────────────────────────────────────────

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[int] = None
    expected_attendance_rate: float = 0.4
    event_date: datetime
    club_id: UUID  # caller must specify which of their clubs the event belongs to


class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    description: Optional[str]
    location: Optional[str]
    capacity: Optional[int]
    expected_attendance_rate: float
    event_date: datetime
    status: str
    club_id: UUID
    created_at: datetime
    registration_count: int = 0


class EventRegistrationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    event_id: UUID
    user_id: UUID
    registered_at: datetime


class RegistrationAttendeeResponse(BaseModel):
    """Used in GET /events/{event_id}/registrations"""
    model_config = ConfigDict(from_attributes=True)

    full_name: str
    email: str
    student_no: Optional[str]
    department: Optional[str]
