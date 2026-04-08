import express from "express";
import BlogPost from "../models/BlogPost.model";
import { authenticate } from "./auth";

const router = express.Router();

/* =====================================================
   PRESET CREATORS — 5 seeded authors for blog posts
===================================================== */
export const PRESET_CREATORS = [
  {
    name: "Alex Morgan",
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=AlexMorgan&backgroundColor=b6e3f4",
    role: "AI Content Strategist",
  },
  {
    name: "Skyverses Team",
    avatar: "https://framerusercontent.com/images/EIgpJkAezmTH65ZZbHE7BDbzD60.png",
    role: "Official Editor",
  },
  {
    name: "Jordan Lee",
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=JordanLee&backgroundColor=ffd5dc",
    role: "Creative AI Writer",
  },
  {
    name: "David Kim",
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=DavidKim&backgroundColor=d1f4cc",
    role: "Tech Researcher",
  },
  {
    name: "Sophia Chen",
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=SophiaChen&backgroundColor=ffefd5",
    role: "AI Product Reviewer",
  },
];

const getRandomCreator = () =>
  PRESET_CREATORS[Math.floor(Math.random() * PRESET_CREATORS.length)];

/* =====================================================
   PUBLIC — LIST PUBLISHED POSTS
   GET /blog?page=1&limit=10&category=tutorials&tag=ai&q=search&lang=en
===================================================== */
router.get("/", async (req, res) => {
  try {
    const {
      page = "1",
      limit = "12",
      category,
      tag,
      q,
      lang = "en",
      featured,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { isPublished: true };

    // Category filter
    if (category) {
      filter.category = { $regex: new RegExp(category as string, "i") };
    }

    // Tag filter
    if (tag) {
      filter.tags = { $regex: new RegExp(tag as string, "i") };
    }

    // Featured filter
    if (featured === "true") {
      filter.isFeatured = true;
    }

    // Keyword search
    if (q) {
      const keyword = decodeURIComponent((q as string).replace(/\+/g, " ")).trim();
      const regex = new RegExp(keyword, "i");
      filter.$or = [
        { [`title.${lang}`]: regex },
        { [`excerpt.${lang}`]: regex },
        { [`content.${lang}`]: regex },
        { tags: regex },
      ];
    }

    const [items, total] = await Promise.all([
      BlogPost.find(filter)
        .select("-content") // Don't send full content in list
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BlogPost.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    console.error("[Blog List]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   PUBLIC — OG META PRERENDER (for social bots)
   GET /blog/meta/:slug
   Dùng để Nginx redirect bot (Facebook, Twitter, Zalo...)
   đến endpoint này thay vì serve SPA → bot đọc đúng meta tags
===================================================== */
const BOT_META_HTML = (post: any, lang: string = "en") => {
  const title = post.title?.[lang] || post.title?.en || "Skyverses Insights";
  const description = post.seo?.metaDescription?.[lang] || post.seo?.metaDescription?.en
    || post.excerpt?.[lang] || post.excerpt?.en || "";
  const ogImage = post.seo?.ogImage?.trim() || post.coverImage?.trim()
    || "https://ai.skyverses.com/assets/seo/seo-og-thumbnail-v2.png";
  const url = `https://insights.skyverses.com/${post.slug}`;
  const metaTitle = post.seo?.metaTitle?.[lang] || post.seo?.metaTitle?.en || title;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${metaTitle} — Skyverses Insights</title>
  <meta name="description" content="${description.replace(/"/g, "&quot;")}"/>
  <meta property="og:title" content="${metaTitle.replace(/"/g, "&quot;")}"/>
  <meta property="og:description" content="${description.replace(/"/g, "&quot;")}"/>
  <meta property="og:image" content="${ogImage}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:url" content="${url}"/>
  <meta property="og:type" content="article"/>
  <meta property="og:site_name" content="Skyverses Insights"/>
  <meta property="fb:app_id" content="966242223397198"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${metaTitle.replace(/"/g, "&quot;")}"/>
  <meta name="twitter:description" content="${description.replace(/"/g, "&quot;")}"/>
  <meta name="twitter:image" content="${ogImage}"/>
  <meta name="twitter:site" content="@SkyversesAI"/>
  <link rel="canonical" href="${url}"/>
  <script>window.location.replace("${url}");</script>
</head>
<body></body>
</html>`;
};

router.get("/meta/:slug", async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, isPublished: true })
      .select("slug title excerpt seo coverImage")
      .lean();

    if (!post) return res.status(404).send("Not found");

    const lang = (req.query.lang as string) || "en";
    res.set("Content-Type", "text/html; charset=utf-8");
    res.set("Cache-Control", "public, max-age=3600");
    return res.send(BOT_META_HTML(post, lang));
  } catch (err: any) {
    return res.status(500).send("Error");
  }
});



/* =====================================================
   PUBLIC — SITEMAP XML
   GET /blog/sitemap.xml
   Trả về XML với tất cả published posts + hreflang EN/VI
===================================================== */
router.get("/sitemap.xml", async (_req, res) => {
  try {
    const BASE = "https://insights.skyverses.com";

    const posts = await BlogPost.find({ isPublished: true })
      .select("slug updatedAt publishedAt title")
      .sort({ publishedAt: -1 })
      .lean();

    // Escape special XML characters to prevent parse errors
    const xmlEscape = (str: string) =>
      str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    const staticPages = [
      { url: `${BASE}`, priority: "1.0", changefreq: "daily" },
      { url: `${BASE}/category/Tutorials`, priority: "0.8", changefreq: "weekly" },
      { url: `${BASE}/category/News`, priority: "0.8", changefreq: "weekly" },
      { url: `${BASE}/category/Tips%20%26%20Tricks`, priority: "0.7", changefreq: "weekly" },
      { url: `${BASE}/category/Case%20Studies`, priority: "0.7", changefreq: "weekly" },
    ];

    const urlSet = [
      // Static pages
      ...staticPages.map(p => `
  <url>
    <loc>${xmlEscape(p.url)}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(p.url)}"/>
    <xhtml:link rel="alternate" hreflang="vi" href="${xmlEscape(p.url)}?lang=vi"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(p.url)}"/>
  </url>`),
      // Blog posts
      ...posts.map(post => {
        const lastmod = (post.updatedAt || post.publishedAt || new Date()).toISOString().split("T")[0];
        const postUrl = xmlEscape(`${BASE}/${post.slug}`);
        return `
  <url>
    <loc>${postUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${postUrl}"/>
    <xhtml:link rel="alternate" hreflang="vi" href="${postUrl}?lang=vi"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${postUrl}"/>
  </url>`;
      }),
    ].join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlSet}
</urlset>`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=3600"); // cache 1h
    return res.send(xml);
  } catch (err: any) {
    console.error("[Blog Sitemap]", err);
    return res.status(500).send("<?xml version=\"1.0\"?><error>Internal error</error>");
  }
});

