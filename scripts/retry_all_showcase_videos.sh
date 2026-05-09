#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# RETRY ALL SHOWCASE VIDEOS — Veo3 (23) + Fashion (11) = 34 total
# Phase 1: Regenerate ALL reference images (33 total)
# Phase 2: Submit ALL 34 video jobs with proper references
# Phase 3: Poll results & download to public/assets/showcase/
# Phase 4: Print update instructions for showcase-cdn.ts
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

IMG_API="https://api.skyverses.com/api-client/external/image-task"
VID_API="https://api.skyverses.com/api-client/external/video-task"
TOKEN="Bearer skv_cbb360d3c039ffb0ebb494e8536a9730a9faa4acde25d44be11a8087b65a230b"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ASSETS_DIR="$PROJECT_DIR/public/assets/showcase"
REF_MAP="/tmp/showcase_retry_ref_map.txt"
RESULTS_FILE="/tmp/showcase_retry_results.txt"

mkdir -p "$ASSETS_DIR"
# Keep existing ref map if it has entries (from a previous Phase 1 run)
if [ ! -s "$REF_MAP" ]; then
  > "$REF_MAP"
fi
> "$RESULTS_FILE"

echo "=========================================================="
echo "  SHOWCASE VIDEO RETRY — $(date)"
echo "  Output: $ASSETS_DIR"
echo "=========================================================="
echo ""

# ═══════════════════════════════════════════════════════════════
# PHASE 1: Generate ALL reference images (33 total)
# ═══════════════════════════════════════════════════════════════

declare -a REF_NAMES=()
declare -a REF_PROMPTS=()
declare -a REF_RATIOS=()

# ── VEO3: KORA refs (3) ──
REF_NAMES+=("bp-kora-hero")
REF_PROMPTS+=("Cinematic action shot of a young anime-style jungle warrior girl with wild green hair and a leaf headdress, wearing tribal bone armor with skull pauldrons and striped leg wraps, mid-swing with a massive bone club striking a giant panda in a lush tropical jungle, dynamic motion with leaves and debris flying, volumetric sunlight filtering through the canopy, Unreal Engine 5 quality, game cinematic screenshot")
REF_RATIOS+=("16:9")

REF_NAMES+=("bp-kora-turnaround")
REF_PROMPTS+=("Professional game character turnaround reference sheet showing a young anime warrior girl with green hair and leaf headdress, tribal bone armor with skull accessories and striped wrappings, displayed in 8 poses on a clean neutral gray background: front view, back view, left side, right side, three-quarter front, three-quarter back, action combat pose, and crouching pose, consistent lighting, concept art character sheet layout")
REF_RATIOS+=("16:9")

REF_NAMES+=("bp-kora-3d")
REF_PROMPTS+=("Clean full-body 3D character render of a young anime-style jungle warrior girl with wild green hair and leaf headdress, wearing tribal bone armor with skull pauldrons, striped leg wraps, and carrying a massive bone club resting on her shoulder, standing in a confident idle pose, soft studio lighting with rim light, neutral gradient background, game character model presentation, figurine collectible quality")
REF_RATIOS+=("1:1")

# ── VEO3: ZERO refs (4) ──
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

# ── VEO3: MALACHAR refs (3) ──
REF_NAMES+=("bp-malachar-hero")
REF_PROMPTS+=("Epic boss encounter cinematic screenshot from a dark fantasy action RPG, a colossal skeletal king wreathed in ghostly green flames sitting on a throne of fused swords and bones in a massive crumbling cathedral, the player character tiny in the foreground approaching with sword drawn, shafts of moonlight through broken stained glass windows, atmospheric fog, Dark Souls and Elden Ring inspired, ultra-wide cinematic composition")
REF_RATIOS+=("16:9")

REF_NAMES+=("bp-malachar-turnaround")
REF_PROMPTS+=("Dark fantasy boss character turnaround reference sheet showing a colossal skeletal king in corroded black armor with a tattered cape, a crown of twisted iron fused to the skull, ghostly green flames burning from the eye sockets and chest cavity, wielding a massive serrated greatsword, displayed in 6 views on dark background: front, back, left side, right side, attacking pose, defeated crumbling pose, size comparison with normal human figure, concept art production sheet")
REF_RATIOS+=("16:9")

REF_NAMES+=("bp-malachar-3d")
REF_PROMPTS+=("Premium collectible figure render of a skeletal king boss from a dark fantasy RPG, standing on a detailed base made of fused swords and skulls, corroded black armor with ghostly green flames emanating from the chest and eye sockets, tattered cape frozen mid-billow, massive serrated greatsword planted point-down beside him, dramatic studio lighting with green rim light, dark gradient background, high-end statue collectible presentation")
REF_RATIOS+=("1:1")

# ── VEO3: VIPER refs (3) ──
REF_NAMES+=("bp-viper-hero")
REF_PROMPTS+=("Cinematic action movie frame of a female special forces agent in a black tactical suit walking in slow-motion away from a massive fireball explosion on a rain-soaked Tokyo street at night, debris flying past her, she holds a suppressed pistol at her side, long dark hair whipping in the shockwave, neon signs reflecting in wet asphalt, teal and orange color grading, anamorphic lens flare, photorealistic Hollywood quality")
REF_RATIOS+=("16:9")

REF_NAMES+=("bp-viper-turnaround")
REF_PROMPTS+=("Action movie character costume and gear reference sheet showing a female special forces agent in multiple views: front view in full black tactical suit with body armor and thigh holster, back view showing utility belt and blade sheath, civilian cover outfit in leather jacket and jeans, formal infiltration outfit in a black evening gown with concealed weapons, each outfit on clean dark background, movie character design production sheet, photorealistic quality")
REF_RATIOS+=("16:9")

