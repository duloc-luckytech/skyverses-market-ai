# Paperclip AI Agents — Complete Codebase Reference

## 📋 Product Overview

**Product Name:** Paperclip — AI Org Orchestrator  
**Product ID:** PAPERCLIP-AI-AGENTS  
**Slug:** `paperclip-ai-agents`  
**Route:** `/product/paperclip-ai-agents`  
**Category:** Agent Automation  
**Status:** Active, Featured, Free/Open Source  

### Description
Paperclip is an open-source platform to run your company with AI employees. Hire agents, set goals, manage budgets — zero humans required. It enables enterprises to orchestrate multi-agent AI workflows with built-in budget controls, governance layers, and human-in-the-loop approvals.

**Key Value Props:**
- Multi-Agent Orchestration (Claude, GPT-4o, Cursor, Codex)
- Budget Guard (hard spending limits per agent/department)
- Governance Layer (human approvals & audit logs)
- Open Source (MIT License, Self-hosted)
- No-code dashboard UI
- Enterprise-grade compliance

---

## 🏗️ UI Architecture

### Page Structure: `PaperclipAIAgents.tsx` 
**File:** `/pages/images/PaperclipAIAgents.tsx`

The main page is a **landing page + interactive studio** with two modes:
1. **Landing Page Mode** (default) - Marketing content
2. **Studio Mode** (modal) - Interactive workspace

#### Landing Page Sections:
1. **HeroSection** - Main headline, tagline, specs, CTA
2. **LiveStatsBar** - Key metrics (2400+ GitHub stars, 8 LLMs, 99% uptime, MIT license, ~5 min setup)
3. **WorkflowSection** - 4-step workflow visualization
4. **ShowcaseSection** - Real agent runs/examples with filtering
5. **FeaturesSection** - 8 core features (multi-agent, budget guard, governance, etc.)
6. **UseCasesSection** - 8 industry use cases
7. **FAQSection** - 6 FAQ items
8. **FinalCTA** - Final call-to-action section
9. **Mobile Sticky CTA** - Fixed bottom button for mobile users

### Key State:
```typescript
const [isStudioOpen, setIsStudioOpen] = useState(false);
```
When `isStudioOpen` is true, full-screen workspace modal takes over.

---

## 🎨 Components Breakdown

### Landing Components (in `components/landing/paperclip-ai-agents/`)

#### 1. **HeroSection.tsx**
- **Purpose:** Hero banner with headline, specs, and main CTA
- **Key Elements:**
  - Back link to homepage
  - Badge: "AI Org Orchestrator · Open Source"
  - H1: "Run Your Company With AI"
  - 4 spec cards (Multi-Agent, Budget Guard, Governance, Self-hosted)
  - Primary CTA button: "Thử Ngay"
  - Floating badge with "Autonomous agents" & "Free / Open Source"
- **Visuals:** DashboardMockup image with animated badges
  - Budget Guard: Active (green pulse)
  - 5 agents running (blue spinner)

#### 2. **WorkflowSection.tsx**
- **Purpose:** 4-step process visualization
- **Steps:**
  1. "Định nghĩa Org Chart" — Define AI org structure
  2. "Gán LLM & Tool cho mỗi Agent" — Assign models (Claude → creative, GPT-4o → analysis)
  3. "Thiết lập Budget Guard & Governance" — Set spend limits, human-in-the-loop
  4. "Chạy & Monitor" — Execute tasks, watch live dashboard
- **Visuals:** Step images from CDN (workflowStep1-4)
- **Timeline Connector:** Visual line connecting steps on desktop

#### 3. **FeaturesSection.tsx**
- **Purpose:** Core features showcase
- **Featured Features (2 with images):**
  - Multi-Agent Orchestration
  - Budget Guard
- **Regular Features (6):**
  - Governance & Audit
  - Self-hosted / Cloud
  - Real-time Dashboard
  - Workflow Builder
  - Prompt Inspector
  - Auto Failover
- **Layout:** 2x4 grid on desktop, responsive on mobile
- **Interactions:** Click to expand descriptions

#### 4. **ShowcaseSection.tsx**
- **Purpose:** Real-world agent run examples
- **Data:** 8 agent run cards
  - Blog Content Campaign (Marketing, claude-sonnet, completed)
  - CI/CD Pipeline Refactor (DevOps, cursor+gpt-4o, running)
  - CRM Lead Outreach (Sales, gpt-4o, completed)
  - Performance Audit Report (DevOps, completed)
  - Social Media Batch (Marketing, running)
  - Support Knowledge Base (Operations, waiting approval)
  - Competitor Analysis (Marketing, completed)
  - API Documentation (DevOps, completed)
