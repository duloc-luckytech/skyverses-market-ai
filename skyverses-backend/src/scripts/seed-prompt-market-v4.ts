import "dotenv/config";
import mongoose from "mongoose";
import * as crypto from "crypto";
import * as fs from "fs";
import User from "../models/UserModel";
import PromptSet from "../models/PromptSet.model";
import PromptReview from "../models/PromptReview.model";
import PromptWishlist from "../models/PromptWishlist.model";
import SellerFollower from "../models/SellerFollower.model";

/* ─── helpers ─── */
const slugify = (t: string) =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "d")
    .replace(/[^a-zA-Z0-9\s]/g, " ").replace(/\s+/g, "-").trim().toLowerCase();

const code = () => crypto.randomBytes(4).toString("hex");
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/* ─── Load generated image URLs ─── */
function loadUrlMap(path: string): Record<string, string> {
  const map: Record<string, string> = {};
  if (!fs.existsSync(path)) {
    console.warn(`⚠️  File not found: ${path} — using placeholder URLs`);
    return map;
  }
  const lines = fs.readFileSync(path, "utf-8").trim().split("\n");
  for (const line of lines) {
    const [name, url] = line.split("|");
    if (name && url && url !== "FAILED") map[name] = url;
  }
  return map;
}

const PLACEHOLDER = "https://placehold.co/800x450/1a1a2e/7036F0?text=Generating...";
const coverUrls = {
  ...loadUrlMap("/tmp/pm_showcase_covers.txt"),
  ...loadUrlMap("/tmp/pm_v4extra_covers.txt"),
};
const exampleUrls = {
  ...loadUrlMap("/tmp/pm_showcase_examples.txt"),
  ...loadUrlMap("/tmp/pm_v4extra_examples.txt"),
};
const videoUrls = loadUrlMap("/tmp/pm_v4extra_videos.txt");

