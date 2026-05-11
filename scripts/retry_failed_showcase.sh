#!/bin/bash
# Retry failed showcase images
set -euo pipefail

API="https://api.skyverses.com/api-client/external/image-task"
TOKEN="Bearer ${SKYVERSES_EXTERNAL_API_TOKEN:?set SKYVERSES_EXTERNAL_API_TOKEN}"

COVER_FILE="/tmp/pm_showcase_covers.txt"
EXAMPLE_FILE="/tmp/pm_showcase_examples.txt"

declare -a NAMES PROMPTS RATIOS TARGETS

# ── Failed covers ──
NAMES+=("pm-01-product-photo"); TARGETS+=("cover"); RATIOS+=("16:9")
PROMPTS+=("A luxury men's chronograph watch with a midnight blue dial and rose gold accents, resting at an angle on a slab of raw black marble, water droplets on the crystal face catching studio light, a single sprig of eucalyptus beside it, dramatic Rembrandt lighting with warm key light from the left and cool fill from the right, shallow depth of field, shot on Phase One IQ4 150MP, dark moody background with subtle smoke wisps, no text")

NAMES+=("pm-04-fashion-editorial"); TARGETS+=("cover"); RATIOS+=("9:16")
PROMPTS+=("Haute couture editorial photograph, a striking model in an avant-garde sculptural emerald green gown with dramatic pleated organza cape trailing behind, walking through a misty enchanted forest at golden hour, harsh directional backlighting creating a glowing silhouette, the gown fabric catching light with iridescent reflections, shot on Hasselblad H6D-100c, fashion photography, no text")

NAMES+=("pm-11-ad-creative"); TARGETS+=("cover"); RATIOS+=("16:9")
PROMPTS+=("Three premium digital advertising creative mockups displayed on floating glass screens against a dark gradient background, each showing a different ad format with luxury products, soft neon glow behind each screen, digital marketing agency portfolio presentation quality, no text")

NAMES+=("pm-12-packaging"); TARGETS+=("cover"); RATIOS+=("16:9")
PROMPTS+=("Luxury cosmetics packaging design showcase, three elegant perfume bottles with sculptural geometric caps in rose gold and frosted glass, arranged on a stepped marble display pedestal, surrounded by fresh white peonies and scattered rose petals, dramatic studio lighting with rim light highlighting the bottle silhouettes, soft bokeh background in blush pink, premium beauty brand campaign photography, no text")

NAMES+=("pm-21-abstract-art"); TARGETS+=("cover"); RATIOS+=("1:1")
PROMPTS+=("A mesmerizing abstract fluid art composition, swirling ribbons of liquid gold, deep sapphire blue, and iridescent pearl white flowing and intertwining in an organic dance, microscopic cell-like structures forming at the boundaries where colors meet, extremely detailed textures, high-end gallery art quality, no text")

NAMES+=("pm-24-vintage-retro"); TARGETS+=("cover"); RATIOS+=("16:9")
PROMPTS+=("A nostalgic 1970s aesthetic photograph of a vintage Volkswagen camper van in two-tone orange and cream, parked at a California beach at sunset, surfboards leaning against the side, palm trees silhouetted against a gradient sky of coral pink and lavender, warm analog film grain and light leaks, retro vibes, no text")

# ── Failed examples ──
NAMES+=("ex-01-skincare-flatlay"); TARGETS+=("example"); RATIOS+=("1:1")
PROMPTS+=("Luxury skincare product flat lay photography, three amber glass dropper bottles with minimalist white labels arranged diagonally on a terrazzo surface, surrounded by fresh rosemary sprigs, sliced lemons, and raw honey in a small ceramic dish, natural window light casting soft shadows, clean editorial beauty photography, overhead shot, no text")

NAMES+=("ex-03-wabisabi-bathroom"); TARGETS+=("example"); RATIOS+=("9:16")
PROMPTS+=("A serene Japanese wabi-sabi bathroom, a deep oval stone soaking tub filled with steaming water, positioned before a floor-to-ceiling window looking out at a private bamboo garden, natural stone floor with embedded river pebbles, a wooden stool with folded linen towels, soft diffused natural light, warm earth tones, no text")

NAMES+=("ex-04-streetwear"); TARGETS+=("example"); RATIOS+=("9:16")
PROMPTS+=("Urban streetwear editorial photograph, a young model in an oversized vintage-washed denim jacket with bold embroidered tiger back patch, wide-leg cargo pants with utility straps, and chunky platform combat boots, standing on a fire escape with morning fog, harsh flash photography with sharp shadows, raw street energy, no text")

