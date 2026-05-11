#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# gen_prompt_market_showcase.sh
# Generate showcase-quality cover images + example outputs for Prompt Market
# Follows the same pattern as gen_showcase_banana_pro.sh & gen_showcase_fashion.sh
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

API="https://api.skyverses.com/api-client/external/image-task"
TOKEN="Bearer ${SKYVERSES_EXTERNAL_API_TOKEN:?set SKYVERSES_EXTERNAL_API_TOKEN}"

COVER_FILE="/tmp/pm_showcase_covers.txt"
EXAMPLE_FILE="/tmp/pm_showcase_examples.txt"
> "$COVER_FILE"
> "$EXAMPLE_FILE"

# ═══════════════════════════════════════════════════════════════
# COVER IMAGES — 25 covers (one per prompt set)
# Each cover is a hero shot showcasing the prompt pack's best output
# ═══════════════════════════════════════════════════════════════
declare -a NAMES
declare -a PROMPTS
declare -a RATIOS

# ── 01. Cinematic Product Photography ──
NAMES+=("pm-01-product-photo")
RATIOS+=("16:9")
PROMPTS+=("A luxury men's chronograph watch with a midnight blue dial and rose gold accents, resting at an angle on a slab of raw black marble, water droplets on the crystal face catching studio light, a single sprig of eucalyptus beside it, dramatic Rembrandt lighting with warm key light from the left and cool fill from the right, shallow depth of field, shot on Phase One IQ4 150MP, Cartier campaign quality, dark moody background with subtle smoke wisps, no text")

# ── 02. Gourmet Food Editorial ──
NAMES+=("pm-02-food-editorial")
RATIOS+=("16:9")
PROMPTS+=("Overhead editorial food photography of an artfully plated wagyu beef tartare on a handmade ceramic plate, garnished with microgreens and edible gold leaf, surrounded by scattered pink peppercorns and a drizzle of truffle oil on the dark slate surface, warm directional lighting from the upper left creating long shadows, fresh herbs and a vintage brass spoon as props, shot on Hasselblad H6D, Bon Appétit magazine cover quality, no text")

# ── 03. Modern Interior Design ──
NAMES+=("pm-03-interior-design")
RATIOS+=("16:9")
PROMPTS+=("A stunning Scandinavian minimalist living room with floor-to-ceiling windows overlooking a snowy Nordic forest, warm afternoon light flooding in, a curved bouclé sofa in cream beside a walnut coffee table with a stack of art books, a statement Noguchi paper lamp glowing warmly in the corner, polished concrete floors with a sheepskin rug, live-edge wooden shelf with trailing pothos plant, architectural photography by Jonas Bjerre-Poulsen, Kinfolk magazine quality, no text")

# ── 04. Haute Couture Fashion Editorial ──
NAMES+=("pm-04-fashion-editorial")
RATIOS+=("9:16")
PROMPTS+=("Haute couture editorial photograph, a striking model in an avant-garde sculptural emerald green gown with dramatic pleated organza cape trailing behind, walking through a misty enchanted forest at golden hour, harsh directional backlighting creating a glowing silhouette, the gown fabric catching light with iridescent reflections, shot on Hasselblad H6D-100c, Vogue Italia cover quality, fashion photography inspired by Tim Walker and Paolo Roversi, no text")

# ── 05. Minimal Logo Collection ──
NAMES+=("pm-05-logo-design")
RATIOS+=("16:9")
PROMPTS+=("A professional brand identity presentation mockup on a clean dark charcoal background, showing six different minimal modern logos arranged in a grid — a geometric mountain mark, an abstract wave letterform, a negative-space animal icon, a monogram with serif typography, a circular badge emblem, and a clean wordmark — all rendered in white and gold foil on premium textured paper cards with subtle embossing, studio lighting with soft shadows, brand designer portfolio quality, no text on background")

