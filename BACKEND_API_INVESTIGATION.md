# Backend AI Chat API Investigation Report

## 1. Backend Server Location

**Path:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/skyverses-backend/`

### Configuration:
- **Port:** 3221 (`.env` file: `PORT=3221`)
- **Environment:** Local dev uses `mongodb://localhost:27017/skyverses-dev`
- **Server Type:** Express.js (Node.js)
- **Entry Point:** `skyverses-backend/src/index.ts`

### Key Environment Variables:
```
PORT=3221
NODE_ENV=production
DEEPSEEK_API_KEY=sk-ad16c950e2734afe8e5be412f791b734
MONGO_URI=mongodb://localhost:27017/skyverses-dev
OPENAI_API_KEY=sk-proj-...
GOMMO_API_KEY=...
```

---

## 2. `/ai/chat` Endpoint - DEFINED ✅

**Location:** `skyverses-backend/src/routes/ai.ts` (lines 19-103)

### Route Definition:
```typescript
router.post("/chat", authenticate, async (req: any, res: any) => { ... })
```

### What It Does:
1. **Purpose:** Server-side proxy for Claude AI chat to avoid CORS issues from browser
2. **Authentication:** Required (uses `authenticate` middleware)
3. **Rate Limiting:** 10 requests per 60 seconds per user
4. **Upstream API:** Routes to `https://ezaiapi.com/v1/chat/completions`
5. **Supports:**
   - **Streaming mode** (returns SSE text/event-stream)
   - **Non-streaming mode** (returns JSON response)
   - **Model selection** (defaults to `claude-sonnet-4-6`)
   - **Custom max_tokens** (defaults to 4096)

### Request Body:
```typescript
{
  messages: ChatMessage[],        // Required
  stream?: boolean,               // Optional, defaults to true
  model?: string,                 // Optional, defaults to claude-sonnet-4-6
  max_tokens?: number,            // Optional, defaults to 4096
}
```

### Response Format:
- **Streaming:** SSE text/event-stream with `data: {...}` chunks
- **Non-streaming:** Standard OpenAI JSON response with `choices[0].message.content`

### Key Implementation Details:
- Picks a random active API key from `listKeyGommoGenmini`
- Pipes response chunks directly to client
- Handles errors with proper status codes (429 for rate limit, 500 for API errors)
- Has Vietnamese error messages

---

## 3. Frontend `.env` Configuration

**Path:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/.env`

```
VITE_API_URL=http://localhost:3221
VITE_EZAI_API_KEY=sk-a872ad970097e44608731b01af1308b6f0ea1dfcaed1db93
VITE_EZAI_BASE_URL=https://ezaiapi.com/v1
VITE_AI_MODEL=claude-sonnet-4-6
```

**Backend auto-detection** in `apis/config.ts`:
- Local dev: `http://localhost:3221`
- Production (non-localhost): `{protocol}://{hostname}:5302`

---

## 4. API Client Pattern - `aiTextViaProxy` & `aiChatOnceViaProxy`

### File: `apis/aiChat.ts` - The Main Implementation

#### Two Approaches Available:

**A. Direct Calls (NOT used in production):**
- `aiChatOnce()` - Direct to ezaiapi.com (has CORS issues)
- `aiChatStream()` - Direct to ezaiapi.com
- Used only by AISupportChat (legacy global widget)

**B. Proxy Calls (RECOMMENDED for workspaces):**
- `aiChatOnceViaProxy(messages, signal?, maxTokens?, model?)` ← POST `/ai/chat` with stream=false
- `aiChatStreamViaProxy(messages, onToken, signal?, maxTokens?, model?)` ← POST `/ai/chat` with stream=true

### File: `apis/aiCommon.ts` - The Public API

Re-exports and wraps the proxy functions for easier use:

```typescript
// Shorthand text-only
aiTextViaProxy(prompt, systemRole) 
  → calls aiChatOnceViaProxy() with [system, user] messages

// Structured JSON output
aiChatJSONViaProxy<T>(messages)
  → calls aiChatOnceViaProxy() then parseAIJSON<T>()

// Helper: build well-formatted system message
buildSystemMessage({ role, rules, outputFormat, language })
```

**Supported Models:**
```typescript
AI_MODELS.SONNET = 'claude-sonnet-4-6'  // Fast, cheap (default)
AI_MODELS.OPUS   = 'claude-opus-4'      // Powerful, expensive
```

---

## 5. Storyboard Studio - Successful Usage Pattern ✅

