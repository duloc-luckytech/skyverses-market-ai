# Storyboard Studio Codebase Exploration — Phase 3 AI Script Assistant Patterns

**Date:** April 10, 2026  
**Focus:** Understanding patterns for building an AI Script Assistant panel (collapsible, streaming, sidebar integration)

---

## 1. FULL SOURCE: `apis/aiChat.ts`

**Location:** `/apis/aiChat.ts`

```typescript
/**
 * aiChat.ts — Skyverses AI Chat API client
 * Wraps POST /ai/chat (proxy → ezaiapi.com/v1/chat/completions / claude-sonnet-4-5)
 * Supports: single-shot JSON mode, streaming SSE mode
 * Used by: Storyboard Studio script analysis, AI planning flows, etc.
 */

import { API_BASE_URL, getHeaders } from './config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIChatOptions {
  messages: ChatMessage[];
  stream?: boolean;
  onToken?: (token: string) => void; // called per SSE chunk in stream mode
  signal?: AbortSignal;
}

export interface AIChatResult {
  content: string;
  usage?: { prompt_tokens: number; completion_tokens: number };
}

/**
 * Single-shot JSON call. Returns parsed response text.
 */
export const aiChatOnce = async (
  messages: ChatMessage[],
  signal?: AbortSignal
): Promise<string> => {
  const headers = getHeaders() as Record<string, string>;
  const response = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, stream: false }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || `AI Chat HTTP ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? '';
};

/**
 * Streaming call — calls onToken per SSE delta, resolves with full accumulated text.
 */
export const aiChatStream = async (
  messages: ChatMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<string> => {
  const headers = getHeaders() as Record<string, string>;
  const response = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, stream: true }),
    signal,
  });

  if (!response.ok || !response.body) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || `AI Chat HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

      for (const line of lines) {
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') break;
        try {
          const parsed = JSON.parse(payload);
          const token = parsed?.choices?.[0]?.delta?.content ?? '';
          if (token) {
            fullText += token;
            onToken(token);
          }
        } catch {
          // ignore malformed SSE lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullText;
};

/**
 * Helper: call AI, parse JSON from response (strips markdown fences).
 */
export const aiChatJSON = async <T = any>(
  messages: ChatMessage[],
  signal?: AbortSignal
): Promise<T> => {
  const raw = await aiChatOnce(messages, signal);
  // Strip ```json ... ``` markdown fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  return JSON.parse(cleaned) as T;
};
```

---

## 2. Streaming Pattern Summary

### **Core Streaming Architecture (SSE Server-Sent Events)**

**Function:** `aiChatStream(messages, onToken, signal)`

```typescript
// STREAMING FLOW:
1. POST /ai/chat with { messages, stream: true }
2. Response is ReadableStream of Server-Sent Events (SSE)
3. Parser reads chunks, splits on newlines
4. Each line starting with "data: " is parsed as JSON
5. Extract delta.content from each parsed JSON
6. Call onToken(token) IMMEDIATELY for live UI update
7. Accumulate fullText throughout
8. When server sends "[DONE]", break loop
9. Return accumulated fullText

// KEY DETAILS:
- AbortSignal for cancellation support
- TextDecoder with { stream: true } for chunk boundaries
- Try/finally ensures reader.releaseLock() (prevent memory leak)
- Graceful JSON parsing failures (ignore malformed lines)
- onToken callback called PER TOKEN (sub-100ms latency for UI)
```

### **Non-Streaming Alternative (aiChatOnce)**

```typescript
// SIMPLE CALL:
const response = await fetch(url, { 
  method: 'POST',
  body: JSON.stringify({ messages, stream: false })
});
const data = await response.json();
return data.choices[0].message.content;
```

### **Usage in useStoryboardStudio Hook (Real Example)**

```typescript
// From: hooks/useStoryboardStudio.ts lines 289-302
let accumulated = '';
addLog('[AI] Đang viết kịch bản...');
await aiChatStream(
  messages,
  (token) => {
    accumulated += token;
    // Update log with running text
    setTerminalLogs(prev => {
      const last = prev[prev.length - 1];
      if (last?.startsWith('[AI WRITING] ')) {
        return [...prev.slice(0, -1), `[AI WRITING] ${accumulated.slice(-120)}...`];
      }
      return [...prev, `[AI WRITING] ${token}`];
    });
  }
);

// Parse full accumulated JSON after stream completes
const cleaned = accumulated.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
const result = JSON.parse(cleaned);
```

