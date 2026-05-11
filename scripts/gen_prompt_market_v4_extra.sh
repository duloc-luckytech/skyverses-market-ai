#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# Generate EXTRA showcase images + videos for Prompt Market v4
# Adds 15 new prompt sets (26–40) with both image covers AND video examples
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

IMG_API="https://api.skyverses.com/api-client/external/image-task"
VID_API="https://api.skyverses.com/api-client/external/video-task"
TOKEN="Bearer ${SKYVERSES_EXTERNAL_API_TOKEN:?set SKYVERSES_EXTERNAL_API_TOKEN}"

COVER_FILE="/tmp/pm_v4extra_covers.txt"
EXAMPLE_FILE="/tmp/pm_v4extra_examples.txt"
VIDEO_FILE="/tmp/pm_v4extra_videos.txt"

> "$COVER_FILE"
> "$EXAMPLE_FILE"
> "$VIDEO_FILE"

declare -a NAMES PROMPTS RATIOS TYPES

# ═══════════════════════════════════════════════════
# COVER IMAGES (15 new prompt sets: 26–40)
# ═══════════════════════════════════════════════════

# 26. Cinematic Drone Photography
NAMES+=("pm-26-drone-aerial"); TYPES+=("img"); RATIOS+=("16:9")
PROMPTS+=("Breathtaking aerial drone photograph of a winding river through autumn forest, golden and red trees on both sides, morning mist rising from the water, sunlight piercing through clouds creating god rays, shot from 200 meters altitude, cinematic wide angle, no text")

# 27. Neon Cyberpunk Scenes
NAMES+=("pm-27-cyberpunk-neon"); TYPES+=("img"); RATIOS+=("16:9")
PROMPTS+=("A cyberpunk city street at night with dense neon signs in Japanese and Chinese characters, rain-soaked pavement reflecting pink and cyan neon lights, a lone figure with an umbrella walking away, steam rising from street grates, Blade Runner aesthetic, cinematic photography, no text")

# 28. Wedding & Event Photography
NAMES+=("pm-28-wedding-photo"); TYPES+=("img"); RATIOS+=("16:9")
PROMPTS+=("Romantic golden hour wedding photograph, bride and groom silhouetted against a sunset sky, standing in a lavender field in Provence, the bride's long veil flowing in the wind, warm backlit golden light, bokeh fairy lights in the background, editorial wedding photography, no text")

# 29. Isometric 3D Illustrations
NAMES+=("pm-29-isometric-3d"); TYPES+=("img"); RATIOS+=("1:1")
PROMPTS+=("Cute isometric 3D illustration of a cozy coffee shop, warm interior with tiny people sitting at tables, large windows with rain outside, steam rising from coffee cups, bookshelves on the wall, potted plants, soft pastel color palette, miniature diorama style, clay render aesthetic, no text")

# 30. Dark Fantasy Art
NAMES+=("pm-30-dark-fantasy"); TYPES+=("img"); RATIOS+=("16:9")
PROMPTS+=("Epic dark fantasy digital painting of an ancient dragon perched on a crumbling gothic cathedral tower during a thunderstorm, lightning illuminating its scales, dark purple and crimson sky, medieval city burning below, volumetric fog, hyper-detailed fantasy illustration, no text")

# 31. Underwater Photography
NAMES+=("pm-31-underwater"); TYPES+=("img"); RATIOS+=("16:9")
PROMPTS+=("Stunning underwater photograph of a coral reef ecosystem, schools of tropical fish swimming through crystal clear turquoise water, sunbeams penetrating the surface creating caustic light patterns, vibrant coral formations in orange pink and purple, marine biology photography, no text")

# 32. Street Photography
NAMES+=("pm-32-street-photo"); TYPES+=("img"); RATIOS+=("9:16")
PROMPTS+=("Atmospheric street photography in Tokyo at night, a narrow alley with traditional izakaya lanterns glowing warm orange, wet cobblestones reflecting the lights, a bicycle parked against the wall, paper umbrellas, steam from a ramen shop, moody cinematic lighting, no text")

# 33. Macro Photography
NAMES+=("pm-33-macro"); TYPES+=("img"); RATIOS+=("1:1")
PROMPTS+=("Extreme macro photograph of morning dew drops on a spider web, each droplet acting as a tiny lens reflecting the sunrise, delicate silk threads catching golden light, dark blurred background with bokeh circles, shot with Canon MP-E 65mm at 5x magnification, no text")

