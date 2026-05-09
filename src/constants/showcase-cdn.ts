/**
 * Model Showcase CDN data — Banana Pro images + Veo3 videos
 * Auto-generated from gen_showcase scripts — May 2026
 *
 * Images: Cloudflare CDN via imagedelivery.net (uploaded from local showcase)
 * Videos: Cloudflare Stream CDN URLs (Veo 3)
 */

// ─── Types ────────────────────────────────────────────────────
export interface ShowcaseImage {
  id: string;
  name: string;
  product: string;
  character: string;
  img: string;
  ratio: '16:9' | '1:1' | '9:16';
  tag: string;
  prompt: string;
}

export interface ShowcaseVideo {
  id: string;
  name: string;
  product: string;
  character: string;
  videoUrl: string;
  thumb: string; // use corresponding BP image as thumbnail/reference
  mode: 'text-to-video' | 'image-to-video' | 'ingredient';
  prompt: string;
}

// ─── Banana Pro Images (35) ───────────────────────────────────
export const SHOWCASE_IMAGES: ShowcaseImage[] = [
  // KORA — Bone Tribe Warrior (5)
  {
    id: 'bp-kora-hero', name: 'Kora — Hero', product: 'KORA — Bone Tribe Warrior', character: 'kora',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-kora-hero/public', ratio: '16:9', tag: 'hero',
    prompt: 'Cinematic action shot of a young anime-style jungle warrior girl with wild green hair and a leaf headdress, wearing tribal bone armor with skull pauldrons and striped leg wraps, mid-swing with a massive bone club striking a giant panda in a lush tropical jungle, dynamic motion with leaves and debris flying, volumetric sunlight filtering through the canopy, Unreal Engine 5 quality, game cinematic screenshot, photorealistic render with stylized anime proportions, shot on Hasselblad',
  },
  {
    id: 'bp-kora-turnaround', name: 'Kora — Turnaround', product: 'KORA — Bone Tribe Warrior', character: 'kora',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-kora-turnaround/public', ratio: '1:1', tag: 'turnaround',
    prompt: 'Professional game character turnaround reference sheet showing a young anime warrior girl with green hair and leaf headdress, tribal bone armor with skull accessories and striped wrappings, displayed in 8 poses on a clean neutral gray background: front view, back view, left side, right side, three-quarter front, three-quarter back, action combat pose, and crouching pose, consistent lighting and proportions across all views, concept art character sheet layout for 3D modeler reference, clean separation between poses, labeled orthographic views',
  },
  {
    id: 'bp-kora-3d', name: 'Kora — 3D Render', product: 'KORA — Bone Tribe Warrior', character: 'kora',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-kora-3d/public', ratio: '1:1', tag: '3d',
    prompt: 'Clean full-body 3D character render of a young anime-style jungle warrior girl with wild green hair and leaf headdress, wearing tribal bone armor with skull pauldrons, striped leg wraps, and carrying a massive bone club resting on her shoulder, standing in a confident idle pose, soft studio lighting with rim light, neutral gradient background from dark gray to light gray, game character model presentation, high-polygon render with subsurface scattering on skin, PBR materials on armor, figurine collectible quality',
  },
  {
    id: 'bp-kora-details', name: 'Kora — Details', product: 'KORA — Bone Tribe Warrior', character: 'kora',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-kora-details/public', ratio: '1:1', tag: 'details',
    prompt: 'Detailed prop and accessory reference sheet for a tribal jungle warrior character: close-up views of a massive bone club weapon with carved runes and leather wrapping, a skull shoulder pad with glowing green gem eye, striped leg wrappings with hidden dagger, leaf headdress with feather ornaments, bone necklace with animal teeth, belt pouch made of woven vines, each item displayed individually on clean dark background with multiple angles and material callouts, game asset concept art style, ultra-detailed rendering',
  },
  {
    id: 'bp-kora-environment', name: 'Kora — Environment', product: 'KORA — Bone Tribe Warrior', character: 'kora',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-kora-environment/public', ratio: '16:9', tag: 'environment',
    prompt: 'Lush tropical jungle game environment concept art, ancient stone ruins overgrown with vines and moss, a clearing with a tribal campfire surrounded by carved bone totems, massive tree roots forming natural archways, bioluminescent mushrooms glowing softly in shadowed areas, a misty waterfall visible in the background, volumetric god rays piercing through the dense canopy, a worn dirt path leading deeper into the jungle, Unreal Engine 5 environment art, wide establishing shot, photorealistic with painterly atmosphere',
  },

  // ZERO — Ghost Frame Operator (5)
  {
    id: 'bp-zero-hero', name: 'Zero — Hero', product: 'ZERO — Ghost Frame Operator', character: 'zero',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-zero-hero/public', ratio: '16:9', tag: 'hero',
    prompt: 'Cinematic wide shot of a sleek white and crimson bipedal mech suit sprinting through a destroyed futuristic city at night, one arm transformed into a plasma cannon firing a beam of blue energy that illuminates the rain and debris, explosions erupting in the background, the pilot visible through the glowing blue cockpit visor, dynamic low-angle shot with motion blur on the legs, sparks and shrapnel flying, AAA game cinematic quality, Armored Core and Gundam inspired design, photorealistic 4K render',
  },
  {
    id: 'bp-zero-turnaround', name: 'Zero — Turnaround', product: 'ZERO — Ghost Frame Operator', character: 'zero',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-zero-turnaround/public', ratio: '1:1', tag: 'turnaround',
    prompt: 'Professional mech design turnaround reference sheet showing a sleek bipedal combat mech in white and crimson color scheme, displayed in 6 views on clean dark blue technical background: front orthographic, back orthographic, left side, right side, three-quarter action pose with plasma cannon deployed, and seated cockpit-open view showing the pilot inside, height comparison silhouette with human figure, technical annotations and armor panel lines visible, mecha concept art sheet for 3D production, clean consistent lighting',
  },
  {
    id: 'bp-zero-cockpit', name: 'Zero — Cockpit', product: 'ZERO — Ghost Frame Operator', character: 'zero',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-zero-cockpit/public', ratio: '16:9', tag: 'cockpit',
    prompt: 'Detailed interior view of a futuristic mech cockpit, the pilot strapped into a form-fitting seat surrounded by holographic displays showing radar, weapon systems, and shield status, dual control sticks with haptic feedback panels, a heads-up display projected on the curved windshield showing targeting reticle, ambient blue lighting from instruments, warning labels in Japanese text on panels, cables and hydraulic lines visible in the ceiling, sci-fi game UI design reference, ultra-detailed close-up render, cinematic atmosphere',
  },
  {
    id: 'bp-zero-weapons', name: 'Zero — Weapons', product: 'ZERO — Ghost Frame Operator', character: 'zero',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-zero-weapons/public', ratio: '1:1', tag: 'weapons',
    prompt: 'Technical blueprint-style weapon systems breakdown for a combat mech, dark navy blue background with white and cyan line art: arm-mounted plasma cannon with cross-section showing energy core, shoulder missile pod array with 8 tubes, hip-mounted energy blade in deployed and stowed positions, chest-mounted point-defense laser grid, back-mounted thruster pack with fuel lines, each weapon shown in multiple views with dimension lines and Japanese technical labels, military spec sheet aesthetic, clean vector illustration quality',
  },
  {
    id: 'bp-zero-pilot', name: 'Zero — Pilot', product: 'ZERO — Ghost Frame Operator', character: 'zero',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-zero-pilot/public', ratio: '1:1', tag: 'pilot',
    prompt: 'Full-body character render of a young male mech pilot in a sleek white and crimson flight suit with black accents, short silver hair, confident smirk, holding a helmet under one arm with the visor glowing blue, the other hand resting on his hip, dog tags hanging from neck, flight suit has subtle panel lines and status LEDs on the chest, soft studio lighting, clean gradient background, anime-influenced proportions with realistic rendering, game character portrait quality, 4K',
  },

  // MALACHAR — The Undying King (5)
  {
    id: 'bp-malachar-hero', name: 'Malachar — Hero', product: 'MALACHAR — The Undying King', character: 'malachar',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-malachar-hero/public', ratio: '16:9', tag: 'hero',
    prompt: 'Epic boss encounter cinematic screenshot from a dark fantasy action RPG, a colossal skeletal king wreathed in ghostly green flames sitting on a throne of fused swords and bones in a massive crumbling cathedral, the player character tiny in the foreground approaching with sword drawn, dramatic scale difference emphasizing the boss size, shafts of moonlight through broken stained glass windows, atmospheric fog and floating ember particles, Dark Souls and Elden Ring inspired, ultra-wide cinematic composition, 4K',
  },
  {
    id: 'bp-malachar-turnaround', name: 'Malachar — Turnaround', product: 'MALACHAR — The Undying King', character: 'malachar',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-malachar-turnaround/public', ratio: '1:1', tag: 'turnaround',
    prompt: 'Dark fantasy boss character turnaround reference sheet showing a colossal skeletal king in corroded black armor with a tattered cape, a crown of twisted iron fused to the skull, ghostly green flames burning from the eye sockets and chest cavity, wielding a massive serrated greatsword, displayed in 6 views on dark background: front, back, left side, right side, attacking pose with sword raised, and defeated crumbling pose, size comparison with normal human figure showing 4x height, concept art production sheet',
  },
  {
    id: 'bp-malachar-3d', name: 'Malachar — 3D Render', product: 'MALACHAR — The Undying King', character: 'malachar',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-malachar-3d/public', ratio: '1:1', tag: '3d',
    prompt: 'Premium collectible figure render of a skeletal king boss from a dark fantasy RPG, standing on a detailed base made of fused swords and skulls, corroded black armor with ghostly green flames emanating from the chest and eye sockets, tattered cape frozen mid-billow, massive serrated greatsword planted point-down beside him, one skeletal hand resting on the pommel, dramatic studio lighting with green rim light, dark gradient background, high-end statue collectible presentation, PBR materials, 4K render',
  },
  {
    id: 'bp-malachar-details', name: 'Malachar — Details', product: 'MALACHAR — The Undying King', character: 'malachar',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-malachar-details/public', ratio: '1:1', tag: 'details',
    prompt: 'Detailed weapon and armor prop sheet for a dark fantasy boss character: close-up views of a massive serrated greatsword covered in dried blood and glowing green runes, corroded black iron crown with three twisted spires, chest armor with exposed ribcage glowing with spectral fire, gauntlets with finger bones extending into claws, tattered cape with spectral particles dissolving at the edges, each item shown individually with material and texture detail callouts, dark background with moody green accent lighting, game asset reference quality',
  },
  {
    id: 'bp-malachar-arena', name: 'Malachar — Arena', product: 'MALACHAR — The Undying King', character: 'malachar',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-malachar-arena/public', ratio: '16:9', tag: 'environment',
    prompt: 'Massive dark fantasy cathedral boss arena environment concept art, crumbling Gothic architecture with impossibly tall vaulted ceilings disappearing into darkness, hundreds of rusted swords embedded in the floor forming a path to a bone throne at the far end, broken stained glass windows letting in cold moonlight beams, green spectral flames burning in ancient braziers, a bottomless pit surrounding the central platform connected by crumbling stone bridges, atmospheric volumetric fog, Elden Ring inspired level design, 4K wide shot',
  },

  // VIPER — Shadow Protocol Agent (5)
  {
    id: 'bp-viper-hero', name: 'Viper — Hero', product: 'VIPER — Shadow Protocol Agent', character: 'viper',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-viper-hero/public', ratio: '16:9', tag: 'hero',
    prompt: 'Cinematic action movie frame of a female special forces agent in a black tactical suit walking in slow-motion away from a massive fireball explosion on a rain-soaked Tokyo street at night, debris flying past her, she holds a suppressed pistol at her side, long dark hair whipping in the shockwave, neon signs reflecting in wet asphalt, teal and orange color grading, anamorphic lens flare, John Wick meets Mission Impossible aesthetic, photorealistic Hollywood quality, 4K widescreen',
  },
  {
    id: 'bp-viper-turnaround', name: 'Viper — Turnaround', product: 'VIPER — Shadow Protocol Agent', character: 'viper',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-viper-turnaround/public', ratio: '1:1', tag: 'turnaround',
    prompt: 'Action movie character costume and gear reference sheet showing a female special forces agent in multiple views: front view in full black tactical suit with body armor and thigh holster, back view showing utility belt and blade sheath, civilian cover outfit in leather jacket and jeans, formal infiltration outfit in a black evening gown with concealed weapons, each outfit shown on clean dark background with gear callouts, movie character design production sheet, 4 outfits displayed side by side, photorealistic fashion illustration quality',
  },
  {
    id: 'bp-viper-poster', name: 'Viper — Poster', product: 'VIPER — Shadow Protocol Agent', character: 'viper',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-viper-poster/public', ratio: '16:9', tag: 'poster',
    prompt: 'Hollywood action movie poster featuring a female special forces agent standing center frame in a dramatic pose holding two pistols crossed at her chest, rain-soaked cityscape behind her with explosions and helicopters, reflections of adversaries visible in the wet ground, bold teal and orange color grade, dramatic upward lighting illuminating her face, cinematic composition with depth and layered elements, blockbuster movie poster quality, intense atmosphere, photorealistic 4K',
  },
  {
    id: 'bp-viper-storyboard', name: 'Viper — Storyboard', product: 'VIPER — Shadow Protocol Agent', character: 'viper',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-viper-storyboard/public', ratio: '16:9', tag: 'storyboard',
    prompt: 'Professional movie storyboard layout showing 6 key action sequence frames arranged in a 2x3 grid on white background with scene descriptions below each frame: frame 1 agent rappelling down glass building, frame 2 motorcycle chase through narrow alley, frame 3 hand-to-hand combat in elevator, frame 4 underwater infiltration through flooded tunnel, frame 5 rooftop sniper position overlooking city, frame 6 helicopter extraction in snowstorm, pencil sketch style with light watercolor wash, camera angle arrows and movement notes, professional film production storyboard',
  },
  {
    id: 'bp-viper-weapons', name: 'Viper — Gadgets', product: 'VIPER — Shadow Protocol Agent', character: 'viper',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-viper-weapons/public', ratio: '1:1', tag: 'gadgets',
    prompt: 'Tactical weapons and gadget loadout sheet for an action movie spy character: custom suppressed pistol with laser sight, compact submachine gun with folding stock, ceramic throwing knives set of 3, wrist-mounted grappling hook device, small EMP grenade, lockpicking kit in leather roll, earpiece communicator, night vision contact lenses in case, each item photographed individually on dark surface with dramatic side lighting, military catalog aesthetic, photorealistic product photography, 4K',
  },

  // MIRA — Clay Crafter (5)
  {
    id: 'bp-mira-hero', name: 'Mira — Hero', product: 'MIRA — Clay Crafter', character: 'mira',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-mira-hero/public', ratio: '16:9', tag: 'hero',
    prompt: 'A complete Twitter social media profile page recreated entirely as a 3D clay sculpture artwork, the entire interface made of colorful plasticine and polymer clay on a black clay background, a circular clay avatar frame with a miniature girl figurine inside, clay text showing username and bio, clay icons for likes hearts and bookmarks, a pinned post section with tiny clay text, decorative clay elements around the edges including a pink castle, yellow stars, butterflies, a dreamcatcher, candy swirls, and flower petals, warm studio lighting with soft shadows showing the 3D depth of each clay element, stop-motion animation aesthetic, handcrafted artisan quality, overhead camera angle, 4K',
  },
  {
    id: 'bp-mira-turnaround', name: 'Mira — Turnaround', product: 'MIRA — Clay Crafter', character: 'mira',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-mira-turnaround/public', ratio: '1:1', tag: 'turnaround',
    prompt: 'Clay art element reference sheet showing individual handcrafted plasticine social media UI components arranged on a clean white background: a 3D clay heart icon, a clay bookmark ribbon, a clay star with sparkle, a clay speech bubble, a clay notification bell, a clay verified checkmark badge, a clay follow button, a clay retweet arrows icon, each piece shown from front and three-quarter angle with visible fingerprint texture and soft rounded edges, warm studio lighting, polymer clay crafting style, miniature sculpture quality, overhead product photography layout',
  },
  {
    id: 'bp-mira-3d', name: 'Mira — 3D Render', product: 'MIRA — Clay Crafter', character: 'mira',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-mira-3d/public', ratio: '1:1', tag: '3d',
    prompt: 'A premium collectible clay art diorama of a miniature social media profile rendered entirely in polymer clay, displayed on a wooden pedestal base, the clay profile features a tiny avatar girl with glasses, clay text bio, clay interaction buttons, surrounded by decorative clay elements including a castle, stars, butterflies, and flowers, the entire piece is about 15cm tall, clean studio photography with gradient background from dark gray to white, soft rim lighting highlighting the 3D clay textures, collectible art toy presentation, museum display quality, 4K',
  },
  {
    id: 'bp-mira-details', name: 'Mira — Details', product: 'MIRA — Clay Crafter', character: 'mira',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-mira-details/public', ratio: '1:1', tag: 'details',
    prompt: 'Extreme close-up detail shots of handcrafted clay social media profile decorations arranged in a 2x2 grid: top-left a pink and white clay fairy tale castle with tiny windows and turrets, top-right a circular clay avatar frame with a miniature girl figurine wearing glasses and hoodie, bottom-left a clay dreamcatcher with woven threads and dangling feathers, bottom-right a clay ferris wheel with colorful gondolas, each piece showing intricate fingerprint textures and layered clay details, macro photography with shallow depth of field, warm artisan workshop lighting, polymer clay sculpture quality',
  },
  {
    id: 'bp-mira-environment', name: 'Mira — Studio', product: 'MIRA — Clay Crafter', character: 'mira',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-mira-environment/public', ratio: '16:9', tag: 'environment',
    prompt: 'A cozy clay artist workshop workspace from above, a wooden table covered with polymer clay crafting tools and materials, half-finished clay social media icons and UI elements scattered around, small jars of colorful clay in rainbow colors, sculpting tools and wire armatures, a completed clay Twitter profile artwork in the center being worked on by tiny clay hands, warm desk lamp lighting casting soft shadows, creative studio atmosphere, overhead bird-eye view, artisan crafting workspace photography, 4K',
  },

  // HAYABUSA GT — Cyber Street Racer (5)
  {
    id: 'bp-hayabusa-hero', name: 'Hayabusa — Hero', product: 'HAYABUSA GT — Cyber Street Racer', character: 'hayabusa',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-hayabusa-hero/public', ratio: '16:9', tag: 'hero',
    prompt: 'Cinematic action shot of a futuristic Japanese street racing car drifting through a neon-lit Tokyo intersection at night, aggressive angular body kit glowing with embedded LED strips in electric blue, massive rear wing, smoke pouring from the rear tires, sparks flying from the low front splitter scraping the road, motion blur on the background neon signs, wet road reflecting all the lights, Need for Speed and Cyberpunk aesthetic, photorealistic automotive photography, shot on 35mm with motion blur, 4K',
  },
  {
    id: 'bp-hayabusa-turnaround', name: 'Hayabusa — Turnaround', product: 'HAYABUSA GT — Cyber Street Racer', character: 'hayabusa',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-hayabusa-turnaround/public', ratio: '1:1', tag: 'turnaround',
    prompt: 'Automotive design turnaround sheet of a futuristic Japanese street racing car, aggressive angular body with aerodynamic curves, shown in 5 views on clean dark studio background: front three-quarter hero angle, direct side profile, rear three-quarter showing the massive wing and quad exhaust, top-down overhead view showing roof scoop and livery design, and front view showing aggressive headlight design, electric blue with carbon fiber accents color scheme, automotive design portfolio presentation, clean studio lighting, 4K',
  },
  {
    id: 'bp-hayabusa-interior', name: 'Hayabusa — Interior', product: 'HAYABUSA GT — Cyber Street Racer', character: 'hayabusa',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-hayabusa-interior/public', ratio: '16:9', tag: 'interior',
    prompt: 'Futuristic racing car cockpit interior, racing bucket seat with 6-point harness, flat-bottom steering wheel with integrated holographic HUD display showing speed and track map, roll cage with LED accent lighting in blue, carbon fiber dashboard with minimal physical buttons, digital instrument cluster with Japanese text readouts, sequential shift lights across the top of the windshield, night scene with city lights visible through the windshield, automotive interior photography, ultra-detailed 4K',
  },
  {
    id: 'bp-hayabusa-track', name: 'Hayabusa — Track', product: 'HAYABUSA GT — Cyber Street Racer', character: 'hayabusa',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-hayabusa-track/public', ratio: '16:9', tag: 'environment',
    prompt: 'Futuristic night racing circuit through a cyberpunk Tokyo cityscape, elevated highway track weaving between neon-lit skyscrapers, holographic advertising billboards floating above the track, tire barriers with LED markers, a pack of 4 racing cars approaching a tight corner with brake lights glowing red, cherry blossom trees lining one section of track with petals blowing across the road, dramatic aerial perspective shot, racing game environment concept art, cinematic atmosphere, 4K',
  },
  {
    id: 'bp-hayabusa-colors', name: 'Hayabusa — Colors', product: 'HAYABUSA GT — Cyber Street Racer', character: 'hayabusa',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-hayabusa-colors/public', ratio: '16:9', tag: 'colors',
    prompt: 'Color variant lineup of a futuristic Japanese street racing car shown in 6 different livery schemes arranged in two rows of 3 on dark background: electric blue with white stripes, matte black with red accents, pearl white with gold details, neon green with carbon fiber, midnight purple with silver, and burnt orange with black, each shown from the same three-quarter front angle, automotive color palette presentation, clean studio render, consistent lighting across all variants, 4K',
  },

  // RYUJI — Street Legend (5)
  {
    id: 'bp-ryuji-hero', name: 'Ryuji — Hero', product: 'RYUJI — Street Legend', character: 'ryuji',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-ryuji-hero/public', ratio: '16:9', tag: 'hero',
    prompt: 'Anime streetwear magazine cover featuring a cool male anime character with spiky blonde hair covering one eye, wearing an oversized black and yellow streetwear hoodie with bold number 03 print, baggy cargo pants with straps, chunky designer sneakers, sitting in a dynamic relaxed pose with one leg extended, bold magazine title typography at the top in white, Japanese katakana text scattered around the layout, character quote in a speech bubble, brand logos and issue number in the corner, clean white background with yellow and black graphic design elements, manga illustration style with fashion editorial layout, sharp clean lines, professional magazine print quality, 4K',
  },
  {
    id: 'bp-ryuji-turnaround', name: 'Ryuji — Turnaround', product: 'RYUJI — Street Legend', character: 'ryuji',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-ryuji-turnaround/public', ratio: '1:1', tag: 'turnaround',
    prompt: 'Anime character outfit turnaround reference sheet showing a cool male anime character with spiky blonde hair in 4 different streetwear outfits on clean white background: outfit 1 oversized black hoodie with yellow accents and cargo pants, outfit 2 long black trench coat with gold chain accessories, outfit 3 fitted black turtleneck with yellow bomber jacket and slim jeans, outfit 4 open black shirt revealing tattooed chest with gold pendant necklace and track pants, each outfit shown front view with Japanese text labels and brand callouts, fashion lookbook layout, manga illustration style, clean typography',
  },
  {
    id: 'bp-ryuji-poster', name: 'Ryuji — Poster', product: 'RYUJI — Street Legend', character: 'ryuji',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-ryuji-poster/public', ratio: '16:9', tag: 'poster',
    prompt: 'Cinematic anime poster of a blonde male character in black and yellow streetwear standing alone under a Tokyo street light at night, cigarette smoke trailing upward, hands in hoodie pockets, neon signs reflecting on wet pavement behind him, dramatic low-angle composition, the character\'s shadow stretching long across the ground, bold movie-style title STREET LEGEND in metallic gold typography at the bottom with Japanese subtitle, dark moody atmosphere with yellow accent lighting, manga illustration meets movie poster aesthetic, theatrical one-sheet quality, 4K',
  },
  {
    id: 'bp-ryuji-details', name: 'Ryuji — Details', product: 'RYUJI — Street Legend', character: 'ryuji',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-ryuji-details/public', ratio: '1:1', tag: 'details',
    prompt: 'Anime streetwear accessories detail sheet arranged in a grid layout on white background: close-up of chunky black and yellow designer sneakers with visible sole detail, a gold chain pendant with kanji engraving, fingerless black leather gloves with metal studs, a crossbody sling bag with anime patches, round yellow-tinted sunglasses, a lighter with engraved dragon, each item drawn in clean manga illustration style with product photography composition, bold item names in Japanese and English typography, streetwear catalog aesthetic, sharp lines and flat colors',
  },
  {
    id: 'bp-ryuji-spread', name: 'Ryuji — Spread', product: 'RYUJI — Street Legend', character: 'ryuji',
    img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-ryuji-spread/public', ratio: '16:9', tag: 'spread',
    prompt: 'Double-page anime magazine editorial spread featuring a blonde anime character in streetwear performing a dynamic high kick in mid-air, black and yellow outfit with motion blur on the leg, bold Japanese typography flowing around the figure reading style and power, smaller inset photos in the corner showing close-up face portrait and back view of jacket with large kanji print, magazine page layout with columns of Japanese text body copy, page numbers and footer, professional editorial design with manga art style, yellow black and white color scheme, print magazine quality',
  },
];

