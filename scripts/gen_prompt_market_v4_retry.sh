#!/bin/bash
# Retry failed images + ALL videos (with corrected type: text-to-video)
set -euo pipefail

IMG_API="https://api.skyverses.com/api-client/external/image-task"
VID_API="https://api.skyverses.com/api-client/external/video-task"
TOKEN="Bearer ${SKYVERSES_EXTERNAL_API_TOKEN:?set SKYVERSES_EXTERNAL_API_TOKEN}"

COVER_FILE="/tmp/pm_v4extra_covers.txt"
EXAMPLE_FILE="/tmp/pm_v4extra_examples.txt"
VIDEO_FILE="/tmp/pm_v4extra_videos.txt"

# Remove FAILED entries so we can re-append
sed -i '' '/FAILED/d' "$COVER_FILE" 2>/dev/null || true
sed -i '' '/FAILED/d' "$EXAMPLE_FILE" 2>/dev/null || true
> "$VIDEO_FILE"

declare -a NAMES PROMPTS RATIOS TYPES

# ═══ RETRY FAILED COVERS (simplified prompts) ═══

NAMES+=("pm-26-drone-aerial"); TYPES+=("img"); RATIOS+=("16:9")
PROMPTS+=("Aerial drone photograph of a winding river through autumn forest with golden red trees, morning mist, sunlight god rays, wide angle, cinematic")

NAMES+=("pm-27-cyberpunk-neon"); TYPES+=("img"); RATIOS+=("16:9")
PROMPTS+=("Cyberpunk city street at night with neon signs, rain soaked pavement reflecting pink and cyan lights, steam rising, cinematic atmosphere")

NAMES+=("pm-28-wedding-photo"); TYPES+=("img"); RATIOS+=("16:9")
PROMPTS+=("Golden hour photograph of a couple silhouetted against sunset in a lavender field, flowing veil in wind, warm backlit light, bokeh background")

NAMES+=("pm-29-isometric-3d"); TYPES+=("img"); RATIOS+=("1:1")
PROMPTS+=("Isometric 3D illustration of a cozy coffee shop interior, tiny people at tables, large windows with rain outside, steam from cups, pastel colors, miniature diorama style")

NAMES+=("pm-31-underwater"); TYPES+=("img"); RATIOS+=("16:9")
PROMPTS+=("Underwater photograph of a coral reef with tropical fish, crystal clear turquoise water, sunbeams penetrating surface, vibrant coral formations in orange pink purple")

NAMES+=("pm-33-macro"); TYPES+=("img"); RATIOS+=("1:1")
PROMPTS+=("Macro photograph of morning dew drops on a spider web, each droplet reflecting sunrise, golden light on silk threads, dark blurred bokeh background")

# ═══ RETRY FAILED EXAMPLES (simplified) ═══

NAMES+=("ex-26-autumn-lake"); TYPES+=("img"); RATIOS+=("16:9")
PROMPTS+=("Aerial view looking down at a mountain lake surrounded by autumn forest, golden orange trees reflected in still water, small wooden dock with red canoe")

NAMES+=("ex-27-neon-alley"); TYPES+=("img"); RATIOS+=("9:16")
PROMPTS+=("Cyberpunk back alley with holographic advertisements, ramen vendor stall with steam and neon glow, puddles reflecting blue and magenta lights")

NAMES+=("ex-30-dark-knight"); TYPES+=("img"); RATIOS+=("9:16")
PROMPTS+=("Dark fantasy painting of an armored knight standing before massive ornate gates, holding a glowing runic sword, dark mist swirling, red sky, epic art")

NAMES+=("ex-33-dewdrop"); TYPES+=("img"); RATIOS+=("1:1")
PROMPTS+=("Macro photograph of a water droplet on a green leaf tip, inside the droplet a reflection of flowers, golden morning light, dreamy bokeh background")

# ═══ ALL VIDEOS (corrected type: text-to-video) ═══

NAMES+=("vid-26-drone-flight"); TYPES+=("vid"); RATIOS+=("16:9")
PROMPTS+=("Smooth cinematic drone flyover above a winding river through autumn forest, golden and red trees, morning mist rising, camera slowly descending and following the river curve, golden hour sunlight")

NAMES+=("vid-27-cyberpunk-walk"); TYPES+=("vid"); RATIOS+=("16:9")
PROMPTS+=("A person walking through a rainy cyberpunk city street at night, neon signs reflecting on wet pavement, steam rising from grates, camera following from behind, pink and cyan neon lights")

NAMES+=("vid-28-wedding-dance"); TYPES+=("vid"); RATIOS+=("16:9")
PROMPTS+=("Romantic slow-motion footage of a couple dancing in an outdoor garden, fairy lights twinkling in background, golden hour light, flowing dress, cinematic film")

NAMES+=("vid-30-dragon-flight"); TYPES+=("vid"); RATIOS+=("16:9")
PROMPTS+=("Epic cinematic shot of a massive dragon taking flight from a mountaintop at sunset, wings spreading wide, camera tracking upward as the dragon soars into clouds, fantasy film quality")

NAMES+=("vid-31-underwater-reef"); TYPES+=("vid"); RATIOS+=("16:9")
PROMPTS+=("Underwater footage slowly gliding over a colorful coral reef, schools of tropical fish, sunbeams dancing through crystal clear water, a sea turtle swimming past, nature documentary quality")

NAMES+=("vid-32-tokyo-night"); TYPES+=("vid"); RATIOS+=("9:16")
PROMPTS+=("Walking through a narrow Tokyo alley at night, warm lantern light from restaurants on both sides, steam rising from food stalls, rain starting to drizzle, intimate POV perspective")