# 34. Flat Design Illustration
NAMES+=("pm-34-flat-design"); TYPES+=("img"); RATIOS+=("16:9")
PROMPTS+=("Modern flat design illustration for a tech startup landing page hero section, showing a person working on a laptop surrounded by floating UI elements, charts, and notification bubbles, gradient purple to blue background, clean geometric shapes, Dribbble trending style, no text")

# 35. Cinematic Portrait
NAMES+=("pm-35-cinematic-portrait"); TYPES+=("img"); RATIOS+=("9:16")
PROMPTS+=("Cinematic portrait of an elderly craftsman in his woodworking workshop, warm afternoon light streaming through a dusty window, wood shavings in the air catching the light, weathered hands holding a hand plane, shallow depth of field, shot on Leica M11 with 50mm Summilux, no text")

# 36. Pixel Art & Retro Gaming
NAMES+=("pm-36-pixel-art"); TYPES+=("img"); RATIOS+=("16:9")
PROMPTS+=("Detailed pixel art scene of a fantasy RPG town at sunset, colorful buildings with thatched roofs, a market square with tiny pixel characters, a grand castle on a hill in the background, cherry blossom trees lining the main road, 32-bit era style, warm golden lighting, no text")

# 37. Botanical Illustration
NAMES+=("pm-37-botanical"); TYPES+=("img"); RATIOS+=("9:16")
PROMPTS+=("Elegant botanical scientific illustration of a blooming orchid plant, showing the full plant with roots, stems, leaves, and multiple flowers in various stages of bloom, detailed cross-section of the flower anatomy, vintage hand-painted watercolor style on cream parchment paper, botanical garden archive quality, no text")

# 38. Sports Action Photography
NAMES+=("pm-38-sports-action"); TYPES+=("img"); RATIOS+=("16:9")
PROMPTS+=("Dynamic sports action photograph of a basketball player mid-dunk, frozen in mid-air with arena lights creating dramatic rim lighting, sweat droplets suspended in the air, motion blur on the crowd, shot at 1/2000s shutter speed with Canon EOS R3, wide aperture, arena atmosphere, no text")

# 39. Stained Glass Art
NAMES+=("pm-39-stained-glass"); TYPES+=("img"); RATIOS+=("9:16")
PROMPTS+=("Intricate stained glass window design depicting a magical forest scene with a majestic white stag standing in a moonlit clearing, surrounded by ancient oak trees, fireflies rendered as glowing amber glass pieces, cobalt blue night sky with silver stars, cathedral quality craftsmanship, backlit by warm sunlight, no text")

# 40. Miniature Tilt-Shift
NAMES+=("pm-40-tilt-shift"); TYPES+=("img"); RATIOS+=("16:9")
PROMPTS+=("Tilt-shift miniature effect photograph of a bustling European harbor town, making the real city look like a tiny model village, colorful fishing boats in the marina, terracotta rooftops, a lighthouse at the harbor entrance, extreme shallow depth of field at top and bottom, saturated vibrant colors, toy-like appearance, no text")

# ═══════════════════════════════════════════════════
# EXAMPLE IMAGES (for the new prompt sets)
# ═══════════════════════════════════════════════════

# Extra example images
NAMES+=("ex-26-autumn-lake"); TYPES+=("img"); RATIOS+=("16:9")
PROMPTS+=("Aerial photograph looking straight down at a pristine mountain lake surrounded by autumn forest, the water perfectly reflecting the golden and orange trees, a small wooden dock with a red canoe, morning mist, drone photography, no text")

NAMES+=("ex-27-neon-alley"); TYPES+=("img"); RATIOS+=("9:16")
PROMPTS+=("Cyberpunk back alley with holographic advertisements floating in the air, a ramen vendor stall with steam and neon glow, puddles reflecting electric blue and magenta lights, dystopian future aesthetic, no text")

NAMES+=("ex-29-isometric-room"); TYPES+=("img"); RATIOS+=("1:1")
PROMPTS+=("Cute isometric 3D illustration of a home office room, tiny desk with dual monitors, a cat sleeping on a beanbag, plants on floating shelves, warm lamp lighting, soft pastel colors, miniature diorama, no text")

NAMES+=("ex-30-dark-knight"); TYPES+=("img"); RATIOS+=("9:16")
PROMPTS+=("Dark fantasy digital painting of a lone armored knight standing before massive ornate gates of a shadow realm, holding a glowing runic sword, dark mist swirling at the base, ominous red sky, epic fantasy art, no text")

NAMES+=("ex-33-dewdrop"); TYPES+=("img"); RATIOS+=("1:1")
PROMPTS+=("Extreme macro photograph of a single water droplet balanced on the tip of a green leaf, inside the droplet a reflection of a blooming flower garden, golden morning light, dreamy bokeh background, no text")

