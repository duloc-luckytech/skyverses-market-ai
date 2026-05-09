#!/bin/bash
# ══════════════════════════════════════════════════════════════
# Retry script for all failed assets:
#   - 4 Veo3 videos (403 recaptcha/rate limit)
#   - 5 Banana Pro images (content filter)
# ══════════════════════════════════════════════════════════════

IMG_API="https://api.skyverses.com/api-client/external/image-task"
VID_API="https://api.skyverses.com/api-client/external/video-task"
EXPLORER_API="https://api.skyverses.com/explorer"
TOKEN="Bearer skv_cbb360d3c039ffb0ebb494e8536a9730a9faa4acde25d44be11a8087b65a230b"
EXPLORER_TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3Nzc5NjIyNTksImV4cCI6MTc3ODU2NzA1OX0.zaXcxMq8jNYmrrNRm-MiL6mla233xnn5N3ARokDr-nk"

# Available refs from Phase 1
REF_MAP_FILE="/tmp/veo3_ref_map.txt"
get_img() {
  local key="$1"
  grep "^${key}|" "$REF_MAP_FILE" | head -1 | cut -d'|' -f2
}

# ══════════════════════════════════════════════════════════════
# PART A: 5 Failed Banana Pro Images (softer prompts, round 2)
# ══════════════════════════════════════════════════════════════

declare -a IMG_NAMES
declare -a IMG_PROMPTS
declare -a IMG_PRODUCTS
declare -a IMG_TAGS
declare -a IMG_RATIOS

# bp-kora-hero — peaceful hero portrait instead of action
IMG_NAMES+=("bp-kora-hero")
IMG_PROMPTS+=("Portrait of a young anime-style jungle adventurer girl with wild green hair adorned with tropical leaves, wearing ornate tribal armor with natural bone and wood decorations, standing proudly on a cliff overlooking a vast misty jungle valley, golden sunrise behind her, friendly giant panda companion sitting beside her, lush exotic flowers and hanging vines framing the scene, Studio Ghibli meets Unreal Engine 5, warm inviting atmosphere, game key art quality")
IMG_PRODUCTS+=("KORA — Bone Tribe Warrior")
IMG_TAGS+=("showcase,banana-pro,game,character,hero")
IMG_RATIOS+=("16:9")

# bp-kora-environment — pure landscape, no totems
IMG_NAMES+=("bp-kora-environment")
IMG_PROMPTS+=("Breathtaking tropical jungle environment concept art for a fantasy game, ancient moss-covered stone temple ruins with ornate carvings, a serene clearing with a small campfire, massive banyan tree roots creating natural arches, bioluminescent plants and mushrooms glowing in dappled shade, a crystal-clear waterfall cascading into a turquoise pool, volumetric god rays through dense canopy, exotic birds perched in flowering trees, Unreal Engine 5 environment art, cinematic wide shot")
IMG_PRODUCTS+=("KORA — Bone Tribe Warrior")
IMG_TAGS+=("showcase,banana-pro,game,environment,jungle")
IMG_RATIOS+=("16:9")

# bp-zero-pilot — simpler pilot portrait
IMG_NAMES+=("bp-zero-pilot")
IMG_PROMPTS+=("Full-body character render of a confident young male pilot in a futuristic white and crimson flight suit with black accent panels, short silver hair, slight smirk, standing in a relaxed pose with one hand on hip, the suit has glowing blue status indicators on the chest panel and subtle panel lines, soft professional studio lighting with rim light, clean neutral gradient background, anime-influenced proportions with high-quality 3D rendering, game character showcase style, 4K")
IMG_PRODUCTS+=("ZERO — Ghost Frame Operator")
IMG_TAGS+=("showcase,banana-pro,game,character,pilot")
IMG_RATIOS+=("1:1")

# bp-viper-hero — elegant spy in the city, no weapons
IMG_NAMES+=("bp-viper-hero")
IMG_PROMPTS+=("Cinematic portrait of an elegant female intelligence agent in a sleek dark outfit walking through a neon-lit Tokyo intersection at night, rain creating beautiful reflections on the wet crosswalk, she looks over her shoulder with a mysterious smile, long dark hair flowing, colorful neon signs and city lights creating a vibrant bokeh background, teal and magenta color palette, anamorphic lens flare, stylish spy thriller atmosphere, photorealistic Hollywood quality, 4K widescreen")
IMG_PRODUCTS+=("VIPER — Shadow Protocol Agent")
IMG_TAGS+=("showcase,banana-pro,action,movie,character")
IMG_RATIOS+=("16:9")