- **Filtering:** All, Marketing, DevOps, Sales, Operations
- **Status:** running, completed, waiting (with animations)
- **Card Details:** Thumbnail image, tags, cost, model, department

#### 5. **UseCasesSection.tsx**
- **Purpose:** Industry/use-case showcase (8 cards)
- **Use Cases:**
  1. Startup & Scale-up
  2. Software Agency
  3. Marketing Agency
  4. E-commerce
  5. Edtech & Online Learning
  6. Healthcare Admin
  7. FinTech & Finance
  8. Remote-first Company
- **Visuals:** Colored icons + illustration images per use case

#### 6. **LiveStatsBar.tsx**
- **Purpose:** Key metrics display
- **Stats:**
  - 2400+ GitHub Stars
  - 8 LLMs integrated
  - 99% Uptime SLA
  - MIT License ✓
  - ~5 min setup (self-hosted)
- **Layout:** Horizontal bar with dividers on desktop

#### 7. **FAQSection.tsx**
- **Purpose:** FAQ accordion
- **Questions (6):**
  1. How is Paperclip different from AutoGPT/CrewAI?
  2. Which LLM models are supported?
  3. How does Budget Guard work?
  4. What infrastructure for self-hosted?
  5. Will my data be used to train models?
  6. What does MIT license mean?
- **Interaction:** Click to expand/collapse, first item open by default
- **Links:** GitHub issue link at bottom

#### 8. **FinalCTA.tsx**
- **Purpose:** Final conversion section
- **Elements:**
  - Badge: "Paperclip — AI Org Orchestrator"
  - H2: "Sẵn sàng chạy công ty bằng AI agents?"
  - 2 buttons: "Thử Ngay" (primary) + "View on GitHub" (secondary)
  - Footer text: Free, MIT License, No credit card, Open Source, Self-hosted, 5 min setup, Budget Guard

---

## 🖥️ Interactive Workspace: PaperclipAIAgentsWorkspace.tsx

**File:** `components/PaperclipAIAgentsWorkspace.tsx`

This is a **full-featured AI agent orchestration studio** — interactive demo/playground for running multi-agent workflows.

### Architecture & State

```typescript
// Key state variables
const [activeTab, setActiveTab] = useState<'canvas' | 'runs' | 'settings'>('canvas');
const [selectedDept, setSelectedDept] = useState('ceo');
const [taskInput, setTaskInput] = useState('');
const [isRunning, setIsRunning] = useState(false);
const [taskResults, setTaskResults] = useState<TaskResult[]>([]);
const [canvasNodes, setCanvasNodes] = useState<CanvasNodeState[]>([]);
```

### Core Features

#### 1. **Department/Agent System**
**5 Main Departments:**
- **CEO Agent** (orchestrator)
  - Tasks: Delegate tasks, Strategic brief, Org-wide report, Budget review
  - Subordinates: Marketing, DevOps, Sales, HR
  - Color: #0090ff (blue)
  
- **Marketing AI**
  - Tasks: Viết content SEO, Social media posts, Email campaign, Competitor analysis
  - Color: #8b5cf6 (purple)
  
- **DevOps AI**
  - Tasks: CI/CD pipeline, Code review, Deploy automation, Performance audit
  - Color: #10b981 (green)
  
- **Sales AI**
  - Tasks: Lead outreach, CRM follow-up, Proposal drafting, Deal analysis
  - Color: #f59e0b (amber)
  
- **HR AI**
  - Tasks: Job description, Screening filter, Onboarding docs, Policy drafts
  - Color: #06b6d4 (cyan)

#### 2. **Skill System**
Each department has preset skill profiles that define how the agent behaves:

**CEO Skills:**
- 🎯 Strategist — Think board-level, prioritize long-term value
- 🤝 Delegator — Break goals into delegatable sub-tasks
- 📊 Data-Driven — Back recommendations with KPIs

**Marketing Skills:**
- 🔍 SEO Expert — Optimize for SEO, keywords, meta descriptions
- ✍️ Copywriter — AIDA framework (Attention, Interest, Desire, Action)
- 📱 Social Media — Platform-specific tone (LinkedIn, X, Facebook)
- 📈 Analytics — Measurable KPIs and A/B testing

**DevOps Skills:**
- 🔒 Security — OWASP top-10 checks
- ⚡ Performance — Benchmark before/after, p95 latency
- 🏗️ IaC — Infrastructure-as-Code (Terraform/Helm)
- 📚 Docs — Update documentation with every change

**Sales Skills:**
- 💰 Closer — SPIN selling technique
- 🗂️ CRM Expert — CRM-importable field structure
- 🎭 Persona Builder — ICP (Ideal Customer Profile)

**HR Skills:**
- 🌍 DEI — Inclusive job descriptions
- ⚖️ Legal Safe — Flag liability risks
- 💬 Engagement — Employee-first tone

