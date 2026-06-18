# Skyverses — Project Summary

> 🏷️ **Về cái tên:** repo/package tên là `skyverses-market` (folder `skyverses-market-ai`) và một số tên kỹ thuật trong code vẫn dùng "market" (route `/markets`, `MarketPage.tsx`, `market.ts`, `MarketItem.model.ts`…). Chữ **"Market" chỉ là tên kỹ thuật/lịch sử — KHÔNG phản ánh định vị**. Skyverses **không** phải marketplace bán prompt/credit; đây là **nhà cung cấp giải pháp & công cụ AI** (xem section 1) — chatbot `AISupportChat.tsx` nay đã nói rõ điều này. Copy người dùng thấy đã dọn sạch chữ "Marketplace" mang nghĩa định vị. Chỗ còn dùng "Marketplace" hợp lệ là **tính năng Prompt Marketplace** (mua/bán prompt bằng SkyToken — `prompt_market.*`, `SkyTokenPage`, `PromptCreate/Wishlist/Purchases`), giữ nguyên.

> **Mục đích file này:** Cho một AI/dev mới đọc và hiểu *project này là gì, làm gì, cho ai, và được tổ chức ra sao* — chỉ trong vài phút, trước khi đào sâu vào `docs/source-map/`.
> Nội dung dưới đây được rút ra từ chính homepage (`components/landing/homepage/`) + i18n (`context/LanguageContext.tsx`), nên nó phản ánh đúng định vị sản phẩm hiện tại, không phải mô tả kỹ thuật suông.

---

## 1. Một câu là gì?

**Skyverses là một nhà cung cấp giải pháp & công cụ AI**, làm 3 việc chính:

1. **Cung cấp giải pháp AI cho hệ thống doanh nghiệp** — xây & tích hợp AI vào quy trình/hệ thống sẵn có của doanh nghiệp (dashboard, agents, automation), deploy trên hạ tầng riêng.
2. **Cung cấp công cụ cho creator** — bộ tool tạo image / video / music / voice từ nhiều model, dùng ngay.
3. **Ship app iOS, Android, macOS & Windows nhanh và rẻ** — phát triển và đưa app ra nhiều nền tảng (mobile iOS/Android + desktop macOS/Windows, từ một codebase) với chi phí thấp hơn nhiều so với cách làm truyền thống.

> Định vị một dòng: *"Giải pháp AI cho doanh nghiệp · công cụ cho creator · ship app iOS, Android, macOS & Windows nhanh, rẻ."*

Đây **không** chỉ là một marketplace bán prompt, cũng **không** chỉ là một image generator. Nó là **nhà cung cấp giải pháp + dịch vụ**: vừa có công cụ self-serve cho creator, vừa có nhánh làm dự án AI / app riêng cho doanh nghiệp. Các đặc điểm hỗ trợ (50+ models, pay-as-you-go, tiết kiệm ~70%, không cần thẻ quốc tế, deploy on-prem) là *cách phục vụ*, không phải bản chất sản phẩm.

---

## 2. Ba trụ cột (3 pillars) — thứ tự ưu tiên: BUSINESS-FIRST

Homepage được dựng quanh 3 trụ cột, và **doanh nghiệp được đặt lên đầu** (card "FOR BUSINESS" có `featured` flag, viền vàng nổi bật):

| # | Pillar | Cho ai | Lời hứa | Điểm đến (route) |
|---|--------|--------|---------|------------------|
| 1️⃣ | **For Business / Enterprise** | Doanh nghiệp, đội vận hành | AI tùy biến quanh quy trình của bạn: dashboard, agents, automation. Deploy trên server riêng. Tiết kiệm ~70% so với nền tảng enterprise. | `/booking`, `/solutions`, `/product/poster-marketing-ai`, `/product/paperclip-ai-agents` |
| 2️⃣ | **For Creators** | Nhà sáng tạo nội dung | Tạo image / video / music / voice từ các model tốt nhất — một workspace, một ví credit, thay vì sub 5 nền tảng. | `/explorer`, `/product/ai-image-generator`, `/ai-video-generator`, `/ai-music-generator`, `/text-to-speech` |
| 3️⃣ | **Build Apps** | Startup, team kỹ thuật | Ship app iOS, Android, macOS & Windows **nhanh hơn & rẻ hơn** — component AI tái sử dụng, ~70% chi phí engineering thấp hơn, từ một codebase ra nhiều nền tảng. | `/booking`, `/product/nocode-export`, `/solutions` |

**Yếu tố hỗ trợ lặp lại xuyên suốt site (là *cách phục vụ*, KHÔNG phải bản chất sản phẩm):**
- **Pay-as-you-go** — không subscription bắt buộc, mua credit theo dùng, có volume discount tới 40%.
- **No international card** — thanh toán nội địa (phù hợp thị trường VN/khu vực).
- **Deploy on your own infrastructure** — dữ liệu in-house, hỗ trợ on-premise GPU / private cloud.
- **50+ models, cập nhật hàng tuần.**

