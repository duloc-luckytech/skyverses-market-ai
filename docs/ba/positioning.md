# Skyverses — Định vị sản phẩm (BA)

> **Trạng thái:** ĐÃ KHÓA (v-final) · Cập nhật: 2026-06-18
> Tài liệu nguồn cho mọi quyết định về messaging, homepage, SEO, sales. Khi định vị đổi → update file này TRƯỚC, rồi mới đổi code/SEO.

---

## 1. Một câu định vị

**Skyverses = công ty giải pháp & công cụ AI.**

Không có một câu USP/tagline bao trùm toàn site. Hero giới thiệu công ty rồi **điều hướng vào 3 trụ cột**; mỗi trụ cột tự nói giá trị riêng của nó.

## 2. Bản chất kép (quan trọng nhất khi thiết kế trang)

| | Trụ cột | Mô hình | Ai thực hiện |
|---|---------|---------|--------------|
| ① | Giải pháp AI cho doanh nghiệp | **Dịch vụ** | Team Skyverses build cho khách |
| ② | Bộ công cụ AI self-serve | **Sản phẩm** | Khách tự dùng trên web |
| ③ | Phát triển Mobile (App & Game) | **Dịch vụ** | Team Skyverses build cho khách |

→ **2 dịch vụ (①+③) ↔ 1 mảng công cụ (②).**
Trang/UX phải làm rõ **"khi nào Dùng ngay trên web (②) vs. khi nào Đặt Skyverses thực hiện / Giải pháp theo yêu cầu (①③)"**.
⚠️ **Không dùng từ "thuê"** (nghe như thuê nhân công, hạ giá trị brand). Dùng: *"Đặt Skyverses thực hiện"*, *"Đội ngũ Skyverses đồng hành"*, *"Giải pháp theo yêu cầu"*.

---

## 3. Chi tiết 3 trụ cột

### ① Giải pháp AI cho doanh nghiệp — ƯU TIÊN #1
- **Mô hình:** Dịch vụ — team build cho khách.
- **Hai hướng:**
  - (a) Tích hợp AI vào app / hệ thống sẵn có (website, ERP, CRM, quy trình…).
  - (b) Build app / sản phẩm AI mới hoàn toàn từ A–Z.
- Bao gồm: AI Agent & tự động hoá workflow, tư vấn chiến lược AI, outsource phát triển AI.
- **KHÔNG** nhắc hạ tầng riêng / on-prem.
- **CTA:** tư vấn / liên hệ / đặt lịch (Booking) / xem case.

### ② Bộ công cụ AI self-serve
- **Mô hình:** Sản phẩm — khách tự đăng ký, tự dùng trên web. Chính là catalog `/markets`.
- **Hai nhóm** (hiển thị bằng tabs/chips "Sáng tạo · Marketing"):
  - **Sáng tạo:** workspace 50+ model tạo **ảnh / video / audio**.
  - **Marketing:** công cụ AI marketing hỗ trợ **doanh nghiệp & creator** (content, ads, automation…). **Đã có sẵn trong list products `/markets`.**
- Trên homepage map thẳng vào `CmsBlockSection` (carousel catalog thật từ CMS — không bịa).
- **CTA:** dùng thử / đăng ký / mở workspace.

### ③ Phát triển Mobile (App & Game)
- **Mô hình:** Dịch vụ — team build cho khách.
- **App + Game**, nhanh & rẻ hơn so với thị trường.
- **Game có thể tích hợp AI** tùy nhu cầu khách.
- Hiển thị chips **"App · Game"**.
- **CTA:** tư vấn / báo giá / xem sản phẩm đã làm.

---

## 4. ĐÃ LOẠI khỏi định vị (không dùng làm thông điệp brand)

- USP line *"Trả theo dùng · Không cần thẻ quốc tế · Rẻ hơn ~70%"* — không làm tagline/hero. (Vẫn đúng về mặt sự thật cho hệ Credits → được dùng để **trả lời câu hỏi giá** ở FAQ/SEO, không làm thông điệp dẫn dắt.)
- *"Hạ tầng riêng / on-prem"* — bỏ hoàn toàn.
- *"Một codebase → đa nền tảng"* — bỏ làm claim.

## 5. Ràng buộc nội dung (honesty)

- **Không bịa** testimonial / logo khách / con số chứng minh.
- Được dùng tên model thật (Veo, FLUX, Sora, Imagen, Kling…) + card showcase gắn nhãn **"Demo"**.
- Giữ nguyên tên repo/route (`skyverses-market`, `/markets`).

## 6. Hệ quả cho homepage (design challenge)

- 2/3 trụ cột là dịch vụ (①+③), 1 là self-serve (②) → phân biệt rõ "thuê team" vs "tự dùng".
- Tránh các lỗi cũ: lặp định vị 3 lần (Hero/Hub/FinalCta), 3 block giá trị trùng nhau (Hub ~ Why ~ StatsBand), Business vs Enterprise chồng lấn, pillars bị HowItWorks chen ngang.

---

## Changelog
- **2026-06-18** — Khóa v-final. Gộp Marketing tools vào ② (self-serve, đã có trong `/markets`). Thêm Game vào ③. Loại USP giá/on-prem/một-codebase khỏi thông điệp brand.