#### 3. **LLM Model Selection**
- Claude Sonnet 4 (Fast & Balanced) — #f97316
- Claude Opus 4 (Most Powerful) — #8b5cf6

#### 4. **Task Templates**
Preset workflow templates with emoji labels:

| ID | Label | Emoji | Description | Prompt Prefix |
|---|---|---|---|---|
| blog-seo | Blog SEO | ✍️ | Write 3 SEO blog posts | "Viết 3 blog posts SEO..." |
| social-batch | Social Batch | 📱 | 30 posts LinkedIn + X | "Tạo 30 social media posts..." |
| ci-refactor | CI/CD | ⚙️ | Refactor pipeline | "Phân tích và refactor CI/CD..." |
| lead-outreach | Lead Outreach | 📧 | Email sequence 5 steps | "Tạo email outreach sequence..." |
| competitor | Competitor | 🔍 | Analyze 10 competitors | "Research và phân tích 10 competitor..." |
| api-docs | API Docs | 📚 | Generate API documentation | "Generate OpenAPI documentation..." |

**Featured Templates:**
1. "Launch Blog Campaign" — 5 blog posts with SEO, meta descriptions, internal linking
2. "Full Social Media Month" — 30 posts across 3 platforms, consistent brand voice
3. "DevOps Pipeline Audit" — GitHub Actions review, bottleneck identification
4. "Sales Outreach Q2" — Personalized email sequences, open rate metrics

#### 5. **Streaming & Output**
- **StreamingMarkdownOutput** component — Character-by-character animation
- **MarkdownOutput** component — Parse markdown, render code blocks with syntax highlighting
- Code block copy buttons
- Support for headers, lists, bold text, code blocks

#### 6. **UI Tabs**
Three main workspace tabs:
1. **Canvas** — Visual workflow/agent arrangement
2. **Runs** — Task execution history & results
3. **Settings** — Agent config, skills, budget limits

#### 7. **Activity Logging**
Live activity log showing:
- Timestamp
- Agent name
- Action description
- Status (info, success, warning, running)
- Color coding per agent

#### 8. **Storage & Persistence**
Local storage keys:
```typescript
STORAGE_KEY = 'skyverses_PAPERCLIP-AI-AGENTS_vault'
THREAD_KEY = (deptId) => `${STORAGE_KEY}_thread_${deptId}`
BRIEF_KEY = (deptId) => `${STORAGE_KEY}_brief_${deptId}`
SKILLS_KEY = (deptId) => `${STORAGE_KEY}_skills_${deptId}`
```

Max thread turns: 10 (20 messages: 10 user + 10 assistant)

#### 9. **Types**
```typescript
interface ActivityLog {
  id: string;
  time: string;
  agent: string;
  action: string;
  status: 'info' | 'success' | 'warning' | 'running';
  color: string;
}

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
```

---

## 🛣️ Routes & Navigation

### Main Route
```typescript
// App.tsx
<Route path="/product/paperclip-ai-agents" element={<PaperclipAIAgents />} />
```

### Navigation Links
- Back link to homepage: `<Link to="/">`
- GitHub link: `https://github.com/paperclip-ing/paperclip`
- Issue reporting: `https://github.com/paperclip-ing/paperclip`

### Page Lazy Loading
```typescript
const pageImports = {
  paperclipAIAgents: () => import('./pages/images/PaperclipAIAgents'),
};

const PaperclipAIAgents = React.lazy(pageImports.paperclipAIAgents);
```

---

## 📊 Data Definition (data.ts)

