#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# 3D Model Showcase — Generate turntable thumbnails + rotation videos
# Phase 1: Generate 25 hero thumbnail images (static 3D renders)
# Phase 2: Generate 25 turntable rotation videos (image-to-video)
# Phase 3: Upload to Cloudflare (Images + Stream)
# Phase 4: Output updated showcase-3d.ts URLs
# ═══════════════════════════════════════════════════════════════════════

set -euo pipefail

IMG_API="https://api.skyverses.com/api-client/external/image-task"
VID_API="https://api.skyverses.com/api-client/external/video-task"
EXPLORER_API="https://api.skyverses.com/explorer"
TOKEN="Bearer skv_cbb360d3c039ffb0ebb494e8536a9730a9faa4acde25d44be11a8087b65a230b"
# JWT token for Explorer API (update if expired)
EXPLORER_TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3Nzc5NjIyNTksImV4cCI6MTc3ODU2NzA1OX0.zaXcxMq8jNYmrrNRm-MiL6mla233xnn5N3ARokDr-nk"

# Cloudflare credentials
CF_ACCOUNT_ID="${CF_ACCOUNT_ID:-9ab75114b3032bf3e6ff9386815e4554}"
CF_IMG_TOKEN="${CF_IMG_TOKEN:-Yp_Ark78qShS4E5bc04KIiLLOZjats0kgt5ragdx}"
CF_IMG_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1"

CF_STREAM_ACCOUNT="${CF_STREAM_ACCOUNT:-cf3d665aec0eda633986d008ba66c967}"
CF_STREAM_TOKEN="${CF_STREAM_TOKEN:-cfut_XsUIDkiywAdh2plkf9B3lgkiNbQ7S4paAl8WwV5c3bc87cfa}"
CF_STREAM_API="https://api.cloudflare.com/client/v4/accounts/${CF_STREAM_ACCOUNT}/stream"
CF_STREAM_SUBDOMAIN="${CF_STREAM_SUBDOMAIN:-customer-xq04fu0u3x}"

REF_MAP_FILE="/tmp/showcase_3d_ref_map.txt"
VIDEO_RESULTS="/tmp/showcase_3d_video_results.txt"
FINAL_OUTPUT="/tmp/showcase_3d_final.txt"
> "$REF_MAP_FILE"
> "$VIDEO_RESULTS"
> "$FINAL_OUTPUT"

# ═══════════════════════════════════════════════════════════════
# MODEL DATA — 25 items matching showcase-3d.ts
# Format: ID | NAME | THUMB_PROMPT | VIDEO_PROMPT | ASPECT
# ═══════════════════════════════════════════════════════════════

declare -a IDS
declare -a NAMES
declare -a THUMB_PROMPTS
declare -a VIDEO_PROMPTS
declare -a CATEGORIES
declare -a TAGS_LIST

# ── Characters (8) ── Inspired by trending ArtStation/Sketchfab 2024-2025

IDS+=("3d-werewolf-beast")
NAMES+=("Werewolf Beast")
THUMB_PROMPTS+=("Hyper-detailed ZBrush digital sculpture of a fearsome werewolf beast in mid-transformation, rippling muscular anatomy with individually sculpted fur strands, exposed tendons and veins on the forearms, dramatic top-down rim lighting casting deep shadows across the snarling muzzle revealing razor-sharp fangs, subsurface scattering on the inner ears and gums, dark moody studio background, professional 3D sculpture presentation, centered 3/4 angle, octane render, 8K detail, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of a hyper-detailed werewolf beast ZBrush sculpture, the camera slowly orbits showcasing every angle of the rippling muscular anatomy, individually sculpted fur strands, snarling muzzle details, dramatic studio rim lighting highlighting surface micro-details and subsurface scattering, dark background, professional 3D model showcase, seamless rotation")
CATEGORIES+=("3d-character")
TAGS_LIST+=("3d,character,creature,fantasy,zbrush")

IDS+=("3d-white-knight")
NAMES+=("White Knight")
THUMB_PROMPTS+=("Photorealistic 3D render of a majestic white knight inspired by Tolkien elven aesthetics, ornate medieval plate armor with leaf-motif engravings and filigree details in silver and mithril, flowing white silk cape with gold trim caught in wind, Xgen hair flowing beneath plumed helmet, soft ethereal forest lighting with volumetric god rays, ZBrush sculpted armor + Marvelous Designer cloth simulation, dark background, centered heroic 3/4 pose, Arnold render quality, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of a white knight 3D model in ornate elven-inspired plate armor with leaf-motif engravings and filigree, flowing white cape with subtle cloth simulation movement, camera orbits revealing intricate armor details, Xgen hair strands, soft ethereal lighting with volumetric haze, dark background, professional 3D showcase")
CATEGORIES+=("3d-character")
TAGS_LIST+=("3d,character,knight,medieval,armor")

IDS+=("3d-gorilla-warrior")
NAMES+=("Gorilla Warrior")
THUMB_PROMPTS+=("Cinematic ZBrush sculpture of a massive steampunk gorilla warrior, muscular silverback wearing brass and copper mechanical exoskeleton armor with exposed gears, pistons, and steam vents, wielding a steam-powered war hammer with glowing pressure gauges, individually sculpted fur detail on exposed areas, warm brass-toned studio lighting with orange rim highlights reflecting off polished metal, dark industrial background, centered 3/4 angle, octane render, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of a steampunk gorilla warrior ZBrush sculpture, camera orbits showing intricate brass mechanical armor with exposed gears and pistons, steam vents, individually sculpted fur textures, war hammer details, warm industrial lighting with metallic reflections, dark background, professional 3D showcase")
CATEGORIES+=("3d-character")
TAGS_LIST+=("3d,character,creature,steampunk,gorilla")

