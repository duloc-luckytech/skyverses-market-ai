# Backend Investigation Documentation - Complete Index

This directory contains comprehensive documentation of the backend AI Chat API structure and usage patterns. Generated on April 13, 2026.

---

## 📋 Document Overview

### 1. **BACKEND_API_INVESTIGATION.md** (Main Report)
   - **Purpose:** Comprehensive technical investigation of the backend infrastructure
   - **Contents:**
     - Backend server location and configuration
     - `/ai/chat` endpoint definition and functionality
     - Frontend environment configuration
     - API client patterns (`aiTextViaProxy`, `aiChatOnceViaProxy`)
     - Storyboard Studio usage examples
     - Complete API flow diagram
     - Summary table and key findings
   - **Best for:** Understanding the full architecture and how everything connects

### 2. **BACKEND_INVESTIGATION_SUMMARY.txt** (Quick Reference)
   - **Purpose:** Fast, visual summary of key findings
   - **Contents:**
     - Where is the backend server?
     - Is `/ai/chat` endpoint defined?
     - How does Storyboard Studio use the API?
     - API call pattern flow diagram
     - Configuration summary
     - Key functions to use
   - **Best for:** Quick lookup, onboarding new developers

### 3. **BACKEND_FILE_LOCATION_MAP.txt** (File Structure)
   - **Purpose:** Visual map of all relevant files and folders
   - **Contents:**
     - Backend files structure
     - Frontend files structure
     - API call flow details
     - Request/response examples (streaming and non-streaming)
     - Usage patterns with code
     - Authentication & security details
     - Rate limiting info
     - Monitoring endpoints
   - **Best for:** Finding files, understanding request/response formats

### 4. **AI_CHAT_IMPLEMENTATION_GUIDE.md** (Developer Guide)
   - **Purpose:** Practical implementation guide for new workspaces
   - **Contents:**
     - Quick start copy-paste examples (9 scenarios)
     - Real-world examples from Storyboard Studio
     - Complete component example
     - API reference documentation
     - Troubleshooting guide
     - Best practices (10 recommendations)
   - **Best for:** Implementing AI features in your workspace

---

## 🚀 Quick Start Paths

### I want to...

**Understand the architecture**
→ Read: `BACKEND_API_INVESTIGATION.md` → `BACKEND_INVESTIGATION_SUMMARY.txt`

**Find a specific file**
→ Read: `BACKEND_FILE_LOCATION_MAP.txt`

**Add AI features to my workspace**
→ Read: `AI_CHAT_IMPLEMENTATION_GUIDE.md`

**See request/response formats**
→ Read: `BACKEND_FILE_LOCATION_MAP.txt` (Request/Response Examples section)

**Understand error handling**
→ Read: `AI_CHAT_IMPLEMENTATION_GUIDE.md` (Error Handling Patterns section)

**Set up my environment**
→ Read: `BACKEND_INVESTIGATION_SUMMARY.txt` (Configuration Summary section)

---

## 🎯 Key Findings Summary

✅ **Backend Server Location**
- Path: `skyverses-backend/`
- Port: 3221
- Framework: Express.js

✅ **`/ai/chat` Endpoint Status**
- Location: `skyverses-backend/src/routes/ai.ts` (lines 19-103)
- Status: DEFINED and WORKING
- Features: Streaming, non-streaming, rate limiting, authentication

✅ **Storyboard Studio Integration**
- Status: SUCCESSFULLY using the proxy pattern
- Implementation: `components/storyboard-studio/AIScriptAssistant.tsx`
- Pattern: Both `aiChatStreamViaProxy` and `aiChatOnceViaProxy`

---

## 📚 Document Relationships

```
BACKEND_API_INVESTIGATION.md (Main Reference)
    ├─ High-level architecture overview
    ├─ Detailed /ai/chat specification
    ├─ Frontend configuration details
    └─ API patterns explanation
         │
         ├─→ BACKEND_INVESTIGATION_SUMMARY.txt
         │    └─ Quick visual reference
         │
         ├─→ BACKEND_FILE_LOCATION_MAP.txt
         │    ├─ File organization
         │    ├─ Request/response examples
         │    └─ Configuration details
         │
         └─→ AI_CHAT_IMPLEMENTATION_GUIDE.md
              ├─ Copy-paste ready code
              ├─ Real-world examples
              └─ Troubleshooting
```

---

## 💾 Key Code Locations