const cover = (name: string) => coverUrls[name] || PLACEHOLDER;
const example = (name: string) => exampleUrls[name] || PLACEHOLDER;
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
   * 08. LUXURY JEWELRY & ACCESSORIES
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Luxury Jewelry Campaign Photography", vi: "Nhiếp ảnh chiến dịch trang sức cao cấp" },
    category: "design",
    tags: ["jewelry", "luxury", "diamond", "campaign", "accessories"],
    priceSKT: 100,
    sellerIdx: 0,
    description: {
      en: "Create Harry Winston and Cartier-quality jewelry campaign photography with extreme close-ups, dramatic chiaroscuro lighting, and precious stone brilliance.",
      vi: "Tạo ảnh chiến dịch trang sức chất lượng Harry Winston và Cartier với close-up cực gần, ánh sáng chiaroscuro, và ánh sáng đá quý."
    },
    previewText: "High-end jewelry campaign photograph, {{model_detail}} adorned with {{jewelry}}, {{lighting}}...",
    coverImage: cover("pm-08-jewelry"),
    models: ["flux", "midjourney"],
    prompts: [
      {
        title: "Jewelry Campaign Close-Up",
        content: "High-end jewelry campaign photograph, {{model_detail}} adorned with {{jewelry}}, each stone catching light with brilliant fire and scintillation, extreme close-up showing skin texture and {{metal}} craftsmanship, dark moody background with {{lighting}}, {{atmosphere}}, luxury advertising quality similar to {{brand}} campaigns, shot on {{camera}}, no text",
        description: "Extreme close-up jewelry campaign shot",
        variables: [
          { name: "model_detail", description: "Model detail", defaultValue: "a model's neck" },
          { name: "jewelry", description: "Jewelry piece", defaultValue: "a statement diamond and emerald necklace" },
          { name: "metal", description: "Metal type", defaultValue: "platinum" },
          { name: "lighting", description: "Lighting", defaultValue: "a single warm spotlight creating dramatic chiaroscuro" },
          { name: "atmosphere", description: "Atmosphere", defaultValue: "water droplets on the collarbone adding freshness" },
          { name: "brand", description: "Brand reference", defaultValue: "Cartier or Harry Winston" },
          { name: "camera", description: "Camera", defaultValue: "Phase One" },
        ],
      },
    ],
    examples: [
      { input: "Diamond and emerald necklace close-up, Cartier campaign style", output: "Luxury jewelry campaign with brilliant stone fire, platinum craftsmanship detail, and dramatic chiaroscuro on Phase One.", image: cover("pm-08-jewelry") },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 09. SOCIAL MEDIA VISUAL CONTENT
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Social Media Visual Content Creator", vi: "Tạo nội dung hình ảnh Social Media" },
    category: "marketing",
    tags: ["social-media", "instagram", "content-creation", "flat-lay", "lifestyle"],
    priceSKT: 65,
    sellerIdx: 1,
    description: {
      en: "Generate scroll-stopping social media visuals. Creative workspaces, lifestyle flat lays, and content creator setups with natural lighting and trendy aesthetics.",
      vi: "Tạo hình ảnh social media hấp dẫn. Workspace sáng tạo, flat lay lifestyle, và setup content creator với ánh sáng tự nhiên."
    },
    previewText: "A creative flat lay arrangement of {{workspace_type}}, featuring {{devices}}, {{props}}...",
    coverImage: cover("pm-09-social-media"),
    models: ["flux", "midjourney", "dall-e-3"],
    prompts: [
      {
        title: "Content Creator Workspace",
        content: "A creative flat lay arrangement of {{workspace_type}}, featuring {{devices}}, {{creative_tools}}, {{beverages}}, {{plants}}, and {{accessories}}, all arranged on {{surface}} with {{lighting}}, overhead shot, {{aesthetic}} aesthetic, no text on items",
        description: "Lifestyle workspace flat lay for social media",
        variables: [
          { name: "workspace_type", description: "Workspace type", defaultValue: "a social media content creation workspace" },
          { name: "devices", description: "Devices", defaultValue: "an iPhone 16 Pro showing a vibrant Instagram feed, a MacBook Air with a Canva design open" },
          { name: "creative_tools", description: "Creative tools", defaultValue: "scattered Pantone color swatches, colorful sticky notes with content ideas" },
          { name: "beverages", description: "Beverages", defaultValue: "a cold brew coffee in a glass" },
          { name: "plants", description: "Plants/greenery", defaultValue: "a small potted succulent" },
          { name: "accessories", description: "Accessories", defaultValue: "wireless earbuds, trendy sunglasses" },
          { name: "surface", description: "Surface", defaultValue: "a clean white marble surface" },
          { name: "lighting", description: "Lighting", defaultValue: "natural window light" },
          { name: "aesthetic", description: "Aesthetic", defaultValue: "lifestyle blogger" },
        ],
      },
    ],
    examples: [
      { input: "Content creator workspace flat lay on white marble", output: "Overhead lifestyle shot with iPhone, MacBook, Pantone swatches, cold brew, and natural window lighting.", image: cover("pm-09-social-media") },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 10. PRINT-ON-DEMAND ARTWORK
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Print-on-Demand Design Generator", vi: "Bộ tạo thiết kế Print-on-Demand" },
    category: "design",
    tags: ["pod", "t-shirt", "print-design", "streetwear", "merch"],
    priceSKT: 75,
    sellerIdx: 6,
    description: {
      en: "Create trending print-on-demand designs. Bold graphic tees, retro aesthetics, botanical illustrations, and geometric animal art on product mockups.",
      vi: "Tạo thiết kế print-on-demand trending. Áo thun đồ họa bold, retro, illustration thực vật, và nghệ thuật động vật hình học trên mockup sản phẩm."
    },
    previewText: "A trendy print-on-demand mockup display showing {{garment_count}} {{garments}} with {{designs}}...",
    coverImage: cover("pm-10-pod-designs"),
    models: ["flux", "midjourney", "dall-e-3"],
    prompts: [
      {
        title: "T-Shirt Mockup Collection",
        content: "A trendy print-on-demand mockup display showing {{garment_count}} {{garments}} on {{display_method}} against {{background}}, each featuring a different bold graphic design — {{design1}}, {{design2}}, and {{design3}} — {{lighting}}, {{brand_quality}} quality, no text on wall",
        description: "Product mockup with multiple design variations",
        variables: [
          { name: "garment_count", description: "Number of garments", defaultValue: "three" },
          { name: "garments", description: "Garment type", defaultValue: "black t-shirts" },
          { name: "display_method", description: "Display method", defaultValue: "hanging on wooden hangers" },
          { name: "background", description: "Background", defaultValue: "a raw concrete wall" },
          { name: "design1", description: "Design 1", defaultValue: "a retro sunset with palm silhouettes and vaporwave colors" },
          { name: "design2", description: "Design 2", defaultValue: "a detailed botanical illustration of wildflowers in fine line art" },
          { name: "design3", description: "Design 3", defaultValue: "a fierce geometric wolf head in gradient purple and teal" },
          { name: "lighting", description: "Lighting", defaultValue: "soft natural light from the left" },
          { name: "brand_quality", description: "Quality reference", defaultValue: "streetwear brand lookbook" },
        ],
      },
    ],
    examples: [
      { input: "3 black tees on hangers with retro, botanical, and geometric wolf designs", output: "Streetwear mockup with vaporwave sunset, wildflower line art, and gradient wolf graphics on concrete wall.", image: cover("pm-10-pod-designs") },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 11. AD CREATIVE TEMPLATES
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Digital Ad Creative Generator", vi: "Bộ tạo Creative quảng cáo số" },
    category: "marketing",
    tags: ["advertising", "digital-ads", "facebook", "instagram", "creative"],
    priceSKT: 90,
    sellerIdx: 1,
    description: {
      en: "Generate premium digital advertising creatives. Facebook carousels, Instagram Story ads, and Google Display banners with product staging and typography.",
      vi: "Tạo creative quảng cáo số cao cấp. Facebook carousel, Instagram Story ads, và Google Display banner với sản phẩm và typography."
    },
    previewText: "Premium digital advertising creative mockups displayed on floating glass screens...",
    coverImage: cover("pm-11-ad-creative"),
    models: ["flux", "midjourney", "dall-e-3"],
    prompts: [
      {
        title: "Multi-Format Ad Display",
        content: "{{count}} premium digital advertising creative mockups displayed on floating glass screens against a dark gradient background, each showing a different ad format — {{format1}}, {{format2}}, and {{format3}} — soft neon glow behind each screen, {{quality}} quality, no text outside ads",
        description: "Multi-format ad creative mockup display",
        variables: [
          { name: "count", description: "Number of formats", defaultValue: "Three" },
          { name: "format1", description: "Format 1", defaultValue: "a Facebook carousel ad with luxury skincare products on marble" },
          { name: "format2", description: "Format 2", defaultValue: "an Instagram Story ad with a fitness model in dynamic pose with bold typography overlay" },
          { name: "format3", description: "Format 3", defaultValue: "a Google Display banner with a sleek tech product on gradient" },
          { name: "quality", description: "Quality reference", defaultValue: "digital marketing agency portfolio presentation" },
        ],
      },
    ],
    examples: [
      { input: "3 ad creatives on floating glass screens: carousel, Story, banner", output: "Premium ad mockup display with skincare carousel, fitness Story ad, and tech banner on dark gradient with neon glow.", image: cover("pm-11-ad-creative") },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 12. PREMIUM PACKAGING DESIGN
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Premium Packaging Design Showcase", vi: "Trưng bày thiết kế bao bì cao cấp" },
    category: "design",
    tags: ["packaging", "cosmetics", "luxury", "perfume", "beauty"],
    priceSKT: 95,
    sellerIdx: 6,
    description: {
      en: "Create luxury packaging design photography. Perfume bottles, cosmetic sets, and premium beauty products with studio lighting and floral staging.",
      vi: "Tạo ảnh thiết kế bao bì luxury. Chai nước hoa, bộ mỹ phẩm, và sản phẩm beauty cao cấp với ánh sáng studio và hoa."
    },
    previewText: "Luxury {{product_type}} packaging design showcase, {{bottles}} with {{caps}}...",
    coverImage: cover("pm-12-packaging"),
    models: ["flux", "midjourney", "dall-e-3"],
    prompts: [
      {
        title: "Luxury Beauty Packaging",
        content: "Luxury {{product_type}} packaging design showcase, {{bottles}} with {{caps}}, arranged on {{display}}, surrounded by {{florals}}, dramatic studio lighting with {{lighting_detail}}, {{background}}, premium beauty brand campaign photography, {{brand_aesthetic}} aesthetic, no text",
        description: "Luxury packaging photography with floral staging",
        variables: [
          { name: "product_type", description: "Product type", defaultValue: "cosmetics" },
          { name: "bottles", description: "Bottles/containers", defaultValue: "three elegant perfume bottles in rose gold and frosted glass" },
          { name: "caps", description: "Cap details", defaultValue: "sculptural geometric caps" },
          { name: "display", description: "Display", defaultValue: "a stepped marble display pedestal" },
          { name: "florals", description: "Floral elements", defaultValue: "fresh white peonies and scattered rose petals" },
          { name: "lighting_detail", description: "Lighting detail", defaultValue: "rim light highlighting the bottle silhouettes" },
          { name: "background", description: "Background", defaultValue: "soft bokeh background in blush pink" },
          { name: "brand_aesthetic", description: "Brand reference", defaultValue: "Chanel and Tom Ford" },
        ],
      },
    ],
    examples: [
      { input: "Rose gold perfume bottles on marble pedestal with peonies", output: "Luxury cosmetics packaging with sculptural caps, rim lighting, and Chanel × Tom Ford aesthetic.", image: cover("pm-12-packaging") },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 13. REAL ESTATE PHOTOGRAPHY
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Luxury Real Estate Photography", vi: "Nhiếp ảnh bất động sản cao cấp" },
    category: "business",
    tags: ["real-estate", "property", "twilight", "luxury-home", "listing"],
    priceSKT: 80,
    sellerIdx: 4,
    description: {
      en: "Generate Sotheby's-quality real estate photography. Twilight exteriors, luxury interiors, and Mediterranean villas with professional architectural lighting.",
      vi: "Tạo ảnh bất động sản chất lượng Sotheby's. Ngoại thất hoàng hôn, nội thất luxury, và biệt thự Mediterranean."
    },
    previewText: "Stunning luxury real estate {{time}} exterior photograph, {{building}} with {{facade}}...",
    coverImage: cover("pm-13-real-estate"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Twilight Exterior",
        content: "Stunning luxury real estate {{time}} exterior photograph, {{building}} with {{facade}}, illuminated by warm interior lighting visible through {{windows}}, {{pool_feature}} reflecting the {{sky}}, {{landscaping}}, {{outdoor_elements}}, {{listing_quality}} listing quality, architectural {{photography_type}} photography, no text",
        description: "Twilight luxury property exterior",
        variables: [
          { name: "time", description: "Time", defaultValue: "twilight" },
          { name: "building", description: "Building", defaultValue: "a modern Mediterranean villa" },
          { name: "facade", description: "Facade", defaultValue: "warm honey stone walls and terracotta roof tiles" },
          { name: "windows", description: "Windows", defaultValue: "arched windows" },
          { name: "pool_feature", description: "Pool/water", defaultValue: "an azure infinity pool in the foreground" },
          { name: "sky", description: "Sky", defaultValue: "deep blue dusk sky" },
          { name: "landscaping", description: "Landscaping", defaultValue: "mature olive trees and lavender hedges in the manicured garden" },
          { name: "outdoor_elements", description: "Outdoor elements", defaultValue: "string lights creating a romantic atmosphere on the covered terrace" },
          { name: "listing_quality", description: "Listing quality", defaultValue: "Sotheby's International Realty" },
          { name: "photography_type", description: "Photography type", defaultValue: "twilight" },
        ],
      },
    ],
    examples: [
      { input: "Mediterranean villa at twilight with infinity pool and olive trees", output: "Sotheby's-quality listing photo with warm stone, terracotta roof, blue dusk sky, and string-light terrace.", image: cover("pm-13-real-estate") },
    ],
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
   * 15. FANTASY CONCEPT ART
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Epic Fantasy Concept Art Studio", vi: "Studio Concept Art Fantasy sử thi" },
    category: "other",
    tags: ["fantasy", "concept-art", "matte-painting", "world-building", "epic"],
    priceSKT: 110,
    sellerIdx: 7,
    description: {
      en: "Create epic fantasy concept art and matte paintings. Ancient tree cities, dragon lairs, and mythical landscapes with Craig Mullins-quality digital painting.",
      vi: "Tạo concept art fantasy sử thi và matte painting. Thành phố cây cổ đại, hang rồng, và phong cảnh thần thoại chất lượng Craig Mullins."
    },
    previewText: "Epic fantasy concept art, {{scene}} reaching above the clouds, {{structures}} with {{lighting}}...",
    coverImage: cover("pm-15-fantasy-art"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "World-Tree City",
        content: "Epic fantasy concept art, {{scene}}, {{structures}} with {{interior_lighting}}, {{connections}}, {{water_feature}}, {{flora}}, {{creature}} at {{time}}, matte painting quality by {{artist}}, no text",
        description: "Epic fantasy world-tree city matte painting",
        variables: [
          { name: "scene", description: "Main scene", defaultValue: "a massive ancient tree city built into the trunk and branches of a world-tree reaching above the clouds" },
          { name: "structures", description: "Structures", defaultValue: "interconnected treehouse structures" },
          { name: "interior_lighting", description: "Interior lighting", defaultValue: "warm lantern light glowing from hundreds of windows" },
          { name: "connections", description: "Connections", defaultValue: "rope bridges and spiral staircases winding around the trunk" },
          { name: "water_feature", description: "Water feature", defaultValue: "waterfalls cascading from the upper branches into a misty valley below" },
          { name: "flora", description: "Flora", defaultValue: "bioluminescent moss and flowering vines covering the bark" },
          { name: "creature", description: "Creature", defaultValue: "a dragon silhouette soaring past the canopy" },
          { name: "time", description: "Time", defaultValue: "sunset" },
          { name: "artist", description: "Artist reference", defaultValue: "Craig Mullins" },
        ],
      },
    ],
    examples: [
      { input: "Ancient world-tree city with dragon at sunset", output: "Epic matte painting with treehouse structures, bioluminescent moss, cascading waterfalls, and Craig Mullins quality.", image: cover("pm-15-fantasy-art") },
    ],
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
   * 22. CHILDREN'S BOOK ILLUSTRATION
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Children's Book Illustration Studio", vi: "Studio minh họa sách thiếu nhi" },
    category: "other",
    tags: ["childrens-book", "illustration", "whimsical", "ghibli", "watercolor"],
    priceSKT: 85,
    sellerIdx: 5,
    description: {
      en: "Create enchanting children's book illustrations. Woodland libraries, forest animal characters, and cozy scenes in Beatrix Potter meets Studio Ghibli style.",
      vi: "Tạo minh họa sách thiếu nhi quyến rũ. Thư viện rừng, nhân vật động vật, và cảnh ấm cúng kiểu Beatrix Potter × Studio Ghibli."
    },
    previewText: "A whimsical children's book illustration of {{scene}}, {{characters}} sitting together on {{seating}}...",
    coverImage: cover("pm-22-childrens-book"),
    models: ["flux", "midjourney", "dall-e-3"],
    prompts: [
      {
        title: "Cozy Woodland Scene",
        content: "A whimsical children's book illustration of {{scene}}, {{characters}} sitting together on {{seating}} reading {{book}}, {{shelves}}, {{lighting}}, {{magical_element}} through the {{entrance}} where {{sky_detail}} is visible, {{art_style}} style, {{texture}}, no text",
        description: "Enchanting woodland children's book scene",
        variables: [
          { name: "scene", description: "Scene", defaultValue: "a cozy woodland library inside a giant hollow oak tree" },
          { name: "characters", description: "Characters", defaultValue: "tiny forest animals — a fox cub with round spectacles, a hedgehog in a knitted sweater, and a rabbit in overalls" },
          { name: "seating", description: "Seating", defaultValue: "mushroom stools" },
          { name: "book", description: "Book/activity", defaultValue: "a large storybook" },
          { name: "shelves", description: "Shelves/decor", defaultValue: "bookshelves carved into the tree walls filled with tiny leather-bound books" },
          { name: "lighting", description: "Lighting", defaultValue: "warm golden lantern light" },
          { name: "magical_element", description: "Magical element", defaultValue: "fireflies drifting" },
          { name: "entrance", description: "Entrance", defaultValue: "arched doorway" },
          { name: "sky_detail", description: "Sky detail", defaultValue: "a starry night sky" },
          { name: "art_style", description: "Art style", defaultValue: "Beatrix Potter meets Studio Ghibli" },
          { name: "texture", description: "Texture", defaultValue: "watercolor texture" },
        ],
      },
    ],
    examples: [
      { input: "Fox, hedgehog, and rabbit reading in hollow oak tree library", output: "Whimsical woodland library with mushroom stools, carved bookshelves, fireflies, and Beatrix Potter × Ghibli watercolor.", image: cover("pm-22-childrens-book") },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 23. PET & ANIMAL PORTRAITS
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Regal Pet & Animal Portrait Studio", vi: "Studio chân dung thú cưng & động vật hoàng gia" },
    category: "other",
    tags: ["pet-portrait", "animal", "renaissance", "studio", "dog-portrait"],
    priceSKT: 60,
    isFree: false,
    sellerIdx: 11,
    description: {
      en: "Create regal pet portraits in Renaissance style. Golden retrievers in velvet collars, cats as nobility, and pets reimagined as classical oil paintings.",
      vi: "Tạo chân dung thú cưng hoàng gia kiểu Renaissance. Golden retriever đeo cổ nhung, mèo quý tộc, và thú cưng như tranh sơn dầu cổ điển."
    },
    previewText: "A regal studio portrait of {{animal}} wearing {{attire}}, seated against {{backdrop}}...",
    coverImage: cover("pm-23-pet-portrait"),
    models: ["flux", "midjourney", "dall-e-3"],
    prompts: [
      {
        title: "Renaissance Pet Portrait",
        content: "A regal studio portrait of {{animal}} wearing {{attire}}, seated against {{backdrop}}, the {{animal_type}} looking {{expression}}, {{lighting}} highlighting the {{fur_detail}}, {{art_style}}, {{photographer}} meets classical portraiture, premium pet photography studio quality, no text",
        description: "Renaissance-style regal pet portrait",
        variables: [
          { name: "animal", description: "Animal", defaultValue: "a golden retriever" },
          { name: "animal_type", description: "Animal type", defaultValue: "dog" },
          { name: "attire", description: "Attire", defaultValue: "a Renaissance-era velvet collar with gold medallion" },
          { name: "backdrop", description: "Backdrop", defaultValue: "a painterly backdrop of deep burgundy and forest green" },
          { name: "expression", description: "Expression", defaultValue: "nobly to the side with warm brown eyes and a dignified expression" },
          { name: "lighting", description: "Lighting", defaultValue: "soft Rembrandt lighting" },
          { name: "fur_detail", description: "Fur detail", defaultValue: "golden fur texture" },
          { name: "art_style", description: "Art style", defaultValue: "oil painting meets photography hybrid style" },
          { name: "photographer", description: "Photographer reference", defaultValue: "William Wegman" },
        ],
      },
    ],
    examples: [
      { input: "Golden retriever in velvet collar, Renaissance oil painting style", output: "Regal pet portrait with burgundy backdrop, Rembrandt lighting, gold medallion collar, and classical oil painting quality.", image: cover("pm-23-pet-portrait") },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 24. VINTAGE & RETRO AESTHETIC
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Vintage & Retro Aesthetic Creator", vi: "Bộ tạo thẩm mỹ Vintage & Retro" },
    category: "design",
    tags: ["vintage", "retro", "70s", "film-grain", "nostalgia"],
    priceSKT: 70,
    sellerIdx: 8,
    description: {
      en: "Create nostalgic vintage photography with analog film grain, warm Kodak Portra tones, and 1970s California vibes. VW campers, vinyl records, and sunset beaches.",
      vi: "Tạo ảnh vintage hoài cổ với film grain analog, tông Kodak Portra ấm, và vibes California thập niên 70. VW camper, vinyl, và bãi biển hoàng hôn."
    },
    previewText: "A nostalgic {{era}} aesthetic photograph of {{vehicle}} in {{color_scheme}}, parked at {{location}}...",
    coverImage: cover("pm-24-vintage-retro"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Retro California Beach",
        content: "A nostalgic {{era}} aesthetic photograph of {{vehicle}} in {{color_scheme}}, parked at {{location}} at sunset, {{activity_props}}, {{people}}, {{sky}}, warm {{film_effects}}, shot on {{film_stock}} with {{lens}}, {{vibe}} vibes, no text",
        description: "Nostalgic retro lifestyle scene",
        variables: [
          { name: "era", description: "Era", defaultValue: "1970s" },
          { name: "vehicle", description: "Vehicle", defaultValue: "a vintage Volkswagen camper van" },
          { name: "color_scheme", description: "Color scheme", defaultValue: "two-tone orange and cream" },
          { name: "location", description: "Location", defaultValue: "a California beach" },
          { name: "activity_props", description: "Props/activities", defaultValue: "surfboards leaning against the side, a portable record player and vinyl records scattered around" },
          { name: "people", description: "People", defaultValue: "a young couple sitting on a plaid blanket" },
          { name: "sky", description: "Sky", defaultValue: "palm trees silhouetted against a gradient sky of coral pink and lavender" },
          { name: "film_effects", description: "Film effects", defaultValue: "analog film grain and light leaks" },
          { name: "film_stock", description: "Film stock", defaultValue: "Kodak Portra 400" },
          { name: "lens", description: "Lens", defaultValue: "a 50mm lens" },
          { name: "vibe", description: "Vibe", defaultValue: "retro Polaroid" },
        ],
      },
    ],
    examples: [
      { input: "1970s VW camper at California sunset with vinyl records", output: "Nostalgic retro scene with orange camper, surfboards, plaid blanket, Kodak Portra film grain, and coral sunset.", image: cover("pm-24-vintage-retro") },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 25. 3D PRODUCT MOCKUP RENDERS
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "3D Product Mockup & Render Studio", vi: "Studio Mockup & Render sản phẩm 3D" },
    category: "design",
    tags: ["3d-render", "product-mockup", "octane", "studio", "packaging"],
    priceSKT: 90,
    sellerIdx: 0,
    description: {
      en: "Generate Octane-quality 3D product renders. Floating earbuds, premium headphones, and tech devices with studio lighting and gradient backgrounds.",
      vi: "Tạo render sản phẩm 3D chất lượng Octane. Tai nghe không dây, headphone cao cấp, và thiết bị công nghệ với ánh sáng studio."
    },
    previewText: "A premium 3D product render of {{product}} in {{finish}}, {{display_detail}}...",
    coverImage: cover("pm-25-3d-mockup"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Premium Product Render",
        content: "A premium 3D product render of {{product}} in {{finish}} with {{material_detail}}, {{display_detail}}, floating at a slight angle against {{background}}, {{reflections}}, product shadow below, {{companion}} visible in the background slightly out of focus, {{brand_aesthetic}} product photography aesthetic, {{render_engine}} render, no text",
        description: "Premium 3D product render with studio lighting",
        variables: [
          { name: "product", description: "Product", defaultValue: "over-ear wireless headphones" },
          { name: "finish", description: "Finish", defaultValue: "brushed titanium finish" },
          { name: "material_detail", description: "Material detail", defaultValue: "cognac leather ear cushions and headband" },
          { name: "display_detail", description: "Display detail", defaultValue: "one ear cup rotated to show the driver detail and memory foam padding" },
          { name: "background", description: "Background", defaultValue: "a warm gradient background from cream to soft peach" },
          { name: "reflections", description: "Reflections", defaultValue: "subtle colored reflections on the metal surfaces" },
          { name: "companion", description: "Companion accessory", defaultValue: "companion leather carrying case" },
          { name: "brand_aesthetic", description: "Brand reference", defaultValue: "Bang & Olufsen" },
          { name: "render_engine", description: "Render engine", defaultValue: "Octane" },
        ],
      },
    ],
    examples: [
      { input: "Titanium headphones with cognac leather, B&O style", output: "Premium 3D render with brushed titanium, memory foam detail, cream gradient background, and Octane quality.", image: cover("pm-25-3d-mockup") },
      { input: "Premium wireless headphone render with leather case", output: "Bang & Olufsen-style product render with cognac leather, rotated ear cup detail, and peach gradient.", image: example("ex-15-headphone-render") },
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
   * 27. CYBERPUNK & NEON NOIR SCENES
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Cyberpunk & Neon Noir Scene Creator", vi: "Bộ tạo cảnh Cyberpunk & Neon Noir" },
    category: "design",
    tags: ["cyberpunk", "neon", "sci-fi", "blade-runner", "dystopian"],
    priceSKT: 95,
    featured: true,
    sellerIdx: 8,
    description: {
      en: "Generate stunning cyberpunk cityscapes and neon-drenched noir scenes. Rain-soaked streets, holographic ads, and Blade Runner-inspired dystopian atmospheres with cinematic video output.",
      vi: "Tạo cảnh thành phố cyberpunk và noir neon tuyệt đẹp. Đường phố mưa ướt, quảng cáo hologram, và bầu không khí dystopian lấy cảm hứng Blade Runner với video cinematic."
    },
    previewText: "A cyberpunk city street at night with {{neon_elements}}, {{weather}}, {{figure}}...",
    coverImage: cover("pm-27-cyberpunk-neon"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Neon City Street",
        content: "A cyberpunk city street at night with {{neon_elements}}, {{weather}} pavement reflecting {{neon_colors}} lights, {{figure}}, {{atmospheric_effects}}, {{aesthetic}} aesthetic, cinematic photography, no text",
        description: "Cyberpunk street scene with neon atmosphere",
        variables: [
          { name: "neon_elements", description: "Neon signage", defaultValue: "dense neon signs in Japanese and Chinese characters" },
          { name: "weather", description: "Weather", defaultValue: "rain-soaked" },
          { name: "neon_colors", description: "Neon colors", defaultValue: "pink and cyan" },
          { name: "figure", description: "Figure", defaultValue: "a lone figure with a transparent umbrella walking away" },
          { name: "atmospheric_effects", description: "Atmosphere", defaultValue: "steam rising from street grates, holographic ads flickering" },
          { name: "aesthetic", description: "Aesthetic reference", defaultValue: "Blade Runner 2049" },
        ],
      },
    ],
    examples: [
      { input: "Rainy cyberpunk street with pink/cyan neon and lone figure", output: "Neon-drenched cyberpunk street scene with rain reflections, Japanese signage, and atmospheric steam.", image: cover("pm-27-cyberpunk-neon"), video: video("vid-27-cyberpunk-walk") },
      { input: "Cyberpunk back alley with holographic ads and ramen vendor", output: "Dystopian alley with floating holograms, steaming ramen stall, and electric blue-magenta puddle reflections.", image: example("ex-27-neon-alley") },
    ],
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
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 29. ISOMETRIC 3D ILLUSTRATION
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Isometric 3D Illustration Studio", vi: "Studio minh họa 3D Isometric" },
    category: "design",
    tags: ["isometric", "3d", "illustration", "diorama", "miniature"],
    priceSKT: 85,
    sellerIdx: 6,
    description: {
      en: "Create adorable isometric 3D illustrations. Cozy rooms, tiny shops, miniature worlds — perfect for app UI, game design, and social media with clay render aesthetic.",
      vi: "Tạo minh họa 3D isometric dễ thương. Phòng ấm cúng, cửa hàng tí hon, thế giới miniature — hoàn hảo cho UI app, game design, và social media."
    },
    previewText: "Cute isometric 3D illustration of {{scene}}, {{details}}, soft pastel colors...",
    coverImage: cover("pm-29-isometric-3d"),
    models: ["flux", "midjourney", "dall-e-3"],
    prompts: [
      {
        title: "Cozy Interior Scene",
        content: "Cute isometric 3D illustration of {{scene}}, {{interior_details}}, {{character_detail}}, {{lighting}}, {{color_palette}} color palette, miniature diorama style, {{render_style}} aesthetic, no text",
        description: "Cozy isometric interior diorama",
        variables: [
          { name: "scene", description: "Scene", defaultValue: "a cozy coffee shop" },
          { name: "interior_details", description: "Interior details", defaultValue: "warm interior with tiny people sitting at tables, large windows with rain outside, steam rising from coffee cups, bookshelves on the wall, potted plants" },
          { name: "character_detail", description: "Character detail", defaultValue: "a barista behind the counter preparing a latte art" },
          { name: "lighting", description: "Lighting", defaultValue: "soft warm interior lighting with rain-diffused window light" },
          { name: "color_palette", description: "Color palette", defaultValue: "soft pastel warm tones" },
          { name: "render_style", description: "Render style", defaultValue: "clay render" },
        ],
      },
    ],
    examples: [
      { input: "Cozy coffee shop with rain outside, pastel colors", output: "Adorable isometric coffee shop diorama with tiny patrons, steaming cups, bookshelves, and rainy window.", image: cover("pm-29-isometric-3d") },
      { input: "Home office with dual monitors and sleeping cat", output: "Miniature isometric home office with desk setup, beanbag cat, floating shelves, and warm lamp glow.", image: example("ex-29-isometric-room") },
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
   * 31. UNDERWATER & MARINE PHOTOGRAPHY
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Underwater & Marine Photography", vi: "Nhiếp ảnh dưới nước & đại dương" },
    category: "design",
    tags: ["underwater", "marine", "coral-reef", "ocean", "nature"],
    priceSKT: 90,
    sellerIdx: 11,
    description: {
      en: "Create stunning underwater and marine photography. Coral reefs, tropical fish, sea turtles, and deep ocean scenes with nature documentary quality video.",
      vi: "Tạo ảnh dưới nước và đại dương tuyệt đẹp. San hô, cá nhiệt đới, rùa biển, và cảnh đại dương sâu với video chất lượng phim tài liệu thiên nhiên."
    },
    previewText: "Stunning underwater photograph of {{scene}}, {{marine_life}}, {{light}}...",
    coverImage: cover("pm-31-underwater"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Coral Reef Ecosystem",
        content: "Stunning underwater photograph of {{scene}}, {{marine_life}}, {{light}}, {{coral_detail}}, {{water_quality}}, no text",
        description: "Vibrant coral reef underwater scene",
        variables: [
          { name: "scene", description: "Scene", defaultValue: "a vibrant coral reef ecosystem" },
          { name: "marine_life", description: "Marine life", defaultValue: "schools of tropical fish swimming through the reef, a sea turtle gliding gracefully" },
          { name: "light", description: "Lighting", defaultValue: "sunbeams penetrating the surface creating caustic light patterns on the sandy bottom" },
          { name: "coral_detail", description: "Coral details", defaultValue: "vibrant coral formations in orange, pink, and purple with sea anemones" },
          { name: "water_quality", description: "Water quality", defaultValue: "crystal clear turquoise water, marine biology photography quality" },
        ],
      },
    ],
    examples: [
      { input: "Coral reef with tropical fish and sunbeams", output: "Vibrant underwater ecosystem with colorful coral, schools of fish, and caustic light patterns.", image: cover("pm-31-underwater"), video: video("vid-31-underwater-reef") },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 32. TOKYO NIGHT STREET PHOTOGRAPHY
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Tokyo Night Street Photography", vi: "Nhiếp ảnh đường phố Tokyo ban đêm" },
    category: "design",
    tags: ["street-photography", "tokyo", "night", "moody", "urban"],
    priceSKT: 75,
    sellerIdx: 3,
    description: {
      en: "Capture the atmospheric beauty of Tokyo's narrow alleys, izakaya lanterns, and rain-soaked streets at night. Moody cinematic tones with immersive video walkthroughs.",
      vi: "Bắt lấy vẻ đẹp atmospheric của những con hẻm hẹp Tokyo, đèn lồng izakaya, và đường phố mưa ướt ban đêm. Tông cinematic moody với video walkthrough nhập vai."
    },
    previewText: "Atmospheric street photography in {{city}} at night, {{alley_detail}}, {{light_source}}...",
    coverImage: cover("pm-32-street-photo"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Moody Alley Night",
        content: "Atmospheric street photography in {{city}} at night, {{alley_detail}}, {{light_source}}, {{ground}}, {{props}}, {{atmosphere}}, moody cinematic lighting, no text",
        description: "Moody urban night alley scene",
        variables: [
          { name: "city", description: "City", defaultValue: "Tokyo" },
          { name: "alley_detail", description: "Alley details", defaultValue: "a narrow alley with traditional izakaya lanterns glowing warm orange" },
          { name: "light_source", description: "Light source", defaultValue: "paper lanterns and a single vending machine casting blue light" },
          { name: "ground", description: "Ground", defaultValue: "wet cobblestones reflecting the warm lights" },
          { name: "props", description: "Props", defaultValue: "a bicycle parked against the wall, paper umbrellas" },
          { name: "atmosphere", description: "Atmosphere", defaultValue: "steam from a ramen shop, light drizzle" },
        ],
      },
    ],
    examples: [
      { input: "Tokyo izakaya alley at night with rain and lanterns", output: "Atmospheric narrow alley with warm orange lanterns, wet cobblestones, and ramen shop steam.", image: cover("pm-32-street-photo"), video: video("vid-32-tokyo-night") },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 33. EXTREME MACRO PHOTOGRAPHY
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Extreme Macro Photography", vi: "Nhiếp ảnh Macro cực đại" },
    category: "design",
    tags: ["macro", "close-up", "nature", "detail", "botanical"],
    priceSKT: 80,
    sellerIdx: 11,
    description: {
      en: "Create mind-blowing extreme macro photography. Dew drops as tiny lenses, spider web architecture, insect portraits, and botanical details at 5x magnification.",
      vi: "Tạo ảnh macro cực đại ấn tượng. Giọt sương như thấu kính nhỏ, kiến trúc mạng nhện, chân dung côn trùng, và chi tiết thực vật ở độ phóng đại 5x."
    },
    previewText: "Extreme macro photograph of {{subject}}, {{detail}}, {{lighting}}...",
    coverImage: cover("pm-33-macro"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Dew Drop World",
        content: "Extreme macro photograph of {{subject}}, {{detail}}, {{lighting}}, dark blurred background with {{bokeh}}, shot with {{lens}} at {{magnification}} magnification, no text",
        description: "Extreme macro with dreamy bokeh",
        variables: [
          { name: "subject", description: "Subject", defaultValue: "morning dew drops on a spider web" },
          { name: "detail", description: "Key detail", defaultValue: "each droplet acting as a tiny lens reflecting the sunrise landscape" },
          { name: "lighting", description: "Lighting", defaultValue: "golden morning backlight catching each silk thread" },
          { name: "bokeh", description: "Bokeh style", defaultValue: "hexagonal bokeh circles in warm gold" },
          { name: "lens", description: "Lens", defaultValue: "Canon MP-E 65mm" },
          { name: "magnification", description: "Magnification", defaultValue: "5x" },
        ],
      },
    ],
    examples: [
      { input: "Morning dew drops on spider web reflecting sunrise", output: "Stunning macro of dew-covered web with each drop acting as a tiny lens, golden backlight and hexagonal bokeh.", image: cover("pm-33-macro") },
      { input: "Single water droplet on leaf reflecting flower garden", output: "Dreamy macro of a crystal droplet balanced on a green leaf tip, flower garden reflected inside.", image: example("ex-33-dewdrop") },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 34. MODERN FLAT DESIGN ILLUSTRATION
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Modern Flat Design Illustration", vi: "Minh họa Flat Design hiện đại" },
    category: "design",
    tags: ["flat-design", "ui", "illustration", "startup", "landing-page"],
    priceSKT: 65,
    sellerIdx: 6,
    description: {
      en: "Generate trendy flat design illustrations for tech startups, landing pages, and app UI. Clean geometric shapes, gradient backgrounds, and Dribbble-trending aesthetics.",
      vi: "Tạo minh họa flat design thời thượng cho startup công nghệ, landing page, và UI app. Hình khối sạch, nền gradient, và thẩm mỹ trending Dribbble."
    },
    previewText: "Modern flat design illustration for {{use_case}}, showing {{subject}}, {{style}}...",
    coverImage: cover("pm-34-flat-design"),
    models: ["flux", "dall-e-3", "midjourney"],
    prompts: [
      {
        title: "Tech Hero Section",
        content: "Modern flat design illustration for {{use_case}}, showing {{subject}}, {{floating_elements}}, {{background}}, {{shapes}}, {{style}} style, no text",
        description: "Tech startup hero section illustration",
        variables: [
          { name: "use_case", description: "Use case", defaultValue: "a tech startup landing page hero section" },
          { name: "subject", description: "Subject", defaultValue: "a person working on a laptop surrounded by floating UI elements" },
          { name: "floating_elements", description: "Floating elements", defaultValue: "charts, notification bubbles, cloud icons, and data flow lines" },
          { name: "background", description: "Background", defaultValue: "gradient purple to blue background" },
          { name: "shapes", description: "Shape style", defaultValue: "clean geometric shapes with subtle grain texture" },
          { name: "style", description: "Design style", defaultValue: "Dribbble trending" },
        ],
      },
    ],
    examples: [
      { input: "Tech startup hero with laptop and floating UI elements", output: "Clean flat illustration with person at laptop, floating charts and notifications, purple-blue gradient.", image: cover("pm-34-flat-design") },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 35. CINEMATIC CRAFTSMAN PORTRAIT
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Cinematic Craftsman & Artisan Portraits", vi: "Chân dung nghệ nhân Cinematic" },
    category: "design",
    tags: ["portrait", "craftsman", "artisan", "cinematic", "documentary"],
    priceSKT: 90,
    sellerIdx: 11,
    description: {
      en: "Create soulful cinematic portraits of craftsmen and artisans at work. Woodworkers, blacksmiths, potters — captured in their element with dramatic natural light and documentary video.",
      vi: "Tạo chân dung cinematic đầy hồn của nghệ nhân khi làm việc. Thợ mộc, thợ rèn, thợ gốm — chụp trong không gian sáng tạo với ánh sáng tự nhiên dramatic và video tài liệu."
    },
    previewText: "Cinematic portrait of {{craftsman}} in {{workshop}}, {{light}}, {{detail}}...",
    coverImage: cover("pm-35-cinematic-portrait"),
    models: ["flux", "midjourney", "stable-diffusion"],
    prompts: [
      {
        title: "Workshop Portrait",
        content: "Cinematic portrait of {{craftsman}} in {{workshop}}, {{light}}, {{detail}}, {{hands_action}}, shallow depth of field, shot on {{camera}}, no text",
        description: "Cinematic artisan portrait in workshop",
        variables: [
          { name: "craftsman", description: "Craftsman", defaultValue: "an elderly woodworker with weathered hands and a kind expression" },
          { name: "workshop", description: "Workshop", defaultValue: "his woodworking workshop filled with hand tools and wood shavings" },
          { name: "light", description: "Light", defaultValue: "warm afternoon light streaming through a dusty window" },
          { name: "detail", description: "Atmospheric detail", defaultValue: "wood shavings and sawdust particles floating in the air catching the light" },
          { name: "hands_action", description: "Hands action", defaultValue: "weathered hands carefully guiding a hand plane along a piece of walnut" },
          { name: "camera", description: "Camera", defaultValue: "Leica M11 with 50mm Summilux" },
        ],
      },
    ],
    examples: [
      { input: "Elderly woodworker in dusty workshop with afternoon window light", output: "Soulful cinematic portrait with warm light through dusty window, wood shavings floating, weathered hands on plane.", image: cover("pm-35-cinematic-portrait"), video: video("vid-35-craftsman") },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 36. PIXEL ART & RETRO GAMING
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Pixel Art & Retro Gaming Scenes", vi: "Pixel Art & Game Retro cảnh" },
    category: "other",
    tags: ["pixel-art", "retro", "gaming", "8-bit", "16-bit"],
    priceSKT: 60,
    isFree: true,
    sellerIdx: 9,
    description: {
      en: "Create detailed pixel art scenes for games, wallpapers, and nostalgic retro aesthetics. RPG towns, dungeon crawlers, and fantasy worlds in 16-bit and 32-bit styles.",
      vi: "Tạo cảnh pixel art chi tiết cho game, wallpaper, và thẩm mỹ retro hoài cổ. Thị trấn RPG, dungeon crawler, và thế giới fantasy kiểu 16-bit và 32-bit."
    },
    previewText: "Detailed pixel art scene of {{scene}}, {{style}} era style, {{lighting}}...",
    coverImage: cover("pm-36-pixel-art"),
    models: ["flux", "dall-e-3", "stable-diffusion"],
    prompts: [
      {
        title: "Fantasy RPG Town",
        content: "Detailed pixel art scene of {{scene}}, {{buildings}}, {{characters}}, {{vegetation}}, {{bit_style}} era style, {{lighting}}, no text",
        description: "Pixel art RPG town scene",
        variables: [
          { name: "scene", description: "Scene", defaultValue: "a fantasy RPG town at sunset" },
          { name: "buildings", description: "Buildings", defaultValue: "colorful buildings with thatched roofs, a market square, a grand castle on a hill in the background" },
          { name: "characters", description: "Characters", defaultValue: "tiny pixel characters shopping and chatting" },
          { name: "vegetation", description: "Vegetation", defaultValue: "cherry blossom trees lining the main road" },
          { name: "bit_style", description: "Bit style", defaultValue: "32-bit" },
          { name: "lighting", description: "Lighting", defaultValue: "warm golden sunset lighting" },
        ],
      },
    ],
    examples: [
      { input: "Fantasy RPG town at sunset with castle and cherry blossoms", output: "Charming 32-bit pixel art town with thatched roofs, market square, hilltop castle, and cherry blossom trees.", image: cover("pm-36-pixel-art") },
      { input: "Fantasy dungeon with dragon boss and treasure", output: "16-bit dungeon scene with glowing runes, treasure chests, hero facing dragon boss, and flickering torchlight.", image: example("ex-36-pixel-dungeon") },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 37. BOTANICAL SCIENTIFIC ILLUSTRATION
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Botanical Scientific Illustration", vi: "Minh họa khoa học thực vật" },
    category: "other",
    tags: ["botanical", "scientific", "illustration", "watercolor", "vintage"],
    priceSKT: 70,
    sellerIdx: 5,
    description: {
      en: "Create elegant botanical scientific illustrations in vintage watercolor style. Full plant studies with anatomy details, cross-sections, and hand-painted quality on parchment paper.",
      vi: "Tạo minh họa khoa học thực vật trang nhã kiểu watercolor vintage. Nghiên cứu cây đầy đủ với chi tiết giải phẫu, mặt cắt, và chất lượng vẽ tay trên giấy da."
    },
    previewText: "Elegant botanical illustration of {{plant}}, showing {{details}}, vintage watercolor...",
    coverImage: cover("pm-37-botanical"),
    models: ["flux", "dall-e-3", "midjourney"],
    prompts: [
      {
        title: "Full Plant Study",
        content: "Elegant botanical scientific illustration of {{plant}}, showing {{details}}, {{anatomy}}, {{style}} on {{paper}}, {{quality}}, no text",
        description: "Complete botanical plant study",
        variables: [
          { name: "plant", description: "Plant species", defaultValue: "a blooming orchid plant (Phalaenopsis)" },
          { name: "details", description: "Shown details", defaultValue: "the full plant with roots, stems, leaves, and multiple flowers in various stages of bloom" },
          { name: "anatomy", description: "Anatomy details", defaultValue: "detailed cross-section of the flower anatomy showing petals, pistil, and stamen" },
          { name: "style", description: "Art style", defaultValue: "vintage hand-painted watercolor" },
          { name: "paper", description: "Paper type", defaultValue: "cream parchment paper with subtle aging" },
          { name: "quality", description: "Quality reference", defaultValue: "botanical garden archive quality, Kew Gardens collection" },
        ],
      },
    ],
    examples: [
      { input: "Orchid plant with full anatomy on parchment paper", output: "Elegant vintage watercolor orchid with roots, stems, blooming flowers, and anatomical cross-section on aged cream parchment.", image: cover("pm-37-botanical") },
    ],
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
    ],
    examples: [
      { input: "Basketball slam dunk with arena lights and frozen sweat drops", output: "Explosive mid-air slam dunk with dramatic rim lighting, suspended sweat droplets, and roaring crowd.", image: cover("pm-38-sports-action"), video: video("vid-38-slam-dunk") },
      { input: "Soccer bicycle kick in packed stadium at night", output: "Dynamic aerial bicycle kick with floodlight backlight, grass particles, and frozen-in-time impact moment.", image: example("ex-38-soccer") },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 39. STAINED GLASS ART
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Stained Glass Art Designer", vi: "Thiết kế nghệ thuật kính màu" },
    category: "other",
    tags: ["stained-glass", "cathedral", "decorative", "medieval", "light-art"],
    priceSKT: 55,
    sellerIdx: 7,
    description: {
      en: "Design intricate stained glass window art. Magical forests, celestial scenes, and fantasy landscapes rendered in cathedral-quality leaded glass with backlit sunlight.",
      vi: "Thiết kế nghệ thuật cửa sổ kính màu tinh xảo. Rừng phép thuật, cảnh thiên thể, và phong cảnh fantasy thể hiện qua kính chì chất lượng nhà thờ với ánh sáng xuyên."
    },
    previewText: "Intricate stained glass window design depicting {{scene}}, {{colors}}, backlit by sunlight...",
    coverImage: cover("pm-39-stained-glass"),
    models: ["flux", "midjourney", "dall-e-3"],
    prompts: [
      {
        title: "Fantasy Stained Glass",
        content: "Intricate stained glass window design depicting {{scene}}, {{central_figure}}, surrounded by {{environment}}, {{magical_elements}}, {{color_palette}}, cathedral quality craftsmanship, backlit by {{light}}, no text",
        description: "Fantasy stained glass window design",
        variables: [
          { name: "scene", description: "Scene theme", defaultValue: "a magical forest scene" },
          { name: "central_figure", description: "Central figure", defaultValue: "a majestic white stag standing in a moonlit clearing" },
          { name: "environment", description: "Environment", defaultValue: "ancient oak trees with detailed bark and leaf patterns" },
          { name: "magical_elements", description: "Magical elements", defaultValue: "fireflies rendered as glowing amber glass pieces, mushroom circles at the base" },
          { name: "color_palette", description: "Color palette", defaultValue: "cobalt blue night sky with silver stars, emerald greens, and warm amber accents" },
          { name: "light", description: "Light source", defaultValue: "warm afternoon sunlight creating a luminous glow" },
        ],
      },
    ],
    examples: [
      { input: "Magical forest with white stag in moonlit clearing", output: "Cathedral-quality stained glass with majestic stag, ancient oaks, amber firefly glass, and cobalt blue starry sky.", image: cover("pm-39-stained-glass") },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * 40. TILT-SHIFT MINIATURE WORLD
   * ═══════════════════════════════════════════════════ */
  {
    title: { en: "Tilt-Shift Miniature World", vi: "Thế giới Miniature Tilt-Shift" },
    category: "design",
    tags: ["tilt-shift", "miniature", "toy-effect", "cityscape", "creative"],
    priceSKT: 50,
    isFree: true,
    sellerIdx: 0,
    description: {
      en: "Transform real-world scenes into adorable miniature toy villages. Harbor towns, train stations, and cityscapes with extreme tilt-shift effect that makes everything look tiny.",
      vi: "Biến cảnh thực thành làng đồ chơi miniature đáng yêu. Thị trấn cảng, ga tàu, và thành phố với hiệu ứng tilt-shift cực đại làm mọi thứ trông tí hon."
    },
    previewText: "Tilt-shift miniature effect photograph of {{scene}}, making the real {{subject}} look tiny...",
    coverImage: cover("pm-40-tilt-shift"),
    models: ["flux", "midjourney", "dall-e-3"],
    prompts: [
      {
        title: "Toy Town Effect",
        content: "Tilt-shift miniature effect photograph of {{scene}}, making the real {{subject}} look like a tiny model village, {{elements}}, {{focal_area}}, extreme shallow depth of field at top and bottom, {{colors}}, toy-like appearance, no text",
        description: "Tilt-shift miniature town effect",
        variables: [
          { name: "scene", description: "Scene", defaultValue: "a bustling European harbor town" },
          { name: "subject", description: "Subject", defaultValue: "city" },
          { name: "elements", description: "Elements", defaultValue: "colorful fishing boats in the marina, terracotta rooftops, a lighthouse at the harbor entrance" },
          { name: "focal_area", description: "Focal area", defaultValue: "the harbor and central market area in sharp focus" },
          { name: "colors", description: "Color treatment", defaultValue: "saturated vibrant colors with slightly warm toning" },
        ],
      },
    ],
    examples: [
      { input: "European harbor town looking like a tiny toy model", output: "Adorable tilt-shift miniature of harbor town with toy-like fishing boats, terracotta roofs, and lighthouse.", image: cover("pm-40-tilt-shift") },
    ],
  },
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

/* ═══════════════════════════════════════════════════
 * MAIN SEED FUNCTION
 * ═══════════════════════════════════════════════════ */
async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("Connected to MongoDB");

  // ── Clean previous seed data ──
  const oldSeedUsers = await User.find({ type: "seed" }).select("_id");
  const oldIds = oldSeedUsers.map((u) => u._id);
  if (oldIds.length) {
    const oldPromptSets = await PromptSet.find({ sellerId: { $in: oldIds } }).select("_id");
    const oldPsIds = oldPromptSets.map((p) => p._id);
    await Promise.all([
      PromptReview.deleteMany({ promptSetId: { $in: oldPsIds } }),
      PromptWishlist.deleteMany({ promptSetId: { $in: oldPsIds } }),
      SellerFollower.deleteMany({ $or: [{ sellerId: { $in: oldIds } }, { followerId: { $in: oldIds } }] }),
    ]);
    await PromptSet.deleteMany({ sellerId: { $in: oldIds } });
  }
  await User.deleteMany({ type: "seed" });
  console.log("Cleaned previous seed data (v3 + any prior seed users)");

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
  const catCounts: Record<string, number> = {};
  for (const p of PROMPTS) {
    catCounts[p.category] = (catCounts[p.category] || 0) + 1;
  }

  console.log("\n Seed v4 complete!");
  console.log(`   ${createdUsers.length} users (type: seed)`);
  console.log(`   ${createdPromptSets.length} prompt sets (showcase visual/creative)`);
  console.log(`   Categories: ${Object.entries(catCounts).map(([k, v]) => `${k}(${v})`).join(", ")}`);
  console.log(`   ${reviewCount} reviews`);
  console.log(`   ${wishlistCount} wishlist entries`);
  console.log(`   ${followerCount} follower relationships`);

  const coverCount = Object.keys(coverUrls).length;
  const exCount = Object.keys(exampleUrls).length;
  const vidCount = Object.keys(videoUrls).length;
  console.log(`   ${coverCount}/40 cover images loaded from generated URLs`);
  console.log(`   ${exCount}/22 example images loaded from generated URLs`);
  console.log(`   ${vidCount}/8 videos loaded from generated URLs`);
  if (coverCount < 40 || exCount < 22) {
    console.log(`   ⚠️  Run gen_prompt_market_showcase.sh + gen_prompt_market_v4_extra.sh first for real images/videos`);
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