IDS+=("3d-cyber-samurai")
NAMES+=("Cyber Samurai")
THUMB_PROMPTS+=("Hyper-detailed 3D render of a cyberpunk samurai warrior inspired by trending ArtStation concept art, futuristic tactical armor blending traditional Japanese yoroi design with hard-surface sci-fi panels, neon cyan circuit-trace patterns glowing along armor seams, kabuto helmet with holographic visor displaying HUD data, dual katanas sheathed on back with plasma-edge glow, rain-slicked surface reflections, dramatic magenta and teal neon split-lighting, dark urban background, Blender + ZBrush quality, centered 3/4 angle, octane render, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of a cyberpunk samurai 3D model, camera orbits revealing futuristic yoroi armor blended with hard-surface sci-fi panels, glowing neon cyan circuit patterns, holographic visor HUD, dual katana details, dramatic magenta and teal neon lighting with wet surface reflections, dark background, professional 3D showcase")
CATEGORIES+=("3d-character")
TAGS_LIST+=("3d,character,cyberpunk,samurai,sci-fi")

IDS+=("3d-forest-witch")
NAMES+=("Forest Witch")
THUMB_PROMPTS+=("Stylized 3D character render of an enchanting forest witch inspired by Elina Karimova portfolio style, semi-realistic female character with flowing auburn hair intertwined with glowing mushrooms and tiny ferns, layered robes in moss-green and bark-brown with embroidered vine patterns, gnarled driftwood staff crowned with a pulsing bioluminescent crystal, delicate subsurface scattering on porcelain skin, warm golden-hour magical forest lighting with firefly particles, Blender sculpt with handpainted textures, dark background, centered 3/4 angle, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of a stylized forest witch 3D model, camera orbits showing flowing hair with glowing mushrooms, layered moss-green robes with embroidered vines, driftwood staff with bioluminescent crystal, warm golden forest lighting with firefly particles, dark background, professional 3D character showcase")
CATEGORIES+=("3d-character")
TAGS_LIST+=("3d,character,fantasy,witch,stylized")

IDS+=("3d-ronin-ghost")
NAMES+=("Ronin Ghost")
THUMB_PROMPTS+=("Atmospheric ZBrush sculpture of a ghostly ronin warrior, translucent spectral samurai in battle-worn Sengoku-era armor with visible damage and rust, ethereal smoke wisps rising from the body dissolving at the edges, broken katana held in a weary stance, cracked oni mask revealing hollow glowing eye sockets beneath, tattered jinbaori coat flowing with ghostly wind, dramatic cold blue-white lighting with subtle purple rim light, Substance Painter weathering, dark misty background, centered 3/4 angle, octane render, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of a ghostly ronin ZBrush sculpture, camera orbits showing battle-worn Sengoku armor details, ethereal smoke wisps, cracked oni mask with hollow glowing eyes, tattered jinbaori coat, cold blue-white atmospheric lighting, dark misty background, professional 3D showcase")
CATEGORIES+=("3d-character")
TAGS_LIST+=("3d,character,japanese,ronin,ghost")

IDS+=("3d-mech-pilot")
NAMES+=("Mech Pilot Girl")
THUMB_PROMPTS+=("Stylized 3D character render of an anime-inspired mech pilot girl, sleek white and burnt-orange flight suit with articulated mechanical joints at elbows and knees, subtle LED status indicators on the chest panel, oversized helmet tucked confidently under one arm revealing short tousled hair, determined expression, clean topology Blender model with cel-shading aesthetic accents, bright studio key light with soft blue fill creating anime-style highlights, dark background, centered 3/4 angle, octane render, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of an anime mech pilot girl 3D model, camera orbits showing sleek flight suit with mechanical joint details, LED indicators, oversized helmet, clean stylized design with cel-shading accents, bright studio lighting with blue fill, dark background, professional 3D character showcase")
CATEGORIES+=("3d-character")
TAGS_LIST+=("3d,character,sci-fi,mech,anime")

IDS+=("3d-orc-chieftain")
NAMES+=("Orc Chieftain")
THUMB_PROMPTS+=("Massive ZBrush digital sculpture of an orc chieftain inspired by Rishikesh Nandlaskar speed-sculpt style, hulking olive-green muscular physique with deep battle scars and ritual brand marks, crude iron pauldrons bound with leather straps and adorned with enemy skulls and bone trophies, pronounced tusks jutting from a heavy jaw with war-paint streaks, wielding a brutal two-handed battle axe with notched blade, dramatic warm top-down lighting emphasizing every muscle fiber and scar, dark background, centered aggressive 3/4 pose, octane render, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of an orc chieftain ZBrush sculpture, camera orbits showing muscular anatomy, deep battle scars, ritual brands, crude iron armor with skull trophies, brutal notched battle axe, dramatic warm lighting emphasizing surface details, dark background, professional 3D sculpture showcase")
CATEGORIES+=("3d-character")
TAGS_LIST+=("3d,character,orc,fantasy,warrior")

# ── Creatures (4) ── Inspired by Marina Llorente (HBO dragons), Yifan Wang, community trending

