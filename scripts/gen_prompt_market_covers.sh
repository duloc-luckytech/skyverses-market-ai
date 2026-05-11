#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# gen_prompt_market_covers.sh
# Phase 1: Generate cover images + example outputs for 50 Prompt Market sets
# Phase 2: Poll results & save URLs to results file
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

API="https://api.skyverses.com/api-client/external/image-task"
TOKEN="Bearer ${SKYVERSES_EXTERNAL_API_TOKEN:?set SKYVERSES_EXTERNAL_API_TOKEN}"

RESULTS_FILE="/tmp/prompt_market_cover_results.txt"
EXAMPLE_RESULTS_FILE="/tmp/prompt_market_example_results.txt"
> "$RESULTS_FILE"
> "$EXAMPLE_RESULTS_FILE"

# ═══════════════════════════════════════════════════════════════
# COVER IMAGES — 50 covers (one per prompt set)
# Each cover visually represents the prompt set theme
# ═══════════════════════════════════════════════════════════════
declare -a NAMES
declare -a PROMPTS
declare -a RATIOS

# ── 1. React + Tailwind Component Library ──
NAMES+=("pm-01-react-tailwind")
RATIOS+=("16:9")
PROMPTS+=("A stunning dark-themed code editor screenshot showing a beautiful React dashboard UI with Tailwind CSS components, featuring a sidebar navigation with gradient highlights, data cards with charts, a modal overlay with form elements, vibrant syntax-highlighted JSX code floating beside the rendered UI, purple and cyan accent colors on a deep charcoal background, modern developer workspace aesthetic, ultra-sharp 4K render, professional product screenshot quality")

# ── 2. Full-Stack API Architecture Kit ──
NAMES+=("pm-02-api-architecture")
RATIOS+=("16:9")
PROMPTS+=("An elegant technical architecture diagram rendered in 3D isometric style on a dark navy background, showing microservices connected by glowing data flow lines, API gateway node in the center radiating connections to database, cache, auth service, message queue, and CDN nodes, each service represented as a floating glass cube with icons inside, soft neon blue and green lighting, futuristic network visualization, clean minimal design")

# ── 3. Python AI/ML Pipeline Templates ──
NAMES+=("pm-03-python-ml")
RATIOS+=("16:9")
PROMPTS+=("A cinematic visualization of a machine learning pipeline, showing data flowing through neural network layers rendered as glowing interconnected nodes in deep purple and electric blue, Python code snippets floating transparently in the background, 3D scatter plot and confusion matrix visualizations hovering in holographic display style, dark background with bioluminescent data particles, futuristic AI research lab aesthetic")

# ── 4. Next.js 15 SaaS Starter ──
NAMES+=("pm-04-nextjs-saas")
RATIOS+=("16:9")
PROMPTS+=("A premium SaaS application landing page mockup displayed on a MacBook Pro screen in a clean minimal workspace, the screen showing a dark-themed dashboard with user analytics charts, subscription management panel, and team collaboration features, Next.js logo subtly glowing in the corner, ambient purple and blue gradient lighting reflecting on the desk surface, professional product photography style")

# ── 5. React Native Mobile App ──
NAMES+=("pm-05-react-native")
RATIOS+=("16:9")
PROMPTS+=("Three modern smartphones floating in 3D space showing different screens of a beautiful mobile app — a social feed screen, a profile page with gradient header, and a settings screen with dark mode toggle, React Native code fragments floating between the phones as glowing transparent panels, deep dark background with soft blue and purple gradient lighting, mobile app showcase photography style, ultra-realistic device renders")

# ── 6. DevOps & Cloud Infrastructure ──
NAMES+=("pm-06-devops-cloud")
RATIOS+=("16:9")
PROMPTS+=("A futuristic cloud infrastructure control room visualization, holographic displays showing Kubernetes cluster topology, CI/CD pipeline stages flowing like a river of light, Docker container icons arranged in a grid, server rack silhouettes in the background with pulsing green status LEDs, terminal windows showing deployment logs, dark cyberpunk aesthetic with cyan and orange accent colors, command center atmosphere")

# ── 7. CLI Tool Generator ──
NAMES+=("pm-07-cli-tool")
RATIOS+=("16:9")
PROMPTS+=("A sleek terminal window on a dark background showing a beautiful CLI application with colorful output — ASCII art banner, progress bars with gradient fills, interactive menu with highlighted selection, tree-view file structure display, green success checkmarks and formatted tables, the terminal has a frosted glass effect with subtle reflections, ambient purple underglow lighting on the desk, developer aesthetic")

# ── 8. Testing & QA Automation ──
NAMES+=("pm-08-testing-qa")
RATIOS+=("16:9")
PROMPTS+=("A visual dashboard showing test automation results with all tests passing in bright green, a code coverage heat map with gradient from red to green, test pyramid diagram with unit/integration/e2e layers glowing, bug icons being caught by an automated net, dark navy background with clean grid lines, data visualization style with modern chart aesthetics, QA dashboard premium design")

