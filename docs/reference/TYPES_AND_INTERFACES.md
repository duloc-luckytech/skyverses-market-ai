# TypeScript Types and Interfaces Reference

**Source File:** `types.ts`  
**Last Updated:** 2026-04-13

---

## Complete types.ts Content

```typescript
export type Language = 'en' | 'vi' | 'ko' | 'ja';

export interface LocalizedString {
  en: string;
  vi: string;
  ko: string;
  ja: string;
}

export interface NeuralStackItem {
  name: string;
  version: string;
  capability: LocalizedString;
}

export interface HomeBlock {
  key: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  limit: number;
  order: number;
}

export interface GeminiKey {
  key: string;
  isActive: boolean;
}

export interface SystemConfig {
  plans: any[];
  resolutions: any[];
  aspectRatios: { label: string; value: string }[];
  defaultMaxPrompt: number;
  defaultMaxDuration: number;
  projectExpireHours: number;
  videoExpireHours: number;
  imageExpireHours: number;
  marketHomeBlock: HomeBlock[];
  listKeyGommoGenmini?: GeminiKey[];
  welcomeBonusCredits?: number;
  aiSupportContext?: string;
}

export interface Solution {
  _id?: string; // MongoDB Internal ID
  id: string;   // Business ID
  slug: string;
  name: LocalizedString;
  category: LocalizedString;
  description: LocalizedString;
  problems: string[];
  industries: string[];
  models?: string[]; // New: List of AI models used (gpt3.5, midjourney, etc.)
  priceCredits?: number; // New: Credit cost for using the service
  isFree?: boolean; // New: Whether the service is free or paid
  imageUrl: string;
  gallery?: string[]; // New: Sub-thumbnails
  neuralStack?: NeuralStackItem[]; // New: Specific AI modes (VEO3, etc)
  demoType: 'text' | 'image' | 'video' | 'automation';
  tags: string[];
  // Allow features to be either plain strings or localized string objects
  features: (string | LocalizedString)[];
  complexity: 'Standard' | 'Advanced' | 'Enterprise';
  priceReference: string;
  isActive?: boolean; // New: Visibility status in market
  order?: number; // Thêm trường thứ tự sắp xếp
  featured?: boolean; // Thêm trường nổi bật
  status?: string; // Thêm trường trạng thái hệ thống
  homeBlocks?: string[]; // Vị trí hiển thị tại trang chủ
  platforms?: string[]; // Nền tảng hỗ trợ: 'web', 'ios', 'android'
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

## Product Submission Types

**Source File:** `hooks/useAppsPage.ts`

```typescript
export interface ProductSubmission {
  // Step 1: Product Info
  productName: string;
  productSlug: string;
  category: string;
  complexity: string;
  shortDescription: string;
  fullDescription: string;
  demoType: string;
  tags: string;
  
  // Step 2: Media & Pricing
  thumbnailUrl: string;
  galleryUrls: string;
  demoUrl: string;
  priceCredits: string;
  isFree: boolean;
  platforms: string[];
  
  // Step 3: Technical
  aiModels: string;
  features: string;
  apiEndpoint: string;
  documentation: string;
  
  // Step 4: Creator Info (auto-filled from auth)
  creatorName: string;
  creatorEmail: string;
  creatorStudio: string;
  creatorWebsite: string;
  creatorTelegram: string;
  additionalNotes: string;
}
```

---

## API Submission Payload

**Source File:** `apis/product-submission.ts`

```typescript
export interface ProductSubmissionPayload {
  productName: string;
  productSlug: string;
  category: string;
  complexity: string;
  shortDescription: string;
  fullDescription: string;
  demoType: string;
  tags: string;
  thumbnailUrl: string;
  galleryUrls: string;
  demoUrl: string;
  priceCredits: string;
  isFree: boolean;
  platforms: string[];
  aiModels: string;
  features: string;
  apiEndpoint: string;
  documentation: string;
  creatorName: string;
  creatorEmail: string;
  creatorStudio: string;
  creatorWebsite: string;
  creatorTelegram: string;
  additionalNotes: string;
}
```

---

## Market Product Type (Admin Script)

**Source File:** `scripts/add-market-product.ts`

```typescript
interface MarketProduct {
  slug: string;
  id?: string; // optional stable ID
  name: { en: string; vi?: string; ko?: string; ja?: string };
  category: { en: string; vi?: string; ko?: string; ja?: string };
  description: { en: string; vi?: string; ko?: string; ja?: string };
  imageUrl: string;
  demoType?: string; // 'image' | 'video' | 'interactive'
  homeBlocks: string[];
  tags: string[];
  models?: string[];
  industries?: string[];
  features?: { en: string; vi?: string }[];
  neuralStack?: { 
    name: string; 
    version?: string; 
    capability: { en: string; vi?: string } 
  }[];
  complexity?: string; // 'beginner' | 'intermediate' | 'advanced'
  priceCredits?: number;
  isFree?: boolean;
  isActive?: boolean;
  status?: string;
  featured?: boolean;
  order?: number;
}
```

---

## Form Configuration Constants

**Source File:** `hooks/useAppsPage.ts`

```typescript
export const PRODUCT_CATEGORIES = [
  { value: 'video', label: 'Video AI' },
  { value: 'image', label: 'Hình ảnh AI' },
  { value: 'audio', label: 'Giọng nói AI' },
  { value: 'music', label: 'Nhạc AI' },
  { value: 'automation', label: 'Tự động hóa' },
  { value: '3d', label: '3D & Game' },
  { value: 'agent', label: 'AI Agent' },
  { value: 'other', label: 'Khác' },
];

