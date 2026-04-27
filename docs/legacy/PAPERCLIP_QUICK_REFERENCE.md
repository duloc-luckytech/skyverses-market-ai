# Paperclip AI Agents — Quick Reference Guide

## 🚀 Quick Facts

| Property | Value |
|----------|-------|
| **Product ID** | PAPERCLIP-AI-AGENTS |
| **Slug** | `paperclip-ai-agents` |
| **Route** | `/product/paperclip-ai-agents` |
| **Main Page** | `pages/images/PaperclipAIAgents.tsx` |
| **Workspace Component** | `components/PaperclipAIAgentsWorkspace.tsx` |
| **Status** | Active, Featured, Free/Open Source |
| **Category** | Agent Automation |
| **License** | MIT |
| **Self-hosted Setup Time** | ~5 minutes |

---

## 📂 Key Files at a Glance

```
LANDING PAGE SECTIONS (in components/landing/paperclip-ai-agents/):
├── HeroSection.tsx          — Main hero with CTA
├── LiveStatsBar.tsx         — Key metrics display
├── WorkflowSection.tsx      — 4-step process flow
├── ShowcaseSection.tsx      — 8 real agent run examples
├── FeaturesSection.tsx      — 8 core features (2 featured)
├── UseCasesSection.tsx      — 8 industry use cases
├── FAQSection.tsx           — 6 FAQ items in accordion
└── FinalCTA.tsx             — Final conversion CTA

CORE COMPONENTS:
├── PaperclipAIAgents.tsx         — Main page (landing + studio toggle)
└── PaperclipAIAgentsWorkspace.tsx — Interactive AI orchestration studio

DATA & CONSTANTS:
├── data.ts                  — Product definition (line 82-162)
├── src/constants/paperclip-cdn.ts — CDN image URLs (23 images)
└── types.ts                 — Type definitions
```

---

## 🎯 Component Summary

### Landing Page Structure
```
PaperclipAIAgents (main page)
├── [Landing Mode] ← Default view
│   ├── HeroSection
│   ├── LiveStatsBar (2400+ stars, 8 LLMs, 99% uptime, MIT ✓, 5 min setup)
│   ├── WorkflowSection (4 steps)
│   ├── ShowcaseSection (8 agent runs, filterable)
│   ├── FeaturesSection (2 featured + 6 regular)
│   ├── UseCasesSection (8 industries)
│   ├── FAQSection (6 Q&A)
│   ├── FinalCTA
│   └── Mobile Sticky CTA
│
└── [Studio Mode] ← Click "Try Now" button
    └── PaperclipAIAgentsWorkspace (fullscreen modal)
        ├── 5 Departments (CEO, Marketing, DevOps, Sales, HR)
        ├── Task Input & Templates
        ├── 3 Tabs (Canvas, Runs, Settings)
        └── Live Activity Log
```

---

## 🧠 Workspace Architecture

### Departments & Skills

