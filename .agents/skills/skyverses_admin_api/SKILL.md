---
name: skyverses_admin_api
description: >
  Skyverses Admin API access — credentials, endpoints, and scripts for managing
  MarketItem products via the live API. Read this whenever you need to add,
  update, or manage marketplace products programmatically.
---

# Skyverses Admin API — Reference

## API Config

| Key | Value |
|-----|-------|
| **Base URL** | `https://api.skyverses.com` |
| **Auth** | Bearer token (JWT) |
| **Token** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3ODY1NzYsImV4cCI6MTc3NjM5MTM3Nn0.ygWEBUIc4oB9iGs5AhdtX5zjyTDATQNJmYNxqqmpBBI` |
| **Header** | `Authorization: Bearer <token>` |

> ⚠️ Token expires — if calls return 401, generate a new token via `/auth/login`.

## Market API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/market` | List all items (supports `?q=`, `?category=`, `?isActive=`, `?status=`) |
| `GET` | `/market/random/featured` | Get 5 featured items |
| `GET` | `/market/:slug` | Get item by slug |
| `POST` | `/market` | **Create** new item (admin) |
| `PUT` | `/market/:id` | **Update** item by MongoDB `_id` (admin) |
| `DELETE` | `/market/:id` | Delete item (admin) |
| `POST` | `/market/:id/status` | Toggle status field |
| `POST` | `/market/:id/active` | Toggle `isActive` boolean |

## MarketItem Schema

```typescript
{
  slug: string;           // URL slug, must match /product/<slug> route
  name: { en, vi?, ko?, ja? };
  category: { en, vi?, ko?, ja? };
  description: { en, vi?, ko?, ja? };
  imageUrl: string;       // thumbnail image URL
  demoType?: string;      // 'image' | 'video' | 'interactive'
  homeBlocks: string[];   // which homepage sections to show in (see below)
  tags: string[];
  models?: string[];
  industries?: string[];
  features?: { en, vi? }[];
  neuralStack?: { name, version?, capability: { en, vi? } }[];
  complexity?: string;    // 'beginner' | 'intermediate' | 'advanced'
  priceCredits?: number;
  isFree?: boolean;
  isActive: boolean;      // must be true to appear in listings
  status: string;         // must be 'active' to appear in listings
  featured?: boolean;
  order?: number;         // sort order (lower = first)
}
```

## homeBlocks Values (from `constants/market-config.tsx`)

| id | Label | Section on homepage |
|----|-------|---------------------|
| `top-choice` | Top Choice | 🔥 Top Choice |
| `top-image` | Image Studio | 🖼 Image Studio |
| `top-video` | Video Studio | 🎬 Video Studio |
| `top-ai-agent` | AI Agent Workflow | 🤖 AI Agent Workflow |
| `events` | Lễ hội & Sự kiện | 🎁 Lễ hội & Sự kiện |
| `app-other` | App khác | ✅ Ứng dụng khác |

## Add/Update Product Script

Script location: `scripts/add-market-product.ts`

```bash
# List available products in catalog
npx ts-node scripts/add-market-product.ts --list

# Dry run (no API call, just shows payload)
npx ts-node scripts/add-market-product.ts --slug ai-slide-creator --dry-run

# Add/update specific product
npx ts-node scripts/add-market-product.ts --slug ai-slide-creator

# Add/update ALL products in catalog
npx ts-node scripts/add-market-product.ts
```

### How the script works:
1. GET `/market/:slug` — check if item exists
2. If exists → PUT `/market/:id` (update)
3. If not → POST `/market` (create)

### To add a new product:
1. Open `scripts/add-market-product.ts`
2. Add an entry to the `PRODUCTS` map following the existing pattern
3. Run `npx ts-node scripts/add-market-product.ts --slug <new-slug>`

## Quick curl Examples

```bash
# List all active items
curl "https://api.skyverses.com/market?isActive=true" \
  -H "Authorization: Bearer <TOKEN>"

# Create item
curl -X POST "https://api.skyverses.com/market" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"slug":"my-product","name":{"en":"My Product"},...}'

# Update item
curl -X PUT "https://api.skyverses.com/market/<MONGO_ID>" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"homeBlocks":["app-other"],"isActive":true}'

# Toggle active
curl -X POST "https://api.skyverses.com/market/<MONGO_ID>/active" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"isActive":true}'
```
