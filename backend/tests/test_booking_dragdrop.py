"""
Test booking drag-drop functionality - verifies datetime_iso updates date, start_time, end_time
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://easysched-3.preview.emergentagent.com')

class TestBookingDragDrop:
    """Test booking update for drag-drop functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "emailuser@test.com",
            "password": "Test1234!"
        })
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        self.token = login_response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    def test_booking_update_syncs_datetime_fields(self):
        """Test that updating datetime_iso also updates date, start_time, end_time"""
        # Get services first
        services_response = requests.get(f"{BASE_URL}/api/services", headers=self.headers)
        assert services_response.status_code == 200
        services = services_response.json()
        
        if not services:
            # Create a service if none exists
            create_service = requests.post(f"{BASE_URL}/api/services", headers=self.headers, json={
                "name": "Test Service DragDrop",
                "price_pence": 5000,
                "duration_min": 60,
                "deposit_required": False
            })
            assert create_service.status_code == 200
            services_response = requests.get(f"{BASE_URL}/api/services", headers=self.headers)
            services = services_response.json()
        
        service_id = services[0]["id"]
        
        # Create a test booking at 10:00
        today = datetime.now().strftime("%Y-%m-%d")
        original_datetime = f"{today}T10:00:00Z"
        
        create_response = requests.post(f"{BASE_URL}/api/bookings", headers=self.headers, json={
            "service_id": service_id,
            "client_name": "TEST_DragDrop_Sync",
            "client_email": "dragdropsync@test.com",
            "client_phone": "+447123456789",
            "datetime_iso": original_datetime,
            "notes": "Test booking for datetime sync"
        })
        assert create_response.status_code == 200, f"Create booking failed: {create_response.text}"
        booking_id = create_response.json()["id"]
        
        # Verify initial booking
        get_response = requests.get(f"{BASE_URL}/api/bookings/{booking_id}", headers=self.headers)
        assert get_response.status_code == 200
        booking = get_response.json()
        assert booking["start_time"] == "10:00"
        assert booking["end_time"] == "11:00"  # 60 min duration
        assert booking["date"] == today
        
        # Update booking to 15:00 (simulating drag-drop)
        new_datetime = f"{today}T15:00:00Z"
        update_response = requests.patch(f"{BASE_URL}/api/bookings/{booking_id}", headers=self.headers, json={
            "datetime_iso": new_datetime
        })
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        assert update_response.json()["status"] == "updated"
        
        # Verify updated booking
        get_updated = requests.get(f"{BASE_URL}/api/bookings/{booking_id}", headers=self.headers)
        assert get_updated.status_code == 200
        updated_booking = get_updated.json()
        
        # CRITICAL: Verify all datetime fields are synced
        assert updated_booking["datetime"] == new_datetime, f"datetime not updated: {updated_booking['datetime']}"
        assert updated_booking["date"] == today, f"date not correct: {updated_booking['date']}"
        assert updated_booking["start_time"] == "15:00", f"start_time not updated: {updated_booking['start_time']}"
        assert updated_booking["end_time"] == "16:00", f"end_time not updated: {updated_booking['end_time']}"
        
        print(f"SUCCESS: Booking datetime sync verified")
        print(f"  Original: 10:00-11:00")
        print(f"  Updated: {updated_booking['start_time']}-{updated_booking['end_time']}")
    
    def test_booking_update_with_date_change(self):
        """Test updating booking to a different date"""
        # Get services
        services_response = requests.get(f"{BASE_URL}/api/services", headers=self.headers)
        services = services_response.json()
        service_id = services[0]["id"]
        
        # Create booking for today
        today = datetime.now()
        tomorrow = (today + timedelta(days=1)).strftime("%Y-%m-%d")
        today_str = today.strftime("%Y-%m-%d")
        
        create_response = requests.post(f"{BASE_URL}/api/bookings", headers=self.headers, json={
            "service_id": service_id,
            "client_name": "TEST_DateChange",
            "client_email": "datechange@test.com",
            "datetime_iso": f"{today_str}T09:00:00Z"
        })
        assert create_response.status_code == 200
        booking_id = create_response.json()["id"]
        
        # Move to tomorrow at 14:00
        new_datetime = f"{tomorrow}T14:00:00Z"
        update_response = requests.patch(f"{BASE_URL}/api/bookings/{booking_id}", headers=self.headers, json={
            "datetime_iso": new_datetime
        })
        assert update_response.status_code == 200
        
        # Verify
        get_response = requests.get(f"{BASE_URL}/api/bookings/{booking_id}", headers=self.headers)
        booking = get_response.json()
        
        assert booking["date"] == tomorrow, f"Date not updated to tomorrow: {booking['date']}"
        assert booking["start_time"] == "14:00", f"Start time not updated: {booking['start_time']}"
        assert booking["end_time"] == "15:00", f"End time not updated: {booking['end_time']}"
        
        print(f"SUCCESS: Date change verified - moved from {today_str} to {tomorrow}")


