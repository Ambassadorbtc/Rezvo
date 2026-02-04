"""
Backend API Tests for Rezvo Booking App - New Features
Tests: Legal pages, Cookie consent, Seed customers, Notifications, Error logging, Short links
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "testuser@example.com"
TEST_PASSWORD = "password123"


class TestSeedCustomers:
    """Test seed customers endpoint"""
    
    def test_seed_customers(self):
        """Test /api/seed/customers creates dummy customers"""
        response = requests.post(f"{BASE_URL}/api/seed/customers", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "total" in data
        assert data["total"] == 10
        print(f"✓ Seed customers: {data['message']}")


class TestPublicBusinesses:
    """Test public businesses endpoint"""
    
    def test_get_public_businesses(self):
        """Test /api/public/businesses returns business list"""
        response = requests.get(f"{BASE_URL}/api/public/businesses", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public businesses: {len(data)} businesses found")


class TestNotifications:
    """Test notifications endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=30
        )
        return response.json()["access_token"]
    
    def test_get_notifications(self, auth_token):
        """Test /api/notifications returns notifications list"""
        response = requests.get(
            f"{BASE_URL}/api/notifications",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert "notifications" in data
        assert "unread_count" in data
        assert isinstance(data["notifications"], list)
        print(f"✓ Notifications: {len(data['notifications'])} notifications, {data['unread_count']} unread")
    
    def test_create_notification(self, auth_token):
        """Test creating a notification"""
        notif_data = {
            "title": "TEST_Notification",
            "message": "This is a test notification",
            "type": "info"
        }
        response = requests.post(
            f"{BASE_URL}/api/notifications",
            json=notif_data,
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["created"] == True
        print(f"✓ Notification created: {data['id']}")
        return data["id"]


class TestMyBookings:
    """Test client bookings endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=30
        )
        return response.json()["access_token"]
    
    def test_get_my_bookings(self, auth_token):
        """Test /api/bookings/my returns client bookings"""
        response = requests.get(
            f"{BASE_URL}/api/bookings/my",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ My bookings: {len(data)} bookings found")


class TestShortLinks:
    """Test short links endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=30
        )
        return response.json()["access_token"]
    
    def test_create_short_link(self, auth_token):
        """Test creating a short link"""
        response = requests.post(
            f"{BASE_URL}/api/links/create",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert "short_link" in data
        assert "short_code" in data
        assert "full_link" in data
        print(f"✓ Short link created: {data['short_link']}")
        return data["short_code"]
    
    def test_resolve_short_link(self, auth_token):
        """Test resolving a short link"""
        # First create a short link
        create_response = requests.post(
            f"{BASE_URL}/api/links/create",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        short_code = create_response.json()["short_code"]
        
        # Then resolve it
        response = requests.get(
            f"{BASE_URL}/api/b/{short_code}",
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert "business_id" in data
        assert "business_name" in data
        print(f"✓ Short link resolved: {data['business_name']}")


class TestErrorLogging:
    """Test error logging endpoint"""
    
    def test_log_error(self):
        """Test /api/logs/error logs an error"""
        error_data = {
            "error_type": "TEST_ERROR",
            "message": "This is a test error",
            "stack": "Test stack trace",
            "context": {"test": True}
        }
        response = requests.post(
            f"{BASE_URL}/api/logs/error",
            params=error_data,
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert data["logged"] == True
        assert "log_id" in data
        print(f"✓ Error logged: {data['log_id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
