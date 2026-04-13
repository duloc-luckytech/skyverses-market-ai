# AI Slide Creator Codebase Analysis
## Complete Props, State & Wizard Flow Documentation

---

## 📋 Project Overview

**Project Path:** `/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai`

The AI Slide Creator is a comprehensive presentation generation tool that:
1. Takes user input (topic, style, language, slide count)
2. Uses AI to generate slide content outlines
3. Generates unique background images for each slide
4. Provides a live editor for direct slide customization
5. Exports to PPTX, PDF, or PNG

### Key Entry Points:
- **Page:** `pages/slides/AISlideCreatorPage.tsx` — Landing page + workspace toggle
- **Workspace:** `components/AISlideCreatorWorkspace.tsx` — Main application container
- **Hook:** `hooks/useSlideStudio.ts` — Core state management for slides

---

## 🏗️ Architecture Overview

```
AISlideCreatorPage
  ├─ Landing (HeroSection, WorkflowSection, etc.)
  └─ AISlideCreatorWorkspace (when studioMode = true)
       │
       ├─ useSlideStudio() hook [core state]
       ├─ useSlideProjectManager() hook [project persistence]
       │
       ├─ Header Nav (Close, Undo/Redo, Project Switcher, Export)
       │
       ├─ Left Panel: SlideThumbnailList (when slides exist)
       ├─ Middle Panel: SlideCanvas + SlideToolbar (when slides exist)
       ├─ Right Panel: SlideSidebar (settings & generation UI)
       │
       └─ Modals
            ├─ AIGenerateModal (confirmation before deck generation)
            └─ SlideExportModal (download in PPTX/PDF/PNG)
```

---

## 📊 File-by-File Complete Analysis

### 1. **useSlideStudio.ts** (CORE STATE MANAGEMENT)

**Location:** `hooks/useSlideStudio.ts`

#### Key Types:
```typescript
type SlideLayout = 'title-center' | 'title-left' | 'title-image' | 'full-bg' | 'two-col'

interface Slide {
  id: string                              // Unique identifier
  index: number                           // Position in deck
  title: string                           // Editable title
  body: string                            // Editable content
  layout: SlideLayout                     // Layout template
  bgImageUrl: string | null               // Generated background image URL
  bgJobId: string | null                  // Async job tracking ID
  bgStatus: 'idle' | 'generating' | 'done' | 'error'  // BG generation state
  textColor: 'light' | 'dark'             // Text color for contrast
  aiSuggestions: AISuggestion[]           // Alternative text options
  isSuggestLoading: boolean               // AI suggestion loading state
}

interface AISuggestion {
  title: string
  body: string
}

interface StylePreset {
  id: string        // 'corporate', 'creative', 'minimal', 'dark', 'gradient', 'nature'
  label: string
  emoji: string
  description: string
  promptPrefix: string  // Prepended to image generation prompt
}
```

#### State Management:
```typescript
// Deck configuration
const [deckTopic, setDeckTopic] = useState(string)           // Main presentation topic
const [deckStyle, setDeckStyle] = useState(string)           // One of SLIDE_STYLES
const [deckLanguage, setDeckLanguage] = useState(Language)   // 'vi'|'en'|'ko'|'ja'
const [slideCount, setSlideCount] = useState(number)         // 4|6|8|10|12

// Reference images
const [refImages, setRefImages] = useState(string[])         // Max 3 base64 images

// Brand identity (optional)
const [brandLogo, setBrandLogo] = useState(string | null)
const [brandSlogan, setBrandSlogan] = useState(string)
const [brandDescription, setBrandDescription] = useState(string)

// DOCX import
const [docxOutline, setDocxOutline] = useState(DocxOutline[] | null)

// Slides
const [slides, setSlides] = useState(Slide[])
const [activeSlideId, setActiveSlideId] = useState(string)
const activeSlide = slides.find(s => s.id === activeSlideId) ?? null

// UI State
const [isGeneratingDeck, setIsGeneratingDeck] = useState(false)
const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
const [isExportModalOpen, setIsExportModalOpen] = useState(false)
const [isDirty, setIsDirty] = useState(false)

// Undo/Redo
const [undoStack, setUndoStack] = useState(Slide[][])
const [redoStack, setRedoStack] = useState(Slide[][])
```

