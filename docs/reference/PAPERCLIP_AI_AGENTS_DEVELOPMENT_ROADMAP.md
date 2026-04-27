# Paperclip AI Agents — Development Roadmap & Architecture Guide

**Last Updated:** April 13, 2026  
**Status:** Production-Ready MVP with 4045 lines of fully-featured React component

---

## 📋 Executive Summary

Paperclip AI Agents is a **multi-agent orchestration system** where a CEO Agent coordinates 4 specialized AI department agents (Marketing, DevOps, Sales, HR). The system includes:

- ✅ **5 Agent Hierarchy**: CEO (orchestrator) + 4 Department Agents with specialized skills
- ✅ **Real-time Streaming**: Character-by-character output via Framer Motion
- ✅ **Budget Guard**: Hard credit limits with automatic enforcement
- ✅ **Canvas View**: Drag-and-drop multi-agent orchestration UI
- ✅ **Conversation Memory**: Thread-based chat history per agent
- ✅ **Project Management**: Full CRUD with task history and analytics
- ✅ **Onboarding Wizard**: 5-step guided setup for new users
- ✅ **Dark Mode**: Full light/dark theme support
- ✅ **Responsive**: Mobile and desktop optimized layouts

---

## 🏗️ Architecture Overview

### Entry Point
**File:** `/pages/images/PaperclipAIAgents.tsx`  
- Landing page with 8 sections (Hero, Workflow, Features, etc.)
- Opens `PaperclipAIAgentsWorkspace` in full-screen modal when user clicks "Try Paperclip"

### Main Workspace Component
**File:** `/components/PaperclipAIAgentsWorkspace.tsx` (4045 lines)

#### Core State Management (Key useState Hooks)
```typescript
// View & UI State
const [viewMode, setViewMode] = useState<'studio' | 'history' | 'analytics' | 'canvas'>('studio');
const [activeRightTab, setActiveRightTab] = useState<'output' | 'log' | 'prompt' | 'setup' | 'chat'>('output');

// Agent Configuration
const [activeDept, setActiveDept] = useState(DEPARTMENTS[1].id); // 'marketing'
const [activeModel, setActiveModel] = useState(LLM_MODELS[0].id); // Sonnet
const [agentBriefs, setAgentBriefs] = useState<Record<string, string>>({}); // per-agent context
const [enabledSkills, setEnabledSkills] = useState<Record<string, string[]>>({}); // per-agent skill toggles

// Task Execution
const [taskPrompt, setTaskPrompt] = useState('');
const [isRunning, setIsRunning] = useState(false);
const [currentResult, setCurrentResult] = useState<TaskResult | null>(null);
const [taskHistory, setTaskHistory] = useState<TaskResult[]>([]);

// Budget Tracking
const [budgetLimit, setBudgetLimit] = useState(5.0);
const [spentBudget, setSpentBudget] = useState(0);
const [totalTokens, setTotalTokens] = useState(0);

// Project Management
const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
const [projects, setProjects] = useState<PaperclipProjectSummary[]>([]);

// Canvas Multi-Agent Flow
const [canvasNodes, setCanvasNodes] = useState<CanvasNodeState[]>([]);
const [canvasReport, setCanvasReport] = useState<{ status: 'idle' | 'running' | 'done'; output: string }>({ status: 'idle', output: '' });

// Conversation Threads (per-agent memory)
const [conversationThreads, setConversationThreads] = useState<Record<string, ChatMessage[]>>({});

// Queue & Automation
const [taskQueue, setTaskQueue] = useState<QueuedTask[]>([]);

// Advanced Mode
const [advancedMode, setAdvancedMode] = useState<boolean>(false);
const [editedSystemPrompt, setEditedSystemPrompt] = useState<string>('');
```

