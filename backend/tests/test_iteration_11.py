"""
Iteration 11 - Comprehensive Backend Tests
Tests: Global search, Calendar views, Team page, Public booking, Dashboard stats, Onboarding
"""

import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "testuser@example.com"
TEST_PASSWORD = "password123"
BUSINESS_ID = "3edbbbc1-730a-494e-9626-1a0a5e6309ef"


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        print(f"✓ Login successful for {TEST_EMAIL}")
        return data["access_token"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials rejected correctly")


class TestGlobalSearch:
    """Test global search functionality"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_search_requires_auth(self):
        """Search endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/search?q=test")
        assert response.status_code == 401
        print("✓ Search requires authentication")
    
    def test_search_returns_results(self, auth_token):
        """Search returns bookings, services, and customers"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/search?q=hair", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "bookings" in data
        assert "services" in data
        assert "customers" in data
        print(f"✓ Search returned: {len(data['bookings'])} bookings, {len(data['services'])} services, {len(data['customers'])} customers")
    
    def test_search_short_query(self, auth_token):
        """Search with short query returns empty results"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/search?q=a", headers=headers)
        assert response.status_code == 200
        data = response.json()
        # Short queries should return empty
        assert data["bookings"] == []
        assert data["services"] == []
        assert data["customers"] == []
        print("✓ Short query returns empty results")


class TestTeamMembers:
    """Test team member endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_team_members(self, auth_token):
        """Get all team members"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/team-members", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Retrieved {len(data)} team members")
        
        # Verify team member structure
        if len(data) > 0:
            member = data[0]
            assert "id" in member
            assert "name" in member
            assert "color" in member
            print(f"✓ Team member structure valid: {member.get('name')}")
    
    def test_create_team_member(self, auth_token):
        """Create a new team member"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        new_member = {
            "name": "TEST_New Member",
            "email": "test_new@example.com",
            "role": "staff",
            "color": "#FF5733",
            "show_on_booking_page": True
        }
        response = requests.post(f"{BASE_URL}/api/team-members", json=new_member, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        print(f"✓ Created team member: {data.get('id')}")
        return data["id"]
    
    def test_update_team_member(self, auth_token):
        """Update a team member"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First create a member
        new_member = {
            "name": "TEST_Update Member",
            "role": "staff",
            "color": "#00FF00"
        }
        create_response = requests.post(f"{BASE_URL}/api/team-members", json=new_member, headers=headers)
        member_id = create_response.json()["id"]
        
        # Update the member
        update_data = {"name": "TEST_Updated Name", "role": "manager"}
        response = requests.patch(f"{BASE_URL}/api/team-members/{member_id}", json=update_data, headers=headers)
        assert response.status_code == 200
        print(f"✓ Updated team member: {member_id}")
        
        # Verify update
        get_response = requests.get(f"{BASE_URL}/api/team-members", headers=headers)
        members = get_response.json()
        updated_member = next((m for m in members if m["id"] == member_id), None)
        assert updated_member is not None
        assert updated_member["name"] == "TEST_Updated Name"
        print("✓ Update verified")
    
    def test_delete_team_member(self, auth_token):
        """Delete a team member"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First create a member
        new_member = {
            "name": "TEST_Delete Member",
            "role": "staff"
        }
        create_response = requests.post(f"{BASE_URL}/api/team-members", json=new_member, headers=headers)
        member_id = create_response.json()["id"]
        
        # Delete the member
        response = requests.delete(f"{BASE_URL}/api/team-members/{member_id}", headers=headers)
        assert response.status_code == 200
        print(f"✓ Deleted team member: {member_id}")


class TestPublicBooking:
    """Test public booking endpoints"""
    
    def test_get_public_business(self):
        """Get public business info"""
        response = requests.get(f"{BASE_URL}/api/public/business/{BUSINESS_ID}")
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "name" in data
        print(f"✓ Public business: {data.get('name')}")
    
    def test_get_public_services(self):
        """Get public services for business"""
        response = requests.get(f"{BASE_URL}/api/public/business/{BUSINESS_ID}/services")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public services: {len(data)} services available")
        
        if len(data) > 0:
            service = data[0]
            assert "id" in service
            assert "name" in service
            assert "price_pence" in service
            assert "duration_min" in service
            print(f"✓ Service structure valid: {service.get('name')}")
    
    def test_get_public_team(self):
        """Get public team members for booking page"""
        response = requests.get(f"{BASE_URL}/api/public/business/{BUSINESS_ID}/team")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public team: {len(data)} team members visible on booking page")
    
    def test_create_public_booking(self):
        """Create a booking through public endpoint"""
        # First get a service
        services_response = requests.get(f"{BASE_URL}/api/public/business/{BUSINESS_ID}/services")
        services = services_response.json()
        
        if len(services) == 0:
            pytest.skip("No services available for booking")
        
        service_id = services[0]["id"]
        
        # Create booking
        tomorrow = (datetime.now() + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
        booking_data = {
            "service_id": service_id,
            "client_name": "TEST_Public Booking",
            "client_email": "test_public@example.com",
            "client_phone": "+44 7123 456789",
            "datetime_iso": tomorrow.isoformat(),
            "notes": "Test booking from iteration 11"
        }
        
        response = requests.post(f"{BASE_URL}/api/public/bookings", json=booking_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["status"] == "pending"
        print(f"✓ Created public booking: {data.get('id')}")


class TestDashboardStats:
    """Test dashboard statistics endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_business_stats(self, auth_token):
        """Get business dashboard stats"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/business/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify stats structure
        assert "today_count" in data
        assert "pending_count" in data
        assert "revenue_pence" in data
        assert "total_bookings" in data
        assert "total_customers" in data
        
        print(f"✓ Dashboard stats: {data['total_bookings']} total bookings, {data['total_customers']} customers")
        print(f"  Today: {data['today_count']}, Pending: {data['pending_count']}, Revenue: £{data['revenue_pence']/100:.2f}")
    
    def test_get_analytics_dashboard(self, auth_token):
        """Get analytics dashboard data"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/analytics/dashboard", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "total_bookings" in data
        assert "revenue_pence" in data
        assert "today_bookings" in data
        print(f"✓ Analytics: {data['total_bookings']} bookings, £{data['revenue_pence']/100:.2f} revenue")


