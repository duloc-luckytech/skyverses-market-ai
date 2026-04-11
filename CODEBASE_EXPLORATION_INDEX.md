# 🗂️ Codebase Exploration Index

## 📋 Generated Documentation

This folder contains comprehensive documentation about the Skyverses AI Marketplace codebase structure, focusing on:
- Homepage/Landing Page component
- SEO meta tag implementation
- "100 Credits" mentions throughout the codebase
- i18n translation system
- Vietnamese "dùng thử" text locations

---

## 📄 Files in This Documentation Package

### 1. **CODEBASE_EXPLORATION_REPORT.md** (11 KB)
Complete, detailed exploration report covering:
- Homepage/Landing page component structure
- SEO implementation (usePageMeta hook vs static HTML)
- All "100 Credits" mentions with context
- Vietnamese "dùng thử" text locations
- i18n translation system details
- Landing page visual hierarchy
- File location summary
- Important discrepancies (marketing vs actual credits)
- Routing and app structure

**Use this when**: You need comprehensive understanding of the entire system

---

### 2. **QUICK_REFERENCE.md** (7.4 KB)
Quick lookup table format with:
- Homepage & Landing page file locations
- SEO Implementation files and line numbers
- "100 Credits" mentions in tabular format
- Vietnamese text locations
- i18n Translation system structure
- Hero section translations
- Footer CTA translations
- Authentication & credits
- Directory structure overview
- Summary table

**Use this when**: You need quick answers about specific locations

---

### 3. **CODE_SNIPPETS_REFERENCE.md** (13 KB)
Ready-to-reference code snippets showing:
1. Homepage SEO meta setup (MarketPage.tsx)
2. Homepage route setup (App.tsx)
3. SEO hook implementation (usePageMeta.ts)
4. i18n translation system (LanguageContext.tsx)
5. Footer CTA section code
6. Static HTML meta tags (index.html)
7. Authentication context (AuthContext.tsx)
8. Layout wrapper component
9. Key translation keys
10. Translation key access patterns
11. Changes needed to update credits messaging

**Use this when**: You need actual code to reference or modify

---

## 🎯 Quick Navigation by Topic

### Homepage/Landing Page
| Document | Section |
|-----------|---------|
| CODEBASE_EXPLORATION_REPORT.md | Section 1 |
| QUICK_REFERENCE.md | Homepage & Landing page table |
| CODE_SNIPPETS_REFERENCE.md | Snippet #1, #2, #8 |

### SEO Implementation
| Document | Section |
|-----------|---------|
| CODEBASE_EXPLORATION_REPORT.md | Section 2 |
| QUICK_REFERENCE.md | SEO Implementation table |
| CODE_SNIPPETS_REFERENCE.md | Snippet #1, #3, #6 |

### "100 Credits" Mentions
| Document | Section |
|-----------|---------|
| CODEBASE_EXPLORATION_REPORT.md | Section 3 |
| QUICK_REFERENCE.md | "100 CREDITS" MENTIONS table |
| CODE_SNIPPETS_REFERENCE.md | Snippet #10 (Summary of Changes) |

### Vietnamese "Dùng Thử" Text
| Document | Section |
|-----------|---------|
| CODEBASE_EXPLORATION_REPORT.md | Section 4 |
| QUICK_REFERENCE.md | VIETNAMESE "DÙNG THỬ" TEXT table |

### i18n Translation System
| Document | Section |
|-----------|---------|
| CODEBASE_EXPLORATION_REPORT.md | Section 5 |
| QUICK_REFERENCE.md | I18N TRANSLATION SYSTEM table |
| CODE_SNIPPETS_REFERENCE.md | Snippet #4 |

### Translation Keys
| Document | Section |
|-----------|---------|
| QUICK_REFERENCE.md | Footer CTA Translations, Hero Section Translations |
| CODE_SNIPPETS_REFERENCE.md | Snippet #9, #10 |

---

## 🔑 Key Findings Summary

### 1️⃣ Homepage Component
- **File**: `pages/MarketPage.tsx` (1-203+)
- **Route**: `/` 
- **Wrapper**: `components/Layout.tsx`

### 2️⃣ SEO Implementation
- **Method**: Custom `usePageMeta()` hook (NOT React Helmet)
- **Hook File**: `hooks/usePageMeta.ts` (1-87)
- **Static HTML**: `index.html` (Lines 1-250)
- **Homepage Usage**: `pages/MarketPage.tsx` (Lines 65-91)

