"""
Backend tests for Notification Bell and File Upload features
Tests:
1. Notification endpoints (GET /notifications, PATCH /notifications/{id}/read, PATCH /notifications/read-all)
2. Notification creation on public booking (POST /api/public/bookings)
3. File upload for support (POST /api/support/upload)
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "testuser@example.com"
TEST_PASSWORD = "password123"
BUSINESS_ID = "3edbbbc1-730a-494e-9626-1a0a5e6309ef"


class TestAuth:
    """Authentication tests"""
    
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


class TestNotifications:
    """Notification API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Authentication failed")
        return response.json()["access_token"]
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_get_notifications(self, auth_headers):
        """Test GET /api/notifications returns notifications list with unread_count"""
        response = requests.get(f"{BASE_URL}/api/notifications", headers=auth_headers)
        assert response.status_code == 200, f"Failed to get notifications: {response.text}"
        
        data = response.json()
        assert "notifications" in data, "Response should contain 'notifications' key"
        assert "unread_count" in data, "Response should contain 'unread_count' key"
        assert isinstance(data["notifications"], list), "notifications should be a list"
        assert isinstance(data["unread_count"], int), "unread_count should be an integer"
        
        print(f"✓ GET /api/notifications - Found {len(data['notifications'])} notifications, {data['unread_count']} unread")
        return data
    
    def test_notification_structure(self, auth_headers):
        """Test notification object structure"""
        response = requests.get(f"{BASE_URL}/api/notifications", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        if data["notifications"]:
            notif = data["notifications"][0]
            # Check required fields
            assert "id" in notif, "Notification should have 'id'"
            assert "title" in notif, "Notification should have 'title'"
            assert "message" in notif, "Notification should have 'message'"
            assert "type" in notif, "Notification should have 'type'"
            assert "read" in notif, "Notification should have 'read'"
            assert "created_at" in notif, "Notification should have 'created_at'"
            print(f"✓ Notification structure valid: {notif['title']}")
        else:
            print("✓ No notifications to validate structure (empty list)")
    
    def test_mark_all_notifications_read(self, auth_headers):
        """Test PATCH /api/notifications/read-all marks all as read"""
        response = requests.patch(f"{BASE_URL}/api/notifications/read-all", headers=auth_headers)
        assert response.status_code == 200, f"Failed to mark all as read: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Response should indicate success"
        
        # Verify unread count is now 0
        verify_response = requests.get(f"{BASE_URL}/api/notifications", headers=auth_headers)
        verify_data = verify_response.json()
        assert verify_data["unread_count"] == 0, "Unread count should be 0 after marking all read"
        
        print("✓ PATCH /api/notifications/read-all - All notifications marked as read")


class TestNotificationCreationOnBooking:
    """Test notification creation when public booking is made"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Authentication failed")
        return response.json()["access_token"]
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_get_services_for_booking(self):
        """Get available services for public booking"""
        response = requests.get(f"{BASE_URL}/api/public/business/{BUSINESS_ID}/services")
        assert response.status_code == 200, f"Failed to get services: {response.text}"
        
        services = response.json()
        assert isinstance(services, list), "Services should be a list"
        assert len(services) > 0, "Should have at least one service"
        
        print(f"✓ Found {len(services)} services for business")
        return services[0]["id"]
    
    def test_public_booking_creates_notification(self, auth_headers):
        """Test POST /api/public/bookings creates notification for business owner"""
        # First get a service
        services_response = requests.get(f"{BASE_URL}/api/public/business/{BUSINESS_ID}/services")
        if services_response.status_code != 200 or not services_response.json():
            pytest.skip("No services available for booking")
        
        service_id = services_response.json()[0]["id"]
        
        # Mark all notifications as read first
        requests.patch(f"{BASE_URL}/api/notifications/read-all", headers=auth_headers)
        
        # Get initial notification count
        initial_response = requests.get(f"{BASE_URL}/api/notifications", headers=auth_headers)
        initial_count = len(initial_response.json()["notifications"])
        
        # Create a public booking
        booking_data = {
            "service_id": service_id,
            "client_name": "TEST_NotificationTest Client",
            "client_email": "test_notif@example.com",
            "client_phone": "07123456789",
            "datetime_iso": "2026-02-10T14:00:00Z",
            "notes": "Test booking for notification verification"
        }
        
        booking_response = requests.post(f"{BASE_URL}/api/public/bookings", json=booking_data)
        assert booking_response.status_code == 200, f"Failed to create booking: {booking_response.text}"
        
        booking_result = booking_response.json()
        assert "id" in booking_result, "Booking should return an ID"
        print(f"✓ Created public booking: {booking_result['id']}")
        
        # Check notifications - should have a new one
        notif_response = requests.get(f"{BASE_URL}/api/notifications", headers=auth_headers)
        assert notif_response.status_code == 200
        
        notif_data = notif_response.json()
        new_count = len(notif_data["notifications"])
        
        # Verify notification was created
        assert new_count > initial_count, f"Expected new notification. Initial: {initial_count}, Now: {new_count}"
        
        # Check the latest notification is about the booking
        latest_notif = notif_data["notifications"][0]
        assert "booking" in latest_notif.get("type", "").lower() or "New Booking" in latest_notif.get("title", ""), \
            f"Latest notification should be about booking: {latest_notif}"
        
        print(f"✓ Notification created for booking: '{latest_notif['title']}' - '{latest_notif['message']}'")
        print(f"✓ Unread count: {notif_data['unread_count']}")


class TestFileUpload:
    """File upload for support tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Authentication failed")
        return response.json()["access_token"]
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_upload_txt_file(self, auth_headers):
        """Test uploading a .txt file"""
        # Create a test file in memory
        file_content = b"This is a test file for support upload testing."
        files = {
            'file': ('test_support.txt', io.BytesIO(file_content), 'text/plain')
        }
        
        response = requests.post(
            f"{BASE_URL}/api/support/upload",
            headers=auth_headers,
            files=files
        )
        
        assert response.status_code == 200, f"Failed to upload txt file: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should contain file ID"
        assert "url" in data, "Response should contain file URL"
        assert "filename" in data, "Response should contain filename"
        
        print(f"✓ Uploaded .txt file: {data['filename']} -> {data['url']}")
        return data
    
    def test_upload_jpg_file(self, auth_headers):
        """Test uploading a .jpg file (simulated)"""
        # Create a minimal JPEG file (1x1 pixel)
        # This is a valid minimal JPEG
        jpeg_bytes = bytes([
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
            0x00, 0x00, 0x3F, 0x00, 0xFB, 0xD5, 0xDB, 0x20, 0xA8, 0xF1, 0x45, 0x14,
            0x00, 0xFF, 0xD9
        ])
        
        files = {
            'file': ('test_image.jpg', io.BytesIO(jpeg_bytes), 'image/jpeg')
        }
        
        response = requests.post(
            f"{BASE_URL}/api/support/upload",
            headers=auth_headers,
            files=files
        )
        
        assert response.status_code == 200, f"Failed to upload jpg file: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert "url" in data
        
        print(f"✓ Uploaded .jpg file: {data['filename']} -> {data['url']}")
    
    def test_upload_pdf_file(self, auth_headers):
        """Test uploading a .pdf file (minimal PDF)"""
        # Minimal valid PDF
        pdf_content = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer
<< /Size 4 /Root 1 0 R >>
startxref
193
%%EOF"""
        
        files = {
            'file': ('test_document.pdf', io.BytesIO(pdf_content), 'application/pdf')
        }
        
        response = requests.post(
            f"{BASE_URL}/api/support/upload",
            headers=auth_headers,
            files=files
        )
        
        assert response.status_code == 200, f"Failed to upload pdf file: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert "url" in data
        
        print(f"✓ Uploaded .pdf file: {data['filename']} -> {data['url']}")
    
    def test_upload_file_too_large_rejected(self, auth_headers):
        """Test that files over 5MB are rejected"""
        # Create a file larger than 5MB (5.1MB)
        large_content = b"x" * (5 * 1024 * 1024 + 100000)  # 5.1MB
        
        files = {
            'file': ('large_file.txt', io.BytesIO(large_content), 'text/plain')
        }
        
        response = requests.post(
            f"{BASE_URL}/api/support/upload",
            headers=auth_headers,
            files=files
        )
        
        assert response.status_code == 400, f"Large file should be rejected: {response.status_code}"
        print("✓ Large file (>5MB) correctly rejected")
    
    def test_upload_invalid_extension_rejected(self, auth_headers):
        """Test that invalid file extensions are rejected"""
        files = {
            'file': ('malicious.exe', io.BytesIO(b"fake exe content"), 'application/octet-stream')
        }
        
        response = requests.post(
            f"{BASE_URL}/api/support/upload",
            headers=auth_headers,
            files=files
        )
        
        assert response.status_code == 400, f"Invalid extension should be rejected: {response.status_code}"
        print("✓ Invalid file extension (.exe) correctly rejected")


class TestDashboard:
    """Dashboard API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Authentication failed")
        return response.json()["access_token"]
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_get_business_stats(self, auth_headers):
        """Test GET /api/business/stats returns dashboard stats"""
        response = requests.get(f"{BASE_URL}/api/business/stats", headers=auth_headers)
        assert response.status_code == 200, f"Failed to get stats: {response.text}"
        
        data = response.json()
        assert "today_count" in data, "Should have today_count"
        assert "pending_count" in data, "Should have pending_count"
        assert "revenue_pence" in data, "Should have revenue_pence"
        assert "total_bookings" in data, "Should have total_bookings"
        assert "total_customers" in data, "Should have total_customers"
        
        print(f"✓ Dashboard stats: {data['today_count']} today, {data['pending_count']} pending, £{data['revenue_pence']/100:.2f} revenue")
    
    def test_get_bookings(self, auth_headers):
        """Test GET /api/bookings returns bookings list"""
        response = requests.get(f"{BASE_URL}/api/bookings", headers=auth_headers)
        assert response.status_code == 200, f"Failed to get bookings: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Bookings should be a list"
        
        print(f"✓ Found {len(data)} bookings")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
