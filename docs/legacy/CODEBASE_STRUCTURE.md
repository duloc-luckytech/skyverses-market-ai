# Skyverses Market AI - Codebase Structure Report

## 1. ROUTING & PRODUCT PAGE PATTERNS

### Product Routes Structure
**Location:** `/App.tsx`

All products follow the pattern: `/product/<slug>`

**Paperclip AI Agents Specific Route:**
- **Route:** `/product/paperclip-ai-agents`
- **Component:** `PaperclipAIAgents.tsx` (page)
- **Workspace:** `PaperclipAIAgentsWorkspace.tsx` (component)
- **Wizard:** `PaperclipAIAgentsWizard.tsx` (component)

**Generic Fallback Route:**
```typescript
<Route path="/product/:slug" element={<SolutionDetail />} />
```
This catches any product slug not explicitly defined above.

### All Product Routes (40+ routes)
Located in `/App.tsx` lines 224-262:
- `/product/background-removal-ai`
- `/product/social-banner-ai`
- `/product/ai-agent-workflow`
- `/product/captcha-veo3`
- `/product/nocode-export`
- `/product/qwen-chat-ai`
- `/product/ai-slide-creator`
- `/product/ai-birthday-generator`
- `/product/ai-wedding-generator`
- `/product/ai-noel-generator`
- `/product/ai-tet-generator`
- `/product/bat-dong-san-ai`
- `/product/realestate-visual-ai`
- `/product/ai-music-generator`
- `/product/ai-image-restorer`
- `/product/storyboard-studio`
- `/product/fibus-video-studio`
- `/product/ai-stylist`
- `/product/character-sync-ai`
- `/product/ai-video-generator`
- `/product/ai-image-generator`
- `/product/voice-design-ai`
- `/product/ai-voice-studio`
- `/product/studio-architect`
- `/product/avatar-sync-ai`
- `/product/video-animate-ai`
- `/product/text-to-speech`
- `/product/music-generator`
- `/product/product-image`
- `/product/poster-marketing-ai`
- `/product/fashion-center-ai`
- `/product/image-upscale-ai`
- `/product/character-sync-studio`
- `/product/banana-pro-comic-engine`
- `/product/3d-spatial-architect`
- `/product/paperclip-ai-agents`

---

## 2. PAPERCLIP AI AGENTS - PAGE COMPONENT STRUCTURE

### File: `/pages/images/PaperclipAIAgents.tsx` (64 lines)

**Component Props:** None (Simple page with internal state)

**Component State:**
```typescript
const [isStudioOpen, setIsStudioOpen] = useState(false);
```

**Main Sections:**
1. **Hero Section** - CTA with "Thử Paperclip — Miễn Phí" button
2. **Live Stats Bar** - Real-time activity display
3. **Workflow Section** - Visual workflow explanation
4. **Showcase Section** - Feature demos
5. **Features Section** - Key capabilities list
6. **Use Cases Section** - Real-world applications
7. **FAQ Section** - Frequently asked questions
8. **Final CTA** - Bottom call-to-action
9. **Mobile Sticky CTA** - Bottom button for mobile

**Key Props Usage:**
- `onStartStudio={() => setIsStudioOpen(true)}` - Opens the workspace
- `onClose={() => setIsStudioOpen(false)}` - Closes the workspace

**Workspace Integration:**
```typescript
if (isStudioOpen) return (
  <div className="fixed inset-0 z-[500] bg-white dark:bg-[#0a0a0c] animate-in fade-in duration-500">
    <PaperclipAIAgentsWorkspace onClose={() => setIsStudioOpen(false)} />
  </div>
);
```

**Landing Page Components Imported:**
```typescript
import { HeroSection } from '../../components/landing/paperclip-ai-agents/HeroSection';
import { LiveStatsBar } from '../../components/landing/paperclip-ai-agents/LiveStatsBar';
import { WorkflowSection } from '../../components/landing/paperclip-ai-agents/WorkflowSection';
import { ShowcaseSection } from '../../components/landing/paperclip-ai-agents/ShowcaseSection';
import { FeaturesSection } from '../../components/landing/paperclip-ai-agents/FeaturesSection';
import { UseCasesSection } from '../../components/landing/paperclip-ai-agents/UseCasesSection';
import { FAQSection } from '../../components/landing/paperclip-ai-agents/FAQSection';
import { FinalCTA } from '../../components/landing/paperclip-ai-agents/FinalCTA';
```

