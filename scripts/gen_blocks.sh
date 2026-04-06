#!/bin/bash
API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWQwNzg0Yjc4MmI2MGZjMTYzZWIwOGQiLCJlbWFpbCI6ImNodXBldGVzdmFsZGl2aWV6NjExQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwibmFtZSI6IkNodXBldGVzIFZhbGRpdmlleiIsImlhdCI6MTc3NTI3MDQzMywiZXhwIjoxNzc1ODc1MjMzfQ.BN_jQp5dm7H5D8xnauY3lkRg0U1TJEC7RrS7T_rcUYE"

create_job() {
  local PROMPT="$1"
  curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"input\":{\"prompt\":\"$PROMPT\"},\"config\":{\"width\":1024,\"height\":576,\"aspectRatio\":\"16:9\",\"seed\":0,\"style\":\"\"},\"engine\":{\"provider\":\"gommo\",\"model\":\"google_image_gen_4_5\"},\"enginePayload\":{\"prompt\":\"$PROMPT\",\"privacy\":\"PRIVATE\",\"projectId\":\"default\"}}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])"
}

poll_job() {
  local JID="$1" NAME="$2"
  for i in $(seq 1 50); do
    sleep 4
    local SR=$(curl -s "$API/$JID" -H "Authorization: $TOKEN")
    local ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)
    if [ "$ST" = "done" ]; then
      local URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      mkdir -p public/assets/homepage
      curl -sL -o "public/assets/homepage/${NAME}.webp" "$URL"
      sips -Z 800 "public/assets/homepage/${NAME}.webp" --out "public/assets/homepage/${NAME}.webp" 2>/dev/null
      echo "DONE:$NAME"
      return 0
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      echo "FAIL:$NAME"
      return 1
    fi
  done
  echo "TIMEOUT:$NAME"
  return 1
}

echo "=== Creating jobs ==="
J1=$(create_job "A vibrant futuristic illustration of a referral reward program. Two people connected by glowing blue-purple energy lines sharing digital golden credit tokens. Social sharing holographic icons floating around. Dark premium tech background, blue to purple gradient glow, no text, 16:9 aspect ratio")
echo "Referral: $J1"

J2=$(create_job "A futuristic dark illustration of enterprise AI consulting for business. Holographic AI workflow dashboards and blueprint screens floating above a premium dark conference table. Glowing blue-purple circuit board patterns, corporate tech atmosphere, no text, 16:9 aspect ratio")
echo "Enterprise: $J2"

echo "=== Polling ==="
poll_job "$J1" "referral"
poll_job "$J2" "enterprise"

echo "=== Files ==="
ls -la public/assets/homepage/referral.webp public/assets/homepage/enterprise.webp 2>/dev/null
echo "ALLDONE"