### 3️⃣ "100 Credits" Discrepancy ⚠️
**Marketing/SEO Says**: 100 Credits free
**Actual Implementation**: 1,000 Credits welcome bonus
- Occurs in: `index.html` (8 locations), `pages/MarketPage.tsx` (2 locations)
- Backend source: `context/AuthContext.tsx` line 296, `skyverses-backend/src/routes/auth.ts` line 105

### 4️⃣ i18n System
- **Type**: Custom inline translation object (NOT i18next)
- **File**: `context/LanguageContext.tsx` (Lines 11-1504)
- **Languages**: English, Vietnamese, Korean, Japanese
- **Hook**: `useLanguage()` (Lines 1558-1562)

### 5️⃣ Footer CTA Messaging
- **Translation Key**: `footer.cta_desc`
- **English**: "Sign up for free and get 50 Credits to try today."
- **Vietnamese**: "Đăng ký miễn phí và nhận 50 Credits trải nghiệm ngay hôm nay."

---

## 📊 File Statistics

| Aspect | Details |
|--------|---------|
| Total Languages | 4 (English, Vietnamese, Korean, Japanese) |
| Translation Keys | ~382-364 per language |
| "100 Credits" Mentions | 10 locations |
| i18n Context Size | 1,493 lines |
| usePageMeta Hook | 87 lines |
| Hero Section Keys | 7 keys |
| Footer CTA Keys | 4 keys |

---

## 🚀 Common Tasks

### Find the SEO title
→ See: CODE_SNIPPETS_REFERENCE.md, Snippet #1 (line 2)
→ File: `pages/MarketPage.tsx`, line 66

### Update "100 Credits" to "1000 Credits"
→ See: CODE_SNIPPETS_REFERENCE.md, Section "Summary of Changes"
→ Files: `index.html`, `pages/MarketPage.tsx`, `context/LanguageContext.tsx`

### Find all translation keys
→ See: QUICK_REFERENCE.md, I18N TRANSLATION SYSTEM table
→ File: `context/LanguageContext.tsx`, lines 12-1503

### Add a new translation
→ See: CODE_SNIPPETS_REFERENCE.md, Snippet #10
→ File: `context/LanguageContext.tsx`

### Change how SEO tags are set
→ See: CODE_SNIPPETS_REFERENCE.md, Snippet #3
→ File: `hooks/usePageMeta.ts`

---

## 🔍 How to Use This Documentation

### If you're debugging SEO issues:
1. Start with **QUICK_REFERENCE.md** - SEO Implementation section
2. Look at **CODE_SNIPPETS_REFERENCE.md** - Snippet #3 for how meta tags work
3. Check **CODEBASE_EXPLORATION_REPORT.md** - Section 2 for context

### If you're updating text/translations:
1. Find the key in **QUICK_REFERENCE.md** - Translation tables
2. See the exact location in **CODEBASE_EXPLORATION_REPORT.md** - Sections 4-5
3. Use code examples from **CODE_SNIPPETS_REFERENCE.md** - Snippet #4

### If you need the full picture:
1. Read **CODEBASE_EXPLORATION_REPORT.md** in order
2. Use other documents as reference for specific code
3. Check line numbers against actual files for verification

---

## 📝 Document Metadata

| Document | Size | Lines | Last Updated |
|----------|------|-------|--------------|
| CODEBASE_EXPLORATION_REPORT.md | 11 KB | ~330 | Apr 11, 2026 |
| QUICK_REFERENCE.md | 7.4 KB | ~260 | Apr 11, 2026 |
| CODE_SNIPPETS_REFERENCE.md | 13 KB | ~390 | Apr 11, 2026 |
| This Index | 5.5 KB | ~220 | Apr 11, 2026 |

---

## ✅ Verification Checklist

- ✅ Homepage component identified: `pages/MarketPage.tsx`
- ✅ SEO method documented: `usePageMeta()` hook
- ✅ All "100 Credits" mentions found and documented
- ✅ Vietnamese "dùng thử" text locations identified
- ✅ i18n system thoroughly documented
- ✅ All file paths verified against actual codebase
- ✅ Line numbers confirmed for accuracy
- ✅ Code snippets extracted and formatted
- ✅ Discrepancies identified and noted
- ✅ Quick reference tables created

---

## 📞 Need More Information?

Each document contains:
- ✓ Specific file paths
- ✓ Exact line numbers
- ✓ Code snippets
- ✓ Context and explanations
- ✓ Visual hierarchies
- ✓ Tables for quick lookup
- ✓ Cross-references between documents

**Start with the document that matches your need**, then use the others for details.

---

Generated: April 11, 2026  
Repository: skyverses-market-ai  
Codebase Version: 1.0.4 BETA
