/**
 * SEO constants — single source of truth cho meta SEO homepage.
 *
 * ⚠️ Build-time tĩnh (không hại SEO). Khi đổi model ở đây, HomePage tự cập nhật.
 * LƯU Ý: `index.html` (title/description/OG/Twitter) là HTML tĩnh, KHÔNG đọc file này
 *        → phải sửa tay trong index.html cho khớp khi đổi model.
 */

/** Model AI sáng tạo (video/ảnh/nhạc) hiển thị cho creator */
export const SEO_CREATOR_MODELS = 'Veo3, Seedance, Deepseek, Kling, Sora, Suno, ElevenLabs';

/** Model AI cho mảng doanh nghiệp / build app (dev / coding) */
export const SEO_BUSINESS_MODELS = 'GPT, Claude, Codex';

/**
 * Title + description homepage `/` — dùng chung cho HomePage usePageMeta.
 * Khớp định vị 3 trụ cột (xem docs/ba/positioning.md):
 *  ① Giải pháp AI doanh nghiệp · ② Bộ công cụ AI self-serve (Sáng tạo + Marketing) · ③ Phát triển App & Game.
 */
export const HOME_SEO = {
  title: 'Skyverses — Giải Pháp AI Doanh Nghiệp, Công Cụ AI & Phát Triển App, Game',
  description: `Skyverses — công ty giải pháp & công cụ AI. Giải pháp AI cho doanh nghiệp (tích hợp AI hoặc xây app AI mới), bộ công cụ AI self-serve cho creator & marketing (50+ model tạo ảnh/video/nhạc + công cụ content, ads, automation) và dịch vụ phát triển app & game mobile nhanh, tiết kiệm.`,
} as const;