---

## 3. PAPERCLIP AI AGENTS WORKSPACE COMPONENT

### File: `/components/PaperclipAIAgentsWorkspace.tsx` (4045 lines)

**Component Props:**
```typescript
interface PaperclipAIAgentsWorkspaceProps {
  onClose: () => void;
}
```

**Component Purpose:** Full multi-agent orchestration workspace for Paperclip AI Agents

### Key Data Structures

#### Departments Configuration
```typescript
const DEPARTMENTS = [
  {
    id: 'ceo',
    label: 'CEO Agent',
    icon: Building2,
    color: '#0090ff',
    agent: 'CEO Agent',
    tier: 'orchestrator',
    tasks: ['Delegate tasks to team', 'Strategic brief', 'Org-wide report', 'Budget review'],
    subordinates: ['marketing', 'devops', 'sales', 'hr'],
  },
  {
    id: 'marketing',
    label: 'Marketing AI',
    icon: Megaphone,
    color: '#8b5cf6',
    tier: 'department',
    tasks: ['Viết content SEO', 'Social media posts', 'Email campaign', 'Competitor analysis'],
  },
  {
    id: 'devops',
    label: 'DevOps AI',
    icon: Code2,
    color: '#10b981',
    tier: 'department',
    tasks: ['CI/CD pipeline', 'Code review', 'Deploy automation', 'Performance audit'],
  },
  {
    id: 'sales',
    label: 'Sales AI',
    icon: BarChart3,
    color: '#f59e0b',
    tier: 'department',
    tasks: ['Lead outreach', 'CRM follow-up', 'Proposal drafting', 'Deal analysis'],
  },
  {
    id: 'hr',
    label: 'HR AI',
    icon: Users,
    color: '#06b6d4',
    tier: 'department',
    tasks: ['Job description', 'Screening filter', 'Onboarding docs', 'Policy drafts'],
  },
];
```

#### Department Skills Presets
```typescript
const DEPT_SKILLS: Record<string, Array<{ id: string; label: string; rule: string }>> = {
  ceo: [
    { id: 'strategist',  label: '🎯 Strategist',    rule: 'Think like a board-level strategist...' },
    { id: 'delegator',   label: '🤝 Delegator',     rule: 'Break every goal into clear, delegatable sub-tasks...' },
    { id: 'data-driven', label: '📊 Data-Driven',   rule: 'Back every recommendation with metrics...' },
  ],
  marketing: [
    { id: 'seo',        label: '🔍 SEO Expert',    rule: 'Optimize all content for SEO...' },
    { id: 'copywriter', label: '✍️ Copywriter',    rule: 'Apply AIDA framework...' },
    { id: 'social',     label: '📱 Social Media',  rule: 'Tailor tone for each platform...' },
    { id: 'analytics',  label: '📈 Analytics',     rule: 'Include measurable KPIs...' },
  ],
  devops: [
    { id: 'security', label: '🔒 Security',    rule: 'Apply OWASP top-10 security checks...' },
    { id: 'perf',     label: '⚡ Performance', rule: 'Benchmark before and after every change...' },
    { id: 'iac',      label: '🏗️ IaC',         rule: 'Prefer Infrastructure-as-Code...' },
    { id: 'docs',     label: '📚 Docs',       rule: 'Every code change must include documentation...' },
  ],
  sales: [
    { id: 'closer',  label: '💰 Closer',         rule: 'Use SPIN selling technique...' },
    { id: 'crm',     label: '🗂️ CRM Expert',    rule: 'Structure all outputs as CRM-importable fields...' },
    { id: 'persona', label: '🎭 Persona Builder', rule: 'Define ICP (Ideal Customer Profile)...' },
  ],
  hr: [
    { id: 'dei',        label: '🌍 DEI',        rule: 'Ensure all job descriptions and policies are inclusive...' },
    { id: 'legal',      label: '⚖️ Legal Safe', rule: 'Flag any language that could create legal liability...' },
    { id: 'engagement', label: '💬 Engagement', rule: 'Apply employee-first tone...' },
  ],
};
```

