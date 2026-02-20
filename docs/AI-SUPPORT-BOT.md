# Rezvo AI Support Bot — Backend Setup Guide

## Overview

AI-powered customer support chatbot using Claude Haiku 4.5.
- Every chat conversation creates a support ticket automatically
- Every question + answer is logged to the database
- Escalated chats (where the bot says "email support") are flagged for human review
- Analytics endpoint shows top questions, costs, and volumes

## Architecture

```
User → React Chat Widget → Anthropic API (Haiku 4.5) → Response
                ↓                                         ↓
         POST /conversations (start)              POST /messages (log Q&A pair)
                ↓                                         ↓
         support_conversations collection        support_messages collection
```

## Backend Implementation

### Database Collections

#### `support_conversations`
One document per chat session (= one support ticket)

```javascript
{
  "_id": ObjectId,
  "source": "web" | "app_owner" | "app_diner" | "dashboard",
  "page_url": "https://rezvo.co.uk/pricing",
  "user_id": "optional-user-id",
  "status": "auto_resolved" | "needs_review" | "open" | "in_progress" | "closed",
  "escalated": false,
  "message_count": 5,
  "total_input_tokens": 1234,
  "total_output_tokens": 567,
  "estimated_cost_usd": 6234,  // in micro-cents (divide by 1,000,000 for USD)
  "assigned_to": "staff-user-id",
  "notes": "Customer had issue with payment flow",
  "created_at": ISODate,
  "updated_at": ISODate
}
```

#### `support_messages`
One document per individual message (user or assistant)

```javascript
{
  "_id": ObjectId,
  "conversation_id": "conversation-id",
  "user_message": "How do payments work?",
  "assistant_message": "Rezvo uses Stripe Connect...",
  "input_tokens": 234,
  "output_tokens": 156,
  "is_escalation": false,
  "created_at": ISODate
}
```

### API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/support/conversations` | Start new conversation (called when chat opens) |
| POST | `/api/support/conversations/{id}/messages` | Log a Q&A pair (called after each bot response) |
| PATCH | `/api/support/conversations/{id}` | Update status (escalate, close) |
| GET | `/api/support/conversations` | List all conversations (admin dashboard) |
| GET | `/api/support/tickets` | Get conversations needing human review |
| GET | `/api/support/analytics` | Stats: top questions, costs, daily volumes |

### Files Added

1. **`backend/models/support.py`** - Pydantic models for conversations and messages
2. **`backend/routes/support.py`** - All API endpoints
3. **`backend/routes/__init__.py`** - Updated to include support router
4. **`backend/server.py`** - Updated to register support router

## Frontend Integration

The React component needs these additions:

### 1. Add State Variable

```jsx
const [conversationId, setConversationId] = useState(null);
```

### 2. Add Helper Functions

```jsx
const API_BASE = "https://api.rezvo.co.uk"; // your backend URL

async function startConversation() {
  try {
    const res = await fetch(`${API_BASE}/api/support/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: window.location.pathname.includes("/app") ? "app_owner" : "web",
        page_url: window.location.href,
      }),
    });
    const data = await res.json();
    setConversationId(data.id);
    return data.id;
  } catch (err) {
    console.warn("Could not start support conversation:", err);
    return null;
  }
}

