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
import { buildPromptMarketSeedPrompts } from "./prompt-market-blueprint";

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
const CF_IMG_V5 = "https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/prompt-market-v5";
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
  "neo-noir-detective-film-bible-cover": `${CF_IMG_V5}/neo-noir-detective-film-bible-concept-board/public`,
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
  "anime-action-storyboard-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/0b487d20df23cdfab00ca51d4926f547/downloads/default.mp4",
  "architectural-experience-board-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/5e94e4f9960de6bba1032ec338bf42ae/downloads/default.mp4",
  "biomorphic-haute-couture-board-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/3a1c168edbae2f7d0bb6fa25462dd708/downloads/default.mp4",
  "botanical-scientific-plate-system-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/ce230e35b57b2653d02829ee1139371b/downloads/default.mp4",
  "cozy-character-video-board-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/3072e4d10444ed5728feffc0b2614217/downloads/default.mp4",
  "game-character-production-bible-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/74276d9217d41178ea877cd400456028/downloads/default.mp4",
  "luxury-product-launch-kit-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/139e5471cc72929c7ee42b4d09899858/downloads/default.mp4",
  "macro-nature-discovery-board-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/5aa96a25ab79d9c7abb99f4296357a2d/downloads/default.mp4",
  "mobile-ui-system-board-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/b5c0bc8e2437044954b4018c42bb83f5/downloads/default.mp4",
  "premium-food-ad-system-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/02d84aeeafae5efbb981d050748985e0/downloads/default.mp4",
  "real-estate-campaign-kit-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/cc18f91dc401f57b7b995b3d42f4f7aa/downloads/default.mp4",
  "sci-fi-worldbuilding-codex-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/7e84b9919926a29e7be7045062f10e0b/downloads/default.mp4",
  "seafood-night-market-campaign-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/f408b1523d58984e75cececea8399fe5/downloads/default.mp4",
  "luxury-oyster-bar-launch-kit-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/5d517685afc4ab689cecf0598e9c2dbc/downloads/default.mp4",
  "vietnamese-street-food-storyboard-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/e592f2d4420c225aa3f2cd956928d2ce/downloads/default.mp4",
  "sushi-omakase-menu-board-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/36a0d9b9f8a03082ef70f642492af2c1/downloads/default.mp4",
  "brown-sugar-boba-launch-kit-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/f868c3c5af784fbbd10a8ae415d91e69/downloads/default.mp4",
  "tropical-smoothie-poster-system-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/7cbde140ccb3fa4078546b7c93aec539/downloads/default.mp4",
  "sparkling-fruit-tea-campaign-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/530df0084ee54dc4ecac8c65bd815b5f/downloads/default.mp4",
  "artisanal-coffee-brew-board-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/227fb7f0c910494bd501f488fab75d60/downloads/default.mp4",
  "matcha-dessert-cafe-visual-bible-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/03e3a3408106367b0bbb897934f68dd4/downloads/default.mp4",
  "premium-hotpot-restaurant-kit-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/7f352851d0839751183b592150c63b99/downloads/default.mp4",
  "mediterranean-seafood-platter-board-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/4c854a6ea26dba5a33a50b1fe8283b46/downloads/default.mp4",
  "gelato-flavor-campaign-system-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/58269003a3ef0826a39e36e4ca773f09/downloads/default.mp4",
  "bakery-croissant-morning-board-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/6e4114ab382e2a03468ce291c04873f0/downloads/default.mp4",
  "fine-dining-tasting-menu-storyboard-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/c4edf4790c31e33327d816482e898527/downloads/default.mp4",
  "korean-bbq-tabletop-campaign-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/601c1f3432760f667a59f0d17277684c/downloads/default.mp4",
  "neo-noir-detective-film-bible-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/068a3d03453b5cd4f2f9a5d597afbe14/downloads/default.mp4",
  "epic-space-opera-production-board-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/85351cd7a9de3974d380a60147304125/downloads/default.mp4",
  "historical-war-epic-storyboard-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/aec968a4398cdeecc900d73d9c101b09/downloads/default.mp4",
  "romantic-period-drama-lookbook-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/65651441582c525e3405005a1a74857a/downloads/default.mp4",
  "psychological-thriller-shot-deck-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/92c9f753cbf33f653ca7e4a832f215b2/downloads/default.mp4",
  "superhero-origin-film-kit-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/84a100ce7eb65e025f39ca43c3b1f3a9/downloads/default.mp4",
  "indie-road-movie-visual-diary-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/65a539e511be35c5626eff37070826ee/downloads/default.mp4",
  "cyberpunk-crime-series-pitch-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/2ccda6b84a3e3fd56c1cd0cc9ede0827/downloads/default.mp4",
  "musical-dream-sequence-board-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/cf616190aad33ff0ee4a1aad1037065a/downloads/default.mp4",
  "found-footage-horror-evidence-kit-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/514ca84fb04b1f72a053bff5b67a470f/downloads/default.mp4",
  "pixar-style-family-adventure-board-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/712c195915b2e7bcdd2012a4d8a7e950/downloads/default.mp4",
  "stop-motion-folktale-production-kit-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/231b5a688cb72fec32d319074a788dd3/downloads/default.mp4",
  "2d-princess-musical-animation-bible-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/115d22ad3881744d6ffe4da7cd41b4ab/downloads/default.mp4",
  "claymation-creature-comedy-board-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/50b7675649751d08f91b82b9d5fb41d7/downloads/default.mp4",
  "fantasy-animal-kingdom-animation-pack-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/39adff57c384b8d247168f4c4bdf953d/downloads/default.mp4",
  "educational-dinosaur-cartoon-series-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/42b4beaa93a0afaa0397aab1fe7cb917/downloads/default.mp4",
  "dreamworks-style-villain-comedy-pitch-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/4d1dfb080ba2bbab4d5b9af58c45b98a/downloads/default.mp4",
  "watercolor-childrens-short-film-kit-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/59d409356a35f3172d79a8c95e376275/downloads/default.mp4",
  "3d-robot-buddy-adventure-board-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/7135f866b8ec9698a90fbe8fe1105f70/downloads/default.mp4",
  "silent-animal-short-storyboard-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/cb01d7c6036c829bf3359fddf955937c/downloads/default.mp4",
  "anime-shonen-battle-storyboard-pack-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/99328170e78a01c674fd72ced37fbfd6/downloads/default.mp4",
  "anime-slice-of-life-school-series-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/168f59fc33ed8bc56cd5797880974848/downloads/default.mp4",
  "anime-mecha-launch-bible-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/ac224f79c876711159dac89515e1157f/downloads/default.mp4",
  "anime-magical-girl-transformation-kit-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/24ac5d3c430d59860a3bf29889c8b9db/downloads/default.mp4",
  "anime-ghibli-inspired-spirit-journey-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/5a12391abafacbb7ff06f3e9c922a9dc/downloads/default.mp4",
  "anime-cyber-idol-music-video-board-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/291716c4bee957b7596df6508b41f9e9/downloads/default.mp4",
  "anime-samurai-revenge-film-board-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/af8a31c85cf5273d0d977bce4e1af187/downloads/default.mp4",
  "anime-dark-fantasy-monster-hunter-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/76a25a47705d4d4fce54a2972cd4b320/downloads/default.mp4",
  "anime-racing-team-opening-pack-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/e0c63931e180b1638af9e9d717ef4766/downloads/default.mp4",
  "anime-yokai-market-night-board-video-demo": "https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/56e270131fec0262ec5e601e606f6d78/downloads/default.mp4",
};

