// ─────────────────────────────────────────────────────────────────────────────
// Global Brand Kit — chia sẻ thông tin thương hiệu giữa các workspace AI tools
// (Social Banner / Slide Creator / Storyboard Studio). User build brand 1 lần,
// reuse cho tất cả tools.
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'skyverses_global_brand_kit';

export interface GlobalBrandKit {
  brandName?: string;     // Tên thương hiệu
  slogan?: string;         // Tagline
  description?: string;    // Mô tả ngắn dùng làm context AI
  logoUrl?: string;        // Logo (base64 dataURL hoặc remote URL)
  colors: string[];        // Brand colors [primary, secondary, accent, text]
  savedAt?: string;        // ISO timestamp lần lưu cuối
}

const DEFAULT_KIT: GlobalBrandKit = {
  colors: ['#0090FF', '#6366F1', '#F59E0B', '#0F172A'],
};

/** Load global brand kit từ localStorage. Trả về DEFAULT_KIT nếu chưa có. */
export function loadGlobalBrandKit(): GlobalBrandKit | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    // Đảm bảo colors là array hợp lệ
    if (!Array.isArray(parsed.colors) || parsed.colors.length === 0) {
      parsed.colors = DEFAULT_KIT.colors;
    }
    return parsed as GlobalBrandKit;
  } catch {
    return null;
  }
}

/** Save global brand kit vào localStorage + dispatch event để workspace khác nhận biết */
export function saveGlobalBrandKit(kit: Partial<GlobalBrandKit>): boolean {
  try {
    const current = loadGlobalBrandKit() ?? DEFAULT_KIT;
    const merged: GlobalBrandKit = {
      ...current,
      ...kit,
      colors: kit.colors ?? current.colors,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    // Notify other tabs/workspace mounted (storage event listener)
    try {
      window.dispatchEvent(new CustomEvent('skyverses:brand-kit:updated', { detail: merged }));
    } catch { /* noop */ }
    return true;
  } catch {
    return false;
  }
}

/** Xoá global brand kit */
export function clearGlobalBrandKit(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    try {
      window.dispatchEvent(new CustomEvent('skyverses:brand-kit:updated', { detail: null }));
    } catch { /* noop */ }
    return true;
  } catch {
    return false;
  }
}

/** Subscribe vào thay đổi brand kit (khi workspace khác lưu) — return cleanup. */
export function subscribeBrandKit(cb: (kit: GlobalBrandKit | null) => void): () => void {
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail as GlobalBrandKit | null;
    cb(detail);
  };
  window.addEventListener('skyverses:brand-kit:updated', handler);
  return () => window.removeEventListener('skyverses:brand-kit:updated', handler);
}