class TestOnboarding:
    """Test onboarding endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_onboarding_status(self, auth_token):
        """Get onboarding status"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/onboarding/status", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify onboarding status structure
        assert "completed" in data
        assert "has_business" in data
        assert "has_services" in data
        assert "has_availability" in data
        
        print(f"✓ Onboarding status: completed={data['completed']}, has_business={data['has_business']}, has_services={data['has_services']}")
    
    def test_complete_onboarding(self, auth_token):
        """Complete onboarding"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/onboarding/complete", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"
        print("✓ Onboarding completed successfully")


class TestBookings:
    """Test booking endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_bookings(self, auth_token):
        """Get all bookings"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/bookings", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Retrieved {len(data)} bookings")
    
    def test_get_bookings_by_date(self, auth_token):
        """Get bookings for specific date"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        today = datetime.now().strftime("%Y-%m-%d")
        response = requests.get(f"{BASE_URL}/api/bookings?date={today}", headers=headers)
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Retrieved {len(data)} bookings for {today}")


class TestServices:
    """Test services endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_services(self, auth_token):
        """Get all services"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/services", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Retrieved {len(data)} services")
        
        if len(data) > 0:
            service = data[0]
            assert "id" in service
            assert "name" in service
            assert "price_pence" in service
            assert "duration_min" in service


class TestCleanup:
    """Cleanup test data"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_cleanup_test_data(self, auth_token):
        """Clean up TEST_ prefixed team members"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Get all team members
        response = requests.get(f"{BASE_URL}/api/team-members", headers=headers)
        members = response.json()
        
        # Delete TEST_ prefixed members
        deleted = 0
        for member in members:
            if member.get("name", "").startswith("TEST_"):
                requests.delete(f"{BASE_URL}/api/team-members/{member['id']}", headers=headers)
                deleted += 1
        
        print(f"✓ Cleaned up {deleted} test team members")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
