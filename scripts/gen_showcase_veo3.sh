#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# Veo3 Showcase — v5 (fully self-contained)
# Phase 1: Auto-generate reference images needed for video jobs
# Phase 2: Submit video jobs using generated reference URLs
# Phase 3: Poll results & save to Explorer
# ═══════════════════════════════════════════════════════════════════════
IMG_API="https://api.skyverses.com/api-client/external/image-task"
VID_API="https://api.skyverses.com/api-client/external/video-task"
EXPLORER_API="https://api.skyverses.com/explorer"
TOKEN="Bearer skv_cbb360d3c039ffb0ebb494e8536a9730a9faa4acde25d44be11a8087b65a230b"
# JWT token for Explorer API (update if expired)
EXPLORER_TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3Nzc5NjIyNTksImV4cCI6MTc3ODU2NzA1OX0.zaXcxMq8jNYmrrNRm-MiL6mla233xnn5N3ARokDr-nk"

REF_MAP_FILE="/tmp/veo3_ref_map.txt"
> "$REF_MAP_FILE"

# ═══════════════════════════════════════════════════════════════
# PHASE 1: Auto-generate reference images
# ═══════════════════════════════════════════════════════════════
declare -a REF_NAMES
declare -a REF_PROMPTS
declare -a REF_RATIOS

# ── KORA refs ──
REF_NAMES+=("bp-kora-hero")
REF_PROMPTS+=("Cinematic action shot of a young anime-style jungle warrior girl with wild green hair and a leaf headdress, wearing tribal bone armor with skull pauldrons and striped leg wraps, mid-swing with a massive bone club striking a giant panda in a lush tropical jungle, dynamic motion with leaves and debris flying, volumetric sunlight filtering through the canopy, Unreal Engine 5 quality, game cinematic screenshot")
REF_RATIOS+=("16:9")

REF_NAMES+=("bp-kora-turnaround")
REF_PROMPTS+=("Professional game character turnaround reference sheet showing a young anime warrior girl with green hair and leaf headdress, tribal bone armor with skull accessories and striped wrappings, displayed in 8 poses on a clean neutral gray background: front view, back view, left side, right side, three-quarter front, three-quarter back, action combat pose, and crouching pose, consistent lighting, concept art character sheet layout")
REF_RATIOS+=("16:9")

REF_NAMES+=("bp-kora-3d")
REF_PROMPTS+=("Clean full-body 3D character render of a young anime-style jungle warrior girl with wild green hair and leaf headdress, wearing tribal bone armor with skull pauldrons, striped leg wraps, and carrying a massive bone club resting on her shoulder, standing in a confident idle pose, soft studio lighting with rim light, neutral gradient background, game character model presentation, figurine collectible quality")
REF_RATIOS+=("1:1")

# ── ZERO refs ──
REF_NAMES+=("bp-zero-hero")
REF_PROMPTS+=("Cinematic wide shot of a sleek white and crimson bipedal mech suit sprinting through a destroyed futuristic city at night, one arm transformed into a plasma cannon firing a beam of blue energy that illuminates the rain and debris, explosions erupting in the background, dynamic low-angle shot with motion blur on the legs, AAA game cinematic quality, Armored Core and Gundam inspired design, 4K render")
REF_RATIOS+=("16:9")

REF_NAMES+=("bp-zero-turnaround")
REF_PROMPTS+=("Professional mech design turnaround reference sheet showing a sleek bipedal combat mech in white and crimson color scheme, displayed in 6 views on clean dark blue technical background: front orthographic, back orthographic, left side, right side, three-quarter action pose with plasma cannon deployed, and seated cockpit-open view, height comparison silhouette with human figure, mecha concept art sheet for 3D production")
REF_RATIOS+=("16:9")

REF_NAMES+=("bp-zero-pilot")
REF_PROMPTS+=("Full-body character render of a young male mech pilot in a sleek white and crimson flight suit with black accents, short silver hair, confident smirk, holding a helmet under one arm with the visor glowing blue, the other hand resting on his hip, dog tags hanging from neck, soft studio lighting, clean gradient background, anime-influenced proportions with realistic rendering, game character portrait quality")
REF_RATIOS+=("1:1")

REF_NAMES+=("bp-zero-cockpit")
REF_PROMPTS+=("Detailed interior view of a futuristic mech cockpit, the pilot strapped into a form-fitting seat surrounded by holographic displays showing radar weapon systems and shield status, dual control sticks, a heads-up display projected on the curved windshield showing targeting reticle, ambient blue lighting from instruments, warning labels in Japanese text on panels, sci-fi game UI design reference, ultra-detailed close-up render")
REF_RATIOS+=("1:1")

# ── MALACHAR refs ──
REF_NAMES+=("bp-malachar-hero")
REF_PROMPTS+=("Epic boss encounter cinematic screenshot from a dark fantasy action RPG, a colossal skeletal king wreathed in ghostly green flames sitting on a throne of fused swords and bones in a massive crumbling cathedral, the player character tiny in the foreground approaching with sword drawn, shafts of moonlight through broken stained glass windows, atmospheric fog, Dark Souls and Elden Ring inspired, ultra-wide cinematic composition")
REF_RATIOS+=("16:9")

