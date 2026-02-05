#!/usr/bin/env python3
"""
Rezvo App - Data Seeding Script
Seeds the database with realistic dummy data for testing
"""

import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import os
import random

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'rezvo_db')

# Sample data
BUSINESS_NAMES = [
    "Sarah's Hair Studio", "The Barber Shop", "Nail Paradise", 
    "Zen Massage Therapy", "FitLife PT", "Beauty Box Salon"
]

SERVICE_TYPES = [
    {"name": "Haircut & Style", "price": 3500, "duration": 45, "color": "#00BFA5"},
    {"name": "Men's Haircut", "price": 2500, "duration": 30, "color": "#3B82F6"},
    {"name": "Hair Coloring", "price": 8500, "duration": 120, "color": "#8B5CF6"},
    {"name": "Manicure", "price": 2500, "duration": 30, "color": "#EC4899"},
    {"name": "Pedicure", "price": 3500, "duration": 45, "color": "#F59E0B"},
    {"name": "Full Body Massage", "price": 6500, "duration": 60, "color": "#06B6D4"},
    {"name": "Deep Tissue Massage", "price": 7500, "duration": 60, "color": "#84CC16"},
    {"name": "Personal Training Session", "price": 4500, "duration": 60, "color": "#EF4444"},
    {"name": "Facial Treatment", "price": 5500, "duration": 45, "color": "#F97316"},
    {"name": "Beard Trim", "price": 1500, "duration": 15, "color": "#6366F1"},
]

TEAM_MEMBERS = [
    {"name": "Sarah Johnson", "role": "manager", "email": "sarah@example.com"},
    {"name": "Michael Chen", "role": "staff", "email": "michael@example.com"},
    {"name": "Emma Wilson", "role": "staff", "email": "emma@example.com"},
    {"name": "James Brown", "role": "staff", "email": "james@example.com"},
    {"name": "Sophie Taylor", "role": "admin", "email": "sophie@example.com"},
    {"name": "David Lee", "role": "staff", "email": "david@example.com"},
]

CLIENT_NAMES = [
    "Alice Smith", "Bob Johnson", "Charlie Brown", "Diana Ross",
    "Edward King", "Fiona Green", "George White", "Hannah Black",
    "Ivan Grey", "Julia Stone", "Kevin Hart", "Laura Moon",
    "Marcus Sun", "Nina Star", "Oscar Day", "Paula Night"
]

