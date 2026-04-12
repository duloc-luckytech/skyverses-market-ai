#!/bin/bash
# =============================================================
# gen_paperclip_landing.sh
# Generate ảnh AI cho landing /product/paperclip-ai-agents
# Pattern: submit all → poll → download → upload Cloudflare
#
# Sections:
#   Hero         — 1 ảnh dashboard screenshot mockup
#   Workflow     — 4 ảnh (1 per step)
#   Features     — 2 ảnh featured (Multi-Agent, Budget Guard)
#   Showcase     — 8 ảnh thumbnail cho agent run cards
#   UseCases     — 8 ảnh illustration per industry
#
# Total: 23 ảnh
# =============================================================

API="https://api.skyverses.com/image-jobs"
TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZGE4M2M0YjAzYTQyNGYxNjE3YTEiLCJlbWFpbCI6ImR1bG9jMjcwOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsIm5hbWUiOiJMb2MgRFYiLCJpYXQiOjE3NzU3MDg4MjEsImV4cCI6MTc3NjMxMzYyMX0.zI71Th5RO0s0AfJf99CiRvN76fgM1_6sC2hb0dwYCQM"
CF_ACCOUNT="9ab75114b3032bf3e6ff9386815e4554"
CF_TOKEN="Yp_Ark78qShS4E5bc04KIiLLOZjats0kgt5ragdx"
CF_API="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/images/v1"

IMG_DIR="public/assets/paperclip"
OUTPUT_FILE="scripts/paperclip_cdn_urls.sh"
mkdir -p "$IMG_DIR"

declare -a NAMES PROMPTS WIDTHS HEIGHTS

# ══════════════════════════════════════════════════════════════
# 1. HERO — AI Org Dashboard screenshot
# ══════════════════════════════════════════════════════════════

NAMES+=("hero-dashboard")
WIDTHS+=(1280); HEIGHTS+=(720)
PROMPTS+=("Ultra-realistic dark-mode SaaS dashboard screenshot for an AI agent orchestration platform. Top navigation bar with logo 'Paperclip' and menu items. Left sidebar with org chart tree: CEO Agent at top connected by lines to Marketing AI, DevOps AI, Sales AI department nodes. Each node has a colored status dot — green for active, amber for waiting. Center panel shows a live task feed: multiple rows of running agent tasks with progress bars, model labels (claude-sonnet, gpt-4o, cursor), cost counters in USD. Right sidebar shows Budget Guard panel with circular progress meters per department showing spend vs limit. Bottom status bar shows '5 agents running · $1.24 spent today · Budget Guard: Active'. Dark navy background #0a0a0c, accent color electric blue #0090ff, clean minimal typography, professional enterprise SaaS UI design. Ultra-sharp 4K screenshot quality.")

# ══════════════════════════════════════════════════════════════
# 2. WORKFLOW — 4 step thumbnails
# ══════════════════════════════════════════════════════════════

# Step 1 — Define Org Chart
NAMES+=("workflow-step1-orgchart")
WIDTHS+=(800); HEIGHTS+=(500)
PROMPTS+=("Clean modern UI screenshot showing an AI org chart builder interface. Dark-mode drag-and-drop canvas with nodes connected by animated dashed lines. Top node labeled 'CEO Agent' in blue, three child nodes below: 'Marketing AI' in purple, 'DevOps AI' in green, 'Sales AI' in amber. Each node is a rounded card with icon, label, and 'Active' status badge. Sidebar shows properties panel for selected node. Grid canvas background. Professional SaaS UI, dark background, crisp sharp screenshot.")

