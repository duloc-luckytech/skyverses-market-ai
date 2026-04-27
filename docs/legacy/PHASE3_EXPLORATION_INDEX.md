# Storyboard Studio Codebase Exploration — Complete Index

**Project:** Skyverses AI Video Creator  
**Focus:** Phase 3 AI Script Assistant Panel  
**Date:** April 10, 2026  

---

## 📋 Exploration Checklist

- [x] Read full content of `apis/aiChat.ts`
- [x] Read `hooks/useStoryboardStudio.ts` lines 1-60 (imports + types)
- [x] Check for collapsible/side-panel patterns in components
- [x] Read `components/storyboard-studio/StoryboardTab.tsx` context (props + state)
- [x] Search for director/style definitions in codebase
- [x] Extract complete reference components with source code

---

## 📚 Documents Generated

### 1. **codebase-exploration-summary.md**
**Content:**
- Full source of `apis/aiChat.ts` (117 lines)
- Streaming pattern summary (SSE flow, token callbacks)
- Complete `AISuggestPanel.tsx` reference (495 lines)
- Storyboard Studio sidebar components overview
- Style & director presets already defined
- Real example: `useStoryboardStudio` streaming usage
- Recommendations for Phase 3 implementation

**Key Sections:**
- Section 1: `aiChat.ts` full code
- Section 2: Streaming architecture explainer
- Section 3: Collapsible panel pattern (AISuggestPanel)
- Section 4: Sidebar component architecture
- Section 5: Key patterns to copy
- Section 6: Existing style/director presets
- Section 7: Live streaming usage example
- Section 8: Phase 3 implementation recommendations

**Best For:** Understanding patterns + reference architecture

---

### 2. **PHASE3_REFERENCE_COMPONENTS.md**
**Content:**
- Complete `AISuggestPanel.tsx` source code (495 lines)
- Extracted architectural patterns with line numbers
- 5 key patterns extracted with code snippets
- Summary table of what to copy

**Key Sections:**
- REFERENCE 1: Complete AISuggestPanel component
- Pattern 1: Open state persistence
- Pattern 2: Height animation
- Pattern 3: Tab-based content switching
- Pattern 4: List item stagger animation
- Pattern 5: Loading & disabled states
- Summary table with line-number references

**Best For:** Copy-paste development reference

---

### 3. **EXPLORATION_INDEX.md** (this file)
**Content:**
- Complete checklist + index
- All key findings summarized
- Quick-access reference table
- Implementation guidelines

**Best For:** Navigation + quick lookup

---

## 🎯 Key Findings

### **1. Streaming Architecture (aiChatStream)**

```
Flow:
  POST /ai/chat { messages, stream: true }
    ↓
  Response is ReadableStream (SSE)
    ↓
  Parse lines starting with "data: "
    ↓
  Extract delta.content from JSON
    ↓
  Call onToken(token) immediately
    ↓
  Accumulate fullText throughout
    ↓
  Return fullText when server sends "[DONE]"
```

**Implementation:**
- Token callback for live UI updates
- TextDecoder with `{ stream: true }`
- Try/finally ensures cleanup
- Graceful JSON error handling

**Used in:** Script refinement, character generation, scene suggestions

---

### **2. Collapsible Panel Pattern (AISuggestPanel)**

**Structure:**
```
[Header Toggle] ← Click to expand/collapse
  ├─ [Tab Bar] ← Switch between 4 tabs
  └─ [Tab Content] ← Animated content area
      ├─ Prompt Ideas tab (lazy load)
      ├─ Style Presets tab (grid)
      ├─ Templates tab (history + featured)
      └─ Smart Fill tab (AI auto-fill)
```

**Key Features:**
- localStorage persistence
- Smooth Framer Motion animations
- Tab switching with `mode="wait"`
- Stagger animations on list items
- Dark/light mode support

---

### **3. Sidebar Components in Storyboard Studio**

**Location:** `components/storyboard-studio/sidebar/`

| Component | Purpose | Pattern |
|-----------|---------|---------|
| **AIQuickActions.tsx** | Action buttons grid | Cost estimation + disabled states |
| **ProjectInfoSection.tsx** | Project info | Inline editing + progress bar |
| **CharactersQuickView.tsx** | Asset preview | Animated list with status dots |
| **StyleGuideChips.tsx** | Style selection | Click to apply |

