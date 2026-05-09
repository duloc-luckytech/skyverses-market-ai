#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# Fashion Videos — 11 branded fashion videos (Veo 3)
# image-to-video mode, using album images as startImage for brand consistency
# Each video animates an existing album photo into a cinematic fashion moment
# ═══════════════════════════════════════════════════════════════════════
VID_API="https://api.skyverses.com/api-client/external/video-task"
EXPLORER_API="https://api.skyverses.com/explorer"
TOKEN="Bearer skv_cbb360d3c039ffb0ebb494e8536a9730a9faa4acde25d44be11a8087b65a230b"
EXPLORER_TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3Nzc5NjIyNTksImV4cCI6MTc3ODU2NzA1OX0.zaXcxMq8jNYmrrNRm-MiL6mla233xnn5N3ARokDr-nk"

RESULTS_FILE="/tmp/fashion_videos_results.txt"
ALBUM_RESULTS="/tmp/fashion_albums_results.txt"
> "$RESULTS_FILE"

# ═══════════════════════════════════════════════════════════════════════
# Lookup function: get CDN URL from album results by image name
# ═══════════════════════════════════════════════════════════════════════
get_img() {
  local name="$1"
  grep "^${name}|" "$ALBUM_RESULTS" | head -1 | cut -d'|' -f2
}

declare -a NAMES
declare -a PROMPTS
declare -a PRODUCTS
declare -a CHARACTERS
declare -a TAGS_LIST
declare -a START_IMGS

# ═══════════════════════════════════════════════════════════════════════
# 1. MAISON ÉLARA — Haute Couture Runway Walk
# ═══════════════════════════════════════════════════════════════════════
NAMES+=("fashion-couture-walk")
START_IMGS+=("album-elara-gown")
PROMPTS+=("The model begins to walk forward on the baroque runway, her dramatic black silk gown flowing behind her creating mesmerizing ripples on the polished marble floor. Camera slowly tracks at ground level as crystal chandeliers sparkle above. Slow-motion, cinematic. Audio: elegant classical music, soft footsteps on marble, camera shutters clicking. No subtitles.")
PRODUCTS+=("MAISON ÉLARA — Runway Walk")
CHARACTERS+=("elara")
TAGS_LIST+=("showcase,fashion,couture,runway,elara")

# ═══════════════════════════════════════════════════════════════════════
# 2. MAISON ÉLARA — Atelier Craftsmanship
# ═══════════════════════════════════════════════════════════════════════
NAMES+=("fashion-couture-atelier")
START_IMGS+=("album-elara-atelier")
PROMPTS+=("The artisan's hands begin to move, embroidering gold thread onto the midnight black silk with precise needle strokes. Golden thread catches warm lamp light as the camera slowly pulls back to reveal the ornate atelier. Dust particles float in sunbeams through tall windows. Audio: thread pulling through fabric, ticking wall clock, delicate piano. No subtitles.")
PRODUCTS+=("MAISON ÉLARA — Atelier Craftsmanship")
CHARACTERS+=("elara")
TAGS_LIST+=("showcase,fashion,couture,atelier,elara")

# ═══════════════════════════════════════════════════════════════════════
# 3. NOIR TOKYO — Streetwear Night Scene
# ═══════════════════════════════════════════════════════════════════════
NAMES+=("fashion-street-walk")
START_IMGS+=("album-noir-night")
PROMPTS+=("The models start walking through the neon-lit Tokyo alley, their oversized hoodies and chunky platform sneakers splashing through rain puddles. Neon signs in Japanese kanji reflect on wet asphalt as they move with urban confidence. Camera tracks alongside them. Audio: lo-fi hip-hop beat, rain pattering, sneakers on wet concrete, puddle splashes. No subtitles.")
PRODUCTS+=("NOIR TOKYO — Night Walk")
CHARACTERS+=("noir-tokyo")
TAGS_LIST+=("showcase,fashion,streetwear,tokyo,noir-tokyo")

