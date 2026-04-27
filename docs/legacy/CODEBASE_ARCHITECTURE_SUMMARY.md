# Skyverses AI Marketplace — Codebase Architecture & Patterns

## 📊 Quick Overview

**Project**: AI Marketplace Platform (Skyverses)  
**Tech Stack**: React 18, TypeScript, React Router, Framer Motion, Tailwind CSS  
**Key Files Documented**: App.tsx, types.ts, SolutionDetail.tsx, ProductCard patterns, Agent workspace components

---

## 1. Routes Definition (App.tsx)

**File**: `/pages/App.tsx`

### Route Structure

The app uses a **catch-all layout route** pattern with nested routes:

```typescript
// Main routes wrapper
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="*" element={
    <Layout>
      <Routes>
        {/* Nested routes */}
      </Routes>
    </Layout>
  } />
</Routes>
```

### Core Marketplace Routes

```typescript
<Route path="/" element={<MarketPage />} />              // Homepage
<Route path="/category/:id" element={<CategoryPage />} />
<Route path="/markets" element={<MarketsPage />} />
<Route path="/explorer" element={<ExplorerPage />} />
```

### Product Detail Routes (Two Patterns)

**Pattern 1: Hardcoded Routes** (Specific product pages)
```typescript
// Example: AI Image Generator
<Route path="/product/ai-image-generator" element={<AIImageGenerator />} />
<Route path="/product/ai-video-generator" element={<AIVideoGenerator />} />

// Agent-specific products
<Route path="/product/ai-agent-workflow" element={<ProductAIAgentWorkflow />} />
<Route path="/product/paperclip-ai-agents" element={<PaperclipAIAgents />} />
```

**Pattern 2: Dynamic Catch-all Route** (For generic products via slug)
```typescript
<Route path="/product/:slug" element={<SolutionDetail />} />
```

### All Product Categories Covered

**Image Products** (~10 routes):
- `/product/ai-image-generator`
- `/product/background-removal-ai`
- `/product/poster-marketing-ai`
- `/product/realestate-visual-ai`
- `/product/ai-stylist`

**Video Products** (~5 routes):
- `/product/ai-video-generator`
- `/product/avatar-sync-ai`
- `/product/video-animate-ai`
- `/product/storyboard-studio`

**Audio Products** (~4 routes):
- `/product/text-to-speech`
- `/product/ai-music-generator`
- `/product/voice-design-ai`
- `/product/ai-voice-studio`

**Event/Specialty Routes**:
```typescript
// Event Studio unified routes by type
<Route path="/product/ai-birthday-generator" element={<EventStudioPage type="birthday" />} />
<Route path="/product/ai-wedding-generator" element={<EventStudioPage type="wedding" />} />
<Route path="/product/ai-noel-generator" element={<EventStudioPage type="noel" />} />
<Route path="/product/ai-tet-generator" element={<EventStudioPage type="tet" />} />
```

### Code-Splitting & Prefetching

Routes are lazy-loaded via React.lazy() for performance:

```typescript
const pageImports = {
  market: () => import('./pages/MarketPage'),
  aiImageGenerator: () => import('./pages/images/AIImageGenerator'),
  // ... more imports
};

const MarketPage = React.lazy(pageImports.market);

// Prefetch critical routes on idle
if ('requestIdleCallback' in window) {
  window.requestIdleCallback(() => prefetchCriticalRoutes());
}
```

---

## 2. Existing Product/Detail Pages

### Page Structure Patterns

**Location**: `/pages/` and subdirectories (`/pages/images/`, `/pages/videos/`, `/pages/audio/`)

#### Pattern A: Full Landing Page + Workspace (Most Common)

**Files**:
- `/pages/images/AIImageGenerator.tsx`
- `/pages/images/PaperclipAIAgents.tsx`
- `/pages/videos/AIVideoGenerator.tsx`
- `/pages/ProductAIAgentWorkflow.tsx`