#### Constants:
```typescript
SLIDE_STYLES = [
  { id: 'corporate', label: 'Corporate', emoji: '💼', promptPrefix: 'professional corporate...' },
  { id: 'creative', label: 'Creative', emoji: '🎨', promptPrefix: 'creative vibrant...' },
  { id: 'minimal', label: 'Minimal', emoji: '◻️', promptPrefix: 'ultra minimal elegant...' },
  { id: 'dark', label: 'Dark Mode', emoji: '🌑', promptPrefix: 'premium dark moody...' },
  { id: 'gradient', label: 'Gradient', emoji: '🌈', promptPrefix: 'smooth soft gradient...' },
  { id: 'nature', label: 'Nature', emoji: '🌿', promptPrefix: 'organic natural calm...' },
]

SLIDE_COUNT_OPTIONS = [4, 6, 8, 10, 12]

LAYOUT_OPTIONS = [
  { id: 'title-center', label: 'Giữa' },
  { id: 'title-left', label: 'Trái' },
  { id: 'two-col', label: '2 cột' },
  { id: 'full-bg', label: 'Full BG' },
  { id: 'title-image', label: 'Ảnh phải' },
]
```

#### Key Functions:

**Deck Generation:**
```typescript
generateDeck(importedOutline?: DocxOutline[]) → Promise<void>
// 1. Calls aiTextViaProxy() to generate outline (if not importing DOCX)
// 2. Creates Slide[] from outline
// 3. Sequentially calls genSlideBgDirect() for each slide
// 4. Updates slides state as images complete
```

**Background Image Generation:**
```typescript
genSlideBg(slideId: string) → Promise<void>
// Single slide BG generation
// Uses imagesApi.createJob() with prompt from buildBgPrompt()
// Polls job status via pollJobOnce()
// Updates slide.bgImageUrl, slide.bgStatus on completion

genSlideBgDirect(slide: Slide, styleId: string, refImgs?: string[], brand?: {...}) → Promise<void>
// Direct generation (used internally during deck generation)
```

**AI Suggestions:**
```typescript
fetchAISuggestions(slideId: string) → Promise<void>
// Fetches 3 alternative title+body combinations
// Calls aiTextViaProxy() with current slide context

applySuggestion(slideId: string, suggestion: AISuggestion) → void
// Applies selected suggestion to slide
```

**Slide Operations:**
```typescript
addSlide() → void                           // Adds blank slide at end
removeSlide(id: string) → void              // Removes slide (min 1)
moveSlide(fromIdx: number, toIdx: number) → void  // Reorders
updateSlide(id: string, patch: Partial<Slide>) → void  // Generic update
```

**Undo/Redo:**
```typescript
undo() → void        // Reverts to previous slides array (max 20 deep)
redo() → void        // Restores undone slides
canUndo: boolean
canRedo: boolean
```

#### Return Value:
```typescript
{
  // Deck config (all with setters)
  deckTopic, setDeckTopic,
  deckStyle, setDeckStyle,
  deckLanguage, setDeckLanguage,
  slideCount, setSlideCount,
  refImages, setRefImages,

  // Brand
  brandLogo, setBrandLogo,
  brandSlogan, setBrandSlogan,
  brandDescription, setBrandDescription,

  // DOCX
  docxOutline, setDocxOutline,

  // Slides
  slides, setSlides,
  activeSlideId, setActiveSlideId,
  activeSlide,

  // UI
  isGeneratingDeck,
  isGenerateModalOpen, setIsGenerateModalOpen,
  isExportModalOpen, setIsExportModalOpen,
  isDirty,

  // Undo/Redo
  undoStack, redoStack,
  undo, redo,
  canUndo, canRedo,

  // Actions
  addSlide,
  removeSlide,
  moveSlide,
  updateSlide,
  generateDeck,
  genSlideBg,
  fetchAISuggestions,
  applySuggestion,
  cancelGeneration,
}
```

