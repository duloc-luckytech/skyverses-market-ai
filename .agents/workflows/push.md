---
description: Auto git add, commit and push to origin main
---

// turbo-all

# Git Push Workflow

When the user asks to push code, follow these steps:

1. Run `git add -A` in the project directory `e:\Antigravity\skyverses-market-ai`
2. Run `git commit -m "<commit message>"` — generate a concise, descriptive commit message based on the changes made
3. Run `git push origin main` to push to remote

**Notes:**
- All commands use `SafeToAutoRun: true` since turbo-all is enabled
- Commit message should follow conventional commits format (feat:, fix:, refactor:, etc.)
- If push fails, report the error to the user