# ── 9. SQL & Database Query Mastery ──
NAMES+=("pm-09-sql-database")
RATIOS+=("16:9")
PROMPTS+=("An elegant database visualization showing interconnected tables as floating 3D glass panels with column names visible, SQL query text glowing in golden amber color flowing between tables like light streams, entity relationship lines connecting primary and foreign keys, query execution plan displayed as a flowing diagram, dark background with warm amber and teal accent lighting, data engineering aesthetic")

# ── 10. Blog & SEO Content Engine ──
NAMES+=("pm-10-blog-seo")
RATIOS+=("16:9")
PROMPTS+=("A content creator workspace showing a blog article being written with AI assistance, the screen split between a rich text editor with formatted headings and paragraphs on the left, and an SEO analytics panel on the right showing keyword rankings rising, search traffic graph trending upward, green checkmarks for on-page SEO factors, warm golden and white color scheme on dark background, content marketing dashboard aesthetic")

# ── 11. Fiction & Storytelling Masterclass ──
NAMES+=("pm-11-fiction-writing")
RATIOS+=("16:9")
PROMPTS+=("A magical open book floating in a dark ethereal space with golden glowing pages, story elements emerging from the pages as 3D illustrations — a castle, a dragon, character silhouettes, a mystical forest — all rendered in warm golden light particles, quill pen made of light writing in the air, scattered plot structure cards and story arc diagrams floating nearby, fantasy literature aesthetic with cinematic volumetric lighting")

# ── 12. High-Converting Email Copy ──
NAMES+=("pm-12-email-copy")
RATIOS+=("16:9")
PROMPTS+=("A marketing dashboard showing email campaign performance with dramatically high open rates and click-through rates displayed as large glowing numbers, multiple email template previews arranged in a grid showing different styles — welcome series, promotional, newsletter — email conversion funnel visualization with upward arrows, dark background with coral orange and white accent colors, email marketing analytics aesthetic")

# ── 13. Resume & Cover Letter AI Writer ──
NAMES+=("pm-13-resume-writer")
RATIOS+=("16:9")
PROMPTS+=("A beautifully designed resume document displayed on a clean workspace, the resume showing a modern two-column layout with professional headshot placeholder, skills bars, experience timeline, and education section, an AI assistant icon suggesting improvements with glowing edit marks, the resume transitioning from a rough draft on the left to a polished version on the right, warm professional lighting, clean minimal background")

# ── 14. Technical Documentation Generator ──
NAMES+=("pm-14-tech-docs")
RATIOS+=("16:9")
PROMPTS+=("A developer documentation website displayed in a modern browser window, showing a clean API reference page with code examples in multiple languages, a navigation sidebar with organized sections, syntax-highlighted request/response examples, interactive API playground panel, the page design uses a dark theme with blue and green accents, professional documentation site aesthetic like Stripe or Vercel docs")

# ── 15. Academic Writing & Research ──
NAMES+=("pm-15-academic")
RATIOS+=("16:9")
PROMPTS+=("An academic research workspace with a scholarly paper being composed on screen, citation network visualization floating as connected nodes showing research paper relationships, APA-formatted references organizing themselves automatically, research methodology diagram with flowchart arrows, university library bookshelves blurred in the background, warm amber desk lamp lighting, intellectual scholarly atmosphere")

# ── 16. Copywriting Power Formulas ──
NAMES+=("pm-16-copywriting")
RATIOS+=("16:9")
PROMPTS+=("A creative advertising workspace showing multiple copywriting formulas visualized as golden frameworks — AIDA funnel, PAS structure, BAB bridge — each rendered as elegant infographic elements floating in 3D space, compelling headline examples displayed on advertising mockups (billboard, social ad, landing page), persuasive power words highlighted in glowing text, dark background with bold red and gold accent colors, advertising creative studio aesthetic")

# ── 17. Podcast & YouTube Script Writer ──
NAMES+=("pm-17-podcast-youtube")
RATIOS+=("16:9")
PROMPTS+=("A content creator studio setup showing a podcast microphone and camera on a desk, with a screenplay-style script displayed on the monitor showing timestamps, speaker labels, and segment transitions, YouTube video thumbnail previews arranged alongside, audio waveform visualization at the bottom, podcast episode structure diagram floating nearby, warm studio lighting with red and purple accents on dark background, creator economy workspace aesthetic")

# ── 18. 30-Day Social Media Calendar ──
NAMES+=("pm-18-social-calendar")
RATIOS+=("16:9")
PROMPTS+=("A beautifully designed 30-day content calendar displayed as a modern UI with color-coded post types — Instagram pink, Facebook blue, Twitter cyan, LinkedIn navy, TikTok gradient — each day showing scheduled content thumbnails and posting times, engagement metrics floating above showing likes and comments trending upward, social media platform icons arranged decoratively, dark theme with vibrant social media brand colors, content planning tool aesthetic")

# ── 19. Facebook & Google Ads Copy ──
NAMES+=("pm-19-ads-copy")
RATIOS+=("16:9")
PROMPTS+=("A digital advertising command center showing Facebook and Google Ads dashboards side by side, ad creative previews showing carousel ads, search ads, and display banners with compelling copy, performance metrics showing high ROAS and conversion rates as glowing green numbers, audience targeting visualization as demographic bubbles, A/B test comparison panels, dark background with Facebook blue and Google multicolor accents, paid media manager workspace")

