# Skyverses Market AI - Component Structure Report

## Executive Summary
This codebase contains a sophisticated **image and video generation platform** with multiple generator workspaces. Each generator follows a consistent architectural pattern:
- **Left Sidebar**: Model/engine config + prompt input
- **Center Viewport**: Preview/results display  
- **Bottom Bar/Panel**: Generate button + resource status

---

## 1. MODAL SETTINGS COMPONENTS

### ❌ NO ModalSettingImage or ModalSettingVideo found
**Key Finding**: There are **NO dedicated `ModalSettingImage` or `ModalSettingVideo` components**. Settings are handled inline or in collapsible panels within sidebars/bars, NOT modals.

### ✅ Found Instead:

#### `components/art-3d/ViewSettingsModal.tsx`
- **Type**: Modal (only non-image/video settings example)
- **Structure**: 
  - Positioned: `absolute bottom-32 left-1/2 -translate-x-1/2`
  - Contains: Shading selection, Material PBR toggle, Metallic/Roughness sliders, Material palette (5 colors)
  - UI Pattern: Header with title + X close button, settings groups, color swatches at bottom

---

## 2. CONFIRMED COMPONENT LOCATIONS

### A. Product Image Editor (Image Generation + Editing)
**Primary Workspace**: `components/ProductImageWorkspace.tsx`
**Page Entry**: `pages/images/ProductImage.tsx`

#### Structure:
```
ProductImageWorkspace
├── EditorHeader (top nav bar)
├── EditorSidebar (left sidebar - expandable on mobile)
├── EditorViewport (center preview)
└── PromptBar (BOTTOM BAR - MOST IMPORTANT)
```

### B. AI Image Generator (Text-to-Image)
**Primary Workspace**: `components/AIImageGeneratorWorkspace.tsx`
**Page Entry**: `pages/images/AIImageGenerator.tsx`

#### Structure:
```
AIImageGeneratorWorkspace
├── GeneratorSidebar (left sidebar)
│   ├── SidebarSingle (prompt input + suggestions)
│   ├── SidebarBatch (bulk prompt mode)
│   └── ModelEngineSettings (AI config panel)
├── GeneratorViewport (center results grid)
└── MobileGeneratorBar (mobile-only bottom bar)
```

### C. AI Video Generator (Text/Image-to-Video)
**Primary Workspace**: `components/AIVideoGeneratorWorkspace.tsx`
**Page Entry**: `pages/videos/AIVideoGenerator.tsx`

#### Structure:
```
AIVideoGeneratorWorkspace
├── SidebarLeft (left sidebar - expandable)
│   ├── Frame slots (START/END/MULTI)
│   ├── Mode tabs (SINGLE/MULTI/AUTO)
│   ├── MobileGeneratorBar (mobile interface)
│   └── ConfigurationPanel (bottom config on desktop)
├── ResultsMain (center results grid)
└── ConfigurationPanel (settings panel - desktop view)
```

---

## 3. KEY BOTTOM BAR COMPONENTS

### 🎯 PRIMARY: `components/product-image/PromptBar.tsx`
**Path**: `/components/product-image/PromptBar.tsx`
**Size**: ~224 lines
**Used in**: ProductImageWorkspace (Product Image Editor)

#### UI Structure:
```
┌─────────────────────────────────────────────┐
│  AI SETTINGS PANEL (expandable)             │
│  ┌──────────────────────────────────────────┤
│  │ Settings2 icon + "Cấu hình AI Model"     │
│  │ [Close button X]                         │
│  ├──────────────────────────────────────────┤
│  │ ModelEngineSettings component            │
│  └──────────────────────────────────────────┘
└─────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ MAIN INPUT ROW                                               │
├──────────────────────────────────────────────────────────────┤
│ [Ref Images]  [Dashed button] │ [Input field]  [Divider]    │
│ [Thumb 1]     [+ button]      │ "Enter prompt" │            │
│                               │                │ [Credits]  │
│                               │ [Settings2]    │ [Settings] │
│                               │ [AI | ChevUp]  │            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ GENERATE BUTTON (full width)                                 │
│ [ImageIcon] Generate Image  [Loader2 on generating]         │
│ (Gradient blue→violet, disabled state gray)                 │
│ Generate Tooltip: "Hover for disabled reason"               │
└──────────────────────────────────────────────────────────────┘
```

