import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import requests
import os
from datetime import datetime

MONGODB_URL = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
MONGODB_DB_NAME = os.getenv('MONGODB_DB_NAME', 'rezvo')
GOOGLE_PLACES_API_KEY = os.getenv('GOOGLE_PLACES_API_KEY')

# 140 UK locations (major cities and towns)
UK_LOCATIONS = [
    {"name": "London", "county": "Greater London", "region": "London", "lat": 51.5074, "lng": -0.1278, "population": 9000000},
    {"name": "Birmingham", "county": "West Midlands", "region": "West Midlands", "lat": 52.4862, "lng": -1.8904, "population": 1140000},
    {"name": "Manchester", "county": "Greater Manchester", "region": "North West", "lat": 53.4808, "lng": -2.2426, "population": 550000},
    {"name": "Leeds", "county": "West Yorkshire", "region": "Yorkshire and the Humber", "lat": 53.8008, "lng": -1.5491, "population": 793000},
    {"name": "Liverpool", "county": "Merseyside", "region": "North West", "lat": 53.4084, "lng": -2.9916, "population": 494000},
    {"name": "Sheffield", "county": "South Yorkshire", "region": "Yorkshire and the Humber", "lat": 53.3811, "lng": -1.4701, "population": 584000},
    {"name": "Bristol", "county": "Bristol", "region": "South West", "lat": 51.4545, "lng": -2.5879, "population": 463000},
    {"name": "Newcastle", "county": "Tyne and Wear", "region": "North East", "lat": 54.9783, "lng": -1.6178, "population": 302000},
    {"name": "Nottingham", "county": "Nottinghamshire", "region": "East Midlands", "lat": 52.9548, "lng": -1.1581, "population": 332000},
    {"name": "Brighton", "county": "East Sussex", "region": "South East", "lat": 50.8225, "lng": -0.1372, "population": 290000},
]


def slugify(text):
    import re
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text


async def seed_locations(db):
    print("Seeding UK locations...")
    
    for location in UK_LOCATIONS:
        location_doc = {
            "name": location["name"],
            "slug": slugify(location["name"]),
            "county": location.get("county"),
            "region": location["region"],
            "lat": location["lat"],
            "lng": location["lng"],
            "population": location.get("population")
        }
        
        await db.locations.update_one(
            {"slug": location_doc["slug"]},
            {"$set": location_doc},
            upsert=True
        )
    
    print(f"✓ Seeded {len(UK_LOCATIONS)} locations")


async def import_google_places(db):
    if not GOOGLE_PLACES_API_KEY:
        print("⚠ GOOGLE_PLACES_API_KEY not set, skipping Google Places import")
        return
    
    print("Importing businesses from Google Places...")
    
    categories = {
        "restaurant": ["restaurant", "cafe"],
        "barber": ["barber_shop", "hair_care"],
        "salon": ["beauty_salon", "hair_salon"],
        "spa": ["spa", "beauty_spa"]
    }
    
    locations = await db.locations.find().to_list(length=None)
    
    total_imported = 0
    
    for location in locations[:5]:  # Start with first 5 locations
        for category, types in categories.items():
            for place_type in types:
                try:
                    # Google Places Nearby Search
                    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
                    params = {
                        "location": f"{location['lat']},{location['lng']}",
                        "radius": 5000,
                        "type": place_type,
                        "key": GOOGLE_PLACES_API_KEY
                    }
                    
                    response = requests.get(url, params=params)
                    data = response.json()
                    
                    if data.get("status") != "OK":
                        continue
                    
                    for place in data.get("results", []):
                        business_doc = {
                            "google_place_id": place["place_id"],
                            "location_id": str(location["_id"]),
                            "category": category,
                            "name": place["name"],
                            "slug": slugify(place["name"]),
                            "address": place.get("vicinity", ""),
                            "lat": place["geometry"]["location"]["lat"],
                            "lng": place["geometry"]["location"]["lng"],
                            "rating": place.get("rating"),
                            "review_count": place.get("user_ratings_total", 0),
                            "price_level": place.get("price_level"),
                            "primary_type": place_type,
                            "all_types": place.get("types", []),
                            "photo_refs": [photo["photo_reference"] for photo in place.get("photos", [])[:5]],
                            "claimed": False,
                            "rezvo_tier": "free",
                            "promoted": False,
                            "notify_count": 0,
                            "created_at": datetime.utcnow(),
                            "updated_at": datetime.utcnow()
                        }
                        
                        await db.businesses.update_one(
                            {"google_place_id": place["place_id"]},
                            {"$set": business_doc},
                            upsert=True
                        )
                        
                        total_imported += 1
                    
                    # Rate limiting
                    await asyncio.sleep(0.5)
                    
                except Exception as e:
                    print(f"Error importing {place_type} in {location['name']}: {e}")
    
    print(f"✓ Imported {total_imported} businesses from Google Places")


async def generate_seo_urls(db):
    print("Generating SEO URLs...")
    
    categories = ["restaurants", "barbers", "salons", "spas"]
    locations = await db.locations.find().to_list(length=None)
    
    # Additional filters
    cuisines = ["italian", "indian", "chinese", "japanese", "mexican", "french", "thai"]
    occasions = ["romantic", "family", "business", "casual", "fine-dining"]
    
    seo_urls = []
    
    # Category pages
    for category in categories:
        seo_urls.append(f"/{category}")
    
    # Category + Location pages
    for category in categories:
        for location in locations:
            seo_urls.append(f"/{category}/{location['slug']}")
    
    # Category + Location + Filter pages
    for location in locations[:20]:  # Top 20 locations
        for cuisine in cuisines:
            seo_urls.append(f"/restaurants/{location['slug']}/{cuisine}-restaurants")
        
        for occasion in occasions:
            seo_urls.append(f"/restaurants/{location['slug']}/{occasion}")
    
    print(f"✓ Generated {len(seo_urls)} SEO URLs")
    print(f"  Examples:")
    for url in seo_urls[:10]:
        print(f"    https://rezvo.co.uk{url}")


async def main():
    print("=" * 60)
    print("REZVO UK DATABASE SEEDER")
    print("=" * 60)
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[MONGODB_DB_NAME]
    
    # Seed locations
    await seed_locations(db)
    
    # Import from Google Places
    await import_google_places(db)
    
    # Generate SEO URLs
    await generate_seo_urls(db)
    
    print("\n✓ Seeding complete!")
    print(f"\nDatabase: {MONGODB_DB_NAME}")
    print(f"Connection: {MONGODB_URL}")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