class TestSupportChatPolling:
    """Test support chat polling interval"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "emailuser@test.com",
            "password": "Test1234!"
        })
        assert login_response.status_code == 200
        self.token = login_response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_conversations_endpoint_responds_quickly(self):
        """Test that conversations endpoint responds within acceptable time"""
        import time
        
        start = time.time()
        response = requests.get(f"{BASE_URL}/api/conversations", headers=self.headers)
        elapsed = time.time() - start
        
        assert response.status_code == 200, f"Conversations failed: {response.text}"
        assert elapsed < 2.0, f"Response too slow: {elapsed}s (should be < 2s for polling)"
        
        print(f"Conversations endpoint responded in {elapsed:.3f}s")
    
    def test_messages_endpoint_responds_quickly(self):
        """Test that messages endpoint responds within acceptable time for polling"""
        import time
        
        # Get a conversation first
        conv_response = requests.get(f"{BASE_URL}/api/conversations", headers=self.headers)
        conversations = conv_response.json()
        
        if conversations:
            conv_id = conversations[0]["id"]
            
            start = time.time()
            response = requests.get(f"{BASE_URL}/api/conversations/{conv_id}/messages", headers=self.headers)
            elapsed = time.time() - start
            
            assert response.status_code == 200
            assert elapsed < 2.0, f"Messages response too slow: {elapsed}s"
            
            print(f"Messages endpoint responded in {elapsed:.3f}s")
        else:
            pytest.skip("No conversations to test")


class TestCalendarPositionCalculation:
    """Test calendar booking position calculation"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "emailuser@test.com",
            "password": "Test1234!"
        })
        assert login_response.status_code == 200
        self.token = login_response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_booking_at_6am_returns_correct_time(self):
        """Test that a booking at 6am is stored correctly"""
        services_response = requests.get(f"{BASE_URL}/api/services", headers=self.headers)
        services = services_response.json()
        
        if not services:
            pytest.skip("No services available")
        
        service_id = services[0]["id"]
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Create booking at 6:00 AM
        create_response = requests.post(f"{BASE_URL}/api/bookings", headers=self.headers, json={
            "service_id": service_id,
            "client_name": "TEST_6AM_Booking",
            "client_email": "6am@test.com",
            "datetime_iso": f"{today}T06:00:00Z"
        })
        assert create_response.status_code == 200
        booking_id = create_response.json()["id"]
        
        # Verify
        get_response = requests.get(f"{BASE_URL}/api/bookings/{booking_id}", headers=self.headers)
        booking = get_response.json()
        
        assert booking["start_time"] == "06:00", f"6AM booking start_time wrong: {booking['start_time']}"
        print(f"SUCCESS: 6AM booking stored correctly with start_time={booking['start_time']}")
    
    def test_booking_at_9am_returns_correct_time(self):
        """Test that a booking at 9am is stored correctly"""
        services_response = requests.get(f"{BASE_URL}/api/services", headers=self.headers)
        services = services_response.json()
        
        if not services:
            pytest.skip("No services available")
        
        service_id = services[0]["id"]
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Create booking at 9:00 AM
        create_response = requests.post(f"{BASE_URL}/api/bookings", headers=self.headers, json={
            "service_id": service_id,
            "client_name": "TEST_9AM_Booking",
            "client_email": "9am@test.com",
            "datetime_iso": f"{today}T09:00:00Z"
        })
        assert create_response.status_code == 200
        booking_id = create_response.json()["id"]
        
        # Verify
        get_response = requests.get(f"{BASE_URL}/api/bookings/{booking_id}", headers=self.headers)
        booking = get_response.json()
        
        assert booking["start_time"] == "09:00", f"9AM booking start_time wrong: {booking['start_time']}"
        print(f"SUCCESS: 9AM booking stored correctly with start_time={booking['start_time']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
