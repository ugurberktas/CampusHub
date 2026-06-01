from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date
from ..database import get_db
from ..models import Salon, SalonReservation, Club
from ..auth import get_current_user, require_role
from pydantic import BaseModel
from uuid import UUID

router = APIRouter()

class SalonResponse(BaseModel):
    id: UUID
    name: str
    capacity: int
    description: str | None
    class Config:
        from_attributes = True

class ReservationCreate(BaseModel):
    salon_id: UUID
    club_id: UUID
    reservation_date: str
    time_slot: str

class ReservationResponse(BaseModel):
    id: UUID
    salon_id: UUID
    club_id: UUID
    reservation_date: date | None = None
    time_slot: str
    status: str | None
    class Config:
        from_attributes = True

@router.get("/salons", response_model=List[SalonResponse])
def get_salons(db: Session = Depends(get_db)):
    salons = db.query(Salon).all()
    return salons

@router.post("/salon_reservations", 
             response_model=ReservationResponse)
def create_reservation(
    body: ReservationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Check for overlapping reservations
    conflict = db.query(SalonReservation).filter(
        SalonReservation.salon_id == body.salon_id,
        SalonReservation.reservation_date == body.reservation_date
    ).first()
    
    if conflict:
        raise HTTPException(
            status_code=409,
            detail="Seçtiğiniz salon bu tarih ve saatte doludur, lütfen başka bir zaman seçin."
        )
    
    reservation = SalonReservation(
        salon_id=body.salon_id,
        club_id=body.club_id,
        reservation_date=str(body.reservation_date),
        time_slot=body.time_slot
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


@router.get("/salon_reservations")
def get_all_reservations(
    current_user = Depends(require_role("sks_staff")),
    db: Session = Depends(get_db)
):
    reservations = db.query(SalonReservation).all()
    result = []
    for r in reservations:
        salon = db.query(Salon).filter(
            Salon.id == r.salon_id
        ).first()
        club = db.query(Club).filter(
            Club.id == r.club_id
        ).first()
        result.append({
            "id": str(r.id),
            "salon_name": salon.name if salon else "-",
            "club_name": club.name if club else "-",
            "reservation_date": str(r.reservation_date),
            "time_slot": r.time_slot or "-",
            "status": r.status or "active"
        })
    return result
