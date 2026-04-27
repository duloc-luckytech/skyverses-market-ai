# Skyverses Codebase Exploration: Product Pages & Agent Workspace

## Overview
The codebase contains a sophisticated AI product marketplace with specialized components for different AI tools, including a multi-agent orchestration system called "Paperclip AI Agents."

---

## 1. PRODUCT PAGE STRUCTURE

### Location
- **Main Page**: `/pages/images/PaperclipAIAgents.tsx`
- **Route**: `/product/paperclip-ai-agents`
- **Landing Components**: `/components/landing/paperclip-ai-agents/`

### Page Component Files
```
pages/images/PaperclipAIAgents.tsx
├── pages/images/ (directory)
│   ├── ProductAIAgent.tsx          (Aether Flow product page)
│   ├── ProductAIAgentWorkflow.tsx
│   ├── ProductCharacterSync.tsx
│   ├── ProductCinematicAgent.tsx
│   ├── ProductGameCharacterAgent.tsx
│   ├── ProductPrompt1.tsx
│   └── ... (other product pages)
```

### Paperclip AI Agents Landing Components
```
components/landing/paperclip-ai-agents/
├── HeroSection.tsx          # Hero banner with CTA
├── LiveStatsBar.tsx         # Real-time stats display
├── WorkflowSection.tsx      # Agent workflow visualization
├── ShowcaseSection.tsx      # Demo/showcase of features
├── FeaturesSection.tsx      # Feature list
├── UseCasesSection.tsx      # Use cases & scenarios
├── FAQSection.tsx           # Frequently asked questions
└── FinalCTA.tsx             # Final call-to-action
```

---

## 2. AGENT WORKSPACE COMPONENTS

### Main Workspace Component
**File**: `components/PaperclipAIAgentsWorkspace.tsx` (4045 lines)

#### Component Signature
```typescript
const PaperclipAIAgentsWorkspace: React.FC<{ onClose: () => void }>
```

#### Key Features
- Multi-agent orchestration interface
- CEO Agent with subordinate department agents
- Real-time streaming output
- Task history and analytics
- Budget guard / credit management
- AI-powered suggestions

### Supporting Components
```
components/
├── PaperclipAIAgentsWorkspace.tsx    # Main workspace (4045 LOC)
├── PaperclipAIAgentsWizard.tsx       # Onboarding wizard
├── workspace/
│   └── AISuggestPanel.tsx            # AI suggestion recommendations
```

---

## 3. DEPARTMENT/AGENT TYPES & STRUCTURE

### Department Configuration
Located in `PaperclipAIAgentsWorkspace.tsx` (lines 86-137):

```typescript
DEPARTMENTS = [
  {
    id: 'ceo',
    label: 'CEO Agent',
    icon: Building2,
    color: '#0090ff',
    agent: 'CEO Agent',
    tier: 'orchestrator',
    tasks: ['Delegate tasks to team', 'Strategic brief', ...],
    subordinates: ['marketing', 'devops', 'sales', 'hr'],
  },
  {
    id: 'marketing',
    label: 'Marketing AI',
    icon: Megaphone,
    color: '#8b5cf6',
    agent: 'Marketing Agent',
    tier: 'department',
    tasks: ['Viết content SEO', 'Social media posts', ...],
    subordinates: [],
  },
  // ... devops, sales, hr
]
```

### Agent Departments
1. **CEO Agent** - Orchestrator tier, delegates to other agents
2. **Marketing AI** - Content, SEO, social media, analytics
3. **DevOps AI** - CI/CD, code review, deployment, performance
4. **Sales AI** - Lead outreach, CRM, proposals, deal analysis
5. **HR AI** - Job descriptions, screening, onboarding, policies

### Department Skills
Each department has specialized skill presets (lines 47-75):

**Marketing Skills**:
- 🔍 SEO Expert
- ✍️ Copywriter
- 📱 Social Media
- 📈 Analytics

**DevOps Skills**:
- 🔒 Security
- ⚡ Performance
- 🏗️ IaC (Infrastructure as Code)
- 📚 Docs

**Sales Skills**:
- 💰 Closer
- 🗂️ CRM Expert
- 🎭 Persona Builder

**CEO Skills**:
- 🎯 Strategist
- 🤝 Delegator
- 📊 Data-Driven

**HR Skills**:
- 🌍 DEI
- ⚖️ Legal Safe
- 💬 Engagement

