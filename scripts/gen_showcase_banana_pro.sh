#!/bin/bash
API="https://api.skyverses.com/api-client/external/image-task"
EXPLORER_API="https://api.skyverses.com/explorer"
TOKEN="Bearer skv_cbb360d3c039ffb0ebb494e8536a9730a9faa4acde25d44be11a8087b65a230b"
# JWT token for Explorer API (update if expired)
EXPLORER_TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3Nzc5NjIyNTksImV4cCI6MTc3ODU2NzA1OX0.zaXcxMq8jNYmrrNRm-MiL6mla233xnn5N3ARokDr-nk"

declare -a NAMES
declare -a PROMPTS
declare -a PRODUCTS
declare -a TAGS_LIST
declare -a RATIOS

# ═══════════════════════════════════════════════════════════════
# PRODUCT 1: Jungle Shaman Girl — "KORA, Bone Tribe Warrior"
# Style reference: @GlitterPixely — anime game character with
# bone armor, tribal weapon, jungle setting, panda companion
# ═══════════════════════════════════════════════════════════════

# 1A. Hero cinematic — action scene in environment
NAMES+=("bp-kora-hero")
PROMPTS+=("Cinematic action shot of a young anime-style jungle warrior girl with wild green hair and a leaf headdress, wearing tribal bone armor with skull pauldrons and striped leg wraps, mid-swing with a massive bone club striking a giant panda in a lush tropical jungle, dynamic motion with leaves and debris flying, volumetric sunlight filtering through the canopy, Unreal Engine 5 quality, game cinematic screenshot, photorealistic render with stylized anime proportions, shot on Hasselblad")
PRODUCTS+=("KORA — Bone Tribe Warrior")
TAGS_LIST+=("showcase,banana-pro,game,character,action")
RATIOS+=("16:9")

# 1B. Character turnaround sheet — multiple angles in ONE image
NAMES+=("bp-kora-turnaround")
PROMPTS+=("Professional game character turnaround reference sheet showing a young anime warrior girl with green hair and leaf headdress, tribal bone armor with skull accessories and striped wrappings, displayed in 8 poses on a clean neutral gray background: front view, back view, left side, right side, three-quarter front, three-quarter back, action combat pose, and crouching pose, consistent lighting and proportions across all views, concept art character sheet layout for 3D modeler reference, clean separation between poses, labeled orthographic views")
PRODUCTS+=("KORA — Bone Tribe Warrior")
TAGS_LIST+=("showcase,banana-pro,game,character,turnaround")
RATIOS+=("16:9")

# 1C. Weapon & accessory detail sheet
NAMES+=("bp-kora-details")
PROMPTS+=("Detailed prop and accessory reference sheet for a tribal jungle warrior character: close-up views of a massive bone club weapon with carved runes and leather wrapping, a skull shoulder pad with glowing green gem eye, striped leg wrappings with hidden dagger, leaf headdress with feather ornaments, bone necklace with animal teeth, belt pouch made of woven vines, each item displayed individually on clean dark background with multiple angles and material callouts, game asset concept art style, ultra-detailed rendering")
PRODUCTS+=("KORA — Bone Tribe Warrior")
TAGS_LIST+=("showcase,banana-pro,game,weapon,details")
RATIOS+=("1:1")

# 1D. Environment concept — jungle setting
NAMES+=("bp-kora-environment")
PROMPTS+=("Lush tropical jungle game environment concept art, ancient stone ruins overgrown with vines and moss, a clearing with a tribal campfire surrounded by carved bone totems, massive tree roots forming natural archways, bioluminescent mushrooms glowing softly in shadowed areas, a misty waterfall visible in the background, volumetric god rays piercing through the dense canopy, a worn dirt path leading deeper into the jungle, Unreal Engine 5 environment art, wide establishing shot, photorealistic with painterly atmosphere")
PRODUCTS+=("KORA — Bone Tribe Warrior")
TAGS_LIST+=("showcase,banana-pro,game,environment,jungle")
RATIOS+=("16:9")

