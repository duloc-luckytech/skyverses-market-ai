# Paperclip AI Agents — Quick Start Development Guide

**5-minute onboarding for new developers**

---

## 🎯 The System in 60 Seconds

Paperclip is a **multi-agent orchestration platform** where:

1. **User enters task** → "Write 3 SEO blog posts"
2. **CEO Agent** routes to best department (Marketing AI)
3. **Marketing Agent** uses Claude (Sonnet/Opus) + specialized skills (SEO Expert, Copywriter, etc.)
4. **Real-time streaming** displays character-by-character output
5. **Cost tracking** monitors spend against budget limit
6. **Canvas View** orchestrates all 4 departments in parallel + CEO summary

**Tech Stack:** React + TypeScript + Framer Motion + Claude API (via proxy)

---

## 📁 Key Files to Know

```
/components/
  ├── PaperclipAIAgentsWorkspace.tsx       [4045 lines] ← Main component
  ├── PaperclipAIAgentsWizard.tsx          [372 lines]  ← Onboarding flow
  └── workspace/
      └── AISuggestPanel.tsx               [AI suggestions UI]

/apis/
  ├── paperclipProjects.ts                 [165 lines] ← Backend CRUD
  └── aiCommon.ts                          [238 lines] ← Helper functions

/pages/images/
  └── PaperclipAIAgents.tsx                [63 lines] ← Landing page
```

**Rule of thumb:** 95% of changes go in `PaperclipAIAgentsWorkspace.tsx`

---

## 🛠️ Common Tasks & Solutions

### Task: Add a new skill to Marketing agent
**File:** `PaperclipAIAgentsWorkspace.tsx` line 53  
**Action:** Add entry to `DEPT_SKILLS.marketing[]`  
**Example:**
```typescript
{ id: 'voice-branding', label: '🎤 Voice Branding', rule: 'Every piece maintains consistent brand voice and tone...' }
```
**Test:** Workspace → Marketing AI → Setup tab → see new checkbox

---

### Task: Add a new department (e.g., "Finance AI")
**File:** `PaperclipAIAgentsWorkspace.tsx`  
**Changes needed:**
1. Line 10: Import icon from lucide-react
2. Line 86: Add to DEPARTMENTS array
3. Line 47: Add to DEPT_SKILLS
4. Line 86 (CEO): Add to subordinates array
5. Line 144 (optional): Add task template

---

### Task: Change model from Sonnet to Opus
**File:** `PaperclipAIAgentsWorkspace.tsx` line 692  
**Action:**
```typescript
const [activeModel, setActiveModel] = useState(LLM_MODELS[1].id); // ← Change 0 to 1
```

---

### Task: Adjust budget limit slider range
**File:** `PaperclipAIAgentsWizard.tsx` line 191  
**Action:**
```typescript
<input
  type="range"
  min={1}
  max={20}      // ← Change this number
  step={1}
  ...
/>
```

---

### Task: Modify cost estimation
**File:** `PaperclipAIAgentsWorkspace.tsx` line 1242  
**Current formula:**
```typescript
const inRate  = isOpus ? 0.000015 : 0.000003;   // $ per input token
const outRate = isOpus ? 0.000075 : 0.000015;  // $ per output token
taskCost = parseFloat((inTokens * inRate + outTokens * outRate).toFixed(4));
```
**To update:** Change the rates (based on current Claude pricing)

---

### Task: Change default agent from Marketing to DevOps
**File:** `PaperclipAIAgentsWorkspace.tsx` line 691  
**Action:**
```typescript
const [activeDept, setActiveDept] = useState(DEPARTMENTS[2].id); // ← 0=CEO, 1=Marketing, 2=DevOps, ...
```

---

### Task: Adjust streaming speed
**File:** `PaperclipAIAgentsWorkspace.tsx` line 216  
**Current:** 6 chars per frame at 60fps = ~360 chars/sec  
**To make faster:** Increase `CHARS_PER_FRAME`
```typescript
const CHARS_PER_FRAME = 6;  // ← Increase to 12 for 2x speed
```

---

### Task: Add project persistence
**File:** `PaperclipAIAgentsWorkspace.tsx` line 1263  
**Already implemented!**
```typescript
if (isAuthenticated && activeProjectId) {
  projectsApi.appendTaskResult(activeProjectId, {...})
}
```
The system automatically syncs to backend + localStorage

---

## 🔍 Where Things Happen

| Feature | Location |
|---------|----------|
| Task execution | `executeRun()` line 1140 |
| Multi-agent canvas | `runCanvasFlow()` line 1350 |
| Cost calculation | `executeRun()` line 1242 |
| Conversation memory | `saveThread()` line 985 |
| System prompt building | `buildSystemMessage()` in aiCommon.ts |
| Skill filtering | `toggleSkill()` line 1001 |
| Project management | `handleSwitchProject()` line 1014 |
| Streaming output | `aiChatStreamViaProxy()` line 1214 |

---

## 📊 State Structure (Mental Model)

