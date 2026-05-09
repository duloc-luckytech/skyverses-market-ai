#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# Fashion Showcase — Mixed Images + Videos (fully self-contained)
# Phase 1: Generate reference images for fashion products
# Phase 2: Submit video jobs using generated reference URLs
# Phase 3: Poll results & save to Explorer
# ═══════════════════════════════════════════════════════════════════════
IMG_API="https://api.skyverses.com/api-client/external/image-task"
VID_API="https://api.skyverses.com/api-client/external/video-task"
EXPLORER_API="https://api.skyverses.com/explorer"
TOKEN="Bearer skv_cbb360d3c039ffb0ebb494e8536a9730a9faa4acde25d44be11a8087b65a230b"
# JWT token for Explorer API (update if expired)
EXPLORER_TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3Nzc5NjIyNTksImV4cCI6MTc3ODU2NzA1OX0.zaXcxMq8jNYmrrNRm-MiL6mla233xnn5N3ARokDr-nk"

REF_MAP_FILE="/tmp/fashion_ref_map.txt"
> "$REF_MAP_FILE"

# ═══════════════════════════════════════════════════════════════
# PHASE 1: Auto-generate reference images (also used as showcase images)
# ═══════════════════════════════════════════════════════════════
declare -a REF_NAMES
declare -a REF_PROMPTS
declare -a REF_RATIOS
declare -a REF_PRODUCTS
declare -a REF_TAGS

# ── HAUTE COUTURE EDITORIAL ──
REF_NAMES+=("fashion-couture-hero")
REF_PROMPTS+=("Haute couture editorial photograph, a striking model in an avant-garde sculptural black gown with dramatic pleated organza cape trailing behind, walking through an opulent gilded baroque palace hallway with chandeliers and mirrors, harsh directional lighting creating dramatic shadows, shot on Hasselblad H6D, Vogue Italia cover quality, fashion photography by Tim Walker, no text")
REF_RATIOS+=("9:16")
REF_PRODUCTS+=("Haute Couture — Editorial")
REF_TAGS+=("showcase,fashion,couture,editorial")

REF_NAMES+=("fashion-couture-detail")
REF_PROMPTS+=("Extreme macro close-up of haute couture garment details, intricate hand-sewn crystal beadwork on midnight blue silk fabric, each bead catching light differently creating a constellation effect, visible thread craftsmanship and fabric texture, shallow depth of field, studio lighting with warm gold rim light, luxury fashion detail photography, no text")
REF_RATIOS+=("1:1")
REF_PRODUCTS+=("Haute Couture — Editorial")
REF_TAGS+=("showcase,fashion,couture,detail")

REF_NAMES+=("fashion-couture-backstage")
REF_PROMPTS+=("Behind-the-scenes haute couture atelier workshop, an elderly seamstress with silver spectacles hand-stitching an elaborate wedding gown on a mannequin, surrounded by fabric swatches and sketches pinned to cork boards, golden afternoon light through tall arched windows, vintage sewing machines and thread spools in background, documentary fashion photography, intimate atmosphere, no text")
REF_RATIOS+=("16:9")
REF_PRODUCTS+=("Haute Couture — Editorial")
REF_TAGS+=("showcase,fashion,couture,backstage")

# ── RUNWAY SHOW ──
REF_NAMES+=("fashion-runway-hero")
REF_PROMPTS+=("High fashion runway photograph, a model in a futuristic metallic silver trench coat with holographic iridescent panels walking down a minimalist white catwalk, dramatic front-row audience silhouettes, professional runway lighting with strong spotlights from above, motion captured mid-stride, editorial fashion photography, Paris Fashion Week atmosphere, no text")
REF_RATIOS+=("9:16")
REF_PRODUCTS+=("Runway — Fashion Week")
REF_TAGS+=("showcase,fashion,runway,show")

REF_NAMES+=("fashion-runway-lineup")
REF_PROMPTS+=("Fashion show finale lineup, five models standing shoulder to shoulder at the end of a sleek black runway, each wearing a different look from the same collection in monochromatic earth tones ranging from sand to deep chocolate, cohesive design language with varying silhouettes from fitted to oversized, professional runway lighting, wide shot capturing the full lineup, fashion week editorial quality, no text")
REF_RATIOS+=("16:9")
REF_PRODUCTS+=("Runway — Fashion Week")
REF_TAGS+=("showcase,fashion,runway,lineup")

