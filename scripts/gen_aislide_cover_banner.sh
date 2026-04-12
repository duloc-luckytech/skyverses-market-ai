#!/bin/bash
# gen_aislide_cover_banner.sh
# Gen cover banner image for ai-slide-creator, upload to Cloudflare, PUT to API
# Run: bash scripts/gen_aislide_cover_banner.sh

set -euo pipefail

API="https://api.skyverses.com/image-jobs"
MARKET_API="https://api.skyverses.com/market"
MONGO_ID="69db02f34b8efb9f4d3d7129"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"
CF_ACCOUNT="9ab75114b3032bf3e6ff9386815e4554"
CF_TOKEN="Yp_Ark78qShS4E5bc04KIiLLOZjats0kgt5ragdx"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"

IMG_DIR="public/assets/ai-slide-creator"
mkdir -p "$IMG_DIR"

PROMPT="Professional AI-powered presentation slide creator tool, dark premium UI dashboard showing beautiful slide deck generation interface, multiple polished slides with gradient backgrounds, data charts, icons and modern typography, glowing blue neon accents, glassmorphism panels, ultra-high-end SaaS product screenshot mockup, 16:9 cinematic composition, no readable text, photorealistic, premium dark aesthetic"

echo "┌─────────────────────────────────────────────────────────┐"
echo "│  AI Slide Creator — Cover Banner Generator              │"
echo "└─────────────────────────────────────────────────────────┘"
echo ""
echo "🎨 Submitting image generation job (1200x630)..."

R=$(curl -s -X POST "$API" \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  -d "{\"type\":\"text_to_image\",\"input\":{\"prompt\":\"$PROMPT\"},\"config\":{\"width\":1200,\"height\":630,\"aspectRatio\":\"16:9\",\"seed\":0,\"style\":\"\"},\"engine\":{\"provider\":\"gommo\",\"model\":\"google_image_gen_4_5\"},\"enginePayload\":{\"prompt\":\"$PROMPT\",\"privacy\":\"PRIVATE\",\"projectId\":\"default\"}}")

JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null || echo "")

if [ -z "$JID" ]; then
  echo "❌ Failed to get job ID. Response:"
  echo "$R"
  exit 1
fi

echo "   Job ID: $JID"
echo ""
echo "⏳ Polling result (max 5 min)..."

IMAGE_URL=""
for attempt in $(seq 1 60); do
  sleep 5
  SR=$(curl -s "$API/$JID" -H "Authorization: $TOKEN")
  ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null || echo "unknown")

  if [ "$ST" = "done" ]; then
    IMAGE_URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null || echo "")
    echo "✅ Generated: $IMAGE_URL"
    break
  elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
    echo "❌ Job failed at attempt $attempt"
    echo "$SR"
    exit 1
  else
    printf "   ⏳ Status: %s (%d/60)\r" "$ST" "$attempt"
  fi
done

if [ -z "$IMAGE_URL" ]; then
  echo "❌ Timeout — no image URL after 5 minutes"
  exit 1
fi

# Download image
OUT_FILE="${IMG_DIR}/cover-banner.png"
echo ""
echo "⬇️  Downloading image..."
curl -sL -o "$OUT_FILE" "$IMAGE_URL"
echo "   Saved: $OUT_FILE ($(wc -c < "$OUT_FILE" | tr -d ' ') bytes)"

# Upload to Cloudflare
echo ""
echo "☁️  Uploading to Cloudflare Images..."
CF_RES=$(curl -s -X POST "$CF_API" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -F "file=@${OUT_FILE}" \
  -F "requireSignedURLs=false")

CF_SUCCESS=$(echo "$CF_RES" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null || echo "False")
CDN_URL=$(echo "$CF_RES" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    v = d.get('result', {}).get('variants', [])
    print(next((x for x in v if x.endswith('/public')), v[0] if v else ''))
except: print('')
" 2>/dev/null || echo "")

if [ "$CF_SUCCESS" != "True" ] || [ -z "$CDN_URL" ]; then
  echo "❌ Cloudflare upload failed:"
  echo "$CF_RES"
  # Fallback: use original Skyverses URL
  CDN_URL="$IMAGE_URL"
  echo "⚠️  Falling back to Skyverses URL: $CDN_URL"
fi

echo "   CDN URL: $CDN_URL"

# PUT to market API
echo ""
echo "📤 Updating market item imageUrl..."
PUT_RES=$(curl -s -X PUT "$MARKET_API/$MONGO_ID" \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"imageUrl\": \"$CDN_URL\"}")

PUT_OK=$(echo "$PUT_RES" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null || echo "False")

if [ "$PUT_OK" = "True" ]; then
  echo "✅ imageUrl updated successfully!"
else
  echo "❌ PUT failed:"
  echo "$PUT_RES"
fi

# Cleanup
rm -rf "$IMG_DIR"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Done!"
echo "   CDN URL : $CDN_URL"
echo "   Product  : https://ai.skyverses.com/product/ai-slide-creator"
echo "═══════════════════════════════════════════════════════════"