| Dept | Color | Tasks | Skills | Agent |
|------|-------|-------|--------|-------|
| **CEO** | Blue (#0090ff) | Delegate, Brief, Report, Budget | Strategist, Delegator, Data-Driven | Orchestrator |
| **Marketing** | Purple (#8b5cf6) | SEO, Social, Email, Analysis | SEO Expert, Copywriter, Social, Analytics | Department |
| **DevOps** | Green (#10b981) | CI/CD, Review, Deploy, Audit | Security, Performance, IaC, Docs | Department |
| **Sales** | Amber (#f59e0b) | Outreach, CRM, Proposal, Deal | Closer, CRM Expert, Persona Builder | Department |
| **HR** | Cyan (#06b6d4) | Job Desc, Screen, Onboard, Policy | DEI, Legal Safe, Engagement | Department |

### Task Templates

| Template ID | Label | Use Case | Emoji |
|------------|-------|----------|-------|
| `blog-seo` | Blog SEO | Write 3 SEO blog posts | ✍️ |
| `social-batch` | Social Batch | 30 posts across 3 platforms | 📱 |
| `ci-refactor` | CI/CD | Refactor GitHub Actions pipeline | ⚙️ |
| `lead-outreach` | Lead Outreach | 5-step email sequences | 📧 |
| `competitor` | Competitor Analysis | Research 10 competitors | 🔍 |
| `api-docs` | API Docs | Generate OpenAPI documentation | 📚 |

### LLM Models Available

- **Claude Sonnet 4** (Fast & Balanced) — #f97316
- **Claude Opus 4** (Most Powerful) — #8b5cf6

---

## 🛣️ Navigation & Routes

```typescript
// Main route in App.tsx
<Route path="/product/paperclip-ai-agents" element={<PaperclipAIAgents />} />

// Navigation
- ← Back to home: Link to "/"
- 📊 GitHub: https://github.com/paperclip-ing/paperclip
- 🐛 Issues: https://github.com/paperclip-ing/paperclip
```

---

## 📊 Showcase Agent Runs (8 Examples)

1. **Blog Content Campaign** (Marketing, completed, $0.24)
   - claude-sonnet, 5 blog posts + meta + internal links

2. **CI/CD Pipeline Refactor** (DevOps, running, $0.18)
   - cursor + gpt-4o, optimize GitHub Actions

3. **CRM Lead Outreach** (Sales, completed, $0.09)
   - gpt-4o, 50 personalized emails

4. **Performance Audit Report** (DevOps, completed, $0.31)
   - claude-sonnet, Lighthouse + Core Web Vitals

5. **Social Media Content Batch** (Marketing, running, $0.07)
   - claude-sonnet, 30 posts (LinkedIn, X, Facebook)

6. **Support Knowledge Base** (Operations, waiting, $0.00)
   - gpt-4o, Notion aggregation (awaiting human approval)

7. **Competitor Analysis Q2** (Marketing, completed, $0.42)
   - claude-sonnet, 10 competitors + SWOT matrix

8. **API Documentation Update** (DevOps, completed, $0.15)
   - cursor, OpenAPI spec + code examples

---

## 📸 Use Cases (8 Industries)

1. **Startup & Scale-up** — Run ops with small team
2. **Software Agency** — CEO Agent → Dev AI, Review AI, Docs AI
3. **Marketing Agency** — Multi-client with isolated budgets
4. **E-commerce** — Product listings, ads, uptime monitoring
5. **Edtech** — Curriculum, grading, marketing, FAQs
6. **Healthcare** — Appointments, pre-auth, compliance (HIPAA)
7. **FinTech** — Risk analysis, reports, compliance (human-in-loop)
8. **Remote-first** — 24/7 org chart across timezones

---

## ⚙️ State Management

### Page Level
```typescript
const [isStudioOpen, setIsStudioOpen] = useState(false);
```

### Workspace Level
```typescript
const [activeTab, setActiveTab] = useState<'canvas' | 'runs' | 'settings'>('canvas');
const [selectedDept, setSelectedDept] = useState('ceo');
const [taskInput, setTaskInput] = useState('');
const [isRunning, setIsRunning] = useState(false);
const [taskResults, setTaskResults] = useState<TaskResult[]>([]);
const [canvasNodes, setCanvasNodes] = useState<CanvasNodeState[]>([]);
```

---

## 💾 Local Storage Keys

```typescript
// Vault prefix
'skyverses_PAPERCLIP-AI-AGENTS_vault'
  ├── _thread_{deptId}   — Chat history per department
  ├── _brief_{deptId}    — Task brief per department
  └── _skills_{deptId}   — Selected skills per department

// Max turns: 10 (20 messages: 10 user + 10 assistant)
```

---

## 🖼️ CDN Assets (23 Images)

### Hero (1)
- `heroDashboard`

### Workflow Steps (4)
- `workflowStep1` → Define org chart
- `workflowStep2` → Assign LLM & tools
- `workflowStep3` → Set budget & governance
- `workflowStep4` → Run & monitor

### Features (2)
- `featMultiAgent` — Multi-agent orchestration
- `featBudgetGuard` — Budget control visuals

### Showcase Runs (8)
- `showcaseBlogCampaign`, `showcaseCicdPipeline`, `showcaseCrmOutreach`
- `showcasePerfAudit`, `showcaseSocialBatch`, `showcaseSupportKb`
- `showcaseCompetitorResearch`, `showcaseApiDocs`

### Use Cases (8)
- `usecaseStartup`, `usecaseSoftwareAgency`, `usecaseMarketingAgency`
- `usecaseEcommerce`, `usecaseEdtech`, `usecaseHealthcare`
- `usecaseFintech`, `usecaseRemote`

All hosted on Cloudflare: `imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/`

---

## ✨ Core Features at a Glance

| Feature | Description |
|---------|------------|
| **Multi-Agent Orchestration** | CEO Agent coordinates department agents autonomously |
| **Budget Guard** | Hard spend limits per agent/department/org with auto-pause |
| **Governance Layer** | Human-in-the-loop approvals + full audit trail |
| **Self-hosted** | Docker Compose, ~5 min setup, MIT License |
| **LLM Flexibility** | Claude, GPT-4o, Cursor, Codex, any OpenAI-compatible |
| **Real-time Dashboard** | Live activity, cost tracking, workflow visualization |
| **No-code Builder** | Drag-drop workflows, preset templates |
| **Prompt Inspector** | Debug agent prompts in real-time |
| **Auto-failover** | Switch providers if one goes down |
| **Data Privacy** | Self-hosted = data stays in your infrastructure |

---

## 🎨 Animations & Libraries

**Framer Motion:**
- `motion.div`, `motion.button`, `motion.span`
- Hover effects, scroll triggers, stagger animations
- GPU-accelerated transforms

**Lucide React Icons:**
- `Network`, `DollarSign`, `ShieldCheck`, `Globe`
- `Building2`, `Megaphone`, `Code2`, `Users`, etc.

**Shared Components:**
- `GradientMesh` — Animated background
- `FadeInUp` — Scroll-triggered animations
- `HoverCard` — Interactive cards
- `SectionLabel` — Section headers
- `CountUp` — Number animations

---

## 🌍 Localization

Fully localized to 4 languages:
- **English** (en)
- **Vietnamese** (vi)
- **Korean** (ko)
- **Japanese** (ja)

All product text uses `LocalizedString` type:
```typescript
name: {
  en: 'Paperclip — AI Org Orchestrator',
  vi: 'Paperclip — Điều phối AI Doanh nghiệp',
  ko: 'Paperclip — AI 조직 오케스트레이터',
  ja: 'Paperclip — AI組織オーケストレーター'
}
```

---

## 🔍 FAQ Topics (6)

1. How is it different from AutoGPT/CrewAI?
2. Which LLM models are supported?
3. How does Budget Guard work?
4. What infrastructure needed for self-hosted?
5. Will data be used to train models?
6. What does MIT license mean?

---

## 📊 Data Definition Checklist

```typescript
✓ id: 'PAPERCLIP-AI-AGENTS'
✓ slug: 'paperclip-ai-agents'
✓ name: { en, vi, ko, ja }
✓ category: 'Agent Automation'
✓ description: { en, vi, ko, ja }
✓ problems: [4 problems]
✓ industries: [8 industries]
✓ models: [claude-sonnet-4-6, gpt-4o, cursor, codex, http-webhook]
✓ tags: [12 tags]
✓ features: [8 features]
✓ complexity: 'Enterprise'
✓ priceReference: 'Open Source / Self-hosted'
✓ isActive: true
✓ isFree: true
✓ featured: true
✓ priceCredits: 0
✓ neuralStack: [3 neural components]
✓ platforms: ['web']
✓ homeBlocks: ['featured', 'automation']
```

---

## 🎯 Key CTAs

1. **Hero Section** → "Thử Ngay" (Try Now)
2. **Final CTA Section** → "Thử Ngay — Miễn Phí" (Try Now — Free)
3. **Mobile Sticky** → "Thử Paperclip — Miễn Phí" (Try Paperclip — Free)
4. **GitHub Links** → "Mở issue trên GitHub" & "View on GitHub"

All CTAs open studio modal or external GitHub links.

---

## 🚀 Quick Start for Modifications

### To Add a New Agent Department:
1. Add to `DEPARTMENTS` array in `PaperclipAIAgentsWorkspace.tsx`
2. Add skills to `DEPT_SKILLS` object
3. Add color hex code
4. Add icon from lucide-react

### To Add a New Task Template:
1. Add to `TASK_TEMPLATES` array
2. Include: id, label, emoji, description, promptPrefix
3. Add featured template if needed

### To Add FAQ:
1. Add object to `FAQ_ITEMS` array in `FAQSection.tsx`
2. Include: q (question), a (answer)

### To Add Use Case:
1. Add to `USE_CASES` array in `UseCasesSection.tsx`
2. Add CDN image URL to `paperclip-cdn.ts`
3. Include icon, color, description

---

## 📝 Development Notes

- **Main Page File:** ~1200 lines, structured, uses Suspense for code-splitting
- **Workspace File:** ~2000+ lines, comprehensive AI orchestration demo
- **Landing Sections:** Each is ~80-200 lines, focused responsibility
- **No External APIs:** All demo data is hardcoded (no API calls)
- **Storage:** Local storage only, no server persistence
- **Streaming:** Real-time markdown rendering with character-by-character animation
- **Responsive:** Mobile-first design, proper Tailwind breakpoints
- **Dark Mode:** Full support with `dark:` prefix utilities

---

## 🔗 External Links

- GitHub Repository: https://github.com/paperclip-ing/paperclip
- Issues/Questions: Same GitHub repo
- No external API calls or third-party services