# Step 2 — Assign LLM per Agent
NAMES+=("workflow-step2-assign-llm")
WIDTHS+=(800); HEIGHTS+=(500)
PROMPTS+=("Dark-mode UI modal screenshot showing LLM model assignment for an AI agent. Panel titled 'Configure Agent: Marketing AI'. Dropdown showing model options: Claude 3.5 Sonnet (selected with blue checkmark), GPT-4o, Cursor, GitHub Copilot. Below: system prompt textarea with example marketing prompt text. Below: tool access toggles (Web Search ON, File Write OFF, Email Send ON). Cost estimate badge showing '$0.003/task avg'. Clean professional settings dialog, rounded corners, subtle border, dark UI.")

# Step 3 — Budget Guard & Governance
NAMES+=("workflow-step3-budget")
WIDTHS+=(800); HEIGHTS+=(500)
PROMPTS+=("Dark-mode UI screenshot of a Budget Guard configuration panel. Three sections: 'Per Agent Limit' showing a slider set to $5.00/day with current spend $1.24 shown as a progress bar. 'Department Cap' showing a table with Marketing $20, DevOps $30, Sales $15 monthly limits with usage bars. 'Human Approval Required' showing a toggle list: 'Spend > $10 on single task ON', 'External API calls ON', 'File deletions ON'. Alert email field at bottom. Warning badge reads 'Auto-pause when 80% reached'. Professional dark enterprise UI.")

# Step 4 — Run & Monitor
NAMES+=("workflow-step4-monitor")
WIDTHS+=(800); HEIGHTS+=(500)
PROMPTS+=("Real-time AI agent monitoring dashboard screenshot in dark mode. Main area shows live org activity: CEO Agent dispatching tasks shown as animated flow arrows to department agents. Live log stream on right: timestamped entries like '[Marketing AI] Blog post draft completed · $0.18', '[DevOps AI] CI pipeline running...', '[Sales AI] 3 emails sent'. Bottom: summary strip showing '5 agents active · 12 tasks completed today · Total spend: $2.31 · Budget: 23% used'. Subtle animated pulse dots on active agents. Clean professional monitoring UI, dark background, electric blue accents.")

# ══════════════════════════════════════════════════════════════
# 3. FEATURES — 2 featured card thumbnails
# ══════════════════════════════════════════════════════════════

# Feature 1 — Multi-Agent Orchestration
NAMES+=("feat-multi-agent")
WIDTHS+=(900); HEIGHTS+=(500)
PROMPTS+=("Cinematic visualization of multi-agent AI orchestration. Central glowing blue node labeled 'CEO Agent' with electric connection beams radiating outward to 6 department agent nodes arranged in a circle: Marketing AI (purple), DevOps AI (green), Sales AI (amber), HR AI (cyan), Finance AI (rose), Ops AI (orange). Each outer node is connected to smaller LLM model nodes: claude-sonnet, gpt-4o, cursor icons. Animated particle streams flowing along connection lines showing data transfer. Deep dark background with subtle grid, electric blue glow, cinematic depth. Professional tech visualization art direction.")

# Feature 2 — Budget Guard
NAMES+=("feat-budget-guard")
WIDTHS+=(900); HEIGHTS+=(500)
PROMPTS+=("Professional UI illustration of an AI Budget Guard system. Central large circular gauge showing '68% of $50 monthly budget used' with a glowing electric blue arc. Around it: three smaller gauges for Marketing ($15/$20), DevOps ($18/$30), Sales ($8/$15) departments with colored arcs. Right side: alert panel showing 'Marketing AI paused — awaiting approval to exceed $20 limit' with approve/deny buttons. Green shield icon with checkmark labeled 'Zero surprise billing'. Dark navy background, professional fintech-style UI visualization, clean modern design.")

# ══════════════════════════════════════════════════════════════
# 4. SHOWCASE — 8 agent run card thumbnails
# ══════════════════════════════════════════════════════════════

# Blog Content Campaign
NAMES+=("showcase-blog-campaign")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Minimalist dark-mode UI card showing an AI content generation task result. Card titled 'Blog Content Campaign — Completed'. Shows 5 blog post titles listed with green checkmarks, word counts, and SEO scores shown as small progress bars. Model badge 'claude-sonnet' in blue. Cost badge '$0.24'. 'Marketing AI' department label in purple. Clean compact UI card design, rounded corners, dark background, purple accent color.")

