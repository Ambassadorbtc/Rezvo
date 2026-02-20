# Rezvo Quickstart Guide

Get Rezvo running locally in 5 minutes.

## Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB (or use Docker)

## Quick Setup

### 1. Start MongoDB

**Option A: Using Docker (Recommended)**

```bash
docker-compose up -d mongodb
```

**Option B: Local MongoDB**

```bash
mongod --dbpath /path/to/data
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp ../.env.example .env

# Edit .env with your values (at minimum, set MongoDB URL and JWT secret)
# MONGODB_URL=mongodb://localhost:27017
# JWT_SECRET_KEY=your-secret-key-here

# Run backend
python server.py
```

Backend runs on http://localhost:8000

### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run frontend
npm run dev
```

Frontend runs on http://localhost:5173

### 4. Seed Database (Optional)

```bash
# In backend directory with venv activated
cd ..
python scripts/rezvo_seed_uk.py
```

## Access the Application

- **Frontend:** http://localhost:5173
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

## Create Test Accounts

### Business Owner Account

1. Go to http://localhost:5173/register
2. Select "Business Owner"
3. Fill in details
4. Complete onboarding flow

### Diner Account

1. Go to http://localhost:5173/register
2. Select "Diner"
3. Fill in details
4. Browse directory and make bookings

## Quick API Test

```bash
# Register a user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "diner"
  }'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Search businesses
curl http://localhost:8000/directory/search?category=restaurant&limit=10
```

## Common Issues

### MongoDB Connection Error

- Make sure MongoDB is running
- Check `MONGODB_URL` in `.env` file
- Default: `mongodb://localhost:27017`

### Backend Port Already in Use

- Change port in `server.py`:
  ```python
  uvicorn.run(app, host="0.0.0.0", port=8001)
  ```

### Frontend API Connection Error

- Check `VITE_API_URL` in `frontend/.env`
- Should match backend URL: `http://localhost:8000`

### Module Not Found Error

- Make sure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

## Next Steps

1. **Configure Google APIs** - Get API keys for Google Places, Maps, Geocoding
2. **Configure Stripe** - Set up Stripe Connect for payments
3. **Add Email/SMS** - Configure Resend or SendGrid for emails, Twilio for SMS
4. **Customize Brand** - Update colors, fonts, and copy in the frontend

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:

- **Backend:** Automatically reloads on file changes with uvicorn
- **Frontend:** Vite hot module replacement (HMR) enabled

### Debug Mode

Enable debug logging in backend:

```python
# In server.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

### View Database

```bash
# Connect to MongoDB
mongosh

# Switch to rezvo database
use rezvo

# List collections
show collections

# Query businesses
db.businesses.find().limit(5)

# Query users
db.users.find()
```

## Useful Commands

```bash
# Backend tests (when implemented)
cd backend
pytest

# Frontend build
cd frontend
npm run build

# Lint frontend
npm run lint

# Format Python code
cd backend
black .
```

## Getting Help

- Check the README.md for detailed documentation
- See docs/API.md for API reference
- See docs/DEPLOYMENT.md for production deployment

## Project Structure

```
rezvo/
├── backend/           # FastAPI backend
├── frontend/          # React frontend
├── scripts/           # Utility scripts
├── docs/              # Documentation
├── .cursorrules       # Project context
└── docker-compose.yml # Docker config
```

Happy coding! 🚀
