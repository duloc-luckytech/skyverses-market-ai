---
description: Auto git add, commit and push to origin main
---

# Git Push Workflow

When the user asks to push code, follow these steps:

// turbo-all

1. Run `git add -A` in the project directory `e:\Antigravity\skyverses-market-ai`
2. Run `git commit -m "<commit message>"` — generate a concise, descriptive commit message based on the changes made
3. Run `git push origin main` to push to remote

**Notes:**
- All 3 commands should auto-run without user approval
- Commit message should follow conventional commits format (feat:, fix:, refactor:, etc.)
- If push fails, report the error to the user