---

## 4. TYPES & INTERFACES

### WorkspaceWorkspace Types
File: `types.ts` (102 lines)

```typescript
export interface Solution {
  _id?: string;
  id: string;
  slug: string;
  name: LocalizedString;
  category: LocalizedString;
  description: LocalizedString;
  problems: string[];
  industries: string[];
  models?: string[];
  priceCredits?: number;
  isFree?: boolean;
  imageUrl: string;
  gallery?: string[];
  neuralStack?: NeuralStackItem[];
  demoType: 'text' | 'image' | 'video' | 'automation';
  tags: string[];
  features: (string | LocalizedString)[];
  complexity: 'Standard' | 'Advanced' | 'Enterprise';
  priceReference: string;
  isActive?: boolean;
  order?: number;
  featured?: boolean;
  status?: string;
  homeBlocks?: string[];
  platforms?: string[];
}
```

### Agent Project Types
File: `apis/paperclipProjects.ts`

```typescript
export interface ITaskResult {
  id: string;
  dept: string;
  prompt: string;
  output: string;
  status: 'done' | 'error';
  timestamp: string;
}

export interface AgentConfig {
  deptId: string;
  brief: string;
  enabledSkills: string[];
}

export interface Thread {
  deptId: string;
  messages: { role: string; content: string }[];
}

export interface PaperclipProjectSummary {
  _id: string;
  name: string;
  budgetLimit: number;
  activeModel: string;
  activeDept: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaperclipProject extends PaperclipProjectSummary {
  agentConfigs: AgentConfig[];
  conversationThreads: Thread[];
  taskHistory: ITaskResult[];
}
```

### Workspace Internal Types
From `PaperclipAIAgentsWorkspace.tsx`:

```typescript
type TaskStatus = 'idle' | 'running' | 'done' | 'error';

interface TaskResult {
  id: string;
  dept: string;
  model: string;
  taskDesc: string;
  output: string;
  status: TaskStatus;
  timestamp: string;
  cost: string;
  duration?: string;
  tokens?: number;
  systemPrompt?: string;
  confidence?: number;
  starred?: boolean;
}

interface CanvasNodeState {
  id: string;
  x: number;
  y: number;
  status: 'idle' | 'running' | 'done' | 'error';
  output: string;
  streaming: boolean;
}

interface ActivityLog {
  id: string;
  time: string;
  agent: string;
  action: string;
  status: 'info' | 'success' | 'warning' | 'running';
  color: string;
}
```

### Wizard Types
File: `components/PaperclipAIAgentsWizard.tsx`:

```typescript
export interface WizardResult {
  dept: string;
  budget: number;
  prompt: string;
  runDemo: boolean;
}
```

---

## 5. LLM MODELS & AI CONFIGURATION

### Available Models
From `PaperclipAIAgentsWorkspace.tsx` (lines 139-142):

```typescript
const LLM_MODELS = [
  { 
    id: 'claude-sonnet', 
    label: 'Claude Sonnet 4', 
    provider: 'Anthropic', 
    badge: 'Fast & Balanced', 
    color: '#f97316', 
    apiModel: AI_MODELS.SONNET 
  },
  { 
    id: 'claude-opus', 
    label: 'Claude Opus 4', 
    provider: 'Anthropic', 
    badge: 'Most Powerful', 
    color: '#8b5cf6', 
    apiModel: AI_MODELS.OPUS 
  },
];
```

### AI Models Enum
From `apis/aiCommon.ts`:

```typescript
export const AI_MODELS = {
  SONNET: 'claude-sonnet-4-6',  // Fast, cheap, balanced
  OPUS:   'claude-opus-4',      // Most powerful
} as const;

export type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS];
```

---

## 6. WORKSPACE UI STRUCTURE

### View Modes
```typescript
viewMode: 'studio' | 'history' | 'analytics' | 'canvas'
```

### UI State Management
Key UI states in workspace:
- `viewMode` - Current workspace view
- `showAISuggest` - AI suggestion panel visibility
- `showMobileSheet` - Mobile sidebar
- `showBudgetPanel` - Budget guard panel
- `showOrgChart` - Organization chart visibility
- `showActivity` - Activity log visibility
- `showPromptHistory` - Prompt history panel
- `activeRightTab` - Active right sidebar tab ('output' | 'log' | 'prompt' | 'setup' | 'chat')
- `isStreaming` - Current streaming state

