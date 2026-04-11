# 🎯 Skyverses Market AI - Codebase Exploration Guide

**Welcome!** This directory contains complete documentation of the Skyverses Market AI codebase.

---

## 📖 WHICH DOCUMENT SHOULD I READ?

### 🟢 I want a quick overview
👉 **Read: `EXPLORATION_SUMMARY.md`** (10 min read)
- High-level codebase overview
- Key architectural patterns
- Quick start guide
- 7 key findings

### 🟢 I want to add a new product workspace
👉 **Read: `QUICK_WORKSPACE_REFERENCE.md`** (15 min + implementation)
- Step-by-step 6-step process
- Copy-paste templates
- Complete checklist
- API patterns
- Modal examples

### 🟢 I want to understand the architecture deeply
👉 **Read: `COMPREHENSIVE_CODEBASE_STRUCTURE.md`** (30 min read)
- Complete folder structure with file paths
- Product workspace pattern (3-layer architecture)
- All 17 API modules documented
- Routing system deep dive
- Global types & interfaces
- Context & state management
- 300+ lines of code examples

---

## 📁 DOCUMENT MAP

| Document | Size | Time | Best For |
|---|---|---|---|
| **`EXPLORATION_SUMMARY.md`** | 10KB | 10 min | Getting oriented |
| **`QUICK_WORKSPACE_REFERENCE.md`** | 15KB | 15 min | Building new products |
| **`COMPREHENSIVE_CODEBASE_STRUCTURE.md`** | 41KB | 30 min | Deep understanding |

---

## 🚀 QUICK FACTS

**Codebase Stats**:
- 60 page components (products + core pages)
- 98 component files (sub-components + modals)
- 23 custom hooks (business logic)
- 17 API modules (backend integration)
- 5 context providers (global state)
- 4 configuration files (products, events, media, branding)

**Tech Stack**:
- React 19 + TypeScript 5
- Tailwind CSS + Framer Motion
- React Router v7 + Vite bundler
- 70+ lazy-loaded pages (code-splitting)

**Key Architectural Pattern**:
```
Landing Page (marketing UI)
    ↓ [Open Studio Button]
    ↓
Workspace Component (full-screen modal)
    ├─ Sidebar (controls)
    ├─ Viewport (results gallery)
    ├─ Modals (resource auth, job logs, etc)
    └─ Uses Custom Hook (all state + API calls)
```

---

## 🎯 MOST IMPORTANT FILES

| Path | Purpose | Lines |
|---|---|---|
| `/App.tsx` | Routing & lazy loading | 280 |
| `/components/AIImageGeneratorWorkspace.tsx` | Example workspace (image generation) | 300 |
| `/hooks/useImageGenerator.ts` | Example hook (image generation logic) | 400 |
| `/pages/images/AIImageGenerator.tsx` | Example page (landing + workspace toggle) | 40 |
| `/apis/images.ts` | Example API module (image jobs) | 124 |
| `/apis/videos.ts` | Example API module (video jobs) | 165 |
| `/apis/config.ts` | API base URL + auth headers | 61 |
| `/context/AuthContext.tsx` | User authentication + credits | 250 |
| `/types.ts` | Global TypeScript interfaces | 100 |

---

## 🔧 COMMON TASKS

### Task: Add a new product workspace
1. Read: `QUICK_WORKSPACE_REFERENCE.md`
2. Files to create: 5 (page, workspace, hook, api, route)
3. Time: 1-2 hours
4. Template: Copy AIImageGenerator structure

### Task: Understand how image generation works
1. Read: `COMPREHENSIVE_CODEBASE_STRUCTURE.md` → Section 3 (API Architecture)
2. Files: `/apis/images.ts` + `/hooks/useImageGenerator.ts` + `/components/AIImageGeneratorWorkspace.tsx`
3. Flow: Create job → Poll status (5s intervals) → Update results

### Task: Add authentication feature
1. Read: `/context/AuthContext.tsx`
2. Add to context: `<AuthProvider>` wrapper in App.tsx
3. Use in components: `const { user, login, logout } = useAuth()`

### Task: Add notification/toast
1. Use: `const { showToast } = useToast()`
2. Call: `showToast('Message text', 'success' | 'error' | 'info')`
3. No need to manage state — `ToastProvider` handles display

---

## 💡 KEY PATTERNS TO KNOW

### ✅ Product Workspace Pattern
```tsx
// Page: Toggle workspace visibility
const [isStudioOpen, setIsStudioOpen] = useState(false);

// Show workspace when open
if (isStudioOpen) return <WorkspaceComponent onClose={() => setIsStudioOpen(false)} />;

// Show landing page otherwise
return <LandingPageUI onOpenStudio={() => setIsStudioOpen(true)} />;
```

### ✅ API Call Pattern
```tsx
// In hook
try {
  const res = await imagesApi.createJob(payload);
  if (!res.success) { showToast(res.message, 'error'); return; }
  
  // Debit credits
  await useCredits(cost);
  
  // Start polling
  pollJobOnce(res.data.jobId, (status, resultUrl) => {
    updateResults(jobId, { status, url: resultUrl });
  });
} catch (err) {
  showToast('Error', 'error');
}
```