#### Task Templates
```typescript
const TASK_TEMPLATES: StylePreset[] = [
  { id: 'blog-seo',     label: 'Blog SEO',      emoji: '✍️', description: 'Viết 3 blog posts SEO',     promptPrefix: 'Viết 3 blog posts SEO tối ưu về chủ đề: ' },
  { id: 'social-batch', label: 'Social Batch',  emoji: '📱', description: '30 posts LinkedIn + X',      promptPrefix: 'Tạo 30 social media posts cho LinkedIn và X về: ' },
  { id: 'ci-refactor',  label: 'CI/CD',          emoji: '⚙️', description: 'Refactor pipeline',         promptPrefix: 'Phân tích và refactor CI/CD pipeline: ' },
  { id: 'lead-outreach', label: 'Lead Outreach', emoji: '📧', description: 'Email sequence 5 bước',     promptPrefix: 'Tạo email outreach sequence 5 bước cho: ' },
  { id: 'competitor',   label: 'Competitor',    emoji: '🔍', description: 'Phân tích 10 đối thủ',       promptPrefix: 'Research và phân tích 10 competitor trong lĩnh vực: ' },
  { id: 'api-docs',     label: 'API Docs',      emoji: '📚', description: 'Generate API documentation', promptPrefix: 'Generate OpenAPI documentation cho: ' },
];
```

### Workspace UI Components

#### 1. **OrgChartMini** 
Displays CEO at top with department nodes below showing running status
```typescript
const OrgChartMini: React.FC<{ activeDeptId: string; runningDepts: string[] }> = { ... }
```

#### 2. **BudgetMeter**
Progress bar showing budget spent vs. limit
```typescript
const BudgetMeter: React.FC<{ limit: number; spent: number }> = { ... }
```

#### 3. **StreamingMarkdownOutput**
Real-time text streaming markdown renderer with code block syntax highlighting
```typescript
const StreamingMarkdownOutput: React.FC<{ content: string; streaming?: boolean }> = { ... }
```

#### 4. **MarkdownOutput**
Markdown parser with:
- Headings (h1, h2, h3)
- Lists (bullet and numbered)
- Bold text
- Code blocks with copy button
- Syntax highlighting

#### 5. **ProjectSelector**
Dropdown for switching between Paperclip projects (if multiple exist)

### Component State Management

**Main State Variables:**
```typescript
const [showWizard, setShowWizard] = useState(!wizardDone);           // Onboarding wizard
const [mode, setMode] = useState<'studio' | 'history' | 'analytics' | 'canvas'>('studio');
const [activeDeptId, setActiveDeptId] = useState('marketing');       // Current department
const [taskPrompt, setTaskPrompt] = useState('');                    // Task input
const [selectedModel, setSelectedModel] = useState(LLM_MODELS[0]);  // AI Model selection
const [budgetLimit, setBudgetLimit] = useState(5);                  // Budget in dollars
const [runningDepts, setRunningDepts] = useState<string[]>([]);    // Running agent IDs
const [deptBrief, setDeptBrief] = useState('');                     // Department context
const [deptSkills, setDeptSkills] = useState<string[]>([]);        // Enabled skills
const [taskResults, setTaskResults] = useState<TaskResult[]>([]);  // History
const [spentToday, setSpentToday] = useState(0);                    // Budget tracking
const [activeProject, setActiveProject] = useState<PaperclipProject | null>(null);
const [projects, setProjects] = useState<PaperclipProjectSummary[]>([]);
```

### Storage Keys
```typescript
const STORAGE_KEY = 'skyverses_PAPERCLIP-AI-AGENTS_vault';
const THREAD_KEY = (deptId: string) => `${STORAGE_KEY}_thread_${deptId}`;      // Conversation threads
const BRIEF_KEY = (deptId: string) => `${STORAGE_KEY}_brief_${deptId}`;        // Department briefs
const SKILLS_KEY = (deptId: string) => `${STORAGE_KEY}_skills_${deptId}`;      // Enabled skills
const WIZARD_KEY = 'skyverses_PAPERCLIP-AI-AGENTS_wizard_done';                // Wizard completion
const ADVANCED_KEY = 'skyverses_PAPERCLIP-AI-AGENTS_advanced';                 // Advanced mode
const ACTIVE_PROJECT_KEY = 'skyverses_PAPERCLIP-AI-AGENTS__activeProjectId'; // Current project
const MAX_THREAD_TURNS = 10;  // Keep max 10 turns (20 messages)
```

---