# ── 20. Product Launch Marketing Playbook ──
NAMES+=("pm-20-product-launch")
RATIOS+=("16:9")
PROMPTS+=("A dramatic product launch countdown visualization, a sleek product hovering on a spotlight stage with launch timeline flowing horizontally showing pre-launch, launch day, and post-launch phases as illuminated milestones, marketing channel icons (email, social, PR, ads) orbiting the product, viral growth curve graph glowing in the background, confetti particles beginning to fall, dark cinematic background with warm golden spotlight, Apple-style product launch aesthetic")

# ── 21. Brand Voice & Messaging Framework ──
NAMES+=("pm-21-brand-voice")
RATIOS+=("16:9")
PROMPTS+=("An elegant brand identity board floating in 3D space showing brand personality attributes arranged as a radar chart, typography specimens displayed in various weights, color palette swatches arranged harmoniously, brand voice tone spectrum from formal to casual visualized as a gradient slider, messaging hierarchy pyramid, mood board collage of lifestyle imagery, minimalist design studio aesthetic with soft warm lighting on dark background")

# ── 22. Influencer Marketing Outreach ──
NAMES+=("pm-22-influencer")
RATIOS+=("16:9")
PROMPTS+=("A social media influencer network visualization showing interconnected profile nodes of varying sizes representing follower counts, engagement rate badges floating beside each node, collaboration message templates displayed as chat bubbles with professional outreach copy, campaign ROI dashboard in the corner showing positive metrics, Instagram and TikTok aesthetic backgrounds with gradient pink and purple, creator marketplace platform design")

# ── 23. SEO Audit & Strategy Generator ──
NAMES+=("pm-23-seo-audit")
RATIOS+=("16:9")
PROMPTS+=("A comprehensive SEO audit dashboard showing website health score as a large circular gauge in green, keyword ranking tracker with positions improving over time, backlink profile visualization as a network graph, technical SEO checklist with green checkmarks, page speed metrics, Core Web Vitals scores displayed prominently, search engine results page mockup showing first position, dark theme with green and white accents, SEO tool interface aesthetic")

# ── 24. Email Marketing Automation ──
NAMES+=("pm-24-email-automation")
RATIOS+=("16:9")
PROMPTS+=("A visual email marketing automation workflow builder showing a flowchart of triggered email sequences — welcome series, abandoned cart, re-engagement — connected by animated arrows, each node showing email preview thumbnails with open rate percentages, subscriber segments represented as color-coded groups flowing through the funnel, automation triggers displayed as lightning bolt icons, dark background with warm orange and white accents, marketing automation platform aesthetic")

# ── 25. CRO & A/B Testing Playbook ──
NAMES+=("pm-25-cro-testing")
RATIOS+=("16:9")
PROMPTS+=("A split-screen A/B test comparison showing two landing page variants side by side — Version A and Version B — with conversion rate percentages displayed prominently, statistical significance indicator showing a winner, heat map overlay showing click patterns, conversion funnel visualization narrowing from visitors to customers, uplift percentage displayed as a large green number with an upward arrow, dark background with green and amber accents, data-driven optimization dashboard")

# ── 26. Midjourney V7 Prompt Mastery ──
NAMES+=("pm-26-midjourney")
RATIOS+=("16:9")
PROMPTS+=("A spectacular gallery wall of AI-generated artworks in diverse styles — photorealistic portrait, fantasy landscape, abstract art, product photography, architectural visualization — each framed in elegant dark frames with a small prompt text card below, the gallery has dramatic museum lighting with spotlights on each piece, Midjourney diamond logo subtly glowing, premium art exhibition aesthetic on dark walls with warm accent lighting")

# ── 27. DALL·E 3 & Flux Pro Prompt Pack ──
NAMES+=("pm-27-dalle-flux")
RATIOS+=("16:9")
PROMPTS+=("A creative AI art studio workspace with multiple generated images displayed on floating holographic screens — a hyperrealistic product photo, a whimsical illustration, a logo design, a texture pattern — paint brush and digital tools floating in the air alongside text prompts, each image showing dramatically different styles demonstrating versatility, deep purple and warm orange gradient lighting, futuristic digital art studio atmosphere")

# ── 28. UI/UX Design System Prompts ──
NAMES+=("pm-28-uiux-design")
RATIOS+=("16:9")
PROMPTS+=("A comprehensive UI design system displayed as organized component cards — buttons in various states, input fields, navigation bars, cards, modals, typography scale, icon set, spacing grid — all arranged in a clean grid layout with measurements and guidelines, Figma-style canvas with rulers and guides visible, modern design tool interface with layers panel, dark theme with purple and white accent colors, design system documentation aesthetic")

# ── 29. Logo & Brand Identity Generator ──
NAMES+=("pm-29-logo-branding")
RATIOS+=("16:9")
PROMPTS+=("A brand identity presentation board showing a collection of AI-generated logo concepts — minimalist wordmark, abstract symbol, lettermark, mascot, emblem — each displayed on mockups including business card, letterhead, and app icon, brand color palette and typography pairings shown below, the logos range from tech startup to luxury brand styles, clean white presentation on dark charcoal background with subtle grid, brand design agency portfolio aesthetic")

