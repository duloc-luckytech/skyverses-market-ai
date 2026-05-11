#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# PARALLEL: Re-generate ALL failed images → upload to Cloudflare
# Launches all generations concurrently, polls + uploads in parallel
# ═══════════════════════════════════════════════════════════════
set -uo pipefail

IMG_API="https://api.skyverses.com/api-client/external/image-task"
TOKEN="Bearer ${SKYVERSES_EXTERNAL_API_TOKEN:?set SKYVERSES_EXTERNAL_API_TOKEN}"

CF_ACCOUNT_ID="cf3d665aec0eda633986d008ba66c967"
CF_IMAGES_TOKEN="${CF_IMAGES_TOKEN:?set CF_IMAGES_TOKEN}"
CF_IMG_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1"

COVER1="/tmp/pm_showcase_covers.txt"
COVER2="/tmp/pm_v4extra_covers.txt"
EXAMPLE1="/tmp/pm_showcase_examples.txt"
EXAMPLE2="/tmp/pm_v4extra_examples.txt"

LOGDIR="/tmp/pm_parallel_logs"
mkdir -p "$LOGDIR"

# ─── Worker function: gen → poll → upload CF ───
# Runs as a background subshell
worker() {
  local NAME="$1" PROMPT="$2" RATIO="$3" OUTFILE="$4"
  local LOG="$LOGDIR/${NAME}.log"

  # Skip if already on CF
  if grep -q "^${NAME}|https://imagedelivery" "$OUTFILE" 2>/dev/null; then
    echo "SKIP" > "$LOG"
    echo "  ⏭️  $NAME already on CF"
    return 0
  fi

  echo "  🚀 $NAME: submitting..."

  # Submit
  local BODY
  BODY=$(python3 -c "
import json, sys
prompt = sys.argv[1]
ratio = sys.argv[2]
print(json.dumps({
  'type': 'text_to_image',
  'prompt': prompt,
  'aspectRatio': ratio,
  'engine': {'provider': 'fxflow', 'model': 'google_image_gen_4_5'}
}))
" "$PROMPT" "$RATIO" 2>/dev/null)

  local JOB
  JOB=$(curl -s -X POST "$IMG_API" \
    -H "Authorization: $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('jobId','ERROR'))" 2>/dev/null || echo "ERROR")

  if [[ "$JOB" == "ERROR" || -z "$JOB" ]]; then
    echo "FAILED" > "$LOG"
    echo "  ❌ $NAME: submit failed"
    return 1
  fi

  # Poll (max 10 min)
  local TEMP_URL=""
  for attempt in $(seq 1 120); do
    local RESP STATUS
    RESP=$(curl -s "$IMG_API/$JOB" -H "Authorization: $TOKEN")
    STATUS=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('status','unknown'))" 2>/dev/null || echo "unknown")

    if [[ "$STATUS" == "done" ]]; then
      TEMP_URL=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null || echo "")
      break
    elif [[ "$STATUS" == "failed" || "$STATUS" == "error" ]]; then
      break
    fi
    sleep 5
  done

  if [[ -z "$TEMP_URL" || "$TEMP_URL" == "None" ]]; then
    echo "FAILED" > "$LOG"
    echo "  ❌ $NAME: generation failed (job=$JOB)"
    return 1
  fi

  # Upload to CF
  local CF_RESP CF_SUCCESS CF_URL
  CF_RESP=$(curl -s -X POST "$CF_IMG_API" \
    -H "Authorization: Bearer $CF_IMAGES_TOKEN" \
    -F "url=$TEMP_URL" \
    -F "id=pm-market/$NAME" \
    --max-time 120 2>/dev/null || echo '{"success":false}')

  CF_SUCCESS=$(echo "$CF_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success',False))" 2>/dev/null || echo "False")

  if [[ "$CF_SUCCESS" == "True" ]]; then
    CF_URL=$(echo "$CF_RESP" | python3 -c "
import sys, json
d = json.load(sys.stdin)
variants = d.get('result', {}).get('variants', [])
url = next((v for v in variants if '/public' in v), variants[0] if variants else '')
print(url)
" 2>/dev/null || echo "")

    if [[ -n "$CF_URL" && "$CF_URL" != "None" ]]; then
      echo "$CF_URL" > "$LOG"
      echo "  ✅ $NAME → $CF_URL"
      return 0
    fi
  fi

  # Check "already exists"
  local ERR
  ERR=$(echo "$CF_RESP" | python3 -c "import sys,json; es=json.load(sys.stdin).get('errors',[]); print(es[0].get('message','') if es else '')" 2>/dev/null || echo "")
  if echo "$ERR" | grep -qi "already exists\|duplicate"; then
    CF_URL="https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/pm-market/${NAME}/public"
    echo "$CF_URL" > "$LOG"
    echo "  ⏭️  $NAME: already exists on CF → $CF_URL"
    return 0
  fi

  echo "FAILED" > "$LOG"
  echo "  ❌ $NAME: CF upload failed: $ERR"
  return 1
}