#### Persistence:
- **Local Storage Key:** `skyverses_AI-SLIDE-CREATOR_vault`
- **Stored Data:** `{ slides, deckTopic, deckStyle, deckLanguage, slideCount }`
- **Note:** Primary persistence now handled by `useSlideProjectManager` in workspace

---

### 2. **SlideSidebar.tsx** (SETTINGS & GENERATION UI)

**Location:** `components/slide-studio/SlideSidebar.tsx`

#### Props Interface:
```typescript
interface Props {
  // Deck config (with setters)
  deckTopic: string
  setDeckTopic: (v: string) => void
  deckStyle: string
  setDeckStyle: (v: string) => void
  deckLanguage: Language
  setDeckLanguage: (v: Language) => void
  slideCount: number
  setSlideCount: (v: number) => void

  // Reference images
  refImages: string[]
  setRefImages: (v: string[]) => void

  // Generation state & handlers
  isGeneratingDeck: boolean
  onOpenGenerateModal: () => void
  onCancelGeneration: () => void

  // DOCX import
  onDocxImport: (outline: DocxOutline[]) => void

  // Brand identity
  brandLogo: string | null
  setBrandLogo: (v: string | null) => void
  brandSlogan: string
  setBrandSlogan: (v: string) => void
  brandDescription: string
  setBrandDescription: (v: string) => void
}
```

#### Internal State:
```typescript
const [langOpen, setLangOpen] = useState(false)              // Dropdown
const [templatesOpen, setTemplatesOpen] = useState(false)    // Dropdown
const [brandOpen, setBrandOpen] = useState(false)            // Collapsible
const [isDocxLoading, setIsDocxLoading] = useState(false)    // DOCX parsing
const fileRef = useRef<HTMLInputElement>(null)              // Ref images upload
const docxFileRef = useRef<HTMLInputElement>(null)          // DOCX upload
const logoFileRef = useRef<HTMLInputElement>(null)          // Logo upload
```

#### UI Sections:
1. **Header** — "⚙️ Slide Studio Settings"
2. **📝 Topic Input** — Textarea for deck topic (required for generation)
3. **Templates** — 6 pre-configured template buttons (apply topic + style + count + language)
4. **Slide Count** — Button grid [4, 6, 8, 10, 12]
5. **Style Selection** — Grid of SLIDE_STYLES with emoji badges
6. **Language Selector** — Dropdown [Vietnamese 🇻🇳, English 🇺🇸, Korean 🇰🇷, Japanese 🇯🇵]
7. **Reference Images** — Max 3 image uploads (used as style reference for AI)
8. **Brand Identity Section** (collapsible)
   - Logo upload
   - Slogan input (max 80 chars)
   - Description input (max 200 chars)
9. **DOCX Import** — Upload DOCX outline to auto-generate outline
10. **CTA Button** — "Tạo toàn bộ Deck" (calls `onOpenGenerateModal` or shows cancel)

#### Featured Templates:
```typescript
[
  { label: 'Startup Pitch', emoji: '🚀', style: 'dark', slideCount: 8, language: 'en', 
    prompt: 'Startup pitch deck...' },
  { label: 'Báo cáo DN', emoji: '📊', style: 'corporate', slideCount: 6, language: 'vi',
    prompt: 'Báo cáo tổng kết...' },
  // ... 4 more templates
]
```

#### Event Handlers:
```typescript
handleRefImageUpload(e: ChangeEvent) → void        // Read file as base64, max 3
handleDocxImport(e: ChangeEvent) → void            // Parse DOCX, call onDocxImport()
handleLogoUpload(e: ChangeEvent) → void            // Read logo as base64
applyTemplate(t: Template) → void                  // Sets topic, style, count, language
```

