from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import create_access_token, get_current_user, get_password_hash, verify_password
from app.database import get_db
from app.models import University, User
from app.schemas import Token, UserLogin, UserRegister, UserResponse

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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="University not found for this email domain",
        )

    user = User(
        university_id=university.id,
        full_name=body.full_name,
        email=normalized_email,
        student_no=local_part,
        department=body.department,
        hashed_password=get_password_hash(body.password),
        role="student",
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(body: UserLogin, db: Session = Depends(get_db)):
    normalized = str(body.email).strip().lower()
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