echo "═══════════════════════════════════════════════════"
echo "  PARALLEL Re-gen + CF Upload — $(date)"
echo "  Launching all workers concurrently..."
echo "═══════════════════════════════════════════════════"
echo ""

PIDS=()

# Launch worker in background, collecting PID
launch() {
  local NAME="$1" PROMPT="$2" RATIO="$3" OUTFILE="$4"
  worker "$NAME" "$PROMPT" "$RATIO" "$OUTFILE" &
  PIDS+=($!)
  # Small stagger to not slam API with 56 simultaneous requests
  sleep 0.5
}

# ═══ BATCH 1: Covers 01-25 ═══
echo "── Launching Covers 01-25 ──"

launch "pm-02-food-editorial" "Overhead editorial food photography of an artfully plated wagyu beef tartare on a handmade ceramic plate, garnished with microgreens and edible gold leaf, surrounded by scattered pink peppercorns and a drizzle of truffle oil on the dark slate surface, warm directional lighting, shot on Hasselblad H6D, no text" "16:9" "$COVER1"

launch "pm-03-interior-design" "A stunning Scandinavian minimalist living room with floor-to-ceiling windows overlooking a snowy Nordic forest, warm afternoon light flooding in, a curved bouclé sofa in cream beside a walnut coffee table, a statement Noguchi paper lamp glowing warmly, polished concrete floors with a sheepskin rug, architectural photography, no text" "16:9" "$COVER1"

launch "pm-04-fashion-editorial" "Haute couture editorial photograph, a striking model in an avant-garde sculptural emerald green gown with dramatic pleated organza cape, walking through a misty enchanted forest at golden hour, harsh directional backlighting creating a glowing silhouette, Vogue Italia quality, no text" "9:16" "$COVER1"

launch "pm-05-logo-design" "A professional brand identity presentation showing six different minimal modern logos arranged in a grid on premium textured paper cards with subtle embossing, on a clean dark charcoal background, studio lighting with soft shadows, no text on background" "16:9" "$COVER1"

launch "pm-06-character-design" "Full-body 3D character render of an elite cyberpunk samurai warrior with a glowing neon-blue visor, wearing matte black tactical armor, wielding a plasma katana that trails electric blue particles, standing in a rain-soaked Tokyo alley with neon signs, Unreal Engine 5 cinematic quality, no text" "16:9" "$COVER1"

launch "pm-07-architecture" "Award-winning modern residential architecture, a cantilevered concrete and glass villa perched on a dramatic coastal cliff overlooking turquoise ocean at golden hour, infinity pool merging with the horizon, lush tropical landscaping, warm interior lighting visible through glass walls, wide establishing shot, no text" "16:9" "$COVER1"

launch "pm-08-jewelry" "High-end jewelry campaign photograph, a model neck adorned with a statement diamond and emerald necklace, extreme close-up showing skin texture and platinum craftsmanship, dark moody background with a single warm spotlight, luxury advertising quality, no text" "1:1" "$COVER1"

