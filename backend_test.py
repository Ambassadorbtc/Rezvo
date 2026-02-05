#!/usr/bin/env python3
"""
QuickSlot Backend API Testing Suite
Tests all API endpoints for the booking app MVP
"""

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class QuickSlotAPITester:
    def __init__(self, base_url: str = "https://appointment-pro-51.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.business_id = None
        self.service_id = None
        self.booking_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        # Test user credentials
        self.test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        self.test_password = "TestPass123!"
        self.test_business_name = "Test Hair Studio"

    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            self.failed_tests.append({"test": test_name, "details": details})
            print(f"❌ {test_name} - {details}")

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    expected_status: int = 200, auth_required: bool = True) -> tuple[bool, Dict]:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                return False, {"error": f"Unsupported method: {method}"}
            
            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}
            
            return success, response_data
            
        except requests.RequestException as e:
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        
        # Test root endpoint
        success, data = self.make_request('GET', '/', auth_required=False)
        self.log_result("Root endpoint", success, 
                       f"Expected QuickSlot API message" if not success else "")
        
        # Test health endpoint
        success, data = self.make_request('GET', '/health', auth_required=False)
        self.log_result("Health check", success, 
                       f"Health endpoint failed" if not success else "")

    def test_auth_signup(self):
        """Test user signup"""
        print("\n🔍 Testing Authentication - Signup...")
        
        signup_data = {
            "email": self.test_email,
            "password": self.test_password,
            "business_name": self.test_business_name
        }
        
        success, data = self.make_request('POST', '/auth/signup', signup_data, 
                                        expected_status=200, auth_required=False)
        
        if success and 'access_token' in data:
            self.token = data['access_token']
            self.user_id = data['user']['id']
            self.business_id = data['user'].get('business_id')
            self.log_result("User signup", True)
        else:
            self.log_result("User signup", False, f"Response: {data}")

    def test_auth_login(self):
        """Test user login"""
        print("\n🔍 Testing Authentication - Login...")
        
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        success, data = self.make_request('POST', '/auth/login', login_data, 
                                        expected_status=200, auth_required=False)
        
        if success and 'access_token' in data:
            self.token = data['access_token']
            self.log_result("User login", True)
        else:
            self.log_result("User login", False, f"Response: {data}")

    def test_auth_me(self):
        """Test get current user"""
        print("\n🔍 Testing Authentication - Get Me...")
        
        success, data = self.make_request('GET', '/auth/me')
        self.log_result("Get current user", success and 'email' in data, 
                       f"Response: {data}" if not success else "")

    def test_business_operations(self):
        """Test business CRUD operations"""
        print("\n🔍 Testing Business Operations...")
        
        # Get business (should exist from signup)
        success, data = self.make_request('GET', '/business')
        if success and 'name' in data:
            self.business_id = data['id']
            self.log_result("Get business", True)
        else:
            self.log_result("Get business", False, f"Response: {data}")
        
        # Update business
        update_data = {
            "tagline": "Professional cuts at your doorstep",
            "phone": "+44 7123 456789",
            "address": "London, UK"
        }
        success, data = self.make_request('PATCH', '/business', update_data)
        self.log_result("Update business", success, f"Response: {data}" if not success else "")
        
        # Update availability
        availability_data = {
            "slots": [
                {"day": 1, "start_min": 540, "end_min": 1020},  # Monday 9am-5pm
                {"day": 2, "start_min": 540, "end_min": 1020},  # Tuesday 9am-5pm
                {"day": 3, "start_min": 540, "end_min": 1020},  # Wednesday 9am-5pm
            ]
        }
        success, data = self.make_request('PATCH', '/business/availability', availability_data)
        self.log_result("Update availability", success, f"Response: {data}" if not success else "")

    def test_services_crud(self):
        """Test services CRUD operations"""
        print("\n🔍 Testing Services CRUD...")
        
        # Create service
        service_data = {
            "name": "Haircut & Beard Trim",
            "price_pence": 2500,  # £25.00
            "duration_min": 60,
            "deposit_required": True,
            "deposit_amount_pence": 1000,  # £10.00
            "description": "Professional haircut and beard styling"
        }
        
        success, data = self.make_request('POST', '/services', service_data, expected_status=200)
        if success and 'id' in data:
            self.service_id = data['id']
            self.log_result("Create service", True)
        else:
            self.log_result("Create service", False, f"Response: {data}")
        
        # Get services
        success, data = self.make_request('GET', '/services')
        self.log_result("Get services", success and isinstance(data, list), 
                       f"Response: {data}" if not success else "")
        
        # Update service
        if self.service_id:
            update_data = {"price_pence": 3000}  # £30.00
            success, data = self.make_request('PATCH', f'/services/{self.service_id}', update_data)
            self.log_result("Update service", success, f"Response: {data}" if not success else "")

    def test_bookings_crud(self):
        """Test bookings CRUD operations"""
        print("\n🔍 Testing Bookings CRUD...")
        
        if not self.service_id:
            self.log_result("Create booking", False, "No service_id available")
            return
        
        # Create booking
        tomorrow = datetime.now() + timedelta(days=1)
        booking_data = {
            "service_id": self.service_id,
            "client_name": "John Smith",
            "client_email": "john@example.com",
            "client_phone": "+44 7987 654321",
            "datetime_iso": tomorrow.replace(hour=10, minute=0).isoformat(),
            "notes": "First time client"
        }
        
        success, data = self.make_request('POST', '/bookings', booking_data, expected_status=200)
        if success and 'id' in data:
            self.booking_id = data['id']
            self.log_result("Create booking", True)
        else:
            self.log_result("Create booking", False, f"Response: {data}")
        
        # Get bookings
        success, data = self.make_request('GET', '/bookings')
        self.log_result("Get bookings", success and isinstance(data, list), 
                       f"Response: {data}" if not success else "")
        
        # Get specific booking
        if self.booking_id:
            success, data = self.make_request('GET', f'/bookings/{self.booking_id}')
            self.log_result("Get specific booking", success and 'id' in data, 
                           f"Response: {data}" if not success else "")
        
        # Update booking
        if self.booking_id:
            update_data = {"status": "confirmed", "notes": "Confirmed by client"}
            success, data = self.make_request('PATCH', f'/bookings/{self.booking_id}', update_data)
            self.log_result("Update booking", success, f"Response: {data}" if not success else "")

    def test_public_endpoints(self):
        """Test public booking endpoints"""
        print("\n🔍 Testing Public Endpoints...")
        
        if not self.business_id:
            self.log_result("Get public business", False, "No business_id available")
            return
        
        # Get public business info
        success, data = self.make_request('GET', f'/public/business/{self.business_id}', 
                                        auth_required=False)
        self.log_result("Get public business", success and 'name' in data, 
                       f"Response: {data}" if not success else "")
        
        # Get public services
        success, data = self.make_request('GET', f'/public/business/{self.business_id}/services', 
                                        auth_required=False)
        self.log_result("Get public services", success and isinstance(data, list), 
                       f"Response: {data}" if not success else "")
        
        # Create public booking
        if self.service_id:
            tomorrow = datetime.now() + timedelta(days=2)
            public_booking_data = {
                "service_id": self.service_id,
                "client_name": "Jane Doe",
                "client_email": "jane@example.com",
                "datetime_iso": tomorrow.replace(hour=14, minute=0).isoformat()
            }
            
            success, data = self.make_request('POST', '/public/bookings', public_booking_data, 
                                            expected_status=200, auth_required=False)
            self.log_result("Create public booking", success and 'id' in data, 
                           f"Response: {data}" if not success else "")

    def test_shareable_links(self):
        """Test shareable link generation"""
        print("\n🔍 Testing Shareable Links...")
        
        success, data = self.make_request('GET', '/links/generate')
        self.log_result("Generate shareable link", success and 'link' in data, 
                       f"Response: {data}" if not success else "")

    def test_analytics(self):
        """Test analytics endpoints"""
        print("\n🔍 Testing Analytics...")
        
        # Dashboard analytics
        success, data = self.make_request('GET', '/analytics/dashboard')
        expected_fields = ['total_bookings', 'revenue_pence', 'today_bookings']
        has_fields = all(field in data for field in expected_fields) if success else False
        self.log_result("Dashboard analytics", success and has_fields, 
                       f"Response: {data}" if not success else "")
        
        # Revenue analytics
        success, data = self.make_request('GET', '/analytics/revenue?period=7days')
        self.log_result("Revenue analytics", success and 'data' in data, 
                       f"Response: {data}" if not success else "")
        
        # Services analytics
        success, data = self.make_request('GET', '/analytics/services')
        self.log_result("Services analytics", success and 'data' in data, 
                       f"Response: {data}" if not success else "")

    def test_ai_suggestions(self):
        """Test AI suggestions endpoint"""
        print("\n🔍 Testing AI Suggestions...")
        
        success, data = self.make_request('GET', '/ai/slot-suggestions')
        self.log_result("AI slot suggestions", success and 'suggestions' in data, 
                       f"Response: {data}" if not success else "")

    def test_payments_dojo(self):
        """Test Dojo payment integration"""
        print("\n🔍 Testing Dojo Payments...")
        
        # Verify Dojo key (will be mocked)
        dojo_data = {"api_key": "test_dojo_key_123"}
        success, data = self.make_request('POST', '/payments/verify-key', dojo_data)
        self.log_result("Verify Dojo key", success, f"Response: {data}" if not success else "")

    def test_onboarding(self):
        """Test onboarding endpoints"""
        print("\n🔍 Testing Onboarding...")
        
        # Get onboarding status
        success, data = self.make_request('GET', '/onboarding/status')
        expected_fields = ['completed', 'has_business', 'has_services']
        has_fields = all(field in data for field in expected_fields) if success else False
        self.log_result("Onboarding status", success and has_fields, 
                       f"Response: {data}" if not success else "")
        
        # Complete onboarding
        success, data = self.make_request('POST', '/onboarding/complete')
        self.log_result("Complete onboarding", success, f"Response: {data}" if not success else "")

    def test_settings(self):
        """Test settings endpoints"""
        print("\n🔍 Testing Settings...")
        
        # Get settings
        success, data = self.make_request('GET', '/settings')
        self.log_result("Get settings", success and 'email' in data, 
                       f"Response: {data}" if not success else "")
        
        # Update reminder settings
        reminder_data = {
            "sms_enabled": True,
            "email_enabled": True,
            "reminder_hours": 24
        }
        success, data = self.make_request('PATCH', '/settings/reminders', reminder_data)
        self.log_result("Update reminder settings", success, f"Response: {data}" if not success else "")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting QuickSlot API Tests...")
        print(f"📍 Testing against: {self.base_url}")
        
        # Test sequence
        self.test_health_check()
        self.test_auth_signup()
        self.test_auth_login()
        self.test_auth_me()
        self.test_business_operations()
        self.test_services_crud()
        self.test_bookings_crud()
        self.test_public_endpoints()
        self.test_shareable_links()
        self.test_analytics()
        self.test_ai_suggestions()
        self.test_payments_dojo()
        self.test_onboarding()
        self.test_settings()
        
        # Print summary
        print(f"\n📊 Test Results:")
        print(f"✅ Passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Failed: {len(self.failed_tests)}/{self.tests_run}")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 80  # Consider 80%+ as passing

def main():
    """Main test runner"""
    tester = QuickSlotAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())