#### Key Props:
```typescript
interface PromptBarProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onPromptSubmit: () => void;
  isGenerating: boolean;
  isGenerateDisabled: boolean;
  onGenerate: () => void;
  generateTooltip?: string | null;
  credits: number;
  usagePreference: string | null;
  actionCost: number;
  references: string[];
  onAddReference: () => void;
  
  // AI Settings
  availableModels: any[];
  selectedModel: any;
  setSelectedModel: (val: any) => void;
  selectedRatio: string;
  setSelectedRatio: (val: string) => void;
  selectedRes: string;
  setSelectedRes: (val: string) => void;
  selectedEngine: string;
  onSelectEngine: (val: string) => void;
  selectedMode: string;
  setSelectedMode: (val: string) => void;
  familyList?: string[];
  selectedFamily?: string;
  setSelectedFamily?: (val: string) => void;
  familyModels?: any[];
  familyModes?: string[];
  familyRatios?: string[];
  familyResolutions?: string[];
}
```

#### Key Features:
- **Collapsible AI Settings Panel** with animated entrance (framer-motion)
- **Reference image gallery** with add button
- **Prompt input** with Enter-to-submit
- **Credits display** (hidden on mobile, visible md+)
- **Settings toggle button** with selected family name
- **Full-width generate button** with tooltip support
- **Disabled state handling** with color/cursor changes

---

### 📱 MOBILE: `components/image-generator/MobileGeneratorBar.tsx`
**Path**: `/components/image-generator/MobileGeneratorBar.tsx`
**Size**: ~145 lines
**Used in**: AIImageGeneratorWorkspace (mobile view) + SidebarLeft (video generator)

#### UI Structure (Collapsed):
```
┌───────────────────────────────────────────────────────────┐
│ [Drag Handle]                                             │
│                                                           │
│ LINE 1: Prompt Input Row                                 │
│ [FolderOpen] [Input "Mô tả hình ảnh..."] [Sliders]      │
│                                                           │
│ LINE 2: Status & Generate                                │
│ [Credit Status]  │  [Generate Button]                    │
│ Ví: 1234         │  ✨ TẠO HÌNH ẢNH                      │
│ Phí: -50         │  (with progress animation)            │
└───────────────────────────────────────────────────────────┘
```

#### UI Structure (Expanded):
```
┌───────────────────────────────────────────────────────────┐
│ [SlidersHorizontal icon] CẤU HÌNH THUẬT TOÁN  [ChevronDown]
└───────────────────────────────────────────────────────────┘
```

#### Key Features:
- **Collapse/expand toggle** with smooth height transition
- **Drag handle indicator** visual feedback
- **File library button** + Settings button
- **Credit/cost display** in compact format
- **Generate button** with progress animation (progress bar moving)
- **Library open callback** for image picker

#### Props:
```typescript
interface MobileGeneratorBarProps {
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  prompt: string;
  setPrompt: (val: string) => void;
  credits: number;
  totalCost: number;
  isGenerating: boolean;
  isGenerateDisabled: boolean;
  onGenerate: (e: React.MouseEvent) => void;
  onOpenLibrary: () => void;
}
```

---

### 🎬 VIDEO: `components/video-generator/ConfigurationPanel.tsx`
**Path**: `/components/video-generator/ConfigurationPanel.tsx`
**Size**: ~100+ lines (truncated)
**Used in**: AIVideoGeneratorWorkspace (desktop bottom panel)

#### UI Structure:
```
┌────────────────────────────────────────────────────────────┐
│ COLLAPSIBLE HEADER                                         │
│ [Settings2] Cấu hình AI  │  Summary: "VEO · Model Name"   │
│ [ChevronUp/Down toggle]                                   │
└────────────────────────────────────────────────────────────┘

(When expanded:)
├── VideoModelEngineSettings component
│   ├── Engine selector
│   ├── Family selector
│   ├── Model variants pills
│   ├── Mode/Resolution/Ratio pills
│   ├── Duration + Sound controls
│   └── Quantity selector
```

