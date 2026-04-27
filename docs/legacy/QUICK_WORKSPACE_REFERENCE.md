# Skyverses Market AI - Quick Workspace Implementation Reference

## 🎯 FASTEST PATH: Add a New Product Workspace

### Step 1: Create Page Component
**File**: `/pages/images/MyNewProduct.tsx` (or `/pages/videos/`, `/pages/audio/`)

```tsx
import React, { useState } from 'react';
import MyNewProductWorkspace from '../../components/MyNewProductWorkspace';
import { HeroSection } from '../../components/landing/my-new-product/HeroSection';
import { usePageMeta } from '../../hooks/usePageMeta';

const MyNewProduct = () => {
  usePageMeta({
    title: 'My New Product | Skyverses',
    description: 'Describe your product here',
    keywords: 'keyword1, keyword2',
    canonical: '/product/my-new-product'
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-[#0a0a0c] animate-in fade-in duration-500">
        <MyNewProductWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0c] min-h-screen text-slate-900 dark:text-white pt-16">
      <HeroSection onStartStudio={() => setIsStudioOpen(true)} />
      {/* Add landing sections here */}
    </div>
  );
};

export default MyNewProduct;
```

### Step 2: Create Workspace Component
**File**: `/components/MyNewProductWorkspace.tsx` (280+ lines)

```tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMyNewProduct } from '../hooks/useMyNewProduct';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface Props {
  onClose: () => void;
}

const MyNewProductWorkspace: React.FC<Props> = ({ onClose }) => {
  // ═══ HOOK: All business logic
  const p = useMyNewProduct();
  const { showToast } = useToast();
  const { user, refreshUserInfo } = useAuth();

  // ═══ UI STATE: Mobile, modals, etc
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // ═══ DERIVED STATE: Memoized computations
  const isAnyTaskProcessing = useMemo(() => p.results.some(r => r.status === 'processing'), [p.results]);

  // ═══ PREVENT NAVIGATION during processing
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

  const handleSafeClose = useCallback(() => {
    if (isAnyTaskProcessing) {
      if (window.confirm('Processing in progress. Exit anyway?')) onClose();
    } else onClose();
  }, [isAnyTaskProcessing, onClose]);

  // ═══ RENDER
  return (
    <div className="h-full w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-[#0a0a0c] overflow-hidden">
      
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileExpanded(false)}
            className="lg:hidden fixed inset-0 bg-black/60 z-[140] backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR */}
      <div className="w-full lg:w-80 bg-white dark:bg-[#111114] border-r border-slate-200 dark:border-white/10 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h2 className="font-bold">Settings</h2>
          <button onClick={handleSafeClose} className="lg:hidden text-slate-400">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add sidebar controls here */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Model</label>
            <select
              value={p.selectedModel?.id || ''}
              onChange={(e) => {
                const model = p.availableModels.find(m => m.id === e.target.value);
                if (model) p.setSelectedModel(model);
              }}
              className="w-full px-3 py-2 border rounded-lg dark:bg-[#0a0a0c]"
            >
              {p.availableModels.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Prompt</label>
            <textarea
              value={p.prompt}
              onChange={(e) => p.setPrompt(e.target.value)}
              placeholder="Describe what you want..."
              className="w-full px-3 py-2 border rounded-lg min-h-24 dark:bg-[#0a0a0c]"
            />
          </div>

          <button
            onClick={p.handleGenerate}
            disabled={p.isGenerating || !p.prompt.trim()}
            className="w-full py-3 bg-brand-blue text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {p.isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* RIGHT VIEWPORT */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {p.results.map((result) => (
            <div key={result.id} className="bg-white dark:bg-[#14151a] rounded-lg overflow-hidden border">
              {result.status === 'processing' && (
                <div className="aspect-square flex items-center justify-center bg-slate-100 dark:bg-[#0a0a0c]">
                  <div className="animate-spin">⏳</div>
                </div>
              )}
              {result.status === 'done' && result.url && (
                <img src={result.url} alt="Result" className="w-full aspect-square object-cover" />
              )}
              {result.status === 'error' && (
                <div className="aspect-square flex items-center justify-center bg-red-100 dark:bg-red-900/20">
                  ❌ Error
                </div>
              )}
              <div className="p-3 space-y-2">
                <p className="text-xs text-slate-500 line-clamp-2">{result.prompt}</p>
                <div className="flex gap-2">
                  {result.url && (
                    <a href={result.url} download className="text-xs px-2 py-1 bg-brand-blue text-white rounded">
                      Download
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyNewProductWorkspace;
```

