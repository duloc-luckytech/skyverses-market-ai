# Quick Reference: Agent Workspace Structure

## 🎯 File Locations at a Glance

### Product Page
```
pages/images/PaperclipAIAgents.tsx              Main product page
  ↓ Route: /product/paperclip-ai-agents
```

### Workspace Component
```
components/PaperclipAIAgentsWorkspace.tsx       4045 LOC - Main workspace
components/PaperclipAIAgentsWizard.tsx          Onboarding wizard
components/workspace/AISuggestPanel.tsx         AI suggestions
```

### Landing Components
```
components/landing/paperclip-ai-agents/
├── HeroSection.tsx
├── LiveStatsBar.tsx
├── WorkflowSection.tsx
├── ShowcaseSection.tsx
├── FeaturesSection.tsx
├── UseCasesSection.tsx
├── FAQSection.tsx
└── FinalCTA.tsx
```

### Type Definitions
```
types.ts                                        Global types (Solution, etc)
apis/paperclipProjects.ts                       Project types & API layer
apis/aiCommon.ts                                AI model constants & helpers
```

---

## 🤖 Agent Structure

### Departments (5 Total)

| ID | Name | Icon | Color | Tier | Subordinates |
|----|------|------|-------|------|--------------|
| `ceo` | CEO Agent | Building2 | #0090ff | orchestrator | [marketing, devops, sales, hr] |
| `marketing` | Marketing AI | Megaphone | #8b5cf6 | department | none |
| `devops` | DevOps AI | Code2 | #10b981 | department | none |
| `sales` | Sales AI | BarChart3 | #f59e0b | department | none |
| `hr` | HR AI | Users | #06b6d4 | department | none |

### Department Skills

**Marketing**: SEO Expert, Copywriter, Social Media, Analytics
**DevOps**: Security, Performance, IaC, Docs
**Sales**: Closer, CRM Expert, Persona Builder
**CEO**: Strategist, Delegator, Data-Driven
**HR**: DEI, Legal Safe, Engagement

---

## 💾 Data Structures

### Main Project Type
```typescript
interface PaperclipProject {
  _id: string;
  name: string;
  budgetLimit: number;
  activeModel: string;           // 'claude-sonnet' | 'claude-opus'
  activeDept: string;            // dept id
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  agentConfigs: AgentConfig[];
  conversationThreads: Thread[];
  taskHistory: ITaskResult[];
}
```

### Task Result
```typescript
interface ITaskResult {
  id: string;
  dept: string;
  prompt: string;
  output: string;
  status: 'done' | 'error';
  timestamp: string;
}
```

### Agent Config
```typescript
interface AgentConfig {
  deptId: string;
  brief: string;
  enabledSkills: string[];
}
```

### Conversation Thread
```typescript
interface Thread {
  deptId: string;
  messages: { role: string; content: string }[];
}
```

---

## 🎨 UI State

### View Modes
```typescript
viewMode: 'studio' | 'history' | 'analytics' | 'canvas'
```

### Right Sidebar Tabs
```typescript
activeRightTab: 'output' | 'log' | 'prompt' | 'setup' | 'chat'
```

### Key Boolean States
```
showAISuggest          AI suggestion panel
showMobileSheet        Mobile sidebar
showBudgetPanel        Budget guard panel
showOrgChart           Organization chart
showActivity           Activity log
showPromptHistory      Prompt history
isStreaming            Currently streaming AI output
```

---

## 🧠 AI Models

```typescript
AI_MODELS = {
  SONNET: 'claude-sonnet-4-6',   // Fast, cheap
  OPUS:   'claude-opus-4',       // Most powerful
}
```

---

## 💾 LocalStorage Keys

