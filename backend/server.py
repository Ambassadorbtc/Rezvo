from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import database
from middleware.cors import setup_cors
from routes import (
    auth_router,
    users_router,
    businesses_router,
    bookings_router,
    directory_router,
    tables_router,
    staff_router,
    services_router,
    reviews_router,
    analytics_router,
    reputation_router,
    growth_router,
    payments_router,
    settings_router
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect_to_mongo()
    yield
    await database.close_mongo_connection()


app = FastAPI(
    title="Rezvo API",
    description="Your High Street, Booked - Multi-vertical booking platform for UK restaurants, barbers, salons, and spas",
    version="1.0.0",
    lifespan=lifespan
)

setup_cors(app)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(businesses_router)
app.include_router(bookings_router)
app.include_router(directory_router)
app.include_router(tables_router)
app.include_router(staff_router)
app.include_router(services_router)
app.include_router(reviews_router)
app.include_router(analytics_router)
app.include_router(reputation_router)
app.include_router(growth_router)
app.include_router(payments_router)
app.include_router(settings_router)


@app.get("/")
async def root():
    return {
        "message": "Rezvo API",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