**Structure**:
```typescript
const AIImageGenerator = () => {
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Return workspace modal when open
  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500]">
        <AIImageGeneratorWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  // Return landing page with sections
  return (
    <div className="bg-white dark:bg-[#0a0a0c] min-h-screen">
      <HeroSection onStartStudio={() => setIsStudioOpen(true)} />
      <WorkflowSection />
      <ModesSection />
      <UseCasesSection />
      <FinalCTA onStartStudio={() => setIsStudioOpen(true)} />
    </div>
  );
};
```

**Component breakdown**:
- `HeroSection`: Bold headline + CTA button
- `WorkflowSection`: How it works (step-by-step)
- `ModesSection`/`FeaturesSection`: Key capabilities
- `UseCasesSection`: Industry/use case examples
- `FAQSection`: Frequently asked questions
- `FinalCTA`: Bottom call-to-action
- `LiveStatsBar`: (For Paperclip) Real-time metrics

**Example**: `/components/landing/paperclip-ai-agents/`
```
HeroSection.tsx
LiveStatsBar.tsx
WorkflowSection.tsx
ShowcaseSection.tsx
FeaturesSection.tsx
UseCasesSection.tsx
FAQSection.tsx
FinalCTA.tsx
```

#### Pattern B: Generic Solution Detail (Catch-all)

**File**: `/pages/SolutionDetail.tsx`

```typescript
const SolutionDetail = () => {
  const { slug } = useParams();  // From URL: /product/:slug
  const [solution, setSolution] = useState<Solution | null>(...);

  // Fetch from API or local data
  useEffect(() => {
    const res = await marketApi.getSolutions();
    const found = data.find((s: Solution) => s.slug === slug);
  }, [slug]);

  // Display solution details:
  // - Hero image gallery
  // - Specs table (System ID, Category, Complexity, etc.)
  // - Features list
  // - Call-to-action (Demo/Try now)
  // - Neural stack (AI models used)
};
```

**Renders**:
- Image gallery with hover effects
- Specs table (technical metadata)
- Feature list + icons
- Auth-gated demo modal

---

## 3. Type Definitions (types.ts)

**File**: `/types.ts`

### Core Types

#### `Solution` (Main Product/Agent Type)

```typescript
export interface Solution {
  _id?: string;                          // MongoDB ID
  id: string;                            // Business ID
  slug: string;                          // URL-friendly identifier
  name: LocalizedString;                 // Multi-language name
  category: LocalizedString;             // Category in all languages
  description: LocalizedString;          // Short description
  problems: string[];                    // Pain points addressed
  industries: string[];                  // Target industries
  models?: string[];                     // AI models used (gpt3.5, midjourney, etc.)
  priceCredits?: number;                 // Credit cost
  isFree?: boolean;                      // Free vs paid
  imageUrl: string;                      // Main thumbnail
  gallery?: string[];                    // Additional images
  neuralStack?: NeuralStackItem[];        // AI modes (VEO3, Flux, etc.)
  demoType: 'text' | 'image' | 'video' | 'automation';  // Demo mode
  tags: string[];                        // Search tags
  features: (string | LocalizedString)[];
  complexity: 'Standard' | 'Advanced' | 'Enterprise';
  priceReference: string;
  isActive?: boolean;                    // Market visibility
  order?: number;                        // Sort order
  featured?: boolean;                    // Featured flag
  status?: string;                       // System status
  homeBlocks?: string[];                 // Homepage placement
  platforms?: string[];                  // 'web' | 'ios' | 'android'
}
```

#### `LocalizedString` (Multi-language Support)

```typescript
export interface LocalizedString {
  en: string;
  vi: string;
  ko: string;
  ja: string;
}
```

#### `NeuralStackItem` (AI Model Details)

```typescript
export interface NeuralStackItem {
  name: string;                          // Model name (VEO3, Flux, etc.)
  version: string;                       // Version number
  capability: LocalizedString;           // What it does
}
```

### Other Key Types

