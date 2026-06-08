from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from typing import List, Optional, Annotated
from datetime import datetime
from pydantic import BaseModel, field_validator
import uuid

from ..database import get_db
from ..auth import get_current_user, require_role
from ..models import Base


# SQLAlchemy Model
class Announcement(Base):
    __tablename__ = "announcements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    target_audience = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# Pydantic Schemas
class AnnouncementCreate(BaseModel):
    title: str
    content: str
    target_audience: str


class AnnouncementResponse(BaseModel):
    id: str
    title: str
    content: str
    target_audience: str
    created_at: datetime | None = None
    
    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid(cls, v):
        return str(v)
    
    class Config:
        from_attributes = True


# Router
router = APIRouter()


# POST /announcements (sks_staff only)
@router.post("", response_model=AnnouncementResponse)
def create_announcement(
    body: AnnouncementCreate,
    current_user = Depends(require_role("sks_staff")),
    db: Session = Depends(get_db)
):
    ann = Announcement(
        title=body.title,
        content=body.content,
        target_audience=body.target_audience
    )
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return AnnouncementResponse(
        id=str(ann.id),
        title=ann.title,
        content=ann.content,
        target_audience=ann.target_audience,
        created_at=ann.created_at
    )


# GET /announcements (authenticated)
@router.get("", response_model=List[AnnouncementResponse])
def get_announcements(
    target: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Announcement)
    if target:
        query = query.filter(
            (Announcement.target_audience == target) |
            (Announcement.target_audience == "all")
        )
    results = query.order_by(Announcement.created_at.desc()).all()
    return [
        AnnouncementResponse(
            id=str(a.id),
            title=a.title,
            content=a.content,
            target_audience=a.target_audience,
            created_at=a.created_at
        ) for a in results
    ]


# DELETE /announcements/{id} (sks_staff only)
@router.delete("/{ann_id}")
def delete_announcement(
    ann_id: str,
    current_user = Depends(require_role("sks_staff")),
    db: Session = Depends(get_db)
):
    ann = db.query(Announcement).filter(Announcement.id == uuid.UUID(ann_id)).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Duyuru bulunamadı")
    db.delete(ann)
    db.commit()
    return {"message": "Duyuru silindi"}