# bp-viper-weapons → renamed to bp-viper-gadgets, tech equipment only
IMG_NAMES+=("bp-viper-weapons")
IMG_PROMPTS+=("Elegant collection of high-tech spy equipment displayed on a dark velvet surface with dramatic lighting: a sleek encrypted smartphone with holographic display projection, compact smart glasses with heads-up display overlay, miniature surveillance drone with folded rotors, advanced lockpick multitool set, magnetic climbing gloves with grip pads, a tiny earpiece communicator, USB data device with glowing LED, each item individually lit with soft reflections, luxury tech product photography style, 4K")
IMG_PRODUCTS+=("VIPER — Shadow Protocol Agent")
IMG_TAGS+=("showcase,banana-pro,action,movie,gadgets")
IMG_RATIOS+=("1:1")

echo "════════════════════════════════════════════"
echo "  PART A: Retrying 5 Banana Pro images"
echo "════════════════════════════════════════════"

IMG_JOBIDS=()
for i in "${!IMG_NAMES[@]}"; do
  P="${IMG_PROMPTS[$i]}"
  P_ESC=$(echo "$P" | sed 's/"/\\"/g')
  AR="${IMG_RATIOS[$i]}"
  R=$(curl -s -X POST "$IMG_API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"prompt\":\"$P_ESC\",\"aspectRatio\":\"$AR\",\"engine\":{\"provider\":\"fxflow\",\"model\":\"google_image_gen_4_5\"}}")
  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  IMG_JOBIDS+=("$JID")
  echo "  [$((i+1))/${#IMG_NAMES[@]}] ${IMG_NAMES[$i]} → $JID"
  sleep 1
done

echo ""
echo "⏳ Polling image results..."
IMG_RESULTS="/tmp/showcase_retry_img_results.txt"
> "$IMG_RESULTS"

