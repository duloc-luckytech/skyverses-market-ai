#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# Fashion Products — Image-only showcase (product catalog / lookbook)
# Generates product collection images for the Fashion showcase group
# All images, no videos — to be added to SHOWCASE_FASHION_IMAGES
# ═══════════════════════════════════════════════════════════════════════
IMG_API="https://api.skyverses.com/api-client/external/image-task"
EXPLORER_API="https://api.skyverses.com/explorer"
TOKEN="Bearer skv_cbb360d3c039ffb0ebb494e8536a9730a9faa4acde25d44be11a8087b65a230b"
# JWT token for Explorer API (update if expired)
EXPLORER_TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3Nzc5NjIyNTksImV4cCI6MTc3ODU2NzA1OX0.zaXcxMq8jNYmrrNRm-MiL6mla233xnn5N3ARokDr-nk"

RESULTS_FILE="/tmp/fashion_products_results.txt"
> "$RESULTS_FILE"

# ═══════════════════════════════════════════════════════════════
# IMAGE DEFINITIONS — Product catalog / lookbook style
# ═══════════════════════════════════════════════════════════════
declare -a NAMES
declare -a PROMPTS
declare -a RATIOS
declare -a PRODUCTS
declare -a TAGS

# ── DESIGNER BAG COLLECTION ──
NAMES+=("fashion-product-bag-tan")
PROMPTS+=("Luxury product photography, a structured tan calfskin leather tote bag with minimalist gold clasp and hand-stitched edges, placed on a raw marble slab, single directional warm studio light casting a crisp shadow, clean off-white linen backdrop, shot on Phase One IQ4, commercial e-commerce quality with editorial flair, no text no logos")
RATIOS+=("1:1")
PRODUCTS+=("Designer Bags — Product Catalog")
TAGS+=("showcase,fashion,product,bag,catalog")

NAMES+=("fashion-product-bag-black")
PROMPTS+=("High-end product shot of a glossy patent leather evening clutch in jet black with art deco geometric gold frame, resting on a reflective black acrylic surface, the clutch catches a single warm spotlight creating subtle reflections, dark moody studio environment, luxury brand campaign aesthetic, extreme attention to material texture and hardware detail, no text no logos")
RATIOS+=("16:9")
PRODUCTS+=("Designer Bags — Product Catalog")
TAGS+=("showcase,fashion,product,bag,clutch")

NAMES+=("fashion-product-bag-woven")
PROMPTS+=("Artisan woven leather bucket bag in warm cognac, intricate hand-woven intrecciato pattern visible in every strip, thick braided shoulder strap, photographed on a rustic wooden table next to dried botanicals and a ceramic vase, soft window light from the left creating gentle gradients across the weave, lifestyle product photography, warm earthy tones, no text no logos")
RATIOS+=("9:16")
PRODUCTS+=("Designer Bags — Product Catalog")
TAGS+=("showcase,fashion,product,bag,artisan")

# ── SHOE COLLECTION ──
NAMES+=("fashion-product-heel-red")
PROMPTS+=("Editorial product photograph of a pair of pointed-toe stiletto heels in vibrant cherry red patent leather, arranged at a dynamic angle on a polished white surface, one shoe standing upright and the other lying on its side showing the red lacquered sole, sharp studio lighting with a gradient background fading from white to pale pink, luxury footwear campaign quality, no text no logos")
RATIOS+=("1:1")
PRODUCTS+=("Designer Shoes — Product Catalog")
TAGS+=("showcase,fashion,product,shoes,heels")

NAMES+=("fashion-product-sneaker-white")
PROMPTS+=("Minimalist sneaker product shot, pristine white leather low-top sneakers with subtle perforated detailing and thick chunky sole, floating against a clean gradient background from dove grey to white, one sneaker slightly tilted showing the sole profile, studio lighting with soft shadows, premium streetwear brand aesthetic, Common Projects meets editorial, no text no logos")
RATIOS+=("16:9")
PRODUCTS+=("Designer Shoes — Product Catalog")
TAGS+=("showcase,fashion,product,shoes,sneakers")