### ✅ Job Polling Pattern
```tsx
// Poll every 5 seconds, max 30 retries (~2.5 min)
let retries = 0;
const poll = async () => {
  const status = await api.getJobStatus(jobId);
  
  if (status === 'done') return resultUrl;
  if (status === 'error') throw new Error('Job failed');
  if (++retries >= 30) throw new Error('Timeout');
  
  setTimeout(poll, 5000);
};
```

### ✅ Modal Pattern (Two-Step Choice)
```tsx
const MyModal = ({ isOpen, onClose, onConfirm }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center">
        <motion.div className="bg-white dark:bg-[#111114] p-10 rounded-[2rem]">
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => onConfirm('option1')}>Option 1</button>
            <button onClick={() => onConfirm('option2')}>Option 2</button>
          </div>
          <button onClick={onClose}>Cancel</button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
```

---

## 📚 SECTION GUIDE

### In `EXPLORATION_SUMMARY.md`:
- **Section 1**: Folder structure
- **Section 2**: Product workspace pattern (3-layer)
- **Section 3**: API architecture
- **Section 4**: Routing system
- **Section 5**: Multi-step forms/modals
- **Section 6**: Product configuration
- **Section 7**: Global types
- **Section 8**: Context & state management

### In `COMPREHENSIVE_CODEBASE_STRUCTURE.md`:
- **Section 1**: Complete folder structure (with all file paths)
- **Section 2**: Detailed workspace pattern with full code examples
- **Section 2.2-2.5**: Four different workspace examples
- **Section 3**: All 17 API modules documented
- **Section 3.1-3.5**: API call patterns with full code
- **Section 4**: App.tsx routing in detail
- **Section 5**: Multi-step forms & modals
- **Section 6**: Product configuration details
- **Section 7**: Global types
- **Section 8**: Tech stack & dependencies
- **Section 9**: Summary & quick reference table

### In `QUICK_WORKSPACE_REFERENCE.md`:
- **Steps 1-6**: Create new product workspace
- **Templates**: Copy-paste code blocks
- **Checklist**: 7 files to create
- **Examples**: API handler, job polling, modal

---

## 🎓 LEARNING SEQUENCE

**For beginners**:
1. `EXPLORATION_SUMMARY.md` (overview)
2. `QUICK_WORKSPACE_REFERENCE.md` (step-by-step implementation)
3. View actual code: `AIImageGeneratorWorkspace.tsx`

**For architects**:
1. `COMPREHENSIVE_CODEBASE_STRUCTURE.md` (complete picture)
2. Review Section 2 (workspace pattern with examples)
3. Review Section 3 (API architecture)
4. Review Section 4 (routing system)

**For API integration**:
1. `COMPREHENSIVE_CODEBASE_STRUCTURE.md` → Section 3
2. View `/apis/images.ts` (reference implementation)
3. Follow `QUICK_WORKSPACE_REFERENCE.md` → Step 4

---

## ⚡ 5-MINUTE QUICKSTART

### Goal: Understand how products work

1. **Open**: `/pages/images/AIImageGenerator.tsx` (40 lines)
   - See: Page structure + workspace toggle

2. **Open**: `/components/AIImageGeneratorWorkspace.tsx` (300 lines)
   - See: Sidebar + Viewport layout + Modals

3. **Open**: `/hooks/useImageGenerator.ts` (400 lines)
   - See: State management + API calls + Job polling

4. **Open**: `/apis/images.ts` (124 lines)
   - See: API client pattern

5. **Check**: `/App.tsx` line 241
   - See: Route definition `/product/ai-image-generator`

**Result**: You now understand 80% of the codebase architecture! 🎉

---

## ❓ FAQ

**Q: Where do I add a new product?**  
A: See `QUICK_WORKSPACE_REFERENCE.md` — 6 steps with templates.

**Q: How does authentication work?**  
A: Check `/context/AuthContext.tsx` — provides `user`, `login()`, `useCredits()`, `refreshUserInfo()`.

**Q: How do I handle errors?**  
A: Use `const { showToast } = useToast()` → `showToast(message, 'error')`.

**Q: What's the async job model?**  
A: Create job → Get jobId → Poll every 5 seconds (max 30 times) → Update UI when done.

**Q: How do I prevent navigation during processing?**  
A: Add `beforeunload` listener + confirm dialog (see `AIImageGeneratorWorkspace.tsx` line 82).

**Q: How do API responses work?**  
A: Always: `{ success: boolean, data: {...}, message?: string }`.

**Q: Where are global types?**  
A: `/types.ts` for global + each API module for API-specific types.

---

## 🎯 NEXT STEPS

1. **Choose your document** based on your goal (see table at top)
2. **Read through** the relevant section
3. **View the source code** mentioned in examples
4. **Start building** using templates provided

**Happy exploring!** 🚀

---

**Document Generated**: April 11, 2026  
**Codebase Version**: Latest  
**Last Updated**: April 11, 2026 at 09:54