# ── 30. Stable Diffusion XL Workflow Pack ──
NAMES+=("pm-30-sdxl-workflow")
RATIOS+=("16:9")
PROMPTS+=("A ComfyUI-style node-based workflow editor showing an AI image generation pipeline with connected processing nodes — text encoder, sampler, VAE decoder, ControlNet, LoRA loader, upscaler — each node displaying preview thumbnails of the processing stages, the final output showing a stunning generated image, dark editor background with colored node connections in blue, green, and orange, technical AI workflow builder aesthetic")

# ── 31. Social Media Graphics Prompt Kit ──
NAMES+=("pm-31-social-graphics")
RATIOS+=("16:9")
PROMPTS+=("A vibrant collection of social media post templates arranged in a masonry grid — Instagram carousel slides, story frames, YouTube thumbnails, Twitter headers, LinkedIn banners — each showing different content types (quote post, product feature, event announcement, testimonial), bold typography and eye-catching gradient backgrounds, diverse platform-specific aspect ratios visible, dark workspace background with colorful social media content popping, social media designer portfolio")

# ── 32. Presentation & Pitch Deck Design ──
NAMES+=("pm-32-pitch-deck")
RATIOS+=("16:9")
PROMPTS+=("A startup pitch deck presentation spread showing multiple slides arranged in perspective — title slide with gradient background, problem/solution slides, market size TAM/SAM/SOM diagram, business model canvas, financial projections chart, team slide with photo placeholders, and investor CTA — the deck uses a premium dark theme with teal and white accents, slides floating in 3D space with subtle shadows, professional venture capital presentation quality")

# ── 33. 3D & Architecture Visualization ──
NAMES+=("pm-33-3d-architecture")
RATIOS+=("16:9")
PROMPTS+=("A breathtaking architectural visualization showing a modern luxury villa at golden hour, floor-to-ceiling glass walls reflecting the sunset, infinity pool merging with the ocean horizon, lush tropical landscaping with palm trees, interior visible through the glass showing contemporary furniture, volumetric god rays and lens flare, drone-perspective elevated angle, photorealistic architectural render quality with V-Ray/Corona renderer aesthetic, real estate luxury visualization")

# ── 34. Business Plan & Financial Model ──
NAMES+=("pm-34-business-plan")
RATIOS+=("16:9")
PROMPTS+=("A professional business strategy workspace showing a comprehensive business plan document with executive summary visible, financial projections displayed as elegant 3D bar and line charts showing 5-year growth trajectory, market analysis pie charts, SWOT analysis matrix with color-coded quadrants, revenue model diagram, all arranged on a clean dark workspace with warm amber accent lighting, executive boardroom presentation quality")

# ── 35. Product Management AI Toolkit ──
NAMES+=("pm-35-product-mgmt")
RATIOS+=("16:9")
PROMPTS+=("A product management command center showing a Kanban board with user story cards in progress columns, product roadmap timeline with feature milestones, user persona cards with demographic data, feature prioritization matrix (effort vs impact), sprint velocity chart trending upward, customer feedback sentiment analysis, dark theme with blue and green accents, modern product management tool interface like Linear or Notion")

# ── 36. B2B Sales Playbook & Scripts ──
NAMES+=("pm-36-b2b-sales")
RATIOS+=("16:9")
PROMPTS+=("A B2B sales pipeline visualization showing deals progressing through funnel stages — prospecting, qualification, proposal, negotiation, closed won — with dollar amounts growing at each stage, CRM dashboard showing key metrics (win rate, average deal size, pipeline velocity), sales call script template with highlighted key phrases, professional dark theme with blue and green revenue colors, enterprise sales analytics dashboard aesthetic")

# ── 37. Consulting Framework Templates ──
NAMES+=("pm-37-consulting")
RATIOS+=("16:9")
PROMPTS+=("A strategy consulting workspace showing classic business frameworks rendered as elegant 3D diagrams — Porter's Five Forces as a pentagon, McKinsey 7S as interconnected circles, BCG Matrix as a 2x2 grid with star/cash cow/dog/question mark icons, Value Chain as flowing arrows, PESTLE hexagon — each framework glowing with sophisticated blue and gold colors on dark background, top-tier management consulting presentation quality")

# ── 38. Professional Meeting & Communication ──
NAMES+=("pm-38-meeting-comm")
RATIOS+=("16:9")
PROMPTS+=("A professional virtual meeting workspace showing a video conference screen with participant grid, alongside organized meeting documents — agenda template with timed sections, meeting minutes with action items and owners, follow-up email draft, decision log matrix, RACI chart — all arranged cleanly with blue and white corporate color scheme on dark background, professional enterprise communication tool aesthetic")

# ── 39. Legal Document Templates for Startups ──
NAMES+=("pm-39-legal-docs")
RATIOS+=("16:9")
PROMPTS+=("A legal document workspace showing startup legal documents arranged professionally — Terms of Service, Privacy Policy, NDA, Employment Agreement, SAFE note — each displayed as clean formatted document pages with highlighted key clauses, a gavel and scales of justice icon rendered in elegant gold, document comparison view showing tracked changes, dark professional background with gold and white accents, legal tech platform aesthetic")