#### Key Props:
```typescript
interface ConfigurationPanelProps {
  availableModels: PricingModel[];
  selectedModelObj: PricingModel | null;
  setSelectedModelObj: (model: PricingModel | null) => void;
  selectedEngine: string; 
  setSelectedEngine: (val: string) => void;
  selectedMode: string; 
  setSelectedMode: (val: string) => void;
  ratio: string; 
  cycleRatio: () => void;
  duration: string; 
  cycleDuration: () => void;
  soundEnabled: boolean; 
  cycleSound: () => void;
  resolution: string; 
  cycleResolution: () => void;
  usagePreference: 'credits' | 'key' | null;
  credits: number; 
  setShowResourceModal: (val: boolean) => void;
  currentTotalCost: number; 
  handleGenerate: () => void;
  isGenerating: boolean; 
  isGenerateDisabled: boolean; 
  generateTooltip: string | null;
  activeMode: 'SINGLE' | 'MULTI' | 'AUTO';
  autoTasksCount: number; 
  multiFramesCount: number;
  isMobileExpanded: boolean;
  quantity: number; 
  setQuantity: (val: number) => void;
  
  // Family-based grouping
  familyList?: string[]; 
  selectedFamily?: string; 
  setSelectedFamily?: (val: string) => void;
  familyModes?: string[]; 
  familyResolutions?: string[]; 
  familyRatios?: string[];
  setRatio?: (val: string) => void; 
  setResolution?: (val: string) => void;
  familyModels?: PricingModel[];
}
```

---

### 📊 SHARED SETTINGS COMPONENT: `components/image-generator/ModelEngineSettings.tsx`
**Path**: `/components/image-generator/ModelEngineSettings.tsx`
**Size**: ~16KB / 300+ lines
**Used in**: PromptBar, GeneratorSidebar, AIImageGeneratorWorkspace

#### UI Pattern:
```
┌──────────────────────────────────────────────────────┐
│ COLLAPSIBLE HEADER (with Settings2 icon)             │
│ Cấu hình AI  │  Summary when collapsed               │
│ [ChevronUp/Down]                                     │
├──────────────────────────────────────────────────────┤
│ (When expanded:)                                     │
│                                                      │
│ FAMILY SELECTOR (if hasFamilyData)                  │
│ [Pill] [Pill] [Pill] ...                            │
│                                                      │
│ MODEL VARIANTS (collapsible groups)                 │
│ [Variant 1] [Variant 2] [Variant 3] [Variant 4]    │
│ [Show all...] if more than 4                        │
│                                                      │
│ MODE SELECTOR                                       │
│ [Pill] [Pill] [Pill] ...                            │
│                                                      │
│ RESOLUTION & RATIO PILLS                            │
│ [720p] [1080p] [4K] ...                            │
│ [1:1] [16:9] [9:16] ...                            │
│                                                      │
│ QUANTITY (if SINGLE mode)                           │
│ [Decrease] [1] [Increase]                          │
└──────────────────────────────────────────────────────┘
```

