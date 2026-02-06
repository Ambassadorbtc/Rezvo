"""
Backend API Tests for Rezvo App - Iteration 18
Tests: Auth flows, Dashboard, Support, Core APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_USER = {"email": "testuser@example.com", "password": "password123"}
FOUNDER_USER = {"email": "founder@rezvo.app", "password": "Founder123!"}


class TestHealthCheck:
    """Health check tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health endpoint working")


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_business_owner(self):
        """Test login with business owner credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == TEST_USER["email"]
        assert data["user"]["role"] == "business"
        print(f"✓ Business owner login successful - role: {data['user']['role']}")
        return data["access_token"]
    
    def test_login_admin(self):
        """Test login with founder/admin credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=FOUNDER_USER)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == FOUNDER_USER["email"]
        assert data["user"]["role"] == "admin"
        print(f"✓ Admin login successful - role: {data['user']['role']}")
        return data["access_token"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials correctly rejected")
    
    def test_get_current_user(self):
        """Test /auth/me endpoint returns current user"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        token = login_response.json()["access_token"]
        
        # Get current user
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_USER["email"]
        print("✓ Get current user endpoint working")


class TestGoogleAuth:
    """Google OAuth signup endpoint tests"""
    
    def test_google_signup_new_user(self):
        """Test Google signup creates new user"""
        # Use unique email to avoid conflicts
        import uuid
        unique_email = f"test-google-{uuid.uuid4().hex[:8]}@gmail.com"
        
        response = requests.post(f"{BASE_URL}/api/auth/google-signup", json={
            "google_token": "test-session-id",
            "email": unique_email,
            "name": "Test Google User",
            "full_name": "Test Google User",
            "business_name": "Test Google Business",
            "auth_method": "google"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user_id" in data
        assert "business_id" in data
        print(f"✓ Google signup successful for {unique_email}")
    
    def test_google_signup_existing_user(self):
        """Test Google signup with existing email logs in user"""
        response = requests.post(f"{BASE_URL}/api/auth/google-signup", json={
            "google_token": "test-session-id",
            "email": TEST_USER["email"],
            "name": "Test User",
            "auth_method": "google"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        print("✓ Google signup with existing email returns token (login)")
    
    def test_google_signup_missing_email(self):
        """Test Google signup without email returns 400"""
        response = requests.post(f"{BASE_URL}/api/auth/google-signup", json={
            "google_token": "test-session-id",
            "auth_method": "google"
        })
        assert response.status_code == 400
        print("✓ Google signup without email correctly rejected")


class TestBusinessAPIs:
    """Business-related API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for business owner"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        return response.json()["access_token"]
    
    def test_get_business(self, auth_token):
        """Test get business endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/business",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "name" in data
        print(f"✓ Get business successful - name: {data['name']}")
    
    def test_get_business_stats(self, auth_token):
        """Test get business stats endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/business/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "today_count" in data
        assert "revenue_pence" in data
        assert "total_bookings" in data
        print(f"✓ Business stats: {data['total_bookings']} bookings, £{data['revenue_pence']/100:.2f} revenue")


class TestServicesAPIs:
    """Services API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for business owner"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        return response.json()["access_token"]
    
    def test_get_services(self, auth_token):
        """Test get services endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/services",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get services successful - {len(data)} services found")


class TestBookingsAPIs:
    """Bookings API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for business owner"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        return response.json()["access_token"]
    
    def test_get_bookings(self, auth_token):
        """Test get bookings endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/bookings",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get bookings successful - {len(data)} bookings found")


class TestSupportAPIs:
    """Support/messaging API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for business owner"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        return response.json()["access_token"]
    
    def test_get_support_conversations(self, auth_token):
        """Test get support conversations endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/support/conversations",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get support conversations successful - {len(data)} conversations found")
    
    def test_create_support_ticket(self, auth_token):
        """Test create support ticket endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/support/conversations",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "subject": "Test Ticket from Pytest",
                "message": "This is a test support message from automated testing."
            }
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert "id" in data or "conversation_id" in data
        print("✓ Create support ticket successful")


class TestNotificationsAPIs:
    """Notifications API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for business owner"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        return response.json()["access_token"]
    
    def test_get_notifications(self, auth_token):
        """Test get notifications endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/notifications",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "notifications" in data or isinstance(data, list)
        print("✓ Get notifications successful")


class TestAdminAPIs:
    """Admin-only API tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get auth token for admin"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=FOUNDER_USER)
        return response.json()["access_token"]
    
    def test_admin_get_all_users(self, admin_token):
        """Test admin get all users endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin get users successful - {len(data)} users found")
    
    def test_admin_get_all_businesses(self, admin_token):
        """Test admin get all businesses endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/businesses",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin get businesses successful - {len(data)} businesses found")
    
    def test_admin_get_support_inbox(self, admin_token):
        """Test admin get support inbox endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/support/inbox",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin support inbox successful - {len(data)} tickets found")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
