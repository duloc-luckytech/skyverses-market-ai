---
description: Skyverses Contextual UI/UX Rules & Sync Workflow for CMS
---

# Quy trình đồng bộ Giao diện CMS & Frontend Skyverses (Contextual Sync Workflow)

CMS của dự án này không được phát triển cô lập. Mục tiêu tối thượng của bạn (khi đóng vai trò là lập trình viên) là phải **đồng bộ 100% style, tinh thần thiết kế và nội dung ngữ cảnh** từ mã nguồn Frontend chính (Main FE Source) sang hệ thống quản trị CMS.

Bất cứ khi nào bạn được yêu cầu xây dựng một Layout mới, Component mới, hoặc bổ sung Content UI cho CMS, bạn BẮT BUỘC phải thực hiện tuần tự các bước sau đây TRƯỚC VÀ TRONG QUÁ TRÌNH VIẾT CODE:

## Bước 1: Tra cứu & Đồng bộ phong cách từ Frontend chính (Follow Main FE Style)
Bạn tuyệt đối không được tự bịa ra các Class Tailwind mới lạ (như xám tro, xanh ngọc lạ...) nếu nó chưa tồn tại ở FE ngoài.
1. Dùng tool `grep_search` hoặc `view_file` để quét qua các file trọng điểm ở ngoài FE (Ví dụ: `pages/MarketsPage.tsx`, `pages/ExplorerPage.tsx`, hoặc `components/Header.tsx`).
2. **Kế thừa Typography:** Thu thập chính xác các thẻ Header, Description từ trang chính đang dùng (Ví dụ: Việc kết hợp `font-black uppercase italic tracking-tighter` với `text-[10px] tracking-widest text-gray-400`).
3. **Kế thừa Không Giao (Space & Dimension):** Xem cách họ padding (VD: `p-8 lg:p-12`), gap (`space-y-10`), flex/grid bố cục để mang vào form nhập liệu và thẻ hiển thị lưới của CMS.
4. **Kế thừa Style Layering (Glows & Gradients):** Nếu ngoài FE dùng glow `shadow-[0_0_50px_rgba(0,144,255,0.05)]` hay `bg-black/[0.04]`, hãy áp dụng chính xác mã thông số đó. Đừng dùng đổ bóng mặc định của Tailwind.

## Bước 2: Hiểu rõ Content Ngữ Cảnh (Context & Model Schema)
CMS được sinh ra là để quản lý dữ liệu. Bạn phải hiển thị nội dung hợp lý, chính xác kiểu dữ liệu.
1. Đọc và phân tích file `data.ts` hoặc `types.ts` để hiểu các Object Schema (VD: `Solution`, `EventConfig`).
2. **Hiển thị Content phù hợp Context:**
   - Khi làm giao diện nhập liệu hoặc danh sách hiển thị, hãy cân nhắc ngữ cảnh. Ví dụ: Nếu đối tượng là Video Generation Model, hãy tạo giao diện show FPS, Render Time...
   - Nếu là Pricing, UI CMS để nhập giá (`costBase`) cần có Icon màu nổi trội (VD: Đồng tiền, Tia sét màu `orange-500`).
   - Placeholder và thông báo trong CMS Form cũng phải được viết bằng ngôn từ cao cấp, ngắn gọn (Ví dụ: thay vì "Enter name here", dùng "System Designation...").

## Bước 3: Áp dụng Premium AI Aesthetic vào CMS
Sau khi đã "học" được Style từ FE, bắt đầu build Component CMS dựa trên "bộ lọc" sau:
- Mọi background tĩnh của Component trên CMS dùng Glassmorphism (Kính mờ) như `bg-white/5 dark:bg-[#0a0a0c]/60 backdrop-blur-2xl`.
- Bất kỳ bảng danh sách nào (List/Table) cũng không dùng viền cứng. Đóng khung nó bằng `border-black/[0.04] dark:border-white/[0.04]`.
- Nút bấm chính (Call to Action / Submit) ở CMS nên mang màu `brand-blue`, hiệu ứng hover trơn tru, kèm Icon chuẩn của `lucide-react`.

### Tóm lại:
Không thiết kế theo bản năng hay format "Admin Dashboard thông thường". Mọi thẻ div bạn viết ra trên trang `/cms` đều phải có "hồ sơ năng lực" chứng minh rằng nó đang kế thừa style từ một đoạn code nào đó ngoài `/pages` hoặc `/components` của Skyverses FE.
