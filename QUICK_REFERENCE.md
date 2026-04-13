# Quick Reference: Bottom Bars & Settings Components

## 🎯 The 3 Main Bottom Bar Components

| Component | Location | Used By | Mobile Support |
|-----------|----------|---------|-----------------|
| **PromptBar.tsx** | `components/product-image/` | ProductImageWorkspace | ✅ Responsive |
| **MobileGeneratorBar.tsx** | `components/image-generator/` | AIImageGeneratorWorkspace + SidebarLeft | 📱 Mobile-first |
| **ConfigurationPanel.tsx** | `components/video-generator/` | AIVideoGeneratorWorkspace | ✅ Responsive |

---

## 📍 File Paths (Copy-Paste Ready)

### Primary Components
```
📄 components/product-image/PromptBar.tsx
   └─ 224 lines, 31 KB
   └─ Features: Reference images, AI settings panel, generate button
   
📄 components/image-generator/MobileGeneratorBar.tsx
   └─ 145 lines
   └─ Features: Collapsible, progress animation, compact credits
   
📄 components/video-generator/ConfigurationPanel.tsx
   └─ 100+ lines
   └─ Features: Collapsible header, embedded VideoModelEngineSettings
```

### Supporting Components
```
📄 components/image-generator/ModelEngineSettings.tsx
   └─ 300+ lines, 16 KB
   └─ Used by: PromptBar, GeneratorSidebar
   
📄 components/video-generator/VideoModelEngineSettings.tsx
   └─ 300+ lines (truncated)
   └─ Used by: ConfigurationPanel
```

---

## 🎨 UI Structure Comparison

### PromptBar (Product Image Editor)
```
[AI Settings Panel ▼] ← Collapsible
├─ Settings2 icon + Title + X close

[Main Input Row]
├─ [Ref Images] [+ button] │ [Input] │ [Credits] [Settings toggle]

[Generate Button] ← Full width gradient
└─ with tooltip on hover
```

### MobileGeneratorBar (Image Generator Mobile)
```
[Drag Handle]

[Collapsed State]:
├─ [FolderOpen] [Input] [Sliders]
├─ [Credits Status] | [Generate Button + animation]

[Expanded State]:
└─ CẤU HÌNH THUẬT TOÁN [ChevronDown]
```

### ConfigurationPanel (Video Generator Desktop)
```
[Settings2] Cấu hình AI [ChevronUp/Down]
├─ Summary: "VEO · Model Name" (when collapsed)

[Expanded]:
└─ VideoModelEngineSettings component
   ├─ Engine/Family selectors
   ├─ Model variant pills
   ├─ Mode/Resolution/Ratio pills
   ├─ Duration + Sound controls
   └─ Quantity selector
```

---

## 🔑 Key Props Summary

### PromptBar
```typescript
{
  // Prompt Management
  prompt: string
  onPromptChange: (prompt: string) => void
  onPromptSubmit: () => void
  
  // Generation Control
  isGenerating: boolean
  isGenerateDisabled: boolean
  onGenerate: () => void
  generateTooltip?: string
  
  // Resources
  credits: number
  usagePreference: 'credits' | 'key' | null
  actionCost: number
  
  // References
  references: string[]
  onAddReference: () => void
  
  // AI Settings (extensive)
  availableModels: any[]
  selectedModel: any
  selectedRatio: string
  selectedRes: string
  selectedEngine: string
  selectedMode: string
  familyList?: string[]
  selectedFamily?: string
  // ... more family-based selectors
}
```

### MobileGeneratorBar
```typescript
{
  isExpanded: boolean
  setIsExpanded: (val: boolean) => void
  prompt: string
  setPrompt: (val: string) => void
  credits: number
  totalCost: number
  isGenerating: boolean
  isGenerateDisabled: boolean
  onGenerate: (e: React.MouseEvent) => void
  onOpenLibrary: () => void
}
```

### ConfigurationPanel
```typescript
{
  // Models & Engines
  availableModels: PricingModel[]
  selectedModelObj: PricingModel | null
  selectedEngine: string
  selectedMode: string
  
  // Settings
  ratio: string
  duration: string
  soundEnabled: boolean
  resolution: string
  quantity: number
  
  // Callbacks
  handleGenerate: () => void
  cycleRatio: () => void
  cycleDuration: () => void
  cycleSound: () => void
  cycleResolution: () => void
  
  // Family grouping
  familyList?: string[]
  selectedFamily?: string
  familyModes?: string[]
  // ...
}
```