for i in "${!IMG_NAMES[@]}"; do
  JID="${IMG_JOBIDS[$i]}"
  NAME="${IMG_NAMES[$i]}"
  PRODUCT="${IMG_PRODUCTS[$i]}"
  PROMPT="${IMG_PROMPTS[$i]}"
  TAGS="${IMG_TAGS[$i]}"
  [ -z "$JID" ] && echo "❌ $NAME: no job ID" && continue

  for attempt in $(seq 1 60); do
    sleep 5
    SR=$(curl -s "$IMG_API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "✅ $NAME → $URL"
      echo "$NAME|$URL|$PRODUCT" >> "$IMG_RESULTS"

      PROMPT_ESC=$(echo "$PROMPT" | sed 's/"/\\"/g')
      IFS=',' read -ra TAG_ARR <<< "$TAGS"
      TAG_JSON=$(printf '"%s",' "${TAG_ARR[@]}")
      TAG_JSON="[${TAG_JSON%,}]"
      EXPLORER_BODY="{\"title\":\"$PRODUCT — $(echo $NAME | sed 's/bp-//g')\",\"type\":\"image\",\"prompt\":\"$PROMPT_ESC\",\"thumbnailUrl\":\"$URL\",\"mediaUrl\":\"$URL\",\"model\":\"google_image_gen_4_5\",\"tags\":$TAG_JSON,\"categories\":[\"showcase\",\"banana-pro\"],\"status\":\"published\"}"
      curl -s -X POST "$EXPLORER_API" -H "Content-Type: application/json" -H "Authorization: $EXPLORER_TOKEN" -d "$EXPLORER_BODY" > /dev/null
      echo "  📋 Saved to Explorer"
      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      echo "❌ $NAME FAILED"
      break
    else
      printf "  ⏳ %s: %s (%d/60)\r" "$NAME" "$ST" "$attempt"
    fi
  done
done

echo ""
echo "Image retry results: $(wc -l < "$IMG_RESULTS" | tr -d ' ')/5"

# ══════════════════════════════════════════════════════════════
# PART B: 4 Failed Veo3 Videos (rate limited — just retry)
# ══════════════════════════════════════════════════════════════

echo ""
echo "════════════════════════════════════════════"
echo "  PART B: Retrying 4 Veo3 videos"
echo "════════════════════════════════════════════"

declare -a VID_NAMES
declare -a VID_TYPES
declare -a VID_PROMPTS
declare -a VID_PRODUCTS
declare -a VID_TAGS
declare -a VID_REFS

# veo3-kora-combat (ingredient — needs bp-kora-hero, bp-kora-turnaround, bp-kora-3d)
VID_NAMES+=("veo3-kora-combat")
VID_TYPES+=("ingredient")
VID_PROMPTS+=("Dynamic tracking shot following a young jungle warrior girl with green hair and bone armor as she charges toward a giant panda creature in a forest clearing, she swings her massive bone club in a wide arc, the panda blocks and roars, she rolls under a counterswipe and strikes upward sending leaves and debris exploding, camera circles them during the clash, sunlight flashing through canopy. Audio: heavy club impacts, panda roar, battle cry, intense tribal percussion. No subtitles.")
VID_PRODUCTS+=("KORA — Bone Tribe Warrior Trailer")
VID_TAGS+=("showcase,veo3,game,character,action,trailer")
VID_REFS+=("bp-kora-turnaround")

# veo3-zero-launch (image-to-video — needs bp-zero-hero)
VID_NAMES+=("veo3-zero-launch")
VID_TYPES+=("image-to-video")
VID_PROMPTS+=("Dramatic vertical tracking shot of a white and crimson bipedal mech launching from underground hangar, hydraulic clamps releasing with steam, the mech rises through armored blast doors opening in sequence, camera follows from below as it emerges into rain-soaked night cityscape, thrusters ignite with blue flame as it takes a thundering step onto cracked asphalt. Audio: hydraulic hiss, blast doors grinding, klaxon alarm, rain on metal, booming footfall, jet engine whine. No subtitles.")
VID_PRODUCTS+=("ZERO — Ghost Frame Trailer")
VID_TAGS+=("showcase,veo3,game,mech,action,trailer")
VID_REFS+=("bp-zero-hero")

# veo3-zero-cockpit (image-to-video — needs bp-zero-cockpit)
VID_NAMES+=("veo3-zero-cockpit")
VID_TYPES+=("image-to-video")
VID_PROMPTS+=("Interior cockpit POV from the pilot perspective inside a giant mech, holographic HUD with radar and navigation displays, pilot gloved hands grip control sticks, through rain-streaked windshield a massive enemy mech approaches in the distance, pilot activates boost thrusters and the mech accelerates forward through the rain, buildings blur past on either side. Audio: cockpit hum, rain on glass, warning chimes, tense breathing, thruster ignition, muffled thunder, calm AI voice saying systems online. No subtitles.")
VID_PRODUCTS+=("ZERO — Ghost Frame Trailer")
VID_TAGS+=("showcase,veo3,game,mech,cockpit,trailer")
VID_REFS+=("bp-zero-cockpit")

# veo3-viper-fight (ingredient — needs bp-viper-hero, bp-viper-turnaround)
# Softened: changed from elevator fight to chase/escape scene
VID_NAMES+=("veo3-viper-fight")
VID_TYPES+=("text-to-video")
VID_PROMPTS+=("Cinematic chase sequence through a neon-lit Tokyo back alley at night, a female agent in black tactical suit sprints through narrow corridors between buildings, she parkour-vaults over a metal railing, slides under a closing shutter door with inches to spare, rolls and keeps running, camera follows in smooth Steadicam behind her, rain splashing, neon signs blurring, she reaches a motorcycle and speeds away into traffic. Audio: rapid footsteps on wet concrete, heavy breathing, metal clanging, motorcycle engine roar, rain, electronic score. No subtitles.")
VID_PRODUCTS+=("VIPER — Shadow Protocol Trailer")
VID_TAGS+=("showcase,veo3,action,movie,chase,trailer")
VID_REFS+=("")

VID_JOBIDS=()
for i in "${!VID_NAMES[@]}"; do
  NAME="${VID_NAMES[$i]}"
  TYPE="${VID_TYPES[$i]}"
  P="${VID_PROMPTS[$i]}"
  P_ESC=$(echo "$P" | sed 's/"/\\"/g')
  REFS="${VID_REFS[$i]}"

  # Resolve refs
  IMG_URLS=()
  if [ -n "$REFS" ] && [ "$TYPE" != "text-to-video" ]; then
    IFS='|' read -ra RN_ARR <<< "$REFS"
    for rn in "${RN_ARR[@]}"; do
      url=$(get_img "$rn")
      [ -n "$url" ] && IMG_URLS+=("$url")
    done
    if [ ${#IMG_URLS[@]} -eq 0 ]; then
      echo "  FALLBACK: $NAME → text-to-video"
      TYPE="text-to-video"
    fi
  fi

  ENGINE='"engine":{"provider":"fxflow","model":"veo_3_generate"}'
  BASE="\"type\":\"$TYPE\",\"prompt\":\"$P_ESC\",\"duration\":5,\"aspectRatio\":\"16:9\",\"resolution\":\"720p\",\"mode\":\"relaxed\",$ENGINE"

  case "$TYPE" in
    text-to-video) PAYLOAD="{$BASE}" ;;
    image-to-video) PAYLOAD="{$BASE,\"startImage\":\"${IMG_URLS[0]}\"}" ;;
    ingredient)
      IMGS_JSON=""
      for idx in "${!IMG_URLS[@]}"; do
        [ "$idx" -ge 3 ] && break
        [ -n "$IMGS_JSON" ] && IMGS_JSON="$IMGS_JSON,"
        IMGS_JSON="$IMGS_JSON\"${IMG_URLS[$idx]}\""
      done
      PAYLOAD="{$BASE,\"images\":[$IMGS_JSON]}" ;;
  esac

  R=$(curl -s -X POST "$VID_API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "$PAYLOAD")
  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  VID_JOBIDS+=("$JID")

  case "$TYPE" in
    text-to-video) BADGE="TXT" ;;
    image-to-video) BADGE="IMG" ;;
    ingredient) BADGE="ING" ;;
  esac
  echo "  [$((i+1))/${#VID_NAMES[@]}] [$BADGE] $NAME → $JID"
  sleep 3