# 1E. 3D figure render — clean full-body
NAMES+=("bp-kora-3d")
PROMPTS+=("Clean full-body 3D character render of a young anime-style jungle warrior girl with wild green hair and leaf headdress, wearing tribal bone armor with skull pauldrons, striped leg wraps, and carrying a massive bone club resting on her shoulder, standing in a confident idle pose, soft studio lighting with rim light, neutral gradient background from dark gray to light gray, game character model presentation, high-polygon render with subsurface scattering on skin, PBR materials on armor, figurine collectible quality")
PRODUCTS+=("KORA — Bone Tribe Warrior")
TAGS_LIST+=("showcase,banana-pro,game,character,3d-render")
RATIOS+=("1:1")

# ═══════════════════════════════════════════════════════════════
# PRODUCT 2: Mech Pilot — "ZERO, Ghost Frame Operator"
# Sci-fi mech game character + mech design showcase
# ═══════════════════════════════════════════════════════════════

# 2A. Hero cinematic — mech in action
NAMES+=("bp-zero-hero")
PROMPTS+=("Cinematic wide shot of a sleek white and crimson bipedal mech suit sprinting through a destroyed futuristic city at night, one arm transformed into a plasma cannon firing a beam of blue energy that illuminates the rain and debris, explosions erupting in the background, the pilot visible through the glowing blue cockpit visor, dynamic low-angle shot with motion blur on the legs, sparks and shrapnel flying, AAA game cinematic quality, Armored Core and Gundam inspired design, photorealistic 4K render")
PRODUCTS+=("ZERO — Ghost Frame Operator")
TAGS_LIST+=("showcase,banana-pro,game,mech,action")
RATIOS+=("16:9")

# 2B. Character + mech turnaround sheet
NAMES+=("bp-zero-turnaround")
PROMPTS+=("Professional mech design turnaround reference sheet showing a sleek bipedal combat mech in white and crimson color scheme, displayed in 6 views on clean dark blue technical background: front orthographic, back orthographic, left side, right side, three-quarter action pose with plasma cannon deployed, and seated cockpit-open view showing the pilot inside, height comparison silhouette with human figure, technical annotations and armor panel lines visible, mecha concept art sheet for 3D production, clean consistent lighting")
PRODUCTS+=("ZERO — Ghost Frame Operator")
TAGS_LIST+=("showcase,banana-pro,game,mech,turnaround")
RATIOS+=("16:9")

# 2C. Cockpit interior detail
NAMES+=("bp-zero-cockpit")
PROMPTS+=("Detailed interior view of a futuristic mech cockpit, the pilot strapped into a form-fitting seat surrounded by holographic displays showing radar, weapon systems, and shield status, dual control sticks with haptic feedback panels, a heads-up display projected on the curved windshield showing targeting reticle, ambient blue lighting from instruments, warning labels in Japanese text on panels, cables and hydraulic lines visible in the ceiling, sci-fi game UI design reference, ultra-detailed close-up render, cinematic atmosphere")
PRODUCTS+=("ZERO — Ghost Frame Operator")
TAGS_LIST+=("showcase,banana-pro,game,mech,cockpit")
RATIOS+=("1:1")

# 2D. Weapon systems breakdown
NAMES+=("bp-zero-weapons")
PROMPTS+=("Technical blueprint-style weapon systems breakdown for a combat mech, dark navy blue background with white and cyan line art: arm-mounted plasma cannon with cross-section showing energy core, shoulder missile pod array with 8 tubes, hip-mounted energy blade in deployed and stowed positions, chest-mounted point-defense laser grid, back-mounted thruster pack with fuel lines, each weapon shown in multiple views with dimension lines and Japanese technical labels, military spec sheet aesthetic, clean vector illustration quality")
PRODUCTS+=("ZERO — Ghost Frame Operator")
TAGS_LIST+=("showcase,banana-pro,game,mech,blueprint")
RATIOS+=("16:9")