IDS+=("3d-dragon-elder")
NAMES+=("Elder Dragon")
THUMB_PROMPTS+=("Epic ZBrush sculpture of a colossal elder dragon inspired by Marina Llorente HBO dragon designs, massive ancient wyrm with thousands of individually sculpted layered scales showing battle scars and age patina, enormous leathery wing membranes with visible veining and translucent edges catching backlight, crown of twisted horns around a weathered skull-like head with glowing amber eyes, custom-designed saddle with leather strapping and metal buckles on the neck, VFX-production-quality anatomical detail in musculature beneath reptilian skin, dramatic epic underlighting with warm orange rim light on scales, dark background, centered 3/4 angle showing wingspan, octane render, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of a colossal elder dragon ZBrush sculpture, camera orbits revealing thousands of individually sculpted scales, wing membrane veining, horn crown, weathered battle scars, saddle harness details, dramatic epic warm lighting with rim glow highlighting scale texture, dark background, professional 3D creature showcase")
CATEGORIES+=("3d-creature")
TAGS_LIST+=("3d,creature,dragon,fantasy,epic")

IDS+=("3d-phoenix-flame")
NAMES+=("Phoenix Rising")
THUMB_PROMPTS+=("Stunning Houdini + ZBrush sculpture of a phoenix rising from an inferno, magnificent mythical fire bird with thousands of individually sculpted feathers transitioning from deep crimson at the body through molten orange to blazing gold at the wingtips, wings spread wide in dramatic upward ascent, trailing flame tendrils and glowing embers swirling around the body, each feather edge dissolving into fire particles, intense warm core lighting radiating from the breast creating a solar flare effect, dark background with heat-haze distortion, centered composition capturing full wingspan, octane volumetric render, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of a phoenix ZBrush sculpture rising from flames, camera orbits showing thousands of individually sculpted feathers in crimson to gold gradient, trailing flame tendrils, glowing ember particles, dramatic warm core lighting creating solar flare effect, dark background, professional 3D creature showcase")
CATEGORIES+=("3d-creature")
TAGS_LIST+=("3d,creature,phoenix,fire,mythical")

IDS+=("3d-deep-sea-leviathan")
NAMES+=("Deep Sea Leviathan")
THUMB_PROMPTS+=("Cinematic ZBrush + Maya sculpture of a colossal deep-sea leviathan inspired by Antoine Verney-Carron creature design style, massive predatory abyssal creature with armored chitinous carapace, rows of bioluminescent organs pulsing teal and electric blue along its serpentine body, crown of barbed tentacles surrounding a maw of translucent needle-like teeth, vestigial fins with membrane detail, barnacle-encrusted hide with deep-ocean pressure scarring, dramatic deep-blue abyss lighting with bioluminescent glow as the only warm accent, dark oceanic background with suspended particle debris, centered 3/4 angle, octane subsurface render, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of a deep-sea leviathan ZBrush sculpture, camera orbits showing armored carapace, pulsing bioluminescent organs, barbed tentacle crown, translucent teeth, barnacle-encrusted hide details, dramatic deep-blue abyss lighting with teal bioluminescent accents, dark background, professional 3D creature showcase")
CATEGORIES+=("3d-creature")
TAGS_LIST+=("3d,creature,sea,monster,underwater")

IDS+=("3d-shadow-wolf")
NAMES+=("Shadow Wolf")
THUMB_PROMPTS+=("Atmospheric Blender sculpt of a mystical shadow wolf inspired by Slavic Leshy mythology, dark ethereal dire wolf with wisps of shadow-smoke energy dissolving from its haunches and tail into nothingness, glowing violet-purple eyes with an intelligent predatory gaze, sleek muscular form with meticulously sculpted fur in deep charcoal and midnight-blue tones, shadow tendrils creeping along the ground beneath its paws, arcane rune markings faintly glowing beneath the fur, dramatic purple-magenta rim lighting cutting through darkness, volumetric fog, dark forest background, centered prowling 3/4 angle, octane render, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of a shadow wolf 3D sculpture, camera orbits showing dissolving shadow-smoke wisps, meticulously sculpted dark fur, glowing violet eyes, faint arcane rune markings, shadow tendrils at the paws, dramatic purple rim lighting with volumetric fog, dark background, professional 3D creature showcase")
CATEGORIES+=("3d-creature")
TAGS_LIST+=("3d,creature,wolf,dark,mystical")

# ── Environments (5) ── Inspired by Cornelius Dammrich, Emma Steiner, Rookie Awards 2024, Sketchfab trending dioramas

IDS+=("3d-teacup-garden")
NAMES+=("Teacup Garden")
THUMB_PROMPTS+=("Charming stylized Blender diorama inspired by Emma Steiner cozy handpainted aesthetic, a miniature magical garden growing inside an oversized vintage porcelain teacup with gold rim and delicate floral pattern, tiny bioluminescent mushrooms glowing softly along a winding cobblestone path, a miniature thatched-roof cottage with warm light in the windows, tiny laundry line with clothes, lush moss ground cover with hand-painted brushstroke textures, warm amber afternoon lighting with soft depth of field creating tilt-shift miniature effect, soft pastel palette of sage green cream and rose, dark background with warm vignette, centered slightly-above isometric view, octane render, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of a teacup garden diorama in handpainted Blender style, camera orbits the miniature scene inside a porcelain teacup showing glowing mushrooms, winding paths, tiny cottage with warm windows, lush moss details, warm amber lighting with tilt-shift depth of field, dark background, professional 3D diorama showcase")
CATEGORIES+=("3d-environment")
TAGS_LIST+=("3d,environment,diorama,stylized,whimsical")

IDS+=("3d-floating-temple")
NAMES+=("Floating Temple")
THUMB_PROMPTS+=("Epic 3D environment render of a floating temple inspired by Rookie Awards 2024 environment art, ancient weathered stone temple with East Asian pagoda architecture perched on a massive levitating rock island, multiple cascading waterfalls pouring off the edges into an endless cloud sea below, lush bonsai trees and cherry blossoms growing from rocky crevices, hanging rope bridges connecting smaller floating rock fragments, golden hour volumetric god rays piercing through temple columns, Blender + UE5 Nanite-quality detail, atmospheric mist and floating petal particles, dark background, centered 3/4 angle from slightly below, octane render, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of a floating temple 3D environment on a levitating rock island, camera orbits showing ancient pagoda architecture, cascading waterfalls, cherry blossom trees, rope bridges, volumetric golden hour god rays, atmospheric mist, dark background, professional 3D environment showcase")
CATEGORIES+=("3d-environment")
TAGS_LIST+=("3d,environment,temple,floating,fantasy")