# CI/CD Pipeline Refactor
NAMES+=("showcase-cicd-pipeline")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Dark-mode terminal and pipeline UI card showing a CI/CD refactor task. Card shows GitHub Actions YAML code snippet with syntax highlighting (green, amber, blue tokens on dark background). Below: metrics comparison 'Build time: 8 min → 3 min' with a before/after bar chart in green. Model badge 'cursor + gpt-4o'. Status indicator 'Running' with animated blue pulse dot. Cost badge '$0.18'. 'DevOps AI' label in green. Clean developer tool aesthetic.")

# CRM Lead Outreach
NAMES+=("showcase-crm-outreach")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Dark-mode CRM email outreach results card. Shows a mini email campaign dashboard: 50 contacts listed with tiny avatar circles, green 'Sent' badges, open rate meter showing '42% opened'. One email preview panel showing personalized opening line. 'Auto follow-up in 3 days' badge in amber. Model badge 'gpt-4o'. Status 'Completed' with green checkmark. Cost badge '$0.09'. 'Sales AI' department label in amber. Clean modern CRM UI card aesthetic.")

# Performance Audit Report
NAMES+=("showcase-perf-audit")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Dark-mode web performance audit report card. Shows Core Web Vitals scores for 12 pages: LCP, FID, CLS scores as colored circles (green good, amber needs improvement). Mini Lighthouse score gauges showing 94/100 performance. Below: 3 top fix recommendations as bullet points. Model badge 'claude-sonnet'. Status 'Completed' with green checkmark. Cost badge '$0.31'. 'DevOps AI' label in green. Professional web analytics UI card style.")

# Social Media Content Batch
NAMES+=("showcase-social-batch")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Dark-mode social media content batch creation card. Shows a grid of 9 mini social post preview cards: some LinkedIn-style text posts, some with abstract colored gradient backgrounds for visual posts. Labels 'LinkedIn', 'X', 'Facebook' as small platform badges. Counter '30 posts generated' in blue. Hashtag cloud in small text below. Model badge 'claude-sonnet'. Status 'Running' with blue pulse dot. Cost '$0.07'. 'Marketing AI' label in purple. Clean content creator UI.")

# Support Knowledge Base
NAMES+=("showcase-support-kb")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Dark-mode knowledge base creation task card showing a waiting-for-approval state. Card shows Notion-style document icons representing FAQ articles, with a 'Pending Human Approval' banner overlay in amber. Lock icon on Notion database access request. Shows '200 support tickets queued for analysis' in gray text. Approval request message: 'Grant access to Notion database?' with Approve / Deny buttons. Model badge 'gpt-4o'. Status 'Awaiting Approval' in amber. Cost '$0.00'. 'Ops AI' label in red.")

# Competitor Analysis
NAMES+=("showcase-competitor-research")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Dark-mode competitor analysis report card. Shows a mini SWOT matrix (2x2 grid: Strengths green, Weaknesses red, Opportunities blue, Threats amber) with tiny bullet points. Below: 10 competitor logos represented as colored placeholder circles with company initials. Badge '15-page analysis deck generated'. Model badge 'claude-sonnet'. Status 'Completed' with green checkmark. Cost '$0.42'. 'Marketing AI' label in purple. Professional business intelligence UI card style.")

# API Documentation Update
NAMES+=("showcase-api-docs")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Dark-mode API documentation update card. Shows a mini OpenAPI spec viewer: endpoint list on left (GET /users, POST /agents, DELETE /jobs etc.) with colored method badges. Right panel shows auto-generated code example in Python with syntax highlighting. Progress indicator '45 endpoints documented'. Model badge 'cursor' in amber. Status 'Completed' with green checkmark. Cost '$0.15'. 'DevOps AI' label in green. Clean developer documentation UI card aesthetic.")

