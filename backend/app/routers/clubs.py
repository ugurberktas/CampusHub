from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import EmailStr
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_role
from app.database import get_db
from app.models import Club, ClubMember, Follow, User
from app.schemas import ClubCreate, ClubMemberResponse, ClubResponse

router = APIRouter(tags=["clubs"])


# ── Helper ────────────────────────────────────────────────────────────────────

def _club_to_response(club: Club, db: Session) -> ClubResponse:
    follower_count = db.query(Follow).filter(Follow.club_id == club.id).count()
    return ClubResponse(
        id=club.id,
        name=club.name,
        description=club.description,
        category=club.category,
        status=club.status,
        logo_url=club.logo_url,
        banner_url=club.banner_url,
        advisor_name=club.advisor_name,
        advisor_faculty=club.advisor_faculty,
        advisor_email=club.advisor_email,
        university_id=club.university_id,
        created_at=club.created_at,
        follower_count=follower_count,
    )


def _get_club_or_404(club_id, db: Session) -> Club:
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")
    return club


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("", response_model=ClubResponse, status_code=status.HTTP_201_CREATED)
def create_club(
    payload: ClubCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new club (any authenticated .edu.tr user). Status starts as 'pending'."""
    club = Club(
        name=payload.name,
        description=payload.description,
        category=payload.category,
        advisor_name=payload.advisor_name,
        advisor_faculty=payload.advisor_faculty,
        advisor_email=payload.advisor_email,
        logo_url=payload.logo_url,
        status="pending",
        university_id=current_user.university_id,
    )
    db.add(club)
    db.flush()  # populate club.id before using it

    member = ClubMember(
        club_id=club.id,
        user_id=current_user.id,
        role="owner",
        permissions=None,
    )
    db.add(member)
    db.commit()
    db.refresh(club)
    return _club_to_response(club, db)


@router.get("", response_model=List[ClubResponse])
def list_active_clubs(db: Annotated[Session, Depends(get_db)]):
    """Public – returns all clubs with status='active'."""
    clubs = db.query(Club).filter(Club.status == "active").all()
    return [_club_to_response(c, db) for c in clubs]


@router.get("/pending", response_model=List[ClubResponse])
def list_pending_clubs(
    current_user: Annotated[User, Depends(require_role("sks_staff"))],
    db: Annotated[Session, Depends(get_db)],
):
    """SKS only – returns all clubs with status='pending'."""
    clubs = db.query(Club).filter(Club.status == "pending").all()
    return [_club_to_response(c, db) for c in clubs]


@router.get("/{club_id}", response_model=ClubResponse)
def get_club(club_id, db: Annotated[Session, Depends(get_db)]):
    """Public – returns a single club detail."""
    club = _get_club_or_404(club_id, db)
    return _club_to_response(club, db)


@router.put("/{club_id}/approve", response_model=ClubResponse)
def approve_club(
    club_id,
    current_user: Annotated[User, Depends(require_role("sks_staff"))],
    db: Annotated[Session, Depends(get_db)],
):
    """SKS only – approve a pending club."""
    club = _get_club_or_404(club_id, db)
    club.status = "active"
    db.commit()
    db.refresh(club)
    return _club_to_response(club, db)


@router.put("/{club_id}/reject", response_model=ClubResponse)
def reject_club(
    club_id,
    current_user: Annotated[User, Depends(require_role("sks_staff"))],
    db: Annotated[Session, Depends(get_db)],
):
    """SKS only – reject a pending club."""
    club = _get_club_or_404(club_id, db)
    club.status = "rejected"
    db.commit()
    db.refresh(club)
    return _club_to_response(club, db)


@router.put("/{club_id}/suspend", response_model=ClubResponse)
def suspend_club(
    club_id,
    current_user: Annotated[User, Depends(require_role("sks_staff"))],
    db: Annotated[Session, Depends(get_db)],
):
    """SKS only – suspend a club."""
    club = _get_club_or_404(club_id, db)
    club.status = "suspended"
    db.commit()
    db.refresh(club)
    return _club_to_response(club, db)


# ── Members ───────────────────────────────────────────────────────────────────

class AddMemberPayload:
    """Inline body model – avoids creating a new schema file."""
    pass


from pydantic import BaseModel

class AddMemberBody(BaseModel):
    user_email: EmailStr
    role: str = "core_team"
    permissions: Optional[dict] = None


@router.post("/{club_id}/members", response_model=ClubMemberResponse, status_code=status.HTTP_201_CREATED)
def add_member(
    club_id,
    payload: AddMemberBody,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Club owner only – add a user to a club by email."""
    club = _get_club_or_404(club_id, db)

    # Verify caller is owner of this specific club
    membership = (
        db.query(ClubMember)
        .filter(ClubMember.club_id == club.id, ClubMember.user_id == current_user.id, ClubMember.role == "owner")
        .first()
    )
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only club owners can add members")

    target_user = db.query(User).filter(User.email == payload.user_email).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    existing = (
        db.query(ClubMember)
        .filter(ClubMember.club_id == club.id, ClubMember.user_id == target_user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User is already a member")

    new_member = ClubMember(
        club_id=club.id,
        user_id=target_user.id,
        role=payload.role,
        permissions=payload.permissions,
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member


@router.get("/{club_id}/members", response_model=List[ClubMemberResponse])
def list_members(
    club_id,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Authenticated users – list members of a club."""
    _get_club_or_404(club_id, db)
    members = db.query(ClubMember).filter(ClubMember.club_id == club_id).all()
    return members
