type Cat = "coding" | "writing" | "marketing" | "design" | "business" | "education" | "other";

interface PromptVariable {
  name: string;
  description: string;
  defaultValue: string;
}

interface SeedPromptItem {
  title: string;
  content: string;
  description: string;
  variables?: PromptVariable[];
}

interface SeedPromptExample {
  promptTitle?: string;
  style?: string;
  input: string;
  output: string;
  image?: string;
  video?: string;
}

export interface SeedPrompt {
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
  prompts: SeedPromptItem[];
  examples: SeedPromptExample[];
}

interface PromptBlueprint {
  id: string;
  title: { en: string; vi: string };
  category: Cat;
  tags: string[];
  priceSKT: number;
  isFree?: boolean;
  featured?: boolean;
  sellerIdx: number;
  coverKey: string;
  exampleKeys: string[];
  videoKey?: string;
  models: string[];
  domain: string;
  heroSubject: string;
  audience: string;
  outputSystem: string;
  visualLanguage: string;
  materialSystem: string;
  layoutSystem: string;
  motionSystem: string;
  businessUse: string;
  description: { en: string; vi: string };
}

interface AssetResolvers {
  cover: (name: string) => string;
  example: (name: string) => string;
  video: (name: string) => string | undefined;
}

export interface PromptMarketAssetTask {
  id: string;
  packId: string;
  type: "image" | "video";
  role: "cover" | "example" | "poster" | "technical-board" | "thumbnail" | "video-demo";
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:5";
  prompt: string;
}

const joinList = (items: string[]) => items.filter(Boolean).slice(0, 8).join(", ");

const sharedVariables = (bp: PromptBlueprint): PromptVariable[] => [
  { name: "project_brief", description: "Short creative goal", defaultValue: bp.businessUse },
  { name: "hero_subject", description: "Main subject or hero scene", defaultValue: bp.heroSubject },
  { name: "audience", description: "Target buyer, viewer, or user", defaultValue: bp.audience },
  { name: "visual_language", description: "Style, references, and art direction", defaultValue: bp.visualLanguage },
  { name: "material_system", description: "Physical materials, textures, and sensory details", defaultValue: bp.materialSystem },
  { name: "layout_system", description: "How the final sheet/poster/board is structured", defaultValue: bp.layoutSystem },
];