REF_NAMES+=("bp-viper-poster")
REF_PROMPTS+=("Hollywood action movie poster featuring a female special forces agent standing center frame in a dramatic pose holding two pistols crossed at her chest, rain-soaked cityscape behind her with explosions and helicopters, reflections of adversaries visible in the wet ground, bold teal and orange color grade, dramatic upward lighting, cinematic composition with depth and layered elements, blockbuster movie poster quality, 4K")
REF_RATIOS+=("9:16")

# ── VEO3: MIRA refs (3) ──
REF_NAMES+=("bp-mira-hero")
REF_PROMPTS+=("A complete Twitter social media profile page recreated entirely as a 3D clay sculpture artwork, the entire interface made of colorful plasticine and polymer clay on a black clay background, a circular clay avatar frame with a miniature girl figurine inside, clay text showing username and bio, clay icons, decorative clay elements including a pink castle, yellow stars, butterflies, a dreamcatcher, warm studio lighting, stop-motion animation aesthetic, overhead camera angle")
REF_RATIOS+=("9:16")

REF_NAMES+=("bp-mira-details")
REF_PROMPTS+=("Extreme close-up detail shots of handcrafted clay social media profile decorations arranged in a 2x2 grid: top-left a pink and white clay fairy tale castle with tiny windows and turrets, top-right a circular clay avatar frame with a miniature girl figurine wearing glasses, bottom-left a clay dreamcatcher with woven threads and dangling feathers, bottom-right a clay ferris wheel with colorful gondolas, macro photography, warm artisan workshop lighting, polymer clay sculpture quality")
REF_RATIOS+=("1:1")

REF_NAMES+=("bp-mira-3d")
REF_PROMPTS+=("A premium collectible clay art diorama of a miniature social media profile rendered entirely in polymer clay, displayed on a wooden pedestal base, the clay profile features a tiny avatar girl with glasses, clay text bio, clay interaction buttons, surrounded by decorative clay elements including a castle, stars, butterflies, clean studio photography with gradient background, soft rim lighting, collectible art toy presentation")
REF_RATIOS+=("1:1")

# ── VEO3: HAYABUSA refs (2) ──
REF_NAMES+=("bp-hayabusa-hero")
REF_PROMPTS+=("Cinematic action shot of a futuristic Japanese street racing car drifting through a neon-lit Tokyo intersection at night, aggressive angular body kit glowing with embedded LED strips in electric blue, massive rear wing, smoke pouring from the rear tires, sparks flying from the low front splitter, wet road reflecting all the lights, Need for Speed and Cyberpunk aesthetic, photorealistic automotive photography, 4K")
REF_RATIOS+=("16:9")

REF_NAMES+=("bp-hayabusa-turnaround")
REF_PROMPTS+=("Automotive design turnaround sheet of a futuristic Japanese street racing car, aggressive angular body with aerodynamic curves, shown in 5 views on clean dark studio background: front three-quarter hero angle, direct side profile, rear three-quarter showing massive wing and quad exhaust, top-down overhead view, and front view showing aggressive headlight design, electric blue with carbon fiber accents, automotive design portfolio presentation")
REF_RATIOS+=("16:9")

# ── VEO3: RYUJI refs (3) ──
REF_NAMES+=("bp-ryuji-hero")
REF_PROMPTS+=("Anime streetwear magazine cover featuring a cool male anime character with spiky blonde hair covering one eye, wearing an oversized black and yellow streetwear hoodie with bold number 03 print, baggy cargo pants, chunky designer sneakers, sitting in a dynamic relaxed pose, bold magazine title typography at the top in white, Japanese katakana text, clean white background with yellow and black graphic design elements, manga illustration style with fashion editorial layout")
REF_RATIOS+=("9:16")

REF_NAMES+=("bp-ryuji-turnaround")
REF_PROMPTS+=("Anime character outfit turnaround reference sheet showing a cool male anime character with spiky blonde hair in 4 different streetwear outfits on clean white background: outfit 1 oversized black hoodie with yellow accents and cargo pants, outfit 2 long black trench coat with gold chain, outfit 3 fitted black turtleneck with yellow bomber jacket, outfit 4 open black shirt with gold pendant, each outfit shown front view with Japanese text labels, fashion lookbook layout, manga illustration style")
REF_RATIOS+=("16:9")

REF_NAMES+=("bp-ryuji-poster")
REF_PROMPTS+=("Cinematic anime poster of a blonde male character in black and yellow streetwear standing alone under a Tokyo street light at night, cigarette smoke trailing upward, hands in hoodie pockets, neon signs reflecting on wet pavement behind him, dramatic low-angle composition, bold movie-style title STREET LEGEND in metallic gold typography at the bottom with Japanese subtitle, dark moody atmosphere with yellow accent lighting, manga meets movie poster aesthetic")
REF_RATIOS+=("9:16")

# ── FASHION: COUTURE refs (3) ──
REF_NAMES+=("fashion-couture-hero")
REF_PROMPTS+=("Haute couture editorial photograph, a striking model in an avant-garde sculptural black gown with dramatic pleated organza cape trailing behind, walking through an opulent gilded baroque palace hallway with chandeliers and mirrors, harsh directional lighting creating dramatic shadows, shot on Hasselblad H6D, Vogue Italia cover quality, fashion photography by Tim Walker, no text")
REF_RATIOS+=("9:16")

REF_NAMES+=("fashion-couture-detail")
REF_PROMPTS+=("Extreme macro close-up of haute couture garment details, intricate hand-sewn crystal beadwork on midnight blue silk fabric, each bead catching light differently creating a constellation effect, visible thread craftsmanship and fabric texture, shallow depth of field, studio lighting with warm gold rim light, luxury fashion detail photography, no text")
REF_RATIOS+=("1:1")

REF_NAMES+=("fashion-couture-backstage")
REF_PROMPTS+=("Behind-the-scenes haute couture atelier workshop, an elderly seamstress with silver spectacles hand-stitching an elaborate wedding gown on a mannequin, surrounded by fabric swatches and sketches pinned to cork boards, golden afternoon light through tall arched windows, vintage sewing machines and thread spools in background, documentary fashion photography, intimate atmosphere, no text")
REF_RATIOS+=("16:9")

