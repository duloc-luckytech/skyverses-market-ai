#!/bin/bash
API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWQwNzg0Yjc4MmI2MGZjMTYzZWIwOGQiLCJlbWFpbCI6ImNodXBldGVzdmFsZGl2aWV6NjExQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwibmFtZSI6IkNodXBldGVzIFZhbGRpdmlleiIsImlhdCI6MTc3NTI3MDQzMywiZXhwIjoxNzc1ODc1MjMzfQ.BN_jQp5dm7H5D8xnauY3lkRg0U1TJEC7RrS7T_rcUYE"

declare -a NAMES
declare -a PROMPTS

# ═══════════════════════════════════════════════════════════════
# SEO OG Image — 1200x630 for social sharing & Google SERP
# ═══════════════════════════════════════════════════════════════

NAMES+=("seo-og-thumbnail")
PROMPTS+=("A premium futuristic hero banner for an AI marketplace platform called SKYVERSES. Dark deep space background with subtle star particles. Center composition showing a glowing blue hexagonal portal emitting multiple floating holographic screens displaying AI-generated content: a video player, a stunning photograph, a music waveform, and a chat interface. Around the portal, floating brand logos and icons representing AI models arranged in an arc. Electric blue (#0090ff) and deep purple (#7c3aed) gradient energy beams connecting them. Cinematic lighting with volumetric fog effects. Ultra premium, sleek, professional tech aesthetic. No text or words on the image. Aspect ratio exactly 1200x630. Photorealistic 3D render quality.")

NAMES+=("seo-og-thumbnail-v2")
PROMPTS+=("A breathtaking wide banner image for AI technology marketplace. Abstract futuristic composition: a massive glowing AI brain core in the center radiating energy outward, connected by light streams to floating holographic cards showing video generation, image creation, music production, voice synthesis, and workflow automation. Deep dark navy background (#0a0b14) with electric blue (#0090ff), purple (#8b5cf6), and amber (#f59e0b) neon glow accents. Glass morphism floating panels. Particle effects and lens flares. Extremely premium, ultra-modern tech aesthetic reminiscent of Apple or NVIDIA keynote visuals. No text. 1200x630 composition.")

NAMES+=("seo-og-thumbnail-v3")
PROMPTS+=("An ultra-wide cinematic hero image for a cutting-edge AI platform. Top-down isometric view of a futuristic digital workspace: multiple floating holographic workstations arranged in a semicircle, each showing different AI capabilities - one generating a stunning portrait photo, another rendering a 4K video, one composing music with visible waveforms, one showing a chatbot conversation, and one building an automated workflow pipeline. All connected by flowing cyan-blue data streams. Dark matte black background with deep blue (#0090ff) accent lighting. Volumetric light rays from above. Sleek minimalist premium design. No text characters. 1200x630.")

JOBIDS=()

echo "🎨 Creating ${#NAMES[@]} SEO thumbnail jobs..."
for i in "${!NAMES[@]}"; do
  P="${PROMPTS[$i]}"
  R=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"input\":{\"prompt\":\"$P\"},\"config\":{\"width\":1200,\"height\":630,\"aspectRatio\":\"1200:630\",\"seed\":0,\"style\":\"\"},\"engine\":{\"provider\":\"gommo\",\"model\":\"google_image_gen_4_5\"},\"enginePayload\":{\"prompt\":\"$P\",\"privacy\":\"PRIVATE\",\"projectId\":\"default\"}}")
  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  JOBIDS+=("$JID")
  echo "  [$((i+1))/${#NAMES[@]}] ${NAMES[$i]} → $JID"
  sleep 1
done

echo ""
echo "⏳ Polling results..."

for i in "${!NAMES[@]}"; do
  JID="${JOBIDS[$i]}"
  NAME="${NAMES[$i]}"
  [ -z "$JID" ] && echo "❌ $NAME: no job ID" && continue
  
  for attempt in $(seq 1 60); do
    sleep 4
    SR=$(curl -s "$API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)
    
    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "✅ $NAME → $URL"
      # Download
      mkdir -p public/assets/seo
      curl -sL -o "public/assets/seo/${NAME}.png" "$URL"
      echo "   📁 Saved: public/assets/seo/${NAME}.png"
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
echo "═══════════════════════════════════════════"
echo "📁 SEO Thumbnails generated:"
ls -la public/assets/seo/ 2>/dev/null
echo ""
echo "🔗 After choosing the best one, update these files:"
echo "   1. index.html → og:image, twitter:image"
echo "   2. manifest.json → screenshots"  
echo "   3. Upload to CDN or use relative path /assets/seo/seo-og-thumbnail.png"
echo "═══════════════════════════════════════════"
echo "🏁 Done!"