```
PaperclipAIAgentsWorkspace Component
├── View State
│   ├── viewMode: 'studio' | 'history' | 'analytics' | 'canvas'
│   ├── activeRightTab: 'output' | 'log' | 'prompt' | 'setup' | 'chat'
│   └── advancedMode: boolean
├── Agent Config
│   ├── activeDept: string (e.g., 'marketing')
│   ├── activeModel: string (e.g., 'claude-sonnet')
│   ├── agentBriefs: { [deptId]: string }  ← Company context per agent
│   └── enabledSkills: { [deptId]: string[] }  ← Selected skill IDs
├── Task Execution
│   ├── taskPrompt: string
│   ├── isRunning: boolean
│   ├── currentResult: TaskResult | null
│   └── taskHistory: TaskResult[]
├── Budget Tracking
│   ├── budgetLimit: number
│   ├── spentBudget: number
│   └── totalTokens: number
├── Conversation Memory
│   └── conversationThreads: { [deptId]: ChatMessage[] }
├── Canvas Multi-Agent
│   ├── canvasNodes: CanvasNodeState[]
│   └── canvasReport: { status, output }
└── UI State
    ├── activityLogs: ActivityLog[]
    ├── showAISuggest: boolean
    ├── isStreaming: boolean
    └── ... 20 more flags
```

---

## 🧪 Testing a New Feature

```typescript
// 1. Add state
const [myNewFeature, setMyNewFeature] = useState<MyType>(defaultValue);

// 2. Create handlers/callbacks with useCallback
const handleMyAction = useCallback(() => {
  // Update state
  setMyNewFeature(newValue);
  // Log activity
  addLog('My Agent', 'Did something', 'success', '#color');
}, [dependencies]);

// 3. Add UI button/input
<button onClick={handleMyAction}>My Action</button>

// 4. Test in browser
// - Workspace loads
// - Click button
// - See activity log update
// - Check localStorage (DevTools → Application → Local Storage)

// 5. Deploy
// - Push to GitHub
// - Vercel auto-deploys
```

---

## ⚠️ Common Mistakes

### ❌ Forgetting useCallback dependencies
```typescript
const handleRun = useCallback(async () => {
  await executeRun(); // ← Missing executeRun in dependencies!
}, [taskPrompt]); // Should include executeRun
```

### ❌ Not persisting to both localStorage AND backend
```typescript
// ❌ Bad — only saves locally
localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

// ✅ Good — saves to both
localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
if (isAuthenticated && activeProjectId) {
  projectsApi.saveData(activeProjectId, data).catch(() => {});
}
```

### ❌ Modifying state without loading from storage first
```typescript
// ❌ Bad — ignores persisted data
const [taskHistory, setTaskHistory] = useState([]);

// ✅ Good — loads from storage on mount
const [taskHistory, setTaskHistory] = useState<TaskResult[]>(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
});
```

### ❌ Streaming without AbortController
```typescript
// ❌ Bad — can't stop stream
await aiChatStreamViaProxy([...]);

// ✅ Good — can be canceled
abortRef.current = new AbortController();
await aiChatStreamViaProxy([...], callback, abortRef.current.signal);
// Later: abortRef.current.abort();
```

---

## 🚀 Deployment Checklist

- [ ] No console.log statements left
- [ ] No hardcoded URLs (use environment variables)
- [ ] All API calls go through proxy (no direct API key exposure)
- [ ] Dark mode tested
- [ ] Mobile layout tested (< 768px)
- [ ] Streaming works smoothly
- [ ] Budget tracking is accurate
- [ ] Task history persists after refresh
- [ ] No TypeScript errors: `npm run typecheck`
- [ ] UI looks good: `npm run dev` locally

---

## 📞 Debug Tips

### Check if task executed:
```typescript
// DevTools → Application → Local Storage
// Look for: skyverses_PAPERCLIP-AI-AGENTS_vault
// Should contain task history JSON
```

### Check if streaming works:
```typescript
// In browser console:
// Stream should call onToken callback ~every 50ms
// Check network tab → see POST /api/ai/chat request
```

### Check if cost calculation is correct:
```typescript
// After task completes, check currentResult:
console.log(currentResult.cost, currentResult.tokens);

// Formula: tokens = (output.length / 4) + overhead
// Cost = (inTokens * rate) + (outTokens * rate)
```

### Reset all data:
```typescript
// Browser console:
localStorage.clear();
location.reload();
```

---

## 📚 Learn More

- **Architecture details:** See `PAPERCLIP_AI_AGENTS_DEVELOPMENT_ROADMAP.md`
- **Code examples:** See `PAPERCLIP_IMPLEMENTATION_EXAMPLES.md`
- **API reference:** See `apis/paperclipProjects.ts`
- **Claude API docs:** anthropic.com/docs

---

## ✅ Your First Task

**Beginner:** Add a new skill to the DevOps agent
1. Open `PaperclipAIAgentsWorkspace.tsx`
2. Find line 59-64 (devops skills section)
3. Add: `{ id: 'monitoring', label: '📡 Monitoring', rule: 'Every deploy must include monitoring/alerting setup.' }`
4. Save
5. Test in workspace

**Time:** ~2 minutes  
**Difficulty:** ⭐☆☆☆☆

---

**That's it! You're ready to develop.** 🚀