```typescript
export type Language = 'en' | 'vi' | 'ko' | 'ja';

export interface HomeBlock {
  key: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  limit: number;
  order: number;
}

export interface UseCase {
  id: string;
  industry: string;
  problem: string;
  solution: string;
  outcome: string;
  icon: string;
}

export interface PricingPackage {
  name: string;
  priceRange: string;
  description: string;
  features: string[];
  isCustom?: boolean;
}
```

---

## 4. Market Configuration (constants/market-config.tsx)

**File**: `/constants/market-config.tsx`

### Home Block Options

Defines home page section categories:

```typescript
export interface HomeBlockOption {
  id: string;                            // Block ID
  label: string;                         // Display label
  title: string;                         // Section title
  subtitle: string;                      // Descriptive subtitle
  icon: React.ReactElement;              // Lucide icon
  color: string;                         // Icon color class
}

export const HOME_BLOCK_OPTIONS: HomeBlockOption[] = [
  { 
    id: 'top-choice',
    label: 'Top Choice',
    title: 'Top Choice',
    subtitle: 'Lựa chọn hàng đầu cho hiệu suất sáng tạo vượt trội',
    icon: <Flame size={14}/>,
    color: 'text-orange-500'
  },
  {
    id: 'top-image',
    label: 'Image Studio',
    title: 'Image Studio',
    subtitle: 'Tổng hợp thị giác độ trung thực cao...',
    icon: <ImageIcon size={14}/>,
    color: 'text-brand-blue'
  },
  {
    id: 'top-video',
    label: 'Video Studio',
    title: 'Video Studio',
    subtitle: 'Công cụ kiến tạo chuyển động AI...',
    icon: <Video size={14}/>,
    color: 'text-purple-500'
  },
  {
    id: 'top-ai-agent',
    label: 'AI Agent Workflow',
    title: 'AI Agent Workflow',
    subtitle: 'Tự động hóa quy trình sáng tạo...',
    icon: <Bot size={14}/>,
    color: 'text-emerald-500'
  },
  {
    id: 'events',
    label: 'Lễ hội & Sự kiện',
    title: 'Lễ hội & Sự kiện',
    subtitle: 'Tài nguyên AI cho những khoảnh khắc...',
    icon: <Gift size={14}/>,
    color: 'text-rose-500'
  },
  {
    id: 'app-other',
    label: 'App khác',
    title: 'Ứng dụng khác',
    subtitle: 'Khám phá các ứng dụng hỗ trợ...',
    icon: <LayoutGrid size={14}/>,
    color: 'text-slate-500'
  }
];
```

**Usage**: Dynamically render marketplace sections with consistent branding

---

## 5. Reusable Components (components/market/)

**Directory**: `/components/market/`

### Component Inventory

#### 1. **SolutionCard.tsx** (Core Product Card)

**Props**:
```typescript
interface SolutionCardProps {
  sol: Solution;
  idx: number;
  lang: string;
  isLiked: boolean;
  isFavorited: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onToggleLike: (e: React.MouseEvent, id: string) => void;
  onClick: (slug: string) => void;
  onHover?: (slug: string) => void;
  onQuickView?: (e: React.MouseEvent, sol: Solution) => void;
  stats: { users: string; likes: string };
  isGrid?: boolean;
}
```

**Features**:
- Responsive card layout (snap-scroll on mobile)
- Hover image scale with overlay fade
- Overlay action buttons (Quick View, Detail)
- Favorite/bookmark button (top-right)
- Category badge (top-left)
- Bottom stats: user count, likes, pricing (FREE or credits)
- Smooth transitions & animations
- Dark mode support