NAMES+=("fashion-product-boots-suede")
PROMPTS+=("Luxury boots product photography, a pair of knee-high suede boots in deep forest green with a sculpted block heel and inside zip, standing on a dark wood floor next to a vintage leather-bound book, moody autumnal lighting with warm amber tones, the suede texture beautifully captured with side lighting, high-end fashion e-commerce editorial, no text no logos")
RATIOS+=("9:16")
PRODUCTS+=("Designer Shoes — Product Catalog")
TAGS+=("showcase,fashion,product,shoes,boots")

# ── WATCH & JEWELRY COLLECTION ──
NAMES+=("fashion-product-watch-gold")
PROMPTS+=("Luxury watch product photography, a rose gold dress watch with sunburst dial, applied hour markers, and brown alligator leather strap, resting on a dark slate stone, camera positioned at slight angle showing the domed sapphire crystal and crown detail, single hard light source creating dramatic shadows and metallic reflections, horology advertising quality, no text no logos")
RATIOS+=("1:1")
PRODUCTS+=("Luxury Watches — Product Catalog")
TAGS+=("showcase,fashion,product,watch,luxury")

NAMES+=("fashion-product-jewelry-layered")
PROMPTS+=("Jewelry flat lay product photography, an artfully arranged collection of minimalist gold jewelry on a cream linen surface: delicate chain necklaces of varying lengths, stacking rings, thin bangles, and small hoop earrings, each piece separated with precise negative space, soft overhead natural light creating gentle shadows, curated editorial catalog aesthetic, warm gold tones against neutral background, no text no logos")
RATIOS+=("16:9")
PRODUCTS+=("Gold Jewelry — Product Catalog")
TAGS+=("showcase,fashion,product,jewelry,collection")

# ── SUNGLASSES COLLECTION ──
NAMES+=("fashion-product-sunglasses-aviator")
PROMPTS+=("Premium sunglasses product shot, classic aviator sunglasses with gold wire frame and gradient brown lenses, positioned on a smooth sand-colored stone surface, dramatic single-source side lighting creating a long elegant shadow, one lens reflecting a palm tree silhouette, summer luxury campaign aesthetic, the metal frame catching warm highlights, no text no logos")
RATIOS+=("16:9")
PRODUCTS+=("Designer Sunglasses — Product Catalog")
TAGS+=("showcase,fashion,product,sunglasses,aviator")

# ── FASHION LOOKBOOK FLAT LAYS ──
NAMES+=("fashion-product-flatlay-summer")
PROMPTS+=("Summer fashion flat lay product photography, a curated outfit arrangement on white marble: a linen blazer in sand beige, matching wide-leg trousers neatly folded, a pair of tan leather espadrilles, round straw clutch bag, gold link bracelet, and tortoiseshell sunglasses, all arranged with mathematical precision and generous negative space, bright airy natural light, editorial catalog styling, no text no logos")
RATIOS+=("1:1")
PRODUCTS+=("Summer Lookbook — Flat Lay")
TAGS+=("showcase,fashion,product,flatlay,summer")

NAMES+=("fashion-product-flatlay-winter")
PROMPTS+=("Winter fashion flat lay product photography, a curated cold-weather outfit on dark charcoal surface: a camel cashmere overcoat neatly folded, chunky cable-knit cream scarf, dark brown leather gloves, suede ankle boots, a small structured leather crossbody bag in burgundy, and a gold watch, all arranged with precise spacing and editorial styling, warm tungsten lighting, cozy luxury atmosphere, no text no logos")
RATIOS+=("1:1")
PRODUCTS+=("Winter Lookbook — Flat Lay")
TAGS+=("showcase,fashion,product,flatlay,winter")

