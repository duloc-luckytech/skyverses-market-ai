# Credits Pricing System - Quick Reference

## 📊 Package Summary

```
┌─────────┬─────────┬─────────┬────────┬───────────┐
│ Package │ Credits │  Total  │ Price  │ $/1K CR  │
├─────────┼─────────┼─────────┼────────┼───────────┤
│ Starter │ 5,000   │ 5,000   │ $4.99  │ $0.00099 │
│ Creator │ 25,000  │ 27,500  │ $14.99 │ $0.00055 │
│ Pro     │ 60,000  │ 72,000  │ $29.99 │ $0.00042 │
│ Ultimate│ 180,000 │ 244,000 │ $69.99 │ $0.00029 │
└─────────┴─────────┴─────────┴────────┴───────────┘
```

## 💰 Action Costs (Credits)

### Image Generation
- **Min**: 100 CR (basic, low-res)
- **Mid**: 1,500-2,000 CR (standard quality)
- **Max**: 17,500 CR (premium, high-res)

### Video Generation
- **Min**: 100 CR (basic, short)
- **Mid**: 2,000-3,000 CR (standard)
- **High**: 15,000-20,000 CR (Kling/VEO)
- **Max**: 160,000 CR (extended, high-res)

## ✅ What Works
- ✅ Bonus math is accurate
- ✅ Price progression is logical
- ✅ Bulk discount scaling (50-71% cheaper at higher tiers)
- ✅ Competitive vs. Midjourney/Runway

## ⚠️ Issues Found

### Critical
1. **Sora claims impossible** - Creator says "~1-2 video Sora" but Sora likely costs 30K+/video
2. **Kling claims overstated** - Pro claims "~2-5 Kling" but 72K ÷ 15K = only ~4.8 max
3. **Ranges too vague** - "~5-50 images" doesn't tell users which models

### Medium
1. **No model pricing shown** on package cards
2. **FAQ says "details before creation"** ✅ but no reference table visible
3. **Inconsistent language** - sometimes "~5-50", sometimes "5-50"

### Low
1. **Discount wording** - "50% off" when really comparing to inflated "original price"

## 🔧 Recommended Fixes

### Quick Wins (1-2 hours)
```markdown
1. Update Creator: Remove "~1-2 video Sora" claim
2. Update Pro: Change "~2-5 Kling 3.0" to "~5-10 standard videos"
3. Update Ultimate: More realistic Kling/Sora numbers
4. Add asterisk: "Video costs vary by model (100 CR - 160K CR)"
```

### Medium (2-4 hours)
```markdown
1. Create reference card in FAQ:
   "WAN 2.2: 2K-3K CR/video (most affordable)
    Kling 3.0: 15K-20K CR/video (cinema quality)
    VEO 3.1: varies by duration"

2. Add disclaimer to each package:
   "Examples calculated at standard quality.
    Actual costs depend on model and settings."
```

### Comprehensive (4+ hours)
```markdown
1. Map all models to actual backend pricing matrix
2. Create pricing simulator (input model → show cost)
3. Update dashboard to show cost preview before generation
4. Document pricing in API docs
```

## 📈 Math Verification

### Starter ($4.99 for 5K CR)
- 5 standard images @ 1K each ✅
- 10 cheap videos @ 500 each ✅
- 50 ultra-cheap videos @ 100 each ✅

### Creator ($14.99 for 27.5K CR)
- 14-18 standard images @ 1.5-2K ✅
- 9-14 videos @ 2-3K ✅
- NOT 1-2 Sora videos ❌

### Pro ($29.99 for 72K CR)
- 36-48 standard images ✅
- 24-36 videos @ 2-3K ✅
- ~4 Kling videos @ 18K ✅ (not "2-5" - too optimistic)

### Ultimate ($69.99 for 244K CR)
- 120-160 images ✅
- ~12 Kling videos @ 20K ✅ (not "8-18" - too optimistic)

## 🎯 Action Items

- [ ] Verify backend pricing matrix with all model costs
- [ ] Update seed data with realistic model claims
- [ ] Add model cost reference to CreditsPage
- [ ] Update FAQ section with cost breakdown
- [ ] Remove impossible premium video claims
- [ ] Test: User should understand price before generation

---
**Severity**: 🟡 Medium (marketing accuracy issue, not breaking)
**Impact**: Customer trust, support ticket reduction
**Priority**: Before next marketing campaign
