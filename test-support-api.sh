#!/bin/bash

echo "Testing Rezvo Support Bot API..."
echo ""

# Test 1: Create a conversation
echo "1. Creating a conversation..."
CONV_RESPONSE=$(curl -s -X POST http://localhost:8000/api/support/conversations \
  -H "Content-Type: application/json" \
  -d '{"source":"web","page_url":"https://rezvo.co.uk/pricing"}')

echo "$CONV_RESPONSE"
CONV_ID=$(echo "$CONV_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Conversation ID: $CONV_ID"
echo ""

# Test 2: Log user message
echo "2. Logging user message..."
curl -s -X POST "http://localhost:8000/api/support/conversations/$CONV_ID/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "user",
    "content": "How do payments work?",
    "input_tokens": 25,
    "output_tokens": 0,
    "is_escalation": false
  }'
echo ""

# Test 3: Log assistant response
echo "3. Logging assistant response..."
curl -s -X POST "http://localhost:8000/api/support/conversations/$CONV_ID/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "assistant",
    "content": "Rezvo uses Stripe Connect for secure payment processing. All payments go directly to your bank account.",
    "input_tokens": 0,
    "output_tokens": 60,
    "is_escalation": false
  }'
echo ""
echo ""

# Test 4: Log user escalation request
echo "4. Logging user escalation..."
curl -s -X POST "http://localhost:8000/api/support/conversations/$CONV_ID/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "user",
    "content": "I need help with my account",
    "input_tokens": 20,
    "output_tokens": 0,
    "is_escalation": false
  }'
echo ""

# Test 5: Log assistant escalation response
echo "5. Logging assistant escalation response..."
curl -s -X POST "http://localhost:8000/api/support/conversations/$CONV_ID/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "assistant",
    "content": "For account-specific issues, please email support@rezvo.co.uk and our team will assist you.",
    "input_tokens": 0,
    "output_tokens": 45,
    "is_escalation": true
  }'
echo ""
echo ""

# Test 6: Get conversation list
echo "6. Getting conversation list..."
curl -s http://localhost:8000/api/support/conversations
echo ""
echo ""

# Test 7: Get tickets needing review
echo "7. Getting tickets needing review..."
curl -s http://localhost:8000/api/support/tickets
echo ""
echo ""

# Test 8: Get analytics
echo "8. Getting analytics..."
curl -s "http://localhost:8000/api/support/analytics?days=7"
echo ""
echo ""

echo "✅ All tests complete!"
