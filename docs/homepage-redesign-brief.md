# Skyverses — Homepage Redesign Brief (for UI Mockup)

> **Goal:** Rebalance the homepage around **3 equal pillars** and remove the current over-weighting toward creator/image/video output. Today the page repeats "make images / make videos / many models" across multiple sections; Pillar 3 (build apps) is a single thin block. This brief restructures the page so a designer/AI can mock up the new UI.

---

## 0. The 3 Pillars (must feel BALANCED)

1. **Pillar 1 — AI tools for Creators** → image, video, music, voice generation (these are SUB-items, not the whole story).
2. **Pillar 2 — AI solutions for Businesses & Enterprises** → custom AI products, team accounts, deploy on your own infrastructure.
3. **Pillar 3 — Build mobile & desktop apps faster & cheaper** → AI-assisted development, ~70% cost savings, cross-platform / multi-OS output.

**Brand differentiators to surface across the page:** `50+ AI models` · `save up to ~70%` · `pay-as-you-go` · `no international card needed` · `deploy on your own infrastructure`.

---

## 1. Design System Tokens (keep consistent with current site)

| Token | Value | Use |
|-------|-------|-----|
| Gold (primary) | `#C9A84C` | accents, CTAs, labels, icons |
| Gold light | `#E5C767` | gradients/shimmer |
| Gold dark | `#B8963F` | gradient stops, hover |
| Dark surface | `#1a2330` | hero, dark sections |
| Near-black | `#0a0f1a` | footer, deepest cards |
| Light surface | `#ffffff` / `#fafbfc` | content sections |
| Text on dark | `#faf7f8` / `rgba(255,255,255,0.55)` for secondary |
| Text on light | `#1a2330` / `rgba(26,35,48,0.6)` secondary |
| Font — sans | **Manrope** | headings + body |
| Font — mono | **Fragment Mono** | small uppercase labels (e.g. "FOR BUSINESS") |
| Radius | 4px (Atlas cards), 16px (feature cards), 999px (pills) |
| Max width | 1300px content / 1440px footer; gutter 64px desktop, 20px mobile |

**Section header pattern (reused everywhere):** small uppercase mono label (gold) → large Manrope bold title → muted one-line description.

---

## 1b. Motion & Animation Language (IMPORTANT — animate generously)

> The site uses **framer-motion**. Animation is a first-class part of this redesign: every section should feel alive. Prioritize motion in the Pillar-3 blocks (Sections 5 & 6) since they carry the new story. Keep it premium and smooth — never janky or distracting. All motion must respect `prefers-reduced-motion` (fall back to instant/opacity-only).

**Global motion tokens**
| Token | Value |
|-------|-------|
| Easing (primary) | `cubic-bezier(0.22, 1, 0.36, 1)` (easeOutExpo-ish) |
| Easing (gentle) | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Duration — micro (hover) | 150–250ms |
| Duration — entrance | 500–700ms |
| Stagger between siblings | 80–120ms |
| Scroll trigger | reveal when ~20% in viewport, run once |
| Parallax depth | subtle, max ±20px |

**Reusable motion patterns (name them in the mockup so devs map to framer-motion):**
1. **`fade-up`** — opacity 0→1 + translateY 24px→0. Default entrance for headers, cards, paragraphs.
2. **`stagger-children`** — parent reveals, children `fade-up` in sequence (grids, tile rows, OS logos).
3. **`rotating-word`** — hero word swaps with vertical slide + blur-to-sharp (AnimatePresence), ~2.8s cycle.
4. **`count-up`** — numeric stats (70%, 50+, 5) animate from 0 → value when scrolled into view.
5. **`hover-lift`** — cards: translateY -4px + soft shadow + gold border glow on hover.
6. **`marquee`** — infinite horizontal loop (logos), pause on hover.
7. **`shimmer`** — gold gradient sweep across CTAs / accent bars (the footer gold bar already does this).
8. **`draw-line`** / **`icon-morph`** — line-icons draw on reveal (stroke-dashoffset) or morph subtly on hover.
9. **`parallax-float`** — background blobs / device mockups drift slowly on scroll or mouse-move.

---

## 2. Target Homepage Structure (new order)