# ── FASHION: RUNWAY refs (2) ──
REF_NAMES+=("fashion-runway-hero")
REF_PROMPTS+=("High fashion runway photograph, a model in a futuristic metallic silver trench coat with holographic iridescent panels walking down a minimalist white catwalk, dramatic front-row audience silhouettes, professional runway lighting with strong spotlights from above, motion captured mid-stride, editorial fashion photography, Paris Fashion Week atmosphere, no text")
REF_RATIOS+=("9:16")

REF_NAMES+=("fashion-runway-lineup")
REF_PROMPTS+=("Fashion show finale lineup, five models standing shoulder to shoulder at the end of a sleek black runway, each wearing a different look from the same collection in monochromatic earth tones ranging from sand to deep chocolate, cohesive design language with varying silhouettes from fitted to oversized, professional runway lighting, wide shot capturing the full lineup, fashion week editorial quality, no text")
REF_RATIOS+=("16:9")

# ── FASHION: STREETWEAR refs (3) ──
REF_NAMES+=("fashion-street-hero")
REF_PROMPTS+=("Urban streetwear lookbook photograph, a young model in oversized vintage-washed denim jacket with bold embroidered patches, layered over a graphic hoodie, wide-leg cargo pants and chunky platform sneakers, leaning against a graffiti-covered concrete wall in a Tokyo back alley, golden hour light, shot on 35mm film grain, Hypebeast editorial quality, authentic street fashion, no text")
REF_RATIOS+=("9:16")

REF_NAMES+=("fashion-street-detail")
REF_PROMPTS+=("Flat lay arrangement of streetwear outfit components on a clean concrete surface, pristine white limited edition sneakers with gold accents at center, surrounded by accessories: chunky gold chain, vintage round sunglasses, beanie hat, leather cardholder, and a pair of patterned socks, everything arranged with precise spacing, overhead shot, soft diffused natural light, product photography meets editorial, no text")
REF_RATIOS+=("1:1")

REF_NAMES+=("fashion-street-group")
REF_PROMPTS+=("Group streetwear editorial photo, three young models in coordinated but individual urban outfits standing on a Tokyo pedestrian crossing at dusk, each with unique layering style combining oversized silhouettes with fitted elements, neon signs reflecting on wet pavement, cinematic street photography with shallow depth of field, authentic Gen-Z fashion energy, no text")
REF_RATIOS+=("16:9")

# ── FASHION: ACCESSORIES refs (2) ──
REF_NAMES+=("fashion-accessories-hero")
REF_PROMPTS+=("Luxury accessories still life, an exquisite leather handbag in deep burgundy crocodile embossed leather with gold hardware clasp, positioned on a marble surface beside a pair of matching stiletto heels and a silk scarf draped artfully, dramatic chiaroscuro lighting reminiscent of Dutch Golden Age paintings, premium product photography, no text")
REF_RATIOS+=("1:1")

REF_NAMES+=("fashion-accessories-jewelry")
REF_PROMPTS+=("High-end jewelry campaign photograph, a model's hand and neck adorned with layered gold statement necklaces and sculptural rings, the jewelry catching light with brilliant reflections, extreme close-up showing skin texture and metal craftsmanship, dark moody background with a single warm spotlight, luxury advertising quality similar to Cartier or Bulgari campaigns, no text")
REF_RATIOS+=("9:16")

# ── FASHION: EDITORIAL refs (2) ──
REF_NAMES+=("fashion-editorial-hero")
REF_PROMPTS+=("Cinematic fashion editorial photograph, a model in a flowing crimson silk dress standing on the edge of a dramatic cliff overlooking a stormy ocean at sunset, the dress and her hair billowing in the wind creating dynamic shapes, golden hour backlighting creating a glowing silhouette, epic landscape meets high fashion, shot on medium format, National Geographic meets Vogue quality, no text")
REF_RATIOS+=("16:9")

REF_NAMES+=("fashion-editorial-noir")
REF_PROMPTS+=("Film noir inspired fashion portrait, a model in a tailored black blazer and wide-brim fedora hat, seated in a dimly lit vintage jazz bar, cigarette smoke curling through a single beam of amber light, dramatic shadows across the face, reflections in a glass of whiskey on the table, black and white with subtle warm toning, classic fashion noir aesthetic, no text")
REF_RATIOS+=("9:16")

