<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1r-YqhsK8rCMgbPT0XSc9mPjcyEhKuUcz

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## 🤖 AI Agent Workflows

Project này có **AI skills & workflows** để AI hiểu context dự án ngay từ đầu.

### Bắt đầu new conversation — dùng lệnh:
```
/new_chat_starter
```
> AI sẽ hiển thị toàn bộ prompt templates theo từng loại task.

### Hoặc nếu nhớ thì dùng thẳng:
```
đọc tất cả skills của project Skyverses rồi giúp tôi: [task của bạn]
```

### Skills có sẵn:
| Skill | Dùng khi |
|-------|---------|
| `skyverses_architecture` | Mọi task — đọc đầu tiên |
| `skyverses_ui_pages` | Làm Homepage, Markets, Frontend pages |
| `skyverses_business_flows` | Làm Payment, AI generation, Credits |
| `skyverses_cms` | Làm CMS admin tabs, drawers |

### Update skill sau khi thêm tính năng mới:
```
update skill cho thay đổi vừa rồi
```
### Workflows có sẵn:
| Lệnh | Dùng khi |
|------|---------|
| `/add_new_product` | Thêm product mới vào marketplace (full flow) |
| `/cms_style_guide` | Làm CMS page, tab, drawer |
| `/push` | Git add + commit + push origin main |

---

## 🛒 Thêm Product Mới — Quick Reference

Dùng workflow `/add_new_product` để AI follow đúng 9 bước. Tóm tắt nhanh:

### 1. Seed product vào DB
```bash
# Tạo seed-<slug>.mjs theo pattern seed-products.mjs
node seed-<slug>.mjs
# → Ghi lại _id trả về
```

### 2. Generate banner image
```bash
# Tạo gen-<slug>-image.mjs theo pattern gen-social-banner-image.mjs
node gen-<slug>-image.mjs
# Pipeline: Skyverses AI → Cloudflare CDN → PUT /market/:id
```
> ⚠️ Nếu token `skv_` báo 401 → lấy token mới từ CMS Admin > API Clients

### 3. Cấu trúc file bắt buộc

```
pages/images/YourProductAI.tsx         ← thin orchestrator, không viết JSX ở đây
components/landing/<name>/
  HeroSection.tsx                       ← fetch Explorer API images
  WorkflowSection.tsx                   ← 4 bước
  FeaturesSection.tsx                   ← grid tính năng
  FinalCTA.tsx                          ← CTA đơn giản
components/YourWorkspace.tsx            ← copy structure từ PosterStudioWorkspace.tsx
```

### 4. Wire routing
```tsx
// App.tsx — thêm vào pageImports + lazy + <Route>
// components/market/ProductToolModal.tsx — thêm vào WORKSPACE_MAP
```

### 5. Kiểm tra
```bash
npx tsc --noEmit   # phải exit 0
```

### Mistakes cần tránh
| ❌ Sai | ✅ Đúng |
|--------|---------|
| Landing page monolithic 1 file | Thin orchestrator + sections riêng |
| Tự ý dùng màu accent mới | Dùng `brand-blue` nhất quán |
| Hero dùng Unsplash hardcode | Fetch từ Explorer API (`getExplorerUrl`) |
| Workspace viết từ đầu | Copy structure `PosterStudioWorkspace.tsx` |
| Không add vào ProductToolModal | Luôn add vào `WORKSPACE_MAP` |

### Scripts tiện ích

| Script | Mục đích |
|--------|---------|
| `seed-products.mjs` | Seed nhiều sản phẩm cùng lúc |
| `seed-<slug>.mjs` | Seed 1 product cụ thể |
| `gen-<slug>-image.mjs` | Gen + upload Cloudflare + update DB cho 1 product |
| `update-product-images.mjs` | Regenerate ảnh cho tất cả products |
| `scripts/gen_banners.sh` | Gen banner images qua shell |