# ── STREETWEAR LOOKBOOK ──
REF_NAMES+=("fashion-street-hero")
REF_PROMPTS+=("Urban streetwear lookbook photograph, a young model in oversized vintage-washed denim jacket with bold embroidered patches, layered over a graphic hoodie, wide-leg cargo pants and chunky platform sneakers, leaning against a graffiti-covered concrete wall in a Tokyo back alley, golden hour light, shot on 35mm film grain, Hypebeast editorial quality, authentic street fashion, no text")
REF_RATIOS+=("9:16")
REF_PRODUCTS+=("Streetwear — Urban Lookbook")
REF_TAGS+=("showcase,fashion,streetwear,lookbook")

REF_NAMES+=("fashion-street-detail")
REF_PROMPTS+=("Flat lay arrangement of streetwear outfit components on a clean concrete surface, pristine white limited edition sneakers with gold accents at center, surrounded by accessories: chunky gold chain, vintage round sunglasses, beanie hat, leather cardholder, and a pair of patterned socks, everything arranged with precise spacing, overhead shot, soft diffused natural light, product photography meets editorial, no text")
REF_RATIOS+=("1:1")
REF_PRODUCTS+=("Streetwear — Urban Lookbook")
REF_TAGS+=("showcase,fashion,streetwear,flatlay")

REF_NAMES+=("fashion-street-group")
REF_PROMPTS+=("Group streetwear editorial photo, three young models in coordinated but individual urban outfits standing on a Tokyo pedestrian crossing at dusk, each with unique layering style combining oversized silhouettes with fitted elements, neon signs reflecting on wet pavement, cinematic street photography with shallow depth of field, authentic Gen-Z fashion energy, no text")
REF_RATIOS+=("16:9")
REF_PRODUCTS+=("Streetwear — Urban Lookbook")
REF_TAGS+=("showcase,fashion,streetwear,group")

# ── LUXURY ACCESSORIES ──
REF_NAMES+=("fashion-accessories-hero")
REF_PROMPTS+=("Luxury accessories still life, an exquisite leather handbag in deep burgundy crocodile embossed leather with gold hardware clasp, positioned on a marble surface beside a pair of matching stiletto heels and a silk scarf draped artfully, dramatic chiaroscuro lighting reminiscent of Dutch Golden Age paintings, premium product photography, no text")
REF_RATIOS+=("1:1")
REF_PRODUCTS+=("Luxury — Accessories Collection")
REF_TAGS+=("showcase,fashion,luxury,accessories")

REF_NAMES+=("fashion-accessories-jewelry")
REF_PROMPTS+=("High-end jewelry campaign photograph, a model's hand and neck adorned with layered gold statement necklaces and sculptural rings, the jewelry catching light with brilliant reflections, extreme close-up showing skin texture and metal craftsmanship, dark moody background with a single warm spotlight, luxury advertising quality similar to Cartier or Bulgari campaigns, no text")
REF_RATIOS+=("9:16")
REF_PRODUCTS+=("Luxury — Accessories Collection")
REF_TAGS+=("showcase,fashion,luxury,jewelry")

# ── FASHION FILM / EDITORIAL PHOTOGRAPHY ──
REF_NAMES+=("fashion-editorial-hero")
REF_PROMPTS+=("Cinematic fashion editorial photograph, a model in a flowing crimson silk dress standing on the edge of a dramatic cliff overlooking a stormy ocean at sunset, the dress and her hair billowing in the wind creating dynamic shapes, golden hour backlighting creating a glowing silhouette, epic landscape meets high fashion, shot on medium format, National Geographic meets Vogue quality, no text")
REF_RATIOS+=("16:9")
REF_PRODUCTS+=("Fashion Editorial — Cinematic")
REF_TAGS+=("showcase,fashion,editorial,cinematic")