REF_NAMES+=("bp-malachar-turnaround")
REF_PROMPTS+=("Dark fantasy boss character turnaround reference sheet showing a colossal skeletal king in corroded black armor with a tattered cape, a crown of twisted iron fused to the skull, ghostly green flames burning from the eye sockets and chest cavity, wielding a massive serrated greatsword, displayed in 6 views on dark background: front, back, left side, right side, attacking pose, defeated crumbling pose, size comparison with normal human figure, concept art production sheet")
REF_RATIOS+=("16:9")

REF_NAMES+=("bp-malachar-3d")
REF_PROMPTS+=("Premium collectible figure render of a skeletal king boss from a dark fantasy RPG, standing on a detailed base made of fused swords and skulls, corroded black armor with ghostly green flames emanating from the chest and eye sockets, tattered cape frozen mid-billow, massive serrated greatsword planted point-down beside him, dramatic studio lighting with green rim light, dark gradient background, high-end statue collectible presentation")
REF_RATIOS+=("1:1")

# ── VIPER refs ──
REF_NAMES+=("bp-viper-hero")
REF_PROMPTS+=("Cinematic action movie frame of a female special forces agent in a black tactical suit walking in slow-motion away from a massive fireball explosion on a rain-soaked Tokyo street at night, debris flying past her, she holds a suppressed pistol at her side, long dark hair whipping in the shockwave, neon signs reflecting in wet asphalt, teal and orange color grading, anamorphic lens flare, photorealistic Hollywood quality")
REF_RATIOS+=("16:9")

REF_NAMES+=("bp-viper-turnaround")
REF_PROMPTS+=("Action movie character costume and gear reference sheet showing a female special forces agent in multiple views: front view in full black tactical suit with body armor and thigh holster, back view showing utility belt and blade sheath, civilian cover outfit in leather jacket and jeans, formal infiltration outfit in a black evening gown with concealed weapons, each outfit on clean dark background, movie character design production sheet, photorealistic quality")
REF_RATIOS+=("16:9")

REF_NAMES+=("bp-viper-poster")
REF_PROMPTS+=("Hollywood action movie poster featuring a female special forces agent standing center frame in a dramatic pose holding two pistols crossed at her chest, rain-soaked cityscape behind her with explosions and helicopters, reflections of adversaries visible in the wet ground, bold teal and orange color grade, dramatic upward lighting, cinematic composition with depth and layered elements, blockbuster movie poster quality, 4K")
REF_RATIOS+=("9:16")

# ── MIRA refs ──
REF_NAMES+=("bp-mira-hero")
REF_PROMPTS+=("A complete Twitter social media profile page recreated entirely as a 3D clay sculpture artwork, the entire interface made of colorful plasticine and polymer clay on a black clay background, a circular clay avatar frame with a miniature girl figurine inside, clay text showing username and bio, clay icons, decorative clay elements including a pink castle, yellow stars, butterflies, a dreamcatcher, warm studio lighting, stop-motion animation aesthetic, overhead camera angle")
REF_RATIOS+=("9:16")

REF_NAMES+=("bp-mira-details")
REF_PROMPTS+=("Extreme close-up detail shots of handcrafted clay social media profile decorations arranged in a 2x2 grid: top-left a pink and white clay fairy tale castle with tiny windows and turrets, top-right a circular clay avatar frame with a miniature girl figurine wearing glasses, bottom-left a clay dreamcatcher with woven threads and dangling feathers, bottom-right a clay ferris wheel with colorful gondolas, macro photography, warm artisan workshop lighting, polymer clay sculpture quality")
REF_RATIOS+=("1:1")

REF_NAMES+=("bp-mira-3d")
REF_PROMPTS+=("A premium collectible clay art diorama of a miniature social media profile rendered entirely in polymer clay, displayed on a wooden pedestal base, the clay profile features a tiny avatar girl with glasses, clay text bio, clay interaction buttons, surrounded by decorative clay elements including a castle, stars, butterflies, clean studio photography with gradient background, soft rim lighting, collectible art toy presentation")
REF_RATIOS+=("1:1")

# ── HAYABUSA refs ──
REF_NAMES+=("bp-hayabusa-hero")
REF_PROMPTS+=("Cinematic action shot of a futuristic Japanese street racing car drifting through a neon-lit Tokyo intersection at night, aggressive angular body kit glowing with embedded LED strips in electric blue, massive rear wing, smoke pouring from the rear tires, sparks flying from the low front splitter, wet road reflecting all the lights, Need for Speed and Cyberpunk aesthetic, photorealistic automotive photography, 4K")
REF_RATIOS+=("16:9")

REF_NAMES+=("bp-hayabusa-turnaround")
REF_PROMPTS+=("Automotive design turnaround sheet of a futuristic Japanese street racing car, aggressive angular body with aerodynamic curves, shown in 5 views on clean dark studio background: front three-quarter hero angle, direct side profile, rear three-quarter showing massive wing and quad exhaust, top-down overhead view, and front view showing aggressive headlight design, electric blue with carbon fiber accents, automotive design portfolio presentation")
REF_RATIOS+=("16:9")