const generatedImage = (name: string) => `${CF_IMG_V5}/${name}/public`;
const cover = (name: string) => coverUrls[name] || generatedImage(name);
const example = (name: string) => exampleUrls[name] || generatedImage(name);
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
 * REBUILT BLUEPRINT PROMPT SETS
 * Add future packs in prompt-market-blueprint.ts
 * ═══════════════════════════════════════════════════ */
const PROMPTS = buildPromptMarketSeedPrompts({ cover, example, video });

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
      examples: p.examples.map((ex, idx) => ({
        promptTitle: ex.promptTitle || p.prompts[idx]?.title || p.title.en,
        input: ex.input,
        style: ex.style || [...p.models.slice(0, 3), ...p.tags.slice(0, 3)].join(" · "),
        output: ex.output,
        image: ex.image,
        video: ex.video,
      })),
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
  const usedCoverCount = new Set(PROMPTS.map((p) => p.coverImage).filter(Boolean)).size;
  const usedExampleCount = PROMPTS.reduce((sum, p) => sum + p.examples.filter((ex) => ex.image).length, 0);
  const usedVideoCount = PROMPTS.reduce((sum, p) => sum + p.examples.filter((ex) => ex.video).length, 0);
  const result = {
    users: createdUsers.length,
    promptSets: createdPromptSets.length,
    reviews: reviewCount,
    wishlists: wishlistCount,
    followers: followerCount,
    covers: usedCoverCount,
    examples: usedExampleCount,
    videos: usedVideoCount,
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
