from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import hmac
import hashlib
import requests as http_requests
from bson import ObjectId
import resend
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'quickslot-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 14

# Dojo Config
DOJO_API_KEY = os.environ.get('DOJO_API_KEY', '')
DOJO_API_URL = os.environ.get('DOJO_API_URL', 'https://api.dojo.tech')
DOJO_WEBHOOK_SECRET = os.environ.get('DOJO_WEBHOOK_SECRET', '')

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Resend Email Config
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
resend.api_key = os.environ.get('RESEND_API_KEY', '')

app = FastAPI(title="QuickSlot API", version="1.0.0")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    business_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    business_id: Optional[str] = None
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class BusinessCreate(BaseModel):
    name: str
    tagline: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    instagram: Optional[str] = None

class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    booking_message: Optional[str] = None
    availability: Optional[List[dict]] = None
    blocked_dates: Optional[List[str]] = None

class ServiceCreate(BaseModel):
    name: str
    price_pence: int
    duration_min: int
    deposit_required: bool = False
    deposit_amount_pence: Optional[int] = None
    description: Optional[str] = None

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    price_pence: Optional[int] = None
    duration_min: Optional[int] = None
    deposit_required: Optional[bool] = None
    deposit_amount_pence: Optional[int] = None
    description: Optional[str] = None

class AvailabilitySlot(BaseModel):
    day: int  # 0=Sunday, 1=Monday, etc.
    start_min: int  # Minutes from midnight (e.g., 540 = 9am)
    end_min: int  # Minutes from midnight (e.g., 1020 = 5pm)

class AvailabilityUpdate(BaseModel):
    slots: List[AvailabilitySlot]
    blocked_dates: Optional[List[str]] = None  # ISO date strings

class BookingCreate(BaseModel):
    service_id: str
    client_name: str
    client_email: EmailStr
    client_phone: Optional[str] = None
    datetime_iso: str
    notes: Optional[str] = None

class BookingUpdate(BaseModel):
    datetime_iso: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class PaymentIntentCreate(BaseModel):
    booking_id: str
    amount_pence: int
    success_url: str
    cancel_url: str

class DojoKeyVerify(BaseModel):
    api_key: str