```typescript
{
  id: 'PAPERCLIP-AI-AGENTS',
  slug: 'paperclip-ai-agents',
  name: {
    en: 'Paperclip — AI Org Orchestrator',
    vi: 'Paperclip — Điều phối AI Doanh nghiệp',
    ko: 'Paperclip — AI 조직 오케스트레이터',
    ja: 'Paperclip — AI組織オーケストレーター'
  },
  category: { en: 'Agent Automation', ... },
  description: { en: 'Open-source platform...', ... },
  problems: [
    'Managing dozens of AI tools with no coordination layer',
    'No audit trail or accountability for autonomous agents',
    'Agent overspending and runaway API costs',
    'Hard to scale multi-agent workflows across projects'
  ],
  industries: [
    'SaaS Startups',
    'Content Agencies',
    'Software Development Teams',
    'E-commerce Operations',
    'Trading & Finance',
    'Customer Support Automation',
    'Marketing & Growth',
    'Solo Founders / Indie Hackers'
  ],
  models: ['claude-sonnet-4-6', 'gpt-4o', 'cursor', 'codex', 'http-webhook'],
  tags: [
    'ai-agents', 'orchestration', 'autonomous', 'multi-agent', 'org-chart',
    'budget-control', 'open-source', 'self-hosted', 'workflow', 'governance',
    'no-code', 'agent-hiring', 'heartbeat', 'ticket-system'
  ],
  features: [
    'Org Chart Agent Hierarchy',
    'Goal Cascading from Company to Task',
    'Per-Agent Monthly Budget Limits',
    'Heartbeat Scheduler',
    'Full Audit Trail via Tickets',
    'Bring-Your-Own Agent (Claude, Codex, Cursor…)',
    'Multi-Company Data Isolation',
    'Mobile Monitoring Dashboard'
  ],
  complexity: 'Enterprise',
  priceReference: 'Open Source / Self-hosted',
  isActive: true,
  priceCredits: 0,
  isFree: true,
  featured: true,
  neuralStack: [
    { name: 'Agent Orchestration Engine', version: 'v1.0', capability: 'Multi-agent goal alignment & task routing' },
    { name: 'Budget Guard', version: 'v1.0', capability: 'Hard spending limits per agent per month' },
    { name: 'Governance Layer', version: 'v1.0', capability: 'Human approvals, overrides & pause controls' }
  ],
  platforms: ['web'],
  homeBlocks: ['featured', 'automation']
}
```

---

## 🖼️ CDN Assets (paperclip-cdn.ts)

All images hosted on Cloudflare CDN (imagedelivery.net):

**Hero Section:**
- `heroDashboard` — Main dashboard mockup screenshot

**Workflow Steps (4):**
- `workflowStep1-4` — Process visualization images

**Features (2):**
- `featMultiAgent` — Multi-agent orchestration visual
- `featBudgetGuard` — Budget guard feature visual

**Showcase Cards (8):**
- `showcaseBlogCampaign`
- `showcaseCicdPipeline`
- `showcaseCrmOutreach`
- `showcasePerfAudit`
- `showcaseSocialBatch`
- `showcaseSupportKb`
- `showcaseCompetitorResearch`
- `showcaseApiDocs`

**Use Cases (8):**
- `usecaseStartup`
- `usecaseSoftwareAgency`
- `usecaseMarketingAgency`
- `usecaseEcommerce`
- `usecaseEdtech`
- `usecaseHealthcare`
- `usecaseFintech`
- `usecaseRemote`

---

## 📐 UI Animations & Shared Components

**Shared Animation Components** (from `components/_shared/SectionAnimations`):
- `GradientMesh` — Animated background gradient
- `FadeInUp` — Fade + slide up animation
- `HoverCard` — Interactive hover effects
- `SectionLabel` — Section header label styling
- `StaggerChildren` — Staggered animation for lists
- `CountUp` — Number counter animation (for stats)

**Libraries:**
- `framer-motion` — Animations and interactions
- `lucide-react` — Icons
- `react-router-dom` — Navigation

---

## ✨ Key Features Summary

1. **Multi-Agent Orchestration**
   - CEO Agent orchestrates department agents
   - Agents can work autonomously or in coordination
   - Task delegation and goal cascading

2. **Budget Guard**
   - Hard spending limits per agent/department/org
   - Auto-pause when budget exceeded
   - Alert notifications

3. **Governance Layer**
   - Human-in-the-loop approvals
   - Full audit trail via tickets
   - Override controls

4. **Multiple LLM Support**
   - Claude (Sonnet, Haiku, Opus)
   - GPT-4o / GPT-4-turbo / GPT-3.5
   - Cursor, GitHub Copilot, Codex
   - OpenAI-compatible APIs

5. **Open Source & Self-Hosted**
   - MIT License
   - Docker Compose setup (~5 min)
   - Data stays in your infrastructure
   - No vendor lock-in

6. **Real-time Dashboard**
   - Live agent activity monitoring
   - Cost tracking per agent/department
   - Workflow visualization
   - Mobile-responsive interface

7. **Workflow Builder**
   - No-code drag-and-drop setup
   - Multi-step automation
   - Agent-to-agent communication
   - Auto-retry on failures

8. **Prompt Inspector**
   - Debug agent prompts in real-time
   - Optimize performance
   - Trace decision paths

---

## 🔍 Search Keywords

- paperclip ai agents
- multi agent orchestration
- ai org chart
- budget guard
- ai automation
- open source ai
- self hosted ai
- CEO agent
- Agent Automation

---

## 📝 Notes

- **Language Support:** English, Vietnamese, Korean, Japanese (full localization)
- **Dark Mode:** Full support with Tailwind CSS
- **Responsive:** Mobile-first design with proper breakpoints
- **Performance:** Lazy-loaded components, image optimization via CDN
- **Accessibility:** Semantic HTML, ARIA labels
- **Interactive Elements:** Hover effects, smooth transitions, streaming text animation

