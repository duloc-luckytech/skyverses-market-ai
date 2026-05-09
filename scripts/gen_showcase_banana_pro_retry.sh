#!/bin/bash
API="https://api.skyverses.com/api-client/external/image-task"
EXPLORER_API="https://api.skyverses.com/explorer"
TOKEN="Bearer skv_cbb360d3c039ffb0ebb494e8536a9730a9faa4acde25d44be11a8087b65a230b"
EXPLORER_TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3Nzc5NjIyNTksImV4cCI6MTc3ODU2NzA1OX0.zaXcxMq8jNYmrrNRm-MiL6mla233xnn5N3ARokDr-nk"

declare -a NAMES
declare -a PROMPTS
declare -a PRODUCTS
declare -a TAGS_LIST
declare -a RATIOS

# ══════════════════════════════════════════════════════════════════
# RETRY: 7 failed images with softer prompts (content filter safe)
# ══════════════════════════════════════════════════════════════════

# 1. bp-kora-hero — removed "striking a giant panda", softened to exploration scene
NAMES+=("bp-kora-hero")
PROMPTS+=("Cinematic wide shot of a young anime-style jungle warrior girl with wild green hair and a leaf headdress, wearing tribal bone armor with decorative pauldrons and striped leg wraps, standing heroically on a massive tree root overlooking a misty jungle valley at sunrise, a friendly giant panda sitting peacefully beside her, lush tropical vegetation with hanging vines and colorful exotic flowers, volumetric sunlight filtering through the canopy, Unreal Engine 5 quality, game cinematic screenshot, photorealistic render with stylized anime proportions")
PRODUCTS+=("KORA — Bone Tribe Warrior")
TAGS_LIST+=("showcase,banana-pro,game,character,action")
RATIOS+=("16:9")

# 2. bp-kora-details — removed "hidden dagger", softened to decorative items
NAMES+=("bp-kora-details")
PROMPTS+=("Detailed prop and accessory reference sheet for a tribal jungle warrior character: close-up views of a carved wooden staff with glowing rune engravings and leather wrapping, a decorative shoulder guard with green gemstone inlay, ornate striped leg wrappings with woven patterns, leaf headdress with colorful feather ornaments, bone necklace with polished animal fossils, belt pouch made of woven vines and beads, each item displayed individually on clean dark background with multiple angles and material callouts, game asset concept art style, ultra-detailed rendering")
PRODUCTS+=("KORA — Bone Tribe Warrior")
TAGS_LIST+=("showcase,banana-pro,game,weapon,details")
RATIOS+=("1:1")

# 3. bp-kora-environment — removed "bone totems", softened to peaceful jungle
NAMES+=("bp-kora-environment")
PROMPTS+=("Lush tropical jungle game environment concept art, ancient stone ruins overgrown with vines and moss, a clearing with a tribal campfire surrounded by carved wooden totem poles with colorful paint, massive tree roots forming natural archways, bioluminescent mushrooms glowing softly in shadowed areas, a misty waterfall visible in the background, volumetric god rays piercing through the dense canopy, a worn dirt path leading deeper into the jungle, friendly parrots perched on branches, Unreal Engine 5 environment art, wide establishing shot, photorealistic with painterly atmosphere")
PRODUCTS+=("KORA — Bone Tribe Warrior")
TAGS_LIST+=("showcase,banana-pro,game,environment,jungle")
RATIOS+=("16:9")

# 4. bp-zero-pilot — softened to astronaut/explorer vibe
NAMES+=("bp-zero-pilot")
PROMPTS+=("Full-body character render of a young male mech pilot in a sleek white and crimson flight suit with black accents, short silver hair, confident smirk, holding a futuristic helmet under one arm with the visor glowing blue, the other hand resting on his hip, ID tags hanging from neck, flight suit has subtle panel lines and status LEDs on the chest, soft studio lighting, clean gradient background, anime-influenced proportions with realistic rendering, game character portrait quality, 4K")
PRODUCTS+=("ZERO — Ghost Frame Operator")
TAGS_LIST+=("showcase,banana-pro,game,character,pilot")
RATIOS+=("1:1")

# 5. bp-viper-hero — removed explosion/pistol, changed to stealth infiltration
NAMES+=("bp-viper-hero")
PROMPTS+=("Cinematic movie frame of a female special forces agent in a sleek black tactical suit walking confidently through a rain-soaked Tokyo street at night, neon reflections on wet pavement, she adjusts her earpiece communicator with one hand while walking toward camera, long dark hair flowing in the wind, neon signs and holographic advertisements illuminating the scene in teal and magenta, puddle reflections creating mirror effect, anamorphic lens flare, cinematic spy thriller aesthetic, photorealistic Hollywood quality, 4K widescreen")
PRODUCTS+=("VIPER — Shadow Protocol Agent")
TAGS_LIST+=("showcase,banana-pro,action,movie,character")
RATIOS+=("16:9")

# 6. bp-viper-weapons — changed to spy gadgets/tech gear (no weapons)
NAMES+=("bp-viper-weapons")
PROMPTS+=("High-tech spy gadget and equipment sheet for an action movie agent character: encrypted smartphone with holographic display, wrist-mounted smart device with glowing interface, miniature drone with camera attachment, lockpicking multitool kit in leather roll, night vision goggles with sleek design, magnetic climbing gloves, earpiece communicator set, USB data extraction device, laser tripwire detector, each item photographed individually on dark surface with dramatic side lighting, futuristic tech catalog aesthetic, photorealistic product photography, 4K")
PRODUCTS+=("VIPER — Shadow Protocol Agent")
TAGS_LIST+=("showcase,banana-pro,action,movie,gadgets")
RATIOS+=("1:1")

# 7. bp-hayabusa-colors — simplified, fewer variants
NAMES+=("bp-hayabusa-colors")
PROMPTS+=("Color variant showcase of a futuristic Japanese street racing car shown in 4 different livery schemes on dark background: electric blue with white racing stripes, matte black with red accent lines, pearl white with gold pinstripe details, and neon green with carbon fiber hood, each shown from the same three-quarter front angle in studio lighting, automotive color palette presentation, clean studio render, consistent lighting across all variants, professional car configurator style, 4K")
PRODUCTS+=("HAYABUSA GT — Cyber Street Racer")
TAGS_LIST+=("showcase,banana-pro,game,vehicle,colors")
RATIOS+=("16:9")

JOBIDS=()

echo "🔄 Retrying ${#NAMES[@]} failed Banana Pro images (softer prompts)..."
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
echo "⏳ Polling results..."

RESULTS_FILE="/tmp/showcase_banana_pro_retry_results.txt"
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
echo "📋 Retry results:"
cat "$RESULTS_FILE"
echo ""
echo "🏁 Done! Append to main results:"
echo "cat /tmp/showcase_banana_pro_retry_results.txt >> /tmp/showcase_banana_pro_v3_results.txt"