const buildPrompts = (bp: PromptBlueprint): SeedPromptItem[] => [
  {
    title: "01. Research + Concept Board",
    description: "Turns one idea into a premium reference board with hero output, material notes, palette, micro details, and variants.",
    content:
      `Create a complete research and concept board for {{project_brief}}. ` +
      `Central hero: {{hero_subject}} for {{audience}}, rendered in {{visual_language}}. ` +
      `Left column: inspiration reference zone, material swatches, palette chips, close-up texture crops, and concise atelier notes explaining why each reference matters. ` +
      `Right column: technical sketch, construction notes, callout arrows, proportions, lighting plan, camera/lens notes, and production constraints. ` +
      `Bottom strip: six polished output variants showing alternate angle, close-up, lifestyle context, social crop, thumbnail crop, and final hero crop. ` +
      `Use {{material_system}} as the sensory foundation. Layout must follow {{layout_system}} with readable hierarchy, intentional negative space, and gallery-grade spacing. ` +
      `The result should feel like a senior creative director prepared it for production, not a loose moodboard.`,
    variables: sharedVariables(bp),
  },
  {
    title: "02. Technical Annotation Sheet",
    description: "Builds an annotated design/production sheet with structure, material logic, camera plan, and output rules.",
    content:
      `Create a technical annotation sheet for {{hero_subject}}. ` +
      `Show one polished final output plus two supporting blueprint/sketch views. Add numbered callouts for structure, surface behavior, material layering, lighting direction, camera distance, framing, scale, and output limitations. ` +
      `Include a compact material library using {{material_system}}, a palette row, detail magnification crops, and a notes section for production risks. ` +
      `The sheet must be useful for generating consistent image and video assets later: every visual decision should be explicit, reusable, and easy to modify. ` +
      `Style: {{visual_language}}. Audience: {{audience}}. Layout: {{layout_system}}.`,
    variables: sharedVariables(bp),
  },
  {
    title: "03. Campaign Poster System",
    description: "Creates a commercial poster/ad layout with hero visual, offer modules, feature icons, CTA, and variant strip.",
    content:
      `Design a finished campaign poster system for {{project_brief}}. ` +
      `Hero area: oversized {{hero_subject}} with dramatic depth, tactile details, believable lighting, and a strong silhouette. ` +
      `Add a clear headline zone, subheadline zone, badge module, feature icon row, proof-point area, CTA block, and brand lockup placeholder. Use elegant placeholder text only. ` +
      `Bottom strip: three reusable variants for different audience segments, platforms, or product states. ` +
      `Include crop guides for 1:1, 4:5, 9:16, and 16:9 so the result can become multiple marketplace preview images. ` +
      `Commercial logic: desire first, proof second, action last. Keep the layout premium and readable.`,
    variables: sharedVariables(bp),
  },
  {
    title: "04. Asset Batch Generator",
    description: "Expands a brief into a concrete generation plan for covers, examples, posters, thumbnails, and videos.",
    content:
      `Convert {{project_brief}} into a production-ready asset batch for Prompt Market. ` +
      `Return exactly: 1 cover image prompt, 4 example image prompts, 1 campaign poster prompt, 1 technical/reference board prompt, 1 thumbnail-safe prompt, and 3 short video prompts. ` +
      `For every image prompt include: subject, environment, composition, texture, material, lighting, color palette, typography-safe zone, aspect ratio, and quality constraints. ` +
      `For every video prompt include: shot type, camera movement, one main action, continuity rule, sensory detail, duration, transition cue, and final frame. ` +
      `All assets must share the same identity: {{visual_language}}, {{material_system}}, and {{layout_system}}.`,
    variables: sharedVariables(bp),
  },
  {
    title: "05. Final Image Production Prompt",
    description: "Produces the main high-quality image prompt after the board and asset plan are approved.",
    content:
      `Generate the final production image for {{project_brief}}. ` +
      `Subject: {{hero_subject}}. Audience: {{audience}}. Visual language: {{visual_language}}. Materials and sensory detail: {{material_system}}. ` +
      `Composition: use a clear foreground, midground, and background; preserve one clean typography-safe zone; include controlled micro-details that reward zooming in. ` +
      `Lighting must reveal the material logic, not just decorate the scene. Palette must stay coherent across future cover, examples, poster, and video thumbnail. ` +
      `Output should look like the flagship image from a complete creative kit.`,
    variables: sharedVariables(bp),
  },
  {
    title: "06. Cinematic Video Storyboard",
    description: "Turns the pack into a video storyboard with timed beats, camera moves, motion notes, and sound direction.",
    content:
      `Build an 8-second cinematic video storyboard for {{project_brief}}. ` +
      `Use {{motion_system}}. Create 10 numbered panels with timestamp, camera angle, lens/framing, motion arrow, subject action, environmental reaction, transition, and sound design note. ` +
      `Progression: establishing frame, slow push-in, detail reveal, interaction beat, transformation or movement beat, emotional close-up, dynamic angle, final hero frame. ` +
      `Each clip must have one clear action and smooth continuity. Avoid switching to unrelated scenes. ` +
      `Final line must be a single clean video prompt ready for external video generation.`,
    variables: [
      ...sharedVariables(bp),
      { name: "motion_system", description: "Video camera and motion language", defaultValue: bp.motionSystem },
    ],
  },
];

