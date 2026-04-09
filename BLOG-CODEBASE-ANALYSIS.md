# Blog Codebase Exploration Report

## Overview
This document provides a comprehensive analysis of the blog section implementation, including the blog page component, header implementation, logo functionality, navigation structure, and routing configuration.

---

## 1. Blog Page Component

### Location
- **Main Blog Home Page**: `blog/pages/BlogHomePage.tsx`
- **Blog Post Detail Page**: `blog/pages/BlogPostPage.tsx`
- **Search Page**: `blog/pages/SearchPage.tsx`

### BlogHomePage.tsx (Main Blog Page)
**File**: `blog/pages/BlogHomePage.tsx`

**Key Features**:
- **Apple Editorial-style Grid**: Displays featured posts in a professional layout
- **Hero Post**: Large featured post displayed prominently
- **Side Posts**: Up to 3 featured posts displayed alongside the hero
- **Category Filtering**: Browse posts by category (Tutorials, News, Tips, Case Study, Community)
- **Pagination**: Supports multiple pages of articles
- **Responsive Design**: Different layouts for desktop vs mobile
- **Reading Progress Bar**: Visual indicator of scroll progress
- **Skeleton Loading States**: Professional loading animation with shimmer effects

**Main Components**:
- `ReadingProgress`: Fixed position progress bar showing scroll position
- `HeroSkeleton`: Loading skeleton for the hero editorial section
- `CardSkeleton`: Loading skeleton for individual post cards
- `MobileCardSkeleton`: Mobile-specific loading skeleton
- `CategoryPillsSkeleton`: Loading skeleton for category filter pills
- `BlogHomePage`: Main component with pagination and filtering logic

**Category Meta Data** (with icons and colors):
```typescript
{
  'Tutorials': { icon: BookOpen, color: 'text-blue-500' },
  'News': { icon: Zap, color: 'text-violet-500' },
  'Tips': { icon: Sparkles, color: 'text-amber-500' },
  'Case Study': { icon: TrendingUp, color: 'text-emerald-500' },
  'Community': { icon: Users, color: 'text-pink-500' },
}
```

**State Management**:
- `posts`: Array of blog posts
- `featured`: Featured posts for hero section
- `categories`: Available categories with post counts
- `loading`: Loading state
- `activeCategory`: Currently selected category filter
- `page`: Current pagination page
- `totalPages`: Total number of pages

---

## 2. Header Component

### Location
**File**: `blog/components/BlogHeader.tsx`

### Structure & Features

#### Logo Implementation
```typescript
<Link to="/" className="flex items-center gap-2.5 shrink-0 group">
  <img
    src="https://ai.skyverses.com/assets/skyverses-logo.png"
    alt="Skyverses"
    className="w-7 h-7 object-contain group-hover:scale-110 transition-transform duration-200"
  />
  <div className="hidden sm:flex items-baseline gap-1">
    <span className="text-[15px] font-black tracking-tight text-slate-900 dark:text-white">
      Skyverses
    </span>
    <span className="text-[15px] font-black text-brand-blue">
      Insights
    </span>
  </div>
  {/* Mobile: show brand short */}
  <div className="flex sm:hidden items-baseline gap-1">
    <span className="text-[15px] font-black tracking-tight text-slate-900 dark:text-white">
      Insights
    </span>
  </div>
</Link>
```

**Logo Details**:
- **Image Source**: `https://ai.skyverses.com/assets/skyverses-logo.png`
- **Link Target**: `/` (Blog home page)
- **Responsive**: Shows "Skyverses Insights" on desktop/tablet, "Insights" on mobile
- **Hover Effect**: Logo scales up by 110% on hover
- **Logo Color**: Brand blue for "Insights" text, black/white for "Skyverses"

#### Navigation Links (Desktop)
The header contains a `NAV_LINKS` array:
```typescript
const NAV_LINKS = [
  { label: 'Articles', to: '/' },
  { label: 'Tutorials', to: '/category/Tutorials' },
  { label: 'News', to: '/category/News' },
];
```