async function logMessage(convId, userText, botText, inputTokens, outputTokens, isEscalation) {
  if (!convId) return;
  try {
    await fetch(`${API_BASE}/api/support/conversations/${convId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_message: userText,
        assistant_message: botText,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        is_escalation: isEscalation,
      }),
    });
  } catch (err) {
    console.warn("Could not log support message:", err);
  }
}
```

### 3. Update sendMessage Function

After getting the bot response from Anthropic API:

```jsx
// Check if bot escalated
const isEscalation = assistantText.toLowerCase().includes("support@rezvo.co.uk")
  && assistantText.toLowerCase().includes("email");

// Get token counts from API response
const inputTokens = data.usage?.input_tokens || 0;
const outputTokens = data.usage?.output_tokens || 0;

// Start conversation on first message if not started
let convId = conversationId;
if (!convId) convId = await startConversation();

// Log to backend (fire and forget — don't await)
logMessage(convId, text.trim(), assistantText, inputTokens, outputTokens, isEscalation);
```

## How Tickets Work

1. **User opens chat** → `POST /api/support/conversations` creates a record with status `auto_resolved`
2. **Each Q&A exchange** → `POST /api/support/conversations/{id}/messages` logs both messages
3. **Bot says "email support@rezvo.co.uk"** → conversation is flagged `needs_review` and `escalated: true`
4. **Check tickets** → `GET /api/support/tickets` returns all flagged conversations with full message history
5. **After handling** → `PATCH /api/support/conversations/{id}` to update status to `closed`

## Analytics

`GET /api/support/analytics?days=30` returns:

```json
{
  "total_conversations": 847,
  "total_messages": 3241,
  "auto_resolved_pct": 82.4,
  "escalated_pct": 17.6,
  "avg_messages_per_conversation": 3.8,
  "total_cost_usd": 2.53,
  "top_questions": [
    {"question": "How do payments and deposits work?", "count": 94},
    {"question": "How is Rezvo different from Fresha?", "count": 71},
    {"question": "What's included in the free plan?", "count": 58}
  ],
  "conversations_by_day": [
    {"date": "2026-02-18", "count": 23},
    {"date": "2026-02-19", "count": 31}
  ]
}
```

## Cost Tracking

Every message logs `input_tokens` and `output_tokens` from the Anthropic API response.

**Claude Haiku Pricing:**
- Input: $1 per 1M tokens
- Output: $5 per 1M tokens

**Cost Formula:**
```
cost_microcents = (input_tokens × 1) + (output_tokens × 5)
cost_usd = cost_microcents / 1,000,000
```

Stored as micro-cents (integer) for precision.

## Dashboard Integration

Build an admin dashboard page to:

1. **List all tickets** needing review:
   ```jsx
   const tickets = await fetch('/api/support/tickets');
   ```

2. **Show conversation thread** with full message history

3. **Update status** when resolved:
   ```jsx
   await fetch(`/api/support/conversations/${id}`, {
     method: 'PATCH',
     body: JSON.stringify({
       status: 'closed',
       notes: 'Issue resolved via email'
     })
   });
   ```

4. **View analytics**:
   ```jsx
   const analytics = await fetch('/api/support/analytics?days=30');
   ```

## Deployment

The backend changes have been added to the codebase. To deploy:

1. **SSH into the server**:
   ```bash
   ssh -i "C:\Users\HP Elitebook\.ssh\rezvo_rsa" root@178.128.33.73
   ```

2. **Pull latest code**:
   ```bash
   cd /opt/rezvo
   git pull origin main
   ```

3. **Restart the backend**:
   ```bash
   systemctl restart rezvo-backend
   ```

4. **Verify the endpoints**:
   ```bash
   curl http://localhost:8000/docs
   ```

   You should see the new `/api/support/*` endpoints in the Swagger docs.

## MongoDB Indexes (Recommended)

For better performance, create indexes:

```javascript
// In MongoDB shell or via script
db.support_conversations.createIndex({ "created_at": -1 });
db.support_conversations.createIndex({ "status": 1, "created_at": -1 });
db.support_conversations.createIndex({ "escalated": 1, "created_at": -1 });
db.support_messages.createIndex({ "conversation_id": 1, "created_at": 1 });
```

## Security Considerations

### Current Setup (Frontend calls Anthropic directly)
- ✅ Simple to implement
- ❌ API key exposed in frontend code
- ❌ No rate limiting
- ❌ User can bypass ticket logging

### Recommended Setup (Proxy through backend)
Add a new endpoint:

```python
@router.post("/chat")
async def chat_proxy(message: str, conversation_id: str):
    """Proxy to Anthropic API with rate limiting."""
    # Call Anthropic API server-side
    # Log to database
    # Return response
```

This keeps the API key secure and adds rate limiting.

## Testing

Test the endpoints:

```bash
# Start a conversation
curl -X POST http://localhost:8000/api/support/conversations \
  -H "Content-Type: application/json" \
  -d '{"source":"web","page_url":"https://rezvo.co.uk/pricing"}'

# Log a message (replace {id} with conversation ID from above)
curl -X POST http://localhost:8000/api/support/conversations/{id}/messages \
  -H "Content-Type: application/json" \
  -d '{
    "user_message": "How do payments work?",
    "assistant_message": "Rezvo uses Stripe Connect...",
    "input_tokens": 20,
    "output_tokens": 50,
    "is_escalation": false
  }'

# Get analytics
curl http://localhost:8000/api/support/analytics?days=7
```

## Next Steps

1. ✅ Backend API is ready
2. ⬜ Update frontend chat component with logging
3. ⬜ Build admin dashboard for viewing tickets
4. ⬜ Create MongoDB indexes for performance
5. ⬜ (Optional) Proxy Anthropic calls through backend for security
6. ⬜ (Optional) Add rate limiting per user/IP
7. ⬜ (Optional) Email notifications when tickets are escalated
