# Skyverses Market AI - Comprehensive Codebase Structure & Patterns

**Date**: April 11, 2026  
**Analysis Depth**: Complete architectural review with file paths, patterns, and implementation examples

---

## 📋 TABLE OF CONTENTS

1. [Overall Folder Structure](#overall-folder-structure)
2. [Product Workspace Pattern](#product-workspace-pattern)
3. [API Call Architecture](#api-call-architecture)
4. [Routing System (App.tsx)](#routing-system-apptsx)
5. [Multi-Step Forms & Modals](#multi-step-forms--modals)
6. [Product Configuration](#product-configuration)
7. [Global Types & Interfaces](#global-types--interfaces)
8. [Key Dependencies & Stack](#key-dependencies--stack)

---

## 1. OVERALL FOLDER STRUCTURE

```
skyverses-market-ai/
├── pages/                          # 60 page components organized by product category
│   ├── MarketPage.tsx             # Homepage/landing
│   ├── ExplorerPage.tsx           # Product explorer
│   ├── MarketsPage.tsx            # Markets listing
│   ├── AppsPage.tsx               # App marketplace
│   ├── SettingsPage.tsx           # User settings
│   ├── CreditsPage.tsx            # Credit purchase
│   ├── LoginPage.tsx              # Authentication
│   ├── images/                    # 29 image-related product pages
│   │   ├── AIImageGenerator.tsx   # ⭐ Workspace pattern example
│   │   ├── EventStudioPage.tsx    # ⭐ Multi-event workspace
│   │   ├── ProductImage.tsx
│   │   ├── AIStylistPage.tsx
│   │   ├── BackgroundRemovalAI.tsx
│   │   ├── RealEstateVisualAI.tsx
│   │   └── ... (21 more image products)
│   ├── videos/                    # 6 video-related product pages
│   │   ├── AIVideoGenerator.tsx
│   │   ├── GenyuProduct.tsx
│   │   ├── StoryboardStudioPage.tsx
│   │   └── ... (3 more video products)
│   └── audio/                     # 4 audio-related product pages
│       ├── TextToSpeech.tsx
│       ├── MusicGenerator.tsx
│       ├── VoiceDesignAI.tsx
│       └── VoiceStudio.tsx
│
├── components/                    # 98+ reusable UI components
│   ├── *Workspace.tsx            # Product workspaces (26 files)
│   │   ├── AIImageGeneratorWorkspace.tsx
│   │   ├── ProductImageWorkspace.tsx
│   │   ├── EventStudioWorkspace.tsx
│   │   ├── VideoAnimateWorkspace.tsx
│   │   └── ... (22 more workspaces)
│   │
│   ├── image-generator/          # Sidebar, viewport, modals for image generation
│   │   ├── GeneratorSidebar.tsx
│   │   ├── GeneratorViewport.tsx
│   │   └── ... (8 sub-components)
│   │
│   ├── product-image/            # Product image editor sub-components
│   │   ├── EditorHeader.tsx
│   │   ├── EditorViewport.tsx
│   │   ├── EditorSidebar.tsx
│   │   └── ... (5 more sub-components)
│   │
│   ├── storyboard-studio/        # Storyboard workspace components
│   ├── event-studio/             # Event studio sub-components
│   ├── common/                   # Shared modals & utilities
│   │   ├── ResourceAuthModal.tsx # ⭐ Multi-step resource selection
│   │   ├── JobLogsModal.tsx
│   │   ├── ModelSelectorModal.tsx
│   │   └── ... (8 shared components)
│   │
│   ├── landing/                  # Landing page sections
│   ├── market/                   # Market page components
│   ├── shared/                   # Utility components
│   └── Layout.tsx                # Main app wrapper
│
├── apis/                         # 17 API client modules
│   ├── config.ts                 # ⭐ API base URL & headers configuration
│   ├── images.ts                 # Image generation API
│   ├── videos.ts                 # Video generation API
│   ├── upscale.ts                # Image upscaling API
│   ├── credits.ts                # Credit management API
│   ├── auth.ts                   # Authentication API
│   ├── market.ts                 # Market data API
│   ├── pricing.ts                # Pricing information API
│   ├── aiChat.ts                 # AI chat API
│   ├── media.ts                  # Media management API
│   └── ... (8 more API modules)
│
├── hooks/                        # 23 custom React hooks
│   ├── useImageGenerator.ts      # ⭐ Main image generation logic
│   ├── useJobPoller.ts           # ⭐ Job status polling pattern
│   ├── useProductImageEditor.ts  # Product image editing logic
│   ├── useStoryboardStudio.ts    # Storyboard workspace logic
│   ├── useEventStudio.ts         # Event studio logic
│   ├── useCharacterSync.ts       # Character sync logic
│   ├── useImageModels.ts         # Image model management
│   ├── useAIStylist.ts
│   ├── useRestoration.ts
│   └── ... (14 more hooks)
│
├── context/                      # Global state management (5 contexts)
│   ├── AuthContext.tsx           # ⭐ User authentication & credits
│   ├── LanguageContext.tsx       # i18n (EN, VI, KO, JA)
│   ├── ThemeContext.tsx          # Dark/light mode
│   ├── SearchContext.tsx         # Global search
│   └── ToastContext.tsx          # Toast notifications
│
├── constants/                    # Configuration files
│   ├── market-config.tsx         # ⭐ Home block configuration
│   ├── event-configs.ts          # Event studio configurations
│   ├── media-presets.ts          # Resolution & aspect ratio presets
│   └── brand.ts                  # Brand colors & styling
│
├── utils/                        # Utility functions
│   ├── pricing-helpers.ts        # Pricing calculations
│   ├── apiCache.ts               # API response caching
│   └── ... (3 more utilities)
│
├── services/                     # External service integrations
│   ├── gemini.ts                 # Google Gemini AI
│   ├── storage.ts                # Google Cloud Storage
│   └── ... (2 more services)
│
├── types.ts                      # ⭐ Global TypeScript interfaces
├── App.tsx                       # ⭐ Route configuration & lazy loading
├── index.tsx                     # React entry point
├── tailwind.config.ts            # Tailwind CSS configuration
└── vite.config.ts               # Vite bundler configuration
```

---

## 2. PRODUCT WORKSPACE PATTERN

### 2.1 High-Level Architecture

A **product workspace** consists of two layers:

```
Page Component (e.g., AIImageGenerator.tsx)
    ↓
    ├─→ Landing sections (HeroSection, UseCasesSection, etc.)
    └─→ Workspace Component (AIImageGeneratorWorkspace.tsx)
            ↓
            ├─→ Custom Hook (useImageGenerator.ts)
            ├─→ API Calls (imagesApi.createJob, etc.)
            └─→ Sub-components (Sidebar, Viewport, Modals)
```

### 2.2 Page Component Pattern

**File**: `/pages/images/AIImageGenerator.tsx`

```tsx
import React, { useState } from 'react';
import AIImageGeneratorWorkspace from '../../components/AIImageGeneratorWorkspace';
import { HeroSection } from '../../components/landing/image-generator/HeroSection';
// ... other landing sections

const AIImageGenerator = () => {
  // SEO metadata
  usePageMeta({
    title: 'AI Image Generator | Skyverses',
    description: 'Generate stunning AI images...',
    keywords: 'AI image generator, text to image',
    canonical: '/product/ai-image-generator'
  });

  // Toggle workspace visibility
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // When studio is open, show full-screen workspace
  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-[#0a0a0c] animate-in fade-in duration-500">
        <AIImageGeneratorWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  // Marketing landing page
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

export default AIImageGenerator;
```

### 2.3 Workspace Component Pattern

**File**: `/components/AIImageGeneratorWorkspace.tsx` (280+ lines)

```tsx
interface Props {
  onClose: () => void;
}

const AIImageGeneratorWorkspace: React.FC<Props> = ({ onClose }) => {
  // ═══ HOOK: All state & business logic
  const g = useImageGenerator();
  const { showToast } = useToast();
  const { user, refreshUserInfo } = useAuth();

  // ═══ LOCAL STATE: UI-specific (mobile, modals, upscale tracking)
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [selectedLogTask, setSelectedLogTask] = useState<ImageResult | null>(null);
  const [upscaleMap, setUpscaleMap] = useState<Record<string, UpscaleStatus>>({});

  // ═══ DERIVED STATE: Grouped models, families, modes, etc.
  const familyList = useMemo(() => Object.keys(families).sort(), [families]);
  const familyModels = useMemo(() => families[selectedFamily] || [], [families, selectedFamily]);

  // ═══ HANDLERS: Complex workflows (upscale polling, etc.)
  const handleUpscaleFromJob = useCallback(async (imageJobId: string, resolution: string) => {
    // Check credits
    // Call API
    // Start polling with 5-second intervals
    // Update upscaleMap state on completion
  }, [g, showToast, refreshUserInfo, user]);

  // ═══ LIFECYCLE: Prevent navigation during processing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isAnyTaskProcessing) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAnyTaskProcessing]);

  // ═══ RENDER: Layout with sidebar, viewport, modals
  return (
    <div className="h-full w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-[#0a0a0c] overflow-hidden">
      
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileExpanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileExpanded(false)}
            className="lg:hidden fixed inset-0 bg-black/60 z-[140] backdrop-blur-sm" />
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR */}
      <GeneratorSidebar
        onClose={handleSafeClose}
        activeMode={g.activeMode} setActiveMode={g.setActiveMode}
        selectedModel={g.selectedModel} setSelectedModel={g.setSelectedModel}
        prompt={g.prompt} setPrompt={g.setPrompt}
        // ... 30+ props for sidebar control
      />

      {/* RIGHT VIEWPORT */}
      <GeneratorViewport
        onClose={handleSafeClose}
        results={g.results}
        serverResults={g.serverResults}
        onRetry={g.handleRetry}
        onUpscale={handleUpscaleFromJob}
        upscaleMap={upscaleMap}
        // ... 20+ viewport props
      />

      {/* MODALS */}
      <ImageLibraryModal isOpen={g.isLibraryOpen} onClose={() => g.setIsLibraryOpen(false)} />
      <ResourceAuthModal isOpen={g.showResourceModal} onClose={() => g.setShowResourceModal(false)} />
      <JobLogsModal selectedTask={selectedLogTask} onClose={() => setSelectedLogTask(null)} />

      {/* ALERTS */}
      <AnimatePresence>
        {g.showLowCreditAlert && <LowCreditAlert />}
      </AnimatePresence>
    </div>
  );
};
```

### 2.4 Workspace Hook Pattern

**File**: `/hooks/useImageGenerator.ts` (400+ lines)

```tsx
export const useImageGenerator = () => {
  // ═══ CONTEXT: Auth and toast notifications
  const { credits, useCredits, isAuthenticated, refreshUserInfo } = useAuth();
  const { showToast } = useToast();

  // ═══ STATE: UI Controls
  const [activeMode, setActiveMode] = useState<CreationMode>('SINGLE');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [prompt, setPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState(DEFAULT_ASPECT_RATIO);
  const [selectedRes, setSelectedRes] = useState('');

  // ═══ STATE: Results & History
  const [results, setResults] = useState<ImageResult[]>([]);
  const [serverResults, setServerResults] = useState<ImageResult[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  // ═══ MEMO: Load available models on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await pricingApi.listModels();
        setAvailableModels(res.data?.models || []);
        setSelectedModel(res.data?.models[0]);
      } catch {
        showToast('Failed to load models', 'error');
      }
    })();
  }, []);

  // ═══ HANDLER: Create job + start polling
  const handleGenerate = useCallback(async () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    const cost = getCostFromPricing(selectedModel, selectedRes);
    if (credits < cost) {
      setShowLowCreditAlert(true);
      return;
    }

    setIsGenerating(true);
    const jobId = `job-${Date.now()}`;

    // Create local result
    setResults(prev => [{
      id: jobId,
      url: null,
      prompt,
      status: 'processing',
      cost,
      // ...
    }, ...prev]);

    try {
      // Call API
      const jobRes = await imagesApi.createJob({
        type: 'text_to_image',
        input: { prompt },
        config: { width: 1024, height: 1024, aspectRatio: selectedRatio },
        engine: { provider: 'gommo', model: selectedModel.name },
        enginePayload: { prompt, privacy: 'PRIVATE', projectId: 'default' },
      });

      if (!jobRes.data?.jobId) {
        throw new Error('No jobId returned');
      }

      // Use debit credits
      await useCredits(cost);

      // Start polling
      pollJobOnce(jobRes.data.jobId, (status, resultUrl) => {
        setResults(prev => prev.map(r => 
          r.id === jobId 
            ? { ...r, status: status as any, url: resultUrl }
            : r
        ));
      });

    } catch (err) {
      setResults(prev => prev.map(r => 
        r.id === jobId 
          ? { ...r, status: 'error' }
          : r
      ));
      showToast('Generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, selectedModel, credits, isAuthenticated]);

  // ═══ HANDLER: Download result
  const triggerDownload = useCallback((result: ImageResult) => {
    if (!result.url) return;
    const link = document.createElement('a');
    link.href = result.url;
    link.download = `skyverses-${result.id}.png`;
    link.click();
  }, []);

  // ═══ HANDLER: Fetch server history
  const fetchServerResults = useCallback(async (page: number) => {
    setIsFetchingHistory(true);
    try {
      const res = await imagesApi.getJobs({ page, limit: 20 });
      setServerResults(prev => [...prev, ...res.data]);
      setHistoryPage(page);
      setHasMoreHistory(page < res.pagination.totalPages);
    } finally {
      setIsFetchingHistory(false);
    }
  }, []);

  return {
    // UI State
    activeMode, setActiveMode,
    isGenerating, setIsGenerating,
    // Models & Config
    availableModels, selectedModel, setSelectedModel,
    selectedRatio, setSelectedRatio,
    selectedRes, setSelectedRes,
    // Content
    prompt, setPrompt,
    references, setReferences,
    // Results
    results, serverResults, isFetchingHistory,
    // Handlers
    handleGenerate, triggerDownload, handleRetry,
    fetchServerResults,
    deleteResult, toggleSelect,
    // ... 20+ more exported items
  };
};
```

### 2.5 EventStudioPage: Multi-Event Workspace Example

**File**: `/pages/images/EventStudioPage.tsx`

This shows how a **single component** can handle multiple product variants (birthday, wedding, noel, tet):

```tsx
interface EventStudioPageProps {
  type: 'noel' | 'tet' | 'wedding' | 'birthday';
}

const EventStudioPage: React.FC<EventStudioPageProps> = ({ type }) => {
  // SEO varies by type
  const seoConfig = SEO_MAP[type];
  usePageMeta({
    title: seoConfig.title,
    description: seoConfig.description,
    canonical: seoConfig.canonical,
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-[#0a0a0c] animate-in fade-in duration-500">
        <EventStudioWorkspace type={type} onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0c] min-h-screen pt-16">
      <HeroSection type={type} onStartStudio={() => setIsStudioOpen(true)} />
      <FeaturesSection type={type} />
      <GallerySection type={type} />
      <FAQSection items={FAQ_DATA[type]} />
      <PricingSection type={type} data={PRICING_DATA[type]} />
      <CrossSellSection otherTypes={CROSS_SELL.filter(e => e.id !== type)} />
    </div>
  );
};
```

The `EventStudioWorkspace` receives the `type` prop and adapts templates, styles, and FAQ accordingly.

---

## 3. API CALL ARCHITECTURE

### 3.1 API Configuration

**File**: `/apis/config.ts`

```tsx
// Auto-detect API base URL based on environment
function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Production: same host, port 5302
    return `${window.location.protocol}//${window.location.hostname}:5302`;
  }
  // Dev: local backend
  return 'http://localhost:3221';
}

export const API_BASE_URL = getApiBaseUrl();

// Auth headers with JWT token
export const getHeaders = () => {
  const token = localStorage.getItem('skyverses_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// System config with 5-min cache
export const systemConfigApi = {
  getSystemConfig: async (): Promise<{ success: boolean; data: SystemConfig }> => {
    return apiCache.wrap('system:config', async () => {
      const response = await fetch(`${API_BASE_URL}/config`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    }, 5 * 60 * 1000); // 5 min TTL
  }
};
```

### 3.2 Image API Pattern

**File**: `/apis/images.ts`

```tsx
export interface ImageJobRequest {
  type: "text_to_image" | "image_to_image";
  input: {
    prompt: string;
    image?: string;
    images?: string[];
  };
  config: {
    width: number;
    height: number;
    aspectRatio: string;
    seed: number;
    style: string;
  };
  engine: {
    provider: "gommo" | "fxlab";
    model: string;
  };
  enginePayload: {
    prompt: string;
    privacy: "PRIVATE";
    projectId: "default";
    editImage?: boolean;
    base64Image?: string;
  };
}

export interface ImageJobResponse {
  success?: boolean;
  status?: string;
  data: {
    status: "pending" | "processing" | "done" | "failed" | "error";
    jobId: string;
    result?: {
      images: string[];
      thumbnail: string;
      imageId: string;
    };
  };
  message?: string;
}

export const imagesApi = {
  // Create a job (POST /image-jobs)
  createJob: async (payload: ImageJobRequest): Promise<ImageJobResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/image-jobs`, {
        method: 'POST',
        headers: { 'accept': '*/*', ...getHeaders() },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('Image Job Creation Error:', error);
      return { 
        success: false, 
        status: 'error', 
        data: { status: 'failed', jobId: '' }, 
        message: 'Network connection failed' 
      };
    }
  },

  // Poll job status (GET /image-jobs/:id)
  getJobStatus: async (jobId: string): Promise<ImageJobResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/image-jobs/${jobId}`, {
        method: 'GET',
        headers: { 'accept': '*/*', ...getHeaders() },
      });
      return await response.json();
    } catch (error) {
      console.error('Image Job Status Error:', error);
      return { 
        success: false, 
        status: 'error', 
        data: { status: 'failed', jobId }, 
        message: 'Status check failed' 
      };
    }
  },

  // Get job history (GET /image-jobs?page=1&limit=20)
  getJobs: async (params: { status?: string; page?: number; limit?: number }) => {
    try {
      const query = new URLSearchParams();
      if (params.status) query.append('status', params.status);
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));

      const response = await fetch(`${API_BASE_URL}/image-jobs?${query.toString()}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Fetch Image Jobs Error:', error);
      throw error;
    }
  }
};
```

### 3.3 Video API Pattern

**File**: `/apis/videos.ts`

```tsx
export interface VideoJobRequest {
  type: "text-to-video" | "image-to-video" | "start-end-image" | "image-to-animation";
  input: {
    images?: (string | null)[];
    videos?: (string | null)[];
  };
  config: {
    duration: number;
    aspectRatio: string;
    resolution: string;
  };
  engine: {
    provider: "gommo" | "fxlab";
    model: string;
  };
  enginePayload: {
    prompt: string;
    privacy: "PRIVATE";
    projectId: string;
    mode: "relaxed" | "fast";
    referenceMediaIds?: string[];
  };
}

export const videosApi = {
  // Upload video file
  uploadVideo: async (file: File): Promise<{ success: boolean; videoUrl?: string; message?: string }> => {
    try {
      const formData = new FormData();
      formData.append('video', file);

      const token = localStorage.getItem('skyverses_auth_token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/video/video-upload`, {
        method: 'POST',
        headers: headers,
        body: formData, // Not JSON!
      });
      return await response.json();
    } catch (error) {
      console.error('Video Upload Error:', error);
      return { success: false, message: 'Network connection failed' };
    }
  },

  // Create video job
  createJob: async (payload: VideoJobRequest): Promise<VideoJobResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/video-jobs`, {
        method: 'POST',
        headers: { 'accept': '*/*', ...getHeaders() },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('Video Job Creation Error:', error);
      return { 
        success: false, 
        status: 'error', 
        data: { status: 'failed', jobId: '' }, 
        message: 'Network connection failed' 
      };
    }
  },

  // Poll video status
  getJobStatus: async (jobId: string): Promise<VideoJobResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/video-jobs/${jobId}`, {
        method: 'GET',
        headers: { 'accept': '*/*', ...getHeaders() },
      });
      return await response.json();
    } catch (error) {
      console.error('Video Job Status Error:', error);
      return { 
        success: false, 
        status: 'error', 
        data: { status: 'failed', jobId }, 
        message: 'Status check failed' 
      };
    }
  },

  // Get video jobs history
  getJobs: async (params: { 
    status?: string; 
    type?: string; 
    provider?: string; 
    page?: number; 
    limit?: number 
  }): Promise<VideoHistoryResponse> => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, String(value));
      });

      const response = await fetch(`${API_BASE_URL}/video-jobs?${query.toString()}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Video Jobs List Error:', error);
      throw error;
    }
  }
};
```

### 3.4 Upscale API Pattern

**File**: `/apis/upscale.ts`

```tsx
export interface UpscaleTask {
  jobId: string;
  urlImage: string;
  resolution?: string; // '2K' | '4K' | '8K' | '12K'
  provider?: string;   // 'fxflow' | 'topaz'
}

export const upscaleApi = {
  // Create batch upscale jobs
  createBatch: async (tasks: UpscaleTask[], provider: string = 'fxflow'): Promise<UpscaleCreateResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/image/upscale-batch`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ provider, tasks }),
      });
      return await response.json();
    } catch (error) {
      console.error('Upscale Batch API Error:', error);
      return { success: false, message: 'Network connection failed' };
    }
  },

  // Get upscale job status
  getJobStatus: async (jobId: string): Promise<UpscaleStatusResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/image/upscale-status/${jobId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Upscale Status API Error:', error);
      return { success: false, message: 'Network connection failed' };
    }
  },

  // Upscale from existing image job
  upscaleFromJob: async (imageJobId: string, resolution: string = '4K'): Promise<UpscaleCreateResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/image/upscale-from-job`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ imageJobId, resolution }),
      });
      return await response.json();
    } catch (error) {
      console.error('Upscale From Job API Error:', error);
      return { success: false, message: 'Network connection failed' };
    }
  },
};
```