```
'skyverses_PAPERCLIP-AI-AGENTS_vault'                  Base key
'skyverses_PAPERCLIP-AI-AGENTS_vault_thread_{deptId}' Thread per dept
'skyverses_PAPERCLIP-AI-AGENTS_vault_brief_{deptId}'  Brief per dept
'skyverses_PAPERCLIP-AI-AGENTS_vault_skills_{deptId}' Skills per dept
'skyverses_PAPERCLIP-AI-AGENTS_wizard_done'           Wizard completed
'skyverses_PAPERCLIP-AI-AGENTS_advanced'              Advanced mode flag
'skyverses_PAPERCLIP-AI-AGENTS__activeProjectId'      Current project
```

---

## 🔌 API Endpoints

### Projects
```
GET    /paperclip-projects              List all projects
GET    /paperclip-projects/:id          Get project with full data
POST   /paperclip-projects              Create new project
PATCH  /paperclip-projects/:id          Update project meta
DELETE /paperclip-projects/:id          Delete project
PUT    /paperclip-projects/:id/agents   Save agent configs
PUT    /paperclip-projects/:id/threads  Save threads
POST   /paperclip-projects/:id/history  Append task result
```

---

## 📋 Task Templates

```
blog-seo         Blog SEO          ✍️
social-batch     Social Batch      📱
ci-refactor      CI/CD             ⚙️
lead-outreach    Lead Outreach     📧
competitor       Competitor        🔍
api-docs         API Docs          📚
```

---

## 🚀 Key Functions to Know

### From `aiCommon.ts`
```typescript
aiChatStreamViaProxy(messages, onToken)    // Stream AI response
aiChatOnceViaProxy(messages)               // Single call
buildSystemMessage({ role, rules })       // Build system prompt
parseAIJSON<T>(rawString)                  // Parse AI JSON
```

### From `paperclipProjects.ts`
```typescript
listProjects()                             // Get all projects
getProject(id)                             // Get full project
createProject(name)                        // Create new
updateProject(id, updates)                 // Update meta
deleteProject(id)                          // Delete
saveAgentConfigs(id, configs)             // Save configs
saveThreads(id, threads)                  // Save threads
appendTaskResult(id, result)              // Add to history
```

---

## 📊 Configuration Constants

### Max Thread Turns
```typescript
MAX_THREAD_TURNS = 10  // Max 10 turns (20 messages: 10 user + 10 assistant)
```

### Thinking Steps
```
🧠 Phân tích yêu cầu...
📋 Xây dựng kế hoạch...
🔍 Research context...
⚡ Tạo nội dung...
✅ Kiểm tra chất lượng...
📦 Format kết quả...
```

---

## 🔗 Component Hierarchy

```
PaperclipAIAgents (Page)
  ├─ Landing Sections (Hero, Features, FAQ, etc)
  └─ PaperclipAIAgentsWorkspace
      ├─ PaperclipAIAgentsWizard (first time)
      ├─ OrgChartMini
      ├─ AISuggestPanel
      ├─ StreamingMarkdownOutput
      └─ MarkdownOutput
```

---

## 🎯 Most Important Files to Modify

1. **Add new agent type**: `components/PaperclipAIAgentsWorkspace.tsx` (line 86, DEPARTMENTS)
2. **Add agent skills**: Same file (line 47, DEPT_SKILLS)
3. **Add new UI tab**: Same file (search `activeRightTab`)
4. **Modify API**: `apis/paperclipProjects.ts`
5. **Add task template**: Same workspace file (line 144, TASK_TEMPLATES)
6. **Change LLM model**: Same workspace file (line 139, LLM_MODELS)

---

## 🧪 Testing the Workspace

1. Navigate to `/product/paperclip-ai-agents`
2. Click "Try Paperclip — Free" or "Start Studio"
3. Should see onboarding wizard (if first time)
4. Select a department (Marketing, DevOps, etc)
5. Configure budget
6. Write a prompt
7. See streaming output in real-time

---

## 📝 Notes

- All AI calls go through backend proxy (`apiCommon.ts`)
- Workspaces persist to localStorage + backend
- Streaming uses Framer Motion for smooth UX
- Budget is hard-limited per project
- Each agent has skill-based system prompts
- Max 50 tasks in history (newest first)