const BLUEPRINTS: PromptBlueprint[] = [
  {
    id: "biomorphic-haute-couture-board",
    title: { en: "Biomorphic Haute Couture Design Board", vi: "Bảng thiết kế Haute Couture sinh học" },
    category: "design",
    tags: ["fashion", "concept-board", "couture", "technical-sheet", "material-study", "storyboard"],
    priceSKT: 180,
    featured: true,
    sellerIdx: 3,
    coverKey: "pm-04-fashion-editorial",
    exampleKeys: ["ex-04-streetwear", "ex-10-ceo-portrait"],
    videoKey: "vid-35-craftsman",
    models: ["midjourney", "flux", "veo"],
    domain: "fashion art direction",
    heroSubject: "a scarab-inspired iridescent couture gown with translucent organza wings, beetle-shell panels, crystal embroidery, and technical croquis notes",
    audience: "fashion directors, costume designers, luxury editorial teams, and AI fashion creators",
    outputSystem: "couture concept board, croquis sheet, material library, runway poster, and motion storyboard",
    visualLanguage: "Paris atelier board, natural history specimen reference, hand-drawn couture annotations, high-fashion editorial finish",
    materialSystem: "iridescent satin, black translucent organza, emerald-purple beetle shell, crystal beading, fine wire structure, pearl embroidery",
    layoutSystem: "central full-body hero, left inspiration/specimen column, right front-back croquis, bottom fabric swatches and palette chips",
    motionSystem: "slow runway push-in, fabric shimmer close-ups, organza wing movement, macro bead sparkle, final full-body hero turn",
    businessUse: "create a complete AI fashion showcase that can sell a premium couture prompt pack",
    description: {
      en: "A couture-grade prompt system for creating fashion concept boards with specimen references, material swatches, croquis annotations, runway imagery, and video direction.",
      vi: "Hệ prompt thời trang cao cấp để tạo concept board có reference sinh học, swatch chất liệu, croquis, hình runway và hướng dẫn video.",
    },
  },
  {
    id: "premium-food-ad-system",
    title: { en: "Premium Food Ad Poster System", vi: "Hệ poster quảng cáo đồ uống cao cấp" },
    category: "marketing",
    tags: ["food-ad", "poster", "campaign", "typography", "product-shot", "social-ads"],
    priceSKT: 160,
    featured: true,
    sellerIdx: 1,
    coverKey: "pm-02-food-editorial",
    exampleKeys: ["ex-02-dark-dessert", "ex-01-skincare-flatlay"],
    models: ["flux", "midjourney", "imagen"],
    domain: "commercial food advertising",
    heroSubject: "a decadent chocolate milkshake campaign with whipped cream, syrup splash, chocolate pieces, offer badges, flavor variants, and CTA modules",
    audience: "cafe owners, dessert brands, food marketers, and social media ad designers",
    outputSystem: "food hero poster, flavor variant grid, offer modules, icons, CTA block, and social crop kit",
    visualLanguage: "appetizing commercial photography mixed with polished social ad layout, readable type zones, warm chocolate palette",
    materialSystem: "cold condensation, whipped cream peaks, glossy syrup, chocolate chunks, wafer sticks, creamy foam, paper cup label texture",
    layoutSystem: "large hero drink left-center, headline right-top, offer badge, feature icon stack, CTA brush stroke, bottom flavor strip",
    motionSystem: "slow macro pour, syrup splash, whipped cream swirl, floating chocolate pieces, final poster lockup reveal",
    businessUse: "generate a ready-to-use food campaign kit for cafes and dessert brands",
    description: {
      en: "A conversion-focused food advertising prompt kit that creates appetizing hero images, posters, variant grids, badges, and video ad storyboards.",
      vi: "Bộ prompt quảng cáo đồ ăn tập trung chuyển đổi, tạo hero image, poster, variant grid, badge và storyboard video.",
    },
  },
  {
    id: "anime-action-storyboard",
    title: { en: "Anime Action Storyboard Director", vi: "Đạo diễn storyboard hành động anime" },
    category: "design",
    tags: ["anime", "storyboard", "action", "video", "shot-list", "motion-design"],
    priceSKT: 170,
    featured: true,
    sellerIdx: 9,
    coverKey: "pm-19-anime-art",
    exampleKeys: ["ex-09-anime-battle", "ex-07-noir-detective"],
    videoKey: "vid-38-slam-dunk",
    models: ["midjourney", "flux", "veo"],
    domain: "anime action previsualization",
    heroSubject: "a blue-haired sword fighter launching a high-speed slash sequence, with manga storyboard panels, camera arrows, beat timing, impact frames, and energy trails",
    audience: "anime creators, motion designers, video prompt engineers, and storyboard artists",
    outputSystem: "key visual, 16-panel action board, camera map, slash timing chart, and video generation prompt",
    visualLanguage: "clean anime key art fused with rough production storyboard sketches, red/blue motion annotations, impact-frame energy",
    materialSystem: "inked linework, graphite storyboard texture, orange slash arcs, dust trails, cracked floor debris, speed-line compression",
    layoutSystem: "top hero close-up, lower grid of sequential panels with beat labels, side notes for camera and action",
    motionSystem: "low-angle establish, push-in, whip-pan follow, orbit slash, impact pause, debris burst, final over-shoulder finish",
    businessUse: "turn one action idea into a video-ready anime storyboard prompt kit",
    description: {
      en: "A production-style anime action prompt system for creating storyboard sheets, keyframes, motion notes, and short video prompts.",
      vi: "Hệ prompt hành động anime kiểu production để tạo storyboard, keyframe, motion note và prompt video ngắn.",
    },
  },
  {
    id: "cozy-character-video-board",
    title: { en: "Cozy Character Video Storyboard", vi: "Storyboard video nhân vật cảm xúc" },
    category: "design",
    tags: ["character", "storyboard", "cute", "video", "emotion", "cinematic"],
    priceSKT: 140,
    isFree: true,
    featured: true,
    sellerIdx: 5,
    coverKey: "pm-22-childrens-book",
    exampleKeys: ["ex-29-isometric-room", "ex-15-headphone-render"],
    videoKey: "vid-35-craftsman",
    models: ["midjourney", "flux", "veo"],
    domain: "character animation pre-production",
    heroSubject: "a sleepy tiny character waking up with a mug, soft morning light, expression arc, prop close-ups, and 12-panel emotional storyboard",
    audience: "short video creators, children's content teams, animation studios, and brand storytellers",
    outputSystem: "character bible, emotional arc board, shot list, prop notes, final video prompt",
    visualLanguage: "storybook cinematic warmth, soft creature design, cozy editorial storyboard, gentle handwritten production notes",
    materialSystem: "fluffy fur, ceramic mug glaze, pillow fabric, dew on leaves, warm sunlight, soft bokeh, small hand props",
    layoutSystem: "hero frame on top, 12 beat panels below, director notes and color palette on the side, emotion arc at bottom",
    motionSystem: "blink, yawn, sip, tiny stumble, close-up reaction, cup steam, soft branch sway, final smile",
    businessUse: "create a charming short-form video storyboard pack with consistent character emotion and motion",
    description: {
      en: "A warm character-story prompt kit for building emotional storyboard sheets, image examples, and short cinematic video prompts.",
      vi: "Bộ prompt nhân vật ấm áp để tạo storyboard cảm xúc, hình minh họa và prompt video cinematic ngắn.",
    },
  },
  {
    id: "architectural-experience-board",
    title: { en: "Architectural Experience Board", vi: "Bảng trải nghiệm kiến trúc" },
    category: "design",
    tags: ["architecture", "interior", "real-estate", "technical-board", "cinematic-tour"],
    priceSKT: 150,
    sellerIdx: 4,
    coverKey: "pm-07-architecture",
    exampleKeys: ["ex-06-brutalist-museum", "ex-03-wabisabi-bathroom"],
    videoKey: "vid-26-drone-flight",
    models: ["flux", "midjourney", "veo"],
    domain: "architecture visualization",
    heroSubject: "a cliffside glass villa with sectional diagrams, material callouts, twilight hero render, interior close-ups, and cinematic tour frames",
    audience: "architects, real estate marketers, interior designers, and visualization studios",
    outputSystem: "architectural board, material sheet, hero exterior, interior vignettes, aerial video storyboard",
    visualLanguage: "ArchDaily editorial, Iwan Baan style context, clean section/elevation drawings, premium real-estate brochure logic",
    materialSystem: "poured concrete, low-iron glass, walnut millwork, linen upholstery, pool caustics, coastal vegetation, warm interior light",
    layoutSystem: "wide hero exterior, plan/section callouts, material strip, interior detail crops, final tour storyboard",
    motionSystem: "drone approach, slow reveal over pool, dolly through glass doors, detail pan over materials, twilight final pullback",
    businessUse: "sell architecture and real estate prompt packs as complete visual campaign systems",
    description: {
      en: "A complete architecture prompt blueprint for concept boards, material studies, real estate hero images, and cinematic property tour videos.",
      vi: "Blueprint prompt kiến trúc cho concept board, vật liệu, ảnh bán BĐS và video tour cinematic.",
    },
  },
  {
    id: "luxury-product-launch-kit",
    title: { en: "Luxury Product Launch Kit", vi: "Bộ launch sản phẩm luxury" },
    category: "marketing",
    tags: ["product", "luxury", "launch", "campaign", "packaging", "video"],
    priceSKT: 155,
    sellerIdx: 0,
    coverKey: "pm-01-product-photo",
    exampleKeys: ["ex-15-headphone-render", "ex-12-coffee-brand"],
    models: ["flux", "midjourney", "imagen"],
    domain: "premium product launch",
    heroSubject: "a luxury product launch board with hero studio shot, packaging detail, material swatches, ad poster, e-commerce crops, and motion reveal storyboard",
    audience: "e-commerce brands, product photographers, launch teams, and creative agencies",
    outputSystem: "hero photo, packaging board, product detail macros, ad poster, store listing crops, reveal video",
    visualLanguage: "premium commercial photography, restrained luxury typography, sharp studio lighting, tactile product macro details",
    materialSystem: "brushed metal, glass reflection, matte paper packaging, embossed foil, water droplets, soft velvet shadows",
    layoutSystem: "central hero product, left material/macros, right packaging structure, bottom crop variants and ad modules",
    motionSystem: "slow rotating product reveal, macro glide across material, packaging open, light sweep, final logo-safe hero frame",
    businessUse: "produce a complete luxury launch kit from one product brief",
    description: {
      en: "A launch-ready product prompt system for creating hero photography, packaging studies, e-commerce crops, posters, and reveal videos.",
      vi: "Hệ prompt launch sản phẩm để tạo hero photo, packaging, crop e-commerce, poster và video reveal.",
    },
  },
  {
    id: "game-character-production-bible",
    title: { en: "Game Character Production Bible", vi: "Bộ production nhân vật game" },
    category: "design",
    tags: ["game-character", "turnaround", "concept-art", "3d-reference", "animation"],
    priceSKT: 165,
    sellerIdx: 2,
    coverKey: "pm-06-character-design",
    exampleKeys: ["ex-05-paladin-turnaround", "ex-11-motorcycle"],
    models: ["midjourney", "flux", "stable-diffusion"],
    domain: "game character art direction",
    heroSubject: "a cyberpunk samurai character bible with hero render, front/back/side turnaround, gear callouts, weapon sheet, expression row, and animation poses",
    audience: "game studios, 3D artists, character designers, and indie developers",
    outputSystem: "hero key art, character turnaround, prop sheet, material notes, pose sheet, cinematic idle animation storyboard",
    visualLanguage: "AAA game art production sheet, Unreal Engine presentation, precise costume construction notes, dramatic key art",
    materialSystem: "matte tactical armor, translucent visor glass, neon edge lights, scratched metal joints, weathered fabric, plasma blade glow",
    layoutSystem: "hero render left, orthographic turnaround center, weapon/gear details right, pose strip and palette at bottom",
    motionSystem: "idle stance, visor glow pulse, cloak movement, sword draw, foot pivot, rain reflection, final combat pose",
    businessUse: "generate a reusable character production bible for game and animation pipelines",
    description: {
      en: "A character-production prompt blueprint for hero art, turnarounds, gear sheets, pose boards, and animation-ready video prompts.",
      vi: "Blueprint prompt nhân vật để tạo hero art, turnaround, gear sheet, pose board và prompt video animation.",
    },
  },
  {
    id: "sci-fi-worldbuilding-codex",
    title: { en: "Sci-Fi Worldbuilding Codex", vi: "Codex xây dựng thế giới sci-fi" },
    category: "design",
    tags: ["sci-fi", "worldbuilding", "environment", "concept-art", "cinematic"],
    priceSKT: 155,
    sellerIdx: 8,
    coverKey: "pm-16-scifi-world",
    exampleKeys: ["ex-08-space-station", "ex-13-iceland-volcanic"],
    videoKey: "vid-27-cyberpunk-walk",
    models: ["midjourney", "flux", "veo"],
    domain: "sci-fi environment design",
    heroSubject: "a cyberpunk megacity worldbuilding codex with skyline hero, district maps, signage rules, vehicle lanes, weather system, and cinematic street storyboard",
    audience: "film concept artists, game environment teams, sci-fi writers, and AI worldbuilders",
    outputSystem: "environment bible, city poster, technical district board, signage style guide, cinematic flythrough storyboard",
    visualLanguage: "Blade Runner scale, Ghost in the Shell density, clean production notes, neon rain atmosphere, cinematic matte painting",
    materialSystem: "wet asphalt, holographic glass, steel megastructures, rain haze, magenta/cyan reflections, steam vents, worn concrete",
    layoutSystem: "wide city hero, district detail panels, signage grid, transport flow diagram, street-level storyboard strip",
    motionSystem: "rainy alley walk, drone rise through traffic lanes, neon reflections, steam reveal, final skyline pullback",
    businessUse: "turn one sci-fi city idea into a complete image and video worldbuilding kit",
    description: {
      en: "A worldbuilding prompt system for sci-fi cities, environment bibles, signage systems, and cinematic flythrough videos.",
      vi: "Hệ prompt worldbuilding cho thành phố sci-fi, bible môi trường, signage và video flythrough.",
    },
  },
  {
    id: "botanical-scientific-plate-system",
    title: { en: "Botanical Scientific Plate System", vi: "Hệ bảng minh họa khoa học thực vật" },
    category: "education",
    tags: ["botanical", "scientific-illustration", "annotation", "education", "diagram"],
    priceSKT: 120,
    isFree: true,
    sellerIdx: 11,
    coverKey: "pm-37-botanical",
    exampleKeys: ["ex-14-macro-crystal", "ex-33-dewdrop"],
    models: ["flux", "midjourney", "imagen"],
    domain: "scientific illustration",
    heroSubject: "a botanical plate showing a full orchid plant, flower anatomy cross-section, root system, specimen label, color wash, and educational callouts",
    audience: "educators, museums, scientific publishers, botanical artists, and course creators",
    outputSystem: "scientific plate, anatomy diagram, specimen label sheet, macro detail crops, classroom poster",
    visualLanguage: "vintage botanical archive, watercolor realism, precise diagram annotations, museum publication layout",
    materialSystem: "cream parchment, transparent watercolor washes, graphite outlines, magnified petal veins, pollen texture, paper grain",
    layoutSystem: "large full plant, side anatomy diagrams, numbered callouts, specimen label, palette strip, magnification crops",
    motionSystem: "slow educational pan over plant parts, macro petal close-up, label reveal, final full plate hold",
    businessUse: "create educational image packs that combine beauty, technical accuracy, and clear annotations",
    description: {
      en: "A scientific illustration blueprint for botanical plates, anatomical diagrams, specimen sheets, and educational motion prompts.",
      vi: "Blueprint minh họa khoa học cho botanical plate, anatomy diagram, specimen sheet và prompt motion giáo dục.",
    },
  },
  {
    id: "mobile-ui-system-board",
    title: { en: "Mobile UI System Board", vi: "Bảng hệ thống UI mobile" },
    category: "design",
    tags: ["ui", "ux", "mobile", "design-system", "wireframe", "saas"],
    priceSKT: 130,
    sellerIdx: 6,
    coverKey: "pm-39-stained-glass",
    exampleKeys: ["ex-12-coffee-brand", "ex-29-isometric-room"],
    models: ["figma", "midjourney", "flux"],
    domain: "product UI design",
    heroSubject: "a premium mobile app design system board with screen mockups, components, typography, states, color tokens, icon grid, and interaction storyboard",
    audience: "product designers, founders, UI agencies, and no-code builders",
    outputSystem: "mobile UI board, dashboard mockup, component sheet, design tokens, onboarding interaction storyboard",
    visualLanguage: "clean SaaS product design, high-end mobile presentation, precise component states, restrained brand palette",
    materialSystem: "glass panels, subtle shadows, crisp icons, color tokens, typography scale, card components, input states",
    layoutSystem: "phone mockup hero, component rows, token grid, interaction flow, state variants, annotation side notes",
    motionSystem: "tap transition, card expand, chart load, onboarding swipe, modal open, final dashboard settle",
    businessUse: "generate product UI showcase prompts that look like a complete design-system case study",
    description: {
      en: "A UI prompt blueprint for mobile app boards, component systems, design tokens, product mockups, and interaction videos.",
      vi: "Blueprint prompt UI cho mobile board, component system, design token, mockup sản phẩm và video interaction.",
    },
  },
  {
    id: "real-estate-campaign-kit",
    title: { en: "Real Estate Campaign Kit", vi: "Bộ campaign bất động sản" },
    category: "marketing",
    tags: ["real-estate", "architecture", "campaign", "listing", "interior", "video-tour"],
    priceSKT: 145,
    sellerIdx: 4,
    coverKey: "pm-13-real-estate",
    exampleKeys: ["ex-06-brutalist-museum", "ex-03-wabisabi-bathroom"],
    videoKey: "vid-26-drone-flight",
    models: ["flux", "midjourney", "veo"],
    domain: "real estate marketing",
    heroSubject: "a luxury property campaign board with twilight exterior, staged interior, amenity callouts, listing poster, aerial map, and cinematic tour storyboard",
    audience: "realtors, property developers, interior staging teams, and listing marketers",
    outputSystem: "listing hero, social ad poster, interior detail grid, amenity board, aerial tour video prompt",
    visualLanguage: "Sotheby's-style luxury listing, architectural twilight photography, brochure-ready hierarchy, clean property callouts",
    materialSystem: "warm interior glow, pool reflections, stone texture, linen furniture, polished floors, landscaping, dusk sky gradient",
    layoutSystem: "twilight hero top, interior grid below, amenity icons, location callout, CTA/listing area, tour storyboard strip",
    motionSystem: "drone approach, pool reflection glide, doorway push-in, interior pan, amenity detail, final exterior twilight pullback",
    businessUse: "turn a property brief into a complete real estate visual marketing kit",
    description: {
      en: "A real estate prompt blueprint for listing visuals, interior staging, campaign posters, amenity boards, and cinematic video tours.",
      vi: "Blueprint prompt BĐS cho listing visual, staging nội thất, poster campaign, amenity board và video tour.",
    },
  },
  {
    id: "macro-nature-discovery-board",
    title: { en: "Macro Nature Discovery Board", vi: "Bảng khám phá thiên nhiên macro" },
    category: "education",
    tags: ["macro", "nature", "photography", "science", "texture", "educational"],
    priceSKT: 110,
    isFree: true,
    sellerIdx: 11,
    coverKey: "pm-33-macro",
    exampleKeys: ["ex-33-dewdrop", "ex-14-macro-crystal"],
    models: ["flux", "midjourney", "imagen"],
    domain: "macro photography education",
    heroSubject: "an extreme macro discovery board with dew drops, reflected micro-worlds, texture crops, lens setup notes, and educational callouts",
    audience: "science educators, macro photographers, nature creators, and visual storytellers",
    outputSystem: "macro hero image, texture study, lens/camera setup sheet, educational poster, slow macro video storyboard",
    visualLanguage: "National Geographic macro detail, scientific curiosity, gallery print texture, clean educational annotation",
    materialSystem: "water droplets, silk threads, leaf veins, crystalline reflections, morning light, shallow depth of field, bokeh circles",
    layoutSystem: "large macro hero, magnified detail crops, lens setup notes, color palette, educational labels, video beat strip",
    motionSystem: "slow macro slide, focus rack, droplet reflection reveal, light shimmer, final detail hold",
    businessUse: "build macro prompt packs that teach technique while producing beautiful showcase assets",
    description: {
      en: "A macro prompt blueprint for scientific nature boards, texture studies, camera notes, educational posters, and slow-motion video prompts.",
      vi: "Blueprint prompt macro cho nature board khoa học, texture study, note camera, poster giáo dục và prompt video slow-motion.",
    },
  },
];