**Key Pattern:** Accumulate tokens in a string, update UI state on EACH token callback, then parse JSON from final result.

---

## 3. Collapsible Panel Component Pattern Found

**Best Reference:** `components/workspace/AISuggestPanel.tsx` (495 lines)

This is the **GOLD STANDARD** collapsible panel in the codebase. Structure:

### **Architecture:**

```typescript
interface AISuggestPanelProps {
  productSlug: string;
  productName: string;
  styles?: StylePreset[];
  onPromptSelect: (prompt: string) => void;
  onApply: (config: SuggestConfig) => void;
  historyKey?: string;
  productContext?: string;
  featuredTemplates?: { label: string; prompt: string; style?: string }[];
}

// STATE MANAGEMENT:
const [isOpen, setIsOpen] = useState(() => {
  try { return localStorage.getItem(PANEL_OPEN_KEY(productSlug)) !== 'false'; }
  catch { return true; }
});
const [activeTab, setActiveTab] = useState<TabId>('prompts');

// PERSIST OPEN STATE:
useEffect(() => {
  try { localStorage.setItem(PANEL_OPEN_KEY(productSlug), String(isOpen)); }
  catch { /* ignore */ }
}, [isOpen, productSlug]);
```

### **Render Structure:**

```typescript
<div className="border border-black/[0.06] dark:border-white/[0.06] rounded-xl overflow-hidden">
  {/* Header toggle button */}
  <button
    onClick={() => setIsOpen((v) => !v)}
    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-black/[0.02]"
  >
    <div className="flex items-center gap-2">
      <Sparkles size={11} className="text-brand-blue" />
      <span>AI Suggest</span>
    </div>
    <div>
      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </div>
  </button>

  {/* Animated collapsible content */}
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Tab bar */}
        <div className="flex border-t border-black/[0.04] dark:border-white/[0.04] overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-slate-400'
              }`}
            >
              <tab.icon size={11} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content with AnimatePresence */}
        <div className="p-3">
          <AnimatePresence mode="wait">
            {/* Conditionally render TabPane for active tab */}
          </AnimatePresence>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

### **Animation Patterns (Framer Motion):**

```typescript
// COLLAPSIBLE HEIGHT:
<motion.div
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: 'auto', opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
>

// TAB PANE ENTRANCE/EXIT:
const TabPane: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

// LIST ITEM STAGGER:
{promptIdeas.map((idea, i) => (
  <motion.button
    key={i}
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: i * 0.05 }}
  >
    {idea}
  </motion.button>
))}
```

### **Features Implemented:**

1. ✅ **Persistence:** Open state saved to localStorage
2. ✅ **Tabs:** Multi-tab interface with smooth transitions
3. ✅ **Lazy Loading:** Prompt ideas load only when tab opens
4. ✅ **Loading States:** Spinner + disabled buttons during async ops
5. ✅ **History:** Integrates with user history from localStorage
6. ✅ **Smooth Animations:** Framer Motion with custom easing
7. ✅ **Responsive:** Scrollable tab bar on mobile
8. ✅ **Dark Mode:** Full dark/light theme support

---

## 4. Storyboard Studio Sidebar Components (Reference Architecture)

**Location:** `components/storyboard-studio/sidebar/`

### **Structure of sidebar components:**

#### **AIQuickActions.tsx** (99 lines)
- Grid of action buttons (Enhance, Generate, etc.)
- Cost estimation per action
- Disabled state during processing
- Used in: Right sidebar quick action bar

#### **ProjectInfoSection.tsx** (94 lines)
- Editable project name (inline editing)
- Progress bar (rendered count vs total)
- Credit cost estimate
- **Inline edit pattern:**
  ```typescript
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(projectName);
  
  // Click edit button → focus input → onBlur commits → save to parent
  const commit = () => {
    onProjectNameChange(draft.trim() || 'Untitled Project');
    setEditing(false);
  };
  ```

#### **CharactersQuickView.tsx** (89 lines)
- Shows first 5 assets (characters + locations)
- Status dot per asset (idle/processing/done/error)
- Animated list entry with stagger
- Navigates to Assets tab on click

#### **StyleGuideChips.tsx**
- Displays visual style chips
- Click to apply style to all scenes

---

