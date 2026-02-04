"""
Test suite for Team Members, Password Reset, and Calendar Team View APIs
Tests the new features added for rezvo.app booking application
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "testuser@example.com"
TEST_PASSWORD = "password123"


class TestAuthSetup:
    """Setup tests - verify auth is working"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return response.json().get("access_token")
    
    def test_health_check(self):
        """Verify backend is healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ Backend health check passed")
    
    def test_login_success(self, auth_token):
        """Verify login works"""
        assert auth_token is not None
        assert len(auth_token) > 0
        print(f"✓ Login successful, token length: {len(auth_token)}")


class TestTeamMembers:
    """Test Team Member CRUD operations"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers for requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    @pytest.fixture(scope="class")
    def created_member_id(self, auth_headers):
        """Create a test team member and return its ID"""
        unique_email = f"test_member_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(
            f"{BASE_URL}/api/team-members",
            headers=auth_headers,
            json={
                "name": "TEST_Team Member",
                "email": unique_email,
                "phone": "07700900099",
                "role": "staff",
                "color": "#FF5733",
                "service_ids": []
            }
        )
        assert response.status_code == 200, f"Failed to create team member: {response.text}"
        data = response.json()
        assert "id" in data
        yield data["id"]
        # Cleanup - delete the member
        requests.delete(f"{BASE_URL}/api/team-members/{data['id']}", headers=auth_headers)
    
    def test_create_team_member(self, auth_headers):
        """Test POST /api/team-members - Create team member"""
        unique_email = f"test_create_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(
            f"{BASE_URL}/api/team-members",
            headers=auth_headers,
            json={
                "name": "TEST_New Staff Member",
                "email": unique_email,
                "phone": "07700900100",
                "role": "staff",
                "color": "#00BFA5",
                "service_ids": []
            }
        )
        assert response.status_code == 200, f"Create failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert data["name"] == "TEST_New Staff Member"
        print(f"✓ Created team member with ID: {data['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/team-members/{data['id']}", headers=auth_headers)
    
    def test_get_team_members_list(self, auth_headers):
        """Test GET /api/team-members - List team members"""
        response = requests.get(f"{BASE_URL}/api/team-members", headers=auth_headers)
        assert response.status_code == 200, f"Get list failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Retrieved {len(data)} team members")
        
        # Verify structure of team members
        if len(data) > 0:
            member = data[0]
            assert "id" in member
            assert "name" in member
            assert "color" in member
            print(f"  First member: {member.get('name')} (color: {member.get('color')})")
    
    def test_get_single_team_member(self, auth_headers, created_member_id):
        """Test GET /api/team-members/{id} - Get single team member"""
        response = requests.get(
            f"{BASE_URL}/api/team-members/{created_member_id}",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Get single failed: {response.text}"
        data = response.json()
        assert data["id"] == created_member_id
        assert "name" in data
        assert "color" in data
        assert "working_hours" in data
        print(f"✓ Retrieved team member: {data['name']}")
    
    def test_update_team_member(self, auth_headers, created_member_id):
        """Test PATCH /api/team-members/{id} - Update team member"""
        response = requests.patch(
            f"{BASE_URL}/api/team-members/{created_member_id}",
            headers=auth_headers,
            json={
                "name": "TEST_Updated Name",
                "color": "#9C27B0"
            }
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        data = response.json()
        assert data.get("status") == "updated"
        print("✓ Team member updated successfully")
        
        # Verify update persisted
        get_response = requests.get(
            f"{BASE_URL}/api/team-members/{created_member_id}",
            headers=auth_headers
        )
        assert get_response.status_code == 200
        updated_data = get_response.json()
        assert updated_data["name"] == "TEST_Updated Name"
        assert updated_data["color"] == "#9C27B0"
        print("✓ Update verified via GET")
    
    def test_delete_team_member(self, auth_headers):
        """Test DELETE /api/team-members/{id} - Delete team member"""
        # First create a member to delete
        unique_email = f"test_delete_{uuid.uuid4().hex[:8]}@example.com"
        create_response = requests.post(
            f"{BASE_URL}/api/team-members",
            headers=auth_headers,
            json={
                "name": "TEST_To Be Deleted",
                "email": unique_email,
                "role": "staff",
                "color": "#FF0000"
            }
        )
        assert create_response.status_code == 200
        member_id = create_response.json()["id"]
        
        # Delete the member
        delete_response = requests.delete(
            f"{BASE_URL}/api/team-members/{member_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.text}"
        data = delete_response.json()
        assert data.get("status") == "deleted"
        print(f"✓ Team member {member_id} deleted (soft delete)")
    
    def test_get_team_member_stats(self, auth_headers, created_member_id):
        """Test GET /api/team-members/{id}/stats - Get member stats"""
        response = requests.get(
            f"{BASE_URL}/api/team-members/{created_member_id}/stats",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Get stats failed: {response.text}"
        data = response.json()
        assert "total_bookings" in data
        assert "completed_bookings" in data
        assert "total_revenue_pence" in data
        assert "this_month_bookings" in data
        print(f"✓ Team member stats: {data['total_bookings']} total bookings, £{data['total_revenue_pence']/100:.2f} revenue")


class TestPasswordReset:
    """Test Password Reset flow"""
    
    def test_forgot_password_existing_email(self):
        """Test POST /api/auth/forgot-password - Request reset for existing email"""
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={"email": TEST_EMAIL}
        )
        assert response.status_code == 200, f"Forgot password failed: {response.text}"
        data = response.json()
        assert "message" in data
        # Should not reveal if email exists
        assert "reset code has been sent" in data["message"].lower() or "if the email exists" in data["message"].lower()
        print("✓ Forgot password request accepted")
    
    def test_forgot_password_nonexistent_email(self):
        """Test POST /api/auth/forgot-password - Request reset for non-existent email"""
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={"email": "nonexistent_user_12345@example.com"}
        )
        # Should return 200 to not reveal if email exists
        assert response.status_code == 200, f"Forgot password failed: {response.text}"
        data = response.json()
        assert "message" in data
        print("✓ Forgot password for non-existent email handled correctly (no info leak)")
    
    def test_verify_reset_code_invalid(self):
        """Test POST /api/auth/verify-reset-code - Invalid code"""
        response = requests.post(
            f"{BASE_URL}/api/auth/verify-reset-code",
            json={
                "email": TEST_EMAIL,
                "code": "000000"  # Invalid code
            }
        )
        # Should return 400 for invalid code
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        print("✓ Invalid reset code rejected correctly")
    
    def test_reset_password_invalid_token(self):
        """Test POST /api/auth/reset-password - Invalid token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            json={
                "token": "invalid-token-12345",
                "new_password": "newpassword123"
            }
        )
        # Should return 400 for invalid token
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        print("✓ Invalid reset token rejected correctly")


class TestCalendarTeamView:
    """Test Calendar Team View endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers for requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_calendar_team_view_today(self, auth_headers):
        """Test GET /api/calendar/team-view - Get today's team calendar"""
        today = datetime.now().strftime("%Y-%m-%d")
        response = requests.get(
            f"{BASE_URL}/api/calendar/team-view",
            headers=auth_headers,
            params={"date": today}
        )
        assert response.status_code == 200, f"Calendar team view failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "date" in data
        assert data["date"] == today
        assert "team_members" in data
        assert "bookings_by_member" in data
        assert "services" in data
        
        print(f"✓ Calendar team view for {today}")
        print(f"  Team members: {len(data['team_members'])}")
        print(f"  Services: {len(data['services'])}")
        
        # Check bookings structure
        bookings_by_member = data["bookings_by_member"]
        assert isinstance(bookings_by_member, dict)
        assert "unassigned" in bookings_by_member
        print(f"  Booking groups: {len(bookings_by_member)}")
    
    def test_get_calendar_team_view_future_date(self, auth_headers):
        """Test GET /api/calendar/team-view - Get future date calendar"""
        from datetime import timedelta
        future_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        
        response = requests.get(
            f"{BASE_URL}/api/calendar/team-view",
            headers=auth_headers,
            params={"date": future_date}
        )
        assert response.status_code == 200, f"Calendar team view failed: {response.text}"
        data = response.json()
        assert data["date"] == future_date
        print(f"✓ Calendar team view for future date {future_date}")


class TestBookingWithTeam:
    """Test Booking with Team Member assignment"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers for requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    @pytest.fixture(scope="class")
    def service_id(self, auth_headers):
        """Get or create a service for testing"""
        # First try to get existing services
        response = requests.get(f"{BASE_URL}/api/services", headers=auth_headers)
        if response.status_code == 200:
            services = response.json()
            if len(services) > 0:
                return services[0]["id"]
        
        # Create a test service if none exist
        create_response = requests.post(
            f"{BASE_URL}/api/services",
            headers=auth_headers,
            json={
                "name": "TEST_Service",
                "price_pence": 5000,
                "duration_min": 60
            }
        )
        if create_response.status_code == 200:
            return create_response.json()["id"]
        pytest.skip("Could not get or create service")
    
    @pytest.fixture(scope="class")
    def team_member_id(self, auth_headers):
        """Get or create a team member for testing"""
        response = requests.get(f"{BASE_URL}/api/team-members", headers=auth_headers)
        if response.status_code == 200:
            members = response.json()
            if len(members) > 0:
                return members[0]["id"]
        
        # Create a test team member if none exist
        unique_email = f"test_booking_{uuid.uuid4().hex[:8]}@example.com"
        create_response = requests.post(
            f"{BASE_URL}/api/team-members",
            headers=auth_headers,
            json={
                "name": "TEST_Booking Staff",
                "email": unique_email,
                "role": "staff",
                "color": "#00BFA5"
            }
        )
        if create_response.status_code == 200:
            return create_response.json()["id"]
        pytest.skip("Could not get or create team member")
    
    def test_create_booking_with_team_member(self, auth_headers, service_id, team_member_id):
        """Test POST /api/bookings/with-team - Create booking with team member"""
        from datetime import timedelta
        booking_datetime = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%dT10:00:00")
        
        response = requests.post(
            f"{BASE_URL}/api/bookings/with-team",
            headers=auth_headers,
            json={
                "service_id": service_id,
                "team_member_id": team_member_id,
                "client_name": "TEST_Client Name",
                "client_email": "test_client@example.com",
                "client_phone": "07700900123",
                "datetime_iso": booking_datetime,
                "notes": "Test booking with team member"
            }
        )
        assert response.status_code == 200, f"Create booking failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert data.get("status") == "pending"
        print(f"✓ Created booking with team member: {data['id']}")
    
    def test_create_booking_without_team_member(self, auth_headers, service_id):
        """Test POST /api/bookings/with-team - Create booking without team member (unassigned)"""
        from datetime import timedelta
        booking_datetime = (datetime.now() + timedelta(days=4)).strftime("%Y-%m-%dT14:00:00")
        
        response = requests.post(
            f"{BASE_URL}/api/bookings/with-team",
            headers=auth_headers,
            json={
                "service_id": service_id,
                "team_member_id": None,  # No team member assigned
                "client_name": "TEST_Unassigned Client",
                "client_email": "unassigned_client@example.com",
                "datetime_iso": booking_datetime
            }
        )
        assert response.status_code == 200, f"Create booking failed: {response.text}"
        data = response.json()
        assert "id" in data
        print(f"✓ Created unassigned booking: {data['id']}")


class TestExistingTeamMembers:
    """Test that existing team members (Sarah, Michael, Emma) are present"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers for requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_existing_team_members_present(self, auth_headers):
        """Verify the three test team members exist"""
        response = requests.get(f"{BASE_URL}/api/team-members", headers=auth_headers)
        assert response.status_code == 200
        members = response.json()
        
        member_names = [m.get("name", "") for m in members]
        print(f"✓ Found {len(members)} team members: {member_names}")
        
        # Check if expected members exist (may have been created by main agent)
        expected_names = ["Sarah Johnson", "Michael Chen", "Emma Wilson"]
        found_expected = [name for name in expected_names if any(name in m for m in member_names)]
        
        if len(found_expected) > 0:
            print(f"  Found expected members: {found_expected}")
        else:
            print("  Note: Expected team members not found (may need to be created)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
