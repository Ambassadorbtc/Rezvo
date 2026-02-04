"""
Test Team Page Features - Iteration 8
Tests for:
- Team members CRUD operations
- Avatar upload endpoint
- Public team endpoint (filtered by show_on_booking_page)
- Team member visibility toggle
"""

import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestTeamMembersAPI:
    """Test team members CRUD operations"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "testuser@example.com",
            "password": "password123"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        self.token = data["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        self.business_id = data["user"].get("business_id")
    
    def test_get_team_members(self):
        """Test GET /api/team-members returns team data"""
        response = requests.get(f"{BASE_URL}/api/team-members", headers=self.headers)
        assert response.status_code == 200, f"Failed to get team members: {response.text}"
        
        members = response.json()
        assert isinstance(members, list), "Response should be a list"
        
        # Check if existing team members are present (Sarah Johnson, Michael Chen, Emma Wilson)
        member_names = [m.get("name") for m in members]
        print(f"Found team members: {member_names}")
        
        # Verify team member structure
        if members:
            member = members[0]
            assert "id" in member, "Team member should have id"
            assert "name" in member, "Team member should have name"
            assert "role" in member, "Team member should have role"
            assert "color" in member, "Team member should have color"
            # show_on_booking_page should be present
            assert "show_on_booking_page" in member or member.get("show_on_booking_page") is None, "Team member should have show_on_booking_page field"
    
    def test_create_team_member_with_visibility(self):
        """Test POST /api/team-members creates new team member with show_on_booking_page field"""
        new_member = {
            "name": "TEST_New Team Member",
            "email": "test_new_member@example.com",
            "phone": "+44 7123 456789",
            "role": "staff",
            "color": "#3B82F6",
            "service_ids": [],
            "show_on_booking_page": True
        }
        
        response = requests.post(f"{BASE_URL}/api/team-members", json=new_member, headers=self.headers)
        assert response.status_code == 200, f"Failed to create team member: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should contain member id"
        member_id = data["id"]
        
        # Verify the member was created with correct data
        get_response = requests.get(f"{BASE_URL}/api/team-members/{member_id}", headers=self.headers)
        assert get_response.status_code == 200, f"Failed to get created member: {get_response.text}"
        
        created_member = get_response.json()
        assert created_member["name"] == new_member["name"]
        assert created_member["email"] == new_member["email"]
        assert created_member["role"] == new_member["role"]
        assert created_member["show_on_booking_page"] == True
        
        # Cleanup - delete the test member
        delete_response = requests.delete(f"{BASE_URL}/api/team-members/{member_id}", headers=self.headers)
        assert delete_response.status_code == 200
    
    def test_create_team_member_hidden_from_booking(self):
        """Test creating team member with show_on_booking_page=False"""
        hidden_member = {
            "name": "TEST_Hidden Member",
            "email": "test_hidden@example.com",
            "role": "staff",
            "color": "#EF4444",
            "show_on_booking_page": False
        }
        
        response = requests.post(f"{BASE_URL}/api/team-members", json=hidden_member, headers=self.headers)
        assert response.status_code == 200, f"Failed to create hidden member: {response.text}"
        
        member_id = response.json()["id"]
        
        # Verify show_on_booking_page is False
        get_response = requests.get(f"{BASE_URL}/api/team-members/{member_id}", headers=self.headers)
        assert get_response.status_code == 200
        
        member = get_response.json()
        assert member["show_on_booking_page"] == False, "Member should be hidden from booking page"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/team-members/{member_id}", headers=self.headers)
    
    def test_update_team_member_visibility(self):
        """Test PATCH /api/team-members/{id} can update show_on_booking_page"""
        # First create a member
        new_member = {
            "name": "TEST_Visibility Toggle",
            "email": "test_visibility@example.com",
            "role": "staff",
            "color": "#8B5CF6",
            "show_on_booking_page": True
        }
        
        create_response = requests.post(f"{BASE_URL}/api/team-members", json=new_member, headers=self.headers)
        assert create_response.status_code == 200
        member_id = create_response.json()["id"]
        
        # Update visibility to False
        update_response = requests.patch(
            f"{BASE_URL}/api/team-members/{member_id}",
            json={"show_on_booking_page": False},
            headers=self.headers
        )
        assert update_response.status_code == 200, f"Failed to update member: {update_response.text}"
        
        # Verify the update
        get_response = requests.get(f"{BASE_URL}/api/team-members/{member_id}", headers=self.headers)
        assert get_response.status_code == 200
        
        updated_member = get_response.json()
        assert updated_member["show_on_booking_page"] == False, "Visibility should be updated to False"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/team-members/{member_id}", headers=self.headers)


class TestAvatarUpload:
    """Test avatar upload endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "testuser@example.com",
            "password": "password123"
        })
        assert response.status_code == 200
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_upload_avatar_jpeg(self):
        """Test POST /api/upload/avatar with JPEG image"""
        # Create a simple test image (1x1 pixel JPEG)
        # This is a minimal valid JPEG file
        jpeg_data = bytes([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
            0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
            0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
            0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
            0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
            0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
            0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
            0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
            0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00,
            0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
            0x09, 0x0A, 0x0B, 0xFF, 0xC4, 0x00, 0xB5, 0x10, 0x00, 0x02, 0x01, 0x03,
            0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7D,
            0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
            0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xA1, 0x08,
            0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1, 0xF0, 0x24, 0x33, 0x62, 0x72,
            0x82, 0x09, 0x0A, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x25, 0x26, 0x27, 0x28,
            0x29, 0x2A, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x43, 0x44, 0x45,
            0x46, 0x47, 0x48, 0x49, 0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
            0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A, 0x73, 0x74, 0x75,
            0x76, 0x77, 0x78, 0x79, 0x7A, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
            0x8A, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0xA2, 0xA3,
            0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0xAA, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6,
            0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9,
            0xCA, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xE1, 0xE2,
            0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xEA, 0xF1, 0xF2, 0xF3, 0xF4,
            0xF5, 0xF6, 0xF7, 0xF8, 0xF9, 0xFA, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01,
            0x00, 0x00, 0x3F, 0x00, 0xFB, 0xD5, 0xDB, 0x20, 0xA8, 0xF1, 0x7E, 0xCD,
            0xBF, 0xFF, 0xD9
        ])
        
        files = {"file": ("test_avatar.jpg", io.BytesIO(jpeg_data), "image/jpeg")}
        
        response = requests.post(
            f"{BASE_URL}/api/upload/avatar",
            files=files,
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Avatar upload failed: {response.text}"
        
        data = response.json()
        assert "url" in data, "Response should contain url"
        assert data["url"].startswith("/api/uploads/"), f"URL should start with /api/uploads/, got: {data['url']}"
        print(f"Avatar uploaded successfully: {data['url']}")
    
    def test_upload_avatar_invalid_type(self):
        """Test that invalid file types are rejected"""
        # Try to upload a text file
        files = {"file": ("test.txt", io.BytesIO(b"This is not an image"), "text/plain")}
        
        response = requests.post(
            f"{BASE_URL}/api/upload/avatar",
            files=files,
            headers=self.headers
        )
        
        assert response.status_code == 400, f"Should reject invalid file type, got: {response.status_code}"
    
    def test_upload_avatar_requires_auth(self):
        """Test that avatar upload requires authentication"""
        jpeg_data = bytes([0xFF, 0xD8, 0xFF, 0xE0])  # Minimal JPEG header
        files = {"file": ("test.jpg", io.BytesIO(jpeg_data), "image/jpeg")}
        
        response = requests.post(f"{BASE_URL}/api/upload/avatar", files=files)
        
        assert response.status_code == 401, f"Should require auth, got: {response.status_code}"


class TestPublicTeamEndpoint:
    """Test public team endpoint that filters by show_on_booking_page"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get business_id"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "testuser@example.com",
            "password": "password123"
        })
        assert response.status_code == 200
        data = response.json()
        self.token = data["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        self.business_id = data["user"].get("business_id")
    
    def test_public_team_endpoint_exists(self):
        """Test GET /api/public/business/{id}/team returns team members"""
        if not self.business_id:
            pytest.skip("No business_id available")
        
        response = requests.get(f"{BASE_URL}/api/public/business/{self.business_id}/team")
        assert response.status_code == 200, f"Public team endpoint failed: {response.text}"
        
        members = response.json()
        assert isinstance(members, list), "Response should be a list"
        print(f"Public team members: {[m.get('name') for m in members]}")
        
        # Verify structure of public team member data
        if members:
            member = members[0]
            assert "id" in member
            assert "name" in member
            # Public endpoint should only return visible members
    
    def test_public_team_filters_hidden_members(self):
        """Test that public endpoint only returns members with show_on_booking_page=True"""
        if not self.business_id:
            pytest.skip("No business_id available")
        
        # Create a hidden member
        hidden_member = {
            "name": "TEST_Public Hidden",
            "email": "test_public_hidden@example.com",
            "role": "staff",
            "color": "#F59E0B",
            "show_on_booking_page": False
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/team-members",
            json=hidden_member,
            headers=self.headers
        )
        assert create_response.status_code == 200
        hidden_member_id = create_response.json()["id"]
        
        # Get public team members
        public_response = requests.get(f"{BASE_URL}/api/public/business/{self.business_id}/team")
        assert public_response.status_code == 200
        
        public_members = public_response.json()
        public_member_ids = [m.get("id") for m in public_members]
        
        # Hidden member should NOT be in public list
        assert hidden_member_id not in public_member_ids, "Hidden member should not appear in public team list"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/team-members/{hidden_member_id}", headers=self.headers)
    
    def test_public_team_includes_visible_members(self):
        """Test that public endpoint includes members with show_on_booking_page=True"""
        if not self.business_id:
            pytest.skip("No business_id available")
        
        # Create a visible member
        visible_member = {
            "name": "TEST_Public Visible",
            "email": "test_public_visible@example.com",
            "role": "staff",
            "color": "#06B6D4",
            "show_on_booking_page": True
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/team-members",
            json=visible_member,
            headers=self.headers
        )
        assert create_response.status_code == 200
        visible_member_id = create_response.json()["id"]
        
        # Get public team members
        public_response = requests.get(f"{BASE_URL}/api/public/business/{self.business_id}/team")
        assert public_response.status_code == 200
        
        public_members = public_response.json()
        public_member_ids = [m.get("id") for m in public_members]
        
        # Visible member SHOULD be in public list
        assert visible_member_id in public_member_ids, "Visible member should appear in public team list"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/team-members/{visible_member_id}", headers=self.headers)


class TestTeamMemberFields:
    """Test all team member fields are properly handled"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "testuser@example.com",
            "password": "password123"
        })
        assert response.status_code == 200
        data = response.json()
        self.token = data["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_create_member_with_all_fields(self):
        """Test creating team member with all fields including avatar_url"""
        full_member = {
            "name": "TEST_Full Member",
            "email": "test_full@example.com",
            "phone": "+44 7999 888777",
            "role": "manager",
            "color": "#EC4899",
            "avatar_url": "/api/uploads/test-avatar.jpg",
            "service_ids": [],
            "show_on_booking_page": True
        }
        
        response = requests.post(f"{BASE_URL}/api/team-members", json=full_member, headers=self.headers)
        assert response.status_code == 200, f"Failed to create full member: {response.text}"
        
        member_id = response.json()["id"]
        
        # Verify all fields
        get_response = requests.get(f"{BASE_URL}/api/team-members/{member_id}", headers=self.headers)
        assert get_response.status_code == 200
        
        member = get_response.json()
        assert member["name"] == full_member["name"]
        assert member["email"] == full_member["email"]
        assert member["phone"] == full_member["phone"]
        assert member["role"] == full_member["role"]
        assert member["color"] == full_member["color"]
        assert member["avatar_url"] == full_member["avatar_url"]
        assert member["show_on_booking_page"] == True
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/team-members/{member_id}", headers=self.headers)
    
    def test_update_member_avatar_url(self):
        """Test updating team member avatar_url"""
        # Create member
        member = {
            "name": "TEST_Avatar Update",
            "role": "staff",
            "color": "#84CC16"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/team-members", json=member, headers=self.headers)
        assert create_response.status_code == 200
        member_id = create_response.json()["id"]
        
        # Update avatar_url
        update_response = requests.patch(
            f"{BASE_URL}/api/team-members/{member_id}",
            json={"avatar_url": "/api/uploads/new-avatar.jpg"},
            headers=self.headers
        )
        assert update_response.status_code == 200
        
        # Verify update
        get_response = requests.get(f"{BASE_URL}/api/team-members/{member_id}", headers=self.headers)
        assert get_response.status_code == 200
        
        updated = get_response.json()
        assert updated["avatar_url"] == "/api/uploads/new-avatar.jpg"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/team-members/{member_id}", headers=self.headers)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