---

## 🎭 Animation Patterns

### Collapse/Expand
```typescript
initial={{ opacity: 0, y: 10, scale: 0.98 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, y: 10, scale: 0.98 }}
transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
```

### Sidebar Mobile Slide
```typescript
className={`${isMobileExpanded ? 'translate-x-0' : '-translate-x-full'} 
            transition-transform duration-300`}
```

### Progress Animation (Mobile Bar)
```css
@keyframes progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

---

## 🎨 Tailwind Classes (Reusable)

### Button Sizing
- Pills: `px-2.5 py-1 rounded-md`
- Input buttons: `px-3 py-1.5`
- Full-size: `py-3 px-4`
- Compact icon: `p-1.5`

### Text Sizing
- Labels: `text-[10px] font-semibold`
- Small caps: `text-[9px] font-bold uppercase tracking-widest`
- Descriptions: `text-[9px] text-slate-400`

### Color Patterns
- Image Generator (Rose): `bg-rose-500/10` + `border-rose-500/25` (active)
- Video Generator (Indigo): `bg-indigo-500/10` + `border-indigo-500/25` (active)
- Inactive pill: `bg-transparent border-black/[0.06] dark:border-white/[0.04]`

### Backdrop & Glass
- Blur: `backdrop-blur-2xl`
- Background: `bg-white/95 dark:bg-[#14151a]/95`
- Border: `border border-slate-200 dark:border-white/[0.06]`

---

## ❌ What's NOT in the Codebase

- ❌ `ModalSettingImage.tsx`
- ❌ `ModalSettingVideo.tsx`
- ❌ Dedicated settings modals for image/video generation
- ❌ All settings use inline collapsible panels instead

---

## ✅ What IS in the Codebase

- ✅ Collapsible AI settings panels
- ✅ Family-based model grouping system
- ✅ Pill-based selection pattern for modes/resolutions/ratios
- ✅ Mobile-responsive bottom bars
- ✅ Resource cost tracking with visual indicators
- ✅ Reference image management
- ✅ Progress animations for long tasks

---

## 🔗 Integration Points

### How PromptBar is Integrated
```typescript
// In ProductImageWorkspace.tsx
<PromptBar
  prompt={e.prompt}
  onPromptChange={e.setPrompt}
  onPromptSubmit={e.handlePromptAction}
  isGenerating={e.isGenerating}
  isGenerateDisabled={isGenerateDisabled}
  onGenerate={handlePromptAction}
  credits={e.credits}
  usagePreference={e.usagePreference}
  actionCost={ACTION_COST}
  references={e.references}
  onAddReference={() => { /* modal logic */ }}
  // ... more props
/>
```

### How ConfigurationPanel is Integrated
```typescript
// In AIVideoGeneratorWorkspace.tsx
<SidebarLeft>
  <ConfigurationPanel
    availableModels={availableModels}
    selectedModelObj={selectedModelObj}
    // ... props
  />
</SidebarLeft>
```

---

## 📊 Component Stats

| Metric | Value |
|--------|-------|
| Total bottom bar components | 3 |
| Total settings components | 3+ |
| Largest component (ModelEngineSettings) | 300+ lines |
| Animation library | Framer Motion |
| Mobile breakpoint | `lg:` (1024px) |
| Color theme | TailwindCSS dark mode |

---

## 🚀 Quick Copy-Paste References

### Import PromptBar
```typescript
import { PromptBar } from './product-image/PromptBar';
```

### Import MobileGeneratorBar
```typescript
import { MobileGeneratorBar } from './image-generator/MobileGeneratorBar';
```

### Import ConfigurationPanel
```typescript
import { ConfigurationPanel } from './video-generator/ConfigurationPanel';
```

### Pill Button Pattern
```typescript
const Pill = ({ label, active, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all border ${
      active
        ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/25'
        : 'bg-transparent border-black/[0.06] dark:border-white/[0.04] text-slate-600 dark:text-[#888] hover:text-slate-800 dark:hover:text-white/70 hover:border-black/10 dark:hover:border-white/10'
    }`}
  >
    {label}
  </button>
);
```

