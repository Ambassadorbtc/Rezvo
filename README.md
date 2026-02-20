# Rezvo - Your High Street, Booked

A UK multi-vertical booking platform for restaurants, barbers, salons, and spas.

## Tech Stack

### Backend
- **FastAPI** (Python 3.11+)
- **MongoDB** with Motor async driver
- **JWT Authentication** with python-jose
- **Stripe Connect** for payments
- **Google Places API** for business data

### Frontend
- **React 18** with Vite
- **Tailwind CSS 3**
- **React Router v6**
- **React Context** for state management

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB 6.0+
- Google API Keys
- Stripe Account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd rezvo
```

2. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
cp ../.env.example .env
# Edit .env with your credentials
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

4. **Start MongoDB**
```bash
# Using Docker
docker-compose up -d mongodb

# Or start MongoDB locally
mongod --dbpath /path/to/data
```

5. **Run Backend**
```bash
cd backend
python server.py
# API runs on http://localhost:8000
```

6. **Run Frontend**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

## Project Structure

```
rezvo/
├── backend/               # FastAPI application
│   ├── routes/           # 14 API route modules
│   ├── models/           # Pydantic models
│   ├── middleware/       # Auth, CORS middleware
│   ├── services/         # Business logic
│   └── server.py         # Entry point
├── frontend/             # React application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React Context providers
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── utils/       # API client, constants
│   └── public/          # Static assets
├── scripts/             # Utility scripts
└── docs/                # Documentation
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/password-reset-request` - Request password reset
- `POST /auth/password-reset-confirm` - Confirm password reset

### Users
- `GET /users/me` - Get current user
- `PATCH /users/me` - Update current user
- `POST /users/me/save-business/{business_id}` - Save business
- `GET /users/me/bookings` - Get user bookings

### Businesses
- `POST /businesses` - Create business
- `GET /businesses/{business_id}` - Get business
- `PATCH /businesses/{business_id}` - Update business
- `DELETE /businesses/{business_id}` - Delete business
- `POST /businesses/{business_id}/claim` - Claim unclaimed business

### Bookings
- `POST /bookings` - Create reservation
- `GET /bookings/{reservation_id}` - Get reservation
- `PATCH /bookings/{reservation_id}` - Update reservation
- `DELETE /bookings/{reservation_id}` - Cancel reservation
- `GET /bookings/business/{business_id}/availability` - Check availability

### Directory (Public)
- `GET /directory/search` - Search businesses
- `GET /directory/categories/{category}` - Get businesses by category
- `GET /directory/locations` - Get all locations
- `GET /directory/featured` - Get featured businesses

### Reviews
- `POST /reviews` - Create review
- `GET /reviews/business/{business_id}` - Get business reviews
- `PATCH /reviews/{review_id}` - Update review
- `DELETE /reviews/{review_id}` - Delete review

### Analytics (Business Owners)
- `GET /analytics/business/{business_id}/overview` - Get analytics overview
- `GET /analytics/business/{business_id}/bookings-by-day` - Get bookings by day
- `GET /analytics/business/{business_id}/revenue` - Get revenue analytics

### Payments
- `POST /payments/stripe/connect` - Create Stripe Connect account
- `GET /payments/stripe/account/{business_id}` - Get Stripe account status
- `POST /payments/create-payment-intent` - Create payment intent

## Environment Variables

See `.env.example` for required environment variables.

## Deployment

See deployment guide in `docs/` folder for production deployment instructions.

## License

Proprietary - All Rights Reserved