## 4. PAPERCLIP AI AGENTS WIZARD COMPONENT

### File: `/components/PaperclipAIAgentsWizard.tsx` (373 lines)

**Component Props:**
```typescript
interface OnboardingWizardProps {
  onComplete: (result: WizardResult) => void;
  onSkip: () => void;
}

export interface WizardResult {
  dept: string;
  budget: number;
  prompt: string;
  runDemo: boolean;
}
```

**Wizard Steps (5 total):**
1. **Welcome** - Introduces Paperclip AI with key features
2. **Dept** - Select department (Marketing/DevOps/Sales/HR)
3. **Task** - Choose first task from department presets
4. **Budget** - Set spending limit ($1-$20) with examples
5. **Ready** - Summary before starting

**Wizard State:**
```typescript
const [step, setStep] = useState(0);
const [direction, setDirection] = useState(1);  // Animation direction
const [selectedDept, setSelectedDept] = useState('marketing');
const [budget, setBudget] = useState(5);
```

**Cost Examples:**
- $1  = 3–5 tasks nhỏ 🌱
- $5  = 15–20 tasks (recommended) ⭐
- $10 = 30+ tasks + Canvas runs 🚀
- $20 = 60+ tasks, production use 🏢

**Department Options:**
- Marketing AI - Content SEO, social media, email
- DevOps AI - CI/CD, code review, deploy
- Sales AI - Lead outreach, CRM, proposals
- HR AI - Job descriptions, screening, onboarding

---

## 5. API TYPES & DATA STRUCTURES

### File: `/apis/paperclipProjects.ts`

**Core Types:**

```typescript
export interface AgentConfig {
  deptId: string;
  brief: string;
  enabledSkills: string[];
}

export interface Thread {
  deptId: string;
  messages: { role: string; content: string }[];
}

export interface ITaskResult {
  id: string;
  dept: string;
  prompt: string;
  output: string;
  status: 'done' | 'error';
  timestamp: string;
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

**API Endpoints:**
- `listProjects()` - List all projects (summary only)
- `getProject(id)` - Fetch project with full data
- `createProject(name)` - Create new project
- `updateProject(id, updates)` - Update project metadata
- `deleteProject(id)` - Hard-delete a project
- `saveAgentConfigs(id, configs)` - Update agent configs
- `saveThreads(id, threads)` - Save conversation threads
- `appendTaskResult(id, result)` - Append to task history

---

## 6. WORKSPACE COMPONENT USAGE PATTERNS

### Pattern 1: Simple Workspace Component
**File:** `/components/AIImageGeneratorWorkspace.tsx`

```typescript
const AIImageGeneratorWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // State management
  const { useCredits, user } = useAuth();
  const { showToast } = useToast();
  
  // Render workspace UI with close button
  return (
    <div>
      {/* Workspace content */}
      <button onClick={onClose}>Close</button>
    </div>
  );
};
```

**Props Pattern:**
- All workspace components accept `onClose: () => void` prop
- Called when user clicks close/exit button
- Parent component manages modal state

### Pattern 2: Page Component Integration
**Pattern used in PaperclipAIAgents.tsx:**

```typescript
const [isStudioOpen, setIsStudioOpen] = useState(false);

if (isStudioOpen) return (
  <div className="fixed inset-0 z-[500]">
    <PaperclipAIAgentsWorkspace 
      onClose={() => setIsStudioOpen(false)} 
    />
  </div>
);

// Show landing page with CTAs
return (
  <div>
    <HeroSection onStartStudio={() => setIsStudioOpen(true)} />
    {/* ... other sections ... */}
  </div>
);
```

### Pattern 3: Agent/Visualization Interface
**File:** `/components/AetherVisualAgentInterface.tsx`

```typescript
interface AgentLog {
  timestamp: string;
  type: 'THINK' | 'PLAN' | 'CREATE' | 'REVIEW' | 'REFINE' | 'DONE';
  message: string;
}

interface VisualConcept {
  id: string;
  prompt: string;
  imageUrl: string | null;
  score: number;
  status: 'pending' | 'success' | 'refining' | 'error';
}