NAMES+=("ex-05-paladin-turnaround"); TARGETS+=("example"); RATIOS+=("16:9")
PROMPTS+=("Professional game character turnaround reference sheet showing a female holy paladin knight in ornate white and gold plate armor with a flowing royal blue cape, displayed in 6 views on a clean neutral gray background: front, back, left side, right side, combat stance, and kneeling prayer pose, consistent lighting and proportions across all views, concept art character sheet, no text")

NAMES+=("ex-07-noir-detective"); TARGETS+=("example"); RATIOS+=("16:9")
PROMPTS+=("A cinematic film noir still, a detective in a long trench coat and fedora standing under a single flickering street lamp on a rain-soaked cobblestone street at midnight, smoke curling upward into the cone of amber light, reflections of distant neon signs shimmering on wet pavement, venetian blind shadow pattern, moody atmospheric lighting, no text")

TOTAL=${#NAMES[@]}
echo "═══════════════════════════════════════════════════"
echo "  Retrying $TOTAL failed images"
echo "═══════════════════════════════════════════════════"

# Submit all jobs
declare -a JOBS
for i in $(seq 0 $((TOTAL-1))); do
  BODY=$(jq -n --arg p "${PROMPTS[$i]}" --arg r "${RATIOS[$i]}" \
    '{type:"text_to_image", prompt:$p, aspectRatio:$r, engine:{provider:"fxflow",model:"google_image_gen_4_5"}}')
  JOB=$(curl -s -X POST "$API" -H "Authorization: $TOKEN" -H "Content-Type: application/json" -d "$BODY" | jq -r '.data.jobId // .data._id // .data.id // "ERROR"')
  JOBS+=("$JOB")
  echo "  [${i}] ${NAMES[$i]} → $JOB"
  sleep 2
done

echo ""
echo "  Polling results..."

# Poll each job
for i in $(seq 0 $((TOTAL-1))); do
  NAME="${NAMES[$i]}"
  JOB="${JOBS[$i]}"
  TARGET="${TARGETS[$i]}"

  if [[ "$JOB" == "ERROR" ]]; then
    echo "  ❌ $NAME: submit failed"
    continue
  fi

  URL=""
  for attempt in $(seq 1 120); do
    RESP=$(curl -s "https://api.skyverses.com/api-client/external/image-task/$JOB" -H "Authorization: $TOKEN")
    STATUS=$(echo "$RESP" | jq -r '.data.status // "unknown"')
    if [[ "$STATUS" == "done" ]]; then
      URL=$(echo "$RESP" | jq -r '.data.result.images[0] // empty')
      break
    elif [[ "$STATUS" == "failed" || "$STATUS" == "error" ]]; then
      break
    fi
    printf "  ⏳ $NAME: $STATUS ($attempt/120)\r"
    sleep 5
  done

  if [[ -n "$URL" && "$URL" != "null" ]]; then
    echo "  ✅ $NAME → ${URL:0:80}..."
    # Update the result file — replace FAILED line
    if [[ "$TARGET" == "cover" ]]; then
      sed -i '' "s|^${NAME}|FAILED|" "$COVER_FILE" 2>/dev/null || true
      # Use a temp approach: rebuild line
      TMP=$(mktemp)
      while IFS= read -r line; do
        if [[ "$line" == "${NAME}|FAILED" ]]; then
          echo "${NAME}|${URL}"
        else
          echo "$line"
        fi
      done < "$COVER_FILE" > "$TMP"
      mv "$TMP" "$COVER_FILE"
    else
      TMP=$(mktemp)
      while IFS= read -r line; do
        if [[ "$line" == "${NAME}|FAILED" ]]; then
          echo "${NAME}|${URL}"
        else
          echo "$line"
        fi
      done < "$EXAMPLE_FILE" > "$TMP"
      mv "$TMP" "$EXAMPLE_FILE"
    fi
  else
    echo "  ❌ $NAME FAILED again"
  fi
done

echo ""
echo "═══════════════════════════════════════════════════"
echo "  Retry complete!"
echo "  Covers:   $(grep -c 'FAILED' $COVER_FILE) still failed / 25"
echo "  Examples: $(grep -c 'FAILED' $EXAMPLE_FILE) still failed / 15"
echo "═══════════════════════════════════════════════════"
