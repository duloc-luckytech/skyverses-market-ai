#!/bin/bash
# Generate 3 banner images for Credits Universe section
API="http://localhost:3221/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWQwNzg0Yjc4MmI2MGZjMTYzZWIwOGQiLCJlbWFpbCI6ImNodXBldGVzdmFsZGl2aWV6NjExQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwibmFtZSI6IkNodXBldGVzIFZhbGRpdmlleiIsImlhdCI6MTc3NTI3MDQzMywiZXhwIjoxNzc1ODc1MjMzfQ.BN_jQp5dm7H5D8xnauY3lkRg0U1TJEC7RrS7T_rcUYE"

PROMPTS=(
  "A sleek futuristic dark UI illustration of buying AI credits. A glowing golden credit coin with lightning bolt symbol floating above a premium dark interface. Amber-to-orange glow, glassmorphism card, shopping cart icon, dark background #0a0e1a. Ultra-modern fintech aesthetic, no text, 16:9"
  "A futuristic dark UI illustration showing AI credits being used across multiple tools. Floating holographic icons of video camera, image canvas, microphone, music note, connected by glowing amber energy lines to a central golden token. Constellation network style, dark background #0a0e1a, amber trails, no text, 16:9"
  "A futuristic dark UI illustration of unlimited credit top-up. A glowing circular refresh arrow with golden amber particles flowing in a loop. Progress bar filling with golden light, floating credit coins. Dark background #0a0e1a, amber-orange gradient glow, glassmorphism, no text, 16:9"
)

NAMES=("buy_credits" "use_everywhere" "topup_anytime")

for i in 0 1 2; do
  echo "🎨 Generating banner ${NAMES[$i]}..."
  
  RESPONSE=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{
      \"type\": \"text_to_image\",
      \"input\": { \"prompt\": \"${PROMPTS[$i]}\" },
      \"config\": { \"width\": 1024, \"height\": 576, \"aspectRatio\": \"16:9\", \"seed\": 0, \"style\": \"\" },
      \"engine\": { \"provider\": \"gommo\", \"model\": \"google_image_gen_4_5\" },
      \"enginePayload\": { \"prompt\": \"${PROMPTS[$i]}\", \"privacy\": \"PRIVATE\", \"projectId\": \"default\" }
    }")
  
  JOBID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  
  if [ -z "$JOBID" ]; then
    echo "❌ Failed to create job for ${NAMES[$i]}: $RESPONSE"
    continue
  fi
  
  echo "📋 Job ID: $JOBID — polling..."
  
  # Poll until done
  for attempt in $(seq 1 60); do
    sleep 3
    STATUS_RES=$(curl -s -X GET "$API/$JOBID" -H "Authorization: $TOKEN")
    STATUS=$(echo "$STATUS_RES" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)
    
    if [ "$STATUS" = "done" ]; then
      IMAGE_URL=$(echo "$STATUS_RES" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "✅ ${NAMES[$i]} DONE: $IMAGE_URL"
      break
    elif [ "$STATUS" = "failed" ] || [ "$STATUS" = "error" ]; then
      echo "❌ ${NAMES[$i]} FAILED"
      break
    else
      echo "   ⏳ ${NAMES[$i]}: $STATUS (attempt $attempt/60)"
    fi
  done
done

echo ""
echo "🏁 All jobs completed!"