NAMES+=("vid-35-craftsman"); TYPES+=("vid"); RATIOS+=("16:9")
PROMPTS+=("Close-up slow motion of an elderly woodworker hands carving details into walnut wood, shavings curling from chisel, warm afternoon light through dusty window, documentary style")

NAMES+=("vid-38-slam-dunk"); TYPES+=("vid"); RATIOS+=("16:9")
PROMPTS+=("Epic slow-motion basketball slam dunk from low angle, player soaring through air, arena lights flaring behind, the ball slamming through the net, crowd erupting, sports broadcast quality")

TOTAL=${#NAMES[@]}
echo "═══════════════════════════════════════════════════"
echo "  Retrying $TOTAL assets (failed images + all videos)"
echo "═══════════════════════════════════════════════════"

declare -a JOBS
for i in $(seq 0 $((TOTAL-1))); do
  NAME="${NAMES[$i]}"
  TYPE="${TYPES[$i]}"
  RATIO="${RATIOS[$i]}"
  PROMPT="${PROMPTS[$i]}"

  if [[ "$TYPE" == "img" ]]; then
    BODY=$(jq -n --arg p "$PROMPT" --arg r "$RATIO" \
      '{type:"text_to_image", prompt:$p, aspectRatio:$r, engine:{provider:"fxflow",model:"google_image_gen_4_5"}}')
    JOB=$(curl -s -X POST "$IMG_API" -H "Authorization: $TOKEN" -H "Content-Type: application/json" -d "$BODY" | jq -r '.data.jobId // "ERROR"')
  else
    BODY=$(jq -n --arg p "$PROMPT" --arg r "$RATIO" \
      '{type:"text-to-video", prompt:$p, aspectRatio:$r, engine:{provider:"fxflow",model:"veo3"}}')
    JOB=$(curl -s -X POST "$VID_API" -H "Authorization: $TOKEN" -H "Content-Type: application/json" -d "$BODY" | jq -r '.data.jobId // "ERROR"')
  fi

  JOBS+=("$JOB")
  echo "  [$i] $TYPE $NAME → $JOB"
  sleep 2
done

echo ""
echo "═══════════════════════════════════════════════════"
echo "  All jobs submitted. Polling results..."
echo "═══════════════════════════════════════════════════"

for i in $(seq 0 $((TOTAL-1))); do
  NAME="${NAMES[$i]}"
  TYPE="${TYPES[$i]}"
  JOB="${JOBS[$i]}"

  if [[ "$JOB" == "ERROR" ]]; then
    echo "  ❌ $NAME: submit failed"
    if [[ "$NAME" == vid-* ]]; then
      echo "${NAME}|FAILED" >> "$VIDEO_FILE"
    elif [[ "$NAME" == ex-* ]]; then
      echo "${NAME}|FAILED" >> "$EXAMPLE_FILE"
    else
      echo "${NAME}|FAILED" >> "$COVER_FILE"
    fi
    continue
  fi

  if [[ "$TYPE" == "img" ]]; then
    POLL_URL="$IMG_API/$JOB"
    MAX_POLLS=120; POLL_INTERVAL=5
  else
    POLL_URL="$VID_API/$JOB"
    MAX_POLLS=180; POLL_INTERVAL=10
  fi

  URL=""
  for attempt in $(seq 1 $MAX_POLLS); do
    RESP=$(curl -s "$POLL_URL" -H "Authorization: $TOKEN")
    STATUS=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('status','unknown'))" 2>/dev/null || echo "unknown")

    if [[ "$STATUS" == "done" ]]; then
      if [[ "$TYPE" == "img" ]]; then
        URL=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null || echo "")
      else
        URL=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']['result']; print(d.get('videoUrl','') or d.get('video','') or d.get('videos',[''])[0])" 2>/dev/null || echo "")
      fi
      break
    elif [[ "$STATUS" == "failed" || "$STATUS" == "error" ]]; then
      break
    fi
    printf "  ⏳ %s: %s (%d/%d)    \r" "$NAME" "$STATUS" "$attempt" "$MAX_POLLS"
    sleep $POLL_INTERVAL
  done

  if [[ -n "$URL" && "$URL" != "null" && "$URL" != "" ]]; then
    echo "  ✅ $NAME → ${URL:0:80}..."
    if [[ "$NAME" == vid-* ]]; then
      echo "${NAME}|${URL}" >> "$VIDEO_FILE"
    elif [[ "$NAME" == ex-* ]]; then
      echo "${NAME}|${URL}" >> "$EXAMPLE_FILE"
    else
      echo "${NAME}|${URL}" >> "$COVER_FILE"
    fi
  else
    echo "  ❌ $NAME FAILED ($STATUS)"
    if [[ "$NAME" == vid-* ]]; then
      echo "${NAME}|FAILED" >> "$VIDEO_FILE"
    elif [[ "$NAME" == ex-* ]]; then
      echo "${NAME}|FAILED" >> "$EXAMPLE_FILE"
    else
      echo "${NAME}|FAILED" >> "$COVER_FILE"
    fi
  fi
done

echo ""
echo "═══════════════════════════════════════════════════"
echo "  Retry complete!"
echo "  Covers:   $(wc -l < "$COVER_FILE") entries ($(grep -c 'FAILED' "$COVER_FILE" || echo 0) failed)"
echo "  Examples: $(wc -l < "$EXAMPLE_FILE") entries ($(grep -c 'FAILED' "$EXAMPLE_FILE" || echo 0) failed)"
echo "  Videos:   $(wc -l < "$VIDEO_FILE") entries ($(grep -c 'FAILED' "$VIDEO_FILE" || echo 0) failed)"
echo "═══════════════════════════════════════════════════"
