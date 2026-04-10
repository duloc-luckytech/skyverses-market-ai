# Audit Sources & References

## Files Examined

### Frontend (React/TypeScript)
1. **pages/CreditsPage.tsx** (525 lines)
   - Location: `/pages/CreditsPage.tsx`
   - Contains: Marketing claims, action cost ranges (lines 385-386, 445)
   - Fetches packages from API dynamically
   - Shows "Image AI: 100 – 17.5K" and "Video AI: 100 – 160K"

2. **components/CreditPurchaseModal.tsx** (794 lines)
   - Location: `/components/CreditPurchaseModal.tsx`
   - Contains: Payment flow, package display logic
   - Fetches packages via `creditsApi.getAdminPackages()`

3. **apis/credits.ts** (265 lines)
   - Location: `/apis/credits.ts`
   - Defines: CreditPackage interface, API endpoints
   - Key methods: `getAdminPackages()`, `claimWelcome()`, `claimDaily()`

4. **constants/market-config.tsx**
   - Location: `/constants/market-config.tsx`
   - Contains: HOME_BLOCK_OPTIONS (categories, not pricing)

5. **pages/PricingPage.tsx**
   - Location: `/pages/PricingPage.tsx`
   - Note: Redirects to `/credits` (CreditsPage is the actual pricing page)

### Backend (Node.js/MongoDB)
6. **skyverses-backend/src/models/CreditPackage.model.ts** (156 lines)
   - Location: `skyverses-backend/src/models/CreditPackage.model.ts`
   - Schema definition: Base credits, bonus %, bonus fixed, price, theme
   - Virtual field: `totalCredits` calculates final amount

7. **skyverses-backend/src/models/ModelPricingMatrix.model.ts** (90 lines)
   - Location: `skyverses-backend/src/models/ModelPricingMatrix.model.ts`
   - Defines pricing matrix structure for image/video models
   - Fields: basePricing, priceMultiplier, pricing

8. **skyverses-backend/src/utils/buildPricingMatrix.ts** (48 lines)
   - Location: `skyverses-backend/src/utils/buildPricingMatrix.ts`
   - Function: Builds pricing matrix from base params
   - Used to calculate per-resolution, per-duration costs

9. **skyverses-backend/src/routes/credit.router.ts** (831+ lines)
   - Location: `skyverses-backend/src/routes/credit.router.ts`
   - Contains: All credit endpoints (packages, purchase, top-up, consume)
   - Admin endpoints for CRUD operations on packages
   - Welcome credit: 1,000 CR
   - Daily credit: 100 CR

10. **skyverses-backend/dist/scripts/seedCreditPackages.js** (235 lines)
    - Location: `skyverses-backend/dist/scripts/seedCreditPackages.js` (compiled from TypeScript)
    - **KEY SOURCE**: Contains exact package definitions and seed data
    - Shows all 4 packages with full details and marketing claims

## Data Extraction

### Credit Packages (from seedCreditPackages.js)
```javascript
{
  code: "starter",
  credits: 5000,
  bonusPercent: 0,
  price: 4.99,
  // ... features, theme, etc.
}
// 3 more packages: creator, pro, ultimate
```

### Action Cost Ranges (from CreditsPage.tsx)
```jsx
{ name: 'Image AI', range: '100 – 17.5K', ... }
{ name: 'Video AI', range: '100 – 160K', ... }
```

### Bonus Calculations (from CreditPackage.model.ts)
```typescript
totalCredits = credits + (credits × bonusPercent ÷ 100) + bonusCredits
```

## Data Consistency

All three sources are consistent:
- **Backend seed data** defines the packages
- **Frontend CreditPackage interface** matches the schema
- **CreditsPage** displays them with action cost context
- **Credit router** manages CRUD and validation

## Conversion Rates Used

- **USD to VND**: 26,000 (hardcoded in both frontend and backend)
- **Located in**:
  - `pages/CreditsPage.tsx` line 17
  - `components/CreditPurchaseModal.tsx` line 17

## Special Constants

- **Welcome credit**: 1,000 CR (one-time, claimed via `POST /credits/claim-welcome`)
- **Daily credit**: 100 CR (daily, claimed via `POST /credits/claim-daily`)
- **Both located in**: `skyverses-backend/src/routes/credit.router.ts`

## Verification Method

1. Traced CreditsPage.tsx to identify where packages come from
2. Found API call: `creditsApi.getAdminPackages()`
3. Confirmed backend endpoint: `GET /credits/packages`
4. Located CreditPackage model and schema
5. Found seed script with exact package definitions
6. Verified bonus calculations against virtual field definition
7. Cross-referenced cost ranges shown in UI
8. Validated math: base + bonus = total

## Files NOT Found

- No individual action cost constants file (costs are stored in ModelPricingMatrix)
- No client-side cost lookup (all validation happens server-side)
- No published pricing API endpoint that breaks down model-by-model costs

---

**Audit Completed**: April 10, 2026
**Sources Verified**: 10 files across frontend + backend
**Data Consistency**: ✅ Verified (backend → frontend → display)
**Math Accuracy**: ✅ Verified (all calculations correct)
**Marketing Claims**: ⚠️ Partially verified (some claims overstated)

