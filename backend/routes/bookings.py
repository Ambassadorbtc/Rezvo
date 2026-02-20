from fastapi import APIRouter, HTTPException, status, Depends, Query
from database import get_database
from models.reservation import (
    ReservationCreate, ReservationUpdate, ReservationResponse,
    ReservationStatus, DepositStatus
)
from middleware.auth import get_current_user, get_current_staff
from datetime import datetime, date, time, timedelta
from typing import List, Optional

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("/", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
async def create_reservation(
    reservation_data: ReservationCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    
    business = await db.businesses.find_one({"_id": reservation_data.business_id})
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found"
        )
    
    if not business.get("claimed"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Business does not accept online bookings"
        )
    
    reservation_dict = reservation_data.model_dump()
    reservation_dict.update({
        "user_id": str(current_user["_id"]),
        "status": ReservationStatus.PENDING.value,
        "deposit_amount": None,
        "deposit_status": DepositStatus.NOT_REQUIRED.value,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    booking_settings = business.get("booking_settings", {})
    if booking_settings.get("auto_confirm", True):
        reservation_dict["status"] = ReservationStatus.CONFIRMED.value
    
    result = await db.reservations.insert_one(reservation_dict)
    reservation_id = str(result.inserted_id)
    
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$addToSet": {"booking_history": reservation_id}}
    )
    
    reservation_dict["_id"] = reservation_id
    
    return ReservationResponse(
        id=reservation_id,
        business_id=reservation_dict["business_id"],
        user_id=reservation_dict["user_id"],
        date=reservation_dict["date"],
        time=reservation_dict["time"],
        duration_minutes=reservation_dict["duration_minutes"],
        party_size=reservation_dict["party_size"],
        table_id=reservation_dict.get("table_id"),
        staff_id=reservation_dict.get("staff_id"),
        status=ReservationStatus(reservation_dict["status"]),
        deposit_amount=reservation_dict["deposit_amount"],
        deposit_status=DepositStatus(reservation_dict["deposit_status"]),
        notes=reservation_dict.get("notes"),
        created_at=reservation_dict["created_at"]
    )


@router.get("/{reservation_id}", response_model=ReservationResponse)
async def get_reservation(
    reservation_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    
    reservation = await db.reservations.find_one({"_id": reservation_id})
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found"
        )
    
    business = await db.businesses.find_one({"_id": reservation["business_id"]})
    
    if (reservation["user_id"] != str(current_user["_id"]) and 
        business.get("owner_id") != str(current_user["_id"]) and
        current_user.get("role") not in ["staff", "admin"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this reservation"
        )
    
    return ReservationResponse(
        id=str(reservation["_id"]),
        business_id=reservation["business_id"],
        user_id=reservation["user_id"],
        date=reservation["date"],
        time=reservation["time"],
        duration_minutes=reservation["duration_minutes"],
        party_size=reservation["party_size"],
        table_id=reservation.get("table_id"),
        staff_id=reservation.get("staff_id"),
        status=ReservationStatus(reservation["status"]),
        deposit_amount=reservation.get("deposit_amount"),
        deposit_status=DepositStatus(reservation["deposit_status"]),
        notes=reservation.get("notes"),
        created_at=reservation["created_at"]
    )


@router.patch("/{reservation_id}", response_model=ReservationResponse)
async def update_reservation(
    reservation_id: str,
    reservation_update: ReservationUpdate,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    
    reservation = await db.reservations.find_one({"_id": reservation_id})
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found"
        )
    
    business = await db.businesses.find_one({"_id": reservation["business_id"]})
    
    if (reservation["user_id"] != str(current_user["_id"]) and 
        business.get("owner_id") != str(current_user["_id"]) and
        current_user.get("role") not in ["staff", "admin"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this reservation"
        )
    
    update_data = reservation_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    update_data["updated_at"] = datetime.utcnow()
    
    await db.reservations.update_one(
        {"_id": reservation_id},
        {"$set": update_data}
    )
    
    updated_reservation = await db.reservations.find_one({"_id": reservation_id})
    
    return ReservationResponse(
        id=str(updated_reservation["_id"]),
        business_id=updated_reservation["business_id"],
        user_id=updated_reservation["user_id"],
        date=updated_reservation["date"],
        time=updated_reservation["time"],
        duration_minutes=updated_reservation["duration_minutes"],
        party_size=updated_reservation["party_size"],
        table_id=updated_reservation.get("table_id"),
        staff_id=updated_reservation.get("staff_id"),
        status=ReservationStatus(updated_reservation["status"]),
        deposit_amount=updated_reservation.get("deposit_amount"),
        deposit_status=DepositStatus(updated_reservation["deposit_status"]),
        notes=updated_reservation.get("notes"),
        created_at=updated_reservation["created_at"]
    )


@router.delete("/{reservation_id}")
async def cancel_reservation(
    reservation_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    
    reservation = await db.reservations.find_one({"_id": reservation_id})
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found"
        )
    
    if reservation["user_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this reservation"
        )
    
    await db.reservations.update_one(
        {"_id": reservation_id},
        {
            "$set": {
                "status": ReservationStatus.CANCELLED.value,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"detail": "Reservation cancelled successfully"}


@router.get("/business/{business_id}/availability")
async def check_availability(
    business_id: str,
    date_param: date = Query(..., alias="date"),
    party_size: int = Query(2, ge=1)
):
    db = get_database()
    
    business = await db.businesses.find_one({"_id": business_id})
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found"
        )
    
    booking_settings = business.get("booking_settings", {})
    slot_duration = booking_settings.get("slot_duration_minutes", 15)
    
    start_time = time(9, 0)
    end_time = time(21, 0)
    
    slots = []
    current_time = datetime.combine(date_param, start_time)
    end_datetime = datetime.combine(date_param, end_time)
    
    while current_time < end_datetime:
        slots.append({
            "time": current_time.time().isoformat(),
            "available": True
        })
        current_time += timedelta(minutes=slot_duration)
    
    return {"date": date_param, "slots": slots}


@router.get("/business/{business_id}/calendar")
async def get_business_calendar(
    business_id: str,
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: dict = Depends(get_current_staff)
):
    db = get_database()
    
    business = await db.businesses.find_one({"_id": business_id})
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found"
        )
    
    if business.get("owner_id") != str(current_user["_id"]) and current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this calendar"
        )
    
    reservations = await db.reservations.find({
        "business_id": business_id,
        "date": {"$gte": start_date, "$lte": end_date}
    }).sort("date", 1).to_list(length=None)
    
    return reservations
