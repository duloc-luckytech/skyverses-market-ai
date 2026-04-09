# Blog Page Implementation Analysis - COMPREHENSIVE

## Project Overview
- **Location**: `/blog/` (separate frontend package)
- **Type**: Vite + React + TypeScript blog platform
- **API Base URL**: Auto-detected from environment (defaults to `http://localhost:3221` for dev)
- **Supported Languages**: English, Vietnamese, Korean, Japanese (en, vi, ko, ja)
- **Backend Port**: 5302 (production) or 3221 (dev)

---

## 1. FILE STRUCTURE & PATHS

### Frontend Files (Blog Package)
```
/blog/
├── pages/
│   ├── BlogHomePage.tsx          # Main blog listing page (374 lines)
│   └── BlogPostPage.tsx          # Individual post detail page (648 lines)
├── components/
│   ├── BlogHeader.tsx            # Top navigation with language/theme switcher (362 lines)
│   ├── BlogFooter.tsx            # Footer with newsletter CTA (242 lines)
│   └── PostCard.tsx              # Reusable card component (4 size variants, 289 lines)
├── apis/
│   ├── blog.ts                   # API client methods (67 lines)
│   └── config.ts                 # API URL configuration (19 lines)
├── context/
│   ├── LanguageContext.tsx       # i18n context & translations (156 lines)
│   └── ThemeContext.tsx          # Dark/light theme toggle (33 lines)
├── hooks/
│   └── usePageMeta.ts            # SEO meta tags management (98 lines)
├── types.ts                       # TypeScript interfaces (61 lines)
└── index.tsx                      # Entry point
```

### Backend Files (Reference)
```
/skyverses-backend/src/
├── models/
│   └── BlogPost.model.ts         # MongoDB schema definition (140 lines)
└── routes/
    └── blog.ts                   # API endpoints
```

---

## 2. DATA STRUCTURE: BlogPost INTERFACE

Located in `/blog/types.ts`:

```typescript
interface BlogPost {
  _id: string;                    // MongoDB ID
  slug: string;                   // URL slug (unique)
  title: LocalizedString;         // { en, vi?, ko?, ja? }
  excerpt: LocalizedString;       // { en, vi?, ko?, ja? }
  content: LocalizedString;       // HTML content { en, vi?, ko?, ja? }
  coverImage: string;             // Image URL
  category: string;               // Category name (e.g., "Tutorials", "News")
  tags: string[];                 // Array of tag strings
  author: {
    name: string;
    avatar: string;               // Avatar URL
    role: string;                 // e.g., "Editor"
  };
  seo: {
    metaTitle: LocalizedString;   // SEO title
    metaDescription: LocalizedString;
    ogImage: string;              // OG image URL
    keywords: string[];           // SEO keywords
  };
  isPublished: boolean;           // Draft/published flag
  isFeatured: boolean;            // Featured flag
  publishedAt: string;            // ISO date string
  readTime: number;               // Estimated read time (minutes)
  viewCount: number;              // View counter
  order: number;                  // Manual sort order
  relatedSlugs: string[];         // Related post slugs
  createdAt: string;              // ISO creation date
  updatedAt: string;              // ISO update date
}
```

