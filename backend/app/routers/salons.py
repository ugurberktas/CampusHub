from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date
from ..database import get_db
from ..models import Salon, SalonReservation
from ..auth import get_current_user
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
        SalonReservation.reservation_date == body.reservation_date,
        SalonReservation.time_slot == body.time_slot
    ).first()
    
    if conflict:
        raise HTTPException(
            status_code=400, 
            detail="Bu salon bu saatte dolu"
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
