# AI Support Bot — Improvements Applied

## Overview

Updated the AI Support Bot backend to use a **cleaner, role-based message structure** inspired by your SQLAlchemy models, while keeping the MongoDB implementation.

## Key Improvements

### 1. **Role-Based Message Structure** ✅

**Before (old):**
```json
{
  "user_message": "How do payments work?",
  "assistant_message": "Rezvo uses Stripe Connect...",
  "input_tokens": 25,
  "output_tokens": 60
}
```

**After (new):**
```json
// User message
{
  "role": "user",
  "content": "How do payments work?",
  "input_tokens": 25,
  "output_tokens": 0
}

// Assistant message
{
  "role": "assistant",
  "content": "Rezvo uses Stripe Connect...",
  "input_tokens": 0,
  "output_tokens": 60
}
```

**Benefits:**
- Cleaner separation of concerns
- Easier to display conversation threads
- Matches industry-standard chat APIs (OpenAI, Anthropic, etc.)
- Better for building chat UIs

### 2. **Enhanced Conversation Model** ✅

Added fields inspired by your SQLAlchemy design:

| Field | Type | Purpose |
|-------|------|---------|
| `user_agent` | string | Browser/device info (auto-captured from headers) |
| `business_id` | string | Link to businesses table (if user owns a business) |
| `escalation_reason` | string | Why the bot escalated ("Bot unable to resolve issue") |
| `summary` | string | Auto-generated from first user message (first 255 chars) |
| `closed_at` | datetime | When ticket was closed (set automatically on status=closed) |

### 3. **Auto-Summary Generation** ✅

First user message is automatically saved as the conversation summary:

```json
{
  "summary": "How do payments work?",
  "message_count": 4,
  "status": "needs_review"
}
```

Perfect for showing ticket previews in admin dashboards.

### 4. **Backward Compatibility** ✅

The code handles both old and new message formats gracefully:
- Old messages (with `user_message`/`assistant_message`) are converted on-the-fly
- New messages use `role`/`content` structure
- No data migration required!

### 5. **User Agent Tracking** ✅

Automatically captures browser/device info from HTTP headers:

```json
{
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "source": "web",
  "page_url": "https://rezvo.co.uk/pricing"
}
```

Helpful for debugging device-specific issues.

## API Changes

### Creating a Conversation (No Breaking Changes)

```javascript
// Before (still works)
POST /api/support/conversations
{
  "source": "web",
  "page_url": "https://rezvo.co.uk/pricing"
}

// After (with new optional fields)
POST /api/support/conversations
{
  "source": "web",
  "page_url": "https://rezvo.co.uk/pricing",
  "user_agent": "Mozilla/5.0...",  // optional
  "user_id": "user-123",             // optional
  "business_id": "biz-456"           // optional
}
```

### Logging Messages (Breaking Change - Use New Format)

**Old format (deprecated):**
```javascript
POST /api/support/conversations/{id}/messages
{
  "user_message": "How do payments work?",
  "assistant_message": "Rezvo uses Stripe...",
  "input_tokens": 25,
  "output_tokens": 60,
  "is_escalation": false
}
```

**New format (use this):**
```javascript
// Log user message
POST /api/support/conversations/{id}/messages
{
  "role": "user",
  "content": "How do payments work?",
  "input_tokens": 25,
  "output_tokens": 0,
  "is_escalation": false
}

// Log assistant response
POST /api/support/conversations/{id}/messages
{
  "role": "assistant",
  "content": "Rezvo uses Stripe Connect...",
  "input_tokens": 0,
  "output_tokens": 60,
  "is_escalation": false
}
```

### Updating Conversations (New Fields Available)

```javascript
PATCH /api/support/conversations/{id}
{
  "status": "closed",                          // NEW: auto-sets closed_at
  "escalation_reason": "Payment issue",         // NEW
  "notes": "Resolved via email",
  "assigned_to": "staff-user-id"
}
```

## Frontend Integration Updates

### Updated Helper Function