**Integration:** All components accept props from parent `StoryboardTab` and use callbacks to update parent state.

---

### **4. Style & Director Presets**

**Video Formats (from AestheticProfileModal):**
- Phim ngắn (Short film)
- TVC Quảng cáo (Commercial)
- MV Ca nhạc (Music video)
- Video TikTok/Reels/Shorts
- Phim tài liệu (Documentary)
- Trailer / Teaser
- Vlog
- Video giáo dục (Educational)

**Visual Styles:**
- Hoạt hình 3D (3D Animation)
- Anime
- Hoạt hình 2D (2D Animation)
- Live-action
- Cyberpunk
- Realistic
- Dreamy
- Minimalist

**Creative Directors (from useStoryboardStudio):**
```typescript
const domainGuides = {
  'TVC Quảng cáo': 'Commercial Director and Brand Strategist',
  'Phim ngắn': 'Independent Filmmaker and Narrative Director',
  'MV Ca nhạc': 'Music Video Director and Visual Storyteller',
  'Video TikTok/Reels/Shorts': 'Short-Form Content Creator and Viral Video Director',
  'Phim tài liệu': 'Documentary Director and Visual Journalist',
  'Video giáo dục': 'Educational Content Producer and Instructional Designer',
  'Game Cutscene': 'Game Narrative Director and Cinematic Designer',
};
```

---

## 🔧 Implementation Patterns for Phase 3

### **Pattern: Streaming Token Display**

```typescript
const [displayText, setDisplayText] = useState('');
const [isStreaming, setIsStreaming] = useState(false);

const handleStream = async (messages: ChatMessage[]) => {
  setIsStreaming(true);
  let accumulated = '';
  
  try {
    const fullText = await aiChatStream(
      messages,
      (token) => {
        accumulated += token;
        setDisplayText(accumulated); // Update UI per token
      }
    );
    
    // Process full result
    const parsed = JSON.parse(fullText);
    // Use parsed data...
  } catch (e) {
    console.error('Streaming error:', e);
  } finally {
    setIsStreaming(false);
  }
};
```

---

### **Pattern: Collapsible Section**

```typescript
const [isOpen, setIsOpen] = useState(() => {
  try {
    return localStorage.getItem('storyboard_script_assistant_open') !== 'false';
  } catch {
    return true;
  }
});

useEffect(() => {
  try {
    localStorage.setItem('storyboard_script_assistant_open', String(isOpen));
  } catch {
    /* ignore */
  }
}, [isOpen]);

// In JSX:
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

---

### **Pattern: Multi-Tab Interface**

```typescript
const TABS = [
  { id: 'analysis',    label: 'Analysis',    icon: Sparkles },
  { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
  { id: 'refinement',  label: 'Refinement',  icon: Wand2 },
  { id: 'builder',     label: 'Builder',     icon: Code },
] as const;

const [activeTab, setActiveTab] = useState<TabId>('analysis');

// Tab bar:
<div className="flex border-b">
  {TABS.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`... border-b-2 transition-colors ${
        activeTab === tab.id
          ? 'border-brand-blue text-brand-blue'
          : 'border-transparent text-slate-400'
      }`}
    >
      <tab.icon size={11} />
      {tab.label}
    </button>
  ))}
</div>

// Tab content:
<AnimatePresence mode="wait">
  {activeTab === 'analysis' && <TabPane key="analysis">{...}</TabPane>}
  {activeTab === 'suggestions' && <TabPane key="suggestions">{...}</TabPane>}
  {/* etc */}