#### Constants Defined
```typescript
// Agent Departments (5 total)
const DEPARTMENTS = [
  { id: 'ceo', label: 'CEO Agent', icon: Building2, color: '#0090ff', tier: 'orchestrator', subordinates: ['marketing', 'devops', 'sales', 'hr'] },
  { id: 'marketing', label: 'Marketing AI', icon: Megaphone, color: '#8b5cf6', tier: 'department', tasks: [...] },
  { id: 'devops', label: 'DevOps AI', icon: Code2, color: '#10b981', tier: 'department', tasks: [...] },
  { id: 'sales', label: 'Sales AI', icon: BarChart3, color: '#f59e0b', tier: 'department', tasks: [...] },
  { id: 'hr', label: 'HR AI', icon: Users, color: '#06b6d4', tier: 'department', tasks: [...] },
];

// LLM Models Available
const LLM_MODELS = [
  { id: 'claude-sonnet', label: 'Claude Sonnet 4', provider: 'Anthropic', badge: 'Fast & Balanced', apiModel: AI_MODELS.SONNET },
  { id: 'claude-opus',   label: 'Claude Opus 4',   provider: 'Anthropic', badge: 'Most Powerful',   apiModel: AI_MODELS.OPUS },
];

// Skill Presets Per Department (DEPT_SKILLS)
// Example - Marketing AI skills:
const DEPT_SKILLS = {
  marketing: [
    { id: 'seo', label: '🔍 SEO Expert', rule: 'Optimize all content for SEO: target keywords, meta description...' },
    { id: 'copywriter', label: '✍️ Copywriter', rule: 'Apply AIDA framework (Attention, Interest, Desire, Action)...' },
    { id: 'social', label: '📱 Social Media', rule: 'Tailor tone for each platform: LinkedIn (professional), X (concise)...' },
    { id: 'analytics', label: '📈 Analytics', rule: 'Include measurable KPIs and A/B test hypotheses...' },
  ],
  // ... devops, sales, hr, ceo defined similarly
};

// Task Templates
const TASK_TEMPLATES: StylePreset[] = [
  { id: 'blog-seo', label: 'Blog SEO', emoji: '✍️', description: 'Viết 3 blog posts SEO', promptPrefix: 'Viết 3 blog posts SEO tối ưu về chủ đề: ' },
  { id: 'social-batch', label: 'Social Batch', emoji: '📱', description: '30 posts LinkedIn + X', promptPrefix: 'Tạo 30 social media posts cho LinkedIn và X về: ' },
  // ... 4 more templates
];

// Storage Keys
const STORAGE_KEY = 'skyverses_PAPERCLIP-AI-AGENTS_vault';
const THREAD_KEY = (deptId: string) => `${STORAGE_KEY}_thread_${deptId}`;
const BRIEF_KEY = (deptId: string) => `${STORAGE_KEY}_brief_${deptId}`;
const SKILLS_KEY = (deptId: string) => `${STORAGE_KEY}_skills_${deptId}`;
const ACTIVE_PROJECT_KEY = 'skyverses_PAPERCLIP-AI-AGENTS__activeProjectId';
```

---

## 🎯 Core Functions & Workflows

### 1. **executeRun** (Lines 1140–1333)
**Purpose:** Main task execution with streaming AI response

**Flow:**
1. Validate user input & authentication
2. Build system prompt using `buildSystemMessage()` with:
   - Agent role instruction
   - Department context & company brief
   - Enabled skill rules
3. Initialize streaming via `aiChatStreamViaProxy()`:
   - Streams tokens in real-time with onToken callback
   - Appends to conversation thread history
4. Track metrics:
   - Elapsed time (1s updates)
   - Token count (estimated: output.length / 4)
   - Cost estimation (Sonnet: $0.000003 in, $0.000015 out; Opus: $0.000015 in, $0.000075 out)
5. Update state:
   - Save to task history (localStorage + backend API)
   - Append to conversation thread
   - Update budget spent
   - Show success burst animation
6. Auto-execute next queued task if queue exists