## 5. Key Patterns for Phase 3 AI Script Assistant Panel

### **Pattern 1: Collapsible Section**
```typescript
// Copy this structure from AISuggestPanel:
const [isOpen, setIsOpen] = useState(() => {
  try { return localStorage.getItem(`skyverses_${id}_open`) !== 'false'; }
  catch { return true; }
});

// Persist open state
useEffect(() => {
  try { localStorage.setItem(`skyverses_${id}_open`, String(isOpen)); }
  catch { /* ignore */ }
}, [isOpen, id]);

// Animate height
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Content */}
    </motion.div>
  )}
</AnimatePresence>
```

### **Pattern 2: Streaming Token Updates**
```typescript
// Copy from useStoryboardStudio hook:
const [displayedText, setDisplayedText] = useState('');

const handleStream = async (messages: ChatMessage[]) => {
  let accumulated = '';
  
  try {
    const fullText = await aiChatStream(
      messages,
      (token) => {
        accumulated += token;
        setDisplayedText(accumulated); // Update UI per token
      }
    );
    // Process completed result
    const parsed = JSON.parse(fullText);
    // Use parsed data...
  } catch (e) {
    console.error(e);
  }
};
```

### **Pattern 3: Sidebar Integration**
From `StoryboardTab.tsx` props, the sidebar receives:
- `scenes: Scene[]`
- `assets: ReferenceAsset[]`
- `isProcessing: boolean`
- Various callback handlers

**For Phase 3:** Add `onGenerateScript` callback to parent, then pass to AI Assistant panel.

---

## 6. Style & Director Presets Already Defined

**Location:** `components/storyboard-studio/AestheticProfileModal.tsx`

### **Format Options (Video Types):**
- Phim ngắn (Short film)
- TVC Quảng cáo (Commercial)
- MV Ca nhạc (Music video)
- Video TikTok/Reels/Shorts
- Phim tài liệu (Documentary)
- Trailer / Teaser
- Vlog
- Video giáo dục (Educational)
- *(and more)*

### **Visual Styles:**
```typescript
const STYLE_OPTIONS = [
  { val: 'Hoạt hình 3D',     label: '3D Animation',  gradient: 'from-blue-400 to-cyan-300' },
  { val: 'Anime',             label: 'Anime',        gradient: 'from-pink-400 to-rose-300' },
  { val: 'Hoạt hình 2D',     label: '2D Animation',  gradient: 'from-yellow-400 to-amber-300' },
  { val: 'Live-action',      label: 'Live-action',  gradient: 'from-slate-500 to-slate-400' },
  { val: 'Cyberpunk',        label: 'Cyberpunk',    gradient: 'from-purple-500 to-violet-400' },
  { val: 'Realistic',        label: 'Realistic',    gradient: 'from-emerald-400 to-teal-300' },
  { val: 'Dreamy',           label: 'Dreamy',       gradient: 'from-fuchsia-400 to-pink-300' },
  { val: 'Minimalist',       label: 'Minimalist',   gradient: 'from-gray-300 to-gray-200' },
];
```

### **Cultural Presets:**
- Futuristic Vietnam 2077 🇻🇳
- Tokyo Neo Cyberpunk 🇯🇵
- Global / International 🌐
- Han (China Dynasty) 🇨🇳
- European Classic 🇪🇺
- Tropical Southeast Asia 🌴

### **Director/Creative Guide (from useStoryboardStudio hook):**

Domain-specific prompts for each format:
```typescript
const domainGuides = {
  'TVC Quảng cáo': `You are an expert Commercial Director and Brand Strategist...`,
  'Phim ngắn': `You are an expert Independent Filmmaker and Narrative Director...`,
  'MV Ca nhạc': `You are an expert Music Video Director and Visual Storyteller...`,
  'Video TikTok/Reels/Shorts': `You are an expert Short-Form Content Creator and Viral Video Director...`,
  'Phim tài liệu': `You are an expert Documentary Director and Visual Journalist...`,
  'Video giáo dục': `You are an expert Educational Content Producer...`,
  'Game Cutscene': `You are an expert Game Narrative Director and Cinematic Designer...`,
};
```

---

## 7. How Streaming Is Actually Used in Storyboard Studio

**From `useStoryboardStudio.ts` lines 247-326:**