# ── 06. Game Character Design ──
NAMES+=("pm-06-character-design")
RATIOS+=("16:9")
PROMPTS+=("Full-body 3D character render of an elite cyberpunk samurai warrior with a glowing neon-blue visor, wearing matte black tactical armor with exposed mechanical joints and holographic shoulder insignias, wielding a plasma katana that trails electric blue particles, standing in a rain-soaked Tokyo alley with neon signs reflecting on wet asphalt, volumetric fog and lens flare, Unreal Engine 5 cinematic quality, AAA game character art, photorealistic with stylized proportions, no text")

# ── 07. Architectural Visualization ──
NAMES+=("pm-07-architecture")
RATIOS+=("16:9")
PROMPTS+=("Award-winning modern residential architecture, a cantilevered concrete and glass villa perched on a dramatic coastal cliff overlooking turquoise ocean at golden hour, infinity pool merging with the horizon, lush tropical landscaping with mature palms and ornamental grasses, warm interior lighting visible through floor-to-ceiling glass walls, dramatic clouds in the sky, architectural photography by Iwan Baan, ArchDaily award quality, wide establishing shot, no text")

# ── 08. Luxury Jewelry & Accessories ──
NAMES+=("pm-08-jewelry")
RATIOS+=("1:1")
PROMPTS+=("High-end jewelry campaign photograph, a model's neck adorned with a statement diamond and emerald necklace, each stone catching light with brilliant fire and scintillation, extreme close-up showing skin texture and platinum craftsmanship, dark moody background with a single warm spotlight creating dramatic chiaroscuro, water droplets on the collarbone adding freshness, luxury advertising quality similar to Cartier or Harry Winston campaigns, shot on Phase One, no text")

# ── 09. Social Media Visual Content ──
NAMES+=("pm-09-social-media")
RATIOS+=("16:9")
PROMPTS+=("A creative flat lay arrangement of a social media content creation workspace, featuring an iPhone 16 Pro showing a vibrant Instagram feed, a MacBook Air with a Canva design open, scattered Pantone color swatches, a cold brew coffee in a glass, wireless earbuds, a small potted succulent, trendy sunglasses, and colorful sticky notes with content ideas, all arranged on a clean white marble surface with natural window light, overhead shot, lifestyle blogger aesthetic, no text on items")

# ── 10. Print-on-Demand Artwork ──
NAMES+=("pm-10-pod-designs")
RATIOS+=("16:9")
PROMPTS+=("A trendy print-on-demand mockup display showing three black t-shirts hanging on wooden hangers against a raw concrete wall, each featuring a different bold graphic design — a retro sunset with palm silhouettes and vaporwave colors, a detailed botanical illustration of wildflowers in fine line art, and a fierce geometric wolf head in gradient purple and teal — soft natural light from the left, streetwear brand lookbook quality, no text on wall")

# ── 11. Ad Creative Templates ──
NAMES+=("pm-11-ad-creative")
RATIOS+=("16:9")
PROMPTS+=("Three premium digital advertising creative mockups displayed on floating glass screens against a dark gradient background, each showing a different ad format — a Facebook carousel ad with luxury skincare products on marble, an Instagram Story ad with a fitness model in dynamic pose with bold typography overlay, and a Google Display banner with a sleek tech product on gradient — soft neon glow behind each screen, digital marketing agency portfolio presentation quality, no text outside ads")

# ── 12. Premium Packaging Design ──
NAMES+=("pm-12-packaging")
RATIOS+=("16:9")
PROMPTS+=("Luxury cosmetics packaging design showcase, three elegant perfume bottles with sculptural geometric caps in rose gold and frosted glass, arranged on a stepped marble display pedestal, surrounded by fresh white peonies and scattered rose petals, dramatic studio lighting with rim light highlighting the bottle silhouettes, soft bokeh background in blush pink, premium beauty brand campaign photography, Chanel and Tom Ford aesthetic, no text")