**Key Refs:**
- `abortRef.current`: AbortController for canceling mid-stream
- `timerRef.current`, `thinkingTimerRef.current`: Interval IDs for elapsed time & thinking steps

### 2. **runCanvasFlow** (Lines 1350–1538)
**Purpose:** Execute all 4 departments in parallel, collect outputs, generate CEO summary

**Flow:**
1. Validate canvas prompt & abort any previous run
2. Initialize all dept nodes to 'idle'
3. Run all 4 department agents **in parallel** via `Promise.all()`:
   - Each dept gets same brief + prompt, but uses its own system prompt with dept-specific skills
   - Streams output to its canvas node in real-time
4. Once all depts complete → CEO generates executive summary:
   - Takes all 4 dept outputs as context
   - Generates consolidated report
5. Update report node status to 'done'
6. Display full outputs in cards below canvas

**Key Difference from executeRun:**
- Multi-agent parallel execution
- CEO synthesizes final summary
- Visual flow on canvas with status indicators

### 3. **System Prompt Building** (via buildSystemMessage from aiCommon.ts)
**Input:**
```typescript
buildSystemMessage({
  role: 'Bạn là Marketing Agent trong Paperclip AI...',
  rules: [
    'Thực hiện task được giao...',
    'Dùng markdown formatting...',
    // + enabled skill rules dynamically added
  ],
  outputFormat: 'Kết quả phải cụ thể, có thể action được ngay.',
  language: 'vi',
})
```

**Output:**
```
Bạn là Marketing Agent trong Paperclip AI...

RULES:
- Thực hiện task được giao...
- Dùng markdown formatting...
- [enabled skill rules]

OUTPUT FORMAT:
Kết quả phải cụ thể, có thể action được ngay.

LANGUAGE: Respond in Vietnamese
```

---

## 📊 Data Models & Types

### TaskResult
```typescript
interface TaskResult {
  id: string;                    // Date.now().toString()
  dept: string;                  // Agent dept name
  model: string;                 // e.g., "Claude Sonnet 4"
  taskDesc: string;              // User's input prompt
  output: string;                // AI-generated response
  status: 'running' | 'done' | 'error';
  timestamp: string;             // toLocaleString('vi-VN')
  cost: string;                  // "~$0.003"
  tokens?: number;               // Estimated token count
  duration?: string;             // "12.5s"
  systemPrompt?: string;         // Full system prompt used
  confidence?: number;           // 0–100 (future)
  starred?: boolean;             // User-starred tasks
}
```

### ChatMessage
```typescript
type ChatMessage = 
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string };
```

### CanvasNodeState
```typescript
interface CanvasNodeState {
  id: string;                                    // dept ID or 'ceo'
  x: number; y: number;                          // Position on canvas
  status: 'idle' | 'running' | 'done' | 'error';
  output: string;                                // Task output
  streaming: boolean;                            // Currently streaming
}
```

### ActivityLog
```typescript
interface ActivityLog {
  id: string;
  time: string;                 // HH:MM:SS
  agent: string;                // Which agent performed action
  action: string;               // Description of action
  status: 'info' | 'success' | 'warning' | 'running';
  color: string;                // Hex color for UI
}
```

---

## 🎨 UI Components & Layout

### Main Views (via `viewMode` state)
1. **studio** (default)
   - Task prompt input + run button
   - Real-time output streaming
   - Right sidebar with multiple tabs

2. **history**
   - Task history table with search/filter
   - Star/unstar tasks
   - Copy/download results
   - Export JSON

3. **analytics**
   - Budget burn chart
   - Token usage chart
   - Completion rate stats
   - Cost breakdown per dept

4. **canvas**
   - Drag-and-drop multi-agent orchestration
   - CEO → Depts → Summary flow
   - Real-time status indicators & arrows