REF_NAMES+=("fashion-editorial-noir")
REF_PROMPTS+=("Film noir inspired fashion portrait, a model in a tailored black blazer and wide-brim fedora hat, seated in a dimly lit vintage jazz bar, cigarette smoke curling through a single beam of amber light, dramatic shadows across the face, reflections in a glass of whiskey on the table, black and white with subtle warm toning, classic fashion noir aesthetic, no text")
REF_RATIOS+=("9:16")
REF_PRODUCTS+=("Fashion Editorial — Cinematic")
REF_TAGS+=("showcase,fashion,editorial,noir")

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

      # ── Save image to Explorer ──
      PRODUCT="${REF_PRODUCTS[$i]}"
      TAGS="${REF_TAGS[$i]}"
      PROMPT="${REF_PROMPTS[$i]}"
      PROMPT_ESC=$(echo "$PROMPT" | sed 's/"/\\"/g')
      IFS=',' read -ra TAG_ARR <<< "$TAGS"
      TAG_JSON=$(printf '"%s",' "${TAG_ARR[@]}")
      TAG_JSON="[${TAG_JSON%,}]"

      EXPLORER_BODY="{\"title\":\"$PRODUCT — $(echo $NAME | sed 's/fashion-//g')\",\"type\":\"image\",\"prompt\":\"$PROMPT_ESC\",\"thumbnailUrl\":\"$URL\",\"mediaUrl\":\"$URL\",\"model\":\"google_image_gen_4_5\",\"tags\":$TAG_JSON,\"categories\":[\"showcase\",\"fashion\"],\"status\":\"published\"}"

      EXPLORER_R=$(curl -s -X POST "$EXPLORER_API" \
        -H "Content-Type: application/json" \
        -H "Authorization: $EXPLORER_TOKEN" \
        -d "$EXPLORER_BODY")
      EXPLORER_ID=$(echo "$EXPLORER_R" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('_id','n/a'))" 2>/dev/null)
      echo "    Saved to Explorer: $EXPLORER_ID"

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
declare -a REF_IMAGES

# ═══════════════════════════════════════════════════════════════
# VIDEO 1: Haute Couture — Runway Walk
# ═══════════════════════════════════════════════════════════════

NAMES+=("fashion-couture-walk")
TYPES+=("image-to-video")
PROMPTS+=("Slow-motion haute couture runway walk, a model in an avant-garde sculptural black gown with dramatic pleated organza cape glides down a golden-lit baroque palace hallway, cape trailing and billowing majestically behind her, camera tracks alongside at waist height capturing the fabric movement and her commanding gaze, chandeliers sparkle overhead, each step deliberate and powerful. Audio: echoing heels on marble, soft orchestral strings, fabric rustling, camera shutters clicking. No subtitles.")
PRODUCTS+=("Haute Couture — Runway Film")
TAGS_LIST+=("showcase,fashion,couture,runway,film")
REF_IMAGES+=("fashion-couture-hero")

NAMES+=("fashion-couture-atelier")
TYPES+=("image-to-video")
PROMPTS+=("Intimate documentary-style scene inside a haute couture atelier, close-up of expert hands meticulously hand-stitching crystal beads onto midnight blue silk, camera slowly pulls back to reveal the full gown on a mannequin, the seamstress steps back to admire her work and gently adjusts the neckline, golden afternoon light shifts through tall windows, dust particles floating in the light. Audio: needle through fabric, soft breathing, clock ticking, distant piano, thread snipping. No subtitles.")
PRODUCTS+=("Haute Couture — Behind the Scenes")
TAGS_LIST+=("showcase,fashion,couture,atelier,documentary")
REF_IMAGES+=("fashion-couture-backstage")

# ═══════════════════════════════════════════════════════════════
# VIDEO 2: Runway Show — Fashion Week
# ═══════════════════════════════════════════════════════════════

NAMES+=("fashion-runway-show")
TYPES+=("image-to-video")
PROMPTS+=("Dynamic fashion show sequence, a model in a futuristic metallic silver trench coat with holographic panels strides confidently down a white catwalk, camera positioned at the end of the runway capturing her approach with each step, the coat catches light and shifts colors, she reaches the end, pauses with a sharp pose, pivots and walks back, audience phones flashing in the background. Audio: heavy bass-driven runway music, confident footsteps, camera shutters rapid-fire, audience murmur. No subtitles.")
PRODUCTS+=("Runway — Fashion Week Film")
TAGS_LIST+=("showcase,fashion,runway,show,film")
REF_IMAGES+=("fashion-runway-hero")

