import "dotenv/config";
import mongoose from "mongoose";
import * as crypto from "crypto";
import User from "../models/UserModel";
import PromptSet from "../models/PromptSet.model";
import PromptPurchase from "../models/PromptPurchase.model";
import PromptReview from "../models/PromptReview.model";
import PromptWishlist from "../models/PromptWishlist.model";
import SellerFollower from "../models/SellerFollower.model";
import SkyTokenTransaction from "../models/SkyTokenTransaction.model";

/* ─── helpers ─── */
const slugify = (t: string) =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "d")
    .replace(/[^a-zA-Z0-9\s]/g, " ").replace(/\s+/g, "-").trim().toLowerCase();

const code = () => crypto.randomBytes(4).toString("hex");
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/* ─── Hardcoded Cloudflare Image/Video URLs ─── */
const CF_IMG = "https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/pm-market";
const CF_STREAM = "https://customer-xq04fu0u3x.cloudflarestream.com";

const coverUrls: Record<string, string> = {
  "pm-01-product-photo": `${CF_IMG}/pm-01-product-photo/public`,
  "pm-02-food-editorial": `${CF_IMG}/pm-02-food-editorial/public`,
  "pm-03-interior-design": `${CF_IMG}/pm-03-interior-design/public`,
  "pm-04-fashion-editorial": `${CF_IMG}/pm-04-fashion-editorial/public`,
  "pm-05-logo-design": `${CF_IMG}/pm-05-logo-design/public`,
  "pm-06-character-design": `${CF_IMG}/pm-06-character-design/public`,
  "pm-07-architecture": `${CF_IMG}/pm-07-architecture/public`,
  "pm-08-jewelry": `${CF_IMG}/pm-08-jewelry/public`,
  "pm-09-social-media": `${CF_IMG}/pm-09-social-media/public`,
  "pm-10-pod-designs": `${CF_IMG}/pm-10-pod-designs/public`,
  "pm-11-ad-creative": `${CF_IMG}/pm-11-ad-creative/public`,
  "pm-12-packaging": `${CF_IMG}/pm-12-packaging/public`,
  "pm-13-real-estate": `${CF_IMG}/pm-13-real-estate/public`,
  "pm-14-cinematic": `${CF_IMG}/pm-14-cinematic/public`,
  "pm-15-fantasy-art": `${CF_IMG}/pm-15-fantasy-art/public`,
  "pm-16-scifi-world": `${CF_IMG}/pm-16-scifi-world/public`,
  "pm-17-portrait": `${CF_IMG}/pm-17-portrait/public`,
  "pm-18-automotive": `${CF_IMG}/pm-18-automotive/public`,
  "pm-19-anime-art": `${CF_IMG}/pm-19-anime-art/public`,
  "pm-20-landscape": `${CF_IMG}/pm-20-landscape/public`,
  "pm-21-abstract-art": `${CF_IMG}/pm-21-abstract-art/public`,
  "pm-22-childrens-book": `${CF_IMG}/pm-22-childrens-book/public`,
  "pm-23-pet-portrait": `${CF_IMG}/pm-23-pet-portrait/public`,
  "pm-24-vintage-retro": `${CF_IMG}/pm-24-vintage-retro/public`,
  "pm-25-3d-mockup": `${CF_IMG}/pm-25-3d-mockup/public`,
  "pm-26-drone-aerial": `${CF_IMG}/pm-26-drone-aerial/public`,
  "pm-27-cyberpunk-neon": `${CF_IMG}/pm-27-cyberpunk-neon/public`,
  "pm-28-wedding-photo": `${CF_IMG}/pm-28-wedding-photo/public`,
  "pm-29-isometric-3d": `${CF_IMG}/pm-29-isometric-3d/public`,
  "pm-30-dark-fantasy": `${CF_IMG}/pm-30-dark-fantasy/public`,
  "pm-31-underwater": `${CF_IMG}/pm-31-underwater/public`,
  "pm-32-street-photo": `${CF_IMG}/pm-32-street-photo/public`,
  "pm-33-macro": `${CF_IMG}/pm-33-macro/public`,
  "pm-34-flat-design": `${CF_IMG}/pm-34-flat-design/public`,
  "pm-35-cinematic-portrait": `${CF_IMG}/pm-35-cinematic-portrait/public`,
  "pm-36-pixel-art": `${CF_IMG}/pm-36-pixel-art/public`,
  "pm-37-botanical": `${CF_IMG}/pm-37-botanical/public`,
  "pm-38-sports-action": `${CF_IMG}/pm-38-sports-action/public`,
  "pm-39-stained-glass": `${CF_IMG}/pm-39-stained-glass/public`,
  "pm-40-tilt-shift": `${CF_IMG}/pm-40-tilt-shift/public`,
};

const exampleUrls: Record<string, string> = {
  "ex-01-skincare-flatlay": `${CF_IMG}/ex-01-skincare-flatlay/public`,
  "ex-02-dark-dessert": `${CF_IMG}/ex-02-dark-dessert/public`,
  "ex-03-wabisabi-bathroom": `${CF_IMG}/ex-03-wabisabi-bathroom/public`,
  "ex-04-streetwear": `${CF_IMG}/ex-04-streetwear/public`,
  "ex-05-paladin-turnaround": `${CF_IMG}/ex-05-paladin-turnaround/public`,
  "ex-06-brutalist-museum": `${CF_IMG}/ex-06-brutalist-museum/public`,
  "ex-07-noir-detective": `${CF_IMG}/ex-07-noir-detective/public`,
  "ex-08-space-station": `${CF_IMG}/ex-08-space-station/public`,
  "ex-09-anime-battle": `${CF_IMG}/ex-09-anime-battle/public`,
  "ex-10-ceo-portrait": `${CF_IMG}/ex-10-ceo-portrait/public`,
  "ex-11-motorcycle": `${CF_IMG}/ex-11-motorcycle/public`,
  "ex-12-coffee-brand": `${CF_IMG}/ex-12-coffee-brand/public`,
  "ex-13-iceland-volcanic": `${CF_IMG}/ex-13-iceland-volcanic/public`,
  "ex-14-macro-crystal": `${CF_IMG}/ex-14-macro-crystal/public`,
  "ex-15-headphone-render": `${CF_IMG}/ex-15-headphone-render/public`,
  "ex-26-autumn-lake": `${CF_IMG}/ex-26-autumn-lake/public`,
  "ex-27-neon-alley": `${CF_IMG}/ex-27-neon-alley/public`,
  "ex-29-isometric-room": `${CF_IMG}/ex-29-isometric-room/public`,
  "ex-30-dark-knight": `${CF_IMG}/ex-30-dark-knight/public`,
  "ex-33-dewdrop": `${CF_IMG}/ex-33-dewdrop/public`,
  "ex-36-pixel-dungeon": `${CF_IMG}/ex-36-pixel-dungeon/public`,
  "ex-38-soccer": `${CF_IMG}/ex-38-soccer/public`,
};

const videoUrls: Record<string, string> = {
  "vid-26-drone-flight": `${CF_STREAM}/00932b8e9d4c182786ea3b22c8293541/downloads/default.mp4`,
  "vid-27-cyberpunk-walk": `${CF_STREAM}/a899388d32ae71867514fadb363960af/downloads/default.mp4`,
  "vid-28-wedding-dance": `${CF_STREAM}/4412b3dd94029791def8b43ca726dc8d/downloads/default.mp4`,
  "vid-30-dragon-flight": `${CF_STREAM}/178ac339376e68ecd3c48f49f5aaa4ee/downloads/default.mp4`,
  "vid-31-underwater-reef": `${CF_STREAM}/c9f21d787377f20f92f6d5e288a8c7b3/downloads/default.mp4`,
  "vid-32-tokyo-night": `${CF_STREAM}/70fca5892165f17f477144bc21c5a716/downloads/default.mp4`,
  "vid-35-craftsman": `${CF_STREAM}/780615da5eff98f86e26ce1c86b25888/downloads/default.mp4`,
};

const cover = (name: string) => coverUrls[name] || "https://placehold.co/800x450/1a1a2e/7036F0?text=Generating...";
const example = (name: string) => exampleUrls[name] || "https://placehold.co/800x450/1a1a2e/7036F0?text=Generating...";
const video = (name: string) => videoUrls[name] || undefined;

/* ═══════════════════════════════════════════════════
 * SEED USERS — 12 diverse visual creators
 * ═══════════════════════════════════════════════════ */
const SEED_USERS = [
  { name: "Alex Chen", email: "alex.chen.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alexv4", specialty: "Product Photography", bio: "Commercial photographer turned AI prompt engineer. Creating studio-quality product shots with Imagen, Flux, and Midjourney.", verified: true, socialLinks: { website: "https://alexchen.studio", twitter: "alexchen_photo" } },
  { name: "Sarah Kim", email: "sarah.kim.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarahv4", specialty: "Food & Lifestyle Photography", bio: "Former Bon Appétit contributor. Specializing in editorial food and interior photography prompts.", verified: true, socialLinks: { website: "https://sarahkim.co", twitter: "sarahkim_food" } },
  { name: "Marcus Rivera", email: "marcus.r.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcusv4", specialty: "3D & Character Design", bio: "AAA game artist with 10+ years at Riot and Blizzard. Now crafting next-gen character and concept art prompts.", verified: true, socialLinks: { website: "https://marcusrivera.art" } },
  { name: "Yuki Tanaka", email: "yuki.t.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=yukiv4", specialty: "Fashion & Editorial", bio: "Fashion photographer based in Tokyo. Vogue Japan contributor creating haute couture AI editorial prompts.", verified: true, socialLinks: { website: "https://yukitanaka.jp", twitter: "yuki_fashion" } },
  { name: "David Nguyen", email: "david.ng.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=davidv4", specialty: "Architecture & Interior", bio: "Licensed architect and ArchDaily contributor. Creating photorealistic architectural visualization prompts.", verified: true, socialLinks: { website: "https://davidnguyen.arch" } },
  { name: "Emma Watson", email: "emma.w.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emmav4", specialty: "Children's Illustration", bio: "Award-winning children's book illustrator. Crafting whimsical, Ghibli-inspired AI illustration prompts.", verified: true, socialLinks: { twitter: "emmaillustrates" } },
  { name: "Raj Patel", email: "raj.p.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rajv4", specialty: "Brand & Logo Design", bio: "Brand strategist and identity designer. Creating premium logo and packaging design prompts.", verified: true, socialLinks: { website: "https://rajpatel.design" } },
  { name: "Luna Park", email: "luna.p.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lunav4", specialty: "Fantasy & Concept Art", bio: "Digital matte painter and concept artist. Crafting epic fantasy and sci-fi world-building prompts.", verified: true, socialLinks: { website: "https://lunapark.art", twitter: "luna_conceptart" } },
  { name: "James Mitchell", email: "james.m.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jamesv4", specialty: "Cinematic & Film", bio: "Former Hollywood VFX supervisor. Creating cinematic film still and sci-fi concept prompts.", verified: true, socialLinks: { website: "https://jamesmitchell.film" } },
  { name: "Mia Zhang", email: "mia.z.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=miav4", specialty: "Anime & Manga Art", bio: "Professional anime illustrator and manga artist. Creating Makoto Shinkai and Ufotable-quality prompts.", verified: true, socialLinks: { twitter: "miazhang_anime", website: "https://miazhang.art" } },
  { name: "Carlos Mendez", email: "carlos.m.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlosv4", specialty: "Automotive & Industrial", bio: "Automotive designer at BMW DesignWorks alumni. Creating hypercar and industrial design prompts.", verified: true, socialLinks: { twitter: "carlos_autodesign", website: "https://carlosmendez.design" } },
  { name: "Aisha Obi", email: "aisha.o.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aishav4", specialty: "Portrait & Fine Art", bio: "Fine art photographer with gallery exhibitions worldwide. Crafting studio portrait and abstract art prompts.", verified: true, socialLinks: { website: "https://aishaobi.gallery" } },
];

/* ═══════════════════════════════════════════════════
 * 25 SHOWCASE PROMPT SETS — visual/creative AI generation
 * ═══════════════════════════════════════════════════ */
type Cat = "coding" | "writing" | "marketing" | "design" | "business" | "education" | "other";

interface SeedPrompt {
  title: { en: string; vi: string };
  category: Cat;
  tags: string[];
  priceSKT: number;
  isFree?: boolean;
  featured?: boolean;
  sellerIdx: number;
  description: { en: string; vi: string };
  previewText: string;
  coverImage: string;
  models: string[];
  prompts: Array<{
    title: string;
    content: string;
    description: string;
    variables?: Array<{ name: string; description: string; defaultValue: string }>;
  }>;
  examples: Array<{ input: string; output: string; image?: string; video?: string }>;
}