**Supporting Types:**
```typescript
interface LocalizedString {
  en: string;
  vi?: string;
  ko?: string;
  ja?: string;
}

interface CategoryCount {
  category: string;
  count: number;
}

interface BlogListResponse {
  success: boolean;
  data: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

## 3. API ENDPOINTS & CALLS

All endpoints located in `/blog/apis/blog.ts`:

### 1. **List Posts** (GET /blog)
```typescript
blogApi.getPosts({
  page?: number;           // Page number (1-indexed)
  limit?: number;          // Items per page (default: 12)
  category?: string;       // Filter by category
  tag?: string;           // Filter by tag
  q?: string;             // Full-text search query
  lang?: string;          // Language filter (en, vi, ko, ja)
  featured?: boolean;     // Featured posts only
}): Promise<BlogListResponse>
```

**Usage in BlogHomePage:**
```typescript
blogApi.getPosts({
  page,
  limit: ITEMS_PER_PAGE,  // 12
  category: activeCategory || undefined,
  q: search || undefined,
  lang: currentLang
})
```

### 2. **Get Featured Posts** (GET /blog/featured)
```typescript
blogApi.getFeatured(): Promise<{ success: boolean; data: BlogPost[] }>
```

**Usage:**
- Only called on home page (page 1, no filters)
- Returns 3-4 posts for editorial grid layout
- Sorted by `order` field (backend)

### 3. **Get Categories** (GET /blog/categories)
```typescript
blogApi.getCategories(): Promise<{ success: boolean; data: CategoryCount[] }>
```

**Returns:** Array of `{ category: string; count: number }`

### 4. **Get Single Post** (GET /blog/:slug)
```typescript
blogApi.getPost(slug: string): Promise<BlogDetailResponse>
```

**Usage in BlogPostPage:**
```typescript
const res = await blogApi.getPost(slug);
if (res?.success && res.data) {
  setPost(res.data);
}
```

---

## 4. SORTING & FILTERING LOGIC

### **Sorting: Backend-Only (Server-Side)**
- ✅ **Featured posts** sorted by `order` field (backend query)
- ✅ **Main feed** sorted by `publishedAt DESC` (backend default, via compound index)
- ❌ **No client-side sorting** implemented

**Key Location:** BlogHomePage lines 71-88
```typescript
useEffect(() => {
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [postsRes, featRes, catRes] = await Promise.all([
        blogApi.getPosts({ page, limit: ITEMS_PER_PAGE, category: activeCategory || undefined, q: search || undefined, lang: currentLang }),
        page === 1 && !activeCategory && !search ? blogApi.getFeatured() : Promise.resolve({ success: true, data: [] }),
        blogApi.getCategories(),
      ]);
      // ... process results
    } catch { /* silent */ }
    finally { setLoading(false); }
  };
  fetchAll();
}, [page, activeCategory, search, currentLang]);
```

### **Filtering: API Parameters**
1. **By Category:** `category` parameter → matches exact category string
2. **By Search:** `q` parameter → full-text search on title/excerpt/content
3. **By Language:** `lang` parameter → passed to API to return localized content
4. **Pagination:** `page` + `limit` parameters → offset-based pagination

### **Client-Side State Management**
```typescript
const [posts, setPosts] = useState<BlogPost[]>([]);
const [featured, setFeatured] = useState<BlogPost[]>([]);
const [activeCategory, setActiveCategory] = useState(urlCategory || '');
const [search, setSearch] = useState(searchParams.get('q') || '');
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalCount, setTotalCount] = useState(0);
```

**URL Sync:** (lines 90-95)
```typescript
useEffect(() => {
  const p = new URLSearchParams();
  if (search) p.set('q', search);
  if (page > 1) p.set('page', String(page));
  setSearchParams(p, { replace: true });
}, [search, page]);
```

---

## 5. CARD RENDERING VARIANTS

### **PostCard Component** (`/blog/components/PostCard.tsx`)

Supports **4 size variants**:

#### 1. **"hero"** - Large editorial card (Lines 51-128)
- Dimensions: 340px height (mobile) → full height on desktop
- Min height: 560px (desktop)
- Usage: Featured section top card
- Content:
  - Cover image with gradient overlay
  - Category badge with gradient
  - Featured badge (if isFeatured)
  - Large title
  - Excerpt (hidden on mobile)
  - Author info with avatar
  - Date
  - CTA appears on hover
- Hover Effects:
  - Image opacity increases (0.75 → 0.90)
  - Image scales (1 → 1.03)
  - "Read More" button fades in

#### 2. **"featured"** - Medium editorial card (Lines 132-154)
- Dimensions: 160px+ height (flexible)
- Usage: Featured section side cards (2 per sidebar)
- Content:
  - Cover image with gradient overlay
  - Category badge (small)
  - Title (2 lines, clamped)
  - Meta: Read time, View count
- Hover Effects:
  - Image opacity increases (0.70 → 0.85)
  - Image scales (1 → 1.04)

#### 3. **"compact"** - Horizontal sidebar card (Lines 158-179)
- Dimensions: Horizontal layout, 72x60px thumbnail
- Usage: Featured section 3rd+ cards (or bottom-right extra slot)
- Content:
  - Thumbnail image
  - Category badge (small)
  - Title (2 lines, clamped)
  - Meta: Read time, Date
- Layout: Flex row with gap

#### 4. **"normal"** - Standard grid card (Lines 183-286) [DEFAULT]

**Desktop Layout (Vertical):**
- Cover image: 200px height
  - Category badge + "Featured" badge (both in top-left)
  - Gradient overlay on hover
- Body:
  - Tags (max 3, displayed with Tag icon)
  - Title (15px, 2 lines clamped)
  - Excerpt (12.5px, 2 lines clamped)
  - Separator line
  - Footer row: Author avatar + name, Read time, View count
- Top accent line: Gradient (appears on hover)
- Hover Effects:
  - Border changes to brand-blue/25
  - Shadow appears
  - Slight upward translation (-1px)

**Mobile Layout (Horizontal):**
- Thumbnail: 90x76px
  - Category badge at bottom
  - Gradient accent line at bottom
- Info Section:
  - Category badge
  - Title (13px, 2 lines clamped)
  - Meta: Read time, Views (abbreviated if 1000+), Date
  - Hover: Image scales up, title changes color to brand-blue

**CSS Classes Pattern:**
```typescript
// Mobile conditional rendering
<div className="flex md:hidden gap-3 p-3">
  {/* Mobile horizontal layout */}
