---
name: skyverses_ui_style
description: >
  Complete UI/UX style guide for Skyverses Market AI — Atlas design system.
  Read this when building new pages, landing sections, cards, modals, or any UI component
  to ensure visual consistency with the gold/dark theme, typography, animations, and spacing.
---

# Skyverses UI Style Guide — Atlas Design System

## 1. COLOR SYSTEM

### Brand Gold (primary)
| Token | Hex | Usage |
|-------|-----|-------|
| `brand-blue` (legacy alias) | `#C9A84C` | Primary actions, icons, borders, text accents |
| `brand-blueHover` | `#B8963F` | Hover states |
| Light gold | `#E5C767` | Gradient endpoints, highlights |
| Deep gold | `#8B7635` | Dark gradient endpoints |

### Surfaces (dark mode default)
| Token | Value | Usage |
|-------|-------|-------|
| `--atlas-bg-page` | `#0A0A0A` | Page background |
| `--atlas-bg-panel` | `#111111` | Cards, panels |
| `--atlas-bg-panel-hover` | `#1A1A1A` | Card hover bg |
| `--atlas-bg-soft` | `rgba(201,168,76,0.06)` | Subtle gold tint bg |

### Text (dark mode)
| Token | Value | Usage |
|-------|-------|-------|
| `--atlas-text-primary` | `#FFFFFF` | Headings, body |
| `--atlas-text-secondary` | `rgba(255,255,255,0.7)` | Descriptions |
| `--atlas-text-muted` | `rgba(255,255,255,0.5)` | Captions, labels |

### Common Tailwind text classes
```
text-white                        → primary text (dark)
text-white/70 or text-white/60    → secondary / descriptions
text-white/50 or text-white/40    → muted / captions
text-slate-500 dark:text-white/50 → body text (responsive to theme)
text-brand-blue                   → gold accent text
```

### Borders (dark mode)
```
border-white/[0.04]    → subtle card border
border-white/[0.08]    → default border
border-white/10        → atlas default
border-brand-blue/20   → gold accent border
border-brand-blue/30   → gold border (featured)
```

### Gold application patterns
```tsx
// Icon container
<div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center">
  <Icon size={18} className="text-brand-blue" />
</div>

// Pill / badge
<span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full
  bg-brand-blue/[0.08] border border-brand-blue/20 text-brand-blue">
  Label
</span>

// Gold glow shadow
boxShadow: '0 12px 32px rgba(201,168,76,0.3)'
// or Tailwind: shadow-lg shadow-brand-blue/25
```

---

## 2. TYPOGRAPHY

### Font Stack
- **Sans (primary):** `Manrope, Inter, -apple-system, sans-serif` → `font-sans`
- **Display:** `Plus Jakarta Sans, Manrope` → `font-display`
- **Mono:** `Fragment Mono, JetBrains Mono` → `font-mono`

### Type Scale
| Element | Tailwind classes | Notes |
|---------|-----------------|-------|
| Hero H1 | `text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight` | Landing hero titles |
| Section H2 | `text-3xl md:text-4xl font-bold` | Section headers |
| Section H3 | `text-xl md:text-2xl font-bold` | Sub-section headers |
| Card title | `text-sm font-bold` or `text-base font-semibold` | Feature cards |
| Body | `text-base leading-relaxed` | Paragraphs, max-w-md/lg |
| Caption | `text-[10px]` to `text-[12px]` | Badges, sub-labels |
| Section label | `text-[10px] font-semibold uppercase tracking-widest text-brand-blue/60` | Above section h2 |
| AnimatedSectionHeader label | `text-2xl font-bold uppercase text-brand-blue` | Animated section labels |
| AnimatedSectionHeader h2 | `text-4xl font-bold leading-[1.37] tracking-[-0.72px]` | Animated section h2 |

### Custom tokens (tailwind.config.ts)
```
text-hero:        2.5rem / 1.2 / -0.02em / 700
text-hero-mobile: 2rem   / 1.2 / -0.02em / 700
text-h1:          2rem   / 1.3 / -0.01em / 600
text-h2:          1.5rem / 1.3 / 600
text-h3:          1.25rem / 1.3 / 600
text-section:     1.375rem / 1.4 / 700
```