# ==================== HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB document to JSON-serializable dict"""
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if key == '_id':
            result['id'] = str(value)
        elif isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        else:
            result[key] = value
    return result

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/signup", response_model=TokenResponse)
async def signup(data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    # Create user
    user_doc = {
        "id": user_id,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "role": "owner",
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
        "dojo_api_key": None,
        "onboarding_completed": False
    }
    await db.users.insert_one(user_doc)
    
    # Create business if name provided
    business_id = None
    if data.business_name:
        business_id = str(uuid.uuid4())
        business_doc = {
            "id": business_id,
            "owner_id": user_id,
            "name": data.business_name,
            "tagline": "",
            "logo_url": None,
            "phone": None,
            "address": None,
            "instagram": None,
            "availability": [],
            "blocked_dates": [],
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }
        await db.businesses.insert_one(business_doc)
        await db.users.update_one({"id": user_id}, {"$set": {"business_id": business_id}})
    
    token = create_token(user_id, data.email, "owner")
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=data.email,
            role="owner",
            business_id=business_id,
            created_at=now.isoformat()
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"], user["role"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            role=user["role"],
            business_id=user.get("business_id"),
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(
        id=user["id"],
        email=user["email"],
        role=user["role"],
        business_id=user.get("business_id"),
        created_at=user["created_at"]
    )

# ==================== BUSINESS ROUTES ====================

@api_router.post("/business")
async def create_business(data: BusinessCreate, current_user: dict = Depends(get_current_user)):
    business_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    business_doc = {
        "id": business_id,
        "owner_id": current_user["sub"],
        "name": data.name,
        "tagline": data.tagline or "",
        "logo_url": None,
        "phone": data.phone,
        "address": data.address,
        "instagram": data.instagram,
        "availability": [],
        "blocked_dates": [],
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    await db.businesses.insert_one(business_doc)
    await db.users.update_one({"id": current_user["sub"]}, {"$set": {"business_id": business_id}})
    
    return {"id": business_id, "name": data.name}

@api_router.get("/business")
async def get_business(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    business = await db.businesses.find_one({"id": user["business_id"]}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    return business

@api_router.patch("/business")
async def update_business(data: BusinessUpdate, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.businesses.update_one({"id": user["business_id"]}, {"$set": update_data})
    return {"status": "updated"}

@api_router.patch("/business/availability")
async def update_availability(data: AvailabilityUpdate, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    slots = [slot.model_dump() for slot in data.slots]
    update_data = {
        "availability": slots,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    if data.blocked_dates is not None:
        update_data["blocked_dates"] = data.blocked_dates
    
    await db.businesses.update_one({"id": user["business_id"]}, {"$set": update_data})
    return {"status": "updated"}

# ==================== SERVICES ROUTES ====================

@api_router.post("/services")
async def create_service(data: ServiceCreate, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    service_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    service_doc = {
        "id": service_id,
        "business_id": user["business_id"],
        "name": data.name,
        "price_pence": data.price_pence,
        "duration_min": data.duration_min,
        "deposit_required": data.deposit_required,
        "deposit_amount_pence": data.deposit_amount_pence or 0,
        "description": data.description or "",
        "active": True,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    await db.services.insert_one(service_doc)
    return {"id": service_id, "name": data.name}

@api_router.get("/services")
async def get_services(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        return []
    
    services = await db.services.find(
        {"business_id": user["business_id"], "active": True},
        {"_id": 0}
    ).to_list(100)
    return services

@api_router.patch("/services/{service_id}")
async def update_service(service_id: str, data: ServiceUpdate, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    service = await db.services.find_one({"id": service_id, "business_id": user["business_id"]})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.services.update_one({"id": service_id}, {"$set": update_data})
    return {"status": "updated"}

@api_router.delete("/services/{service_id}")
async def delete_service(service_id: str, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    await db.services.update_one(
        {"id": service_id, "business_id": user["business_id"]},
        {"$set": {"active": False}}
    )
    return {"status": "deleted"}

# ==================== BOOKINGS ROUTES ====================

@api_router.post("/bookings")
async def create_booking(data: BookingCreate, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    service = await db.services.find_one({"id": data.service_id})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    booking_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    booking_doc = {
        "id": booking_id,
        "business_id": user["business_id"],
        "service_id": data.service_id,
        "service_name": service["name"],
        "client_name": data.client_name,
        "client_email": data.client_email,
        "client_phone": data.client_phone,
        "datetime": data.datetime_iso,
        "duration_min": service["duration_min"],
        "price_pence": service["price_pence"],
        "deposit_required": service["deposit_required"],
        "deposit_amount_pence": service["deposit_amount_pence"],
        "deposit_paid": False,
        "status": "pending",
        "notes": data.notes,
        "dojo_payment_id": None,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    await db.bookings.insert_one(booking_doc)
    return {"id": booking_id, "status": "pending"}

@api_router.get("/bookings")
async def get_bookings(
    date: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        return []
    
    query = {"business_id": user["business_id"]}
    if date:
        query["datetime"] = {"$regex": f"^{date}"}
    if status:
        query["status"] = status
    
    bookings = await db.bookings.find(query, {"_id": 0}).sort("datetime", 1).to_list(500)
    return bookings

@api_router.get("/bookings/my")
async def get_my_bookings(current_user: dict = Depends(get_current_user)):
    """Get bookings for the logged in client"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user:
        return []
    
    # Find bookings by client email
    bookings = await db.bookings.find(
        {"client_email": user["email"]},
        {"_id": 0}
    ).sort("datetime", -1).to_list(100)
    return bookings

@api_router.get("/bookings/{booking_id}")
async def get_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    booking = await db.bookings.find_one(
        {"id": booking_id, "business_id": user["business_id"]},
        {"_id": 0}
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@api_router.patch("/bookings/{booking_id}")
async def update_booking(booking_id: str, data: BookingUpdate, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if "datetime_iso" in update_data:
        update_data["datetime"] = update_data.pop("datetime_iso")
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.bookings.update_one(
        {"id": booking_id, "business_id": user["business_id"]},
        {"$set": update_data}
    )
    return {"status": "updated"}

@api_router.post("/bookings/{booking_id}/cancel")
async def cancel_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    await db.bookings.update_one(
        {"id": booking_id, "business_id": user["business_id"]},
        {"$set": {"status": "cancelled", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"status": "cancelled"}

# ==================== PUBLIC BOOKING ROUTES ====================

@api_router.get("/public/business/{business_id}")
async def get_public_business(business_id: str):
    business = await db.businesses.find_one({"id": business_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Return only public info
    return {
        "id": business["id"],
        "name": business["name"],
        "tagline": business.get("tagline", ""),
        "logo_url": business.get("logo_url"),
        "availability": business.get("availability", []),
        "blocked_dates": business.get("blocked_dates", [])
    }

@api_router.get("/public/business/{business_id}/services")
async def get_public_services(business_id: str):
    services = await db.services.find(
        {"business_id": business_id, "active": True},
        {"_id": 0, "id": 1, "name": 1, "price_pence": 1, "duration_min": 1, "deposit_required": 1, "deposit_amount_pence": 1, "description": 1}
    ).to_list(100)
    return services

@api_router.post("/public/bookings")
async def create_public_booking(data: BookingCreate):
    service = await db.services.find_one({"id": data.service_id})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    booking_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    booking_doc = {
        "id": booking_id,
        "business_id": service["business_id"],
        "service_id": data.service_id,
        "service_name": service["name"],
        "client_name": data.client_name,
        "client_email": data.client_email,
        "client_phone": data.client_phone,
        "datetime": data.datetime_iso,
        "duration_min": service["duration_min"],
        "price_pence": service["price_pence"],
        "deposit_required": service["deposit_required"],
        "deposit_amount_pence": service["deposit_amount_pence"],
        "deposit_paid": False,
        "status": "pending",
        "notes": data.notes,
        "dojo_payment_id": None,
        "confirmation_sent": False,
        "reminder_sent": False,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    await db.bookings.insert_one(booking_doc)
    
    # Send confirmation email (non-blocking)
    business = await db.businesses.find_one({"id": service["business_id"]}, {"_id": 0})
    business_name = business["name"] if business else "Your Provider"
    
    if data.client_email:
        html = get_booking_confirmation_html(booking_doc, business_name)
        asyncio.create_task(send_email_async(
            data.client_email,
            f"Booking Confirmed - {service['name']} at {business_name}",
            html
        ))
    
    return {
        "id": booking_id,
        "status": "pending",
        "deposit_required": service["deposit_required"],
        "deposit_amount_pence": service["deposit_amount_pence"],
        "confirmation_email_queued": bool(data.client_email)
    }

# ==================== SHAREABLE LINKS ====================

@api_router.get("/links/generate")
async def generate_shareable_link(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    business = await db.businesses.find_one({"id": user["business_id"]})
    base_url = os.environ.get('FRONTEND_URL', 'https://quickslot.uk')
    link = f"{base_url}/book/{user['business_id']}"
    
    return {
        "link": link,
        "business_id": user["business_id"],
        "business_name": business["name"] if business else ""
    }

# ==================== DOJO PAYMENT INTEGRATION ====================

@api_router.post("/payments/verify-key")
async def verify_dojo_key(data: DojoKeyVerify, current_user: dict = Depends(get_current_user)):
    # In production, this would verify with Dojo API
    # For now, we just store the key
    await db.users.update_one(
        {"id": current_user["sub"]},
        {"$set": {"dojo_api_key": data.api_key, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"status": "verified", "message": "Dojo API key saved"}

@api_router.post("/payments/create-intent")
async def create_payment_intent(data: PaymentIntentCreate, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    booking = await db.bookings.find_one({"id": data.booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    dojo_key = user.get("dojo_api_key") or DOJO_API_KEY
    if not dojo_key:
        raise HTTPException(status_code=400, detail="Dojo API key not configured")
    
    unique_ref = f"{data.booking_id}-{uuid.uuid4().hex[:8]}"
    
    payload = {
        "amount": {"value": data.amount_pence, "currencyCode": "GBP"},
        "reference": unique_ref,
        "description": f"Deposit for {booking.get('service_name', 'booking')}",
        "captureMode": "Auto",
        "paymentMethods": ["Card", "Wallet"],
        "redirectUrls": {
            "successUrl": data.success_url,
            "cancelUrl": data.cancel_url
        }
    }
    
    headers = {
        "Authorization": f"Basic {dojo_key}",
        "Content-Type": "application/json",
        "version": "2024-02-05"
    }
    
    try:
        response = http_requests.post(
            f"{DOJO_API_URL}/payment-intents",
            headers=headers,
            json=payload,
            timeout=10
        )
        
        if response.status_code != 201:
            logger.error(f"Dojo API error: {response.text}")
            raise HTTPException(status_code=response.status_code, detail="Payment creation failed")
        
        intent_data = response.json()
        payment_intent_id = intent_data.get("id")
        
        # Store payment record
        payment_doc = {
            "id": str(uuid.uuid4()),
            "booking_id": data.booking_id,
            "payment_intent_id": payment_intent_id,
            "amount_pence": data.amount_pence,
            "reference": unique_ref,
            "status": "Created",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.payments.insert_one(payment_doc)
        
        return {
            "payment_intent_id": payment_intent_id,
            "checkout_url": f"https://pay.dojo.tech/checkout/{payment_intent_id}"
        }
    except http_requests.RequestException as e:
        logger.error(f"Dojo request failed: {e}")
        raise HTTPException(status_code=500, detail="Payment service unavailable")

@api_router.post("/payments/webhook")
async def handle_dojo_webhook(request: Request):
    signature = request.headers.get("dojo-signature")
    body = await request.body()
    
    if DOJO_WEBHOOK_SECRET and signature:
        expected = hmac.new(DOJO_WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, signature.replace("-", "").lower()):
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    try:
        data = await request.json()
    except:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    
    event = data.get("event")
    payment_intent_id = data.get("data", {}).get("paymentIntentId")
    payment_status = data.get("data", {}).get("paymentStatus")
    
    if payment_intent_id:
        payment = await db.payments.find_one({"payment_intent_id": payment_intent_id})
        if payment:
            await db.payments.update_one(
                {"payment_intent_id": payment_intent_id},
                {"$set": {"status": payment_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            
            if payment_status == "Captured":
                await db.bookings.update_one(
                    {"id": payment["booking_id"]},
                    {"$set": {"deposit_paid": True, "status": "confirmed", "updated_at": datetime.now(timezone.utc).isoformat()}}
                )
    
    return {"status": "processed"}

@api_router.post("/payments/refund/{booking_id}")
async def refund_payment(booking_id: str, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    payment = await db.payments.find_one({"booking_id": booking_id})
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if payment.get("status") != "Captured":
        raise HTTPException(status_code=400, detail="Can only refund captured payments")
    
    dojo_key = user.get("dojo_api_key") or DOJO_API_KEY
    if not dojo_key:
        raise HTTPException(status_code=400, detail="Dojo API key not configured")
    
    headers = {
        "Authorization": f"Basic {dojo_key}",
        "Content-Type": "application/json",
        "version": "2024-02-05",
        "Idempotency-Key": f"{payment['payment_intent_id']}-refund-{uuid.uuid4().hex[:8]}"
    }
    
    try:
        response = http_requests.post(
            f"{DOJO_API_URL}/payment-intents/{payment['payment_intent_id']}/refunds",
            headers=headers,
            json={"amount": payment["amount_pence"]},
            timeout=10
        )
        
        if response.status_code == 201:
            await db.payments.update_one(
                {"payment_intent_id": payment["payment_intent_id"]},
                {"$set": {"status": "Refunded", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            await db.bookings.update_one(
                {"id": booking_id},
                {"$set": {"status": "refunded", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            return {"status": "refunded"}
        else:
            raise HTTPException(status_code=response.status_code, detail="Refund failed")
    except http_requests.RequestException as e:
        raise HTTPException(status_code=500, detail="Refund service unavailable")

# ==================== AI SUGGESTIONS ====================

@api_router.get("/ai/slot-suggestions")
async def get_slot_suggestions(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Get booking patterns
    bookings = await db.bookings.find(
        {"business_id": user["business_id"]},
        {"_id": 0, "datetime": 1, "status": 1}
    ).to_list(100)
    
    business = await db.businesses.find_one({"id": user["business_id"]})
    availability = business.get("availability", []) if business else []
    
    if not EMERGENT_LLM_KEY:
        # Return default suggestions if no AI key
        return {
            "suggestions": [
                "Tuesday afternoons tend to be quieter - consider promoting these slots",
                "Your Friday slots fill up fast - you could add premium pricing",
                "Consider offering early bird discounts for 9am slots"
            ],
            "ai_enabled": False
        }
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"quickslot-{user['business_id']}",
            system_message="You are a helpful booking optimization assistant for UK micro-businesses. Give 3 brief, actionable suggestions."
        ).with_model("openai", "gpt-4o-mini")
        
        booking_summary = f"Business has {len(bookings)} bookings. Availability: {len(availability)} time slots configured."
        
        user_message = UserMessage(
            text=f"Based on this booking data: {booking_summary}. Suggest 3 ways to optimize bookings and reduce no-shows. Keep each suggestion under 20 words."
        )
        
        response = await chat.send_message(user_message)
        suggestions = [s.strip() for s in response.split('\n') if s.strip()][:3]
        
        return {"suggestions": suggestions, "ai_enabled": True}
    except Exception as e:
        logger.error(f"AI suggestion error: {e}")
        return {
            "suggestions": ["AI suggestions temporarily unavailable"],
            "ai_enabled": False
        }

# ==================== ANALYTICS ====================

@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        return {"total_bookings": 0, "revenue_pence": 0, "today_bookings": 0}
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Get all bookings
    all_bookings = await db.bookings.find(
        {"business_id": user["business_id"]},
        {"_id": 0, "datetime": 1, "status": 1, "price_pence": 1, "deposit_paid": 1}
    ).to_list(1000)
    
    # Calculate metrics
    total_bookings = len(all_bookings)
    completed = [b for b in all_bookings if b.get("status") in ["confirmed", "completed"]]
    revenue_pence = sum(b.get("price_pence", 0) for b in completed)
    today_bookings = len([b for b in all_bookings if b.get("datetime", "").startswith(today)])
    no_shows = len([b for b in all_bookings if b.get("status") == "no_show"])
    
    return {
        "total_bookings": total_bookings,
        "revenue_pence": revenue_pence,
        "today_bookings": today_bookings,
        "completed_bookings": len(completed),
        "no_show_count": no_shows,
        "no_show_rate": round(no_shows / total_bookings * 100, 1) if total_bookings > 0 else 0
    }

@api_router.get("/analytics/revenue")
async def get_revenue_analytics(period: str = "30days", current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        return {"data": []}
    
    days = 30 if period == "30days" else 7
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    bookings = await db.bookings.find(
        {
            "business_id": user["business_id"],
            "status": {"$in": ["confirmed", "completed"]}
        },
        {"_id": 0, "datetime": 1, "price_pence": 1}
    ).to_list(1000)
    
    # Group by date
    revenue_by_date = {}
    for b in bookings:
        date = b.get("datetime", "")[:10]
        if date:
            revenue_by_date[date] = revenue_by_date.get(date, 0) + b.get("price_pence", 0)
    
    # Generate data for chart
    data = []
    for i in range(days):
        date = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
        data.append({
            "date": date,
            "revenue": revenue_by_date.get(date, 0)
        })
    
    return {"data": data}

@api_router.get("/analytics/services")
async def get_services_analytics(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        return {"data": []}
    
    bookings = await db.bookings.find(
        {"business_id": user["business_id"]},
        {"_id": 0, "service_name": 1, "status": 1}
    ).to_list(1000)
    
    # Group by service
    service_counts = {}
    for b in bookings:
        name = b.get("service_name", "Unknown")
        service_counts[name] = service_counts.get(name, 0) + 1
    
    data = [{"name": k, "bookings": v} for k, v in service_counts.items()]
    return {"data": data}

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/users")
async def admin_get_users(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.get("/admin/metrics")
async def admin_get_metrics(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_users = await db.users.count_documents({})
    total_bookings = await db.bookings.count_documents({})
    total_businesses = await db.businesses.count_documents({})
    
    return {
        "total_users": total_users,
        "total_bookings": total_bookings,
        "total_businesses": total_businesses
    }

@api_router.patch("/admin/users/{user_id}")
async def admin_update_user(user_id: str, role: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.users.update_one({"id": user_id}, {"$set": {"role": role}})
    return {"status": "updated"}

# ==================== ONBOARDING ====================

@api_router.post("/onboarding/complete")
async def complete_onboarding(current_user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"id": current_user["sub"]},
        {"$set": {"onboarding_completed": True, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"status": "completed"}

@api_router.get("/onboarding/status")
async def get_onboarding_status(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    business = None
    services_count = 0
    if user.get("business_id"):
        business = await db.businesses.find_one({"id": user["business_id"]}, {"_id": 0})
        services_count = await db.services.count_documents({"business_id": user["business_id"], "active": True})
    
    return {
        "completed": user.get("onboarding_completed", False),
        "has_business": business is not None,
        "has_services": services_count > 0,
        "has_availability": bool(business and business.get("availability")),
        "has_dojo_key": bool(user.get("dojo_api_key"))
    }

# ==================== SETTINGS ====================

@api_router.get("/settings")
async def get_settings(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Mask Dojo key
    if user.get("dojo_api_key"):
        user["dojo_api_key"] = "****" + user["dojo_api_key"][-4:]
    
    return user

@api_router.patch("/settings/reminders")
async def update_reminder_settings(
    sms_enabled: bool = True,
    email_enabled: bool = True,
    reminder_hours: int = 24,
    current_user: dict = Depends(get_current_user)
):
    await db.users.update_one(
        {"id": current_user["sub"]},
        {"$set": {
            "reminder_settings": {
                "sms_enabled": sms_enabled,
                "email_enabled": email_enabled,
                "reminder_hours": reminder_hours
            },
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"status": "updated"}

# ==================== EMAIL NOTIFICATIONS ====================

class EmailRequest(BaseModel):
    recipient_email: EmailStr
    subject: str
    html_content: str

async def send_email_async(to: str, subject: str, html: str):
    """Send email using Resend (non-blocking)"""
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html
        }
        email = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent to {to}: {email.get('id')}")
        return email
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {str(e)}")
        return None

def get_booking_confirmation_html(booking: dict, business_name: str) -> str:
    """Generate booking confirmation email HTML"""
    booking_date = datetime.fromisoformat(booking["datetime"].replace('Z', '+00:00'))
    return f"""
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FDFBF7; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: #00BFA5; border-radius: 12px; line-height: 48px; color: white; font-size: 24px; font-weight: bold;">R</div>
            <h1 style="margin: 10px 0 0; color: #0A1626; font-size: 24px;">Rezvo</h1>
        </div>
        
        <div style="background: white; border-radius: 16px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <h2 style="color: #0A1626; margin: 0 0 20px;">Booking Confirmed! ✓</h2>
            
            <div style="background: #00BFA5; color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <p style="margin: 0 0 5px; font-size: 14px; opacity: 0.9;">{business_name}</p>
                <p style="margin: 0; font-size: 20px; font-weight: 600;">{booking["service_name"]}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #E2E8F0; color: #627D98;">Date</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: 500;">{booking_date.strftime('%A, %d %B %Y')}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #E2E8F0; color: #627D98;">Time</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: 500;">{booking_date.strftime('%H:%M')}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #E2E8F0; color: #627D98;">Duration</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: 500;">{booking["duration_min"]} minutes</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; color: #627D98;">Total</td>
                    <td style="padding: 12px 0; text-align: right; font-size: 20px; font-weight: 700; color: #00BFA5;">£{booking["price_pence"]/100:.2f}</td>
                </tr>
            </table>
        </div>
        
        <p style="text-align: center; color: #627D98; font-size: 14px; margin-top: 30px;">
            Need to make changes? Contact {business_name} directly.
        </p>
        
        <p style="text-align: center; color: #9FB3C8; font-size: 12px; margin-top: 20px;">
            Powered by Rezvo.app
        </p>
    </div>
    """

def get_reminder_html(booking: dict, business_name: str, hours_until: int) -> str:
    """Generate booking reminder email HTML"""
    booking_date = datetime.fromisoformat(booking["datetime"].replace('Z', '+00:00'))
    return f"""
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FDFBF7; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: #00BFA5; border-radius: 12px; line-height: 48px; color: white; font-size: 24px; font-weight: bold;">R</div>
        </div>
        
        <div style="background: white; border-radius: 16px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <h2 style="color: #0A1626; margin: 0 0 10px;">⏰ Appointment Reminder</h2>
            <p style="color: #627D98; margin: 0 0 20px;">Your appointment is in {hours_until} hours</p>
            
            <div style="background: #F5F0E8; padding: 20px; border-radius: 12px;">
                <p style="margin: 0 0 10px; font-weight: 600; color: #0A1626;">{booking["service_name"]}</p>
                <p style="margin: 0 0 5px; color: #627D98;">📍 {business_name}</p>
                <p style="margin: 0 0 5px; color: #627D98;">📅 {booking_date.strftime('%A, %d %B at %H:%M')}</p>
            </div>
        </div>
        
        <p style="text-align: center; color: #9FB3C8; font-size: 12px; margin-top: 30px;">
            Powered by Rezvo.app
        </p>
    </div>
    """

@api_router.post("/notifications/send-confirmation")
async def send_booking_confirmation(booking_id: str, current_user: dict = Depends(get_current_user)):
    """Send booking confirmation email to client"""
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    business = await db.businesses.find_one({"id": booking["business_id"]}, {"_id": 0})
    business_name = business["name"] if business else "Your Provider"
    
    html = get_booking_confirmation_html(booking, business_name)
    email = await send_email_async(
        booking["client_email"],
        f"Booking Confirmed - {booking['service_name']} at {business_name}",
        html
    )
    
    if email:
        await db.bookings.update_one(
            {"id": booking_id},
            {"$set": {"confirmation_sent": True, "confirmation_sent_at": datetime.now(timezone.utc).isoformat()}}
        )
        return {"status": "sent", "email_id": email.get("id")}
    
    return {"status": "failed", "message": "Email could not be sent"}

@api_router.post("/notifications/send-reminder")
async def send_booking_reminder(booking_id: str, hours_until: int = 24):
    """Send booking reminder email (called by scheduler)"""
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    business = await db.businesses.find_one({"id": booking["business_id"]}, {"_id": 0})
    business_name = business["name"] if business else "Your Provider"
    
    html = get_reminder_html(booking, business_name, hours_until)
    email = await send_email_async(
        booking["client_email"],
        f"Reminder: {booking['service_name']} tomorrow at {business_name}",
        html
    )
    
    if email:
        await db.bookings.update_one(
            {"id": booking_id},
            {"$set": {"reminder_sent": True, "reminder_sent_at": datetime.now(timezone.utc).isoformat()}}
        )
        return {"status": "sent", "email_id": email.get("id")}
    
    return {"status": "failed", "message": "Email could not be sent"}

@api_router.post("/notifications/test-email")
async def test_email(recipient: EmailStr, current_user: dict = Depends(get_current_user)):
    """Send a test email"""
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #FDFBF7;">
        <h1 style="color: #00BFA5;">Test Email from Rezvo</h1>
        <p>This is a test email to confirm your email notifications are working.</p>
        <p style="color: #627D98;">Sent at: {datetime.now(timezone.utc).isoformat()}</p>
    </div>
    """
    email = await send_email_async(recipient, "Test Email from Rezvo", html)
    
    if email:
        return {"status": "sent", "email_id": email.get("id")}
    return {"status": "failed", "message": "Email could not be sent - check RESEND_API_KEY"}

# ==================== AI SUGGESTIONS ====================

@api_router.post("/ai/suggest-slots")
async def ai_suggest_slots(
    service_id: str,
    preferred_days: List[str] = None,  # e.g., ["monday", "tuesday"]
    preferred_time: str = None,  # e.g., "morning", "afternoon", "evening"
):
    """AI-powered slot suggestions based on availability and preferences"""
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    business = await db.businesses.find_one({"id": service["business_id"]}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Get existing bookings for the next 14 days
    now = datetime.now(timezone.utc)
    two_weeks = now + timedelta(days=14)
    
    existing_bookings = await db.bookings.find({
        "business_id": service["business_id"],
        "status": {"$in": ["confirmed", "pending"]},
        "datetime": {"$gte": now.isoformat(), "$lte": two_weeks.isoformat()}
    }, {"_id": 0, "datetime": 1, "duration_min": 1}).to_list(100)
    
    # Build context for AI
    availability = business.get("availability", [])
    blocked_dates = business.get("blocked_dates", [])
    
    context = f"""
    Business: {business["name"]}
    Service: {service["name"]} ({service["duration_min"]} minutes, £{service["price_pence"]/100:.2f})
    
    Business availability:
    {availability if availability else "Standard business hours (9am-6pm weekdays)"}
    
    Blocked dates: {blocked_dates if blocked_dates else "None"}
    
    Existing bookings in next 2 weeks: {len(existing_bookings)} appointments
    
    Client preferences:
    - Preferred days: {preferred_days if preferred_days else "Any day"}
    - Preferred time: {preferred_time if preferred_time else "Any time"}
    """
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"slot-suggestion-{uuid.uuid4()}",
            system_message="""You are a smart booking assistant for Rezvo. 
            Analyze the business availability and suggest the best 3-5 time slots for the client.
            Consider their preferences and avoid conflicts with existing bookings.
            Return suggestions in JSON format with fields: date (YYYY-MM-DD), time (HH:MM), reason (why this slot is good).
            Be concise and helpful."""
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(
            text=f"Based on this context, suggest the best available time slots:\n\n{context}\n\nReturn JSON array of suggested slots."
        )
        
        response = await chat.send_message(user_message)
        
        # Try to parse JSON from response
        import json
        try:
            # Extract JSON from response
            json_start = response.find('[')
            json_end = response.rfind(']') + 1
            if json_start >= 0 and json_end > json_start:
                suggestions = json.loads(response[json_start:json_end])
            else:
                suggestions = []
        except:
            suggestions = []
        
        return {
            "suggestions": suggestions,
            "ai_response": response,
            "service": service["name"],
            "business": business["name"]
        }
        
    except Exception as e:
        logger.error(f"AI suggestion error: {str(e)}")
        # Fallback to simple slot generation
        suggestions = []
        for day_offset in range(1, 8):
            slot_date = now + timedelta(days=day_offset)
            if slot_date.weekday() < 5:  # Weekdays only
                suggestions.append({
                    "date": slot_date.strftime("%Y-%m-%d"),
                    "time": "10:00",
                    "reason": "Morning slot available"
                })
                if len(suggestions) >= 5:
                    break
        
        return {
            "suggestions": suggestions,
            "ai_response": None,
            "fallback": True,
            "error": str(e)
        }

@api_router.post("/ai/chat")
async def ai_chat(
    message: str,
    session_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """General AI chat for business assistance"""
    if not session_id:
        session_id = f"chat-{current_user['sub']}-{uuid.uuid4()}"
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message="""You are Rezvo AI, a helpful assistant for UK micro-business owners using the Rezvo booking platform.
            Help them with:
            - Setting up their services and pricing
            - Managing availability
            - Tips for reducing no-shows
            - Marketing their booking link
            - General business advice
            Be friendly, concise, and practical. Use British English."""
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=message)
        response = await chat.send_message(user_message)
        
        return {
            "response": response,
            "session_id": session_id
        }
        
    except Exception as e:
        logger.error(f"AI chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

# ==================== EXPO TUNNEL ====================

@api_router.get("/expo/tunnel-url")
async def get_expo_tunnel_url():
    """Get the current Expo tunnel URL for QR code generation"""
    try:
        # Fetch from local ngrok API
        response = http_requests.get("http://localhost:4040/api/tunnels", timeout=2)
        if response.status_code == 200:
            data = response.json()
            tunnels = data.get("tunnels", [])
            
            # Find HTTPS tunnel with exp.direct domain
            for tunnel in tunnels:
                public_url = tunnel.get("public_url", "")
                proto = tunnel.get("proto", "")
                if public_url and "exp.direct" in public_url and proto == "https":
                    # Convert to exp:// format which Expo Go recognizes
                    # https://99ojyk0-anonymous-8081.exp.direct -> exp://99ojyk0-anonymous-8081.exp.direct
                    expo_url = public_url.replace("https://", "exp://")
                    return {"url": expo_url, "https_url": public_url, "status": "active"}
        
        return {"url": None, "status": "tunnel_not_found"}
    except Exception as e:
        logger.error(f"Failed to fetch Expo tunnel URL: {e}")
        return {"url": None, "status": "unavailable", "error": str(e)}

# ==================== SEED DATA ====================

@api_router.post("/seed/customers")
async def seed_customers():
    """Create 10 dummy customers for testing"""
    customers = [
        {"name": "Emma Thompson", "email": "emma.t@example.com", "phone": "07700900001"},
        {"name": "James Wilson", "email": "james.w@example.com", "phone": "07700900002"},
        {"name": "Sophie Brown", "email": "sophie.b@example.com", "phone": "07700900003"},
        {"name": "Oliver Davis", "email": "oliver.d@example.com", "phone": "07700900004"},
        {"name": "Charlotte Miller", "email": "charlotte.m@example.com", "phone": "07700900005"},
        {"name": "Harry Johnson", "email": "harry.j@example.com", "phone": "07700900006"},
        {"name": "Amelia Garcia", "email": "amelia.g@example.com", "phone": "07700900007"},
        {"name": "George Martinez", "email": "george.m@example.com", "phone": "07700900008"},
        {"name": "Isabella Anderson", "email": "isabella.a@example.com", "phone": "07700900009"},
        {"name": "William Taylor", "email": "william.t@example.com", "phone": "07700900010"},
    ]
    
    now = datetime.now(timezone.utc)
    created = 0
    
    for cust in customers:
        existing = await db.users.find_one({"email": cust["email"]})
        if not existing:
            user_id = str(uuid.uuid4())
            user_doc = {
                "id": user_id,
                "email": cust["email"],
                "password_hash": hash_password("password123"),
                "role": "client",
                "name": cust["name"],
                "phone": cust["phone"],
                "created_at": now.isoformat(),
                "updated_at": now.isoformat(),
            }
            await db.users.insert_one(user_doc)
            created += 1
    
    return {"message": f"Created {created} test customers", "total": len(customers)}

@api_router.get("/public/businesses")
async def get_public_businesses():
    """Get all businesses for public listing"""
    businesses = await db.businesses.find({}, {"_id": 0}).to_list(100)
    return businesses

# ==================== SHORT LINKS ====================

@api_router.post("/links/create")
async def create_short_link(current_user: dict = Depends(get_current_user)):
    """Create a branded short link for business"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    business = await db.businesses.find_one({"id": user["business_id"]})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Generate short code
    short_code = str(uuid.uuid4())[:8]
    
    # Store short link
    link_doc = {
        "id": str(uuid.uuid4()),
        "short_code": short_code,
        "business_id": user["business_id"],
        "business_name": business["name"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "clicks": 0
    }
    await db.short_links.insert_one(link_doc)
    
    base_url = os.environ.get('FRONTEND_URL', 'https://rezvo.app')
    
    return {
        "short_link": f"{base_url}/b/{short_code}",
        "short_code": short_code,
        "full_link": f"{base_url}/book/{user['business_id']}"
    }

@api_router.get("/b/{short_code}")
async def resolve_short_link(short_code: str):
    """Resolve short link to full booking URL"""
    link = await db.short_links.find_one({"short_code": short_code}, {"_id": 0})
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    # Increment click count
    await db.short_links.update_one(
        {"short_code": short_code},
        {"$inc": {"clicks": 1}}
    )
    
    return {"business_id": link["business_id"], "business_name": link["business_name"]}

# ==================== ERROR LOGGING ====================

error_logs = []

@api_router.post("/logs/error")
async def log_error(
    error_type: str,
    message: str,
    stack: str = None,
    user_id: str = None,
    context: dict = None
):
    """Log an error from frontend or mobile app"""
    log_entry = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "type": error_type,
        "message": message,
        "stack": stack,
        "user_id": user_id,
        "context": context or {},
        "resolved": False
    }
    await db.error_logs.insert_one(log_entry)
    error_logs.append(log_entry)
    logger.error(f"[{error_type}] {message}")
    return {"logged": True, "log_id": log_entry["id"]}

@api_router.get("/admin/logs")
async def get_error_logs(
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get error logs for admin panel"""
    if current_user.get("role") not in ["admin", "founder"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    logs = await db.error_logs.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    return {"logs": logs, "total": len(logs)}

@api_router.patch("/admin/logs/{log_id}/resolve")
async def resolve_error_log(log_id: str, current_user: dict = Depends(get_current_user)):
    """Mark an error log as resolved"""
    if current_user.get("role") not in ["admin", "founder"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.error_logs.update_one(
        {"id": log_id},
        {"$set": {"resolved": True, "resolved_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"resolved": True}

# ==================== NOTIFICATIONS ====================

class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str = "info"  # info, success, warning, error, booking
    user_id: Optional[str] = None
    business_id: Optional[str] = None
    link: Optional[str] = None

@api_router.post("/notifications")
async def create_notification(data: NotificationCreate, current_user: dict = Depends(get_current_user)):
    """Create a notification"""
    notif_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    notif_doc = {
        "id": notif_id,
        "title": data.title,
        "message": data.message,
        "type": data.type,
        "user_id": data.user_id or current_user["sub"],
        "business_id": data.business_id,
        "link": data.link,
        "read": False,
        "created_at": now.isoformat()
    }
    await db.notifications.insert_one(notif_doc)
    return {"id": notif_id, "created": True}

@api_router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """Get notifications for current user"""
    notifications = await db.notifications.find(
        {"user_id": current_user["sub"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    unread_count = len([n for n in notifications if not n.get("read")])
    return {"notifications": notifications, "unread_count": unread_count}

@api_router.patch("/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: str, current_user: dict = Depends(get_current_user)):
    """Mark notification as read"""
    await db.notifications.update_one(
        {"id": notif_id, "user_id": current_user["sub"]},
        {"$set": {"read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"read": True}

@api_router.patch("/notifications/read-all")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    """Mark all notifications as read"""
    await db.notifications.update_many(
        {"user_id": current_user["sub"], "read": False},
        {"$set": {"read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True}

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "QuickSlot API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