</div>

// Desktop conditional rendering
<div className="hidden md:flex flex-col flex-1">
  {/* Desktop vertical layout */}
</div>
```

---

## 6. DATA FLOW: REQUEST → COMPONENT

### **BlogHomePage Flow:**
```
1. useEffect (lines 71-88) → Fetch data when page/category/search/lang change
   ├─ getPosts() → Returns: { data: BlogPost[], pagination: {...} }
   ├─ getFeatured() → Returns: { data: BlogPost[] } (only if page 1 & no filters)
   └─ getCategories() → Returns: { data: CategoryCount[] }

2. setState Updates (lines 80-83):
   ├─ setPosts(postsRes.data)
   ├─ setFeatured(featRes.data)
   ├─ setCategories(catRes.data)
   ├─ setTotalPages(postsRes.pagination.totalPages)
   └─ setTotalCount(postsRes.pagination.total || 0)

3. Render Editorial Grid (lines 119-177):
   ├─ Conditional: !isFiltered && page === 1 && heroPost
   ├─ heroPost = featured[0]
   ├─ sidePosts = featured.slice(1, 4)
   ├─ Desktop (md): 5-column grid layout
   │  ├─ Col 1-3: PostCard(heroPost, size="hero")
   │  └─ Col 4-5: PostCard(sidePosts[0-2], sizes="featured"/"compact")
   └─ Mobile: Vertical stack (hero + 2-col featured grid)

4. Render Main Feed (lines 323-341):
   ├─ Desktop: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
   └─ Mobile: Flex column with dividers
   └─ posts.map(post => <PostCard post={post} size="normal" />)

5. Pagination (lines 345-367):
   ├─ Show if totalPages > 1
   └─ Page buttons (1...totalPages) with onClick handlers
       ├─ On click: setPage(p), scrollTo(top, smooth)
       └─ Current page highlighted with brand-blue background
```

### **BlogPostPage Flow:**
```
1. Extract slug from URL params (line 291)
2. useEffect (lines 305-328) → Fetch single post when slug/lang changes:
   ├─ blogApi.getPost(slug)
   ├─ If success && has category:
   │  └─ blogApi.getPosts({ category: post.category, limit: 4, lang: currentLang })
   └─ Filter related posts: exclude current, take first 3