### 3.5 Job Polling Pattern

**File**: `/hooks/useJobPoller.ts`

```tsx
// Synchronous single poll (used in workspace)
export const pollJobOnce = async (
  jobId: string,
  onStatusUpdate: (status: string, resultUrl?: string) => void,
  maxRetries = 30
) => {
  let retries = 0;

  const poll = async () => {
    try {
      const status = await imagesApi.getJobStatus(jobId);

      if (status.data?.status === 'done') {
        onStatusUpdate('done', status.data.result?.images?.[0]);
        return; // Stop polling
      }

      if (status.data?.status === 'error' || status.data?.status === 'failed') {
        onStatusUpdate('error');
        return; // Stop polling
      }

      // Still processing
      retries++;
      if (retries >= maxRetries) {
        onStatusUpdate('error'); // Timeout
        return;
      }

      // Continue polling in 5 seconds
      setTimeout(poll, 5000);

    } catch (err) {
      retries++;
      if (retries >= maxRetries) {
        onStatusUpdate('error');
        return;
      }
      setTimeout(poll, 5000);
    }
  };

  poll();
};
```

---

## 4. ROUTING SYSTEM (App.tsx)

**File**: `/App.tsx` (280 lines)

### 4.1 Code-Splitting Strategy

```tsx
// ═══ All imports are lazily loaded for code-splitting
const pageImports = {
  market: () => import('./pages/MarketPage'),
  category: () => import('./pages/CategoryPage'),
  aiImageGenerator: () => import('./pages/images/AIImageGenerator'),
  aiVideo: () => import('./pages/videos/AIVideoGenerator'),
  // ... 70+ more imports
};

// ═══ Create lazy-loaded components
const MarketPage = React.lazy(pageImports.market);
const AIImageGenerator = React.lazy(pageImports.aiImageGenerator);
// ... etc
```