# ── PERFUME & BEAUTY ──
NAMES+=("fashion-product-perfume")
PROMPTS+=("Luxury perfume bottle product photography, an elegant faceted crystal perfume bottle with amber-gold liquid inside and a sculptural gold cap, positioned on a black mirror surface creating a perfect reflection, a single orchid stem lies beside it, dramatic chiaroscuro lighting with a warm spotlight from above, visible light refractions through the crystal, premium fragrance advertising quality, no text no logos")
RATIOS+=("9:16")
PRODUCTS+=("Luxury Perfume — Product Catalog")
TAGS+=("showcase,fashion,product,perfume,luxury")

# ═══════════════════════════════════════════════════════════════
# SUBMIT ALL IMAGE JOBS
# ═══════════════════════════════════════════════════════════════
TOTAL=${#NAMES[@]}
declare -a JOBIDS

echo "============================================="
echo "  Generating $TOTAL product catalog images"
echo "============================================="
echo ""

for i in "${!NAMES[@]}"; do
  P="${PROMPTS[$i]}"
  P_ESC=$(echo "$P" | sed 's/"/\\"/g')
  AR="${RATIOS[$i]}"

  R=$(curl -s -X POST "$IMG_API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"prompt\":\"$P_ESC\",\"aspectRatio\":\"$AR\",\"engine\":{\"provider\":\"fxflow\",\"model\":\"google_image_gen_4_5\"}}")
  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  JOBIDS+=("$JID")
  echo "  [$((i+1))/$TOTAL] ${NAMES[$i]} ($AR) → $JID"
  sleep 1
done

echo ""
echo "⏳ Polling image results..."

DONE=0
for i in "${!NAMES[@]}"; do
  JID="${JOBIDS[$i]}"
  NAME="${NAMES[$i]}"
  [ -z "$JID" ] && echo "  ❌ $NAME: no job ID" && continue

  for attempt in $(seq 1 60); do
    sleep 5
    SR=$(curl -s "$IMG_API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      DONE=$((DONE+1))
      echo "  ✅ [$DONE/$TOTAL] $NAME → ${URL:0:80}..."
      echo "$NAME|$URL|${RATIOS[$i]}|${PRODUCTS[$i]}" >> "$RESULTS_FILE"

      # ── Save to Explorer ──
      PRODUCT="${PRODUCTS[$i]}"
      TLIST="${TAGS[$i]}"
      PROMPT="${PROMPTS[$i]}"
      PROMPT_ESC=$(echo "$PROMPT" | sed 's/"/\\"/g')
      IFS=',' read -ra TAG_ARR <<< "$TLIST"
      TAG_JSON=$(printf '"%s",' "${TAG_ARR[@]}")
      TAG_JSON="[${TAG_JSON%,}]"

      EXPLORER_BODY="{\"title\":\"$PRODUCT — $(echo $NAME | sed 's/fashion-product-//g')\",\"type\":\"image\",\"prompt\":\"$PROMPT_ESC\",\"thumbnailUrl\":\"$URL\",\"mediaUrl\":\"$URL\",\"model\":\"google_image_gen_4_5\",\"tags\":$TAG_JSON,\"categories\":[\"showcase\",\"fashion\",\"product\"],\"status\":\"published\"}"

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
echo "================================================"
echo "  Results: $DONE/$TOTAL images generated"
echo "================================================"
cat "$RESULTS_FILE"
echo ""
echo "Download images with:"
echo 'while IFS="|" read -r name url ratio product; do'
echo '  curl -L -o "public/assets/showcase/${name}.webp" "$url"'
echo 'done < /tmp/fashion_products_results.txt'
echo ""
echo "──────────────────────────────────────────────────"
echo "  Add to SHOWCASE_FASHION_IMAGES in:"
echo "  src/constants/showcase-cdn.ts"
echo "──────────────────────────────────────────────────"
echo ""
echo "Template per image:"
echo '  {'
echo '    id: "NAME", name: "DISPLAY", product: "PRODUCT", character: "product",'
echo '    img: "/assets/showcase/NAME.webp", ratio: "RATIO", tag: "product",'
echo '    prompt: "PROMPT",'
echo '  },'
