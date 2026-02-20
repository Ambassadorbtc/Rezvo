from .auth import router as auth_router
from .users import router as users_router
from .businesses import router as businesses_router
from .bookings import router as bookings_router
from .directory import router as directory_router
from .tables import router as tables_router
from .staff import router as staff_router
from .services import router as services_router
from .reviews import router as reviews_router
from .analytics import router as analytics_router
from .reputation import router as reputation_router
from .growth import router as growth_router
from .payments import router as payments_router
from .settings import router as settings_router

__all__ = [
    "auth_router",
    "users_router",
    "businesses_router",
    "bookings_router",
    "directory_router",
    "tables_router",
    "staff_router",
    "services_router",
    "reviews_router",
    "analytics_router",
    "reputation_router",
    "growth_router",
    "payments_router",
    "settings_router"
]