# ── RYUJI refs ──
REF_NAMES+=("bp-ryuji-hero")
REF_PROMPTS+=("Anime streetwear magazine cover featuring a cool male anime character with spiky blonde hair covering one eye, wearing an oversized black and yellow streetwear hoodie with bold number 03 print, baggy cargo pants, chunky designer sneakers, sitting in a dynamic relaxed pose, bold magazine title typography at the top in white, Japanese katakana text, clean white background with yellow and black graphic design elements, manga illustration style with fashion editorial layout")
REF_RATIOS+=("9:16")

REF_NAMES+=("bp-ryuji-turnaround")
REF_PROMPTS+=("Anime character outfit turnaround reference sheet showing a cool male anime character with spiky blonde hair in 4 different streetwear outfits on clean white background: outfit 1 oversized black hoodie with yellow accents and cargo pants, outfit 2 long black trench coat with gold chain, outfit 3 fitted black turtleneck with yellow bomber jacket, outfit 4 open black shirt with gold pendant, each outfit shown front view with Japanese text labels, fashion lookbook layout, manga illustration style")
REF_RATIOS+=("16:9")

REF_NAMES+=("bp-ryuji-poster")
REF_PROMPTS+=("Cinematic anime poster of a blonde male character in black and yellow streetwear standing alone under a Tokyo street light at night, cigarette smoke trailing upward, hands in hoodie pockets, neon signs reflecting on wet pavement behind him, dramatic low-angle composition, bold movie-style title STREET LEGEND in metallic gold typography at the bottom with Japanese subtitle, dark moody atmosphere with yellow accent lighting, manga meets movie poster aesthetic")
REF_RATIOS+=("9:16")