launch "pm-09-social-media" "A creative flat lay of a social media workspace, featuring an iPhone showing a vibrant Instagram feed, a MacBook with a design tool open, scattered Pantone swatches, cold brew coffee, wireless earbuds, succulent, arranged on white marble surface with natural window light, overhead shot, no text" "16:9" "$COVER1"

launch "pm-10-pod-designs" "Three black t-shirts hanging on wooden hangers against a raw concrete wall, each featuring a different bold graphic design — retro sunset with palm silhouettes, botanical wildflower line art, and geometric wolf head in gradient purple and teal — soft natural light, streetwear brand quality, no text on wall" "16:9" "$COVER1"

launch "pm-11-ad-creative" "Three premium digital advertising mockups on floating glass screens against a dark gradient background, each showing a different ad format with luxury products, soft neon glow behind each screen, digital marketing portfolio quality, no text outside ads" "16:9" "$COVER1"

launch "pm-12-packaging" "Luxury cosmetics packaging, three elegant perfume bottles with sculptural geometric caps in rose gold and frosted glass on a stepped marble display, surrounded by fresh white peonies and scattered rose petals, dramatic studio lighting with rim light, soft bokeh in blush pink, no text" "16:9" "$COVER1"

launch "pm-13-real-estate" "Stunning luxury real estate twilight exterior, a modern Mediterranean villa with warm honey stone walls, illuminated by warm interior lighting, azure infinity pool reflecting the deep blue dusk sky, mature olive trees and lavender hedges, string lights on the terrace, architectural twilight photography, no text" "16:9" "$COVER1"

launch "pm-14-cinematic" "A cinematic sci-fi film still, a lone astronaut in a weathered white spacesuit standing in the doorway of a massive derelict space station, looking out at a gas giant planet with swirling amber and crimson storms, emergency red lights flickering behind, dust particles floating in zero gravity, anamorphic lens flare, no text" "16:9" "$COVER1"

launch "pm-15-fantasy-art" "Epic fantasy concept art, a massive ancient tree city built into the trunk and branches of a world-tree reaching above the clouds, interconnected treehouse structures with warm lantern light, rope bridges and spiral staircases, waterfalls cascading into a misty valley, bioluminescent moss, a dragon silhouette at sunset, matte painting quality, no text" "16:9" "$COVER1"

launch "pm-16-scifi-world" "A breathtaking cyberpunk megacity skyline at night, towering skyscrapers with holographic advertisements and neon signage, flying vehicles leaving light trails, a massive torii gate structure spanning two towers glowing with cherry blossom pink light, rain falling through volumetric fog, ultra-wide panoramic shot, no text" "16:9" "$COVER1"

launch "pm-17-portrait" "Dramatic editorial portrait of a young woman with striking heterochromia eyes, one blue and one amber, short silver-white hair, wearing a structured black turtleneck, shot against deep charcoal background, butterfly lighting, ultra-sharp skin texture, shot on Canon EOS R5 with 85mm f/1.2, no text" "9:16" "$COVER1"

launch "pm-18-automotive" "A futuristic electric hypercar concept in matte pearl white with flowing organic body lines and illuminated blue accent lines, parked in an underground concrete garage with dramatic directional lighting, rain puddles reflecting the car, low three-quarter front angle, automotive photography, no text" "16:9" "$COVER1"

launch "pm-19-anime-art" "Beautiful anime illustration of a young sorceress with flowing lavender hair adorned with star-shaped hairpins, wearing an elegant midnight blue cloak with silver constellation embroidery, holding a glowing crystal staff, standing on a floating island above clouds at twilight with a crescent moon, cherry blossom petals, Makoto Shinkai style, no text" "9:16" "$COVER1"