# ── 13. Real Estate Photography ──
NAMES+=("pm-13-real-estate")
RATIOS+=("16:9")
PROMPTS+=("Stunning luxury real estate twilight exterior photograph, a modern Mediterranean villa with warm honey stone walls and terracotta roof tiles, illuminated by warm interior lighting visible through arched windows, an azure infinity pool in the foreground reflecting the deep blue dusk sky, mature olive trees and lavender hedges in the manicured garden, string lights creating a romantic atmosphere on the covered terrace, Sotheby's International Realty listing quality, architectural twilight photography, no text")

# ── 14. Cinematic Film Stills ──
NAMES+=("pm-14-cinematic")
RATIOS+=("16:9")
PROMPTS+=("A cinematic film still from an imaginary sci-fi thriller, a lone astronaut in a weathered white spacesuit standing in the doorway of a massive derelict space station, looking out at a gas giant planet filling the viewport with swirling amber and crimson storms, emergency red lights flickering in the corridor behind, dust particles floating in zero gravity catching the light, anamorphic lens flare, shot on ARRI Alexa 65 with Panavision C-series anamorphic lenses, Denis Villeneuve cinematography style, no text")

# ── 15. Fantasy Concept Art ──
NAMES+=("pm-15-fantasy-art")
RATIOS+=("16:9")
PROMPTS+=("Epic fantasy concept art, a massive ancient tree city built into the trunk and branches of a world-tree reaching above the clouds, interconnected treehouse structures with warm lantern light glowing from hundreds of windows, rope bridges and spiral staircases winding around the trunk, waterfalls cascading from the upper branches into a misty valley below, bioluminescent moss and flowering vines covering the bark, a dragon silhouette soaring past the canopy at sunset, matte painting quality by Craig Mullins, no text")

# ── 16. Sci-Fi World Building ──
NAMES+=("pm-16-scifi-world")
RATIOS+=("16:9")
PROMPTS+=("A breathtaking cyberpunk megacity skyline at night, towering skyscrapers with holographic advertisements and neon signage in Japanese and Korean, flying vehicles leaving light trails between buildings, a massive torii gate structure spanning two towers glowing with cherry blossom pink light, rain falling through volumetric fog, reflections on wet elevated highways, a full moon partially obscured by clouds, Blade Runner 2049 meets Ghost in the Shell aesthetic, ultra-wide panoramic shot, no text")

# ── 17. Portrait Photography Pro ──
NAMES+=("pm-17-portrait")
RATIOS+=("9:16")
PROMPTS+=("Dramatic editorial portrait of a young woman with striking heterochromia eyes, one blue and one amber, short textured silver-white hair, wearing a structured black turtleneck, shot against a seamless deep charcoal background, single butterfly lighting from directly above creating defined cheekbone shadows and a nose shadow pointing straight down, catchlights visible in both eyes, ultra-sharp skin texture with minimal retouching, shot on Canon EOS R5 with 85mm f/1.2, Annie Leibovitz portrait quality, no text")

# ── 18. Concept Automotive Design ──
NAMES+=("pm-18-automotive")
RATIOS+=("16:9")
PROMPTS+=("A futuristic electric hypercar concept in matte pearl white with flowing organic body lines, active aerodynamic surfaces, and illuminated Tron-like blue accent lines running along the body panels, parked in an underground concrete garage with dramatic directional lighting casting long shadows, rain puddles on the polished floor reflecting the car and overhead strip lights, low three-quarter front angle emphasizing the aggressive stance, automotive photography by Easton Chang, no text")

# ── 19. Anime & Manga Illustration ──
NAMES+=("pm-19-anime-art")
RATIOS+=("9:16")
PROMPTS+=("Beautiful anime illustration of a young sorceress with flowing lavender hair adorned with star-shaped hairpins, wearing an elegant midnight blue cloak with silver constellation embroidery over a white corset dress, holding a glowing crystal staff that radiates soft starlight particles, standing on a floating island above the clouds at twilight with a crescent moon behind her, cherry blossom petals drifting in the wind, detailed anime art style inspired by Makoto Shinkai and Violet Evergarden, vibrant colors, no text")