NAMES+=("fashion-runway-finale")
TYPES+=("ingredient")
PROMPTS+=("Fashion show grand finale, five models in coordinated earth-tone collection walk in formation down a sleek black runway, camera slowly tracks backward as they approach together, they reach the end and fan out into a V formation, the designer appears from behind and walks between them to take a bow, confetti begins to fall, audience stands and applauds, warm golden spotlights sweep across the scene. Audio: triumphant orchestral music, roaring applause, cheering, camera shutters, emotional crowd reactions. No subtitles.")
PRODUCTS+=("Runway — Fashion Week Film")
TAGS_LIST+=("showcase,fashion,runway,finale,film")
REF_IMAGES+=("fashion-runway-hero|fashion-runway-lineup")

# ═══════════════════════════════════════════════════════════════
# VIDEO 3: Streetwear — Urban Lookbook
# ═══════════════════════════════════════════════════════════════

NAMES+=("fashion-street-walk")
TYPES+=("image-to-video")
PROMPTS+=("Urban streetwear fashion film, a young model in oversized vintage denim jacket and chunky sneakers walks confidently through a neon-lit Tokyo alley at night, camera follows from a low angle tracking shot, they stop at a vending machine, the neon light illuminates the outfit details, they check their phone and continue walking with attitude, rain begins to drizzle creating reflections on the pavement. Audio: confident footsteps, city traffic, vending machine hum, rain beginning, lo-fi hip-hop beat. No subtitles.")
PRODUCTS+=("Streetwear — Urban Film")
TAGS_LIST+=("showcase,fashion,streetwear,urban,film")
REF_IMAGES+=("fashion-street-hero")

NAMES+=("fashion-street-crew")
TYPES+=("ingredient")
PROMPTS+=("Cinematic tracking shot of three models in coordinated streetwear outfits crossing a Tokyo pedestrian crossing at dusk, walking in sync with individual swagger, camera orbits around them as they reach the other side, they break formation and each strikes a different pose against neon-lit storefronts, rain-wet pavement reflects colorful signs, confident Gen-Z energy. Audio: city crosswalk signal, footsteps in sync, distant J-pop from a shop, skateboard rolling past, urban ambient beat. No subtitles.")
PRODUCTS+=("Streetwear — Urban Film")
TAGS_LIST+=("showcase,fashion,streetwear,group,film")
REF_IMAGES+=("fashion-street-hero|fashion-street-group|fashion-street-detail")

# ═══════════════════════════════════════════════════════════════
# VIDEO 4: Luxury Accessories — Product Film
# ═══════════════════════════════════════════════════════════════

NAMES+=("fashion-accessories-reveal")
TYPES+=("image-to-video")
PROMPTS+=("Luxury product reveal cinematography, a spotlight slowly illuminates a burgundy crocodile leather handbag on a marble pedestal, camera slowly orbits around it showing gold hardware details catching light, a model's hand enters frame and gently opens the clasp, the bag opens revealing silk interior, camera pushes in for extreme close-up of the embossed logo, dramatic chiaroscuro lighting. Audio: soft spotlight hum, leather creaking, clasp clicking open, elegant piano melody, subtle golden shimmer sound. No subtitles.")
PRODUCTS+=("Luxury Accessories — Product Film")
TAGS_LIST+=("showcase,fashion,luxury,accessories,product")
REF_IMAGES+=("fashion-accessories-hero")

NAMES+=("fashion-jewelry-campaign")
TYPES+=("image-to-video")
PROMPTS+=("Luxury jewelry campaign film, extreme close-up of a model slowly turning her head, layered gold statement necklaces shifting and catching light with brilliant reflections, camera follows the chain links in macro detail showing craftsmanship, she raises her hand revealing sculptural gold rings, fingers gracefully spread, light plays across metal surfaces, dark moody atmosphere with warm single spotlight. Audio: subtle metallic chime, soft breathing, elegant ambient music, golden shimmer effects. No subtitles.")
PRODUCTS+=("Luxury Accessories — Jewelry Campaign")
TAGS_LIST+=("showcase,fashion,luxury,jewelry,campaign")
REF_IMAGES+=("fashion-accessories-jewelry")