# ── 40. Financial Analysis & Modeling ──
NAMES+=("pm-40-financial")
RATIOS+=("16:9")
PROMPTS+=("A financial analyst workspace showing a complex spreadsheet with DCF model visible, stock price candlestick chart with technical indicators, financial ratios dashboard with gauge meters, balance sheet waterfall chart, Monte Carlo simulation visualization with probability distribution curve, portfolio allocation pie chart, Bloomberg-terminal-inspired dark interface with green and amber data colors, Wall Street quantitative finance aesthetic")

# ── 41. Online Course Creator Toolkit ──
NAMES+=("pm-41-course-creator")
RATIOS+=("16:9")
PROMPTS+=("An online course builder interface showing a curriculum outline with module cards and lesson thumbnails, video player with chapter markers, quiz builder with multiple choice questions, student progress dashboard with completion rates and engagement metrics, certificate template preview, community discussion forum panel, course landing page mockup with enrollment CTA, dark theme with warm orange and white accents, e-learning platform design aesthetic")

# ── 42. AI Study Guide & Flashcard Generator ──
NAMES+=("pm-42-study-guide")
RATIOS+=("16:9")
PROMPTS+=("A student study workspace showing AI-generated flashcards fanning out in 3D with questions on front and answers on back, a mind map diagram connecting key concepts with colorful branches, spaced repetition schedule calendar, quiz results with knowledge gap analysis, summary notes with highlighted key terms, progress tracker showing mastery levels for different topics, clean bright design with blue and green education colors on dark background, smart learning app aesthetic")

# ── 43. Language Learning Prompt System ──
NAMES+=("pm-43-language-learning")
RATIOS+=("16:9")
PROMPTS+=("A multilingual language learning workspace showing conversation practice bubbles in different languages with pronunciation guides, vocabulary cards with images and context sentences, grammar pattern diagrams, proficiency level progress bars from A1 to C2, world map highlighting spoken regions, interactive fill-in-the-blank exercises, cultural notes panel, flags of multiple countries as decorative elements, colorful and engaging Duolingo-inspired aesthetic on dark background")

# ── 44. Teacher's AI Lesson Plan Generator ──
NAMES+=("pm-44-lesson-plan")
RATIOS+=("16:9")
PROMPTS+=("A teacher's digital workspace showing a comprehensive lesson plan template with learning objectives, activity timeline, student engagement strategies, assessment rubric grid, differentiation strategies for various learning levels, classroom layout diagram, resource links panel, and a weekly schedule overview, warm educational atmosphere with apple-red and navy blue accents on a clean dark background, modern educational technology platform aesthetic")

# ── 45. Research Methodology Assistant ──
NAMES+=("pm-45-research-method")
RATIOS+=("16:9")
PROMPTS+=("A research methodology visualization showing the scientific method as a flowing circular diagram — hypothesis, experiment design, data collection, analysis, conclusion — with branching paths for qualitative and quantitative approaches, literature review network graph, survey design interface, statistical analysis output tables, research ethics checklist, academic journal formatting preview, scholarly teal and gold color scheme on dark background, research university aesthetic")

# ── 46. Workshop & Training Facilitator Kit ──
NAMES+=("pm-46-workshop")
RATIOS+=("16:9")
PROMPTS+=("A professional workshop facilitation kit visualization showing a training room layout diagram from above, workshop agenda timeline with interactive activity blocks, participant workbook pages with exercises, icebreaker activity cards, feedback survey form, facilitator guide with speaking notes, Miro-style collaborative whiteboard with sticky notes and voting dots, warm energetic orange and teal colors on dark background, corporate training and development aesthetic")

# ── 47. AI Chatbot Personality Designer ──
NAMES+=("pm-47-chatbot-designer")
RATIOS+=("16:9")
PROMPTS+=("A chatbot personality design interface showing a character creation panel with personality trait sliders (formal/casual, serious/playful, concise/detailed), conversation flow diagram with decision branches, sample chat conversations demonstrating different tones, system prompt editor with highlighted parameters, emotion response mapping wheel, avatar customization options, API integration code snippet, dark futuristic AI interface with electric blue and warm purple accents, conversational AI design tool aesthetic")

# ── 48. Automation & No-Code Workflow ──
NAMES+=("pm-48-automation")
RATIOS+=("16:9")
PROMPTS+=("A no-code automation workflow builder showing a visual pipeline with connected app integration blocks — Gmail, Slack, Google Sheets, Notion, Stripe, Zapier — connected by smooth flowing lines with data transformation steps between them, trigger events shown as lightning bolts, conditional logic diamond shapes, automation run history log with success timestamps, dark builder interface with vibrant app brand colors creating a colorful connected workflow, Zapier/Make.com style aesthetic")

# ── 49. Personal Productivity & Life OS ──
NAMES+=("pm-49-productivity")
RATIOS+=("16:9")
PROMPTS+=("A personal life operating system dashboard showing an organized Notion-style workspace with habit tracker showing green streaks, daily routine timeline, goal setting OKR framework with progress rings, weekly review template, personal finance tracker with budget categories, reading list with progress bars, health and fitness metrics, gratitude journal entry area, morning routine checklist, clean minimal dark theme with calming sage green and warm amber accents, digital life management aesthetic")