// ─── Veo3 Videos (23) ─────────────────────────────────────────
export const SHOWCASE_VIDEOS: ShowcaseVideo[] = [
  // KORA (3)
  {
    id: 'veo3-kora-intro', name: 'Kora — Intro', product: 'KORA — Bone Tribe Warrior', character: 'kora',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/8d1c95ee43bdd3d5e8a006db40e2bd74/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-kora-hero/public', mode: 'image-to-video',
    prompt: 'Slow cinematic push-in through misty tropical jungle at dawn, camera glides between massive tree trunks, the young anime warrior girl with wild green hair and bone armor turns her head toward camera and grins, then leaps down from a branch and lands in a combat stance gripping her massive bone club, leaves scatter on impact. Audio: jungle birds, rustling leaves, thud of landing, low tribal drum beat begins. No subtitles.',
  },
  {
    id: 'veo3-kora-idle', name: 'Kora — Idle', product: 'KORA — Bone Tribe Warrior', character: 'kora',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/edf09f167c884b42c5e3454121fdcf84/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-kora-turnaround/public', mode: 'image-to-video',
    prompt: 'Medium close-up of the young jungle warrior girl sitting on a mossy stone ruin at sunset, bone club resting beside her, she gently pets a small panda cub sleeping in her lap, fireflies appearing, warm golden light, she looks up with a peaceful smile, wind gently moving her green hair, quiet contemplative moment. Audio: evening breeze, distant waterfall, crickets, cub snoring, bamboo flute melody. No subtitles.',
  },
  {
    id: 'veo3-kora-combat', name: 'Kora — Combat', product: 'KORA — Bone Tribe Warrior', character: 'kora',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/b42381d822cd51da9f61b1756098169a/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-kora-3d/public', mode: 'ingredient',
    prompt: 'Dynamic tracking shot following a young jungle warrior girl with green hair and bone armor as she charges toward a giant panda creature in a forest clearing, she swings her massive bone club in a wide arc, the panda blocks and roars, she rolls under a counterswipe and strikes upward sending leaves and debris exploding, camera circles them during the clash, sunlight flashing through canopy. Audio: heavy club impacts, panda roar, battle cry, intense tribal percussion. No subtitles.',
  },

  // ZERO (3)
  {
    id: 'veo3-zero-combat', name: 'Zero — Combat', product: 'ZERO — Ghost Frame Operator', character: 'zero',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/0a62829ca3d27a8c121ed7378b7b4f77/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-zero-hero/public', mode: 'ingredient',
    prompt: 'Wide cinematic shot of a white and crimson mech sprinting through a destroyed city, dodging missile impacts that explode buildings, the mech slides behind a toppled skyscraper then leans out firing its plasma cannon in a sustained blue beam cutting through an enemy mech, sparks and molten metal flying, camera shakes with each explosion. Audio: thundering footsteps, missiles whistling and exploding, plasma cannon whine and discharge, emergency sirens. No subtitles.',
  },
  {
    id: 'veo3-zero-launch', name: 'Zero — Launch', product: 'ZERO — Ghost Frame Operator', character: 'zero',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/2e99e88a4034caa00606e0a9b09a85da/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-zero-weapons/public', mode: 'image-to-video',
    prompt: 'Dramatic vertical tracking shot of a white and crimson bipedal mech launching from underground hangar, hydraulic clamps releasing with steam, the mech rises through armored blast doors opening in sequence, camera follows from below as it emerges into rain-soaked night cityscape, thrusters ignite with blue flame as it takes a thundering step onto cracked asphalt. Audio: hydraulic hiss, blast doors grinding, klaxon alarm, rain on metal, booming footfall, jet engine whine. No subtitles.',
  },
  {
    id: 'veo3-zero-cockpit', name: 'Zero — Cockpit', product: 'ZERO — Ghost Frame Operator', character: 'zero',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/d2c8fe8374fa48d49037c32e831e9b48/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-zero-cockpit/public', mode: 'image-to-video',
    prompt: 'Interior cockpit POV from the pilot\'s perspective inside a combat mech, holographic HUD with target lock warnings, pilot\'s gloved hands grip control sticks, through rain-streaked windshield an enemy mech charges toward camera, pilot slams a red button and missiles launch from shoulder pods, explosions flash outside. Audio: cockpit hum, rain on glass, warning alarms, tense breathing, missile launch whoosh, muffled explosions, calm AI voice saying target acquired. No subtitles.',
  },

  // MALACHAR (2)
  {
    id: 'veo3-malachar-awaken', name: 'Malachar — Awaken', product: 'MALACHAR — The Undying King', character: 'malachar',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/aaec99f09328fdd46b1633d2680ad7c0/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-malachar-hero/public', mode: 'image-to-video',
    prompt: 'Slow dolly-in approaching a massive bone throne in a dark cathedral, a skeletal king sits motionless wreathed in ghostly green flames, as camera gets closer the green flames in eye sockets suddenly flare bright, the skeletal hand tightens around the serrated greatsword, jaw opens releasing an echoing roar, the cathedral shakes and dust falls, candles extinguish in a wave. Audio: eerie silence, dripping water, grinding bone on metal, deep otherworldly roar, chains rattling, dark orchestral swell. No subtitles.',
  },
  {
    id: 'veo3-malachar-fight', name: 'Malachar — Fight', product: 'MALACHAR — The Undying King', character: 'malachar',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/9e3d32bf1e9642f125dcc2c7be26dfd4/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-malachar-arena/public', mode: 'ingredient',
    prompt: 'Epic wide shot of a small armored warrior dodging massive sword swings from a colossal skeletal king boss in a ruined cathedral, the boss brings greatsword down splitting the stone floor, green spectral fire erupts from the crack, the warrior rolls and counterattacks at the ankle, boss staggers then sweeps his cape sending a ghostly energy wave across the arena, dramatic scale contrast. Audio: massive sword impacts, stone splitting, warrior grunt, spectral whoosh, epic orchestral battle music with choir. No subtitles.',
  },

  // VIPER (3)
  {
    id: 'veo3-viper-explosion', name: 'Viper — Explosion', product: 'VIPER — Shadow Protocol Agent', character: 'viper',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/e51d1e5ffb8dd677234ecaef8ad5027f/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-viper-poster/public', mode: 'image-to-video',
    prompt: 'Cinematic slow-motion of a female agent in black tactical suit walking toward camera as a massive explosion erupts behind her on rain-soaked Tokyo street at night, debris and fire billowing in slow-mo, dark hair whipping forward from shockwave, neon signs reflecting in puddles, she does not look back, teal and orange color grading, anamorphic lens flare. Audio: muffled explosion in slow motion, glass shattering, rain pattering, steady boot steps, bass-heavy cinematic score. No subtitles.',
  },
  {
    id: 'veo3-viper-bike', name: 'Viper — Bike Chase', product: 'VIPER — Shadow Protocol Agent', character: 'viper',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/e28d75b9b19c536138f1c270d8ffcea0/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-viper-hero/public', mode: 'text-to-video',
    prompt: 'Low tracking shot following a female agent on a sleek black motorcycle weaving through Tokyo traffic at high speed at night, leaning hard into turns with sparks from knee slider, two black SUVs give chase smashing through parked cars, she accelerates and launches off a raised intersection, bike goes airborne in slow motion with neon city lights streaking below, lands hard and continues racing. Audio: high-revving motorcycle engine, screeching tires, crashing metal, wind rushing, momentary silence airborne, hard landing impact. No subtitles.',
  },
  {
    id: 'veo3-viper-fight', name: 'Viper — Fight', product: 'VIPER — Shadow Protocol Agent', character: 'viper',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/bc964a526f4755059477cd3aff8e103e/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-viper-storyboard/public', mode: 'text-to-video',
    prompt: 'Intense hand-to-hand fight in a dimly lit elevator, a female agent exchanges rapid strikes with two attackers in suits, she deflects a punch and slams him into the wall denting the panels, spins and delivers a spinning back elbow to the second, camera locked inside the tight space capturing every impact, overhead fluorescent light swings creating flashing shadows. Audio: thuds of fists hitting body and wall, fabric tearing, metallic denting, heavy breathing, elevator ding as doors open. No subtitles.',
  },

  // KODA Coffee (2)
  {
    id: 'veo3-koda-barista', name: 'Koda — Barista', product: 'KODA Coffee — Barista Animation', character: 'koda',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/d2204858cdaf1bf649548427b4593bde/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-mira-hero/public', mode: 'text-to-video',
    prompt: 'Charming 3D animated short of a young female barista with a high bun hairstyle working in a cozy coffee shop, she gracefully steams milk creating a perfect swirl, pours latte art forming a rosetta pattern, camera follows her hands in close-up then pulls back to show her proud smile as she places the cup on the counter, warm morning sunlight through cafe windows, Pixar quality with soft lighting. Audio: espresso machine hissing, milk steaming, gentle pour, cafe chatter, acoustic guitar, a satisfied hum. No subtitles.',
  },
  {
    id: 'veo3-koda-morning', name: 'Koda — Morning', product: 'KODA Coffee — Barista Animation', character: 'koda',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/d663c43cb8e3a9e1c2ce8e7c1e40470b/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-mira-environment/public', mode: 'text-to-video',
    prompt: '3D animated morning routine montage of a cute barista character opening her coffee shop, she flips the door sign to Open, wipes down the espresso machine, arranges pastries in the display case, grinds fresh coffee beans and inhales the aroma with closed eyes and blissful smile, smooth continuous dolly through the cafe, warm golden morning light growing brighter. Audio: keys jingling, door chime bell, cloth wiping metal, coffee grinder, barista humming, birds chirping, gentle piano. No subtitles.',
  },

  // TACO (2)
  {
    id: 'veo3-taco-assembly', name: 'Taco — Assembly', product: 'Street Taco — Food Cinematic', character: 'taco',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/196fa956b6443994b2480c2ac8ade51f/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-ryuji-spread/public', mode: 'text-to-video',
    prompt: 'Fast-paced overhead close-up cooking montage of street taco assembly, hands warm corn tortillas on a hot griddle with visible sizzle, lay down juicy carne asada sliced with a sharp knife, add diced onion and fresh cilantro, spoon bright red salsa, finish by squeezing a lime wedge with juice dripping in slow motion, camera stays directly overhead, each step transitions with quick cut, dramatic food lighting. Audio: sizzling meat, knife chopping, salsa spooning, lime squeeze, street market ambiance, upbeat Latin guitar. No subtitles.',
  },
  {
    id: 'veo3-taco-hero', name: 'Taco — Hero Shot', product: 'Street Taco — Food Cinematic', character: 'taco',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/e1277444f7dbf57d4cab91d52c68c885/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-ryuji-poster/public', mode: 'text-to-video',
    prompt: 'Slow cinematic dolly approaching a beautifully assembled trio of street tacos on a rustic wooden board, camera starts low at table level and slowly rises revealing the arrangement, steam rising from grilled meat, a hand squeezes a lime wedge releasing golden spray in backlight, garnishes of cilantro and radish in sharp detail, shallow depth of field. Audio: street food market bustle, distant mariachi music, nearby grill sizzle, lime squeeze, murmur of appreciation. No subtitles.',
  },

  // MIRA (3)
  {
    id: 'veo3-mira-build', name: 'Mira — Build', product: 'MIRA — Clay Creator', character: 'mira',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/accfcf8106d740807e2fd570397e172a/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-mira-3d/public', mode: 'image-to-video',
    prompt: 'Stop-motion style animation of a clay social media profile being assembled piece by piece on a black surface, tiny clay hands place each element one by one: first the avatar frame pops down, then clay text appears letter by letter, clay icons slide into position, a pink clay castle grows from nothing on the right side, stars and butterflies flutter in from the edges, the verified badge stamps down with a satisfying press, each piece makes a soft clay squish sound, warm workshop lighting, overhead camera, charming handcrafted aesthetic. Audio: soft clay squishing sounds, gentle tapping, a playful xylophone melody, satisfying pop sounds as each element lands. No subtitles.',
  },
  {
    id: 'veo3-mira-crafting', name: 'Mira — Crafting', product: 'MIRA — Clay Creator', character: 'mira',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/6bbe1140d87b11d9e96094d81d4b0630/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-mira-turnaround/public', mode: 'ingredient',
    prompt: 'Close-up stop-motion animation of hands sculpting tiny clay social media elements on a wooden worktable, fingers roll colorful polymer clay into small balls then press and shape them into a heart icon, a star, a speech bubble, and a castle turret, each piece is carefully painted with a tiny brush, then placed onto a clay profile board, camera moves between macro close-ups of the sculpting and wider shots of the growing artwork, warm desk lamp lighting. Audio: clay squishing, brush strokes, gentle humming, soft piano background music, satisfying clicking as pieces snap into place. No subtitles.',
  },
  {
    id: 'veo3-mira-reveal', name: 'Mira — Reveal', product: 'MIRA — Clay Creator', character: 'mira',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/91ed425fae7bef355761826737522351/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-mira-details/public', mode: 'text-to-video',
    prompt: 'A completed clay art social media profile displayed on a slowly rotating wooden turntable, the entire Twitter profile page recreated in colorful polymer clay with a tiny avatar girl, clay text, clay icons, decorated with a pink castle, stars, butterflies and dreamcatcher, camera slowly orbits around the piece showing all the 3D depth and handcrafted details from every angle, soft studio lighting with warm key light and cool fill, shallow depth of field blurring the background, museum display presentation. Audio: soft ambient music, gentle turntable motor hum, occasional sparkle sound effects highlighting details. No subtitles.',
  },

  // HAYABUSA (2)
  {
    id: 'veo3-hayabusa-drift', name: 'Hayabusa — Drift', product: 'HAYABUSA GT — Racing', character: 'hayabusa',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/8063e770dde27a27775487587509480c/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-hayabusa-hero/public', mode: 'image-to-video',
    prompt: 'Low tracking shot of a futuristic Japanese street racing car drifting sideways through a neon-lit Tokyo intersection at night, tires smoking white clouds illuminated by neon, embedded LED strips glowing electric blue, camera at ground level capturing front wheel angle and smoke, wet road reflects all neon creating mirror surface, other cars braking in background. Audio: screaming engine, screeching tires, rubber smoke hissing, turbo blow-off, crowd cheering, synthwave pulse. No subtitles.',
  },
  {
    id: 'veo3-hayabusa-race', name: 'Hayabusa — Race', product: 'HAYABUSA GT — Racing', character: 'hayabusa',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/f01f16966e441e60b07616016b3e2a31/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-hayabusa-track/public', mode: 'ingredient',
    prompt: 'Cinematic aerial tracking following a pack of 4 futuristic racing cars blasting through an elevated highway between neon skyscrapers at night, the lead car in electric blue pulls ahead then brakes hard for a hairpin, the second car attempts inside overtake, body panels nearly touching, sparks as they clip, cherry blossom petals across the track. Audio: multiple engines in chorus, wind rushing, tire squeals, carbon panels cracking, crowd roar, electronic race music. No subtitles.',
  },

  // RYUJI (3)
  {
    id: 'veo3-ryuji-cover', name: 'Ryuji — Cover', product: 'RYUJI — Street Legend', character: 'ryuji',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/29e9beb4c9a1fecd660c2688dc2aee12/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-ryuji-hero/public', mode: 'image-to-video',
    prompt: 'An anime magazine cover comes to life, the printed blonde character in black and yellow streetwear slowly starts breathing, then lifts his head and looks directly at camera with a confident smirk, he adjusts his hoodie collar and runs his hand through his spiky hair, the magazine typography and Japanese text elements flutter and animate around him like floating graphic design elements, the white background subtly shifts to reveal a Tokyo street scene behind him, cinematic transition from 2D print to living character. Audio: paper rustling, a stylish whoosh as elements animate, city ambiance fading in, a cool hip-hop beat drops. No subtitles.',
  },
  {
    id: 'veo3-ryuji-walk', name: 'Ryuji — Walk', product: 'RYUJI — Street Legend', character: 'ryuji',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/4d9f18d64b89fbe9789907fdc8bdc7ca/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-ryuji-turnaround/public', mode: 'ingredient',
    prompt: 'Cinematic tracking shot of a cool blonde anime character in black and yellow streetwear walking confidently down a neon-lit Tokyo alley at night, hands in hoodie pockets, camera follows from a low angle as he passes glowing shop signs and vending machines, his reflection visible in rain puddles on the ground, he pauses to light a cigarette and the flame briefly illuminates his face, smoke trailing into the neon-lit air, manga-style speed lines briefly flash during a dramatic head turn, stylish urban atmosphere. Audio: confident footsteps on wet ground, distant city traffic, lighter click and flame, lo-fi hip-hop beat, muffled Japanese conversation from a nearby izakaya. No subtitles.',
  },
  {
    id: 'veo3-ryuji-action', name: 'Ryuji — Action', product: 'RYUJI — Street Legend', character: 'ryuji',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/380b212f61ebe711f77671e650c5732b/downloads/default.mp4', thumb: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/bp-ryuji-details/public', mode: 'text-to-video',
    prompt: 'Dynamic anime fight scene in a Tokyo back alley at night, a blonde character in black and yellow streetwear dodges a punch with a smooth lean back, then delivers a spinning kick that sends his opponent flying into stacked crates, camera whips around to follow the action with manga-style impact frames flashing on each hit, yellow energy effects on his kicks, the scene freezes momentarily on the final kick with bold Japanese onomatopoeia text appearing on screen, then resumes as the opponent crashes, stylish anime action choreography. Audio: rapid whooshing kicks, heavy impacts, crates breaking, dramatic orchestral hit on freeze frame, Japanese shout, intense drum and bass soundtrack. No subtitles.',
  },
];