# ═══════════════════════════════════════════════════════════════
# VIDEO 5: Fashion Editorial — Cinematic
# ═══════════════════════════════════════════════════════════════

NAMES+=("fashion-editorial-wind")
TYPES+=("image-to-video")
PROMPTS+=("Epic cinematic fashion editorial, a model in a flowing crimson silk dress stands on a dramatic cliff edge overlooking a stormy ocean, the dress billows wildly in the wind creating stunning sculptural shapes, camera circles around her as golden sunset light breaks through storm clouds, waves crash against rocks below sending spray upward, hair and fabric in constant dramatic motion, National Geographic meets Vogue aesthetic. Audio: powerful wind, crashing waves, fabric whipping, distant thunder, soaring cinematic score. No subtitles.")
PRODUCTS+=("Fashion Editorial — Cinematic Film")
TAGS_LIST+=("showcase,fashion,editorial,cinematic,film")
REF_IMAGES+=("fashion-editorial-hero")

NAMES+=("fashion-editorial-noir")
TYPES+=("image-to-video")
PROMPTS+=("Film noir fashion short, camera slowly pushes in on a model in a tailored black blazer and wide-brim fedora seated in a dimly lit vintage jazz bar, cigarette smoke curling through a single beam of amber light, she slowly lifts a glass of whiskey and takes a sip, then looks directly at camera with a piercing gaze, jazz musicians visible in soft focus background, dramatic shadows shifting across her face. Audio: mellow jazz saxophone, ice clinking in glass, distant conversation, cigarette ember crackle, bar atmosphere. No subtitles.")
PRODUCTS+=("Fashion Editorial — Noir Film")
TAGS_LIST+=("showcase,fashion,editorial,noir,film")
REF_IMAGES+=("fashion-editorial-noir")

# ── Standalone text-to-video ──
NAMES+=("fashion-montage")
TYPES+=("text-to-video")
PROMPTS+=("Fast-paced fashion montage film with quick cuts between different looks: a model in a flowing white gown spinning in a marble atrium, cut to close-up of hands fastening a gold bracelet, cut to sneakers walking on wet pavement, cut to a tailor's scissors cutting through silk, cut to a model applying red lipstick in a mirror, cut to a runway finale with confetti falling, each shot lasting one second with rhythmic editing, high fashion meets music video aesthetic. Audio: pulsing electronic beat synchronizing with each cut, fabric sounds, footsteps, scissors, crowd cheering. No subtitles.")
PRODUCTS+=("Fashion — Montage Film")
TAGS_LIST+=("showcase,fashion,montage,editorial,film")
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
    IFS='|' read -ra REF_KEYS <<< "$REFS"
    for rn in "${REF_KEYS[@]}"; do
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

RESULTS_FILE="/tmp/showcase_fashion_results.txt"
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

      EXPLORER_BODY="{\"title\":\"$PRODUCT — $(echo $NAME | sed 's/fashion-//g')\",\"type\":\"video\",\"prompt\":\"$PROMPT_ESC\",\"thumbnailUrl\":\"$THUMB\",\"mediaUrl\":\"$URL\",\"model\":\"veo_3_generate\",\"tags\":$TAG_JSON,\"categories\":[\"showcase\",\"fashion\"],\"status\":\"published\"}"

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
echo "  All image results (from Phase 1):"
echo "================================================"
cat "$REF_MAP_FILE"
echo ""
echo "================================================"
echo "  All video results (from Phase 3):"
echo "================================================"
cat "$RESULTS_FILE"
echo ""
echo "Download images with:"
echo 'while IFS="|" read -r name url; do'
echo '  curl -L -o "public/assets/showcase/${name}.webp" "$url"'
echo 'done < /tmp/fashion_ref_map.txt'
echo ""
echo "Download videos with:"
echo 'while IFS="|" read -r name url thumb product type; do'
echo '  curl -L -o "public/assets/showcase/${name}.mp4" "$url"'
echo '  [ -n "$thumb" ] && curl -L -o "public/assets/showcase/${name}-thumb.webp" "$thumb"'
echo 'done < /tmp/showcase_fashion_results.txt'