# ═══════════════════════════════════════════════════════════════════════
# 4. NOIR TOKYO — Street Crew
# ═══════════════════════════════════════════════════════════════════════
NAMES+=("fashion-street-crew")
START_IMGS+=("album-noir-crew")
PROMPTS+=("The street crew begins performing synchronized poses on the Tokyo rooftop, oversized jackets and layered accessories catching the wind as camera orbits around them in a smooth 180-degree arc. Each model strikes a confident pose with dramatic shadows against the city skyline at golden hour. Slow-motion. Audio: heavy bass beat drop, wind rushing, fabric rustling. No subtitles.")
PRODUCTS+=("NOIR TOKYO — Street Crew")
CHARACTERS+=("noir-tokyo")
TAGS_LIST+=("showcase,fashion,streetwear,crew,noir-tokyo")

# ═══════════════════════════════════════════════════════════════════════
# 5. ATELIER BLANC — Bridal Reveal
# ═══════════════════════════════════════════════════════════════════════
NAMES+=("fashion-runway-show")
START_IMGS+=("album-blanc-bride")
PROMPTS+=("The bride begins to walk through the arch of white roses, her flowing white haute couture wedding gown with delicate pearl embroidery catching golden hour backlighting. The long cathedral veil billows in a gentle breeze creating a translucent cloud around her. Dreamlike romantic atmosphere, slow-motion. Audio: gentle harp and string quartet, soft breeze through roses, birdsong. No subtitles.")
PRODUCTS+=("ATELIER BLANC — Bridal Reveal")
CHARACTERS+=("blanc")
TAGS_LIST+=("showcase,fashion,bridal,blanc,runway")

# ═══════════════════════════════════════════════════════════════════════
# 6. VOSS ACTIVE — Sportswear in Motion
# ═══════════════════════════════════════════════════════════════════════
NAMES+=("fashion-runway-finale")
START_IMGS+=("album-voss-run")
PROMPTS+=("The athlete explodes into a sprint across the minimalist white studio, camera tracks her at high speed in slow-motion capturing sweat droplets flying and electric blue performance fabric stretching with each stride. She leaps into a powerful mid-air pose, then lands gracefully. Audio: heartbeat building, explosive sprint sound, fabric stretching, dramatic bass drop, controlled breathing. No subtitles.")
PRODUCTS+=("VOSS ACTIVE — In Motion")
CHARACTERS+=("voss")
TAGS_LIST+=("showcase,fashion,sportswear,voss,active")

# ═══════════════════════════════════════════════════════════════════════
# 7. CASA VERANO — Resort Poolside
# ═══════════════════════════════════════════════════════════════════════
NAMES+=("fashion-accessories-reveal")
START_IMGS+=("album-verano-pool")
PROMPTS+=("The model begins walking along the infinity pool edge overlooking the Mediterranean coastline at golden hour, trailing her hand through turquoise water creating ripples. She turns and removes her sunglasses with a confident smile. Warm orange and teal color grading, luxury resort fashion aesthetic. Audio: gentle Mediterranean waves, pool water rippling, linen fabric in breeze, soft bossa nova guitar. No subtitles.")
PRODUCTS+=("CASA VERANO — Poolside")
CHARACTERS+=("verano")
TAGS_LIST+=("showcase,fashion,resort,verano,luxury")

# ═══════════════════════════════════════════════════════════════════════
# 8. CÔTE D'OR — Jewelry Campaign
# ═══════════════════════════════════════════════════════════════════════
NAMES+=("fashion-jewelry-campaign")
START_IMGS+=("album-cote-necklace")
PROMPTS+=("The model slowly turns her head and the facets of the emerald necklace catch the light, creating dancing green reflections across her skin. Camera glides from extreme close-up of the gold statement necklace to reveal the full look — dramatic chiaroscuro lighting against dark backdrop. Audio: delicate gold chain clinking, a single piano note resonating, subtle orchestral swell. No subtitles.")
PRODUCTS+=("CÔTE D'OR — Jewelry Campaign")
CHARACTERS+=("cote-dor")
TAGS_LIST+=("showcase,fashion,jewelry,cote-dor,luxury")