IDS+=("3d-cyberpunk-alley")
NAMES+=("Neon Alley")
THUMB_PROMPTS+=("Hyper-detailed 3D environment render of a cyberpunk neon alley inspired by Cornelius Dammrich 6088AD aesthetic, narrow claustrophobic urban back alley densely packed with holographic Japanese and alien-script signage, tangled cable bundles and exposed wiring overhead, vending machines with glowing product displays, steam rising from sewer grates catching neon light, rain-slicked asphalt reflecting vibrant magenta cyan and amber neon in puddles, a lone figure silhouetted in the distance, thousands of individually modeled props creating environmental storytelling, UE5 Lumen quality with real-time GI, dark moody atmosphere, centered one-point perspective, octane volumetric render, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of a cyberpunk neon alley 3D diorama in Cornelius Dammrich style, camera orbits showing holographic signs, tangled cables, vending machines, rain-wet reflections, steam vents, thousands of detailed props, vibrant magenta and cyan neon lighting, moody rain atmosphere, dark background, professional 3D environment showcase")
CATEGORIES+=("3d-environment")
TAGS_LIST+=("3d,environment,cyberpunk,neon,urban")

IDS+=("3d-ancient-ruins")
NAMES+=("Ancient Ruins")
THUMB_PROMPTS+=("Atmospheric 3D environment diorama of ancient overgrown temple ruins inspired by Swamp Haven Rookie Awards 2024 style, crumbling Khmer-style stone temple pillars covered in thick banyan tree roots strangling the architecture, delicate moss carpeting every surface with bioluminescent mushrooms growing in the shadows, wild orchids and ferns bursting through cracked flagstones, dramatic shafts of golden light piercing through the collapsed ceiling illuminating floating dust motes and pollen, a shallow reflecting pool on the temple floor mirroring the overgrown canopy above, all assets hand-crafted in Blender, warm green and gold atmospheric lighting, dark background, centered 3/4 angle, octane render, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of ancient overgrown temple ruins 3D diorama, camera orbits showing banyan tree roots strangling stone pillars, bioluminescent mushrooms, golden light shafts through collapsed ceiling, reflecting pool, floating dust particles, warm atmospheric lighting, dark background, professional 3D environment showcase")
CATEGORIES+=("3d-environment")
TAGS_LIST+=("3d,environment,ruins,ancient,overgrown")

IDS+=("3d-mushroom-village")
NAMES+=("Mushroom Village")
THUMB_PROMPTS+=("Enchanting stylized Blender diorama of a magical mushroom village on a circular display base, cluster of oversized fantasy mushroom houses in vibrant red with white spots, purple with gold trim, and teal with crystal windows, each with tiny round doors lanterns and smoking chimneys, miniature cobblestone pathways with wooden signposts, tiny anthropomorphic creatures tending gardens, lush moss and clover ground cover, warm magical bioluminescent lighting from mushroom caps with firefly particles floating upward, handpainted vertex-colored textures giving a storybook aesthetic, tilt-shift depth of field, dark background, centered slightly-above isometric view, octane render, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of a mushroom village diorama on circular base, camera orbits showing colorful mushroom houses with tiny doors and lanterns, cobblestone paths, tiny creatures, bioluminescent mushroom cap lighting, firefly particles, handpainted storybook aesthetic, dark background, professional 3D diorama showcase")
CATEGORIES+=("3d-environment")
TAGS_LIST+=("3d,environment,diorama,mushroom,cute")

# ── Props (3) ── Inspired by Neil Houari Norse axe, Cyberpunk 2077 weapons, trending game-ready assets

IDS+=("3d-sci-fi-crate")
NAMES+=("Sci-Fi Cargo Crate")
THUMB_PROMPTS+=("Game-ready 3D prop render of a sci-fi military cargo crate inspired by Cyberpunk 2077 asset design, heavy-duty titanium alloy crate with dented battle-worn surfaces showing years of use, holographic Militech-style warning labels flickering blue, deep scratches revealing bare metal beneath weathered paint, orange hazard chevron stripes partially scraped off, small LED status indicators glowing green on the latch mechanism, realistic PBR materials with fingerprints and grime on handles, Substance Painter worn-edge generators, Blender render with neutral studio HDRI lighting, dark background, centered 3/4 angle, Marmoset Toolbag presentation quality, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of a sci-fi cargo crate game-ready 3D prop, camera orbits showing battle-worn titanium surfaces, holographic labels, scratches revealing bare metal, LED indicators, PBR material detail with fingerprints and grime, clean studio lighting, dark background, professional 3D asset showcase")
CATEGORIES+=("3d-prop")
TAGS_LIST+=("3d,prop,sci-fi,crate,game-ready")