launch "pm-20-landscape" "A breathtaking landscape of the Lofoten Islands in Norway during blue hour, dramatic jagged mountain peaks reflected in a still fjord, a traditional red fishing cabin with warm light in windows, Northern Lights aurora borealis in green and purple ribbons, long exposure silky water, National Geographic quality, no text" "16:9" "$COVER1"

launch "pm-21-abstract-art" "A mesmerizing abstract fluid art composition, swirling ribbons of liquid gold, deep sapphire blue, and iridescent pearl white flowing and intertwining, microscopic cell-like structures forming at boundaries, tiny bubble formations catching light, suggesting cosmic nebulae, extremely detailed textures, gallery art quality, no text" "1:1" "$COVER1"

launch "pm-22-childrens-book" "A whimsical children book illustration of a cozy woodland library inside a giant hollow oak tree, tiny forest animals — a fox cub with spectacles, a hedgehog in a sweater, and a rabbit in overalls — reading a storybook on mushroom stools, bookshelves in tree walls, warm golden lantern light, fireflies, starry night, watercolor texture, no text" "16:9" "$COVER1"

launch "pm-23-pet-portrait" "A regal studio portrait of a golden retriever wearing a Renaissance-era velvet collar with gold medallion, seated against a painterly backdrop of deep burgundy and forest green, looking nobly to the side, soft Rembrandt lighting highlighting golden fur, oil painting meets photography style, no text" "1:1" "$COVER1"

launch "pm-24-vintage-retro" "A nostalgic 1970s photograph of a vintage Volkswagen camper van in two-tone orange and cream at a California beach sunset, surfboards leaning against the side, a couple on a plaid blanket with a record player and vinyl records, palm trees silhouetted, warm analog film grain and light leaks, Kodak Portra vibes, no text" "16:9" "$COVER1"

launch "pm-25-3d-mockup" "Three floating 3D product renders of premium wireless earbuds in midnight black, arctic white, and sunset coral, each partially out of their matching charging cases, suspended against a clean gradient background, soft studio lighting with subtle colored reflections, Apple product photography style, Octane render, no text" "16:9" "$COVER1"

echo ""
echo "── Launching Covers 26-40 ──"

# ═══ BATCH 2: Covers 26-40 ═══

launch "pm-28-wedding-photo" "Golden hour photograph of a couple silhouetted against sunset in a lavender field, flowing veil in wind, warm backlit light, bokeh background, romantic wedding photography, no text" "16:9" "$COVER2"

launch "pm-29-isometric-3d" "Isometric 3D illustration of a cozy coffee shop interior, tiny people at tables, large windows with rain outside, steam from cups, bookshelves, potted plants, pastel colors, miniature diorama style, no text" "1:1" "$COVER2"

launch "pm-30-dark-fantasy" "Epic dark fantasy digital painting of an ancient dragon perched on a crumbling gothic cathedral tower during a thunderstorm, lightning illuminating its scales, dark purple and crimson sky, medieval city burning below, volumetric fog, hyper-detailed, no text" "16:9" "$COVER2"

launch "pm-31-underwater" "Stunning underwater photograph of a coral reef ecosystem, schools of tropical fish swimming through crystal clear turquoise water, sunbeams penetrating the surface creating caustic light patterns, vibrant coral in orange pink and purple, no text" "16:9" "$COVER2"

launch "pm-32-street-photo" "Atmospheric street photography in Tokyo at night, a narrow alley with traditional izakaya lanterns glowing warm orange, wet cobblestones reflecting lights, a bicycle parked against the wall, steam from a ramen shop, moody cinematic lighting, no text" "9:16" "$COVER2"

launch "pm-33-macro" "Extreme macro photograph of morning dew drops on a spider web, each droplet reflecting the sunrise, delicate silk threads catching golden light, dark blurred background with bokeh circles, no text" "1:1" "$COVER2"

launch "pm-34-flat-design" "Modern flat design illustration for a tech startup, showing a person working on a laptop surrounded by floating UI elements, charts, and notification bubbles, gradient purple to blue background, clean geometric shapes, Dribbble trending style, no text" "16:9" "$COVER2"

