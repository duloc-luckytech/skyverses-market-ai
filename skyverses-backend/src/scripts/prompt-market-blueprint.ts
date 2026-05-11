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

const FOOD_BLUEPRINTS: PromptBlueprint[] = [
  {
    id: "seafood-night-market-campaign",
    title: { en: "Seafood Night Market Campaign Board", vi: "Bảng campaign chợ đêm hải sản" },
    category: "marketing",
    tags: ["food", "seafood", "night-market", "restaurant", "poster", "video"],
    priceSKT: 150,
    featured: true,
    sellerIdx: 1,
    coverKey: "seafood-night-market-campaign-cover",
    exampleKeys: [],
    models: ["flux", "midjourney", "imagen"],
    domain: "seafood restaurant advertising",
    heroSubject: "a sizzling seafood night market spread with grilled lobster, scallops, prawns, chili lime sauce, steam, neon stall signage, menu callouts, and social poster modules",
    audience: "seafood restaurants, night market vendors, food delivery brands, and social ad designers",
    outputSystem: "seafood campaign poster, menu board, ingredient callout sheet, social ad variants, and cinematic grill video",
    visualLanguage: "premium Asian night market photography, neon highlights, editorial food poster layout, appetizing steam and sauce motion",
    materialSystem: "charred lobster shell, glossy prawn glaze, crushed ice, lime wedges, chili oil, sea salt, metal grill marks, handwritten menu labels",
    layoutSystem: "large grill hero, side ingredient callouts, price badge, flavor icons, bottom menu variants, vertical social crop guides",
    motionSystem: "slow push through steam, sauce brush on lobster, flame kiss, prawn flip, lime squeeze, final table hero reveal",
    businessUse: "turn a seafood menu into a high-conversion visual campaign kit",
    description: {
      en: "A seafood advertising blueprint for night market posters, menu boards, ingredient callouts, social variants, and grill-video prompts.",
      vi: "Blueprint quảng cáo hải sản cho poster chợ đêm, menu board, callout nguyên liệu, biến thể social và prompt video nướng.",
    },
  },
  {
    id: "luxury-oyster-bar-launch-kit",
    title: { en: "Luxury Oyster Bar Launch Kit", vi: "Bộ launch bar hàu cao cấp" },
    category: "marketing",
    tags: ["oyster", "seafood", "luxury", "fine-dining", "menu", "campaign"],
    priceSKT: 170,
    featured: true,
    sellerIdx: 1,
    coverKey: "luxury-oyster-bar-launch-kit-cover",
    exampleKeys: [],
    models: ["flux", "midjourney", "imagen"],
    domain: "luxury seafood hospitality",
    heroSubject: "a chilled oyster bar launch board with oysters on crushed ice, pearl highlights, champagne pairing, mignonette spoons, menu typography zones, and provenance map notes",
    audience: "fine dining restaurants, hotel bars, oyster farms, and premium seafood marketers",
    outputSystem: "luxury launch poster, oyster provenance sheet, pairing board, social menu kit, and cinematic pouring video",
    visualLanguage: "editorial fine dining photography, pearl and slate palette, restrained typography, Michelin-style menu composition",
    materialSystem: "crushed ice, oyster shell nacre, champagne bubbles, silver trays, lemon peel mist, linen napkins, black slate, pearl reflections",
    layoutSystem: "hero platter center, pairing notes right, provenance map left, tasting menu strip, premium badge and reservation CTA",
    motionSystem: "champagne pour, ice sparkle, oyster opening close-up, lemon mist, server hand placement, final candlelit table hold",
    businessUse: "create a premium seafood launch kit for high-end hospitality brands",
    description: {
      en: "A fine dining oyster prompt pack for launch posters, pairing boards, provenance visuals, social menus, and cinematic bar videos.",
      vi: "Bộ prompt hàu fine dining cho poster launch, pairing board, provenance visual, social menu và video bar điện ảnh.",
    },
  },
  {
    id: "vietnamese-street-food-storyboard",
    title: { en: "Vietnamese Street Food Storyboard", vi: "Storyboard ẩm thực đường phố Việt" },
    category: "marketing",
    tags: ["vietnamese-food", "street-food", "banh-mi", "pho", "storyboard", "video"],
    priceSKT: 140,
    sellerIdx: 1,
    coverKey: "vietnamese-street-food-storyboard-cover",
    exampleKeys: [],
    models: ["flux", "midjourney", "imagen"],
    domain: "street food visual storytelling",
    heroSubject: "a Vietnamese street food board featuring banh mi, pho steam, grilled skewers, herbs, motorbike delivery, vendor hands, hand-painted menu signs, and cinematic sequence panels",
    audience: "street food brands, Vietnamese restaurants, travel creators, delivery campaigns, and food vloggers",
    outputSystem: "street food hero board, vendor story sheet, menu poster, delivery ad variants, and short food video storyboard",
    visualLanguage: "warm documentary food photography, Saigon street texture, hand-painted signage, cinematic travel-food layout",
    materialSystem: "crispy baguette crust, pho broth steam, fresh herbs, chili slices, grilled pork char, metal carts, plastic stools, morning light",
    layoutSystem: "hero street stall frame, ingredient close-ups, vendor action panels, menu strip, delivery CTA, travel map notes",
    motionSystem: "baguette crack, broth ladle steam, herb drop, grill smoke drift, motorbike pass-by, final handheld hero bite",
    businessUse: "build an authentic Vietnamese street food campaign with image and video assets",
    description: {
      en: "A street-food prompt blueprint for Vietnamese menu boards, documentary posters, ingredient close-ups, and short-form video storyboards.",
      vi: "Blueprint prompt street-food Việt cho menu board, poster documentary, close-up nguyên liệu và storyboard video ngắn.",
    },
  },
  {
    id: "sushi-omakase-menu-board",
    title: { en: "Sushi Omakase Menu Board", vi: "Bảng menu sushi omakase" },
    category: "marketing",
    tags: ["sushi", "omakase", "seafood", "menu", "restaurant", "luxury"],
    priceSKT: 165,
    sellerIdx: 1,
    coverKey: "sushi-omakase-menu-board-cover",
    exampleKeys: [],
    models: ["flux", "midjourney", "imagen"],
    domain: "Japanese restaurant art direction",
    heroSubject: "an omakase sushi menu board with chef hand, tuna akami, uni, ikura, scallop, ceramic plates, washi labels, sequence notes, and pairing cards",
    audience: "sushi restaurants, omakase counters, Japanese food brands, and premium menu designers",
    outputSystem: "omakase menu poster, course sequence board, ingredient provenance sheet, reservation ad, and chef-hand video prompt",
    visualLanguage: "minimal Japanese editorial design, dark wood counter, washi paper labels, macro seafood texture, restrained luxury",
    materialSystem: "glossy tuna, sea urchin folds, salmon roe pearls, polished rice grains, bamboo brush, ceramic glaze, hinoki wood",
    layoutSystem: "course sequence grid, large hero nigiri, chef note margins, ingredient labels, pairing strip, reservation CTA",
    motionSystem: "chef brushes soy, places nigiri, roe glistens, knife slice close-up, slow counter slide, final omakase lineup",
    businessUse: "turn a sushi tasting menu into premium stills, boards, and video prompts",
    description: {
      en: "A Japanese omakase prompt pack for elegant menu boards, course sequence visuals, ingredient sheets, ads, and chef-action videos.",
      vi: "Bộ prompt omakase Nhật cho menu board tinh tế, visual course, sheet nguyên liệu, ads và video thao tác chef.",
    },
  },
  {
    id: "brown-sugar-boba-launch-kit",
    title: { en: "Brown Sugar Boba Tea Launch Kit", vi: "Bộ launch trà sữa trân châu đường đen" },
    category: "marketing",
    tags: ["milk-tea", "boba", "brown-sugar", "drink", "poster", "social-ads"],
    priceSKT: 145,
    featured: true,
    sellerIdx: 1,
    coverKey: "brown-sugar-boba-launch-kit-cover",
    exampleKeys: [],
    models: ["flux", "midjourney", "imagen"],
    domain: "bubble tea product launch",
    heroSubject: "a brown sugar boba milk tea launch board with tiger sugar streaks, chewy pearls, cream cap swirl, sealed cup label, flavor variants, offer badges, and social CTA modules",
    audience: "milk tea shops, beverage chains, cafe marketers, and social media designers",
    outputSystem: "boba hero poster, flavor variant strip, offer badge system, menu board, and satisfying pour video",
    visualLanguage: "playful premium drink advertising, glossy cup photography, creamy caramel palette, bold social commerce layout",
    materialSystem: "brown sugar syrup streaks, tapioca pearls, cold condensation, cream foam, plastic cup reflections, caramel drizzle, ice cubes",
    layoutSystem: "oversized cup hero, flavor cards below, price badge, delivery CTA, ingredient icons, vertical story crop zones",
    motionSystem: "brown sugar syrup sliding down cup, pearls bouncing, milk pour swirl, seal pop, ice clink, final cup rotation",
    businessUse: "create a complete bubble tea launch campaign with appetizing images and short video prompts",
    description: {
      en: "A boba launch blueprint for milk tea hero posters, menu variants, offer badges, social ads, and pour-motion videos.",
      vi: "Blueprint launch trà sữa cho hero poster, menu variant, offer badge, social ads và video rót hấp dẫn.",
    },
  },
  {
    id: "tropical-smoothie-poster-system",
    title: { en: "Tropical Smoothie Poster System", vi: "Hệ poster sinh tố nhiệt đới" },
    category: "marketing",
    tags: ["smoothie", "drink", "fruit", "summer", "poster", "campaign"],
    priceSKT: 135,
    sellerIdx: 1,
    coverKey: "tropical-smoothie-poster-system-cover",
    exampleKeys: [],
    models: ["flux", "midjourney", "imagen"],
    domain: "summer beverage advertising",
    heroSubject: "a tropical smoothie campaign with mango, dragon fruit, pineapple, coconut, fruit splash, chilled cups, flavor tiles, nutrition icons, and summer CTA modules",
    audience: "juice bars, smoothie shops, wellness cafes, resort F&B teams, and summer campaign designers",
    outputSystem: "summer smoothie poster, flavor tile board, nutrition icon set, social ad variants, and fruit-splash video prompt",
    visualLanguage: "bright tropical commercial photography, juicy high-speed splash, clean wellness typography, colorful summer layout",
    materialSystem: "mango pulp, dragon fruit seeds, pineapple wedges, coconut cream, condensation, crushed ice, sunlit glass, fruit droplets",
    layoutSystem: "central splash hero, three flavor cards, nutrition icons, seasonal badge, CTA strip, mobile story crop guides",
    motionSystem: "fruit drop splash, blender swirl, ice tumble, straw insert, condensation bead slide, final flavor lineup",
    businessUse: "produce a bright beverage campaign kit for summer menus and social ads",
    description: {
      en: "A tropical drink prompt system for smoothie posters, flavor boards, nutrition visuals, social ads, and splash videos.",
      vi: "Hệ prompt đồ uống nhiệt đới cho poster smoothie, flavor board, visual dinh dưỡng, social ads và video splash.",
    },
  },
  {
    id: "sparkling-fruit-tea-campaign",
    title: { en: "Sparkling Fruit Tea Campaign", vi: "Campaign trà trái cây sparkling" },
    category: "marketing",
    tags: ["fruit-tea", "sparkling", "drink", "tea", "summer", "social-ads"],
    priceSKT: 130,
    sellerIdx: 1,
    coverKey: "sparkling-fruit-tea-campaign-cover",
    exampleKeys: [],
    models: ["flux", "midjourney", "imagen"],
    domain: "fruit tea beverage campaign",
    heroSubject: "a sparkling fruit tea board with citrus slices, peach cubes, jasmine tea, bubbles, transparent cups, ice, botanical garnish, flavor labels, and social offer modules",
    audience: "tea shops, beverage chains, summer popups, and delivery app marketers",
    outputSystem: "fruit tea poster, flavor matrix, ingredient board, promo badge kit, and bubbly pour video",
    visualLanguage: "fresh transparent drink photography, botanical tea notes, clean pastel label design, crisp social ad structure",
    materialSystem: "tea amber gradients, carbonated bubbles, citrus pulp, peach cubes, mint leaves, ice clarity, condensation, glass reflections",
    layoutSystem: "clear cup hero, floating fruit callouts, flavor grid, promo tag, freshness icons, vertical story variants",
    motionSystem: "sparkling pour, bubbles rising, citrus drop, ice clink, garnish placement, final refreshing condensation hold",
    businessUse: "turn fruit tea recipes into a polished campaign system for menus and ads",
    description: {
      en: "A sparkling fruit tea prompt kit for fresh drink posters, flavor matrices, ingredient boards, offer graphics, and pour videos.",
      vi: "Bộ prompt trà trái cây sparkling cho poster tươi mát, flavor matrix, ingredient board, offer graphic và video rót.",
    },
  },
  {
    id: "artisanal-coffee-brew-board",
    title: { en: "Artisanal Coffee Brew Board", vi: "Bảng brew cà phê thủ công" },
    category: "marketing",
    tags: ["coffee", "cafe", "brew", "menu", "lifestyle", "video"],
    priceSKT: 150,
    sellerIdx: 1,
    coverKey: "artisanal-coffee-brew-board-cover",
    exampleKeys: [],
    models: ["flux", "midjourney", "imagen"],
    domain: "specialty coffee visual identity",
    heroSubject: "a specialty coffee brew board with espresso crema, pour-over spiral, beans, grinder, origin cards, tasting notes, cafe lifestyle frame, and menu modules",
    audience: "specialty cafes, roasters, coffee educators, and lifestyle content teams",
    outputSystem: "coffee origin board, brew guide poster, tasting note cards, cafe social variants, and pour-over video prompt",
    visualLanguage: "specialty cafe editorial photography, warm morning light, tactile paper labels, roaster brand system layout",
    materialSystem: "espresso crema, roasted beans, ceramic dripper, paper filter, steam, grinder burrs, linen cloth, wood counter",
    layoutSystem: "hero cup and brew setup, origin map cards, tasting notes, brew steps, product shelf, cafe CTA area",
    motionSystem: "coffee bloom, spiral pour, espresso drip, steam rise, bean scoop, final cup slide into sunlight",
    businessUse: "create a specialty coffee prompt pack for roasters and cafes",
    description: {
      en: "A coffee prompt blueprint for origin boards, brew guides, tasting notes, cafe ads, and cinematic pour-over videos.",
      vi: "Blueprint prompt cà phê cho origin board, brew guide, tasting note, cafe ads và video pour-over điện ảnh.",
    },
  },
  {
    id: "matcha-dessert-cafe-visual-bible",
    title: { en: "Matcha Dessert Cafe Visual Bible", vi: "Visual bible cafe dessert matcha" },
    category: "marketing",
    tags: ["matcha", "dessert", "cafe", "menu", "poster", "japanese"],
    priceSKT: 145,
    sellerIdx: 1,
    coverKey: "matcha-dessert-cafe-visual-bible-cover",
    exampleKeys: [],
    models: ["flux", "midjourney", "imagen"],
    domain: "dessert cafe visual system",
    heroSubject: "a matcha dessert cafe board with matcha latte, mille crepe, soft serve, mochi, powder dusting, ceramic bowls, menu cards, and seasonal poster modules",
    audience: "dessert cafes, Japanese tea houses, bakery brands, and menu designers",
    outputSystem: "matcha dessert poster, menu board, product family sheet, seasonal campaign variants, and powder-dusting video",
    visualLanguage: "soft Japanese cafe editorial, muted green palette, clean menu typography, airy dessert styling",
    materialSystem: "matcha powder, whipped cream, mochi texture, crepe layers, ceramic glaze, bamboo whisk, milk foam, paper menu cards",
    layoutSystem: "hero dessert stack, drink pairing, product family grid, ingredient notes, seasonal badge, cafe CTA",
    motionSystem: "matcha powder dust, latte pour, spoon cut through crepe, soft serve swirl, mochi bounce, final table reveal",
    businessUse: "build a cohesive matcha cafe campaign across images, menus, and short videos",
    description: {
      en: "A matcha dessert prompt pack for cafe menus, product family visuals, seasonal posters, social ads, and powder-motion videos.",
      vi: "Bộ prompt dessert matcha cho menu cafe, visual product family, poster mùa, social ads và video rắc bột.",
    },
  },
  {
    id: "premium-hotpot-restaurant-kit",
    title: { en: "Premium Hotpot Restaurant Kit", vi: "Bộ visual nhà hàng lẩu cao cấp" },
    category: "marketing",
    tags: ["hotpot", "restaurant", "food", "menu", "asian", "video"],
    priceSKT: 155,
    sellerIdx: 1,
    coverKey: "premium-hotpot-restaurant-kit-cover",
    exampleKeys: [],
    models: ["flux", "midjourney", "imagen"],
    domain: "Asian restaurant campaign design",
    heroSubject: "a premium hotpot campaign board with divided broth pot, wagyu slices, seafood platter, mushrooms, dipping sauce, steam, menu callouts, and group dining scene",
    audience: "hotpot restaurants, buffet chains, food delivery brands, and seasonal dining campaigns",
    outputSystem: "hotpot hero poster, ingredient platter board, menu grid, group dining ad variants, and steam video prompt",
    visualLanguage: "warm restaurant table photography, premium Asian dining layout, steam-rich atmosphere, readable menu hierarchy",
    materialSystem: "red chili broth, clear herbal broth, marbled beef, shrimp, mushrooms, tofu, sesame sauce, lacquered chopsticks, steam",
    layoutSystem: "central hotpot hero, ingredient ring, broth labels, combo menu cards, reservation CTA, group table panel",
    motionSystem: "broth simmer, beef slice dip, steam billow, sauce stir, seafood placement, final overhead table reveal",
    businessUse: "create high-performing hotpot restaurant campaign assets for menus and social ads",
    description: {
      en: "A hotpot prompt blueprint for restaurant posters, ingredient boards, menu combos, group-dining ads, and simmering videos.",
      vi: "Blueprint prompt lẩu cho poster nhà hàng, board nguyên liệu, combo menu, ads nhóm ăn và video sôi nóng.",
    },
  },
  {
    id: "mediterranean-seafood-platter-board",
    title: { en: "Mediterranean Seafood Platter Board", vi: "Bảng platter hải sản Địa Trung Hải" },
    category: "marketing",
    tags: ["seafood", "mediterranean", "restaurant", "platter", "summer", "menu"],
    priceSKT: 150,
    sellerIdx: 1,
    coverKey: "mediterranean-seafood-platter-board-cover",
    exampleKeys: [],
    models: ["flux", "midjourney", "imagen"],
    domain: "Mediterranean restaurant advertising",
    heroSubject: "a Mediterranean seafood platter board with grilled octopus, mussels, prawns, lemon, olives, herbs, ceramic plates, coastal sunlight, menu labels, and wine pairing notes",
    audience: "Mediterranean restaurants, beach clubs, resort dining teams, and seafood marketers",
    outputSystem: "seafood platter poster, coastal menu board, pairing sheet, summer social variants, and table-side serving video",
    visualLanguage: "sunlit coastal food editorial, blue-white ceramic palette, rustic premium menu layout, resort dining atmosphere",
    materialSystem: "grilled octopus char, mussel shells, olive oil shine, lemon zest, sea salt flakes, ceramic glaze, linen, coastal light",
    layoutSystem: "large platter hero, pairing notes, ingredient callouts, coastal map accent, price/reservation badge, variant strip",
    motionSystem: "olive oil drizzle, lemon squeeze, plate set-down, herb sprinkle, sea breeze linen movement, final overhead feast",
    businessUse: "turn a seafood platter menu into a resort-quality campaign kit",
    description: {
      en: "A Mediterranean seafood prompt pack for platter posters, menu boards, pairing visuals, summer ads, and serving videos.",
      vi: "Bộ prompt hải sản Địa Trung Hải cho platter poster, menu board, pairing visual, summer ads và video phục vụ.",
    },
  },
  {
    id: "gelato-flavor-campaign-system",
    title: { en: "Gelato Flavor Campaign System", vi: "Hệ campaign vị gelato" },
    category: "marketing",
    tags: ["gelato", "ice-cream", "dessert", "flavor", "poster", "summer"],
    priceSKT: 135,
    sellerIdx: 1,
    coverKey: "gelato-flavor-campaign-system-cover",
    exampleKeys: [],
    models: ["flux", "midjourney", "imagen"],
    domain: "dessert product advertising",
    heroSubject: "a gelato flavor campaign board with pistachio, strawberry, chocolate, vanilla bean, scoops, cones, flavor tiles, shop signage, and summer promo badges",
    audience: "gelato shops, ice cream brands, dessert marketers, and summer popup teams",
    outputSystem: "gelato hero poster, flavor tile grid, menu board, seasonal social variants, and scoop-motion video",
    visualLanguage: "Italian gelateria editorial, pastel yet premium palette, tactile creamy textures, friendly retail poster layout",
    materialSystem: "creamy gelato ridges, waffle cones, pistachio crumbs, strawberry pulp, chocolate curls, chilled metal tubs, paper cups",
    layoutSystem: "hero scoop stack, flavor grid below, promo badge, ingredient callouts, shop sign zone, social crop guides",
    motionSystem: "scoop curl, cone placement, topping sprinkle, chocolate drizzle, freezer mist, final flavor lineup",
    businessUse: "create a dessert campaign system that sells flavors clearly across posters and short videos",
    description: {
      en: "A gelato prompt blueprint for flavor posters, menu boards, seasonal variants, ingredient visuals, and scoop-motion videos.",
      vi: "Blueprint prompt gelato cho poster vị, menu board, biến thể mùa, visual nguyên liệu và video múc kem.",
    },
  },
  {
    id: "bakery-croissant-morning-board",
    title: { en: "Bakery Croissant Morning Board", vi: "Bảng campaign croissant buổi sáng" },
    category: "marketing",
    tags: ["bakery", "croissant", "breakfast", "cafe", "poster", "lifestyle"],
    priceSKT: 135,
    sellerIdx: 1,
    coverKey: "bakery-croissant-morning-board-cover",
    exampleKeys: [],
    models: ["flux", "midjourney", "imagen"],
    domain: "bakery cafe campaign",
    heroSubject: "a morning bakery campaign board with flaky croissants, coffee cup, butter, jam, flour dust, bakery window light, menu cards, combo offer badge, and lifestyle table scene",
    audience: "bakeries, cafes, hotel breakfast teams, and pastry brands",
    outputSystem: "bakery hero poster, pastry menu board, breakfast combo ads, ingredient sheet, and flaky tear video",
    visualLanguage: "warm European bakery editorial, golden morning light, tactile pastry close-ups, cozy cafe poster system",
    materialSystem: "laminated pastry layers, butter sheen, berry jam, flour dust, ceramic cup, parchment paper, wood table, window sunlight",
    layoutSystem: "hero pastry table, combo cards, ingredient callouts, morning badge, menu strip, cafe CTA",
    motionSystem: "croissant tear, steam from coffee, jam spoon spread, flour dust drift, butter melt, final breakfast table reveal",
    businessUse: "build a bakery breakfast campaign with premium stills and cozy motion prompts",
    description: {
      en: "A bakery prompt kit for croissant posters, breakfast combo boards, pastry menus, ingredient visuals, and cozy morning videos.",
      vi: "Bộ prompt bakery cho poster croissant, breakfast combo board, menu bánh, visual nguyên liệu và video sáng ấm áp.",
    },
  },
  {
    id: "fine-dining-tasting-menu-storyboard",
    title: { en: "Fine Dining Tasting Menu Storyboard", vi: "Storyboard tasting menu fine dining" },
    category: "marketing",
    tags: ["fine-dining", "tasting-menu", "restaurant", "plating", "luxury", "video"],
    priceSKT: 175,
    featured: true,
    sellerIdx: 1,
    coverKey: "fine-dining-tasting-menu-storyboard-cover",
    exampleKeys: [],
    models: ["flux", "midjourney", "imagen"],
    domain: "fine dining tasting menu direction",
    heroSubject: "a fine dining tasting menu storyboard with chef plating tweezers, sauce dots, microgreens, ceramic plates, course cards, wine pairing notes, and cinematic service beats",
    audience: "fine dining restaurants, hotel F&B teams, chef brands, and premium hospitality marketers",
    outputSystem: "tasting menu concept board, course card system, plating detail sheet, reservation campaign, and service video storyboard",
    visualLanguage: "Michelin-level plating photography, dark elegant table setting, precise annotations, refined hospitality campaign design",
    materialSystem: "glossy sauce dots, microgreens, ceramic glaze, brushed cutlery, wine glass reflections, linen folds, tweezers, candlelight",
    layoutSystem: "hero plated course, course timeline, plating callouts, pairing notes, reservation CTA, detail macro strip",
    motionSystem: "tweezer garnish placement, sauce pour, cloche lift, wine swirl, candle flicker, final chef pass reveal",
    businessUse: "create a luxury tasting menu campaign and video-ready storyboard for restaurant launches",
    description: {
      en: "A fine dining prompt system for tasting menu boards, plating sheets, course cards, reservation ads, and service videos.",
      vi: "Hệ prompt fine dining cho tasting menu board, plating sheet, course card, ads đặt bàn và video phục vụ.",
    },
  },
  {
    id: "korean-bbq-tabletop-campaign",
    title: { en: "Korean BBQ Tabletop Campaign", vi: "Campaign bàn nướng BBQ Hàn" },
    category: "marketing",
    tags: ["korean-bbq", "restaurant", "grill", "food", "menu", "video"],
    priceSKT: 145,
    sellerIdx: 1,
    coverKey: "korean-bbq-tabletop-campaign-cover",
    exampleKeys: [],
    models: ["flux", "midjourney", "imagen"],
    domain: "Korean restaurant campaign design",
    heroSubject: "a Korean BBQ tabletop campaign with marbled beef, pork belly, banchan dishes, tabletop grill, smoke, lettuce wraps, sauce bowls, menu set cards, and group dining energy",
    audience: "Korean BBQ restaurants, buffet chains, food delivery promos, and social ad creators",
    outputSystem: "KBBQ hero poster, set menu board, banchan callout sheet, group dining social variants, and grill video prompt",
    visualLanguage: "energetic Korean tabletop food photography, smoky grill atmosphere, bold menu cards, social-friendly restaurant layout",
    materialSystem: "marbled beef, pork belly char, sesame oil shine, kimchi texture, metal grill, lettuce leaves, smoke, sauce glaze",
    layoutSystem: "central tabletop grill, banchan ring, set menu cards, price badge, group table moment, CTA strip",
    motionSystem: "meat sizzle, tongs flip, smoke rise, lettuce wrap assembly, sauce dip, final shared table reveal",
    businessUse: "turn KBBQ menu sets into high-energy posters and short video prompts",
    description: {
      en: "A Korean BBQ prompt pack for tabletop posters, set menus, banchan visuals, group dining ads, and sizzling grill videos.",
      vi: "Bộ prompt BBQ Hàn cho poster bàn nướng, set menu, visual banchan, ads nhóm ăn và video nướng xèo xèo.",
    },
  },
];

const ALL_BLUEPRINTS = [...BLUEPRINTS, ...FOOD_BLUEPRINTS];

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
  ALL_BLUEPRINTS.map((bp) => createPromptSet(bp, assets));

export const buildPromptMarketAssetTasks = (): PromptMarketAssetTask[] =>
  ALL_BLUEPRINTS.flatMap((bp) => {
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