### 4.2 Route Definitions

```tsx
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <Router>
                <SearchProvider>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public route */}
                      <Route path="/login" element={<LoginPage />} />

                      {/* Protected routes (wrapped in Layout) */}
                      <Route path="*" element={
                        <Layout>
                          <Routes>
                            {/* Core pages */}
                            <Route path="/" element={<MarketPage />} />
                            <Route path="/category/:id" element={<CategoryPage />} />
                            <Route path="/explorer" element={<ExplorerPage />} />
                            <Route path="/markets" element={<MarketsPage />} />
                            <Route path="/credits" element={<CreditsPage />} />
                            <Route path="/settings" element={<SettingsPage />} />

                            {/* Image product routes */}
                            <Route path="/product/ai-image-generator" element={<AIImageGenerator />} />
                            <Route path="/product/ai-video-generator" element={<AIVideoGenerator />} />
                            <Route path="/product/ai-birthday-generator" element={<EventStudioPage type="birthday" />} />
                            <Route path="/product/ai-wedding-generator" element={<EventStudioPage type="wedding" />} />
                            <Route path="/product/ai-noel-generator" element={<EventStudioPage type="noel" />} />
                            <Route path="/product/ai-tet-generator" element={<EventStudioPage type="tet" />} />

                            {/* ... 40+ product routes ... */}

                            {/* Dynamic route (fallback) */}
                            <Route path="/product/:slug" element={<SolutionDetail />} />

                            {/* Not found */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                        </Layout>
                      } />
                    </Routes>
                  </Suspense>
                </SearchProvider>
              </Router>
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};
```