**Note**: There is **NO "Articles" menu item in the main navigation** - instead there's an "Articles" link at the top level that goes to home (`/`).

#### Topics/Categories (Mobile Bottom Sheet)
Mobile users can access categories through a bottom sheet menu:
```typescript
const TOPICS = [
  { label: 'Tutorials', to: '/category/Tutorials' },
  { label: 'News & Updates', to: '/category/News' },
  { label: 'Tips & Tricks', to: '/category/Tips' },
  { label: 'Case Studies', to: '/category/Case Study' },
  { label: 'Community', to: '/category/Community' },
];
```

#### Header Features
1. **Search Functionality**
   - Desktop: Inline search input that appears on click
   - Mobile: Dedicated search page via `/search` route
   - Debounced search (400ms) that navigates to `/search?q=<query>`

2. **Language Switcher**
   - Desktop: Dropdown menu showing EN, VI, KO, JA flags
   - Mobile: Bottom sheet with language selection
   - Supported languages:
     - `en` - English (🇺🇸)
     - `vi` - Tiếng Việt (🇻🇳)
     - `ko` - 한국어 (🇰🇷)
     - `ja` - 日本語 (🇯🇵)

3. **Theme Toggle**
   - Dark/Light mode switch
   - Icon: Sun (light mode) / Moon (dark mode)

4. **CTA Button**
   - Desktop: "Try Skyverses AI" with sparkles icon
   - Mobile: Compact "Try AI" button
   - Links to: `https://ai.skyverses.com`