# ── 20. Epic Landscape Photography ──
NAMES+=("pm-20-landscape")
RATIOS+=("16:9")
PROMPTS+=("A breathtaking landscape photograph of the Lofoten Islands in Norway during the blue hour, dramatic jagged mountain peaks reflected perfectly in a still fjord, a traditional red fishing cabin (rorbu) with warm light in the windows sitting at the water's edge, Northern Lights aurora borealis dancing across the sky in green and purple ribbons, long exposure creating silky smooth water, shot on Nikon Z9 with 14-24mm f/2.8, National Geographic Landscape Photographer of the Year quality, no text")

# ── 21. Abstract & Generative Art ──
NAMES+=("pm-21-abstract-art")
RATIOS+=("1:1")
PROMPTS+=("A mesmerizing abstract fluid art composition, swirling ribbons of liquid gold, deep sapphire blue, and iridescent pearl white flowing and intertwining in an organic dance, microscopic cell-like structures forming at the boundaries where colors meet, tiny bubble formations catching light like diamonds, the entire composition suggesting cosmic nebulae viewed through a microscope, extremely detailed textures with visible paint viscosity, high-end gallery art quality, printed on aluminum dibond, no text")

# ── 22. Children's Book Illustration ──
NAMES+=("pm-22-childrens-book")
RATIOS+=("16:9")
PROMPTS+=("A whimsical children's book illustration of a cozy woodland library inside a giant hollow oak tree, tiny forest animals — a fox cub with round spectacles, a hedgehog in a knitted sweater, and a rabbit in overalls — sitting together on mushroom stools reading a large storybook, bookshelves carved into the tree walls filled with tiny leather-bound books, warm golden lantern light, fireflies drifting through the arched doorway where a starry night sky is visible, Beatrix Potter meets Studio Ghibli style, watercolor texture, no text")

# ── 23. Pet & Animal Portraits ──
NAMES+=("pm-23-pet-portrait")
RATIOS+=("1:1")
PROMPTS+=("A regal studio portrait of a golden retriever wearing a Renaissance-era velvet collar with gold medallion, seated against a painterly backdrop of deep burgundy and forest green, the dog looking nobly to the side with warm brown eyes and a dignified expression, soft Rembrandt lighting highlighting the golden fur texture, oil painting meets photography hybrid style, William Wegman meets classical portraiture, premium pet photography studio quality, no text")

# ── 24. Vintage & Retro Aesthetic ──
NAMES+=("pm-24-vintage-retro")
RATIOS+=("16:9")
PROMPTS+=("A nostalgic 1970s aesthetic photograph of a vintage Volkswagen camper van in two-tone orange and cream, parked at a California beach at sunset, surfboards leaning against the side, a young couple sitting on a plaid blanket with a portable record player and vinyl records scattered around, palm trees silhouetted against a gradient sky of coral pink and lavender, warm analog film grain and light leaks, shot on Kodak Portra 400 with a 50mm lens, retro Polaroid vibes, no text")

# ── 25. 3D Product Mockup Renders ──
NAMES+=("pm-25-3d-mockup")
RATIOS+=("16:9")
PROMPTS+=("Three floating 3D product renders of premium wireless earbuds in different colorways — midnight black, arctic white, and sunset coral — each shown partially out of their matching charging cases, suspended in mid-air at slight angles against a clean gradient background transitioning from light gray to white, soft studio lighting with subtle colored reflections matching each product, product shadow falling gently below, Apple product photography style, Octane render quality, no text")


# ═══════════════════════════════════════════════════════════════
# EXAMPLE OUTPUT IMAGES — 15 examples showing prompt variations
# These demonstrate the versatility of each prompt pack
# ═══════════════════════════════════════════════════════════════
declare -a EX_NAMES
declare -a EX_PROMPTS
declare -a EX_RATIOS