### Right Panel Tabs
- **output** - AI output/results
- **log** - Activity/execution log
- **prompt** - Prompt history
- **setup** - Agent configuration
- **chat** - Multi-turn conversation

---

## 7. STORAGE & PERSISTENCE

### LocalStorage Keys
From `PaperclipAIAgentsWorkspace.tsx` (lines 26-33):

```typescript
const STORAGE_KEY = 'skyverses_PAPERCLIP-AI-AGENTS_vault';
const THREAD_KEY = (deptId: string) => `${STORAGE_KEY}_thread_${deptId}`;
const BRIEF_KEY = (deptId: string) => `${STORAGE_KEY}_brief_${deptId}`;
const SKILLS_KEY = (deptId: string) => `${STORAGE_KEY}_skills_${deptId}`;
const WIZARD_KEY = 'skyverses_PAPERCLIP-AI-AGENTS_wizard_done';
const ADVANCED_KEY = 'skyverses_PAPERCLIP-AI-AGENTS_advanced';
const ACTIVE_PROJECT_KEY = 'skyverses_PAPERCLIP-AI-AGENTS__activeProjectId';
```

### Thread Management
- Max 10 turns per thread (20 messages: 10 user + 10 assistant)
- `MAX_THREAD_TURNS = 10`

---

## 8. API INTEGRATION

### Project API
File: `apis/paperclipProjects.ts`

**Endpoints**:
- `GET /paperclip-projects` - List all projects
- `GET /paperclip-projects/:id` - Get project with full data
- `POST /paperclip-projects` - Create new project
- `PATCH /paperclip-projects/:id` - Update project metadata
- `DELETE /paperclip-projects/:id` - Delete project
- `PUT /paperclip-projects/:id/agents` - Save agent configs
- `PUT /paperclip-projects/:id/threads` - Save conversation threads
- `POST /paperclip-projects/:id/history` - Append task result

### AI Chat API
File: `apis/aiChat.ts` / `apis/aiCommon.ts`

**Functions**:
- `aiChatStreamViaProxy(messages, onToken)` - Stream AI response
- `aiChatOnceViaProxy(messages)` - Single AI call
- `aiChatOnce(messages)` - Direct call (landing/demo only)
- `aiChatStream(messages, onToken)` - Direct stream (landing/demo only)
- `buildSystemMessage({ role, rules })` - Build system prompt
- `parseAIJSON<T>(rawString)` - Parse AI JSON response

---

## 9. TASK TEMPLATES & PRESETS

From `PaperclipAIAgentsWorkspace.tsx` (lines 144-158):

### Task Templates
```typescript
const TASK_TEMPLATES: StylePreset[] = [
  { id: 'blog-seo',     label: 'Blog SEO',      emoji: '✍️' },
  { id: 'social-batch', label: 'Social Batch',  emoji: '📱' },
  { id: 'ci-refactor',  label: 'CI/CD',         emoji: '⚙️' },
  { id: 'lead-outreach',label: 'Lead Outreach', emoji: '📧' },
  { id: 'competitor',   label: 'Competitor',    emoji: '🔍' },
  { id: 'api-docs',     label: 'API Docs',      emoji: '📚' },
];
```

### Featured Templates
- Launch Blog Campaign (5 blog posts SEO)
- Full Social Media Month (30 posts)
- DevOps Pipeline Audit
- Sales Outreach Q2

---

## 10. ROUTER CONFIGURATION

From `App.tsx`:

```typescript
const pageImports = {
  paperclipAIAgents: () => import('./pages/images/PaperclipAIAgents'),
  // ...
};

const PaperclipAIAgents = React.lazy(pageImports.paperclipAIAgents);

// Route definition:
<Route path="/product/paperclip-ai-agents" element={<PaperclipAIAgents />} />
```

---

## 11. DIRECTORY STRUCTURE SUMMARY