> ⚠️ Đây là *điểm bán hàng hỗ trợ*. Bản chất Skyverses vẫn là **3 việc**: giải pháp AI cho doanh nghiệp · công cụ creator · ship app nhanh & rẻ (xem section 1). Đừng mô tả Skyverses là "platform bán credit / marketplace prompt".

---

## 3. Nhánh Enterprise bán gì (dịch vụ, không chỉ tool)

Section Enterprise liệt kê 4 dịch vụ — đây là phần "agency / solutions" của business:

1. **Build AI Applications** — thiết kế & phát triển app AI riêng, tích hợp chatbot/image/video gen vào hệ thống sẵn có, admin dashboard tùy biến.
2. **Deploy AI on Private Servers** — clone & deploy model lên server nội bộ, data ở lại in-house, hỗ trợ on-premise GPU/private cloud.
3. **Maintenance & Operations** — update model, monitor 24/7, train đội nội bộ vận hành.
4. **AI Consulting & Solutions** — tư vấn chiến lược AI theo ngành, fine-tune model với data doanh nghiệp, tối ưu chi phí vận hành.

→ Mọi CTA của nhánh này dẫn về `/booking` (đặt lịch nói chuyện với team) hoặc `/about`.

---

## 4. Bộ công cụ Creator (self-serve products)

Các product page chính (đều là route SEO thật, `/product/<slug>`):

- `ai-image-generator` — tạo ảnh 4K (model nội bộ gọi "Nano Banana", FLUX…).
- `ai-video-generator` — video cinematic (Veo 3, Kling…).
- `ai-music-generator` — nhạc.
- `text-to-speech` — giọng nói.
- `poster-marketing-ai` — poster/marketing cho doanh nghiệp.
- `paperclip-ai-agents` — AI agents & workflows.
- `nocode-export` — xuất app no-code.

Khám phá toàn bộ gallery/model: `/explorer` và `/markets`. Trang `/markets` còn có CMS-driven "HomeBlocks" để admin sắp xếp solution theo nhóm. *(Lưu ý: đây là tầng tool self-serve cho creator — một trong 3 việc, không phải toàn bộ sản phẩm.)*

---

## 5. Dịch vụ có thể làm thêm (roadmap mở rộng quanh pillar "Build Apps")

> ⚠️ Phần này phần lớn là **định hướng/roadmap**. **Riêng khâu go-to-store đã được giới thiệu trên homepage** (strip "We take it all the way to the store" trong `BuildAppsSection`: submit App Store/Google Play, code signing + ASO, publish hộ white-label, cập nhật theo policy store) — nhưng mới ở mức *quảng bá dịch vụ + CTA `/booking`*, chưa phải pipeline tự động vận hành. Các mục còn lại bên dưới vẫn là hướng mở rộng.

Pillar #3 ("Build Apps — nhanh hơn & rẻ hơn") hiện dừng ở build + multi-OS packaging. Mảng dịch vụ tự nhiên mở rộng tiếp là **đưa app ra thị trường (go-to-store)** — vốn là phần khách doanh nghiệp/startup hay vướng nhất:

1. **App Store / Google Play submission & publishing** — thay khách lo toàn bộ khâu phát hành:
   - Đăng ký & quản lý tài khoản developer (Apple Developer ~$99/năm, Google Play one-time ~$25).
   - Code signing, provisioning profiles, app signing key, build release `.ipa` / `.aab`.
   - Chuẩn bị store listing: icon, screenshot đa kích thước, mô tả, privacy nutrition label, age rating.
   - Submit, theo dõi review, xử lý khi bị reject (rất quan trọng với Apple).
2. **ASO & store presence** — tối ưu tiêu đề/keyword/screenshot, listing đa ngôn ngữ (khớp i18n en/vi/ko/ja sẵn có).
3. **CI/CD & release pipeline** — build tự động, TestFlight / Play Internal Testing, phased rollout, OTA update.
4. **White-label / publish hộ** — đứng tên tài khoản Skyverses publish cho khách chưa có dev account (mô hình reseller/agency).
5. **Maintenance theo policy store** — version bump khi Apple/Google đổi guideline (target SDK, privacy, in-app purchase), giữ app không bị gỡ.
6. **Desktop & web distribution** — đóng gói & ký app Windows (`.exe`/MSIX) / macOS (notarization), deploy web — mở rộng từ `OsStripSection` (iOS/Android/Win/macOS/Web) đã có trên homepage.

Gắn với mô hình hiện tại: các dịch vụ này đi qua nhánh **`/booking`** (tư vấn/đặt lịch) giống nhánh Enterprise, hoặc đóng gói thành add-on pay-as-you-go.

