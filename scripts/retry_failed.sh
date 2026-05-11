#!/bin/bash
# Retry failed images in batches of 5 concurrent
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

worker() {
  local NAME="$1" PROMPT="$2" RATIO="$3" OUTFILE="$4"
  local LOG="$LOGDIR/${NAME}.log"

  if grep -q "^${NAME}|https://imagedelivery" "$OUTFILE" 2>/dev/null; then
    echo "SKIP" > "$LOG"
    echo "  ⏭️  $NAME already on CF"
    return 0
  fi

  echo "  🚀 $NAME: submitting..."

  local BODY
  BODY=$(python3 -c "
import json, sys
print(json.dumps({
  'type': 'text_to_image',
  'prompt': sys.argv[1],
  'aspectRatio': sys.argv[2],
  'engine': {'provider': 'fxflow', 'model': 'google_image_gen_4_5'}
}))
" "$PROMPT" "$RATIO" 2>/dev/null)

  local JOB
  JOB=$(curl -s -X POST "$IMG_API" \
    -H "Authorization: $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('jobId','ERROR'))" 2>/dev/null || echo "ERROR")

  if [[ "$JOB" == "ERROR" || -z "$JOB" ]]; then
    echo "FAILED" > "$LOG"; echo "  ❌ $NAME: submit failed"; return 1
  fi

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
    echo "FAILED" > "$LOG"; echo "  ❌ $NAME: gen failed"; return 1
  fi

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
      echo "$CF_URL" > "$LOG"; echo "  ✅ $NAME → $CF_URL"; return 0
    fi
  fi

  local ERR
  ERR=$(echo "$CF_RESP" | python3 -c "import sys,json; es=json.load(sys.stdin).get('errors',[]); print(es[0].get('message','') if es else '')" 2>/dev/null || echo "")
  if echo "$ERR" | grep -qi "already exists\|duplicate"; then
    CF_URL="https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/pm-market/${NAME}/public"
    echo "$CF_URL" > "$LOG"; echo "  ⏭️  $NAME: exists → $CF_URL"; return 0
  fi

  echo "FAILED" > "$LOG"; echo "  ❌ $NAME: CF upload failed"; return 1
}

# All items: NAME|PROMPT|RATIO|OUTFILE
ITEMS=(
  # Covers 1-25
  "pm-03-interior-design|A stunning Scandinavian minimalist living room with floor-to-ceiling windows overlooking a snowy Nordic forest, warm afternoon light flooding in, a curved bouclé sofa in cream beside a walnut coffee table, a statement Noguchi paper lamp glowing warmly, polished concrete floors with a sheepskin rug, architectural photography, no text|16:9|$COVER1"
  "pm-06-character-design|Full-body 3D character render of an elite cyberpunk samurai warrior with a glowing neon-blue visor, wearing matte black tactical armor, wielding a plasma katana that trails electric blue particles, standing in a rain-soaked Tokyo alley with neon signs, Unreal Engine 5 cinematic quality, no text|16:9|$COVER1"
  "pm-08-jewelry|High-end jewelry campaign photograph, a model neck adorned with a statement diamond and emerald necklace, extreme close-up showing skin texture and platinum craftsmanship, dark moody background with a single warm spotlight, luxury advertising quality, no text|1:1|$COVER1"
  "pm-10-pod-designs|Three black t-shirts hanging on wooden hangers against a raw concrete wall, each featuring a different bold graphic design — retro sunset with palm silhouettes, botanical wildflower line art, and geometric wolf head in gradient purple and teal — soft natural light, streetwear brand quality, no text on wall|16:9|$COVER1"
  "pm-11-ad-creative|Three premium digital advertising mockups on floating glass screens against a dark gradient background, each showing a different ad format with luxury products, soft neon glow behind each screen, digital marketing portfolio quality, no text outside ads|16:9|$COVER1"
  "pm-19-anime-art|Beautiful anime illustration of a young sorceress with flowing lavender hair adorned with star-shaped hairpins, wearing an elegant midnight blue cloak with silver constellation embroidery, holding a glowing crystal staff, standing on a floating island above clouds at twilight with a crescent moon, cherry blossom petals, Makoto Shinkai style, no text|9:16|$COVER1"
  "pm-20-landscape|A breathtaking landscape of the Lofoten Islands in Norway during blue hour, dramatic jagged mountain peaks reflected in a still fjord, a traditional red fishing cabin with warm light in windows, Northern Lights aurora borealis in green and purple ribbons, long exposure silky water, National Geographic quality, no text|16:9|$COVER1"
  "pm-21-abstract-art|A mesmerizing abstract fluid art composition, swirling ribbons of liquid gold, deep sapphire blue, and iridescent pearl white flowing and intertwining, microscopic cell-like structures forming at boundaries, tiny bubble formations catching light, suggesting cosmic nebulae, extremely detailed textures, gallery art quality, no text|1:1|$COVER1"
  "pm-22-childrens-book|A whimsical children book illustration of a cozy woodland library inside a giant hollow oak tree, tiny forest animals — a fox cub with spectacles, a hedgehog in a sweater, and a rabbit in overalls — reading a storybook on mushroom stools, bookshelves in tree walls, warm golden lantern light, fireflies, starry night, watercolor texture, no text|16:9|$COVER1"
  "pm-23-pet-portrait|A regal studio portrait of a golden retriever wearing a Renaissance-era velvet collar with gold medallion, seated against a painterly backdrop of deep burgundy and forest green, looking nobly to the side, soft Rembrandt lighting highlighting golden fur, oil painting meets photography style, no text|1:1|$COVER1"
  "pm-24-vintage-retro|A nostalgic 1970s photograph of a vintage Volkswagen camper van in two-tone orange and cream at a California beach sunset, surfboards leaning against the side, a couple on a plaid blanket with a record player and vinyl records, palm trees silhouetted, warm analog film grain and light leaks, Kodak Portra vibes, no text|16:9|$COVER1"
  "pm-25-3d-mockup|Three floating 3D product renders of premium wireless earbuds in midnight black, arctic white, and sunset coral, each partially out of their matching charging cases, suspended against a clean gradient background, soft studio lighting with subtle colored reflections, Apple product photography style, Octane render, no text|16:9|$COVER1"
  # Covers 26-40
  "pm-28-wedding-photo|Golden hour photograph of a couple silhouetted against sunset in a lavender field, flowing veil in wind, warm backlit light, bokeh background, romantic wedding photography, no text|16:9|$COVER2"
  "pm-29-isometric-3d|Isometric 3D illustration of a cozy coffee shop interior, tiny people at tables, large windows with rain outside, steam from cups, bookshelves, potted plants, pastel colors, miniature diorama style, no text|1:1|$COVER2"
  "pm-30-dark-fantasy|Epic dark fantasy digital painting of an ancient dragon perched on a crumbling gothic cathedral tower during a thunderstorm, lightning illuminating its scales, dark purple and crimson sky, medieval city burning below, volumetric fog, hyper-detailed, no text|16:9|$COVER2"
  "pm-31-underwater|Stunning underwater photograph of a coral reef ecosystem, schools of tropical fish swimming through crystal clear turquoise water, sunbeams penetrating the surface creating caustic light patterns, vibrant coral in orange pink and purple, no text|16:9|$COVER2"
  "pm-32-street-photo|Atmospheric street photography in Tokyo at night, a narrow alley with traditional izakaya lanterns glowing warm orange, wet cobblestones reflecting lights, a bicycle parked against the wall, steam from a ramen shop, moody cinematic lighting, no text|9:16|$COVER2"
  "pm-33-macro|Extreme macro photograph of morning dew drops on a spider web, each droplet reflecting the sunrise, delicate silk threads catching golden light, dark blurred background with bokeh circles, no text|1:1|$COVER2"
  "pm-34-flat-design|Modern flat design illustration for a tech startup, showing a person working on a laptop surrounded by floating UI elements, charts, and notification bubbles, gradient purple to blue background, clean geometric shapes, Dribbble trending style, no text|16:9|$COVER2"
  "pm-35-cinematic-portrait|Cinematic portrait of an elderly craftsman in his woodworking workshop, warm afternoon light streaming through a dusty window, wood shavings in the air catching light, weathered hands holding a hand plane, shallow depth of field, no text|9:16|$COVER2"
  "pm-36-pixel-art|Detailed pixel art scene of a fantasy RPG town at sunset, colorful buildings with thatched roofs, a market square with tiny pixel characters, a grand castle on a hill, cherry blossom trees lining the road, 32-bit era style, warm golden lighting, no text|16:9|$COVER2"
  "pm-37-botanical|Elegant botanical scientific illustration of a blooming orchid plant, showing the full plant with roots stems leaves and flowers in various stages of bloom, detailed cross-section, vintage hand-painted watercolor style on cream parchment paper, no text|9:16|$COVER2"
  "pm-38-sports-action|Dynamic sports action photograph of a basketball player mid-dunk, frozen in mid-air with arena lights creating dramatic rim lighting, sweat droplets suspended, motion blur on the crowd, wide aperture, arena atmosphere, no text|16:9|$COVER2"
  "pm-39-stained-glass|Intricate stained glass window design depicting a magical forest scene with a majestic white stag in a moonlit clearing, surrounded by ancient oak trees, fireflies as glowing amber glass pieces, cobalt blue night sky with silver stars, backlit by warm sunlight, no text|9:16|$COVER2"
  "pm-40-tilt-shift|Tilt-shift miniature effect photograph of a bustling European harbor town, making it look like a tiny model village, colorful fishing boats in the marina, terracotta rooftops, a lighthouse at the harbor entrance, extreme shallow depth of field, saturated vibrant colors, no text|16:9|$COVER2"
  # Examples 01-15
  "ex-02-dark-dessert|Dark moody food photography of a chocolate lava cake on a matte black plate, molten chocolate flowing from center, vanilla ice cream melting beside it, cocoa powder dusting and gold leaf garnish, dark wood table, single warm directional light, deep shadows, no text|1:1|$EXAMPLE1"
  "ex-03-wabisabi-bathroom|A serene Japanese wabi-sabi bathroom, a deep oval stone soaking tub filled with steaming water, floor-to-ceiling window looking at a bamboo garden, natural stone floor with river pebbles, wooden stool with folded towels, dried eucalyptus hanging, soft natural light, no text|9:16|$EXAMPLE1"
  "ex-04-streetwear|Urban streetwear editorial, a young model in an oversized vintage-washed denim jacket with bold embroidered tiger back patch, wide-leg cargo pants, chunky platform boots, standing on a fire escape in a gritty alley with morning fog, harsh flash photography, raw street energy, no text|9:16|$EXAMPLE1"
  "ex-05-paladin-turnaround|Professional game character turnaround reference sheet showing a female holy paladin knight in ornate white and gold plate armor with a royal blue cape, displayed in 6 views on neutral gray background: front, back, left, right, combat stance, and kneeling prayer, concept art character sheet, no text|16:9|$EXAMPLE1"
  "ex-06-brutalist-museum|Award-winning brutalist museum architecture, a monumental raw concrete building with dramatic cantilevers and deep geometric recesses, monumental staircase, reflecting pool in the forecourt, a single person on the stairs for scale, overcast sky, Tadao Ando aesthetic, no text|16:9|$EXAMPLE1"
  "ex-07-noir-detective|A cinematic film noir still, a detective in a trench coat and fedora under a single flickering street lamp on a rain-soaked cobblestone street at midnight, cigarette smoke curling into light, neon reflections on wet pavement, venetian blind shadow on face, Roger Deakins lighting, no text|16:9|$EXAMPLE1"
  "ex-08-space-station|Interior of a massive rotating space station observation deck, curved floor with lush hydroponic gardens, floor-to-ceiling windows revealing Earth and stars slowly rotating, warm artificial sunlight mixing with blue Earth glow, people walking on paths, a cafe area, futuristic aesthetic, no text|16:9|$EXAMPLE1"
  "ex-09-anime-battle|Dynamic anime battle scene, two sword fighters clashing mid-air above a destroyed temple during a thunderstorm, one in crimson armor with flame katana, other in ice-blue robes with crystal blade, lightning bolt at moment of impact, shockwave energy ring, Ufotable quality, no text|16:9|$EXAMPLE1"
  "ex-10-ceo-portrait|Environmental editorial portrait of a confident tech CEO in a tailored navy suit, standing in a modern glass office atrium, arms crossed, looking at camera, natural light from glass ceiling creating rim lighting, blurred office activity in background, Forbes cover quality, no text|9:16|$EXAMPLE1"
  "ex-11-motorcycle|A futuristic electric motorcycle concept in matte gunmetal gray with copper accents, hubless rear wheel, minimalist OLED instrument cluster, LED light strip from headlight to tail, parked on a rooftop helipad at dusk with city skyline, wet surface reflecting lights, low dramatic angle, no text|16:9|$EXAMPLE1"
  "ex-12-coffee-brand|A premium coffee brand identity mockup, showing a minimal line-art logo of a mountain with rising steam, displayed on kraft paper coffee bag, ceramic takeaway cup, rubber stamp impression, and embossed business card, on dark wood with scattered coffee beans, warm lighting, no text outside logo|1:1|$EXAMPLE1"
  "ex-13-iceland-volcanic|An otherworldly Iceland landscape, a river of glowing orange lava flowing through a black basalt field, steam and gases rising, Milky Way visible in dark sky, green moss-covered lava rocks in foreground, long exposure smooth lava flow, midnight shot, National Geographic quality, no text|16:9|$EXAMPLE1"
  "ex-14-macro-crystal|Extreme macro photograph of a bismuth crystal formation, iridescent staircase-like geometric structures in vivid rainbow colors — electric blue, magenta, gold, and teal — each terrace reflecting light differently, shallow depth of field with creamy bokeh, abstract art meets science, no text|1:1|$EXAMPLE1"
  "ex-15-headphone-render|A premium 3D product render of over-ear wireless headphones in brushed titanium with cognac leather ear cushions, one ear cup rotated to show driver detail, floating against warm gradient background from cream to soft peach, subtle colored reflections, leather carrying case in background, Octane render, no text|16:9|$EXAMPLE1"
  # Examples 26-40
  "ex-26-autumn-lake|Aerial view looking down at a mountain lake surrounded by autumn forest, golden orange trees reflected in still water, small wooden dock with red canoe, morning mist, drone photography, no text|16:9|$EXAMPLE2"
  "ex-27-neon-alley|Cyberpunk back alley with holographic advertisements, ramen vendor stall with steam and neon glow, puddles reflecting blue and magenta lights, dystopian future aesthetic, no text|9:16|$EXAMPLE2"
  "ex-29-isometric-room|Cute isometric 3D illustration of a home office room, tiny desk with dual monitors, a cat sleeping on a beanbag, plants on floating shelves, warm lamp lighting, soft pastel colors, miniature diorama, no text|1:1|$EXAMPLE2"
  "ex-36-pixel-dungeon|Detailed pixel art scene of a fantasy dungeon interior, ancient stone walls with glowing rune carvings, treasure chests and scattered gold coins, a pixel art hero facing a dragon boss, torchlight casting flickering shadows, 16-bit RPG style, no text|16:9|$EXAMPLE2"
  "ex-38-soccer|Dynamic sports photography of a soccer player performing a bicycle kick in a packed stadium at night, frozen in mid-air, floodlights creating dramatic backlight, grass particles flying, no text|16:9|$EXAMPLE2"
)

echo "═══════════════════════════════════════════════════"
echo "  RETRY FAILED — Batches of 5 — $(date)"
echo "  Total to retry: ${#ITEMS[@]}"
echo "═══════════════════════════════════════════════════"

OK=0; FAIL=0; SKIP=0; TOTAL=0
BATCH_SIZE=5
PIDS=()

flush_batch() {
  if [[ ${#PIDS[@]} -gt 0 ]]; then
    wait "${PIDS[@]}" 2>/dev/null
    PIDS=()
    echo "  --- batch done, pausing 3s ---"
    sleep 3
  fi
}

for item in "${ITEMS[@]}"; do
  IFS='|' read -r NAME PROMPT RATIO OUTFILE <<< "$item"

  # Check log — skip if already succeeded
  if [[ -f "$LOGDIR/${NAME}.log" ]]; then
    RESULT=$(cat "$LOGDIR/${NAME}.log")
    if [[ "$RESULT" == https://* || "$RESULT" == "SKIP" ]]; then
      echo "  ⏭️  $NAME: already done"
      ((SKIP++)); ((TOTAL++))
      continue
    fi
  fi

  worker "$NAME" "$PROMPT" "$RATIO" "$OUTFILE" &
  PIDS+=($!)
  ((TOTAL++))

  if [[ ${#PIDS[@]} -ge $BATCH_SIZE ]]; then
    flush_batch
  fi
done

flush_batch

# Update map files from logs
echo ""
echo "Updating map files..."

for item in "${ITEMS[@]}"; do
  IFS='|' read -r NAME PROMPT RATIO OUTFILE <<< "$item"
  LOG="$LOGDIR/${NAME}.log"
  [[ ! -f "$LOG" ]] && continue
  RESULT=$(cat "$LOG")
  if [[ "$RESULT" == https://* ]]; then
    ((OK++))
    sed -i '' "/^${NAME}|/d" "$OUTFILE" 2>/dev/null || true
    echo "${NAME}|${RESULT}" >> "$OUTFILE"
  elif [[ "$RESULT" == "SKIP" ]]; then
    : # already counted
  else
    ((FAIL++))
    sed -i '' "/^${NAME}|/d" "$OUTFILE" 2>/dev/null || true
    echo "${NAME}|FAILED" >> "$OUTFILE"
  fi
done

echo ""
echo "═══════════════════════════════════════════════════"
echo "  RETRY DONE!"
echo "  New success: $OK | Still failed: $FAIL | Skipped: $SKIP"
echo "  Total processed: $TOTAL"
echo "═══════════════════════════════════════════════════"