# 2E. Pilot character render
NAMES+=("bp-zero-pilot")
PROMPTS+=("Full-body character render of a young male mech pilot in a sleek white and crimson flight suit with black accents, short silver hair, confident smirk, holding a helmet under one arm with the visor glowing blue, the other hand resting on his hip, dog tags hanging from neck, flight suit has subtle panel lines and status LEDs on the chest, soft studio lighting, clean gradient background, anime-influenced proportions with realistic rendering, game character portrait quality, 4K")
PRODUCTS+=("ZERO — Ghost Frame Operator")
TAGS_LIST+=("showcase,banana-pro,game,character,pilot")
RATIOS+=("1:1")

# ═══════════════════════════════════════════════════════════════
# PRODUCT 3: Dark Souls-style Boss — "MALACHAR, The Undying King"
# Fantasy action RPG boss design showcase
# ═══════════════════════════════════════════════════════════════

# 3A. Hero cinematic — boss encounter
NAMES+=("bp-malachar-hero")
PROMPTS+=("Epic boss encounter cinematic screenshot from a dark fantasy action RPG, a colossal skeletal king wreathed in ghostly green flames sitting on a throne of fused swords and bones in a massive crumbling cathedral, the player character tiny in the foreground approaching with sword drawn, dramatic scale difference emphasizing the boss size, shafts of moonlight through broken stained glass windows, atmospheric fog and floating ember particles, Dark Souls and Elden Ring inspired, ultra-wide cinematic composition, 4K")
PRODUCTS+=("MALACHAR — The Undying King")
TAGS_LIST+=("showcase,banana-pro,game,boss,dark-fantasy")
RATIOS+=("16:9")

# 3B. Boss turnaround sheet
NAMES+=("bp-malachar-turnaround")
PROMPTS+=("Dark fantasy boss character turnaround reference sheet showing a colossal skeletal king in corroded black armor with a tattered cape, a crown of twisted iron fused to the skull, ghostly green flames burning from the eye sockets and chest cavity, wielding a massive serrated greatsword, displayed in 6 views on dark background: front, back, left side, right side, attacking pose with sword raised, and defeated crumbling pose, size comparison with normal human figure showing 4x height, concept art production sheet")
PRODUCTS+=("MALACHAR — The Undying King")
TAGS_LIST+=("showcase,banana-pro,game,boss,turnaround")
RATIOS+=("16:9")

# 3C. Boss weapon & armor details
NAMES+=("bp-malachar-details")
PROMPTS+=("Detailed weapon and armor prop sheet for a dark fantasy boss character: close-up views of a massive serrated greatsword covered in dried blood and glowing green runes, corroded black iron crown with three twisted spires, chest armor with exposed ribcage glowing with spectral fire, gauntlets with finger bones extending into claws, tattered cape with spectral particles dissolving at the edges, each item shown individually with material and texture detail callouts, dark background with moody green accent lighting, game asset reference quality")
PRODUCTS+=("MALACHAR — The Undying King")
TAGS_LIST+=("showcase,banana-pro,game,boss,details")
RATIOS+=("1:1")

# 3D. Boss arena environment
NAMES+=("bp-malachar-arena")
PROMPTS+=("Massive dark fantasy cathedral boss arena environment concept art, crumbling Gothic architecture with impossibly tall vaulted ceilings disappearing into darkness, hundreds of rusted swords embedded in the floor forming a path to a bone throne at the far end, broken stained glass windows letting in cold moonlight beams, green spectral flames burning in ancient braziers, a bottomless pit surrounding the central platform connected by crumbling stone bridges, atmospheric volumetric fog, Elden Ring inspired level design, 4K wide shot")
PRODUCTS+=("MALACHAR — The Undying King")
TAGS_LIST+=("showcase,banana-pro,game,environment,dark-fantasy")
RATIOS+=("16:9")

# 3E. 3D figure — collectible style
NAMES+=("bp-malachar-3d")
PROMPTS+=("Premium collectible figure render of a skeletal king boss from a dark fantasy RPG, standing on a detailed base made of fused swords and skulls, corroded black armor with ghostly green flames emanating from the chest and eye sockets, tattered cape frozen mid-billow, massive serrated greatsword planted point-down beside him, one skeletal hand resting on the pommel, dramatic studio lighting with green rim light, dark gradient background, high-end statue collectible presentation, PBR materials, 4K render")
PRODUCTS+=("MALACHAR — The Undying King")
TAGS_LIST+=("showcase,banana-pro,game,boss,3d-render")
RATIOS+=("1:1")