```
skyverses-market-ai/
├── pages/
│   ├── images/
│   │   ├── PaperclipAIAgents.tsx      (Main product page)
│   │   ├── ProductAIAgent.tsx
│   │   ├── ProductCharacterSync.tsx
│   │   └── ...
│   ├── videos/
│   ├── audio/
│   └── ...
├── components/
│   ├── PaperclipAIAgentsWorkspace.tsx (Main workspace, 4045 LOC)
│   ├── PaperclipAIAgentsWizard.tsx    (Onboarding)
│   ├── workspace/
│   │   └── AISuggestPanel.tsx
│   ├── landing/
│   │   ├── paperclip-ai-agents/      (Landing components)
│   │   ├── ai-slide-creator/
│   │   ├── video-generator/
│   │   └── ...
│   ├── AetherFlowInterface.tsx
│   ├── CharacterSyncWorkspace.tsx
│   ├── SocialBannerWorkspace.tsx
│   └── ... (100+ workspace components)
├── apis/
│   ├── paperclipProjects.ts          (Project API types & functions)
│   ├── aiCommon.ts                   (AI helpers & exports)
│   ├── aiChat.ts                     (Chat API implementation)
│   └── ...
├── context/
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   ├── ToastContext.tsx
│   └── ...
├── types.ts                          (Global types: Solution, etc.)
├── data.ts                           (Product/solution data)
├── App.tsx                           (Router & route definitions)
└── ...
```

---

## 12. KEY COMPONENT RELATIONSHIPS

```
PaperclipAIAgents (Page)
  ├── HeroSection (CTA → setIsStudioOpen)
  ├── LiveStatsBar
  ├── WorkflowSection
  ├── ShowcaseSection
  ├── FeaturesSection
  ├── UseCasesSection
  ├── FAQSection
  ├── FinalCTA
  └── PaperclipAIAgentsWorkspace (opened when isStudioOpen=true)
       ├── PaperclipAIAgentsWizard (first-time onboarding)
       ├── OrgChartMini (dept visualization)
       ├── StreamingMarkdownOutput (AI output render)
       ├── MarkdownOutput (code highlighting)
       └── AISuggestPanel (AI suggestions)
```

---

## 13. NOTABLE FEATURES

### 1. **Multi-Agent Orchestration**
- CEO Agent orchestrates marketing, devops, sales, HR agents
- Each agent has specialized skills and rules
- Tasks can be delegated through the CEO

### 2. **Budget Guard System**
- Hard credit limits per project
- Cost tracking per task
- Budget approval workflow

### 3. **Real-Time Streaming**
- AI responses stream character-by-character
- Visual feedback during generation
- Smooth UX via Framer Motion

### 4. **Skill-Based Specialization**
- Each agent has specific skill rules
- Skills modify system prompt behavior
- Supports DEPT_SKILLS configuration

### 5. **Canvas Multi-Agent Orchestration**
- Drag & drop interface
- Visual node workflow builder
- CanvasNodeState tracking

### 6. **Analytics & Auditing**
- Complete task history with timestamps
- Cost tracking per task
- ActivityLog with live updates
- Export capabilities

### 7. **Onboarding Wizard**
- 5-step guided setup
- Department selection
- Budget configuration
- First task template

---

## 14. STATIC DATA & CONFIGURATION

File: `data.ts` (30,850 lines)

Contains:
- SOLUTIONS array (all product configurations)
- Product metadata for marketplace
- Feature definitions
- Pricing tiers
- Neural stack models

Solution lookup for Paperclip:
```typescript
SOLUTIONS.find(s => s.slug === 'aether-flow-orchestrator')
```

---

## 15. FUTURE EXTENSION POINTS

### Areas for Enhancement
1. **Canvas Mode** - Drag & drop workflow builder (partially implemented)
2. **Advanced Analytics** - More visualization options
3. **Team Collaboration** - Multi-user workspaces
4. **Custom Agents** - User-defined agents beyond standard departments
5. **API Publishing** - Allow agents to call external APIs
6. **Scheduled Tasks** - Cron-like task scheduling
7. **Agent Fine-tuning** - Custom training on user data

---

## SUMMARY

The codebase demonstrates:
- **Modular Architecture**: Separate components for pages, workspaces, landing sections
- **Type Safety**: Strong TypeScript interfaces for agents, projects, tasks
- **Scalability**: 100+ workspace components following consistent patterns
- **Real-time UX**: Streaming AI output with proper state management
- **Enterprise Features**: Budget guards, audit logs, multi-agent orchestration
- **Flexible Configuration**: Department/skill systems support extensibility

The Paperclip AI Agents product is a sophisticated multi-agent orchestration platform built with React, featuring CEO-led department agents (Marketing, DevOps, Sales, HR) with specialized skills, budget management, and comprehensive task analytics.