| # | Section | Pillar | Status | Theme |
|---|---------|--------|--------|-------|
| 1 | Hero | 1+2+3 | **revise copy** | 3-pillar headline + rotating word |
| 2 | Trusted-by logo marquee | — | keep | AI model logos |
| 3 | Tools & Solutions overview (2×3 grid) | 1+2 | **rebalance** | 6 cards: content + business |
| 4 | Creator Showcase (TRIMMED) | 1 | **trim 4→2 galleries** | visual proof: image + video |
| 5 | **Build Faster with AI** ⭐ NEW BLOCK | 3 | **new / expand** | Faster · Cheaper · Cross-platform |
| 6 | **Cross-platform OS strip** ⭐ NEW | 3 | **new** | iOS · Android · Windows · macOS · Web |
| 7 | For Business & Teams | 2 | **un-hide + revise** | team accounts, infra, volume pricing |
| 8 | Enterprise / Custom AI products | 2+3 | keep + revise | build + deploy on your infra |
| 9 | Why Skyverses | 1+2+3 | **un-hide + revise** | 50+ models, save 70%, no intl card |
| 10 | HomeBlocks (CMS solution cards) | 1 | keep | product carousels |
| 11 | Final CTA | 1+2+3 | **revise** | one platform for all three |
| 12 | Footer | — | done | (already aligned) |

⭐ = the new/expanded Pillar-3 content the redesign is really about.

---

## 3. Section-by-Section Spec

### SECTION 1 — Hero
- **Layout:** full-height dark (`#1a2330`), centered. Large headline with one **rotating word** (animated swap every ~2.8s). Sub-headline below. Two CTAs (primary gold pill + secondary outline). Below: thin trust row ("50+ models · save ~70% · no international card").
- **Headline:** `One platform for Creators, Businesses & [App Builders]` — rotating word cycles: **Creators / Businesses / App Builders**.
- **Sub-headline:** `50+ AI models for creators and businesses. Build AI-powered apps in weeks, not months — at a fraction of the cost. Pay only for what you use. No international card needed.`
- **CTA primary:** `Start Free` → /markets. **CTA secondary:** `Talk to Us` → /booking.
- **Responsive:** stack CTAs vertically on mobile; reduce headline to ~32px.
- **🎬 Animation:** on load — headline `fade-up`, then sub-headline + CTAs stagger in. Rotating word uses `rotating-word` (slide+blur). Subtle `parallax-float` gold blobs / grid behind. Trust row counts up (`50+`, `~70%`). CTA primary has continuous slow `shimmer`. Optional: gentle mouse-parallax on hero background.

### SECTION 2 — Trusted-by Logo Marquee
- Keep as-is: infinite horizontal scroll of AI model/partner logos on dark bg. Pause on hover.
- **🎬 Animation:** `marquee` infinite loop; logos greyscale → gold/colored on hover; edge fade-mask both sides.

### SECTION 3 — Tools & Solutions Overview (2×3 grid + featured card)
- **Layout:** left tall **featured card** (dark `#0a0f1a`, image top, label/title/desc/CTA) + right **2 rows × 3 cards** grid (white cards, 16:10 image, title + short desc).
- **Rebalance the 6 cards** away from "all creator" → mix pillars:
  1. **Script & Copy AI** (content) — img: script
  2. **Image Generation** (content) — img: image
  3. **Video Generation** (content) — img: video
  4. **Marketing & Automation AI** (business) — img: marketing
  5. **Custom AI for Business** (business) — img: business/dashboard ⟵ *changed from "upscale"*
  6. **Build into Your App (API)** (app builders) — img: code/API ⟵ *changed from "3D"*
- **Featured card copy:** label `SKYVERSES` · title `AI solutions & tools for Creators, Business & Apps` · desc `50+ AI models for content creation, business automation, and faster app building — pay-as-you-go.` · CTA `Explore All Tools →`. *(Avoid "all-in-one platform / marketplace" framing — Skyverses is a solutions & tools provider, not a marketplace.)*
- **Header:** label `TOOLS & SOLUTIONS` · title `AI Tools & Solutions` · desc `50+ AI models for creators, teams, and app developers. One dashboard for content, automation, and custom AI.`
- **🎬 Animation:** header `fade-up`; the 6 cards reveal with `stagger-children` (left→right, top→bottom). Each card `hover-lift` + image subtle zoom (scale 1→1.04). Featured card image has a slow `parallax-float` / Ken-Burns drift.

