"""
Backend API Tests for Rezvo Booking App
Tests: Authentication, Business, Services, Bookings, Analytics
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "testuser@example.com"
TEST_PASSWORD = "password123"


class TestHealthEndpoints:
    """Health check endpoints"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health endpoint working")
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = requests.get(f"{BASE_URL}/api/", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data or "status" in data
        print("✓ Root endpoint working")


class TestAuthentication:
    """Authentication flow tests"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        assert "id" in data["user"]
        assert "role" in data["user"]
        print(f"✓ Login successful for {TEST_EMAIL}")
        return data["access_token"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@example.com", "password": "wrongpass"},
            timeout=10
        )
        assert response.status_code == 401
        print("✓ Invalid credentials rejected correctly")
    
    def test_get_current_user(self):
        """Test /auth/me endpoint with valid token"""
        # First login to get token
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=30
        )
        token = login_response.json()["access_token"]
        
        # Get current user
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_EMAIL
        print("✓ Get current user working")
    
    def test_signup_duplicate_email(self):
        """Test signup with existing email fails"""
        response = requests.post(
            f"{BASE_URL}/api/auth/signup",
            json={
                "email": TEST_EMAIL,
                "password": "newpassword123",
                "business_name": "Test Business"
            },
            timeout=10
        )
        assert response.status_code == 400
        print("✓ Duplicate email signup rejected")


class TestBusinessEndpoints:
    """Business CRUD tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=30
        )
        return response.json()["access_token"]
    
    def test_get_business(self, auth_token):
        """Test getting business info"""
        response = requests.get(
            f"{BASE_URL}/api/business",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        # May return 200 with data or 404 if no business
        assert response.status_code in [200, 404]
        if response.status_code == 200:
            data = response.json()
            assert "id" in data
            print(f"✓ Business retrieved: {data.get('name', 'N/A')}")
        else:
            print("✓ No business found (expected for new user)")


class TestServicesEndpoints:
    """Services CRUD tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=30
        )
        return response.json()["access_token"]
    
    def test_get_services(self, auth_token):
        """Test getting services list"""
        response = requests.get(
            f"{BASE_URL}/api/services",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Services retrieved: {len(data)} services")
    
    def test_create_and_delete_service(self, auth_token):
        """Test creating and deleting a service"""
        # Create service
        service_data = {
            "name": f"TEST_Service_{uuid.uuid4().hex[:8]}",
            "description": "Test service description",
            "duration_minutes": 60,
            "price_pence": 5000,
            "deposit_pence": 1000
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/services",
            json=service_data,
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        assert create_response.status_code in [200, 201]
        created = create_response.json()
        assert created["name"] == service_data["name"]
        assert "id" in created
        print(f"✓ Service created: {created['name']}")
        
        # Delete service
        delete_response = requests.delete(
            f"{BASE_URL}/api/services/{created['id']}",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        assert delete_response.status_code in [200, 204]
        print(f"✓ Service deleted: {created['id']}")


class TestBookingsEndpoints:
    """Bookings CRUD tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=30
        )
        return response.json()["access_token"]
    
    def test_get_bookings(self, auth_token):
        """Test getting bookings list"""
        response = requests.get(
            f"{BASE_URL}/api/bookings",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Bookings retrieved: {len(data)} bookings")


class TestAnalyticsEndpoints:
    """Analytics endpoints tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=30
        )
        return response.json()["access_token"]
    
    def test_dashboard_analytics(self, auth_token):
        """Test dashboard analytics endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/dashboard",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert "today_bookings" in data or "total_bookings" in data
        print("✓ Dashboard analytics working")


class TestShareLinkEndpoints:
    """Share link endpoints tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=30
        )
        return response.json()["access_token"]
    
    def test_get_share_link(self, auth_token):
        """Test getting shareable booking link"""
        response = requests.get(
            f"{BASE_URL}/api/share-link",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert "link" in data or "url" in data or "business_id" in data
        print("✓ Share link endpoint working")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
