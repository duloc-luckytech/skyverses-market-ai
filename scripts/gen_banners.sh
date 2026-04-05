#!/bin/bash
API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWQwNzg0Yjc4MmI2MGZjMTYzZWIwOGQiLCJlbWFpbCI6ImNodXBldGVzdmFsZGl2aWV6NjExQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwibmFtZSI6IkNodXBldGVzIFZhbGRpdmlleiIsImlhdCI6MTc3NTI3MDQzMywiZXhwIjoxNzc1ODc1MjMzfQ.BN_jQp5dm7H5D8xnauY3lkRg0U1TJEC7RrS7T_rcUYE"

# Also poll the 2 already-created jobs
JOBS=("69d2901e8d8e29c3ded62fb0" "69d290408d8e29c3ded62ff6")
NAMES=("buy_credits" "use_everywhere")

# Create job 3
echo "🎨 Creating banner 3: topup_anytime..."
R3=$(curl -s -X POST "$API" \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  -d '{"type":"text_to_image","input":{"prompt":"A futuristic dark illustration of unlimited credit topup. Glowing circular refresh arrow with golden amber particles flowing in a loop. Progress bar filling with golden light, floating credit coins, dark background, amber-orange gradient glow, glassmorphism, no text"},"config":{"width":1024,"height":576,"aspectRatio":"16:9","seed":0,"style":""},"engine":{"provider":"gommo","model":"google_image_gen_4_5"},"enginePayload":{"prompt":"A futuristic dark illustration of unlimited credit topup. Glowing circular refresh arrow with golden amber particles flowing in a loop. Progress bar filling with golden light, floating credit coins, dark background, amber-orange gradient glow, glassmorphism, no text","privacy":"PRIVATE","projectId":"default"}}')
JOB3=$(echo "$R3" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
echo "📋 Job 3: $JOB3"
JOBS+=("$JOB3")
NAMES+=("topup_anytime")

echo ""
echo "⏳ Polling all 3 jobs..."
echo ""

for i in 0 1 2; do
  JOBID=${JOBS[$i]}
  NAME=${NAMES[$i]}
  echo "--- Polling $NAME ($JOBID) ---"
  
  for attempt in $(seq 1 40); do
    sleep 4
    SR=$(curl -s "$API/$JOBID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)
    
    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "✅ $NAME DONE → $URL"
      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      echo "❌ $NAME FAILED"
      break
    else
      printf "   ⏳ %s: %s (%d/40)\r" "$NAME" "$ST" "$attempt"
    fi
  done
  echo ""
done

echo "🏁 Done!"