// ─── Character list (for tabs/filters) ────────────────────────
export const SHOWCASE_CHARACTERS = [
  { id: 'kora', name: 'KORA', subtitle: 'Bone Tribe Warrior', color: '#4CAF50' },
  { id: 'zero', name: 'ZERO', subtitle: 'Ghost Frame Operator', color: '#2196F3' },
  { id: 'malachar', name: 'MALACHAR', subtitle: 'The Undying King', color: '#9C27B0' },
  { id: 'viper', name: 'VIPER', subtitle: 'Shadow Protocol Agent', color: '#F44336' },
  { id: 'mira', name: 'MIRA', subtitle: 'Clay Crafter', color: '#FF9800' },
  { id: 'hayabusa', name: 'HAYABUSA', subtitle: 'Cyber Street Racer', color: '#00BCD4' },
  { id: 'ryuji', name: 'RYUJI', subtitle: 'Street Legend', color: '#E91E63' },
] as const;

// ─── Fashion Album type ──────────────────────────────────────
export interface ShowcaseAlbum {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  cover: string; // first image as album cover
  images: ShowcaseImage[];
}

// ─── Fashion Albums — 10 branded collections ─────────────────
export const SHOWCASE_FASHION_ALBUMS: ShowcaseAlbum[] = [
  // ── 1. MAISON ÉLARA — Haute Couture ──
  {
    id: 'elara',
    name: 'MAISON ÉLARA',
    subtitle: 'Haute Couture',
    color: '#C5A55A',
    cover: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-elara-gown/public',
    images: [
      {
        id: 'album-elara-gown', name: 'ÉLARA Gown', product: 'MAISON ÉLARA — Haute Couture', character: 'elara',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-elara-gown/public', ratio: '9:16', tag: 'couture',
        prompt: 'Luxury fashion campaign for the brand ÉLARA, a tall model in a dramatic floor-length black silk gown with sculptural gold embroidery cascading from one shoulder down the torso like liquid metal, standing in a grand baroque palace hall with gilded mirrors and crystal chandeliers, the gold ÉLARA logo watermark elegantly placed in the bottom right corner, shot on Hasselblad H6D, Vogue Paris cover quality, dramatic chiaroscuro lighting',
      },
      {
        id: 'album-elara-atelier', name: 'ÉLARA Atelier', product: 'MAISON ÉLARA — Haute Couture', character: 'elara',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-elara-atelier/public', ratio: '16:9', tag: 'couture',
        prompt: 'Behind the scenes at ÉLARA atelier, close-up of skilled hands embroidering gold thread onto black silk fabric, intricate floral motifs taking shape stitch by stitch, the ÉLARA brand name subtly embroidered in gold script on a fabric label visible at the edge, warm golden workshop lighting, spools of metallic thread and sketches on the worktable, documentary fashion photography, intimate craftsmanship moment',
      },
      {
        id: 'album-elara-detail', name: 'ÉLARA Detail', product: 'MAISON ÉLARA — Haute Couture', character: 'elara',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-elara-detail/public', ratio: '1:1', tag: 'couture',
        prompt: 'ÉLARA haute couture detail shot, extreme macro of gold beadwork on midnight black velvet, each bead hand-sewn creating a constellation pattern, the letter E from the ÉLARA monogram formed by tiny gold crystals, warm directional light revealing texture and dimension, shallow depth of field, luxury fashion detail photography, museum-quality craftsmanship',
      },
      {
        id: 'album-elara-campaign', name: 'ÉLARA Campaign', product: 'MAISON ÉLARA — Haute Couture', character: 'elara',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-elara-campaign/public', ratio: '16:9', tag: 'couture',
        prompt: 'ÉLARA brand campaign hero image, two models in coordinated black and gold haute couture ensembles descending a grand marble staircase, one in a structured gold brocade blazer dress and the other in a flowing black cape with gold lining revealed mid-movement, the word ÉLARA in elegant serif typography overlaid at the bottom center in gold, cinematic wide-angle composition, fashion advertising quality, dramatic spotlighting',
      },
    ],
  },

  // ── 2. NOIR TOKYO — Streetwear ──
  {
    id: 'noir-tokyo',
    name: 'NOIR TOKYO',
    subtitle: 'Streetwear',
    color: '#FF1493',
    cover: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-noir-street/public',
    images: [
      {
        id: 'album-noir-street', name: 'NOIR Street', product: 'NOIR TOKYO — Streetwear', character: 'noir-tokyo',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-noir-street/public', ratio: '9:16', tag: 'streetwear',
        prompt: 'NOIR TOKYO streetwear lookbook cover, a young Japanese model in an oversized black hoodie with the NOIR TOKYO logo in neon pink katakana print across the chest, layered with a reflective silver puffer vest, wide cargo pants and platform sneakers, standing at a rain-soaked Shibuya crossing at night, neon signs reflected in puddles, shot on 35mm film with natural grain, urban fashion editorial',
      },
      {
        id: 'album-noir-crew', name: 'NOIR Crew', product: 'NOIR TOKYO — Streetwear', character: 'noir-tokyo',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-noir-crew/public', ratio: '16:9', tag: 'streetwear',
        prompt: 'NOIR TOKYO crew shot, three diverse young models in coordinated streetwear standing on a Tokyo rooftop at blue hour, each wearing different pieces from the NOIR TOKYO collection: oversized graphic tees, cargo shorts, bucket hats, all featuring the distinctive neon pink NOIR branding, city skyline with Tokyo Tower glowing behind them, wind catching loose fabric, squad energy, Hypebeast editorial quality',
      },
      {
        id: 'album-noir-detail', name: 'NOIR Detail', product: 'NOIR TOKYO — Streetwear', character: 'noir-tokyo',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-noir-detail/public', ratio: '1:1', tag: 'streetwear',
        prompt: 'NOIR TOKYO product flat lay on raw concrete, carefully arranged: a black snapback cap with embroidered neon pink NOIR logo, chunky silver chain necklace, transparent phone case with NOIR branding, limited edition sneakers in black with pink accents, and a small crossbody bag, all arranged with precise spacing, overhead shot with harsh flash photography creating sharp shadows, streetwear product catalog aesthetic',
      },
      {
        id: 'album-noir-night', name: 'NOIR Night', product: 'NOIR TOKYO — Streetwear', character: 'noir-tokyo',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-noir-night/public', ratio: '9:16', tag: 'streetwear',
        prompt: 'NOIR TOKYO night editorial, a model in a long black techwear trenchcoat with reflective NOIR strips and multiple utility pockets, walking through a narrow Tokyo alley lit only by vending machines and neon signs, the coat catches colored light creating iridescent effects, a neon sign reading NOIR visible in the background, cyberpunk atmosphere meets high fashion, cinematic rain-soaked street photography',
      },
    ],
  },

  // ── 3. CASA VERANO — Resort ──
  {
    id: 'verano',
    name: 'CASA VERANO',
    subtitle: 'Resort & Summer',
    color: '#E07850',
    cover: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-verano-villa/public',
    images: [
      {
        id: 'album-verano-villa', name: 'Verano Villa', product: 'CASA VERANO — Resort', character: 'verano',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-verano-villa/public', ratio: '9:16', tag: 'resort',
        prompt: 'CASA VERANO resort collection campaign, a model in a flowing white linen maxi dress with terracotta embroidered trim and a wide straw hat, leaning against a whitewashed Mediterranean villa wall with bougainvillea cascading above, the CASA VERANO brand name in elegant terracotta script logo on the bottom left, golden hour light, Amalfi Coast lifestyle, summer editorial photography',
      },
      {
        id: 'album-verano-pool', name: 'Verano Pool', product: 'CASA VERANO — Resort', character: 'verano',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-verano-pool/public', ratio: '16:9', tag: 'resort',
        prompt: 'CASA VERANO poolside editorial, a model in an elegant one-piece swimsuit in burnt sienna with the subtle CV monogram woven into the fabric, lounging on a cream daybed beside an infinity pool overlooking the ocean, straw tote bag with CASA VERANO embroidered tag beside her, a glass of aperol spritz on a marble side table, Mediterranean luxury resort lifestyle, warm golden tones, travel fashion photography',
      },
      {
        id: 'album-verano-market', name: 'Verano Market', product: 'CASA VERANO — Resort', character: 'verano',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-verano-market/public', ratio: '16:9', tag: 'resort',
        prompt: 'CASA VERANO street style, a model browsing a sun-drenched Italian outdoor market wearing a coordinated linen co-ord set in sandy beige with terracotta piping from the CASA VERANO collection, leather sandals, oversized tortoiseshell sunglasses, carrying a woven basket bag with the CV leather tag, surrounded by colorful produce stalls and striped awnings, authentic Mediterranean lifestyle moment, candid editorial',
      },
      {
        id: 'album-verano-accessories', name: 'Verano Accessories', product: 'CASA VERANO — Resort', character: 'verano',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-verano-accessories/public', ratio: '1:1', tag: 'resort',
        prompt: 'CASA VERANO accessories flat lay on sun-bleached wooden surface, carefully arranged summer essentials: woven straw fedora with terracotta ribbon bearing the CV logo, tan leather sandals with gold buckles, tortoiseshell sunglasses, a stack of gold bangles, coral linen scarf, and a small leather pouch embossed with CASA VERANO, warm natural sunlight creating soft shadows, coastal product photography, Mediterranean palette',
      },
    ],
  },

  // ── 4. ATELIER BLANC — Bridal ──
  {
    id: 'blanc',
    name: 'ATELIER BLANC',
    subtitle: 'Bridal & Evening',
    color: '#C0C0C0',
    cover: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-blanc-bride/public',
    images: [
      {
        id: 'album-blanc-bride', name: 'Blanc Bride', product: 'ATELIER BLANC — Bridal', character: 'blanc',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-blanc-bride/public', ratio: '9:16', tag: 'bridal',
        prompt: 'ATELIER BLANC bridal campaign, a bride in a breathtaking ivory silk wedding gown with hand-sewn pearl and crystal beadwork across a fitted corset bodice flowing into a dramatic cathedral-length train, standing in a sunlit chapel with stained glass windows casting colored light, the ATELIER BLANC logo in delicate silver script at the bottom, ethereal and romantic, bridal magazine cover quality',
      },
      {
        id: 'album-blanc-veil', name: 'Blanc Veil', product: 'ATELIER BLANC — Bridal', character: 'blanc',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-blanc-veil/public', ratio: '1:1', tag: 'bridal',
        prompt: 'ATELIER BLANC bridal detail, close-up of an exquisite cathedral-length veil with hand-embroidered floral lace border, the AB monogram delicately stitched in silver thread at one corner, soft backlight creating a halo effect through the sheer tulle, the bride silhouette visible beneath, floating fabric creating ethereal shapes, dreamy shallow depth of field, luxury bridal photography',
      },
      {
        id: 'album-blanc-evening', name: 'Blanc Evening', product: 'ATELIER BLANC — Bridal', character: 'blanc',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-blanc-evening/public', ratio: '9:16', tag: 'evening',
        prompt: 'ATELIER BLANC evening collection, a model in a stunning silver sequin column gown that catches light like liquid mercury, standing on a rooftop terrace at twilight with city lights twinkling behind her, the gown has a daring open back revealing the ATELIER BLANC label sewn inside, she turns to look over her shoulder, wind catching her hair, glamorous and sophisticated, red carpet editorial quality',
      },
      {
        id: 'album-blanc-fitting', name: 'Blanc Fitting', product: 'ATELIER BLANC — Bridal', character: 'blanc',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-blanc-fitting/public', ratio: '16:9', tag: 'bridal',
        prompt: 'ATELIER BLANC fitting room scene, a bride standing on an elevated platform in front of three tall mirrors while a seamstress kneels to adjust the hemline of her wedding gown, pins visible in the fabric, measuring tape draped around the seamstress neck, the ATELIER BLANC logo visible on the mirror frame in silver, warm intimate lighting, emotional anticipation on the bride face, documentary bridal photography',
      },
    ],
  },

  // ── 5. VOSS ACTIVE — Sportswear ──
  {
    id: 'voss',
    name: 'VOSS ACTIVE',
    subtitle: 'Sportswear',
    color: '#1E90FF',
    cover: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-voss-run/public',
    images: [
      {
        id: 'album-voss-run', name: 'VOSS Run', product: 'VOSS ACTIVE — Sportswear', character: 'voss',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-voss-run/public', ratio: '16:9', tag: 'sportswear',
        prompt: 'VOSS ACTIVE performance campaign, a female athlete in a sleek black and electric blue running outfit with the bold VOSS logo across the sports bra and matching compression leggings with blue geometric accent stripes, captured mid-stride on a futuristic running track at dawn, motion blur on limbs, frozen droplets of sweat catching golden light, Nike-level advertising quality, dynamic and powerful',
      },
      {
        id: 'album-voss-yoga', name: 'VOSS Yoga', product: 'VOSS ACTIVE — Sportswear', character: 'voss',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-voss-yoga/public', ratio: '9:16', tag: 'sportswear',
        prompt: 'VOSS ACTIVE yoga collection, a model in a seamless ribbed crop top and high-waist leggings in matte black with the VOSS geometric logo in subtle tonal print, holding a warrior III pose on a minimalist concrete rooftop at golden hour, city skyline softly blurred behind, her form creating a perfect horizontal line, calm power and flexibility, athleisure lifestyle editorial, clean premium aesthetic',
      },
      {
        id: 'album-voss-gear', name: 'VOSS Gear', product: 'VOSS ACTIVE — Sportswear', character: 'voss',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-voss-gear/public', ratio: '1:1', tag: 'sportswear',
        prompt: 'VOSS ACTIVE product arrangement on a dark charcoal gym floor, overhead shot of coordinated workout gear: electric blue sports bra with VOSS logo, black compression shorts, matching headband, wireless earbuds in a case with V logo, water bottle with geometric VOSS branding, a pair of black and blue training shoes, and a mesh gym bag, all arranged with mathematical precision, sports product catalog photography',
      },
      {
        id: 'album-voss-campaign', name: 'VOSS Campaign', product: 'VOSS ACTIVE — Sportswear', character: 'voss',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-voss-campaign/public', ratio: '16:9', tag: 'sportswear',
        prompt: 'VOSS ACTIVE brand campaign hero image, two athletes in matching black and electric blue VOSS training outfits standing back to back with arms crossed on an industrial concrete background, dramatic side lighting creating strong shadows, the large VOSS logo projected as light on the wall behind them, powerful confident energy, premium sportswear brand advertising, high contrast editorial',
      },
    ],
  },

  // ── 6. HERITAGE 1924 — Menswear ──
  {
    id: 'heritage',
    name: 'HERITAGE 1924',
    subtitle: 'Menswear',
    color: '#1B3A5C',
    cover: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-heritage-suit/public',
    images: [
      {
        id: 'album-heritage-suit', name: 'Heritage Suit', product: 'HERITAGE 1924 — Menswear', character: 'heritage',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-heritage-suit/public', ratio: '9:16', tag: 'menswear',
        prompt: 'HERITAGE 1924 menswear campaign, a distinguished man in a perfectly tailored navy blue double-breasted suit with peak lapels, white pocket square, and cognac leather oxford shoes, standing in the wood-paneled library of an English manor house, leather-bound books and a globe behind him, the HERITAGE 1924 crest subtly embroidered on the breast pocket, warm tungsten lighting, GQ editorial quality, timeless elegance',
      },
      {
        id: 'album-heritage-detail', name: 'Heritage Detail', product: 'HERITAGE 1924 — Menswear', character: 'heritage',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-heritage-detail/public', ratio: '1:1', tag: 'menswear',
        prompt: 'HERITAGE 1924 tailoring detail, extreme close-up of bespoke suit craftsmanship showing hand-stitched buttonholes in contrasting silk thread, a surgeon cuff with functioning buttons, the HERITAGE 1924 label visible inside the jacket in gold embossing on navy silk lining, rich fabric texture of super 150s wool visible, shallow depth of field, warm directional light, Savile Row quality',
      },
      {
        id: 'album-heritage-casual', name: 'Heritage Casual', product: 'HERITAGE 1924 — Menswear', character: 'heritage',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-heritage-casual/public', ratio: '16:9', tag: 'menswear',
        prompt: 'HERITAGE 1924 casual collection, a man in a camel cashmere overcoat over a navy crewneck sweater and well-fitted chinos, cognac leather loafers, walking through a misty English garden in autumn, fallen leaves on the gravel path, the overcoat collar turned up against the chill, the H1924 monogram on a leather button, natural overcast lighting, old-money casual elegance, Ralph Lauren meets Kingsman aesthetic',
      },
      {
        id: 'album-heritage-accessories', name: 'Heritage Accessories', product: 'HERITAGE 1924 — Menswear', character: 'heritage',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-heritage-accessories/public', ratio: '1:1', tag: 'menswear',
        prompt: 'HERITAGE 1924 accessories still life on a dark mahogany desk, carefully arranged: a cognac leather briefcase with brass locks and embossed HERITAGE 1924 logo, a mechanical dress watch with navy dial, gold cufflinks with the H crest, a silk navy tie with subtle pattern, tortoiseshell reading glasses, and a leather card holder, all arranged with gentlemanly precision, warm desk lamp lighting, premium menswear catalog',
      },
    ],
  },

  // ── 7. TERRA ECO — Sustainable ──
  {
    id: 'terra',
    name: 'TERRA ECO',
    subtitle: 'Sustainable Fashion',
    color: '#6B8E23',
    cover: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-terra-hero/public',
    images: [
      {
        id: 'album-terra-hero', name: 'Terra Hero', product: 'TERRA ECO — Sustainable', character: 'terra',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-terra-hero/public', ratio: '9:16', tag: 'sustainable',
        prompt: 'TERRA ECO sustainable fashion campaign, a model in a beautifully draped dress made from organic undyed linen in natural oatmeal color, standing in a sun-dappled forest clearing surrounded by ferns, the dress has raw unhemmed edges and visible natural stitching as a design feature, a small woven TERRA label with a leaf icon visible at the neckline, barefoot connection to nature, warm golden forest light, conscious luxury fashion editorial',
      },
      {
        id: 'album-terra-material', name: 'Terra Material', product: 'TERRA ECO — Sustainable', character: 'terra',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-terra-material/public', ratio: '1:1', tag: 'sustainable',
        prompt: 'TERRA ECO material study, close-up photography of sustainable fashion textures arranged in an artful composition: organic cotton canvas in cream, recycled denim in faded indigo, hemp fabric in sage green, cork leather in natural brown, and Tencel in soft blush, each fabric swatch overlapping slightly with the TERRA leaf logo stamped on the cork piece, natural daylight, raw and honest material photography, zero-waste fashion aesthetic',
      },
      {
        id: 'album-terra-collection', name: 'Terra Collection', product: 'TERRA ECO — Sustainable', character: 'terra',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-terra-collection/public', ratio: '16:9', tag: 'sustainable',
        prompt: 'TERRA ECO capsule collection lookbook, two models in a sunlit greenhouse wearing coordinated earth-tone outfits: one in an oversized hemp jacket in sage green over organic cotton wide-leg pants, the other in a recycled wool knit sweater in warm terracotta with organic denim jeans, both wearing natural leather sandals, lush plants surrounding them, the TERRA brand visible on a hanging plant tag in the scene, warm natural tones, sustainable luxury lifestyle',
      },
      {
        id: 'album-terra-packaging', name: 'Terra Packaging', product: 'TERRA ECO — Sustainable', character: 'terra',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-terra-packaging/public', ratio: '1:1', tag: 'sustainable',
        prompt: 'TERRA ECO brand packaging flat lay, overhead shot of sustainable packaging: a garment folded in unbleached tissue paper inside a recycled kraft box with the TERRA logo and leaf icon printed in soy ink, accompanied by a cotton drawstring bag stamped TERRA, seed paper thank you card, organic cotton care tag, and dried lavender sprigs, all on a raw linen surface, mindful unboxing experience, eco-luxury brand identity',
      },
    ],
  },

  // ── 8. STUDIO KURO — Avant-Garde ──
  {
    id: 'kuro',
    name: 'STUDIO KURO',
    subtitle: 'Avant-Garde',
    color: '#333333',
    cover: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-kuro-sculpture/public',
    images: [
      {
        id: 'album-kuro-sculpture', name: 'KURO Sculpture', product: 'STUDIO KURO — Avant-Garde', character: 'kuro',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-kuro-sculpture/public', ratio: '9:16', tag: 'avant-garde',
        prompt: 'STUDIO KURO avant-garde fashion editorial, a model wearing a dramatic sculptural white coat with exaggerated geometric shoulders and asymmetric hemline over all-black, standing in a stark white Tadao Ando-style concrete space with a single beam of light cutting diagonally, the KURO wordmark in minimalist black type visible on the concrete wall, Comme des Garcons meets architectural design, high-contrast editorial photography',
      },
      {
        id: 'album-kuro-decon', name: 'KURO Decon', product: 'STUDIO KURO — Avant-Garde', character: 'kuro',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-kuro-decon/public', ratio: '9:16', tag: 'avant-garde',
        prompt: 'STUDIO KURO deconstructed fashion, a model in a deliberately unfinished blazer with exposed seams, raw edges, and one sleeve removed to reveal the construction underneath, contrasted with perfectly tailored wide-leg trousers in jet black, standing in an empty white gallery space, the garment existing between chaos and precision, a small KURO label hanging from an exposed thread, conceptual fashion photography, Yohji Yamamoto aesthetic',
      },
      {
        id: 'album-kuro-movement', name: 'KURO Movement', product: 'STUDIO KURO — Avant-Garde', character: 'kuro',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-kuro-movement/public', ratio: '16:9', tag: 'avant-garde',
        prompt: 'STUDIO KURO movement study, a dancer-model in a flowing all-black KURO ensemble performing a contemporary dance move in a pure white studio, fabric creating dramatic arcs and shapes in the air, long exposure technique capturing motion trails of the garment, the static body contrasting with the dynamic fabric, artistic fashion meets performance art, museum-quality photography, black-on-white minimalism',
      },
      {
        id: 'album-kuro-exhibition', name: 'KURO Exhibition', product: 'STUDIO KURO — Avant-Garde', character: 'kuro',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-kuro-exhibition/public', ratio: '16:9', tag: 'avant-garde',
        prompt: 'STUDIO KURO exhibition installation, three mannequins displaying avant-garde garments in a dark gallery space, each lit by a single precise spotlight from above: a sculptural origami-folded jacket, a dress made of layered geometric panels, and an architectural coat with impossible proportions, the KURO logo projected in light on the gallery floor, fashion as art installation, museum exhibition photography, dramatic theatrical lighting',
      },
    ],
  },

  // ── 9. CÔTE D'OR — Jewelry ──
  {
    id: 'cote-dor',
    name: "CÔTE D'OR",
    subtitle: 'Jewelry & Accessories',
    color: '#DAA520',
    cover: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-cote-necklace/public',
    images: [
      {
        id: 'album-cote-necklace', name: "Côte d'Or Necklace", product: "CÔTE D'OR — Jewelry", character: 'cote-dor',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-cote-necklace/public', ratio: '9:16', tag: 'jewelry',
        prompt: "CÔTE D'OR fine jewelry campaign, close-up of a model's neck and collarbone wearing a stunning layered gold statement necklace with ruby and emerald cabochon stones, the CÔTE D'OR brand name engraved on a tiny gold tag at the clasp, against her bare skin with flawless lighting, dark velvety background, dramatic warm spotlight creating brilliant reflections on the gold, Cartier-level luxury jewelry advertising photography",
      },
      {
        id: 'album-cote-collection', name: "Côte d'Or Collection", product: "CÔTE D'OR — Jewelry", character: 'cote-dor',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-cote-collection/public', ratio: '1:1', tag: 'jewelry',
        prompt: "CÔTE D'OR collection display, an exquisite arrangement of luxury jewelry pieces on dark navy velvet: a diamond tennis bracelet, sculptural gold hoop earrings, a cocktail ring with a large sapphire, pearl drop pendant necklace, and a slim gold bangle, all positioned with museum-like precision, the CÔTE D'OR logo embossed in gold on the velvet display tray, warm directional lighting creating sparkle and depth, high-end jewelry catalog photography",
      },
      {
        id: 'album-cote-handbag', name: "Côte d'Or Handbag", product: "CÔTE D'OR — Jewelry", character: 'cote-dor',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-cote-handbag/public', ratio: '1:1', tag: 'accessories',
        prompt: "CÔTE D'OR luxury handbag campaign, a structured mini bag in deep emerald green crocodile-embossed leather with 18k gold chain strap and the iconic CÔTE D'OR clasp in the shape of a golden lion, photographed on a black marble surface with a single orchid, dramatic chiaroscuro lighting reminiscent of Vermeer, the brand name visible on the gold hardware, ultra-premium accessories photography",
      },
      {
        id: 'album-cote-watch', name: "Côte d'Or Watch", product: "CÔTE D'OR — Jewelry", character: 'cote-dor',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-cote-watch/public', ratio: '9:16', tag: 'jewelry',
        prompt: "CÔTE D'OR timepiece campaign, an exquisite rose gold watch with mother-of-pearl dial surrounded by a bezel of pavé diamonds, on a model's wrist with a subtle gold bracelet, the CÔTE D'OR name on the watch dial in refined serif type, her hand resting on dark velvet, extreme macro showing the diamond detail and dial craftsmanship, warm intimate lighting, luxury horlogerie advertising quality",
      },
      {
        id: 'album-cote-campaign', name: "Côte d'Or Campaign", product: "CÔTE D'OR — Jewelry", character: 'cote-dor',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-cote-campaign/public', ratio: '16:9', tag: 'jewelry',
        prompt: "CÔTE D'OR brand campaign hero shot, a model in an elegant black dress wearing the full CÔTE D'OR jewelry collection: layered gold necklaces, statement earrings, and stacking rings, photographed against a deep navy background with warm golden lighting from the side, the CÔTE D'OR wordmark in elegant gold typography at the bottom center, her expression confident and regal, luxury brand campaign level, Vogue Jewelry supplement quality",
      },
    ],
  },

  // ── 10. RÉTRO REVIVAL — Vintage ──
  {
    id: 'retro',
    name: 'RÉTRO REVIVAL',
    subtitle: 'Vintage Fashion',
    color: '#D2691E',
    cover: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-retro-70s/public',
    images: [
      {
        id: 'album-retro-70s', name: 'Rétro 70s', product: 'RÉTRO REVIVAL — Vintage', character: 'retro',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-retro-70s/public', ratio: '9:16', tag: 'vintage',
        prompt: 'RÉTRO REVIVAL vintage fashion editorial, a model in authentic 1970s inspired outfit: high-waisted flared denim jeans, a rust-orange suede fringe jacket, platform boots, and oversized round tinted sunglasses, standing in front of a classic American muscle car in a dusty desert setting, the RÉTRO brand logo in groovy retro 70s typography on a vintage-style patch on the jacket, warm film grain, golden hour, shot in the style of 1970s Vogue',
      },
      {
        id: 'album-retro-diner', name: 'Rétro Diner', product: 'RÉTRO REVIVAL — Vintage', character: 'retro',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-retro-diner/public', ratio: '16:9', tag: 'vintage',
        prompt: 'RÉTRO REVIVAL 1950s diner editorial, a model in a classic polka-dot swing dress in cherry red with a white Peter Pan collar, cat-eye sunglasses pushed up on her head, sitting at a chrome diner counter with a milkshake, vintage jukebox visible in the background with a RÉTRO sticker on it, warm Kodachrome color palette, authentic mid-century American aesthetic, pin-up meets modern fashion photography',
      },
      {
        id: 'album-retro-disco', name: 'Rétro Disco', product: 'RÉTRO REVIVAL — Vintage', character: 'retro',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-retro-disco/public', ratio: '16:9', tag: 'vintage',
        prompt: 'RÉTRO REVIVAL disco era editorial, a model in a shimmering silver halter jumpsuit with wide bell-bottom legs, platform shoes, and large hoop earrings, dancing under a disco ball in a vintage nightclub with colored spotlights, the RÉTRO logo in neon script on the wall behind, motion blur on her dancing body, 1970s disco fever atmosphere, Studio 54 energy, warm film photography with light leaks and flares',
      },
      {
        id: 'album-retro-vintageshop', name: 'Rétro Vintage Shop', product: 'RÉTRO REVIVAL — Vintage', character: 'retro',
        img: 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/showcase/album-retro-vintageshop/public', ratio: '9:16', tag: 'vintage',
        prompt: 'RÉTRO REVIVAL vintage shop editorial, a model browsing through racks of curated vintage clothing in a charming boutique, wearing a mix of decades: a 1960s mod mini skirt with a 1980s oversized blazer with padded shoulders, the shop has exposed brick walls with a hand-painted RÉTRO REVIVAL sign above the entrance, warm incandescent lighting, eclectic vintage atmosphere, lifestyle fashion photography with authentic character',
      },
    ],
  },
];