# ── 50. AI Video Generation Prompt Pack ──
NAMES+=("pm-50-video-gen")
RATIOS+=("16:9")
PROMPTS+=("A cinematic video production interface showing AI-generated video frames in a timeline editor — a product commercial shot, a nature documentary clip, an animated explainer scene, a music video sequence — each frame showing stunning visual quality, camera movement indicators (dolly, pan, zoom) overlaid on preview, prompt text input panel alongside settings for duration, aspect ratio, and style, dark professional video editing suite aesthetic with warm orange and cool blue accent colors")


# ═══════════════════════════════════════════════════════════════
# EXAMPLE OUTPUT IMAGES — 50 example images (one per prompt set)
# These represent what the prompt actually produces
# ═══════════════════════════════════════════════════════════════
declare -a EX_NAMES
declare -a EX_PROMPTS
declare -a EX_RATIOS

# ── 1. React Component output ──
EX_NAMES+=("ex-01-react-dashboard")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("A modern dark-themed React dashboard with Tailwind CSS, showing a statistics overview with 4 metric cards at the top (revenue, users, orders, conversion), a large area chart in the center showing monthly trends, a recent transactions table at the bottom left, and a donut chart showing traffic sources at bottom right, sidebar with navigation icons, clean UI with rounded corners and subtle shadows, purple accent color on dark gray background, pixel-perfect UI screenshot quality")

# ── 2. API Architecture output ──
EX_NAMES+=("ex-02-api-diagram")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("A clean technical architecture diagram showing a REST API system design: Client App at top connecting to API Gateway, which routes to Auth Service, User Service, Payment Service, and Notification Service microservices, each connected to their own database icons, Redis cache layer in the middle, RabbitMQ message broker connecting services, Docker container icons wrapping each service, arrows showing request/response flows with HTTP method labels, clean white lines on dark slate background, system design interview diagram quality")

# ── 3. Python ML output ──
EX_NAMES+=("ex-03-ml-notebook")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("A Jupyter notebook showing a complete machine learning workflow: data loading with pandas DataFrame preview, exploratory data analysis with seaborn correlation heatmap, feature engineering code cells, model training with scikit-learn, evaluation metrics showing accuracy/precision/recall in a classification report, ROC curve plot, and feature importance horizontal bar chart, clean notebook cells with markdown headers between code sections, dark theme Jupyter notebook aesthetic")

# ── 4. Next.js SaaS output ──
EX_NAMES+=("ex-04-saas-dashboard")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("A SaaS application dashboard showing a subscription management panel with active subscribers count, MRR and ARR revenue metrics displayed as large numbers with trend arrows, churn rate gauge, user growth line chart over 12 months, plan distribution bar chart showing free/pro/enterprise tiers, recent activity feed with user avatars and actions, sidebar with team, billing, settings, and API sections, dark mode UI with indigo and emerald green accents, Stripe Dashboard quality")

# ── 5. React Native output ──
EX_NAMES+=("ex-05-mobile-screens")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("Three iPhone 15 Pro mockups showing a social fitness app: Screen 1 shows a workout tracking feed with exercise cards showing sets/reps/weight, Screen 2 shows a profile page with fitness stats rings (calories, steps, workouts) and achievement badges, Screen 3 shows a live workout timer with exercise illustration and rest countdown, consistent dark purple theme across all screens, realistic device frames with notch, professional app store screenshot presentation style")

# ── 6. DevOps output ──
EX_NAMES+=("ex-06-devops-pipeline")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("A CI/CD pipeline visualization showing stages flowing left to right: Git Push trigger, Build stage with Docker icon, Unit Tests with green checkmarks, Integration Tests, Security Scan with shield icon, Staging Deploy with Kubernetes logo, Manual Approval gate, Production Deploy with blue/green deployment diagram, Monitoring with Grafana-style graphs, each stage connected by arrows with duration labels, green status indicators throughout, dark themed DevOps dashboard with cyan accents")

# ── 7. CLI Tool output ──
EX_NAMES+=("ex-07-cli-output")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("A terminal screenshot showing a beautiful CLI tool called 'scaffold' running in iTerm2: ASCII art logo in gradient cyan-to-purple at the top, an interactive project setup wizard with prompts for project name, framework selection (showing React/Vue/Svelte options), TypeScript toggle, and package manager choice, colorful progress bar at 67% showing 'Installing dependencies...', tree-view output of generated project structure with folder icons, success message with green checkmark, dark terminal background with Dracula color scheme")

# ── 8. Testing output ──
EX_NAMES+=("ex-08-test-results")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("A test results dashboard showing: top section with large metrics — 247 tests passed (green), 0 failed, 98.4% code coverage; a test file tree with green checkmarks on every file; a code coverage flamegraph showing hot and cold paths; performance benchmark comparison table showing before/after optimization; test execution timeline showing parallel test runners, all on dark background with green success colors and clean modern dashboard typography")