```typescript
const handleLoadSuggestion = async () => {
  if (!isAuthenticated) { login(); return; }
  if (isEnhancing) return;

  setIsEnhancing(true);
  const currentIdea = script.trim() || 'Một ý tưởng ngẫu nhiên thú vị';
  addLog('[AI] Đang phân tích ý tưởng kiịch bản...');

  try {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a professional Storyboard Assistant and Creative Director.
Help the user refine their creative ideas into structured narrative scripts...`,
      },
      {
        role: 'user',
        content: `Based on this idea: "${currentIdea}"
Create a professional and fluid narrative script for a video with total duration ${totalDuration}s.
Format: ${settings.format || 'auto-detect best format'}
Style preference: ${settings.style || 'auto'}
...`,
      },
    ];

    // Stream the response into terminal logs for live feedback
    let accumulated = '';
    addLog('[AI] Đang viết kịch bản...');
    await aiChatStream(
      messages,
      (token) => {
        accumulated += token;
        // Update log with running text
        setTerminalLogs(prev => {
          const last = prev[prev.length - 1];
          if (last?.startsWith('[AI WRITING] ')) {
            return [...prev.slice(0, -1), `[AI WRITING] ${accumulated.slice(-120)}...`];
          }
          return [...prev, `[AI WRITING] ${token}`];
        });
      }
    );

    // Parse full accumulated JSON
    const cleaned = accumulated.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const result = JSON.parse(cleaned);

    if (result.refined_idea) setScript(result.refined_idea);
    setSettings(prev => ({
      ...prev,
      format:    result.format    || prev.format,
      style:     result.style     || prev.style,
      culture:   result.culture   || prev.culture,
      background: result.background || prev.background,
      cinematic: result.cinematic  || prev.cinematic,
      bgm:       result.bgm        || prev.bgm,
      voiceOver: result['voice-over'] || prev.voiceOver,
    }));
    addLog('[DONE] Kịch bản gợi ý đã được tạo.');
  } catch (e: any) {
    addLog(`[LỖI] Tạo gợi ý thất bại: ${e?.message ?? 'unknown'}`);
    console.error('Suggestion error', e);
  } finally {
    setIsEnhancing(false);
  }
};
```

**Key Takeaways:**
- Streaming is used for **live terminal log updates**
- Accumulate tokens while showing partial progress
- After stream ends, parse accumulated text as JSON
- Update parent state with parsed fields (format, style, script, etc.)
- Use try/finally to ensure state cleanup

---

## 8. Recommendations for Phase 3 AI Script Assistant Panel

### **Structure to Follow:**

```typescript
// Phase3_AIScriptAssistant.tsx

interface AIScriptAssistantProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  scenes: Scene[];
  onApplyScript: (updates: Partial<Scene>[]) => void;
  onGenerateScenePrompt: (sceneId: string) => Promise<string>;
  isProcessing: boolean;
}

export const AIScriptAssistant: React.FC<AIScriptAssistantProps> = ({...}) => {
  // 1. Collapsible header (copy from AISuggestPanel)
  // 2. Tab bar: [Analysis] [Suggestions] [Refinement] [Prompt Builder]
  // 3. Per-tab content with:
  //    - Streaming updates for long operations
  //    - Loading spinners
  //    - Result preview/edit areas
  // 4. Apply buttons to commit changes back to scenes
}
```

### **Integration Points:**

1. Add to `StoryboardTab.tsx` props:
   ```typescript
   onGenerateScenePrompt?: (sceneId: string) => Promise<string>;
   ```

2. Call from sidebar or scene card:
   ```typescript
   <AIScriptAssistant
     scenes={scenes}
     onApplyScript={onReorder}  // or custom handler
     isProcessing={isProcessing}
   />
   ```

3. Use streaming for:
   - Scene prompt enhancement
   - Script refinement suggestions
   - Character dialogue generation
   - Scene breakdown analysis

---

## Conclusion

The Skyverses Storyboard Studio codebase provides excellent patterns for:

✅ **Streaming AI responses** — `aiChatStream` with token callbacks  
✅ **Collapsible panels** — `AISuggestPanel` with localStorage persistence  
✅ **Sidebar integration** — Modular components in `/sidebar/`  
✅ **Styled presets** — Directors, formats, styles already catalogued  
✅ **State management** — React hooks with localStorage sync  
✅ **UI animations** — Framer Motion with smooth transitions  

All building blocks are ready for Phase 3 implementation.