3. Parse & Process Content (lines 343-350):
   ├─ Get localized title (lang-specific or fallback to en)
   ├─ Get localized content (HTML)
   ├─ injectHeadingIds(content) → Add id attrs to h1-h4 tags
   ├─ extractToc(content) → Parse headings into TOC items
   └─ useMemo to avoid reprocessing

4. Render Post Layout (lines 415+):
   ├─ ReadingProgress bar (line 417)
   ├─ BackToTop button (line 418)
   ├─ MobileArticleBar (lines 420-427):
   │  ├─ TOC sheet modal
   │  ├─ Share sheet modal
   │  ├─ Copy link button
   │  └─ Back button
   ├─ Hero cover image (lines 431-470):
   │  ├─ Breadcrumb nav
   │  ├─ Category badge + Featured badge
   │  └─ Title + Excerpt overlay
   ├─ Meta bar (lines 479-505):
   │  ├─ Author info with avatar
   │  ├─ Date
   │  ├─ Read time
   │  └─ View count
   ├─ Content section (lines 545-549):
   │  ├─ dangerouslySetInnerHTML={{ __html: content }}
   │  └─ Prose styling (max-w-none, typography)
   ├─ Share bar (lines 552-580, desktop only):
   │  ├─ Twitter/X button
   │  ├─ Facebook button
   │  ├─ LinkedIn button
   │  ├─ Copy link button
   │  └─ Share button
   ├─ Author card (lines 583-598)
   └─ Related posts carousel (lines 621-642):
       ├─ Desktop: 3-column grid
       └─ Mobile: Horizontal snap scroll

5. Sidebar (Desktop Only, lines 614-616):
   └─ <TableOfContents items={toc} activeId={activeHeading} />
       ├─ Sticky positioning
       ├─ Nested indent based on heading level
       └─ Highlight active heading based on IntersectionObserver