#### Pill Component (Reused):
```typescript
const Pill = ({ 
  label, 
  active, 
  onClick, 
  disabled 
}: { 
  label: string; 
  active: boolean; 
  onClick: () => void; 
  disabled?: boolean 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all border ${active
      ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/25'
      : 'bg-transparent border-black/[0.06] dark:border-white/[0.04] text-slate-600 dark:text-[#888] hover:text-slate-800 dark:hover:text-white/70 hover:border-black/10 dark:hover:border-white/10'
      }`}
  >
    {label}
  </button>
)
```

**Pill Pattern Used For**:
- Mode selection (e.g., "relaxed", "quality")
- Resolution (e.g., "720p", "1080p", "4K")
- Aspect ratio (e.g., "1:1", "16:9", "9:16")
- Model variants selection

---

### 🎨 OTHER BOTTOM/SETTINGS BARS

#### `components/aether-flow/editor/EditorBottomBar.tsx`
- **Type**: Simple info + action bar
- **Structure**: Left side (Database + Cpu status) | Right side (Close + Deploy buttons)
- **Used in**: Aether Flow (workflow builder)

#### `components/common/MobileGeneratorBar.tsx`
- Reusable mobile bar component
- Shared between image and video generators

---

## 4. SIDEBAR COMPONENTS STRUCTURE

### Image Generator Sidebar: `GeneratorSidebar.tsx`
**Structure**:
- Mobile FAB toggle button (fixed bottom-6 left-4)
- Mobile expanded overlay
- Header with close button
- **SidebarSingle** component (for SINGLE mode)
- **SidebarBatch** component (for BATCH mode)
- **ModelEngineSettings** component (settings panel)
- Mobile overflow handling

### Video Generator Sidebar: `SidebarLeft.tsx`
**Structure**:
- Mobile FAB toggle button
- Header with mode tabs (SINGLE/MULTI/AUTO)
- **MobileGeneratorBar** component
- Frame/prompt management per mode
- **ConfigurationPanel** (settings)

---

## 5. SHARED PATTERNS & CONVENTIONS

### 🎨 Color Scheme (by generator type):
- **Image Generator**: Rose/Fuchsia gradients (Rose-500 → Fuchsia-500)
- **Video Generator**: Indigo/Violet gradients (Indigo-500 → Violet-500)  
- **Product Image Editor**: Brand-blue
- **Art 3D**: Purple theme

### 📐 Button/Control Sizing:
- **Buttons**: `px-2.5 py-1` (pills), `px-3 py-1.5` (inputs), `py-3 px-4` (full-size)
- **Icons**: 10-16px for controls, 14-18px for main buttons
- **Text**: 
  - Labels: `text-[10px] font-semibold`
  - UI labels: `text-[9px] font-bold uppercase tracking-widest`
  - Descriptions: `text-[9px] text-slate-400`

### 🎭 Animation Patterns:
- **Framer Motion** used throughout
- **Expand/collapse**: `initial={{ opacity: 0, y: 10 }}` → `animate={{ opacity: 1, y: 0 }}`
- **Hover effects**: `group/genbtn` pattern for nested hover states
- **Transitions**: `duration-300` for most animations

### 🎯 Layout Patterns:
- **Mobile-first**: `hidden md:flex` or `lg:hidden` classes
- **Sidebar positioning**: `${isMobileExpanded ? 'translate-x-0' : '-translate-x-full'}`
- **Viewport structure**: Flex column with flex-grow for content area
- **Bottom positioning**: `absolute bottom-20 lg:bottom-6` for PromptBar

### 💰 Resource Display Pattern:
```
Left side: [Sparkles icon] {credits.toLocaleString()}
Divider: w-px h-5
Right side: [Zap icon] -{actionCost}
```

### 🔘 State Management Pattern:
- **Generate disabled reasons**: Tracked in `generateTooltip` prop
- **Cost calculation**: Per-model `selectedModelCost` or `actionCost`
- **Family grouping**: `selectedFamily` + `familyModels`/`familyModes`/`familyRatios`/`familyResolutions`
- **Usage preference**: `'credits' | 'key' | null` (switches between credit balance or API key display)

---

## 6. KEY UI ELEMENTS FOUND

### Generate Button Variations:
1. **PromptBar**: Full-width, gradient, with tooltip
2. **MobileGeneratorBar**: Flex-grow height-10, progress animation
3. **ConfigurationPanel**: Typically embedded in Generate section

### Settings Panels:
1. **Inline collapsible** (ModelEngineSettings)
2. **Animated overlay** (ViewSettingsModal in art-3d)
3. **Configuration drawer** (ConfigurationPanel bottom)
4. **No dedicated modal for image/video settings** ❌

### Reference/Image Selection:
- **Thumbnail grid** with delete
- **Dashed button to add** (ImagePlus icon)
- **Upload/Library modal** triggered separately

---

## 7. FILE HIERARCHY SUMMARY

```
components/
├── ProductImageWorkspace.tsx ─────────► page: ProductImage.tsx
│   ├── EditorHeader.tsx
│   ├── EditorSidebar.tsx
│   └── PromptBar.tsx ⭐ PRIMARY BOTTOM BAR
│       └── ModelEngineSettings.tsx
│
├── AIImageGeneratorWorkspace.tsx ─────► page: AIImageGenerator.tsx
│   ├── GeneratorSidebar.tsx
│   │   ├── SidebarSingle.tsx
│   │   ├── SidebarBatch.tsx
│   │   └── ModelEngineSettings.tsx
│   ├── GeneratorViewport.tsx
│   └── MobileGeneratorBar.tsx ⭐ MOBILE BOTTOM BAR
│
├── AIVideoGeneratorWorkspace.tsx ─────► page: AIVideoGenerator.tsx
│   ├── SidebarLeft.tsx
│   │   ├── MobileGeneratorBar.tsx
│   │   └── ConfigurationPanel.tsx
│   ├── ResultsMain.tsx
│   └── VideoModelEngineSettings.tsx
│
├── image-generator/
│   ├── ModelEngineSettings.tsx
│   ├── MobileGeneratorBar.tsx
│   └── GeneratorSidebar.tsx
│
├── video-generator/
│   ├── ConfigurationPanel.tsx ⭐ VIDEO BOTTOM PANEL
│   ├── VideoModelEngineSettings.tsx
│   ├── SidebarLeft.tsx
│   └── ...
│
├── product-image/
│   ├── PromptBar.tsx ⭐ MAIN TARGET
│   ├── EditorHeader.tsx
│   ├── EditorSidebar.tsx
│   └── ...
│
└── art-3d/
    └── ViewSettingsModal.tsx (only example of Settings Modal)
