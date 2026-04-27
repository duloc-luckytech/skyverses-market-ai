# Skyverses Codebase Exploration - Complete Index

**Date**: April 13, 2026  
**Project**: Skyverses AI Marketplace  
**Focus**: Product Pages & Agent Workspace Structure

---

## 📚 Documentation Files Generated

This exploration created 4 comprehensive documentation files:

### 1. **CODEBASE_STRUCTURE_EXPLORATION.md** ⭐ START HERE
   - **Best for**: Comprehensive deep-dive understanding
   - **Length**: 15 detailed sections
   - **Covers**: 
     - Product page structure
     - Agent workspace components
     - Department & agent types
     - Types & interfaces
     - LLM models & configuration
     - UI state management
     - Storage & persistence
     - API integration
     - Task templates
     - Complete file structure
   - **Read time**: 20-30 minutes

### 2. **QUICK_REFERENCE_AGENTS.md** ⭐ MOST USEFUL WHILE CODING
   - **Best for**: Quick lookups during development
   - **Format**: Tables, code blocks, key-value references
   - **Covers**:
     - File locations at a glance
     - Agent structure table
     - Data structures with fields
     - UI state enum/types
     - AI models
     - LocalStorage keys
     - API endpoints table
     - Task templates
     - Key functions
     - Configuration constants
   - **Read time**: 5-10 minutes (reference material)

### 3. **FILE_STRUCTURE_MAP.txt** ⭐ VISUAL ARCHITECTURE
   - **Best for**: Understanding file organization
   - **Format**: ASCII tree structure with annotations
   - **Covers**:
     - Product page entry point
     - Landing components breakdown
     - Workspace components
     - Type definitions locations
     - API layer structure
     - Context providers
     - Routing configuration
     - Component hierarchy
     - Key modification points
   - **Read time**: 10-15 minutes

### 4. **EXPLORATION_SUMMARY.txt** ⭐ EXECUTIVE OVERVIEW
   - **Best for**: High-level overview & onboarding
   - **Format**: Structured sections with ASCII formatting
   - **Covers**:
     - Key findings
     - Types & interfaces
     - Component structure
     - Key features
     - AI models
     - Storage & persistence
     - API endpoints
     - File locations reference
     - UI state management
     - Task templates
     - Configuration constants
     - Routing configuration
     - Integration points
     - Scalability & extensibility
   - **Read time**: 15-20 minutes

---

## 🎯 Quick Navigation by Use Case

### "I need to understand the whole system"
→ Read: **CODEBASE_STRUCTURE_EXPLORATION.md** (sections 1-15)

### "I need to add a new agent department"
→ Read: **QUICK_REFERENCE_AGENTS.md** (Agent Structure section)  
→ Modify: `components/PaperclipAIAgentsWorkspace.tsx` (line 86, DEPARTMENTS)

### "I need to find where X is in the codebase"
→ Use: **FILE_STRUCTURE_MAP.txt** (for file locations)

### "I'm getting up to speed quickly"
→ Read: **EXPLORATION_SUMMARY.txt** (sections 1-4)

### "I need to add a new UI tab/feature"
→ Use: **QUICK_REFERENCE_AGENTS.md** (Most Important Files section)

### "I need to understand the data flow"
→ Read: **FILE_STRUCTURE_MAP.txt** (section 12: Component Hierarchy)

---

## 📋 Key Findings Summary

### Product Page Location
```
File: /pages/images/PaperclipAIAgents.tsx
Route: /product/paperclip-ai-agents
```

### Workspace Component
```
File: /components/PaperclipAIAgentsWorkspace.tsx
Size: 4,045 lines
Views: studio, history, analytics, canvas
```

### Agent Departments
- **CEO Agent** (orchestrator) - Delegates to others
- **Marketing AI** - SEO, copywriting, social, analytics
- **DevOps AI** - CI/CD, security, performance, IaC
- **Sales AI** - Outreach, CRM, proposals
- **HR AI** - Job descriptions, screening, policies

### Key Types
- `PaperclipProject` - Main project container
- `AgentConfig` - Agent configuration
- `ITaskResult` - Task execution result
- `Thread` - Conversation thread
- `Solution` - Product definition

### AI Models
- Claude Sonnet 4 (fast, cheap)
- Claude Opus 4 (most powerful)

---

## 🔍 File Reference Quick Lookup

| What | Where |
|------|-------|
| Product page | `pages/images/PaperclipAIAgents.tsx` |
| Main workspace | `components/PaperclipAIAgentsWorkspace.tsx` |
| Onboarding wizard | `components/PaperclipAIAgentsWizard.tsx` |
| Agent configs | In Workspace.tsx (lines 86-137) |
| Agent skills | In Workspace.tsx (lines 47-75) |
| LLM models | In Workspace.tsx (lines 139-142) |
| Task templates | In Workspace.tsx (lines 144-158) |
| Project API | `apis/paperclipProjects.ts` |
| AI helpers | `apis/aiCommon.ts` |
| Global types | `types.ts` |
| Landing sections | `components/landing/paperclip-ai-agents/` |

---

## 🚀 Most Common Modifications

### 1. Add New Agent Department
```typescript
// In components/PaperclipAIAgentsWorkspace.tsx, line 86
const DEPARTMENTS = [
  // ... existing
  {
    id: 'newdept',
    label: 'New Department',
    icon: SomeIcon,
    color: '#color',
    agent: 'New Agent',
    tier: 'department',
    tasks: ['Task 1', 'Task 2'],
    subordinates: [],
  },
];
```