### 4.3 Prefetching Strategy

```tsx
// Prefetch critical routes when browser is idle
const prefetchCriticalRoutes = () => {
  const critical = [
    pageImports.markets,
    pageImports.credits,
    pageImports.solutionDetail,
    pageImports.aiImageGenerator,
    pageImports.aiVideo,
  ];
  critical.forEach((importFn) => {
    try { importFn(); } catch { /* silently swallow */ }
  });
};

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => prefetchCriticalRoutes(), { timeout: 3000 });
  } else {
    setTimeout(prefetchCriticalRoutes, 2000);
  }
}
```

---

## 5. MULTI-STEP FORMS & MODALS

### 5.1 ResourceAuthModal: Two-Choice Modal

**File**: `/components/common/ResourceAuthModal.tsx` (112 lines)

A **modal that presents two options** without explicit "steps" — user chooses one and the action triggers.

```tsx
interface ResourceAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pref: 'credits' | 'key') => void;
  hasPersonalKey: boolean;
  totalCost?: number;
}

const ResourceAuthModal: React.FC<ResourceAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  hasPersonalKey,
  totalCost = 150
}) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
            className="max-w-xl w-full bg-white dark:bg-[#111114] p-10 rounded-[2rem] space-y-8"
          >
            <h3 className="text-2xl font-black uppercase italic">Xác thực tài nguyên</h3>
            <p className="text-sm text-slate-500">Chọn phương thức thanh toán:</p>

            <div className="grid grid-cols-2 gap-4">
              {/* Option 1: Credits */}
              <button 
                onClick={() => onConfirm('credits')}
                className="p-8 bg-slate-50 dark:bg-white/5 border rounded-2xl hover:border-brand-blue/40 transition-all"
              >
                <Coins size={24} />
                <p className="text-[11px] font-black uppercase mt-2">Dùng Credits</p>
                <p className="text-[9px] text-slate-400 mt-1">Chi phí: {totalCost} CR</p>
              </button>

              {/* Option 2: Personal Key */}
              <button 
                onClick={() => hasPersonalKey && onConfirm('key')}
                disabled={!hasPersonalKey}
                className={`p-8 border rounded-2xl transition-all ${
                  hasPersonalKey 
                    ? 'bg-slate-50 dark:bg-white/5 hover:border-purple-500/40' 
                    : 'bg-black/5 opacity-40 cursor-not-allowed'
                }`}
              >
                <Key size={24} />
                <p className="text-[11px] font-black uppercase mt-2">
                  {hasPersonalKey ? 'Dùng API Key' : 'Key chưa thiết lập'}
                </p>
                <p className="text-[9px] text-slate-400 mt-1">Free (Dùng Key của bạn)</p>
              </button>
            </div>

            {!hasPersonalKey && (
              <button 
                onClick={() => navigate('/settings')} 
                className="text-[10px] font-black text-brand-blue uppercase"
              >
                Thiết lập API Key ngay →
              </button>
            )}

            <button 
              onClick={onClose}
              className="w-full py-4 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900"
            >
              Hủy bỏ
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

**Usage in Workspace**:
```tsx
<ResourceAuthModal
  isOpen={g.showResourceModal}
  onClose={() => g.setShowResourceModal(false)}
  onConfirm={(pref) => {
    g.setUsagePreference(pref);
    localStorage.setItem('skyverses_usage_preference', pref);
    if (g.isResumingGenerate) {
      g.setIsResumingGenerate(false);
      g.handleGenerate(); // Resume the original action
    }
  }}
  hasPersonalKey={g.hasPersonalKey}
  totalCost={g.totalCost}