### Right Sidebar Tabs (`activeRightTab` state)
1. **output** — Current/last task result with streaming
2. **log** — Live activity feed (8 latest entries)
3. **prompt** — System prompt inspector + editor (advanced mode)
4. **setup** — Agent configuration:
   - Per-agent brief (company context)
   - Per-agent skill toggles
5. **chat** — Conversation thread for active agent

### Responsive Design
- **Mobile** (<768px): Collapsible sheets, canvas simplified to cards
- **Desktop** (≥768px): Side-by-side layout, full drag canvas, full activity feed

---

## 💾 Storage Strategy

### LocalStorage Keys
```
skyverses_PAPERCLIP-AI-AGENTS_vault                    // Task history (JSON)
skyverses_PAPERCLIP-AI-AGENTS_vault_thread_[deptId]   // Conversation thread per agent
skyverses_PAPERCLIP-AI-AGENTS_vault_brief_[deptId]    // Agent brief (company context)
skyverses_PAPERCLIP-AI-AGENTS_vault_skills_[deptId]   // Enabled skill IDs per agent
skyverses_PAPERCLIP-AI-AGENTS_budget                   // { spent, tokens }
skyverses_PAPERCLIP-AI-AGENTS_prompts                  // Last 10 prompts
skyverses_PAPERCLIP-AI-AGENTS_queue                    // Queued tasks
skyverses_PAPERCLIP-AI-AGENTS_wizard_done             // Wizard completion flag
skyverses_PAPERCLIP-AI-AGENTS_advanced                 // Advanced mode flag
skyverses_PAPERCLIP-AI-AGENTS__activeProjectId        // Active project ID
skyverses_PAPERCLIP-AI-AGENTS_canvas_nodes            // Canvas node positions
```

### Backend API (via paperclipProjects.ts)
- `listProjects()` — GET /paperclip-projects
- `getProject(id)` — GET /paperclip-projects/:id
- `createProject(name)` — POST /paperclip-projects
- `updateProject(id, updates)` — PATCH /paperclip-projects/:id
- `deleteProject(id)` — DELETE /paperclip-projects/:id
- `saveAgentConfigs(id, configs)` — PUT /paperclip-projects/:id/agents
- `saveThreads(id, threads)` — PUT /paperclip-projects/:id/threads
- `appendTaskResult(id, result)` — POST /paperclip-projects/:id/history

---

## 🚀 Key Features Implementation Details

### 1. Budget Guard
**Location:** Lines 447–473 (BudgetMeter component) + cost tracking in executeRun

**Flow:**
1. User sets `budgetLimit` in wizard or settings
2. After each task:
   - Estimate cost: `taskCost = (inTokens * inRate) + (outTokens * outRate)`
   - Add to `spentBudget`
3. If `spentBudget / budgetLimit > 0.8`:
   - Warn user in activity log
4. If `spentBudget >= budgetLimit`:
   - ⚠️ Hard limit enforced (not yet implemented in UI prevention)

### 2. Real-Time Streaming
**Location:** Lines 1214–1227 (executeRun) + Lines 199–238 (StreamingMarkdownOutput)

**Flow:**
1. `aiChatStreamViaProxy()` calls `onToken` callback for each streamed chunk
2. Token accumulated in `streamedOutput`
3. `setCurrentResult()` updates output state
4. `StreamingMarkdownOutput` component:
   - Uses `requestAnimationFrame` loop
   - Renders `6 chars/frame` (~360 chars/sec at 60fps)
   - Shows blinking cursor during streaming
   - Parses markdown: headers, lists, bold, code blocks with copy buttons

### 3. Conversation Memory (Threads)
**Location:** Lines 985–1020 (saveThread, clearThread, etc.)

**Mechanism:**
- Each agent has its own `conversationThreads[deptId]`
- Capped at `MAX_THREAD_TURNS = 10` (20 messages)
- When user sends new task:
  1. Load agent's thread history
  2. Append system prompt + thread + new user message
  3. Get AI response
  4. Append user + assistant messages to thread
  5. Save thread to localStorage + backend API