COLORS = ['#00BFA5', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16']

async def seed_database():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🌱 Starting database seeding...")
    
    # Check if test user exists
    existing_user = await db.users.find_one({"email": "testuser@example.com"})
    
    if existing_user and existing_user.get("business_id"):
        business_id = existing_user["business_id"]
        user_id = existing_user["id"]
        print(f"✓ Using existing test user and business: {business_id}")
    else:
        # Create test user
        user_id = str(uuid.uuid4())
        business_id = str(uuid.uuid4())
        password_hash = bcrypt.hashpw("password123".encode(), bcrypt.gensalt()).decode()
        
        user_doc = {
            "id": user_id,
            "email": "testuser@example.com",
            "password": password_hash,
            "role": "business",
            "business_id": business_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        
        # Create business
        business_doc = {
            "id": business_id,
            "owner_id": user_id,
            "name": "Test Business",
            "tagline": "Professional services for everyone",
            "phone": "+44 7123 456789",
            "email": "info@testbusiness.com",
            "address": "123 High Street, London, UK",
            "availability": [
                {"day": i, "start": "09:00", "end": "17:00", "enabled": i >= 1 and i <= 6}
                for i in range(7)
            ],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.businesses.insert_one(business_doc)
        print(f"✓ Created test user and business: {business_id}")
    
    # Clear existing seeded data (keep user and business)
    await db.team_members.delete_many({"business_id": business_id})
    await db.services.delete_many({"business_id": business_id})
    await db.bookings.delete_many({"business_id": business_id})
    print("✓ Cleared existing seeded data")
    
    # Seed team members
    team_ids = []
    for i, member in enumerate(TEAM_MEMBERS):
        member_id = str(uuid.uuid4())
        team_ids.append(member_id)
        now = datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))
        
        member_doc = {
            "id": member_id,
            "business_id": business_id,
            "name": member["name"],
            "email": member["email"],
            "phone": f"+44 7{random.randint(100, 999)} {random.randint(100, 999)} {random.randint(100, 999)}",
            "role": member["role"],
            "color": COLORS[i % len(COLORS)],
            "avatar_url": None,
            "service_ids": [],
            "working_hours": [
                {"day": d, "start": "09:00", "end": "17:00", "enabled": d >= 1 and d <= 5}
                for d in range(7)
            ],
            "show_on_booking_page": True,
            "active": True,
            "bookings_completed": random.randint(10, 100),
            "revenue_pence": random.randint(50000, 500000),
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }
        await db.team_members.insert_one(member_doc)
    print(f"✓ Created {len(TEAM_MEMBERS)} team members")
    
    # Seed services
    service_ids = []
    for service in SERVICE_TYPES[:6]:  # Add 6 services
        service_id = str(uuid.uuid4())
        service_ids.append(service_id)
        
        service_doc = {
            "id": service_id,
            "business_id": business_id,
            "name": service["name"],
            "description": f"Professional {service['name'].lower()} service",
            "price_pence": service["price"],
            "duration_min": service["duration"],
            "color": service["color"],
            "category": "General",
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.services.insert_one(service_doc)
    print(f"✓ Created {len(service_ids)} services")
    
    # Update team members with service_ids
    for team_id in team_ids:
        assigned_services = random.sample(service_ids, k=min(3, len(service_ids)))
        await db.team_members.update_one(
            {"id": team_id},
            {"$set": {"service_ids": assigned_services}}
        )
    
    # Seed bookings (past and future)
    booking_count = 0
    statuses = ["confirmed", "completed", "cancelled", "pending"]
    
    for days_offset in range(-14, 15):  # 2 weeks past to 2 weeks future
        num_bookings = random.randint(2, 6)
        
        for _ in range(num_bookings):
            booking_id = str(uuid.uuid4())
            service = random.choice(SERVICE_TYPES[:6])
            client = random.choice(CLIENT_NAMES)
            team_member_id = random.choice(team_ids)
            
            # Random time between 9am and 5pm
            hour = random.randint(9, 16)
            minute = random.choice([0, 30])
            
            booking_date = datetime.now(timezone.utc) + timedelta(days=days_offset)
            booking_date = booking_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
            
            # Status based on date
            if days_offset < 0:
                status = random.choice(["completed", "cancelled", "completed", "completed"])
            elif days_offset == 0:
                status = random.choice(["confirmed", "completed", "pending"])
            else:
                status = random.choice(["confirmed", "pending"])
            
            booking_doc = {
                "id": booking_id,
                "business_id": business_id,
                "service_id": random.choice(service_ids),
                "service_name": service["name"],
                "team_member_id": team_member_id,
                "client_name": client,
                "client_email": f"{client.lower().replace(' ', '.')}@email.com",
                "client_phone": f"+44 7{random.randint(100, 999)} {random.randint(100, 999)} {random.randint(1000, 9999)}",
                "datetime": booking_date.isoformat(),
                "duration_min": service["duration"],
                "price_pence": service["price"],
                "status": status,
                "notes": "",
                "created_at": (booking_date - timedelta(days=random.randint(1, 7))).isoformat()
            }
            await db.bookings.insert_one(booking_doc)
            booking_count += 1
    
    print(f"✓ Created {booking_count} bookings")
    
    # Seed some notifications
    notification_types = ["booking", "reminder", "system"]
    for i in range(5):
        notif_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": random.choice(["New booking received", "Booking reminder", "System update"]),
            "message": "This is a sample notification message.",
            "type": random.choice(notification_types),
            "read": random.choice([True, False]),
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 48))).isoformat()
        }
        await db.notifications.insert_one(notif_doc)
    print("✓ Created 5 notifications")
    
    # Summary
    print("\n" + "="*50)
    print("✅ Database seeding complete!")
    print("="*50)
    print(f"Business ID: {business_id}")
    print(f"Test User: testuser@example.com / password123")
    print(f"Team Members: {len(TEAM_MEMBERS)}")
    print(f"Services: {len(service_ids)}")
    print(f"Bookings: {booking_count}")
    print("="*50)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