export const COMPLEXITY_LEVELS = [
  { value: 'Standard', label: 'Standard', desc: 'Dễ sử dụng, phù hợp đại chúng' },
  { value: 'Advanced', label: 'Advanced', desc: 'Nhiều tùy chỉnh, cho Pro user' },
  { value: 'Enterprise', label: 'Enterprise', desc: 'Custom workflow, cần hỗ trợ' },
];

export const DEMO_TYPES = [
  { value: 'text', label: 'Text / Chat' },
  { value: 'image', label: 'Image Generation' },
  { value: 'video', label: 'Video Generation' },
  { value: 'automation', label: 'Automation / Pipeline' },
];

export const PLATFORM_OPTIONS = [
  { value: 'web', label: 'Web App' },
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'extension', label: 'Browser Extension' },
  { value: 'api', label: 'API Only' },
];

export const SUBMISSION_STEPS = [
  { id: 1, title: 'Thông tin sản phẩm', desc: 'Tên, mô tả, danh mục' },
  { id: 2, title: 'Media & Giá', desc: 'Hình ảnh, demo, pricing' },
  { id: 3, title: 'Kỹ thuật', desc: 'AI models, features, API' },
  { id: 4, title: 'Xác nhận & Gửi', desc: 'Kiểm tra và submit' },
];
```

---

## Home Block Categories

**Used in:** `scripts/add-market-product.ts`

```
'top-choice'   → 🔥 Top Choice
'top-image'    → 🖼  Image Studio
'top-video'    → 🎬 Video Studio
'top-ai-agent' → 🤖 AI Agent Workflow
'events'       → 🎁 Lễ hội & Sự kiện
'app-other'    → ✅ Ứng dụng khác (default)
```

---

## Type Relationships

```
Solution (main marketplace product)
├── name: LocalizedString
├── category: LocalizedString
├── description: LocalizedString
├── neuralStack: NeuralStackItem[]
│   └── capability: LocalizedString
├── features: (string | LocalizedString)[]
└── demoType: 'text' | 'image' | 'video' | 'automation'

ProductSubmission (user form data)
└── Split into 4 steps:
    ├── Step 1: Basic info (name, slug, category, etc)
    ├── Step 2: Media & pricing (images, demo, credits, platforms)
    ├── Step 3: Technical (models, features, API)
    └── Step 4: Creator info + review + submit

SystemConfig (global app config)
├── marketHomeBlock: HomeBlock[]
└── HomeBlock
    ├── title: LocalizedString
    └── subtitle: LocalizedString
```

---

## Language Support

All text fields support 4 languages:
- **en** - English
- **vi** - Vietnamese (Tiếng Việt)
- **ko** - Korean (한국어)
- **ja** - Japanese (日本語)

Example localized string:
```typescript
const productName: LocalizedString = {
  en: 'AI Video Generator',
  vi: 'Tạo Video AI',
  ko: 'AI 비디오 생성기',
  ja: 'AIビデオジェネレーター'
};
```

---

## Platform Support Values

```typescript
'web'       // Web application
'ios'       // iPhone/iPad
'android'   // Android devices
'extension' // Browser extension
'api'       // API-only service
```

---

## Demo Type Values

```typescript
'text'        // Text-based interface
'image'       // Image generation
'video'       // Video generation
'automation'  // Automation/pipeline
```

---

## Complexity Levels

```typescript
'Standard'    // Easy to use for general users
'Advanced'    // Many customization options for power users
'Enterprise'  // Requires custom setup and support
```

---

**End of Reference**