### Heading style
- Always `letter-spacing: -0.01em` (Tailwind: `tracking-tight`)
- Weight: `font-bold` (700) for hero/section, `font-semibold` (600) for h1-h3
- Max width on description text: `max-w-md` or `max-w-lg`

---

## 3. SPACING & LAYOUT

### Section spacing
```
Hero:     pt-12 pb-20 px-6
Features: py-20 px-6
CTA:      py-28 px-6
Generic:  atlas-section = py-12 md:py-20
```

### Container widths
```
max-w-[1400px] mx-auto   → standard page container
max-w-atlas = 1300px      → atlas-container-wide
max-w-atlas-narrow = 1200px → atlas-container
max-w-[700px]             → narrow CTA / centered content
```

### Card padding
```
p-5          → feature card body
p-3          → compact spec cards
px-3 py-2    → badge / pill padding
```

### Grid gaps
```
gap-4             → feature card grid
gap-3             → spec / compact grid
gap-12 lg:gap-16  → hero 2-column layout
```

### Section header spacing
```
mb-14  → below section header, above grid content (56px)
```

### Responsive grid patterns
```tsx
// Hero layout
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
  <div className="lg:col-span-5">  {/* text */}
  <div className="lg:col-span-7">  {/* visual */}
</div>

// Feature grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Trust / stats grid
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

// CTA buttons
<div className="flex flex-col sm:flex-row gap-3">
```

---

## 4. ANIMATION PATTERNS

### Framer Motion — shared primitives
Import from `components/landing/_shared/SectionAnimations.tsx`:

```tsx
import {
  FadeInUp,          // scroll-triggered fade + slide up
  FadeInScale,       // scroll-triggered fade + scale
  StaggerChildren,   // wraps children, staggers entrance
  ParallaxSection,   // subtle parallax depth on scroll
  CountUp,           // animated number counter
  GradientMesh,      // animated gold blob background
  SectionLabel,      // uppercase section label pill
  HoverCard,         // card with hover lift + gold glow
  TimelineConnector, // animated SVG line between steps
} from '../_shared/SectionAnimations';
```

### Motion variants reference
| Animation | Initial | Final | Duration | Ease |
|-----------|---------|-------|----------|------|
| FadeInUp | `opacity:0, y:40` | `opacity:1, y:0` | 0.6s | `[0.22,1,0.36,1]` |
| FadeInScale | `opacity:0, scale:0.92` | `opacity:1, scale:1` | 0.5s | `[0.22,1,0.36,1]` |
| StaggerChildren | stagger 0.08s | — | 0.55s/child | `[0.22,1,0.36,1]` |
| ScaleIn | `opacity:0, scale:0.92` | `opacity:1, scale:1` | 0.8s | `[0.25,0.46,0.45,0.94]` |
| SlideIn | `opacity:0, x:±80` | `opacity:1, x:0` | 0.8s | `[0.25,0.46,0.45,0.94]` |
| BlurTextReveal | `opacity:0, blur(10px)` per word | sharp | 0.5s | `[0.22,1,0.36,1]` |

### Easing constants
```
EASE_OUT_EXPO = [0.22, 1, 0.36, 1]        → primary easing (most animations)
ease-atlas    = cubic-bezier(.22,1,.36,1)  → CSS equivalent
ease-atlas-spring = cubic-bezier(.34,1.56,.64,1) → bounce effect
```

### Viewport trigger margins
```
FadeInUp:        margin: "-80px"
FadeInScale:     margin: "-60px"
StaggerChildren: margin: "-60px"
```

### Button hover animations (framer-motion)
```tsx
// Primary CTA
<motion.button
  whileHover={{ scale: 1.03, boxShadow: '0 12px 32px rgba(201,168,76,0.3)' }}
  whileTap={{ scale: 0.97 }}
>

// Large CTA
<motion.button
  whileHover={{ scale: 1.04 }}
  whileTap={{ scale: 0.97 }}
>
```