const createPromptSet = (bp: PromptBlueprint, assets: AssetResolvers): SeedPrompt => {
  const style = joinList([bp.domain, bp.visualLanguage, bp.outputSystem]);
  const coverImage = assets.cover(`${bp.id}-cover`);
  const conceptBoard = assets.example(`${bp.id}-concept-board`);
  const campaignPoster = assets.example(`${bp.id}-campaign-poster`);
  const detailExample = assets.example(`${bp.id}-example-detail`);
  const videoUrl = assets.video(`${bp.id}-video-demo`);

  return {
    title: bp.title,
    category: bp.category,
    tags: bp.tags,
    priceSKT: bp.priceSKT,
    isFree: bp.isFree,
    featured: bp.featured,
    sellerIdx: bp.sellerIdx,
    description: bp.description,
    previewText: `${bp.outputSystem}: ${bp.heroSubject}`,
    coverImage,
    models: bp.models,
    prompts: buildPrompts(bp),
    examples: [
      {
        promptTitle: "Research + Concept Board",
        style,
        input: bp.heroSubject,
        output: `${bp.outputSystem} for ${bp.audience}, using ${bp.visualLanguage}, ${bp.materialSystem}, and ${bp.layoutSystem}.`,
        image: conceptBoard,
        video: videoUrl,
      },
      {
        promptTitle: "Campaign Poster System",
        style,
        input: bp.businessUse,
        output: `A commercial-ready poster and variant kit with coherent identity, clear hierarchy, production notes, and reusable image/video directions.`,
        image: campaignPoster,
      },
      {
        promptTitle: "Cinematic Video Storyboard",
        style,
        input: bp.motionSystem,
        output: `A timed storyboard with camera movement, one-action continuity, detail beats, transitions, sound notes, and a final video prompt.`,
        image: detailExample,
        video: videoUrl,
      },
    ],
  };
};

