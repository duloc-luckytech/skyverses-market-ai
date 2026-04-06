---
description: Starter prompt template khi bắt đầu new conversation với Skyverses project
---

# Skyverses New Chat Starter

Dùng template này để bắt đầu conversation mới. Copy và điền vào phần [TASK].

## Template chuẩn:

```
đọc skyverses_architecture skill rồi [TASK]
```

## Template theo từng loại task:

### 🎨 Làm UI / Frontend page:
```
đọc skyverses_architecture và skyverses_ui_pages skill.
tôi muốn [mô tả UI task]
```

### 💳 Làm payment / AI generation / credits:
```
đọc skyverses_architecture và skyverses_business_flows skill.
tôi muốn [mô tả backend/payment task]
```

### 🖥️ Làm CMS admin:
```
đọc skyverses_cms skill.
tôi muốn [mô tả CMS task]
```

### 🚀 Task phức tạp (nhiều phần):
```
đọc tất cả skyverses skills rồi giúp tôi [mô tả task lớn]
```

### ❓ Không chắc task liên quan đến đâu:
```
đọc skyverses_architecture skill.
[mô tả vấn đề / câu hỏi]
```

---

## Ví dụ cụ thể:

| Task thực tế | Prompt mẫu |
|-------------|-----------|
| Thêm product mới | `đọc skyverses_architecture skill. thêm product "AI 3D Generator" vào marketplace` |
| Sửa CMS pricing tab | `đọc skyverses_cms skill. tab PricingTab đang bị lỗi khi lưu model mới` |
| Thêm API payment | `đọc skyverses_business_flows skill. tôi muốn thêm thanh toán USDT crypto` |
| Fix bug homepage | `đọc skyverses_ui_pages skill. homepage featured section không auto-rotate` |
| Câu hỏi tổng quan | `đọc skyverses_architecture skill. giải thích cách credit system hoạt động` |

---

## Nếu hoàn toàn quên — dùng câu này:

```
đọc tất cả skills của project Skyverses rồi giúp tôi với:
[mô tả vấn đề]
```

AI sẽ tự quyết định đọc skill nào phù hợp.