# ══════════════════════════════════════════════════════════════
# 5. USE CASES — 8 industry illustrations
# ══════════════════════════════════════════════════════════════

# Startup & Scale-up
NAMES+=("usecase-startup")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Vibrant isometric illustration of a small startup office with 3 people at desks. Floating AI agent bubbles above each desk labeled 'Marketing AI', 'DevOps AI', 'Sales AI' with glowing blue connection lines to each person. Rocket launch icon in background window. Bright energetic color palette: electric blue, white, light gray. Modern flat-to-isometric art style. Clean startup aesthetic with subtle tech glow.")

# Software Agency
NAMES+=("usecase-software-agency")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Isometric illustration of a software development agency setup. Multiple monitors showing code editors (dark mode with syntax highlighting). AI agent nodes floating above: 'Cursor AI' writing code, 'GPT-4o' reviewing, 'Claude' writing docs. Flow arrows showing automated delivery pipeline. Purple and green accent colors. 3x faster delivery badge. Modern tech illustration style, clean lines, professional.")

# Marketing Agency
NAMES+=("usecase-marketing-agency")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Vibrant illustration of a marketing agency with multiple client campaigns running simultaneously. Split screen showing 3 client brand panels each with their own AI agent working on content, each with distinct brand colors. Amber and orange accent colors. Content pieces (social posts, ads, blogs) floating as preview cards. 'Brand voice isolated per client' badge. Dynamic energetic marketing aesthetic, modern flat illustration style.")

# E-commerce
NAMES+=("usecase-ecommerce")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Modern isometric e-commerce illustration. Online store dashboard with product grid, shopping cart icon, order flow chart. AI agents labeled 'Product AI', 'Ads AI', 'Monitor AI' each working on different tasks simultaneously with progress indicators. Green accent color for growth metrics. Sales graph trending up. Package delivery icons. Clean modern e-commerce tech illustration style.")

# Edtech & Online Learning
NAMES+=("usecase-edtech")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Warm illustrated scene of AI-powered online education platform. Laptop showing video lesson interface, surrounding AI agent nodes: 'Curriculum AI' building course outline, 'Grading AI' evaluating assignments, 'Support AI' answering student questions. Graduation cap icon, book icons, student avatar icons. Cyan and blue accent colors. Friendly approachable education illustration style, warm lighting.")

# Healthcare Admin
NAMES+=("usecase-healthcare")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Clean clinical illustration of AI agents handling healthcare administration tasks. Hospital building outline in background. AI agents: 'Scheduling AI' managing appointment calendar, 'Insurance AI' processing pre-auth documents, 'Patient FAQ AI' answering queries. HIPAA compliance shield badge prominently displayed. Red and white medical color palette. Professional healthcare tech illustration, clean lines, trustworthy aesthetic.")

# FinTech & Finance
NAMES+=("usecase-fintech")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Sophisticated illustration of AI agents in financial services. Central data visualization: real-time risk assessment graphs, compliance document generation, financial report dashboard. AI agents: 'Risk AI', 'Compliance AI', 'Report AI'. Human approval checkpoints shown as orange gates before critical outputs. Gold and lime green accent colors. 'Human-in-the-loop' badge prominent. Professional fintech illustration, data-driven aesthetic.")

# Remote-first Company
NAMES+=("usecase-remote")
WIDTHS+=(600); HEIGHTS+=(400)
PROMPTS+=("Global remote-work illustration showing world map with glowing city dots connected by lines. Clock showing different timezones (08:00 Tokyo, 01:00 London, 20:00 NYC). While human avatars are asleep (zzz icons), AI agent nodes are active and glowing: processing tasks, sending reports, preparing briefings. Pink and indigo accent colors. '24/7 autonomous operation' badge. Modern global tech illustration style, clean and friendly.")

# ══════════════════════════════════════════════════════════════
# SUBMIT ALL JOBS
# ══════════════════════════════════════════════════════════════

