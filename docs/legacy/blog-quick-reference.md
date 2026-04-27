# Blog Codebase - Quick Reference Guide

## 🎯 Quick Answers

### 1. Where is the Blog Page Component?
**File**: `blog/pages/BlogHomePage.tsx`
- Main blog homepage with featured editorial grid
- Includes category filtering and pagination
- Uses Apple-style 5-column desktop layout

### 2. What Header is Used in the Blog?
**File**: `blog/components/BlogHeader.tsx`
- Separate header just for blog section
- NOT the main app `Header.tsx`
- Fixed position with responsive design

### 3. How Does the Logo Work?
**Logo Link Target**: `/` (links to blog home)
**Logo Image**: `https://ai.skyverses.com/assets/skyverses-logo.png`
**Text Display**:
- Desktop/Tablet: "Skyverses" (black) + "Insights" (blue)
- Mobile: "Insights" only (blue)
**Hover Effect**: Scales 110%

### 4. Is There an "Articles" Menu Item?
**YES** - In Blog Header Navigation
**Location**: `blog/components/BlogHeader.tsx` (NAV_LINKS array)
**Links To**: `/` (home page with all articles)

**NO** - NOT in Main App Header
- Main app uses "Insights" as external link instead

### 5. Blog Routes
```
/                          → BlogHomePage (home + all articles)
/:slug                     → BlogPostPage (individual post)
/category/:category        → BlogHomePage (filtered by category)
/search?q=...              → SearchPage (search results)
```

---

## 📁 Key Files at a Glance

| File | Purpose |
|------|---------|
| `blog/App.tsx` | Blog routing config |
| `blog/pages/BlogHomePage.tsx` | Main blog page ⭐ |
| `blog/components/BlogHeader.tsx` | Header with logo ⭐ |
| `components/Header.tsx` | Main app header |
| `App.tsx` | Main app routing |

---

## 🔗 Navigation Links

**Blog Header Navigation**:
- Articles → `/`
- Tutorials → `/category/Tutorials`
- News → `/category/News`

**Blog Categories** (5 total):
1. Tutorials (Blue, BookOpen icon)
2. News (Violet, Zap icon)
3. Tips (Amber, Sparkles icon)
4. Case Study (Emerald, TrendingUp icon)
5. Community (Pink, Users icon)

---

## 🎨 Logo Details

**Image URL**: `https://ai.skyverses.com/assets/skyverses-logo.png`
**Link Target**: `/` (blog home)
**Size**: 7x7 pixels
**Responsive**:
- Desktop: Shows "Skyverses Insights"
- Mobile: Shows "Insights" only
**Hover**: Scales 110% (smooth 200ms transition)

---

## 💻 Code Structure

```
blog/
├── App.tsx               ← Blog routing
├── pages/
│   ├── BlogHomePage.tsx  ← Main blog page ⭐
│   ├── BlogPostPage.tsx  ← Post detail
│   └── SearchPage.tsx    ← Search results
└── components/
    ├── BlogHeader.tsx    ← Header with logo ⭐
    ├── BlogFooter.tsx
    └── PostCard.tsx
```

---

## 🌐 Languages Supported
- 🇺🇸 English (en)
- 🇻🇳 Vietnamese (vi)
- 🇰🇷 Korean (ko)
- 🇯🇵 Japanese (ja)

---

## 📱 Responsive Design

**Blog Header**:
- Mobile (< 640px): Bottom nav bar, logo text "Insights"
- Tablet (640-768px): Top nav, logo "Skyverses Insights"
- Desktop (> 768px): Full header with inline search

**Blog Homepage**:
- Mobile: 1-column list
- Tablet: 2-column grid
- Desktop: 3-column grid + 5-column featured

---

## 🔐 Key Differences: Blog vs Main App

| Feature | Blog | Main App |
|---------|------|----------|
| Logo File | BlogHeader.tsx | Header.tsx |
| Articles Menu | ✅ Yes | ❌ No (Insights link) |
| Authentication | ❌ No | ✅ Yes |
| Mobile Nav | Bottom bar | Hamburger |
| CTA Button | "Try AI" (external) | "Deploy" (internal) |

---

## ⚡ Quick Navigation

**Start here**:
1. Blog main page: `blog/pages/BlogHomePage.tsx` (442 lines)
2. Blog header: `blog/components/BlogHeader.tsx` (363 lines)
3. Main app header: `components/Header.tsx` (532 lines)

**Logo code** in BlogHeader (lines 122-137):
```tsx
<Link to="/" className="flex items-center gap-2.5 shrink-0 group">
  <img src="https://ai.skyverses.com/assets/skyverses-logo.png" ... />
  {/* Desktop: Skyverses + Insights */}
  {/* Mobile: Insights only */}
</Link>
```

---

## 📊 Key Stats

- **Blog Files**: 16 main TypeScript files
- **Blog Categories**: 5 (Tutorials, News, Tips, Case Study, Community)
- **Languages**: 4 (EN, VI, KO, JA)
- **Routes**: 4 main routes (/, /search, /category/:cat, /:slug)
- **State Variables**: 13+
- **Components**: BlogHeader, BlogHomePage, BlogPostPage, SearchPage, PostCard, BlogFooter

---

## 🚀 Important URLs

- **Blog Logo Image**: `https://ai.skyverses.com/assets/skyverses-logo.png`
- **Blog Domain**: `https://insights.skyverses.com` (external link from main app)
- **CTA Button Link**: `https://ai.skyverses.com`
- **Support Link**: `https://skyverses.com/support`

---

## ❓ FAQ

**Q: Is blog integrated in main app?**
A: No. Blog is separate application accessed via external URL.

**Q: Where does logo link to?**
A: Blog logo → `/` (blog home)

**Q: Is there an "Articles" menu?**
A: YES in blog header. NO in main app header.

**Q: How many category filters?**
A: 5 categories available

**Q: Does blog require login?**
A: No. Blog is completely public.

**Q: Mobile navigation style?**
A: Bottom tab bar (not hamburger menu)

---

## 📖 Documentation Files

1. **BLOG-FINDINGS-SUMMARY.md** - Complete overview with diagrams
2. **BLOG-CODEBASE-ANALYSIS.md** - Detailed technical analysis
3. **BLOG-QUICK-REFERENCE.md** - This file!

---

**Last Updated**: April 8, 2026