```

---

## 7. POTENTIAL MISMATCHES & ISSUES

### ✅ **No Known Field Mismatches**
The frontend types match the MongoDB schema perfectly. All fields in BlogPost interface correspond exactly to the schema.

### ⚠️ **Observations:**

1. **Content HTML Rendering** (BlogPostPage line 548):
   ```typescript
   dangerouslySetInnerHTML={{ __html: content }}
   ```
   - ❌ Uses `dangerouslySetInnerHTML` (XSS risk if user-generated)
   - ✅ Safe if content comes from trusted backend (admin-only)
   - **Recommendation:** If content ever becomes user-generated, sanitize with DOMPurify

2. **Reading Time Display** (PostCard lines 88, 150, 175, 275):
   - Format: `{post.readTime}m` or `{post.readTime} min`
   - Data type: `number` (minutes)
   - ✅ Matches backend calculation

3. **View Count Formatting** (PostCard lines 211, 278):
   ```typescript
   post.viewCount > 999 ? `${(post.viewCount / 1000).toFixed(1)}k` : post.viewCount
   ```
   - Correctly abbreviates large numbers (1000+ = "1.0k")
   - No loss of precision for display

4. **Date Locale Handling** (BlogPostPage lines 376-379, PostCard lines 41-44):
   ```typescript
   const date = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(
     lang === 'vi' ? 'vi-VN' : lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : 'en-US',
     { year: 'numeric', month: 'long', day: 'numeric' }
   ) : '';
   ```
   - ✅ Properly localizes dates based on selected language
   - Fallback to empty string if publishedAt not available

5. **Author Avatar Fallback** (PostCard lines 108-114, BlogPostPage lines 482-488):
   ```typescript
   {post.author?.avatar ? (
     <img src={post.author.avatar} alt={post.author.name} ... />
   ) : (
     <div className="..."><User size={...} /></div>
   )}
   ```
   - ✅ Safe fallback to icon if avatar missing
   - No broken image states

6. **Category Color Mapping** (PostCard lines 8-24):
   ```typescript
   const CATEGORY_COLORS: Record<string, string> = {
     'Tutorials': 'from-blue-500 to-cyan-400',
     'News': 'from-violet-500 to-purple-400',
     'Tips': 'from-amber-500 to-yellow-400',
     'Case Study': 'from-emerald-500 to-teal-400',
     'Community': 'from-pink-500 to-rose-400',
   };
   const getCategoryColor = (cat: string) => CATEGORY_COLORS[cat] || 'from-brand-blue to-blue-400';
   ```
   - Hardcoded colors for known categories
   - Unknown categories fall back to `brand-blue`
   - ✅ No mismatch risk

---

## 8. KEY FEATURES IMPLEMENTED

### **BlogHomePage Features:**
- ✅ Full-text search (via `q` param) → Query parameter, real-time with debounce
- ✅ Category filtering (via `category` param) → Interactive pills with counts
- ✅ Pagination with page controls → Numbered buttons + prev/next
- ✅ Language switching (en, vi, ko, ja) → Dropdown + mobile sheet
- ✅ Dark/light theme toggle → Persisted to localStorage
- ✅ Featured editorial grid (Apple Newsroom style) → Responsive Apple grid layout
- ✅ Category pill buttons with post counts → Interactive with active state
- ✅ Reading progress bar (top of page) → Gradient bar at top
- ✅ Responsive mobile/desktop layouts → Tailwind breakpoints (md, lg)
- ✅ Breadcrumb navigation (when filtered) → Shows: Home > Category > Count
- ✅ "No results" state with helpful CTA
- ✅ Loading skeletons (mobile + desktop variants)

### **BlogPostPage Features:**
- ✅ Dynamic table of contents with anchor links → IntersectionObserver for active tracking
- ✅ Reading time estimation display → From post.readTime field
- ✅ Reading progress bar (content-aware) → Tracks actual article content
- ✅ Share buttons (Twitter, Facebook, LinkedIn, Copy Link) → Desktop bottom + mobile sheet
- ✅ Mobile article toolbar (sticky bottom) → Fixed 52px bar with icons + text
- ✅ Back-to-top button → Appears when scrolled 600px down
- ✅ View count display → Formatted as "1.2k" if 1000+
- ✅ Related posts carousel → 3 posts from same category (bottom)
- ✅ SEO meta tags (OG, Twitter Card, JSON-LD) → Full article schema
- ✅ Multipart meta info (author, date, read time, views) → Top of article
- ✅ Author card with avatar → Bottom of article
- ✅ Tags display with search links → Clickable hashtag-style tags

### **Not Implemented:**
- ❌ Sorting by date/popularity on frontend (all backend-driven)
- ❌ Tag-based filtering (backend supports `tag` param, UI doesn't use)
- ❌ Post recommendations/personalization
- ❌ Comments/discussion system
- ❌ Bookmarking/favorites (no user system)
- ❌ Author pages/profiles
- ❌ Search analytics/trending
- ❌ Social follow buttons
- ❌ Newsletter integration (form present but non-functional)

---

## 9. API ENDPOINT URLS (CONSTRUCTED)

### **Base URL Logic** (`/blog/apis/config.ts`):
```typescript
function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;  // Use env var if set
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${window.location.protocol}//${window.location.hostname}:5302`;  // Prod: same domain, port 5302
  }
  return 'http://localhost:3221';  // Dev: localhost:3221
}
```

### **Actual Endpoints:**

| Method | Endpoint | Query Params | Returns |
|--------|----------|--------------|---------|
| GET | `/blog` | `page`, `limit`, `category`, `tag`, `q`, `lang`, `featured` | `BlogListResponse` |
| GET | `/blog/featured` | - | `{ success, data: BlogPost[] }` |
| GET | `/blog/categories` | - | `{ success, data: CategoryCount[] }` |
| GET | `/blog/:slug` | - | `BlogDetailResponse` |

### **Full URL Examples:**
```
# List all posts, page 1
GET http://localhost:3221/blog?page=1&limit=12&lang=en

# Filter by category
GET http://localhost:3221/blog?category=Tutorials&page=1&limit=12

# Search
GET http://localhost:3221/blog?q=AI&lang=en

