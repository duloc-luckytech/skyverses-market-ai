# Paperclip AI Agents — Implementation Examples & Code Snippets

**Quick reference for common development tasks**

---

## 📋 Table of Contents
1. [Adding a New Skill to an Agent](#adding-a-new-skill-to-an-agent)
2. [Adding a New Department Agent](#adding-a-new-department-agent)
3. [Adding a New Task Template](#adding-a-new-task-template)
4. [Building Custom System Prompts](#building-custom-system-prompts)
5. [Extending Task Results with Custom Fields](#extending-task-results-with-custom-fields)
6. [Creating a New View Mode](#creating-a-new-view-mode)
7. [Integrating with External APIs](#integrating-with-external-apis)
8. [Adding Budget-Based Feature Gating](#adding-budget-based-feature-gating)

---

## Adding a New Skill to an Agent

### Scenario
You want to add an "AI-Powered" skill to the Marketing agent that forces all content to include AI-specific language.

### Code Changes

**File:** `components/PaperclipAIAgentsWorkspace.tsx`

**Step 1: Add to DEPT_SKILLS**
```typescript
// Around line 53, in the marketing section:
const DEPT_SKILLS: Record<string, Array<{ id: string; label: string; rule: string }>> = {
  // ... existing code ...
  marketing: [
    { id: 'seo',        label: '🔍 SEO Expert',     rule: 'Optimize all content for SEO: target keywords, meta description, internal links, readability score.' },
    { id: 'copywriter', label: '✍️ Copywriter',      rule: 'Apply AIDA framework (Attention, Interest, Desire, Action) in all copy.' },
    { id: 'social',     label: '📱 Social Media',    rule: 'Tailor tone for each platform: LinkedIn (professional), X (concise), Facebook (friendly).' },
    { id: 'analytics',  label: '📈 Analytics',       rule: 'Include measurable KPIs and A/B test hypotheses in every campaign plan.' },
    
    // ✨ NEW SKILL:
    { id: 'ai-powered', label: '🤖 AI-Powered',     rule: 'Emphasize AI efficiency, automation benefits, and productivity gains. Include AI-specific terminology where relevant.' },
  ],
  // ... rest of departments ...
};
```

**Step 2: Test in the UI**
1. Open Workspace
2. Select "Marketing AI" agent
3. Go to "Setup" tab on right sidebar
4. Look for "🤖 AI-Powered" checkbox
5. Enable it
6. Run a task
7. Go to "Prompt" tab → you should see your new rule in the system prompt

### How Skills Work Under the Hood

When a task executes, the `executeRun` function (line 1140) builds the system prompt like this:

```typescript
const activeSkillRules = (enabledSkills[activeDept] ?? [])
  .map(sid => DEPT_SKILLS[activeDept]?.find(s => s.id === sid)?.rule)
  .filter(Boolean) as string[];

const builtSystemPrompt = buildSystemMessage({
  role: `Bạn là ${dept.agent}...`,
  rules: [
    'Thực hiện task được giao...',
    'Dùng markdown formatting...',
    ...activeSkillRules,  // ← Your skill rules injected here
  ],
}).content as string;
```

So if user enables "AI-Powered" skill, the system prompt will include: `"Emphasize AI efficiency, automation benefits..."`

---

## Adding a New Department Agent

### Scenario
You want to add a "Product AI" agent to handle product development tasks.

### Code Changes

**File:** `components/PaperclipAIAgentsWorkspace.tsx`

**Step 1: Add Department to DEPARTMENTS array (around line 86)**
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
    subordinates: ['marketing', 'devops', 'sales', 'hr', 'product'], // ← Add 'product' here
  },
  // ... existing departments ...
  
  // ✨ NEW DEPARTMENT:
  {
    id: 'product',
    label: 'Product AI',
    icon: Package,  // ← Import from lucide-react at top
    color: '#ec4899', // Pink
    agent: 'Product Manager Agent',
    tier: 'department',
    tasks: ['PRD template', 'User story mapping', 'Feature prioritization', 'Roadmap planning'],
    subordinates: [],
  },
];
```

**Step 2: Import the icon at top of file**
```typescript
import {
  X, Sparkles, ChevronDown, ChevronRight, Coins,
  Network, Building2, Code2, Megaphone, Users, BarChart3,
  Package,  // ← ADD THIS
  // ... rest of imports ...
} from 'lucide-react';
```

**Step 3: Add skills for Product department**
```typescript
const DEPT_SKILLS: Record<string, ...> = {
  // ... existing departments ...
  
  // ✨ NEW SKILLS:
  product: [
    { id: 'agile',      label: '🏃 Agile',           rule: 'Structure all PRDs and user stories using Agile/Scrum methodology. Include story points estimation.' },
    { id: 'ux-focused', label: '🎨 UX-Focused',      rule: 'Prioritize user experience and accessibility (WCAG compliance) in every product decision.' },
    { id: 'metrics',    label: '📊 Metrics-Driven',  rule: 'Every feature must have success metrics defined: OKRs, KPIs, target user satisfaction score.' },
    { id: 'roadmap',    label: '🗺️ Roadmap Master', rule: 'Think in quarters (Q1, Q2, etc.). Clearly separate: Now, Soon, Later. Include dependencies and tech debt.' },
  ],
};
```

**Step 4: Add to task templates (optional)**
```typescript
const TASK_TEMPLATES: StylePreset[] = [
  // ... existing templates ...
  
  // ✨ NEW TEMPLATE:
  { id: 'product-prd',  label: 'PRD Template',  emoji: '📋', description: 'Generate PRD structure',      promptPrefix: 'Create a PRD for feature: ' },
];
```

**Step 5: Verification**
- Workspace loads → "Product AI" appears in agent selector
- Select Product AI → setup tab shows the 4 skills
- Run canvas → Product node appears after CEO
- Enable skills → rules appear in system prompt

---

## Adding a New Task Template

### Scenario
You want to add a "Email Campaign" template for the Marketing agent.

### Code Changes

**File:** `components/PaperclipAIAgentsWorkspace.tsx`

**Around line 144, add to TASK_TEMPLATES:**
```typescript
const TASK_TEMPLATES: StylePreset[] = [
  { id: 'blog-seo',     label: 'Blog SEO',      emoji: '✍️', description: 'Viết 3 blog posts SEO',     promptPrefix: 'Viết 3 blog posts SEO tối ưu về chủ đề: ' },
  { id: 'social-batch', label: 'Social Batch',  emoji: '📱', description: '30 posts LinkedIn + X',      promptPrefix: 'Tạo 30 social media posts cho LinkedIn và X về: ' },
  { id: 'ci-refactor',  label: 'CI/CD',          emoji: '⚙️', description: 'Refactor pipeline',         promptPrefix: 'Phân tích và refactor CI/CD pipeline: ' },
  { id: 'lead-outreach', label: 'Lead Outreach', emoji: '📧', description: 'Email sequence 5 bước',     promptPrefix: 'Tạo email outreach sequence 5 bước cho: ' },
  { id: 'competitor',   label: 'Competitor',    emoji: '🔍', description: 'Phân tích 10 đối thủ',       promptPrefix: 'Research và phân tích 10 competitor trong lĩnh vực: ' },
  { id: 'api-docs',     label: 'API Docs',      emoji: '📚', description: 'Generate API documentation', promptPrefix: 'Generate OpenAPI documentation cho: ' },
  
  // ✨ NEW TEMPLATE:
  { id: 'email-campaign', label: 'Email Campaign', emoji: '💌', description: 'Create email sequence', promptPrefix: 'Design email campaign for product launch targeting: ' },
];
```

**Also add to FEATURED_TEMPLATES (around line 153):**
```typescript
const FEATURED_TEMPLATES = [
  { label: 'Launch Blog Campaign',    prompt: 'Viết 5 blog posts SEO về AI automation cho doanh nghiệp vừa và nhỏ, mỗi bài 1200 từ, có meta description và internal linking strategy', style: 'Blog SEO' },
  // ... existing templates ...
  
  // ✨ NEW FEATURED TEMPLATE:
  { label: 'Holiday Email Promo',     prompt: 'Create a 4-email holiday promotion sequence: teaser → offer → scarcity → follow-up. Target: e-commerce, mobile-first design', style: 'Email Campaign' },
];
```

---

## Building Custom System Prompts

### Scenario
You want to allow users to write custom system prompts for advanced use cases (e.g., "Pretend you're a McKinsey consultant").

### Code Changes

**File:** `components/PaperclipAIAgentsWorkspace.tsx`

**Step 1: Add to right sidebar "Prompt" tab (around line 2650)**
```typescript
// In the "Prompt" tab content section:
<div className="space-y-4">
  <div>
    <p className="text-[11px] font-bold text-slate-500 dark:text-[#555] uppercase tracking-widest mb-2">
      System Prompt
    </p>
    
    {!isEditingPrompt ? (
      <div className="relative">
        <div className="bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl p-3 text-[11px] font-mono text-slate-700 dark:text-white/70 max-h-[300px] overflow-y-auto whitespace-pre-wrap break-words">
          {currentResult?.systemPrompt || 'No prompt yet'}
        </div>
        
        {advancedMode && (
          <button
            onClick={() => {
              setEditedSystemPrompt(currentResult?.systemPrompt || '');
              setIsEditingPrompt(true);
            }}
            className="mt-2 px-3 py-1.5 text-[10px] font-bold bg-brand-blue/10 text-brand-blue rounded-lg hover:bg-brand-blue/20 transition-colors"
          >
            ✏️ Edit & Override
          </button>
        )}
      </div>
    ) : (
      <div className="space-y-2">
        <textarea
          value={editedSystemPrompt}
          onChange={(e) => setEditedSystemPrompt(e.target.value)}
          rows={8}
          className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-[11px] font-mono text-slate-700 dark:text-white/70 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          placeholder="Enter custom system prompt..."
        />
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditingPrompt(false)}
            className="px-3 py-1.5 text-[10px] font-bold bg-slate-200 dark:bg-white/10 rounded-lg hover:bg-slate-300 dark:hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Save and run with custom prompt
              executeRun(editedSystemPrompt);
              setIsEditingPrompt(false);
            }}
            className="px-3 py-1.5 text-[10px] font-bold bg-brand-blue text-white rounded-lg hover:brightness-110 transition-all"
          >
            Run with Custom Prompt
          </button>
        </div>
      </div>
    )}
  </div>
</div>
```

**Step 2: Update executeRun signature (already supports this!)**
```typescript
// executeRun already accepts overrideSystemPrompt parameter:
const executeRun = useCallback(async (overrideSystemPrompt?: string) => {
  // ...
  const builtSystemPrompt: string = overrideSystemPrompt ?? (buildSystemMessage({
    // ... auto-build if no override ...
  }).content as string);
  // ...
}, [...]);
```

---

## Extending Task Results with Custom Fields

### Scenario
You want to track "confidence score" (0–100) and "estimated ROI" for each task result.

### Code Changes

**File:** `components/PaperclipAIAgentsWorkspace.tsx`

**Step 1: Update TaskResult interface (around line 172)**
```typescript
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
  confidence?: number;     // ← Already defined (0–100)
  starred?: boolean;       // ← Already defined
  
  // ✨ NEW FIELDS:
  estimatedROI?: number;   // Dollar value ROI
  targetAudience?: string; // e.g., "SMB", "Enterprise"
  successMetrics?: string[]; // KPIs to track
}
```

**Step 2: Update executeRun to populate new fields (around line 1246)**
```typescript
const doneResult: TaskResult = {
  ...pendingResult,
  output,
  status: wasAborted ? 'done' : 'done',
  duration,
  tokens: taskTokens,
  cost: `~$${taskCost.toFixed(3)}`,
  
  // ✨ POPULATE NEW FIELDS:
  estimatedROI: Math.random() * 10000, // Mock for now — integrate with real calc
  targetAudience: 'SMB',
  successMetrics: ['Click-through rate', 'Conversion rate', 'Time spent'],
};
```

**Step 3: Display in History/Output view**
```typescript
// In output section:
{currentResult && (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-2 text-[10px]">
      <div className="bg-slate-50 dark:bg-white/[0.05] rounded px-2 py-1">
        <p className="text-slate-500 dark:text-[#555]">Cost</p>
        <p className="font-bold">{currentResult.cost}</p>
      </div>
      <div className="bg-slate-50 dark:bg-white/[0.05] rounded px-2 py-1">
        <p className="text-slate-500 dark:text-[#555]">Tokens</p>
        <p className="font-bold">{currentResult.tokens || '—'}</p>
      </div>
      
      {/* ✨ NEW FIELDS: */}
      {currentResult.estimatedROI && (
        <div className="bg-green-50 dark:bg-green-500/10 rounded px-2 py-1">
          <p className="text-green-600 dark:text-green-400">Est. ROI</p>
          <p className="font-bold">${currentResult.estimatedROI.toFixed(0)}</p>
        </div>
      )}
      {currentResult.targetAudience && (
        <div className="bg-blue-50 dark:bg-blue-500/10 rounded px-2 py-1">
          <p className="text-blue-600 dark:text-blue-400">Target</p>
          <p className="font-bold">{currentResult.targetAudience}</p>
        </div>
      )}
    </div>
    
    {currentResult.successMetrics && (
      <div className="bg-slate-50 dark:bg-white/[0.05] rounded px-3 py-2">
        <p className="text-[9px] font-bold text-slate-500 dark:text-[#555] mb-1">Success Metrics</p>
        <div className="flex flex-wrap gap-1">
          {currentResult.successMetrics.map(m => (
            <span key={m} className="text-[9px] bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded">
              {m}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
)}
```

---

## Creating a New View Mode

### Scenario
You want to add a "Coaching" mode that explains why each agent made certain decisions.

### Code Changes

**File:** `components/PaperclipAIAgentsWorkspace.tsx`

**Step 1: Update viewMode type (around line 678)**
```typescript
const [viewMode, setViewMode] = useState<'studio' | 'history' | 'analytics' | 'canvas' | 'coaching'>('studio');
//                                                                                              ↑
//                                                                                         NEW MODE
```

**Step 2: Add coaching state (around line 750)**
```typescript
const [coachingHistory, setCoachingHistory] = useState<Array<{
  task: string;
  agentThinking: string;  // Explanation from agent
  skillsApplied: string[];
  decisionRationale: string;
}>>([]);
```

**Step 3: Add tab button to top navigation (find view mode tabs, around line 2100)**
```typescript
<button
  onClick={() => setViewMode('coaching')}
  className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${
    viewMode === 'coaching'
      ? 'bg-brand-blue text-white'
      : 'text-slate-500 dark:text-[#555] hover:bg-black/[0.05] dark:hover:bg-white/[0.05]'
  }`}
>
  🎓 Coaching
</button>
```

**Step 4: Add coaching view content**
```typescript
{viewMode === 'coaching' && (
  <div className="space-y-4">
    <div className="px-4 py-3 bg-brand-blue/10 rounded-lg border border-brand-blue/20">
      <p className="text-[12px] font-bold text-brand-blue mb-2">Agent Decision Coaching</p>
      <p className="text-[11px] text-slate-700 dark:text-white/60">
        Learn why the agent chose specific skills and approaches for each task.
      </p>
    </div>
    
    {coachingHistory.map((item, i) => (
      <div key={i} className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 dark:bg-white/[0.04] border-b border-black/[0.06] dark:border-white/[0.06]">
          <p className="text-[11px] font-bold text-slate-800 dark:text-white">Task: {item.task.slice(0, 60)}...</p>
        </div>
        <div className="px-4 py-3 space-y-3">
          <div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-[#555] mb-1">Agent Thinking:</p>
            <p className="text-[11px] text-slate-700 dark:text-white/70">{item.agentThinking}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-[#555] mb-1">Skills Applied:</p>
            <div className="flex flex-wrap gap-1">
              {item.skillsApplied.map(s => (
                <span key={s} className="text-[9px] bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-[#555] mb-1">Decision Rationale:</p>
            <p className="text-[11px] text-slate-700 dark:text-white/70">{item.decisionRationale}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
```

---

## Integrating with External APIs

### Scenario
You want to send completed tasks to Slack automatically.

### Code Changes

**File:** `apis/paperclipProjects.ts`

**Add new function:**
```typescript
/**
 * Send task result to Slack webhook
 */
export const notifySlackTaskComplete = async (
  webhookUrl: string,
  result: ITaskResult,
  departmentLabel: string,
): Promise<void> => {
  const message = {
    text: `Task Completed: ${result.dept}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${departmentLabel}* completed a task\n\n*Prompt:* ${result.prompt}\n\n*Status:* ${result.status === 'done' ? '✅ Done' : '⚠️ Error'}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Output:*\n\`\`\`\n${result.output.slice(0, 500)}\n\`\`\``,
        },
      },
    ],
  };

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });

  if (!res.ok) {
    throw new Error(`Slack notification failed: ${res.status}`);
  }
};
```

**File:** `components/PaperclipAIAgentsWorkspace.tsx`

**Add to state:**
```typescript
const [slackWebhookUrl, setSlackWebhookUrl] = useState<string>(() => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY + '_slack_webhook') || '';
});
```

**Update executeRun to notify Slack:**
```typescript
// After successful task completion (around line 1282):
if (slackWebhookUrl) {
  try {
    await projectsApi.notifySlackTaskComplete(slackWebhookUrl, {
      id: doneResult.id,
      dept: doneResult.dept,
      prompt: doneResult.taskDesc,
      output: doneResult.output,
      status: 'done',
      timestamp: doneResult.timestamp,
    }, dept.label);
  } catch (err) {
    console.error('Failed to notify Slack:', err);
  }
}
```

**Add settings UI in "Setup" tab:**
```typescript
<div>
  <p className="text-[10px] font-bold text-slate-500 dark:text-[#555] mb-2">Slack Webhook URL</p>
  <input
    type="password"
    value={slackWebhookUrl}
    onChange={(e) => {
      setSlackWebhookUrl(e.target.value);
      localStorage.setItem(STORAGE_KEY + '_slack_webhook', e.target.value);
    }}
    placeholder="https://hooks.slack.com/services/..."
    className="w-full text-[11px] px-2 py-1.5 border border-slate-200 dark:border-white/[0.08] rounded-lg bg-white dark:bg-white/[0.04]"
  />