IDS+=("3d-enchanted-sword")
NAMES+=("Enchanted Blade")
THUMB_PROMPTS+=("Stunning 3D hero-prop render of an enchanted Norse-inspired sword inspired by Neil Houari Jormungandr axe breakdown style, ornate Viking blade with intricate knotwork engravings along the fuller, ancient Norse rune inscriptions glowing faint ice-blue along the cutting edge, elaborate crossguard shaped as intertwined serpents with inlaid sapphire gems for eyes, grip wrapped in aged dark leather with brass wire binding, aged bronze pommel with verdigris patina and embedded crystal, magical frost energy particles crystallizing in the air around the blade, dramatic cold blue key-light with warm amber fill creating material contrast, dark background, centered vertical hero-shot composition, Substance Painter texturing, octane render, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of an enchanted Norse sword 3D hero-prop, camera orbits showing knotwork engravings, glowing rune inscriptions, serpent crossguard with sapphire eyes, aged leather grip, verdigris bronze pommel, magical frost particles, dramatic cold blue and warm amber lighting, dark background, professional 3D weapon showcase")
CATEGORIES+=("3d-prop")
TAGS_LIST+=("3d,prop,weapon,sword,enchanted")

IDS+=("3d-steampunk-clock")
NAMES+=("Steampunk Clock Tower")
THUMB_PROMPTS+=("Intricate 3D diorama prop of a steampunk clock tower miniature, Victorian Gothic tower with exposed brass clockwork mechanisms visible through glass panels, hundreds of individually modeled gears cogs and escapements in motion, four ornate clock faces with Roman numerals and filigreed hands, copper steam pipes venting wisps of steam, wrought-iron balustrade with gargoyle details, warm incandescent light glowing from within the mechanism illuminating the brass internals, Blender + Substance Painter with realistic metal wear and patina, dark background, centered 3/4 angle, Marmoset Toolbag render quality, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of a steampunk clock tower 3D diorama prop, camera orbits showing exposed clockwork mechanisms through glass panels, hundreds of gears and cogs, ornate clock faces, copper steam pipes, Victorian Gothic details, warm incandescent internal glow with brass reflections, dark background, professional 3D prop showcase")
CATEGORIES+=("3d-prop")
TAGS_LIST+=("3d,prop,steampunk,clock,mechanical")

# ── Vehicles (2) ──

IDS+=("3d-hover-bike")
NAMES+=("Hover Bike X-7")
THUMB_PROMPTS+=("Stunning 3D hard-surface render of a futuristic hover bike inspired by Edward Greig Pitbull Mech and Alina Kochemasova spaceship designs on ArtStation, aggressive angular silhouette with exposed turbine intakes and vectoring thrust nozzles glowing hot orange-white, layered carbon-ceramic armor panels with hex-pattern ventilation cuts revealing internal hydraulic pistons and bundled cable harnesses, pilot seat with worn synthetic leather and a flip-up holographic HUD visor, front cowl split by a blade-thin LED strip running ice-blue, rear stabilizer fins with micro-adjustable flaps, Kitbash3D-level greeble density on the undercarriage, ground-effect dust particles swirling beneath hovering stance, dramatic three-point lighting — strong cyan key from upper-left, warm orange rim from lower-right, soft fill from behind — dark hangar environment, centered low 3/4 angle hero shot, Blender Cycles 4096 spp, PBR metals and worn paint, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of a futuristic hover bike 3D hard-surface model, camera orbits showing angular carbon-ceramic armor panels, exposed turbine intakes, glowing orange-white thrust nozzles, holographic HUD visor, ice-blue LED strip, micro-adjustable stabilizer fins, Kitbash3D-level undercarriage greebles, ground-effect dust particles, dramatic cyan key light and warm orange rim light, dark hangar environment, professional 3D vehicle showcase")
CATEGORIES+=("3d-vehicle")
TAGS_LIST+=("3d,vehicle,hover,sci-fi,futuristic")

IDS+=("3d-pirate-ship")
NAMES+=("Ghost Pirate Ship")
THUMB_PROMPTS+=("Atmospheric 3D diorama render of a ghost pirate galleon inspired by Ryan Will Gundam Zaku water diorama style and Sea of Thieves concept art, spectral 17th-century Spanish galleon emerging from a swirling vortex of bioluminescent ocean mist, three masts with tattered moth-eaten sails glowing faint spectral teal from within, hull of dark rotting oak planks encrusted with barnacles coral and deep-sea anemones, ornate stern castle with shattered leaded-glass windows leaking ghostly green light, kraken-skull figurehead with hollow glowing eye sockets, rigging of frayed rope and chains draped with phantom kelp, waterline base showing dark translucent ocean surface with volumetric god-rays piercing through fog, scattered floating debris and ghostly wisps rising, dramatic eerie teal-green key light from below with cold moonlight rim from above-right, Maya + Substance Painter quality, centered 3/4 angle, octane render, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of a ghost pirate galleon 3D diorama, camera orbits showing tattered spectral-teal sails, rotting barnacle-encrusted hull, kraken-skull figurehead with glowing eyes, phantom kelp rigging, shattered stern windows leaking green light, translucent ocean base with volumetric fog and god-rays, eerie teal-green and cold moonlight lighting, dark atmospheric background, professional 3D vehicle showcase")
CATEGORIES+=("3d-vehicle")
TAGS_LIST+=("3d,vehicle,pirate,ghost,fantasy")

# ── Sculptures (3) ──

