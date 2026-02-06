from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request, UploadFile, File, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse, RedirectResponse
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
import base64
import shutil
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GoogleRequest
from googleapiclient.discovery import build
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

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

# Google Calendar Config
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
GOOGLE_REDIRECT_URI = os.environ.get('FRONTEND_URL', '') + '/api/google/callback'

# Uploads directory
UPLOADS_DIR = ROOT_DIR / 'uploads'
UPLOADS_DIR.mkdir(exist_ok=True)

# Scheduler for automated reminders
scheduler = AsyncIOScheduler()

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

# ==================== PRODUCTS MODELS ====================

class ProductCreate(BaseModel):
    name: str
    price_pence: int
    description: Optional[str] = None
    stock_quantity: Optional[int] = None
    category: Optional[str] = None
    image_url: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price_pence: Optional[int] = None
    description: Optional[str] = None
    stock_quantity: Optional[int] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    active: Optional[bool] = None

class AvailabilitySlot(BaseModel):
    day: int  # 0=Sunday, 1=Monday, etc.
    start_min: int  # Minutes from midnight (e.g., 540 = 9am)
    end_min: int  # Minutes from midnight (e.g., 1020 = 5pm)

class AvailabilityUpdate(BaseModel):
    slots: List[AvailabilitySlot]
    blocked_dates: Optional[List[str]] = None  # ISO date strings

# ==================== TEAM MEMBER MODELS ====================

class TeamMemberCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: str = "staff"  # staff, manager, admin
    color: str = "#00BFA5"  # For calendar color coding
    avatar_url: Optional[str] = None
    service_ids: List[str] = []  # Services this member can perform
    working_hours: Optional[List[dict]] = None  # Custom working hours
    show_on_booking_page: bool = True  # Whether to show on public booking page

class TeamMemberUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    color: Optional[str] = None
    avatar_url: Optional[str] = None
    service_ids: Optional[List[str]] = None
    working_hours: Optional[List[dict]] = None
    active: Optional[bool] = None
    show_on_booking_page: Optional[bool] = None

# ==================== PASSWORD RESET MODELS ====================

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str

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
    team_member_id: Optional[str] = None

class PaymentIntentCreate(BaseModel):
    booking_id: str
    amount_pence: int
    success_url: str
    cancel_url: str

# ==================== SUPPORT MESSAGE MODELS ====================

class MessageCreate(BaseModel):
    content: str
    recipient_type: str = "support"  # support, business, client
    subject: Optional[str] = None

class ConversationResponse(BaseModel):
    id: str
    participants: List[str]
    last_message: Optional[str]
    last_message_at: Optional[str]
    unread_count: int

# ==================== STAFF LOGIN MODELS ====================

class StaffLogin(BaseModel):
    email: EmailStr
    password: str
    business_id: str

class StaffCreate(BaseModel):
    email: EmailStr
    password: str
    team_member_id: str

# ==================== REVIEW MODELS ====================

class ReviewCreate(BaseModel):
    booking_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: str
    business_id: str
    booking_id: str
    client_name: str
    rating: int
    comment: Optional[str]
    created_at: str
    response: Optional[str] = None

# ==================== LOCATION MODELS ====================

class LocationCreate(BaseModel):
    name: str
    address: str
    phone: Optional[str] = None
    email: Optional[str] = None
    is_primary: bool = False

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_primary: Optional[bool] = None
    active: Optional[bool] = None

# ==================== SHIFT/SCHEDULE MODELS ====================

class ShiftCreate(BaseModel):
    team_member_id: str
    date: str  # ISO date string YYYY-MM-DD
    start_time: str  # HH:MM format
    end_time: str  # HH:MM format
    location_id: Optional[str] = None
    notes: Optional[str] = None

class ShiftUpdate(BaseModel):
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location_id: Optional[str] = None
    notes: Optional[str] = None

class TimeOffRequest(BaseModel):
    team_member_id: str
    start_date: str
    end_date: str
    reason: Optional[str] = None

# ==================== PUSH NOTIFICATION MODELS ====================

class PushTokenRegister(BaseModel):
    token: str
    device_type: str = "expo"  # expo, fcm, apns

class DojoKeyVerify(BaseModel):
    api_key: str

# ==================== OTP MODELS ====================

class SendOtpRequest(BaseModel):
    phone: str

class VerifyOtpRequest(BaseModel):
    phone: str
    code: str
    verification_id: str

class RegisterWithOtp(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    business_name: str
    address: Optional[str] = None
    phone: str
    auth_method: str = "email"  # email or google

class GoogleSignupRequest(BaseModel):
    google_token: str
    google_id: Optional[str] = None  # Google's unique user ID (sub)
    email: Optional[str] = None
    name: Optional[str] = None
    full_name: Optional[str] = None
    business_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    auth_method: str = "google"

class ForgotPasswordOtpRequest(BaseModel):
    phone: str

class ResetPasswordOtpRequest(BaseModel):
    phone: str
    verification_id: str
    new_password: str

class OnboardingData(BaseModel):
    business_type: str
    address: Optional[str] = None
    postcode: Optional[str] = None
    city: Optional[str] = None
    team_members: List[dict] = []

# Sendly API Configuration
SENDLY_API_KEY = os.environ.get('SENDLY_API_KEY', '')
SENDLY_API_URL = 'https://sendly.live/api/v1/messages'

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

# ==================== SEARCH ====================

@api_router.get("/search")
async def global_search(q: str, current_user: dict = Depends(get_current_user)):
    """Global search across bookings, services, and customers"""
    if not q or len(q) < 2:
        return {"bookings": [], "services": [], "customers": []}
    
    user = await db.users.find_one({"id": current_user["sub"]})
    business_id = user.get("business_id") if user else None
    
    results = {"bookings": [], "services": [], "customers": []}
    
    if business_id:
        # Search bookings
        bookings_query = {
            "business_id": business_id,
            "$or": [
                {"client_name": {"$regex": q, "$options": "i"}},
                {"client_email": {"$regex": q, "$options": "i"}},
                {"service_name": {"$regex": q, "$options": "i"}},
                {"notes": {"$regex": q, "$options": "i"}}
            ]
        }
        bookings = await db.bookings.find(bookings_query, {"_id": 0}).limit(10).to_list(10)
        results["bookings"] = bookings
        
        # Search services
        services_query = {
            "business_id": business_id,
            "name": {"$regex": q, "$options": "i"}
        }
        services = await db.services.find(services_query, {"_id": 0}).limit(10).to_list(10)
        results["services"] = services
        
        # Search unique customers from bookings
        customer_pipeline = [
            {"$match": {"business_id": business_id, "$or": [
                {"client_name": {"$regex": q, "$options": "i"}},
                {"client_email": {"$regex": q, "$options": "i"}}
            ]}},
            {"$group": {"_id": "$client_email", "name": {"$first": "$client_name"}, "email": {"$first": "$client_email"}, "phone": {"$first": "$client_phone"}}},
            {"$limit": 10}
        ]
        customers = await db.bookings.aggregate(customer_pipeline).to_list(10)
        results["customers"] = [{"name": c["name"], "email": c["email"], "phone": c.get("phone")} for c in customers]
    
    return results

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

# ==================== OTP AUTH ROUTES ====================

import random
import string

def generate_otp_code():
    """Generate a 6-digit OTP code"""
    return ''.join(random.choices(string.digits, k=6))

async def send_sms_via_sendly(phone: str, message: str) -> bool:
    """Send SMS via Sendly API"""
    try:
        headers = {
            'Authorization': f'Bearer {SENDLY_API_KEY}',
            'Content-Type': 'application/json'
        }
        payload = {
            'to': phone,
            'text': message,
            'messageType': 'transactional'
        }
        response = http_requests.post(SENDLY_API_URL, json=payload, headers=headers)
        logger.info(f"Sendly response: {response.status_code} - {response.text}")
        return response.status_code == 200 or response.status_code == 201
    except Exception as e:
        logger.error(f"Sendly SMS error: {e}")
        return False

@api_router.post("/auth/send-otp")
async def send_otp(data: SendOtpRequest):
    """Send OTP to phone number for signup verification"""
    phone = data.phone.strip()
    
    # Generate OTP and verification ID
    otp_code = generate_otp_code()
    verification_id = str(uuid.uuid4())
    
    # Store OTP in database with expiry
    now = datetime.now(timezone.utc)
    otp_doc = {
        "verification_id": verification_id,
        "phone": phone,
        "code": otp_code,
        "type": "signup",
        "verified": False,
        "created_at": now,
        "expires_at": now + timedelta(minutes=10)
    }
    await db.otp_verifications.insert_one(otp_doc)
    
    # Send SMS
    message = f"Your Rezvo verification code is: {otp_code}. This code expires in 10 minutes."
    sms_sent = await send_sms_via_sendly(phone, message)
    
    if not sms_sent:
        # For testing, log the code
        logger.info(f"OTP for {phone}: {otp_code}")
    
    return {"verification_id": verification_id, "message": "OTP sent successfully"}

@api_router.post("/auth/verify-otp")
async def verify_otp(data: VerifyOtpRequest):
    """Verify OTP code"""
    now = datetime.now(timezone.utc)
    
    # Find the OTP record
    otp_record = await db.otp_verifications.find_one({
        "verification_id": data.verification_id,
        "phone": data.phone,
        "type": "signup",
        "verified": False
    })
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid verification request")
    
    # Check expiry
    expires_at = otp_record.get("expires_at")
    if expires_at:
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
        elif expires_at.tzinfo is None:
            # Make naive datetime timezone-aware (assume UTC)
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < now:
            raise HTTPException(status_code=400, detail="OTP has expired")
    
    # Check code
    if otp_record["code"] != data.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # Mark as verified
    await db.otp_verifications.update_one(
        {"verification_id": data.verification_id},
        {"$set": {"verified": True, "verified_at": now}}
    )
    
    return {"message": "Phone verified successfully", "verified": True}

@api_router.post("/auth/register")
async def register_with_otp(data: RegisterWithOtp):
    """Register a new user after OTP verification"""
    # Check if email already exists
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Verify phone was verified
    otp_record = await db.otp_verifications.find_one({
        "phone": data.phone,
        "type": "signup",
        "verified": True
    })
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Phone number not verified")
    
    user_id = str(uuid.uuid4())
    business_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    # Create user
    user_doc = {
        "id": user_id,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "full_name": data.full_name,
        "phone": data.phone,
        "role": "owner",
        "auth_method": data.auth_method,
        "business_id": business_id,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
        "onboarding_completed": False
    }
    await db.users.insert_one(user_doc)
    
    # Create business
    business_doc = {
        "id": business_id,
        "owner_id": user_id,
        "name": data.business_name,
        "tagline": "",
        "phone": data.phone,
        "address": data.address,
        "logo_url": None,
        "instagram": None,
        "availability": [
            {"day": 1, "enabled": True, "slots": [{"start": "09:00", "end": "17:00"}]},
            {"day": 2, "enabled": True, "slots": [{"start": "09:00", "end": "17:00"}]},
            {"day": 3, "enabled": True, "slots": [{"start": "09:00", "end": "17:00"}]},
            {"day": 4, "enabled": True, "slots": [{"start": "09:00", "end": "17:00"}]},
            {"day": 5, "enabled": True, "slots": [{"start": "09:00", "end": "17:00"}]},
            {"day": 6, "enabled": False, "slots": []},
            {"day": 0, "enabled": False, "slots": []}
        ],
        "blocked_dates": [],
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    await db.businesses.insert_one(business_doc)
    
    # Clean up OTP records
    await db.otp_verifications.delete_many({"phone": data.phone, "type": "signup"})
    
    token = create_token(user_id, data.email, "owner")
    return {"token": token, "user_id": user_id, "business_id": business_id}

@api_router.get("/auth/emergent-session/{session_id}")
async def get_emergent_session(session_id: str):
    """Proxy endpoint to fetch user data from Emergent Auth (avoids CORS issues)"""
    try:
        response = http_requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
            timeout=10
        )
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Emergent Auth error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=response.status_code, detail="Failed to verify session")
    except http_requests.RequestException as e:
        logger.error(f"Failed to reach Emergent Auth: {str(e)}")
        raise HTTPException(status_code=500, detail="Authentication service unavailable")

