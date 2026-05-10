# Skyverses Market AI

> **📍 Source map:** [`docs/source-map/INDEX.md`](./docs/source-map/INDEX.md) — load đúng file cần (routes / components / pages / apis / hooks / backend / cms-blog / conventions / lookup). Đừng load full source map cho query đơn giản.

> **🚫 Token-saving rules — BẮT BUỘC tuân thủ:**
> 1. **KHÔNG** đọc/grep `docs/legacy/` (106 file archive cũ, 1.4 MB) — trừ khi user yêu cầu rõ tên file legacy.
> 2. **KHÔNG** đọc/grep `docs/reference/` (16 file deep-dive, 392 KB) — trừ khi đang làm feature tương ứng VÀ user yêu cầu reference.
> 3. Khi grep/glob source code, exclude pattern: `docs/`, `dist/`, `node_modules/`, `*/dist/*`, `skyverses-backend/uploads/`, `skyverses-backend/tmp-videos/`.
> 4. Trước khi đọc file >20KB, ưu tiên `Read` với `offset/limit` thay vì full file.

**Stack:** React 19 + TS + Vite 5 · Tailwind 3 + **Atlas design system** (gold `#C9A84C`; `brand-blue` legacy alias → trỏ cùng màu) · Manrope (sans) + Fragment Mono (mono) · react-router-dom 7 (lazy) · framer-motion · lucide-react · three 0.173 · @xyflow/react · @google/genai

**Layout:** `App.tsx` (routes) · `pages/` (69) · `components/` (~340, 28 sub-folder bao gồm `atlas/`) · `context/` (5: Auth/Theme/Lang/Search/Toast) · `apis/` (23) · `hooks/` (31) · `constants/` · `utils/` · `services/` · `src/constants/` (CDN lists) · `cms/` `blog/` `skyverses-backend/` (sub-projects)

**Core conventions:**
- TypeScript only, no `any`. Tailwind only, no inline styles.
- i18n: `t('key')` từ `useLanguage()`, langs `en|vi|ko|ja`.
- Routing: `<Link>` internal, `<a target="_blank" rel="noopener">` external.
- Mobile: `hidden md:flex` desktop-only. Drawer slides từ phải.
- Auth-gated: `{isAuthenticated && (...)}`, tier check qua `useFeatureAccess`.
- Job lifecycle: `<api>.create()` → `useJobPoller(jobId)` → `refreshCredits()`.
- Backend folder typo: `src/constanst/` (intentional, đừng rename).

**Skills (`.agents/skills/`):** `skyverses_ui_pages`, `skyverses_ui_style`, `skyverses_architecture`, `skyverses_business_flows`, `skyverses_cms`.

---

## 🔄 Auto-update docs/source-map (BẮT BUỘC)

Sau **mỗi task** có structural change dưới đây, BẮT BUỘC update file md tương ứng trong `docs/source-map/` ở step cuối (trước khi báo "done"). Không cần update nếu chỉ sửa logic / Tailwind / fix bug nội bộ.

| Thay đổi | Update file |
|----------|-------------|
| Thêm/xoá/rename route trong `App.tsx` | `01-routes.md` |
| Thêm/sửa context (`context/*.tsx`) hoặc đổi hook expose | `02-contexts.md` |
| Thêm/xoá/rename file trong `apis/` | `03-apis.md` |
| Thêm/xoá/rename file trong `hooks/` | `04-hooks.md` |
| Thêm/xoá/rename file trong `components/` (cả sub-folder) | `05-components.md` |
| Thêm/xoá/rename file trong `pages/` | `06-pages.md` |
| Thêm/sửa route/model/engine ở `skyverses-backend/src/` | `07-backend.md` |
| Thêm/sửa file ở `cms/` hoặc `blog/` | `08-cms-blog.md` |
| Đổi convention (Tailwind base, i18n pattern, mobile pattern) | `09-conventions.md` |
| Có pattern mới đáng ghi vào "Where is X?" | `10-lookup.md` |
| Đổi tech stack (thêm lib lớn, đổi version Vite/React) | `CLAUDE.md` (file này) |

**Quy tắc update:**
1. Edit chính xác dòng/bảng liên quan (không rewrite cả file).
2. Chỉ thêm 1-2 dòng mô tả ngắn (path + role).
3. Báo trong response: *"Đã update `docs/source-map/<file>.md`"*.
4. Nếu không chắc thay đổi có structural không → hỏi user.

**Regen toàn bộ source map:** bảo Claude *"regenerate docs/source-map"* (chỉ chạy khi refactor lớn).