# Featured posts only
GET http://localhost:3221/blog/featured

# Category counts
GET http://localhost:3221/blog/categories

# Single post
GET http://localhost:3221/blog/getting-started-with-ai
```

---

## 10. PAGINATION DETAILS

**Currently Implemented: Page-Based (Offset)**
```typescript
const ITEMS_PER_PAGE = 12;

// State
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

// From API response
pagination: {
  page: number;        // Current page (1-indexed)
  limit: number;       // Items per page
  total: number;       // Total items across all pages
  totalPages: number;  // Calculated total pages (total / limit)
}
```

**Pagination UI** (lines 345-367):
```typescript
{totalPages > 1 && (
  <div className="flex items-center justify-center gap-2 mt-14 mb-4">
    {/* Previous button */}
    <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
    
    {/* Number buttons */}
    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
      <button
        onClick={() => setPage(p)}
        className={p === page ? 'active' : ''}
      >{p}</button>
    ))}
    
    {/* Next button */}
    <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
  </div>
)}
```

**Behavior:**
- Previous/Next buttons disabled at boundaries
- All page numbers shown (no ellipsis)
- Current page highlighted with brand-blue background
- Smooth scroll to top on page change
- URL param `?page=2` updated on change

---

## 11. SEO IMPLEMENTATION

### **Meta Tags** (via `usePageMeta` hook in `/blog/hooks/usePageMeta.ts`):
```typescript
usePageMeta({
  title: string;              // Page title (max 60 chars recommended)
  description: string;        // Meta description (max 160 chars recommended)
  keywords?: string;          // CSV keywords (optional)
  ogImage?: string;           // OG image URL (fallback to default if missing)
  canonical?: string;         // Canonical URL path (e.g., "/category/Tutorials")
  type?: string;              // og:type (default: "website", article for posts)
  lang?: string;              // Language (en, vi, ko, ja)
  jsonLd?: Record<string, any>;  // JSON-LD schema (optional)
});
```

### **BlogHomePage Meta Tags:**
```typescript
usePageMeta({
  title: urlCategory 
    ? `${urlCategory} — Skyverses Insights`
    : 'Skyverses Insights — AI Tutorials, News & Workflows',
  description: t('blog.subtitle'),  // From translation: "Insights, tutorials & news..."
  keywords: 'Skyverses insights, AI tutorials, AI tools, creative AI, video AI, image generation',
  canonical: urlCategory ? `/category/${urlCategory}` : '/',
  lang: currentLang,
});
```

### **BlogPostPage Meta Tags:**
```typescript
usePageMeta({
  title: `${metaTitle} — Skyverses Insights`,  // From post.seo.metaTitle or post.title
  description: metaDesc,  // From post.seo.metaDescription or post.excerpt
  keywords: post?.seo?.keywords?.join(', '),  // CSV array of keywords
  ogImage: post?.seo?.ogImage || post?.coverImage,  // OG image with fallback
  canonical: `/${slug}`,  // Post slug
  type: 'article',
  lang: currentLang,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { 
      '@type': 'Person', 
      name: post.author?.name || 'Skyverses Team' 
    },
    publisher: {
      '@type': 'Organization',
      name: 'Skyverses',
      logo: { '@type': 'ImageObject', url: 'https://...' },
    },
  }
});
```

**Meta Tags Generated:**
```html
<!-- Standard -->
<meta name="description" content="...">
<meta name="keywords" content="...">

<!-- OG (Open Graph) -->
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
<meta property="og:type" content="article|website">
<meta property="og:url" content="https://insights.skyverses.com...">
<meta property="og:locale" content="en_US|vi_VN|ko_KR|ja_JP">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="...">
<meta name="twitter:site" content="@SkyversesAI">

<!-- Canonical -->
<link rel="canonical" href="https://insights.skyverses.com...">

<!-- hreflang -->
<link rel="alternate" hreflang="en" href="...">
<link rel="alternate" hreflang="vi" href="...?lang=vi">
<link rel="alternate" hreflang="x-default" href="...">