/>
```

### 5.2 Other Modal Examples

| Modal File | Purpose | Steps |
|---|---|---|
| `JobLogsModal.tsx` | View job execution logs | 1 (single view) |
| `ImageLibraryModal.tsx` | Select from saved images | 1 + confirm |
| `DemoModal.tsx` | Try product demo | 2-3 steps |
| `UpgradeModal.tsx` | Upgrade plan | 2 steps |
| `ModelSelectorModal.tsx` | Choose AI model | 1 + advanced options |

---

## 6. PRODUCT CONFIGURATION

### 6.1 Market Home Block Configuration

**File**: `/constants/market-config.tsx`

```tsx
export interface HomeBlockOption {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  icon: React.ReactElement;
  color: string;
}

export const HOME_BLOCK_OPTIONS: HomeBlockOption[] = [
  { 
    id: 'top-choice', 
    label: 'Top Choice', 
    title: 'Top Choice',
    subtitle: 'Lựa chọn hàng đầu',
    icon: <Flame size={14}/>, 
    color: 'text-orange-500' 
  },
  { 
    id: 'top-image', 
    label: 'Image Studio', 
    title: 'Image Studio',
    subtitle: 'Tổng hợp thị giác độ trung thực cao',
    icon: <ImageIcon size={14}/>, 
    color: 'text-brand-blue' 
  },
  { 
    id: 'top-video', 
    label: 'Video Studio', 
    title: 'Video Studio',
    subtitle: 'Công cụ kiến tạo chuyển động AI',
    icon: <Video size={14}/>, 
    color: 'text-purple-500' 
  },
  { 
    id: 'top-ai-agent', 
    label: 'AI Agent Workflow', 
    title: 'AI Agent Workflow',
    subtitle: 'Tự động hóa quy trình sáng tạo',
    icon: <Bot size={14}/>, 
    color: 'text-emerald-500' 
  },
  // ... etc
];
```

### 6.2 Event Studio Configuration

**File**: `/constants/event-configs.ts`

```tsx
export const EVENT_CONFIGS = {
  birthday: {
    name: 'Birthday',
    emoji: '🎂',
    color: '#f97316',
    templates: [
      { id: 'casual', name: 'Casual Party', description: 'Fun birthday bash' },
      { id: 'elegant', name: 'Elegant Dinner', description: 'Upscale celebration' },
      { id: 'kids', name: 'Kids Party', description: 'Playful theme' },
    ],
    maxDuration: 60,
  },
  wedding: {
    name: 'Wedding',
    emoji: '💒',
    color: '#ec4899',
    templates: [
      { id: 'romantic', name: 'Romantic', description: 'Dreamy couple shots' },
      { id: 'modern', name: 'Modern', description: 'Contemporary style' },
      { id: 'traditional', name: 'Traditional', description: 'Classic elegance' },
    ],
    maxDuration: 120,
  },
  // ... etc
};

