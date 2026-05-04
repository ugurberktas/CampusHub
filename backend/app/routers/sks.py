from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import require_role
from app.database import get_db
from app.models import User, Club, Event

router = APIRouter(prefix="/sks", tags=["sks"])


@router.get("/stats")
def get_sks_stats(
    current_user: User = Depends(require_role("sks_staff")),
    db: Session = Depends(get_db),
):
    total_users = db.query(User).count()
    total_clubs = db.query(Club).count()
    total_events = db.query(Event).count()
    return {
        "total_users": total_users,
        "total_clubs": total_clubs,
        "total_events": total_events,
    }