# ═══════════════════════════════════════════════════════════════════════
# 9. HERITAGE 1924 — Menswear Suiting
# ═══════════════════════════════════════════════════════════════════════
NAMES+=("fashion-editorial-wind")
START_IMGS+=("album-heritage-suit")
PROMPTS+=("The gentleman begins walking through the grand mahogany-paneled library, running his hand along leather-bound books, adjusting his cufflinks. He settles into a leather wingback chair crossing his legs with a confident demeanor. Warm golden light from a desk lamp, classic English gentleman aesthetic, cinematic anamorphic lens. Audio: polished shoes on hardwood, pages rustling, clock ticking, refined jazz piano. No subtitles.")
PRODUCTS+=("HERITAGE 1924 — Suiting Editorial")
CHARACTERS+=("heritage")
TAGS_LIST+=("showcase,fashion,menswear,heritage,editorial")

# ═══════════════════════════════════════════════════════════════════════
# 10. TERRA ECO — Sustainable Fashion
# ═══════════════════════════════════════════════════════════════════════
NAMES+=("fashion-editorial-noir")
START_IMGS+=("album-terra-hero")
PROMPTS+=("The scene comes alive as hands begin sorting organic cotton and hemp fabrics, camera gliding across natural dyes in ceramic bowls. A designer drapes an earth-toned linen dress, then the camera pulls back through an open window to show models wearing the collection walking barefoot through a wildflower meadow at golden hour. Documentary style. Audio: natural fabric sounds, birdsong, gentle breeze, acoustic folk guitar. No subtitles.")
PRODUCTS+=("TERRA ECO — Sustainable Story")
CHARACTERS+=("terra")
TAGS_LIST+=("showcase,fashion,sustainable,terra,eco")

# ═══════════════════════════════════════════════════════════════════════
# 11. STUDIO KURO — Avant-Garde Performance
# ═══════════════════════════════════════════════════════════════════════
NAMES+=("fashion-montage")
START_IMGS+=("album-kuro-sculpture")
PROMPTS+=("The model begins slow contemporary dance movements through the stark white gallery space, sculptural all-black deconstructed outfit with exaggerated asymmetric silhouettes billowing and creating dramatic shadows on the walls. Camera circles in a continuous orbit. Art installation meets fashion film. Audio: atmospheric electronic drone, echoing footsteps, fabric whooshing through air, sparse percussive hits. No subtitles.")
PRODUCTS+=("STUDIO KURO — Performance")
CHARACTERS+=("kuro")
TAGS_LIST+=("showcase,fashion,avant-garde,kuro,performance")

# ═══════════════════════════════════════════════════════════════════════
# SUBMIT VIDEO JOBS (image-to-video with startImage)
# ═══════════════════════════════════════════════════════════════════════