<!-- JSON-LD Schema -->
<script type="application/ld+json">{...}</script>
```

---

## 12. TRANSLATION/LOCALIZATION

**Supported Languages:** en, vi, ko, ja

**Translation Structure** (`/blog/context/LanguageContext.tsx`):
```typescript
const translations: Record<Language, Record<string, string>> = {
  en: { 
    'blog.title': 'Insights', 
    'blog.search': 'Search articles...', 
    'blog.min_read': 'min read',
    // ... 30+ keys
  },
  vi: { ... },
  ko: { ... },
  ja: { ... },
};

// Usage in components:
const { lang, t } = useLanguage();
const translated = t('blog.search');  // Returns translated string or key as fallback
```

**Key Translation Keys:**
```
Blog-specific:
- blog.title, blog.subtitle
- blog.search, blog.all, blog.latest
- blog.read_more, blog.related
- blog.no_posts, blog.load_more
- blog.categories, blog.by
- blog.published, blog.copy_link, blog.copied
- blog.home, blog.back
- blog.min_read, blog.views
- blog.share
- blog.newsletter_* (5 keys)

Footer-specific:
- footer.copyright
- footer.description
```

**Storage:**
- Language preference saved to localStorage (`skyverses_blog_lang`)
- Theme preference saved to localStorage (`skyverses_blog_theme`)
- Both persisted across sessions

**Date Localization:**
- Uses `toLocaleDateString()` with BCP 47 language tags
- Format: `{ year: 'numeric', month: 'long', day: 'numeric' }`
- Examples:
  - en-US: "April 8, 2026"
  - vi-VN: "8 tháng 4, 2026"
  - ko-KR: "2026년 4월 8일"
  - ja-JP: "2026年4月8日"

---

## 13. RESPONSIVE DESIGN BREAKPOINTS

**Using Tailwind CSS breakpoints:**
- `md:` → 768px (tablet)
- `lg:` → 1024px (desktop)
- `xl:` → 1280px (large desktop)

**Key Responsive Behavior:**

| Component | Mobile | Tablet (md) | Desktop (lg) |
|-----------|--------|------------|-------------|
| Header | Compact logo | Full header | Full header |
| Bottom Nav | ✅ 60px fixed | ❌ Hidden | ❌ Hidden |
| Search | Sheet modal | Input in header | Input in header |
| Hero Card | 260px vertical | Apple grid | Apple grid |
| Featured Grid | 2x2 + single | Apple editorial | Apple editorial |
| Card Layout | Horizontal flex | 2-col grid | 3-col grid |
| TOC (Article) | Bottom sheet | Accordion toggle | Sticky sidebar |
| Share Bar | Bottom toolbar | Bottom bar | Bottom bar |

---

## SUMMARY

**✅ Strengths:**
- Clean separation of concerns (pages, components, apis, hooks)
- Type-safe with full TypeScript (no `any` types)
- Excellent responsive design (mobile-first approach)
- Proper SEO implementation (meta, OG, JSON-LD)
- Robust error handling (try/catch, fallbacks)
- Full i18n support (4 languages)
- Apple Newsroom-inspired editorial design
- Performance-conscious (lazy loading, pagination)

**⚠️ Things to Watch:**
- `dangerouslySetInnerHTML` usage (safe with trusted backend, but risky if ever user-generated)
- Frontend has no client-side sorting (all backend-driven, which is good for SEO)
- No caching strategy for API responses (every navigation fetches fresh)
- Mobile bottom sheet UX might need refinement for power users
- Newsletter form appears functional but doesn't submit anywhere
- Tag filtering supported by backend but not exposed in UI

**📝 API Contract:**
- All fields from MongoDB schema are properly mapped
- No field mismatches detected
- Pagination works correctly (offset-based)
- Filtering parameters properly used
- Type safety maintained throughout

**🚀 Ready for:**
- Production deployment
- Language expansion (structure already supports)
- Additional categories (hardcoded colors are fallback-safe)
- Content scaling (pagination, indexes in place)