launch "pm-35-cinematic-portrait" "Cinematic portrait of an elderly craftsman in his woodworking workshop, warm afternoon light streaming through a dusty window, wood shavings in the air catching light, weathered hands holding a hand plane, shallow depth of field, no text" "9:16" "$COVER2"

launch "pm-36-pixel-art" "Detailed pixel art scene of a fantasy RPG town at sunset, colorful buildings with thatched roofs, a market square with tiny pixel characters, a grand castle on a hill, cherry blossom trees lining the road, 32-bit era style, warm golden lighting, no text" "16:9" "$COVER2"

launch "pm-37-botanical" "Elegant botanical scientific illustration of a blooming orchid plant, showing the full plant with roots stems leaves and flowers in various stages of bloom, detailed cross-section, vintage hand-painted watercolor style on cream parchment paper, no text" "9:16" "$COVER2"

launch "pm-38-sports-action" "Dynamic sports action photograph of a basketball player mid-dunk, frozen in mid-air with arena lights creating dramatic rim lighting, sweat droplets suspended, motion blur on the crowd, wide aperture, arena atmosphere, no text" "16:9" "$COVER2"

launch "pm-39-stained-glass" "Intricate stained glass window design depicting a magical forest scene with a majestic white stag in a moonlit clearing, surrounded by ancient oak trees, fireflies as glowing amber glass pieces, cobalt blue night sky with silver stars, backlit by warm sunlight, no text" "9:16" "$COVER2"

launch "pm-40-tilt-shift" "Tilt-shift miniature effect photograph of a bustling European harbor town, making it look like a tiny model village, colorful fishing boats in the marina, terracotta rooftops, a lighthouse at the harbor entrance, extreme shallow depth of field, saturated vibrant colors, no text" "16:9" "$COVER2"

echo ""
echo "── Launching Examples 01-15 ──"

# ═══ BATCH 3: Examples 01-15 ═══

launch "ex-02-dark-dessert" "Dark moody food photography of a chocolate lava cake on a matte black plate, molten chocolate flowing from center, vanilla ice cream melting beside it, cocoa powder dusting and gold leaf garnish, dark wood table, single warm directional light, deep shadows, no text" "1:1" "$EXAMPLE1"

launch "ex-03-wabisabi-bathroom" "A serene Japanese wabi-sabi bathroom, a deep oval stone soaking tub filled with steaming water, floor-to-ceiling window looking at a bamboo garden, natural stone floor with river pebbles, wooden stool with folded towels, dried eucalyptus hanging, soft natural light, no text" "9:16" "$EXAMPLE1"

launch "ex-04-streetwear" "Urban streetwear editorial, a young model in an oversized vintage-washed denim jacket with bold embroidered tiger back patch, wide-leg cargo pants, chunky platform boots, standing on a fire escape in a gritty alley with morning fog, harsh flash photography, raw street energy, no text" "9:16" "$EXAMPLE1"

launch "ex-05-paladin-turnaround" "Professional game character turnaround reference sheet showing a female holy paladin knight in ornate white and gold plate armor with a royal blue cape, displayed in 6 views on neutral gray background: front, back, left, right, combat stance, and kneeling prayer, concept art character sheet, no text" "16:9" "$EXAMPLE1"

launch "ex-06-brutalist-museum" "Award-winning brutalist museum architecture, a monumental raw concrete building with dramatic cantilevers and deep geometric recesses, monumental staircase, reflecting pool in the forecourt, a single person on the stairs for scale, overcast sky, Tadao Ando aesthetic, no text" "16:9" "$EXAMPLE1"

launch "ex-07-noir-detective" "A cinematic film noir still, a detective in a trench coat and fedora under a single flickering street lamp on a rain-soaked cobblestone street at midnight, cigarette smoke curling into light, neon reflections on wet pavement, venetian blind shadow on face, Roger Deakins lighting, no text" "16:9" "$EXAMPLE1"

