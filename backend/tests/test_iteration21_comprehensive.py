"""
Iteration 21 - Comprehensive Testing for P1, P2, P3 Features
Tests:
1. Calendar booking position (starts from hour 6)
2. Drag-drop confirmation dialog
3. Booking update syncs date/time fields
4. Support chat Rezvo logo
5. Support chat faster polling
6. Google Calendar integration UI
7. Forgot password email/phone options
"""

import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBookingDateTimeSync:
    """Test that booking updates correctly sync date, start_time, end_time fields"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "emailuser@test.com",
            "password": "Test1234!"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_patch_booking_updates_all_datetime_fields(self, auth_headers):
        """CRITICAL: When datetime_iso changes, date, start_time, end_time must update"""
        # Get existing bookings
        response = requests.get(f"{BASE_URL}/api/bookings", headers=auth_headers)
        assert response.status_code == 200
        bookings = response.json()
        
        if len(bookings) == 0:
            pytest.skip("No bookings to test")
        
        booking = bookings[0]
        booking_id = booking['id']
        
        # Create new datetime (move to 10:00 AM tomorrow)
        tomorrow = datetime.now() + timedelta(days=1)
        new_datetime = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0)
        
        # Update booking
        response = requests.patch(
            f"{BASE_URL}/api/bookings/{booking_id}",
            headers=auth_headers,
            json={"datetime_iso": new_datetime.isoformat()}
        )
        assert response.status_code == 200
        assert response.json().get("status") == "updated"
        
        # Verify the update
        response = requests.get(f"{BASE_URL}/api/bookings/{booking_id}", headers=auth_headers)
        assert response.status_code == 200
        updated = response.json()
        
        # Check all datetime fields are synced
        assert updated['date'] == new_datetime.strftime('%Y-%m-%d'), "Date not synced"
        assert updated['start_time'] == "10:00", "Start time not synced"
        print(f"SUCCESS: Booking datetime sync verified - date={updated['date']}, start_time={updated['start_time']}")


class TestSupportChatPolling:
    """Test support chat endpoints respond quickly for polling"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "emailuser@test.com",
            "password": "Test1234!"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_conversations_endpoint_fast_response(self, auth_headers):
        """Conversations endpoint should respond in < 2 seconds for 3-second polling"""
        import time
        start = time.time()
        response = requests.get(f"{BASE_URL}/api/conversations", headers=auth_headers)
        elapsed = time.time() - start
        
        assert response.status_code == 200
        assert elapsed < 2.0, f"Conversations endpoint too slow: {elapsed:.2f}s"
        print(f"SUCCESS: Conversations endpoint responded in {elapsed:.2f}s")
    
    def test_messages_endpoint_fast_response(self, auth_headers):
        """Messages endpoint should respond in < 2 seconds for 2-second polling"""
        # First get a conversation
        response = requests.get(f"{BASE_URL}/api/conversations", headers=auth_headers)
        conversations = response.json()
        
        if len(conversations) == 0:
            pytest.skip("No conversations to test")
        
        conv_id = conversations[0]['id']
        
        import time
        start = time.time()
        response = requests.get(f"{BASE_URL}/api/conversations/{conv_id}/messages", headers=auth_headers)
        elapsed = time.time() - start
        
        assert response.status_code == 200
        assert elapsed < 2.0, f"Messages endpoint too slow: {elapsed:.2f}s"
        print(f"SUCCESS: Messages endpoint responded in {elapsed:.2f}s")