// Flat list for backward compat
export const SHOWCASE_FASHION_IMAGES: ShowcaseImage[] = SHOWCASE_FASHION_ALBUMS.flatMap(a => a.images);
export const SHOWCASE_FASHION_VIDEOS: ShowcaseVideo[] = [
  // MAISON ÉLARA — Haute Couture (2)
  {
    id: 'fv-couture-walk', name: 'Runway Walk', product: 'MAISON ÉLARA — Runway Walk', character: 'elara',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/480e7f823db92efb51741090a74b70da/downloads/default.mp4',
    thumb: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/480e7f823db92efb51741090a74b70da/downloads/default.mp4',
    mode: 'image-to-video',
    prompt: 'The model begins to walk forward on the baroque runway, her dramatic black silk gown flowing behind her creating mesmerizing ripples on the polished marble floor.',
  },
  {
    id: 'fv-couture-atelier', name: 'Atelier Craftsmanship', product: 'MAISON ÉLARA — Atelier Craftsmanship', character: 'elara',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/c5c110370aef735aa4008712b7a84070/downloads/default.mp4',
    thumb: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/c5c110370aef735aa4008712b7a84070/downloads/default.mp4',
    mode: 'image-to-video',
    prompt: 'The artisan\'s hands begin to move, embroidering gold thread onto the midnight black silk with precise needle strokes.',
  },
  // NOIR TOKYO — Streetwear (2)
  {
    id: 'fv-street-walk', name: 'Night Walk', product: 'NOIR TOKYO — Night Walk', character: 'noir-tokyo',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/f8b602c55964c08f147095a849fecaf9/downloads/default.mp4',
    thumb: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/f8b602c55964c08f147095a849fecaf9/downloads/default.mp4',
    mode: 'image-to-video',
    prompt: 'The models start walking through the neon-lit Tokyo alley, their oversized hoodies and chunky platform sneakers splashing through rain puddles.',
  },
  {
    id: 'fv-street-crew', name: 'Street Crew', product: 'NOIR TOKYO — Street Crew', character: 'noir-tokyo',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/bc54703d71c4f55a2b7bb28c91a9fd5f/downloads/default.mp4',
    thumb: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/bc54703d71c4f55a2b7bb28c91a9fd5f/downloads/default.mp4',
    mode: 'image-to-video',
    prompt: 'The street crew begins performing synchronized poses on the Tokyo rooftop, oversized jackets catching the wind.',
  },
  // ATELIER BLANC — Bridal (1)
  {
    id: 'fv-runway-show', name: 'Bridal Reveal', product: 'ATELIER BLANC — Bridal Reveal', character: 'blanc',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/ea0cee576d0661701508991209d22025/downloads/default.mp4',
    thumb: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/ea0cee576d0661701508991209d22025/downloads/default.mp4',
    mode: 'image-to-video',
    prompt: 'The bride begins to walk through the arch of white roses, her flowing white haute couture wedding gown catching golden hour backlighting.',
  },
  // VOSS ACTIVE — Sportswear (1)
  {
    id: 'fv-runway-finale', name: 'In Motion', product: 'VOSS ACTIVE — In Motion', character: 'voss',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/f1164e57c2d9fbbde8161477bd083a96/downloads/default.mp4',
    thumb: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/f1164e57c2d9fbbde8161477bd083a96/downloads/default.mp4',
    mode: 'image-to-video',
    prompt: 'The athlete explodes into a sprint across the minimalist white studio, camera tracks her at high speed in slow-motion.',
  },
  // CASA VERANO — Resort (1)
  {
    id: 'fv-accessories-reveal', name: 'Poolside', product: 'CASA VERANO — Poolside', character: 'verano',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/0f5723acc06eadee01cff62036f1bdcd/downloads/default.mp4',
    thumb: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/0f5723acc06eadee01cff62036f1bdcd/downloads/default.mp4',
    mode: 'image-to-video',
    prompt: 'The model begins walking along the infinity pool edge overlooking the Mediterranean coastline at golden hour.',
  },
  // CÔTE D'OR — Jewelry (1)
  {
    id: 'fv-jewelry-campaign', name: 'Jewelry Campaign', product: 'CÔTE D\'OR — Jewelry Campaign', character: 'cote-dor',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/ca01961f5092541eb17018c6d3cebd77/downloads/default.mp4',
    thumb: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/ca01961f5092541eb17018c6d3cebd77/downloads/default.mp4',
    mode: 'image-to-video',
    prompt: 'The model slowly turns her head and the facets of the emerald necklace catch the light, creating dancing green reflections.',
  },
  // HERITAGE 1924 — Menswear (1)
  {
    id: 'fv-editorial-wind', name: 'Suiting Editorial', product: 'HERITAGE 1924 — Suiting Editorial', character: 'heritage',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/2682cb32f8d574c7830aa062951930bd/downloads/default.mp4',
    thumb: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/2682cb32f8d574c7830aa062951930bd/downloads/default.mp4',
    mode: 'image-to-video',
    prompt: 'The gentleman begins walking through the grand mahogany-paneled library, adjusting his cufflinks.',
  },
  // TERRA ECO — Sustainable (1)
  {
    id: 'fv-editorial-noir', name: 'Sustainable Story', product: 'TERRA ECO — Sustainable Story', character: 'terra',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/79b21866c2421a27be33dccd03ced350/downloads/default.mp4',
    thumb: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/79b21866c2421a27be33dccd03ced350/downloads/default.mp4',
    mode: 'image-to-video',
    prompt: 'The scene comes alive as hands begin sorting organic cotton and hemp fabrics, camera gliding across natural dyes.',
  },
  // STUDIO KURO — Avant-Garde (1)
  {
    id: 'fv-montage', name: 'Performance', product: 'STUDIO KURO — Performance', character: 'kuro',
    videoUrl: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/d5b5ea67973ce14bd8e6d72c4551dcf6/downloads/default.mp4',
    thumb: 'https://customer-xq04fu0u3xog8ay1.cloudflarestream.com/d5b5ea67973ce14bd8e6d72c4551dcf6/downloads/default.mp4',
    mode: 'image-to-video',
    prompt: 'The model begins slow contemporary dance movements through the stark white gallery space.',
  },
];