launch "ex-08-space-station" "Interior of a massive rotating space station observation deck, curved floor with lush hydroponic gardens, floor-to-ceiling windows revealing Earth and stars slowly rotating, warm artificial sunlight mixing with blue Earth glow, people walking on paths, a cafe area, futuristic aesthetic, no text" "16:9" "$EXAMPLE1"

launch "ex-09-anime-battle" "Dynamic anime battle scene, two sword fighters clashing mid-air above a destroyed temple during a thunderstorm, one in crimson armor with flame katana, other in ice-blue robes with crystal blade, lightning bolt at moment of impact, shockwave energy ring, Ufotable quality, no text" "16:9" "$EXAMPLE1"

launch "ex-10-ceo-portrait" "Environmental editorial portrait of a confident tech CEO in a tailored navy suit, standing in a modern glass office atrium, arms crossed, looking at camera, natural light from glass ceiling creating rim lighting, blurred office activity in background, Forbes cover quality, no text" "9:16" "$EXAMPLE1"

launch "ex-11-motorcycle" "A futuristic electric motorcycle concept in matte gunmetal gray with copper accents, hubless rear wheel, minimalist OLED instrument cluster, LED light strip from headlight to tail, parked on a rooftop helipad at dusk with city skyline, wet surface reflecting lights, low dramatic angle, no text" "16:9" "$EXAMPLE1"

launch "ex-12-coffee-brand" "A premium coffee brand identity mockup, showing a minimal line-art logo of a mountain with rising steam, displayed on kraft paper coffee bag, ceramic takeaway cup, rubber stamp impression, and embossed business card, on dark wood with scattered coffee beans, warm lighting, no text outside logo" "1:1" "$EXAMPLE1"

launch "ex-13-iceland-volcanic" "An otherworldly Iceland landscape, a river of glowing orange lava flowing through a black basalt field, steam and gases rising, Milky Way visible in dark sky, green moss-covered lava rocks in foreground, long exposure smooth lava flow, midnight shot, National Geographic quality, no text" "16:9" "$EXAMPLE1"

launch "ex-14-macro-crystal" "Extreme macro photograph of a bismuth crystal formation, iridescent staircase-like geometric structures in vivid rainbow colors — electric blue, magenta, gold, and teal — each terrace reflecting light differently, shallow depth of field with creamy bokeh, abstract art meets science, no text" "1:1" "$EXAMPLE1"

launch "ex-15-headphone-render" "A premium 3D product render of over-ear wireless headphones in brushed titanium with cognac leather ear cushions, one ear cup rotated to show driver detail, floating against warm gradient background from cream to soft peach, subtle colored reflections, leather carrying case in background, Octane render, no text" "16:9" "$EXAMPLE1"

echo ""
echo "── Launching Examples 26-40 ──"

# ═══ BATCH 4: Examples 26-40 ═══

launch "ex-26-autumn-lake" "Aerial view looking down at a mountain lake surrounded by autumn forest, golden orange trees reflected in still water, small wooden dock with red canoe, morning mist, drone photography, no text" "16:9" "$EXAMPLE2"

launch "ex-27-neon-alley" "Cyberpunk back alley with holographic advertisements, ramen vendor stall with steam and neon glow, puddles reflecting blue and magenta lights, dystopian future aesthetic, no text" "9:16" "$EXAMPLE2"

launch "ex-29-isometric-room" "Cute isometric 3D illustration of a home office room, tiny desk with dual monitors, a cat sleeping on a beanbag, plants on floating shelves, warm lamp lighting, soft pastel colors, miniature diorama, no text" "1:1" "$EXAMPLE2"

launch "ex-36-pixel-dungeon" "Detailed pixel art scene of a fantasy dungeon interior, ancient stone walls with glowing rune carvings, treasure chests and scattered gold coins, a pixel art hero facing a dragon boss, torchlight casting flickering shadows, 16-bit RPG style, no text" "16:9" "$EXAMPLE2"