export const buildPromptMarketSeedPrompts = (assets: AssetResolvers): SeedPrompt[] =>
  BLUEPRINTS.map((bp) => createPromptSet(bp, assets));

export const buildPromptMarketAssetTasks = (): PromptMarketAssetTask[] =>
  BLUEPRINTS.flatMap((bp) => {
    const base =
      `${bp.title.en}. ${bp.businessUse}. Hero subject: ${bp.heroSubject}. ` +
      `Audience: ${bp.audience}. Visual language: ${bp.visualLanguage}. Materials: ${bp.materialSystem}.`;

    return [
      {
        id: `${bp.id}-cover`,
        packId: bp.id,
        type: "image",
        role: "cover",
        aspectRatio: "16:9",
        prompt:
          `${base} Create the flagship cover image for Prompt Market: one striking hero visual, premium lighting, clear focal point, refined composition, no messy text, no watermark.`,
      },
      {
        id: `${bp.id}-concept-board`,
        packId: bp.id,
        type: "image",
        role: "technical-board",
        aspectRatio: "4:5",
        prompt:
          `${base} Create a complex concept board: central hero output, left reference/material swatches, right technical annotations, callout arrows, palette chips, detail crops, and bottom variant strip. Layout: ${bp.layoutSystem}.`,
      },
      {
        id: `${bp.id}-campaign-poster`,
        packId: bp.id,
        type: "image",
        role: "poster",
        aspectRatio: "4:5",
        prompt:
          `${base} Create a finished campaign poster system with hero image, headline-safe zone, badge module, feature icon row, CTA block, brand placeholder, and three bottom variants. Commercial, readable, premium.`,
      },
      {
        id: `${bp.id}-example-detail`,
        packId: bp.id,
        type: "image",
        role: "example",
        aspectRatio: "1:1",
        prompt:
          `${base} Create a close-up example output focused on tactile details and production quality: ${bp.materialSystem}. Macro detail, controlled depth of field, premium presentation.`,
      },
      {
        id: `${bp.id}-thumbnail`,
        packId: bp.id,
        type: "image",
        role: "thumbnail",
        aspectRatio: "16:9",
        prompt:
          `${base} Create a marketplace thumbnail-safe hero crop with strong silhouette, clean negative space, clear subject readability at small size, and cohesive palette.`,
      },
      {
        id: `${bp.id}-video-demo`,
        packId: bp.id,
        type: "video",
        role: "video-demo",
        aspectRatio: bp.id === "anime-action-storyboard" || bp.id === "cozy-character-video-board" ? "16:9" : "16:9",
        prompt:
          `${base} Create an 8-second cinematic video. Motion plan: ${bp.motionSystem}. One clear action, smooth continuity, camera movement specified by the scene, tactile sensory detail, final hero frame.`,
      },
    ];
  });
