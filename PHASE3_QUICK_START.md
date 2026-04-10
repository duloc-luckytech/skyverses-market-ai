# Phase 3 AI Script Assistant — Quick Start Guide

> **Status:** 🟢 Ready to Build  
> **Exploration Date:** April 10, 2026  
> **Documentation:** Complete with reference code

---

## 📖 How to Use These Documents

### Start Here ➡️ **PHASE3_EXPLORATION_INDEX.md**
- Overview of all findings
- Key patterns summarized
- Implementation roadmap

### Reference During Development ➡️ **PHASE3_REFERENCE_COMPONENTS.md**
- Complete `AISuggestPanel.tsx` source (495 lines)
- 5 extracted patterns with line numbers
- Copy-paste friendly code blocks

### Deep Dive ➡️ **PHASE3_EXPLORATION_SUMMARY.md**
- Full `apis/aiChat.ts` source (117 lines)
- Streaming architecture detailed
- Real usage examples from hooks
- All sidebar components documented

---

## 🎯 Three-Minute Summary

### **Streaming Pattern (Copy This)**

```typescript
import { aiChatStream, ChatMessage } from '../apis/aiChat';

const [displayText, setDisplayText] = useState('');

const handleStream = async (messages: ChatMessage[]) => {
  let accumulated = '';
  
  const fullText = await aiChatStream(
    messages,
    (token) => {
      accumulated += token;
      setDisplayText(accumulated); // Update UI per token
    }
  );
  
  // Parse full result
  const parsed = JSON.parse(fullText);
  // Use parsed data...
};
```

**Key Points:**
- Token callback fires per token (live UI update)
- Accumulate tokens in a string
- Parse JSON from accumulated text after stream ends
- Use try/catch for error handling

---

### **Collapsible Panel (Copy This)**

```typescript
import { AnimatePresence, motion } from 'framer-motion';

const [isOpen, setIsOpen] = useState(() => {
  try { return localStorage.getItem('panel_key') !== 'false'; }
  catch { return true; }
});

useEffect(() => {
  try { localStorage.setItem('panel_key', String(isOpen)); }
  catch { /* ignore */ }
}, [isOpen]);

return (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Content here */}
      </motion.div>
    )}
  </AnimatePresence>
);
```

**Key Points:**
- localStorage persists open state
- Try/catch handles localStorage errors gracefully
- Cubic-bezier easing: `[0.22, 1, 0.36, 1]`
- Smooth height animation

---

### **Tab Interface (Copy This)**