# ── 9. SQL output ──
EX_NAMES+=("ex-09-sql-query")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("A database query tool interface showing a complex SQL query with syntax highlighting in the top editor panel, the query performing a multi-table JOIN with window functions, below it a well-formatted results table with 8 columns of sample data including sales metrics and customer information, query execution plan visualization showing Index Scan and Hash Join nodes with cost estimates, query performance stats showing 0.023s execution time, dark-themed SQL client like DataGrip or DBeaver")

# ── 10. Blog SEO output ──
EX_NAMES+=("ex-10-blog-article")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("A perfectly formatted blog article displayed in a CMS editor: H1 title 'The Complete Guide to Modern Web Performance', table of contents sidebar, well-structured content with H2/H3 headings, a key takeaways callout box, inline code snippets, an infographic showing page load metrics, internal link suggestions highlighted in blue, Yoast-style SEO score showing green 'Good' rating at the bottom, clean reading experience on dark themed editor, WordPress or Ghost CMS aesthetic")

# ── 11. Fiction Writing output ──
EX_NAMES+=("ex-11-story-scene")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("A creative writing interface showing a fantasy novel chapter with beautiful typography — Chapter 7: The Crimson Threshold — rich narrative prose visible with dialogue in quotes, a sidebar showing story structure with Act II highlighted, character relationship web diagram with protagonist at center, world-building notes panel with map sketch, word count tracker showing 2,847 words, mood/tone indicator showing 'Tense, Mysterious', Scrivener-like dark writing tool aesthetic with warm sepia accents")

# ── 12. Email Copy output ──
EX_NAMES+=("ex-12-email-template")
EX_RATIOS+=("9:16")
EX_PROMPTS+=("A high-converting marketing email rendered in an email client preview: Subject line 'Your exclusive 48-hour deal expires tonight', preview text visible, the email body showing a compelling hero image banner, bold headline, three product feature blocks with icons, a customer testimonial with star rating, prominent CTA button in coral orange, urgency countdown timer, clean unsubscribe footer, the email achieving a visual score of 95/100 shown in sidebar, professional email design on dark background")

# ── 13. Resume output ──
EX_NAMES+=("ex-13-resume")
EX_RATIOS+=("9:16")
EX_PROMPTS+=("A beautifully designed modern resume for a Senior Software Engineer: clean two-column layout with navy header containing name and contact info, left column showing skills with proficiency bars (React, Python, AWS, Docker), education with university name, and certifications, right column showing 3 work experiences with bullet points highlighting achievements with metrics, clean icons for each section, subtle geometric accent line, ATS-friendly modern design, portrait A4 format on neutral gray background")

# ── 14. Tech Docs output ──
EX_NAMES+=("ex-14-api-docs")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("An API documentation page showing a REST endpoint reference: left sidebar with grouped endpoints (Users, Products, Orders), main content showing POST /api/users endpoint with description, request body JSON schema with field types and descriptions, curl example with syntax highlighting, response 201 example showing the created user object, error response examples for 400 and 401, authentication header note, rate limit information badge, Stripe-docs-inspired two-column layout with dark theme")

# ── 15. Academic output ──
EX_NAMES+=("ex-15-research-paper")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("An academic research paper formatted in LaTeX showing: title 'Neural Network Approaches to Climate Pattern Recognition', author affiliations, abstract section with structured objectives-methods-results, introduction with numbered citations [1][2][3], a methodology flowchart figure with caption, a results table comparing model performance metrics (accuracy, F1, AUC), a discussion section with LaTeX mathematical equations, IEEE two-column journal format, clean scholarly typography on white paper background")

# ── 16. Copywriting output ──
EX_NAMES+=("ex-16-landing-copy")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("A landing page wireframe with compelling copy filled in: hero section with power headline 'Stop Losing Customers at Checkout — Fix It in 5 Minutes', benefit-driven subheadline, three feature blocks with AIDA-structured copy, social proof section with logos and testimonial quote, objection-handling FAQ accordion, strong CTA section with urgency text 'Join 10,000+ brands — Start free trial', pricing comparison table with recommended plan highlighted, clean conversion-optimized layout on dark background")

# ── 17. Podcast Script output ──
EX_NAMES+=("ex-17-podcast-script")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("A podcast episode script displayed in a professional format: Episode title 'EP 47: How AI is Reshaping Creative Work', runtime 45 minutes, structured segments — [00:00] Cold Open hook quote, [02:30] Intro & Sponsor Read with highlighted ad copy, [05:00] Main Topic with interview questions and talking points, [25:00] Listener Q&A section, [40:00] Key Takeaways bullet list, [43:00] Outro with CTA, speaker labels HOST/GUEST in colored badges, dark themed script editor with warm podcast-orange accents")

# ── 18. Social Calendar output ──
EX_NAMES+=("ex-18-content-calendar")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("A monthly content calendar for June showing a clean grid layout with each day containing color-coded content blocks: Monday = educational tip (blue), Tuesday = product feature (green), Wednesday = behind-the-scenes (orange), Thursday = user testimonial (pink), Friday = trending meme/reel (purple), weekend = recap/engagement post (gray), some days showing multiple platforms (IG/TT/FB icons), weekly theme labels across the top, content pillar legend at bottom, clean Notion-calendar aesthetic on dark background")