# ═══════════════════════════════════════════════════════════════
# PRODUCT 4: Action Movie Hero — "VIPER, Shadow Protocol Agent"
# Action movie character design showcase
# ═══════════════════════════════════════════════════════════════

# 4A. Hero cinematic — action scene
NAMES+=("bp-viper-hero")
PROMPTS+=("Cinematic action movie frame of a female special forces agent in a black tactical suit walking in slow-motion away from a massive fireball explosion on a rain-soaked Tokyo street at night, debris flying past her, she holds a suppressed pistol at her side, long dark hair whipping in the shockwave, neon signs reflecting in wet asphalt, teal and orange color grading, anamorphic lens flare, John Wick meets Mission Impossible aesthetic, photorealistic Hollywood quality, 4K widescreen")
PRODUCTS+=("VIPER — Shadow Protocol Agent")
TAGS_LIST+=("showcase,banana-pro,action,movie,character")
RATIOS+=("16:9")

# 4B. Character costume/gear sheet
NAMES+=("bp-viper-turnaround")
PROMPTS+=("Action movie character costume and gear reference sheet showing a female special forces agent in multiple views: front view in full black tactical suit with body armor and thigh holster, back view showing utility belt and blade sheath, civilian cover outfit in leather jacket and jeans, formal infiltration outfit in a black evening gown with concealed weapons, each outfit shown on clean dark background with gear callouts, movie character design production sheet, 4 outfits displayed side by side, photorealistic fashion illustration quality")
PRODUCTS+=("VIPER — Shadow Protocol Agent")
TAGS_LIST+=("showcase,banana-pro,action,movie,turnaround")
RATIOS+=("16:9")

# 4C. Weapons loadout sheet
NAMES+=("bp-viper-weapons")
PROMPTS+=("Tactical weapons and gadget loadout sheet for an action movie spy character: custom suppressed pistol with laser sight, compact submachine gun with folding stock, ceramic throwing knives set of 3, wrist-mounted grappling hook device, small EMP grenade, lockpicking kit in leather roll, earpiece communicator, night vision contact lenses in case, each item photographed individually on dark surface with dramatic side lighting, military catalog aesthetic, photorealistic product photography, 4K")
PRODUCTS+=("VIPER — Shadow Protocol Agent")
TAGS_LIST+=("showcase,banana-pro,action,movie,weapons")
RATIOS+=("1:1")

# 4D. Storyboard layout — key action scenes
NAMES+=("bp-viper-storyboard")
PROMPTS+=("Professional movie storyboard layout showing 6 key action sequence frames arranged in a 2x3 grid on white background with scene descriptions below each frame: frame 1 agent rappelling down glass building, frame 2 motorcycle chase through narrow alley, frame 3 hand-to-hand combat in elevator, frame 4 underwater infiltration through flooded tunnel, frame 5 rooftop sniper position overlooking city, frame 6 helicopter extraction in snowstorm, pencil sketch style with light watercolor wash, camera angle arrows and movement notes, professional film production storyboard")
PRODUCTS+=("VIPER — Shadow Protocol Agent")
TAGS_LIST+=("showcase,banana-pro,action,movie,storyboard")
RATIOS+=("16:9")

# 4E. Movie poster concept
NAMES+=("bp-viper-poster")
PROMPTS+=("Hollywood action movie poster featuring a female special forces agent standing center frame in a dramatic pose holding two pistols crossed at her chest, rain-soaked cityscape behind her with explosions and helicopters, reflections of adversaries visible in the wet ground, bold teal and orange color grade, dramatic upward lighting illuminating her face, cinematic composition with depth and layered elements, blockbuster movie poster quality, intense atmosphere, photorealistic 4K")
PRODUCTS+=("VIPER — Shadow Protocol Agent")
TAGS_LIST+=("showcase,banana-pro,action,movie,poster")
RATIOS+=("9:16")

