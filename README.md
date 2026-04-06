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