---

## 6. Homepage được dựng thế nào (cho AI sửa UI)

Homepage hiển thị bởi `pages/MarketPage.tsx`, phần dưới hero là component **`components/landing/HomepageV2Sections.tsx`** — giờ chỉ là **thin composer** render 12 section theo thứ tự (xen kẽ nền sáng/tối) + `<HomepageKeyframes />`:

```
HubSection (3 pillars, white)
 → BusinessSection (#fafbfc)
 → EnterpriseSection (4 dịch vụ, lazy)
 → HowItWorksSection (#fafbfc — 2 luồng "cách bắt đầu": creator self-serve 3 bước + business booking 3 bước)
 → CreatorsShowcaseSection (gallery image/video, dark)
 → PromptDemoSection (live demo prompt→ảnh, typewriter)
 → BuildAppsSection (+ CostDrop $40k→$12k + strip "go-to-store": App Store/Google Play, ASO, white-label, policy)
 → StatsBandSection (metrics count-up, dark)
 → OsStripSection (draw-line, fan-out iOS/Android/Win/macOS/Web)
 → WhySection (#fafbfc)
 → CmsBlockSection (CMS HomeBlocks)
 → FinalCtaSection (dark CTA)
```

- Mỗi section là **1 file riêng** trong `components/landing/homepage/`. Section không phụ thuộc data thì tự gọi `useLanguage()`/`useNavigate()`; chỉ section cần data (CreatorsShowcase, PromptDemo, CmsBlock) mới nhận props.
- **`homepage/shared.tsx`** = nơi chứa toàn bộ motion primitive dùng chung: `EASE`, `MotionChip`, `SectionHeader`, `Reveal`, `GoldButton`/`OutlineButton`, `DrawIcon`, `HoverCard`, `AnimatedStat` (count-up bằng rAF), `CostDrop`, và `HomepageKeyframes` (CSS keyframes: shimmer, caret nháy, scanline, icon-pulse). **Mọi animation đều respect `prefers-reduced-motion`.**
- Toàn bộ chữ trên homepage đi qua i18n key `landing.*` trong `context/LanguageContext.tsx`, đủ 4 ngôn ngữ **en / vi / ko / ja** (default `vi`). Thêm chữ mới = thêm key vào cả 4 block.

---

## 7. Stack & quy ước (tóm tắt — chi tiết ở CLAUDE.md)

- **Frontend:** React 19 + TypeScript (no `any`) + Vite 5 · Tailwind 3 (no inline styles) · **Atlas design system**, màu nhấn vàng gold `#C9A84C` (alias legacy = `brand-blue`, cùng màu) · Manrope (sans) + Fragment Mono (mono) · react-router-dom 7 (lazy) · framer-motion · lucide-react · three · @xyflow/react · @google/genai.
- **Cấu trúc:** `pages/` (~72) · `components/` (~350, có sub-folder `atlas/`, `landing/`, `market/`…) · `context/` (Auth/Theme/Lang/Search/Toast) · `apis/` (23) · `hooks/` (31). Sub-projects: `cms/`, `blog/`, `skyverses-backend/`.
- **Vòng đời job AI:** `<api>.create()` → `useJobPoller(jobId)` → `refreshCredits()`.
- **Auth/tier:** `{isAuthenticated && …}` + `useFeatureAccess` để check tier.
- **i18n:** `t('key')` từ `useLanguage()`.
- **Dev server:** luôn port **3001** (kill trước khi restart, không auto-increment).
- **Source map sống ở `docs/source-map/`** — phải update khi có structural change (xem bảng trong CLAUDE.md). Đừng đọc `docs/legacy/` và `docs/reference/` trừ khi được yêu cầu (token-saving rule).

---

## 8. Mental model rút gọn (nếu chỉ nhớ 5 điều)

1. **Nhà cung cấp giải pháp & công cụ AI làm 3 việc:** giải pháp AI cho doanh nghiệp (ưu tiên #1) · công cụ cho creator · ship app iOS, Android, macOS & Windows nhanh & rẻ. *(KHÔNG phải "platform bán credit / marketplace".)*
2. **Vừa là tool self-serve cho creator, vừa là agency** làm dự án AI / app riêng cho doanh nghiệp (nhánh `/booking`).
3. **Pay-as-you-go, rẻ ~70%, không cần thẻ quốc tế, deploy on-prem** là *cách phục vụ / điểm bán hỗ trợ*, không phải bản chất — nhắm thị trường VN/khu vực.
4. **Homepage = composer + section-per-file + shared motion lib**, i18n 4 ngôn ngữ.
5. **Khi sửa code:** TS strict, Tailwind only, port 3001, và cập nhật `docs/source-map/` nếu thay đổi cấu trúc.