---

### 3. **AIGenerateModal.tsx** (CONFIRMATION MODAL)

**Location:** `components/slide-studio/AIGenerateModal.tsx`

#### Props:
```typescript
interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  deckTopic: string
  deckStyle: string
  deckLanguage: Language
  slideCount: number
  isGenerating: boolean
}
```

#### Purpose:
- **Confirmation modal** before full deck generation
- Shows summary of selections (topic, count, style, language)
- Displays info message: "AI sẽ sinh X slides kèm nội dung và ảnh nền"
- Buttons: Cancel | Start Generating (with loading state)

#### Display Logic:
- Truncates topic if > 40 chars
- Converts style ID → label via SLIDE_STYLES
- Maps language code → label (`vi` → 'Tiếng Việt', etc.)

---

### 4. **SlideCanvas.tsx** (EDITABLE SLIDE DISPLAY)

**Location:** `components/slide-studio/SlideCanvas.tsx`

#### Props:
```typescript
interface Props {
  slide: Slide | null
  onUpdateTitle: (id: string, value: string) => void
  onUpdateBody: (id: string, value: string) => void
}
```

#### Features:
- **16:9 aspect ratio** canvas with rounded corners & shadow
- **Background image display** (animated fade-in on swap)
- **Gradient overlay** (black/40 for light text, white/50 for dark)
- **Layout-aware text positioning** (LAYOUT_CLASSES map)
- **Editable text fields** (custom EditableText component):
  - Contenteditable for title
  - Textarea for body (multiline)
- **Status indicators**:
  - Slide number badge (top-left)
  - "Generating image..." spinner (if bgStatus === 'generating')
  - Error badge (if bgStatus === 'error')
- **Text contrast** based on `slide.textColor` ('light' | 'dark')

#### Layout Templates:
```typescript
LAYOUT_CLASSES = {
  'title-center': { wrapper: 'flex flex-col items-center justify-center text-center', ... },
  'title-left': { wrapper: 'flex flex-col justify-center px-12', ... },
  'full-bg': { wrapper: 'flex flex-col items-center justify-end text-center pb-12', ... },
  'two-col': { wrapper: 'grid grid-cols-2 gap-6 px-10 items-center', ... },
  'title-image': { wrapper: 'grid grid-cols-2 gap-6 px-10 items-center', ... },
}
```

#### Empty State:
Shows "Chưa có slide nào" if `slide === null`

---

### 5. **HeroSection.tsx** (LANDING PAGE HERO)

**Location:** `components/landing/ai-slide-creator/HeroSection.tsx`

#### Props:
```typescript
interface HeroSectionProps {
  onStartStudio: () => void  // Called on "Mở AI Slide Studio" button
}
```

#### Content:
1. **Left Column:**
   - Back link to `/markets`
   - Badge: "Mới · Miễn phí hoàn toàn"
   - Headline: "Tạo Slide Trình Chiếu AI" (with animated underline)
   - Description: Step-by-step user flow
   - 4 feature specs (SPECS array)
   - CTA buttons: "Mở AI Slide Studio" + "Xem ví dụ"

2. **Right Column:**
   - Fake workspace mockup with:
     - Fake title bar with window controls
     - Left thumbnail strip (MOCK_SLIDES: 4 gradient-based previews)
     - Main canvas area with toolbar & active slide preview
     - Right sidebar with style & slide count options
   - Floating badges for key features

#### MOCK_SLIDES:
```typescript
[
  { label: 'Corporate', gradient: 'from-slate-900 via-blue-950 to-indigo-950', ... },
  { label: 'Creative', gradient: 'from-violet-900 via-purple-900 to-fuchsia-950', ... },
  { label: 'Minimal', gradient: 'from-zinc-900 via-zinc-800 to-slate-900', ... },
  { label: 'Education', gradient: 'from-emerald-900 via-teal-900 to-cyan-950', ... },
]
```