```jsx
async function logMessage(convId, userText, botText, inputTokens, outputTokens, isEscalation) {
  if (!convId) return;
  
  try {
    // Log user message
    await fetch(`${API_BASE}/api/support/conversations/${convId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "user",
        content: userText,
        input_tokens: inputTokens,
        output_tokens: 0,
        is_escalation: false,
      }),
    });
    
    // Log assistant response
    await fetch(`${API_BASE}/api/support/conversations/${convId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "assistant",
        content: botText,
        input_tokens: 0,
        output_tokens: outputTokens,
        is_escalation: isEscalation,
      }),
    });
  } catch (err) {
    console.warn("Could not log support messages:", err);
  }
}
```

## Database Schema

### MongoDB Collections

**support_conversations:**
```javascript
{
  "_id": ObjectId,
  "source": "web",
  "page_url": "https://rezvo.co.uk/pricing",
  "user_agent": "Mozilla/5.0...",
  "user_id": "user-123",               // NEW
  "business_id": "biz-456",            // NEW
  "status": "needs_review",
  "escalated": true,
  "escalation_reason": "Bot unable to resolve issue",  // NEW
  "summary": "How do payments work?",  // NEW (auto-generated)
  "message_count": 4,
  "total_input_tokens": 45,
  "total_output_tokens": 105,
  "estimated_cost_usd": 570,
  "assigned_to": null,
  "notes": null,
  "created_at": ISODate,
  "updated_at": ISODate,
  "closed_at": ISODate                 // NEW (set when status=closed)
}
```

**support_messages:**
```javascript
{
  "_id": ObjectId,
  "conversation_id": "conv-id",
  "role": "user",                      // "user" or "assistant"
  "content": "How do payments work?",
  "input_tokens": 25,
  "output_tokens": 0,
  "is_escalation": false,
  "created_at": ISODate
}
```

## Testing

All endpoints tested and verified:

```bash
✅ POST /api/support/conversations (with user_agent capture)
✅ POST /api/support/conversations/{id}/messages (role-based)
✅ PATCH /api/support/conversations/{id} (with closed_at)
✅ GET /api/support/conversations (with new fields)
✅ GET /api/support/tickets (with backward compatibility)
✅ GET /api/support/analytics (updated for role-based messages)
```

### Test Results

```json
{
  "id": "6998e717ed7c35a463e2cb9a",
  "source": "web",
  "page_url": "https://rezvo.co.uk/pricing",
  "user_agent": "curl/7.81.0",
  "status": "needs_review",
  "escalated": true,
  "escalation_reason": "Bot unable to resolve issue",
  "summary": "How do payments work?",
  "message_count": 4,
  "total_input_tokens": 45,
  "total_output_tokens": 105,
  "estimated_cost_usd": 0.00057,
  "messages": [
    {
      "role": "user",
      "content": "How do payments work?",
      "input_tokens": 25,
      "output_tokens": 0
    },
    {
      "role": "assistant",
      "content": "Rezvo uses Stripe Connect...",
      "input_tokens": 0,
      "output_tokens": 60,
      "is_escalation": false
    },
    {
      "role": "user",
      "content": "I need help with my account",
      "input_tokens": 20,
      "output_tokens": 0
    },
    {
      "role": "assistant",
      "content": "For account-specific issues, please email support@rezvo.co.uk...",
      "input_tokens": 0,
      "output_tokens": 45,
      "is_escalation": true
    }
  ]
}
```

## Migration Notes

### No Database Migration Required! ✅

The code is **fully backward-compatible**:
- Old messages with `user_message`/`assistant_message` are automatically converted
- New messages use `role`/`content`
- Both formats work side-by-side
- Gradual migration happens as new conversations are created

### Frontend Migration Required

Update your chat widget to use the new message format:

1. **Before:**
   - One API call per Q&A pair
   - Both user and assistant message in single request

2. **After:**
   - Two API calls per Q&A pair
   - Separate user message and assistant response

## Benefits of New Design

1. **Cleaner Code**: Separation of user/assistant messages
2. **Better UX**: Easier to build chat interfaces
3. **More Flexible**: Can add system messages, function calls, etc.
4. **Standards-Aligned**: Matches OpenAI/Anthropic chat formats
5. **Better Analytics**: Track user questions separately from bot responses
6. **Auto-Summary**: First message becomes ticket preview
7. **Better Tracking**: User agent, business links, escalation reasons
8. **Auto-Timestamps**: Closed_at set automatically

## Performance Tips

### Recommended MongoDB Indexes

```javascript
// For faster queries
db.support_conversations.createIndex({ "created_at": -1 });
db.support_conversations.createIndex({ "status": 1, "created_at": -1 });
db.support_conversations.createIndex({ "escalated": 1, "created_at": -1 });
db.support_conversations.createIndex({ "user_id": 1, "created_at": -1 });
db.support_conversations.createIndex({ "business_id": 1, "created_at": -1 });
db.support_messages.createIndex({ "conversation_id": 1, "created_at": 1 });
db.support_messages.createIndex({ "role": 1, "created_at": -1 });
```

## What's Next?

1. ✅ Backend with improved models — **DONE**
2. ✅ Backward compatibility — **DONE**
3. ✅ Testing and verification — **DONE**
4. ⬜ Update frontend chat widget to use new format
5. ⬜ Build admin dashboard for viewing tickets
6. ⬜ Add MongoDB indexes for performance
7. ⬜ Optional: Proxy Anthropic calls through backend for security

## Files Changed

- `backend/models/support.py` — Updated models with new fields
- `backend/routes/support.py` — Role-based messages + backward compatibility
- `test-support-api.sh` — Updated test script

## Deployment

All changes are **live on production**:
- Server: `178.128.33.73` (rezvo.co.uk)
- API: `https://api.rezvo.co.uk`
- Docs: `https://api.rezvo.co.uk/api/docs`

---

**Summary**: Your SQLAlchemy model design was excellent! I've adapted those improvements to work with MongoDB while keeping the codebase consistent with the existing FastAPI + Motor + Pydantic architecture. The system is now more robust, easier to use, and follows industry best practices. 🚀