# ── Ex-01. Product Photo variation: skincare flat lay ──
EX_NAMES+=("ex-01-skincare-flatlay")
EX_RATIOS+=("1:1")
EX_PROMPTS+=("Luxury skincare product flat lay photography, three amber glass dropper bottles with minimalist white labels arranged diagonally on a terrazzo surface, surrounded by fresh rosemary sprigs, sliced lemons, and raw honey in a small ceramic dish, natural window light casting soft shadows, a linen napkin partially visible at the edge, clean editorial beauty photography for Aesop or Le Labo style brands, overhead shot, no text")

# ── Ex-02. Food: dark moody dessert ──
EX_NAMES+=("ex-02-dark-dessert")
EX_RATIOS+=("1:1")
EX_PROMPTS+=("Dark and moody food photography of a chocolate lava cake on a matte black plate, molten dark chocolate flowing from the center, a scoop of vanilla bean ice cream with visible specks melting beside it, a dusting of cocoa powder and a single gold leaf garnish, dark wood table with a vintage silver fork, single directional warm light from the left, deep shadows and rich tones, Michelin-star restaurant dessert menu quality, no text")

# ── Ex-03. Interior: Japanese wabi-sabi bathroom ──
EX_NAMES+=("ex-03-wabisabi-bathroom")
EX_RATIOS+=("9:16")
EX_PROMPTS+=("A serene Japanese wabi-sabi bathroom, a deep oval stone soaking tub (ofuro) filled with steaming water, positioned before a floor-to-ceiling window looking out at a private bamboo garden, natural stone floor with embedded river pebbles, a wooden stool with folded linen towels and a ceramic soap dish, dried eucalyptus bundle hanging from a brass shower fixture, soft diffused natural light, warm earth tones of clay and sand, Axel Vervoordt interior aesthetic, no text")

# ── Ex-04. Fashion: streetwear lookbook ──
EX_NAMES+=("ex-04-streetwear")
EX_RATIOS+=("9:16")
EX_PROMPTS+=("Urban streetwear editorial photograph, a young model in an oversized vintage-washed denim jacket with bold embroidered tiger back patch, layered over a graphic mesh top, wide-leg cargo pants with utility straps, and chunky platform combat boots, standing on a fire escape in a gritty New York back alley with morning fog, harsh flash photography with sharp shadows, shot on 35mm Kodak Tri-X pushed to 1600 ISO, Hypebeast editorial quality, raw street energy, no text")

# ── Ex-05. Character: fantasy paladin turnaround ──
EX_NAMES+=("ex-05-paladin-turnaround")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("Professional game character turnaround reference sheet showing a female holy paladin knight in ornate white and gold plate armor with a flowing royal blue cape, displayed in 6 views on a clean neutral gray background: front, back, left side, right side, combat stance with glowing sword raised, and kneeling prayer pose, a golden halo of light above the helmet in combat pose, consistent lighting and proportions across all views, concept art character sheet for 3D modeler reference, no text")

# ── Ex-06. Architecture: brutalist museum ──
EX_NAMES+=("ex-06-brutalist-museum")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("Award-winning brutalist museum architecture, a monumental raw concrete building with dramatic cantilevers and deep geometric recesses, a monumental staircase carved into the facade leading to a massive rectangular entrance, reflecting pool in the forecourt mirroring the structure, a single person walking up the stairs providing scale, overcast sky creating even diffused lighting that emphasizes the concrete texture and form, Tadao Ando meets Zaha Hadid, shot by Hélène Binet, no text")

# ── Ex-07. Cinematic: noir detective scene ──
EX_NAMES+=("ex-07-noir-detective")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("A cinematic film noir still, a detective in a long trench coat and fedora standing under a single flickering street lamp on a rain-soaked cobblestone street at midnight, cigarette smoke curling upward into the cone of amber light, reflections of distant neon signs shimmering on wet pavement, a mysterious figure's shadow visible at the end of the alley, venetian blind shadow pattern falling across the detective's face, shot on ARRI Alexa with vintage Cooke Speed Panchro lenses, Roger Deakins lighting, no text")