# ═══════════════════════════════════════════════════════════════
# PRODUCT 5: Racing Game — "HAYABUSA GT, Cyber Street Racer"
# Concept car design showcase for racing game
# ═══════════════════════════════════════════════════════════════

# 5A. Hero shot — car in action
NAMES+=("bp-hayabusa-hero")
PROMPTS+=("Cinematic action shot of a futuristic Japanese street racing car drifting through a neon-lit Tokyo intersection at night, aggressive angular body kit glowing with embedded LED strips in electric blue, massive rear wing, smoke pouring from the rear tires, sparks flying from the low front splitter scraping the road, motion blur on the background neon signs, wet road reflecting all the lights, Need for Speed and Cyberpunk aesthetic, photorealistic automotive photography, shot on 35mm with motion blur, 4K")
PRODUCTS+=("HAYABUSA GT — Cyber Street Racer")
TAGS_LIST+=("showcase,banana-pro,game,vehicle,racing")
RATIOS+=("16:9")

# 5B. Car design turnaround
NAMES+=("bp-hayabusa-turnaround")
PROMPTS+=("Automotive design turnaround sheet of a futuristic Japanese street racing car, aggressive angular body with aerodynamic curves, shown in 5 views on clean dark studio background: front three-quarter hero angle, direct side profile, rear three-quarter showing the massive wing and quad exhaust, top-down overhead view showing roof scoop and livery design, and front view showing aggressive headlight design, electric blue with carbon fiber accents color scheme, automotive design portfolio presentation, clean studio lighting, 4K")
PRODUCTS+=("HAYABUSA GT — Cyber Street Racer")
TAGS_LIST+=("showcase,banana-pro,game,vehicle,turnaround")
RATIOS+=("16:9")

# 5C. Interior & dashboard
NAMES+=("bp-hayabusa-interior")
PROMPTS+=("Futuristic racing car cockpit interior, racing bucket seat with 6-point harness, flat-bottom steering wheel with integrated holographic HUD display showing speed and track map, roll cage with LED accent lighting in blue, carbon fiber dashboard with minimal physical buttons, digital instrument cluster with Japanese text readouts, sequential shift lights across the top of the windshield, night scene with city lights visible through the windshield, automotive interior photography, ultra-detailed 4K")
PRODUCTS+=("HAYABUSA GT — Cyber Street Racer")
TAGS_LIST+=("showcase,banana-pro,game,vehicle,interior")
RATIOS+=("1:1")

# 5D. Color variants sheet
NAMES+=("bp-hayabusa-colors")
PROMPTS+=("Color variant lineup of a futuristic Japanese street racing car shown in 6 different livery schemes arranged in two rows of 3 on dark background: electric blue with white stripes, matte black with red accents, pearl white with gold details, neon green with carbon fiber, midnight purple with silver, and burnt orange with black, each shown from the same three-quarter front angle, automotive color palette presentation, clean studio render, consistent lighting across all variants, 4K")
PRODUCTS+=("HAYABUSA GT — Cyber Street Racer")
TAGS_LIST+=("showcase,banana-pro,game,vehicle,colors")
RATIOS+=("16:9")

# 5E. Track environment
NAMES+=("bp-hayabusa-track")
PROMPTS+=("Futuristic night racing circuit through a cyberpunk Tokyo cityscape, elevated highway track weaving between neon-lit skyscrapers, holographic advertising billboards floating above the track, tire barriers with LED markers, a pack of 4 racing cars approaching a tight corner with brake lights glowing red, cherry blossom trees lining one section of track with petals blowing across the road, dramatic aerial perspective shot, racing game environment concept art, cinematic atmosphere, 4K")
PRODUCTS+=("HAYABUSA GT — Cyber Street Racer")
TAGS_LIST+=("showcase,banana-pro,game,environment,racing")
RATIOS+=("16:9")