### Step 3: Create Custom Hook
**File**: `/hooks/useMyNewProduct.ts` (300+ lines)

```tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export interface ProductResult {
  id: string;
  url: string | null;
  prompt: string;
  status: 'processing' | 'done' | 'error';
  cost: number;
}

export const useMyNewProduct = () => {
  const { credits, useCredits, refreshUserInfo } = useAuth();
  const { showToast } = useToast();

  // ═══ STATE
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState<ProductResult[]>([]);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);

  // ═══ LOAD MODELS ON MOUNT
  useEffect(() => {
    (async () => {
      try {
        // TODO: Call your API to load models
        // const res = await myProductApi.listModels();
        // setAvailableModels(res.data?.models || []);
        // setSelectedModel(res.data?.models[0]);
      } catch (err) {
        showToast('Failed to load models', 'error');
      }
    })();
  }, []);

  // ═══ HANDLER: Generate
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      showToast('Please enter a prompt', 'error');
      return;
    }

    const estimatedCost = 150; // TODO: Calculate from model pricing
    if (credits < estimatedCost) {
      showToast('Insufficient credits', 'error');
      return;
    }

    setIsGenerating(true);
    const resultId = `result-${Date.now()}`;

    // Add optimistic result
    setResults(prev => [{
      id: resultId,
      url: null,
      prompt,
      status: 'processing',
      cost: estimatedCost,
    }, ...prev]);

    try {
      // TODO: Call your API
      // const jobRes = await myProductApi.createJob({ prompt, model: selectedModel.id });
      
      // TODO: Debit credits
      // await useCredits(estimatedCost);

      // TODO: Poll for result
      // const pollResult = await pollJob(jobRes.jobId);

      // Update result
      setResults(prev => prev.map(r =>
        r.id === resultId
          ? { ...r, status: 'done', url: 'TODO: set result URL' }
          : r
      ));

      showToast('Generation successful!', 'success');
      refreshUserInfo();

    } catch (err) {
      setResults(prev => prev.map(r =>
        r.id === resultId ? { ...r, status: 'error' } : r
      ));
      showToast('Generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, selectedModel, credits, useCredits, showToast, refreshUserInfo]);

  return {
    isGenerating,
    prompt, setPrompt,
    results,
    availableModels,
    selectedModel, setSelectedModel,
    handleGenerate,
  };
};
```

### Step 4: Create API Module
**File**: `/apis/myNewProduct.ts` (100+ lines)

```tsx
import { API_BASE_URL, getHeaders } from './config';

export interface MyProductJobRequest {
  prompt: string;
  model: string;
  config?: {
    [key: string]: any;
  };
}

export interface MyProductJobResponse {
  success?: boolean;
  data: {
    status: 'pending' | 'processing' | 'done' | 'error';
    jobId: string;
    resultUrl?: string;
  };
  message?: string;
}

export const myNewProductApi = {
  // Create job
  createJob: async (payload: MyProductJobRequest): Promise<MyProductJobResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/my-product-jobs`, {
        method: 'POST',
        headers: { 'accept': '*/*', ...getHeaders() },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('Job Creation Error:', error);
      return {
        success: false,
        data: { status: 'error', jobId: '' },
        message: 'Network error'
      };
    }
  },

  // Get job status
  getJobStatus: async (jobId: string): Promise<MyProductJobResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/my-product-jobs/${jobId}`, {
        method: 'GET',
        headers: { 'accept': '*/*', ...getHeaders() },
      });
      return await response.json();
    } catch (error) {
      console.error('Status Error:', error);
      return {
        success: false,
        data: { status: 'error', jobId },
        message: 'Status check failed'
      };
    }
  },

  // List models
  listModels: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/my-product-models`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Models List Error:', error);
      throw error;
    }
  }
};
```

### Step 5: Register Route in App.tsx
**File**: `/App.tsx` (edit)

```tsx
// Add import
const pageImports = {
  // ... existing imports
  myNewProduct: () => import('./pages/images/MyNewProduct'), // or /videos/, /audio/
};