JOBIDS=()
TOTAL=${#NAMES[@]}
ENGINE='"engine":{"provider":"fxflow","model":"veo_3_generate"}'

echo "============================================="
echo "  Submitting $TOTAL fashion video jobs (Veo 3 — image-to-video)"
echo "============================================="
echo ""

for i in "${!NAMES[@]}"; do
  NAME="${NAMES[$i]}"
  P="${PROMPTS[$i]}"
  P_ESC=$(echo "$P" | sed 's/"/\\"/g')
  IMG_NAME="${START_IMGS[$i]}"
  IMG_URL=$(get_img "$IMG_NAME")

  if [ -z "$IMG_URL" ]; then
    echo "  ❌ [$((i+1))/$TOTAL] $NAME: startImage '$IMG_NAME' not found in $ALBUM_RESULTS"
    JOBIDS+=("")
    continue
  fi

  PAYLOAD="{\"type\":\"text-to-video\",\"prompt\":\"$P_ESC\",\"startImage\":\"$IMG_URL\",\"duration\":5,\"aspectRatio\":\"16:9\",\"resolution\":\"720p\",\"mode\":\"relaxed\",$ENGINE}"

  R=$(curl -s -X POST "$VID_API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "$PAYLOAD")
  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  JOBIDS+=("$JID")

  echo "  [$((i+1))/$TOTAL] $NAME (startImage: $IMG_NAME) → $JID"
  sleep 2
done

echo ""
echo "============================================="
echo "  Polling video results (timeout: 20min each)"
echo "============================================="

DONE=0
FAIL=0
OUT_DIR="/Users/duloc/Desktop/SKYVERSES/ai-skyverses/skyverses-market-ai/public/assets/showcase"

for i in "${!NAMES[@]}"; do
  JID="${JOBIDS[$i]}"
  NAME="${NAMES[$i]}"
  PRODUCT="${PRODUCTS[$i]}"
  CHARACTER="${CHARACTERS[$i]}"
  PROMPT="${PROMPTS[$i]}"
  TAGS="${TAGS_LIST[$i]}"

  [ -z "$JID" ] && echo "  ❌ $NAME: no job ID" && FAIL=$((FAIL+1)) && continue

  for attempt in $(seq 1 120); do
    sleep 10
    SR=$(curl -s "$VID_API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']['result']; print(d.get('videoUrl',''))" 2>/dev/null)
      THUMB=$(echo "$SR" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']['result']; print(d.get('thumbnailUrl',''))" 2>/dev/null)

      # Download video
      OUT_FILE="$OUT_DIR/$NAME.mp4"
      curl -s -L -o "$OUT_FILE" "$URL"
      FSIZE=$(wc -c < "$OUT_FILE" | tr -d ' ')
      echo "  ✅ $NAME → $OUT_FILE ($FSIZE bytes)"

      # Save result
      echo "$NAME|$URL|$THUMB|$PRODUCT|$CHARACTER" >> "$RESULTS_FILE"

      # Save to Explorer
      PROMPT_ESC=$(echo "$PROMPT" | sed 's/"/\\"/g')
      IFS=',' read -ra TAG_ARR <<< "$TAGS"
      TAG_JSON=$(printf '"%s",' "${TAG_ARR[@]}")
      TAG_JSON="[${TAG_JSON%,}]"

      EXPLORER_BODY="{\"title\":\"$PRODUCT\",\"type\":\"video\",\"prompt\":\"$PROMPT_ESC\",\"thumbnailUrl\":\"$THUMB\",\"mediaUrl\":\"$URL\",\"model\":\"veo_3_generate\",\"tags\":$TAG_JSON,\"categories\":[\"showcase\",\"fashion\"],\"status\":\"published\"}"

      curl -s -X POST "$EXPLORER_API" \
        -H "Content-Type: application/json" \
        -H "Authorization: $EXPLORER_TOKEN" \
        -d "$EXPLORER_BODY" > /dev/null

      DONE=$((DONE+1))
      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      ERR=$(echo "$SR" | python3 -c "import sys,json; e=json.load(sys.stdin)['data'].get('error',{}); print(e.get('userMessage','unknown'))" 2>/dev/null)
      echo "  ❌ $NAME FAILED: $ERR"
      FAIL=$((FAIL+1))
      break
    else
      printf "  ⏳ %s: %s (%d/120)\r" "$NAME" "$ST" "$attempt"
    fi
  done
done

echo ""
echo "=================================================="
echo "  DONE: $DONE/$TOTAL videos OK, $FAIL failed"
echo "  Results: $RESULTS_FILE"
echo "  Videos: $OUT_DIR"
echo "=================================================="
