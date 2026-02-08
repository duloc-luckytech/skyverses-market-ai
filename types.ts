
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