### 2. Add Department Skills
```typescript
// In components/PaperclipAIAgentsWorkspace.tsx, line 47
const DEPT_SKILLS = {
  newdept: [
    { id: 'skill1', label: '🎯 Skill Name', rule: 'Rule text...' },
    // ...
  ],
};
```

### 3. Add New UI Tab
```typescript
// In components/PaperclipAIAgentsWorkspace.tsx
// Search for activeRightTab
activeRightTab: 'output' | 'log' | 'prompt' | 'setup' | 'chat' | 'newtab'
```

---

## 📊 Architecture at a Glance

```
Landing Page
    ↓
HeroSection (CTA button)
    ↓
[Click "Try Paperclip"]
    ↓
PaperclipAIAgentsWorkspace (modal opens)
    ├─ PaperclipAIAgentsWizard (first time)
    ├─ Department Selection
    ├─ Skill Configuration
    ├─ Real-time AI Output (streaming)
    ├─ Task History & Analytics
    └─ Budget Management
```

---

## 🔗 Interconnections

### Page → Workspace Flow
1. User clicks "Try Paperclip" on landing page
2. `setIsStudioOpen(true)` in PaperclipAIAgents.tsx
3. Modal opens with PaperclipAIAgentsWorkspace
4. Onboarding wizard shown if first time
5. User selects department and runs task
6. AI response streams in real-time

### State Management
- UI state: useState hooks in Workspace
- User auth: useAuth() from AuthContext
- Notifications: useToast() from ToastContext
- Theme: useTheme() from ThemeContext
- Persistence: localStorage + backend API

### Data Flow
1. User input → Task template
2. System prompt built from agent rules + skills
3. API call via aiChatStreamViaProxy()
4. Response streams back
5. Result stored in taskHistory
6. Persisted to backend + localStorage

---

## 🧪 Testing Checklist

- [ ] Navigate to `/product/paperclip-ai-agents`
- [ ] View all 8 landing sections
- [ ] Click "Try Paperclip" button
- [ ] Complete onboarding wizard
- [ ] Select each department
- [ ] Configure budget
- [ ] Run a task and see streaming output
- [ ] Check task history
- [ ] Verify localStorage persistence
- [ ] Test with different LLM models
- [ ] Try different skill combinations

---

## 📖 Reading Order Recommendations

### For New Developers
1. This index file (you're reading it!)
2. EXPLORATION_SUMMARY.txt (10 min)
3. FILE_STRUCTURE_MAP.txt (15 min)
4. QUICK_REFERENCE_AGENTS.md (10 min)
5. CODEBASE_STRUCTURE_EXPLORATION.md (30 min)

### For Feature Implementation
1. QUICK_REFERENCE_AGENTS.md (find what to modify)
2. CODEBASE_STRUCTURE_EXPLORATION.md (understand the context)
3. Code the feature
4. Test using Testing Checklist

### For Bug Fixing
1. EXPLORATION_SUMMARY.txt (sections 1-8)
2. FILE_STRUCTURE_MAP.txt (find the file)
3. QUICK_REFERENCE_AGENTS.md (reference the type/API)
4. Debug and fix

---

## 💾 Storage Keys Reference

All localStorage keys are prefixed with:
```
skyverses_PAPERCLIP-AI-AGENTS_vault
```

Full keys:
- `_vault` - Base key
- `_vault_thread_{deptId}` - Conversations
- `_vault_brief_{deptId}` - Agent briefs
- `_vault_skills_{deptId}` - Selected skills
- `_wizard_done` - Wizard completion flag
- `_advanced` - Advanced mode flag
- `__activeProjectId` - Current project

---

## 🎓 Key Concepts to Understand

### Multi-Agent Orchestration
CEO Agent coordinates specialized department agents. Each agent has unique skills that modify its behavior through system prompts.

### Skill-Based Specialization
Skills are rule injections that change how agents respond. Example: "SEO Expert" skill tells the marketing agent to optimize for SEO.

### Budget Guard System
Hard credit limits prevent overspending. Each task costs credits based on output tokens. System prevents execution if budget exceeded.

### Real-Time Streaming
AI responses stream character-by-character to the UI, providing immediate feedback to the user. Uses Framer Motion for smooth animations.

### Project Persistence
User projects are stored both locally (localStorage) and on the backend (via paperclipProjects API). Both are kept in sync.

---

## 🔧 Developer Quick Links

| Task | Documentation | File | Line |
|------|---|---|---|
| Add agent | QUICK_REFERENCE_AGENTS.md | PaperclipAIAgentsWorkspace.tsx | 86 |
| Add skill | QUICK_REFERENCE_AGENTS.md | PaperclipAIAgentsWorkspace.tsx | 47 |
| Add UI tab | FILE_STRUCTURE_MAP.txt | PaperclipAIAgentsWorkspace.tsx | 140+ |
| Change model | EXPLORATION_SUMMARY.txt | PaperclipAIAgentsWorkspace.tsx | 139 |
| Add template | QUICK_REFERENCE_AGENTS.md | PaperclipAIAgentsWorkspace.tsx | 144 |
| Modify API | EXPLORATION_SUMMARY.txt | apis/paperclipProjects.ts | - |

---

## ✅ Exploration Complete

All key information about the Skyverses Agent Workspace has been documented in these 4 files. Use them as a reference while developing new features or fixing bugs.

**Last Updated**: April 13, 2026

---

## 📞 Questions?

Refer to:
- **"Where is X?"** → FILE_STRUCTURE_MAP.txt
- **"How do I add X?"** → QUICK_REFERENCE_AGENTS.md
- **"How does X work?"** → CODEBASE_STRUCTURE_EXPLORATION.md
- **"What is the overview?"** → EXPLORATION_SUMMARY.txt

