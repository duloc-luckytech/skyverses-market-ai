/**
 * SEO constants — single source of truth cho meta SEO homepage.
 *
 * ⚠️ Build-time tĩnh (không hại SEO). Khi đổi model ở đây, MarketPage tự cập nhật.
 * LƯU Ý: `index.html` (title/description/OG/Twitter) là HTML tĩnh, KHÔNG đọc file này
 *        → phải sửa tay trong index.html cho khớp khi đổi model.
 */

/** Model AI sáng tạo (video/ảnh/nhạc) hiển thị cho creator */
export const SEO_CREATOR_MODELS = 'Veo3, Seedance, Deepseek, Kling, Sora, Suno, ElevenLabs';

/** Model AI cho mảng doanh nghiệp / build app (dev / coding) */
export const SEO_BUSINESS_MODELS = 'GPT, Claude, Codex';

/** Title + description homepage `/` — dùng chung cho MarketPage usePageMeta */
export const HOME_SEO = {
  title: 'Skyverses — Giải Pháp AI & Xây App cho Creator, Doanh Nghiệp',
  description: `Công cụ AI cho creator (${SEO_CREATOR_MODELS}) và giải pháp AI doanh nghiệp (${SEO_BUSINESS_MODELS}). Xây app mobile & desktop nhanh hơn, chi phí rẻ hơn. Dùng thử miễn phí.`,
} as const;