# ═══════════════════════════════════════════════════════════════
# PRODUCT 6: Clay Art Social Profile — "MIRA, Clay Creator"
# Style reference: @miratechtool — entire social media profile
# rendered as 3D clay/plasticine sculpture with handcrafted elements
# ═══════════════════════════════════════════════════════════════

# 6A. Hero — full clay profile render
NAMES+=("bp-mira-hero")
PROMPTS+=("A complete Twitter social media profile page recreated entirely as a 3D clay sculpture artwork, the entire interface made of colorful plasticine and polymer clay on a black clay background, a circular clay avatar frame with a miniature girl figurine inside, clay text showing username and bio, clay icons for likes hearts and bookmarks, a pinned post section with tiny clay text, decorative clay elements around the edges including a pink castle, yellow stars, butterflies, a dreamcatcher, candy swirls, and flower petals, warm studio lighting with soft shadows showing the 3D depth of each clay element, stop-motion animation aesthetic, handcrafted artisan quality, overhead camera angle, 4K")
PRODUCTS+=("MIRA — Clay Creator Profile")
TAGS_LIST+=("showcase,banana-pro,clay-art,social-media,3d")
RATIOS+=("9:16")

# 6B. Element turnaround — individual clay pieces
NAMES+=("bp-mira-turnaround")
PROMPTS+=("Clay art element reference sheet showing individual handcrafted plasticine social media UI components arranged on a clean white background: a 3D clay heart icon, a clay bookmark ribbon, a clay star with sparkle, a clay speech bubble, a clay notification bell, a clay verified checkmark badge, a clay follow button, a clay retweet arrows icon, each piece shown from front and three-quarter angle with visible fingerprint texture and soft rounded edges, warm studio lighting, polymer clay crafting style, miniature sculpture quality, overhead product photography layout")
PRODUCTS+=("MIRA — Clay Creator Profile")
TAGS_LIST+=("showcase,banana-pro,clay-art,ui-elements,turnaround")
RATIOS+=("16:9")

# 6C. Detail close-ups — castle, avatar, dreamcatcher
NAMES+=("bp-mira-details")
PROMPTS+=("Extreme close-up detail shots of handcrafted clay social media profile decorations arranged in a 2x2 grid: top-left a pink and white clay fairy tale castle with tiny windows and turrets, top-right a circular clay avatar frame with a miniature girl figurine wearing glasses and hoodie, bottom-left a clay dreamcatcher with woven threads and dangling feathers, bottom-right a clay ferris wheel with colorful gondolas, each piece showing intricate fingerprint textures and layered clay details, macro photography with shallow depth of field, warm artisan workshop lighting, polymer clay sculpture quality")
PRODUCTS+=("MIRA — Clay Creator Profile")
TAGS_LIST+=("showcase,banana-pro,clay-art,details,macro")
RATIOS+=("1:1")

# 6D. Workshop environment — behind the scenes
NAMES+=("bp-mira-environment")
PROMPTS+=("A cozy clay artist workshop workspace from above, a wooden table covered with polymer clay crafting tools and materials, half-finished clay social media icons and UI elements scattered around, small jars of colorful clay in rainbow colors, sculpting tools and wire armatures, a completed clay Twitter profile artwork in the center being worked on by tiny clay hands, warm desk lamp lighting casting soft shadows, creative studio atmosphere, overhead bird-eye view, artisan crafting workspace photography, 4K")
PRODUCTS+=("MIRA — Clay Creator Profile")
TAGS_LIST+=("showcase,banana-pro,clay-art,environment,workshop")
RATIOS+=("16:9")

# 6E. 3D figurine — clean presentation
NAMES+=("bp-mira-3d")
PROMPTS+=("A premium collectible clay art diorama of a miniature social media profile rendered entirely in polymer clay, displayed on a wooden pedestal base, the clay profile features a tiny avatar girl with glasses, clay text bio, clay interaction buttons, surrounded by decorative clay elements including a castle, stars, butterflies, and flowers, the entire piece is about 15cm tall, clean studio photography with gradient background from dark gray to white, soft rim lighting highlighting the 3D clay textures, collectible art toy presentation, museum display quality, 4K")
PRODUCTS+=("MIRA — Clay Creator Profile")
TAGS_LIST+=("showcase,banana-pro,clay-art,3d-render,collectible")
RATIOS+=("1:1")

