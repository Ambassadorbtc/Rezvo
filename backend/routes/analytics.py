from fastapi import APIRouter, HTTPException, status, Depends, Query
from database import get_database
from middleware.auth import get_current_owner
from datetime import datetime, date, timedelta
from typing import Optional

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/business/{business_id}/overview")
async def get_analytics_overview(
    business_id: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: dict = Depends(get_current_owner)
):
    db = get_database()
    
    business = await db.businesses.find_one({"_id": business_id})
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found"
        )
    
    if business["owner_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    if not end_date:
        end_date = date.today()
    
    total_bookings = await db.reservations.count_documents({
        "business_id": business_id,
        "date": {"$gte": start_date, "$lte": end_date}
    })
    
    confirmed_bookings = await db.reservations.count_documents({
        "business_id": business_id,
        "date": {"$gte": start_date, "$lte": end_date},
        "status": {"$in": ["confirmed", "completed"]}
    })
    
    cancelled_bookings = await db.reservations.count_documents({
        "business_id": business_id,
        "date": {"$gte": start_date, "$lte": end_date},
        "status": "cancelled"
    })
    
    no_shows = await db.reservations.count_documents({
        "business_id": business_id,
        "date": {"$gte": start_date, "$lte": end_date},
        "status": "no_show"
    })
    
    total_reviews = await db.reviews.count_documents({
        "business_id": business_id,
        "created_at": {"$gte": datetime.combine(start_date, datetime.min.time())}
    })
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "bookings": {
            "total": total_bookings,
            "confirmed": confirmed_bookings,
            "cancelled": cancelled_bookings,
            "no_shows": no_shows,
            "cancellation_rate": round((cancelled_bookings / total_bookings * 100) if total_bookings > 0 else 0, 2),
            "no_show_rate": round((no_shows / total_bookings * 100) if total_bookings > 0 else 0, 2)
        },
        "reviews": {
            "total": total_reviews,
            "average_rating": business.get("rating", 0)
        }
    }


@router.get("/business/{business_id}/bookings-by-day")
async def get_bookings_by_day(
    business_id: str,
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: dict = Depends(get_current_owner)
):
    db = get_database()
    
    business = await db.businesses.find_one({"_id": business_id})
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found"
        )
    
    if business["owner_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    pipeline = [
        {
            "$match": {
                "business_id": business_id,
                "date": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$group": {
                "_id": "$date",
                "count": {"$sum": 1}
            }
        },
        {
            "$sort": {"_id": 1}
        }
    ]
    
    results = await db.reservations.aggregate(pipeline).to_list(length=None)
    
    return results


@router.get("/business/{business_id}/revenue")
async def get_revenue_analytics(
    business_id: str,
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: dict = Depends(get_current_owner)
):
    db = get_database()
    
    business = await db.businesses.find_one({"_id": business_id})
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found"
        )
    
    if business["owner_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    pipeline = [
        {
            "$match": {
                "business_id": business_id,
                "date": {"$gte": start_date, "$lte": end_date},
                "deposit_amount": {"$exists": True, "$ne": None}
            }
        },
        {
            "$group": {
                "_id": None,
                "total_revenue": {"$sum": "$deposit_amount"},
                "count": {"$sum": 1}
            }
        }
    ]
    
    results = await db.reservations.aggregate(pipeline).to_list(length=None)
    
    if results:
        return {
            "total_revenue": results[0]["total_revenue"],
            "total_transactions": results[0]["count"],
            "average_transaction": round(results[0]["total_revenue"] / results[0]["count"], 2)
        }
    
    return {
        "total_revenue": 0,
        "total_transactions": 0,
        "average_transaction": 0
    }


@router.get("/business/{business_id}/popular-times")
async def get_popular_times(
    business_id: str,
    current_user: dict = Depends(get_current_owner)
):
    db = get_database()
    
    business = await db.businesses.find_one({"_id": business_id})
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found"
        )
    
    if business["owner_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    start_date = date.today() - timedelta(days=90)
    
    pipeline = [
        {
            "$match": {
                "business_id": business_id,
                "date": {"$gte": start_date},
                "status": {"$in": ["confirmed", "completed"]}
            }
        },
        {
            "$group": {
                "_id": {"$hour": "$time"},
                "count": {"$sum": 1}
            }
        },
        {
            "$sort": {"_id": 1}
        }
    ]
    
    results = await db.reservations.aggregate(pipeline).to_list(length=None)
    
    return results