# ── Submit & poll reference images ──
REF_TOTAL=${#REF_NAMES[@]}

# Skip Phase 1 if ref map already has enough entries
EXISTING_REFS=$(wc -l < "$REF_MAP" 2>/dev/null | tr -d ' ')
if [ "${EXISTING_REFS:-0}" -ge "$REF_TOTAL" ]; then
  echo "============================================="
  echo "  PHASE 1: SKIPPED ($EXISTING_REFS refs already in $REF_MAP)"
  echo "============================================="
else
  declare -a REF_JOBIDS=()

  echo "============================================="
  echo "  PHASE 1: Generating $REF_TOTAL reference images"
  echo "============================================="
  echo ""

  for i in "${!REF_NAMES[@]}"; do
    P="${REF_PROMPTS[$i]}"
    AR="${REF_RATIOS[$i]}"

    IMGPAYLOAD=$(python3 -c "
import json, sys
print(json.dumps({
    'type': 'text_to_image',
    'prompt': sys.argv[1],
    'aspectRatio': sys.argv[2],
    'engine': {'provider': 'fxflow', 'model': 'google_image_gen_4_5'}
}))
" "$P" "$AR")

    R=$(curl -s -X POST "$IMG_API" \
      -H "Content-Type: application/json" \
      -H "Authorization: $TOKEN" \
      -d "$IMGPAYLOAD")
    JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
    REF_JOBIDS+=("$JID")
    echo "  [$((i+1))/$REF_TOTAL] ${REF_NAMES[$i]} ($AR) -> $JID"
    sleep 1
  done

  echo ""
  echo "Polling reference images..."

  REF_DONE=0
  for i in "${!REF_NAMES[@]}"; do
    JID="${REF_JOBIDS[$i]}"
    NAME="${REF_NAMES[$i]}"
    [ -z "$JID" ] && echo "  SKIP $NAME: no job ID" && continue

    for attempt in $(seq 1 60); do
      sleep 5
      SR=$(curl -s "$IMG_API/$JID" -H "Authorization: $TOKEN")
      ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

      if [ "$ST" = "done" ]; then
        URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
        echo "$NAME|$URL" >> "$REF_MAP"
        REF_DONE=$((REF_DONE+1))
        echo "  OK [$REF_DONE/$REF_TOTAL] $NAME"
        break
      elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
        echo "  FAIL $NAME"
        break
      else
        printf "  ... %s: %s (%d/60)\r" "$NAME" "$ST" "$attempt"
      fi
    done
  done

  echo ""
  REF_READY=$(wc -l < "$REF_MAP" | tr -d ' ')
  echo "  Reference images ready: $REF_READY/$REF_TOTAL"

  if [ "$REF_READY" -lt 10 ]; then
    echo "  ERROR: Too few reference images. Aborting."
    exit 1
  fi
fi

get_img() {
  grep "^${1}|" "$REF_MAP" | head -1 | cut -d'|' -f2
}

# ═══════════════════════════════════════════════════════════════
# PHASE 2: Submit ALL 34 video jobs
# ═══════════════════════════════════════════════════════════════

declare -a VID_NAMES=()
declare -a VID_TYPES=()
declare -a VID_PROMPTS=()
declare -a VID_REFS=()

# ────────────────────────────────────────
# VEO3 VIDEOS (23)
# ────────────────────────────────────────

# KORA (3)
VID_NAMES+=("veo3-kora-intro")
VID_TYPES+=("image-to-video")
VID_PROMPTS+=("Slow cinematic push-in through misty tropical jungle at dawn, camera glides between massive tree trunks, the young anime warrior girl with wild green hair and bone armor turns her head toward camera and grins, then leaps down from a branch and lands in a combat stance gripping her massive bone club, leaves scatter on impact. Audio: jungle birds, rustling leaves, thud of landing, low tribal drum beat begins. No subtitles.")
VID_REFS+=("bp-kora-hero")

VID_NAMES+=("veo3-kora-idle")
VID_TYPES+=("image-to-video")
VID_PROMPTS+=("Medium close-up of the young jungle warrior girl sitting on a mossy stone ruin at sunset, bone club resting beside her, she gently pets a small panda cub sleeping in her lap, fireflies appearing, warm golden light, she looks up with a peaceful smile, wind gently moving her green hair, quiet contemplative moment. Audio: evening breeze, distant waterfall, crickets, cub snoring, bamboo flute melody. No subtitles.")
VID_REFS+=("bp-kora-3d")

VID_NAMES+=("veo3-kora-combat")
VID_TYPES+=("ingredient")
VID_PROMPTS+=("Dynamic tracking shot following a young jungle warrior girl with green hair and bone armor as she charges toward a giant panda creature in a forest clearing, she swings her massive bone club in a wide arc, the panda blocks and roars, she rolls under a counterswipe and strikes upward sending leaves and debris exploding, camera circles them during the clash, sunlight flashing through canopy. Audio: heavy club impacts, panda roar, battle cry, intense tribal percussion. No subtitles.")
VID_REFS+=("bp-kora-hero|bp-kora-turnaround|bp-kora-3d")

# ZERO (3)
VID_NAMES+=("veo3-zero-launch")
VID_TYPES+=("image-to-video")
VID_PROMPTS+=("Dramatic vertical tracking shot of a white and crimson bipedal mech launching from underground hangar, hydraulic clamps releasing with steam, the mech rises through armored blast doors opening in sequence, camera follows from below as it emerges into rain-soaked night cityscape, thrusters ignite with blue flame as it takes a thundering step onto cracked asphalt. Audio: hydraulic hiss, blast doors grinding, klaxon alarm, rain on metal, booming footfall, jet engine whine. No subtitles.")
VID_REFS+=("bp-zero-hero")

VID_NAMES+=("veo3-zero-combat")
VID_TYPES+=("ingredient")
VID_PROMPTS+=("Wide cinematic shot of a white and crimson mech sprinting through a destroyed city, dodging missile impacts that explode buildings, the mech slides behind a toppled skyscraper then leans out firing its plasma cannon in a sustained blue beam cutting through an enemy mech, sparks and molten metal flying, camera shakes with each explosion. Audio: thundering footsteps, missiles whistling and exploding, plasma cannon whine and discharge, emergency sirens. No subtitles.")
VID_REFS+=("bp-zero-hero|bp-zero-turnaround|bp-zero-pilot")

VID_NAMES+=("veo3-zero-cockpit")
VID_TYPES+=("image-to-video")
VID_PROMPTS+=("Interior cockpit POV from the pilot's perspective inside a combat mech, holographic HUD with target lock warnings, pilot's gloved hands grip control sticks, through rain-streaked windshield an enemy mech charges toward camera, pilot slams a red button and missiles launch from shoulder pods, explosions flash outside. Audio: cockpit hum, rain on glass, warning alarms, tense breathing, missile launch whoosh, muffled explosions, calm AI voice saying target acquired. No subtitles.")
VID_REFS+=("bp-zero-cockpit")

# MALACHAR (2)
VID_NAMES+=("veo3-malachar-awaken")
VID_TYPES+=("image-to-video")
VID_PROMPTS+=("Slow dolly-in approaching a massive bone throne in a dark cathedral, a skeletal king sits motionless wreathed in ghostly green flames, as camera gets closer the green flames in eye sockets suddenly flare bright, the skeletal hand tightens around the serrated greatsword, jaw opens releasing an echoing roar, the cathedral shakes and dust falls, candles extinguish in a wave. Audio: eerie silence, dripping water, grinding bone on metal, deep otherworldly roar, chains rattling, dark orchestral swell. No subtitles.")
VID_REFS+=("bp-malachar-hero")

VID_NAMES+=("veo3-malachar-fight")
VID_TYPES+=("ingredient")
VID_PROMPTS+=("Epic wide shot of a small armored warrior dodging massive sword swings from a colossal skeletal king boss in a ruined cathedral, the boss brings greatsword down splitting the stone floor, green spectral fire erupts from the crack, the warrior rolls and counterattacks at the ankle, boss staggers then sweeps his cape sending a ghostly energy wave across the arena, dramatic scale contrast. Audio: massive sword impacts, stone splitting, warrior grunt, spectral whoosh, epic orchestral battle music with choir. No subtitles.")
VID_REFS+=("bp-malachar-hero|bp-malachar-turnaround|bp-malachar-3d")

# VIPER (3)
VID_NAMES+=("veo3-viper-explosion")
VID_TYPES+=("image-to-video")
VID_PROMPTS+=("Cinematic slow-motion of a female agent in black tactical suit walking toward camera as a massive explosion erupts behind her on rain-soaked Tokyo street at night, debris and fire billowing in slow-mo, dark hair whipping forward from shockwave, neon signs reflecting in puddles, she does not look back, teal and orange color grading, anamorphic lens flare. Audio: muffled explosion in slow motion, glass shattering, rain pattering, steady boot steps, bass-heavy cinematic score. No subtitles.")
VID_REFS+=("bp-viper-hero")

VID_NAMES+=("veo3-viper-bike")
VID_TYPES+=("text-to-video")
VID_PROMPTS+=("Low tracking shot following a female agent on a sleek black motorcycle weaving through Tokyo traffic at high speed at night, leaning hard into turns with sparks from knee slider, two black SUVs give chase smashing through parked cars, she accelerates and launches off a raised intersection, bike goes airborne in slow motion with neon city lights streaking below, lands hard and continues racing. Audio: high-revving motorcycle engine, screeching tires, crashing metal, wind rushing, momentary silence airborne, hard landing impact. No subtitles.")
VID_REFS+=("")

VID_NAMES+=("veo3-viper-fight")
VID_TYPES+=("text-to-video")
VID_PROMPTS+=("Intense hand-to-hand fight in a dimly lit elevator, a female agent exchanges rapid strikes with two attackers in suits, she deflects a punch and slams him into the wall denting the panels, spins and delivers a spinning back elbow to the second, camera locked inside the tight space capturing every impact, overhead fluorescent light swings creating flashing shadows. Audio: thuds of fists hitting body and wall, fabric tearing, metallic denting, heavy breathing, elevator ding as doors open. No subtitles.")
VID_REFS+=("")

# KODA (2)
VID_NAMES+=("veo3-koda-barista")
VID_TYPES+=("text-to-video")
VID_PROMPTS+=("Charming 3D animated short of a young female barista with a high bun hairstyle working in a cozy coffee shop, she gracefully steams milk creating a perfect swirl, pours latte art forming a rosetta pattern, camera follows her hands in close-up then pulls back to show her proud smile as she places the cup on the counter, warm morning sunlight through cafe windows, Pixar quality with soft lighting. Audio: espresso machine hissing, milk steaming, gentle pour, cafe chatter, acoustic guitar, a satisfied hum. No subtitles.")
VID_REFS+=("")

VID_NAMES+=("veo3-koda-morning")
VID_TYPES+=("text-to-video")
VID_PROMPTS+=("3D animated morning routine montage of a cute barista character opening her coffee shop, she flips the door sign to Open, wipes down the espresso machine, arranges pastries in the display case, grinds fresh coffee beans and inhales the aroma with closed eyes and blissful smile, smooth continuous dolly through the cafe, warm golden morning light growing brighter. Audio: keys jingling, door chime bell, cloth wiping metal, coffee grinder, barista humming, birds chirping, gentle piano. No subtitles.")
VID_REFS+=("")

# TACO (2)
VID_NAMES+=("veo3-taco-assembly")
VID_TYPES+=("text-to-video")
VID_PROMPTS+=("Fast-paced overhead close-up cooking montage of street taco assembly, hands warm corn tortillas on a hot griddle with visible sizzle, lay down juicy carne asada sliced with a sharp knife, add diced onion and fresh cilantro, spoon bright red salsa, finish by squeezing a lime wedge with juice dripping in slow motion, camera stays directly overhead, each step transitions with quick cut, dramatic food lighting. Audio: sizzling meat, knife chopping, salsa spooning, lime squeeze, street market ambiance, upbeat Latin guitar. No subtitles.")
VID_REFS+=("")

VID_NAMES+=("veo3-taco-hero")
VID_TYPES+=("text-to-video")
VID_PROMPTS+=("Slow cinematic dolly approaching a beautifully assembled trio of street tacos on a rustic wooden board, camera starts low at table level and slowly rises revealing the arrangement, steam rising from grilled meat, a hand squeezes a lime wedge releasing golden spray in backlight, garnishes of cilantro and radish in sharp detail, shallow depth of field. Audio: street food market bustle, distant mariachi music, nearby grill sizzle, lime squeeze, murmur of appreciation. No subtitles.")
VID_REFS+=("")

# MIRA (3)
VID_NAMES+=("veo3-mira-build")
VID_TYPES+=("image-to-video")
VID_PROMPTS+=("Stop-motion style animation of a clay social media profile being assembled piece by piece on a black surface, tiny clay hands place each element one by one: first the avatar frame pops down, then clay text appears letter by letter, clay icons slide into position, a pink clay castle grows from nothing on the right side, stars and butterflies flutter in from the edges, the verified badge stamps down with a satisfying press, each piece makes a soft clay squish sound, warm workshop lighting, overhead camera, charming handcrafted aesthetic. Audio: soft clay squishing sounds, gentle tapping, a playful xylophone melody, satisfying pop sounds as each element lands. No subtitles.")
VID_REFS+=("bp-mira-hero")

VID_NAMES+=("veo3-mira-crafting")
VID_TYPES+=("ingredient")
VID_PROMPTS+=("Close-up stop-motion animation of hands sculpting tiny clay social media elements on a wooden worktable, fingers roll colorful polymer clay into small balls then press and shape them into a heart icon, a star, a speech bubble, and a castle turret, each piece is carefully painted with a tiny brush, then placed onto a clay profile board, camera moves between macro close-ups of the sculpting and wider shots of the growing artwork, warm desk lamp lighting. Audio: clay squishing, brush strokes, gentle humming, soft piano background music, satisfying clicking as pieces snap into place. No subtitles.")
VID_REFS+=("bp-mira-hero|bp-mira-details|bp-mira-3d")

VID_NAMES+=("veo3-mira-reveal")
VID_TYPES+=("text-to-video")
VID_PROMPTS+=("A completed clay art social media profile displayed on a slowly rotating wooden turntable, the entire Twitter profile page recreated in colorful polymer clay with a tiny avatar girl, clay text, clay icons, decorated with a pink castle, stars, butterflies and dreamcatcher, camera slowly orbits around the piece showing all the 3D depth and handcrafted details from every angle, soft studio lighting with warm key light and cool fill, shallow depth of field blurring the background, museum display presentation. Audio: soft ambient music, gentle turntable motor hum, occasional sparkle sound effects highlighting details. No subtitles.")
VID_REFS+=("")

# HAYABUSA (2)
VID_NAMES+=("veo3-hayabusa-drift")
VID_TYPES+=("image-to-video")
VID_PROMPTS+=("Low tracking shot of a futuristic Japanese street racing car drifting sideways through a neon-lit Tokyo intersection at night, tires smoking white clouds illuminated by neon, embedded LED strips glowing electric blue, camera at ground level capturing front wheel angle and smoke, wet road reflects all neon creating mirror surface, other cars braking in background. Audio: screaming engine, screeching tires, rubber smoke hissing, turbo blow-off, crowd cheering, synthwave pulse. No subtitles.")
VID_REFS+=("bp-hayabusa-hero")

VID_NAMES+=("veo3-hayabusa-race")
VID_TYPES+=("ingredient")
VID_PROMPTS+=("Cinematic aerial tracking following a pack of 4 futuristic racing cars blasting through an elevated highway between neon skyscrapers at night, the lead car in electric blue pulls ahead then brakes hard for a hairpin, the second car attempts inside overtake, body panels nearly touching, sparks as they clip, cherry blossom petals across the track. Audio: multiple engines in chorus, wind rushing, tire squeals, carbon panels cracking, crowd roar, electronic race music. No subtitles.")
VID_REFS+=("bp-hayabusa-hero|bp-hayabusa-turnaround")

# RYUJI (3)
VID_NAMES+=("veo3-ryuji-cover")
VID_TYPES+=("image-to-video")
VID_PROMPTS+=("An anime magazine cover comes to life, the printed blonde character in black and yellow streetwear slowly starts breathing, then lifts his head and looks directly at camera with a confident smirk, he adjusts his hoodie collar and runs his hand through his spiky hair, the magazine typography and Japanese text elements flutter and animate around him like floating graphic design elements, the white background subtly shifts to reveal a Tokyo street scene behind him, cinematic transition from 2D print to living character. Audio: paper rustling, a stylish whoosh as elements animate, city ambiance fading in, a cool hip-hop beat drops. No subtitles.")
VID_REFS+=("bp-ryuji-hero")

VID_NAMES+=("veo3-ryuji-walk")
VID_TYPES+=("ingredient")
VID_PROMPTS+=("Cinematic tracking shot of a cool blonde anime character in black and yellow streetwear walking confidently down a neon-lit Tokyo alley at night, hands in hoodie pockets, camera follows from a low angle as he passes glowing shop signs and vending machines, his reflection visible in rain puddles on the ground, he pauses to light a cigarette and the flame briefly illuminates his face, smoke trailing into the neon-lit air, manga-style speed lines briefly flash during a dramatic head turn, stylish urban atmosphere. Audio: confident footsteps on wet ground, distant city traffic, lighter click and flame, lo-fi hip-hop beat, muffled Japanese conversation from a nearby izakaya. No subtitles.")
VID_REFS+=("bp-ryuji-hero|bp-ryuji-turnaround|bp-ryuji-poster")

VID_NAMES+=("veo3-ryuji-action")
VID_TYPES+=("text-to-video")
VID_PROMPTS+=("Dynamic anime fight scene in a Tokyo back alley at night, a blonde character in black and yellow streetwear dodges a punch with a smooth lean back, then delivers a spinning kick that sends his opponent flying into stacked crates, camera whips around to follow the action with manga-style impact frames flashing on each hit, yellow energy effects on his kicks, the scene freezes momentarily on the final kick with bold Japanese onomatopoeia text appearing on screen, then resumes as the opponent crashes, stylish anime action choreography. Audio: rapid whooshing kicks, heavy impacts, crates breaking, dramatic orchestral hit on freeze frame, Japanese shout, intense drum and bass soundtrack. No subtitles.")
VID_REFS+=("")

# ────────────────────────────────────────
# FASHION VIDEOS (11)
# ────────────────────────────────────────

# Couture (2)
VID_NAMES+=("fashion-couture-walk")
VID_TYPES+=("image-to-video")
VID_PROMPTS+=("A model walks slowly down a haute couture runway, her golden silk gown flowing and catching the spotlight with every step, the fabric ripples like liquid gold, camera follows in slow motion tracking shot, audience watches in awe from shadowed seats, dramatic fog and volumetric lighting, cinematic fashion film, 4K. Audio: heels clicking on marble, gentle fabric rustling, ambient orchestral music, camera shutters. No subtitles.")
VID_REFS+=("fashion-couture-hero")

VID_NAMES+=("fashion-couture-atelier")
VID_TYPES+=("image-to-video")
VID_PROMPTS+=("Inside a Parisian haute couture atelier, skilled hands meticulously sewing crystals onto fabric, needle piercing through velvet, thread being pulled taut, camera moves in extreme close-up showing the precision of each stitch, pull back to reveal the full magnificent gown on a dress form, warm golden workshop lighting. Audio: needle through fabric, soft classical music, clock ticking, thread snipping. No subtitles.")
VID_REFS+=("fashion-couture-detail")

# Runway (2)
VID_NAMES+=("fashion-runway-show")
VID_TYPES+=("image-to-video")
VID_PROMPTS+=("A dramatic fashion runway show, models emerge one by one from a fog-filled entrance walking with confidence, each wearing a different striking outfit, camera captures from the front row perspective, spotlights sweep across the catwalk, audience reactions visible in background, fast-paced editing between different models, electric fashion week atmosphere. Audio: driving electronic music, heels on runway, camera shutters clicking rapidly, crowd murmuring in excitement. No subtitles.")
VID_REFS+=("fashion-runway-hero")

VID_NAMES+=("fashion-runway-finale")
VID_TYPES+=("ingredient")
VID_PROMPTS+=("Fashion show finale moment, the designer walks out to thunderous applause flanked by all models in a grand procession, confetti falls from above, models break formation and celebrate, hugging each other and the designer, emotional culmination of the show, cinematic slow motion mixed with real-time, golden confetti catching spotlight. Audio: massive applause, cheering, emotional orchestral music swelling, confetti rustling. No subtitles.")
VID_REFS+=("fashion-runway-hero|fashion-runway-lineup")

# Streetwear (2)
VID_NAMES+=("fashion-street-walk")
VID_TYPES+=("image-to-video")
VID_PROMPTS+=("A young model walks confidently through neon-lit Tokyo streets at night, wearing oversized designer streetwear, camera follows in smooth tracking shot, neon reflections dance on wet pavement, the model stops to check their phone then continues with swag, passersby turn to look, urban fashion film aesthetic. Audio: footsteps on wet concrete, muffled Japanese city sounds, lo-fi hip-hop beat, distant traffic. No subtitles.")
VID_REFS+=("fashion-street-hero")

VID_NAMES+=("fashion-street-crew")
VID_TYPES+=("ingredient")
VID_PROMPTS+=("A crew of diverse young models in coordinated streetwear walking together on a rooftop at golden hour, city skyline behind them, they pose individually then together for an invisible camera, laughing and showing off outfits, drone shot pulling up and away to reveal the full rooftop scene, golden light wrapping around silhouettes. Audio: wind on rooftop, distant city traffic, upbeat trap beat, laughter and conversation. No subtitles.")
VID_REFS+=("fashion-street-hero|fashion-street-group|fashion-street-detail")

# Accessories (2)
VID_NAMES+=("fashion-accessories-reveal")
VID_TYPES+=("image-to-video")
VID_PROMPTS+=("Cinematic product reveal of a luxury handbag, starting in darkness then a single spotlight slowly illuminates the bag on a rotating marble pedestal, camera orbits around showing every angle, gold hardware catches light creating lens flares, silk lining is briefly visible as the bag opens slightly, premium product film. Audio: elegant piano notes, soft mechanical rotation, leather creaking subtly, dramatic orchestral swell at full reveal. No subtitles.")
VID_REFS+=("fashion-accessories-hero")

VID_NAMES+=("fashion-jewelry-campaign")
VID_TYPES+=("image-to-video")
VID_PROMPTS+=("A models hand slowly reaches for a statement gold necklace displayed on black velvet, her fingers gently lift it revealing prismatic light refractions from the gemstones, she clasps it around her neck, camera pushes in to extreme close-up showing the intricate metalwork against her skin, luxury jewelry campaign film. Audio: delicate chain links touching, soft ambient tones, heartbeat-like bass, shimmering high-frequency sparkle sounds. No subtitles.")
VID_REFS+=("fashion-accessories-jewelry")

# Editorial (3)
VID_NAMES+=("fashion-editorial-wind")
VID_TYPES+=("image-to-video")
VID_PROMPTS+=("A model in a flowing sculptural dress stands in an abandoned baroque palace as wind suddenly blows through broken windows, her dress billows dramatically like wings, golden dust particles swirl in sunbeams, she turns slowly toward camera with an intense gaze, hair flowing, fabric dancing, cinematic fashion film with slow motion. Audio: wind howling through old building, fabric flapping, dust settling, ethereal ambient music. No subtitles.")
VID_REFS+=("fashion-editorial-hero")

VID_NAMES+=("fashion-editorial-noir")
VID_TYPES+=("image-to-video")
VID_PROMPTS+=("Film noir fashion scene, a model in a sleek black evening gown walks through a dimly lit corridor, her silhouette casting long dramatic shadows on the wall, she pauses at a window where venetian blind shadows stripe across her face, slowly turns with a mysterious expression, smoke curls through the frame, black and white with gold tinting. Audio: heels echoing in empty corridor, distant jazz saxophone, venetian blinds clicking, atmospheric noir soundtrack. No subtitles.")
VID_REFS+=("fashion-editorial-noir")

VID_NAMES+=("fashion-montage")
VID_TYPES+=("text-to-video")
VID_PROMPTS+=("A rapid-cut fashion montage combining all styles: haute couture gown spinning in slow motion, streetwear crew walking in urban night, luxury accessories gleaming under spotlight, runway models strutting in sequence, editorial poses in dramatic locations, all cut to a driving beat, each shot lasting 1-2 seconds, building intensity toward a finale of all elements overlapping, premium fashion brand campaign film. Audio: building electronic beat, fabric whooshes, camera clicks, heels, crescendo to climactic drop. No subtitles.")
VID_REFS+=("")

# ═══════════════════════════════════════════════════════════════
# SUBMIT ALL VIDEO JOBS
# ═══════════════════════════════════════════════════════════════

VID_TOTAL=${#VID_NAMES[@]}
declare -a VID_JOBIDS=()

echo ""
echo "============================================="
echo "  PHASE 2: Submitting $VID_TOTAL video jobs"
echo "============================================="
echo ""

for i in "${!VID_NAMES[@]}"; do
  NAME="${VID_NAMES[$i]}"
  TYPE="${VID_TYPES[$i]}"
  P="${VID_PROMPTS[$i]}"
  REFS="${VID_REFS[$i]}"

  # Skip if video already downloaded
  EXISTING="$ASSETS_DIR/${NAME}.mp4"
  if [ -f "$EXISTING" ]; then
    FSIZE=$(wc -c < "$EXISTING" | tr -d ' ')
    if [ "$FSIZE" -gt 100000 ]; then
      echo "  [$((i+1))/$VID_TOTAL] SKIP $NAME (already downloaded, ${FSIZE} bytes)"
      VID_JOBIDS+=("SKIP")
      continue
    fi
  fi

  # Resolve reference image URLs
  IMG_URLS=()
  if [ -n "$REFS" ] && [ "$TYPE" != "text-to-video" ]; then
    IFS='|' read -ra REF_KEYS <<< "$REFS"
    for rn in "${REF_KEYS[@]}"; do
      url=$(get_img "$rn")
      [ -n "$url" ] && IMG_URLS+=("$url")
    done
    if [ ${#IMG_URLS[@]} -eq 0 ]; then
      echo "  WARN: $NAME -> fallback to text-to-video"
      TYPE="text-to-video"
    fi
  fi

  # Build payload using python3 for safe JSON construction
  IMG_URLS_STR=$(IFS='|'; echo "${IMG_URLS[*]+"${IMG_URLS[*]}"}")
  PAYLOAD=$(python3 -c "
import json, sys
p = sys.argv[1]
vtype = sys.argv[2]
imgs = [u for u in sys.argv[3].split('|') if u] if sys.argv[3] else []
payload = {
    'type': vtype,
    'prompt': p,
    'duration': 5,
    'aspectRatio': '16:9',
    'resolution': '720p',
    'mode': 'relaxed',
    'engine': {'provider': 'fxflow', 'model': 'veo_3_generate'}
}
if vtype == 'image-to-video' and imgs:
    payload['startImage'] = imgs[0]
elif vtype == 'ingredient' and imgs:
    payload['images'] = imgs[:3]
print(json.dumps(payload))
" "$P" "$TYPE" "$IMG_URLS_STR")

  R=$(curl -s -X POST "$VID_API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "$PAYLOAD")
  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  VID_JOBIDS+=("$JID")

  case "$TYPE" in
    text-to-video)   BADGE="TXT" ;;
    image-to-video)  BADGE="IMG" ;;
    ingredient)      BADGE="ING" ;;
  esac

  echo "  [$((i+1))/$VID_TOTAL] [$BADGE] $NAME -> $JID"
  sleep 2
done

# ═══════════════════════════════════════════════════════════════
# PHASE 3: Poll results & download
# ═══════════════════════════════════════════════════════════════

echo ""
echo "============================================="
echo "  PHASE 3: Polling & downloading $VID_TOTAL videos"
echo "============================================="

VID_DONE=0
VID_FAIL=0

for i in "${!VID_NAMES[@]}"; do
  JID="${VID_JOBIDS[$i]}"
  NAME="${VID_NAMES[$i]}"
  [ -z "$JID" ] && echo "  SKIP $NAME: no job ID" && VID_FAIL=$((VID_FAIL+1)) && continue
  [ "$JID" = "SKIP" ] && VID_DONE=$((VID_DONE+1)) && continue

  for attempt in $(seq 1 120); do
    sleep 10
    SR=$(curl -s "$VID_API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']['result']; print(d.get('videoUrl',''))" 2>/dev/null)

      # Download video to local assets
      OUT_FILE="$ASSETS_DIR/${NAME}.mp4"
      echo "  Downloading $NAME..."
      curl -sL -o "$OUT_FILE" "$URL"
      FILE_SIZE=$(wc -c < "$OUT_FILE" | tr -d ' ')

      if [ "$FILE_SIZE" -gt 10000 ]; then
        VID_DONE=$((VID_DONE+1))
        echo "  OK [$VID_DONE/$VID_TOTAL] $NAME (${FILE_SIZE} bytes)"
        echo "$NAME|/assets/showcase/${NAME}.mp4|$URL" >> "$RESULTS_FILE"
      else
        echo "  WARN: $NAME download too small (${FILE_SIZE} bytes), keeping CDN URL"
        echo "$NAME|$URL|$URL" >> "$RESULTS_FILE"
      fi
      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      ERR=$(echo "$SR" | python3 -c "import sys,json; e=json.load(sys.stdin)['data'].get('error',{}); print(e.get('userMessage','unknown'))" 2>/dev/null)
      echo "  FAIL $NAME: $ERR"
      VID_FAIL=$((VID_FAIL+1))
      break
    else
      printf "  ... %s: %s (%d/120)\r" "$NAME" "$ST" "$attempt"
    fi
  done
done

echo ""
echo "=========================================================="
echo "  DONE: $VID_DONE/$VID_TOTAL videos downloaded"
echo "  Failed: $VID_FAIL"
echo "  Results: $RESULTS_FILE"
echo "  Assets:  $ASSETS_DIR"
echo "=========================================================="
echo ""
echo "Next step: Update src/constants/showcase-cdn.ts"
echo "Replace: const V = 'https://fxflow-media.skyverses.com/videos'"
echo "With local paths from: $RESULTS_FILE"
echo ""
cat "$RESULTS_FILE"
