from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import create_access_token, get_current_user, get_password_hash, verify_password, require_role
from app.database import get_db
from app.models import University, User, ClubMember, Club, EventRegistration, Event
from app.schemas import Token, UserRegister, UserResponse, UserListResponse
from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str

router = APIRouter()


def _parse_email_parts(email: str) -> tuple[str, str]:
    normalized = email.strip().lower()
    parts = normalized.split("@")
    if len(parts) != 2 or not parts[0] or not parts[1]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format",
        )
    return parts[0], parts[1]


@router.post("/register", response_model=UserResponse)
def register(body: UserRegister, db: Session = Depends(get_db)):
    local_part, domain = _parse_email_parts(str(body.email))
    if not domain.endswith(".edu.tr"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email must end with a .edu.tr domain",
        )

    normalized_email = f"{local_part}@{domain}"
    if db.query(User).filter(User.email == normalized_email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    university = (
        db.query(University).filter(University.domain == domain).first()
    )
    if university is None:
        university = University(name=body.university, domain=domain)
        db.add(university)
        db.flush()

    user = User(
        university_id=university.id,
        full_name=body.full_name,
        email=normalized_email,
        student_no=local_part,
        department=body.department,
        grade=body.grade,
        hashed_password=get_password_hash(body.password),
        role="student",
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    normalized = str(body.username).strip().lower()
    user = db.query(User).filter(User.email == normalized).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(data={"sub": user.email})
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/users", response_model=List[UserListResponse])
def list_users(
    current_user: User = Depends(require_role("sks_staff")),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    return users


@router.get("/me/clubs")
def get_my_clubs(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    memberships = (
        db.query(ClubMember, Club)
        .join(Club, Club.id == ClubMember.club_id)
        .filter(
            ClubMember.user_id == current_user.id,
            Club.status == "active"
        )
        .all()
    )
    return [
        {
            "club_id": club.id,
            "club_name": club.name,
            "club_category": club.category,
            "role": member.role,
            "joined_at": member.joined_at
        }
        for member, club in memberships
    ]


@router.get("/me/events")
def get_my_events(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    registrations = (
        db.query(EventRegistration, Event)
        .join(Event, Event.id == EventRegistration.event_id)
        .filter(EventRegistration.user_id == current_user.id)
        .all()
    )
    return [
        {
            "event_id": event.id,
            "event_title": event.title,
            "event_date": event.event_date,
            "event_location": event.location,
            "registered_at": reg.registered_at 
              if hasattr(reg, 'registered_at') else None
        }
        for reg, event in registrations
    ]


@router.put("/me/password")
def change_password(
    body: dict,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    old_password = body.get("old_password")
    new_password = body.get("new_password")

    if not verify_password(old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Mevcut şifre yanlış"
        )

    current_user.hashed_password = get_password_hash(new_password)
    db.commit()
    return {"message": "Şifre güncellendi"}