### SECTION 4 — Creator Showcase (TRIM 4 galleries → 2)
- **Current:** 4 heavy galleries (Nano Banana images, Veo3 videos, Fashion images+videos, 3D models). **This is the main duplication.**
- **New:** keep only **2** as visual proof, side-by-side or stacked:
  - **AI Image Showcase** (Nano Banana grid, "X images · up to 4K", tags) → CTA `Generate Images`.
  - **AI Video Showcase** (Veo3 video grid) → CTA `Create Videos`.
  - **Move Fashion + 3D off homepage** → link `Browse the full gallery →` to `/explorer`.
- **Header:** label `FOR CREATORS` · title `AI image, video, music & voice — one creator platform`.
- **Design note:** this section should now be visually *lighter* than today (less vertical space) so it doesn't dominate.
- **🎬 Animation:** image grid tiles `stagger-children` fade-up as you scroll; hover = scale + gold ring. Video tiles autoplay-on-hover (muted loop) or play inline. Tags slide/fade in. Keep it tasteful — this is proof, not the centerpiece.

### SECTION 5 — Build Faster with AI ⭐ (Pillar 3 hero block — the core new content)
- **Layout:** white/`#fafbfc` section. Section header, then **3 large icon cards** in a row (stack on mobile). Each card: gold line-icon, bold title, 1–2 line desc, one **proof stat** in gold.
- **Header:** label `BUILD APPS` · title `Build mobile & desktop apps faster & cheaper.` · desc `Ship AI-powered apps in weeks, not months. Skyverses gives startups and teams 50+ AI models, pre-built components, and AI-assisted development.`
- **Card 1 — Faster:**
  - icon: rocket / lightning
  - title: `From Idea to App in Weeks`
  - desc: `AI-assisted development and pre-built components turn months of work into weeks.`
  - stat: `Ship in weeks, not months`
- **Card 2 — Cheaper:**
  - icon: coins / down-arrow
  - title: `Cut Costs by up to 70%`
  - desc: `Shared access to 50+ AI models, pay-as-you-go pricing, no international card needed.`
  - stat: `~70% lower engineering spend`
- **Card 3 — Cross-platform:**
  - icon: devices / layers
  - title: `One Build, Every Platform`
  - desc: `Ship to iOS, Android, Windows, macOS and Web from a single project — deploy on your own infrastructure.`
  - stat: `5 platforms, 1 codebase`
- **CTA (centered below cards):** gold pill `See How It Works` → /booking.
- **🎬 Animation (make this the most animated block):**
  - Header `fade-up`; 3 cards `stagger-children` reveal.
  - Each card icon uses `draw-line` on entrance (stroke draws in) and `icon-morph`/pulse on hover.
  - Stats (`~70%`, `weeks`, `5 platforms`) use `count-up` when scrolled into view.
  - **Card 1 (Faster):** a small progress/timeline that animates "months" collapsing to "weeks" (a shrinking bar).
  - **Card 2 (Cheaper):** a cost bar dropping ~70% (animated down) + count-up on the number.
  - **Card 3 (Cross-platform):** the 5 OS icons fan out / arrange around one central "codebase" node (light connecting lines draw in).
  - Cards `hover-lift` with gold border glow. CTA `shimmer`.

### SECTION 6 — Cross-platform OS Strip ⭐ NEW
- **Layout:** slim full-width band (light or subtle gradient). Centered caption + a horizontal row of 5 OS/platform logos (greyscale, gold on hover).
- **Caption:** `Build once, deploy everywhere` (mono label) — logos: **iOS · Android · Windows · macOS · Web**.
- **Purpose:** drive the "đa nền tảng / multi-OS" SEO keyword and give the designer a clean visual proof of Pillar 3.
- **🎬 Animation:** logos `stagger-children` pop/scale-in left→right; greyscale→color on hover. Optional hero motion: a single source node in the center emits animated lines/particles toward each OS logo (loops gently) to literally show "one build → every platform".