IDS+=("3d-atlas-titan")
NAMES+=("Atlas Titan")
THUMB_PROMPTS+=("Monumental 3D digital sculpture of Atlas Titan inspired by Dongyoung Hwang photorealistic portrait sculpts and Filippo Ferrarini Vajrapani on ArtStation, colossal classical Greek figure straining under the weight of an ornate celestial armillary sphere, hyper-detailed muscular anatomy with individually sculpted muscle fiber striations visible under skin tension, bulging veins across deltoids and forearms, agonized expression with furrowed brow clenched jaw and deep-set eyes conveying eternal burden, surface rendered as aged Carrara marble with natural veining and hairline cracks accumulating centuries of weathering, selective gold-leaf gilding on the armillary sphere rings and Atlas crown wreath catching warm light, broken stone pedestal with crumbling classical relief carvings at the base, dramatic Rembrandt lighting — strong warm key from upper-left creating deep chiaroscuro across the anatomy, cool blue-purple fill from below, dark museum environment, ZBrush 200M poly decimated, KeyShot marble SSS shader, centered heroic low-angle 3/4 composition, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of an Atlas Titan digital sculpture, camera orbits showing hyper-detailed muscular anatomy with fiber striations, bulging veins, agonized expression, aged Carrara marble with natural veining and cracks, gold-leaf gilded armillary sphere, crumbling classical pedestal, dramatic Rembrandt chiaroscuro with warm key and cool blue fill, dark museum environment, professional 3D sculpture showcase")
CATEGORIES+=("3d-sculpture")
TAGS_LIST+=("3d,sculpture,titan,mythology,classical")

IDS+=("3d-demon-mask")
NAMES+=("Oni Demon Mask")
THUMB_PROMPTS+=("Breathtaking 3D digital sculpture of a Japanese Oni demon mask inspired by traditional Noh theater craftsmanship and Ilia Riabov The Troll sculpting intensity on ZBrushCentral, ferocious Hannya-oni hybrid with deeply carved wrinkled brow lines radiating fury, wide flaring nostrils, gaping mouth revealing rows of razor-sharp gilt fangs and a curling tongue, massive swept-back bull horns with growth-ring texture and chipped battle damage at the tips, surface finished as aged urushi lacquer in deep ox-blood crimson with controlled crackle glaze revealing black underlayer, elaborate chrysanthemum and cloud scroll relief carvings across cheeks and forehead inlaid with hammered 24k gold leaf, twisted shimenawa sacred rope border with dangling brass bells and paper shide at the chin, eyes inset with polished obsidian orbs reflecting the environment, dramatic Edo-period theatrical lighting — strong warm-amber key from below casting menacing upward shadows, cool indigo rim light from behind creating separation, dark tokonoma alcove environment with subtle tatami texture in deep background, ZBrush + KeyShot SSS lacquer shader, centered front 3/4 hero angle, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of an Oni demon mask 3D sculpture, camera orbits showing deeply carved wrinkle lines, razor-sharp gilt fangs, battle-damaged bull horns with growth-ring texture, aged ox-blood urushi lacquer with crackle glaze, gold-leaf inlaid chrysanthemum relief carvings, shimenawa rope border with brass bells, polished obsidian eyes, dramatic warm-amber upward lighting and cool indigo rim, dark tokonoma environment, professional 3D sculpture showcase")
CATEGORIES+=("3d-sculpture")
TAGS_LIST+=("3d,sculpture,mask,japanese,oni")

IDS+=("3d-crystal-golem")
NAMES+=("Crystal Golem")
THUMB_PROMPTS+=("Spectacular 3D sculpture render of a crystal golem elemental inspired by Raluca Barzu translucent material studies and League of Legends Hextech creature concepts, towering humanoid figure with a core of volcanic dark basalt stone cracked open to reveal clusters of massive translucent amethyst and aquamarine crystal formations growing organically from within, each crystal facet individually modeled with internal inclusions and fracture planes, light refracting through the crystal lattice casting prismatic rainbow caustics onto surrounding surfaces, magical arcane energy arcing as electric-violet lightning between crystal node joints and stone gaps, fragments of shattered crystal and levitating stone debris orbiting the shoulders and fists suggesting raw elemental power, mossy lichen and mineral deposits on the basalt sections for organic contrast, dramatic strong backlight in deep violet creating intense crystal silhouette glow and volumetric light shafts, secondary teal fill from below, environment reflections in crystal surfaces, dark cavern environment with faint stalactites, ZBrush sculpt + Blender Cycles glass and SSS crystal shaders 4096 spp, centered 3/4 angle low hero shot, no text no watermark")
VIDEO_PROMPTS+=("Smooth 360-degree turntable rotation of a crystal golem 3D sculpture, camera orbits showing translucent amethyst and aquamarine crystal formations growing from volcanic basalt core, internal crystal inclusions and fracture planes, prismatic rainbow caustics, electric-violet arcane lightning between joints, levitating stone debris, mossy lichen on basalt, dramatic violet backlight with crystal glow and teal fill, dark cavern environment, professional 3D sculpture showcase")
CATEGORIES+=("3d-sculpture")
TAGS_LIST+=("3d,sculpture,golem,crystal,fantasy")


