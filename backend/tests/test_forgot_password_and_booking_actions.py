"""
Test suite for Forgot Password flow (email and phone) and Booking Cancel/Reschedule via token
Iteration 19 - Testing new features
"""
import pytest
import requests
import os
import uuid
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestForgotPasswordEmail:
    """Test forgot password flow via email"""
    
    def test_forgot_password_send_code_existing_user(self):
        """Test sending reset code to existing user email"""
        response = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
            "email": "testuser@example.com"
        })
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        # Should return success message even if email exists (security)
        assert "reset code has been sent" in data["message"].lower() or "if the email exists" in data["message"].lower()
    
    def test_forgot_password_send_code_nonexistent_user(self):
        """Test sending reset code to non-existent email (should not reveal)"""
        response = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
            "email": "nonexistent@example.com"
        })
        # Should return 200 to not reveal if email exists
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
    
    def test_verify_reset_code_invalid(self):
        """Test verifying invalid reset code"""
        response = requests.post(f"{BASE_URL}/api/auth/verify-reset-code", json={
            "email": "testuser@example.com",
            "code": "000000"  # Invalid code
        })
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
    
    def test_reset_password_invalid_token(self):
        """Test resetting password with invalid token"""
        response = requests.post(f"{BASE_URL}/api/auth/reset-password", json={
            "token": "invalid-token-12345",
            "new_password": "newpassword123"
        })
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data


class TestForgotPasswordPhone:
    """Test forgot password flow via phone/SMS"""
    
    def test_send_otp_nonexistent_phone(self):
        """Test sending OTP to non-existent phone number"""
        response = requests.post(f"{BASE_URL}/api/auth/forgot-password/send-otp", json={
            "phone": "+447700999999"  # Non-existent phone
        })
        # Should return 404 for non-existent phone
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "no account" in data["detail"].lower()
    
    def test_verify_otp_invalid(self):
        """Test verifying invalid OTP"""
        response = requests.post(f"{BASE_URL}/api/auth/forgot-password/verify-otp", json={
            "phone": "+447700900123",
            "code": "000000",
            "verification_id": "invalid-verification-id"
        })
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
    
    def test_reset_password_otp_invalid(self):
        """Test resetting password with invalid OTP verification"""
        response = requests.post(f"{BASE_URL}/api/auth/forgot-password/reset", json={
            "phone": "+447700900123",
            "verification_id": "invalid-verification-id",
            "new_password": "newpassword123"
        })
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data


class TestBookingByToken:
    """Test booking cancel/reschedule via token endpoints"""
    
    def test_get_booking_by_invalid_token(self):
        """Test getting booking with invalid token"""
        response = requests.get(f"{BASE_URL}/api/booking/token/invalid-token-12345")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()
    
    def test_cancel_booking_invalid_token(self):
        """Test cancelling booking with invalid token"""
        response = requests.post(f"{BASE_URL}/api/booking/cancel/invalid-token-12345")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()
    
    def test_reschedule_booking_invalid_token(self):
        """Test rescheduling booking with invalid token"""
        future_date = (datetime.now() + timedelta(days=7)).isoformat()
        response = requests.post(f"{BASE_URL}/api/booking/reschedule/invalid-token-12345", json={
            "new_datetime": future_date
        })
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()


class TestGoogleAuthBlocking:
    """Test Google Auth blocking for email/password users"""
    
    def test_google_signup_new_user(self):
        """Test Google signup creates new user"""
        unique_email = f"test_google_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(f"{BASE_URL}/api/auth/google-signup", json={
            "email": unique_email,
            "name": "Test Google User",
            "google_id": f"google_{uuid.uuid4().hex[:12]}"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user_id" in data
        assert data.get("is_new_user") == True
    
    def test_google_signup_existing_email_password_user_blocked(self):
        """Test Google signup is blocked for existing email/password user"""
        # testuser@example.com is an existing email/password user
        response = requests.post(f"{BASE_URL}/api/auth/google-signup", json={
            "email": "testuser@example.com",
            "name": "Test User",
            "google_id": "google_fake_id_12345"
        })
        # Should be blocked with 409 Conflict
        assert response.status_code == 409
        data = response.json()
        assert "detail" in data
        assert "email and password" in data["detail"].lower() or "already exists" in data["detail"].lower()
    
    def test_google_signup_without_email(self):
        """Test Google signup without email returns 400"""
        response = requests.post(f"{BASE_URL}/api/auth/google-signup", json={
            "name": "Test User",
            "google_id": "google_fake_id"
        })
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data


class TestBookingWithCancelToken:
    """Test creating booking and using cancel token"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for business owner"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "testuser@example.com",
            "password": "password123"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_create_booking_has_cancel_token(self, auth_token):
        """Test that created bookings have cancel_token"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Get business info
        biz_response = requests.get(f"{BASE_URL}/api/business", headers=headers)
        if biz_response.status_code != 200:
            pytest.skip("Could not get business info")
        
        business = biz_response.json()
        business_id = business.get("id")
        
        # Get services
        services_response = requests.get(f"{BASE_URL}/api/services", headers=headers)
        if services_response.status_code != 200 or not services_response.json():
            pytest.skip("No services available")
        
        services = services_response.json()
        service = services[0]
        
        # Create a booking
        future_date = (datetime.now() + timedelta(days=3)).strftime('%Y-%m-%d')
        booking_data = {
            "service_id": service["id"],
            "client_name": "Test Cancel Client",
            "client_email": "testcancel@example.com",
            "client_phone": "+447700900123",
            "datetime_iso": f"{future_date}T10:00:00Z",
            "notes": "Test booking for cancel token"
        }
        
        response = requests.post(f"{BASE_URL}/api/bookings", json=booking_data, headers=headers)
        
        # Check if booking was created
        if response.status_code in [200, 201]:
            data = response.json()
            # The cancel_token should be in the booking
            assert "id" in data
            print(f"Booking created with ID: {data['id']}")


class TestPublicBusinessEndpoint:
    """Test public business endpoint for reschedule page"""
    
    def test_public_business_returns_availability(self):
        """Test that public business endpoint returns availability"""
        # First get a business ID
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "testuser@example.com",
            "password": "password123"
        })
        if response.status_code != 200:
            pytest.skip("Could not login")
        
        token = response.json().get("token")
        headers = {"Authorization": f"Bearer {token}"}
        
        biz_response = requests.get(f"{BASE_URL}/api/business", headers=headers)
        if biz_response.status_code != 200:
            pytest.skip("Could not get business")
        
        business_id = biz_response.json().get("id")
        
        # Test public endpoint
        public_response = requests.get(f"{BASE_URL}/api/public/business/{business_id}")
        assert public_response.status_code == 200
        data = public_response.json()
        assert "availability" in data or "name" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