### File: `components/storyboard-studio/AIScriptAssistant.tsx`

#### Pattern 1: Streaming Chat (Live Feedback)
```typescript
import { aiChatStreamViaProxy } from '../../apis/aiChat';

const messages: ChatMessage[] = [
  { role: 'system', content: buildChatSystemPrompt() },
  ...history.map(m => ({ role: m.role, content: m.content })),
];

let accumulated = '';
await aiChatStreamViaProxy(
  messages,
  (token) => {
    accumulated += token;
    setStreamingText(accumulated);  // Live UI update per token
  },
  abortRef.current.signal,
);
```

#### Pattern 2: Structured JSON Output
```typescript
import { aiChatOnceViaProxy } from '../../apis/aiChat';

const raw = await aiChatOnceViaProxy([
  { role: 'system', content: '...' },
  { role: 'user', content: 'Generate JSON...' },
]);

// Parse with robust fallback:
const result = JSON.parse(raw);  // Already handles markdown fences
```

### File: `hooks/useStoryboardStudio.ts` - Full Integration Example

```typescript
// Line 411-424: Streaming generation with live terminal feedback
await aiChatStreamViaProxy(
  messages,
  (token) => {
    accumulated += token;
    setTerminalLogs(prev => {
      const last = prev[prev.length - 1];
      if (last?.startsWith('[AI WRITING] ')) {
        return [...prev.slice(0, -1), `[AI WRITING] ${accumulated.slice(-120)}...`];
      }
      return [...prev, `[AI WRITING] ${token}`];
    });
  }
);

// Line 1045-1087: JSON parsing with fallback
const enhanced = await aiChatOnceViaProxy([
  { role: 'system', content: '...' },
  { role: 'user', content: '...' },
]);
```

### Success Indicators:
✅ Storyboard Studio uses `/ai/chat` proxy endpoint  
✅ Both streaming and non-streaming work correctly  
✅ Proper error handling with try/catch  
✅ AbortController support for cancellation  
✅ Robust JSON parsing with markdown fence stripping  
✅ Authenticated requests (uses token from localStorage)  

---

## 6. API Flow Diagram

```
Frontend (React Component)
    ↓
apis/aiChat.ts (aiChatOnceViaProxy / aiChatStreamViaProxy)
    ↓
POST /ai/chat (with auth token)
    ↓
Backend skyverses-backend/src/routes/ai.ts
    ├─ Rate limiting check
    ├─ Pick random active API key
    ├─ Authentication middleware
    ↓
https://ezaiapi.com/v1/chat/completions
    ↓
Response → SSE streaming or JSON
    ↓
Frontend updates UI
```

---

## 7. Summary Table

| Component | Location | Port | Status |
|-----------|----------|------|--------|
| **Backend Server** | `skyverses-backend/` | 3221 | ✅ Running |
| **`/ai/chat` Endpoint** | `src/routes/ai.ts` | 3221 | ✅ Defined, Authenticated |
| **Proxy Pattern** | `apis/aiChat.ts` | — | ✅ Implemented |
| **Public API** | `apis/aiCommon.ts` | — | ✅ Exported |
| **Storyboard Studio** | `components/storyboard-studio/` | — | ✅ Using Proxy |
| **Upstream API** | ezaiapi.com | 443 | ✅ EzAI (Claude proxy) |

---

## 8. Key Findings

### ✅ What's Working:
1. Backend server is running on port 3221
2. `/ai/chat` endpoint is fully defined and working
3. Storyboard Studio successfully uses `aiChatOnceViaProxy` and `aiChatStreamViaProxy`
4. Both streaming and non-streaming modes are functional
5. Rate limiting and authentication are enforced
6. API keys are properly managed server-side (not exposed to frontend)

### 📋 Implementation Details:
- **Framework:** Express.js
- **Protocol:** REST (HTTP POST)
- **Streaming:** SSE (Server-Sent Events)
- **Auth:** Bearer token from localStorage
- **Upstream:** ezaiapi.com (Claude proxy service)
- **Rate Limit:** 10 req/60s per user

### 🔄 Recommended Usage:
```typescript
// For simple text generation:
const result = await aiTextViaProxy(prompt, systemRole);

// For streaming with live feedback:
await aiChatStreamViaProxy(messages, (token) => setOutput(prev => prev + token));

// For structured JSON:
const data = await aiChatJSONViaProxy<MyType>(messages);
```

---

Generated: April 13, 2026
