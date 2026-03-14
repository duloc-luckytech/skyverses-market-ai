import { PricingModel } from '../apis/pricing';

/**
 * Lấy danh sách độ phân giải (1k, 2k, 4k...) từ object pricing
 */
export const getResolutionsFromPricing = (pricing: any): string[] => {
  if (!pricing) return [];
  return Object.keys(pricing);
};

/**
 * Lấy danh sách các giá trị phụ (thường là duration hoặc mode) từ một độ phân giải cụ thể
 */
export const getOptionsFromResolution = (pricing: any, resolution: string): string[] => {
  if (!pricing || !resolution || !pricing[resolution]) return [];
  return Object.keys(pricing[resolution]);
};

/**
 * Lấy giá tiền cụ thể cho một tổ hợp (độ phân giải + tùy chọn)
 */
export const getCostFromPricing = (pricing: any, resolution: string, option?: string): number => {
  if (!pricing || !resolution || !pricing[resolution]) return 0;
  
  const resOptions = pricing[resolution];
  if (option && resOptions[option] !== undefined) {
    return resOptions[option];
  }
  
  // Nếu không có option, lấy giá trị đầu tiên tìm thấy
  const firstKey = Object.keys(resOptions)[0];
  return resOptions[firstKey] || 0;
};