# ═══════════════════════════════════════════════════════════════
# PRODUCT 7: Anime Streetwear Magazine — "RYUJI, Street Legend"
# Style reference: @miratechtool Sanji — anime character rendered
# as high-fashion streetwear magazine cover with bold typography,
# Japanese text, brand logos, dynamic pose, yellow/black palette
# ═══════════════════════════════════════════════════════════════

# 7A. Hero — full magazine cover
NAMES+=("bp-ryuji-hero")
PROMPTS+=("Anime streetwear magazine cover featuring a cool male anime character with spiky blonde hair covering one eye, wearing an oversized black and yellow streetwear hoodie with bold number 03 print, baggy cargo pants with straps, chunky designer sneakers, sitting in a dynamic relaxed pose with one leg extended, bold magazine title typography at the top in white, Japanese katakana text scattered around the layout, character quote in a speech bubble, brand logos and issue number in the corner, clean white background with yellow and black graphic design elements, manga illustration style with fashion editorial layout, sharp clean lines, professional magazine print quality, 4K")
PRODUCTS+=("RYUJI — Street Legend Magazine")
TAGS_LIST+=("showcase,banana-pro,anime,streetwear,magazine")
RATIOS+=("9:16")

# 7B. Character turnaround — outfit showcase
NAMES+=("bp-ryuji-turnaround")
PROMPTS+=("Anime character outfit turnaround reference sheet showing a cool male anime character with spiky blonde hair in 4 different streetwear outfits on clean white background: outfit 1 oversized black hoodie with yellow accents and cargo pants, outfit 2 long black trench coat with gold chain accessories, outfit 3 fitted black turtleneck with yellow bomber jacket and slim jeans, outfit 4 open black shirt revealing tattooed chest with gold pendant necklace and track pants, each outfit shown front view with Japanese text labels and brand callouts, fashion lookbook layout, manga illustration style, clean typography")
PRODUCTS+=("RYUJI — Street Legend Magazine")
TAGS_LIST+=("showcase,banana-pro,anime,streetwear,turnaround")
RATIOS+=("16:9")

# 7C. Detail close-ups — accessories & sneakers
NAMES+=("bp-ryuji-details")
PROMPTS+=("Anime streetwear accessories detail sheet arranged in a grid layout on white background: close-up of chunky black and yellow designer sneakers with visible sole detail, a gold chain pendant with kanji engraving, fingerless black leather gloves with metal studs, a crossbody sling bag with anime patches, round yellow-tinted sunglasses, a lighter with engraved dragon, each item drawn in clean manga illustration style with product photography composition, bold item names in Japanese and English typography, streetwear catalog aesthetic, sharp lines and flat colors")
PRODUCTS+=("RYUJI — Street Legend Magazine")
TAGS_LIST+=("showcase,banana-pro,anime,streetwear,details")
RATIOS+=("1:1")

# 7D. Magazine spread — action pose editorial
NAMES+=("bp-ryuji-spread")
PROMPTS+=("Double-page anime magazine editorial spread featuring a blonde anime character in streetwear performing a dynamic high kick in mid-air, black and yellow outfit with motion blur on the leg, bold Japanese typography flowing around the figure reading style and power, smaller inset photos in the corner showing close-up face portrait and back view of jacket with large kanji print, magazine page layout with columns of Japanese text body copy, page numbers and footer, professional editorial design with manga art style, yellow black and white color scheme, print magazine quality")
PRODUCTS+=("RYUJI — Street Legend Magazine")
TAGS_LIST+=("showcase,banana-pro,anime,editorial,action")
RATIOS+=("16:9")

