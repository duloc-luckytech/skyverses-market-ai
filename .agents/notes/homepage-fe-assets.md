# Homepage FE Asset Notes

Scope: main FE homepage sections after the top hero in `pages/MarketPage.tsx`, rendered mainly by `components/landing/HomepageV2Sections.tsx`.

## Current Decision

- Do not generate new AI assets for `Creator showcase`.
- Provider/logo marquee uses existing SVG logos and does not need AI-generated assets.
- `Why Skyverses` uses icon/stat cards and does not need image assets.
- CMS HomeBlocks/product rows are dynamic and should be counted separately as product thumbnails.

## Asset Count

Recommended section artwork batch: 17 static assets.

If product rows need a separate pass, prepare up to 8 product thumbnails per active HomeBlock.

## 17 Static Assets

1. `gold-tools-hero`
2. `gold-tools-script`
3. `gold-tools-image`
4. `gold-tools-video`
5. `gold-tools-marketing`
6. `tools-business-dashboard`
7. `tools-api-app-builder`
8. `build-apps-weeks-timeline`
9. `build-apps-cost-drop`
10. `build-apps-cross-platform-node`
11. `os-strip-cross-platform`
12. `teams-enterprise-workspace`
13. `gold-ent-build-app`
14. `gold-ent-deploy`
15. `gold-ent-maintain`
16. `gold-ent-consult`
17. `final-cta-unified-platform-bg`

## Section Breakdown

| Section | Asset count | Notes |
| --- | ---: | --- |
| Provider logo marquee | 0 | Existing SVG logos in `/assets/landing-logos/` |
| Tools / Marketplace capabilities | 7 | 1 featured hero card + 6 smaller cards |
| Creator showcase | 0 | Explicitly excluded from AI drawing scope |
| Build apps faster | 3 | Timeline, cost drop, cross-platform node |
| Cross-platform OS strip | 1 | Wide 16:9 banner |
| Enterprise teams workspace | 1 | Dashboard/workspace visual |
| Enterprise service cards | 4 | Build app, deploy, maintain, consult |
| Why Skyverses | 0 | Icon/stat cards only |
| CMS HomeBlocks / product rows | Dynamic | Product thumbnails, not section artwork |
| Final CTA | 1 | Unified platform background |