const [loopState, setLoopState] = useState<'IDLE' | 'UNDERSTAND' | 'PLAN' | 'CREATE' | 'REVIEW' | 'REFINE' | 'DELIVER'>('IDLE');
const [logs, setLogs] = useState<AgentLog[]>([]);
const [concepts, setConcepts] = useState<VisualConcept[]>([]);
```

---

## 7. EXISTING AGENT & PRODUCT PAGE EXAMPLES

### Example 1: ProductAIAgent.tsx
- **Path:** `/pages/ProductAIAgent.tsx`
- **Type:** Aether Flow Orchestrator
- **Features:**
  - Hero section with 4-5 rating display
  - "Launch_Flow_Studio" button that opens demo
  - System architecture section
  - Frontend philosophy explanation
  - Integration with `AetherFlowInterface` component

### Example 2: GameCharacterAgentInterface.tsx
- **Components included:** 
  - Agent logs display
  - Status tracking
  - Animation controls

### Example 3: ProductImage.tsx
- Shows pattern for image-based product pages

---

## 8. COMMON UI PATTERNS

### Modal Pattern
```typescript
{isDemoOpen && (
  <div className="fixed inset-0 z-[250] bg-white/98 dark:bg-black/98 flex flex-col">
    <div className="h-16 border-b flex items-center justify-between px-8 shrink-0">
      {/* Header */}
    </div>
    <div className="flex-grow overflow-hidden">
      {/* Workspace component */}
    </div>
  </div>
)}
```

### Toast Notifications
```typescript
const { showToast } = useToast();
showToast('Success message', 'success'); // or 'error', 'info'
```

### Authentication Check
```typescript
const { isAuthenticated, login, user } = useAuth();
if (!isAuthenticated) { login(); return; }
```

### AI Streaming
```typescript
import { aiChatStreamViaProxy } from '../apis/aiCommon';
// Streams response as it's generated
```

---

## 9. STYLING & TAILWIND USAGE

**Color Palette:**
- `brand-blue`: #0090ff
- Department Colors:
  - Marketing: #8b5cf6 (purple)
  - DevOps: #10b981 (green)
  - Sales: #f59e0b (amber)
  - HR: #06b6d4 (cyan)
  - CEO: #0090ff (blue)

**Common Classes:**
- Shadows: `shadow-lg shadow-brand-blue/30`
- Rounded: `rounded-xl`, `rounded-2xl`, `rounded-3xl`
- Borders: `border border-black/[0.08] dark:border-white/[0.08]`
- Text sizes: `text-[10px]`, `text-[12px]`, `text-[13px]` (precise sizing)
- Animations: `animate-in`, `fade-in`, `slide-in-from-bottom-4`
- Transitions: `transition-all duration-300`

---

## 10. FILE SUMMARY

### Key Files to Remember

| File | Lines | Purpose |
|------|-------|---------|
| `pages/images/PaperclipAIAgents.tsx` | 64 | Landing page with hero, sections, CTA |
| `components/PaperclipAIAgentsWorkspace.tsx` | 4045 | Full workspace UI (biggest file) |
| `components/PaperclipAIAgentsWizard.tsx` | 373 | 5-step onboarding wizard |
| `apis/paperclipProjects.ts` | 165 | API types and backend integration |
| `components/AIImageGeneratorWorkspace.tsx` | 400+ | Reference workspace pattern |
| `components/AetherVisualAgentInterface.tsx` | 200+ | Reference agent interface pattern |
| `pages/ProductAIAgent.tsx` | 300+ | Reference product page pattern |
| `App.tsx` | 300+ | Routing configuration |

---

## 11. INTEGRATION POINTS

**When building new product pages:**

1. **Create page component** in `/pages/` matching pattern in `PaperclipAIAgents.tsx`
2. **Add route** in `/App.tsx` following `/product/<slug>` pattern
3. **Import lazy-loaded** in `pageImports` object
4. **Create workspace component** in `/components/` with `onClose` prop
5. **Use localStorage** for state persistence with key prefix
6. **Use auth context** for user/credit management
7. **Use toast context** for notifications
8. **Use AI APIs** via proxy functions (`aiChatStreamViaProxy`, `aiTextViaProxy`)

---

## 12. TECH STACK

- **Framework:** React 18 with TypeScript
- **Routing:** React Router v6
- **Styling:** Tailwind CSS + custom dark mode
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **State:** React hooks (useState, useContext, useCallback, useMemo)
- **Storage:** LocalStorage with prefixed keys
- **APIs:** RESTful via fetch with proxy authentication
- **Markdown:** Custom markdown parser with syntax highlighting