export const STYLE_PRESETS = [
  { id: 'studio', name: 'Studio', description: 'Professional lighting' },
  { id: 'outdoor', name: 'Outdoor', description: 'Natural scenery' },
  { id: 'fantasy', name: 'Fantasy', description: 'Magical themes' },
];
```

---

## 7. GLOBAL TYPES & INTERFACES

**File**: `/types.ts` (100 lines)

```tsx
export type Language = 'en' | 'vi' | 'ko' | 'ja';

export interface LocalizedString {
  en: string;
  vi: string;
  ko: string;
  ja: string;
}

export interface Solution {
  _id?: string;
  id: string;
  slug: string;
  name: LocalizedString;
  category: LocalizedString;
  description: LocalizedString;
  problems: string[];
  industries: string[];
  models?: string[]; // gpt3.5, midjourney, etc
  priceCredits?: number;
  isFree?: boolean;
  imageUrl: string;
  gallery?: string[];
  demoType: 'text' | 'image' | 'video' | 'automation';
  tags: string[];
  features: (string | LocalizedString)[];
  complexity: 'Standard' | 'Advanced' | 'Enterprise';
  isActive?: boolean;
  order?: number;
  featured?: boolean;
  homeBlocks?: string[];
  platforms?: string[]; // 'web', 'ios', 'android'
}