# ── 19. Ad Copy output ──
EX_NAMES+=("ex-19-ad-creative")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("Three ad creative mockups displayed side by side: a Facebook Feed Ad showing product image with compelling headline and 'Shop Now' CTA button, a Google Search Ad showing headline, display URL, and description with keyword highlighting and ad extensions, and an Instagram Story Ad with full-screen vertical product showcase and swipe-up prompt, each ad showing preview engagement metrics, clean ad manager interface layout, dark background with platform brand colors as accents")

# ── 20. Product Launch output ──
EX_NAMES+=("ex-20-launch-plan")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("A product launch timeline Gantt chart showing a 12-week plan: Phase 1 (Weeks 1-4) Pre-launch with tasks for landing page, email list building, beta testing; Phase 2 (Weeks 5-8) Build Hype with social teasers, influencer outreach, press kit; Phase 3 (Weeks 9-10) Launch Week with launch event, PR blast, paid ads; Phase 4 (Weeks 11-12) Post-launch with analytics review, iteration, case studies; color-coded by department (marketing, product, sales), Asana/Monday.com project board aesthetic on dark background")

# ── 21-50: Skip generating individual examples for remaining to save API credits ──
# The cover images above + first 20 examples provide sufficient real content
# Remaining sets will use cover images as their example thumbnails

# ═══════════════════════════════════════════════════════════════
# PHASE 1: Submit all cover image jobs
# ═══════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════"
echo "🎨 PHASE 1: Generating ${#NAMES[@]} cover images"
echo "═══════════════════════════════════════════════════"

declare -a JOBIDS
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
echo "═══════════════════════════════════════════════════"
echo "⏳ PHASE 2: Polling cover image results..."
echo "═══════════════════════════════════════════════════"

for i in "${!NAMES[@]}"; do
  JID="${JOBIDS[$i]}"
  NAME="${NAMES[$i]}"
  [ -z "$JID" ] && echo "❌ $NAME: no job ID" && continue

  for attempt in $(seq 1 120); do
    sleep 5
    SR=$(curl -s "$API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "✅ $NAME → $URL"
      echo "$NAME|$URL" >> "$RESULTS_FILE"
      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      ERR=$(echo "$SR" | python3 -c "import sys,json; e=json.load(sys.stdin)['data'].get('error',{}); print(e.get('userMessage','unknown'))" 2>/dev/null)
      echo "❌ $NAME FAILED: $ERR"
      echo "$NAME|FAILED" >> "$RESULTS_FILE"
      break
    else
      printf "  ⏳ %s: %s (%d/120)\r" "$NAME" "$ST" "$attempt"
    fi
  done
done

echo ""
echo "═══════════════════════════════════════════════════"
echo "🎨 PHASE 3: Generating ${#EX_NAMES[@]} example images"
echo "═══════════════════════════════════════════════════"

declare -a EX_JOBIDS
for i in "${!EX_NAMES[@]}"; do
  P="${EX_PROMPTS[$i]}"
  P_ESC=$(echo "$P" | sed 's/"/\\"/g')
  AR="${EX_RATIOS[$i]}"

  R=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"type\":\"text_to_image\",\"prompt\":\"$P_ESC\",\"aspectRatio\":\"$AR\",\"engine\":{\"provider\":\"fxflow\",\"model\":\"google_image_gen_4_5\"}}")

  JID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobId'])" 2>/dev/null)
  EX_JOBIDS+=("$JID")
  echo "  [$((i+1))/${#EX_NAMES[@]}] ${EX_NAMES[$i]} → $JID"
  sleep 1
done

echo ""
echo "⏳ Polling example image results..."

for i in "${!EX_NAMES[@]}"; do
  JID="${EX_JOBIDS[$i]}"
  NAME="${EX_NAMES[$i]}"
  [ -z "$JID" ] && echo "❌ $NAME: no job ID" && continue

  for attempt in $(seq 1 120); do
    sleep 5
    SR=$(curl -s "$API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "✅ $NAME → $URL"
      echo "$NAME|$URL" >> "$EXAMPLE_RESULTS_FILE"
      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      ERR=$(echo "$SR" | python3 -c "import sys,json; e=json.load(sys.stdin)['data'].get('error',{}); print(e.get('userMessage','unknown'))" 2>/dev/null)
      echo "❌ $NAME FAILED: $ERR"
      echo "$NAME|FAILED" >> "$EXAMPLE_RESULTS_FILE"
      break
    else
      printf "  ⏳ %s: %s (%d/120)\r" "$NAME" "$ST" "$attempt"
    fi
  done
done

echo ""
echo "═══════════════════════════════════════════════════"
echo "📋 COVER RESULTS:"
echo "═══════════════════════════════════════════════════"
cat "$RESULTS_FILE"

echo ""
echo "📋 EXAMPLE RESULTS:"
echo "═══════════════════════════════════════════════════"
cat "$EXAMPLE_RESULTS_FILE"

echo ""
echo "🏁 Done! Results saved to:"
echo "   Covers:   $RESULTS_FILE"
echo "   Examples: $EXAMPLE_RESULTS_FILE"
echo ""
echo "Next step: run seed-prompt-market-v4.ts to seed with real URLs"