**Key Classes**:
```typescript
className={`flex-shrink-0 snap-start group relative flex flex-col 
  bg-white dark:bg-[#08080a] border border-black/[0.06] 
  dark:border-white/[0.06] hover:border-brand-blue/40 
  dark:hover:border-brand-blue/30 transition-all duration-500 
  shadow-sm hover:shadow-xl hover:shadow-brand-blue/5 rounded-2xl 
  overflow-hidden cursor-pointer ${isGrid ? 'w-full' : 'w-[280px] md:w-[320px] xl:w-[360px]'}`}
```

**Rendered Elements**:
- Image section (aspect-[16/10])
- Category badge
- Favorite bookmark button
- Action overlay (Quick View + Detail buttons)
- Info section:
  - Title (truncated)
  - Description (2-3 line clamp)
  - Stats (users, likes)
  - Pricing indicator

---

#### 2. **ProductQuickViewModal.tsx** (Product Preview Modal)

**Props**:
```typescript
interface ProductQuickViewModalProps {
  sol: Solution | null;
  lang: string;
  isLiked: boolean;
  isFavorited: boolean;
  fakeStats: { users: string; likes: string };
  onClose: () => void;
  onNavigate: (slug: string) => void;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onToggleLike: (e: React.MouseEvent, id: string) => void;
}
```

**Layout**:
- Full-screen backdrop with blur
- Modal panel (max-width: 780px)
- Left column: Product image with overlays
- Right column: Product info, specs, features

**Features**:
- Close on Escape key or backdrop click
- Smooth entry/exit animations (Framer Motion)
- Image with gradient overlays
- Category tag, favorite button
- Product specs (System ID, Category, Complexity, Latency, Privacy)
- Feature list with icons
- Action buttons (Try Demo, View Full, Add to Favorites, Like)

**Customization Points**:
- `sol`: Product data
- `onNavigate`: Navigate to full detail page
- `onToggleFavorite`/`onToggleLike`: Interactive actions

---

#### 3. **ProductToolModal.tsx** (Product Features Modal)

A secondary modal for detailed product features or tool information.

---

#### 4. **FeaturedSection.tsx** (Featured Products Section)

Displays highlighted/featured products with special styling.

---

#### 5. **MarketSectionHeader.tsx** (Section Header)

Reusable section header with:
- Title & subtitle
- Icon
- Optional action button

---

#### 6. **MarketSkeleton.tsx** (Loading State)

Loading placeholder with skeleton cards while data fetches.

**Exports**:
- `CardSkeleton`: Individual card loading state

---

#### 7. **SolutionList.tsx** (Product List Wrapper)

Renders a list/grid of solution cards.

---

## 6. Agent-Specific Components

**Directory**: `/components/agent-workspace/`

### Components for AI Agent Management

#### 1. **MyAgentsTab.tsx**

**Manages**: Display & manage custom agents
**Key Features**:
- Agent card grid with tier icons (Orchestrator, Department, Specialist)
- Search functionality
- Edit/Delete/Duplicate actions
- Color-coded tiers
- Agent selection
- Integration with AgentBuilderModal & AgentSandbox

**Agent Card Props**:
```typescript
interface CustomAgent {
  name: string;
  role: string;
  tier: AgentTier;  // 'orchestrator' | 'department' | 'specialist'
  emoji: string;
  color: string;
  isDefault?: boolean;
  // ... more fields
}
```

**Tier System**:
```typescript
type AgentTier = 'orchestrator' | 'department' | 'specialist';

const TIER_ICONS = {
  orchestrator: Crown,      // CEO-level decision making
  department: Users2,       // Team/department management
  specialist: Brain,        // Deep expertise in one area
};

const TIER_COLORS = {
  orchestrator: '#f59e0b',  // Amber
  department: '#0090ff',    // Blue
  specialist: '#8b5cf6',    // Purple
};
```

---

#### 2. **AgentBuilderModal.tsx**

**Manages**: Create/edit agents with full configuration

**Configuration Options**:
- **Name & Role**: Agent identity
- **Tier**: Orchestrator/Department/Specialist
- **Emoji & Color**: Visual identity
- **Personality Preset**: Analytical, Creative, Assertive, Diplomatic
- **AI Model**: Claude Sonnet/Opus selection
- **Language**: Vietnamese/English/Korean/Japanese
- **System Prompt**: Custom instructions
- **Skills**: Multi-select from skill library
- **Temperature**: (0-1) Creativity control
- **Tools**: API integrations, plugins

**Personality Presets**:
```typescript
const PERSONALITY_PRESETS = [
  { 
    id: 'analytical',
    emoji: '🧮',
    label: 'Analytical',
    desc: 'Data-focused, precise',
    color: '#0090ff',
    inject: 'You communicate in a data-driven, precise manner...'
  },
  { 
    id: 'creative',
    emoji: '🎨',
    label: 'Creative',
    desc: 'Innovative, lateral',
    color: '#ec4899',
    inject: 'You think laterally and unconventionally...'
  },
  // ... more
];
```

---

#### 3. **AgentSandbox.tsx**

**Manages**: Test/interact with agents in real-time

**Features**:
- Chat interface to agent
- Real-time streaming responses
- Agent context/memory
- Tool execution logs
- Performance metrics

---

#### 4. **OrgBuilderTab.tsx**

**Manages**: Build multi-agent organizations

**Hierarchy**:
- CEO/Orchestrator Agent → delegates to
- Department Agents (Marketing AI, DevOps AI, Sales AI) → coordinates
- Specialist Agents (Sub-tasks)

**Features**:
- Drag-and-drop org chart
- Budget allocation per agent
- Governance/permission layers
- Workflow orchestration

---

## 7. Pattern: MarketPage.tsx (Example Implementation)

**File**: `/pages/MarketPage.tsx`

Shows how all components work together:

```typescript
const MarketPage = () => {
  const { lang, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State management
  const [quickViewSol, setQuickViewSol] = useState<Solution | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // API data fetch
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [homeBlocks, setHomeBlocks] = useState<HomeBlock[]>([]);

  // Handlers
  const handleQuickView = (sol: Solution) => setQuickViewSol(sol);
  const handleNavigate = (slug: string) => navigate(`/product/${slug}`);
  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavoriteIds(prev => 
      prev.has(id) ? new Set([...prev].filter(x => x !== id)) : new Set([...prev, id])
    );
  };

  // Render sections
  return (
    <div className="bg-white dark:bg-black min-h-screen">
      {/* Home blocks (configurable sections) */}
      {homeBlocks.map(block => (
        <section key={block.key}>
          <MarketSectionHeader 
            title={block.title[lang]}
            subtitle={block.subtitle[lang]}
            icon={BLOCK_ICONS[block.key]}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Filter solutions by block.key */}
            {solutions.slice(0, block.limit).map((sol, idx) => (
              <SolutionCard
                key={sol.id}
                sol={sol}
                idx={idx}
                lang={lang}
                isLiked={likedIds.has(sol.id)}
                isFavorited={favoriteIds.has(sol.id)}
                onToggleFavorite={handleToggleFavorite}
                onToggleLike={handleToggleLike}
                onClick={handleNavigate}
                onQuickView={handleQuickView}
                stats={{ users: '2.5K', likes: '890' }}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Quick View Modal */}
      <ProductQuickViewModal
        sol={quickViewSol}
        lang={lang}
        isLiked={likedIds.has(quickViewSol?.id || '')}
        isFavorited={favoriteIds.has(quickViewSol?.id || '')}
        fakeStats={{ users: '2.5K', likes: '890' }}
        onClose={() => setQuickViewSol(null)}
        onNavigate={handleNavigate}
        onToggleFavorite={handleToggleFavorite}
        onToggleLike={handleToggleLike}
      />
    </div>
  );
};
```

---

## 8. Key Patterns & Best Practices

### Pattern 1: Modal + Landing Page Toggle

Many product pages use a toggle pattern:
```typescript
const [isStudioOpen, setIsStudioOpen] = useState(false);

if (isStudioOpen) {
  return <WorkspaceComponent onClose={() => setIsStudioOpen(false)} />;
}
return <LandingPage onStart={() => setIsStudioOpen(true)} />;
```

### Pattern 2: Layered Landing Pages

Multi-section landing pages for products:
- Hero (headline + CTA)
- Workflow (how it works)
- Features (key capabilities)
- UseCases (real-world applications)
- FAQ (Q&A)
- FinalCTA (action button)

### Pattern 3: Dark Mode Support

Universal dark mode via Tailwind:
```typescript
className="bg-white dark:bg-[#0a0a0c] text-black dark:text-white"
```

### Pattern 4: Multi-language Support

All content strings use `LocalizedString`:
```typescript
const name = solution.name[lang];  // Get localized name
```

### Pattern 5: Loading States

Skeleton components for async data:
```typescript
{loading ? <CardSkeleton /> : <SolutionCard {...} />}
```

---

## 📁 File Tree Summary

```
skyverses-market-ai/
├── App.tsx                          # Main router + lazy-loading
├── types.ts                         # TypeScript interfaces
├── constants/
│   └── market-config.tsx            # HOME_BLOCK_OPTIONS
├── pages/
│   ├── MarketPage.tsx               # Homepage (all products)
│   ├── SolutionDetail.tsx           # Generic product detail (by slug)
│   ├── ProductAIAgentWorkflow.tsx    # AI Agent product page
│   ├── images/
│   │   ├── AIImageGenerator.tsx
│   │   ├── PaperclipAIAgents.tsx     # Multi-agent orchestration
│   │   ├── ProductImage.tsx
│   │   └── ... (10+ more)
│   ├── videos/
│   │   ├── AIVideoGenerator.tsx
│   │   └── ... (5+ more)
│   ├── audio/
│   │   ├── TextToSpeech.tsx
│   │   └── ... (4+ more)
│   └── ... (other pages)
├── components/
│   ├── market/                      # Reusable marketplace components
│   │   ├── SolutionCard.tsx          # Product card (with hover actions)
│   │   ├── ProductQuickViewModal.tsx # Product preview modal
│   │   ├── ProductToolModal.tsx
│   │   ├── FeaturedSection.tsx
│   │   ├── MarketSectionHeader.tsx
│   │   ├── MarketSkeleton.tsx
│   │   └── SolutionList.tsx
│   ├── agent-workspace/             # AI Agent management
│   │   ├── MyAgentsTab.tsx           # Agent list & management
│   │   ├── AgentBuilderModal.tsx     # Create/edit agents
│   │   ├── AgentSandbox.tsx          # Test agents
│   │   └── OrgBuilderTab.tsx         # Multi-agent orchestration
│   ├── landing/
│   │   ├── image-generator/
│   │   ├── paperclip-ai-agents/      # Agent-specific sections
│   │   ├── ... (other product sections)
│   └── ... (other components)
├── apis/
│   ├── market.ts                    # Product/solution APIs
│   └── ... (other API calls)
├── hooks/
│   ├── useLanguage.tsx
│   ├── useAgentRegistry.ts           # Agent creation/management
│   ├── usePageMeta.ts
│   └── ... (other hooks)
└── context/
    ├── LanguageContext.tsx           # Multi-language
    ├── AuthContext.tsx
    ├── SearchContext.tsx
    └── ... (other contexts)
```

---

## 🎯 Summary for Development

### For New Product Detail Pages
1. Create `/pages/[ProductName].tsx`
2. Use landing page pattern (Hero + Sections)
3. Add route to App.tsx: `<Route path="/product/slug" element={<Component />} />`
4. Reuse `SolutionCard`, `ProductQuickViewModal` for consistency

### For New Agent Features
1. Extend `CustomAgent` interface in `/hooks/useAgentRegistry.ts`
2. Add components to `/components/agent-workspace/`
3. Update `AgentBuilderModal` for new config options
4. Add route to App.tsx if creating agent-specific product page

### For Marketplace Customization
1. Update `HOME_BLOCK_OPTIONS` in `/constants/market-config.tsx` for new sections
2. Modify `Solution` interface if new product metadata needed
3. Adjust `SolutionCard` styling/behavior for different layouts

---

**Documentation Completeness**: ✅ Medium thoroughness
- Routes: Fully documented
- Components: Core market components documented with props
- Types: Key interfaces explained
- Patterns: Best practices identified
- Examples: Usage patterns shown