### Card hover (HoverCard component)
```tsx
// On hover:
y: -4
borderColor: 'rgba(201,168,76,0.25)'
boxShadow: '0 8px 32px rgba(201,168,76,0.12)'
transition: { duration: 0.25, ease: 'easeOut' }
```

### CSS hover alternative (for non-motion cards)
```css
.hov-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(0,0,0,.08), 0 4px 14px rgba(201,168,76,.12);
  border-color: rgba(201,168,76,.3);
}
```

### CSS keyframe animations (from index.css + tailwind)
```
atlas-fade-in-up:  opacity 0→1, translateY 10px→0, 0.6s ease-atlas
atlas-fade-in:     opacity 0→1
atlas-pulse:       2s gold ring pulse
atlas-gradient-shift: background-position 0%→100%→0%, infinite
```

### Stagger reveal (CSS, non-motion)
```html
<div class="atlas-stagger">
  <div style="--i: 0">...</div>
  <div style="--i: 1">...</div>  <!-- 30ms delay per item -->
</div>
```

### Background blob animation (GradientMesh)
```tsx
// 3 animated blobs
animate: { scale: [1, 1.08, 1], x: [0, 20, 0], y: [0, -20, 0] }
duration: 14-18s, repeat: Infinity, ease: 'easeInOut'

// Intensity levels control opacity:
soft   = 0.04
medium = 0.06
strong = 0.09

// Grid overlay: 80px lines, rgba(201,168,76,0.4), opacity-[0.018]
```

### Floating elements
```tsx
// Floating badge entrance: spring, stiffness: 280, damping: 22
// Floating orbs in cards: scale:[1,1.15,1] opacity:[0.3,0.5,0.3], 4-5s easeInOut
```

### ParallaxSection
```tsx
// Scroll-driven: y from speed*-60px to speed*60px (default speed=0.3)
<ParallaxSection speed={0.3}>content</ParallaxSection>
```

---

## 5. COMPONENT PATTERNS

### Button variants
```tsx
// Primary gold CTA
<button className="px-7 py-3.5 rounded-lg bg-brand-blue text-white font-bold text-sm">

// Large CTA (gradient)
<button className="px-9 py-4 rounded-xl bg-gradient-to-r from-brand-blue to-[#B8963F] text-white font-bold text-base">

// Outline
<button className="px-5 py-3.5 rounded-lg border border-white/[0.08] text-sm font-medium text-white/60 hover:border-brand-blue/40 hover:text-brand-blue">

// Ghost
<button className="px-3 py-2 rounded font-medium text-sm hover:bg-white/[0.04] hover:text-brand-blue">

// Icon + label spacing: gap-2.5, icon size={15} (small) / size={18} (large)
```

### Atlas utility classes (from index.css @layer components)
```
atlas-btn            → gold gradient button, hover lift + glow
atlas-btn-outline    → transparent + border, hover gold
atlas-btn-ghost      → minimal, hover bg + gold text
atlas-btn-lg         → px-5 py-3 text-base
atlas-btn-sm         → px-3 py-2 text-xs
atlas-btn-pill       → rounded-full
atlas-card           → panel bg, border, 8px radius, transition
atlas-card-hover     → hover: gold shadow + lift -2px
atlas-glass          → blur backdrop, semi-transparent
atlas-nav            → sticky header blur
atlas-pill           → gold tint badge
atlas-container      → max-w 1200px, px-5 md:px-8
atlas-container-wide → max-w 1300px
atlas-section        → py-12 md:py-20
atlas-text-gradient  → gold gradient text (dark/light aware)
atlas-surface-soft   → muted bg card
atlas-code           → dark code block surface
```

### Card styles
```tsx
// Standard card
<div className="rounded-xl border border-white/[0.04] bg-[#111] p-5">

// Featured card (gold accent)
<div className="rounded-xl ring-1 ring-brand-blue/20 bg-[#111] p-5">

// Atlas card class
<div className="atlas-card atlas-card-hover p-5">

// Border radius: rounded-xl (12px) for cards, rounded-lg (8px) for atlas-card, rounded-full for pills
```