</div>
```

---

## Adding Budget-Based Feature Gating

### Scenario
Some features (like Canvas multi-agent orchestration) should only be available if user has enough budget remaining.

### Code Changes

**File:** `components/PaperclipAIAgentsWorkspace.tsx`

**Step 1: Define feature costs (add near top with constants)**
```typescript
const FEATURE_COSTS: Record<string, number> = {
  'canvas-flow': 2.5,      // Canvas orchestration costs $2.50
  'coaching-mode': 0.5,    // Coaching analysis costs $0.50
  'export-pdf': 0.25,      // PDF export costs $0.25
};
```

**Step 2: Add validation function**
```typescript
const canUseFeature = (featureName: string): boolean => {
  const cost = FEATURE_COSTS[featureName] ?? 0;
  const remaining = budgetLimit - spentBudget;
  return remaining >= cost;
};
```

**Step 3: Gate Canvas button**
```typescript
<button
  onClick={() => {
    if (!canUseFeature('canvas-flow')) {
      showToast(`Insufficient budget for Canvas ($${FEATURE_COSTS['canvas-flow']}). Remaining: $${(budgetLimit - spentBudget).toFixed(2)}`, 'error');
      return;
    }
    setViewMode('canvas');
  }}
  disabled={!canUseFeature('canvas-flow')}
  className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${
    canUseFeature('canvas-flow')
      ? 'text-slate-600 dark:text-[#555] hover:bg-black/[0.05]'
      : 'opacity-50 cursor-not-allowed'
  }`}
>
  {canUseFeature('canvas-flow') ? '🎨 Canvas' : '🎨 Canvas (Insufficient budget)'}
</button>
```

---

## 🎓 Best Practices

1. **Always use `useCallback` for functions that depend on state**
   ```typescript
   const handleRun = useCallback(async () => {
     // ... uses taskPrompt, isRunning, etc.
   }, [taskPrompt, isRunning, /* all dependencies */]);
   ```

2. **Persist state to localStorage AND backend API**
   ```typescript
   // Save locally immediately
   localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
   // Also sync to backend for persistence
   if (isAuthenticated && activeProjectId) {
     projectsApi.appendTaskResult(activeProjectId, result).catch(() => {});
   }
   ```

3. **Always use proper TypeScript interfaces**
   ```typescript
   interface MyNewFeature {
     id: string;
     name: string;
     value: number;
   }
   ```

4. **Test streaming by checking `isStreaming` flag**
   ```typescript
   {isStreaming && <span className="animate-pulse">Streaming...</span>}
   ```

5. **Use Activity logs for transparency**
   ```typescript
   addLog(deptName, 'Action description', 'status', '#color');
   ```

---

**End of Implementation Examples**