| Feature | File | Line |
|---------|------|------|
| **Backend Entry** | skyverses-backend/src/index.ts | — |
| **`/ai/chat` Handler** | skyverses-backend/src/routes/ai.ts | 19-103 |
| **Routes Aggregator** | skyverses-backend/src/routes/index.ts | 45 |
| **API Config** | apis/config.ts | — |
| **Core Implementation** | apis/aiChat.ts | — |
| **Public API** | apis/aiCommon.ts | — |
| **Storyboard Usage** | components/storyboard-studio/AIScriptAssistant.tsx | 20, 166, 200 |
| **Hook Implementation** | hooks/useStoryboardStudio.ts | 2, 411, 623 |

---

## 🔑 API Functions Reference

### Core Functions
- `aiChatOnceViaProxy()` - Single request, full response
- `aiChatStreamViaProxy()` - Streaming response with live tokens
- `aiTextViaProxy()` - Shorthand text generation
- `aiChatJSONViaProxy<T>()` - Structured JSON with types

### Helpers
- `buildSystemMessage()` - Format system prompts
- `parseAIJSON<T>()` - Robust JSON parsing

### Constants
- `AI_MODELS.SONNET` - Fast, cheap, default
- `AI_MODELS.OPUS` - Powerful, expensive

---

## 📊 Configuration Files

**Frontend:**
- `.env` - `VITE_API_URL=http://localhost:3221`

**Backend:**
- `skyverses-backend/.env` - `PORT=3221`, database, API keys

**Auto-detection:**
- `apis/config.ts` - Detects local vs production

---

## 🔄 API Flow

```
Frontend Component
    ↓
aiChatOnceViaProxy() / aiChatStreamViaProxy()
    ↓
POST /ai/chat (with auth token)
    ↓
Backend (rate limit, auth, key selection)
    ↓
EzAI API (https://ezaiapi.com/v1/chat/completions)
    ↓
Response (SSE stream or JSON)
    ↓
Frontend displays result
```

---

## ✅ Verification Checklist

- [x] Backend server is running on port 3221
- [x] `/ai/chat` endpoint is defined and authenticated
- [x] Storyboard Studio successfully uses proxy functions
- [x] Both streaming and non-streaming modes work
- [x] Rate limiting is enforced (10 req/60s)
- [x] API keys are server-side managed
- [x] Environment configuration is correct
- [x] Error handling is implemented

---

## 🚨 Common Issues & Solutions

| Issue | Solution | Reference |
|-------|----------|-----------|
| API not responding | Check backend on port 3221 | `BACKEND_INVESTIGATION_SUMMARY.txt` |
| 429 rate limit error | Wait before retrying | `AI_CHAT_IMPLEMENTATION_GUIDE.md` |
| 401 auth error | Re-login user | `BACKEND_FILE_LOCATION_MAP.txt` |
| JSON parse error | Use `parseAIJSON()` | `AI_CHAT_IMPLEMENTATION_GUIDE.md` |
| Empty response | Check system prompt | `BACKEND_FILE_LOCATION_MAP.txt` |

---

## 📞 Support Resources

**In Codebase:**
- Storyboard Studio: Working reference implementation
- AIScriptAssistant: Chat UI example
- useStoryboardStudio: Hook integration pattern

**In Documentation:**
- Implementation guide has 9 copy-paste examples
- Complete component example included
- Troubleshooting section with 5 common issues

---

## 📝 Document Metadata

- **Generated:** April 13, 2026
- **Project:** Skyverses AI Market
- **Backend Version:** Express.js
- **Frontend Framework:** React + TypeScript
- **AI Provider:** EzAI (Claude proxy)
- **Rate Limit:** 10 requests / 60 seconds

---

## 📖 How to Use These Documents

1. **First Time?** → Start with `BACKEND_INVESTIGATION_SUMMARY.txt`
2. **Understanding Architecture?** → Read `BACKEND_API_INVESTIGATION.md`
3. **Finding Files?** → Use `BACKEND_FILE_LOCATION_MAP.txt`
4. **Implementing Features?** → Follow `AI_CHAT_IMPLEMENTATION_GUIDE.md`
5. **Need Code Examples?** → Check `AI_CHAT_IMPLEMENTATION_GUIDE.md` (9 examples)

---

## 🎓 Learning Path

**Beginner:**
1. Read BACKEND_INVESTIGATION_SUMMARY.txt (5 min)
2. Check "I want to..." section above (2 min)
3. Look at Simple text generation example (5 min)

**Intermediate:**
1. Read BACKEND_API_INVESTIGATION.md (15 min)
2. Review File Location Map (10 min)
3. Study Storyboard Studio examples (10 min)

**Advanced:**
1. Study all implementation patterns (20 min)
2. Review complete component example (15 min)
3. Check error handling strategies (10 min)

---

**Total Documentation Time:** 30-90 minutes depending on depth

Generated: April 13, 2026  
Updated by: AI Investigation Tool