# ── Submit all reference image jobs ──
REF_TOTAL=${#REF_NAMES[@]}
declare -a REF_JOBIDS

echo "============================================="
echo "  PHASE 1: Generating $REF_TOTAL reference images"
echo "============================================="
echo ""

for i in "${!REF_NAMES[@]}"; do
  P="${REF_PROMPTS[$i]}"
  P_ESC=$(echo "$P" | sed 's/"/\\"/g')
  AR="${REF_RATIOS[$i]}"

  R=$(curl -s -X POST "$IMG_API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"prompt\":\"$P_ESC\",\"aspectRatio\":\"$AR\",\"engine\":{\"provider\":\"fxflow\",\"model\":\"google_image_gen_4_5\"}}")
  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  REF_JOBIDS+=("$JID")
  echo "  [$((i+1))/$REF_TOTAL] ${REF_NAMES[$i]} ($AR) → $JID"
  sleep 1
done

echo ""
echo "⏳ Polling reference images..."

REF_DONE=0
for i in "${!REF_NAMES[@]}"; do
  JID="${REF_JOBIDS[$i]}"
  NAME="${REF_NAMES[$i]}"
  [ -z "$JID" ] && echo "  ❌ $NAME: no job ID" && continue

  for attempt in $(seq 1 60); do
    sleep 5
    SR=$(curl -s "$IMG_API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "$NAME|$URL" >> "$REF_MAP_FILE"
      REF_DONE=$((REF_DONE+1))
      echo "  ✅ [$REF_DONE/$REF_TOTAL] $NAME → ${URL:0:80}..."
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
REF_READY=$(wc -l < "$REF_MAP_FILE" | tr -d ' ')
echo "  Reference images ready: $REF_READY/$REF_TOTAL"
echo ""

get_img() {
  local key="$1"
  grep "^${key}|" "$REF_MAP_FILE" | head -1 | cut -d'|' -f2
}

# ═══════════════════════════════════════════════════════════════
# PHASE 2: Define & submit video jobs
# ═══════════════════════════════════════════════════════════════
API="$VID_API"

declare -a NAMES
declare -a TYPES
declare -a PROMPTS
declare -a PRODUCTS
declare -a TAGS_LIST
declare -a REF_IMAGES   # pipe-separated URLs for ingredient, single URL for image-to-video, empty for text-to-video

# ═══════════════════════════════════════════════════════════════
# PRODUCT 1: KORA — Bone Tribe Warrior
# ═══════════════════════════════════════════════════════════════

# 1A. image-to-video: animate hero shot
NAMES+=("veo3-kora-intro")
TYPES+=("image-to-video")
PROMPTS+=("Slow cinematic push-in through misty tropical jungle at dawn, camera glides between massive tree trunks, the young anime warrior girl with wild green hair and bone armor turns her head toward camera and grins, then leaps down from a branch and lands in a combat stance gripping her massive bone club, leaves scatter on impact. Audio: jungle birds, rustling leaves, thud of landing, low tribal drum beat begins. No subtitles.")
PRODUCTS+=("KORA — Bone Tribe Warrior Trailer")
TAGS_LIST+=("showcase,veo3,game,character,action,trailer")
REF_IMAGES+=("bp-kora-hero")

# 1B. ingredient: use hero + turnaround for character consistency in combat
NAMES+=("veo3-kora-combat")
TYPES+=("ingredient")
PROMPTS+=("Dynamic tracking shot following a young jungle warrior girl with green hair and bone armor as she charges toward a giant panda creature in a forest clearing, she swings her massive bone club in a wide arc, the panda blocks and roars, she rolls under a counterswipe and strikes upward sending leaves and debris exploding, camera circles them during the clash, sunlight flashing through canopy. Audio: heavy club impacts, panda roar, battle cry, intense tribal percussion. No subtitles.")
PRODUCTS+=("KORA — Bone Tribe Warrior Trailer")
TAGS_LIST+=("showcase,veo3,game,character,action,trailer")
REF_IMAGES+=("bp-kora-hero|bp-kora-turnaround|bp-kora-3d")

# 1C. image-to-video: animate 3D render into idle scene
NAMES+=("veo3-kora-idle")
TYPES+=("image-to-video")
PROMPTS+=("Medium close-up of the young jungle warrior girl sitting on a mossy stone ruin at sunset, bone club resting beside her, she gently pets a small panda cub sleeping in her lap, fireflies appearing, warm golden light, she looks up with a peaceful smile, wind gently moving her green hair, quiet contemplative moment. Audio: evening breeze, distant waterfall, crickets, cub snoring, bamboo flute melody. No subtitles.")
PRODUCTS+=("KORA — Bone Tribe Warrior Trailer")
TAGS_LIST+=("showcase,veo3,game,character,cinematic,trailer")
REF_IMAGES+=("bp-kora-3d")

# ═══════════════════════════════════════════════════════════════
# PRODUCT 2: ZERO — Ghost Frame Operator
# ═══════════════════════════════════════════════════════════════

# 2A. image-to-video: animate hero mech shot into launch sequence
NAMES+=("veo3-zero-launch")
TYPES+=("image-to-video")
PROMPTS+=("Dramatic vertical tracking shot of a white and crimson bipedal mech launching from underground hangar, hydraulic clamps releasing with steam, the mech rises through armored blast doors opening in sequence, camera follows from below as it emerges into rain-soaked night cityscape, thrusters ignite with blue flame as it takes a thundering step onto cracked asphalt. Audio: hydraulic hiss, blast doors grinding, klaxon alarm, rain on metal, booming footfall, jet engine whine. No subtitles.")
PRODUCTS+=("ZERO — Ghost Frame Trailer")
TAGS_LIST+=("showcase,veo3,game,mech,action,trailer")
REF_IMAGES+=("bp-zero-hero")

# 2B. ingredient: use mech hero + turnaround + pilot for combat scene
NAMES+=("veo3-zero-combat")
TYPES+=("ingredient")
PROMPTS+=("Wide cinematic shot of a white and crimson mech sprinting through a destroyed city, dodging missile impacts that explode buildings, the mech slides behind a toppled skyscraper then leans out firing its plasma cannon in a sustained blue beam cutting through an enemy mech, sparks and molten metal flying, camera shakes with each explosion. Audio: thundering footsteps, missiles whistling and exploding, plasma cannon whine and discharge, emergency sirens. No subtitles.")
PRODUCTS+=("ZERO — Ghost Frame Trailer")
TAGS_LIST+=("showcase,veo3,game,mech,action,trailer")
REF_IMAGES+=("bp-zero-hero|bp-zero-turnaround|bp-zero-pilot")

# 2C. image-to-video: animate cockpit interior into POV scene
NAMES+=("veo3-zero-cockpit")
TYPES+=("image-to-video")
PROMPTS+=("Interior cockpit POV from the pilot's perspective inside a combat mech, holographic HUD with target lock warnings, pilot's gloved hands grip control sticks, through rain-streaked windshield an enemy mech charges toward camera, pilot slams a red button and missiles launch from shoulder pods, explosions flash outside. Audio: cockpit hum, rain on glass, warning alarms, tense breathing, missile launch whoosh, muffled explosions, calm AI voice saying target acquired. No subtitles.")
PRODUCTS+=("ZERO — Ghost Frame Trailer")
TAGS_LIST+=("showcase,veo3,game,mech,cockpit,trailer")
REF_IMAGES+=("bp-zero-cockpit")

# ═══════════════════════════════════════════════════════════════
# PRODUCT 3: MALACHAR — The Undying King
# ═══════════════════════════════════════════════════════════════

# 3A. image-to-video: animate boss hero shot
NAMES+=("veo3-malachar-awaken")
TYPES+=("image-to-video")
PROMPTS+=("Slow dolly-in approaching a massive bone throne in a dark cathedral, a skeletal king sits motionless wreathed in ghostly green flames, as camera gets closer the green flames in eye sockets suddenly flare bright, the skeletal hand tightens around the serrated greatsword, jaw opens releasing an echoing roar, the cathedral shakes and dust falls, candles extinguish in a wave. Audio: eerie silence, dripping water, grinding bone on metal, deep otherworldly roar, chains rattling, dark orchestral swell. No subtitles.")
PRODUCTS+=("MALACHAR — The Undying King Trailer")
TAGS_LIST+=("showcase,veo3,game,boss,dark-fantasy,trailer")
REF_IMAGES+=("bp-malachar-hero")

# 3B. ingredient: use boss hero + turnaround + 3D for fight scene
NAMES+=("veo3-malachar-fight")
TYPES+=("ingredient")
PROMPTS+=("Epic wide shot of a small armored warrior dodging massive sword swings from a colossal skeletal king boss in a ruined cathedral, the boss brings greatsword down splitting the stone floor, green spectral fire erupts from the crack, the warrior rolls and counterattacks at the ankle, boss staggers then sweeps his cape sending a ghostly energy wave across the arena, dramatic scale contrast. Audio: massive sword impacts, stone splitting, warrior grunt, spectral whoosh, epic orchestral battle music with choir. No subtitles.")
PRODUCTS+=("MALACHAR — The Undying King Trailer")
TAGS_LIST+=("showcase,veo3,game,boss,dark-fantasy,trailer")
REF_IMAGES+=("bp-malachar-hero|bp-malachar-turnaround|bp-malachar-3d")

# ═══════════════════════════════════════════════════════════════
# PRODUCT 4: VIPER — Shadow Protocol Agent
# ═══════════════════════════════════════════════════════════════

# 4A. image-to-video: animate hero poster into explosion walk
NAMES+=("veo3-viper-explosion")
TYPES+=("image-to-video")
PROMPTS+=("Cinematic slow-motion of a female agent in black tactical suit walking toward camera as a massive explosion erupts behind her on rain-soaked Tokyo street at night, debris and fire billowing in slow-mo, dark hair whipping forward from shockwave, neon signs reflecting in puddles, she does not look back, teal and orange color grading, anamorphic lens flare. Audio: muffled explosion in slow motion, glass shattering, rain pattering, steady boot steps, bass-heavy cinematic score. No subtitles.")
PRODUCTS+=("VIPER — Shadow Protocol Trailer")
TAGS_LIST+=("showcase,veo3,action,movie,explosion,trailer")
REF_IMAGES+=("bp-viper-hero")

# 4B. ingredient: use hero + turnaround for consistent fight scene
NAMES+=("veo3-viper-fight")
TYPES+=("ingredient")
PROMPTS+=("Intense hand-to-hand fight in a dimly lit elevator, a female agent exchanges rapid strikes with two attackers in suits, she deflects a punch and slams him into the wall denting the panels, spins and delivers a spinning back elbow to the second, camera locked inside the tight space capturing every impact, overhead fluorescent light swings creating flashing shadows. Audio: thuds of fists hitting body and wall, fabric tearing, metallic denting, heavy breathing, elevator ding as doors open. No subtitles.")
PRODUCTS+=("VIPER — Shadow Protocol Trailer")
TAGS_LIST+=("showcase,veo3,action,movie,fight,trailer")
REF_IMAGES+=("bp-viper-hero|bp-viper-turnaround|bp-viper-poster")

# 4C. text-to-video: standalone bike chase (no character close-up needed)
NAMES+=("veo3-viper-bike")
TYPES+=("text-to-video")
PROMPTS+=("Low tracking shot following a female agent on a sleek black motorcycle weaving through Tokyo traffic at high speed at night, leaning hard into turns with sparks from knee slider, two black SUVs give chase smashing through parked cars, she accelerates and launches off a raised intersection, bike goes airborne in slow motion with neon city lights streaking below, lands hard and continues racing. Audio: high-revving motorcycle engine, screeching tires, crashing metal, wind rushing, momentary silence airborne, hard landing impact. No subtitles.")
PRODUCTS+=("VIPER — Shadow Protocol Trailer")
TAGS_LIST+=("showcase,veo3,action,movie,chase,trailer")
REF_IMAGES+=("")

# ═══════════════════════════════════════════════════════════════
# PRODUCT 5: KODA Coffee — Barista Animation
# ═══════════════════════════════════════════════════════════════

# 5A. text-to-video: standalone animation (no BP reference for this product)
NAMES+=("veo3-koda-barista")
TYPES+=("text-to-video")
PROMPTS+=("Charming 3D animated short of a young female barista with a high bun hairstyle working in a cozy coffee shop, she gracefully steams milk creating a perfect swirl, pours latte art forming a rosetta pattern, camera follows her hands in close-up then pulls back to show her proud smile as she places the cup on the counter, warm morning sunlight through cafe windows, Pixar quality with soft lighting. Audio: espresso machine hissing, milk steaming, gentle pour, cafe chatter, acoustic guitar, a satisfied hum. No subtitles.")
PRODUCTS+=("KODA Coffee — Barista Animation")
TAGS_LIST+=("showcase,veo3,animation,character,food,cinematic")
REF_IMAGES+=("")

# 5B. text-to-video: morning routine
NAMES+=("veo3-koda-morning")
TYPES+=("text-to-video")
PROMPTS+=("3D animated morning routine montage of a cute barista character opening her coffee shop, she flips the door sign to Open, wipes down the espresso machine, arranges pastries in the display case, grinds fresh coffee beans and inhales the aroma with closed eyes and blissful smile, smooth continuous dolly through the cafe, warm golden morning light growing brighter. Audio: keys jingling, door chime bell, cloth wiping metal, coffee grinder, barista humming, birds chirping, gentle piano. No subtitles.")
PRODUCTS+=("KODA Coffee — Barista Animation")
TAGS_LIST+=("showcase,veo3,animation,character,food,cinematic")
REF_IMAGES+=("")

# ═══════════════════════════════════════════════════════════════
# PRODUCT 6: Street Taco Assembly — Food Cinematic
# ═══════════════════════════════════════════════════════════════

# 6A. text-to-video: overhead cooking montage
NAMES+=("veo3-taco-assembly")
TYPES+=("text-to-video")
PROMPTS+=("Fast-paced overhead close-up cooking montage of street taco assembly, hands warm corn tortillas on a hot griddle with visible sizzle, lay down juicy carne asada sliced with a sharp knife, add diced onion and fresh cilantro, spoon bright red salsa, finish by squeezing a lime wedge with juice dripping in slow motion, camera stays directly overhead, each step transitions with quick cut, dramatic food lighting. Audio: sizzling meat, knife chopping, salsa spooning, lime squeeze, street market ambiance, upbeat Latin guitar. No subtitles.")
PRODUCTS+=("Street Taco Assembly — Food Cinematic")
TAGS_LIST+=("showcase,veo3,food,cooking,cinematic")
REF_IMAGES+=("")

# 6B. text-to-video: hero shot dolly
NAMES+=("veo3-taco-hero")
TYPES+=("text-to-video")
PROMPTS+=("Slow cinematic dolly approaching a beautifully assembled trio of street tacos on a rustic wooden board, camera starts low at table level and slowly rises revealing the arrangement, steam rising from grilled meat, a hand squeezes a lime wedge releasing golden spray in backlight, garnishes of cilantro and radish in sharp detail, shallow depth of field. Audio: street food market bustle, distant mariachi music, nearby grill sizzle, lime squeeze, murmur of appreciation. No subtitles.")
PRODUCTS+=("Street Taco Assembly — Food Cinematic")
TAGS_LIST+=("showcase,veo3,food,cooking,cinematic")
REF_IMAGES+=("")

# ═══════════════════════════════════════════════════════════════
# PRODUCT 7: MIRA — Clay Creator Profile
# Style: stop-motion clay art social media profile building
# ═══════════════════════════════════════════════════════════════

# 7A. image-to-video: animate hero clay profile — elements pop into place
NAMES+=("veo3-mira-build")
TYPES+=("image-to-video")
PROMPTS+=("Stop-motion style animation of a clay social media profile being assembled piece by piece on a black surface, tiny clay hands place each element one by one: first the avatar frame pops down, then clay text appears letter by letter, clay icons slide into position, a pink clay castle grows from nothing on the right side, stars and butterflies flutter in from the edges, the verified badge stamps down with a satisfying press, each piece makes a soft clay squish sound, warm workshop lighting, overhead camera, charming handcrafted aesthetic. Audio: soft clay squishing sounds, gentle tapping, a playful xylophone melody, satisfying pop sounds as each element lands. No subtitles.")
PRODUCTS+=("MIRA — Clay Creator Profile")
TAGS_LIST+=("showcase,veo3,clay-art,social-media,stop-motion")
REF_IMAGES+=("bp-mira-hero")

# 7B. ingredient: use hero + details for consistent clay style crafting process
NAMES+=("veo3-mira-crafting")
TYPES+=("ingredient")
PROMPTS+=("Close-up stop-motion animation of hands sculpting tiny clay social media elements on a wooden worktable, fingers roll colorful polymer clay into small balls then press and shape them into a heart icon, a star, a speech bubble, and a castle turret, each piece is carefully painted with a tiny brush, then placed onto a clay profile board, camera moves between macro close-ups of the sculpting and wider shots of the growing artwork, warm desk lamp lighting. Audio: clay squishing, brush strokes, gentle humming, soft piano background music, satisfying clicking as pieces snap into place. No subtitles.")
PRODUCTS+=("MIRA — Clay Creator Profile")
TAGS_LIST+=("showcase,veo3,clay-art,crafting,stop-motion")
REF_IMAGES+=("bp-mira-hero|bp-mira-details|bp-mira-3d")

# 7C. text-to-video: standalone reveal — completed clay art rotating on turntable
NAMES+=("veo3-mira-reveal")
TYPES+=("text-to-video")
PROMPTS+=("A completed clay art social media profile displayed on a slowly rotating wooden turntable, the entire Twitter profile page recreated in colorful polymer clay with a tiny avatar girl, clay text, clay icons, decorated with a pink castle, stars, butterflies and dreamcatcher, camera slowly orbits around the piece showing all the 3D depth and handcrafted details from every angle, soft studio lighting with warm key light and cool fill, shallow depth of field blurring the background, museum display presentation. Audio: soft ambient music, gentle turntable motor hum, occasional sparkle sound effects highlighting details. No subtitles.")
PRODUCTS+=("MIRA — Clay Creator Profile")
TAGS_LIST+=("showcase,veo3,clay-art,social-media,reveal")
REF_IMAGES+=("")

# ═══════════════════════════════════════════════════════════════
# PRODUCT 8: HAYABUSA GT — Racing Trailer
# ═══════════════════════════════════════════════════════════════

# 7A. image-to-video: animate hero car shot into drift scene
NAMES+=("veo3-hayabusa-drift")
TYPES+=("image-to-video")
PROMPTS+=("Low tracking shot of a futuristic Japanese street racing car drifting sideways through a neon-lit Tokyo intersection at night, tires smoking white clouds illuminated by neon, embedded LED strips glowing electric blue, camera at ground level capturing front wheel angle and smoke, wet road reflects all neon creating mirror surface, other cars braking in background. Audio: screaming engine, screeching tires, rubber smoke hissing, turbo blow-off, crowd cheering, synthwave pulse. No subtitles.")
PRODUCTS+=("HAYABUSA GT — Racing Trailer")
TAGS_LIST+=("showcase,veo3,game,vehicle,racing,trailer")
REF_IMAGES+=("bp-hayabusa-hero")

# 7B. ingredient: use hero + turnaround for pack racing
NAMES+=("veo3-hayabusa-race")
TYPES+=("ingredient")
PROMPTS+=("Cinematic aerial tracking following a pack of 4 futuristic racing cars blasting through an elevated highway between neon skyscrapers at night, the lead car in electric blue pulls ahead then brakes hard for a hairpin, the second car attempts inside overtake, body panels nearly touching, sparks as they clip, cherry blossom petals across the track. Audio: multiple engines in chorus, wind rushing, tire squeals, carbon panels cracking, crowd roar, electronic race music. No subtitles.")
PRODUCTS+=("HAYABUSA GT — Racing Trailer")
TAGS_LIST+=("showcase,veo3,game,vehicle,racing,trailer")
REF_IMAGES+=("bp-hayabusa-hero|bp-hayabusa-turnaround")

# ═══════════════════════════════════════════════════════════════
# PRODUCT 9: RYUJI — Street Legend Magazine
# Anime streetwear magazine cover character — fashion editorial video
# ═══════════════════════════════════════════════════════════════

# 9A. image-to-video: animate magazine cover — character comes alive
NAMES+=("veo3-ryuji-cover")
TYPES+=("image-to-video")
PROMPTS+=("An anime magazine cover comes to life, the printed blonde character in black and yellow streetwear slowly starts breathing, then lifts his head and looks directly at camera with a confident smirk, he adjusts his hoodie collar and runs his hand through his spiky hair, the magazine typography and Japanese text elements flutter and animate around him like floating graphic design elements, the white background subtly shifts to reveal a Tokyo street scene behind him, cinematic transition from 2D print to living character. Audio: paper rustling, a stylish whoosh as elements animate, city ambiance fading in, a cool hip-hop beat drops. No subtitles.")
PRODUCTS+=("RYUJI — Street Legend Magazine")
TAGS_LIST+=("showcase,veo3,anime,streetwear,magazine")
REF_IMAGES+=("bp-ryuji-hero")

# 9B. ingredient: use hero + turnaround + poster for street walk scene
NAMES+=("veo3-ryuji-walk")
TYPES+=("ingredient")
PROMPTS+=("Cinematic tracking shot of a cool blonde anime character in black and yellow streetwear walking confidently down a neon-lit Tokyo alley at night, hands in hoodie pockets, camera follows from a low angle as he passes glowing shop signs and vending machines, his reflection visible in rain puddles on the ground, he pauses to light a cigarette and the flame briefly illuminates his face, smoke trailing into the neon-lit air, manga-style speed lines briefly flash during a dramatic head turn, stylish urban atmosphere. Audio: confident footsteps on wet ground, distant city traffic, lighter click and flame, lo-fi hip-hop beat, muffled Japanese conversation from a nearby izakaya. No subtitles.")
PRODUCTS+=("RYUJI — Street Legend Magazine")
TAGS_LIST+=("showcase,veo3,anime,streetwear,cinematic")
REF_IMAGES+=("bp-ryuji-hero|bp-ryuji-turnaround|bp-ryuji-poster")

# 9C. text-to-video: standalone action sequence — street fight
NAMES+=("veo3-ryuji-action")
TYPES+=("text-to-video")
PROMPTS+=("Dynamic anime fight scene in a Tokyo back alley at night, a blonde character in black and yellow streetwear dodges a punch with a smooth lean back, then delivers a spinning kick that sends his opponent flying into stacked crates, camera whips around to follow the action with manga-style impact frames flashing on each hit, yellow energy effects on his kicks, the scene freezes momentarily on the final kick with bold Japanese onomatopoeia text appearing on screen, then resumes as the opponent crashes, stylish anime action choreography. Audio: rapid whooshing kicks, heavy impacts, crates breaking, dramatic orchestral hit on freeze frame, Japanese shout, intense drum and bass soundtrack. No subtitles.")
PRODUCTS+=("RYUJI — Street Legend Magazine")
TAGS_LIST+=("showcase,veo3,anime,action,streetwear")
REF_IMAGES+=("")

# ═══════════════════════════════════════════════════════════════
# SUBMIT VIDEO JOBS
# ═══════════════════════════════════════════════════════════════

JOBIDS=()
TOTAL=${#NAMES[@]}

echo "============================================="
echo "  PHASE 2: Submitting $TOTAL video jobs"
echo "  Types: text-to-video / image-to-video / ingredient"
echo "============================================="
echo ""

for i in "${!NAMES[@]}"; do
  NAME="${NAMES[$i]}"
  TYPE="${TYPES[$i]}"
  P="${PROMPTS[$i]}"
  P_ESC=$(echo "$P" | sed 's/"/\\"/g')
  REFS="${REF_IMAGES[$i]}"

  # ── Resolve reference image URLs ──
  IMG_URLS=()
  if [ -n "$REFS" ] && [ "$TYPE" != "text-to-video" ]; then
    IFS='|' read -ra REF_NAMES <<< "$REFS"
    for rn in "${REF_NAMES[@]}"; do
      url=$(get_img "$rn")
      if [ -n "$url" ]; then
        IMG_URLS+=("$url")
      else
        echo "  WARNING: No URL found for $rn — skipping reference"
      fi
    done

    if [ ${#IMG_URLS[@]} -eq 0 ]; then
      echo "  FALLBACK: $NAME → text-to-video (no reference images available)"
      TYPE="text-to-video"
    fi
  fi

  # ── Build payload based on type ──
  ENGINE='"engine":{"provider":"fxflow","model":"veo_3_generate"}'
  BASE="\"type\":\"$TYPE\",\"prompt\":\"$P_ESC\",\"duration\":5,\"aspectRatio\":\"16:9\",\"resolution\":\"720p\",\"mode\":\"relaxed\",$ENGINE"

  case "$TYPE" in
    text-to-video)
      PAYLOAD="{$BASE}"
      ;;
    image-to-video)
      START_IMG="${IMG_URLS[0]}"
      PAYLOAD="{$BASE,\"startImage\":\"$START_IMG\"}"
      ;;
    ingredient)
      # Top-level images array, max 3
      IMGS_JSON=""
      for idx in "${!IMG_URLS[@]}"; do
        [ "$idx" -ge 3 ] && break
        [ -n "$IMGS_JSON" ] && IMGS_JSON="$IMGS_JSON,"
        IMGS_JSON="$IMGS_JSON\"${IMG_URLS[$idx]}\""
      done
      PAYLOAD="{$BASE,\"images\":[$IMGS_JSON]}"
      ;;
  esac

  R=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "$PAYLOAD")
  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  JOBIDS+=("$JID")

  # ── Show type badge ──
  case "$TYPE" in
    text-to-video)   BADGE="TXT" ;;
    image-to-video)  BADGE="IMG" ;;
    ingredient)      BADGE="ING" ;;
  esac

  echo "  [$((i+1))/$TOTAL] [$BADGE] $NAME → $JID"
  sleep 2