### Shadow system
```
atlas-xs:   0 1px 2px -1px rgba(10,13,18,.10)
atlas-sm:   0 1px 3px rgba(10,13,18,.10), 0 1px 2px rgba(10,13,18,.06)
atlas-md:   0 4px 6px -1px rgba(10,13,18,.10), 0 2px 4px rgba(10,13,18,.06)
atlas-lg:   0 8px 24px -4px rgba(10,13,18,.12)
atlas-xl:   0 20px 25px -5px rgba(10,13,18,.10)
atlas-glow: 0 6px 16px rgba(201,168,76,.35), 0 4px 12px rgba(201,168,76,.40)
```

---

## 6. BACKGROUND DECORATIONS

### GradientMesh (used in Hero + CTA sections)
```tsx
<GradientMesh intensity="medium" /> // soft | medium | strong

// Renders:
// - Top-right 900x900 blur-[200px] gold blob
// - Bottom-left 700x700 blur-[180px] accent blob
// - Center-right 256x256 blur-[120px] small blob
// - 80px grid overlay at ultra-low opacity
```

### Static blobs (MarketPage style)
```tsx
// Gold blob top-right
<div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-brand-blue/[0.04] blur-[80px]" />

// Subtle aurora
<div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-blue/[0.04] to-transparent" />
```

### Grid pattern (CSS from index.css)
```css
.bg-grid {
  position: fixed; inset: 0;
  background-image:
    linear-gradient(rgba(201,168,76,0.04) 1px, transparent 0),
    linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 0);
  background-size: 50px 50px;
  z-index: 1; pointer-events: none;
}
```

---

## 7. PAGE SECTION TEMPLATE

### Standard landing page structure
```tsx
// 1. Hero (required)
<section className="relative overflow-hidden pt-12 pb-20 px-6">
  <GradientMesh intensity="medium" />
  <div className="relative z-10 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
    <div className="lg:col-span-5">  {/* text col */}
      <SectionLabel>Product Name</SectionLabel>
      <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-white mt-4">
        ...
      </h1>
      <p className="text-base text-white/50 leading-relaxed max-w-md mt-6">...</p>
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <motion.button whileHover={{scale:1.03}} className="atlas-btn atlas-btn-lg">CTA</motion.button>
        <button className="atlas-btn-outline atlas-btn-lg">Secondary</button>
      </div>
    </div>
    <div className="lg:col-span-7">  {/* visual col */}
      <ImageMasonryGrid /> {/* or BeforeAfterSlider, VideoReelGrid */}
    </div>
  </div>
</section>

// 2. Features (required)
<section className="py-20 px-6 bg-black/[0.01] dark:bg-white/[0.01]">
  <div className="max-w-[1400px] mx-auto">
    <SectionLabel>Features</SectionLabel>
    <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-14">...</h2>
    <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <HoverCard className="p-5">...</HoverCard>
    </StaggerChildren>
  </div>
</section>

// 3. Workflow (optional — numbered steps)
// 4. Showcase (recommended — visual gallery)
// 5. FinalCTA (required)
<section className="py-28 px-6">
  <GradientMesh intensity="strong" />
  <div className="relative z-10 max-w-[700px] mx-auto text-center">
    <h2 className="text-3xl md:text-4xl font-bold text-white">...</h2>
    <p className="text-white/50 mt-4 mb-8">...</p>
    <motion.button whileHover={{scale:1.04}} className="atlas-btn atlas-btn-lg atlas-btn-pill">
      Get Started
    </motion.button>
  </div>
</section>
```

---

## 8. RESPONSIVE BREAKPOINTS

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Default | < 640px | Mobile: single column, stacked layout |
| `sm` | 640px | Button rows, small adjustments |
| `md` | 768px | 2-column grids, show desktop elements |
| `lg` | 1024px | 3-column grids, hero 12-col layout, sidebar |
| `xl` | 1280px | Max container widths kick in |

### Mobile patterns
```
hidden md:flex       → desktop-only elements
hidden lg:block      → show from large breakpoint
md:grid-cols-2       → 2 columns on tablet
lg:grid-cols-3       → 3 columns on desktop
lg:grid-cols-12      → 12-col hero on desktop
text-4xl md:text-5xl → responsive heading size
```
