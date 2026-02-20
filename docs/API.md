# Rezvo API Documentation

Base URL: `https://api.rezvo.co.uk`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

### Success Response

```json
{
  "data": { ... },
  "message": "Success"
}
```

### Error Response

```json
{
  "detail": "Error message"
}
```

## Endpoints

### Authentication

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john@example.com",
  "password": "securepassword",
  "phone": "+447700123456",
  "role": "diner"
}
```

**Response:**

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Smith",
    "role": "diner",
    "created_at": "2026-02-20T10:00:00Z"
  }
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:** Same as register

### Directory (Public)

#### Search Businesses

```http
GET /directory/search?query=italian&location=london&category=restaurant&limit=20
```

**Parameters:**

- `query` (optional): Search term
- `category` (optional): restaurant, barber, salon, spa
- `location` (optional): Location slug
- `lat` (optional): Latitude for radius search
- `lng` (optional): Longitude for radius search
- `radius_km` (optional): Radius in kilometers (default: 10)
- `min_rating` (optional): Minimum rating (1-5)
- `price_level` (optional): Price level (1-4)
- `promoted_only` (optional): Show only promoted businesses
- `limit` (optional): Results per page (default: 20, max: 100)
- `skip` (optional): Skip N results for pagination

**Response:**

```json
{
  "total": 156,
  "limit": 20,
  "skip": 0,
  "results": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "The Italian Kitchen",
      "slug": "the-italian-kitchen",
      "category": "restaurant",
      "address": "123 High Street, London",
      "lat": 51.5074,
      "lng": -0.1278,
      "rating": 4.5,
      "review_count": 234,
      "price_level": 2,
      "photo_refs": ["..."],
      "claimed": true,
      "rezvo_tier": "pro",
      "promoted": false
    }
  ]
}
```

#### Get Featured Businesses

```http
GET /directory/featured?category=restaurant&limit=10
```

### Businesses

#### Create Business

```http
POST /businesses
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Restaurant",
  "category": "restaurant",
  "tier": "venue",
  "address": "123 High Street, London",
  "phone": "+447700123456",
  "lat": 51.5074,
  "lng": -0.1278,
  "location_id": "507f1f77bcf86cd799439011"
}
```

#### Claim Business

```http
POST /businesses/{business_id}/claim
Authorization: Bearer <token>
```

### Bookings

#### Create Reservation

```http
POST /bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "business_id": "507f1f77bcf86cd799439011",
  "date": "2026-02-25",
  "time": "19:00:00",
  "duration_minutes": 120,
  "party_size": 4,
  "notes": "Window seat preferred",
  "table_id": "table_1",
  "staff_id": "staff_1"
}
```

#### Check Availability

```http
GET /bookings/business/{business_id}/availability?date=2026-02-25&party_size=4
```

**Response:**

```json
{
  "date": "2026-02-25",
  "slots": [
    {
      "time": "18:00:00",
      "available": true
    },
    {
      "time": "18:15:00",
      "available": true
    },
    {
      "time": "18:30:00",
      "available": false
    }
  ]
}
```

### Reviews

#### Create Review

```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "business_id": "507f1f77bcf86cd799439011",
  "rating": 5,
  "body": "Excellent food and service!",
  "categories": {
    "food": 5,
    "service": 5,
    "atmosphere": 4,
    "value": 5
  },
  "reservation_id": "507f1f77bcf86cd799439012"
}
```

#### Get Business Reviews

```http
GET /reviews/business/{business_id}?limit=20&skip=0&min_rating=4
```

### Analytics (Business Owners)

#### Get Overview

```http
GET /analytics/business/{business_id}/overview?start_date=2026-01-01&end_date=2026-02-20
Authorization: Bearer <token>
```

**Response:**

```json
{
  "period": {
    "start_date": "2026-01-01",
    "end_date": "2026-02-20"
  },
  "bookings": {
    "total": 245,
    "confirmed": 230,
    "cancelled": 10,
    "no_shows": 5,
    "cancellation_rate": 4.08,
    "no_show_rate": 2.04
  },
  "reviews": {
    "total": 45,
    "average_rating": 4.6
  }
}
```

### Payments

#### Create Stripe Connect Account

```http
POST /payments/stripe/connect?business_id={business_id}
Authorization: Bearer <token>
```

**Response:**

```json
{
  "url": "https://connect.stripe.com/..."
}
```

## Rate Limiting

- 100 requests per minute for authenticated endpoints
- 30 requests per minute for public endpoints
- 10 requests per minute for search endpoints

## Pagination

All list endpoints support pagination:

- `limit`: Results per page (max varies by endpoint)
- `skip`: Number of results to skip

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error