JOBIDS=()
echo "🎨 Submitting ${#NAMES[@]} image jobs for Paperclip AI Agents..."
echo ""

for i in "${!NAMES[@]}"; do
  NAME="${NAMES[$i]}"
  P="${PROMPTS[$i]}"
  W="${WIDTHS[$i]}"
  H="${HEIGHTS[$i]}"

  R=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"input\":{\"prompt\":\"$P\"},\"config\":{\"width\":$W,\"height\":$H,\"aspectRatio\":\"${W}:${H}\",\"seed\":0,\"style\":\"\"},\"engine\":{\"provider\":\"gommo\",\"model\":\"google_image_gen_4_5\"},\"enginePayload\":{\"prompt\":\"$P\",\"privacy\":\"PRIVATE\",\"projectId\":\"default\"}}")

  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  JOBIDS+=("$JID")
  echo "  [$((i+1))/${#NAMES[@]}] $NAME (${W}x${H}) → jobId: $JID"
  sleep 1
done

# ══════════════════════════════════════════════════════════════
# POLL → DOWNLOAD
# ══════════════════════════════════════════════════════════════

echo ""
echo "⏳ Polling results..."
echo ""

for i in "${!NAMES[@]}"; do
  JID="${JOBIDS[$i]}"
  NAME="${NAMES[$i]}"
  [ -z "$JID" ] && echo "❌ $NAME: no job ID" && continue

  echo -n "  ⏳ $NAME ... "
  for attempt in $(seq 1 60); do
    sleep 5
    SR=$(curl -s "$API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "✅"
      echo "     → $URL"
      curl -sL -o "${IMG_DIR}/${NAME}.png" "$URL"
      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      echo "❌ FAILED"; break
    else
      printf "(%d)..." "$attempt"
    fi
  done
done

# ══════════════════════════════════════════════════════════════
# UPLOAD → CLOUDFLARE CDN
# ══════════════════════════════════════════════════════════════

echo ""
echo "☁️  Uploading to Cloudflare Images..."
echo ""

cat > "$OUTPUT_FILE" << 'HEADER'
#!/bin/bash
# AUTO-GENERATED: Paperclip AI Agents — Cloudflare CDN URLs
# Sections: Hero (1), Workflow (4), Features (2), Showcase (8), UseCases (8)
HEADER

UPLOADED=0

for i in "${!NAMES[@]}"; do
  NAME="${NAMES[$i]}"
  FILE="${IMG_DIR}/${NAME}.png"
  [ ! -f "$FILE" ] && echo "⚠️  Skip $NAME (not downloaded)" && continue

  echo -n "  ⬆  $NAME ... "
  RESPONSE=$(curl -s -X POST "$CF_API" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -F "file=@${FILE}" \
    -F "requireSignedURLs=false")

  SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null)
  URL=$(echo "$RESPONSE" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    variants = d.get('result', {}).get('variants', [])
    print(next((v for v in variants if v.endswith('/public')), variants[0] if variants else ''))
except:
    print('')
" 2>/dev/null)

  if [ "$SUCCESS" = "True" ] && [ -n "$URL" ]; then
    echo "✅  $URL"
    echo "CDN_${NAME//-/_}=\"${URL}\"" >> "$OUTPUT_FILE"
    UPLOADED=$((UPLOADED + 1))
  else
    echo "❌  $(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors','?'))" 2>/dev/null)"
  fi
  sleep 0.3
done

# Cleanup local PNGs
rm -rf "$IMG_DIR"

echo ""
echo "══════════════════════════════════════════════════════════"
echo "✅ Uploaded: $UPLOADED/${#NAMES[@]} → Cloudflare CDN"
echo "📋 URLs saved to: $OUTPUT_FILE"
echo "🗑  Deleted: $IMG_DIR"
echo ""
echo "Next: node scripts/apply_paperclip_cdn.cjs"
echo "══════════════════════════════════════════════════════════"