export interface SystemConfig {
  plans: any[];
  resolutions: any[];
  aspectRatios: { label: string; value: string }[];
  defaultMaxPrompt: number;
  defaultMaxDuration: number;
  projectExpireHours: number;
  welcomeBonusCredits?: number;
}

export interface BookingFormData {
  name: string;
  company: string;
  email: string;
  industry: string;
  budgetRange: string;
  projectDescription: string;
  timeline: string;
}
```

---

## 8. KEY DEPENDENCIES & STACK

**File**: `/package.json`

```json
{
  "dependencies": {
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "react-router-dom": "^7.11.0",
    "framer-motion": "^12.23.26",
    "lucide-react": "^0.562.0",
    "@google/genai": "^1.34.0",
    "@xyflow/react": "^12.4.2",
    "three": "0.173.0"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "vite": "^5.3.1",
    "tailwindcss": "^3.4.4",
    "autoprefixer": "^10.4.19"
  }
}
```

### Tech Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| **UI Framework** | React 19 | Component-based UI |
| **Routing** | React Router 7 | Client-side routing + code-splitting |
| **Animation** | Framer Motion 12 | Smooth transitions & modals |
| **Icons** | Lucide React | 500+ SVG icons |
| **Styling** | Tailwind CSS 3 | Utility-first CSS |
| **3D Graphics** | Three.js 173 | 3D scenes (optional) |
| **Workflow Visualization** | @xyflow/react 12 | Node-based editors |
| **AI Integration** | @google/genai | Google Gemini API |
| **Bundler** | Vite 5 | Lightning-fast build tool |
| **Language** | TypeScript 5 | Type-safe development |

---

## 9. SUMMARY: KEY TAKEAWAYS

### ✅ Product Workspace Pattern
1. **Page** (marketing landing + studio toggle)
2. **Workspace Component** (layout, sidebar, viewport, modals)
3. **Custom Hook** (state, business logic, API calls)
4. **Sub-components** (sidebar, viewport, editor, gallery)

### ✅ API Pattern
- Centralized in `/apis/`
- Named exports (e.g., `imagesApi`, `videosApi`)
- Consistent response types with `success` + `data` fields
- Token-based auth via `getHeaders()` helper
- Polling for async jobs (5-30 second intervals)

### ✅ Routing
- 60+ lazy-loaded pages for code-splitting
- React Router v7 with dynamic routes
- Prefetching critical routes on idle
- URL slugs like `/product/ai-image-generator`

### ✅ Multi-Step Forms
- Mostly **modal-based** (ResourceAuthModal, ImageLibraryModal)
- Two-choice or multi-option selections
- **Not traditional form wizards** — more contextual modals
- Trigger next step via `onConfirm` callback

### ✅ Type Safety
- Global types in `/types.ts` (Solution, SystemConfig, etc)
- API request/response types in each API module
- Hook return types clearly defined
- Context types in respective context files

---

## 📁 QUICK FILE REFERENCE

| Purpose | File Path |
|---|---|
| **Add new product workspace** | `/pages/{category}/{ProductPage}.tsx` + `/components/{ProductWorkspace}.tsx` |
| **Add new API endpoint** | `/apis/{feature}.ts` (export const {feature}Api = { ... }) |
| **Add new route** | Edit `/App.tsx` — add import, lazy component, and route definition |
| **Global state** | Add to `/context/{Feature}Context.tsx` |
| **Custom logic** | `/hooks/use{Feature}.ts` |
| **Product config** | Edit `/constants/market-config.tsx` or create `/constants/{feature}-config.ts` |
| **Reusable component** | `/components/common/{Component}.tsx` or `/components/{feature}/{Component}.tsx` |
| **Types** | Global: `/types.ts` | API-specific: `/apis/{feature}.ts` |

---

**End of Report**