/* =====================================================
   PUBLIC — ROBOTS.TXT (fallback nếu static file không serve được)
   GET /blog/robots-check
===================================================== */

/* =====================================================
   PUBLIC — GET FEATURED POSTS
   GET /blog/featured
===================================================== */
router.get("/featured", async (_req, res) => {
  try {
    const items = await BlogPost.find({ isPublished: true, isFeatured: true })
      .select("-content")
      .sort({ order: 1, publishedAt: -1 })
      .limit(5)
      .lean();

    res.json({ success: true, data: items });
  } catch (err: any) {
    console.error("[Blog Featured]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   PUBLIC — GET CATEGORIES WITH COUNT
   GET /blog/categories
===================================================== */
router.get("/categories", async (_req, res) => {
  try {
    const result = await BlogPost.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: result.map((r) => ({ category: r._id, count: r.count })),
    });
  } catch (err: any) {
    console.error("[Blog Categories]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   PUBLIC — GET PRESET CREATORS
   GET /blog/creators
===================================================== */
router.get("/creators", (_req, res) => {
  res.json({ success: true, data: PRESET_CREATORS });
});

/* =====================================================
   PUBLIC — GET SINGLE POST BY SLUG
   GET /blog/:slug
===================================================== */
router.get("/:slug", async (req, res) => {
  try {
    const post = await BlogPost.findOne({
      slug: req.params.slug,
      isPublished: true,
    });

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Increment view count (fire-and-forget)
    BlogPost.updateOne(
      { _id: post._id },
      { $inc: { viewCount: 1 } }
    ).catch(() => {});

    res.json({ success: true, data: post });
  } catch (err: any) {
    console.error("[Blog Detail]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — LIST ALL POSTS (including drafts)
   GET /blog/admin/all
===================================================== */
router.get("/admin/all", authenticate, async (req: any, res) => {
  try {
    const items = await BlogPost.find()
      .select("-content")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: items, total: items.length });
  } catch (err: any) {
    console.error("[Blog Admin List]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — GET SINGLE POST BY ID (for editing, includes drafts)
   GET /blog/admin/:id
===================================================== */
router.get("/admin/:id", authenticate, async (req: any, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    res.json({ success: true, data: post });
  } catch (err: any) {
    console.error("[Blog Admin Detail]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — CREATE POST
   POST /blog
===================================================== */
router.post("/", authenticate, async (req: any, res) => {
  try {
    const body = { ...req.body };

    // Always auto-assign a random creator (server-side, not overridable by caller)
    body.author = getRandomCreator();

    // Auto-set publishedAt if publishing now
    if (body.isPublished && !body.publishedAt) {
      body.publishedAt = new Date();
    }

    const post = await BlogPost.create(body);
    res.json({ success: true, data: post });
  } catch (err: any) {
    console.error("[Blog Create]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — UPDATE POST
   PUT /blog/:id
===================================================== */
router.put("/:id", authenticate, async (req: any, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    res.json({ success: true, data: post });
  } catch (err: any) {
    console.error("[Blog Update]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — BULK DELETE POSTS
   DELETE /blog/bulk  { ids: string[] }
   ⚠️ Must be registered BEFORE DELETE /:id to avoid route conflict
===================================================== */
router.delete("/bulk", authenticate, async (req: any, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids is required" });
    }
    const result = await BlogPost.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (err: any) {
    console.error("[Blog Bulk Delete]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — DELETE POST
   DELETE /blog/:id
===================================================== */
router.delete("/:id", authenticate, async (req: any, res) => {
  try {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    console.error("[Blog Delete]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — QUICK TOGGLE FEATURED
   PATCH /blog/:id/featured  { isFeatured: boolean }
===================================================== */
router.patch("/:id/featured", authenticate, async (req: any, res) => {
  try {
    const { isFeatured } = req.body;
    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { isFeatured: !!isFeatured },
      { new: true }
    );
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    res.json({ success: true, data: post });
  } catch (err: any) {
    console.error("[Blog Featured Toggle]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — BULK REORDER POSTS
   POST /blog/reorder  { orders: Array<{ id: string; order: number }> }
===================================================== */
router.post("/reorder", authenticate, async (req: any, res) => {
  try {
    const { orders } = req.body;
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ success: false, message: "orders is required" });
    }
    await Promise.all(
      orders.map(({ id, order }: { id: string; order: number }) =>
        BlogPost.findByIdAndUpdate(id, { order })
      )
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error("[Blog Reorder]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADMIN — TOGGLE PUBLISH STATUS
   POST /blog/:id/publish
===================================================== */

/** Fire-and-forget ping to Google & Bing when sitemap updates */
async function pingSitemapIndexers(slug?: string) {
  const SITEMAP = "https://insights.skyverses.com/sitemap.xml";
  const POST_URL = slug ? `https://insights.skyverses.com/${slug}` : null;

  const pings = [
    // Google sitemap ping
    `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`,
    // Bing sitemap ping
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`,
  ];

  for (const url of pings) {
    fetch(url, { method: "GET" })
      .then(() => console.log(`🔔 [SEO] Pinged: ${url}`))
      .catch((err) => console.warn(`⚠️ [SEO] Ping failed: ${url}`, err.message));
  }

  if (POST_URL) {
    console.log(`🔔 [SEO] New post published: ${POST_URL}`);
  }
}

router.post("/:id/publish", authenticate, async (req: any, res) => {
  try {
    const { isPublished } = req.body;
    const update: any = { isPublished };

    let isFirstPublish = false;

    // Set publishedAt when first published
    if (isPublished) {
      const existing = await BlogPost.findById(req.params.id);
      if (existing && !existing.publishedAt) {
        update.publishedAt = new Date();
        isFirstPublish = true;
      }
    }

    const post = await BlogPost.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    res.json({ success: true, data: post });

    // ─── Auto-featured pool management (fire-and-forget) ───────────
    // Only on first publish: add new post to featured, keep pool at max 4
    if (isPublished && isFirstPublish && post) {
      (async () => {
        const FEATURED_POOL = 4;
        try {
          // 1. Set new post as featured
          await BlogPost.findByIdAndUpdate(post._id, { isFeatured: true });

          // 2. Count current featured posts (excluding the new one)
          const featured = await BlogPost.find({
            isFeatured: true,
            _id: { $ne: post._id },
            isPublished: true,
          })
            .sort({ publishedAt: 1 }) // oldest first
            .select("_id title publishedAt")
            .lean();

          // 3. If over limit → remove oldest featured posts
          const overflow = featured.length - (FEATURED_POOL - 1); // -1 because new post already featured
          if (overflow > 0) {
            const toRemove = featured.slice(0, overflow).map((p: any) => p._id);
            await BlogPost.updateMany(
              { _id: { $in: toRemove } },
              { $set: { isFeatured: false } }
            );
            console.log(
              `⭐ [Featured] Removed ${overflow} old featured post(s), kept pool at ${FEATURED_POOL}`
            );
          }

          console.log(`⭐ [Featured] "${post.title?.en}" added to featured pool`);
        } catch (err) {
          console.error("⚠️ [Featured] Auto-manage error:", err);
        }
      })();
    }

    // Auto-ping Google + Bing sitemap (fire-and-forget, only on first publish)
    if (isPublished && isFirstPublish && post?.slug) {
      pingSitemapIndexers(post.slug);
    }
  } catch (err: any) {
    console.error("[Blog Publish]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