5. **Mobile Bottom Navigation Bar**
   - Fixed bottom navigation with 5 tabs:
     1. Home (/)
     2. Topics (/category/*)
     3. Search (/search)
     4. Language selection
     5. Theme toggle

### Header Styling
- **Scrolled State**: Border-bottom and shadow appear when scrolled
- **Base**: Semi-transparent with backdrop blur
- **Fixed Position**: `z-index: 150` (top header), `z-index: 145` (mobile sheets)
- **Responsive**: Different layouts for mobile (bottom nav) vs desktop

---

## 3. Routing Configuration

### Blog App Routes
**File**: `blog/App.tsx`

```typescript
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <ScrollToTop />
          <BlogHeader />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<BlogHomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/category/:category" element={<BlogHomePage />} />
              <Route path="/:slug" element={<BlogPostPage />} />
            </Routes>
          </main>
          <BlogFooter />
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
};
```

**Route Breakdown**:
| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | BlogHomePage | Display all articles with featured section |
| `/search` | SearchPage | Search results page |
| `/category/:category` | BlogHomePage | Filter articles by category |
| `/:slug` | BlogPostPage | Individual blog post detail page |

---

## 4. Main App (Market) Routing

### Location
**File**: `App.tsx` (main application)

**Important Note**: The blog section **is not integrated** into the main App.tsx routing. The blog is a separate application/subdomain.

**Main App Route Structure**:
- No blog routes found in the main `App.tsx`
- Blog appears to be hosted at a separate URL (e.g., `blog.skyverses.com` or `insights.skyverses.com`)

---

## 5. Header Component (Main App)

### Location
**File**: `components/Header.tsx`

### Logo Implementation in Main App
```typescript
<Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 shrink-0 mr-8">
  <img src={logoUrl} alt="Logo" className="w-7 h-7 object-contain" />
  <span className="text-base font-black tracking-tight text-black dark:text-white">
    Skyverses
  </span>
</Link>
```

**Logo Details (Main App)**:
- **Image Source**: `/assets/skyverses-logo.png` (local asset)
- **Link Target**: `/` (main app home)
- **Action**: Resets search, scrolls to top, navigates to home

### Navigation Items in Main App Header
The main app header does **NOT have an "Articles" menu item**. Navigation includes:
- Home
- Marketplace (`/markets`)
- Explore (dropdown with Explorer Gallery, AI Models, My Workspace)
- Insights (external link to `https://insights.skyverses.com`)
- Create (`/apps` - authenticated only)

---

## 6. Key Observations

### Blog Structure
1. **Separate Application**: The blog is a completely separate React application with its own routing
2. **No Main App Integration**: Blog routes are not in the main `App.tsx`
3. **Independent Header**: Blog uses `BlogHeader.tsx`, not the main `Header.tsx`
4. **External Link**: Main app links to blog via `insights.skyverses.com` (external URL)

### Logo Navigation
- **Blog Logo**: Links to `/` (blog home)
- **Main App Logo**: Links to `/` (main app home, resets search)
- **Scalable on Hover**: Logo scales 110% on hover in blog header

### Navigation Strategy
1. **Blog Navigation** is minimal (Articles, Tutorials, News)
2. **Main App Navigation** is comprehensive (Markets, Explore, Create, etc.)
3. **No Cross-Navigation**: Blog doesn't link back to main app features except via external URL

### Responsive Design
- **Desktop**: Horizontal navigation with dropdowns
- **Mobile Blog**: Bottom navigation bar with 5 main actions
- **Mobile Main App**: Hamburger menu drawer with all options

---

## 7. Search Implementation

### Blog Search
- **Route**: `/search?q=<query>`
- **Component**: `SearchPage.tsx`
- **Desktop**: Inline search input in header
- **Mobile**: Dedicated search page

### Main App Search
- **Command**: `⌘K` or `Ctrl+K`
- **Context**: Uses `SearchProvider` with search context
- **Desktop**: Search bar in header with keyboard shortcut indicator
- **Mobile**: Search button in mobile menu

---

## 8. File Structure Summary

```
project/
├── App.tsx                          # Main app routing (NO blog)
├── components/
│   └── Header.tsx                   # Main app header
├── blog/                            # Separate blog application
│   ├── App.tsx                      # Blog routing
│   ├── index.tsx                    # Blog entry point
│   ├── components/
│   │   ├── BlogHeader.tsx           # Blog header with logo
│   │   ├── BlogFooter.tsx
│   │   └── PostCard.tsx
│   ├── pages/
│   │   ├── BlogHomePage.tsx         # Home + category filtering
│   │   ├── BlogPostPage.tsx         # Individual post
│   │   └── SearchPage.tsx           # Search results
│   ├── context/
│   │   ├── ThemeContext.tsx
│   │   └── LanguageContext.tsx
│   ├── apis/
│   │   └── blog.ts
│   └── types.ts
├── pages/
│   └── [various product pages]      # Main app pages
└── components/
    └── [various components]         # Main app components
```

---

## 9. Key Links & References

### Logo Assets
- **Blog Logo**: `https://ai.skyverses.com/assets/skyverses-logo.png`
- **Main App Logo**: `/assets/skyverses-logo.png`

### External URLs
- **Insights Blog**: `https://insights.skyverses.com`
- **Main App**: `https://ai.skyverses.com` or similar
- **Support**: `https://skyverses.com/support`

### Routes Summary
**Blog Routes**:
- `/` - Home
- `/search?q=<query>` - Search results
- `/category/<name>` - Category filter
- `/<slug>` - Post detail

**Main App Routes** (selection):
- `/` - Market/Home
- `/markets` - Marketplace
- `/explorer` - Explorer gallery
- `/models` - AI models
- `/apps` - My workspace
- `/product/<slug>` - Product detail
- `/credits` - Credits management
- `/settings` - User settings
- `/login` - Login page

---

## Conclusion

The blog section is **completely separate** from the main application:
- Uses its own routing system
- Uses its own header component
- Has its own theme and language context
- Logo links to blog home (`/`)
- Main app links to blog via external URL `https://insights.skyverses.com`
- No "Articles" menu item in main app header (uses "Insights" as external link instead)
- No direct navigation between blog and main app (except via external link or logo)