- Allows context-aware multi-turn conversations per agent

### 4. Task Queueing
**Location:** Lines 740–756, 1321–1331

**Mechanism:**
- `addToQueue()` adds task to queue
- Queue persisted in localStorage
- After each task completes in `executeRun`:
  ```typescript
  setTaskQueue(prev => {
    if (prev.length === 0) return prev;
    const [next, ...rest] = prev;
    // Auto-execute next task
    setActiveDept(next.dept);
    setTaskPrompt(next.prompt);
    // ... rest will auto-run via handleRun
    return rest;
  });
  ```
- Enables batch automation workflows

### 5. Canvas Drag-and-Drop
**Location:** Lines 3558–3745

**Mechanism:**
1. `<div>` with `onMouseMove`, `onMouseUp`, `onMouseLeave` handlers
2. `dragNode` state tracks which node is being dragged
3. On `onMouseDown`: Record drag offset
4. On `onMouseMove`: Calculate new x, y and update canvasNodes
5. On `onMouseUp`: Persist positions to localStorage
6. SVG arrows dynamically calculated:
   - CEO → Depts
   - Depts → Summary
   - Arrow color = node status (idle=gray, running=blue, done=green, error=red)

### 6. Onboarding Wizard
**Location:** `/components/PaperclipAIAgentsWizard.tsx` (372 lines)

**5-Step Flow:**
1. Welcome — Feature overview
2. Dept Selection — Choose which agent to start with
3. Task — Select first task (from template or custom)
4. Budget — Set spending limit via slider
5. Ready — Review settings, click "Bắt đầu!" (Start!)

**Output:** `WizardResult` → `handleWizardComplete()` → Sets state + runs demo

---

## 🔧 Hooks & Utilities

### Custom Hooks
- `useDebounce(value, delay)` — Lines 37–44: Debounce hook for search/filter

### Context Hooks (from App)
- `useAuth()` — Authentication context
- `useTheme()` — Dark/light theme
- `useToast()` — Toast notifications

### Helper Functions
```typescript
const addLog = (agent, action, status?, color?) => {}          // Add activity log entry
const saveThread = (deptId, thread) => {}                      // Persist conversation
const clearThread = (deptId) => {}                             // Clear agent's history
const saveBrief = (deptId, brief) => {}                        // Save company brief
const toggleSkill = (deptId, skillId) => {}                    // Toggle skill rule
const detectDept = (prompt) => string | null                   // AI-detect best agent for prompt
const downloadOutput = (content, filename) => {}               // Export as markdown
```

---

## 📈 Performance & Optimization

### Implemented
- ✅ `useCallback` dependencies optimized
- ✅ `useMemo` for department/model lookups
- ✅ Debounce for history search
- ✅ LocalStorage caching (avoid API on every load)
- ✅ Canvas node positions persisted

### Potential Improvements
- [ ] Virtualize task history table (for 1000+ tasks)
- [ ] Lazy-load project details on demand
- [ ] Cache API responses with stale-while-revalidate
- [ ] Compress localStorage JSON (only keep last 100 tasks)

---

## 🐛 Known Limitations & TODOs

### Current
- Budget limit is **visual warning only**, not enforced at API level
- Confidence score tracking (TaskResult.confidence) not yet populated
- Approval dialog for high-cost tasks not fully implemented
- DEI/Legal skill rules for HR not fully tested
- Mobile canvas simplification could be more polished

### Future Enhancements
1. **Approval Workflow**
   - Gate high-cost tasks behind human review
   - Approval queue with notifications

2. **Integration Connectors**
   - Send outputs to Slack, Discord, email
   - Import data from Salesforce, HubSpot, Jira

3. **Advanced Analytics**
   - Department performance metrics
   - Time-series cost tracking
   - ROI per agent type

4. **Skill Marketplace**
   - Community-contributed skill rules
   - Publish custom skills