---

### 6. **WorkflowSection.tsx** (LANDING PAGE — 4-STEP WORKFLOW)

**Location:** `components/landing/ai-slide-creator/WorkflowSection.tsx`

#### Purpose:
- Visual timeline showing the 4-step process
- Each step has CDN image thumbnail + icon + description

#### STEPS Array:
```typescript
[
  {
    n: 1,
    icon: FileText,
    title: 'Nhập chủ đề',
    desc: 'Mô tả chủ đề, chọn phong cách..., số slide và ngôn ngữ'
  },
  {
    n: 2,
    icon: Sparkles,
    title: 'AI sinh nội dung',
    desc: 'AI tự viết outline đầy đủ: tiêu đề + bullet points'
  },
  {
    n: 3,
    icon: Image,
    title: 'Gen ảnh nền AI',
    desc: 'Mỗi slide nhận 1 ảnh background AI riêng biệt'
  },
  {
    n: 4,
    icon: Edit3,
    title: 'Chỉnh & Xuất file',
    desc: 'Live editor: click để sửa, AI gợi ý, xuất PPTX/PDF/PNG'
  },
]
```

---

### 7. **AISlideCreatorWorkspace.tsx** (MAIN APPLICATION)

**Location:** `components/AISlideCreatorWorkspace.tsx`

#### Props:
```typescript
interface Props {
  onClose: () => void  // Called to close workspace
}
```

#### Key Hooks Used:
```typescript
const s = useSlideStudio()              // Core slide state
const pm = useSlideProjectManager()     // Project persistence & switching
```

#### State:
```typescript
const [exportDropOpen, setExportDropOpen] = useState(false)
const [exportFormat, setExportFormat] = useState<'pptx' | 'pdf' | 'png'>('pptx')
const isLoadingProjectRef = useRef(false)  // Flag to prevent auto-save during load
const autoSaveTimerRef = useRef(...)     // Debounce timer (500ms)
```

#### Effects:

**1. Load Active Project (on mount):**
```typescript
useEffect(() => {
  const project = pm.loadProject(pm.activeProjectId)
  // Populate s.slides, s.deckTopic, s.deckStyle, etc.
  isLoadingProjectRef.current = false after 100ms
}, [])
```

**2. Auto-save to Project Manager (debounced 500ms):**
```typescript
useEffect(() => {
  // On slides/deckTopic/deckStyle/deckLanguage/slideCount change:
  pm.saveCurrentProject({
    id, slides, deckTopic, deckStyle, deckLanguage, slideCount
  })
}, [s.slides, s.deckTopic, s.deckStyle, s.deckLanguage, s.slideCount])
```

#### Handlers:

**Project Management:**
```typescript
handleSwitchProject(id: string) → void      // Save current, load new, update UI
handleCreateProject(name: string) → void    // Create new blank project
handleDuplicateProject(id: string) → void   // Duplicate & switch to new
handleDeleteProject(id: string) → void      // Delete & handle active reassignment
```

**Slide Updates:**
```typescript
handleUpdateTitle(id: string, val: string) → void
handleUpdateBody(id: string, val: string) → void
handleChangeLayout(id: string, layout: SlideLayout) → void
handleChangeTextColor(id: string, color: 'light' | 'dark') → void
```

#### UI Layout:

**Header Bar:**
- Left: Close button, Title "AI Slide Creator", Project Switcher
- Center: Undo/Redo buttons, Slide count badge
- Right: Quick Generate (if no slides), Free badge, Export dropdown

**Main Body (3 panels):**
1. **Left Panel:** `SlideThumbnailList` (if slides exist)
2. **Middle Panel:** 
   - Empty state (if no slides) → button to generate
   - Otherwise: `SlideToolbar` + `SlideCanvas`
