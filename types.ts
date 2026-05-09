
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

/* =====================================================
   SKYTOKEN
===================================================== */
export interface SkyTokenPackage {
  _id: string;
  code: string;
  name: string;
  tokens: number;
  price: number;
  originalPrice?: number;
  bonusPercent: number;
  bonusTokens: number;
  totalTokens: number;
  badge?: string;
  popular: boolean;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SkyTokenTransaction {
  _id: string;
  userId: string;
  type: 'TOP_UP' | 'CONSUME' | 'EARN' | 'BONUS' | 'REFUND' | 'WELCOME';
  amount: number;
  balanceAfter: number;
  source: string;
  note?: string;
  createdAt: string;
}

/* =====================================================
   PROMPT MARKETPLACE
===================================================== */
export interface PromptVariable {
  name: string;
  description: string;
  defaultValue: string;
}

export interface PromptItem {
  _id?: string;
  title: string;
  content: string;
  description: string;
  variables: PromptVariable[];
}

export type AIModel =
  | 'gpt-4' | 'gpt-4o' | 'gpt-5'
  | 'claude-3' | 'claude-4'
  | 'gemini' | 'gemini-2'
  | 'midjourney' | 'dall-e-3'
  | 'stable-diffusion' | 'flux'
  | 'llama' | 'mistral'
  | 'other';

export interface PromptExample {
  input: string;
  output: string;
  image?: string;
}

export interface PromptSet {
  _id: string;
  sellerId: { _id: string; name: string; avatar?: string; email?: string } | string;
  slug: string;
  title: LocalizedString;
  description: LocalizedString;
  category: 'coding' | 'writing' | 'marketing' | 'design' | 'business' | 'education' | 'other';
  tags: string[];
  coverImage?: string;
  priceSKT: number;
  isFree: boolean;
  prompts: PromptItem[];
  previewText: string;
  status: 'draft' | 'pending' | 'active' | 'rejected' | 'archived';
  isActive: boolean;
  featured: boolean;
  purchaseCount: number;
  promptCount?: number;
  totalEarned: number;
  sortOrder: number;
  averageRating: number;
  reviewCount: number;
  viewCount?: number;
  wishlistCount?: number;
  models?: AIModel[];
  examples?: PromptExample[];
  createdAt: string;
  updatedAt: string;
}

export interface PromptReview {
  _id: string;
  buyerId: { _id: string; name: string; avatar?: string } | string;
  promptSetId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptPurchase {
  _id: string;
  buyerId: string;
  sellerId: string;
  promptSetId: PromptSet | string;
  pricePaid: number;
  sellerReceived: number;
  platformFee: number;
  feePercent: number;
  createdAt: string;
}

export interface SellerProfile {
  _id: string;
  name: string;
  avatar?: string;
  bio?: string;
  socialLinks?: { website?: string; twitter?: string; github?: string };
  verified: boolean;
  totalSales: number;
  totalEarned: number;
  totalListings: number;
  averageRating: number;
  totalReviews: number;
  followerCount: number;
  badges: SellerBadge[];
  joinedAt: string;
  listings: PromptSet[];
}

export interface SellerBadge {
  type: 'verified' | 'pro' | 'top_seller' | 'rising_star';
  label: string;
  earnedAt: string;
}

export interface PromptWishlistItem {
  _id: string;
  userId: string;
  promptSetId: PromptSet | string;
  createdAt: string;
}