@api_router.post("/auth/google-signup")
async def google_signup(data: GoogleSignupRequest):
    """Handle Google OAuth signup/login"""
    now = datetime.now(timezone.utc)
    
    # Use email from token or provided email
    email = data.email
    name = data.name or data.full_name or "User"
    google_id = data.google_id  # Unique Google user identifier
    
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    # Check if user exists with this email
    existing = await db.users.find_one({"email": email})
    if existing:
        # User with this email exists - check auth method
        existing_auth_method = existing.get("auth_method", "email")
        
        if existing_auth_method != "google":
            # User signed up with email/password - don't allow Google login
            raise HTTPException(
                status_code=409, 
                detail="An account with this email already exists. Please login with your email and password instead."
            )
        
        # Existing Google user - verify Google ID if we have it stored
        stored_google_id = existing.get("google_id")
        if stored_google_id and google_id and stored_google_id != google_id:
            # Different Google account trying to access this email - security issue
            logger.warning(f"Google ID mismatch for email {email}. Stored: {stored_google_id}, Received: {google_id}")
            raise HTTPException(
                status_code=403, 
                detail="This email is linked to a different Google account."
            )
        
        # Update Google ID if not stored yet
        if google_id and not stored_google_id:
            await db.users.update_one(
                {"id": existing["id"]},
                {"$set": {"google_id": google_id, "updated_at": now.isoformat()}}
            )
        
        # Login existing Google user
        token = create_token(existing["id"], existing["email"], existing["role"])
        return {
            "token": token, 
            "user_id": existing["id"], 
            "business_id": existing.get("business_id"),
            "is_new_user": False,
            "onboarding_completed": existing.get("onboarding_completed", False)
        }
    
    # Create new user
    user_id = str(uuid.uuid4())
    business_id = str(uuid.uuid4())
    
    user_doc = {
        "id": user_id,
        "email": email,
        "password_hash": hash_password(str(uuid.uuid4())),  # Random password for Google users
        "full_name": name,
        "phone": data.phone,
        "role": "owner",
        "auth_method": "google",
        "google_id": google_id,  # Store Google's unique user ID
        "business_id": business_id,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
        "onboarding_completed": False
    }
    await db.users.insert_one(user_doc)
    
    # Create business
    business_name = data.business_name or f"{name}'s Business"
    business_doc = {
        "id": business_id,
        "owner_id": user_id,
        "name": business_name,
        "tagline": "",
        "phone": data.phone,
        "address": data.address,
        "logo_url": None,
        "instagram": None,
        "availability": [
            {"day": 1, "enabled": True, "slots": [{"start": "09:00", "end": "17:00"}]},
            {"day": 2, "enabled": True, "slots": [{"start": "09:00", "end": "17:00"}]},
            {"day": 3, "enabled": True, "slots": [{"start": "09:00", "end": "17:00"}]},
            {"day": 4, "enabled": True, "slots": [{"start": "09:00", "end": "17:00"}]},
            {"day": 5, "enabled": True, "slots": [{"start": "09:00", "end": "17:00"}]},
            {"day": 6, "enabled": False, "slots": []},
            {"day": 0, "enabled": False, "slots": []}
        ],
        "blocked_dates": [],
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    await db.businesses.insert_one(business_doc)
    
    # Clean up OTP records if any
    if data.phone:
        await db.otp_verifications.delete_many({"phone": data.phone, "type": "signup"})
    
    token = create_token(user_id, email, "owner")
    return {
        "token": token, 
        "user_id": user_id, 
        "business_id": business_id,
        "is_new_user": True,
        "onboarding_completed": False
    }

# ==================== FORGOT PASSWORD OTP ROUTES ====================

@api_router.post("/auth/forgot-password/send-otp")
async def forgot_password_send_otp(data: ForgotPasswordOtpRequest):
    """Send OTP for password reset"""
    phone = data.phone.strip()
    
    # Check if user with this phone exists
    user = await db.users.find_one({"phone": phone})
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this phone number")
    
    # Generate OTP
    otp_code = generate_otp_code()
    verification_id = str(uuid.uuid4())
    
    now = datetime.now(timezone.utc)
    otp_doc = {
        "verification_id": verification_id,
        "phone": phone,
        "user_id": user["id"],
        "code": otp_code,
        "type": "password_reset",
        "verified": False,
        "created_at": now,
        "expires_at": now + timedelta(minutes=10)
    }
    await db.otp_verifications.insert_one(otp_doc)
    
    # Send SMS
    message = f"Your Rezvo password reset code is: {otp_code}. This code expires in 10 minutes."
    sms_sent = await send_sms_via_sendly(phone, message)
    
    if not sms_sent:
        logger.info(f"Password reset OTP for {phone}: {otp_code}")
    
    return {"verification_id": verification_id, "message": "OTP sent successfully"}

@api_router.post("/auth/forgot-password/verify-otp")
async def forgot_password_verify_otp(data: VerifyOtpRequest):
    """Verify OTP for password reset"""
    now = datetime.now(timezone.utc)
    
    otp_record = await db.otp_verifications.find_one({
        "verification_id": data.verification_id,
        "phone": data.phone,
        "type": "password_reset",
        "verified": False
    })
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid verification request")
    
    expires_at = otp_record.get("expires_at")
    if expires_at:
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
        elif expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < now:
            raise HTTPException(status_code=400, detail="OTP has expired")
    
    if otp_record["code"] != data.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    await db.otp_verifications.update_one(
        {"verification_id": data.verification_id},
        {"$set": {"verified": True, "verified_at": now}}
    )
    
    return {"message": "Code verified successfully", "verified": True}

@api_router.post("/auth/forgot-password/reset")
async def reset_password_with_otp(data: ResetPasswordOtpRequest):
    """Reset password after OTP verification"""
    otp_record = await db.otp_verifications.find_one({
        "verification_id": data.verification_id,
        "phone": data.phone,
        "type": "password_reset",
        "verified": True
    })
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or unverified request")
    
    # Update user password
    new_hash = hash_password(data.new_password)
    result = await db.users.update_one(
        {"phone": data.phone},
        {"$set": {"password_hash": new_hash, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Clean up OTP records
    await db.otp_verifications.delete_many({"phone": data.phone, "type": "password_reset"})
    
    return {"message": "Password reset successfully"}

# ==================== ONBOARDING ROUTES ====================

@api_router.post("/business/onboarding")
async def save_onboarding_data(data: OnboardingData, current_user: dict = Depends(get_current_user)):
    """Save onboarding wizard data"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    business_id = user.get("business_id")
    if not business_id:
        raise HTTPException(status_code=400, detail="No business found")
    
    now = datetime.now(timezone.utc)
    
    # Update business
    update_data = {
        "business_type": data.business_type,
        "updated_at": now.isoformat()
    }
    if data.address:
        update_data["address"] = data.address
    if data.city:
        update_data["city"] = data.city
    if data.postcode:
        update_data["postcode"] = data.postcode
    
    await db.businesses.update_one(
        {"id": business_id},
        {"$set": update_data}
    )
    
    # Add team members
    for member in data.team_members:
        member_id = str(uuid.uuid4())
        member_doc = {
            "id": member_id,
            "business_id": business_id,
            "name": member.get("name", ""),
            "role": member.get("role", "Staff"),
            "email": None,
            "phone": None,
            "color": "#00BFA5",
            "avatar_url": None,
            "service_ids": [],
            "working_hours": None,
            "show_on_booking_page": True,
            "active": True,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }
        await db.team_members.insert_one(member_doc)
    
    # Mark onboarding as complete
    await db.users.update_one(
        {"id": current_user["sub"]},
        {"$set": {"onboarding_completed": True, "updated_at": now.isoformat()}}
    )
    
    return {"message": "Onboarding completed successfully"}

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

@api_router.get("/business/stats")
async def get_business_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard stats for business owner"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    business_id = user["business_id"]
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Get all bookings for this business
    all_bookings = await db.bookings.find({"business_id": business_id}, {"_id": 0}).to_list(1000)
    
    # Today's bookings
    today_str = today.strftime("%Y-%m-%d")
    today_bookings = [b for b in all_bookings if b.get("datetime", "").startswith(today_str)]
    
    # Pending bookings
    pending_bookings = [b for b in all_bookings if b.get("status") == "pending"]
    
    # Revenue from confirmed/completed bookings (same as web dashboard)
    completed_bookings = [b for b in all_bookings if b.get("status") in ["confirmed", "completed"]]
    revenue = sum(b.get("price_pence", 0) for b in completed_bookings)
    
    # Total customers (unique emails)
    unique_customers = len(set(b.get("client_email") for b in all_bookings if b.get("client_email")))
    
    return {
        "today_count": len(today_bookings),
        "pending_count": len(pending_bookings),
        "revenue_pence": revenue,
        "total_bookings": len(all_bookings),
        "total_customers": unique_customers,
        "completed_bookings": len(completed_bookings)
    }

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
    
    # Convert minutes to time format for storage
    converted_slots = []
    for slot in data.slots:
        start_hours = slot.start_min // 60
        start_mins = slot.start_min % 60
        end_hours = slot.end_min // 60
        end_mins = slot.end_min % 60
        converted_slots.append({
            "day": slot.day,
            "start": f"{start_hours:02d}:{start_mins:02d}",
            "end": f"{end_hours:02d}:{end_mins:02d}",
            "enabled": True
        })
    
    update_data = {
        "availability": converted_slots,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    if data.blocked_dates is not None:
        update_data["blocked_dates"] = data.blocked_dates
    
    await db.businesses.update_one({"id": user["business_id"]}, {"$set": update_data})
    return {"status": "updated"}

@api_router.post("/business/logo")
async def upload_business_logo(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Upload business logo image"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Save file
    file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    filename = f"logo_{user['business_id']}.{file_ext}"
    file_path = UPLOADS_DIR / filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update business with logo URL
    logo_url = f"/api/uploads/{filename}"
    await db.businesses.update_one(
        {"id": user["business_id"]},
        {"$set": {"logo_url": logo_url, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"logo_url": logo_url}

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

# ==================== PRODUCTS ROUTES ====================

@api_router.post("/products")
async def create_product(data: ProductCreate, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    product_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    product_doc = {
        "id": product_id,
        "business_id": user["business_id"],
        "name": data.name,
        "price_pence": data.price_pence,
        "description": data.description or "",
        "stock_quantity": data.stock_quantity,
        "category": data.category or "General",
        "image_url": data.image_url,
        "active": True,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    await db.products.insert_one(product_doc)
    return {"id": product_id, "name": data.name}

@api_router.get("/products")
async def get_products(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        return []
    
    products = await db.products.find(
        {"business_id": user["business_id"], "active": True},
        {"_id": 0}
    ).to_list(100)
    return products

@api_router.patch("/products/{product_id}")
async def update_product(product_id: str, data: ProductUpdate, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    product = await db.products.find_one({"id": product_id, "business_id": user["business_id"]})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    # Return updated product
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return updated_product

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    await db.products.update_one(
        {"id": product_id, "business_id": user["business_id"]},
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
    
    # Parse datetime_iso to extract date and time
    booking_datetime = datetime.fromisoformat(data.datetime_iso.replace('Z', '+00:00'))
    date_str = booking_datetime.strftime('%Y-%m-%d')
    start_time_str = booking_datetime.strftime('%H:%M')
    
    # Calculate end time based on service duration
    end_datetime = booking_datetime + timedelta(minutes=service.get("duration_min", 60))
    end_time_str = end_datetime.strftime('%H:%M')
    
    booking_doc = {
        "id": booking_id,
        "business_id": user["business_id"],
        "service_id": data.service_id,
        "service_name": service["name"],
        "client_name": data.client_name,
        "client_email": data.client_email,
        "client_phone": data.client_phone,
        "datetime": data.datetime_iso,
        "date": date_str,
        "start_time": start_time_str,
        "end_time": end_time_str,
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
    
    # Create notification for business owner
    await create_notification_internal(
        user_id=current_user["sub"],
        title="New Booking",
        message=f"New booking from {data.client_name} for {service['name']}",
        notif_type="booking",
        link=f"/bookings/{booking_id}"
    )
    
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
    """Update booking - CRITICAL: Ensures date, start_time, end_time stay in sync"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Get current booking first
    booking = await db.bookings.find_one({"id": booking_id, "business_id": user["business_id"]})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    
    # CRITICAL: When datetime changes, recalculate date, start_time, and end_time
    if "datetime_iso" in update_data:
        new_datetime = datetime.fromisoformat(update_data["datetime_iso"].replace('Z', '+00:00'))
        duration_min = booking.get("duration_min", 60)
        end_datetime = new_datetime + timedelta(minutes=duration_min)
        
        update_data["datetime"] = update_data.pop("datetime_iso")
        update_data["date"] = new_datetime.strftime('%Y-%m-%d')
        update_data["start_time"] = new_datetime.strftime('%H:%M')
        update_data["end_time"] = end_datetime.strftime('%H:%M')
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.bookings.update_one(
        {"id": booking_id, "business_id": user["business_id"]},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="No changes made")
    
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

@api_router.get("/public/business/{business_id}/team")
async def get_public_team_members(business_id: str):
    """Get team members visible on public booking page"""
    members = await db.team_members.find(
        {"business_id": business_id, "active": True, "show_on_booking_page": True},
        {"_id": 0, "id": 1, "name": 1, "avatar_url": 1, "color": 1, "role": 1, "service_ids": 1}
    ).to_list(100)
    return members

@api_router.post("/public/bookings")
async def create_public_booking(data: BookingCreate):
    service = await db.services.find_one({"id": data.service_id})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    booking_id = str(uuid.uuid4())
    cancel_token = str(uuid.uuid4())  # Unique token for cancel/reschedule links
    now = datetime.now(timezone.utc)
    
    # Parse datetime_iso to extract date and time
    booking_datetime = datetime.fromisoformat(data.datetime_iso.replace('Z', '+00:00'))
    date_str = booking_datetime.strftime('%Y-%m-%d')
    start_time_str = booking_datetime.strftime('%H:%M')
    
    # Calculate end time based on service duration
    end_datetime = booking_datetime + timedelta(minutes=service.get("duration_min", 60))
    end_time_str = end_datetime.strftime('%H:%M')
    
    booking_doc = {
        "id": booking_id,
        "cancel_token": cancel_token,
        "business_id": service["business_id"],
        "service_id": data.service_id,
        "service_name": service["name"],
        "client_name": data.client_name,
        "client_email": data.client_email,
        "client_phone": data.client_phone,
        "datetime": data.datetime_iso,
        "date": date_str,
        "start_time": start_time_str,
        "end_time": end_time_str,
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
    
    # Create notification for business owner
    owner = await db.users.find_one({"business_id": service["business_id"]}, {"_id": 0})
    if owner:
        await create_notification_internal(
            user_id=owner["id"],
            title="New Booking Received!",
            message=f"{data.client_name} booked {service['name']} for {data.datetime_iso[:10]}",
            notif_type="booking",
            link=f"/bookings",
            business_id=service["business_id"]
        )
    
    return {
        "id": booking_id,
        "status": "pending",
        "deposit_required": service["deposit_required"],
        "deposit_amount_pence": service["deposit_amount_pence"],
        "confirmation_email_queued": bool(data.client_email)
    }

# ==================== BOOKING CANCEL/RESCHEDULE VIA TOKEN ====================

@api_router.get("/booking/token/{token}")
async def get_booking_by_token(token: str):
    """Get booking details by cancel token (for cancel/reschedule pages)"""
    booking = await db.bookings.find_one({"cancel_token": token}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Get business name
    business = await db.businesses.find_one({"id": booking["business_id"]}, {"_id": 0, "name": 1})
    
    return {
        "id": booking["id"],
        "service_name": booking["service_name"],
        "client_name": booking["client_name"],
        "datetime": booking["datetime"],
        "date": booking["date"],
        "start_time": booking["start_time"],
        "duration_min": booking["duration_min"],
        "price_pence": booking["price_pence"],
        "status": booking["status"],
        "business_name": business["name"] if business else "Unknown",
        "business_id": booking["business_id"]
    }

@api_router.post("/booking/cancel/{token}")
async def cancel_booking_by_token(token: str):
    """Cancel a booking using the cancel token from email"""
    booking = await db.bookings.find_one({"cancel_token": token})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking["status"] == "cancelled":
        raise HTTPException(status_code=400, detail="Booking is already cancelled")
    
    # Check if booking is in the past
    booking_datetime = datetime.fromisoformat(booking["datetime"].replace('Z', '+00:00'))
    if booking_datetime < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Cannot cancel a past booking")
    
    # Update booking status
    await db.bookings.update_one(
        {"cancel_token": token},
        {"$set": {
            "status": "cancelled",
            "cancelled_at": datetime.now(timezone.utc).isoformat(),
            "cancelled_by": "client"
        }}
    )
    
    # Notify business owner
    owner = await db.users.find_one({"business_id": booking["business_id"]}, {"_id": 0})
    if owner:
        await create_notification_internal(
            user_id=owner["id"],
            title="Booking Cancelled",
            message=f"{booking['client_name']} cancelled their {booking['service_name']} booking",
            notif_type="booking",
            link="/bookings",
            business_id=booking["business_id"]
        )
    
    return {"message": "Booking cancelled successfully", "status": "cancelled"}

class RescheduleRequest(BaseModel):
    new_datetime: str

@api_router.post("/booking/reschedule/{token}")
async def reschedule_booking_by_token(token: str, data: RescheduleRequest):
    """Reschedule a booking using the cancel token from email"""
    booking = await db.bookings.find_one({"cancel_token": token})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking["status"] == "cancelled":
        raise HTTPException(status_code=400, detail="Cannot reschedule a cancelled booking")
    
    # Parse and validate new datetime
    try:
        new_datetime = datetime.fromisoformat(data.new_datetime.replace('Z', '+00:00'))
    except:
        raise HTTPException(status_code=400, detail="Invalid datetime format")
    
    if new_datetime < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Cannot reschedule to a past date")
    
    # Update booking
    new_date_str = new_datetime.strftime('%Y-%m-%d')
    new_start_time = new_datetime.strftime('%H:%M')
    end_datetime = new_datetime + timedelta(minutes=booking["duration_min"])
    new_end_time = end_datetime.strftime('%H:%M')
    
    await db.bookings.update_one(
        {"cancel_token": token},
        {"$set": {
            "datetime": data.new_datetime,
            "date": new_date_str,
            "start_time": new_start_time,
            "end_time": new_end_time,
            "rescheduled_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Notify business owner
    owner = await db.users.find_one({"business_id": booking["business_id"]}, {"_id": 0})
    if owner:
        await create_notification_internal(
            user_id=owner["id"],
            title="Booking Rescheduled",
            message=f"{booking['client_name']} rescheduled their {booking['service_name']} to {new_date_str}",
            notif_type="booking",
            link="/bookings",
            business_id=booking["business_id"]
        )
    
    return {
        "message": "Booking rescheduled successfully",
        "new_datetime": data.new_datetime,
        "new_date": new_date_str,
        "new_start_time": new_start_time
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

@api_router.get("/admin/metrics")
async def admin_get_metrics(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "founder", "business"]:
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
    if current_user.get("role") not in ["admin", "founder", "business"]:
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
    
    # Get business settings if user has a business
    if user.get("business_id"):
        business = await db.businesses.find_one({"id": user["business_id"]}, {"_id": 0, "working_hours": 1, "booking_settings": 1})
        if business:
            user["working_hours"] = business.get("working_hours", {
                "monday": {"enabled": True, "open": "09:00", "close": "17:00"},
                "tuesday": {"enabled": True, "open": "09:00", "close": "17:00"},
                "wednesday": {"enabled": True, "open": "09:00", "close": "17:00"},
                "thursday": {"enabled": True, "open": "09:00", "close": "17:00"},
                "friday": {"enabled": True, "open": "09:00", "close": "17:00"},
                "saturday": {"enabled": False, "open": "10:00", "close": "16:00"},
                "sunday": {"enabled": False, "open": "10:00", "close": "16:00"},
            })
            user["booking_settings"] = business.get("booking_settings", {
                "auto_confirm": True,
                "allow_cancellations": True,
                "send_reminders": True,
                "buffer_time": 15,
            })
    
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
    """Generate booking confirmation email HTML with action links"""
    booking_date = datetime.fromisoformat(booking["datetime"].replace('Z', '+00:00'))
    booking_id = booking.get("id", "")
    cancel_token = booking.get("cancel_token", booking_id)  # Use cancel_token if available
    base_url = os.environ.get("FRONTEND_URL", "https://rezvo.app")
    
    # Action URLs
    cancel_url = f"{base_url}/booking/cancel/{cancel_token}"
    reschedule_url = f"{base_url}/booking/reschedule/{cancel_token}"
    
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
            
            <!-- Action Buttons -->
            <div style="margin-top: 24px; text-align: center;">
                <p style="color: #627D98; font-size: 14px; margin-bottom: 16px;">Need to make changes?</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px; width: 50%;">
                            <a href="{reschedule_url}" style="display: block; background: #F0FDFA; color: #00BFA5; padding: 14px 20px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
                                📅 Reschedule
                            </a>
                        </td>
                        <td style="padding: 6px; width: 50%;">
                            <a href="{cancel_url}" style="display: block; background: #FEF2F2; color: #EF4444; padding: 14px 20px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
                                ✕ Cancel Booking
                            </a>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        
        <p style="text-align: center; color: #9FB3C8; font-size: 12px; margin-top: 30px;">
            This is an automated message from Rezvo. Please do not reply to this email.
        </p>
        
        <p style="text-align: center; color: #9FB3C8; font-size: 12px; margin-top: 10px;">
            Powered by <a href="https://rezvo.app" style="color: #00BFA5; text-decoration: none;">Rezvo.app</a>
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

@api_router.get("/links/list")
async def list_short_links(current_user: dict = Depends(get_current_user)):
    """Get all short links for the business"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        return []
    
    base_url = os.environ.get('FRONTEND_URL', 'https://rezvo.app')
    links = await db.short_links.find(
        {"business_id": user["business_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    
    # Add full short_link URL to each
    for link in links:
        link["short_link"] = f"{base_url}/b/{link['short_code']}"
    
    return links

@api_router.get("/links/generate")
async def generate_link(current_user: dict = Depends(get_current_user)):
    """Generate booking link for business (legacy endpoint)"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    business = await db.businesses.find_one({"id": user["business_id"]})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    base_url = os.environ.get('FRONTEND_URL', 'https://rezvo.app')
    
    return {
        "link": f"{base_url}/book/{user['business_id']}",
        "business_name": business.get("name", "Your Business"),
        "business_id": user["business_id"]
    }

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

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    """Get platform statistics for admin dashboard"""
    if current_user.get("role") not in ["admin", "founder", "business"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_users = await db.users.count_documents({})
    total_businesses = await db.businesses.count_documents({})
    total_bookings = await db.bookings.count_documents({})
    total_services = await db.services.count_documents({})
    
    return {
        "total_users": total_users,
        "total_businesses": total_businesses,
        "total_bookings": total_bookings,
        "total_services": total_services
    }

@api_router.get("/admin/analytics")
async def get_admin_analytics(current_user: dict = Depends(get_current_user)):
    """Get analytics data for admin dashboard charts"""
    if current_user.get("role") not in ["admin", "founder", "business", "owner"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from datetime import timedelta
    now = datetime.now(timezone.utc)
    
    # Get data for the last 7 days
    daily_data = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        # Count users created that day
        users_count = await db.users.count_documents({
            "created_at": {"$gte": day_start.isoformat(), "$lte": day_end.isoformat()}
        })
        
        # Count bookings that day
        bookings_count = await db.bookings.count_documents({
            "created_at": {"$gte": day_start.isoformat(), "$lte": day_end.isoformat()}
        })
        
        # Calculate revenue (completed bookings)
        bookings = await db.bookings.find({
            "created_at": {"$gte": day_start.isoformat(), "$lte": day_end.isoformat()},
            "status": "completed"
        }).to_list(1000)
        revenue = sum(b.get("price_pence", 0) for b in bookings)
        
        daily_data.append({
            "date": day.strftime("%a"),
            "fullDate": day.strftime("%Y-%m-%d"),
            "users": users_count,
            "bookings": bookings_count,
            "revenue": revenue / 100  # Convert to pounds
        })
    
    # Get booking status breakdown
    status_counts = {}
    for status in ["pending", "confirmed", "completed", "cancelled"]:
        count = await db.bookings.count_documents({"status": status})
        status_counts[status] = count
    
    # Get top services
    pipeline = [
        {"$group": {"_id": "$service_name", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    top_services = await db.bookings.aggregate(pipeline).to_list(5)
    
    return {
        "daily": daily_data,
        "status_breakdown": status_counts,
        "top_services": [{"name": s["_id"] or "Unknown", "bookings": s["count"]} for s in top_services]
    }

@api_router.get("/admin/users")
async def get_admin_users(current_user: dict = Depends(get_current_user)):
    """Get all users for admin panel"""
    if current_user.get("role") not in ["admin", "founder", "business"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    return users

@api_router.get("/admin/businesses")
async def get_admin_businesses(current_user: dict = Depends(get_current_user)):
    """Get all businesses for admin panel"""
    if current_user.get("role") not in ["admin", "founder", "business"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    businesses = await db.businesses.find({}, {"_id": 0}).to_list(500)
    return businesses

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

# Helper function to create notification
async def create_notification_internal(user_id: str, title: str, message: str, notif_type: str = "info", link: str = None, business_id: str = None):
    """Internal helper to create notifications"""
    notif_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    notif_doc = {
        "id": notif_id,
        "title": title,
        "message": message,
        "type": notif_type,
        "user_id": user_id,
        "business_id": business_id,
        "link": link,
        "read": False,
        "created_at": now.isoformat()
    }
    await db.notifications.insert_one(notif_doc)
    return notif_id

# ==================== FILE UPLOAD FOR SUPPORT ====================

@api_router.post("/support/upload")
async def upload_support_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Upload a file for support messages"""
    # Create uploads/support directory
    support_dir = UPLOADS_DIR / "support"
    support_dir.mkdir(exist_ok=True)
    
    # Generate unique filename
    file_ext = Path(file.filename).suffix.lower()
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt'}
    
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File type {file_ext} not allowed")
    
    # Check file size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_ext}"
    file_path = support_dir / filename
    
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Save file metadata
    file_doc = {
        "id": file_id,
        "original_name": file.filename,
        "filename": filename,
        "path": str(file_path),
        "content_type": file.content_type,
        "size": len(contents),
        "user_id": current_user["sub"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.support_files.insert_one(file_doc)
    
    return {
        "id": file_id,
        "filename": file.filename,
        "url": f"/api/support/files/{file_id}",
        "size": len(contents)
    }

@api_router.get("/support/files/{file_id}")
async def get_support_file(file_id: str):
    """Download a support file"""
    file_doc = await db.support_files.find_one({"id": file_id}, {"_id": 0})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = Path(file_doc["path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        file_path,
        filename=file_doc["original_name"],
        media_type=file_doc.get("content_type", "application/octet-stream")
    )

# ==================== WORKING HOURS SETTINGS ====================

class WorkingHoursUpdate(BaseModel):
    working_hours: dict

class BookingSettingsUpdate(BaseModel):
    auto_confirm: bool = True
    allow_cancellations: bool = True
    send_reminders: bool = True
    buffer_time: int = 15

@api_router.patch("/settings/booking")
async def update_booking_settings(data: BookingSettingsUpdate, current_user: dict = Depends(get_current_user)):
    """Update booking settings"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    await db.businesses.update_one(
        {"id": user["business_id"]},
        {"$set": {
            "booking_settings": {
                "auto_confirm": data.auto_confirm,
                "allow_cancellations": data.allow_cancellations,
                "send_reminders": data.send_reminders,
                "buffer_time": data.buffer_time,
            },
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"success": True}

@api_router.get("/settings/booking")
async def get_booking_settings(current_user: dict = Depends(get_current_user)):
    """Get booking settings"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    business = await db.businesses.find_one({"id": user["business_id"]}, {"_id": 0, "booking_settings": 1})
    return business.get("booking_settings", {
        "auto_confirm": True,
        "allow_cancellations": True,
        "send_reminders": True,
        "buffer_time": 15,
    })

@api_router.patch("/settings/working-hours")
async def update_working_hours(data: WorkingHoursUpdate, current_user: dict = Depends(get_current_user)):
    """Update business working hours"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    await db.businesses.update_one(
        {"id": user["business_id"]},
        {"$set": {"working_hours": data.working_hours, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True}

@api_router.get("/settings/working-hours")
async def get_working_hours(current_user: dict = Depends(get_current_user)):
    """Get business working hours"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    business = await db.businesses.find_one({"id": user["business_id"]}, {"_id": 0, "working_hours": 1})
    return business.get("working_hours", {
        "monday": {"enabled": True, "open": "09:00", "close": "17:00"},
        "tuesday": {"enabled": True, "open": "09:00", "close": "17:00"},
        "wednesday": {"enabled": True, "open": "09:00", "close": "17:00"},
        "thursday": {"enabled": True, "open": "09:00", "close": "17:00"},
        "friday": {"enabled": True, "open": "09:00", "close": "17:00"},
        "saturday": {"enabled": False, "open": "10:00", "close": "16:00"},
        "sunday": {"enabled": False, "open": "10:00", "close": "16:00"},
    })

# ==================== TEAM MEMBERS ROUTES ====================

@api_router.post("/team-members")
async def create_team_member(data: TeamMemberCreate, current_user: dict = Depends(get_current_user)):
    """Create a new team member for the business"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    member_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    # Default working hours (Mon-Fri 9-17)
    default_hours = [
        {"day": i, "start": "09:00", "end": "17:00", "enabled": i >= 1 and i <= 5}
        for i in range(7)
    ]
    
    member_doc = {
        "id": member_id,
        "business_id": user["business_id"],
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "role": data.role,
        "color": data.color,
        "avatar_url": data.avatar_url,
        "service_ids": data.service_ids,
        "working_hours": data.working_hours or default_hours,
        "show_on_booking_page": data.show_on_booking_page,
        "active": True,
        "bookings_completed": 0,
        "revenue_pence": 0,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    await db.team_members.insert_one(member_doc)
    return {"id": member_id, "name": data.name}

@api_router.get("/team-members")
async def get_team_members(current_user: dict = Depends(get_current_user)):
    """Get all team members for the business"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        return []
    
    members = await db.team_members.find(
        {"business_id": user["business_id"], "active": True},
        {"_id": 0}
    ).to_list(50)
    return members

@api_router.get("/team-members/{member_id}")
async def get_team_member(member_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific team member"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    member = await db.team_members.find_one(
        {"id": member_id, "business_id": user["business_id"]},
        {"_id": 0}
    )
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    return member

@api_router.patch("/team-members/{member_id}")
async def update_team_member(member_id: str, data: TeamMemberUpdate, current_user: dict = Depends(get_current_user)):
    """Update a team member"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.team_members.update_one(
        {"id": member_id, "business_id": user["business_id"]},
        {"$set": update_data}
    )
    return {"status": "updated"}

@api_router.delete("/team-members/{member_id}")
async def delete_team_member(member_id: str, current_user: dict = Depends(get_current_user)):
    """Soft delete a team member"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    await db.team_members.update_one(
        {"id": member_id, "business_id": user["business_id"]},
        {"$set": {"active": False, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"status": "deleted"}

@api_router.get("/team-members/{member_id}/stats")
async def get_team_member_stats(member_id: str, current_user: dict = Depends(get_current_user)):
    """Get performance stats for a team member"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Get bookings assigned to this team member
    bookings = await db.bookings.find(
        {"business_id": user["business_id"], "team_member_id": member_id},
        {"_id": 0}
    ).to_list(1000)
    
    completed = [b for b in bookings if b.get("status") == "completed"]
    total_revenue = sum(b.get("price_pence", 0) for b in completed)
    
    # This month stats
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    this_month = [b for b in completed if b.get("datetime", "") >= month_start.isoformat()]
    month_revenue = sum(b.get("price_pence", 0) for b in this_month)
    
    return {
        "total_bookings": len(bookings),
        "completed_bookings": len(completed),
        "total_revenue_pence": total_revenue,
        "this_month_bookings": len(this_month),
        "this_month_revenue_pence": month_revenue
    }

# ==================== FILE UPLOAD ====================

@api_router.post("/upload/avatar")
async def upload_avatar(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Upload an avatar image for team member or business"""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: JPEG, PNG, WebP, GIF")
    
    # Validate file size (max 5MB)
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max size: 5MB")
    
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = UPLOADS_DIR / filename
    
    # Save file
    with open(filepath, "wb") as f:
        f.write(content)
    
    # Return URL
    return {"url": f"/api/uploads/{filename}"}

@api_router.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    """Serve uploaded files"""
    filepath = UPLOADS_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath)

@api_router.get("/calendar/team-view")
async def get_team_calendar_view(
    date: str,  # YYYY-MM-DD
    current_user: dict = Depends(get_current_user)
):
    """Get calendar data with team member columns for a specific date"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    business_id = user["business_id"]
    
    # Get team members
    members = await db.team_members.find(
        {"business_id": business_id, "active": True},
        {"_id": 0}
    ).to_list(50)
    
    # Get bookings for this date
    bookings = await db.bookings.find(
        {"business_id": business_id, "datetime": {"$regex": f"^{date}"}},
        {"_id": 0}
    ).to_list(500)
    
    # Get services for color mapping
    services = await db.services.find(
        {"business_id": business_id, "active": True},
        {"_id": 0}
    ).to_list(100)
    
    # Service color map
    service_colors = {
        s["id"]: s.get("color", "#00BFA5") for s in services
    }
    
    # Group bookings by team member
    member_bookings = {m["id"]: [] for m in members}
    member_bookings["unassigned"] = []
    
    for booking in bookings:
        member_id = booking.get("team_member_id", "unassigned")
        if member_id in member_bookings:
            booking["color"] = service_colors.get(booking.get("service_id"), "#00BFA5")
            member_bookings[member_id].append(booking)
        else:
            member_bookings["unassigned"].append(booking)
    
    return {
        "date": date,
        "team_members": members,
        "bookings_by_member": member_bookings,
        "services": services
    }

# ==================== PASSWORD RESET ROUTES ====================

@api_router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    """Send password reset code to email"""
    user = await db.users.find_one({"email": data.email})
    if not user:
        # Don't reveal if email exists
        return {"message": "If the email exists, a reset code has been sent"}
    
    # Generate 6-digit code
    import random
    code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    expires = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    # Store reset code
    await db.password_resets.delete_many({"email": data.email})
    await db.password_resets.insert_one({
        "email": data.email,
        "code": code,
        "expires": expires.isoformat(),
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Send email
    if resend.api_key:
        try:
            html = f"""
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="background: #00BFA5; color: white; width: 48px; height: 48px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">R</div>
                </div>
                <h2 style="color: #0A1626; margin-bottom: 16px; text-align: center;">Reset Your Password</h2>
                <p style="color: #627D98; margin-bottom: 24px; text-align: center;">Enter this code to reset your password. It expires in 15 minutes.</p>
                <div style="background: #F5F0E8; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                    <span style="font-size: 32px; font-weight: bold; color: #0A1626; letter-spacing: 8px;">{code}</span>
                </div>
                <p style="color: #9FB3C8; font-size: 13px; text-align: center;">If you didn't request this, please ignore this email.</p>
            </div>
            """
            resend.Emails.send({
                "from": SENDER_EMAIL,
                "to": data.email,
                "subject": "Rezvo - Password Reset Code",
                "html": html
            })
        except Exception as e:
            logger.error(f"Failed to send reset email: {e}")
    
    return {"message": "If the email exists, a reset code has been sent"}

@api_router.post("/auth/verify-reset-code")
async def verify_reset_code(data: VerifyCodeRequest):
    """Verify the password reset code"""
    reset = await db.password_resets.find_one({
        "email": data.email,
        "code": data.code,
        "used": False
    })
    
    if not reset:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    
    if datetime.fromisoformat(reset["expires"]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Code has expired")
    
    # Generate a temporary token for password reset
    token = str(uuid.uuid4())
    await db.password_resets.update_one(
        {"email": data.email, "code": data.code},
        {"$set": {"reset_token": token, "verified_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"valid": True, "reset_token": token}

@api_router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordRequest):
    """Reset password using the verified token"""
    reset = await db.password_resets.find_one({
        "reset_token": data.token,
        "used": False
    })
    
    if not reset:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    if datetime.fromisoformat(reset["expires"]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token has expired")
    
    # Update password
    new_hash = hash_password(data.new_password)
    await db.users.update_one(
        {"email": reset["email"]},
        {"$set": {"password_hash": new_hash, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Mark reset as used
    await db.password_resets.update_one(
        {"reset_token": data.token},
        {"$set": {"used": True}}
    )
    
    return {"message": "Password reset successfully"}

# ==================== BOOKING WITH TEAM MEMBER ====================

class BookingCreateWithTeam(BaseModel):
    service_id: str
    team_member_id: Optional[str] = None
    client_name: str
    client_email: EmailStr
    client_phone: Optional[str] = None
    datetime_iso: str
    notes: Optional[str] = None

@api_router.post("/bookings/with-team")
async def create_booking_with_team(data: BookingCreateWithTeam, current_user: dict = Depends(get_current_user)):
    """Create a booking assigned to a specific team member"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    service = await db.services.find_one({"id": data.service_id})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Verify team member if provided
    team_member = None
    if data.team_member_id:
        team_member = await db.team_members.find_one({
            "id": data.team_member_id,
            "business_id": user["business_id"],
            "active": True
        })
    
    booking_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    booking_doc = {
        "id": booking_id,
        "business_id": user["business_id"],
        "service_id": data.service_id,
        "service_name": service["name"],
        "team_member_id": data.team_member_id,
        "team_member_name": team_member["name"] if team_member else None,
        "client_name": data.client_name,
        "client_email": data.client_email,
        "client_phone": data.client_phone,
        "datetime": data.datetime_iso,
        "duration_min": service["duration_min"],
        "price_pence": service["price_pence"],
        "deposit_required": service.get("deposit_required", False),
        "deposit_amount_pence": service.get("deposit_amount_pence", 0),
        "deposit_paid": False,
        "status": "pending",
        "notes": data.notes,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    await db.bookings.insert_one(booking_doc)
    return {"id": booking_id, "status": "pending"}

# ==================== SERVICE COLORS ====================

@api_router.patch("/services/{service_id}/color")
async def update_service_color(service_id: str, color: str, current_user: dict = Depends(get_current_user)):
    """Update service color for calendar display"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    await db.services.update_one(
        {"id": service_id, "business_id": user["business_id"]},
        {"$set": {"color": color, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"status": "updated"}

# ==================== GOOGLE CALENDAR INTEGRATION ====================

@api_router.get("/google/auth-url")
async def get_google_auth_url(current_user: dict = Depends(get_current_user)):
    """Get Google OAuth URL for calendar integration"""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=400, detail="Google Calendar not configured. Add GOOGLE_CLIENT_ID to environment.")
    
    scopes = "https://www.googleapis.com/auth/calendar"
    auth_url = (
        f"https://accounts.google.com/o/oauth2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={GOOGLE_REDIRECT_URI}&"
        f"scope={scopes}&"
        f"response_type=code&"
        f"access_type=offline&"
        f"prompt=consent&"
        f"state={current_user['sub']}"
    )
    return {"authorization_url": auth_url}

@api_router.get("/google/callback")
async def google_callback(code: str, state: str):
    """Handle Google OAuth callback"""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=400, detail="Google Calendar not configured")
    
    # Exchange code for tokens
    token_resp = http_requests.post('https://oauth2.googleapis.com/token', data={
        'code': code,
        'client_id': GOOGLE_CLIENT_ID,
        'client_secret': GOOGLE_CLIENT_SECRET,
        'redirect_uri': GOOGLE_REDIRECT_URI,
        'grant_type': 'authorization_code'
    }).json()
    
    if 'error' in token_resp:
        logger.error(f"Google OAuth error: {token_resp}")
        raise HTTPException(status_code=400, detail=token_resp.get('error_description', 'OAuth failed'))
    
    # Save tokens to user
    await db.users.update_one(
        {"id": state},
        {"$set": {
            "google_tokens": token_resp,
            "google_calendar_connected": True,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    frontend_url = os.environ.get('FRONTEND_URL', '')
    return RedirectResponse(f"{frontend_url}/settings?google=connected")

@api_router.get("/google/status")
async def google_calendar_status(current_user: dict = Depends(get_current_user)):
    """Check if Google Calendar is connected"""
    user = await db.users.find_one({"id": current_user["sub"]})
    return {
        "connected": user.get("google_calendar_connected", False),
        "configured": bool(GOOGLE_CLIENT_ID)
    }

@api_router.post("/google/disconnect")
async def disconnect_google_calendar(current_user: dict = Depends(get_current_user)):
    """Disconnect Google Calendar"""
    await db.users.update_one(
        {"id": current_user["sub"]},
        {"$unset": {"google_tokens": ""}, "$set": {"google_calendar_connected": False}}
    )
    return {"status": "disconnected"}

async def get_google_credentials(user_id: str):
    """Get valid Google credentials, refreshing if needed"""
    user = await db.users.find_one({"id": user_id})
    if not user or not user.get("google_tokens"):
        return None
    
    tokens = user["google_tokens"]
    creds = Credentials(
        token=tokens.get('access_token'),
        refresh_token=tokens.get('refresh_token'),
        token_uri='https://oauth2.googleapis.com/token',
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET
    )
    
    if creds.expired and creds.refresh_token:
        creds.refresh(GoogleRequest())
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"google_tokens.access_token": creds.token}}
        )
    
    return creds

@api_router.get("/google/events")
async def get_google_calendar_events(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get events from Google Calendar"""
    creds = await get_google_credentials(current_user["sub"])
    if not creds:
        raise HTTPException(status_code=400, detail="Google Calendar not connected")
    
    try:
        service = build('calendar', 'v3', credentials=creds)
        time_min = start_date or datetime.now(timezone.utc).isoformat()
        time_max = end_date or (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        
        events_result = service.events().list(
            calendarId='primary',
            timeMin=time_min,
            timeMax=time_max,
            maxResults=100,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        return {"events": events_result.get('items', [])}
    except Exception as e:
        logger.error(f"Google Calendar error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/google/sync-booking/{booking_id}")
async def sync_booking_to_google(booking_id: str, current_user: dict = Depends(get_current_user)):
    """Sync a booking to Google Calendar"""
    creds = await get_google_credentials(current_user["sub"])
    if not creds:
        raise HTTPException(status_code=400, detail="Google Calendar not connected")
    
    user = await db.users.find_one({"id": current_user["sub"]})
    booking = await db.bookings.find_one({"id": booking_id, "business_id": user.get("business_id")})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    try:
        service = build('calendar', 'v3', credentials=creds)
        
        start_time = datetime.fromisoformat(booking["datetime"].replace('Z', '+00:00'))
        end_time = start_time + timedelta(minutes=booking.get("duration_min", 60))
        
        event = {
            'summary': f"{booking['service_name']} - {booking['client_name']}",
            'description': f"Client: {booking['client_name']}\nEmail: {booking['client_email']}\nPhone: {booking.get('client_phone', 'N/A')}\nNotes: {booking.get('notes', '')}",
            'start': {'dateTime': start_time.isoformat(), 'timeZone': 'UTC'},
            'end': {'dateTime': end_time.isoformat(), 'timeZone': 'UTC'},
        }
        
        created_event = service.events().insert(calendarId='primary', body=event).execute()
        
        # Store Google event ID
        await db.bookings.update_one(
            {"id": booking_id},
            {"$set": {"google_event_id": created_event['id']}}
        )
        
        return {"status": "synced", "google_event_id": created_event['id']}
    except Exception as e:
        logger.error(f"Google Calendar sync error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== PUSH NOTIFICATIONS ====================

@api_router.post("/push/register")
async def register_push_token(data: PushTokenRegister, current_user: dict = Depends(get_current_user)):
    """Register a push notification token for the user"""
    await db.users.update_one(
        {"id": current_user["sub"]},
        {"$set": {
            "push_token": data.token,
            "push_device_type": data.device_type,
            "push_registered_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"status": "registered"}

@api_router.delete("/push/unregister")
async def unregister_push_token(current_user: dict = Depends(get_current_user)):
    """Remove push notification token"""
    await db.users.update_one(
        {"id": current_user["sub"]},
        {"$unset": {"push_token": "", "push_device_type": ""}}
    )
    return {"status": "unregistered"}

async def send_push_notification(token: str, title: str, body: str, data: dict = None):
    """Send push notification via Expo's push service"""
    message = {
        "to": token,
        "sound": "default",
        "title": title,
        "body": body,
        "data": data or {}
    }
    
    try:
        response = http_requests.post(
            'https://exp.host/--/api/v2/push/send',
            headers={
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            json=message
        )
        return response.json()
    except Exception as e:
        logger.error(f"Push notification error: {e}")
        return None

@api_router.post("/push/test")
async def test_push_notification(current_user: dict = Depends(get_current_user)):
    """Send a test push notification"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("push_token"):
        raise HTTPException(status_code=400, detail="No push token registered")
    
    result = await send_push_notification(
        user["push_token"],
        "Test Notification",
        "Your push notifications are working!",
        {"type": "test"}
    )
    return {"status": "sent", "result": result}

# ==================== AUTOMATED REMINDERS ====================

async def send_booking_reminders():
    """Send reminders for bookings happening in the next 24 hours"""
    tomorrow = datetime.now(timezone.utc) + timedelta(hours=24)
    today = datetime.now(timezone.utc)
    
    # Find bookings in the next 24 hours that haven't had reminders sent
    bookings = await db.bookings.find({
        "datetime": {
            "$gte": today.isoformat(),
            "$lte": tomorrow.isoformat()
        },
        "status": {"$in": ["pending", "confirmed"]},
        "reminder_sent": {"$ne": True}
    }).to_list(100)
    
    for booking in bookings:
        # Get business info
        business = await db.businesses.find_one({"id": booking["business_id"]})
        business_name = business["name"] if business else "Your Provider"
        
        # Send email reminder
        if booking.get("client_email"):
            booking_time = datetime.fromisoformat(booking["datetime"].replace('Z', '+00:00'))
            html = f"""
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #00BFA5;">Reminder: Your appointment is tomorrow!</h2>
                <p>Hi {booking['client_name']},</p>
                <p>This is a friendly reminder about your upcoming appointment:</p>
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Service:</strong> {booking['service_name']}</p>
                    <p><strong>Date:</strong> {booking_time.strftime('%A, %B %d, %Y')}</p>
                    <p><strong>Time:</strong> {booking_time.strftime('%I:%M %p')}</p>
                    <p><strong>Business:</strong> {business_name}</p>
                </div>
                <p>We look forward to seeing you!</p>
            </div>
            """
            try:
                resend.Emails.send({
                    "from": SENDER_EMAIL,
                    "to": booking["client_email"],
                    "subject": f"Reminder: {booking['service_name']} tomorrow at {business_name}",
                    "html": html
                })
            except Exception as e:
                logger.error(f"Failed to send reminder email: {e}")
        
        # Send push notification to business owner
        owner = await db.users.find_one({"business_id": booking["business_id"]})
        if owner and owner.get("push_token"):
            await send_push_notification(
                owner["push_token"],
                "Upcoming Booking",
                f"{booking['client_name']} - {booking['service_name']} tomorrow",
                {"type": "reminder", "booking_id": booking["id"]}
            )
        
        # Mark reminder as sent
        await db.bookings.update_one(
            {"id": booking["id"]},
            {"$set": {"reminder_sent": True}}
        )
    
    logger.info(f"Sent {len(bookings)} booking reminders")

@api_router.post("/reminders/send-now")
async def trigger_reminders_now(current_user: dict = Depends(get_current_user)):
    """Manually trigger reminder sending (admin only)"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if user.get("role") != "admin" and user.get("role") != "owner":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await send_booking_reminders()
    return {"status": "reminders_sent"}

# ==================== STAFF SEPARATE LOGINS ====================

@api_router.post("/staff/create-login")
async def create_staff_login(data: StaffCreate, current_user: dict = Depends(get_current_user)):
    """Create login credentials for a team member"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Verify team member exists and belongs to this business
    team_member = await db.team_members.find_one({
        "id": data.team_member_id,
        "business_id": user["business_id"]
    })
    if not team_member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    # Check if email already exists
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    staff_user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    staff_user_doc = {
        "id": staff_user_id,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "role": "staff",
        "business_id": user["business_id"],
        "team_member_id": data.team_member_id,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    await db.users.insert_one(staff_user_doc)
    
    # Update team member with user_id
    await db.team_members.update_one(
        {"id": data.team_member_id},
        {"$set": {"user_id": staff_user_id, "email": data.email}}
    )
    
    return {"status": "created", "staff_user_id": staff_user_id}

@api_router.post("/auth/staff-login", response_model=TokenResponse)
async def staff_login(data: StaffLogin):
    """Login as a staff member"""
    user = await db.users.find_one({
        "email": data.email,
        "business_id": data.business_id,
        "role": "staff"
    })
    
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"], "staff")
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            role="staff",
            business_id=user.get("business_id"),
            created_at=user["created_at"]
        )
    )

@api_router.get("/staff/my-schedule")
async def get_staff_schedule(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get schedule for logged-in staff member"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or user.get("role") != "staff":
        raise HTTPException(status_code=403, detail="Not a staff member")
    
    team_member_id = user.get("team_member_id")
    if not team_member_id:
        raise HTTPException(status_code=404, detail="No team member linked")
    
    query = {"team_member_id": team_member_id}
    if start_date:
        query["date"] = {"$gte": start_date}
    if end_date:
        if "date" in query:
            query["date"]["$lte"] = end_date
        else:
            query["date"] = {"$lte": end_date}
    
    shifts = await db.shifts.find(query, {"_id": 0}).to_list(100)
    bookings = await db.bookings.find({
        "team_member_id": team_member_id,
        "status": {"$in": ["pending", "confirmed"]}
    }, {"_id": 0}).to_list(100)
    
    return {"shifts": shifts, "bookings": bookings}

# ==================== CUSTOMER REVIEWS ====================

@api_router.post("/reviews")
async def create_review(data: ReviewCreate):
    """Create a review for a completed booking (public endpoint)"""
    booking = await db.bookings.find_one({"id": data.booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check if review already exists
    existing = await db.reviews.find_one({"booking_id": data.booking_id})
    if existing:
        raise HTTPException(status_code=400, detail="Review already submitted for this booking")
    
    review_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    review_doc = {
        "id": review_id,
        "business_id": booking["business_id"],
        "booking_id": data.booking_id,
        "service_id": booking.get("service_id"),
        "team_member_id": booking.get("team_member_id"),
        "client_name": booking["client_name"],
        "client_email": booking["client_email"],
        "rating": data.rating,
        "comment": data.comment,
        "response": None,
        "visible": True,
        "created_at": now.isoformat()
    }
    await db.reviews.insert_one(review_doc)
    
    # Update business average rating
    await update_business_rating(booking["business_id"])
    
    return {"id": review_id, "status": "submitted"}

async def update_business_rating(business_id: str):
    """Recalculate average rating for a business"""
    pipeline = [
        {"$match": {"business_id": business_id, "visible": True}},
        {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}, "count": {"$sum": 1}}}
    ]
    result = await db.reviews.aggregate(pipeline).to_list(1)
    
    if result:
        await db.businesses.update_one(
            {"id": business_id},
            {"$set": {
                "average_rating": round(result[0]["avg_rating"], 1),
                "review_count": result[0]["count"]
            }}
        )

@api_router.get("/reviews")
async def get_business_reviews(current_user: dict = Depends(get_current_user)):
    """Get all reviews for the business"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        return []
    
    reviews = await db.reviews.find(
        {"business_id": user["business_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return reviews

@api_router.get("/public/business/{business_id}/reviews")
async def get_public_reviews(business_id: str):
    """Get visible reviews for a business (public endpoint)"""
    reviews = await db.reviews.find(
        {"business_id": business_id, "visible": True},
        {"_id": 0, "client_email": 0}
    ).sort("created_at", -1).to_list(50)
    
    business = await db.businesses.find_one({"id": business_id}, {"_id": 0})
    
    return {
        "reviews": reviews,
        "average_rating": business.get("average_rating", 0) if business else 0,
        "review_count": business.get("review_count", 0) if business else 0
    }

@api_router.post("/reviews/{review_id}/respond")
async def respond_to_review(review_id: str, response: str, current_user: dict = Depends(get_current_user)):
    """Business owner responds to a review"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    review = await db.reviews.find_one({
        "id": review_id,
        "business_id": user["business_id"]
    })
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    await db.reviews.update_one(
        {"id": review_id},
        {"$set": {"response": response, "responded_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"status": "responded"}

@api_router.patch("/reviews/{review_id}/visibility")
async def toggle_review_visibility(review_id: str, visible: bool, current_user: dict = Depends(get_current_user)):
    """Toggle review visibility (hide inappropriate reviews)"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    await db.reviews.update_one(
        {"id": review_id, "business_id": user["business_id"]},
        {"$set": {"visible": visible}}
    )
    
    # Recalculate rating
    await update_business_rating(user["business_id"])
    return {"status": "updated"}

# ==================== MULTI-LOCATION SUPPORT ====================

@api_router.post("/locations")
async def create_location(data: LocationCreate, current_user: dict = Depends(get_current_user)):
    """Create a new business location"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    location_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    # If this is set as primary, unset other primary locations
    if data.is_primary:
        await db.locations.update_many(
            {"business_id": user["business_id"]},
            {"$set": {"is_primary": False}}
        )
    
    location_doc = {
        "id": location_id,
        "business_id": user["business_id"],
        "name": data.name,
        "address": data.address,
        "phone": data.phone,
        "email": data.email,
        "is_primary": data.is_primary,
        "active": True,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    await db.locations.insert_one(location_doc)
    return {"id": location_id, "name": data.name}

@api_router.get("/locations")
async def get_locations(current_user: dict = Depends(get_current_user)):
    """Get all locations for the business"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        return []
    
    locations = await db.locations.find(
        {"business_id": user["business_id"], "active": True},
        {"_id": 0}
    ).to_list(50)
    return locations

@api_router.patch("/locations/{location_id}")
async def update_location(location_id: str, data: LocationUpdate, current_user: dict = Depends(get_current_user)):
    """Update a location"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    # If setting as primary, unset others
    if data.is_primary:
        await db.locations.update_many(
            {"business_id": user["business_id"]},
            {"$set": {"is_primary": False}}
        )
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.locations.update_one(
        {"id": location_id, "business_id": user["business_id"]},
        {"$set": update_data}
    )
    return {"status": "updated"}

@api_router.delete("/locations/{location_id}")
async def delete_location(location_id: str, current_user: dict = Depends(get_current_user)):
    """Soft delete a location"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    await db.locations.update_one(
        {"id": location_id, "business_id": user["business_id"]},
        {"$set": {"active": False}}
    )
    return {"status": "deleted"}

@api_router.get("/public/business/{business_id}/locations")
async def get_public_locations(business_id: str):
    """Get public locations for a business"""
    locations = await db.locations.find(
        {"business_id": business_id, "active": True},
        {"_id": 0}
    ).to_list(50)
    return locations

# ==================== ADVANCED SCHEDULING (SHIFTS) ====================

@api_router.post("/shifts")
async def create_shift(data: ShiftCreate, current_user: dict = Depends(get_current_user)):
    """Create a shift for a team member"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Verify team member exists
    team_member = await db.team_members.find_one({
        "id": data.team_member_id,
        "business_id": user["business_id"]
    })
    if not team_member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    shift_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    shift_doc = {
        "id": shift_id,
        "business_id": user["business_id"],
        "team_member_id": data.team_member_id,
        "team_member_name": team_member["name"],
        "date": data.date,
        "start_time": data.start_time,
        "end_time": data.end_time,
        "location_id": data.location_id,
        "notes": data.notes,
        "created_at": now.isoformat()
    }
    await db.shifts.insert_one(shift_doc)
    return {"id": shift_id}

@api_router.get("/shifts")
async def get_shifts(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    team_member_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get shifts for the business"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        return []
    
    query = {"business_id": user["business_id"]}
    if start_date:
        query["date"] = {"$gte": start_date}
    if end_date:
        if "date" in query:
            query["date"]["$lte"] = end_date
        else:
            query["date"] = {"$lte": end_date}
    if team_member_id:
        query["team_member_id"] = team_member_id
    
    shifts = await db.shifts.find(query, {"_id": 0}).sort("date", 1).to_list(500)
    return shifts

@api_router.patch("/shifts/{shift_id}")
async def update_shift(shift_id: str, data: ShiftUpdate, current_user: dict = Depends(get_current_user)):
    """Update a shift"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    await db.shifts.update_one(
        {"id": shift_id, "business_id": user["business_id"]},
        {"$set": update_data}
    )
    return {"status": "updated"}

@api_router.delete("/shifts/{shift_id}")
async def delete_shift(shift_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a shift"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    await db.shifts.delete_one({"id": shift_id, "business_id": user["business_id"]})
    return {"status": "deleted"}

# ==================== TIME OFF REQUESTS ====================

@api_router.post("/time-off")
async def request_time_off(data: TimeOffRequest, current_user: dict = Depends(get_current_user)):
    """Request time off for a team member"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Staff can only request for themselves
    if user.get("role") == "staff" and user.get("team_member_id") != data.team_member_id:
        raise HTTPException(status_code=403, detail="Can only request time off for yourself")
    
    request_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    request_doc = {
        "id": request_id,
        "business_id": user["business_id"],
        "team_member_id": data.team_member_id,
        "start_date": data.start_date,
        "end_date": data.end_date,
        "reason": data.reason,
        "status": "pending",
        "requested_by": current_user["sub"],
        "created_at": now.isoformat()
    }
    await db.time_off_requests.insert_one(request_doc)
    return {"id": request_id, "status": "pending"}

@api_router.get("/time-off")
async def get_time_off_requests(current_user: dict = Depends(get_current_user)):
    """Get time off requests for the business"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or not user.get("business_id"):
        return []
    
    query = {"business_id": user["business_id"]}
    
    # Staff can only see their own
    if user.get("role") == "staff":
        query["team_member_id"] = user.get("team_member_id")
    
    requests = await db.time_off_requests.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return requests

@api_router.patch("/time-off/{request_id}/approve")
async def approve_time_off(request_id: str, current_user: dict = Depends(get_current_user)):
    """Approve a time off request (owner/manager only)"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or user.get("role") not in ["owner", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.time_off_requests.update_one(
        {"id": request_id, "business_id": user["business_id"]},
        {"$set": {"status": "approved", "approved_by": current_user["sub"], "approved_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"status": "approved"}

@api_router.patch("/time-off/{request_id}/deny")
async def deny_time_off(request_id: str, reason: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Deny a time off request (owner/manager only)"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or user.get("role") not in ["owner", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.time_off_requests.update_one(
        {"id": request_id, "business_id": user["business_id"]},
        {"$set": {"status": "denied", "denied_by": current_user["sub"], "denial_reason": reason}}
    )
    return {"status": "denied"}

# ==================== SUPPORT MESSAGING ====================

@api_router.get("/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """Get all conversations for the current user"""
    user = await db.users.find_one({"id": current_user["sub"]})
    user_id = current_user["sub"]
    
    conversations = await db.conversations.find(
        {"participants": user_id}
    ).sort("last_message_at", -1).to_list(50)
    
    result = []
    for conv in conversations:
        conv_id = conv.get("id")
        unread = await db.messages.count_documents({
            "conversation_id": conv_id,
            "sender_id": {"$ne": user_id},
            "read": False
        })
        result.append({
            "id": conv_id,
            "participants": conv.get("participants", []),
            "participant_names": conv.get("participant_names", {}),
            "subject": conv.get("subject", "Support Request"),
            "status": conv.get("status", "open"),
            "last_message": conv.get("last_message"),
            "last_message_at": conv.get("last_message_at"),
            "created_at": conv.get("created_at"),
            "unread_count": unread,
            "type": conv.get("type", "support")
        })
    
    return result

@api_router.post("/conversations")
async def create_conversation(data: MessageCreate, current_user: dict = Depends(get_current_user)):
    """Start a new conversation with support"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    now = datetime.now(timezone.utc)
    conversation_id = str(uuid.uuid4())
    
    # Support conversation - between user and admin
    participants = [current_user["sub"], "support"]
    participant_names = {
        current_user["sub"]: user.get("email", "User"),
        "support": "Rezvo Support"
    }
    
    # Always create a new conversation for each ticket - don't reuse
    conv_doc = {
        "id": conversation_id,
        "participants": participants,
        "participant_names": participant_names,
        "type": "support",
        "subject": data.subject if hasattr(data, 'subject') and data.subject else "Support Request",
        "status": "open",
        "business_id": user.get("business_id"),
        "created_at": now.isoformat(),
        "last_message": data.content,
        "last_message_at": now.isoformat()
    }
    await db.conversations.insert_one(conv_doc)
    
    # Create first message
    message_id = str(uuid.uuid4())
    message_doc = {
        "id": message_id,
        "conversation_id": conversation_id,
        "sender_id": current_user["sub"],
        "sender_name": user.get("email", "User"),
        "content": data.content,
        "read": False,
        "created_at": now.isoformat()
    }
    await db.messages.insert_one(message_doc)
    
    # Update conversation last message
    await db.conversations.update_one(
        {"id": conversation_id},
        {"$set": {"last_message": data.content, "last_message_at": now.isoformat()}}
    )
    
    return {"conversation_id": conversation_id, "message_id": message_id}

@api_router.patch("/conversations/{conversation_id}")
async def update_conversation(conversation_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update conversation status"""
    conv = await db.conversations.find_one({"id": conversation_id})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check access - owner or admin
    user = await db.users.find_one({"id": current_user["sub"]})
    if current_user["sub"] not in conv.get("participants", []) and user.get("role") not in ["admin", "business"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {}
    if "status" in data:
        update_data["status"] = data["status"]
        update_data["status_updated_at"] = datetime.now(timezone.utc).isoformat()
    
    if update_data:
        await db.conversations.update_one({"id": conversation_id}, {"$set": update_data})
    
    return {"status": "updated"}

@api_router.get("/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """Get messages in a conversation"""
    conv = await db.conversations.find_one({"id": conversation_id})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check access
    if current_user["sub"] not in conv.get("participants", []) and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    messages = await db.messages.find(
        {"conversation_id": conversation_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(200)
    
    # Mark as read
    await db.messages.update_many(
        {"conversation_id": conversation_id, "sender_id": {"$ne": current_user["sub"]}},
        {"$set": {"read": True}}
    )
    
    return messages

@api_router.post("/conversations/{conversation_id}/messages")
async def send_message(conversation_id: str, data: MessageCreate, current_user: dict = Depends(get_current_user)):
    """Send a message in a conversation"""
    conv = await db.conversations.find_one({"id": conversation_id})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check access
    if current_user["sub"] not in conv.get("participants", []) and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = await db.users.find_one({"id": current_user["sub"]})
    is_admin = current_user.get("role") == "admin"
    now = datetime.now(timezone.utc)
    message_id = str(uuid.uuid4())
    
    message_doc = {
        "id": message_id,
        "conversation_id": conversation_id,
        "sender_id": current_user["sub"],
        "sender_name": user.get("email", "User") if user else "Support",
        "content": data.content,
        "read": False,
        "is_admin": is_admin,
        "created_at": now.isoformat()
    }
    await db.messages.insert_one(message_doc)
    
    # Update conversation
    await db.conversations.update_one(
        {"id": conversation_id},
        {"$set": {"last_message": data.content, "last_message_at": now.isoformat()}}
    )
    
    # Create notification for other participants
    for participant_id in conv.get("participants", []):
        if participant_id != current_user["sub"]:
            await create_notification_internal(
                user_id=participant_id,
                title="New Support Message",
                message=f"You have a new message: {data.content[:50]}{'...' if len(data.content) > 50 else ''}",
                notif_type="message",
                link="/support"
            )
    
    return {"id": message_id, "created_at": now.isoformat()}

@api_router.patch("/messages/{message_id}")
async def edit_message(message_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Edit a message"""
    message = await db.messages.find_one({"id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if message.get("sender_id") != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this message")
    
    await db.messages.update_one(
        {"id": message_id},
        {"$set": {"content": data.get("content"), "edited": True}}
    )
    return {"status": "updated"}

@api_router.delete("/messages/{message_id}")
async def delete_message(message_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a message"""
    message = await db.messages.find_one({"id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if message.get("sender_id") != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this message")
    
    await db.messages.delete_one({"id": message_id})
    return {"status": "deleted"}

@api_router.get("/admin/conversations")
async def get_all_support_conversations(current_user: dict = Depends(get_current_user)):
    """Get all support conversations (admin/founder only)"""
    user = await db.users.find_one({"id": current_user["sub"]})
    # Allow admin role OR business owners (founders can manage support)
    if not user or (user.get("role") != "admin" and user.get("role") != "business"):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    conversations = await db.conversations.find(
        {"type": "support"}
    ).sort("last_message_at", -1).to_list(100)
    
    result = []
    for conv in conversations:
        # Get user info for this conversation
        user_id = None
        for p in conv.get("participants", []):
            if p != "support":
                user_id = p
                break
        
        user_info = await db.users.find_one({"id": user_id}) if user_id else None
        user_email = user_info.get("email") if user_info else conv.get("participant_names", {}).get(user_id, "Unknown")
        
        unread = await db.messages.count_documents({
            "conversation_id": conv["id"],
            "sender_id": {"$ne": "support"},
            "read": False
        })
        result.append({
            "id": conv["id"],
            "participants": conv.get("participants", []),
            "participant_names": conv.get("participant_names", {}),
            "user_email": user_email,
            "subject": conv.get("subject", "Support Request"),
            "status": conv.get("status", "open"),
            "business_id": conv.get("business_id"),
            "last_message": conv.get("last_message"),
            "last_message_at": conv.get("last_message_at"),
            "updated_at": conv.get("last_message_at"),
            "unread_count": unread
        })
    
    return result

# ==================== LIVE CHAT SETTINGS ====================

class LiveChatSettings(BaseModel):
    is_online: bool = False
    auto_hours_enabled: bool = True
    working_hours: Dict[str, Any] = Field(default_factory=lambda: {
        "monday": {"start": "09:00", "end": "18:00", "enabled": True},
        "tuesday": {"start": "09:00", "end": "18:00", "enabled": True},
        "wednesday": {"start": "09:00", "end": "18:00", "enabled": True},
        "thursday": {"start": "09:00", "end": "18:00", "enabled": True},
        "friday": {"start": "09:00", "end": "18:00", "enabled": True},
        "saturday": {"start": "09:00", "end": "18:00", "enabled": False},
        "sunday": {"start": "09:00", "end": "18:00", "enabled": False}
    })

@api_router.get("/admin/live-chat-settings")
async def get_live_chat_settings(current_user: dict = Depends(get_current_user)):
    """Get live chat settings (admin only)"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    settings = await db.platform_settings.find_one({"key": "live_chat"})
    if not settings:
        # Create default settings
        default_settings = {
            "key": "live_chat",
            "is_online": False,
            "auto_hours_enabled": True,
            "working_hours": {
                "monday": {"start": "09:00", "end": "18:00", "enabled": True},
                "tuesday": {"start": "09:00", "end": "18:00", "enabled": True},
                "wednesday": {"start": "09:00", "end": "18:00", "enabled": True},
                "thursday": {"start": "09:00", "end": "18:00", "enabled": True},
                "friday": {"start": "09:00", "end": "18:00", "enabled": True},
                "saturday": {"start": "09:00", "end": "18:00", "enabled": False},
                "sunday": {"start": "09:00", "end": "18:00", "enabled": False}
            },
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.platform_settings.insert_one(default_settings)
        return {k: v for k, v in default_settings.items() if k != "_id" and k != "key"}
    
    return {
        "is_online": settings.get("is_online", False),
        "auto_hours_enabled": settings.get("auto_hours_enabled", True),
        "working_hours": settings.get("working_hours", {}),
        "updated_at": settings.get("updated_at")
    }

@api_router.patch("/admin/live-chat-settings")
async def update_live_chat_settings(data: LiveChatSettings, current_user: dict = Depends(get_current_user)):
    """Update live chat settings (admin only)"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.platform_settings.update_one(
        {"key": "live_chat"},
        {"$set": {
            "is_online": data.is_online,
            "auto_hours_enabled": data.auto_hours_enabled,
            "working_hours": data.working_hours,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    return {"message": "Live chat settings updated"}

@api_router.post("/admin/live-chat-toggle")
async def toggle_live_chat(current_user: dict = Depends(get_current_user)):
    """Toggle live chat online/offline status"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    settings = await db.platform_settings.find_one({"key": "live_chat"})
    current_status = settings.get("is_online", False) if settings else False
    
    await db.platform_settings.update_one(
        {"key": "live_chat"},
        {"$set": {
            "is_online": not current_status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    return {"is_online": not current_status}

@api_router.get("/support/live-chat-status")
async def get_live_chat_status():
    """Get current live chat status (public endpoint for mobile/web)"""
    settings = await db.platform_settings.find_one({"key": "live_chat"})
    
    if not settings:
        return {"is_online": False, "message": "Live chat is currently offline"}
    
    is_online = settings.get("is_online", False)
    auto_hours = settings.get("auto_hours_enabled", True)
    
    # If auto hours is enabled, check if we're within working hours
    if auto_hours and not is_online:
        working_hours = settings.get("working_hours", {})
        now = datetime.now(timezone.utc)
        day_name = now.strftime("%A").lower()
        day_settings = working_hours.get(day_name, {})
        
        if day_settings.get("enabled", False):
            start_time = day_settings.get("start", "09:00")
            end_time = day_settings.get("end", "18:00")
            
            current_time = now.strftime("%H:%M")
            if start_time <= current_time <= end_time:
                is_online = True
    
    return {
        "is_online": is_online,
        "message": "We're online! Start a chat." if is_online else "We're currently offline. Leave a message and we'll respond within 24 hours."
    }

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "QuickSlot API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# ==================== EXPO TUNNEL ====================

@api_router.get("/expo/tunnel-url")
async def get_expo_tunnel_url():
    """Get the current Expo tunnel URL for mobile testing"""
    # Check if we have a stored tunnel URL
    tunnel_info = await db.system_config.find_one({"key": "expo_tunnel"})
    if tunnel_info and tunnel_info.get("url"):
        return {"url": tunnel_info["url"], "updated_at": tunnel_info.get("updated_at")}
    
    # Fallback to local network URL
    return {"url": None, "message": "Tunnel not configured. Use LAN URL or start tunnel."}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Start the scheduler for automated reminders"""
    # Run reminders every day at 9 AM
    scheduler.add_job(send_booking_reminders, CronTrigger(hour=9, minute=0))
    scheduler.start()
    logger.info("Scheduler started for automated booking reminders")

@app.on_event("shutdown")
async def shutdown_db_client():
    scheduler.shutdown()
    client.close()