// Add lazy component
const MyNewProduct = React.lazy(pageImports.myNewProduct);

// Add route in Routes
<Route path="/product/my-new-product" element={<MyNewProduct />} />
```

### Step 6: Add Product to Market Config (Optional)
**File**: `/constants/market-config.tsx` (edit)

If your product should appear in "Top Choice", "Image Studio", etc.:

```tsx
// In your page component or wherever you manage product display
const products = [
  {
    id: 'my-new-product',
    name: 'My New Product',
    slug: 'my-new-product',
    category: 'Image',
    description: 'Create amazing images with AI',
    imageUrl: '/path/to/image.png',
    homeBlocks: ['top-choice', 'top-image'], // Display in these sections
    // ... other product fields from Solution interface
  }
];
```

---

## 📊 FILE CHECKLIST

Create these files in order:

- [ ] `/pages/{category}/{ProductPage}.tsx` — Page wrapper
- [ ] `/components/{ProductWorkspace}.tsx` — Main workspace (280+ lines)
- [ ] `/hooks/use{Product}.ts` — Business logic (300+ lines)
- [ ] `/apis/{product}.ts` — API client (100+ lines)
- [ ] Edit `/App.tsx` — Add route
- [ ] Edit `/constants/market-config.tsx` (if showing on home)
- [ ] Add landing components (optional)

---

## 🔗 COPY-PASTE TEMPLATES

### API Response Handler
```tsx
const handleApiCall = async () => {
  try {
    const res = await myApi.doSomething();
    
    if (!res.success) {
      showToast(res.message || 'Operation failed', 'error');
      return;
    }

    showToast('Success!', 'success');
    return res.data;
  } catch (err) {
    console.error('Error:', err);
    showToast('Network error', 'error');
  }
};
```

### Job Polling
```tsx
const pollJob = async (jobId: string, maxRetries = 30) => {
  let retries = 0;

  const poll = async () => {
    try {
      const status = await myApi.getJobStatus(jobId);

      if (status.data?.status === 'done') {
        return status.data.resultUrl;
      }

      if (status.data?.status === 'error') {
        throw new Error('Job failed');
      }

      retries++;
      if (retries >= maxRetries) throw new Error('Timeout');

      await new Promise(resolve => setTimeout(resolve, 5000));
      return poll();

    } catch (err) {
      retries++;
      if (retries >= maxRetries) throw err;
      await new Promise(resolve => setTimeout(resolve, 5000));
      return poll();
    }
  };

  return poll();
};
```

### Modal with Options
```tsx
const MySelectionModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: (choice: string) => void }> = (props) => {
  return (
    <AnimatePresence>
      {props.isOpen && (
        <motion.div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center">
          <motion.div className="max-w-xl w-full bg-white dark:bg-[#111114] p-10 rounded-[2rem] space-y-8">
            <h3 className="text-2xl font-bold">Choose an option</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {['Option 1', 'Option 2'].map(opt => (
                <button
                  key={opt}
                  onClick={() => props.onConfirm(opt)}
                  className="p-6 border rounded-lg hover:border-brand-blue/40 transition-all"
                >
                  {opt}
                </button>
              ))}
            </div>

            <button onClick={props.onClose} className="w-full text-slate-400">Cancel</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

---

**Next Steps:**
1. Copy the templates above
2. Replace `myNewProduct` with your product name (camelCase)
3. Fill in the `TODO` comments with your actual API calls
4. Test the workspace in `/product/my-new-product`
5. Add landing sections and styling