```typescript
const TABS = [
  { id: 'analysis',    label: 'Analysis',    icon: Sparkles },
  { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
] as const;

type TabId = typeof TABS[number]['id'];
const [activeTab, setActiveTab] = useState<TabId>('analysis');

// Tab bar:
<div className="flex border-b">
  {TABS.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`... border-b-2 ${
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

// Tab content (with mode="wait"):
<AnimatePresence mode="wait">
  {activeTab === 'analysis' && <TabPane key="analysis">{...}</TabPane>}
  {activeTab === 'suggestions' && <TabPane key="suggestions">{...}</TabPane>}
</AnimatePresence>

// TabPane wrapper:
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
```

**Key Points:**
- `mode="wait"` ensures tab exit before entry
- Border-b highlight for active tab
- TabPane wrapper for smooth transitions

---

## 📋 Component Structure

```
AIScriptAssistant/
├── Collapsible Header
│   ├── Icon + Title
│   └── Chevron (up/down)
│
├── Tab Bar
│   ├── Analysis
│   ├── Suggestions
│   ├── Refinement
│   └── Builder
│
└── Tab Content (AnimatePresence)
    ├── Analysis Tab
    │   ├── Current script display
    │   └── Analysis streaming area
    │
    ├── Suggestions Tab
    │   ├── Scene suggestions (with streaming)
    │   └── Apply button
    │
    ├── Refinement Tab
    │   ├── Scene selector
    │   ├── Prompt enhancement (streaming)
    │   └── Preview + apply
    │
    └── Builder Tab
        ├── Visual prompt builder
        ├── Live preview
        └── Insert/apply buttons
```

---

## 🚀 Step-by-Step Implementation

### **Phase 3.1: Create Basic Structure**

```bash
# Create new component file
touch components/storyboard-studio/AIScriptAssistant.tsx

# Copy from AISuggestPanel (line 1-154):
# - Props interface
# - State management (isOpen, activeTab)
# - Header with toggle + chevron
```

### **Phase 3.2: Add Tabs**

```bash
# From PHASE3_REFERENCE_COMPONENTS.md (lines 180-201):
# - TABS configuration
# - Tab bar with border-b highlight
# - Conditional tab rendering
```

### **Phase 3.3: Implement Streaming**

```bash
# From PHASE3_EXPLORATION_SUMMARY.md (sections 2 & 7):
# - Import aiChatStream from apis/aiChat
# - Setup streaming state
# - Call aiChatStream with token callback
# - Display tokens in real-time
```

### **Phase 3.4: Integrate with StoryboardTab**

```bash
# Add to StoryboardTab props:
# - onGenerateScenePrompt?: (sceneId: string) => Promise<string>
# - Pass scenes, assets, settings

# Add to StoryboardTab render:
# <AIScriptAssistant
#   scenes={scenes}
#   assets={assets}
#   settings={settings}
#   onApplyScript={handleApplyScript}
# />
```

### **Phase 3.5: Polish & Dark Mode**

```bash
# Use dark: classes throughout (reference in AISuggestPanel)
# Test with both light/dark themes
# Add Framer Motion animations
# Optimize re-renders
```

---

## 🎨 Design Reference

| Element | Reference | Details |
|---------|-----------|---------|
| **Collapsible Header** | AISuggestPanel L138-154 | Icon + title + chevron |
| **Tab Bar** | AISuggestPanel L180-201 | Border-b active state |
| **Tab Content** | AISuggestPanel L203-269 | AnimatePresence mode="wait" |
| **Stagger Animation** | AISuggestPanel L288-306 | delay: i * 0.05 |
| **Loading State** | AISuggestPanel L282-286 | Spinner + disabled button |
| **Dark Mode** | AISuggestPanel throughout | dark: classes |
| **Spacing** | Sidebar components | px-5 py-4, gap-2.5 |
| **Colors** | brand-blue, slate-400, white/30 | See sidebar components |

---

## 💾 Files to Reference

### **Core APIs**
- `apis/aiChat.ts` — aiChatStream, aiChatOnce, aiChatJSON
- `apis/config.ts` — getHeaders(), API_BASE_URL

### **Hooks**
- `hooks/useStoryboardStudio.ts` — Domain guides, streaming examples

### **Components (Reference)**
- `components/workspace/AISuggestPanel.tsx` — Complete collapsible panel (495 lines)
- `components/storyboard-studio/StoryboardTab.tsx` — Main component structure
- `components/storyboard-studio/AestheticProfileModal.tsx` — Style/format presets
- `components/storyboard-studio/sidebar/*.tsx` — Sidebar pattern

### **Services**
- `services/gemini.ts` — Gemini API calls (reference for similar patterns)

---

## 🔑 Key Patterns to Master

| Pattern | Where to Find | Why Important |
|---------|---------------|---------------|
| **Streaming** | aiChat.ts L54-104 | Live token updates |
| **Collapsible** | AISuggestPanel L126-178 | localStorage persistence |
| **Tabs** | AISuggestPanel L84-91 | Multi-view interface |
| **Animations** | AISuggestPanel L169-178 | Smooth UX |
| **Stagger** | AISuggestPanel L288-306 | Waterfall entrance |
| **Dark Mode** | AISuggestPanel throughout | Theme support |
| **Error Handling** | useStoryboardStudio L320-325 | Graceful failures |

---

## 🧪 Testing Checklist

- [ ] Collapsible opens/closes smoothly
- [ ] Open state persists in localStorage
- [ ] Tab switching works without lag
- [ ] Streaming displays tokens in real-time
- [ ] Loading spinner shows during async ops
- [ ] Error messages display clearly
- [ ] Dark mode looks correct
- [ ] All text is readable
- [ ] Buttons respond to clicks
- [ ] Mobile responsive (tabs scroll)
- [ ] Memory doesn't leak (cleanup on unmount)
- [ ] No console errors or warnings

---

## 🎓 Pro Tips

1. **Streaming:** Always accumulate text, then parse after stream ends
2. **localStorage:** Wrap in try/catch — users may have it disabled
3. **Animations:** Use `mode="wait"` for tab switching to avoid overlap
4. **Dark Mode:** Include `dark:` classes from the start
5. **State:** Use `useCallback` for heavy computations
6. **Performance:** Memoize large lists with `React.memo`
7. **Accessibility:** Keep semantic HTML, use proper ARIA labels
8. **Testing:** Test with real AI streaming responses, not mocks

---

## 📚 Reading Order

1. **PHASE3_QUICK_START.md** (you are here) — 5 min overview
2. **PHASE3_EXPLORATION_INDEX.md** — 10 min comprehensive guide
3. **PHASE3_REFERENCE_COMPONENTS.md** — 15 min deep dive + code
4. **PHASE3_EXPLORATION_SUMMARY.md** — Full reference + examples

---

## ✅ Ready to Start?

All source code is documented. Follow the 5-step implementation guide above, reference the components, and you'll have Phase 3 done in a few hours.

**Questions?**
- Check PHASE3_REFERENCE_COMPONENTS.md for exact line numbers
- Look at AISuggestPanel for the gold standard pattern
- See useStoryboardStudio for streaming examples
- Reference sidebar components for integration patterns

---

**Status:** ✅ All documentation complete  
**Next:** Create `AIScriptAssistant.tsx` and start building!