### SECTION 7 — For Business & Teams (un-hide + revise)
- **Layout:** light section. Left: header + 2 CTAs (`Contact Sales` / `Learn More`). Right or below: 3 feature tiles (Build with Latest Models / Enterprise-Grade Collaboration / Volume Pricing).
- **Header:** label `FOR BUSINESS` · title `Built for Teams & Businesses` · desc `Build custom AI solutions faster and cheaper. Deploy on your own infrastructure, collaborate with your team, and save ~70% vs. competing enterprise platforms.`
- **Tiles:** `Build with Latest Models` (50+ models, weekly updates) · `Enterprise-Grade Collaboration` (team accounts, roles, shared workspace) · `Volume Pricing` (pay-as-you-go that scales, commercial use included).
- **🎬 Animation:** header + CTAs `fade-up` from left, tiles `stagger-children` from right (or up). Tile icons `draw-line`; `hover-lift` on tiles. `50+` counts up.

### SECTION 8 — Enterprise / Custom AI Products (keep + revise)
- **Layout:** keep current enterprise layout (large cards). 
- **Header:** label `ENTERPRISE` · title `Custom AI products & mobile apps — build faster, deploy anywhere.` · desc `Skyverses builds custom AI products and ships mobile & desktop apps on your infrastructure — in weeks, not months, at a fraction of typical cost. Full control, full security, full support.`
- **🎬 Animation:** large cards `fade-up` with `stagger-children`; subtle parallax on card imagery; `hover-lift`.

### SECTION 9 — Why Skyverses (un-hide + revise)
- **Layout:** header + 3–4 benefit tiles with icons.
- **Header:** title `Why Skyverses?` · desc `50+ AI models for creators, businesses & app builders. One dashboard, no international card needed, save up to 70% vs standalone tools.`
- **Tiles:** `50+ Models, Weekly Updates` · `Pay Only for What You Use` · `Deploy Anywhere` · `No International Card Needed`.
- **🎬 Animation:** tiles `stagger-children` fade-up; icons `draw-line`; `50+` and `70%` `count-up`.

### SECTION 10 — HomeBlocks (CMS solution carousels)
- Keep as-is (CMS-driven). Horizontal scroll of solution cards with "View All".
- **🎬 Animation:** cards drag/auto-scroll carousel; `hover-lift` on each card; arrows fade in on hover.

### SECTION 11 — Final CTA
- **Layout:** dark band (`#1a2330`), centered heading + single primary CTA.
- **Heading:** `50+ AI models, one unified platform. For creators, teams, and builders — save up to 70% on AI.`
- **CTA:** `Get Started` → /markets (plus small secondary `Talk to Sales` → /booking).
- **🎬 Animation:** heading `fade-up` on scroll; animated gold gradient/shimmer background sweep; CTA pulse + `shimmer`; optional slow-drifting particles.

---

## 4. What changes vs. today (for the designer)

- **Removed/trimmed:** 2 of 4 creator showcase galleries (Fashion, 3D) → moved to /explorer.
- **Rebalanced:** Tools grid cards 5 & 6 shift from creator (upscale/3D) → business + API.
- **New & expanded:** Section 5 (Build Faster with AI, 3 icon cards) + Section 6 (OS strip) carry Pillar 3.
- **Un-hidden + rewritten:** For Business & Teams, Why Skyverses.
- **Copy refresh:** Hero, Featured card, Enterprise, Final CTA.

## 5. Tone & visual guidance
- Premium, restrained: black + gold + white. Lots of whitespace.
- Headlines confident and benefit-led; avoid hype words ("playground", "ultimate", unverified percentages other than ~70%).
- Keep imagery balanced: not every image should be a generated photo/video — include UI/dashboard/code/device visuals to represent Pillars 2 & 3.
- Mobile-first: every multi-column grid stacks to 1 column; CTAs full-width pills.
- **Motion is required, not optional:** every section animates on scroll-reveal; Pillar-3 blocks (5 & 6) get the richest motion (timeline/cost-bar/cross-platform diagrams). Keep it smooth (framer-motion, easing tokens above) and respect `prefers-reduced-motion`.

---

*Deliverable requested: UI mockups for sections 1–11 in the order above, desktop + mobile. Where possible, deliver **animated / motion mockups** (or annotate each section with its entrance + hover + scroll animations per the 🎬 notes and the Motion Language in §1b).*
