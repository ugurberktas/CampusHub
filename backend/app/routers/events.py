from datetime import datetime, timezone
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Club, ClubMember, Event, EventRegistration, User
from app.schemas import (
    EventCreate,
    EventRegistrationResponse,
    EventResponse,
    RegistrationAttendeeResponse,
)

router = APIRouter(tags=["events"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def _reg_count(event_id, db: Session) -> int:
    return db.query(EventRegistration).filter(EventRegistration.event_id == event_id).count()


def _event_to_response(event: Event, db: Session) -> EventResponse:
    return EventResponse(
        id=event.id,
        title=event.title,
        description=event.description,
        location=event.location,
        capacity=event.capacity,
        expected_attendance_rate=event.expected_attendance_rate,
        event_date=event.event_date,
        status=event.status,
        club_id=event.club_id,
        created_at=event.created_at,
        registration_count=_reg_count(event.id, db),
    )


def _get_event_or_404(event_id, db: Session) -> Event:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event


def _assert_club_staff(user: User, club_id, db: Session):
    """Raises 403 if user is not owner or core_team of the given club."""
    membership = (
        db.query(ClubMember)
        .filter(
            ClubMember.club_id == club_id,
            ClubMember.user_id == user.id,
            ClubMember.role.in_(["owner", "core_team"]),
        )
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only club owner or core_team can perform this action",
        )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Authenticated club owner or core_team – create an event for their club."""
    # Verify caller is staff of the specified club
    _assert_club_staff(current_user, payload.club_id, db)

    # Verify the club actually exists
    club = db.query(Club).filter(Club.id == payload.club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    event = Event(
        club_id=payload.club_id,
        title=payload.title,
        description=payload.description,
        location=payload.location,
        capacity=payload.capacity,
        expected_attendance_rate=payload.expected_attendance_rate,
        event_date=payload.event_date,
        status="upcoming",
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return _event_to_response(event, db)


@router.get("", response_model=List[EventResponse])
def list_upcoming_events(db: Annotated[Session, Depends(get_db)]):
    """Public – returns upcoming events ordered by event_date ascending."""
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    events = (
        db.query(Event)
        .filter(Event.status == "upcoming", Event.event_date >= now)
        .order_by(Event.event_date.asc())
        .all()
    )
    return [_event_to_response(e, db) for e in events]


@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id, db: Annotated[Session, Depends(get_db)]):
    """Public – returns a single event detail."""
    event = _get_event_or_404(event_id, db)
    return _event_to_response(event, db)


@router.delete("/{event_id}")
def delete_event(
    event_id,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Club owner or core_team only – delete an event."""
    event = _get_event_or_404(event_id, db)
    _assert_club_staff(current_user, event.club_id, db)
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}


@router.post("/{event_id}/register")
def register_for_event(
    event_id,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Authenticated user – register for an event. Returns registration + early_warning flag."""
    event = _get_event_or_404(event_id, db)

    # Duplicate check
    existing = (
        db.query(EventRegistration)
        .filter(
            EventRegistration.event_id == event.id,
            EventRegistration.user_id == current_user.id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already registered for this event")

    # Capacity check
    current_count = _reg_count(event.id, db)
    if event.capacity is not None and current_count >= event.capacity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Event is at full capacity")

    registration = EventRegistration(event_id=event.id, user_id=current_user.id)
    db.add(registration)
    db.commit()
    db.refresh(registration)

    # Early warning: registrations >= capacity * expected_attendance_rate * 2
    new_count = current_count + 1
    early_warning = False
    if event.capacity is not None:
        threshold = event.capacity * event.expected_attendance_rate * 2
        early_warning = new_count >= threshold

    return {
        "registration": EventRegistrationResponse.model_validate(registration),
        "early_warning": early_warning,
    }


@router.get("/{event_id}/registrations", response_model=List[RegistrationAttendeeResponse])
def list_registrations(
    event_id,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Club owner or core_team only – list registered attendees."""
    event = _get_event_or_404(event_id, db)
    _assert_club_staff(current_user, event.club_id, db)

    registrations = (
        db.query(EventRegistration).filter(EventRegistration.event_id == event.id).all()
    )
    user_ids = [r.user_id for r in registrations]
    users = db.query(User).filter(User.id.in_(user_ids)).all()
    return users