# ── Ex-08. Sci-Fi: space station interior ──
EX_NAMES+=("ex-08-space-station")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("Interior of a massive rotating space station observation deck, curved floor with lush hydroponic gardens and walking paths, floor-to-ceiling windows revealing the Earth and stars slowly rotating past, warm artificial sunlight from LED arrays in the ceiling mixing with the blue glow of Earth, a few people in casual clothes walking and sitting on benches, a café area with a barista robot, clean futuristic but lived-in aesthetic, Interstellar meets The Expanse production design, no text")

# ── Ex-09. Anime: battle scene ──
EX_NAMES+=("ex-09-anime-battle")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("Dynamic anime battle scene, two sword fighters clashing mid-air above a destroyed temple rooftop during a thunderstorm, one warrior in crimson armor with a flame-wreathed katana, the other in ice-blue robes with a crystalline blade, lightning bolt freezing the moment of impact between their weapons creating a shockwave ring of energy, rain droplets suspended in the blast wave, dramatic speed lines and motion blur, Ufotable animation studio quality inspired by Demon Slayer, vibrant colors against the dark storm sky, no text")

# ── Ex-10. Portrait: environmental CEO ──
EX_NAMES+=("ex-10-ceo-portrait")
EX_RATIOS+=("9:16")
EX_PROMPTS+=("An environmental editorial portrait of a confident tech CEO in a perfectly tailored navy suit, standing in the atrium of a modern glass office building, arms crossed, looking directly at camera with a subtle determined smile, natural light pouring in from the glass ceiling creating beautiful rim lighting on the shoulders and hair, blurred office activity in the background suggesting a thriving company, shallow depth of field, shot on Sony A1 with 135mm f/1.8 GM, Forbes magazine cover portrait quality, no text")

# ── Ex-11. Automotive: motorcycle concept ──
EX_NAMES+=("ex-11-motorcycle")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("A futuristic electric motorcycle concept in matte gunmetal gray with copper accent details, hubless rear wheel with visible electric motor, minimalist instrument cluster integrated into the handlebars as a transparent OLED display, LED light strip running continuously from headlight to tail, parked on a rooftop helipad at dusk with a city skyline in the background, wet surface reflecting the bike and city lights, automotive design studio quality, low dramatic angle, no text")

# ── Ex-12. Logo: coffee brand identity ──
EX_NAMES+=("ex-12-coffee-brand")
EX_RATIOS+=("1:1")
EX_PROMPTS+=("A premium coffee brand identity mockup presentation, showing a minimal line-art logo of a mountain peak with a rising steam curl forming the sun, displayed on: a kraft paper coffee bag with matte black label, a ceramic takeaway cup with a sleeve, a round rubber stamp impression on brown paper, and an embossed business card on textured cotton paper, all arranged on a dark wood surface with scattered coffee beans and a burlap swatch, warm directional lighting, artisan brand photography, no text outside logo")

# ── Ex-13. Landscape: volcanic Iceland ──
EX_NAMES+=("ex-13-iceland-volcanic")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("An otherworldly landscape photograph of an active volcanic area in Iceland, a river of glowing orange lava flowing through a black basalt field, steam and sulfurous gases rising dramatically, the Milky Way clearly visible in the dark sky above, green moss-covered lava rocks in the foreground providing contrast, long exposure creating smooth lava flow motion, shot on Nikon Z9 with 24mm f/1.4 at midnight, combining fire and ice elements, National Geographic quality, no text")

# ── Ex-14. Abstract: macro crystal ──
EX_NAMES+=("ex-14-macro-crystal")
EX_RATIOS+=("1:1")
EX_PROMPTS+=("Extreme macro photograph of a bismuth crystal formation, showing the iridescent staircase-like geometric structures in vivid rainbow colors — electric blue, magenta, gold, and teal — with microscopic oxidation patterns creating a surreal alien landscape effect, each terrace reflecting light differently, shallow depth of field with creamy bokeh, shot on Laowa 25mm ultra-macro lens, abstract art meets scientific photography, gallery-quality mineral photography, no text")