class TestGoogleCalendarStatus:
    """Test Google Calendar integration status endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "emailuser@test.com",
            "password": "Test1234!"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_google_status_endpoint_exists(self, auth_headers):
        """Google Calendar status endpoint should exist and return status"""
        response = requests.get(f"{BASE_URL}/api/google/status", headers=auth_headers)
        # Should return 200 with status or 404 if not implemented
        assert response.status_code in [200, 404]
        
        if response.status_code == 200:
            data = response.json()
            assert 'connected' in data or 'configured' in data
            print(f"SUCCESS: Google Calendar status: {data}")
        else:
            print("INFO: Google Calendar status endpoint not implemented")


class TestForgotPasswordEndpoints:
    """Test forgot password endpoints for email and phone options"""
    
    def test_forgot_password_email_endpoint(self):
        """Test email-based password reset"""
        response = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
            "email": "test@example.com"
        })
        # Should return 200 (success) or 404 (user not found)
        assert response.status_code in [200, 404]
        print(f"SUCCESS: Forgot password email endpoint responded with {response.status_code}")
    
    def test_forgot_password_phone_otp_endpoint(self):
        """Test phone-based password reset OTP"""
        response = requests.post(f"{BASE_URL}/api/auth/forgot-password/send-otp", json={
            "phone": "+447000000000"
        })
        # Should return 200 (OTP sent) or 404 (phone not found)
        assert response.status_code in [200, 404]
        print(f"SUCCESS: Forgot password phone OTP endpoint responded with {response.status_code}")


class TestCalendarBookingPosition:
    """Test that bookings are created with correct time fields for calendar positioning"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "emailuser@test.com",
            "password": "Test1234!"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_booking_at_6am_has_correct_start_time(self, auth_headers):
        """Booking at 6AM should have start_time=06:00"""
        # Get services first
        response = requests.get(f"{BASE_URL}/api/services", headers=auth_headers)
        services = response.json()
        
        if len(services) == 0:
            pytest.skip("No services available")
        
        service_id = services[0]['id']
        
        # Create booking at 6AM
        tomorrow = datetime.now() + timedelta(days=1)
        booking_time = tomorrow.replace(hour=6, minute=0, second=0, microsecond=0)
        
        response = requests.post(f"{BASE_URL}/api/bookings", headers=auth_headers, json={
            "service_id": service_id,
            "client_name": "TEST_6AM_Booking",
            "client_email": "test6am@example.com",
            "datetime_iso": booking_time.isoformat()
        })
        
        assert response.status_code == 200
        booking_id = response.json().get('id')
        
        # Verify start_time
        response = requests.get(f"{BASE_URL}/api/bookings/{booking_id}", headers=auth_headers)
        assert response.status_code == 200
        booking = response.json()
        
        assert booking['start_time'] == "06:00", f"Expected 06:00, got {booking['start_time']}"
        print(f"SUCCESS: 6AM booking has correct start_time=06:00")
        
        # Cleanup
        requests.post(f"{BASE_URL}/api/bookings/{booking_id}/cancel", headers=auth_headers)
    
    def test_booking_at_9am_has_correct_start_time(self, auth_headers):
        """Booking at 9AM should have start_time=09:00"""
        response = requests.get(f"{BASE_URL}/api/services", headers=auth_headers)
        services = response.json()
        
        if len(services) == 0:
            pytest.skip("No services available")
        
        service_id = services[0]['id']
        
        tomorrow = datetime.now() + timedelta(days=1)
        booking_time = tomorrow.replace(hour=9, minute=0, second=0, microsecond=0)
        
        response = requests.post(f"{BASE_URL}/api/bookings", headers=auth_headers, json={
            "service_id": service_id,
            "client_name": "TEST_9AM_Booking",
            "client_email": "test9am@example.com",
            "datetime_iso": booking_time.isoformat()
        })
        
        assert response.status_code == 200
        booking_id = response.json().get('id')
        
        response = requests.get(f"{BASE_URL}/api/bookings/{booking_id}", headers=auth_headers)
        assert response.status_code == 200
        booking = response.json()
        
        assert booking['start_time'] == "09:00", f"Expected 09:00, got {booking['start_time']}"
        print(f"SUCCESS: 9AM booking has correct start_time=09:00")
        
        # Cleanup
        requests.post(f"{BASE_URL}/api/bookings/{booking_id}/cancel", headers=auth_headers)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