done

echo ""
echo "⏳ Polling video results (up to 20 min)..."
VID_RESULTS="/tmp/showcase_retry_vid_results.txt"
> "$VID_RESULTS"

for i in "${!VID_NAMES[@]}"; do
  JID="${VID_JOBIDS[$i]}"
  NAME="${VID_NAMES[$i]}"
  TYPE="${VID_TYPES[$i]}"
  PRODUCT="${VID_PRODUCTS[$i]}"
  PROMPT="${VID_PROMPTS[$i]}"
  TAGS="${VID_TAGS[$i]}"
  [ -z "$JID" ] && echo "  $NAME: no job ID" && continue

  for attempt in $(seq 1 120); do
    sleep 10
    SR=$(curl -s "$VID_API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']['result']; print(d.get('videoUrl',''))" 2>/dev/null)
      THUMB=$(echo "$SR" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']['result']; print(d.get('thumbnailUrl',''))" 2>/dev/null)
      echo "✅ $NAME [$TYPE] → $URL"
      echo "$NAME|$URL|$THUMB|$PRODUCT|$TYPE" >> "$VID_RESULTS"

      PROMPT_ESC=$(echo "$PROMPT" | sed 's/"/\\"/g')
      IFS=',' read -ra TAG_ARR <<< "$TAGS"
      TAG_JSON=$(printf '"%s",' "${TAG_ARR[@]}")
      TAG_JSON="[${TAG_JSON%,}]"
      EXPLORER_BODY="{\"title\":\"$PRODUCT — $(echo $NAME | sed 's/veo3-//g')\",\"type\":\"video\",\"prompt\":\"$PROMPT_ESC\",\"thumbnailUrl\":\"$THUMB\",\"mediaUrl\":\"$URL\",\"model\":\"veo_3_generate\",\"tags\":$TAG_JSON,\"categories\":[\"showcase\",\"veo3\"],\"status\":\"published\"}"
      curl -s -X POST "$EXPLORER_API" -H "Content-Type: application/json" -H "Authorization: $EXPLORER_TOKEN" -d "$EXPLORER_BODY" > /dev/null
      echo "  📋 Saved to Explorer"
      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      ERR=$(echo "$SR" | python3 -c "import sys,json; e=json.load(sys.stdin)['data'].get('error',{}); print(e.get('userMessage','unknown'))" 2>/dev/null)
      echo "❌ $NAME FAILED: $ERR"
      break
    else
      printf "  ⏳ %s: %s (%d/120)\r" "$NAME" "$ST" "$attempt"
    fi
  done
done

echo ""
echo "════════════════════════════════════════════"
echo "  FINAL SUMMARY"
echo "════════════════════════════════════════════"
echo "Images: $(wc -l < "$IMG_RESULTS" | tr -d ' ')/5"
echo "Videos: $(wc -l < "$VID_RESULTS" | tr -d ' ')/4"
echo ""
echo "Append results:"
echo "  cat $IMG_RESULTS >> /tmp/showcase_banana_pro_v3_results.txt"
echo "  cat $VID_RESULTS >> /tmp/showcase_veo3_v4_results.txt"