# 7E. Poster variant — cinematic street scene
NAMES+=("bp-ryuji-poster")
PROMPTS+=("Cinematic anime poster of a blonde male character in black and yellow streetwear standing alone under a Tokyo street light at night, cigarette smoke trailing upward, hands in hoodie pockets, neon signs reflecting on wet pavement behind him, dramatic low-angle composition, the character's shadow stretching long across the ground, bold movie-style title STREET LEGEND in metallic gold typography at the bottom with Japanese subtitle, dark moody atmosphere with yellow accent lighting, manga illustration meets movie poster aesthetic, theatrical one-sheet quality, 4K")
PRODUCTS+=("RYUJI — Street Legend Magazine")
TAGS_LIST+=("showcase,banana-pro,anime,poster,cinematic")
RATIOS+=("9:16")

JOBIDS=()

echo "🎨 Creating ${#NAMES[@]} Banana Pro showcase image jobs (game & action focus)..."
for i in "${!NAMES[@]}"; do
  P="${PROMPTS[$i]}"
  P_ESC=$(echo "$P" | sed 's/"/\\"/g')

  AR="${RATIOS[$i]}"
  R=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"prompt\":\"$P_ESC\",\"aspectRatio\":\"$AR\",\"engine\":{\"provider\":\"fxflow\",\"model\":\"google_image_gen_4_5\"}}")
  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  JOBIDS+=("$JID")
  echo "  [$((i+1))/${#NAMES[@]}] ${NAMES[$i]} → $JID"
  sleep 1
done

echo ""
echo "⏳ Polling results (this may take a few minutes)..."

RESULTS_FILE="/tmp/showcase_banana_pro_v3_results.txt"
> "$RESULTS_FILE"

for i in "${!NAMES[@]}"; do
  JID="${JOBIDS[$i]}"
  NAME="${NAMES[$i]}"
  PRODUCT="${PRODUCTS[$i]}"
  PROMPT="${PROMPTS[$i]}"
  TAGS="${TAGS_LIST[$i]}"
  [ -z "$JID" ] && echo "❌ $NAME: no job ID" && continue

  for attempt in $(seq 1 60); do
    sleep 5
    SR=$(curl -s "$API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "✅ $NAME → $URL"
      echo "$NAME|$URL|$PRODUCT" >> "$RESULTS_FILE"

      # ── Save to Explorer ──
      PROMPT_ESC=$(echo "$PROMPT" | sed 's/"/\\"/g')
      IFS=',' read -ra TAG_ARR <<< "$TAGS"
      TAG_JSON=$(printf '"%s",' "${TAG_ARR[@]}")
      TAG_JSON="[${TAG_JSON%,}]"

      EXPLORER_BODY="{\"title\":\"$PRODUCT — $(echo $NAME | sed 's/bp-//g')\",\"type\":\"image\",\"prompt\":\"$PROMPT_ESC\",\"thumbnailUrl\":\"$URL\",\"mediaUrl\":\"$URL\",\"model\":\"google_image_gen_4_5\",\"tags\":$TAG_JSON,\"categories\":[\"showcase\",\"banana-pro\"],\"status\":\"published\"}"

      EXPLORER_R=$(curl -s -X POST "$EXPLORER_API" \
        -H "Content-Type: application/json" \
        -H "Authorization: $EXPLORER_TOKEN" \
        -d "$EXPLORER_BODY")
      EXPLORER_ID=$(echo "$EXPLORER_R" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('_id','n/a'))" 2>/dev/null)
      echo "  📋 Saved to Explorer: $EXPLORER_ID"

      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      ERR=$(echo "$SR" | python3 -c "import sys,json; e=json.load(sys.stdin)['data'].get('error',{}); print(e.get('userMessage','unknown'))" 2>/dev/null)
      echo "❌ $NAME FAILED: $ERR"
      break
    else
      printf "  ⏳ %s: %s (%d/60)\r" "$NAME" "$ST" "$attempt"
    fi
  done
done

echo ""
echo "📋 All results:"
cat "$RESULTS_FILE"
echo ""
echo "🏁 Done! Download with:"
echo 'while IFS="|" read -r name url product; do'
echo '  curl -L -o "public/assets/showcase/${name}.webp" "$url"'
echo 'done < /tmp/showcase_banana_pro_v3_results.txt'