3. **Right Panel:** `SlideSidebar`

**Modals:**
```typescript
<AIGenerateModal ... />
<SlideExportModal ... />
```

---

## 🔄 Wizard Flow Mapping

### Initial User Journey:

```
1. Landing Page (AISlideCreatorPage)
   └─ User clicks "Mở AI Slide Studio"
       └─ setStudioMode(true)

2. AISlideCreatorWorkspace Mounts
   ├─ useSlideStudio() initializes with localStorage (if exists) or defaults
   ├─ useSlideProjectManager() loads active project
   ├─ Empty state displayed: "Bắt đầu tạo Slide"
   └─ User sees SlideSidebar ready for input

3. SlideSidebar Input Phase
   ├─ User enters deckTopic (required)
   ├─ User selects deckStyle (default: 'corporate')
   ├─ User selects deckLanguage (default: 'vi')
   ├─ User selects slideCount (default: 6)
   ├─ [Optional] Upload refImages (max 3)
   ├─ [Optional] Upload brand logo + slogan + description
   ├─ [Optional] Apply template (auto-fills all above)
   └─ "Tạo toàn bộ Deck" button enabled

4. Generate Modal
   ├─ User clicks "Tạo toàn bộ Deck"
   ├─ AIGenerateModal opens (confirmation)
   ├─ Shows summary: topic, count, style, language
   └─ User clicks "Bắt đầu tạo" or "Huỷ"

5. Deck Generation (if confirmed)
   ├─ isGeneratingDeck → true
   ├─ UI shows "Cancel" button instead of "Generate"
   │
   ├─ Step 1: Generate outline
   │  └─ Call aiTextViaProxy() with prompt including:
   │     • deckTopic
   │     • slideCount
   │     • deckLanguage
   │     • deckStyle
   │     • [Optional] refImages description
   │     • [Optional] brandDescription, brandSlogan
   │  └─ Parse JSON response → outline[]
   │
   ├─ Step 2: Create slides with text content
   │  └─ For each outline item:
   │     • Create Slide with title, body
   │     • Set layout (first slide: 'title-center', rest: 'title-left')
   │     • Set bgStatus → 'idle'
   │     • setSlides([...])
   │
   ├─ Step 3: Generate background images sequentially
   │  └─ For each slide:
   │     • Call buildBgPrompt():
   │       - Style preset prefix
   │       - Slide title context
   │       - Visual style from refImages
   │       - Brand description context
   │     • Call imagesApi.createJob()
   │     • Poll job status via pollJobOnce()
   │     • Update slide.bgImageUrl on done
   │     • Show status: "Đang gen ảnh..." or "Lỗi gen ảnh"
   │
   └─ isGeneratingDeck → false, slides ready for editing

6. Live Editor Phase
   ├─ User sees SlideCanvas with editable text
   ├─ SlideThumbnailList shows all slides
   ├─ SlideToolbar allows:
   │  ├─ Change layout (5 options)
   │  ├─ Change text color (light/dark)
   │  ├─ Regenerate single slide BG
   │  ├─ Fetch AI suggestions (3 alternatives)
   │  └─ Apply suggestion
   ├─ Direct click-to-edit on canvas
   ├─ Undo/Redo available
   ├─ Auto-save → project manager (500ms debounce)
   └─ Manual save implicit via project manager

7. Export Phase
   ├─ User clicks "Xuất" dropdown
   ├─ Selects format: PPTX | PDF | PNG
   ├─ SlideExportModal opens
   ├─ Download begins
   └─ [Optional] Share or close

8. Project Management (at any time)
   ├─ User can switch projects via SlideProjectSwitcher
   ├─ Create new project
   ├─ Duplicate current project
   ├─ Rename project
   └─ Delete project (with warning)
```

---

## 📦 Props/State Summary for Wizard Design

### State Available for Wizard:

From `useSlideStudio`:
```typescript
// Deck Configuration
deckTopic                   // Current input
deckStyle                   // Current style selection
deckLanguage                // Current language
slideCount                  // Current count

// Reference Data
refImages                   // Uploaded reference images
brandLogo, brandSlogan, brandDescription  // Brand identity

// Slide Data
slides                      // All slides
activeSlide                 // Currently displayed slide
activeSlideId               // Current slide ID

// Generation State
isGeneratingDeck            // True during generation
isGenerateModalOpen         // Modal visibility
isDirty                     // Has unsaved changes

// Capabilities
canUndo, canRedo            // Undo/redo availability
```

### Key Callback Functions:

```typescript
// Configuration
setDeckTopic, setDeckStyle, setDeckLanguage, setSlideCount
setRefImages

// Generation
generateDeck(importedOutline?: DocxOutline[])  // Start generation
cancelGeneration()                              // Stop generation
setIsGenerateModalOpen(bool)                    // Modal control

// Slide Editing
updateSlide(id, patch)
addSlide(), removeSlide(id)
setActiveSlideId(id)

// AI Features
genSlideBg(slideId)                            // Single BG
fetchAISuggestions(slideId)                    // AI alternatives
applySuggestion(slideId, suggestion)           // Apply suggestion

// Undo/Redo
undo(), redo()
```

---

## 🎯 Wizard Integration Points

### Suggested Onboarding Wizard Steps:

**Step 1: Welcome**
- Explain the 4-step process
- Show MOCK_SLIDES
- Highlight: "Each slide gets unique AI background"

**Step 2: Topic & Basic Settings**
- Guide through SlideSidebar inputs:
  - deckTopic (required)
  - deckStyle
  - deckLanguage
  - slideCount
- Suggest templates

**Step 3: Optional Brand Setup**
- Explain reference images
- Show brand identity section
- Demo with sample brand

**Step 4: Generation Preview**
- Show AIGenerateModal
- Explain what will happen
- Play generation animation

**Step 5: Live Editor Tour**
- Highlight SlideCanvas features
- Show SlideToolbar options
- Demo text editing
- Demo layout switching

**Step 6: Export Overview**
- Show export formats
- Highlight export quality

**Step 7: Project Management**
- Explain project switching
- Show duplication/save options

---

## 🔌 External Dependencies

### Hooks Used:
```typescript
useSlideStudio()              // Core state (useSlideStudio.ts)
useSlideProjectManager()      // Project persistence
useAuth()                     // Auth context
useToast()                    // Toast notifications
useDocxImport()               // DOCX parsing
```

### APIs:
```typescript
imagesApi.createJob()         // Create image generation job
aiTextViaProxy()              // Call Claude for outline + suggestions
pollJobOnce()                 // Poll job completion
```

### Types:
```typescript
Language = 'vi' | 'en' | 'ko' | 'ja'
SlideLayout = 'title-center' | 'title-left' | 'title-image' | 'full-bg' | 'two-col'
DocxOutline = { title: string; body: string }
```

---

## 🎨 UI Components Used

- **Framer Motion:** Animations, modals, transitions
- **Lucide Icons:** All UI icons
- **Tailwind CSS:** Styling throughout
- **Custom Components:**
  - `SlideThumbnailList` — Slide thumbnails
  - `SlideToolbar` — Editing controls
  - `SlideProjectSwitcher` — Project management
  - `SlideExportModal` — Download dialog

---

## ✅ Ready for Wizard Design

You now have:
1. **Complete state structure** from useSlideStudio
2. **All props** for each component
3. **Event flows** for deck generation
4. **UI integration points** in AISlideCreatorWorkspace
5. **Visual hierarchy** from landing pages
6. **User journey** from landing to export

**Key insight for wizard:** The best integration points are:
- **Pre-generation:** Sidebar settings tour
- **During generation:** Progress visualization
- **Post-generation:** Features tour (layouts, AI suggestions, export)
- **Cross-session:** Project management highlights