5. **Webhook Support**
   - Trigger tasks from external systems
   - Async job callbacks

6. **Multi-Language Agents**
   - Support agents for other languages
   - Auto-translate between agents

---

## 🧪 Testing Checklist

### Happy Path
- [ ] User completes wizard → project created
- [ ] User runs task → output streams, cost tracked
- [ ] User switches agent → brief/skills load correctly
- [ ] User runs canvas → all depts execute in parallel
- [ ] User queues 3 tasks → auto-execute in order

### Edge Cases
- [ ] Stop task mid-stream → partial output saved
- [ ] Switch agent during streaming → aborts cleanly
- [ ] Budget limit exceeded → warning shown
- [ ] Offline mode → localStorage fallback used
- [ ] Delete task → removed from history
- [ ] Export history → valid JSON downloaded

### Performance
- [ ] History table with 1000 tasks → renders smoothly
- [ ] Canvas drag → 60fps on desktop
- [ ] Streaming output → no jank at 60fps
- [ ] Mobile view → responsive layout works

---

## 🔐 Security & Privacy Considerations

**Current:**
- API key hidden in backend proxy (never exposed to frontend)
- LocalStorage contains non-sensitive data (prompts, history)
- Authentication via useAuth context

**Best Practices:**
- ✅ No hardcoded secrets in code
- ✅ All AI calls go through backend proxy
- ✅ Task results stored locally (user's device) + backend (encrypted)
- [ ] Add rate limiting on backend
- [ ] Encrypt sensitive project data at rest

---

## 📚 Related Files & Dependencies

### Core Files
- `/components/PaperclipAIAgentsWorkspace.tsx` (4045 lines)
- `/components/PaperclipAIAgentsWizard.tsx` (372 lines)
- `/apis/paperclipProjects.ts` (165 lines)
- `/apis/aiCommon.ts` (238 lines)
- `/pages/images/PaperclipAIAgents.tsx` (63 lines)

### Dependencies
- **framer-motion** — Animations (streaming, transitions, bursts)
- **lucide-react** — 30+ icons
- **anthropic API** (Claude Sonnet/Opus) — via backend proxy

### Landing Components (8 sections)
- HeroSection, LiveStatsBar, WorkflowSection
- ShowcaseSection, FeaturesSection, UseCasesSection
- FAQSection, FinalCTA

---

## 🎓 Quick Start for Developers

### To Add a New Skill Rule
1. Open `/components/PaperclipAIAgentsWorkspace.tsx`
2. Find `DEPT_SKILLS` object
3. Add new skill to desired department:
   ```typescript
   { 
     id: 'my-skill',
     label: '🎯 My Skill',
     rule: 'Rule description that will be included in system prompt.'
   }
   ```
4. Test by:
   - Select agent in workspace
   - Enable skill in "Setup" tab
   - Run a task
   - Check "Prompt" tab to see rule in system prompt

### To Add a New Department
1. Add to `DEPARTMENTS` array with unique `id`, `label`, `icon`, `color`
2. Add skills to `DEPT_SKILLS[newDeptId]`
3. Add to CEO's `subordinates` array
4. Update landing page "Use Cases" section
5. Test canvas multi-agent flow

### To Add a New Task Template
1. Find `TASK_TEMPLATES` constant
2. Add new `StylePreset`:
   ```typescript
   {
     id: 'my-template',
     label: 'My Template',
     emoji: '🎨',
     description: 'Template description',
     promptPrefix: 'Start of prompt: ',
   }
   ```
3. Test in wizard "Task" step

---

## 📞 Support & Questions

For questions about:
- **Architecture:** See Section 2 (Architecture Overview)
- **State Management:** See Section 2 (Core State Management)
- **API Integration:** See Section 4 (Storage Strategy)
- **UI Components:** See Section 5 (UI Components & Layout)
- **New Features:** See Section 6 (Key Features Implementation Details)

---

**End of Roadmap**