const PROMPTS: SeedPrompt[] = [

  /* ═══════════════════════════════════════════════════
   * 01. CINEMATIC PRODUCT PHOTOGRAPHY
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Cinematic Product Photography Pro", vi: "Chụp sản phẩm Cinematic chuyên nghiệp" },
    category: "design",
    tags: ["product-photography", "commercial", "luxury", "studio-lighting", "e-commerce"],
    priceSKT: 120,
    featured: true,
    sellerIdx: 0,
    description: {
      en: "Generate studio-quality product photography with cinematic lighting, premium materials, and campaign-level compositions. Perfect for luxury brands, e-commerce, and advertising.",
      vi: "Tạo ảnh sản phẩm chất lượng studio với ánh sáng cinematic, chất liệu cao cấp, và bố cục campaign. Hoàn hảo cho thương hiệu luxury, e-commerce, quảng cáo."
    },
    previewText: "A luxury {{product}} with {{material}} finish, resting on {{surface}}, {{lighting}} lighting, shot on {{camera}}...",
    coverImage: cover("pm-01-product-photo"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Hero Product Shot",
        content: "A luxury {{product}} with {{material}} finish, resting at a dynamic angle on {{surface}}, {{props}} beside it, dramatic {{lighting}} lighting with warm key light from the left and cool fill from the right, shallow depth of field, shot on {{camera}}, {{brand_reference}} campaign quality, dark moody background with subtle smoke wisps, no text",
        description: "Cinematic hero shot with dramatic lighting and premium staging",
        variables: [
          { name: "product", description: "Product to photograph", defaultValue: "men's chronograph watch with midnight blue dial and rose gold accents" },
          { name: "material", description: "Material/finish", defaultValue: "brushed titanium and sapphire crystal" },
          { name: "surface", description: "Surface/backdrop", defaultValue: "a slab of raw black marble" },
          { name: "props", description: "Props/accents", defaultValue: "water droplets on the crystal face catching studio light, a single sprig of eucalyptus" },
          { name: "lighting", description: "Lighting style", defaultValue: "Rembrandt" },
          { name: "camera", description: "Camera reference", defaultValue: "Phase One IQ4 150MP" },
          { name: "brand_reference", description: "Brand quality reference", defaultValue: "Cartier" },
        ],
      },
      {
        title: "Flat Lay Arrangement",
        content: "Luxury {{product_type}} flat lay photography, {{items}} arranged diagonally on {{surface}}, surrounded by {{props}}, natural window light casting soft shadows, {{accent}} partially visible at the edge, clean editorial beauty photography for {{brand_style}} style brands, overhead shot, no text",
        description: "Editorial flat lay with natural lighting",
        variables: [
          { name: "product_type", description: "Product category", defaultValue: "skincare" },
          { name: "items", description: "Items to arrange", defaultValue: "three amber glass dropper bottles with minimalist white labels" },
          { name: "surface", description: "Surface", defaultValue: "a terrazzo surface" },
          { name: "props", description: "Surrounding props", defaultValue: "fresh rosemary sprigs, sliced lemons, and raw honey in a small ceramic dish" },
          { name: "accent", description: "Edge accent", defaultValue: "a linen napkin" },
          { name: "brand_style", description: "Brand aesthetic", defaultValue: "Aesop or Le Labo" },
        ],
      },
      {
        title: "Floating Product Render",
        content: "Three floating 3D product renders of premium {{product}} in different colorways — {{color1}}, {{color2}}, and {{color3}} — each shown partially out of their matching {{packaging}}, suspended in mid-air at slight angles against a clean gradient background transitioning from light gray to white, soft studio lighting with subtle colored reflections matching each product, product shadow falling gently below, {{brand_style}} product photography style, Octane render quality, no text",
        description: "3D floating product render with multiple colorways",
        variables: [
          { name: "product", description: "Product", defaultValue: "wireless earbuds" },
          { name: "color1", description: "Color 1", defaultValue: "midnight black" },
          { name: "color2", description: "Color 2", defaultValue: "arctic white" },
          { name: "color3", description: "Color 3", defaultValue: "sunset coral" },
          { name: "packaging", description: "Packaging", defaultValue: "charging cases" },
          { name: "brand_style", description: "Brand style", defaultValue: "Apple" },
        ],
      },
    ],
    examples: [
      { input: "Luxury watch hero shot on black marble with Rembrandt lighting", output: "Cinematic product photography of a chronograph watch with dramatic lighting, water droplets, and Phase One camera quality.", image: cover("pm-01-product-photo") },
      { input: "Skincare flat lay with amber glass bottles on terrazzo", output: "Editorial overhead shot with natural window light, botanical props, and Aesop-style minimal aesthetic.", image: example("ex-01-skincare-flatlay") },
    ],
  },


  /* ═══════════════════════════════════════════════════
   * 02. GOURMET FOOD EDITORIAL
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Gourmet Food Editorial Photography", vi: "Nhiếp ảnh ẩm thực Editorial cao cấp" },
    category: "design",
    tags: ["food-photography", "editorial", "restaurant", "culinary", "gourmet"],
    priceSKT: 95,
    featured: true,
    sellerIdx: 1,
    description: {
      en: "Create Michelin-star quality food photography with editorial styling, dramatic lighting, and magazine-cover compositions. From overhead flat lays to dark moody close-ups.",
      vi: "Tạo ảnh ẩm thực chất lượng Michelin-star với styling editorial, ánh sáng dramatic, và bố cục tạp chí. Từ flat lay overhead đến close-up tối."
    },
    previewText: "Overhead editorial food photography of {{dish}} on {{plate}}, garnished with {{garnish}}...",
    coverImage: cover("pm-02-food-editorial"),
    models: ["flux", "midjourney", "dall-e-3"],
    prompts: [
      {
        title: "Overhead Editorial",
        content: "Overhead editorial food photography of an artfully plated {{dish}} on {{plate}}, garnished with {{garnish}}, surrounded by {{props}} on {{surface}}, warm directional lighting from the upper left creating long shadows, {{accent_props}} as props, shot on {{camera}}, {{magazine}} magazine cover quality, no text",
        description: "Overhead editorial food shot for magazine covers",
        variables: [
          { name: "dish", description: "Dish", defaultValue: "wagyu beef tartare" },
          { name: "plate", description: "Plate/vessel", defaultValue: "a handmade ceramic plate" },
          { name: "garnish", description: "Garnish", defaultValue: "microgreens and edible gold leaf" },
          { name: "props", description: "Surrounding elements", defaultValue: "scattered pink peppercorns and a drizzle of truffle oil on the dark slate surface" },
          { name: "surface", description: "Surface", defaultValue: "dark slate" },
          { name: "accent_props", description: "Accent props", defaultValue: "fresh herbs and a vintage brass spoon" },
          { name: "camera", description: "Camera", defaultValue: "Hasselblad H6D" },
          { name: "magazine", description: "Magazine reference", defaultValue: "Bon Appétit" },
        ],
      },
      {
        title: "Dark Moody Close-Up",
        content: "Dark and moody food photography of {{dish}} on {{plate}}, {{action_detail}}, {{accompaniment}} beside it, {{garnish_detail}}, {{surface}} with {{utensil}}, single directional warm light from the left, deep shadows and rich tones, Michelin-star restaurant {{menu_type}} menu quality, no text",
        description: "Dark moody food photography with chiaroscuro lighting",
        variables: [
          { name: "dish", description: "Dish", defaultValue: "a chocolate lava cake" },
          { name: "plate", description: "Plate", defaultValue: "a matte black plate" },
          { name: "action_detail", description: "Action/detail", defaultValue: "molten dark chocolate flowing from the center" },
          { name: "accompaniment", description: "Side element", defaultValue: "a scoop of vanilla bean ice cream with visible specks melting" },
          { name: "garnish_detail", description: "Garnish", defaultValue: "a dusting of cocoa powder and a single gold leaf garnish" },
          { name: "surface", description: "Surface", defaultValue: "dark wood table" },
          { name: "utensil", description: "Utensil", defaultValue: "a vintage silver fork" },
          { name: "menu_type", description: "Menu type", defaultValue: "dessert" },
        ],
      },
    ],
    examples: [
      { input: "Wagyu tartare overhead shot on ceramic plate, Bon Appétit style", output: "Editorial overhead food photography with warm directional lighting, vintage brass props, and Hasselblad camera quality.", image: cover("pm-02-food-editorial") },
      { input: "Chocolate lava cake dark moody close-up", output: "Dark and moody dessert photography with chiaroscuro lighting, molten chocolate action, and Michelin-star plating.", image: example("ex-02-dark-dessert") },
    ],
  },


  /* ═══════════════════════════════════════════════════
   * 03. MODERN INTERIOR DESIGN
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Modern Interior Design Visualizer", vi: "Trực quan hóa thiết kế nội thất hiện đại" },
    category: "design",
    tags: ["interior-design", "architecture", "minimalist", "scandinavian", "home-decor"],
    priceSKT: 110,
    sellerIdx: 4,
    description: {
      en: "Generate magazine-quality interior design visualizations. From Scandinavian minimalism to Japanese wabi-sabi, with photorealistic lighting and material textures.",
      vi: "Tạo hình ảnh nội thất chất lượng tạp chí. Từ tối giản Scandinavian đến wabi-sabi Nhật Bản, với ánh sáng và chất liệu photorealistic."
    },
    previewText: "A stunning {{style}} {{room}} with {{window_type}} overlooking {{view}}, {{furniture}} beside {{accent}}...",
    coverImage: cover("pm-03-interior-design"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Scandinavian Living Room",
        content: "A stunning {{style}} {{room}} with {{window_type}} overlooking {{view}}, {{lighting_time}} light flooding in, {{main_furniture}} beside {{accent_furniture}}, {{lighting_fixture}} glowing warmly in the corner, {{flooring}} with {{rug}}, {{shelf_detail}}, architectural photography by {{photographer}}, {{magazine}} magazine quality, no text",
        description: "Scandinavian-style interior with natural lighting",
        variables: [
          { name: "style", description: "Design style", defaultValue: "Scandinavian minimalist" },
          { name: "room", description: "Room type", defaultValue: "living room" },
          { name: "window_type", description: "Window type", defaultValue: "floor-to-ceiling windows" },
          { name: "view", description: "View outside", defaultValue: "a snowy Nordic forest" },
          { name: "lighting_time", description: "Time of day", defaultValue: "warm afternoon" },
          { name: "main_furniture", description: "Main furniture", defaultValue: "a curved bouclé sofa in cream" },
          { name: "accent_furniture", description: "Accent furniture", defaultValue: "a walnut coffee table with a stack of art books" },
          { name: "lighting_fixture", description: "Lighting", defaultValue: "a statement Noguchi paper lamp" },
          { name: "flooring", description: "Flooring", defaultValue: "polished concrete floors" },
          { name: "rug", description: "Rug/textile", defaultValue: "a sheepskin rug" },
          { name: "shelf_detail", description: "Shelf detail", defaultValue: "live-edge wooden shelf with trailing pothos plant" },
          { name: "photographer", description: "Photographer reference", defaultValue: "Jonas Bjerre-Poulsen" },
          { name: "magazine", description: "Magazine reference", defaultValue: "Kinfolk" },
        ],
      },
      {
        title: "Japanese Wabi-Sabi Bathroom",
        content: "A serene Japanese wabi-sabi {{room}}, {{main_feature}} filled with steaming water, positioned before {{window}} looking out at {{view}}, {{flooring}}, {{furniture}} with {{props}}, {{accent_detail}}, soft diffused natural light, warm earth tones of clay and sand, {{designer}} interior aesthetic, no text",
        description: "Serene Japanese wabi-sabi interior",
        variables: [
          { name: "room", description: "Room type", defaultValue: "bathroom" },
          { name: "main_feature", description: "Main feature", defaultValue: "a deep oval stone soaking tub (ofuro)" },
          { name: "window", description: "Window", defaultValue: "a floor-to-ceiling window" },
          { name: "view", description: "View", defaultValue: "a private bamboo garden" },
          { name: "flooring", description: "Flooring", defaultValue: "natural stone floor with embedded river pebbles" },
          { name: "furniture", description: "Furniture", defaultValue: "a wooden stool" },
          { name: "props", description: "Props", defaultValue: "folded linen towels and a ceramic soap dish" },
          { name: "accent_detail", description: "Accent", defaultValue: "dried eucalyptus bundle hanging from a brass shower fixture" },
          { name: "designer", description: "Designer reference", defaultValue: "Axel Vervoordt" },
        ],
      },
    ],
    examples: [
      { input: "Scandinavian minimalist living room with Nordic forest view", output: "Magazine-quality interior with Noguchi lamp, bouclé sofa, and warm afternoon light through floor-to-ceiling windows.", image: cover("pm-03-interior-design") },
      { input: "Japanese wabi-sabi bathroom with stone soaking tub", output: "Serene bathroom with ofuro tub, bamboo garden view, natural stone floors, and Axel Vervoordt aesthetic.", image: example("ex-03-wabisabi-bathroom") },
    ],
  },


  /* ═══════════════════════════════════════════════════
   * 04. HAUTE COUTURE FASHION EDITORIAL
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Haute Couture Fashion Editorial", vi: "Editorial thời trang Haute Couture" },
    category: "design",
    tags: ["fashion", "editorial", "haute-couture", "vogue", "runway"],
    priceSKT: 130,
    featured: true,
    sellerIdx: 3,
    description: {
      en: "Create Vogue-quality fashion editorial photography. Avant-garde gowns, dramatic locations, and Tim Walker-inspired compositions with cinematic lighting.",
      vi: "Tạo ảnh editorial thời trang chất lượng Vogue. Váy avant-garde, địa điểm dramatic, và bố cục Tim Walker với ánh sáng cinematic."
    },
    previewText: "Haute couture editorial photograph, a striking model in {{garment}}, {{location}} at {{time}}...",
    coverImage: cover("pm-04-fashion-editorial"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Couture Editorial",
        content: "Haute couture editorial photograph, a striking model in {{garment}}, {{action}} through {{location}} at {{time}}, {{lighting}} creating {{effect}}, the gown fabric catching light with {{fabric_detail}}, shot on {{camera}}, {{magazine}} cover quality, fashion photography inspired by {{photographers}}, no text",
        description: "Vogue-quality haute couture editorial",
        variables: [
          { name: "garment", description: "Garment", defaultValue: "an avant-garde sculptural emerald green gown with dramatic pleated organza cape trailing behind" },
          { name: "action", description: "Action", defaultValue: "walking" },
          { name: "location", description: "Location", defaultValue: "a misty enchanted forest" },
          { name: "time", description: "Time", defaultValue: "golden hour" },
          { name: "lighting", description: "Lighting", defaultValue: "harsh directional backlighting" },
          { name: "effect", description: "Lighting effect", defaultValue: "a glowing silhouette" },
          { name: "fabric_detail", description: "Fabric detail", defaultValue: "iridescent reflections" },
          { name: "camera", description: "Camera", defaultValue: "Hasselblad H6D-100c" },
          { name: "magazine", description: "Magazine", defaultValue: "Vogue Italia" },
          { name: "photographers", description: "Photographer inspiration", defaultValue: "Tim Walker and Paolo Roversi" },
        ],
      },
      {
        title: "Streetwear Lookbook",
        content: "Urban streetwear editorial photograph, a young model in {{outfit}}, {{location_detail}}, {{photography_style}}, shot on {{film_stock}}, {{publication}} editorial quality, raw street energy, no text",
        description: "Streetwear editorial with raw film aesthetic",
        variables: [
          { name: "outfit", description: "Outfit", defaultValue: "an oversized vintage-washed denim jacket with bold embroidered tiger back patch, layered over a graphic mesh top, wide-leg cargo pants with utility straps, and chunky platform combat boots" },
          { name: "location_detail", description: "Location detail", defaultValue: "standing on a fire escape in a gritty New York back alley with morning fog" },
          { name: "photography_style", description: "Photography style", defaultValue: "harsh flash photography with sharp shadows" },
          { name: "film_stock", description: "Film/camera", defaultValue: "35mm Kodak Tri-X pushed to 1600 ISO" },
          { name: "publication", description: "Publication", defaultValue: "Hypebeast" },
        ],
      },
    ],
    examples: [
      { input: "Emerald couture gown in enchanted forest at golden hour", output: "Vogue Italia-quality editorial with sculptural organza cape, backlighting silhouette, and Tim Walker-inspired composition.", image: cover("pm-04-fashion-editorial") },
      { input: "Streetwear lookbook on NYC fire escape", output: "Raw streetwear editorial with flash photography, Kodak Tri-X film grain, and Hypebeast aesthetic.", image: example("ex-04-streetwear") },
    ],
  },


  /* ═══════════════════════════════════════════════════
   * 05. MINIMAL LOGO COLLECTION
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Minimal Logo & Brand Identity Pack", vi: "Bộ Logo tối giản & Nhận diện thương hiệu" },
    category: "design",
    tags: ["logo-design", "branding", "identity", "minimal", "typography"],
    priceSKT: 85,
    sellerIdx: 6,
    description: {
      en: "Generate professional brand identity presentations with minimal modern logos, gold foil mockups, and premium typography on textured paper cards.",
      vi: "Tạo bài trình bày nhận diện thương hiệu chuyên nghiệp với logo hiện đại tối giản, mockup gold foil, và typography premium."
    },
    previewText: "A professional brand identity presentation on {{background}}, showing {{logo_count}} different minimal modern logos...",
    coverImage: cover("pm-05-logo-design"),
    models: ["flux", "midjourney", "dall-e-3"],
    prompts: [
      {
        title: "Logo Grid Presentation",
        content: "A professional brand identity presentation mockup on a clean {{background}} background, showing {{logo_count}} different minimal modern logos arranged in a grid — {{logo_styles}} — all rendered in {{color_treatment}} on premium textured paper cards with subtle embossing, studio lighting with soft shadows, brand designer portfolio quality, no text on background",
        description: "Logo grid presentation with embossed mockups",
        variables: [
          { name: "background", description: "Background", defaultValue: "dark charcoal" },
          { name: "logo_count", description: "Number of logos", defaultValue: "six" },
          { name: "logo_styles", description: "Logo styles", defaultValue: "a geometric mountain mark, an abstract wave letterform, a negative-space animal icon, a monogram with serif typography, a circular badge emblem, and a clean wordmark" },
          { name: "color_treatment", description: "Color treatment", defaultValue: "white and gold foil" },
        ],
      },
      {
        title: "Brand Identity Mockup",
        content: "A premium {{industry}} brand identity mockup presentation, showing a minimal line-art logo of {{logo_concept}}, displayed on: {{mockup_items}}, all arranged on {{surface}} with {{props}}, warm directional lighting, artisan brand photography, no text outside logo",
        description: "Brand identity applied across multiple touchpoints",
        variables: [
          { name: "industry", description: "Industry", defaultValue: "coffee" },
          { name: "logo_concept", description: "Logo concept", defaultValue: "a mountain peak with a rising steam curl forming the sun" },
          { name: "mockup_items", description: "Mockup items", defaultValue: "a kraft paper coffee bag with matte black label, a ceramic takeaway cup with a sleeve, a round rubber stamp impression on brown paper, and an embossed business card on textured cotton paper" },
          { name: "surface", description: "Surface", defaultValue: "a dark wood surface" },
          { name: "props", description: "Props", defaultValue: "scattered coffee beans and a burlap swatch" },
        ],
      },
    ],
    examples: [
      { input: "6 minimal modern logos on dark charcoal with gold foil", output: "Professional brand identity grid with geometric, letterform, monogram, badge, and wordmark logos on textured paper.", image: cover("pm-05-logo-design") },
      { input: "Coffee brand identity with mountain logo on packaging", output: "Premium brand mockup across coffee bag, cup, stamp, and business card with artisan photography.", image: example("ex-12-coffee-brand") },
    ],
  },


  /* ═══════════════════════════════════════════════════
   * 06. GAME CHARACTER DESIGN
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "AAA Game Character Design Studio", vi: "Studio thiết kế nhân vật Game AAA" },
    category: "design",
    tags: ["character-design", "game-art", "concept-art", "3d-render", "cyberpunk"],
    priceSKT: 140,
    featured: true,
    sellerIdx: 2,
    description: {
      en: "Create AAA game-quality character designs with full-body renders, turnaround sheets, and cinematic poses. Unreal Engine 5 photorealistic quality.",
      vi: "Tạo thiết kế nhân vật chất lượng game AAA với render full-body, turnaround sheet, và tư thế cinematic. Chất lượng photorealistic UE5."
    },
    previewText: "Full-body 3D character render of {{character}}, wearing {{armor}}, wielding {{weapon}}...",
    coverImage: cover("pm-06-character-design"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Hero Character Render",
        content: "Full-body 3D character render of {{character}}, wearing {{armor}} with {{armor_details}}, wielding {{weapon}}, standing in {{environment}}, {{atmosphere}}, {{render_engine}} cinematic quality, AAA game character art, photorealistic with stylized proportions, no text",
        description: "Full-body hero character render",
        variables: [
          { name: "character", description: "Character", defaultValue: "an elite cyberpunk samurai warrior with a glowing neon-blue visor" },
          { name: "armor", description: "Armor/clothing", defaultValue: "matte black tactical armor with exposed mechanical joints" },
          { name: "armor_details", description: "Armor details", defaultValue: "holographic shoulder insignias" },
          { name: "weapon", description: "Weapon", defaultValue: "a plasma katana that trails electric blue particles" },
          { name: "environment", description: "Environment", defaultValue: "a rain-soaked Tokyo alley with neon signs reflecting on wet asphalt" },
          { name: "atmosphere", description: "Atmosphere", defaultValue: "volumetric fog and lens flare" },
          { name: "render_engine", description: "Render engine", defaultValue: "Unreal Engine 5" },
        ],
      },
      {
        title: "Character Turnaround Sheet",
        content: "Professional game character turnaround reference sheet showing {{character}} in {{outfit}}, displayed in 6 views on a clean neutral gray background: front, back, left side, right side, {{action_pose}}, and {{alt_pose}}, {{special_effect}}, consistent lighting and proportions across all views, concept art character sheet for 3D modeler reference, no text",
        description: "6-view character turnaround for 3D modelers",
        variables: [
          { name: "character", description: "Character", defaultValue: "a female holy paladin knight" },
          { name: "outfit", description: "Outfit", defaultValue: "ornate white and gold plate armor with a flowing royal blue cape" },
          { name: "action_pose", description: "Action pose", defaultValue: "combat stance with glowing sword raised" },
          { name: "alt_pose", description: "Alternative pose", defaultValue: "kneeling prayer pose" },
          { name: "special_effect", description: "Special effect", defaultValue: "a golden halo of light above the helmet in combat pose" },
        ],
      },
    ],
    examples: [
      { input: "Cyberpunk samurai in neon Tokyo alley, UE5 quality", output: "Full-body render with plasma katana, tactical armor, holographic insignias, and rain-soaked neon environment.", image: cover("pm-06-character-design") },
      { input: "Holy paladin turnaround sheet, 6 views", output: "Professional character sheet with front/back/sides, combat stance, and prayer pose. Consistent lighting for 3D reference.", image: example("ex-05-paladin-turnaround") },
    ],
  },


  /* ═══════════════════════════════════════════════════
   * 07. ARCHITECTURAL VISUALIZATION
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Architectural Visualization Masterclass", vi: "Trực quan hóa kiến trúc chuyên sâu" },
    category: "design",
    tags: ["architecture", "visualization", "rendering", "modern", "residential"],
    priceSKT: 115,
    sellerIdx: 4,
    description: {
      en: "Generate award-winning architectural visualizations. Modern villas, brutalist museums, and residential projects with golden hour lighting and landscape integration.",
      vi: "Tạo hình ảnh kiến trúc đoạt giải thưởng. Biệt thự hiện đại, bảo tàng brutalist, và dự án dân cư với ánh sáng golden hour."
    },
    previewText: "Award-winning modern {{building_type}}, {{structure}} perched on {{location}} at {{time}}...",
    coverImage: cover("pm-07-architecture"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Modern Villa Exterior",
        content: "Award-winning modern {{building_type}}, {{structure}} perched on {{location}} at {{time}}, {{water_feature}}, {{landscaping}}, warm interior lighting visible through {{windows}}, {{sky}}, architectural photography by {{photographer}}, {{award}} quality, wide establishing shot, no text",
        description: "Award-winning architectural exterior visualization",
        variables: [
          { name: "building_type", description: "Building type", defaultValue: "residential architecture" },
          { name: "structure", description: "Structure", defaultValue: "a cantilevered concrete and glass villa" },
          { name: "location", description: "Location", defaultValue: "a dramatic coastal cliff overlooking turquoise ocean" },
          { name: "time", description: "Time of day", defaultValue: "golden hour" },
          { name: "water_feature", description: "Water feature", defaultValue: "infinity pool merging with the horizon" },
          { name: "landscaping", description: "Landscaping", defaultValue: "lush tropical landscaping with mature palms and ornamental grasses" },
          { name: "windows", description: "Window type", defaultValue: "floor-to-ceiling glass walls" },
          { name: "sky", description: "Sky condition", defaultValue: "dramatic clouds in the sky" },
          { name: "photographer", description: "Photographer", defaultValue: "Iwan Baan" },
          { name: "award", description: "Award reference", defaultValue: "ArchDaily award" },
        ],
      },
      {
        title: "Brutalist Museum",
        content: "Award-winning {{style}} {{building_type}}, {{structure}}, {{entrance_detail}}, {{water_element}} mirroring the structure, {{human_scale}}, {{sky}} creating even diffused lighting that emphasizes the concrete texture and form, {{architect_reference}}, shot by {{photographer}}, no text",
        description: "Monumental brutalist architecture",
        variables: [
          { name: "style", description: "Style", defaultValue: "brutalist" },
          { name: "building_type", description: "Building type", defaultValue: "museum architecture" },
          { name: "structure", description: "Structure", defaultValue: "a monumental raw concrete building with dramatic cantilevers and deep geometric recesses" },
          { name: "entrance_detail", description: "Entrance", defaultValue: "a monumental staircase carved into the facade leading to a massive rectangular entrance" },
          { name: "water_element", description: "Water element", defaultValue: "reflecting pool in the forecourt" },
          { name: "human_scale", description: "Human element", defaultValue: "a single person walking up the stairs providing scale" },
          { name: "sky", description: "Sky", defaultValue: "overcast sky" },
          { name: "architect_reference", description: "Architect reference", defaultValue: "Tadao Ando meets Zaha Hadid" },
          { name: "photographer", description: "Photographer", defaultValue: "Hélène Binet" },
        ],
      },
    ],
    examples: [
      { input: "Coastal glass villa at golden hour with infinity pool", output: "Award-winning architectural visualization with cantilevered concrete, tropical landscaping, and Iwan Baan photography style.", image: cover("pm-07-architecture") },
      { input: "Brutalist museum with monumental concrete cantilevers", output: "Dramatic brutalist architecture with reflecting pool, carved staircase entrance, and Hélène Binet photography.", image: example("ex-06-brutalist-museum") },
    ],
  },


  /* ═══════════════════════════════════════════════════
   * 08. JEWELRY & ACCESSORIES STUDIO
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Jewelry & Accessories Studio", vi: "Studio Trang Sức & Phụ Kiện" },
    category: "design",
    tags: ["jewelry", "luxury", "diamond", "accessories", "studio-lighting", "product"],
    priceSKT: 100,
    isFree: false,
    featured: false,
    sellerIdx: 0,
    description: {
      en: "Professional AI prompts for stunning jewelry and accessories photography — hero shots, macro details, and elegant flat lays with luxury studio lighting.",
      vi: "Bộ prompt AI chuyên nghiệp cho chụp ảnh trang sức & phụ kiện — ảnh hero, chi tiết macro và flat lay sang trọng với ánh sáng studio cao cấp.",
    },
    previewText: "Create breathtaking jewelry product shots with diamond-sharp detail, luxury lighting setups, and elegant compositions perfect for e-commerce and editorial use.",
    coverImage: cover("pm-08-jewelry"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Hero Ring & Necklace Shot",
        content: "A stunning hero product photograph of a {{jewelry_type}} crafted from {{material}}, placed on a {{surface}} surface. The piece features {{design_detail}}. Lit with a {{lighting_setup}} creating brilliant reflections across facets and polished metal. Background is a seamless {{background_style}}. Shot with a Canon EOS R5, 100mm macro lens, f/4, focus-stacked for edge-to-edge sharpness. Subtle bokeh highlights dance in the background. Color grading: {{color_mood}}. The image conveys opulence, craftsmanship, and desire. 8K resolution, photorealistic, luxury advertising quality.",
        description: "Generate a hero-level product shot for rings, necklaces, or statement jewelry pieces with premium studio lighting.",
        variables: [
          { name: "jewelry_type", description: "Type of jewelry piece", defaultValue: "solitaire diamond engagement ring" },
          { name: "material", description: "Primary material", defaultValue: "18k rose gold with a 2-carat brilliant-cut diamond" },
          { name: "surface", description: "Surface the jewelry rests on", defaultValue: "polished black obsidian" },
          { name: "design_detail", description: "Key design element", defaultValue: "a cathedral setting with pavé diamonds along the band" },
          { name: "lighting_setup", description: "Lighting arrangement", defaultValue: "dual softbox key light with a fiber-optic accent light" },
          { name: "background_style", description: "Background treatment", defaultValue: "deep charcoal gradient with subtle warm tones" },
          { name: "color_mood", description: "Overall color mood", defaultValue: "warm champagne tones with cool diamond sparkle contrast" },
        ],
      },
      {
        title: "Watch Detail Macro",
        content: "An extreme macro photograph of a {{watch_type}}, focusing on the {{focus_area}}. The watch is made of {{watch_material}} with {{dial_detail}}. Captured at {{magnification}} magnification revealing microscopic textures, hairline engravings, and the interplay of light on polished vs. brushed surfaces. Lighting: {{macro_lighting}} to accentuate depth and dimension. Background dissolves into a creamy {{bokeh_color}} bokeh. Water droplets or condensation optional: {{moisture_effect}}. Shot style references high-end horological photography from Hodinkee and Watchonista. Ultra-sharp, 8K, photorealistic.",
        description: "Create an extreme close-up macro shot of luxury watches highlighting craftsmanship and intricate details.",
        variables: [
          { name: "watch_type", description: "Watch model/style", defaultValue: "luxury automatic chronograph" },
          { name: "focus_area", description: "Primary focus point", defaultValue: "the dial showing applied hour markers and dauphine hands" },
          { name: "watch_material", description: "Case material", defaultValue: "brushed titanium with polished bezel" },
          { name: "dial_detail", description: "Dial characteristics", defaultValue: "sunburst blue dial with luminous indices" },
          { name: "magnification", description: "Macro magnification level", defaultValue: "3:1" },
          { name: "macro_lighting", description: "Lighting for macro", defaultValue: "ring light with a single directional accent to reveal texture" },
          { name: "bokeh_color", description: "Bokeh background tone", defaultValue: "midnight navy" },
          { name: "moisture_effect", description: "Add moisture/condensation", defaultValue: "none — clean and pristine" },
        ],
      },
      {
        title: "Accessories Flat Lay",
        content: "A meticulously styled overhead flat lay photograph of a curated {{collection_theme}} accessories collection arranged on a {{flat_surface}}. Items include: {{item_list}}. The arrangement follows a {{layout_style}} composition with balanced negative space. Each item casts soft, defined shadows from a {{overhead_light}} positioned directly above. Accent props: {{props}}. Color palette restricted to {{palette}}. The image feels editorial, aspirational, and perfectly organized. Shot with a Phase One IQ4, 80mm lens, f/8, tethered. 8K resolution, luxury lifestyle magazine quality, photorealistic.",
        description: "Design an elegant overhead flat lay composition featuring curated accessories and lifestyle elements.",
        variables: [
          { name: "collection_theme", description: "Theme of the collection", defaultValue: "modern minimalist luxury" },
          { name: "flat_surface", description: "Background surface", defaultValue: "light grey Italian marble slab" },
          { name: "item_list", description: "Items in the flat lay", defaultValue: "leather card wallet, aviator sunglasses, gold cufflinks, silk pocket square, mechanical pen" },
          { name: "layout_style", description: "Arrangement style", defaultValue: "geometric grid with 45-degree angled items" },
          { name: "overhead_light", description: "Lighting type", defaultValue: "large rectangular softbox" },
          { name: "props", description: "Accent props", defaultValue: "a sprig of dried eucalyptus and a linen napkin" },
          { name: "palette", description: "Color palette", defaultValue: "navy, cognac, gold, and ivory" },
        ],
      },
    ],
    examples: [
      {
        input: "Hero shot of a diamond engagement ring on black obsidian with warm rose gold tones",
        output: "A breathtaking hero product photograph of a solitaire diamond engagement ring in 18k rose gold, resting on polished black obsidian. Dual softbox lighting creates brilliant fire across the 2-carat brilliant-cut diamond. Deep charcoal gradient background, Canon EOS R5 100mm macro, 8K photorealistic.",
        image: cover("pm-08-jewelry"),
      },
      {
        input: "Flat lay of men's luxury accessories on marble with geometric arrangement",
        output: "Meticulously styled overhead flat lay of a modern minimalist luxury accessories collection on light grey Italian marble. Leather wallet, aviator sunglasses, gold cufflinks, silk pocket square, and mechanical pen in geometric grid layout. Soft overhead softbox lighting, Phase One IQ4, 8K editorial quality.",
        image: cover("pm-08-jewelry"),
      },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 09. SOCIAL MEDIA CONTENT PACK
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Social Media Content Pack", vi: "Bộ Nội Dung Mạng Xã Hội" },
    category: "marketing",
    tags: ["social-media", "instagram", "content", "carousel", "marketing", "visual", "reels", "twitter"],
    priceSKT: 75,
    sellerIdx: 6,
    description: {
      en: "Create scroll-stopping social media visuals for Instagram carousels, Stories/Reels covers, and Twitter/X headers. Designed for brands, creators, and marketers who need consistent, on-brand content across platforms.",
      vi: "Tạo hình ảnh mạng xã hội thu hút cho carousel Instagram, ảnh bìa Stories/Reels và banner Twitter/X. Thiết kế cho thương hiệu, nhà sáng tạo và marketer cần nội dung đồng nhất trên các nền tảng."
    },
    previewText: "Professional social media visuals for Instagram, Stories, and Twitter/X — on-brand, scroll-stopping content.",
    coverImage: cover("pm-09-social-media"),
    models: ["midjourney", "dall-e-3", "stable-diffusion-xl", "flux"],
    prompts: [
      {
        title: "Instagram Carousel Visual",
        content: "Design a premium Instagram carousel slide visual for a {{brand_type}} brand. The slide features a {{color_scheme}} color palette with modern typography overlay space. Central visual element: {{main_subject}} presented in a clean, editorial style with {{background_style}} background. Aspect ratio 1:1 (1080x1080). Include subtle brand-consistent decorative elements like thin geometric lines, gradient overlays, and negative space for text placement. Style: {{visual_style}}, professional social media marketing aesthetic. Lighting: soft studio lighting with gentle shadows. The composition should guide the eye from top-left to bottom-right, leaving 30% space for headline text overlay.",
        description: "Generates a polished Instagram carousel slide with space for text overlay and brand-consistent styling.",
        variables: [
          { name: "brand_type", description: "Type of brand (e.g., skincare, fitness, tech startup)", defaultValue: "skincare" },
          { name: "color_scheme", description: "Primary color palette", defaultValue: "warm beige and soft gold" },
          { name: "main_subject", description: "The central visual element of the slide", defaultValue: "premium glass serum bottle with botanical elements" },
          { name: "background_style", description: "Background treatment", defaultValue: "soft gradient with organic texture" },
          { name: "visual_style", description: "Overall visual approach", defaultValue: "minimalist editorial" }
        ]
      },
      {
        title: "Story/Reels Cover Thumbnail",
        content: "Create a vertical 9:16 Instagram Story or Reels cover image for a {{niche}} brand. The design features a {{mood}} atmosphere with a bold, eye-catching {{focal_element}} at center. Background: {{bg_treatment}} with cinematic depth of field. Include a clean zone at top (15%) and bottom (20%) for UI elements and CTA text. Color grading: {{color_grading}}. Typography-ready layout with high contrast areas for white or dark text overlay. Style: trendy, Gen-Z aesthetic mixed with professional quality. Add subtle motion-blur hints or dynamic angles to suggest video energy. Resolution-optimized for mobile-first viewing.",
        description: "Generates an attention-grabbing vertical Story/Reels cover with mobile-optimized composition.",
        variables: [
          { name: "niche", description: "Content niche or industry", defaultValue: "fashion lifestyle" },
          { name: "mood", description: "Overall mood and energy", defaultValue: "vibrant and aspirational" },
          { name: "focal_element", description: "Main visual focus", defaultValue: "styled flat-lay of accessories on marble surface" },
          { name: "bg_treatment", description: "Background style", defaultValue: "blurred bokeh with warm tones" },
          { name: "color_grading", description: "Color treatment style", defaultValue: "warm sunset tones with peachy highlights" }
        ]
      },
      {
        title: "Twitter/X Header Banner",
        content: "Design a professional Twitter/X header banner (1500x500 pixels, 3:1 ratio) for a {{account_type}} account. The banner features a {{theme}} theme with a wide, cinematic composition. Left third: {{left_element}}. Center: clean space with subtle {{pattern_element}} pattern for profile photo overlap area. Right third: {{right_element}} with visual depth. Color palette: {{palette}}. Style: modern, authoritative, and clean with slight glassmorphism or frosted elements. The overall look should convey {{brand_message}}. Ensure the critical visual content avoids the center-bottom area where the profile picture overlaps. Ultra-wide cinematic framing, sharp details, professional corporate aesthetic.",
        description: "Creates a wide-format Twitter/X header banner with smart composition that accounts for profile picture overlap.",
        variables: [
          { name: "account_type", description: "Type of Twitter/X account", defaultValue: "tech startup" },
          { name: "theme", description: "Visual theme", defaultValue: "futuristic technology" },
          { name: "left_element", description: "Visual element on the left side", defaultValue: "abstract 3D geometric shapes with neon accents" },
          { name: "pattern_element", description: "Subtle pattern in center area", defaultValue: "dot grid" },
          { name: "right_element", description: "Visual element on the right side", defaultValue: "cityscape silhouette with data stream overlay" },
          { name: "palette", description: "Color palette", defaultValue: "deep navy, electric blue, and white" },
          { name: "brand_message", description: "What the banner should communicate", defaultValue: "innovation and cutting-edge technology" }
        ]
      }
    ],
    examples: [
      {
        input: "brand_type: organic skincare, color_scheme: sage green and cream, main_subject: hand holding a dropper bottle with golden oil, background_style: linen texture with dried eucalyptus, visual_style: clean organic editorial",
        output: "A beautifully composed 1:1 Instagram carousel slide featuring a hand delicately holding a frosted glass dropper bottle with golden facial oil. The sage green and cream palette creates a calming, premium feel. Dried eucalyptus branches frame the corners while a soft linen texture background adds warmth. Generous negative space in the upper-right for headline text. Soft natural lighting with gentle shadows.",
        image: cover("pm-09-social-media")
      },
      {
        input: "account_type: AI SaaS company, theme: neural network visualization, left_element: flowing particle streams in purple and cyan, pattern_element: hexagonal grid, right_element: holographic dashboard interface, palette: dark purple, cyan, and white, brand_message: intelligent automation for modern teams",
        output: "A striking 3:1 Twitter header banner with a deep purple background. The left third features elegant particle streams flowing in purple-to-cyan gradients suggesting neural pathways. A subtle hexagonal grid occupies the center zone. The right third displays a semi-transparent holographic dashboard UI with glowing data elements. The composition intelligently avoids the profile overlap zone while maintaining visual flow across the full width.",
        image: cover("pm-09-social-media")
      }
    ]
  },

  /* ═══════════════════════════════════════════════════
   * 10. CORPORATE PRESENTATION VISUAL
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Corporate Presentation Visual", vi: "Hình Ảnh Trình Bày Doanh Nghiệp" },
    category: "business",
    tags: ["presentation", "corporate", "business", "keynote", "professional", "visual", "slides", "powerpoint"],
    priceSKT: 85,
    sellerIdx: 6,
    description: {
      en: "Generate stunning visuals for corporate presentations — keynote hero images, team culture photos, and data visualization backgrounds. Designed for executive decks, investor pitches, and all-hands meetings.",
      vi: "Tạo hình ảnh ấn tượng cho bài trình bày doanh nghiệp — ảnh hero keynote, ảnh văn hóa đội ngũ, và nền trực quan hóa dữ liệu. Thiết kế cho bài thuyết trình cấp điều hành, pitch nhà đầu tư, và họp toàn công ty."
    },
    previewText: "Premium presentation visuals — keynote heroes, team culture shots, and data viz backgrounds for executive decks.",
    coverImage: cover("pm-10-pod-designs"),
    models: ["dall-e-3", "midjourney", "flux", "stable-diffusion-xl"],
    prompts: [
      {
        title: "Keynote Slide Hero Image",
        content: "Create a wide 16:9 keynote presentation hero image for a {{presentation_topic}} presentation. The image features a {{visual_metaphor}} as a powerful visual metaphor. Style: {{visual_style}} with a {{color_scheme}} palette that works on both projected screens and laptop displays. The composition places the visual weight on the {{weight_position}} with expansive negative space on the {{text_area}} for title text (white or dark). Depth: {{depth_treatment}} creating a sense of scale and ambition. Lighting: {{lighting}} — dramatic enough for stage presentations but not distracting. Include subtle {{thematic_elements}} that reinforce the topic without being literal. The image should feel premium, confident, and executive-ready — think Apple keynote or TED talk quality. Avoid clichés like handshakes, lightbulbs, or generic teamwork poses.",
        description: "Generates a premium 16:9 keynote hero image with strategic negative space for title text overlay.",
        variables: [
          { name: "presentation_topic", description: "Topic of the presentation", defaultValue: "Q4 strategic growth roadmap" },
          { name: "visual_metaphor", description: "Central visual metaphor", defaultValue: "a winding mountain road ascending through clouds toward a summit bathed in golden light" },
          { name: "visual_style", description: "Artistic style", defaultValue: "cinematic photography with slight desaturation" },
          { name: "color_scheme", description: "Color palette", defaultValue: "deep navy, slate gray, and amber gold accents" },
          { name: "weight_position", description: "Where visual weight sits", defaultValue: "right two-thirds" },
          { name: "text_area", description: "Where text will be placed", defaultValue: "left third" },
          { name: "depth_treatment", description: "How depth is created", defaultValue: "atmospheric perspective with fog layers between mountain ridges" },
          { name: "lighting", description: "Lighting style", defaultValue: "golden hour backlighting with god rays through clouds" },
          { name: "thematic_elements", description: "Subtle reinforcing elements", defaultValue: "a few distant way-markers along the road suggesting milestones" }
        ]
      },
      {
        title: "Team & Culture Photo",
        content: "Generate a corporate team culture photo for a {{company_type}} company's presentation or careers page. The scene shows {{team_scenario}} in a {{office_style}} workspace. {{number_people}} people are engaged in {{activity}} with genuine, natural body language — not stiff corporate poses. Diversity in the group: {{diversity_note}}. The workspace environment features {{office_details}}. Lighting: {{office_lighting}}. Camera: {{camera_angle}} with a slight depth of field keeping the foreground person sharp and background softly blurred. The mood is {{culture_mood}}. Wardrobe: {{dress_code}}. Format: 16:9 for presentation slides. The photo should feel authentic enough for an employer brand campaign — warm, inviting, and showing real collaboration without the stock-photo fakeness.",
        description: "Creates authentic-feeling team culture photos that showcase company environment and collaboration.",
        variables: [
          { name: "company_type", description: "Type of company", defaultValue: "tech startup" },
          { name: "team_scenario", description: "What the team is doing", defaultValue: "a cross-functional team collaborating around a whiteboard during a brainstorm session" },
          { name: "office_style", description: "Office environment style", defaultValue: "modern open-plan with warm wood and green plants" },
          { name: "number_people", description: "Number of team members", defaultValue: "5-6" },
          { name: "activity", description: "Specific activity", defaultValue: "one person sketching on whiteboard while others discuss and gesture at ideas, some standing some sitting on high stools" },
          { name: "diversity_note", description: "Team diversity representation", defaultValue: "mixed gender and ethnicity, ages 25-45, inclusive representation" },
          { name: "office_details", description: "Workspace environmental details", defaultValue: "large monitor showing data dashboard, colorful post-it notes on glass wall, standing desks, company logo subtle on far wall" },
          { name: "office_lighting", description: "Lighting quality", defaultValue: "abundant natural light from floor-to-ceiling windows with warm pendant fixtures" },
          { name: "camera_angle", description: "Photography perspective", defaultValue: "eye-level from slightly outside the group, documentary style" },
          { name: "culture_mood", description: "Overall mood to convey", defaultValue: "energetic innovation and genuine team connection" },
          { name: "dress_code", description: "Team wardrobe style", defaultValue: "smart casual — button-ups, nice tees, no suits" }
        ]
      },
      {
        title: "Data Visualization Background",
        content: "Create a presentation background image (16:9) designed to sit behind data charts and graphs for a {{data_topic}} dashboard slide. The background features an abstract {{visual_theme}} with subtle {{data_elements}} elements integrated into the design. Color scheme: {{bg_palette}} — dark enough for white text and chart colors to pop, but with enough visual interest to avoid boring solid-color slides. The design has a clear {{grid_structure}} grid structure that helps align chart elements. Subtle {{ambient_effects}} effects add depth without competing with foreground data. Central area (60% of frame) is intentionally subdued for chart overlay — visual interest concentrates at edges and corners. Opacity: the background should feel like it sits at 85-90% presence — present but not overwhelming. Style: {{design_approach}}. The overall impression should elevate a data slide from spreadsheet-dump to executive-quality insight presentation.",
        description: "Generates a sophisticated dark background optimized for layering data visualizations and charts on top.",
        variables: [
          { name: "data_topic", description: "Type of data being presented", defaultValue: "revenue and growth metrics" },
          { name: "visual_theme", description: "Abstract visual theme", defaultValue: "flowing data streams and network connections" },
          { name: "data_elements", description: "Data-themed decorative elements", defaultValue: "abstract bar chart silhouettes, node-link diagrams, and heat-map gradients" },
          { name: "bg_palette", description: "Background color palette", defaultValue: "deep charcoal #1E1E2E with teal #00B4D8 and gold #FFB700 accent glows" },
          { name: "grid_structure", description: "Underlying grid pattern", defaultValue: "subtle 12-column dot grid with thin horizontal section dividers" },
          { name: "ambient_effects", description: "Atmospheric depth effects", defaultValue: "soft gradient orbs and faint particle clouds" },
          { name: "design_approach", description: "Design style", defaultValue: "modern data dashboard aesthetic with glassmorphism undertones" }
        ]
      }
    ],
    examples: [
      {
        input: "presentation_topic: annual sustainability report, visual_metaphor: a single tree growing from cracked earth transforming into a lush forest canopy with the transition showing stages of growth, visual_style: fine art photography with painterly qualities, color_scheme: earth tones — forest green, warm brown, sky blue, and golden sunlight, weight_position: center-right, text_area: left quarter, depth_treatment: tilt-shift miniature effect making the forest feel vast, lighting: soft diffused overcast with shafts of golden sunlight breaking through, thematic_elements: small wildlife details — a bird in flight, a butterfly near blooming branches",
        output: "A breathtaking 16:9 keynote hero showing a visual journey from left to right: cracked, dry earth gives way to a single resilient sapling that transitions into a magnificent, lush forest canopy filling the right two-thirds. Tilt-shift processing creates epic scale. Shafts of golden sunlight penetrate the canopy, illuminating the transformation. A bird soars through a light shaft and a monarch butterfly rests near blooming branches — subtle but meaningful details. The left quarter remains open with soft, diffused light for title text. Earth tones dominate: rich greens, warm browns, and golden light against a gentle sky blue.",
        image: cover("pm-10-pod-designs")
      },
      {
        input: "data_topic: customer acquisition funnel metrics, visual_theme: geometric crystalline structures dissolving into data particles, data_elements: abstract funnel shapes, conversion arrows, and user silhouette clusters, bg_palette: midnight blue #0D1B2A with electric purple #7B2FBE and cyan #00F5D4 accents, grid_structure: perspective grid receding to center vanishing point, ambient_effects: volumetric light beams and floating geometric shards, design_approach: sci-fi command center meets executive dashboard",
        output: "A sophisticated 16:9 data background in deep midnight blue. Geometric crystalline structures emerge from the edges, dissolving into flowing data particles as they approach center. A perspective grid recedes to a central vanishing point, creating natural alignment guides for chart placement. Abstract funnel shapes and conversion arrows are subtly embedded in the crystalline structures. Electric purple and cyan accent glows highlight key geometric intersections. Volumetric light beams sweep diagonally across the composition. The center 60% remains subdued — perfect for overlaying white-text charts and KPI cards.",
        image: cover("pm-10-pod-designs")
      }
    ]
  },

  /* ═══════════════════════════════════════════════════
   * 11. PERFORMANCE AD CREATIVE
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Performance Ad Creative", vi: "Thiết Kế Quảng Cáo Hiệu Suất" },
    category: "marketing",
    tags: ["advertising", "ad-creative", "facebook", "google-ads", "performance", "conversion", "meta", "display"],
    priceSKT: 85,
    sellerIdx: 6,
    description: {
      en: "Generate high-converting ad creatives for Facebook/Meta, Google Display Network, and product comparison campaigns. Each prompt is optimized for click-through rates with proven visual hierarchy and attention-grabbing layouts.",
      vi: "Tạo hình ảnh quảng cáo chuyển đổi cao cho Facebook/Meta, Google Display Network và chiến dịch so sánh sản phẩm. Mỗi prompt được tối ưu cho tỷ lệ nhấp chuột với bố cục thu hút và hệ thống thị giác đã được chứng minh."
    },
    previewText: "High-converting ad visuals for Facebook, Google Display, and comparison ads — optimized for CTR and conversions.",
    coverImage: cover("pm-11-ad-creative"),
    models: ["dall-e-3", "midjourney", "stable-diffusion-xl", "flux"],
    prompts: [
      {
        title: "Facebook/Meta Ad Image",
        content: "Create a high-converting Facebook ad image for a {{product_type}} product. The image is {{aspect_ratio}} with a {{bg_color}} background that pops in the news feed. Hero product: {{product_description}} positioned prominently with a slight 15-degree angle for dynamism. Add a {{accent_color}} accent element (ribbon, badge, or burst) in the top-right corner suggesting {{offer_text}}. Visual hierarchy: product occupies 60% of frame, supporting elements 20%, breathing space 20%. Style: {{creative_style}} with studio-quality lighting — key light from upper-left, soft fill from right, subtle rim light for product separation. No text in the image (text will be added in ad manager). The overall feel should trigger {{emotion}} and drive immediate click intent. Clean, uncluttered, scroll-stopping composition.",
        description: "Generates a scroll-stopping Facebook/Meta ad image optimized for news feed engagement and click-through.",
        variables: [
          { name: "product_type", description: "Category of product being advertised", defaultValue: "wireless earbuds" },
          { name: "aspect_ratio", description: "Image dimensions", defaultValue: "1:1 (1080x1080)" },
          { name: "bg_color", description: "Background color that contrasts with Facebook's white feed", defaultValue: "deep matte black" },
          { name: "product_description", description: "Detailed product visual description", defaultValue: "sleek white wireless earbuds with charging case, slightly open showing LED indicators" },
          { name: "accent_color", description: "Accent color for promotional elements", defaultValue: "electric coral red" },
          { name: "offer_text", description: "What the accent element hints at", defaultValue: "limited-time 40% off" },
          { name: "creative_style", description: "Visual creative approach", defaultValue: "premium tech product photography" },
          { name: "emotion", description: "Target emotional response", defaultValue: "desire and urgency" }
        ]
      },
      {
        title: "Google Display Banner",
        content: "Design a Google Display Network banner ad visual in {{banner_size}} format for a {{business_type}} business. Layout: left {{layout_split}}% features {{visual_element}} with professional photography quality, right side has a clean solid {{brand_color}} area reserved for headline and CTA button placement. The visual element should convey {{value_proposition}}. Style: {{design_style}}, sharp edges, high contrast for small-size readability. Include a subtle {{border_treatment}} border treatment. The image should work at both full size and scaled down to 50%. Lighting: crisp and commercial with no ambiguity. Background: {{background}} with zero visual noise. Every pixel should serve the conversion goal — no decorative clutter.",
        description: "Creates a conversion-focused Google Display banner with clear visual hierarchy optimized for various display sizes.",
        variables: [
          { name: "banner_size", description: "Banner dimensions", defaultValue: "728x90 leaderboard" },
          { name: "business_type", description: "Type of business", defaultValue: "online fitness coaching" },
          { name: "layout_split", description: "Percentage for visual vs text area", defaultValue: "45" },
          { name: "visual_element", description: "Main visual content", defaultValue: "athletic person mid-workout with determined expression" },
          { name: "brand_color", description: "Primary brand color for text area", defaultValue: "energetic orange #FF6B35" },
          { name: "value_proposition", description: "What the visual should communicate", defaultValue: "transformation and achievable fitness goals" },
          { name: "design_style", description: "Design approach", defaultValue: "bold and modern with geometric accents" },
          { name: "border_treatment", description: "Border styling", defaultValue: "1px solid dark gray" },
          { name: "background", description: "Background treatment for visual area", defaultValue: "dark gym environment with dramatic spot lighting" }
        ]
      },
      {
        title: "Product Comparison Ad",
        content: "Create a side-by-side product comparison ad image for {{product_category}}. Layout: split-screen composition with a subtle diagonal or curved divider. Left side (labeled 'Before' or 'Others'): {{comparison_left}} shown in {{left_mood}} tones — desaturated, slightly flat lighting, conveying frustration or mediocrity. Right side (labeled 'Our Solution'): {{comparison_right}} shown in {{right_mood}} tones — vibrant, premium lighting with slight golden hour warmth, conveying success. A subtle visual arrow or flow guides the eye from left to right. The divider uses a {{divider_style}} effect. Bottom area: clean space for pricing or CTA overlay. Format: {{format}}. The contrast between sides should be immediately obvious even at thumbnail size. Professional advertising photography quality with intentional color grading difference between halves.",
        description: "Generates a compelling before/after or us-vs-them comparison ad that visually demonstrates product superiority.",
        variables: [
          { name: "product_category", description: "What products are being compared", defaultValue: "project management software" },
          { name: "comparison_left", description: "The 'before' or competitor visual", defaultValue: "cluttered desk with sticky notes, messy papers, stressed person looking at old spreadsheet" },
          { name: "comparison_right", description: "The 'after' or your product visual", defaultValue: "clean minimal desk with sleek laptop showing organized dashboard, relaxed person smiling" },
          { name: "left_mood", description: "Color mood for the left/before side", defaultValue: "cool gray, slightly blue-desaturated" },
          { name: "right_mood", description: "Color mood for the right/after side", defaultValue: "warm, vibrant with golden accents" },
          { name: "divider_style", description: "Style of the center divider", defaultValue: "lightning bolt zigzag with gradient glow" },
          { name: "format", description: "Ad format dimensions", defaultValue: "1200x628 landscape" }
        ]
      }
    ],
    examples: [
      {
        input: "product_type: smart water bottle, aspect_ratio: 1:1, bg_color: gradient midnight blue to black, product_description: matte black smart water bottle with LED temperature display glowing blue, accent_color: neon cyan, offer_text: new launch special, creative_style: sleek tech product shot, emotion: curiosity and desire",
        output: "A striking 1:1 Facebook ad image with a midnight blue-to-black gradient background. The matte black smart water bottle sits at a dynamic 15-degree angle, its blue LED temperature display glowing brilliantly against the dark backdrop. A neon cyan ribbon badge in the top-right corner hints at the launch special. Dramatic studio lighting creates a premium tech feel — sharp key light from upper-left with cyan-tinted rim light separating the product from the background. Clean, minimal, instantly scroll-stopping.",
        image: cover("pm-11-ad-creative")
      },
      {
        input: "product_category: meal delivery service, comparison_left: person eating sad desk lunch from plastic container in fluorescent office, comparison_right: same person enjoying colorful chef-prepared meal at home with fresh ingredients visible, left_mood: harsh fluorescent green-gray, right_mood: warm natural daylight with rich food colors, divider_style: smooth S-curve with subtle sparkle, format: 1080x1080 square",
        output: "A powerful 1:1 comparison ad split by an elegant S-curve divider with subtle sparkle effect. Left side shows a worker unenthusiastically eating a bland plastic-container lunch under harsh fluorescent lighting — desaturated gray-green tones convey the monotony. Right side transforms to the same person at home savoring a vibrant, chef-quality meal with colorful fresh ingredients — warm natural daylight and rich food colors create an appetizing, aspirational scene. The contrast is immediately obvious even as a thumbnail.",
        image: cover("pm-11-ad-creative")
      }
    ]
  },

  /* ═══════════════════════════════════════════════════
   * 12. PREMIUM PACKAGING & BRANDING
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Premium Packaging & Branding", vi: "Thiết Kế Bao Bì & Thương Hiệu Cao Cấp" },
    category: "design",
    tags: ["packaging", "branding", "mockup", "luxury", "cosmetic", "product-design"],
    priceSKT: 90,
    isFree: false,
    featured: false,
    sellerIdx: 6,
    description: {
      en: "AI prompts for luxury packaging design — unboxing experiences, cosmetic lineups, and artisan food packaging with premium branding aesthetics.",
      vi: "Prompt AI cho thiết kế bao bì cao cấp — trải nghiệm unboxing, dòng mỹ phẩm và bao bì thực phẩm thủ công với thẩm mỹ thương hiệu sang trọng.",
    },
    previewText: "Generate premium packaging mockups and branding visuals — luxury unboxing, cosmetic product lines, and artisan food packaging with studio-quality rendering.",
    coverImage: cover("pm-12-packaging"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Luxury Box Unboxing",
        content: "A cinematic unboxing scene of a {{product_category}} luxury gift box. The outer box is {{box_material}} with {{finishing_detail}}. The lid is partially lifted revealing {{inner_contents}} nestled in {{inner_lining}}. The scene is set on a {{surface_material}} surface. Ambient lighting: {{ambient_light}} with a warm key light from the upper left casting elegant shadows. Scattered around the box: {{styling_props}}. Brand identity elements include {{brand_elements}}. The mood is {{mood}} — evoking anticipation and premium quality. Depth of field: shallow, f/2.8. 8K, photorealistic, luxury e-commerce photography.",
        description: "Create a cinematic luxury unboxing scene showcasing premium packaging with aspirational brand storytelling.",
        variables: [
          { name: "product_category", description: "Product type", defaultValue: "premium skincare" },
          { name: "box_material", description: "Outer box material", defaultValue: "matte black rigid board with soft-touch lamination" },
          { name: "finishing_detail", description: "Box finishing", defaultValue: "debossed gold foil logo and magnetic closure" },
          { name: "inner_contents", description: "Contents visible inside", defaultValue: "three amber glass bottles with gold dropper caps" },
          { name: "inner_lining", description: "Interior presentation", defaultValue: "ivory silk-lined custom foam insert" },
          { name: "surface_material", description: "Surface beneath box", defaultValue: "white Carrara marble" },
          { name: "ambient_light", description: "Ambient lighting style", defaultValue: "soft diffused daylight from a nearby window" },
          { name: "styling_props", description: "Surrounding props", defaultValue: "dried botanicals, a handwritten thank-you card, and tissue paper" },
          { name: "brand_elements", description: "Branding details", defaultValue: "a wax seal on the tissue and a monogram ribbon" },
          { name: "mood", description: "Overall mood", defaultValue: "intimate, warm, and indulgent" },
        ],
      },
      {
        title: "Cosmetic Packaging Lineup",
        content: "A perfectly aligned product lineup of a {{brand_style}} cosmetic brand featuring {{product_count}} products: {{product_list}}. Each package shares a cohesive design language with {{design_system}}. Arranged in a {{formation}} on a {{backdrop}}. Lighting: {{lighting}} producing clean reflections and defined edges. One hero product is positioned slightly forward with a {{hero_treatment}}. Background: {{bg_treatment}}. Typography on packaging is sharp and legible. The composition conveys brand consistency, sophistication, and shelf appeal. Commercial photography style, 8K, photorealistic.",
        description: "Generate a cohesive cosmetic product lineup that showcases brand identity and packaging design consistency.",
        variables: [
          { name: "brand_style", description: "Brand aesthetic", defaultValue: "Korean minimalist clean beauty" },
          { name: "product_count", description: "Number of products", defaultValue: "five" },
          { name: "product_list", description: "Products in the lineup", defaultValue: "cleanser, toner, serum, moisturizer, and SPF" },
          { name: "design_system", description: "Shared design elements", defaultValue: "frosted glass vessels, matte white caps, and pastel gradient labels" },
          { name: "formation", description: "Arrangement style", defaultValue: "staggered diagonal line with decreasing height" },
          { name: "backdrop", description: "Surface/backdrop", defaultValue: "pale pink acrylic surface" },
          { name: "lighting", description: "Lighting setup", defaultValue: "large overhead softbox with fill cards on both sides" },
          { name: "hero_treatment", description: "Hero product emphasis", defaultValue: "subtle spotlight halo and a single water droplet on the cap" },
          { name: "bg_treatment", description: "Background style", defaultValue: "seamless gradient from blush pink to white" },
        ],
      },
      {
        title: "Artisan Food Packaging",
        content: "A warm, inviting product photograph of {{food_product}} artisan food packaging for a {{brand_personality}} brand. The packaging features {{packaging_type}} with {{print_details}}. The product is styled on a {{surface}} with {{food_styling}} — some contents artfully spilling out to show the product inside. Background props: {{bg_props}}. Lighting: {{food_lighting}} evoking a {{time_of_day}} kitchen atmosphere. Warm color temperature around 3500K. Visible texture on all surfaces — paper grain, food crumbles, wood grain. The image feels handcrafted, artisanal, and appetizing. 8K, photorealistic, food photography editorial quality.",
        description: "Design artisan food packaging photography with rustic charm, brand storytelling, and appetite appeal.",
        variables: [
          { name: "food_product", description: "Food product type", defaultValue: "single-origin dark chocolate bars" },
          { name: "brand_personality", description: "Brand character", defaultValue: "rustic artisan with modern typography" },
          { name: "packaging_type", description: "Package format", defaultValue: "kraft paper wrapper with a belly band" },
          { name: "print_details", description: "Print/design details", defaultValue: "letterpress-printed label with hand-drawn cacao illustrations in navy ink" },
          { name: "surface", description: "Styling surface", defaultValue: "reclaimed oak cutting board" },
          { name: "food_styling", description: "Food styling approach", defaultValue: "one bar unwrapped showing the snap line with broken chocolate pieces" },
          { name: "bg_props", description: "Background props", defaultValue: "raw cacao beans, a copper bowl of cocoa nibs, and burlap cloth" },
          { name: "food_lighting", description: "Lighting style", defaultValue: "warm side-light with a gentle backlight rim" },
          { name: "time_of_day", description: "Atmosphere reference", defaultValue: "golden hour morning" },
        ],
      },
    ],
    examples: [
      {
        input: "Luxury skincare unboxing on marble with gold foil branding and silk lining",
        output: "Cinematic unboxing scene of a premium skincare gift box in matte black rigid board with debossed gold foil logo. Lid partially lifted revealing amber glass bottles in ivory silk-lined insert on white Carrara marble. Warm key light, dried botanicals and wax seal accents. 8K photorealistic luxury e-commerce photography.",
        image: cover("pm-12-packaging"),
      },
      {
        input: "Artisan coffee brand packaging on wooden surface with beans scattered around",
        output: "Warm product photograph of artisan single-origin coffee in kraft paper bags with letterpress labels. Styled on reclaimed oak with roasted beans artfully scattered, a copper scoop, and burlap cloth. Warm side-light evoking golden hour. Handcrafted, rustic, appetizing. 8K food photography editorial quality.",
        image: example("ex-12-coffee-brand"),
      },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 13. REAL ESTATE & PROPERTY MARKETING
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Real Estate & Property Marketing", vi: "Marketing Bất Động Sản" },
    category: "business",
    tags: ["real-estate", "property", "architecture", "luxury", "staging", "marketing", "interior", "aerial"],
    priceSKT: 100,
    sellerIdx: 4,
    description: {
      en: "Generate photorealistic real estate marketing visuals — luxury twilight exteriors, interior staging renders, and aerial property overviews. Perfect for agents, developers, and property marketers looking to create listing images that sell.",
      vi: "Tạo hình ảnh marketing bất động sản siêu thực — ngoại thất hoàng hôn sang trọng, nội thất staging, và tổng quan bất động sản từ trên cao. Hoàn hảo cho môi giới, nhà phát triển và marketer bất động sản muốn tạo ảnh listing bán được hàng."
    },
    previewText: "Photorealistic property visuals — twilight exteriors, staged interiors, and aerial overviews for real estate listings.",
    coverImage: cover("pm-13-real-estate"),
    models: ["midjourney", "dall-e-3", "flux", "stable-diffusion-xl"],
    prompts: [
      {
        title: "Luxury Property Exterior — Twilight",
        content: "Create a photorealistic twilight exterior photograph of a {{property_type}} property for a luxury real estate listing. The home is {{architecture_style}} architecture with {{exterior_materials}} exterior materials. The shot is taken from {{camera_position}} at blue hour — deep indigo sky with the last traces of warm sunset on the horizon. All interior lights are warmly lit (3000K warm white), glowing invitingly through {{window_style}} windows. Exterior features: {{landscape_features}}. The driveway or entrance features {{entrance_detail}}. Landscape lighting: {{landscape_lighting}} creating pools of warm light on architectural features and pathways. Include {{atmospheric_elements}} for ambiance. Water features or pools glow with {{pool_lighting}}. The photograph has the quality of a professional architectural photographer using a {{camera_setup}}. Post-processing: HDR-merged exposures with natural-looking tone mapping, slightly enhanced saturation on sky gradient.",
        description: "Generates a magazine-quality twilight exterior shot — the gold standard of luxury real estate photography.",
        variables: [
          { name: "property_type", description: "Type of property", defaultValue: "5-bedroom contemporary estate" },
          { name: "architecture_style", description: "Architectural style", defaultValue: "modern Mediterranean with clean lines" },
          { name: "exterior_materials", description: "Building materials visible", defaultValue: "white stucco, natural stone accent walls, dark bronze aluminum frames" },
          { name: "camera_position", description: "Photographer's position", defaultValue: "front-left angle at 30 degrees, slightly low to emphasize grandeur" },
          { name: "window_style", description: "Window type", defaultValue: "floor-to-ceiling glass panels and arched feature windows" },
          { name: "landscape_features", description: "Front landscape details", defaultValue: "mature olive trees, sculpted hedges, limestone pathway, and a reflective infinity pool to the right" },
          { name: "entrance_detail", description: "Entrance/driveway feature", defaultValue: "circular motor court with a central fountain and herringbone paver driveway" },
          { name: "landscape_lighting", description: "Outdoor lighting design", defaultValue: "uplights on trees, recessed path lights, and wall-wash fixtures on stone features" },
          { name: "atmospheric_elements", description: "Atmospheric details", defaultValue: "faint wispy clouds catching last pink light, slight mist rising from the pool" },
          { name: "pool_lighting", description: "Pool or water feature lighting", defaultValue: "turquoise underwater LEDs with subtle steam rising in cool evening air" },
          { name: "camera_setup", description: "Camera and lens description", defaultValue: "Sony A7R IV with 24mm tilt-shift lens, f/8, tripod-mounted" }
        ]
      },
      {
        title: "Interior Staging Visualization",
        content: "Create a photorealistic interior staging render of a {{room_type}} in a {{property_style}} property. The room features {{architectural_details}} with {{flooring}} flooring and {{ceiling}} ceiling. Furniture staging: {{furniture_layout}} arranged in a {{layout_style}} layout. Color palette: {{interior_palette}}. Styling details: {{styling_elements}}. Natural light enters from {{light_source}}, creating beautiful {{light_quality}} across the space. Supplementary lighting: {{artificial_lighting}}. The room has a focal point: {{focal_point}}. Through the windows, a {{view}} view is visible. Include lifestyle touches: {{lifestyle_touches}} to help buyers envision living there. Camera: {{interior_camera}} perspective. The render quality should be indistinguishable from a real interior photograph — perfect white balance, natural material textures, and realistic light behavior on surfaces.",
        description: "Produces photorealistic interior staging renders that help buyers envision the space fully furnished and styled.",
        variables: [
          { name: "room_type", description: "Type of room", defaultValue: "open-plan living and dining area" },
          { name: "property_style", description: "Property style", defaultValue: "luxury modern coastal" },
          { name: "architectural_details", description: "Architectural features", defaultValue: "14-foot ceilings, retractable glass wall to terrace, white oak accent wall with integrated fireplace" },
          { name: "flooring", description: "Floor material", defaultValue: "wide-plank white oak engineered hardwood" },
          { name: "ceiling", description: "Ceiling treatment", defaultValue: "coffered ceiling with recessed LED cove lighting" },
          { name: "furniture_layout", description: "Furniture pieces", defaultValue: "oversized linen sectional in oatmeal, walnut coffee table, pair of boucle accent chairs, 8-seat dining table with rattan chairs" },
          { name: "layout_style", description: "Arrangement approach", defaultValue: "open and conversational with defined living and dining zones" },
          { name: "interior_palette", description: "Interior color scheme", defaultValue: "warm whites, natural wood, sandy beige, with ocean blue accents" },
          { name: "styling_elements", description: "Decorative styling", defaultValue: "oversized ceramic vases, coffee table books, woven throw blankets, potted fiddle leaf fig, abstract coastal artwork" },
          { name: "light_source", description: "Natural light direction", defaultValue: "west-facing floor-to-ceiling glass wall, afternoon golden hour light" },
          { name: "light_quality", description: "How light plays in the space", defaultValue: "long warm shadows and bright reflections on the polished floor" },
          { name: "artificial_lighting", description: "Designed lighting", defaultValue: "sculptural pendant over dining table, floor lamp beside sectional, cove lighting in ceiling" },
          { name: "focal_point", description: "Room's main visual anchor", defaultValue: "linear gas fireplace set in the white oak accent wall with floating shelves" },
          { name: "view", description: "View through windows", defaultValue: "panoramic ocean coastline with visible horizon line" },
          { name: "lifestyle_touches", description: "Lived-in details", defaultValue: "open book face-down on sofa arm, wine glasses on dining table, fresh eucalyptus in vase" },
          { name: "interior_camera", description: "Camera angle", defaultValue: "wide-angle from entrance corner, eye-level, capturing full room depth toward ocean view" }
        ]
      },
      {
        title: "Aerial Property Overview",
        content: "Create a photorealistic aerial/drone photograph of a {{property_description}} property and its surrounding grounds. The drone is positioned at {{drone_altitude}} altitude at a {{drone_angle}} angle. The property showcases: {{property_features}} clearly visible from above. Surrounding landscape: {{surrounding_landscape}}. Time of day: {{time_of_day}} providing {{shadow_quality}} shadows that reveal the property's dimensional features. The property boundary is subtly defined by {{boundary_markers}}. Neighboring context: {{neighborhood_context}}. Include {{aerial_details}} that demonstrate the property's scale and amenities. Color treatment: {{aerial_color}} — the rich, saturated look of professional real estate drone photography. Weather: {{weather}} for maximum visual appeal. Camera simulation: {{drone_camera}} with slight natural lens barrel correction. The image should make a buyer immediately understand the property's layout, scale, and relationship to its surroundings.",
        description: "Generates professional drone-style aerial views showing full property layout, grounds, and surrounding context.",
        variables: [
          { name: "property_description", description: "Property overview", defaultValue: "2-acre luxury hillside estate" },
          { name: "drone_altitude", description: "Drone height", defaultValue: "150 feet" },
          { name: "drone_angle", description: "Camera angle from drone", defaultValue: "45-degree oblique looking north" },
          { name: "property_features", description: "Key features visible from above", defaultValue: "main residence with clay tile roof, detached guest house, infinity pool with spa, tennis court, and circular driveway" },
          { name: "surrounding_landscape", description: "Landscape beyond property", defaultValue: "mature oak and cypress trees, terraced gardens with lavender rows, vine-covered pergola walkway" },
          { name: "time_of_day", description: "Time of day", defaultValue: "late afternoon golden hour" },
          { name: "shadow_quality", description: "Shadow characteristics", defaultValue: "long, warm directional" },
          { name: "boundary_markers", description: "Property boundary indicators", defaultValue: "stone walls with mature hedgerow and wrought iron gates at entrance" },
          { name: "neighborhood_context", description: "What's around the property", defaultValue: "rolling countryside with distant mountain views and scattered luxury estates" },
          { name: "aerial_details", description: "Scale-showing details", defaultValue: "cars in driveway for scale, outdoor dining setup on terrace, lounge chairs by pool" },
          { name: "aerial_color", description: "Color treatment", defaultValue: "vibrant natural greens, warm stone tones, and deep blue pool water" },
          { name: "weather", description: "Weather conditions", defaultValue: "clear sky with a few decorative cumulus clouds" },
          { name: "drone_camera", description: "Drone camera specs", defaultValue: "DJI Mavic 3 with Hasselblad camera, 24mm equivalent" }
        ]
      }
    ],
    examples: [
      {
        input: "property_type: modern penthouse with rooftop terrace, architecture_style: ultra-modern glass and steel, exterior_materials: dark charcoal metal cladding and floor-to-ceiling glass curtain wall, camera_position: street level looking up at 20 degrees to capture building height, window_style: seamless floor-to-ceiling glass with invisible frames, landscape_features: minimalist zen garden at ground level with architectural grasses and illuminated water feature, entrance_detail: grand double-height glass lobby entrance with floating stone steps, landscape_lighting: linear LED strips along building edges and warm spotlights on water feature, atmospheric_elements: city skyline reflected in glass facade, light urban haze, pool_lighting: rooftop infinity pool edge visible with warm underwater glow, camera_setup: Canon R5 with 16-35mm f/2.8 at 24mm",
        output: "A breathtaking twilight shot of a modern penthouse building. The camera looks upward from street level, capturing the full height of the dark charcoal and glass tower against a deep indigo blue-hour sky. Every floor glows with warm 3000K interior light through seamless glass walls, creating a stunning lantern effect. At street level, a zen garden with architectural grasses flanks the double-height glass lobby with floating stone steps. Linear LED strips trace the building's angular edges. The rooftop infinity pool is just visible at the crown, its warm glow spilling over the edge. City skyline reflections dance across the glass facade. Professional HDR quality with perfectly balanced exposures.",
        image: cover("pm-13-real-estate")
      },
      {
        input: "room_type: primary bedroom suite, property_style: contemporary mountain lodge, architectural_details: exposed timber beam ceiling, floor-to-ceiling stone fireplace wall, large picture window, flooring: hand-scraped walnut hardwood with plush area rug, ceiling: vaulted with massive exposed Douglas fir beams, furniture_layout: king platform bed in dark walnut with linen bedding, matching nightstands, reading chaise by window, small writing desk, layout_style: symmetrical and serene with bed as centerpiece, interior_palette: charcoal, warm gray, cream, with rust and forest green textile accents, styling_elements: sheepskin throw, stacked hardcover books, ceramic bedside lamp, dried pampas arrangement, light_source: east-facing picture window with morning light, light_quality: soft dawn light with warm beams across the bed, artificial_lighting: wall sconces flanking bed and pendant reading light over chaise, focal_point: massive floor-to-ceiling stacked stone fireplace with live-edge mantel, view: snow-capped mountain range through pine forest, lifestyle_touches: reading glasses on open book on nightstand, cashmere robe draped on chaise, steaming mug on writing desk, interior_camera: from doorway threshold looking toward fireplace and mountain view",
        output: "A stunning photorealistic bedroom suite in a contemporary mountain lodge. Shot from the doorway, the eye travels across hand-scraped walnut floors to a king platform bed with crisp linen bedding centered under massive Douglas fir beams. A floor-to-ceiling stacked stone fireplace with a live-edge mantel anchors the far wall. Through the large picture window, snow-capped peaks rise above a pine forest, bathed in soft morning light that casts warm beams across the cream bedding. A reading chaise draped with a cashmere robe sits by the window. Rust and forest green textiles add mountain-lodge warmth. Every detail — reading glasses on a book, a steaming mug — invites you to live here.",
        image: cover("pm-13-real-estate")
      }
    ]
  },

  /* ═══════════════════════════════════════════════════
   * 14. CINEMATIC FILM STILLS
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Cinematic Film Still Generator", vi: "Bộ tạo ảnh phim Cinematic" },
    category: "other",
    tags: ["cinematic", "film", "sci-fi", "noir", "movie-still"],
    priceSKT: 105,
    featured: true,
    sellerIdx: 8,
    description: {
      en: "Create Hollywood-quality cinematic film stills. Sci-fi thrillers, film noir mysteries, and epic space opera scenes with ARRI Alexa and anamorphic lens aesthetics.",
      vi: "Tạo ảnh phim chất lượng Hollywood. Sci-fi thriller, film noir mystery, và space opera với ARRI Alexa và ống kính anamorphic."
    },
    previewText: "A cinematic film still from an imaginary {{genre}}, {{character}} in {{setting}}...",
    coverImage: cover("pm-14-cinematic"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Sci-Fi Film Still",
        content: "A cinematic film still from an imaginary {{genre}}, {{character}} in {{environment}}, looking out at {{vista}}, {{lighting}}, {{atmosphere}}, shot on {{camera}} with {{lenses}}, {{director}} cinematography style, no text",
        description: "Sci-fi cinematic film still",
        variables: [
          { name: "genre", description: "Genre", defaultValue: "sci-fi thriller" },
          { name: "character", description: "Character", defaultValue: "a lone astronaut in a weathered white spacesuit standing in the doorway of a massive derelict space station" },
          { name: "environment", description: "Environment", defaultValue: "a corridor with emergency red lights flickering" },
          { name: "vista", description: "Vista/view", defaultValue: "a gas giant planet filling the viewport with swirling amber and crimson storms" },
          { name: "lighting", description: "Lighting", defaultValue: "emergency red lights flickering in the corridor behind" },
          { name: "atmosphere", description: "Atmosphere", defaultValue: "dust particles floating in zero gravity catching the light, anamorphic lens flare" },
          { name: "camera", description: "Camera", defaultValue: "ARRI Alexa 65" },
          { name: "lenses", description: "Lenses", defaultValue: "Panavision C-series anamorphic lenses" },
          { name: "director", description: "Director reference", defaultValue: "Denis Villeneuve" },
        ],
      },
      {
        title: "Film Noir Still",
        content: "A cinematic film noir still, {{character}} on {{location}}, {{smoke_detail}}, {{reflections}}, {{mystery_element}}, {{shadow_pattern}}, shot on {{camera}} with {{lenses}}, {{cinematographer}} lighting, no text",
        description: "Classic film noir with dramatic shadows",
        variables: [
          { name: "character", description: "Character", defaultValue: "a detective in a long trench coat and fedora standing under a single flickering street lamp" },
          { name: "location", description: "Location", defaultValue: "a rain-soaked cobblestone street at midnight" },
          { name: "smoke_detail", description: "Smoke/atmosphere", defaultValue: "cigarette smoke curling upward into the cone of amber light" },
          { name: "reflections", description: "Reflections", defaultValue: "reflections of distant neon signs shimmering on wet pavement" },
          { name: "mystery_element", description: "Mystery element", defaultValue: "a mysterious figure's shadow visible at the end of the alley" },
          { name: "shadow_pattern", description: "Shadow pattern", defaultValue: "venetian blind shadow pattern falling across the detective's face" },
          { name: "camera", description: "Camera", defaultValue: "ARRI Alexa" },
          { name: "lenses", description: "Lenses", defaultValue: "vintage Cooke Speed Panchro lenses" },
          { name: "cinematographer", description: "Cinematographer", defaultValue: "Roger Deakins" },
        ],
      },
    ],
    examples: [
      { input: "Astronaut in derelict space station, Denis Villeneuve style", output: "Cinematic sci-fi still with gas giant vista, zero-gravity dust particles, red emergency lighting, and anamorphic flare.", image: cover("pm-14-cinematic") },
      { input: "Film noir detective on rain-soaked cobblestone street", output: "Classic noir with venetian blind shadows, cigarette smoke, neon reflections, and Roger Deakins lighting.", image: example("ex-07-noir-detective") },
    ],
  },


  /* ═══════════════════════════════════════════════════
   * 15. EDUCATIONAL DIAGRAM & EXPLAINER
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Educational Diagram & Explainer", vi: "Sơ Đồ Giáo Dục & Giải Thích" },
    category: "education",
    tags: ["education", "diagram", "explainer", "infographic", "learning", "visual-aid", "process-flow", "timeline"],
    priceSKT: 70,
    isFree: true,
    sellerIdx: 5,
    description: {
      en: "Create clear, engaging educational diagrams including process flows, comparison infographics, and timeline visualizations. Perfect for teachers, students, and content creators who need to explain complex concepts visually.",
      vi: "Tạo sơ đồ giáo dục rõ ràng, hấp dẫn bao gồm sơ đồ quy trình, infographic so sánh và trực quan hóa dòng thời gian. Hoàn hảo cho giáo viên, học sinh và nhà sáng tạo nội dung cần giải thích khái niệm phức tạp bằng hình ảnh."
    },
    previewText: "Process flows, comparison infographics, and timeline visualizations for education.",
    coverImage: cover("pm-15-fantasy-art"),
    models: ["gpt-4o", "dall-e-3", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Process Flow Diagram",
        content: "Design an educational process flow diagram explaining {{process_topic}}. The flow has {{num_steps}} steps: {{steps_list}}. Layout: {{flow_direction}} flow with {{connector_style}} connectors. Each step is represented as a {{node_shape}} containing a {{icon_style}} icon and a short label. Decision points (if any): {{decision_points}}. Color coding: {{color_scheme}} — each phase uses a distinct shade to show progression. Typography: {{typography}} — step labels at {{label_size}}, descriptions at {{desc_size}}. Background: {{background}}. Include a {{legend}} legend. Add {{annotations}} callout annotations for key insights. The diagram must be self-explanatory — a student should understand the entire process without additional text. Style: {{visual_style}}. Aspect ratio: {{aspect_ratio}}.",
        description: "Generate a clear, colorful process flow diagram with icons, decision points, color-coded phases, and educational annotations.",
        variables: [
          { name: "process_topic", description: "What process to explain", defaultValue: "how photosynthesis works — from sunlight absorption to glucose production" },
          { name: "num_steps", description: "Number of process steps", defaultValue: "6" },
          { name: "steps_list", description: "List of steps in order", defaultValue: "1) Sunlight hits leaf surface, 2) Chlorophyll absorbs light energy, 3) Water molecules split (photolysis), 4) Light reactions produce ATP & NADPH, 5) Calvin Cycle fixes CO₂, 6) Glucose is synthesized" },
          { name: "flow_direction", description: "Flow direction", defaultValue: "left-to-right with a return loop from step 6 back to the Calvin Cycle" },
          { name: "connector_style", description: "How steps connect", defaultValue: "curved arrows with gradient color matching source and target nodes" },
          { name: "node_shape", description: "Shape for each step", defaultValue: "rounded rectangle with soft shadow" },
          { name: "icon_style", description: "Icon style in each node", defaultValue: "simple flat illustration icon (sun, leaf, water drop, lightning bolt, cycle arrows, sugar cube)" },
          { name: "decision_points", description: "Any branching logic", defaultValue: "none — linear process with one feedback loop" },
          { name: "color_scheme", description: "Color progression", defaultValue: "warm yellow (light energy) → green (chlorophyll) → blue (water) → orange (ATP) → purple (Calvin Cycle) → golden (glucose)" },
          { name: "typography", description: "Font choice", defaultValue: "clean sans-serif (Nunito or similar)" },
          { name: "label_size", description: "Step label text size", defaultValue: "18px bold" },
          { name: "desc_size", description: "Description text size", defaultValue: "12px regular" },
          { name: "background", description: "Background style", defaultValue: "soft white with a faint leaf-vein pattern watermark" },
          { name: "legend", description: "Legend content", defaultValue: "color-coded phase names with molecule counts" },
          { name: "annotations", description: "Educational callouts", defaultValue: "fun fact bubbles — e.g., 'One leaf can produce enough oxygen for a person for one hour'" },
          { name: "visual_style", description: "Overall visual feel", defaultValue: "friendly and approachable, suitable for grades 6-10" },
          { name: "aspect_ratio", description: "Image dimensions", defaultValue: "16:9 landscape" }
        ]
      },
      {
        title: "Comparison Infographic",
        content: "Create a side-by-side comparison infographic contrasting {{subject_a}} vs {{subject_b}} for a {{audience}} audience. Layout: {{layout_type}} with a clear dividing line or visual separator. Compare across {{num_criteria}} criteria: {{criteria_list}}. For each criterion, show {{data_display}} — use {{visual_indicators}} to make differences immediately obvious. Header: {{header_style}} with clear labels for each side. Color scheme: {{color_a}} for {{subject_a}}, {{color_b}} for {{subject_b}}, {{neutral_color}} for shared/neutral elements. Include {{shared_section}} in the middle highlighting what they have in common. Add a {{conclusion_section}} at the bottom summarizing key takeaways. Icons: {{icon_style}}. Background: {{background}}. Typography: {{typography}}. The infographic should make the comparison instantly scannable. Aspect ratio: {{aspect_ratio}}.",
        description: "Design a polished side-by-side comparison infographic with visual indicators, shared elements section, and clear takeaway summary.",
        variables: [
          { name: "subject_a", description: "First subject to compare", defaultValue: "Solar Energy" },
          { name: "subject_b", description: "Second subject to compare", defaultValue: "Wind Energy" },
          { name: "audience", description: "Target audience", defaultValue: "high school environmental science students" },
          { name: "layout_type", description: "Layout structure", defaultValue: "vertical split with centered overlap zone" },
          { name: "num_criteria", description: "Number of comparison criteria", defaultValue: "6" },
          { name: "criteria_list", description: "What to compare", defaultValue: "Energy efficiency, Installation cost, Space required, Environmental impact, Reliability/uptime, Lifespan" },
          { name: "data_display", description: "How data is shown per criterion", defaultValue: "icon + short stat + progress bar" },
          { name: "visual_indicators", description: "Visual cues for better/worse", defaultValue: "green checkmark for advantage, subtle gray for disadvantage, star burst for 'winner' in each category" },
          { name: "header_style", description: "Top header design", defaultValue: "bold title with relevant icon (sun vs windmill) and a hero image silhouette" },
          { name: "color_a", description: "Color for Subject A", defaultValue: "warm orange-gold (#F39C12)" },
          { name: "color_b", description: "Color for Subject B", defaultValue: "cool sky-blue (#3498DB)" },
          { name: "neutral_color", description: "Shared/neutral color", defaultValue: "soft green (#2ECC71)" },
          { name: "shared_section", description: "Common ground section", defaultValue: "a central ribbon highlighting: both are renewable, both reduce carbon footprint, both have growing adoption rates" },
          { name: "conclusion_section", description: "Bottom summary", defaultValue: "a 'Key Takeaway' box with 2-3 sentences summarizing when each is the better choice" },
          { name: "icon_style", description: "Icon approach", defaultValue: "filled flat icons with rounded style" },
          { name: "background", description: "Background design", defaultValue: "clean white with subtle topographic pattern" },
          { name: "typography", description: "Font system", defaultValue: "Poppins for headings, Open Sans for body text" },
          { name: "aspect_ratio", description: "Dimensions", defaultValue: "9:16 portrait (ideal for print or poster)" }
        ]
      },
      {
        title: "Timeline Visualization",
        content: "Design an educational timeline visualization covering {{timeline_topic}} from {{start_period}} to {{end_period}}. Include {{num_events}} key events: {{events_list}}. Layout: {{timeline_layout}} with the timeline axis as {{axis_style}}. Each event node shows: {{event_display}}. Visual era grouping: {{era_groups}} — each era has a distinct {{era_visual}} background band. Highlight {{milestone_events}} as major milestones with {{milestone_style}}. Include {{context_elements}} for historical context. Typography: {{typography}}. Color palette: {{color_palette}}. Background: {{background}}. Add a {{scale_indicator}} to show time scale. The timeline should tell a compelling story of progression and be suitable for {{use_context}}. Aspect ratio: {{aspect_ratio}}.",
        description: "Create a rich, era-grouped timeline visualization with milestone highlights, contextual imagery, and compelling visual storytelling of historical progression.",
        variables: [
          { name: "timeline_topic", description: "Subject of the timeline", defaultValue: "the history of space exploration" },
          { name: "start_period", description: "Starting period", defaultValue: "1957 (Sputnik launch)" },
          { name: "end_period", description: "Ending period", defaultValue: "2025 (Artemis program)" },
          { name: "num_events", description: "Number of events", defaultValue: "12" },
          { name: "events_list", description: "Key events to include", defaultValue: "1957 Sputnik, 1961 Gagarin, 1962 Glenn, 1969 Moon landing, 1971 Salyut, 1981 Space Shuttle, 1990 Hubble, 1998 ISS, 2004 Spirit rover, 2012 Curiosity, 2020 Crew Dragon, 2024 Artemis II" },
          { name: "timeline_layout", description: "Layout direction", defaultValue: "horizontal scrolling strip, events alternating above and below the axis" },
          { name: "axis_style", description: "Central axis design", defaultValue: "gradient line transitioning from sepia (past) to bright blue (present)" },
          { name: "event_display", description: "What each event node shows", defaultValue: "circular date badge, event title, one-sentence description, and a small iconic illustration" },
          { name: "era_groups", description: "Grouped eras", defaultValue: "Space Race (1957-1975), Shuttle Era (1981-2011), International Cooperation (1998-2020), New Space Age (2020-present)" },
          { name: "era_visual", description: "How eras are distinguished", defaultValue: "soft color-tinted" },
          { name: "milestone_events", description: "Which events are milestones", defaultValue: "1969 Moon landing and 2020 Crew Dragon" },
          { name: "milestone_style", description: "How milestones stand out", defaultValue: "larger node, gold star badge, glowing halo effect" },
          { name: "context_elements", description: "Contextual decorations", defaultValue: "small silhouettes of rockets, satellites, and astronauts relevant to each era" },
          { name: "typography", description: "Font choices", defaultValue: "bold condensed sans-serif for dates, regular serif for descriptions" },
          { name: "color_palette", description: "Timeline colors", defaultValue: "deep space navy base, era bands in muted earth tones transitioning to vibrant modern hues" },
          { name: "background", description: "Background treatment", defaultValue: "dark navy gradient suggesting outer space, with subtle star field" },
          { name: "scale_indicator", description: "Time scale visualization", defaultValue: "decade markers along the axis with subtle grid lines" },
          { name: "use_context", description: "Intended use", defaultValue: "classroom poster or interactive web page" },
          { name: "aspect_ratio", description: "Dimensions", defaultValue: "3:1 ultra-wide landscape (poster format)" }
        ]
      }
    ],
    examples: [
      {
        input: "Topic: photosynthesis process, 6 steps from sunlight to glucose, Style: friendly for grades 6-10, Layout: left-to-right flow",
        output: "A colorful 16:9 process flow diagram on white background with faint leaf watermark. Six rounded-rectangle nodes flow left-to-right: Sunlight (yellow) → Chlorophyll (green) → Photolysis (blue) → ATP/NADPH (orange) → Calvin Cycle (purple) → Glucose (gold). Each node has a flat icon and bold label. Curved gradient arrows connect steps. A feedback loop arrow returns from glucose to Calvin Cycle. Fun fact bubbles pop out with leaf-oxygen trivia. Color-coded legend at bottom.",
        image: cover("pm-15-fantasy-art")
      },
      {
        input: "Timeline: history of space exploration 1957-2025, 12 events, horizontal layout with era grouping on dark space background",
        output: "An ultra-wide timeline on dark navy star-field background. Gradient axis transitions from sepia to bright blue. 12 events alternate above/below: Sputnik, Gagarin, Glenn, Moon landing, Salyut, Shuttle, Hubble, ISS, Spirit, Curiosity, Crew Dragon, Artemis. Four era bands in muted-to-vibrant colors. Moon landing and Crew Dragon highlighted with gold star badges and glow halos. Rocket and satellite silhouettes decorate each era. Decade markers along the axis.",
        image: cover("pm-15-fantasy-art")
      }
    ]
  },

  /* ═══════════════════════════════════════════════════
   * 16. SCI-FI WORLD BUILDING
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Sci-Fi World Building & Environments", vi: "Xây dựng thế giới & Môi trường Sci-Fi" },
    category: "other",
    tags: ["sci-fi", "cyberpunk", "futuristic", "world-building", "environment"],
    priceSKT: 100,
    sellerIdx: 7,
    description: {
      en: "Build immersive sci-fi worlds. Cyberpunk megacities, space stations, and futuristic environments with Blade Runner and Ghost in the Shell aesthetics.",
      vi: "Xây dựng thế giới sci-fi nhập vai. Megacity cyberpunk, trạm vũ trụ, và môi trường tương lai với thẩm mỹ Blade Runner."
    },
    previewText: "A breathtaking {{environment_type}} at night, {{architecture}} with {{signage}}...",
    coverImage: cover("pm-16-scifi-world"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Cyberpunk Megacity",
        content: "A breathtaking {{environment_type}} at night, {{architecture}} with {{signage}}, {{vehicles}}, {{landmark}}, {{weather}}, {{reflections}}, {{sky_detail}}, {{aesthetic}} aesthetic, {{shot_type}}, no text",
        description: "Cyberpunk megacity panoramic",
        variables: [
          { name: "environment_type", description: "Environment", defaultValue: "cyberpunk megacity skyline" },
          { name: "architecture", description: "Architecture", defaultValue: "towering skyscrapers" },
          { name: "signage", description: "Signage/details", defaultValue: "holographic advertisements and neon signage in Japanese and Korean" },
          { name: "vehicles", description: "Vehicles", defaultValue: "flying vehicles leaving light trails between buildings" },
          { name: "landmark", description: "Landmark", defaultValue: "a massive torii gate structure spanning two towers glowing with cherry blossom pink light" },
          { name: "weather", description: "Weather", defaultValue: "rain falling through volumetric fog" },
          { name: "reflections", description: "Reflections", defaultValue: "reflections on wet elevated highways" },
          { name: "sky_detail", description: "Sky", defaultValue: "a full moon partially obscured by clouds" },
          { name: "aesthetic", description: "Aesthetic", defaultValue: "Blade Runner 2049 meets Ghost in the Shell" },
          { name: "shot_type", description: "Shot type", defaultValue: "ultra-wide panoramic shot" },
        ],
      },
      {
        title: "Space Station Interior",
        content: "Interior of {{station_type}}, {{floor_detail}} with {{greenery}}, {{windows}} revealing {{space_view}}, {{lighting}}, {{inhabitants}}, {{amenities}}, clean futuristic but lived-in aesthetic, {{reference}} production design, no text",
        description: "Lived-in space station interior",
        variables: [
          { name: "station_type", description: "Station type", defaultValue: "a massive rotating space station observation deck" },
          { name: "floor_detail", description: "Floor detail", defaultValue: "curved floor" },
          { name: "greenery", description: "Greenery", defaultValue: "lush hydroponic gardens and walking paths" },
          { name: "windows", description: "Windows", defaultValue: "floor-to-ceiling windows" },
          { name: "space_view", description: "Space view", defaultValue: "the Earth and stars slowly rotating past" },
          { name: "lighting", description: "Lighting", defaultValue: "warm artificial sunlight from LED arrays mixing with the blue glow of Earth" },
          { name: "inhabitants", description: "People", defaultValue: "a few people in casual clothes walking and sitting on benches" },
          { name: "amenities", description: "Amenities", defaultValue: "a café area with a barista robot" },
          { name: "reference", description: "Reference", defaultValue: "Interstellar meets The Expanse" },
        ],
      },
    ],
    examples: [
      { input: "Cyberpunk megacity with neon torii gate at night", output: "Panoramic cyberpunk skyline with holographic ads, flying vehicles, rain-soaked highways, and Blade Runner aesthetic.", image: cover("pm-16-scifi-world") },
      { input: "Rotating space station observation deck with Earth view", output: "Lived-in space station with hydroponic gardens, Earth through windows, barista robot, and Interstellar aesthetic.", image: example("ex-08-space-station") },
    ],
  },


  /* ═══════════════════════════════════════════════════
   * 17. PORTRAIT PHOTOGRAPHY PRO
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Professional Portrait Photography", vi: "Nhiếp ảnh chân dung chuyên nghiệp" },
    category: "design",
    tags: ["portrait", "headshot", "editorial", "studio", "lighting"],
    priceSKT: 85,
    sellerIdx: 11,
    description: {
      en: "Create Annie Leibovitz-quality portrait photography. Dramatic editorial portraits, environmental CEO headshots, and studio lighting setups with catchlight detail.",
      vi: "Tạo ảnh chân dung chất lượng Annie Leibovitz. Chân dung editorial, headshot CEO, và setup ánh sáng studio."
    },
    previewText: "Dramatic editorial portrait of {{subject}} with {{distinctive_feature}}, {{clothing}}, shot against {{background}}...",
    coverImage: cover("pm-17-portrait"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Editorial Studio Portrait",
        content: "Dramatic editorial portrait of {{subject}} with {{distinctive_feature}}, {{clothing}}, shot against {{background}}, {{lighting}} creating {{shadow_detail}}, catchlights visible in both eyes, ultra-sharp skin texture with minimal retouching, shot on {{camera}} with {{lens}}, {{photographer}} portrait quality, no text",
        description: "Studio editorial portrait with dramatic lighting",
        variables: [
          { name: "subject", description: "Subject", defaultValue: "a young woman with striking heterochromia eyes, one blue and one amber" },
          { name: "distinctive_feature", description: "Feature", defaultValue: "short textured silver-white hair" },
          { name: "clothing", description: "Clothing", defaultValue: "wearing a structured black turtleneck" },
          { name: "background", description: "Background", defaultValue: "a seamless deep charcoal background" },
          { name: "lighting", description: "Lighting", defaultValue: "single butterfly lighting from directly above" },
          { name: "shadow_detail", description: "Shadow detail", defaultValue: "defined cheekbone shadows and a nose shadow pointing straight down" },
          { name: "camera", description: "Camera", defaultValue: "Canon EOS R5" },
          { name: "lens", description: "Lens", defaultValue: "85mm f/1.2" },
          { name: "photographer", description: "Photographer", defaultValue: "Annie Leibovitz" },
        ],
      },
      {
        title: "Environmental CEO Portrait",
        content: "An environmental editorial portrait of {{subject}} in {{clothing}}, standing in {{environment}}, {{pose}}, {{lighting_detail}}, {{background_detail}}, shallow depth of field, shot on {{camera}} with {{lens}}, {{publication}} cover portrait quality, no text",
        description: "Environmental portrait in professional setting",
        variables: [
          { name: "subject", description: "Subject", defaultValue: "a confident tech CEO" },
          { name: "clothing", description: "Clothing", defaultValue: "a perfectly tailored navy suit" },
          { name: "environment", description: "Environment", defaultValue: "the atrium of a modern glass office building" },
          { name: "pose", description: "Pose", defaultValue: "arms crossed, looking directly at camera with a subtle determined smile" },
          { name: "lighting_detail", description: "Lighting", defaultValue: "natural light pouring in from the glass ceiling creating beautiful rim lighting on the shoulders and hair" },
          { name: "background_detail", description: "Background", defaultValue: "blurred office activity in the background suggesting a thriving company" },
          { name: "camera", description: "Camera", defaultValue: "Sony A1" },
          { name: "lens", description: "Lens", defaultValue: "135mm f/1.8 GM" },
          { name: "publication", description: "Publication", defaultValue: "Forbes magazine" },
        ],
      },
    ],
    examples: [
      { input: "Heterochromia portrait with butterfly lighting on charcoal", output: "Studio editorial with silver-white hair, catchlight detail, butterfly shadow pattern, and Annie Leibovitz quality.", image: cover("pm-17-portrait") },
      { input: "Tech CEO environmental portrait in glass office atrium", output: "Forbes-quality portrait with natural rim lighting, navy suit, glass ceiling, and 135mm GM shallow DOF.", image: example("ex-10-ceo-portrait") },
    ],
  },


  /* ═══════════════════════════════════════════════════
   * 18. CONCEPT AUTOMOTIVE DESIGN
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Concept Automotive & Vehicle Design", vi: "Thiết kế ô tô & xe concept" },
    category: "design",
    tags: ["automotive", "car-design", "concept", "hypercar", "electric-vehicle"],
    priceSKT: 95,
    sellerIdx: 10,
    description: {
      en: "Design futuristic vehicles with Easton Chang-quality automotive photography. Hypercars, electric motorcycles, and concept vehicles in dramatic environments.",
      vi: "Thiết kế xe tương lai với chất lượng Easton Chang. Hypercar, mô tô điện, và xe concept trong môi trường dramatic."
    },
    previewText: "A futuristic electric {{vehicle}} in {{color}} with {{design_details}}...",
    coverImage: cover("pm-18-automotive"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Hypercar Concept",
        content: "A futuristic electric {{vehicle}} in {{color}} with {{body_details}}, {{tech_features}}, parked in {{environment}}, {{reflections}}, {{angle}}, automotive photography by {{photographer}}, no text",
        description: "Futuristic concept vehicle design",
        variables: [
          { name: "vehicle", description: "Vehicle type", defaultValue: "hypercar concept" },
          { name: "color", description: "Color/finish", defaultValue: "matte pearl white" },
          { name: "body_details", description: "Body details", defaultValue: "flowing organic body lines, active aerodynamic surfaces, and illuminated Tron-like blue accent lines running along the body panels" },
          { name: "tech_features", description: "Tech features", defaultValue: "transparent OLED windshield HUD and butterfly doors" },
          { name: "environment", description: "Environment", defaultValue: "an underground concrete garage with dramatic directional lighting casting long shadows" },
          { name: "reflections", description: "Reflections", defaultValue: "rain puddles on the polished floor reflecting the car and overhead strip lights" },
          { name: "angle", description: "Camera angle", defaultValue: "low three-quarter front angle emphasizing the aggressive stance" },
          { name: "photographer", description: "Photographer", defaultValue: "Easton Chang" },
        ],
      },
      {
        title: "Electric Motorcycle Concept",
        content: "A futuristic electric motorcycle concept in {{color}} with {{details}}, {{wheel_detail}}, {{display}}, {{lighting_detail}}, parked on {{location}}, {{reflections}}, automotive design studio quality, {{angle}}, no text",
        description: "Electric motorcycle concept render",
        variables: [
          { name: "color", description: "Color", defaultValue: "matte gunmetal gray with copper accent details" },
          { name: "details", description: "Design details", defaultValue: "hubless rear wheel with visible electric motor" },
          { name: "wheel_detail", description: "Wheel detail", defaultValue: "hubless design with exposed electromagnetic drivetrain" },
          { name: "display", description: "Display", defaultValue: "minimalist instrument cluster integrated into the handlebars as a transparent OLED display" },
          { name: "lighting_detail", description: "Lighting", defaultValue: "LED light strip running continuously from headlight to tail" },
          { name: "location", description: "Location", defaultValue: "a rooftop helipad at dusk with a city skyline in the background" },
          { name: "reflections", description: "Reflections", defaultValue: "wet surface reflecting the bike and city lights" },
          { name: "angle", description: "Angle", defaultValue: "low dramatic angle" },
        ],
      },
    ],
    examples: [
      { input: "Matte white hypercar in underground garage, Tron accents", output: "Concept hypercar with organic body lines, blue accent lighting, rain puddle reflections, and Easton Chang photography.", image: cover("pm-18-automotive") },
      { input: "Electric motorcycle on rooftop at dusk, gunmetal gray", output: "Futuristic motorcycle with hubless wheel, OLED display, copper accents, and city skyline reflections.", image: example("ex-11-motorcycle") },
    ],
  },


  /* ═══════════════════════════════════════════════════
   * 19. ANIME & MANGA ILLUSTRATION
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Anime & Manga Illustration Master", vi: "Bậc thầy minh họa Anime & Manga" },
    category: "other",
    tags: ["anime", "manga", "illustration", "makoto-shinkai", "ufotable"],
    priceSKT: 90,
    sellerIdx: 9,
    description: {
      en: "Create stunning anime illustrations inspired by Makoto Shinkai, Violet Evergarden, and Ufotable. Character portraits, battle scenes, and atmospheric landscapes.",
      vi: "Tạo minh họa anime tuyệt đẹp lấy cảm hứng từ Makoto Shinkai, Violet Evergarden, và Ufotable. Chân dung, cảnh chiến đấu, và phong cảnh."
    },
    previewText: "Beautiful anime illustration of {{character}} with {{hair}}, wearing {{outfit}}, holding {{item}}...",
    coverImage: cover("pm-19-anime-art"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Anime Character Portrait",
        content: "Beautiful anime illustration of {{character}} with {{hair}} adorned with {{accessories}}, wearing {{outfit}}, holding {{item}}, standing on {{location}} at {{time}} with {{sky_detail}}, {{particle_effects}}, detailed anime art style inspired by {{artists}}, vibrant colors, no text",
        description: "Detailed anime character portrait",
        variables: [
          { name: "character", description: "Character", defaultValue: "a young sorceress" },
          { name: "hair", description: "Hair", defaultValue: "flowing lavender hair" },
          { name: "accessories", description: "Accessories", defaultValue: "star-shaped hairpins" },
          { name: "outfit", description: "Outfit", defaultValue: "an elegant midnight blue cloak with silver constellation embroidery over a white corset dress" },
          { name: "item", description: "Held item", defaultValue: "a glowing crystal staff that radiates soft starlight particles" },
          { name: "location", description: "Location", defaultValue: "a floating island above the clouds" },
          { name: "time", description: "Time", defaultValue: "twilight with a crescent moon behind her" },
          { name: "sky_detail", description: "Sky detail", defaultValue: "a crescent moon" },
          { name: "particle_effects", description: "Particles", defaultValue: "cherry blossom petals drifting in the wind" },
          { name: "artists", description: "Artist reference", defaultValue: "Makoto Shinkai and Violet Evergarden" },
        ],
      },
      {
        title: "Dynamic Battle Scene",
        content: "Dynamic anime battle scene, {{combatants}}, {{weapon1}} and {{weapon2}}, {{impact_effect}}, {{weather}}, dramatic speed lines and motion blur, {{studio}} animation studio quality inspired by {{reference}}, vibrant colors against {{backdrop}}, no text",
        description: "High-energy anime battle scene",
        variables: [
          { name: "combatants", description: "Combatants", defaultValue: "two sword fighters clashing mid-air above a destroyed temple rooftop during a thunderstorm" },
          { name: "weapon1", description: "Weapon 1", defaultValue: "one warrior in crimson armor with a flame-wreathed katana" },
          { name: "weapon2", description: "Weapon 2", defaultValue: "the other in ice-blue robes with a crystalline blade" },
          { name: "impact_effect", description: "Impact effect", defaultValue: "lightning bolt freezing the moment of impact between their weapons creating a shockwave ring of energy, rain droplets suspended in the blast wave" },
          { name: "weather", description: "Weather", defaultValue: "thunderstorm" },
          { name: "studio", description: "Studio", defaultValue: "Ufotable" },
          { name: "reference", description: "Reference", defaultValue: "Demon Slayer" },
          { name: "backdrop", description: "Backdrop", defaultValue: "the dark storm sky" },
        ],
      },
    ],
    examples: [
      { input: "Lavender-haired sorceress on floating island at twilight", output: "Makoto Shinkai-style anime portrait with constellation cloak, crystal staff, cherry blossoms, and crescent moon.", image: cover("pm-19-anime-art") },
      { input: "Two swordsmen clashing mid-air in thunderstorm", output: "Ufotable-quality battle scene with flame katana vs crystal blade, shockwave impact, and suspended rain droplets.", image: example("ex-09-anime-battle") },
    ],
  },


  /* ═══════════════════════════════════════════════════
   * 20. EPIC LANDSCAPE PHOTOGRAPHY
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Epic Landscape & Nature Photography", vi: "Nhiếp ảnh phong cảnh & thiên nhiên sử thi" },
    category: "design",
    tags: ["landscape", "nature", "aurora", "photography", "national-geographic"],
    priceSKT: 80,
    sellerIdx: 11,
    description: {
      en: "Generate National Geographic-quality landscape photography. Nordic fjords, volcanic Iceland, and auroral skies with long exposure and professional camera specs.",
      vi: "Tạo ảnh phong cảnh chất lượng National Geographic. Fjord Bắc Âu, núi lửa Iceland, và bầu trời cực quang."
    },
    previewText: "A breathtaking landscape photograph of {{location}} during {{time}}, {{terrain}} reflected in {{water}}...",
    coverImage: cover("pm-20-landscape"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Nordic Landscape",
        content: "A breathtaking landscape photograph of {{location}} during {{time}}, {{terrain}} reflected perfectly in {{water}}, {{structure}} at the water's edge, {{sky_phenomenon}} dancing across the sky in {{colors}}, long exposure creating silky smooth water, shot on {{camera}} with {{lens}}, {{award}} quality, no text",
        description: "Award-winning Nordic landscape photography",
        variables: [
          { name: "location", description: "Location", defaultValue: "the Lofoten Islands in Norway" },
          { name: "time", description: "Time", defaultValue: "the blue hour" },
          { name: "terrain", description: "Terrain", defaultValue: "dramatic jagged mountain peaks" },
          { name: "water", description: "Water body", defaultValue: "a still fjord" },
          { name: "structure", description: "Structure", defaultValue: "a traditional red fishing cabin (rorbu) with warm light in the windows sitting" },
          { name: "sky_phenomenon", description: "Sky phenomenon", defaultValue: "Northern Lights aurora borealis" },
          { name: "colors", description: "Aurora colors", defaultValue: "green and purple ribbons" },
          { name: "camera", description: "Camera", defaultValue: "Nikon Z9" },
          { name: "lens", description: "Lens", defaultValue: "14-24mm f/2.8" },
          { name: "award", description: "Award reference", defaultValue: "National Geographic Landscape Photographer of the Year" },
        ],
      },
      {
        title: "Volcanic Landscape",
        content: "An otherworldly landscape photograph of {{location}}, {{lava_detail}}, {{atmosphere}}, {{sky_detail}} clearly visible in the dark sky above, {{foreground}} providing contrast, long exposure creating {{motion_effect}}, shot on {{camera}} with {{lens}} at midnight, combining fire and ice elements, {{award}} quality, no text",
        description: "Dramatic volcanic landscape at night",
        variables: [
          { name: "location", description: "Location", defaultValue: "an active volcanic area in Iceland" },
          { name: "lava_detail", description: "Lava detail", defaultValue: "a river of glowing orange lava flowing through a black basalt field" },
          { name: "atmosphere", description: "Atmosphere", defaultValue: "steam and sulfurous gases rising dramatically" },
          { name: "sky_detail", description: "Sky detail", defaultValue: "the Milky Way" },
          { name: "foreground", description: "Foreground", defaultValue: "green moss-covered lava rocks in the foreground" },
          { name: "motion_effect", description: "Motion effect", defaultValue: "smooth lava flow motion" },
          { name: "camera", description: "Camera", defaultValue: "Nikon Z9" },
          { name: "lens", description: "Lens", defaultValue: "24mm f/1.4" },
          { name: "award", description: "Award", defaultValue: "National Geographic" },
        ],
      },
    ],
    examples: [
      { input: "Lofoten Islands with aurora borealis over fjord", output: "Blue hour landscape with mountain reflections, red fishing cabin, Northern Lights, and Nikon Z9 long exposure.", image: cover("pm-20-landscape") },
      { input: "Active volcanic Iceland with lava and Milky Way", output: "Otherworldly volcanic landscape with glowing lava river, moss-covered basalt, and Milky Way night sky.", image: example("ex-13-iceland-volcanic") },
    ],
  },


  /* ═══════════════════════════════════════════════════
   * 21. ABSTRACT & GENERATIVE ART
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Abstract & Generative Art Collection", vi: "Bộ sưu tập nghệ thuật trừu tượng & Generative" },
    category: "other",
    tags: ["abstract", "generative", "fluid-art", "gallery", "fine-art"],
    priceSKT: 70,
    isFree: false,
    sellerIdx: 11,
    description: {
      en: "Create gallery-quality abstract art. Fluid compositions, macro crystal formations, and cosmic nebulae with metallic textures and iridescent colors.",
      vi: "Tạo nghệ thuật trừu tượng chất lượng gallery. Fluid art, cấu trúc tinh thể macro, và tinh vân vũ trụ với kết cấu kim loại."
    },
    previewText: "A mesmerizing abstract {{technique}} composition, swirling ribbons of {{colors}}...",
    coverImage: cover("pm-21-abstract-art"),
    models: ["flux", "midjourney", "dall-e-3"],
    prompts: [
      {
        title: "Fluid Art Composition",
        content: "A mesmerizing abstract {{technique}} composition, swirling ribbons of {{colors}} flowing and intertwining in an organic dance, {{micro_detail}}, {{texture_detail}}, the entire composition suggesting {{metaphor}}, extremely detailed textures with {{material_quality}}, high-end gallery art quality, {{medium}}, no text",
        description: "Abstract fluid art with cosmic qualities",
        variables: [
          { name: "technique", description: "Technique", defaultValue: "fluid art" },
          { name: "colors", description: "Color palette", defaultValue: "liquid gold, deep sapphire blue, and iridescent pearl white" },
          { name: "micro_detail", description: "Micro detail", defaultValue: "microscopic cell-like structures forming at the boundaries where colors meet" },
          { name: "texture_detail", description: "Texture detail", defaultValue: "tiny bubble formations catching light like diamonds" },
          { name: "metaphor", description: "Visual metaphor", defaultValue: "cosmic nebulae viewed through a microscope" },
          { name: "material_quality", description: "Material quality", defaultValue: "visible paint viscosity" },
          { name: "medium", description: "Display medium", defaultValue: "printed on aluminum dibond" },
        ],
      },
      {
        title: "Macro Crystal Formation",
        content: "Extreme macro photograph of {{crystal_type}}, showing {{structures}} in vivid {{colors}}, with {{surface_detail}}, each {{feature}} reflecting light differently, shallow depth of field with creamy bokeh, shot on {{lens}}, abstract art meets scientific photography, gallery-quality {{category}} photography, no text",
        description: "Macro crystal photography as abstract art",
        variables: [
          { name: "crystal_type", description: "Crystal type", defaultValue: "a bismuth crystal formation" },
          { name: "structures", description: "Structures", defaultValue: "the iridescent staircase-like geometric structures" },
          { name: "colors", description: "Colors", defaultValue: "electric blue, magenta, gold, and teal" },
          { name: "surface_detail", description: "Surface detail", defaultValue: "microscopic oxidation patterns creating a surreal alien landscape effect" },
          { name: "feature", description: "Feature", defaultValue: "terrace" },
          { name: "lens", description: "Lens", defaultValue: "Laowa 25mm ultra-macro lens" },
          { name: "category", description: "Category", defaultValue: "mineral" },
        ],
      },
    ],
    examples: [
      { input: "Fluid art with gold, sapphire, and pearl white on aluminum", output: "Gallery-quality abstract with cosmic nebulae quality, cell-like structures, diamond bubbles, and visible paint viscosity.", image: cover("pm-21-abstract-art") },
      { input: "Bismuth crystal macro with iridescent geometric terraces", output: "Ultra-macro crystal photography with rainbow oxidation patterns, staircase structures, and Laowa lens bokeh.", image: example("ex-14-macro-crystal") },
    ],
  },


  /* ═══════════════════════════════════════════════════
   * 22. STORYTELLING & NARRATIVE ILLUSTRATION
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Storytelling & Narrative Illustration", vi: "Minh Họa Truyện Kể & Tường Thuật" },
    category: "writing",
    tags: ["storytelling", "illustration", "narrative", "book-cover", "visual-novel", "creative-writing", "children"],
    priceSKT: 85,
    featured: true,
    sellerIdx: 5,
    description: {
      en: "Create stunning book covers, story scene spreads, and character emotion studies for visual storytelling. Perfect for children's books, graphic novels, and illustrated fiction with rich narrative depth.",
      vi: "Tạo bìa sách tuyệt đẹp, tranh minh họa cảnh truyện và nghiên cứu cảm xúc nhân vật cho kể chuyện bằng hình ảnh. Hoàn hảo cho sách thiếu nhi, tiểu thuyết đồ họa và truyện minh họa."
    },
    previewText: "Transform your stories into breathtaking illustrated art — covers, spreads, and character studies.",
    coverImage: cover("pm-22-childrens-book"),
    models: ["gpt-4o", "dall-e-3", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Book Cover Illustration",
        content: "Create a captivating book cover illustration for a {{genre}} story titled \"{{book_title}}\". The scene depicts {{main_scene}} with the main character {{character_description}} in the foreground. Art style: {{art_style}}, with a color palette dominated by {{color_palette}}. The mood is {{mood}} with {{lighting}} lighting. Include subtle visual motifs of {{symbolic_elements}} woven into the background. Composition: the character is positioned at {{composition_rule}} with the title area left clear at the {{title_position}}. Render in high detail, 2:3 portrait ratio, print-ready resolution. The illustration should evoke a sense of {{emotion}} and immediately draw the viewer into the world of the story.",
        description: "Generate a professional book cover illustration with carefully composed character placement, symbolic motifs, and space for title typography.",
        variables: [
          { name: "genre", description: "Book genre (fantasy, mystery, romance, sci-fi, etc.)", defaultValue: "fantasy adventure" },
          { name: "book_title", description: "The title of the book", defaultValue: "The Last Ember" },
          { name: "main_scene", description: "The key scene depicted on the cover", defaultValue: "a young mage standing at the edge of a floating island overlooking a sea of clouds" },
          { name: "character_description", description: "Appearance of the main character", defaultValue: "a teenage girl with silver-streaked hair, wearing a tattered cloak, holding a glowing ember in her cupped hands" },
          { name: "art_style", description: "Illustration style", defaultValue: "lush digital painting, Studio Ghibli-inspired whimsy" },
          { name: "color_palette", description: "Dominant colors", defaultValue: "warm amber, deep twilight purple, soft gold highlights" },
          { name: "mood", description: "Overall mood of the cover", defaultValue: "hopeful yet melancholic" },
          { name: "lighting", description: "Lighting style", defaultValue: "golden hour, volumetric god rays piercing through clouds" },
          { name: "symbolic_elements", description: "Symbolic visual motifs", defaultValue: "phoenix feathers drifting in the wind, crumbling ancient runes on stone pillars" },
          { name: "composition_rule", description: "Character placement", defaultValue: "lower-right third, looking left toward the horizon" },
          { name: "title_position", description: "Where to leave space for the title", defaultValue: "top third of the image" },
          { name: "emotion", description: "The core emotion to evoke", defaultValue: "wonder and quiet determination" }
        ]
      },
      {
        title: "Story Scene Spread",
        content: "Illustrate a double-page story spread for a {{book_type}} book. The scene: {{scene_description}}. Characters present: {{characters}}. Environment: {{environment}} with {{time_of_day}} atmosphere. Art style: {{art_style}}, rendered as a seamless panoramic composition spanning two pages. Left page focus: {{left_page_focus}}. Right page focus: {{right_page_focus}}. Include small narrative details like {{narrative_details}} to reward close inspection. Color temperature: {{color_temperature}}. Leave {{text_area}} for overlaid text. The spread should tell a complete micro-story within a single glance, guiding the eye from left to right in a natural reading flow.",
        description: "Design a panoramic double-page illustration spread that tells a visual micro-story with rich environmental details and natural reading flow.",
        variables: [
          { name: "book_type", description: "Type of illustrated book", defaultValue: "children's picture" },
          { name: "scene_description", description: "What is happening in this scene", defaultValue: "a fox and a rabbit discovering a hidden garden behind a waterfall in an enchanted forest" },
          { name: "characters", description: "Characters in the scene and their actions", defaultValue: "a curious red fox peering through vines, a small rabbit already inside pointing excitedly at glowing flowers" },
          { name: "environment", description: "Setting details", defaultValue: "lush mossy rocks, cascading waterfall parting like a curtain, bioluminescent flowers and mushrooms" },
          { name: "time_of_day", description: "Time and atmospheric quality", defaultValue: "late afternoon with dappled sunlight filtering through the canopy" },
          { name: "art_style", description: "Illustration style", defaultValue: "soft watercolor with ink outlines, storybook warmth" },
          { name: "left_page_focus", description: "What the left page emphasizes", defaultValue: "the waterfall entrance and the fox hesitating at the threshold" },
          { name: "right_page_focus", description: "What the right page emphasizes", defaultValue: "the magical garden interior with the rabbit surrounded by glowing flora" },
          { name: "narrative_details", description: "Small hidden details for visual storytelling", defaultValue: "tiny fireflies forming a trail, a carved wooden sign with unreadable runes, a forgotten watering can" },
          { name: "color_temperature", description: "Overall color feel", defaultValue: "cool blue-greens on the left transitioning to warm golden-greens on the right" },
          { name: "text_area", description: "Where to reserve space for text", defaultValue: "a soft area at the bottom-left corner and bottom-right corner" }
        ]
      },
      {
        title: "Character Emotion Study",
        content: "Create a character emotion study sheet for {{character_name}}, a {{character_role}} from a {{story_genre}} story. Show {{num_expressions}} distinct expressions arranged in a {{layout}} grid: {{expression_list}}. Character base appearance: {{base_appearance}}. Each expression should show clear changes in {{facial_features}}. Art style: {{art_style}} with {{line_quality}} lines. Background: {{background}}. Include subtle body language cues — {{body_language_notes}}. Label each expression below the portrait. This sheet should serve as a reference for maintaining character consistency across an entire illustrated book.",
        description: "Generate a professional character emotion/expression reference sheet showing multiple emotional states for maintaining visual consistency in storytelling.",
        variables: [
          { name: "character_name", description: "Name of the character", defaultValue: "Luna" },
          { name: "character_role", description: "Character's role in the story", defaultValue: "brave young inventor" },
          { name: "story_genre", description: "Genre of the story", defaultValue: "steampunk adventure" },
          { name: "num_expressions", description: "Number of expressions to show", defaultValue: "6" },
          { name: "layout", description: "Grid arrangement", defaultValue: "2 rows × 3 columns" },
          { name: "expression_list", description: "List of emotions to depict", defaultValue: "determined confidence, joyful discovery, deep concentration, surprised alarm, quiet sadness, mischievous smirk" },
          { name: "base_appearance", description: "Character's consistent physical traits", defaultValue: "12-year-old girl, messy auburn bob with goggles on forehead, freckles, oversized leather apron with gear-shaped buttons" },
          { name: "facial_features", description: "Features that change between expressions", defaultValue: "eyebrow angle, mouth shape, eye openness, head tilt, goggle position" },
          { name: "art_style", description: "Illustration style", defaultValue: "clean cel-shaded digital art with warm tones" },
          { name: "line_quality", description: "Line art characteristics", defaultValue: "confident, varied-weight ink" },
          { name: "background", description: "Background treatment", defaultValue: "clean white with a subtle warm cream vignette" },
          { name: "body_language_notes", description: "Body language guidance per expression", defaultValue: "shoulders raised when alarmed, chin lifted when determined, hands fidgeting when concentrating" }
        ]
      }
    ],
    examples: [
      {
        input: "Genre: fantasy adventure, Title: The Last Ember, Character: teenage girl with silver hair holding a glowing ember, Style: Studio Ghibli-inspired",
        output: "A breathtaking fantasy book cover showing a silver-haired girl at the edge of a floating island. Warm amber and twilight purple palette with golden hour lighting. Phoenix feathers drift around crumbling rune pillars. Title space reserved at top. The image radiates wonder and quiet determination.",
        image: cover("pm-22-childrens-book")
      },
      {
        input: "Scene: fox and rabbit discover a hidden garden behind a waterfall, Style: soft watercolor with ink outlines, Book type: children's picture book",
        output: "A panoramic double-page spread transitioning from cool blue waterfall tones on the left to warm golden garden light on the right. The fox peers through parting vines while the rabbit inside points excitedly at bioluminescent flowers. Hidden details include firefly trails and a tiny carved sign. Text areas reserved at bottom corners.",
        image: cover("pm-22-childrens-book")
      }
    ]
  },

  /* ═══════════════════════════════════════════════════
   * 23. CHILDREN'S BOOK & CHARACTER ART
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Children's Book & Character Art", vi: "Sách Thiếu Nhi & Nghệ Thuật Nhân Vật" },
    category: "education",
    tags: ["childrens-book", "character-art", "cute", "education", "kids", "illustration", "storybook", "whimsical"],
    priceSKT: 85,
    sellerIdx: 5,
    description: {
      en: "Design adorable children's book illustrations, character sheets, and educational posters for kids. Whimsical art styles perfect for picture books, classroom materials, and children's media.",
      vi: "Thiết kế minh họa sách thiếu nhi đáng yêu, bảng nhân vật và poster giáo dục cho trẻ em. Phong cách nghệ thuật kỳ ảo hoàn hảo cho sách tranh, tài liệu lớp học và truyền thông thiếu nhi."
    },
    previewText: "Adorable children's book pages, cute character sheets, and fun educational posters.",
    coverImage: cover("pm-23-pet-portrait"),
    models: ["gpt-4o", "dall-e-3", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Children's Book Page Spread",
        content: "Illustrate a children's picture book page spread for ages {{age_range}}. Story: \"{{story_title}}\" — {{story_summary}}. This page scene: {{scene_description}}. Main character: {{main_character}}. Supporting characters: {{supporting_characters}}. Environment: {{environment}}. Mood: {{mood}} with a {{color_feel}} color feel. Art style: {{art_style}}. Composition: {{composition}} — left page shows {{left_content}}, right page shows {{right_content}}. Text placement: reserve {{text_area}} for {{text_lines}} lines of text. Include {{hidden_details}} hidden details for kids to discover. The illustration should be {{emotional_quality}} — the kind of page a child would ask to see again and again. Render at {{resolution}} for print.",
        description: "Create a charming double-page children's book illustration with engaging characters, discoverable hidden details, and thoughtful text placement.",
        variables: [
          { name: "age_range", description: "Target age group", defaultValue: "3-6 years old" },
          { name: "story_title", description: "Book title", defaultValue: "Benny the Brave Little Bus" },
          { name: "story_summary", description: "Brief story summary", defaultValue: "A shy school bus overcomes his fear of steep hills to help his friends get to school on a snowy day" },
          { name: "scene_description", description: "What happens on this page", defaultValue: "Benny takes a deep breath at the bottom of the big snowy hill, with all the animal children cheering him on from inside" },
          { name: "main_character", description: "Main character appearance", defaultValue: "Benny — a small, round yellow school bus with big expressive headlight-eyes, a determined smile on his bumper, and a red scarf around his antenna" },
          { name: "supporting_characters", description: "Other characters", defaultValue: "through the windows: a bunny, a bear cub, a fox kit, and a duckling, all pressing their noses against the glass" },
          { name: "environment", description: "Setting description", defaultValue: "a gentle snowy village with a big curved hill ahead, pine trees dusted with snow, warm lamplight from houses, snowflakes falling" },
          { name: "mood", description: "Emotional tone", defaultValue: "warm encouragement and gentle bravery" },
          { name: "color_feel", description: "Color temperature", defaultValue: "warm golden-yellow against cool snowy whites and soft blues" },
          { name: "art_style", description: "Illustration style", defaultValue: "soft digital watercolor with rounded forms, similar to Oliver Jeffers meets Benji Davies" },
          { name: "composition", description: "Page layout", defaultValue: "panoramic spread with gentle depth" },
          { name: "left_content", description: "Left page focus", defaultValue: "the snowy village behind Benny, warm windows glowing" },
          { name: "right_content", description: "Right page focus", defaultValue: "the big hill stretching up with Benny at the base looking determined" },
          { name: "text_area", description: "Where text goes", defaultValue: "a soft area at top-left corner" },
          { name: "text_lines", description: "Number of text lines", defaultValue: "3-4" },
          { name: "hidden_details", description: "Easter eggs for kids", defaultValue: "a tiny snowman wearing a matching red scarf, a cat watching from a window, bird tracks in the snow" },
          { name: "emotional_quality", description: "Core emotional experience", defaultValue: "heartwarming and gently funny" },
          { name: "resolution", description: "Output quality", defaultValue: "high-resolution, 300 DPI print-ready" }
        ]
      },
      {
        title: "Cute Animal Character Sheet",
        content: "Design a character sheet for {{character_name}}, a cute {{animal_type}} character for a {{project_type}}. Show {{num_views}} views: {{view_list}}. Character traits: {{personality_traits}}. Outfit/accessories: {{outfit}}. Special feature: {{special_feature}}. Art style: {{art_style}} with {{line_quality}} lines and {{coloring_style}} coloring. Show {{num_expressions}} expressions: {{expression_list}}. Include {{num_poses}} action poses: {{pose_list}}. Size reference: {{size_reference}}. Background: {{background}}. Color palette swatch: include {{num_colors}} key colors used. The character should appeal to {{target_audience}} and be versatile enough for {{use_cases}}. Label each view and expression clearly.",
        description: "Generate an adorable animal character reference sheet with multiple views, expressions, action poses, color palette, and size reference.",
        variables: [
          { name: "character_name", description: "Character name", defaultValue: "Mochi" },
          { name: "animal_type", description: "Type of animal", defaultValue: "round baby red panda" },
          { name: "project_type", description: "What project this is for", defaultValue: "children's educational app about emotions" },
          { name: "num_views", description: "Number of character views", defaultValue: "3" },
          { name: "view_list", description: "Which views to show", defaultValue: "front view, three-quarter view, back view" },
          { name: "personality_traits", description: "Character personality", defaultValue: "curious, slightly clumsy, warm-hearted, loves snacks" },
          { name: "outfit", description: "What the character wears", defaultValue: "a tiny yellow raincoat with oversized sleeves, green rubber boots, and a leaf-shaped backpack" },
          { name: "special_feature", description: "Unique visual trait", defaultValue: "tail curls into a heart shape when happy" },
          { name: "art_style", description: "Illustration style", defaultValue: "chibi-inspired kawaii with soft proportions (big head, small body)" },
          { name: "line_quality", description: "Line art style", defaultValue: "clean, soft-weight rounded" },
          { name: "coloring_style", description: "Coloring approach", defaultValue: "cel-shaded with soft ambient occlusion shadows" },
          { name: "num_expressions", description: "Number of facial expressions", defaultValue: "6" },
          { name: "expression_list", description: "Emotions to show", defaultValue: "happy (sparkle eyes), sad (teary, droopy ears), surprised (O mouth, wide eyes), angry (puffed cheeks), sleepy (half-closed eyes, yawn), excited (starry eyes, bouncing)" },
          { name: "num_poses", description: "Number of action poses", defaultValue: "4" },
          { name: "pose_list", description: "Action poses", defaultValue: "waving hello, running with toast in mouth, reading a big book, hugging a plush toy" },
          { name: "size_reference", description: "Size comparison", defaultValue: "standing next to an apple — Mochi is about 3 apples tall" },
          { name: "background", description: "Background style", defaultValue: "clean white with light grid for scale reference" },
          { name: "num_colors", description: "Colors in palette swatch", defaultValue: "8" },
          { name: "target_audience", description: "Who this character is for", defaultValue: "children ages 2-7" },
          { name: "use_cases", description: "Where this character will be used", defaultValue: "app UI, sticker packs, animated shorts, and merchandise" }
        ]
      },
      {
        title: "Educational Poster for Kids",
        content: "Design a fun, colorful educational poster for kids (ages {{age_range}}) teaching {{topic}}. Title: \"{{poster_title}}\" in {{title_style}} lettering. Content: {{content_sections}} sections showing {{content_items}}. Each item has a {{item_format}}. Visual style: {{art_style}} with {{character_guide}} — a friendly character guide named {{guide_name}} (a {{guide_appearance}}) who appears {{guide_appearances}} times pointing at or interacting with the content. Color scheme: {{color_scheme}}. Layout: {{layout}} with clear visual hierarchy. Border: {{border_style}}. Include {{interactive_element}} interactive elements (designed for print). Fun factor: {{fun_elements}}. The poster should be educational but never boring — it should make kids want to hang it on their bedroom wall. Size: {{poster_size}}.",
        description: "Create a vibrant, character-guided educational poster for children with clear sections, interactive elements, and irresistible visual appeal.",
        variables: [
          { name: "age_range", description: "Target age group", defaultValue: "4-8 years old" },
          { name: "topic", description: "What the poster teaches", defaultValue: "the solar system and planets" },
          { name: "poster_title", description: "Poster title text", defaultValue: "My Amazing Solar System!" },
          { name: "title_style", description: "Title lettering style", defaultValue: "bouncy, bubbly 3D block letters with star decorations" },
          { name: "content_sections", description: "Number of sections", defaultValue: "8 (one per planet)" },
          { name: "content_items", description: "What each section contains", defaultValue: "each planet with a fun fact, size comparison, cute face/personality, and one fun icon (rings for Saturn, storm for Jupiter, etc.)" },
          { name: "item_format", description: "Format per item", defaultValue: "circular planet illustration + name label + one-line fun fact in a speech bubble" },
          { name: "art_style", description: "Illustration style", defaultValue: "playful flat illustration with soft gradients, chunky rounded shapes" },
          { name: "character_guide", description: "Role of the guide character", defaultValue: "a friendly mascot who helps guide the eye and adds humor" },
          { name: "guide_name", description: "Guide character name", defaultValue: "Captain Comet" },
          { name: "guide_appearance", description: "What the guide looks like", defaultValue: "a tiny smiling comet with a space helmet, streaming trail of sparkles" },
          { name: "guide_appearances", description: "How many times the guide appears", defaultValue: "3" },
          { name: "color_scheme", description: "Poster color palette", defaultValue: "deep space purple background with bright rainbow planet colors: red Mercury, orange Venus, blue Earth, red Mars, orange-tan Jupiter, golden Saturn, ice-blue Uranus, deep blue Neptune" },
          { name: "layout", description: "Poster layout", defaultValue: "sun at center-left with planets orbiting outward in a curved path across the poster" },
          { name: "border_style", description: "Border design", defaultValue: "rocket ships and stars border frame" },
          { name: "interactive_element", description: "Print-friendly interactive features", defaultValue: "a 'size comparison' scale at the bottom where kids can measure planets with their thumb" },
          { name: "fun_elements", description: "Elements that add fun/humor", defaultValue: "Saturn wearing sunglasses, Jupiter with a storm swirl hat, Earth giving a thumbs up" },
          { name: "poster_size", description: "Poster dimensions", defaultValue: "18×24 inches, portrait orientation" }
        ]
      }
    ],
    examples: [
      {
        input: "Story: Benny the Brave Little Bus, Scene: Benny at bottom of snowy hill, Style: soft watercolor like Oliver Jeffers, Ages: 3-6",
        output: "A heartwarming double-page spread in soft digital watercolor. Left page: a cozy snowy village with warm glowing windows receding behind. Right page: a big gentle hill stretches upward covered in fresh snow. At the base, small round yellow Benny the bus wears a red scarf, headlight-eyes showing determination. Through his windows: a bunny, bear cub, fox kit, and duckling press their noses against the glass cheering. Snowflakes drift down. Hidden details: a tiny snowman with matching scarf, a cat in a window, bird tracks. Warm gold and cool blue palette. Text area reserved at top-left.",
        image: cover("pm-23-pet-portrait")
      },
      {
        input: "Character: Mochi the baby red panda, Style: chibi kawaii, Include: 3 views, 6 expressions, 4 action poses, for children's education app",
        output: "An adorable character sheet on white grid background. Top row: front, three-quarter, and back views of Mochi — a round baby red panda in yellow raincoat, green boots, and leaf backpack. Heart-shaped tail curl visible in back view. Middle row: 6 expressions — happy (sparkle eyes), sad (teary), surprised (O mouth), angry (puffed cheeks), sleepy (yawning), excited (starry-eyed bouncing). Bottom row: 4 action poses — waving, running with toast, reading a big book, hugging a plush. Size reference: 3 apples tall. 8-color palette swatch in corner.",
        image: cover("pm-23-pet-portrait")
      }
    ]
  },

  /* ═══════════════════════════════════════════════════
   * 24. EMAIL & NEWSLETTER VISUAL
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Email & Newsletter Visual", vi: "Hình Ảnh Email & Bản Tin" },
    category: "marketing",
    tags: ["email", "newsletter", "marketing", "campaign", "visual", "header", "seasonal", "product-launch"],
    priceSKT: 70,
    sellerIdx: 6,
    description: {
      en: "Craft stunning email header images for newsletters, seasonal campaigns, and product launches. Each prompt generates visuals sized and composed specifically for email clients with safe zones and text overlay areas.",
      vi: "Tạo hình ảnh header email đẹp mắt cho bản tin, chiến dịch theo mùa và ra mắt sản phẩm. Mỗi prompt tạo hình ảnh được thiết kế riêng cho email client với vùng an toàn và khu vực chèn chữ."
    },
    previewText: "Stunning email hero images for newsletters, seasonal campaigns, and product launches — email-client optimized.",
    coverImage: cover("pm-24-vintage-retro"),
    models: ["dall-e-3", "midjourney", "flux", "stable-diffusion-xl"],
    prompts: [
      {
        title: "Newsletter Hero Image",
        content: "Create a wide newsletter hero image (600x250 pixels, approximately 2.4:1 ratio) for a {{newsletter_topic}} newsletter. The image features a {{visual_concept}} composition with a {{color_palette}} color scheme. Left 40%: {{left_content}} with clear detail. Right 60%: gradual fade into a solid {{fade_color}} area for headline text overlay. Style: {{aesthetic}} with editorial magazine quality. The image must read clearly at both desktop and mobile email widths. Avoid intricate details smaller than 10px as they will be lost in email rendering. Lighting: {{lighting_style}}. Include subtle brand texture like {{texture_element}} to add depth without visual noise. The overall mood should be {{mood}} — inviting the reader to continue scrolling the email.",
        description: "Generates an email-optimized newsletter hero image with smart fade-to-text composition for maximum readability.",
        variables: [
          { name: "newsletter_topic", description: "Newsletter subject or industry", defaultValue: "weekly design trends" },
          { name: "visual_concept", description: "Core visual idea", defaultValue: "curated workspace with design tools and inspiration boards" },
          { name: "color_palette", description: "Color scheme", defaultValue: "warm terracotta and cream with sage green accents" },
          { name: "left_content", description: "Main visual content on the left", defaultValue: "designer's desk with mood board, color swatches, and a laptop showing a design project" },
          { name: "fade_color", description: "Color the image fades into (for text overlay)", defaultValue: "warm cream #F5F0E8" },
          { name: "aesthetic", description: "Visual style", defaultValue: "modern editorial with analog warmth" },
          { name: "lighting_style", description: "Lighting approach", defaultValue: "soft morning window light with warm golden tones" },
          { name: "texture_element", description: "Subtle background texture", defaultValue: "fine paper grain" },
          { name: "mood", description: "Emotional tone", defaultValue: "inspiring and approachable" }
        ]
      },
      {
        title: "Seasonal Campaign Banner",
        content: "Design a seasonal email campaign banner (600x300) for a {{season}} promotion by a {{brand_type}} brand. The banner captures the essence of {{season}} through {{seasonal_elements}} arranged in a {{composition}} composition. Color palette: {{seasonal_palette}}. The center area (200x100px zone) should remain relatively clean for overlaying a promotional message. Decorative elements frame the edges: {{border_elements}}. Style: {{campaign_style}} — festive yet sophisticated, never tacky. Include subtle {{particle_effect}} particles or elements floating through the scene for depth and movement suggestion. The image should feel {{emotional_quality}} and drive urgency for seasonal shopping. Render at 2x resolution for retina email clients. No text in the image.",
        description: "Creates a festive yet sophisticated seasonal email banner with room for promotional text overlay.",
        variables: [
          { name: "season", description: "Season or holiday", defaultValue: "winter holiday" },
          { name: "brand_type", description: "Type of brand", defaultValue: "luxury candle and home fragrance" },
          { name: "seasonal_elements", description: "Key seasonal visual elements", defaultValue: "frosted pine branches, cinnamon sticks, gold ornaments, and soft candlelight" },
          { name: "composition", description: "Layout arrangement", defaultValue: "symmetrical wreath-like frame" },
          { name: "seasonal_palette", description: "Season-appropriate colors", defaultValue: "deep forest green, burgundy, gold foil, and ivory" },
          { name: "border_elements", description: "Decorative border details", defaultValue: "watercolor pine sprigs and gold leaf accents" },
          { name: "campaign_style", description: "Campaign visual style", defaultValue: "elegant botanical illustration meets photography" },
          { name: "particle_effect", description: "Floating atmospheric elements", defaultValue: "soft golden bokeh and tiny snowflakes" },
          { name: "emotional_quality", description: "Desired emotional response", defaultValue: "cozy, warm, and gift-giving inspired" }
        ]
      },
      {
        title: "Product Launch Email Visual",
        content: "Create a product launch announcement email hero image (600x400) for a new {{product_name}} by a {{company_type}} company. The image features the product — {{product_visual}} — as the undeniable hero element occupying 50% of the frame, floating or elevated on a {{pedestal_style}} with dramatic {{lighting_type}} lighting. Background: {{background_scene}} with a {{atmosphere}} atmosphere. Subtle visual cues suggest newness and innovation: {{innovation_cues}}. A gentle {{glow_effect}} glow emanates from or around the product suggesting premium quality. The bottom 25% of the image transitions to {{bottom_color}} for seamless blending with the email body background. Color grading: {{color_grade}}. The composition should create a sense of reveal and excitement — this is the first time customers are seeing this product.",
        description: "Generates a dramatic product reveal email image with cinematic lighting and premium presentation.",
        variables: [
          { name: "product_name", description: "Name of the new product", defaultValue: "AuraSound Pro headphones" },
          { name: "company_type", description: "Type of company", defaultValue: "premium audio tech" },
          { name: "product_visual", description: "Detailed product description", defaultValue: "over-ear wireless headphones in midnight blue with brushed aluminum accents and memory foam cushions" },
          { name: "pedestal_style", description: "How the product is elevated/displayed", defaultValue: "floating on an invisible surface with subtle shadow below" },
          { name: "lighting_type", description: "Dramatic lighting style", defaultValue: "three-point cinematic with blue-tinted key light" },
          { name: "background_scene", description: "Background environment", defaultValue: "abstract dark gradient with subtle sound wave visualizations" },
          { name: "atmosphere", description: "Atmospheric quality", defaultValue: "mysterious and premium" },
          { name: "innovation_cues", description: "Visual elements suggesting newness", defaultValue: "subtle lens flare, light rays, and particle dispersion effect" },
          { name: "glow_effect", description: "Type of glow around product", defaultValue: "soft blue-white ambient" },
          { name: "bottom_color", description: "Color at bottom for email body blending", defaultValue: "pure black #000000" },
          { name: "color_grade", description: "Overall color grading", defaultValue: "cool blue-black with selective warm highlights on product details" }
        ]
      }
    ],
    examples: [
      {
        input: "newsletter_topic: weekly tech roundup, visual_concept: futuristic reading environment, color_palette: dark navy and electric blue with white, left_content: holographic tablet displaying news headlines floating above a sleek desk, fade_color: dark navy #1A1A2E, aesthetic: sci-fi editorial, lighting_style: neon ambient with holographic reflections, texture_element: subtle circuit board pattern, mood: forward-thinking and informative",
        output: "A wide 2.4:1 newsletter hero image showing a futuristic reading setup. On the left, a holographic tablet floats above a minimalist dark desk, projecting blue-tinted news headlines into the air. Electric blue accent lighting reflects off the sleek surface. The right portion smoothly fades into deep navy (#1A1A2E), creating a perfect zone for white headline text. A subtle circuit board texture adds tech depth without clutter. The mood is forward-thinking — perfect for a tech newsletter header.",
        image: cover("pm-24-vintage-retro")
      },
      {
        input: "product_name: Bloom Vitamin C Serum, company_type: clean beauty, product_visual: amber glass dropper bottle with white label and orange slice cross-sections visible in the serum, pedestal_style: resting on a wet stone surface with citrus leaves, lighting_type: bright natural backlighting creating a golden glow through the serum, background_scene: soft bokeh of an orange grove, atmosphere: fresh and natural, innovation_cues: dewdrops on the bottle and light refracting through the golden liquid, glow_effect: warm golden sunlight halo, bottom_color: clean white #FFFFFF, color_grade: bright and warm with enhanced orange and gold tones",
        output: "A stunning 600x400 product launch hero image featuring the Bloom Vitamin C Serum as the centerpiece. The amber glass dropper bottle sits on a wet river stone with fresh citrus leaves. Bright backlighting creates a gorgeous golden glow through the serum, revealing orange slice cross-sections within. Dewdrops catch light on the glass surface. A soft-focus orange grove bokeh fills the background. A warm sunlight halo surrounds the bottle. The bottom quarter transitions seamlessly to white for email body blending.",
        image: cover("pm-24-vintage-retro")
      }
    ]
  },

  /* ═══════════════════════════════════════════════════
   * 25. 3D PRODUCT MOCKUP & RENDERING
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "3D Product Mockup & Rendering", vi: "Mockup & Rendering Sản Phẩm 3D" },
    category: "design",
    tags: ["3d-render", "mockup", "product", "octane", "blender", "visualization"],
    priceSKT: 110,
    isFree: false,
    featured: false,
    sellerIdx: 0,
    description: {
      en: "Production-ready AI prompts for photorealistic 3D product mockups — device scenes, floating compositions, and packaging renders with Octane/Blender aesthetics.",
      vi: "Prompt AI sẵn sàng sản xuất cho mockup sản phẩm 3D chân thực — cảnh thiết bị, bố cục lơ lửng và render bao bì với phong cách Octane/Blender.",
    },
    previewText: "Generate stunning 3D product mockups and renders — device scene compositions, floating product shots, and packaging visualizations with photorealistic Octane/Blender quality.",
    coverImage: cover("pm-25-3d-mockup"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Device Mockup Scene",
        content: "A photorealistic 3D render of a {{device_type}} displaying {{screen_content}} on its screen. The device is positioned in a {{scene_layout}} arrangement on a {{surface_material}} surface. Surrounding props include {{scene_props}} to establish a {{context}} context. Materials: {{material_quality}} with accurate reflections, refractions, and subsurface scattering. Lighting: {{lighting_rig}} with {{shadow_style}} shadows. Render engine: Octane Render / Cycles. Camera: {{camera_angle}}, slight depth of field at f/4. Environment: {{environment}}. Post-processing: subtle bloom on screen, chromatic aberration. 8K resolution, product visualization quality, hyperrealistic.",
        description: "Create a photorealistic 3D device mockup scene with contextual props and professional lighting.",
        variables: [
          { name: "device_type", description: "Device to render", defaultValue: "MacBook Pro 16-inch and iPhone 15 Pro side by side" },
          { name: "screen_content", description: "What's on screen", defaultValue: "a sleek SaaS dashboard with dark UI" },
          { name: "scene_layout", description: "Arrangement style", defaultValue: "hero-angle with the laptop at 75 degrees and phone leaning against it" },
          { name: "surface_material", description: "Desk/surface material", defaultValue: "light oak wood desk with visible grain" },
          { name: "scene_props", description: "Contextual props", defaultValue: "a ceramic coffee mug, wireless earbuds case, and a small potted succulent" },
          { name: "context", description: "Scene context", defaultValue: "modern creative workspace" },
          { name: "material_quality", description: "Material rendering", defaultValue: "PBR materials with 4K textures, accurate anodized aluminum on devices" },
          { name: "lighting_rig", description: "Lighting setup", defaultValue: "three-point HDRI studio lighting with warm fill" },
          { name: "shadow_style", description: "Shadow character", defaultValue: "soft contact shadows with subtle ambient occlusion" },
          { name: "camera_angle", description: "Camera perspective", defaultValue: "slightly elevated 30-degree angle, three-quarter view" },
          { name: "environment", description: "Background environment", defaultValue: "clean white cyclorama with soft gradient" },
        ],
      },
      {
        title: "Floating Product 3D",
        content: "A dramatic 3D render of a {{product}} floating in mid-air with a {{float_style}} effect. The product is {{product_finish}} and rotated at a {{rotation}} angle to showcase {{feature_focus}}. Dynamic elements: {{dynamic_elements}} swirling around the product. Background: {{background}} with {{bg_effects}}. Lighting: {{dramatic_lighting}} creating strong highlights on edges and {{rim_light}} rim light separation. Materials rendered with Octane: subsurface scattering on translucent parts, mirror-sharp reflections on metal. Motion blur on particles: subtle. Overall composition is centered with the product as the undeniable focal point. 8K, cinematic product visualization, hyperrealistic 3D render.",
        description: "Generate a dramatic floating product 3D render with dynamic elements and cinematic lighting.",
        variables: [
          { name: "product", description: "Product to render", defaultValue: "pair of premium wireless over-ear headphones" },
          { name: "float_style", description: "Floating effect style", defaultValue: "zero-gravity suspension with a slight tilt" },
          { name: "product_finish", description: "Product surface finish", defaultValue: "matte midnight black with brushed silver accents" },
          { name: "rotation", description: "Product rotation", defaultValue: "dynamic three-quarter view, 15-degree tilt" },
          { name: "feature_focus", description: "Feature to highlight", defaultValue: "the plush ear cushions and premium build quality" },
          { name: "dynamic_elements", description: "Elements around product", defaultValue: "colorful sound wave particles and geometric shards" },
          { name: "background", description: "Background style", defaultValue: "deep gradient from indigo to black" },
          { name: "bg_effects", description: "Background effects", defaultValue: "subtle volumetric fog and distant light rays" },
          { name: "dramatic_lighting", description: "Key lighting", defaultValue: "top-down spotlight with warm amber tone" },
          { name: "rim_light", description: "Rim light color", defaultValue: "electric blue" },
        ],
      },
      {
        title: "Packaging 3D Render",
        content: "A clean, photorealistic 3D render of {{packaging_type}} packaging for a {{brand_category}} brand. The packaging features {{design_elements}} printed on {{material}}. The scene shows {{arrangement}} — with one unit open to reveal {{interior}}. Placed on a {{render_surface}} with {{composition_style}} composition. Lighting: {{studio_light}} providing even illumination with subtle gradients across surfaces. All text and logos are crisp at {{resolution}}. Render settings: Octane / Blender Cycles, {{samples}} samples, denoised. Background: {{render_bg}}. Camera: product photography focal length (85mm equivalent), minimal barrel distortion. The render should be indistinguishable from a real photograph. 8K, commercial packaging visualization.",
        description: "Render photorealistic 3D packaging mockups suitable for brand presentations and pitch decks.",
        variables: [
          { name: "packaging_type", description: "Package format", defaultValue: "rigid magnetic closure box with sleeve" },
          { name: "brand_category", description: "Brand/product category", defaultValue: "premium tech accessories" },
          { name: "design_elements", description: "Visual design on packaging", defaultValue: "minimalist wordmark in silver foil on matte navy with embossed pattern" },
          { name: "material", description: "Packaging material", defaultValue: "heavy-weight art board with soft-touch coating" },
          { name: "arrangement", description: "Scene arrangement", defaultValue: "three boxes at staggered angles — closed, half-open, fully open" },
          { name: "interior", description: "Interior reveal", defaultValue: "custom molded insert holding a braided USB-C cable coil" },
          { name: "render_surface", description: "Surface material", defaultValue: "seamless light grey studio surface" },
          { name: "composition_style", description: "Composition approach", defaultValue: "rule of thirds with negative space on the right for copy" },
          { name: "studio_light", description: "Studio lighting", defaultValue: "large area light overhead with two strip softboxes at 45 degrees" },
          { name: "resolution", description: "Text clarity", defaultValue: "print resolution — 300 DPI equivalent clarity" },
          { name: "samples", description: "Render samples", defaultValue: "4096" },
          { name: "render_bg", description: "Background", defaultValue: "pure white infinity cove" },
        ],
      },
    ],
    examples: [
      {
        input: "MacBook and iPhone mockup on wooden desk with SaaS dashboard, Octane render",
        output: "Photorealistic 3D render of MacBook Pro 16-inch and iPhone 15 Pro on light oak desk displaying a dark UI SaaS dashboard. Three-point HDRI studio lighting, PBR materials with anodized aluminum. Coffee mug and succulent props. Octane Render, 8K hyperrealistic product visualization.",
        image: cover("pm-25-3d-mockup"),
      },
      {
        input: "Floating headphones with sound wave particles on dark gradient background",
        output: "Dramatic 3D render of premium wireless headphones in zero-gravity suspension, matte midnight black with brushed silver. Colorful sound wave particles swirl around the product. Deep indigo-to-black gradient, top-down amber spotlight with electric blue rim light. Octane, 8K cinematic product visualization.",
        image: example("ex-15-headphone-render"),
      },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 26. CINEMATIC DRONE & AERIAL PHOTOGRAPHY
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Cinematic Drone & Aerial Photography", vi: "Nhiếp ảnh Drone & Aerial cinematic" },
    category: "design",
    tags: ["drone", "aerial", "landscape", "cinematic", "nature"],
    priceSKT: 110,
    featured: true,
    sellerIdx: 8,
    description: {
      en: "Create breathtaking aerial drone photography and cinematography. Sweeping landscapes, winding rivers, and dramatic topography from bird's-eye perspective with cinematic color grading.",
      vi: "Tạo ảnh và video drone aerial ngoạn mục. Phong cảnh bao la, sông uốn khúc, và địa hình dramatic từ góc nhìn chim bay với color grading cinematic."
    },
    previewText: "Breathtaking aerial drone photograph of {{landscape}}, {{season}} colors, {{atmosphere}}...",
    coverImage: cover("pm-26-drone-aerial"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Aerial Landscape Mastershot",
        content: "Breathtaking aerial drone photograph of {{landscape}}, {{season_detail}}, {{atmosphere}}, shot from {{altitude}} altitude, {{camera_movement}}, {{time_of_day}}, cinematic wide angle, no text",
        description: "Epic drone landscape shot from bird's-eye perspective",
        variables: [
          { name: "landscape", description: "Landscape subject", defaultValue: "a winding river through dense forest" },
          { name: "season_detail", description: "Season details", defaultValue: "golden and red autumn trees on both sides" },
          { name: "atmosphere", description: "Atmospheric effects", defaultValue: "morning mist rising from the water, sunlight piercing through clouds creating god rays" },
          { name: "altitude", description: "Altitude", defaultValue: "200 meters" },
          { name: "camera_movement", description: "Camera movement", defaultValue: "slow descending reveal following the river curve" },
          { name: "time_of_day", description: "Time of day", defaultValue: "golden hour sunrise" },
        ],
      },
      {
        title: "Top-Down Abstract Pattern",
        content: "Aerial drone photograph looking straight down at {{subject}}, creating an abstract {{pattern}} pattern, {{colors}}, {{scale_reference}}, shot from {{altitude}}, {{lighting}}, creating a mesmerizing {{mood}} composition, no text",
        description: "Top-down abstract aerial pattern",
        variables: [
          { name: "subject", description: "Subject", defaultValue: "a pristine mountain lake surrounded by autumn forest" },
          { name: "pattern", description: "Pattern type", defaultValue: "mirror reflection symmetry" },
          { name: "colors", description: "Color palette", defaultValue: "golden orange canopy contrasting with deep blue water" },
          { name: "scale_reference", description: "Scale reference", defaultValue: "a small wooden dock with a red canoe providing scale" },
          { name: "altitude", description: "Altitude", defaultValue: "150 meters" },
          { name: "lighting", description: "Lighting", defaultValue: "soft morning light with long shadows" },
          { name: "mood", description: "Mood", defaultValue: "meditative" },
        ],
      },
    ],
    examples: [
      { input: "Autumn river from 200m with morning mist and god rays", output: "Sweeping aerial landscape of a winding river through golden-red forest with volumetric mist and dramatic sunlight.", image: cover("pm-26-drone-aerial"), video: video("vid-26-drone-flight") },
      { input: "Top-down mountain lake with autumn reflection", output: "Abstract aerial pattern of pristine lake with mirror-perfect autumn tree reflections and a red canoe for scale.", image: example("ex-26-autumn-lake") },
    ],
  },


  /* ═══════════════════════════════════════════════════
   * 27. CYBERPUNK & NEON CITYSCAPE
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Cyberpunk & Neon Cityscape", vi: "Đô Thị Cyberpunk & Neon" },
    category: "other",
    tags: ["cyberpunk", "neon", "cityscape", "night", "sci-fi", "dystopian", "blade-runner"],
    priceSKT: 95,
    featured: true,
    sellerIdx: 8,
    description: {
      en: "Generate atmospheric cyberpunk cityscapes dripping with neon light, rain-soaked streets, and dystopian grandeur. Perfect for concept art, game environments, and sci-fi visual storytelling inspired by Blade Runner and Ghost in the Shell.",
      vi: "Tạo cảnh đô thị cyberpunk đầy không khí với ánh neon rực rỡ, đường phố ướt mưa và vẻ đẹp dystopian. Hoàn hảo cho concept art, môi trường game và kể chuyện hình ảnh sci-fi lấy cảm hứng từ Blade Runner và Ghost in the Shell."
    },
    previewText: "Rain-soaked neon alleys, cyberpunk rooftops, and dystopian cityscapes at night.",
    coverImage: cover("pm-27-cyberpunk-neon"),
    models: ["gpt-4o", "dall-e-3", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Neon Alley Nightscape",
        content: "Create a cinematic cyberpunk neon alley scene set in {{city_name}}, year {{year}}. The narrow alley is lined with {{building_type}} buildings, {{num_stories}} stories tall, covered in {{signage_type}} signs displaying {{sign_content}} in {{sign_languages}}. Lighting: {{neon_colors}} neon tubes cast colored pools on the {{ground_surface}}. Weather: {{weather}} — {{weather_detail}}. Atmosphere: {{atmosphere}} with {{fog_level}} volumetric fog catching the neon glow. Population: {{crowd_level}} — {{crowd_description}}. Foreground elements: {{foreground}}. Mid-ground: {{midground}}. Background: {{background}} visible between building gaps. Camera: {{camera_angle}}, {{lens}} lens. Post-processing: {{post_processing}}. The image should feel like a single frame from a neo-noir film. Aspect ratio: {{aspect_ratio}}.",
        description: "Generate a deeply atmospheric neon-lit cyberpunk alley with layered depth, cinematic lighting, rain effects, and neo-noir film quality.",
        variables: [
          { name: "city_name", description: "Fictional or real city", defaultValue: "Neo-Kowloon" },
          { name: "year", description: "Year setting", defaultValue: "2087" },
          { name: "building_type", description: "Architecture style", defaultValue: "cramped brutalist concrete mixed with makeshift modular housing, exposed pipes and cable bundles" },
          { name: "num_stories", description: "Building height", defaultValue: "8-12" },
          { name: "signage_type", description: "Sign types", defaultValue: "holographic, LED, and old-fashioned buzzing neon tube" },
          { name: "sign_content", description: "What signs advertise", defaultValue: "ramen shops, cybernetic clinics, data brokers, karaoke bars, pharmaceutical vending" },
          { name: "sign_languages", description: "Languages on signs", defaultValue: "Japanese, Chinese, Korean, and English" },
          { name: "neon_colors", description: "Dominant neon hues", defaultValue: "hot pink (#FF1493), electric cyan (#00FFFF), acid green (#39FF14), warm amber" },
          { name: "ground_surface", description: "Ground material", defaultValue: "wet asphalt reflecting every neon color like liquid chrome" },
          { name: "weather", description: "Weather condition", defaultValue: "heavy rain" },
          { name: "weather_detail", description: "Weather rendering details", defaultValue: "rain streaks visible in neon light cones, puddles with ripple rings, gutter water flowing" },
          { name: "atmosphere", description: "Overall atmosphere", defaultValue: "dense, humid, oppressive yet beautiful" },
          { name: "fog_level", description: "Fog/haze density", defaultValue: "medium-heavy" },
          { name: "crowd_level", description: "How populated", defaultValue: "moderately crowded" },
          { name: "crowd_description", description: "People in the scene", defaultValue: "figures with transparent umbrellas, a street vendor with steam rising from a noodle cart, a hooded figure leaning against a wall checking a holographic phone" },
          { name: "foreground", description: "Close-to-camera elements", defaultValue: "a rain-beaded motorcycle parked at left, steam vent grate at right" },
          { name: "midground", description: "Middle depth elements", defaultValue: "the noodle cart with warm golden light, a flickering vending machine, hanging laundry between buildings" },
          { name: "background", description: "Distant elements", defaultValue: "a massive corporate mega-tower with a pulsing holographic advertisement, barely visible through rain and fog" },
          { name: "camera_angle", description: "Camera perspective", defaultValue: "low eye-level, looking slightly upward into the alley depth" },
          { name: "lens", description: "Camera lens simulation", defaultValue: "35mm with subtle anamorphic lens flares from bright neon sources" },
          { name: "post_processing", description: "Color grading and effects", defaultValue: "teal-and-orange color grade, chromatic aberration at edges, film grain, bloom on bright neons" },
          { name: "aspect_ratio", description: "Image dimensions", defaultValue: "21:9 ultrawide cinematic" }
        ]
      },
      {
        title: "Cyberpunk Rooftop Panorama",
        content: "Illustrate a cyberpunk rooftop panorama viewed from {{vantage_point}} in a sprawling megacity. Time: {{time_of_day}}. The rooftop itself features: {{rooftop_elements}}. Skyline: {{skyline_description}} — a forest of {{building_variety}} stretching to the horizon. Sky: {{sky_condition}}. Flying vehicles: {{flying_vehicles}} crossing the sky at various altitudes. Giant {{mega_ads}} holographic advertisements float between buildings showing {{ad_content}}. Atmospheric layers: {{atmosphere_layers}}. A {{character_presence}} is present on the rooftop — {{character_detail}}. Lighting: {{lighting}} with {{light_sources}} as key light sources. Color palette: {{color_palette}}. Mood: {{mood}}. Camera: {{camera_specs}}. This image should evoke the feeling of {{emotional_target}}. Aspect ratio: {{aspect_ratio}}.",
        description: "Create a sweeping cyberpunk rooftop panorama overlooking a neon-drenched megacity with flying vehicles, holographic ads, and atmospheric depth.",
        variables: [
          { name: "vantage_point", description: "Where on the rooftop", defaultValue: "the edge of a 60-story residential block, looking out over the lower city districts" },
          { name: "time_of_day", description: "Time setting", defaultValue: "twilight — the last orange sliver of sunset on the horizon, city lights igniting" },
          { name: "rooftop_elements", description: "What's on the rooftop", defaultValue: "satellite dishes, hanging gardens in repurposed crates, string lights, a makeshift bar with stools, antenna arrays" },
          { name: "skyline_description", description: "City skyline", defaultValue: "a chaotic layered skyline mixing ultra-modern glass spires with decayed concrete megastructures" },
          { name: "building_variety", description: "Types of buildings visible", defaultValue: "corporate glass towers, stacked modular apartments, massive industrial cooling towers, elevated highway ribbons" },
          { name: "sky_condition", description: "Sky appearance", defaultValue: "smoggy gradient from bruised purple at zenith to burning orange at the horizon, with breaks of stars visible above the smog layer" },
          { name: "flying_vehicles", description: "Aerial traffic", defaultValue: "streams of flying cars with red/white light trails, a police drone with searchlight, a massive cargo blimp drifting slowly" },
          { name: "mega_ads", description: "Giant advertisement style", defaultValue: "building-sized" },
          { name: "ad_content", description: "What ads display", defaultValue: "a smiling face promoting neural implants, a fizzy drink brand, a political propaganda message" },
          { name: "atmosphere_layers", description: "Depth atmosphere", defaultValue: "crisp detail in foreground, mid-city in haze, distant towers barely silhouettes in smog — 5 visible depth layers" },
          { name: "character_presence", description: "Person on the rooftop", defaultValue: "lone figure" },
          { name: "character_detail", description: "Character description", defaultValue: "seen from behind, wearing a long coat fluttering in the wind, cybernetic arm glinting, looking out at the city" },
          { name: "lighting", description: "Lighting setup", defaultValue: "complex mixed lighting — warm sunset rim light on character, cool neon fill from below, warm string lights on rooftop" },
          { name: "light_sources", description: "Key light sources", defaultValue: "the dying sunset, neon city glow from below, holographic ad illumination, rooftop string lights" },
          { name: "color_palette", description: "Color scheme", defaultValue: "deep purple, burning orange, electric cyan, hot magenta, warm amber accents" },
          { name: "mood", description: "Emotional mood", defaultValue: "contemplative solitude in a world of overwhelming spectacle" },
          { name: "camera_specs", description: "Camera settings", defaultValue: "wide-angle 24mm, deep focus, slight upward tilt to capture sky drama" },
          { name: "emotional_target", description: "Emotional response to evoke", defaultValue: "awe mixed with loneliness — beautiful but overwhelming" },
          { name: "aspect_ratio", description: "Image dimensions", defaultValue: "32:9 super-ultrawide panoramic" }
        ]
      },
      {
        title: "Rain-Soaked Neon Street",
        content: "Generate a street-level view of a rain-soaked cyberpunk boulevard at {{time}}. Street width: {{street_width}} with {{lane_config}}. Ground: {{surface_detail}} — every surface acts as a mirror for the neon above. Traffic: {{traffic_description}}. Pedestrians: {{pedestrian_detail}}. Left side: {{left_buildings}} — {{left_details}}. Right side: {{right_buildings}} — {{right_details}}. Overhead: {{overhead_elements}}. Rain intensity: {{rain_intensity}} — {{rain_rendering}}. Reflections: {{reflection_quality}}. Focal point: {{focal_point}} draws the eye with {{focal_treatment}}. Depth: {{depth_rendering}}. Color story: {{color_narrative}}. Sound cues conveyed visually: {{visual_sound}}. Style: {{render_style}}. This should feel like {{reference_feel}}. Aspect ratio: {{aspect_ratio}}.",
        description: "Create a ground-level cyberpunk street scene with mirror-like wet surfaces, dense atmospheric rain, layered neon reflections, and cinematic depth.",
        variables: [
          { name: "time", description: "Time of scene", defaultValue: "2:00 AM, deep night" },
          { name: "street_width", description: "How wide the street is", defaultValue: "6-lane boulevard" },
          { name: "lane_config", description: "Lane arrangement", defaultValue: "2 ground lanes, 2 elevated mag-lev rails, 2 pedestrian walkways on each side" },
          { name: "surface_detail", description: "Ground surface detail", defaultValue: "rain-flooded asphalt with cracked panels, manhole covers emitting steam, painted lane markings bleeding color into water" },
          { name: "traffic_description", description: "Vehicles present", defaultValue: "a few autonomous taxis with glowing underbody lights, a massive cargo truck with container covered in graffiti, a motorcycle splitting lanes with a neon trail" },
          { name: "pedestrian_detail", description: "People on the street", defaultValue: "a couple sharing a holographic umbrella, a delivery runner on inline skates, a street musician playing under an awning with an electronic instrument" },
          { name: "left_buildings", description: "Left side architecture", defaultValue: "a row of older 5-story mixed-use buildings with shops at ground level" },
          { name: "left_details", description: "Left side details", defaultValue: "a ramen shop with warm interior visible through steamed glass, a closed pawn shop with metal shutters, a 24-hour pharmacy with green cross neon" },
          { name: "right_buildings", description: "Right side architecture", defaultValue: "a towering 40-story corporate monolith with a slanted glass facade" },
          { name: "right_details", description: "Right side details", defaultValue: "lobby visible at street level with harsh white light, digital stock ticker scrolling on the facade, upper floors disappearing into fog" },
          { name: "overhead_elements", description: "What's above the street", defaultValue: "tangle of power cables, a pedestrian bridge at 3rd-floor level, holographic directional signs, the mag-lev rail supports" },
          { name: "rain_intensity", description: "How heavy the rain is", defaultValue: "steady moderate downpour" },
          { name: "rain_rendering", description: "How rain is depicted", defaultValue: "visible rain streaks lit by neon, individual drops frozen in light cones of street lamps, splash coronets in puddles" },
          { name: "reflection_quality", description: "Reflection fidelity", defaultValue: "near-perfect mirror reflections in standing water, broken/stretched reflections in flowing water, muted reflections on wet walls" },
          { name: "focal_point", description: "Where the eye is drawn", defaultValue: "the warm golden light spilling from the ramen shop doorway onto the wet sidewalk" },
          { name: "focal_treatment", description: "How the focal point is emphasized", defaultValue: "warmest color temperature in the frame, slight depth-of-field blur on either side" },
          { name: "depth_rendering", description: "How depth is conveyed", defaultValue: "sharp foreground, focused mid-ground, atmospheric haze and bokeh in background — classical three-layer depth" },
          { name: "color_narrative", description: "Color story of the image", defaultValue: "predominantly cool blue-cyan with one warm golden pocket at the ramen shop — cold world, small warmth" },
          { name: "visual_sound", description: "How sound is suggested visually", defaultValue: "visible steam hiss from vents, rain splash dynamics, glowing equalizer bars from the street musician's amp" },
          { name: "render_style", description: "Rendering approach", defaultValue: "hyper-realistic digital painting with photographic lighting accuracy" },
          { name: "reference_feel", description: "What it should remind of", defaultValue: "a still from Blade Runner 2049 crossed with Ghost in the Shell's Hong Kong" },
          { name: "aspect_ratio", description: "Image dimensions", defaultValue: "2.39:1 anamorphic widescreen" }
        ]
      }
    ],
    examples: [
      {
        input: "Scene: neon alley in Neo-Kowloon 2087, heavy rain, hot pink and cyan neon, 35mm anamorphic lens, neo-noir film feel",
        output: "An ultrawide cinematic frame of a rain-drenched neon alley. Cramped 10-story brutalist buildings press inward, covered in Japanese/Chinese neon signs advertising ramen shops and cybernetic clinics. Hot pink and electric cyan neon tubes paint the wet asphalt in liquid chrome reflections. Rain streaks cut through light cones. A steam-wreathed noodle cart glows golden in the mid-ground. A hooded figure checks a holographic phone. A rain-beaded motorcycle sits in foreground. Far background: a corporate mega-tower pulses through the fog. Teal-orange grade with anamorphic lens flares and film grain.",
        image: cover("pm-27-cyberpunk-neon"),
        video: video("vid-27-cyberpunk-walk")
      },
      {
        input: "Scene: cyberpunk rooftop at twilight, lone figure with cybernetic arm, overlooking megacity with flying cars and holographic ads",
        output: "A super-ultrawide panorama from a 60th-floor rooftop edge. A lone figure in a flowing coat stands silhouetted against the dying sunset, cybernetic arm catching the last orange light. Below: a chaotic layered skyline of glass spires and concrete megastructures. Flying car streams leave red/white trails. A massive cargo blimp drifts past. Building-sized holographic ads — neural implant promotions, fizzy drinks — cast colored light through smoggy air. String lights and repurposed garden crates on the rooftop. Five depth layers from crisp foreground to ghostly distant silhouettes. Purple, orange, cyan, and magenta palette.",
        image: example("ex-27-neon-alley")
      }
    ]
  },

  /* ═══════════════════════════════════════════════════
   * 28. WEDDING & EVENT PHOTOGRAPHY
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Wedding & Event Photography Pro", vi: "Nhiếp ảnh cưới & sự kiện Pro" },
    category: "design",
    tags: ["wedding", "event", "romantic", "golden-hour", "editorial"],
    priceSKT: 130,
    featured: true,
    sellerIdx: 3,
    description: {
      en: "Create magazine-quality wedding and event photography. Golden hour portraits, romantic silhouettes, first dance moments, and editorial reception details with cinematic video.",
      vi: "Tạo ảnh cưới & sự kiện chất lượng tạp chí. Chân dung golden hour, silhouette lãng mạn, khoảnh khắc khiêu vũ đầu tiên, và chi tiết tiệc cưới editorial với video cinematic."
    },
    previewText: "Romantic {{time_of_day}} wedding photograph, {{couple}} silhouetted against {{backdrop}}...",
    coverImage: cover("pm-28-wedding-photo"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Golden Hour Couple Portrait",
        content: "Romantic {{time_of_day}} wedding photograph, {{couple}} silhouetted against {{backdrop}}, {{venue}}, the bride's {{dress_detail}}, {{lighting}}, {{background_detail}}, editorial wedding photography, no text",
        description: "Dreamy golden hour wedding portrait",
        variables: [
          { name: "time_of_day", description: "Time of day", defaultValue: "golden hour" },
          { name: "couple", description: "Couple description", defaultValue: "bride and groom embracing" },
          { name: "backdrop", description: "Backdrop", defaultValue: "a sunset sky in lavender and gold" },
          { name: "venue", description: "Venue", defaultValue: "standing in a lavender field in Provence" },
          { name: "dress_detail", description: "Dress detail", defaultValue: "long cathedral veil flowing in the wind" },
          { name: "lighting", description: "Lighting", defaultValue: "warm backlit golden rim light" },
          { name: "background_detail", description: "Background detail", defaultValue: "bokeh fairy lights and distant château" },
        ],
      },
      {
        title: "First Dance Cinematic",
        content: "Cinematic wedding first dance photograph, {{couple_action}} in an {{venue}}, {{lighting_setup}}, {{decoration}}, the {{dress_movement}}, {{atmosphere}}, editorial wedding film still quality, no text",
        description: "Cinematic first dance moment",
        variables: [
          { name: "couple_action", description: "Couple action", defaultValue: "bride and groom in an intimate slow dance, foreheads touching" },
          { name: "venue", description: "Venue", defaultValue: "outdoor garden reception with a wooden dance floor" },
          { name: "lighting_setup", description: "Lighting", defaultValue: "warm Edison bulb string lights creating golden bokeh circles overhead" },
          { name: "decoration", description: "Decorations", defaultValue: "arrangements of white roses and eucalyptus on tables surrounding the floor" },
          { name: "dress_movement", description: "Dress movement", defaultValue: "bride's chiffon gown flowing gracefully mid-twirl" },
          { name: "atmosphere", description: "Atmosphere", defaultValue: "guests softly blurred in background, sparkler light trails" },
        ],
      },
    ],
    examples: [
      { input: "Golden hour wedding in lavender field with flowing veil", output: "Romantic backlit silhouette of couple in Provence lavender field with cathedral veil caught by the wind.", image: cover("pm-28-wedding-photo"), video: video("vid-28-wedding-dance") },
      { input: "Cinematic first dance under Edison bulb lights in garden reception", output: "Intimate slow dance moment, bride's chiffon gown flowing mid-twirl under warm golden Edison bulb bokeh, eucalyptus arrangements surrounding the wooden dance floor.", image: cover("pm-28-wedding-photo") },
    ],
  },
  /* ═══════════════════════════════════════════════════
   * 29. ISOMETRIC 3D SCENE DESIGN
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Isometric 3D Scene Design", vi: "Thiết Kế Cảnh 3D Isometric" },
    category: "design",
    tags: ["isometric", "3d", "diorama", "game-art", "low-poly", "scene-design"],
    priceSKT: 95,
    isFree: false,
    featured: false,
    sellerIdx: 2,
    description: {
      en: "Craft charming isometric 3D scenes — room dioramas, city blocks, and game levels with clean geometry and delightful details.",
      vi: "Tạo cảnh 3D isometric đáng yêu — diorama phòng, khối thành phố và level game với hình học sạch và chi tiết tinh tế.",
    },
    previewText: "Design beautiful isometric 3D scenes including room dioramas, miniature city blocks, and game-ready level designs with clean low-poly aesthetics.",
    coverImage: cover("pm-29-isometric-3d"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Isometric Room Diorama",
        content: "A detailed isometric 3D diorama of a {{room_type}}, viewed from a perfect 30-degree isometric angle. The room is a cross-section cutaway showing {{wall_treatment}} walls, {{floor_type}} flooring, and an open ceiling. Furniture includes: {{furniture_list}}. Small lifestyle details: {{micro_details}}. The style is {{art_style}} with {{color_palette}} color palette. Lighting is {{lighting_style}} with warm interior glow emanating from {{light_sources}}. The diorama sits on a {{base_style}} base that floats on a {{background}} background. All edges are {{edge_treatment}}. Rendered in {{render_engine}}, 8K, trending on ArtStation.",
        description: "Create a charming isometric room diorama with detailed interiors, furniture, and lifestyle storytelling.",
        variables: [
          { name: "room_type", description: "Type of room", defaultValue: "cozy lo-fi study room for a college student" },
          { name: "wall_treatment", description: "Wall style", defaultValue: "warm cream plaster with a single accent wall of exposed brick" },
          { name: "floor_type", description: "Floor material", defaultValue: "honey-toned hardwood planks" },
          { name: "furniture_list", description: "Key furniture", defaultValue: "an L-shaped desk with dual monitors, a bookshelf overflowing with books, a bean bag chair, and a small bed with rumpled sheets" },
          { name: "micro_details", description: "Small storytelling details", defaultValue: "a steaming coffee mug, sticky notes on the monitor, a cat sleeping on the bed, fairy lights along the shelf" },
          { name: "art_style", description: "Visual style", defaultValue: "clean low-poly with subtle hand-painted textures" },
          { name: "color_palette", description: "Color scheme", defaultValue: "warm autumn tones — amber, rust, sage green, cream" },
          { name: "lighting_style", description: "Lighting approach", defaultValue: "cozy evening ambiance" },
          { name: "light_sources", description: "Light source details", defaultValue: "a desk lamp, monitor glow, and fairy lights" },
          { name: "base_style", description: "Diorama base", defaultValue: "clean geometric slab with rounded corners" },
          { name: "background", description: "Background", defaultValue: "soft warm gradient" },
          { name: "edge_treatment", description: "Edge style", defaultValue: "slightly beveled with soft ambient occlusion" },
          { name: "render_engine", description: "Render style reference", defaultValue: "Blender Cycles with toon-adjacent shading" },
        ],
      },
      {
        title: "Isometric City Block",
        content: "An isometric 3D render of a vibrant {{city_theme}} city block viewed from above at a 30-degree isometric projection. The block contains: {{buildings}} arranged along {{street_layout}} streets. Street-level details: {{street_details}}. Vehicles: {{vehicles}}. Pedestrians: {{pedestrians}}. Vegetation: {{greenery}}. Time of day: {{time_of_day}} with {{sky_treatment}}. The overall style is {{style}} with {{polygon_density}} geometry. Color palette: {{city_palette}}. Each building has unique character with {{architectural_variety}}. The block is self-contained, floating on a {{city_base}}. 8K, illustration quality, trending on Behance.",
        description: "Design a lively isometric city block with buildings, streets, vehicles, and urban life details.",
        variables: [
          { name: "city_theme", description: "City aesthetic", defaultValue: "Tokyo-inspired neon-lit neighborhood" },
          { name: "buildings", description: "Building types", defaultValue: "a ramen shop, a three-story apartment, a convenience store, a small shrine, and a karaoke bar" },
          { name: "street_layout", description: "Street pattern", defaultValue: "an L-shaped intersection with crosswalks" },
          { name: "street_details", description: "Street-level elements", defaultValue: "vending machines, utility poles with tangled wires, manhole covers, and a bicycle rack" },
          { name: "vehicles", description: "Vehicles present", defaultValue: "a delivery kei truck, two parked bicycles, and a taxi" },
          { name: "pedestrians", description: "People in scene", defaultValue: "tiny stylized figures — a couple with an umbrella, a salary-man, a student" },
          { name: "greenery", description: "Plants and trees", defaultValue: "potted plants on balconies, a single cherry blossom tree at the corner" },
          { name: "time_of_day", description: "Time setting", defaultValue: "early evening, dusk" },
          { name: "sky_treatment", description: "Sky/atmosphere", defaultValue: "warm orange-to-purple gradient sky" },
          { name: "style", description: "Art style", defaultValue: "stylized low-poly with emissive neon signage" },
          { name: "polygon_density", description: "Geometry detail level", defaultValue: "medium-poly — enough detail for character, not photorealistic" },
          { name: "city_palette", description: "Color palette", defaultValue: "warm neons (pink, cyan, amber) against cool grey buildings" },
          { name: "architectural_variety", description: "Building details", defaultValue: "different heights, roof shapes, balconies, and signage styles" },
          { name: "city_base", description: "Base style", defaultValue: "thin ground slab with clean edges, no terrain" },
        ],
      },
      {
        title: "Isometric Game Level",
        content: "An isometric 3D game level design for a {{game_genre}} game set in a {{level_theme}} environment. The level layout includes: {{layout_elements}}. Interactive elements: {{interactables}}. Obstacles and hazards: {{hazards}}. Collectibles visible: {{collectibles}}. The path flows from {{start_point}} to {{end_point}} with {{path_complexity}}. Art style: {{game_art_style}} with {{texture_approach}}. The color coding follows game design principles — {{color_coding}}. UI elements are absent; this is a pure environment render. Lighting: {{game_lighting}}. The entire level floats on a {{level_base}} with {{edge_effect}} at the edges. 8K, game art portfolio quality, stylized 3D render.",
        description: "Design an isometric game level with clear paths, interactive elements, and game design color coding.",
        variables: [
          { name: "game_genre", description: "Game genre", defaultValue: "adventure puzzle-platformer" },
          { name: "level_theme", description: "Level environment", defaultValue: "ancient overgrown temple ruins in a jungle" },
          { name: "layout_elements", description: "Level structure", defaultValue: "crumbling stone platforms, vine-covered archways, a central courtyard with a fountain, and ascending staircases" },
          { name: "interactables", description: "Interactive game elements", defaultValue: "pressure plates, rotating bridges, and glowing rune pedestals" },
          { name: "hazards", description: "Obstacles", defaultValue: "spike traps, crumbling floor tiles, and poison dart walls" },
          { name: "collectibles", description: "Pickup items", defaultValue: "golden coins, a treasure chest, and three hidden gem fragments" },
          { name: "start_point", description: "Level entry", defaultValue: "a stone gateway at the bottom-left" },
          { name: "end_point", description: "Level exit/goal", defaultValue: "a glowing portal at the temple summit top-right" },
          { name: "path_complexity", description: "Path design", defaultValue: "branching paths with a main route and two secret shortcuts" },
          { name: "game_art_style", description: "Art style", defaultValue: "stylized hand-painted low-poly, Zelda-inspired" },
          { name: "texture_approach", description: "Texture style", defaultValue: "flat-shaded with subtle painted texture overlays" },
          { name: "color_coding", description: "Game design color system", defaultValue: "safe paths in warm green, hazards in red-orange, interactables glow cyan, collectibles glow gold" },
          { name: "game_lighting", description: "Lighting", defaultValue: "dappled sunlight filtering through jungle canopy with god rays" },
          { name: "level_base", description: "Level base", defaultValue: "natural rocky island chunk with waterfalls off the edges" },
          { name: "edge_effect", description: "Edge treatment", defaultValue: "cascading water and hanging vines falling into the void" },
        ],
      },
    ],
    examples: [
      {
        input: "Cozy isometric study room diorama with lo-fi vibes, cat, and fairy lights",
        output: "Detailed isometric 3D diorama of a cozy college study room — L-shaped desk with dual monitors, overflowing bookshelf, bean bag, rumpled bed with sleeping cat. Fairy lights, steaming coffee, sticky notes. Clean low-poly style, warm autumn palette, evening ambiance. Blender Cycles, 8K, ArtStation quality.",
        image: cover("pm-29-isometric-3d"),
      },
      {
        input: "Isometric Japanese neighborhood at dusk with neon signs and cherry blossoms",
        output: "Vibrant isometric city block of a Tokyo-inspired neighborhood at dusk. Ramen shop, apartments, convenience store, shrine, and karaoke bar along an L-shaped intersection. Neon signage, vending machines, cherry blossom tree. Stylized low-poly, pink-cyan-amber neons against cool grey. 8K illustration quality.",
        image: example("ex-29-isometric-room"),
      },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 30. EPIC DARK FANTASY ART
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Epic Dark Fantasy Art Generator", vi: "Bộ tạo nghệ thuật Dark Fantasy sử thi" },
    category: "other",
    tags: ["dark-fantasy", "dragon", "gothic", "epic", "digital-art"],
    priceSKT: 100,
    featured: true,
    sellerIdx: 7,
    description: {
      en: "Create epic dark fantasy digital paintings. Ancient dragons, gothic cathedrals, shadow knights, and apocalyptic landscapes with cinematic video animations.",
      vi: "Tạo tranh digital dark fantasy sử thi. Rồng cổ đại, nhà thờ Gothic, hiệp sĩ bóng tối, và phong cảnh tận thế với video cinematic."
    },
    previewText: "Epic dark fantasy digital painting of {{creature}} on {{structure}} during {{weather}}...",
    coverImage: cover("pm-30-dark-fantasy"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Dragon Siege",
        content: "Epic dark fantasy digital painting of {{creature}} perched on {{structure}} during {{weather}}, {{lighting}}, {{sky}}, {{environment}}, {{art_details}}, no text",
        description: "Epic dark fantasy dragon/creature scene",
        variables: [
          { name: "creature", description: "Creature", defaultValue: "an ancient dragon with obsidian scales and glowing crimson eyes" },
          { name: "structure", description: "Structure", defaultValue: "a crumbling gothic cathedral tower" },
          { name: "weather", description: "Weather", defaultValue: "a raging thunderstorm" },
          { name: "lighting", description: "Lighting", defaultValue: "lightning illuminating its scales with electric blue highlights" },
          { name: "sky", description: "Sky", defaultValue: "dark purple and crimson sky with roiling storm clouds" },
          { name: "environment", description: "Environment", defaultValue: "medieval city burning below with fire and smoke" },
          { name: "art_details", description: "Art details", defaultValue: "volumetric fog, hyper-detailed fantasy illustration, Greg Rutkowski style" },
        ],
      },
      {
        title: "Shadow Knight",
        content: "Dark fantasy digital painting of {{character}} standing before {{location}}, {{weapon}}, {{magic_effect}}, {{atmosphere}}, {{art_style}}, no text",
        description: "Dark fantasy character in ominous setting",
        variables: [
          { name: "character", description: "Character", defaultValue: "a lone armored knight in black plate with a horned helm" },
          { name: "location", description: "Location", defaultValue: "massive ornate gates of a shadow realm" },
          { name: "weapon", description: "Weapon", defaultValue: "holding a glowing runic greatsword that illuminates the mist" },
          { name: "magic_effect", description: "Magic effects", defaultValue: "dark mist swirling at the base, soul wisps drifting upward" },
          { name: "atmosphere", description: "Atmosphere", defaultValue: "ominous red sky with an eclipse overhead" },
          { name: "art_style", description: "Art style", defaultValue: "hyper-detailed dark fantasy, Dark Souls aesthetic" },
        ],
      },
    ],
    examples: [
      { input: "Ancient dragon on gothic cathedral in thunderstorm", output: "Epic dark fantasy painting with obsidian dragon, lightning-lit scales, burning medieval city, and volcanic sky.", image: cover("pm-30-dark-fantasy"), video: video("vid-30-dragon-flight") },
      { input: "Shadow knight before gates of shadow realm with runic sword", output: "Dark Souls-inspired armored knight with glowing runic blade, dark mist, and ominous red eclipse sky.", image: example("ex-30-dark-knight") },
    ],
  },


  /* ═══════════════════════════════════════════════════
   * 31. SAAS & TECH PRODUCT SCREENSHOT
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "SaaS & Tech Product Screenshot", vi: "Ảnh Chụp Sản Phẩm SaaS & Công Nghệ" },
    category: "business",
    tags: ["saas", "tech", "ui-mockup", "screenshot", "app", "product-design", "landing-page", "device-mockup"],
    priceSKT: 90,
    sellerIdx: 10,
    description: {
      en: "Create polished SaaS and tech product visuals — dashboard UIs in device mockups, app store screenshot designs, and landing page hero mockups. Ideal for startups, product teams, and marketers who need pixel-perfect product imagery.",
      vi: "Tạo hình ảnh sản phẩm SaaS và công nghệ chuyên nghiệp — giao diện dashboard trong mockup thiết bị, ảnh chụp app store, và mockup hero landing page. Lý tưởng cho startup, đội sản phẩm và marketer cần hình ảnh sản phẩm hoàn hảo từng pixel."
    },
    previewText: "Pixel-perfect SaaS product visuals — device mockups, app store screenshots, and landing page hero images.",
    coverImage: cover("pm-31-underwater"),
    models: ["dall-e-3", "midjourney", "flux", "stable-diffusion-xl"],
    prompts: [
      {
        title: "Dashboard UI Mockup in Device",
        content: "Create a photorealistic device mockup showing a {{product_type}} SaaS dashboard displayed on a {{device}} device. The dashboard UI features: {{dashboard_elements}} with a {{ui_style}} design system using {{color_scheme}} colors. The device is positioned at a {{device_angle}} angle on a {{surface}} surface. Background environment: {{environment}} with {{bg_treatment}} depth of field. The screen content is crisp and legible with realistic LCD glow and subtle screen reflections showing the environment. Lighting: {{lighting}} creating natural highlights on the device chassis — {{device_finish}} finish with realistic material response. Include {{contextual_props}} nearby to add context. The dashboard should show realistic data: {{data_content}}. Screen bezels and notch/camera details must be accurate to the device model. Style: professional product photography quality — think Apple marketing page or Dribbble shot of the year. Subtle {{shadow_style}} shadow grounds the device naturally.",
        description: "Generates a photorealistic device mockup with a detailed SaaS dashboard UI that looks like a real product screenshot.",
        variables: [
          { name: "product_type", description: "Type of SaaS product", defaultValue: "project management" },
          { name: "device", description: "Device model", defaultValue: "MacBook Pro 16-inch (2024, Space Black)" },
          { name: "dashboard_elements", description: "Key UI elements on screen", defaultValue: "left sidebar navigation, top metrics cards with sparklines, central kanban board with colored cards, right activity feed panel" },
          { name: "ui_style", description: "UI design style", defaultValue: "clean modern with rounded corners and subtle shadows" },
          { name: "color_scheme", description: "Dashboard color palette", defaultValue: "white background with indigo primary, soft gray secondary, green/amber/red status colors" },
          { name: "device_angle", description: "Device positioning", defaultValue: "three-quarter view from front-left, lid open at 110 degrees" },
          { name: "surface", description: "Surface the device sits on", defaultValue: "clean white marble desk" },
          { name: "environment", description: "Background setting", defaultValue: "bright modern office with floor-to-ceiling windows" },
          { name: "bg_treatment", description: "Background blur", defaultValue: "f/2.8 bokeh — background softly blurred" },
          { name: "lighting", description: "Lighting setup", defaultValue: "natural window light from left with soft fill from right" },
          { name: "device_finish", description: "Device material finish", defaultValue: "anodized aluminum Space Black" },
          { name: "contextual_props", description: "Props adding context", defaultValue: "a coffee cup, wireless mouse, and a small succulent plant" },
          { name: "data_content", description: "What data the dashboard shows", defaultValue: "12 active projects, 47 tasks in progress, team velocity chart trending upward, recent activity timestamps" },
          { name: "shadow_style", description: "Shadow treatment", defaultValue: "soft contact shadow with very subtle ambient occlusion" }
        ]
      },
      {
        title: "App Store Screenshot Design",
        content: "Design an app store screenshot for a {{app_type}} mobile app. Format: {{store_format}}. The screenshot shows a {{phone_model}} displaying the app's {{screen_name}} screen with {{ui_description}} UI. The phone is {{phone_position}} against a {{screenshot_bg}} background. Above or below the phone: a clear headline zone for text like '{{headline_text}}'. The app UI features {{app_ui_details}} with a {{app_color_scheme}} color scheme. Around the phone, add {{decorative_elements}} that reinforce the app's purpose. The overall composition follows {{layout_pattern}} layout. Color treatment: {{screenshot_palette}} — bright and eye-catching for store browsing. The phone screen must be sharp and fully legible. Ensure the design stands out in a grid of competing app screenshots. Style: {{screenshot_style}} — modern app marketing that converts browsers to downloaders.",
        description: "Creates eye-catching app store screenshots with device frames, headline zones, and feature-highlighting compositions.",
        variables: [
          { name: "app_type", description: "Type of app", defaultValue: "personal finance tracker" },
          { name: "store_format", description: "App store format", defaultValue: "6.5-inch iPhone (1284x2778px, iOS App Store)" },
          { name: "phone_model", description: "Phone model shown", defaultValue: "iPhone 15 Pro in Natural Titanium" },
          { name: "screen_name", description: "Which app screen is shown", defaultValue: "monthly spending overview" },
          { name: "ui_description", description: "What the app screen shows", defaultValue: "circular spending breakdown chart, categorized expense list with icons, monthly budget progress bar at top" },
          { name: "phone_position", description: "Phone placement and angle", defaultValue: "centered, slightly tilted 5 degrees to the right, floating with shadow" },
          { name: "screenshot_bg", description: "Background design", defaultValue: "smooth gradient from deep green to teal" },
          { name: "headline_text", description: "Marketing headline placeholder", defaultValue: "See Where Every Dollar Goes" },
          { name: "app_ui_details", description: "Detailed UI characteristics", defaultValue: "card-based layout, SF Pro typography, subtle glassmorphism cards, micro-interactions suggested by animated elements" },
          { name: "app_color_scheme", description: "App's color scheme", defaultValue: "white with emerald green primary, dark text, colorful category icons" },
          { name: "decorative_elements", description: "Elements around the phone", defaultValue: "floating 3D coins, subtle dollar sign particles, abstract financial graph lines" },
          { name: "layout_pattern", description: "Composition layout", defaultValue: "phone centered, headline top 20%, decorative elements flanking sides" },
          { name: "screenshot_palette", description: "Overall screenshot colors", defaultValue: "rich greens with gold accents on dark background" },
          { name: "screenshot_style", description: "Design style", defaultValue: "premium fintech marketing with 3D elements" }
        ]
      },
      {
        title: "Landing Page Hero Mockup",
        content: "Create a hero section mockup for a {{product_name}} {{product_category}} SaaS landing page. The scene shows a {{hero_layout}} layout: {{hero_left_content}} on the left, and on the right a {{mockup_type}} displaying the product's {{key_screen}} screen. The mockup device is {{mockup_style}}. Background: {{hero_background}} with {{bg_effects}} effects. The product screen shows: {{screen_content}} with a {{ui_theme}} theme. Floating UI elements pop out from the screen: {{floating_elements}} — giving a 3D layered effect that draws attention to key features. Color palette: {{hero_palette}}. Include subtle {{trust_elements}} trust indicators. The overall style is {{hero_style}} — the kind of hero section that makes visitors think 'this is a serious product.' Lighting and perspective create a sense of depth and premium quality. Format: 16:9 wide desktop view.",
        description: "Generates a stunning SaaS landing page hero mockup with product screen, floating UI elements, and conversion-ready layout.",
        variables: [
          { name: "product_name", description: "Product name", defaultValue: "FlowBoard" },
          { name: "product_category", description: "Product category", defaultValue: "team collaboration" },
          { name: "hero_layout", description: "Hero section layout", defaultValue: "split-screen 45/55" },
          { name: "hero_left_content", description: "Left side content area", defaultValue: "clean space for headline, subheadline, CTA buttons, and client logos — reserved as text overlay zone" },
          { name: "mockup_type", description: "Type of product mockup", defaultValue: "isometric MacBook and iPhone side by side showing responsive views" },
          { name: "key_screen", description: "Which product screen is featured", defaultValue: "real-time collaborative workspace with cursors, comments, and shared canvas" },
          { name: "mockup_style", description: "Mockup rendering style", defaultValue: "clay-render style devices with subtle shadows and rounded edges" },
          { name: "hero_background", description: "Background design", defaultValue: "soft gradient mesh from light indigo to white" },
          { name: "bg_effects", description: "Background decorative effects", defaultValue: "subtle grid pattern, floating gradient orbs in brand colors, soft noise texture" },
          { name: "screen_content", description: "Detailed screen content", defaultValue: "collaborative board with task cards, user avatars with colored cursors, real-time comment thread, file attachments" },
          { name: "ui_theme", description: "UI visual theme", defaultValue: "modern light mode with purple primary and soft shadow card design" },
          { name: "floating_elements", description: "3D elements popping from screen", defaultValue: "notification badge, user avatar stack, emoji reaction picker, and a task card mid-drag" },
          { name: "hero_palette", description: "Overall color palette", defaultValue: "clean white, soft indigo purple, and touches of coral accent" },
          { name: "trust_elements", description: "Trust/credibility indicators", defaultValue: "subtle integration logos (Slack, Notion, Figma) and a '4.9 stars' badge floating nearby" },
          { name: "hero_style", description: "Overall design style", defaultValue: "premium SaaS 2024 — think Linear, Notion, or Vercel marketing quality" }
        ]
      }
    ],
    examples: [
      {
        input: "product_type: analytics platform, device: iMac 27-inch (2024, silver), dashboard_elements: top nav with search bar, left metric cards column, center large area chart with gradient fill, right panel showing AI insights with bullet points, ui_style: data-dense but clean with ample whitespace, color_scheme: dark mode with deep navy background, bright cyan data lines, white text, subtle gray borders, device_angle: straight-on front view with slight downward perspective, surface: minimalist standing desk with cable management, environment: dimly lit executive office with city night skyline through windows, bg_treatment: cinematic shallow depth of field, lighting: screen glow as primary light source illuminating desk area with ambient city light from behind, device_finish: polished silver aluminum, contextual_props: leather notebook and pen, data_content: real-time visitor analytics showing 2.4M monthly visitors, conversion funnel, geographic heatmap, shadow_style: dramatic long shadow extending backward from screen glow",
        output: "A cinematic shot of an iMac 27-inch displaying a stunning dark-mode analytics dashboard. The deep navy interface glows with bright cyan data lines tracing a large gradient area chart at center. AI insight bullet points pulse in the right panel while metric cards stack neatly on the left. The screen is the primary light source, casting a dramatic glow across the minimalist standing desk and leather notebook. Through the floor-to-ceiling office windows behind, a blurred city skyline twinkles. The polished silver aluminum catches subtle reflections. Data shows 2.4M visitors with a conversion funnel — detailed enough to feel like a real product. A long dramatic shadow extends backward from the screen glow.",
        image: cover("pm-31-underwater")
      },
      {
        input: "product_name: HealthPulse, product_category: health tech, hero_layout: asymmetric 40/60, hero_left_content: clean space for bold headline and two CTA buttons with breathing room, mockup_type: floating iPhone 15 Pro slightly rotated with Apple Watch beside it showing companion app, key_screen: daily health dashboard with heart rate, sleep score, activity rings, and AI health insights, mockup_style: photorealistic devices with natural shadows and reflections, hero_background: clean white-to-light sage green gradient, bg_effects: abstract organic blob shapes in soft mint and coral, subtle pulse wave line animation hint, screen_content: health dashboard showing 72bpm heart rate with live graph, 8.2hr sleep with quality breakdown, 3 activity rings 75% filled, AI insight card saying 'Your recovery score is excellent', ui_theme: iOS health-inspired with SF rounded typography, green primary, warm coral accents, floating_elements: heart rate pulse icon with trailing line, 3D activity ring segment, notification showing '10K steps achieved', hero_palette: fresh white, sage green, coral pink, with dark text, trust_elements: Apple Health and Google Fit integration badges, HIPAA compliant shield icon, hero_style: premium health tech — think Apple Fitness+ meets Whoop marketing",
        output: "A stunning health tech landing page hero section. On the right, a photorealistic iPhone 15 Pro floats at a slight angle showing the HealthPulse dashboard — 72bpm heart rate with a live green graph, 8.2hr sleep score, three colorful activity rings at 75%. An Apple Watch beside it displays the companion app with matching green UI. 3D elements pop from the screen: a pulsing heart rate icon trails a line, an activity ring segment floats independently, and a '10K steps' notification hovers nearby. The left 40% remains clean for headline text against a white-to-sage gradient. Abstract organic blobs in mint and coral add depth. Apple Health and HIPAA badges float subtly as trust signals. Premium, fresh, and conversion-ready.",
        image: cover("pm-31-underwater"),
        video: video("vid-31-underwater-reef")
      }
    ]
  },

  /* ═══════════════════════════════════════════════════
   * 32. INFLUENCER & UGC CONTENT
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Influencer & UGC Content", vi: "Nội Dung Influencer & UGC" },
    category: "marketing",
    tags: ["influencer", "ugc", "lifestyle", "content-creation", "authentic", "social-proof", "behind-the-scenes", "testimonial"],
    priceSKT: 80,
    sellerIdx: 3,
    description: {
      en: "Generate authentic-looking influencer and user-generated content visuals — lifestyle product placements, behind-the-scenes footage, and customer testimonial graphics. Perfect for brands wanting the UGC aesthetic without the unpredictability.",
      vi: "Tạo hình ảnh nội dung influencer và UGC trông chân thực — product placement phong cách sống, hậu trường sản xuất, và đồ họa testimonial khách hàng. Hoàn hảo cho thương hiệu muốn phong cách UGC mà không cần lo về chất lượng."
    },
    previewText: "Authentic-looking influencer and UGC visuals — lifestyle placements, BTS content, and testimonial graphics.",
    coverImage: cover("pm-32-street-photo"),
    models: ["midjourney", "dall-e-3", "flux", "stable-diffusion-xl"],
    prompts: [
      {
        title: "Lifestyle Product Placement",
        content: "Create an authentic-looking lifestyle product placement photo featuring {{product}} naturally integrated into a {{setting}} scene. A {{person_description}} person is {{action}} while the product is visible but not overly staged — positioned at {{product_position}}. The photo has a {{photo_style}} quality as if taken on a high-end smartphone with {{filter_style}} filter. Natural imperfections: slightly off-center composition, one element slightly out of focus, natural ambient lighting from {{light_source}}. The scene tells a story of {{lifestyle_narrative}}. Color tones: {{color_tones}}. The product should feel discovered rather than advertised — the kind of image that gets saved and shared organically on Instagram. Aspect ratio: 4:5 vertical for Instagram feed optimization.",
        description: "Generates an authentic-feeling lifestyle photo where the product feels naturally part of the scene, not staged.",
        variables: [
          { name: "product", description: "Product being featured", defaultValue: "minimalist leather tote bag in cognac brown" },
          { name: "setting", description: "Location/environment", defaultValue: "sunlit European café terrace" },
          { name: "person_description", description: "Person in the scene (age, style)", defaultValue: "stylish woman in her late 20s wearing linen clothing" },
          { name: "action", description: "What the person is doing", defaultValue: "reading a book with an espresso, looking relaxed and content" },
          { name: "product_position", description: "Where the product sits in frame", defaultValue: "on the bistro chair beside her, strap casually draped" },
          { name: "photo_style", description: "Photography quality feel", defaultValue: "iPhone 15 Pro portrait mode" },
          { name: "filter_style", description: "Color filter or editing style", defaultValue: "warm VSCO-style with slightly lifted blacks" },
          { name: "light_source", description: "Natural light direction", defaultValue: "golden hour side lighting through café awning" },
          { name: "lifestyle_narrative", description: "Story the image tells", defaultValue: "effortless European summer afternoon" },
          { name: "color_tones", description: "Overall color treatment", defaultValue: "warm honey and soft terracotta with creamy highlights" }
        ]
      },
      {
        title: "Behind-the-Scenes Content",
        content: "Generate a candid behind-the-scenes content photo for a {{brand_type}} brand showing {{bts_scene}}. The image has raw, unpolished energy — {{camera_style}} perspective as if captured by a team member on their phone. The setting reveals the {{process_element}} process with visible tools: {{visible_tools}}. People in the scene are {{people_activity}}, naturally engaged and unaware of the camera. Lighting: {{bts_lighting}} — not perfect, which adds to authenticity. Include visual details that add credibility: {{authenticity_details}}. The mood is {{bts_mood}}. Slight motion blur on moving hands or elements adds dynamism. Format: {{format}} for Stories or feed. This should look like content a brand's social media manager captured spontaneously — not a planned photoshoot.",
        description: "Creates candid-feeling behind-the-scenes content that builds brand trust and humanizes the company.",
        variables: [
          { name: "brand_type", description: "Type of brand", defaultValue: "artisan chocolate maker" },
          { name: "bts_scene", description: "What's happening behind the scenes", defaultValue: "the chocolate tempering and molding process in a small workshop" },
          { name: "camera_style", description: "Camera angle and style", defaultValue: "slightly tilted, eye-level casual snap" },
          { name: "process_element", description: "What process is being revealed", defaultValue: "handcrafted production" },
          { name: "visible_tools", description: "Tools and equipment visible", defaultValue: "marble tempering surface, metal molds, piping bags, cocoa powder dusting" },
          { name: "people_activity", description: "What people are doing", defaultValue: "artisan in apron carefully pouring tempered chocolate, focused expression" },
          { name: "bts_lighting", description: "Lighting conditions", defaultValue: "warm workshop pendant lights mixed with daylight from a side window" },
          { name: "authenticity_details", description: "Small details that add realism", defaultValue: "chocolate smudges on apron, ingredient bags in background, handwritten recipe card pinned to wall" },
          { name: "bts_mood", description: "Overall mood", defaultValue: "passionate craftsmanship and genuine dedication" },
          { name: "format", description: "Image format", defaultValue: "9:16 vertical for Stories" }
        ]
      },
      {
        title: "User Review Testimonial Visual",
        content: "Create a user testimonial visual for a {{product_category}} product. The image shows {{customer_description}} in their {{environment}} with the product — {{product_in_use}} — clearly being used in daily life. The composition mimics a real customer photo: {{selfie_style}} angle, natural {{home_lighting}} lighting, genuine {{expression}} expression. The background reveals an authentic lived-in space with {{bg_details}}. The product is being actively used (not just held for display). A subtle area on the {{text_zone}} side is slightly less busy for overlaying a star rating or quote text. Color treatment: {{color_treatment}} — the warm, slightly imperfect look of a real customer photo shared in a review. Include {{social_proof_element}} to enhance credibility. Aspect ratio: 1:1 for review platforms or 4:5 for Instagram testimonial posts.",
        description: "Generates realistic customer review photos that feel genuinely user-submitted for testimonial campaigns.",
        variables: [
          { name: "product_category", description: "Product category", defaultValue: "ergonomic home office chair" },
          { name: "customer_description", description: "Customer appearance", defaultValue: "30-something professional in casual work-from-home attire" },
          { name: "environment", description: "Customer's environment", defaultValue: "home office nook" },
          { name: "product_in_use", description: "How the product is being used", defaultValue: "sitting comfortably in the chair at their desk, good posture, looking satisfied" },
          { name: "selfie_style", description: "Camera angle mimicking customer photo", defaultValue: "arm's-length selfie from slightly above" },
          { name: "home_lighting", description: "Realistic home lighting", defaultValue: "desk lamp plus overhead room light, slightly warm" },
          { name: "expression", description: "Facial expression", defaultValue: "happy and relaxed, slight smile" },
          { name: "bg_details", description: "Background details for authenticity", defaultValue: "bookshelf, coffee mug, monitor with work visible, small plant" },
          { name: "text_zone", description: "Side for text overlay", defaultValue: "bottom" },
          { name: "color_treatment", description: "Color processing style", defaultValue: "slightly warm auto-enhanced smartphone processing" },
          { name: "social_proof_element", description: "Element adding credibility", defaultValue: "delivery box with brand logo partially visible in background" }
        ]
      }
    ],
    examples: [
      {
        input: "product: pastel pink insulated water bottle with bamboo lid, setting: morning yoga session in a bright studio, person_description: fit woman in her early 30s wearing matching workout set, action: pausing between poses on her yoga mat, reaching for the bottle, product_position: on the hardwood floor next to the mat with a towel, photo_style: natural candid shot, filter_style: bright airy with soft pink tones, light_source: large studio windows with morning sun streaming in, lifestyle_narrative: mindful morning wellness routine, color_tones: soft blush, warm white, and natural wood",
        output: "An authentic 4:5 lifestyle image capturing a moment during a morning yoga session. A fit woman in a matching sage workout set pauses on her mat, reaching casually for a pastel pink water bottle with bamboo lid sitting on the light hardwood floor. Morning sunlight streams through large studio windows, creating beautiful soft shadows. The composition is slightly off-center — genuinely candid. A towel is tossed nearby, mat slightly wrinkled from use. The warm blush and white tones with VSCO-style lifted blacks create that effortless wellness aesthetic that performs beautifully on Instagram.",
        image: cover("pm-32-street-photo")
      },
      {
        input: "brand_type: small-batch coffee roaster, bts_scene: coffee bean roasting and quality cupping session, camera_style: over-the-shoulder peek into the process, process_element: artisan roasting, visible_tools: drum roaster with beans visible, cupping bowls lined up, grinder, roast color chart, people_activity: roaster checking bean color against a reference chart with tongs, bts_lighting: industrial pendant light with warm bulb plus natural light from loading dock, authenticity_details: burlap coffee sacks with origin labels, roast log notebook open on counter, timer running, bg_details: raw brick walls and exposed ductwork, bts_mood: focused expertise and coffee passion, format: 1:1 square for feed",
        output: "A candid 1:1 behind-the-scenes shot taken over the shoulder of a coffee roaster checking bean color with tongs against a roast reference chart. The drum roaster glows with warmth, beans visible through the sight glass. Cupping bowls are lined up on a wooden counter nearby. Industrial pendant lights cast warm pools of light while daylight sneaks in from the loading dock. Authentic details bring it to life: burlap sacks stamped with Colombian and Ethiopian origins, an open roast log with handwritten notes, a running timer. The raw brick walls and exposed ductwork complete the artisan workshop vibe. It feels like a spontaneous phone snap from a passionate team member.",
        image: cover("pm-32-street-photo"),
        video: video("vid-32-tokyo-night")
      }
    ]
  },

  /* ═══════════════════════════════════════════════════
   * 33. MACRO & CLOSE-UP PHOTOGRAPHY
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Macro & Close-up Photography", vi: "Nhiếp Ảnh Macro & Cận Cảnh" },
    category: "design",
    tags: ["macro", "close-up", "photography", "nature", "detail", "texture"],
    priceSKT: 85,
    isFree: false,
    featured: false,
    sellerIdx: 11,
    description: {
      en: "Stunning AI macro photography prompts — extreme close-ups of insects, dewdrops on flowers, and abstract textures revealing invisible worlds of detail.",
      vi: "Prompt AI nhiếp ảnh macro tuyệt đẹp — cận cảnh cực đại côn trùng, giọt sương trên hoa và texture trừu tượng khám phá thế giới chi tiết vô hình.",
    },
    previewText: "Generate breathtaking macro photography — insect portraits with compound eye detail, dewdrop-laden flowers, and abstract texture close-ups that reveal hidden beauty.",
    coverImage: cover("pm-33-macro"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Insect Macro Portrait",
        content: "An extreme macro photograph of a {{insect_type}} captured at {{magnification}} magnification. The focus is razor-sharp on {{focus_point}}, revealing microscopic details: {{micro_details}}. The insect is perched on {{perch}} in a {{environment}} setting. Background: {{bokeh_style}} bokeh in {{bokeh_colors}}. Lighting: {{macro_light}} providing even illumination without harsh shadows on the exoskeleton. Visible details include individual ommatidia in compound eyes, fine leg hairs, and wing venation patterns. Shot with a {{lens}} on a {{camera}}. Focus stacking: {{stack_count}} images merged for extended depth of field. Dew or moisture: {{moisture}}. 8K, National Geographic quality, photorealistic macro photography.",
        description: "Create an extreme macro insect portrait with microscopic detail, beautiful bokeh, and scientific precision.",
        variables: [
          { name: "insect_type", description: "Insect species", defaultValue: "jewel-toned cuckoo wasp (Chrysididae)" },
          { name: "magnification", description: "Magnification ratio", defaultValue: "5:1" },
          { name: "focus_point", description: "Primary focus area", defaultValue: "the compound eyes and metallic head" },
          { name: "micro_details", description: "Microscopic details visible", defaultValue: "iridescent blue-green exoskeleton with micro-pitted texture, translucent amber antennae segments" },
          { name: "perch", description: "What the insect sits on", defaultValue: "the tip of a wild grass blade" },
          { name: "environment", description: "Environmental setting", defaultValue: "early morning meadow" },
          { name: "bokeh_style", description: "Bokeh character", defaultValue: "creamy smooth circular" },
          { name: "bokeh_colors", description: "Background colors", defaultValue: "soft greens and golden highlights" },
          { name: "macro_light", description: "Lighting setup", defaultValue: "twin LED macro lights at 45 degrees with a small diffuser" },
          { name: "lens", description: "Lens used", defaultValue: "Laowa 25mm f/2.8 2.5-5x Ultra Macro" },
          { name: "camera", description: "Camera body", defaultValue: "Sony A7R V" },
          { name: "stack_count", description: "Focus stack images", defaultValue: "80" },
          { name: "moisture", description: "Moisture presence", defaultValue: "tiny morning dew droplets clinging to antennae and leg hairs" },
        ],
      },
      {
        title: "Dewdrop Flower Macro",
        content: "A magical macro photograph of {{flower_type}} petals covered in perfectly spherical dewdrops at {{magnification}} magnification. Each dewdrop acts as a tiny lens, refracting and inverting the {{refraction_content}} visible inside the droplets. The petal surface shows {{petal_texture}}. Color transitions across the petal: {{color_gradient}}. Lighting: {{dew_lighting}} creating {{light_effect}} in each water droplet. One hero dewdrop is larger than the rest, positioned at {{hero_position}}, containing a particularly clear refracted image. Background petals create a {{bg_petal_effect}}. The overall mood is {{mood}}. Shot at f/5.6 for optimal sharpness, focus-stacked. 8K, fine art nature photography, photorealistic.",
        description: "Generate a magical macro shot of dewdrops on flower petals, each acting as a tiny refracting lens.",
        variables: [
          { name: "flower_type", description: "Flower species", defaultValue: "deep red rose" },
          { name: "magnification", description: "Magnification level", defaultValue: "3:1" },
          { name: "refraction_content", description: "What's visible in dewdrops", defaultValue: "the surrounding garden scene inverted — green foliage and blue sky" },
          { name: "petal_texture", description: "Petal surface detail", defaultValue: "velvety micro-papillae creating a soft matte texture with occasional veins" },
          { name: "color_gradient", description: "Petal color transitions", defaultValue: "deep crimson at the base transitioning to a lighter ruby at the edges" },
          { name: "dew_lighting", description: "Lighting style", defaultValue: "golden hour backlight from behind the flower" },
          { name: "light_effect", description: "Light behavior in drops", defaultValue: "brilliant specular highlights and rainbow caustics" },
          { name: "hero_position", description: "Position of hero dewdrop", defaultValue: "the curve where the petal begins to curl, one-third from center" },
          { name: "bg_petal_effect", description: "Background petal treatment", defaultValue: "soft wash of red and green bokeh shapes" },
          { name: "mood", description: "Overall mood", defaultValue: "serene, intimate, and wonderous" },
        ],
      },
      {
        title: "Texture Abstract Macro",
        content: "An abstract macro photograph of {{texture_subject}} at {{magnification}} magnification, transforming the familiar into the alien. The image reveals {{hidden_patterns}} that are invisible to the naked eye. Colors present: {{color_range}}. Surface topology: {{surface_description}}. The composition follows {{composition_rule}} with the most intricate detail cluster at {{focal_point}}. Lighting: {{abstract_lighting}} to maximize surface relief and depth. The resulting image is ambiguous at first glance — it could be a {{misread_as}} until the viewer understands the true scale. Depth of field: {{dof_style}}. Post-processing: {{post_processing}}. The photograph bridges science and art, revealing hidden beauty in the mundane. 8K, abstract fine art photography, photorealistic.",
        description: "Transform everyday textures into abstract art through extreme macro photography.",
        variables: [
          { name: "texture_subject", description: "Subject to photograph", defaultValue: "the surface of a weathered copper coin" },
          { name: "magnification", description: "Magnification ratio", defaultValue: "10:1" },
          { name: "hidden_patterns", description: "Patterns revealed at macro scale", defaultValue: "crystalline oxidation patterns in verdigris green, micro-erosion valleys, and tool marks from the original minting" },
          { name: "color_range", description: "Color palette", defaultValue: "deep patina green, warm copper, oxide brown, and metallic highlights" },
          { name: "surface_description", description: "Surface characteristics", defaultValue: "mountainous terrain-like ridges with smooth valleys and sharp crystalline formations" },
          { name: "composition_rule", description: "Composition approach", defaultValue: "diagonal flow from lower-left to upper-right" },
          { name: "focal_point", description: "Primary focus area", defaultValue: "a cluster of bright verdigris crystals at the golden ratio intersection point" },
          { name: "abstract_lighting", description: "Lighting technique", defaultValue: "extreme side-lighting at nearly 90 degrees to exaggerate surface relief" },
          { name: "misread_as", description: "What it resembles at first glance", defaultValue: "satellite imagery of an alien planet's terrain" },
          { name: "dof_style", description: "Depth of field approach", defaultValue: "razor-thin plane of focus creating a tilt-shift miniature effect" },
          { name: "post_processing", description: "Post-processing style", defaultValue: "enhanced local contrast, slight color grading to emphasize the patina palette" },
        ],
      },
    ],
    examples: [
      {
        input: "Extreme macro of a cuckoo wasp showing compound eyes and iridescent exoskeleton",
        output: "Extreme macro photograph of a jewel-toned cuckoo wasp at 5:1 magnification. Razor-sharp focus on iridescent blue-green compound eyes and metallic head. Micro-pitted exoskeleton, translucent antennae, morning dew on leg hairs. Twin LED macro lights, 80-image focus stack, creamy green bokeh. Sony A7R V, 8K National Geographic quality.",
        image: cover("pm-33-macro"),
      },
      {
        input: "Rose petals with dewdrops refracting the garden, golden hour backlight",
        output: "Magical macro photograph of deep red rose petals covered in spherical dewdrops at 3:1 magnification. Each droplet refracts an inverted garden scene. Velvety petal texture, crimson-to-ruby gradient. Golden hour backlight creating specular highlights and rainbow caustics in droplets. Focus-stacked, 8K fine art nature photography.",
        image: example("ex-33-dewdrop"),
      },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 34. FLAT DESIGN & INFOGRAPHIC
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Flat Design & Infographic", vi: "Thiết Kế Phẳng & Infographic" },
    category: "design",
    tags: ["flat-design", "infographic", "illustration", "icon", "vector", "ui-design"],
    priceSKT: 75,
    isFree: false,
    featured: false,
    sellerIdx: 6,
    description: {
      en: "Clean, modern AI prompts for flat design illustrations — app screen mockups, process infographics, and cohesive icon sets with bold vector aesthetics.",
      vi: "Prompt AI cho thiết kế phẳng hiện đại — mockup màn hình app, infographic quy trình và bộ icon đồng nhất với phong cách vector đậm nét.",
    },
    previewText: "Create polished flat design assets — app UI illustrations, step-by-step infographics, and unified icon sets with clean geometry and bold color palettes.",
    coverImage: cover("pm-34-flat-design"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "App Screen Flat Illustration",
        content: "A clean flat design illustration of a {{app_type}} mobile app screen. The screen shows {{screen_content}} with a {{navigation_style}} navigation pattern. UI elements use a {{design_system}} design system with {{corner_style}} corners. Primary color: {{primary_color}}, secondary: {{secondary_color}}, background: {{bg_color}}. Illustrations of {{illustration_elements}} in a {{illustration_style}} style decorate empty states and headers. Typography is {{typography_style}}. Data visualizations (if present): {{data_viz}}. The device frame is a {{device}} shown at a {{angle}} angle. Shadow: {{shadow_style}}. Overall aesthetic: {{aesthetic}} — influenced by {{design_reference}}. Vector-perfect edges, no gradients unless specified. High resolution flat design, Dribbble featured quality.",
        description: "Design a polished flat illustration of a mobile app screen with clean UI elements and cohesive style.",
        variables: [
          { name: "app_type", description: "App category", defaultValue: "personal finance tracker" },
          { name: "screen_content", description: "Screen content", defaultValue: "a monthly spending overview with category breakdown and a savings goal progress bar" },
          { name: "navigation_style", description: "Nav pattern", defaultValue: "bottom tab bar with 4 icons" },
          { name: "design_system", description: "Design system style", defaultValue: "Material Design 3 inspired" },
          { name: "corner_style", description: "Corner radius", defaultValue: "16px rounded" },
          { name: "primary_color", description: "Primary brand color", defaultValue: "vibrant teal (#0EA5E9)" },
          { name: "secondary_color", description: "Secondary color", defaultValue: "warm coral (#F97316)" },
          { name: "bg_color", description: "Background color", defaultValue: "off-white (#FAFAFA)" },
          { name: "illustration_elements", description: "Decorative illustrations", defaultValue: "a friendly piggy bank character, floating coins, and a growing plant representing savings" },
          { name: "illustration_style", description: "Illustration approach", defaultValue: "geometric flat with subtle character" },
          { name: "typography_style", description: "Typography", defaultValue: "clean sans-serif, bold headings, regular body" },
          { name: "data_viz", description: "Data visualization style", defaultValue: "donut chart with category colors, simple bar graph" },
          { name: "device", description: "Device frame", defaultValue: "iPhone 15 Pro in natural titanium" },
          { name: "angle", description: "View angle", defaultValue: "straight-on front view with slight 5-degree tilt" },
          { name: "shadow_style", description: "Shadow treatment", defaultValue: "soft long drop shadow on a clean surface" },
          { name: "aesthetic", description: "Overall aesthetic", defaultValue: "friendly yet professional, approachable fintech" },
          { name: "design_reference", description: "Design inspiration", defaultValue: "Revolut and Mint app aesthetics" },
        ],
      },
      {
        title: "Process Infographic",
        content: "A clear, informative flat design infographic illustrating {{process_topic}} in {{step_count}} steps. Layout: {{layout_type}} flowing {{flow_direction}}. Each step features: a {{icon_style}} icon, a bold step number, a short title, and a one-line description. Connecting elements: {{connectors}} linking each step. Visual hierarchy: {{hierarchy_approach}}. Color scheme: {{infographic_palette}} with each step getting a {{color_assignment}}. Background: {{infographic_bg}}. Header area: {{header_design}}. Data callouts: {{callout_style}} highlighting {{key_stats}}. Footer: {{footer_content}}. The infographic dimensions are {{dimensions}}. Style: clean flat vector with no gradients, {{texture_option}}. Professional infographic design, presentation-ready, 4K resolution.",
        description: "Create a step-by-step process infographic with clear visual hierarchy, icons, and data callouts.",
        variables: [
          { name: "process_topic", description: "Process to illustrate", defaultValue: "How a SaaS product goes from idea to launch" },
          { name: "step_count", description: "Number of steps", defaultValue: "6" },
          { name: "layout_type", description: "Layout structure", defaultValue: "alternating left-right zigzag" },
          { name: "flow_direction", description: "Reading direction", defaultValue: "top to bottom" },
          { name: "icon_style", description: "Icon style", defaultValue: "outlined duo-tone icon in a circle badge" },
          { name: "connectors", description: "Step connectors", defaultValue: "dotted curved lines with small directional arrows" },
          { name: "hierarchy_approach", description: "Visual hierarchy", defaultValue: "large step numbers, medium titles, small descriptions" },
          { name: "infographic_palette", description: "Color palette", defaultValue: "deep navy base with bright accent colors" },
          { name: "color_assignment", description: "Color per step", defaultValue: "unique accent color from a harmonious 6-color palette" },
          { name: "infographic_bg", description: "Background", defaultValue: "clean white with subtle dot grid pattern" },
          { name: "header_design", description: "Header area", defaultValue: "bold title with a decorative underline and subtitle" },
          { name: "callout_style", description: "Data callout design", defaultValue: "rounded pill badges with bold numbers" },
          { name: "key_stats", description: "Statistics to highlight", defaultValue: "timeline durations and success rate percentages" },
          { name: "footer_content", description: "Footer info", defaultValue: "brand logo and source attribution" },
          { name: "dimensions", description: "Infographic size", defaultValue: "vertical 1080×1920px (social story format)" },
          { name: "texture_option", description: "Texture treatment", defaultValue: "no texture — pure flat color fills" },
        ],
      },
      {
        title: "Icon Set Design",
        content: "A cohesive set of {{icon_count}} flat design icons for a {{icon_theme}} theme. Each icon sits on a {{icon_bg}} background within a {{grid_size}} pixel grid. Style: {{icon_art_style}} with {{stroke_weight}} stroke weight. Color approach: {{color_approach}} using {{palette_colors}}. Icons represent: {{icon_subjects}}. Design consistency rules: {{consistency_rules}}. Corner radius on shapes: {{icon_corners}}. Negative space usage: {{negative_space}}. The icons are arranged in a {{arrangement}} grid layout for presentation. Each icon is perfectly balanced, pixel-aligned, and optically centered. Background of the presentation: {{presentation_bg}}. Suitable for {{use_case}}. Vector-perfect, scalable from 16px to 512px. 4K presentation render, Dribbble/Behance portfolio quality.",
        description: "Design a unified flat icon set with consistent style, stroke weight, and color system.",
        variables: [
          { name: "icon_count", description: "Number of icons", defaultValue: "16" },
          { name: "icon_theme", description: "Icon theme", defaultValue: "e-commerce and shopping" },
          { name: "icon_bg", description: "Individual icon background", defaultValue: "soft pastel circle with 20% opacity fill" },
          { name: "grid_size", description: "Design grid", defaultValue: "64×64" },
          { name: "icon_art_style", description: "Icon art style", defaultValue: "filled flat with a secondary accent color layer" },
          { name: "stroke_weight", description: "Stroke weight", defaultValue: "2px consistent stroke" },
          { name: "color_approach", description: "Coloring method", defaultValue: "dual-tone — primary fill + darker shade for depth details" },
          { name: "palette_colors", description: "Color palette", defaultValue: "coral primary, navy accent, white negative space" },
          { name: "icon_subjects", description: "What icons depict", defaultValue: "shopping cart, price tag, credit card, gift box, delivery truck, storefront, barcode, wishlist heart, receipt, return arrow, coupon, wallet, package, review star, filter funnel, search" },
          { name: "consistency_rules", description: "Design rules", defaultValue: "same visual weight, uniform padding within grid, matching corner radii, consistent line caps" },
          { name: "icon_corners", description: "Corner radius", defaultValue: "4px rounded on all geometric shapes" },
          { name: "negative_space", description: "Negative space style", defaultValue: "generous — icons use 70% of the grid area" },
          { name: "arrangement", description: "Presentation layout", defaultValue: "4×4 evenly spaced grid" },
          { name: "presentation_bg", description: "Presentation background", defaultValue: "clean white with subtle shadow under each icon circle" },
          { name: "use_case", description: "Intended use", defaultValue: "mobile app UI and web dashboard" },
        ],
      },
    ],
    examples: [
      {
        input: "Finance app flat illustration with teal/coral palette, piggy bank character, donut chart",
        output: "Clean flat design illustration of a personal finance tracker app on iPhone 15 Pro. Monthly spending overview with donut chart, savings goal bar, and bottom tab navigation. Teal primary, coral secondary, geometric piggy bank illustration. Material Design 3 inspired, 16px rounded corners. Dribbble featured quality.",
        image: cover("pm-34-flat-design"),
      },
      {
        input: "6-step SaaS launch process infographic with zigzag layout and duo-tone icons",
        output: "Clear flat design infographic: How a SaaS product goes from idea to launch in 6 steps. Alternating zigzag layout, duo-tone circle icons, dotted connectors with arrows. Deep navy base with 6-color accents. Rounded pill data callouts, clean white background with dot grid. 1080×1920px, presentation-ready vector.",
        image: cover("pm-34-flat-design"),
      },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 35. CINEMATIC PORTRAIT LIGHTING
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Cinematic Portrait Lighting", vi: "Ánh Sáng Chân Dung Điện Ảnh" },
    category: "design",
    tags: ["portrait", "cinematic", "lighting", "studio", "dramatic", "photography"],
    priceSKT: 95,
    isFree: false,
    featured: true,
    sellerIdx: 11,
    description: {
      en: "Master cinematic portrait lighting with AI — Rembrandt drama, neon-noir atmospherics, and natural window light for editorial and fine art photography.",
      vi: "Làm chủ ánh sáng chân dung điện ảnh với AI — kịch tính Rembrandt, neon-noir và ánh sáng cửa sổ tự nhiên cho nhiếp ảnh editorial và nghệ thuật.",
    },
    previewText: "Create stunning cinematic portraits with masterful lighting — from classic Rembrandt drama to neon-noir glow and soft natural window light, all at editorial quality.",
    coverImage: cover("pm-35-cinematic-portrait"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Rembrandt Portrait",
        content: "A dramatic Rembrandt-lit portrait of a {{subject}} — {{subject_description}}. The classic Rembrandt lighting creates a perfect triangle of light on the shadow-side cheek, with the key light positioned at {{key_light_position}}. Fill ratio: {{fill_ratio}} for deep, moody shadows. The subject's expression is {{expression}}, eyes {{eye_direction}}. Wardrobe: {{wardrobe}}. Background: {{background}} — dark and painterly, reminiscent of Dutch Golden Age masters. Skin rendering: {{skin_quality}} with visible pores, subtle imperfections, and natural color variation. Hair light: {{hair_light}} providing subtle separation. Color grade: {{color_grade}}. Shot on a {{camera_lens}} at f/2.0, shallow depth of field. The portrait conveys {{emotional_quality}}. 8K, fine art portrait photography, museum-quality print resolution.",
        description: "Create a classic Rembrandt-lit portrait with dramatic chiaroscuro and Dutch master painting aesthetics.",
        variables: [
          { name: "subject", description: "Portrait subject", defaultValue: "a weathered craftsman in his 60s" },
          { name: "subject_description", description: "Subject details", defaultValue: "deep laugh lines, silver-streaked beard, strong hands, wise penetrating gaze" },
          { name: "key_light_position", description: "Key light placement", defaultValue: "45 degrees camera-left, elevated 30 degrees" },
          { name: "fill_ratio", description: "Light fill ratio", defaultValue: "4:1 — allowing rich shadows without losing detail" },
          { name: "expression", description: "Facial expression", defaultValue: "contemplative, with the hint of a knowing smile" },
          { name: "eye_direction", description: "Eye gaze", defaultValue: "looking directly into the lens with quiet intensity" },
          { name: "wardrobe", description: "Clothing", defaultValue: "a worn leather apron over a simple linen shirt, sleeves rolled up" },
          { name: "background", description: "Background", defaultValue: "deep umber and raw sienna tones, textured like an oil painting canvas" },
          { name: "skin_quality", description: "Skin rendering", defaultValue: "photorealistic with natural subsurface scattering" },
          { name: "hair_light", description: "Hair/rim light", defaultValue: "warm tungsten-colored accent from behind-right" },
          { name: "color_grade", description: "Color grading", defaultValue: "rich warm shadows, neutral midtones, slightly cool highlights — Vermeer palette" },
          { name: "camera_lens", description: "Camera and lens", defaultValue: "Hasselblad X2D with 80mm f/1.9" },
          { name: "emotional_quality", description: "Emotional tone", defaultValue: "quiet dignity, a lifetime of mastery etched into every line" },
        ],
      },
      {
        title: "Neon-Lit Portrait",
        content: "A striking neon-noir portrait of a {{subject}} — {{subject_description}}. The face is lit by {{neon_sources}} casting {{neon_colors}} across the skin in sharp, graphic color blocks. The lighting creates {{shadow_pattern}} on the face. Environment: {{environment}} with neon signs and urban textures visible in the background. Rain or moisture: {{rain_effect}} adding specular reflections. The subject wears {{wardrobe}} reflecting the neon light. Expression: {{expression}}. Camera angle: {{camera_angle}}. Lens flares and light artifacts: {{flare_style}}. Skin rendering: photorealistic with neon color contamination on highlights. Color grade: {{color_grade}} — pushed, stylized, cinematic. Depth of field: {{dof}}. The image channels {{film_reference}} aesthetic. 8K, cinematic portrait, editorial fashion photography quality.",
        description: "Generate a neon-noir portrait with bold colored lighting, urban atmosphere, and cinematic film references.",
        variables: [
          { name: "subject", description: "Portrait subject", defaultValue: "a young woman in her mid-20s" },
          { name: "subject_description", description: "Subject details", defaultValue: "sharp cheekbones, dark eyes with reflective pupils, slicked-back wet hair" },
          { name: "neon_sources", description: "Light sources", defaultValue: "a neon sign frame-left casting magenta and a shop window frame-right casting cyan" },
          { name: "neon_colors", description: "Neon colors on skin", defaultValue: "hot magenta on the left cheek and jaw, electric cyan on the right forehead and nose bridge" },
          { name: "shadow_pattern", description: "Shadow design", defaultValue: "a hard split-light effect with a razor-sharp shadow line down the center of the face" },
          { name: "environment", description: "Background environment", defaultValue: "a rain-slicked Tokyo alley with kanji neon signs and steam vents" },
          { name: "rain_effect", description: "Rain/moisture effects", defaultValue: "fine rain mist catching backlight, water droplets on skin and hair" },
          { name: "wardrobe", description: "Clothing", defaultValue: "a black PVC trench coat with the collar turned up" },
          { name: "expression", description: "Expression", defaultValue: "defiant, unflinching, staring through the lens" },
          { name: "camera_angle", description: "Camera perspective", defaultValue: "slightly below eye level, looking up — empowering angle" },
          { name: "flare_style", description: "Lens flare treatment", defaultValue: "subtle anamorphic cyan streaks from the neon sources" },
          { name: "color_grade", description: "Color grade", defaultValue: "crushed blacks, saturated neons, teal-and-magenta split toning" },
          { name: "dof", description: "Depth of field", defaultValue: "shallow f/1.4, background neon signs become abstract color shapes" },
          { name: "film_reference", description: "Film aesthetic reference", defaultValue: "Blade Runner 2049 meets Wong Kar-wai" },
        ],
      },
      {
        title: "Natural Window Light Portrait",
        content: "A serene, intimate portrait of a {{subject}} — {{subject_description}} — lit entirely by natural window light. The window is {{window_type}} positioned {{window_position}} relative to the subject. Light quality: {{light_quality}} creating {{shadow_character}} shadows. The subject is {{pose}} with {{hands_detail}}. Expression: {{expression}} — unguarded and authentic. Environment: {{interior_setting}} with {{decor_elements}} visible. Wardrobe: {{wardrobe}} in {{fabric_type}} fabric catching the light. Skin rendering: soft, natural, with accurate subsurface scattering showing warmth in the ears and fingertips. Negative fill: {{negative_fill}} to deepen shadows on the far side. Color palette: {{natural_palette}}. Shot on {{camera}} at f/2.8, ISO 400. The portrait feels {{mood}} — as if catching a private moment. 8K, editorial portrait photography, Annie Leibovitz natural light style.",
        description: "Create an intimate portrait using only natural window light for authentic, editorial-quality results.",
        variables: [
          { name: "subject", description: "Portrait subject", defaultValue: "a musician in their 30s" },
          { name: "subject_description", description: "Subject details", defaultValue: "gentle features, thoughtful eyes, tousled hair, calloused fingertips from guitar strings" },
          { name: "window_type", description: "Window style", defaultValue: "a large floor-to-ceiling window with sheer linen curtains diffusing the light" },
          { name: "window_position", description: "Window placement", defaultValue: "camera-left, at a 60-degree angle to the subject" },
          { name: "light_quality", description: "Light character", defaultValue: "soft overcast daylight filtered through sheer curtains" },
          { name: "shadow_character", description: "Shadow quality", defaultValue: "gentle gradient shadows with no hard edges" },
          { name: "pose", description: "Subject pose", defaultValue: "seated on a wooden stool, leaning slightly forward with elbows on knees" },
          { name: "hands_detail", description: "Hands position", defaultValue: "hands loosely clasped, one thumb absently rubbing a callous" },
          { name: "expression", description: "Expression", defaultValue: "a quiet half-smile, eyes looking past the camera as if lost in a memory" },
          { name: "interior_setting", description: "Room setting", defaultValue: "a sunlit loft studio with white walls and worn wooden floors" },
          { name: "decor_elements", description: "Background decor", defaultValue: "an acoustic guitar leaning against the wall, a stack of vinyl records, a houseplant" },
          { name: "wardrobe", description: "Clothing", defaultValue: "an unbuttoned olive linen shirt over a plain white tee" },
          { name: "fabric_type", description: "Fabric rendering", defaultValue: "natural linen with visible weave texture" },
          { name: "negative_fill", description: "Shadow side treatment", defaultValue: "a dark wall on the far side acting as natural negative fill" },
          { name: "natural_palette", description: "Color palette", defaultValue: "warm honey light, cool shadow tones, earth-toned wardrobe" },
          { name: "camera", description: "Camera setup", defaultValue: "Nikon Z9 with 85mm f/1.4" },
          { name: "mood", description: "Overall mood", defaultValue: "intimate, honest, and quietly powerful" },
        ],
      },
    ],
    examples: [
      {
        input: "Rembrandt-lit portrait of an old craftsman with leather apron, Dutch master style",
        output: "Dramatic Rembrandt-lit portrait of a weathered craftsman in his 60s — silver beard, laugh lines, wise gaze. Perfect light triangle on shadow-side cheek, 4:1 fill ratio. Worn leather apron over linen, deep umber painterly background. Warm tungsten hair light, Vermeer color palette. Hasselblad X2D 80mm, 8K museum-quality fine art portrait.",
        image: cover("pm-35-cinematic-portrait"),
        video: video("vid-35-craftsman"),
      },
      {
        input: "Neon-noir portrait in rainy Tokyo alley with magenta and cyan split lighting",
        output: "Striking neon-noir portrait of a young woman with sharp cheekbones and slicked wet hair. Magenta neon from left, cyan from right creating hard split-light. Rain-slicked Tokyo alley, kanji signs, steam. Black PVC trench coat, anamorphic lens flares. Blade Runner 2049 color grade, f/1.4 bokeh. 8K cinematic editorial photography.",
        image: cover("pm-35-cinematic-portrait"),
      },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 36. PIXEL ART & RETRO GAME ASSET
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Pixel Art & Retro Game Asset", vi: "Pixel Art & Tài Nguyên Game Retro" },
    category: "other",
    tags: ["pixel-art", "retro", "game-asset", "sprite", "8-bit", "indie-game", "nostalgia"],
    priceSKT: 75,
    sellerIdx: 9,
    description: {
      en: "Create charming pixel art assets for retro-style games including character sprite sheets, environment tilesets, and item collections. Perfect for indie game developers, nostalgic art lovers, and 8-bit/16-bit aesthetic enthusiasts.",
      vi: "Tạo tài nguyên pixel art đáng yêu cho game phong cách retro bao gồm bảng sprite nhân vật, tileset môi trường và bộ sưu tập vật phẩm. Hoàn hảo cho nhà phát triển game indie, người yêu nghệ thuật hoài cổ và tín đồ thẩm mỹ 8-bit/16-bit."
    },
    previewText: "Character sprites, environment tilesets, and item collections in pixel-perfect retro style.",
    coverImage: cover("pm-36-pixel-art"),
    models: ["gpt-4o", "dall-e-3", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Pixel Art Character Sprite Sheet",
        content: "Create a pixel art character sprite sheet for a {{character_type}} character in a {{game_genre}} game. Resolution: {{sprite_size}} pixels per sprite. Art style: {{pixel_style}}-bit aesthetic with {{color_depth}} color palette (max {{max_colors}} colors). The sheet includes: {{animation_sets}} animation sets — {{animation_list}}. Each animation has {{frames_per_anim}} frames. Character design: {{character_design}}. Facing directions: {{directions}}. Include {{special_anims}} special animations: {{special_list}}. Sprite arrangement: {{sheet_layout}} on a {{bg_color}} background with {{grid_lines}} grid lines. Color palette strip shown at {{palette_position}}. Anti-aliasing: {{aa_style}}. Outline: {{outline_style}}. The sprites should read clearly at {{display_scale}} scale and be game-engine ready for {{engine}}.",
        description: "Generate a complete pixel art sprite sheet with multiple animation sets, directional views, special animations, and game-engine-ready layout.",
        variables: [
          { name: "character_type", description: "Type of character", defaultValue: "heroic knight" },
          { name: "game_genre", description: "Game genre", defaultValue: "action RPG dungeon crawler" },
          { name: "sprite_size", description: "Individual sprite dimensions", defaultValue: "32×32" },
          { name: "pixel_style", description: "Pixel art era", defaultValue: "16" },
          { name: "color_depth", description: "Color palette style", defaultValue: "curated limited" },
          { name: "max_colors", description: "Maximum colors for the character", defaultValue: "16" },
          { name: "animation_sets", description: "Number of animation sets", defaultValue: "5" },
          { name: "animation_list", description: "Which animations", defaultValue: "idle (breathing), walk cycle, sword attack slash, take damage (flinch), death (collapse)" },
          { name: "frames_per_anim", description: "Frames per animation", defaultValue: "4-6" },
          { name: "character_design", description: "Character visual design", defaultValue: "knight with plumed helmet (visor up showing determined eyes), silver armor with blue tabard, short sword and round shield" },
          { name: "directions", description: "Facing directions", defaultValue: "4 directions: down (front), up (back), left, right" },
          { name: "special_anims", description: "Number of special animations", defaultValue: "2" },
          { name: "special_list", description: "Special animation descriptions", defaultValue: "shield block (raise shield with impact sparks) and victory pose (sword raised, sparkle effect)" },
          { name: "sheet_layout", description: "How sprites are arranged", defaultValue: "horizontal rows per animation, labeled at left edge" },
          { name: "bg_color", description: "Background color", defaultValue: "transparent (shown as magenta #FF00FF checkerboard)" },
          { name: "grid_lines", description: "Grid line visibility", defaultValue: "subtle 1px gray" },
          { name: "palette_position", description: "Where palette swatch appears", defaultValue: "bottom row of the sheet" },
          { name: "aa_style", description: "Anti-aliasing approach", defaultValue: "manual pixel-level anti-aliasing (no auto-AA)" },
          { name: "outline_style", description: "Character outline", defaultValue: "1px dark selective outline (darker shade of adjacent color, not pure black)" },
          { name: "display_scale", description: "Intended display scale", defaultValue: "3× (96×96 display from 32×32 source)" },
          { name: "engine", description: "Target game engine", defaultValue: "Unity 2D or Godot" }
        ]
      },
      {
        title: "Pixel Art Environment/Tileset",
        content: "Design a pixel art environment tileset for a {{environment_type}} level in a {{game_genre}} game. Tile size: {{tile_size}} pixels. Style: {{pixel_era}}-bit with a {{palette_type}} palette of {{max_colors}} colors. The tileset includes: **Terrain** — {{terrain_tiles}}. **Structures** — {{structure_tiles}}. **Props** — {{prop_tiles}}. **Animated tiles** — {{animated_tiles}} with {{anim_frames}} frames each. **Edge/transition tiles** — {{edge_tiles}} for seamless tiling. Lighting mood: {{lighting}}. Include a small {{sample_scene}} sample scene ({{scene_size}} tiles) showing the tiles assembled into a playable environment. The tileset should tile seamlessly in {{tiling_direction}} directions. Arrangement: {{layout}} with clear category separation. Background color: {{bg_color}}. Each tile category is labeled. Designed for {{engine}} tile map system.",
        description: "Create a comprehensive pixel art tileset with terrain, structures, props, animated tiles, edge transitions, and an assembled sample scene.",
        variables: [
          { name: "environment_type", description: "Type of environment", defaultValue: "enchanted forest dungeon entrance" },
          { name: "game_genre", description: "Game genre", defaultValue: "metroidvania platformer" },
          { name: "tile_size", description: "Individual tile dimensions", defaultValue: "16×16" },
          { name: "pixel_era", description: "Pixel art era reference", defaultValue: "16" },
          { name: "palette_type", description: "Palette approach", defaultValue: "harmonious earthy" },
          { name: "max_colors", description: "Maximum palette colors", defaultValue: "24" },
          { name: "terrain_tiles", description: "Ground/terrain tiles", defaultValue: "mossy stone floor (3 variants), dirt path, grass tufts, water pool (animated), cracked stone, root-covered ground" },
          { name: "structure_tiles", description: "Building/structure tiles", defaultValue: "stone dungeon walls (top/mid/bottom), arched doorway, crumbling pillar, iron gate (open/closed), torch bracket" },
          { name: "prop_tiles", description: "Decorative props", defaultValue: "mushroom cluster (3 types), hanging vines, fallen log, treasure chest (closed/open), skull, cobwebs, moss patches" },
          { name: "animated_tiles", description: "Tiles with animation", defaultValue: "water ripple, torch flame, glowing rune, firefly particles" },
          { name: "anim_frames", description: "Frames per animated tile", defaultValue: "4" },
          { name: "edge_tiles", description: "Edge/transition pieces", defaultValue: "stone-to-dirt transitions (8 directional), grass border tiles, water edge tiles with foam" },
          { name: "lighting", description: "Lighting mood", defaultValue: "dim atmospheric with warm torch pools and cool ambient shadow" },
          { name: "sample_scene", description: "Assembled demo scene", defaultValue: "a dungeon entrance chamber" },
          { name: "scene_size", description: "Demo scene dimensions", defaultValue: "20×12" },
          { name: "tiling_direction", description: "Tiling capability", defaultValue: "all 4" },
          { name: "layout", description: "Tileset sheet layout", defaultValue: "organized grid with category rows, sample scene below" },
          { name: "bg_color", description: "Sheet background", defaultValue: "dark charcoal #1A1A1A" },
          { name: "engine", description: "Target engine", defaultValue: "Godot TileMap or Tiled editor" }
        ]
      },
      {
        title: "Pixel Art Item/Weapon Collection",
        content: "Create a pixel art collection of {{item_category}} items for a {{game_genre}} game. Item size: {{item_size}} pixels each. Style: {{pixel_era}}-bit with {{palette_style}} palette ({{max_colors}} colors shared across all items). Include {{num_items}} items: {{item_list}}. Each item has: {{item_features}}. Rarity tiers shown with {{rarity_system}}: {{rarity_tiers}}. Items are arranged in a {{layout}} grid on {{bg_color}} background. Include {{tooltip_style}} tooltip/info card for {{spotlight_item}} as a UI mockup example. Add a {{ui_frame}} inventory slot frame around each item. Pixel technique: {{pixel_technique}}. The collection should feel cohesive — like items from the same game world. All items must read clearly at {{display_scale}} scale. Sheet suitable for {{use_case}}.",
        description: "Generate a cohesive pixel art item collection with rarity tiers, inventory frames, tooltip mockup, and consistent art style across all pieces.",
        variables: [
          { name: "item_category", description: "Category of items", defaultValue: "weapons and shields" },
          { name: "game_genre", description: "Game genre", defaultValue: "fantasy RPG" },
          { name: "item_size", description: "Per-item pixel dimensions", defaultValue: "24×24" },
          { name: "pixel_era", description: "Pixel art style era", defaultValue: "16" },
          { name: "palette_style", description: "Palette approach", defaultValue: "unified warm fantasy" },
          { name: "max_colors", description: "Total palette colors", defaultValue: "32" },
          { name: "num_items", description: "Number of items", defaultValue: "16" },
          { name: "item_list", description: "Items to include", defaultValue: "wooden sword, iron sword, flame sword, ice blade, holy sword, wooden staff, crystal staff, dark wand, wooden shield, iron shield, magic barrier, short bow, crossbow, throwing daggers (×3), health potion, mana potion" },
          { name: "item_features", description: "Visual features per item", defaultValue: "subtle idle animation frame (glow/shimmer for magic items), clear silhouette readable at 1× scale" },
          { name: "rarity_system", description: "How rarity is shown", defaultValue: "colored border glow around inventory slot" },
          { name: "rarity_tiers", description: "Rarity levels and colors", defaultValue: "Common (gray), Uncommon (green), Rare (blue), Epic (purple), Legendary (gold with sparkle)" },
          { name: "layout", description: "Grid arrangement", defaultValue: "4×4 grid, organized by item type (swords row, staves row, shields/ranged row, consumables row)" },
          { name: "bg_color", description: "Sheet background", defaultValue: "dark navy #0D1117" },
          { name: "tooltip_style", description: "Tooltip UI design", defaultValue: "RPG-style info card with item name, rarity, damage stats, and flavor text" },
          { name: "spotlight_item", description: "Which item gets a tooltip", defaultValue: "the flame sword (Rare)" },
          { name: "ui_frame", description: "Inventory slot style", defaultValue: "stone-textured square frame with rounded inner corners, 2px border" },
          { name: "pixel_technique", description: "Key pixel art techniques used", defaultValue: "dithering for metal sheen, sub-pixel animation for glows, hue-shifting for shading (no pure black shadows)" },
          { name: "display_scale", description: "Intended display scale", defaultValue: "3× (72×72 from 24×24)" },
          { name: "use_case", description: "Intended use", defaultValue: "game inventory system and UI integration" }
        ]
      }
    ],
    examples: [
      {
        input: "Character: heroic knight, 32×32 sprites, 16-bit style, 16-color palette, Animations: idle, walk, attack, hurt, death in 4 directions",
        output: "A complete 32×32 pixel art sprite sheet on magenta checkerboard transparency. A charming knight with plumed helmet, silver armor, and blue tabard. Rows show 4-direction animations: idle (2-frame breathing cycle), walk (6-frame cycle with bobbing plume), sword slash (5 frames with impact arc effect), flinch (3 frames recoil), death (5 frames collapsing). Special rows: shield block with spark particles, victory pose with sword raised and sparkle. 16-color palette strip at bottom. Selective dark outline. Labeled rows. Game-engine ready for Unity/Godot.",
        image: cover("pm-36-pixel-art")
      },
      {
        input: "Environment: enchanted forest dungeon entrance, 16×16 tiles, 16-bit style, includes terrain, structures, props, animated tiles, and assembled sample scene",
        output: "A comprehensive 16×16 tileset on dark charcoal background. Organized rows: mossy stone floors (3 variants), dirt paths, grass tufts. Stone dungeon walls (top/mid/bottom pieces), arched doorway, crumbling pillars, iron gate. Props: mushroom clusters, hanging vines, treasure chests (open/closed), skulls, cobwebs. 4-frame animated tiles: water ripple, torch flame, glowing rune, firefly particles. 8-directional edge transition tiles. Below: a 20×12 assembled sample scene showing a dungeon entrance chamber with torchlight pools and cool shadows. 24-color earthy palette. Seamless tiling in all directions.",
        image: example("ex-36-pixel-dungeon")
      }
    ]
  },

  /* ═══════════════════════════════════════════════════
   * 37. TECHNICAL & SCIENTIFIC ILLUSTRATION
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Technical & Scientific Illustration", vi: "Minh Họa Kỹ Thuật & Khoa Học" },
    category: "writing",
    tags: ["scientific", "technical", "botanical", "illustration", "diagram", "educational", "anatomy", "exploded-view"],
    priceSKT: 80,
    sellerIdx: 4,
    description: {
      en: "Generate publication-quality scientific illustrations including botanical plates, anatomical diagrams, and technical exploded views. Ideal for textbooks, research papers, and educational materials.",
      vi: "Tạo minh họa khoa học chất lượng xuất bản bao gồm bản vẽ thực vật, sơ đồ giải phẫu và bản vẽ phân rã kỹ thuật. Lý tưởng cho sách giáo khoa, bài nghiên cứu và tài liệu giáo dục."
    },
    previewText: "Publication-quality botanical plates, anatomical diagrams, and technical exploded views.",
    coverImage: cover("pm-37-botanical"),
    models: ["gpt-4o", "dall-e-3", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Botanical Scientific Illustration",
        content: "Create a detailed botanical scientific illustration of {{plant_species}} in the style of {{art_reference}}. The plate should include: a full plant habit showing {{growth_form}}, a close-up of the {{flower_detail}} with petals partially dissected to reveal reproductive structures, a cross-section of the {{fruit_or_seed}}, and a detail of the {{leaf_structure}} showing venation pattern. Render on a {{background}} background. Use {{color_technique}} with precise {{line_work}} linework. Include {{scale_indicators}} for scale reference. Arrange elements in a classic botanical plate composition with the full plant at center-left and dissected details at right. Accuracy level: {{accuracy}} — every stamen, pistil, and sepal must be botanically correct. Add subtle {{labeling_style}} labels with leader lines pointing to key structures.",
        description: "Generate a museum-quality botanical plate with full habit, flower dissection, fruit cross-section, and leaf detail in classical scientific illustration style.",
        variables: [
          { name: "plant_species", description: "Plant species to illustrate", defaultValue: "Rosa canina (Dog Rose)" },
          { name: "art_reference", description: "Style reference", defaultValue: "Maria Sibylla Merian meets modern Kew Gardens archive" },
          { name: "growth_form", description: "How the plant grows", defaultValue: "arching thorny stems with compound leaves and open five-petaled flowers" },
          { name: "flower_detail", description: "Flower part to detail", defaultValue: "flower in full bloom, one at bud stage" },
          { name: "fruit_or_seed", description: "Fruit/seed to cross-section", defaultValue: "rose hip (pseudo-fruit), both whole and longitudinal section showing achenes" },
          { name: "leaf_structure", description: "Leaf detail to show", defaultValue: "pinnately compound leaf with serrated leaflets" },
          { name: "background", description: "Background style", defaultValue: "aged cream parchment with subtle foxing" },
          { name: "color_technique", description: "Coloring method", defaultValue: "transparent watercolor washes layered over precise graphite underdrawing" },
          { name: "line_work", description: "Line quality", defaultValue: "fine stippled and hatched ink" },
          { name: "scale_indicators", description: "Scale reference type", defaultValue: "small metric scale bars (1 cm, 5 mm) next to each detail" },
          { name: "accuracy", description: "Level of botanical accuracy", defaultValue: "taxonomically precise, herbarium reference quality" },
          { name: "labeling_style", description: "How labels appear", defaultValue: "elegant italic serif" }
        ]
      },
      {
        title: "Anatomical Diagram",
        content: "Illustrate a detailed anatomical diagram of the {{anatomical_subject}} viewed from the {{view_angle}}. Style: {{illustration_style}}. Show {{layer_depth}} layers: {{layers_described}}. Use {{color_coding}} color coding to differentiate systems. Render with {{rendering_technique}} technique on a {{background}} background. Include {{num_labels}} numbered labels with a corresponding legend at the {{legend_position}}. Highlight {{focus_structure}} with a magnified inset at {{inset_position}} showing {{inset_detail}}. Accuracy: {{accuracy_level}}. The diagram should be suitable for {{intended_use}}. Dimensions: {{aspect_ratio}}.",
        description: "Create a layered anatomical diagram with color-coded systems, numbered labels, legend, and magnified inset for educational or clinical reference.",
        variables: [
          { name: "anatomical_subject", description: "Body part or organ", defaultValue: "human heart" },
          { name: "view_angle", description: "Viewing perspective", defaultValue: "anterior (front) view, slightly rotated to show left ventricle" },
          { name: "illustration_style", description: "Visual style", defaultValue: "Netter-style medical illustration, clean and authoritative" },
          { name: "layer_depth", description: "Number of layers shown", defaultValue: "3" },
          { name: "layers_described", description: "Description of each layer", defaultValue: "outer pericardium (translucent), myocardium with coronary vessels highlighted, inner chambers with valve structures" },
          { name: "color_coding", description: "Color scheme for different systems", defaultValue: "arterial red for oxygenated pathways, venous blue for deoxygenated, golden-yellow for conduction system" },
          { name: "rendering_technique", description: "Artistic technique", defaultValue: "digital airbrush with sharp ink outlines for structure boundaries" },
          { name: "background", description: "Background treatment", defaultValue: "clean white with subtle gray gradient" },
          { name: "num_labels", description: "Number of labeled structures", defaultValue: "18" },
          { name: "legend_position", description: "Where the label legend goes", defaultValue: "right margin" },
          { name: "focus_structure", description: "Structure to magnify", defaultValue: "mitral valve" },
          { name: "inset_position", description: "Magnified inset location", defaultValue: "upper-right corner" },
          { name: "inset_detail", description: "What the inset reveals", defaultValue: "valve leaflets, chordae tendineae, and papillary muscle attachment at 4× magnification" },
          { name: "accuracy_level", description: "Required accuracy", defaultValue: "medical textbook grade, reviewed anatomy" },
          { name: "intended_use", description: "Purpose of the diagram", defaultValue: "university-level anatomy textbook" },
          { name: "aspect_ratio", description: "Image dimensions", defaultValue: "3:4 portrait" }
        ]
      },
      {
        title: "Technical Exploded View",
        content: "Create a technical exploded-view illustration of a {{object}} showing all {{num_components}} major components separated along the {{explosion_axis}} axis. Style: {{rendering_style}}. Each part is offset by {{spacing}} and connected by {{guide_lines}} guide lines showing assembly order. Material rendering: {{material_detail}} — show surface textures for {{material_list}}. Background: {{background}}. Include a {{callout_style}} callout for each part with {{callout_info}}. Perspective: {{perspective_type}}. Color scheme: {{color_scheme}}. Add a small assembled thumbnail at {{thumbnail_position}} for reference. The illustration should communicate both the engineering elegance and the assembly sequence at a glance. Suitable for {{use_case}}.",
        description: "Generate a professional exploded-view technical illustration showing all components separated along an axis with material rendering, callouts, and assembly guide lines.",
        variables: [
          { name: "object", description: "Object to illustrate", defaultValue: "mechanical wristwatch movement (automatic caliber)" },
          { name: "num_components", description: "Number of major parts", defaultValue: "12" },
          { name: "explosion_axis", description: "Axis along which parts separate", defaultValue: "vertical (top-to-bottom stack)" },
          { name: "rendering_style", description: "Visual rendering approach", defaultValue: "photorealistic technical illustration with isometric precision" },
          { name: "spacing", description: "Separation distance between parts", defaultValue: "uniform 15mm visual gap" },
          { name: "guide_lines", description: "Assembly guide line style", defaultValue: "thin dashed gray" },
          { name: "material_detail", description: "How materials are rendered", defaultValue: "physically accurate surface properties" },
          { name: "material_list", description: "Materials present in the object", defaultValue: "brushed steel, polished brass gears, ruby jewel bearings, blued steel hands, sapphire crystal" },
          { name: "background", description: "Background style", defaultValue: "clean white with subtle drop shadows for each floating component" },
          { name: "callout_style", description: "Callout label style", defaultValue: "minimal sans-serif" },
          { name: "callout_info", description: "Information in each callout", defaultValue: "part name and material" },
          { name: "perspective_type", description: "Camera perspective", defaultValue: "three-quarter isometric, 30° elevation" },
          { name: "color_scheme", description: "Overall color treatment", defaultValue: "natural material colors with subtle warm studio lighting" },
          { name: "thumbnail_position", description: "Where the assembled reference goes", defaultValue: "bottom-right corner at 25% scale" },
          { name: "use_case", description: "Intended use", defaultValue: "product catalog and technical documentation" }
        ]
      }
    ],
    examples: [
      {
        input: "Plant: Rosa canina (Dog Rose), Style: classical botanical plate on aged parchment, Include: full habit, flower dissection, rose hip cross-section, leaf venation detail",
        output: "A museum-quality botanical plate on cream parchment featuring a full Dog Rose branch with arching thorny stems at center-left. To the right: a dissected five-petaled flower revealing stamens and pistil, a longitudinal rose hip section showing achenes, and a pinnate leaf detail with venation. Precise watercolor over graphite with metric scale bars and italic serif labels with leader lines.",
        image: cover("pm-37-botanical")
      },
      {
        input: "Subject: mechanical wristwatch movement, Style: photorealistic exploded view, 12 components along vertical axis with material rendering",
        output: "A stunning isometric exploded view of an automatic watch caliber with 12 components floating in vertical stack. Each piece — from sapphire crystal caseback to mainspring barrel to escapement — rendered with physically accurate materials: brushed steel, brass gears, ruby bearings. Thin dashed guide lines indicate assembly order. Minimal callouts name each part. Assembled thumbnail at bottom-right for reference.",
        image: cover("pm-37-botanical")
      }
    ]
  },

  /* ═══════════════════════════════════════════════════
   * 38. SPORTS ACTION PHOTOGRAPHY
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Sports Action Photography Pro", vi: "Nhiếp ảnh thể thao Action Pro" },
    category: "design",
    tags: ["sports", "action", "photography", "dynamic", "athletic"],
    priceSKT: 95,
    featured: true,
    sellerIdx: 0,
    description: {
      en: "Freeze epic sports moments in time. Slam dunks, bicycle kicks, and explosive action with dramatic arena lighting, slow-motion video, and broadcast-quality compositions.",
      vi: "Đóng băng những khoảnh khắc thể thao sử thi. Slam dunk, bicycle kick, và action bùng nổ với ánh sáng sân vận động dramatic, video slow-motion, và bố cục chất lượng phát sóng."
    },
    previewText: "Dynamic sports photograph of {{athlete}} mid-{{action}}, {{lighting}}, {{camera_settings}}...",
    coverImage: cover("pm-38-sports-action"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Frozen Action Moment",
        content: "Dynamic sports action photograph of {{athlete}} mid-{{action}}, frozen in mid-air with {{lighting}}, {{detail}}, shot at {{shutter}} shutter speed with {{camera}}, {{aperture}}, {{atmosphere}}, no text",
        description: "Frozen sports action moment",
        variables: [
          { name: "athlete", description: "Athlete", defaultValue: "a basketball player" },
          { name: "action", description: "Action", defaultValue: "dunk, soaring toward the rim" },
          { name: "lighting", description: "Lighting", defaultValue: "arena lights creating dramatic rim lighting and lens flares" },
          { name: "detail", description: "Detail", defaultValue: "sweat droplets suspended in the air, motion blur on the crowd" },
          { name: "shutter", description: "Shutter speed", defaultValue: "1/2000s" },
          { name: "camera", description: "Camera", defaultValue: "Canon EOS R3" },
          { name: "aperture", description: "Aperture", defaultValue: "f/2.8 wide aperture" },
          { name: "atmosphere", description: "Atmosphere", defaultValue: "packed stadium, roaring crowd blurred in background" },
        ],
      },
      {
        title: "Swimming Pool Turn & Splash",
        content: "Underwater-to-surface split-shot of {{swimmer}} executing a {{technique}} in an Olympic-sized pool. The underwater half reveals {{underwater_detail}}, while the surface shows {{surface_detail}}. {{pool_lighting}} illuminates the turquoise water. Shot at {{shutter}} with {{camera}}, capturing every droplet and bubble in crystalline detail. {{atmosphere}}, no text",
        description: "Dynamic swimming split-shot capturing both underwater and surface action",
        variables: [
          { name: "swimmer", description: "Swimmer description", defaultValue: "a competitive swimmer in a streamlined racing suit" },
          { name: "technique", description: "Swimming technique", defaultValue: "flip turn at the wall, legs pushing off powerfully" },
          { name: "underwater_detail", description: "Underwater visual", defaultValue: "trail of silver bubbles, rippling light patterns on the pool floor" },
          { name: "surface_detail", description: "Surface visual", defaultValue: "explosive spray of water droplets catching arena lights" },
          { name: "pool_lighting", description: "Lighting setup", defaultValue: "overhead competition lighting with underwater LED accents" },
          { name: "shutter", description: "Shutter speed", defaultValue: "1/3000s" },
          { name: "camera", description: "Camera", defaultValue: "Nikon Z9 in underwater housing" },
          { name: "atmosphere", description: "Atmosphere", defaultValue: "lane ropes vibrating, timing board visible in background" },
        ],
      },
      {
        title: "Track & Field Explosive Start",
        content: "Ultra-dynamic photograph of {{athlete}} in the explosive {{moment}} of a {{event}}. {{body_detail}} showing peak athletic form. {{track_surface}} with {{weather_conditions}}. Dramatic {{lighting}} creating long shadows and highlighting muscle definition. Shot from {{angle}} with {{camera}} at {{shutter}}, {{depth_of_field}}. {{crowd_atmosphere}}, no text",
        description: "Capture the explosive power of track and field athletics with dramatic angles",
        variables: [
          { name: "athlete", description: "Athlete description", defaultValue: "a sprinter with powerful build" },
          { name: "moment", description: "Key moment", defaultValue: "first stride out of the starting blocks" },
          { name: "event", description: "Track event", defaultValue: "100m sprint" },
          { name: "body_detail", description: "Body detail", defaultValue: "every muscle fiber visible, fingers splayed, jaw clenched in determination" },
          { name: "track_surface", description: "Track surface", defaultValue: "red Mondo track with white lane markings" },
          { name: "weather_conditions", description: "Weather", defaultValue: "slight rain creating a reflective sheen on the track" },
          { name: "lighting", description: "Lighting", defaultValue: "low-angle golden hour stadium lights" },
          { name: "angle", description: "Camera angle", defaultValue: "ground level, slightly behind the blocks" },
          { name: "camera", description: "Camera", defaultValue: "Sony A1" },
          { name: "shutter", description: "Shutter speed", defaultValue: "1/4000s" },
          { name: "depth_of_field", description: "DOF", defaultValue: "f/2.0 isolating the athlete from competitors" },
          { name: "crowd_atmosphere", description: "Crowd", defaultValue: "Olympic stadium at full capacity, national flags waving" },
        ],
      },
    ],
    examples: [
      { input: "Basketball slam dunk with arena lights and frozen sweat drops", output: "Explosive mid-air slam dunk with dramatic rim lighting, suspended sweat droplets, and roaring crowd.", image: cover("pm-38-sports-action"), video: video("vid-38-slam-dunk") },
      { input: "Soccer bicycle kick in packed stadium at night", output: "Dynamic aerial bicycle kick with floodlight backlight, grass particles, and frozen-in-time impact moment.", image: example("ex-38-soccer") },
    ],
  },


  /* ═══════════════════════════════════════════════════
   * 39. UI/UX DESIGN SYSTEM & WIREFRAME
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "UI/UX Design System & Wireframe", vi: "Hệ Thống Thiết Kế UI/UX & Wireframe" },
    category: "coding",
    tags: ["ui-ux", "wireframe", "design-system", "mobile", "dashboard", "figma", "prototype", "component-library"],
    priceSKT: 90,
    featured: true,
    sellerIdx: 10,
    description: {
      en: "Generate professional UI/UX design mockups including mobile app screens, dashboard wireframes, and complete design system component sheets. Ready for developer handoff and Figma implementation.",
      vi: "Tạo mockup thiết kế UI/UX chuyên nghiệp bao gồm màn hình ứng dụng di động, wireframe dashboard và bảng component hệ thống thiết kế hoàn chỉnh. Sẵn sàng bàn giao cho developer và triển khai trên Figma."
    },
    previewText: "Professional mobile UI, dashboard wireframes, and design system component sheets.",
    coverImage: cover("pm-39-stained-glass"),
    models: ["gpt-4o", "dall-e-3", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Mobile App UI Design",
        content: "Design a high-fidelity mobile app UI screen for a {{app_type}} application. Screen: {{screen_name}} — {{screen_purpose}}. Design language: {{design_language}} with {{corner_radius}} corner radius. Color scheme: primary {{primary_color}}, secondary {{secondary_color}}, background {{bg_color}}. Typography: {{font_family}}. The screen includes: {{ui_elements}}. Navigation: {{nav_pattern}}. Status bar: {{status_bar}}. Key interaction: {{key_interaction}} with a {{cta_style}} CTA button labeled \"{{cta_text}}\". Include {{micro_interaction}} micro-interaction hints. Device frame: {{device_frame}}. Show the screen at {{resolution}} resolution. The design should feel {{design_feel}} and follow {{platform_guidelines}} guidelines.",
        description: "Generate a pixel-perfect mobile app UI screen with complete design language, navigation, interactive elements, and platform-appropriate styling.",
        variables: [
          { name: "app_type", description: "Type of mobile application", defaultValue: "fintech / personal banking" },
          { name: "screen_name", description: "Name of this screen", defaultValue: "Portfolio Overview" },
          { name: "screen_purpose", description: "What this screen does", defaultValue: "shows investment portfolio with asset allocation, performance chart, and quick-trade actions" },
          { name: "design_language", description: "Design system style", defaultValue: "glassmorphism with subtle blur layers over dark gradient" },
          { name: "corner_radius", description: "Border radius for cards/buttons", defaultValue: "16px" },
          { name: "primary_color", description: "Primary brand color", defaultValue: "#6C5CE7 (rich purple)" },
          { name: "secondary_color", description: "Secondary accent color", defaultValue: "#00D2D3 (teal)" },
          { name: "bg_color", description: "Background color", defaultValue: "#0D0D1A (deep navy-black)" },
          { name: "font_family", description: "Typography system", defaultValue: "Inter for body, Space Grotesk for headings" },
          { name: "ui_elements", description: "UI elements on screen", defaultValue: "portfolio value card with sparkline, donut chart for allocation, scrollable asset list with mini charts, floating action button" },
          { name: "nav_pattern", description: "Navigation style", defaultValue: "bottom tab bar with 5 icons (Home, Markets, Trade, Cards, Profile)" },
          { name: "status_bar", description: "Status bar style", defaultValue: "light text on dark, showing time and battery" },
          { name: "key_interaction", description: "Primary user action", defaultValue: "tap any asset row to see detail with slide-up sheet" },
          { name: "cta_style", description: "Call-to-action button style", defaultValue: "gradient purple-to-teal, pill-shaped, elevated shadow" },
          { name: "cta_text", description: "CTA button label", defaultValue: "Quick Trade" },
          { name: "micro_interaction", description: "Subtle animation/interaction hints", defaultValue: "subtle glow pulse on the CTA, skeleton loading states on chart" },
          { name: "device_frame", description: "Phone frame to show", defaultValue: "iPhone 15 Pro, titanium frame" },
          { name: "resolution", description: "Screen resolution", defaultValue: "1179 × 2556 (3× Retina)" },
          { name: "design_feel", description: "Overall UX feeling", defaultValue: "premium, trustworthy, and effortlessly modern" },
          { name: "platform_guidelines", description: "Platform design system", defaultValue: "Apple HIG (iOS 17)" }
        ]
      },
      {
        title: "Dashboard Wireframe",
        content: "Create a detailed wireframe for a {{dashboard_type}} dashboard. Layout: {{layout_structure}}. Sidebar: {{sidebar_content}} on the {{sidebar_position}} side, {{sidebar_width}} wide. Header: {{header_content}}. Main content area is divided into {{grid_layout}} containing: {{widget_list}}. Data visualization widgets use {{chart_types}}. Wireframe fidelity: {{fidelity_level}} — {{fidelity_detail}}. Color: {{color_treatment}}. Annotations: include {{annotation_style}} annotations explaining {{annotation_content}}. Show {{responsive_note}} responsive behavior notes. The wireframe should communicate the information architecture clearly enough for a developer to build from and a stakeholder to approve. Aspect ratio: {{aspect_ratio}}.",
        description: "Design a comprehensive dashboard wireframe with annotated layout grid, widget placement, sidebar navigation, and responsive behavior notes.",
        variables: [
          { name: "dashboard_type", description: "Type of dashboard", defaultValue: "SaaS analytics platform" },
          { name: "layout_structure", description: "Overall page structure", defaultValue: "fixed sidebar + scrollable main content with sticky header" },
          { name: "sidebar_content", description: "What's in the sidebar", defaultValue: "logo, navigation links (Dashboard, Analytics, Users, Settings, Billing), collapsible sections, user avatar at bottom" },
          { name: "sidebar_position", description: "Sidebar position", defaultValue: "left" },
          { name: "sidebar_width", description: "Sidebar width", defaultValue: "260px, collapsible to 72px icon-only mode" },
          { name: "header_content", description: "Top header elements", defaultValue: "breadcrumb, search bar, date range picker, notification bell, user dropdown" },
          { name: "grid_layout", description: "Content grid structure", defaultValue: "a 12-column grid with 4 KPI cards across the top, 2 large charts (8+4 col), and a data table spanning full width below" },
          { name: "widget_list", description: "Widgets to include", defaultValue: "Total Revenue (KPI), Active Users (KPI), Conversion Rate (KPI), Churn Rate (KPI), Revenue Over Time (line chart), Traffic Sources (donut), User Activity Table (sortable, paginated)" },
          { name: "chart_types", description: "Chart styles to use", defaultValue: "line charts, donut/pie, horizontal bar, sparklines in KPI cards" },
          { name: "fidelity_level", description: "Wireframe detail level", defaultValue: "mid-fidelity" },
          { name: "fidelity_detail", description: "What mid-fidelity means here", defaultValue: "real labels and placeholder data, grayscale with hierarchy through weight/size, no final colors or imagery" },
          { name: "color_treatment", description: "Color usage in wireframe", defaultValue: "grayscale with blue (#3B82F6) accent for interactive elements and focus states" },
          { name: "annotation_style", description: "How annotations appear", defaultValue: "red numbered callout circles with a legend" },
          { name: "annotation_content", description: "What annotations explain", defaultValue: "interaction behaviors (hover states, click targets, filter logic, sort directions)" },
          { name: "responsive_note", description: "Responsive design notes", defaultValue: "sidebar collapses at <1024px, KPI cards stack 2×2 at <768px" },
          { name: "aspect_ratio", description: "Wireframe dimensions", defaultValue: "16:10 landscape (1440×900 viewport)" }
        ]
      },
      {
        title: "Design System Component Sheet",
        content: "Generate a comprehensive design system component sheet for the \"{{system_name}}\" design system. Theme: {{theme_description}}. Show all components at {{scale}} scale organized in {{section_layout}} sections: 1) **Color Palette** — primary: {{primary}}, secondary: {{secondary}}, neutrals: {{neutrals}}, semantic: {{semantic_colors}}. 2) **Typography Scale** — {{type_scale}} using {{font_stack}}. 3) **Button System** — {{button_variants}} in sizes {{button_sizes}}, showing default/hover/active/disabled states. 4) **Input Fields** — {{input_types}} with {{input_states}} states. 5) **Cards** — {{card_variants}}. 6) **Icons** — {{icon_set}} sample set. 7) **Spacing & Grid** — {{spacing_scale}}. Each component shows {{state_display}}. Background: {{bg}}. Include {{token_display}} design token names. The sheet should be a single comprehensive reference a developer can use to implement every component accurately.",
        description: "Create a full design system reference sheet with color palette, typography, buttons, inputs, cards, icons, and spacing tokens in multiple states.",
        variables: [
          { name: "system_name", description: "Design system name", defaultValue: "Atlas Cloud" },
          { name: "theme_description", description: "Visual theme description", defaultValue: "modern SaaS with sharp elegance — dark mode primary, clean geometry, gold accents" },
          { name: "scale", description: "Display scale", defaultValue: "1× with 2× detail for interactive states" },
          { name: "section_layout", description: "How sections are arranged", defaultValue: "horizontal strips, each spanning full width" },
          { name: "primary", description: "Primary colors", defaultValue: "#C9A84C (atlas gold), #1A1A2E (deep dark)" },
          { name: "secondary", description: "Secondary colors", defaultValue: "#6C5CE7 (purple accent), #00B894 (success green)" },
          { name: "neutrals", description: "Neutral palette", defaultValue: "10-step gray ramp from #FAFAFA to #111111" },
          { name: "semantic_colors", description: "Semantic/status colors", defaultValue: "success #00B894, warning #FDCB6E, error #E17055, info #74B9FF" },
          { name: "type_scale", description: "Typography sizes", defaultValue: "Display (48px), H1 (36px), H2 (28px), H3 (22px), Body (16px), Small (14px), Caption (12px)" },
          { name: "font_stack", description: "Font families", defaultValue: "Manrope (sans-serif headings/body), Fragment Mono (code/data)" },
          { name: "button_variants", description: "Button types", defaultValue: "Primary (filled gold), Secondary (outlined), Ghost (text-only), Danger (red filled), Icon-only (circle)" },
          { name: "button_sizes", description: "Button size options", defaultValue: "XS (28px), SM (32px), MD (40px), LG (48px)" },
          { name: "input_types", description: "Input field variations", defaultValue: "text input, search with icon, select dropdown, textarea, toggle switch, checkbox, radio" },
          { name: "input_states", description: "States for each input", defaultValue: "default, focus (gold ring), filled, error (red border + message), disabled (dimmed)" },
          { name: "card_variants", description: "Card component variations", defaultValue: "content card, pricing card, stat card with sparkline, image card with overlay" },
          { name: "icon_set", description: "Icon samples to show", defaultValue: "16 Lucide icons — home, search, settings, user, bell, chart, folder, lock, globe, zap, heart, star, download, share, filter, plus" },
          { name: "spacing_scale", description: "Spacing system", defaultValue: "4px base unit: 4, 8, 12, 16, 24, 32, 48, 64, 96" },
          { name: "state_display", description: "How component states are shown", defaultValue: "side-by-side state progression (default → hover → active → disabled) with labels" },
          { name: "bg", description: "Sheet background", defaultValue: "dark #0F0F1A with subtle grid lines for alignment" },
          { name: "token_display", description: "Design token labeling", defaultValue: "small monospace labels showing CSS custom property names (e.g., --color-primary, --space-4)" }
        ]
      }
    ],
    examples: [
      {
        input: "App: fintech banking, Screen: Portfolio Overview, Style: glassmorphism on dark, Device: iPhone 15 Pro",
        output: "A premium fintech mobile UI on iPhone 15 Pro frame. Dark navy-black background with glassmorphic frosted cards. Top: portfolio value ($24,850.63) with green sparkline. Donut chart shows asset allocation (stocks, crypto, bonds). Scrollable asset list with mini performance charts. Bottom tab bar with 5 icons. Gradient purple-to-teal 'Quick Trade' pill button with subtle glow pulse. Inter + Space Grotesk typography. Pixel-perfect iOS 17 design.",
        image: cover("pm-39-stained-glass")
      },
      {
        input: "Design system: Atlas Cloud, Theme: dark mode with gold accents, Components: full reference sheet with colors, typography, buttons, inputs, cards",
        output: "A comprehensive design system sheet on dark #0F0F1A background with grid alignment. Horizontal sections: 10-step color palette with gold #C9A84C primary, typography scale from 48px Display to 12px Caption in Manrope/Fragment Mono, button system (Primary gold, Secondary outlined, Ghost, Danger, Icon-only) in 4 sizes with state progressions, input fields with gold focus rings, 4 card variants, 16 Lucide icon samples, and 4px-base spacing scale. All components labeled with CSS custom property tokens.",
        image: cover("pm-39-stained-glass")
      }
    ]
  },

  /* ═══════════════════════════════════════════════════
   * 40. MINIATURE & TILT-SHIFT WORLD
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Miniature & Tilt-Shift World", vi: "Thế Giới Thu Nhỏ & Tilt-Shift" },
    category: "design",
    tags: ["tilt-shift", "miniature", "diorama", "photography", "creative", "tiny-world"],
    priceSKT: 80,
    isFree: false,
    featured: false,
    sellerIdx: 8,
    description: {
      en: "Transform real-world scenes into magical miniature worlds with tilt-shift photography prompts — cityscapes, dioramas, and nature scenes that look toy-sized.",
      vi: "Biến cảnh thực thành thế giới thu nhỏ kỳ diệu với prompt tilt-shift — phong cảnh thành phố, diorama và thiên nhiên trông như mô hình đồ chơi.",
    },
    previewText: "Create enchanting tilt-shift miniature worlds — bustling cityscapes, detailed dioramas, and nature scenes transformed into magical toy-like photographs.",
    coverImage: cover("pm-40-tilt-shift"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Tilt-Shift Cityscape",
        content: "A tilt-shift photograph of a {{city_scene}} viewed from {{vantage_point}}, making the real city appear as a miniature model. The tilt-shift lens creates a razor-thin band of focus at {{focus_band}} with everything above and below dissolving into creamy blur. The scene includes {{city_elements}} — all appearing toy-sized. People are {{people_description}} looking like tiny figurines. Vehicles: {{vehicles}} resembling die-cast models. Time of day: {{time}} with {{lighting_conditions}}. Color saturation: {{saturation}} — boosted to enhance the miniature illusion. The blur gradient is {{blur_gradient}}. Post-processing: {{post_processing}} to further sell the miniature effect. The image triggers a delightful cognitive dissonance — the brain insists it's a model, but details reveal it's real. 8K, professional tilt-shift photography.",
        description: "Transform a real cityscape into a convincing miniature model using tilt-shift photography techniques.",
        variables: [
          { name: "city_scene", description: "City scene to capture", defaultValue: "a bustling downtown intersection during rush hour" },
          { name: "vantage_point", description: "Camera position", defaultValue: "a rooftop 20 stories above, looking down at 60 degrees" },
          { name: "focus_band", description: "In-focus zone", defaultValue: "the center intersection and one block in each direction" },
          { name: "city_elements", description: "Key scene elements", defaultValue: "skyscrapers, a public park with trees, crosswalks with pedestrians, and a construction crane" },
          { name: "people_description", description: "People in scene", defaultValue: "tiny dots of color moving in organized patterns across crosswalks" },
          { name: "vehicles", description: "Vehicles visible", defaultValue: "yellow taxis, delivery trucks, and buses in neat lines, some mid-turn" },
          { name: "time", description: "Time of day", defaultValue: "late afternoon golden hour" },
          { name: "lighting_conditions", description: "Light quality", defaultValue: "warm directional sunlight casting long shadows that enhance the 3D model illusion" },
          { name: "saturation", description: "Color saturation level", defaultValue: "120% — slightly oversaturated to mimic model paint" },
          { name: "blur_gradient", description: "Blur falloff", defaultValue: "smooth gaussian with a narrow 15% sharp zone in the center third" },
          { name: "post_processing", description: "Post-processing", defaultValue: "increased contrast, boosted vibrance, and subtle vignette" },
        ],
      },
      {
        title: "Miniature Diorama",
        content: "A hyperrealistic miniature diorama photograph of a {{diorama_scene}} that appears to be a handcrafted scale model at {{scale}} scale, but is actually an AI-generated scene with tilt-shift and miniaturization effects. The diorama sits on a {{base_type}} and features: {{scene_elements}}. Tiny figures: {{figurines}} posed in {{figurine_action}}. Materials look like {{material_illusion}} — painted plastic, static grass, balsa wood, and cotton wool clouds. Lighting: {{diorama_lighting}} creating the telltale harsh shadows of a small-scale model lit by a large light source. Focus: {{focus_treatment}}. The edges of the diorama show {{edge_treatment}} — confirming the model illusion. Background: {{diorama_bg}}. A sense of {{emotion}} pervades the scene. 8K, miniature diorama photography, tilt-shift effect.",
        description: "Create a hyperrealistic miniature diorama that appears to be a handcrafted physical scale model.",
        variables: [
          { name: "diorama_scene", description: "Scene subject", defaultValue: "a charming European village on a hillside" },
          { name: "scale", description: "Model scale", defaultValue: "1:87 (HO scale)" },
          { name: "base_type", description: "Diorama base", defaultValue: "an oval wooden display board with beveled edges" },
          { name: "scene_elements", description: "Key scene elements", defaultValue: "half-timbered houses, a stone church with bell tower, cobblestone streets, a market square with stalls, and a small river with a stone bridge" },
          { name: "figurines", description: "Miniature people", defaultValue: "approximately 30 tiny painted figures" },
          { name: "figurine_action", description: "What figures are doing", defaultValue: "shopping at market stalls, walking dogs, sitting at cafe tables, a child chasing a ball" },
          { name: "material_illusion", description: "Model materials visible", defaultValue: "realistic but with subtle tells — slightly glossy roof tiles, static grass clumps, hand-painted window details" },
          { name: "diorama_lighting", description: "Lighting setup", defaultValue: "single overhead daylight-balanced light at 45 degrees" },
          { name: "focus_treatment", description: "Focus/depth of field", defaultValue: "shallow depth of field with the market square sharp and edges soft" },
          { name: "edge_treatment", description: "Diorama edges", defaultValue: "visible terrain edge showing cross-section layers of foam, plaster, and paint" },
          { name: "diorama_bg", description: "Background behind diorama", defaultValue: "simple dark studio background with soft gradient" },
          { name: "emotion", description: "Emotional quality", defaultValue: "nostalgic warmth, like peering into a snow globe without the snow" },
        ],
      },
      {
        title: "Tilt-Shift Nature",
        content: "A tilt-shift photograph of a {{nature_scene}}, transforming the vast natural landscape into what appears to be a miniature model or train-set terrain. Viewed from {{nature_vantage}} looking {{view_direction}}. The tilt-shift effect places sharp focus on {{sharp_zone}} while {{blur_zones}} melt into soft bokeh. Natural elements: {{natural_elements}} — all appearing as miniature model scenery. Water features: {{water_detail}} with surface reflections appearing {{water_illusion}}. Vegetation: {{vegetation}} resembling model railroad static grass and miniature trees. Scale reference: {{scale_reference}} providing the cognitive trick that sells the miniature illusion. Time/season: {{season}} with {{atmospheric}}. Color: {{nature_color}} — pushed toward toy-like vibrancy. The photograph transforms the sublime into the adorable. 8K, creative tilt-shift nature photography.",
        description: "Transform vast natural landscapes into enchanting miniature worlds using tilt-shift effects.",
        variables: [
          { name: "nature_scene", description: "Natural landscape", defaultValue: "a winding river valley with forests and meadows" },
          { name: "nature_vantage", description: "Camera position", defaultValue: "a cliff overlook 500 meters above the valley floor" },
          { name: "view_direction", description: "View direction", defaultValue: "down at approximately 70 degrees" },
          { name: "sharp_zone", description: "Focus zone", defaultValue: "a horizontal band across the river bend and adjacent meadow" },
          { name: "blur_zones", description: "Blurred areas", defaultValue: "the foreground cliff edge and distant mountains" },
          { name: "natural_elements", description: "Key nature elements", defaultValue: "dense pine forests, open alpine meadows, exposed rock faces, and a small wooden cabin" },
          { name: "water_detail", description: "Water features", defaultValue: "the river with white rapids over rocks and a calm turquoise pool" },
          { name: "water_illusion", description: "Water miniature effect", defaultValue: "like poured resin on a model — too smooth and saturated to be real at this scale" },
          { name: "vegetation", description: "Vegetation details", defaultValue: "pine forests that look like clumps of lichen, meadow grass like green felt" },
          { name: "scale_reference", description: "Scale trick element", defaultValue: "a tiny red hiking trail marker and a wooden footbridge that appear to be model accessories" },
          { name: "season", description: "Season and time", defaultValue: "early autumn with the first golden leaves" },
          { name: "atmospheric", description: "Atmospheric conditions", defaultValue: "a thin layer of morning mist in the valley, creating depth layers" },
          { name: "nature_color", description: "Color treatment", defaultValue: "enhanced saturation — emerald greens, sapphire water, golden meadows" },
        ],
      },
    ],
    examples: [
      {
        input: "Tilt-shift cityscape of busy intersection from rooftop, golden hour, toy-like cars and people",
        output: "Tilt-shift photograph of a bustling downtown intersection from 20 stories above. Razor-thin focus band on the center intersection, creamy blur above and below. Yellow taxis and buses like die-cast models, pedestrians like painted figurines. Golden hour with long shadows, 120% saturation mimicking model paint. 8K professional tilt-shift photography.",
        image: cover("pm-40-tilt-shift"),
      },
      {
        input: "Miniature European village diorama with market square, stone church, and tiny painted figures",
        output: "Hyperrealistic miniature diorama of a charming European hillside village at 1:87 scale. Half-timbered houses, stone church, cobblestone market square with 30 tiny painted figures shopping and walking dogs. Static grass, glossy roof tiles, hand-painted details. Oval wooden base with visible terrain cross-section. 8K diorama photography.",
        image: cover("pm-40-tilt-shift"),
      },
    ],
  }

];

/* ═══════════════════════════════════════════════════
 * REVIEW TEMPLATES — visual/creative focused
 * ═══════════════════════════════════════════════════ */
const REVIEW_TEMPLATES = [
  { rating: 5, comment: "The image quality from these prompts is insane. Every output looks like a real photoshoot." },
  { rating: 5, comment: "Variables make it so easy to customize. Changed the product and got equally stunning results." },
  { rating: 4, comment: "Great prompts overall. Some lighting setups work better with Flux than Midjourney." },
  { rating: 5, comment: "Best visual prompt pack I've purchased. The camera and lens references really make a difference." },
  { rating: 4, comment: "Solid quality. Would love to see more aspect ratio variations in future updates." },
  { rating: 5, comment: "These prompts produce outputs I can actually use in client presentations. Worth every SKT." },
  { rating: 3, comment: "Good starting point but I had to tweak the lighting descriptions for my specific use case." },
  { rating: 5, comment: "The attention to detail is next level. Mentioning specific photographers and lenses elevates everything." },
  { rating: 4, comment: "Very professional results. The examples match what you actually get — no bait and switch." },
  { rating: 5, comment: "Saved me hours of prompt engineering. These are clearly made by someone who knows photography." },
  { rating: 5, comment: "Tuyệt vời! Chất lượng hình ảnh tạo ra từ prompt này rất chuyên nghiệp." },
  { rating: 4, comment: "Good value for the price. The multi-model compatibility is a nice touch." },
  { rating: 5, comment: "I've bought many prompt packs — this one actually delivers on the preview images." },
  { rating: 4, comment: "Quality prompts with smart variable design. The examples are really helpful for understanding." },
  { rating: 5, comment: "This changed my entire content creation workflow. Generating visuals 10x faster now." },
  { rating: 5, comment: "Professional grade. Can tell these were crafted by a real photographer, not just GPT output." },
  { rating: 4, comment: "Great results with Imagen and Flux. Haven't tested with SD yet but the prompts look solid." },
  { rating: 5, comment: "Finally, AI prompts that produce portfolio-worthy images. Using these for client work daily." },
  { rating: 3, comment: "Decent prompts but some compositions are too complex for current AI models to render perfectly." },
  { rating: 5, comment: "The free ones are just as good as paid — this seller clearly cares about the community." },
];

export interface ClearPromptMarketSeedOptions {
  dryRun?: boolean;
  includeTransactions?: boolean;
}

export interface ClearPromptMarketSeedResult {
  dryRun: boolean;
  seedUsers: number;
  promptSets: number;
  purchases: number;
  reviews: number;
  wishlists: number;
  followers: number;
  transactions: number;
}

export async function clearPromptMarketSeedData(
  options: ClearPromptMarketSeedOptions = {}
): Promise<ClearPromptMarketSeedResult> {
  const dryRun = options.dryRun === true;
  const includeTransactions = options.includeTransactions !== false;

  const oldSeedUsers = await User.find({ type: "seed" }).select("_id");
  const oldIds = oldSeedUsers.map((u) => u._id);
  const oldPromptSets = oldIds.length
    ? await PromptSet.find({ sellerId: { $in: oldIds } }).select("_id")
    : [];
  const oldPsIds = oldPromptSets.map((p) => p._id);

  const [
    promptSets,
    purchases,
    reviews,
    wishlists,
    followers,
    transactions,
  ] = await Promise.all([
    oldPsIds.length ? PromptSet.countDocuments({ _id: { $in: oldPsIds } }) : 0,
    oldPsIds.length || oldIds.length
      ? PromptPurchase.countDocuments({
          $or: [
            { promptSetId: { $in: oldPsIds } },
            { sellerId: { $in: oldIds } },
            { buyerId: { $in: oldIds } },
          ],
        })
      : 0,
    oldPsIds.length || oldIds.length
      ? PromptReview.countDocuments({
          $or: [
            { promptSetId: { $in: oldPsIds } },
            { buyerId: { $in: oldIds } },
          ],
        })
      : 0,
    oldPsIds.length || oldIds.length
      ? PromptWishlist.countDocuments({
          $or: [
            { promptSetId: { $in: oldPsIds } },
            { userId: { $in: oldIds } },
          ],
        })
      : 0,
    oldIds.length
      ? SellerFollower.countDocuments({
          $or: [{ sellerId: { $in: oldIds } }, { followerId: { $in: oldIds } }],
        })
      : 0,
    includeTransactions && (oldPsIds.length || oldIds.length)
      ? SkyTokenTransaction.countDocuments({
          $or: [
            { userId: { $in: oldIds } },
            { "meta.promptSetId": { $in: oldPsIds } },
          ],
        })
      : 0,
  ]);

  const result: ClearPromptMarketSeedResult = {
    dryRun,
    seedUsers: oldIds.length,
    promptSets,
    purchases,
    reviews,
    wishlists,
    followers,
    transactions,
  };

  if (dryRun) return result;

  if (oldIds.length || oldPsIds.length) {
    await Promise.all([
      PromptPurchase.deleteMany({
        $or: [
          { promptSetId: { $in: oldPsIds } },
          { sellerId: { $in: oldIds } },
          { buyerId: { $in: oldIds } },
        ],
      }),
      PromptReview.deleteMany({
        $or: [
          { promptSetId: { $in: oldPsIds } },
          { buyerId: { $in: oldIds } },
        ],
      }),
      PromptWishlist.deleteMany({
        $or: [
          { promptSetId: { $in: oldPsIds } },
          { userId: { $in: oldIds } },
        ],
      }),
      SellerFollower.deleteMany({
        $or: [{ sellerId: { $in: oldIds } }, { followerId: { $in: oldIds } }],
      }),
      includeTransactions
        ? SkyTokenTransaction.deleteMany({
            $or: [
              { userId: { $in: oldIds } },
              { "meta.promptSetId": { $in: oldPsIds } },
            ],
          })
        : Promise.resolve(),
    ]);

    await PromptSet.deleteMany({ _id: { $in: oldPsIds } });
    await User.deleteMany({ _id: { $in: oldIds }, type: "seed" });
  }

  return result;
}

/* ═══════════════════════════════════════════════════
 * MAIN SEED FUNCTION
 * ═══════════════════════════════════════════════════ */
export async function seedPromptMarket(): Promise<{
  users: number;
  promptSets: number;
  reviews: number;
  wishlists: number;
  followers: number;
  covers: number;
  examples: number;
  videos: number;
}> {
  // ── Clean previous seed data ──
  const cleared = await clearPromptMarketSeedData();
  console.log("Cleaned previous seed data (v3/v4 + any prior seed users)", cleared);

  // ── Create seed users ──
  const createdUsers = await User.insertMany(
    SEED_USERS.map((u) => ({
      email: u.email,
      name: u.name,
      firstName: u.name.split(" ")[0],
      lastName: u.name.split(" ").slice(1).join(" "),
      avatar: u.avatar,
      specialty: u.specialty,
      bio: u.bio,
      verified: u.verified,
      socialLinks: u.socialLinks || {},
      type: "seed" as const,
      role: "user" as const,
      inviteCode: `SEED-${code()}`,
      skyTokenBalance: rand(500, 5000),
      creditBalance: rand(100, 1000),
      experienceYears: rand(2, 10),
    }))
  );
  console.log(`Created ${createdUsers.length} seed users`);

  // ── Create prompt sets ──
  const promptSets = [];
  for (const p of PROMPTS) {
    const seller = createdUsers[p.sellerIdx];
    const s = slugify(p.title.en) + "-" + code();
    promptSets.push({
      sellerId: seller._id,
      slug: s,
      title: { en: p.title.en, vi: p.title.vi, ko: "", ja: "" },
      description: { en: p.description.en, vi: p.description.vi, ko: "", ja: "" },
      category: p.category,
      tags: p.tags,
      coverImage: p.coverImage,
      priceSKT: p.isFree ? 0 : p.priceSKT,
      isFree: p.isFree || false,
      featured: p.featured || false,
      previewText: p.previewText,
      prompts: p.prompts.map((pr) => ({
        title: pr.title,
        content: pr.content,
        description: pr.description,
        variables: pr.variables || [],
      })),
      status: "active",
      isActive: true,
      purchaseCount: rand(15, 800),
      promptCount: p.prompts.length,
      totalEarned: 0,
      sortOrder: 0,
      averageRating: 0,
      reviewCount: 0,
      viewCount: rand(200, 15000),
      wishlistCount: rand(8, 200),
      models: p.models,
      examples: p.examples,
    });
  }

  const createdPromptSets = await PromptSet.insertMany(promptSets);
  console.log(`Created ${createdPromptSets.length} prompt sets`);

  // ── Create reviews ──
  let reviewCount = 0;
  for (const ps of createdPromptSets) {
    if (Math.random() > 0.8) continue; // 80% chance of having reviews

    const numReviews = rand(4, 10);
    const reviewers = createdUsers
      .filter((u) => String(u._id) !== String(ps.sellerId))
      .sort(() => Math.random() - 0.5)
      .slice(0, numReviews);

    const reviews = reviewers.map((reviewer) => {
      const template = pick(REVIEW_TEMPLATES);
      return {
        buyerId: reviewer._id,
        promptSetId: ps._id,
        rating: template.rating,
        comment: template.comment,
      };
    });

    await PromptReview.insertMany(reviews);
    reviewCount += reviews.length;

    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await PromptSet.updateOne(
      { _id: ps._id },
      { averageRating: Math.round(avg * 10) / 10, reviewCount: reviews.length }
    );
  }
  console.log(`Created ${reviewCount} reviews`);

  // ── Create wishlists ──
  let wishlistCount = 0;
  for (const ps of createdPromptSets) {
    const numWishlisters = rand(0, 6);
    const wishlisters = createdUsers
      .filter((u) => String(u._id) !== String(ps.sellerId))
      .sort(() => Math.random() - 0.5)
      .slice(0, numWishlisters);

    if (wishlisters.length) {
      await PromptWishlist.insertMany(
        wishlisters.map((w) => ({ userId: w._id, promptSetId: ps._id }))
      );
      wishlistCount += wishlisters.length;
    }
  }
  console.log(`Created ${wishlistCount} wishlist entries`);

  // ── Create seller followers ──
  let followerCount = 0;
  for (const seller of createdUsers) {
    const numFollowers = rand(2, 8);
    const followers = createdUsers
      .filter((u) => String(u._id) !== String(seller._id))
      .sort(() => Math.random() - 0.5)
      .slice(0, numFollowers);

    if (followers.length) {
      await SellerFollower.insertMany(
        followers.map((f) => ({ sellerId: seller._id, followerId: f._id }))
      );
      followerCount += followers.length;
    }
  }
  console.log(`Created ${followerCount} follower relationships`);

  // ── Update totalEarned ──
  for (const ps of createdPromptSets) {
    const doc = await PromptSet.findById(ps._id);
    if (doc && !doc.isFree) {
      doc.totalEarned = doc.purchaseCount * doc.priceSKT * 0.9;
      await doc.save();
    }
  }

  // ── Summary ──
  const result = {
    users: createdUsers.length,
    promptSets: createdPromptSets.length,
    reviews: reviewCount,
    wishlists: wishlistCount,
    followers: followerCount,
    covers: Object.keys(coverUrls).length,
    examples: Object.keys(exampleUrls).length,
    videos: Object.keys(videoUrls).length,
  };

  console.log("\n Seed v4 complete!", result);
  return result;
}

/* ─── CLI entry point ─── */
if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to MongoDB");
    const result = await seedPromptMarket();
    console.log(result);
    process.exit(0);
  })().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
}