NAMES+=("ex-36-pixel-dungeon"); TYPES+=("img"); RATIOS+=("16:9")
PROMPTS+=("Detailed pixel art scene of a fantasy dungeon interior, ancient stone walls with glowing rune carvings, treasure chests and scattered gold coins, a pixel art hero facing a dragon boss, torchlight casting flickering shadows, 16-bit RPG style, no text")

NAMES+=("ex-38-soccer"); TYPES+=("img"); RATIOS+=("16:9")
PROMPTS+=("Dynamic sports photography of a soccer player performing a bicycle kick in a packed stadium at night, frozen in mid-air, the ball caught milliseconds before contact, floodlights creating dramatic backlight, grass particles flying, no text")

# ═══════════════════════════════════════════════════
# VIDEO EXAMPLES (text_to_video via VEO3)
# ═══════════════════════════════════════════════════

NAMES+=("vid-26-drone-flight"); TYPES+=("vid"); RATIOS+=("16:9")
PROMPTS+=("Smooth cinematic drone flyover above a winding river through autumn forest, golden and red trees, morning mist rising, camera slowly descending and following the river curve, golden hour sunlight")

NAMES+=("vid-27-cyberpunk-walk"); TYPES+=("vid"); RATIOS+=("16:9")
PROMPTS+=("A person walking through a rainy cyberpunk city street at night, neon signs reflecting on wet pavement, steam rising from grates, camera following from behind, pink and cyan neon lights, Blade Runner mood")

NAMES+=("vid-28-wedding-dance"); TYPES+=("vid"); RATIOS+=("16:9")
PROMPTS+=("Romantic slow-motion footage of a bride and groom's first dance in an outdoor garden reception, fairy lights twinkling in the background, golden hour light, the bride's dress flowing gracefully, cinematic wedding film")

NAMES+=("vid-30-dragon-flight"); TYPES+=("vid"); RATIOS+=("16:9")
PROMPTS+=("Epic cinematic shot of a massive dragon taking flight from a mountaintop at sunset, wings spreading wide, creating a powerful downdraft that shakes the trees below, camera tracking upward as the dragon soars into the clouds, fantasy film quality")

NAMES+=("vid-31-underwater-reef"); TYPES+=("vid"); RATIOS+=("16:9")
PROMPTS+=("Underwater footage slowly gliding over a colorful coral reef, schools of tropical fish parting as the camera passes through, sunbeams dancing through the crystal clear water, a sea turtle gracefully swimming past, nature documentary quality")

NAMES+=("vid-32-tokyo-night"); TYPES+=("vid"); RATIOS+=("9:16")
PROMPTS+=("Walking through a narrow Tokyo alley at night, warm lantern light from izakayas on both sides, steam rising from food stalls, occasional people passing by, rain starting to drizzle, intimate POV perspective")

NAMES+=("vid-35-craftsman"); TYPES+=("vid"); RATIOS+=("16:9")
PROMPTS+=("Close-up slow motion of an elderly woodworker's hands carving intricate details into a piece of walnut wood, wood shavings curling away from the chisel, warm afternoon light streaming through a dusty workshop window, documentary style")

NAMES+=("vid-38-slam-dunk"); TYPES+=("vid"); RATIOS+=("16:9")
PROMPTS+=("Epic slow-motion basketball slam dunk from a low angle, the player soaring through the air, arena lights flaring behind them, sweat droplets flying, the ball slamming through the net, crowd erupting, sports broadcast quality")

TOTAL=${#NAMES[@]}
echo "═══════════════════════════════════════════════════"
echo "  Generating $TOTAL assets (images + videos)"
echo "═══════════════════════════════════════════════════"

# Submit all jobs
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

# Poll each job
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

  # Select API base for polling
  if [[ "$TYPE" == "img" ]]; then
    POLL_URL="$IMG_API/$JOB"
    MAX_POLLS=120
    POLL_INTERVAL=5
  else
    POLL_URL="$VID_API/$JOB"
    MAX_POLLS=180
    POLL_INTERVAL=10
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
echo "  Generation complete!"
echo "  Covers:   $(wc -l < "$COVER_FILE") entries ($(grep -c 'FAILED' "$COVER_FILE" || echo 0) failed)"
echo "  Examples: $(wc -l < "$EXAMPLE_FILE") entries ($(grep -c 'FAILED' "$EXAMPLE_FILE" || echo 0) failed)"
echo "  Videos:   $(wc -l < "$VIDEO_FILE") entries ($(grep -c 'FAILED' "$VIDEO_FILE" || echo 0) failed)"
echo "═══════════════════════════════════════════════════"