launch "ex-38-soccer" "Dynamic sports photography of a soccer player performing a bicycle kick in a packed stadium at night, frozen in mid-air, floodlights creating dramatic backlight, grass particles flying, no text" "16:9" "$EXAMPLE2"

echo ""
echo "═══════════════════════════════════════════════════"
echo "  All ${#PIDS[@]} workers launched. Waiting..."
echo "═══════════════════════════════════════════════════"

# Wait for ALL workers
wait "${PIDS[@]}" 2>/dev/null

echo ""
echo "═══════════════════════════════════════════════════"
echo "  All workers complete. Updating map files..."
echo "═══════════════════════════════════════════════════"

# ─── Rebuild map files from logs ───
OK=0
FAIL=0
SKIP=0

update_map() {
  local NAME="$1" OUTFILE="$2"
  local LOG="$LOGDIR/${NAME}.log"
  if [[ ! -f "$LOG" ]]; then
    ((FAIL++))
    return
  fi
  local RESULT
  RESULT=$(cat "$LOG")
  if [[ "$RESULT" == "SKIP" ]]; then
    ((SKIP++))
    return
  elif [[ "$RESULT" == "FAILED" ]]; then
    ((FAIL++))
    # Keep FAILED in map
    sed -i '' "/^${NAME}|/d" "$OUTFILE" 2>/dev/null || true
    echo "${NAME}|FAILED" >> "$OUTFILE"
    return
  elif [[ "$RESULT" == https://* ]]; then
    ((OK++))
    sed -i '' "/^${NAME}|/d" "$OUTFILE" 2>/dev/null || true
    echo "${NAME}|${RESULT}" >> "$OUTFILE"
    return
  fi
  ((FAIL++))
}

# Covers 01-25
for name in pm-02-food-editorial pm-03-interior-design pm-04-fashion-editorial pm-05-logo-design pm-06-character-design pm-07-architecture pm-08-jewelry pm-09-social-media pm-10-pod-designs pm-11-ad-creative pm-12-packaging pm-13-real-estate pm-14-cinematic pm-15-fantasy-art pm-16-scifi-world pm-17-portrait pm-18-automotive pm-19-anime-art pm-20-landscape pm-21-abstract-art pm-22-childrens-book pm-23-pet-portrait pm-24-vintage-retro pm-25-3d-mockup; do
  update_map "$name" "$COVER1"
done

# Covers 26-40
for name in pm-28-wedding-photo pm-29-isometric-3d pm-30-dark-fantasy pm-31-underwater pm-32-street-photo pm-33-macro pm-34-flat-design pm-35-cinematic-portrait pm-36-pixel-art pm-37-botanical pm-38-sports-action pm-39-stained-glass pm-40-tilt-shift; do
  update_map "$name" "$COVER2"
done

# Examples 01-15
for name in ex-02-dark-dessert ex-03-wabisabi-bathroom ex-04-streetwear ex-05-paladin-turnaround ex-06-brutalist-museum ex-07-noir-detective ex-08-space-station ex-09-anime-battle ex-10-ceo-portrait ex-11-motorcycle ex-12-coffee-brand ex-13-iceland-volcanic ex-14-macro-crystal ex-15-headphone-render; do
  update_map "$name" "$EXAMPLE1"
done

# Examples 26-40
for name in ex-26-autumn-lake ex-27-neon-alley ex-29-isometric-room ex-36-pixel-dungeon ex-38-soccer; do
  update_map "$name" "$EXAMPLE2"
done

echo ""
echo "═══════════════════════════════════════════════════"
echo "  DONE!"
echo "  Success: $OK | Failed: $FAIL | Skipped: $SKIP"
echo "  Total: $((OK + FAIL + SKIP))"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Map files:"
echo "  $COVER1"
echo "  $COVER2"
echo "  $EXAMPLE1"
echo "  $EXAMPLE2"