```

---

## 8. ACTIONABLE INSIGHTS FOR MODAL SETTINGS IMPLEMENTATION

### ✅ What EXISTS:
1. **PromptBar.tsx** - Full-featured bottom bar with collapsible AI settings panel
2. **MobileGeneratorBar.tsx** - Compact mobile version
3. **ConfigurationPanel.tsx** - Video-specific collapsible settings
4. **ModelEngineSettings.tsx** - Reusable settings component (collapsible, not modal)

### ❌ What DOESN'T EXIST:
- No `ModalSettingImage.tsx`
- No `ModalSettingVideo.tsx`
- No dedicated modal for image/video AI settings
- All settings are **inline collapsible panels**, not modals

### 🔄 Current Pattern:
**Bottom Bar contains → Collapsible Settings Panel** (not separate modal)

### If you want to CREATE ModalSettingImage/Video:
1. Look at `ViewSettingsModal.tsx` as the only modal example
2. Move collapsible panel content into modal structure
3. Add overlay backdrop
4. Position centrally or at bottom
5. But note: **Codebase strongly prefers inline collapsible approach** for these settings

---

## 9. RECOMMENDED FOLLOW-UP STRUCTURE

If creating new settings modals, follow this pattern from ViewSettingsModal:
```typescript
interface ModalSettingImageProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel?: any;
  onSelectModel?: (model: any) => void;
  selectedRatio?: string;
  onSelectRatio?: (ratio: string) => void;
  selectedRes?: string;
  onSelectRes?: (res: string) => void;
  selectedMode?: string;
  onSelectMode?: (mode: string) => void;
}

export const ModalSettingImage: React.FC<ModalSettingImageProps> = ({ 
  isOpen, onClose, ... 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 20 }}
      className="absolute/fixed bottom-32 left-1/2 -translate-x-1/2 w-80 
                 bg-[#1e2024]/98 backdrop-blur-3xl border border-white/10 
                 rounded-[2.5rem] shadow-3xl overflow-hidden z-50"
    >
      {/* Header */}
      {/* Settings content (Pills, Sliders, etc.) */}
      {/* Footer/Actions */}
    </motion.div>
  );
};
```