done

echo ""
echo "============================================="
echo "  PHASE 3: Polling video results"
echo "============================================="

RESULTS_FILE="/tmp/showcase_veo3_v4_results.txt"
> "$RESULTS_FILE"

for i in "${!NAMES[@]}"; do
  JID="${JOBIDS[$i]}"
  NAME="${NAMES[$i]}"
  TYPE="${TYPES[$i]}"
  PRODUCT="${PRODUCTS[$i]}"
  PROMPT="${PROMPTS[$i]}"
  TAGS="${TAGS_LIST[$i]}"
  [ -z "$JID" ] && echo "  $NAME: no job ID" && continue

  for attempt in $(seq 1 120); do
    sleep 10
    SR=$(curl -s "$API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']['result']; print(d.get('videoUrl',''))" 2>/dev/null)
      THUMB=$(echo "$SR" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']['result']; print(d.get('thumbnailUrl',''))" 2>/dev/null)
      echo "  $NAME [$TYPE] → $URL"
      echo "$NAME|$URL|$THUMB|$PRODUCT|$TYPE" >> "$RESULTS_FILE"

      # ── Save to Explorer ──
      PROMPT_ESC=$(echo "$PROMPT" | sed 's/"/\\"/g')
      IFS=',' read -ra TAG_ARR <<< "$TAGS"
      TAG_JSON=$(printf '"%s",' "${TAG_ARR[@]}")
      TAG_JSON="[${TAG_JSON%,}]"

      EXPLORER_BODY="{\"title\":\"$PRODUCT — $(echo $NAME | sed 's/veo3-//g')\",\"type\":\"video\",\"prompt\":\"$PROMPT_ESC\",\"thumbnailUrl\":\"$THUMB\",\"mediaUrl\":\"$URL\",\"model\":\"veo_3_generate\",\"tags\":$TAG_JSON,\"categories\":[\"showcase\",\"veo3\"],\"status\":\"published\"}"

      EXPLORER_R=$(curl -s -X POST "$EXPLORER_API" \
        -H "Content-Type: application/json" \
        -H "Authorization: $EXPLORER_TOKEN" \
        -d "$EXPLORER_BODY")
      EXPLORER_ID=$(echo "$EXPLORER_R" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('_id','n/a'))" 2>/dev/null)
      echo "    Saved to Explorer: $EXPLORER_ID"

      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      ERR=$(echo "$SR" | python3 -c "import sys,json; e=json.load(sys.stdin)['data'].get('error',{}); print(e.get('userMessage','unknown'))" 2>/dev/null)
      echo "  $NAME FAILED: $ERR"
      break
    else
      printf "  %s: %s (%d/120)\r" "$NAME" "$ST" "$attempt"
    fi
  done
done

echo ""
echo "================================================"
echo "  All results:"
echo "================================================"
cat "$RESULTS_FILE"
echo ""
echo "Download with:"
echo 'while IFS="|" read -r name url thumb product type; do'
echo '  curl -L -o "public/assets/showcase/${name}.mp4" "$url"'
echo '  [ -n "$thumb" ] && curl -L -o "public/assets/showcase/${name}-thumb.webp" "$thumb"'
echo 'done < /tmp/showcase_veo3_v4_results.txt'
