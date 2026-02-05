"""
Iteration 13 Backend Tests
Testing: Products CRUD, Messages PATCH/DELETE, Admin Conversations
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndAuth:
    """Basic health and authentication tests"""
    
    def test_health_endpoint(self):
        """Test API health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health endpoint working")
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "testuser@example.com",
            "password": "password123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        print("✓ Login successful")
        return data["access_token"]


class TestProductsCRUD:
    """Products API CRUD tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "testuser@example.com",
            "password": "password123"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get headers with auth token"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_get_products_list(self, auth_headers):
        """Test GET /products - list all products"""
        response = requests.get(f"{BASE_URL}/api/products", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /products returned {len(data)} products")
    
    def test_create_product(self, auth_headers):
        """Test POST /products - create new product"""
        product_data = {
            "name": "TEST_Hair Serum",
            "description": "Premium hair serum for shine",
            "price_pence": 1500,
            "sku": "TEST-SERUM-001",
            "stock_quantity": 50,
            "category": "Hair Care"
        }
        response = requests.post(f"{BASE_URL}/api/products", json=product_data, headers=auth_headers)
        assert response.status_code in [200, 201]
        data = response.json()
        assert "id" in data
        assert data["name"] == product_data["name"]
        print(f"✓ POST /products created product with id: {data['id']}")
        return data["id"]
    
    def test_create_and_get_product(self, auth_headers):
        """Test create product and verify it appears in list"""
        # Create product
        product_data = {
            "name": "TEST_Styling Gel",
            "price_pence": 1200,
            "stock_quantity": 30,
            "category": "Styling"
        }
        create_response = requests.post(f"{BASE_URL}/api/products", json=product_data, headers=auth_headers)
        assert create_response.status_code in [200, 201]
        created = create_response.json()
        product_id = created["id"]
        
        # Verify in list
        list_response = requests.get(f"{BASE_URL}/api/products", headers=auth_headers)
        assert list_response.status_code == 200
        products = list_response.json()
        found = any(p["id"] == product_id for p in products)
        assert found, "Created product not found in list"
        print(f"✓ Product {product_id} verified in list")
    
    def test_update_product(self, auth_headers):
        """Test PATCH /products/{id} - update product"""
        # First create a product
        product_data = {
            "name": "TEST_Update Product",
            "price_pence": 1000,
            "stock_quantity": 10
        }
        create_response = requests.post(f"{BASE_URL}/api/products", json=product_data, headers=auth_headers)
        assert create_response.status_code in [200, 201]
        product_id = create_response.json()["id"]
        
        # Update the product
        update_data = {
            "name": "TEST_Updated Product Name",
            "price_pence": 1500
        }
        update_response = requests.patch(f"{BASE_URL}/api/products/{product_id}", json=update_data, headers=auth_headers)
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["name"] == update_data["name"]
        print(f"✓ PATCH /products/{product_id} updated successfully")
    
    def test_delete_product(self, auth_headers):
        """Test DELETE /products/{id} - soft delete product"""
        # First create a product
        product_data = {
            "name": "TEST_Delete Product",
            "price_pence": 500
        }
        create_response = requests.post(f"{BASE_URL}/api/products", json=product_data, headers=auth_headers)
        assert create_response.status_code in [200, 201]
        product_id = create_response.json()["id"]
        
        # Delete the product
        delete_response = requests.delete(f"{BASE_URL}/api/products/{product_id}", headers=auth_headers)
        assert delete_response.status_code in [200, 204]
        print(f"✓ DELETE /products/{product_id} successful")


class TestMessagesAPI:
    """Messages PATCH/DELETE API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "testuser@example.com",
            "password": "password123"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get headers with auth token"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_get_conversations(self, auth_headers):
        """Test GET /conversations - list user conversations"""
        response = requests.get(f"{BASE_URL}/api/conversations", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /conversations returned {len(data)} conversations")
        return data
    
    def test_create_conversation_and_message(self, auth_headers):
        """Test POST /conversations - create new conversation with message"""
        conv_data = {
            "content": "TEST_Hello, I need help with my booking",
            "subject": "TEST_Booking Help",
            "recipient_type": "support"
        }
        response = requests.post(f"{BASE_URL}/api/conversations", json=conv_data, headers=auth_headers)
        assert response.status_code in [200, 201]
        data = response.json()
        assert "conversation_id" in data
        print(f"✓ POST /conversations created conversation: {data['conversation_id']}")
        return data["conversation_id"]
    
    def test_get_conversation_messages(self, auth_headers):
        """Test GET /conversations/{id}/messages"""
        # First create a conversation
        conv_data = {
            "content": "TEST_Message for testing",
            "subject": "TEST_Test Subject",
            "recipient_type": "support"
        }
        create_response = requests.post(f"{BASE_URL}/api/conversations", json=conv_data, headers=auth_headers)
        assert create_response.status_code in [200, 201]
        conv_id = create_response.json()["conversation_id"]
        
        # Get messages
        messages_response = requests.get(f"{BASE_URL}/api/conversations/{conv_id}/messages", headers=auth_headers)
        assert messages_response.status_code == 200
        messages = messages_response.json()
        assert isinstance(messages, list)
        assert len(messages) >= 1  # At least the initial message
        print(f"✓ GET /conversations/{conv_id}/messages returned {len(messages)} messages")
        return conv_id, messages
    
    def test_send_message_to_conversation(self, auth_headers):
        """Test POST /conversations/{id}/messages - send new message"""
        # Create conversation first
        conv_data = {
            "content": "TEST_Initial message",
            "subject": "TEST_Reply Test",
            "recipient_type": "support"
        }
        create_response = requests.post(f"{BASE_URL}/api/conversations", json=conv_data, headers=auth_headers)
        conv_id = create_response.json()["conversation_id"]
        
        # Send another message
        message_data = {"content": "TEST_Follow up message"}
        send_response = requests.post(f"{BASE_URL}/api/conversations/{conv_id}/messages", json=message_data, headers=auth_headers)
        assert send_response.status_code in [200, 201]
        print(f"✓ POST /conversations/{conv_id}/messages sent successfully")
    
    def test_edit_message(self, auth_headers):
        """Test PATCH /messages/{id} - edit message content"""
        # Create conversation with message
        conv_data = {
            "content": "TEST_Original message content",
            "subject": "TEST_Edit Test",
            "recipient_type": "support"
        }
        create_response = requests.post(f"{BASE_URL}/api/conversations", json=conv_data, headers=auth_headers)
        conv_id = create_response.json()["conversation_id"]
        
        # Get messages to find the message ID
        messages_response = requests.get(f"{BASE_URL}/api/conversations/{conv_id}/messages", headers=auth_headers)
        messages = messages_response.json()
        message_id = messages[0]["id"]
        
        # Edit the message
        edit_data = {"content": "TEST_Edited message content"}
        edit_response = requests.patch(f"{BASE_URL}/api/messages/{message_id}", json=edit_data, headers=auth_headers)
        assert edit_response.status_code == 200
        
        # Verify edit
        verify_response = requests.get(f"{BASE_URL}/api/conversations/{conv_id}/messages", headers=auth_headers)
        updated_messages = verify_response.json()
        edited_msg = next((m for m in updated_messages if m["id"] == message_id), None)
        assert edited_msg is not None
        assert edited_msg["content"] == edit_data["content"]
        print(f"✓ PATCH /messages/{message_id} edited successfully")
    
    def test_delete_message(self, auth_headers):
        """Test DELETE /messages/{id} - delete message"""
        # Create conversation with message
        conv_data = {
            "content": "TEST_Message to delete",
            "subject": "TEST_Delete Test",
            "recipient_type": "support"
        }
        create_response = requests.post(f"{BASE_URL}/api/conversations", json=conv_data, headers=auth_headers)
        conv_id = create_response.json()["conversation_id"]
        
        # Get messages to find the message ID
        messages_response = requests.get(f"{BASE_URL}/api/conversations/{conv_id}/messages", headers=auth_headers)
        messages = messages_response.json()
        message_id = messages[0]["id"]
        
        # Delete the message
        delete_response = requests.delete(f"{BASE_URL}/api/messages/{message_id}", headers=auth_headers)
        assert delete_response.status_code in [200, 204]
        print(f"✓ DELETE /messages/{message_id} deleted successfully")


class TestAdminSupportInbox:
    """Admin Support Inbox API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "testuser@example.com",
            "password": "password123"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get headers with auth token"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_admin_get_all_conversations(self, auth_headers):
        """Test GET /admin/conversations - get all support conversations"""
        response = requests.get(f"{BASE_URL}/api/admin/conversations", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /admin/conversations returned {len(data)} conversations")


class TestServicesDeleteConfirmation:
    """Test services delete functionality (backend part)"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "testuser@example.com",
            "password": "password123"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get headers with auth token"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_delete_service(self, auth_headers):
        """Test DELETE /services/{id} - delete service"""
        # First create a service
        service_data = {
            "name": "TEST_Service to Delete",
            "price_pence": 2500,
            "duration_min": 30
        }
        create_response = requests.post(f"{BASE_URL}/api/services", json=service_data, headers=auth_headers)
        assert create_response.status_code in [200, 201]
        service_id = create_response.json()["id"]
        
        # Delete the service
        delete_response = requests.delete(f"{BASE_URL}/api/services/{service_id}", headers=auth_headers)
        assert delete_response.status_code in [200, 204]
        print(f"✓ DELETE /services/{service_id} successful")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