</AnimatePresence>
```

---

## 📊 File Structure Reference

```
skyverses-market-ai/
├── apis/
│   ├── aiChat.ts ← Streaming + single-shot API
│   └── config.ts
├── hooks/
│   ├── useStoryboardStudio.ts ← Domain guides + streaming usage
│   └── useJobPoller.ts
├── components/
│   ├── workspace/
│   │   └── AISuggestPanel.tsx ← GOLD STANDARD collapsible panel
│   ├── storyboard-studio/
│   │   ├── StoryboardTab.tsx ← Main component
│   │   ├── AestheticProfileModal.tsx ← Style/format presets
│   │   ├── sidebar/
│   │   │   ├── AIQuickActions.tsx
│   │   │   ├── ProjectInfoSection.tsx
│   │   │   ├── CharactersQuickView.tsx
│   │   │   └── StyleGuideChips.tsx
│   │   └── scene-card/
│   │       ├── SceneCardHeader.tsx
│   │       ├── DragHandle.tsx
│   │       └── SceneHoverActions.tsx
│   └── common/
└── services/
    └── gemini.ts ← AI text generation
```

---

## 🚀 Phase 3 Implementation Roadmap

### **Step 1: Create Component File**
- `components/storyboard-studio/AIScriptAssistant.tsx`
- Copy collapsible header from `AISuggestPanel`
- Copy tab bar structure
- Setup localStorage persistence

### **Step 2: Define Tabs**
- Tab 1: **Script Analysis** — Analyze current script
- Tab 2: **Scene Suggestions** — AI suggests scene breakdowns
- Tab 3: **Prompt Refinement** — Enhance individual scene prompts
- Tab 4: **Prompt Builder** — Interactive builder with live preview

### **Step 3: Implement Streaming**
- Use `aiChatStream` for analysis/suggestions
- Display tokens in real-time
- Show loading states and error handling
- Accumulate results for JSON parsing

### **Step 4: Integrate with StoryboardTab**
- Add props to `StoryboardTab`
- Pass scenes, assets, settings from parent
- Implement callbacks to update scenes on apply
- Position in sidebar or modal

### **Step 5: Add Dark Mode & Polish**
- Use `dark:` classes (already in pattern)
- Test with both light/dark themes
- Add animations with Framer Motion
- Optimize performance

---

## 💾 Files to Study in Order

1. **First:** `apis/aiChat.ts` (understand streaming)
2. **Second:** `hooks/useStoryboardStudio.ts` (see streaming in action)
3. **Third:** `components/workspace/AISuggestPanel.tsx` (learn collapsible pattern)
4. **Fourth:** `components/storyboard-studio/StoryboardTab.tsx` (understand integration)
5. **Reference:** `components/storyboard-studio/AestheticProfileModal.tsx` (style presets)

---

## 🎓 Key Takeaways

### **Streaming Pattern**
- ✅ Use `aiChatStream` with token callback
- ✅ Update UI on each token (sub-100ms latency)
- ✅ Accumulate text throughout
- ✅ Parse JSON after stream completes
- ✅ Handle errors gracefully

### **UI Components**
- ✅ Copy collapsible pattern from `AISuggestPanel`
- ✅ Use `AnimatePresence` + `motion.div` for smooth animations
- ✅ Persist state to localStorage
- ✅ Support dark/light modes with `dark:` classes
- ✅ Use Framer Motion's `mode="wait"` for tab switching

### **Integration**
- ✅ Accept props from parent (`StoryboardTab`)
- ✅ Use callbacks to update parent state
- ✅ Handle loading/processing states
- ✅ Show error messages
- ✅ Provide user feedback (spinners, tooltips, etc.)

---

## 📝 Notes

- **No Hitchcock/Wes Anderson styles found** in codebase (searched entire repo)
- **Directors are domain-specific** (Commercial Director, Documentary Director, etc.)
- **Streaming is production-ready** with error handling + cancellation
- **AISuggestPanel is mature** with 495 lines of polish + edge cases
- **Codebase uses Tailwind CSS** with `dark:` mode support
- **All components use TypeScript** with strict typing

---

## ✅ Ready for Implementation

All patterns, components, and architectural guidelines are documented and ready for Phase 3 development.

**Next Steps:**
1. Review all three generated markdown files
2. Reference `PHASE3_REFERENCE_COMPONENTS.md` during development
3. Follow patterns from `AISuggestPanel.tsx`
4. Integrate with `StoryboardTab.tsx`
5. Test streaming with real AI responses

---

**Generated:** 2026-04-10  
**Explorer:** Claude Code  
**Status:** ✅ Complete and Ready for Development