TOTAL=${#IDS[@]}

# ═══════════════════════════════════════════════════════════════
# PHASE 1: Generate thumbnail images
# ═══════════════════════════════════════════════════════════════

declare -a THUMB_JOBIDS

echo "═══════════════════════════════════════════════════════════"
echo "  PHASE 1: Generating $TOTAL thumbnail images"
echo "═══════════════════════════════════════════════════════════"
echo ""

for i in "${!IDS[@]}"; do
  PAYLOAD=$(python3 -c "
import json, sys
body = {
    'type': 'text_to_image',
    'prompt': sys.argv[1],
    'aspectRatio': '3:4',
    'engine': {'provider': 'fxflow', 'model': 'google_image_gen_4_5'}
}
print(json.dumps(body))
" "${THUMB_PROMPTS[$i]}")

  R=$(curl -s -X POST "$IMG_API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "$PAYLOAD")
  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  THUMB_JOBIDS+=("$JID")
  echo "  [$((i+1))/$TOTAL] ${NAMES[$i]} → $JID"
  sleep 1
done

echo ""
echo "⏳ Polling thumbnail images..."

THUMB_DONE=0
for i in "${!IDS[@]}"; do
  JID="${THUMB_JOBIDS[$i]}"
  ID="${IDS[$i]}"
  NAME="${NAMES[$i]}"
  [ -z "$JID" ] && echo "  ❌ $NAME: no job ID" && continue

  for attempt in $(seq 1 60); do
    sleep 5
    SR=$(curl -s "$IMG_API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "$ID|$URL" >> "$REF_MAP_FILE"
      THUMB_DONE=$((THUMB_DONE+1))
      echo "  ✅ [$THUMB_DONE/$TOTAL] $NAME → ${URL:0:80}..."

      # ── Save to Explorer (non-fatal) ──
      CATEGORY="${CATEGORIES[$i]}"
      TAGS="${TAGS_LIST[$i]}"
      EXPLORER_BODY=$(python3 -c "
import json, sys
tags = '$TAGS'.split(',')
body = {
    'title': sys.argv[1],
    'type': 'image',
    'prompt': sys.argv[2],
    'thumbnailUrl': sys.argv[3],
    'mediaUrl': sys.argv[3],
    'model': 'google_image_gen_4_5',
    'tags': tags,
    'categories': ['showcase', '3d-model', sys.argv[4]],
    'status': 'published'
}
print(json.dumps(body))
" "$NAME" "${THUMB_PROMPTS[$i]}" "$URL" "$CATEGORY" 2>/dev/null) || true

      if [ -n "$EXPLORER_BODY" ]; then
        EXPLORER_R=$(curl -s -X POST "$EXPLORER_API" \
          -H "Content-Type: application/json" \
          -H "Authorization: $EXPLORER_TOKEN" \
          -d "$EXPLORER_BODY" 2>/dev/null) || true
        EXPLORER_ID=$(echo "$EXPLORER_R" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('_id','n/a'))" 2>/dev/null) || true
        echo "    Saved to Explorer: ${EXPLORER_ID:-skipped}"
      fi

      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      echo "  ❌ $NAME FAILED"
      break
    else
      printf "  ⏳ %s: %s (%d/60)\r" "$NAME" "$ST" "$attempt"
    fi
  done
done

echo ""
THUMB_READY=$(wc -l < "$REF_MAP_FILE" | tr -d ' ')
echo "  Thumbnails ready: $THUMB_READY/$TOTAL"
echo ""

get_thumb() {
  local key="$1"
  grep "^${key}|" "$REF_MAP_FILE" | head -1 | cut -d'|' -f2
}

# ═══════════════════════════════════════════════════════════════
# PHASE 2: Generate turntable rotation videos
# ═══════════════════════════════════════════════════════════════

declare -a VID_JOBIDS

echo "═══════════════════════════════════════════════════════════"
echo "  PHASE 2: Generating $TOTAL turntable rotation videos"
echo "═══════════════════════════════════════════════════════════"
echo ""

for i in "${!IDS[@]}"; do
  ID="${IDS[$i]}"
  NAME="${NAMES[$i]}"
  START_IMG=$(get_thumb "$ID")

  if [ -z "$START_IMG" ]; then
    echo "  [$((i+1))/$TOTAL] $NAME — ⚠️ no thumb, using text-to-video"
    TYPE="text-to-video"
    PAYLOAD=$(python3 -c "
import json, sys
body = {
    'type': 'text-to-video',
    'prompt': sys.argv[1],
    'duration': 5,
    'aspectRatio': '1:1',
    'resolution': '720p',
    'mode': 'relaxed',
    'engine': {'provider': 'fxflow', 'model': 'veo_3_generate'}
}
print(json.dumps(body))
" "${VIDEO_PROMPTS[$i]}")
  else
    TYPE="image-to-video"
    PAYLOAD=$(python3 -c "
import json, sys
body = {
    'type': 'image-to-video',
    'prompt': sys.argv[1],
    'duration': 5,
    'aspectRatio': '1:1',
    'resolution': '720p',
    'mode': 'relaxed',
    'startImage': sys.argv[2],
    'engine': {'provider': 'fxflow', 'model': 'veo_3_generate'}
}
print(json.dumps(body))
" "${VIDEO_PROMPTS[$i]}" "$START_IMG")
  fi

  R=$(curl -s -X POST "$VID_API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "$PAYLOAD")
  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  VID_JOBIDS+=("$JID")
  echo "  [$((i+1))/$TOTAL] [$TYPE] $NAME → $JID"
  sleep 2
done

echo ""
echo "⏳ Polling turntable videos (this may take a while)..."

VID_DONE=0
for i in "${!IDS[@]}"; do
  JID="${VID_JOBIDS[$i]}"
  ID="${IDS[$i]}"
  NAME="${NAMES[$i]}"
  [ -z "$JID" ] && echo "  ❌ $NAME: no job ID" && continue

  for attempt in $(seq 1 120); do
    sleep 10
    SR=$(curl -s "$VID_API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      VURL=$(echo "$SR" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']['result']; print(d.get('videoUrl',''))" 2>/dev/null)
      VTHUMB=$(echo "$SR" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']['result']; print(d.get('thumbnailUrl',''))" 2>/dev/null)
      VID_DONE=$((VID_DONE+1))
      echo "  ✅ [$VID_DONE/$TOTAL] $NAME → ${VURL:0:80}..."
      echo "$ID|$VURL|$VTHUMB" >> "$VIDEO_RESULTS"

      # ── Save video to Explorer (non-fatal) ──
      CATEGORY="${CATEGORIES[$i]}"
      TAGS="${TAGS_LIST[$i]}"
      EXPLORER_BODY=$(python3 -c "
import json, sys
tags = '$TAGS'.split(',')
body = {
    'title': sys.argv[1] + ' — Turntable',
    'type': 'video',
    'prompt': sys.argv[2],
    'thumbnailUrl': sys.argv[3],
    'mediaUrl': sys.argv[4],
    'model': 'veo_3_generate',
    'tags': tags,
    'categories': ['showcase', '3d-model', sys.argv[5]],
    'status': 'published'
}
print(json.dumps(body))
" "$NAME" "${VIDEO_PROMPTS[$i]}" "$VTHUMB" "$VURL" "$CATEGORY" 2>/dev/null) || true

      if [ -n "$EXPLORER_BODY" ]; then
        EXPLORER_R=$(curl -s -X POST "$EXPLORER_API" \
          -H "Content-Type: application/json" \
          -H "Authorization: $EXPLORER_TOKEN" \
          -d "$EXPLORER_BODY" 2>/dev/null) || true
        EXPLORER_ID=$(echo "$EXPLORER_R" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('_id','n/a'))" 2>/dev/null) || true
        echo "    Saved to Explorer: ${EXPLORER_ID:-skipped}"
      fi

      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      ERR=$(echo "$SR" | python3 -c "import sys,json; e=json.load(sys.stdin)['data'].get('error',{}); print(e.get('userMessage','unknown'))" 2>/dev/null)
      echo "  ❌ $NAME FAILED: $ERR"
      break
    else
      printf "  ⏳ %s: %s (%d/120)\r" "$NAME" "$ST" "$attempt"
    fi
  done
done

echo ""
echo "  Videos done: $VID_DONE/$TOTAL"
echo ""

# ═══════════════════════════════════════════════════════════════
# PHASE 3: Download & Upload to Cloudflare CDN
# ═══════════════════════════════════════════════════════════════

DOWNLOAD_DIR="/tmp/showcase-3d-assets"
mkdir -p "$DOWNLOAD_DIR"

echo "═══════════════════════════════════════════════════════════"
echo "  PHASE 3: Uploading to Cloudflare CDN"
echo "═══════════════════════════════════════════════════════════"
echo ""

# ── 3a. Upload thumbnail images to Cloudflare Images ──
echo "── Uploading thumbnails to Cloudflare Images ──"
declare -A CF_THUMB_URLS

while IFS='|' read -r id url; do
  echo -n "  ⬆  $id ... "
  # Download first
  curl -sL -o "$DOWNLOAD_DIR/${id}.webp" "$url"

  # Upload to CF Images
  RESPONSE=$(curl -s -X POST "$CF_IMG_API" \
    -H "Authorization: Bearer $CF_IMG_TOKEN" \
    -F "file=@$DOWNLOAD_DIR/${id}.webp" \
    -F "requireSignedURLs=false")

  SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null)
  CF_URL=$(echo "$RESPONSE" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    variants = d.get('result', {}).get('variants', [])
    print(next((v for v in variants if v.endswith('/public')), variants[0] if variants else ''))
except:
    print('')
" 2>/dev/null)

  if [ "$SUCCESS" = "True" ] && [ -n "$CF_URL" ]; then
    echo "✅"
    CF_THUMB_URLS[$id]="$CF_URL"
  else
    echo "❌"
  fi
  sleep 0.3
done < "$REF_MAP_FILE"

echo ""

# ── 3b. Upload turntable videos to Cloudflare Stream ──
echo "── Uploading videos to Cloudflare Stream ──"
declare -A CF_VIDEO_URLS

while IFS='|' read -r id vurl vthumb; do
  echo -n "  ⬆  $id ... "
  # Download video
  curl -sL -o "$DOWNLOAD_DIR/${id}.mp4" "$vurl"

  # Upload to CF Stream
  R=$(curl -s -X POST "$CF_STREAM_API" \
    -H "Authorization: Bearer $CF_STREAM_TOKEN" \
    -F "file=@$DOWNLOAD_DIR/${id}.mp4" \
    -F "meta={\"name\":\"$id\",\"source\":\"skyverses-showcase-3d\"}" \
    2>/dev/null)

  SUCCESS=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null)

  if [ "$SUCCESS" = "True" ]; then
    UID_VAL=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['result'].get('uid',''))" 2>/dev/null)
    PLAYBACK="https://${CF_STREAM_SUBDOMAIN}.cloudflarestream.com/${UID_VAL}/downloads/default.mp4"
    echo "✅ → $UID_VAL"
    CF_VIDEO_URLS[$id]="$PLAYBACK"
  else
    echo "❌"
  fi
  sleep 0.5
done < "$VIDEO_RESULTS"

echo ""

# ═══════════════════════════════════════════════════════════════
# PHASE 4: Output final URLs for showcase-3d.ts
# ═══════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════"
echo "  PHASE 4: Final CDN URLs for showcase-3d.ts"
echo "═══════════════════════════════════════════════════════════"
echo ""

for i in "${!IDS[@]}"; do
  ID="${IDS[$i]}"
  NAME="${NAMES[$i]}"
  THUMB="${CF_THUMB_URLS[$ID]:-MISSING}"
  VIDEO="${CF_VIDEO_URLS[$ID]:-MISSING}"
  echo "  $ID:"
  echo "    thumb: '$THUMB',"
  echo "    videoUrl: '$VIDEO',"
  echo ""
  echo "$ID|$THUMB|$VIDEO" >> "$FINAL_OUTPUT"
done

echo "═══════════════════════════════════════════════════════════"
echo "  Results saved to: $FINAL_OUTPUT"
echo "  Format: id|thumb_cdn_url|video_cdn_url"
echo ""
echo "  To update showcase-3d.ts, run:"
echo "    node scripts/apply_3d_showcase_cdn.cjs"
echo "═══════════════════════════════════════════════════════════"

# Cleanup downloads
rm -rf "$DOWNLOAD_DIR"