# ── Ex-15. 3D Mockup: headphone product ──
EX_NAMES+=("ex-15-headphone-render")
EX_RATIOS+=("16:9")
EX_PROMPTS+=("A premium 3D product render of over-ear wireless headphones in brushed titanium finish with cognac leather ear cushions and headband, one ear cup rotated to show the driver detail and memory foam padding, floating at a slight angle against a warm gradient background from cream to soft peach, subtle colored reflections on the metal surfaces, product shadow below, companion leather carrying case visible in the background slightly out of focus, Bang & Olufsen product photography aesthetic, Octane render, no text")


# ═══════════════════════════════════════════════════════════════
# PHASE 1: Submit all cover image jobs
# ═══════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════"
echo "  PHASE 1: Generating ${#NAMES[@]} cover images"
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

# ═══════════════════════════════════════════════════════════════
# PHASE 2: Poll cover image results
# ═══════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════"
echo "  PHASE 2: Polling cover image results..."
echo "═══════════════════════════════════════════════════"

for i in "${!NAMES[@]}"; do
  JID="${JOBIDS[$i]}"
  NAME="${NAMES[$i]}"
  [ -z "$JID" ] && echo "  ❌ $NAME: no job ID" && echo "$NAME|FAILED" >> "$COVER_FILE" && continue

  for attempt in $(seq 1 120); do
    sleep 5
    SR=$(curl -s "$API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "  ✅ $NAME → $URL"
      echo "$NAME|$URL" >> "$COVER_FILE"
      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      ERR=$(echo "$SR" | python3 -c "import sys,json; e=json.load(sys.stdin)['data'].get('error',{}); print(e.get('userMessage','unknown'))" 2>/dev/null)
      echo "  ❌ $NAME FAILED: $ERR"
      echo "$NAME|FAILED" >> "$COVER_FILE"
      break
    else
      printf "  ⏳ %s: %s (%d/120)\r" "$NAME" "$ST" "$attempt"
    fi
  done
done

# ═══════════════════════════════════════════════════════════════
# PHASE 3: Submit example image jobs
# ═══════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════"
echo "  PHASE 3: Generating ${#EX_NAMES[@]} example images"
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

# ═══════════════════════════════════════════════════════════════
# PHASE 4: Poll example image results
# ═══════════════════════════════════════════════════════════════
echo ""
echo "  Polling example image results..."

for i in "${!EX_NAMES[@]}"; do
  JID="${EX_JOBIDS[$i]}"
  NAME="${EX_NAMES[$i]}"
  [ -z "$JID" ] && echo "  ❌ $NAME: no job ID" && echo "$NAME|FAILED" >> "$EXAMPLE_FILE" && continue

  for attempt in $(seq 1 120); do
    sleep 5
    SR=$(curl -s "$API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      echo "  ✅ $NAME → $URL"
      echo "$NAME|$URL" >> "$EXAMPLE_FILE"
      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      ERR=$(echo "$SR" | python3 -c "import sys,json; e=json.load(sys.stdin)['data'].get('error',{}); print(e.get('userMessage','unknown'))" 2>/dev/null)
      echo "  ❌ $NAME FAILED: $ERR"
      echo "$NAME|FAILED" >> "$EXAMPLE_FILE"
      break
    else
      printf "  ⏳ %s: %s (%d/120)\r" "$NAME" "$ST" "$attempt"
    fi
  done
done

# ═══════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════"
echo "  COVER RESULTS:"
echo "═══════════════════════════════════════════════════"
cat "$COVER_FILE"

echo ""
echo "  EXAMPLE RESULTS:"
echo "═══════════════════════════════════════════════════"
cat "$EXAMPLE_FILE"

COVER_OK=$(grep -cv "FAILED" "$COVER_FILE" || true)
EX_OK=$(grep -cv "FAILED" "$EXAMPLE_FILE" || true)
echo ""
echo "  Done! $COVER_OK covers + $EX_OK examples generated successfully."
echo "  Covers:   $COVER_FILE"
echo "  Examples: $EXAMPLE_FILE"
echo ""
echo "  Next: npm run seed:prompt-market-v4"
