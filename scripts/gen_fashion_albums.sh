#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# Fashion Albums — 10 branded collections, ~4-5 images each
# Each album has a fictional luxury brand with consistent visual identity
# Generated with Imagen 4.5 via Skyverses API
# ═══════════════════════════════════════════════════════════════════════
IMG_API="https://api.skyverses.com/api-client/external/image-task"
EXPLORER_API="https://api.skyverses.com/explorer"
TOKEN="Bearer skv_cbb360d3c039ffb0ebb494e8536a9730a9faa4acde25d44be11a8087b65a230b"
EXPLORER_TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3Nzc5NjIyNTksImV4cCI6MTc3ODU2NzA1OX0.zaXcxMq8jNYmrrNRm-MiL6mla233xnn5N3ARokDr-nk"

RESULTS_FILE="/tmp/fashion_albums_results.txt"
> "$RESULTS_FILE"

declare -a NAMES
declare -a PROMPTS
declare -a RATIOS
declare -a ALBUMS     # album id (for grouping)
declare -a ALBUM_NAMES # album display name
declare -a TAGS

# ═══════════════════════════════════════════════════════════════════════
# ALBUM 1: MAISON ÉLARA — Haute Couture
# Brand: Elegant gold "ÉLARA" logo, black & gold palette, baroque settings
# ═══════════════════════════════════════════════════════════════════════

NAMES+=("album-elara-gown")
PROMPTS+=("Luxury fashion campaign for the brand ÉLARA, a tall model in a dramatic floor-length black silk gown with sculptural gold embroidery cascading from one shoulder down the torso like liquid metal, standing in a grand baroque palace hall with gilded mirrors and crystal chandeliers, the gold ÉLARA logo watermark elegantly placed in the bottom right corner, shot on Hasselblad H6D, Vogue Paris cover quality, dramatic chiaroscuro lighting")
RATIOS+=("9:16")
ALBUMS+=("elara")
ALBUM_NAMES+=("MAISON ÉLARA — Haute Couture")
TAGS+=("showcase,fashion,album,elara,couture,gown")

NAMES+=("album-elara-atelier")
PROMPTS+=("Behind the scenes at ÉLARA atelier, close-up of skilled hands embroidering gold thread onto black silk fabric, intricate floral motifs taking shape stitch by stitch, the ÉLARA brand name subtly embroidered in gold script on a fabric label visible at the edge, warm golden workshop lighting, spools of metallic thread and sketches on the worktable, documentary fashion photography, intimate craftsmanship moment")
RATIOS+=("16:9")
ALBUMS+=("elara")
ALBUM_NAMES+=("MAISON ÉLARA — Haute Couture")
TAGS+=("showcase,fashion,album,elara,couture,atelier")

NAMES+=("album-elara-detail")
PROMPTS+=("ÉLARA haute couture detail shot, extreme macro of gold beadwork on midnight black velvet, each bead hand-sewn creating a constellation pattern, the letter E from the ÉLARA monogram formed by tiny gold crystals, warm directional light revealing texture and dimension, shallow depth of field, luxury fashion detail photography, museum-quality craftsmanship")
RATIOS+=("1:1")
ALBUMS+=("elara")
ALBUM_NAMES+=("MAISON ÉLARA — Haute Couture")
TAGS+=("showcase,fashion,album,elara,couture,detail")

NAMES+=("album-elara-campaign")
PROMPTS+=("ÉLARA brand campaign hero image, two models in coordinated black and gold haute couture ensembles descending a grand marble staircase, one in a structured gold brocade blazer dress and the other in a flowing black cape with gold lining revealed mid-movement, the word ÉLARA in elegant serif typography overlaid at the bottom center in gold, cinematic wide-angle composition, fashion advertising quality, dramatic spotlighting")
RATIOS+=("16:9")
ALBUMS+=("elara")
ALBUM_NAMES+=("MAISON ÉLARA — Haute Couture")
TAGS+=("showcase,fashion,album,elara,couture,campaign")

# ═══════════════════════════════════════════════════════════════════════
# ALBUM 2: NOIR TOKYO — Urban Streetwear
# Brand: Neon-pink "NOIR" kanji-style logo, dark urban settings, Gen-Z energy
# ═══════════════════════════════════════════════════════════════════════

NAMES+=("album-noir-street")
PROMPTS+=("NOIR TOKYO streetwear lookbook cover, a young Japanese model in an oversized black hoodie with the NOIR TOKYO logo in neon pink katakana print across the chest, layered with a reflective silver puffer vest, wide cargo pants and platform sneakers, standing at a rain-soaked Shibuya crossing at night, neon signs reflected in puddles, shot on 35mm film with natural grain, urban fashion editorial")
RATIOS+=("9:16")
ALBUMS+=("noir-tokyo")
ALBUM_NAMES+=("NOIR TOKYO — Streetwear")
TAGS+=("showcase,fashion,album,noir,streetwear,urban")

NAMES+=("album-noir-crew")
PROMPTS+=("NOIR TOKYO crew shot, three diverse young models in coordinated streetwear standing on a Tokyo rooftop at blue hour, each wearing different pieces from the NOIR TOKYO collection: oversized graphic tees, cargo shorts, bucket hats, all featuring the distinctive neon pink NOIR branding, city skyline with Tokyo Tower glowing behind them, wind catching loose fabric, squad energy, Hypebeast editorial quality")
RATIOS+=("16:9")
ALBUMS+=("noir-tokyo")
ALBUM_NAMES+=("NOIR TOKYO — Streetwear")
TAGS+=("showcase,fashion,album,noir,streetwear,crew")

NAMES+=("album-noir-detail")
PROMPTS+=("NOIR TOKYO product flat lay on raw concrete, carefully arranged: a black snapback cap with embroidered neon pink NOIR logo, chunky silver chain necklace, transparent phone case with NOIR branding, limited edition sneakers in black with pink accents, and a small crossbody bag, all arranged with precise spacing, overhead shot with harsh flash photography creating sharp shadows, streetwear product catalog aesthetic")
RATIOS+=("1:1")
ALBUMS+=("noir-tokyo")
ALBUM_NAMES+=("NOIR TOKYO — Streetwear")
TAGS+=("showcase,fashion,album,noir,streetwear,flatlay")

NAMES+=("album-noir-night")
PROMPTS+=("NOIR TOKYO night editorial, a model in a long black techwear trenchcoat with reflective NOIR strips and multiple utility pockets, walking through a narrow Tokyo alley lit only by vending machines and neon signs, the coat catches colored light creating iridescent effects, a neon sign reading NOIR visible in the background, cyberpunk atmosphere meets high fashion, cinematic rain-soaked street photography")
RATIOS+=("9:16")
ALBUMS+=("noir-tokyo")
ALBUM_NAMES+=("NOIR TOKYO — Streetwear")
TAGS+=("showcase,fashion,album,noir,streetwear,night")

# ═══════════════════════════════════════════════════════════════════════
# ALBUM 3: CASA VERANO — Resort & Summer
# Brand: Warm terracotta "CASA VERANO" script, Mediterranean palette, sun-drenched
# ═══════════════════════════════════════════════════════════════════════

NAMES+=("album-verano-villa")
PROMPTS+=("CASA VERANO resort collection campaign, a model in a flowing white linen maxi dress with terracotta embroidered trim and a wide straw hat, leaning against a whitewashed Mediterranean villa wall with bougainvillea cascading above, the CASA VERANO brand name in elegant terracotta script logo on the bottom left, golden hour light, Amalfi Coast lifestyle, summer editorial photography")
RATIOS+=("9:16")
ALBUMS+=("verano")
ALBUM_NAMES+=("CASA VERANO — Resort")
TAGS+=("showcase,fashion,album,verano,resort,summer")

NAMES+=("album-verano-pool")
PROMPTS+=("CASA VERANO poolside editorial, a model in an elegant one-piece swimsuit in burnt sienna with the subtle CV monogram woven into the fabric, lounging on a cream daybed beside an infinity pool overlooking the ocean, straw tote bag with CASA VERANO embroidered tag beside her, a glass of aperol spritz on a marble side table, Mediterranean luxury resort lifestyle, warm golden tones, travel fashion photography")
RATIOS+=("16:9")
ALBUMS+=("verano")
ALBUM_NAMES+=("CASA VERANO — Resort")
TAGS+=("showcase,fashion,album,verano,resort,pool")

NAMES+=("album-verano-market")
PROMPTS+=("CASA VERANO street style, a model browsing a sun-drenched Italian outdoor market wearing a coordinated linen co-ord set in sandy beige with terracotta piping from the CASA VERANO collection, leather sandals, oversized tortoiseshell sunglasses, carrying a woven basket bag with the CV leather tag, surrounded by colorful produce stalls and striped awnings, authentic Mediterranean lifestyle moment, candid editorial")
RATIOS+=("16:9")
ALBUMS+=("verano")
ALBUM_NAMES+=("CASA VERANO — Resort")
TAGS+=("showcase,fashion,album,verano,resort,market")

NAMES+=("album-verano-accessories")
PROMPTS+=("CASA VERANO accessories flat lay on sun-bleached wooden surface, carefully arranged summer essentials: woven straw fedora with terracotta ribbon bearing the CV logo, tan leather sandals with gold buckles, tortoiseshell sunglasses, a stack of gold bangles, coral linen scarf, and a small leather pouch embossed with CASA VERANO, warm natural sunlight creating soft shadows, coastal product photography, Mediterranean palette")
RATIOS+=("1:1")
ALBUMS+=("verano")
ALBUM_NAMES+=("CASA VERANO — Resort")
TAGS+=("showcase,fashion,album,verano,resort,accessories")

# ═══════════════════════════════════════════════════════════════════════
# ALBUM 4: ATELIER BLANC — Bridal & Evening
# Brand: Silver "ATELIER BLANC" monogram, ivory & silver palette, ethereal
# ═══════════════════════════════════════════════════════════════════════

NAMES+=("album-blanc-bride")
PROMPTS+=("ATELIER BLANC bridal campaign, a bride in a breathtaking ivory silk wedding gown with hand-sewn pearl and crystal beadwork across a fitted corset bodice flowing into a dramatic cathedral-length train, standing in a sunlit chapel with stained glass windows casting colored light, the ATELIER BLANC logo in delicate silver script at the bottom, ethereal and romantic, bridal magazine cover quality")
RATIOS+=("9:16")
ALBUMS+=("blanc")
ALBUM_NAMES+=("ATELIER BLANC — Bridal")
TAGS+=("showcase,fashion,album,blanc,bridal,gown")

NAMES+=("album-blanc-veil")
PROMPTS+=("ATELIER BLANC bridal detail, close-up of an exquisite cathedral-length veil with hand-embroidered floral lace border, the AB monogram delicately stitched in silver thread at one corner, soft backlight creating a halo effect through the sheer tulle, the bride's silhouette visible beneath, floating fabric creating ethereal shapes, dreamy shallow depth of field, luxury bridal photography")
RATIOS+=("1:1")
ALBUMS+=("blanc")
ALBUM_NAMES+=("ATELIER BLANC — Bridal")
TAGS+=("showcase,fashion,album,blanc,bridal,veil")

NAMES+=("album-blanc-evening")
PROMPTS+=("ATELIER BLANC evening collection, a model in a stunning silver sequin column gown that catches light like liquid mercury, standing on a rooftop terrace at twilight with city lights twinkling behind her, the gown has a daring open back revealing the ATELIER BLANC label sewn inside, she turns to look over her shoulder, wind catching her hair, glamorous and sophisticated, red carpet editorial quality")
RATIOS+=("9:16")
ALBUMS+=("blanc")
ALBUM_NAMES+=("ATELIER BLANC — Bridal")
TAGS+=("showcase,fashion,album,blanc,evening,gown")

NAMES+=("album-blanc-fitting")
PROMPTS+=("ATELIER BLANC fitting room scene, a bride standing on an elevated platform in front of three tall mirrors while a seamstress kneels to adjust the hemline of her wedding gown, pins visible in the fabric, measuring tape draped around the seamstress neck, the ATELIER BLANC logo visible on the mirror frame in silver, warm intimate lighting, emotional anticipation on the brides face, documentary bridal photography")
RATIOS+=("16:9")
ALBUMS+=("blanc")
ALBUM_NAMES+=("ATELIER BLANC — Bridal")
TAGS+=("showcase,fashion,album,blanc,bridal,fitting")

# ═══════════════════════════════════════════════════════════════════════
# ALBUM 5: VOSS ACTIVE — Sportswear & Athleisure
# Brand: Bold geometric "VOSS" logo, electric blue & black, dynamic angles
# ═══════════════════════════════════════════════════════════════════════

NAMES+=("album-voss-run")
PROMPTS+=("VOSS ACTIVE performance campaign, a female athlete in a sleek black and electric blue running outfit with the bold VOSS logo across the sports bra and matching compression leggings with blue geometric accent stripes, captured mid-stride on a futuristic running track at dawn, motion blur on limbs, frozen droplets of sweat catching golden light, Nike-level advertising quality, dynamic and powerful")
RATIOS+=("16:9")
ALBUMS+=("voss")
ALBUM_NAMES+=("VOSS ACTIVE — Sportswear")
TAGS+=("showcase,fashion,album,voss,sportswear,running")

NAMES+=("album-voss-yoga")
PROMPTS+=("VOSS ACTIVE yoga collection, a model in a seamless ribbed crop top and high-waist leggings in matte black with the VOSS geometric logo in subtle tonal print, holding a warrior III pose on a minimalist concrete rooftop at golden hour, city skyline softly blurred behind, her form creating a perfect horizontal line, calm power and flexibility, athleisure lifestyle editorial, clean premium aesthetic")
RATIOS+=("9:16")
ALBUMS+=("voss")
ALBUM_NAMES+=("VOSS ACTIVE — Sportswear")
TAGS+=("showcase,fashion,album,voss,sportswear,yoga")

NAMES+=("album-voss-gear")
PROMPTS+=("VOSS ACTIVE product arrangement on a dark charcoal gym floor, overhead shot of coordinated workout gear: electric blue sports bra with VOSS logo, black compression shorts, matching headband, wireless earbuds in a case with V logo, water bottle with geometric VOSS branding, a pair of black and blue training shoes, and a mesh gym bag, all arranged with mathematical precision, sports product catalog photography")
RATIOS+=("1:1")
ALBUMS+=("voss")
ALBUM_NAMES+=("VOSS ACTIVE — Sportswear")
TAGS+=("showcase,fashion,album,voss,sportswear,gear")

NAMES+=("album-voss-campaign")
PROMPTS+=("VOSS ACTIVE brand campaign hero image, two athletes — one male one female — in matching black and electric blue VOSS training outfits standing back to back with arms crossed on an industrial concrete background, dramatic side lighting creating strong shadows, the large VOSS logo projected as light on the wall behind them, powerful confident energy, premium sportswear brand advertising, high contrast editorial")
RATIOS+=("16:9")
ALBUMS+=("voss")
ALBUM_NAMES+=("VOSS ACTIVE — Sportswear")
TAGS+=("showcase,fashion,album,voss,sportswear,campaign")

# ═══════════════════════════════════════════════════════════════════════
# ALBUM 6: HERITAGE 1924 — Men's Classic Tailoring
# Brand: Classic serif "HERITAGE 1924" crest, navy & cognac, old-money aesthetic
# ═══════════════════════════════════════════════════════════════════════

NAMES+=("album-heritage-suit")
PROMPTS+=("HERITAGE 1924 menswear campaign, a distinguished man in a perfectly tailored navy blue double-breasted suit with peak lapels, white pocket square, and cognac leather oxford shoes, standing in the wood-paneled library of an English manor house, leather-bound books and a globe behind him, the HERITAGE 1924 crest subtly embroidered on the breast pocket, warm tungsten lighting, GQ editorial quality, timeless elegance")
RATIOS+=("9:16")
ALBUMS+=("heritage")
ALBUM_NAMES+=("HERITAGE 1924 — Menswear")
TAGS+=("showcase,fashion,album,heritage,menswear,suit")

NAMES+=("album-heritage-detail")
PROMPTS+=("HERITAGE 1924 tailoring detail, extreme close-up of bespoke suit craftsmanship showing hand-stitched buttonholes in contrasting silk thread, a surgeon's cuff with functioning buttons, the HERITAGE 1924 label visible inside the jacket in gold embossing on navy silk lining, rich fabric texture of super 150s wool visible, shallow depth of field, warm directional light, Savile Row quality")
RATIOS+=("1:1")
ALBUMS+=("heritage")
ALBUM_NAMES+=("HERITAGE 1924 — Menswear")
TAGS+=("showcase,fashion,album,heritage,menswear,detail")

NAMES+=("album-heritage-casual")
PROMPTS+=("HERITAGE 1924 casual collection, a man in a camel cashmere overcoat over a navy crewneck sweater and well-fitted chinos, cognac leather loafers, walking through a misty English garden in autumn, fallen leaves on the gravel path, the overcoat collar turned up against the chill, the H1924 monogram on a leather button, natural overcast lighting, old-money casual elegance, Ralph Lauren meets Kingsman aesthetic")
RATIOS+=("16:9")
ALBUMS+=("heritage")
ALBUM_NAMES+=("HERITAGE 1924 — Menswear")
TAGS+=("showcase,fashion,album,heritage,menswear,casual")

NAMES+=("album-heritage-accessories")
PROMPTS+=("HERITAGE 1924 accessories still life on a dark mahogany desk, carefully arranged: a cognac leather briefcase with brass locks and embossed HERITAGE 1924 logo, a mechanical dress watch with navy dial, gold cufflinks with the H crest, a silk navy tie with subtle pattern, tortoiseshell reading glasses, and a leather card holder, all arranged with gentlemanly precision, warm desk lamp lighting, premium menswear catalog")
RATIOS+=("1:1")
ALBUMS+=("heritage")
ALBUM_NAMES+=("HERITAGE 1924 — Menswear")
TAGS+=("showcase,fashion,album,heritage,menswear,accessories")

# ═══════════════════════════════════════════════════════════════════════
# ALBUM 7: TERRA ECO — Sustainable Fashion
# Brand: Organic green "TERRA" wordmark with leaf, earth tones, natural textures
# ═══════════════════════════════════════════════════════════════════════

NAMES+=("album-terra-hero")
PROMPTS+=("TERRA ECO sustainable fashion campaign, a model in a beautifully draped dress made from organic undyed linen in natural oatmeal color, standing in a sun-dappled forest clearing surrounded by ferns, the dress has raw unhemmed edges and visible natural stitching as a design feature, a small woven TERRA label with a leaf icon visible at the neckline, barefoot connection to nature, warm golden forest light, conscious luxury fashion editorial")
RATIOS+=("9:16")
ALBUMS+=("terra")
ALBUM_NAMES+=("TERRA ECO — Sustainable")
TAGS+=("showcase,fashion,album,terra,sustainable,eco")

NAMES+=("album-terra-material")
PROMPTS+=("TERRA ECO material study, close-up photography of sustainable fashion textures arranged in an artful composition: organic cotton canvas in cream, recycled denim in faded indigo, hemp fabric in sage green, cork leather in natural brown, and Tencel in soft blush, each fabric swatch overlapping slightly with the TERRA leaf logo stamped on the cork piece, natural daylight, raw and honest material photography, zero-waste fashion aesthetic")
RATIOS+=("1:1")
ALBUMS+=("terra")
ALBUM_NAMES+=("TERRA ECO — Sustainable")
TAGS+=("showcase,fashion,album,terra,sustainable,material")

NAMES+=("album-terra-collection")
PROMPTS+=("TERRA ECO capsule collection lookbook, two models in a sunlit greenhouse wearing coordinated earth-tone outfits: one in an oversized hemp jacket in sage green over organic cotton wide-leg pants, the other in a recycled wool knit sweater in warm terracotta with organic denim jeans, both wearing natural leather sandals, lush plants surrounding them, the TERRA brand visible on a hanging plant tag in the scene, warm natural tones, sustainable luxury lifestyle")
RATIOS+=("16:9")
ALBUMS+=("terra")
ALBUM_NAMES+=("TERRA ECO — Sustainable")
TAGS+=("showcase,fashion,album,terra,sustainable,collection")

NAMES+=("album-terra-packaging")
PROMPTS+=("TERRA ECO brand packaging flat lay, overhead shot of sustainable packaging: a garment folded in unbleached tissue paper inside a recycled kraft box with the TERRA logo and leaf icon printed in soy ink, accompanied by a cotton drawstring bag stamped TERRA, seed paper thank you card, organic cotton care tag, and dried lavender sprigs, all on a raw linen surface, mindful unboxing experience, eco-luxury brand identity")
RATIOS+=("1:1")
ALBUMS+=("terra")
ALBUM_NAMES+=("TERRA ECO — Sustainable")
TAGS+=("showcase,fashion,album,terra,sustainable,packaging")

# ═══════════════════════════════════════════════════════════════════════
# ALBUM 8: STUDIO KURO — Avant-Garde / Conceptual
# Brand: Minimalist "KURO" in sharp Japanese aesthetic, monochrome, architectural
# ═══════════════════════════════════════════════════════════════════════

NAMES+=("album-kuro-sculpture")
PROMPTS+=("STUDIO KURO avant-garde fashion editorial, a model wearing a dramatic sculptural white coat with exaggerated geometric shoulders and asymmetric hemline over all-black, standing in a stark white Tadao Ando-style concrete space with a single beam of light cutting diagonally, the KURO wordmark in minimalist black type visible on the concrete wall, Comme des Garcons meets architectural design, high-contrast editorial photography")
RATIOS+=("9:16")
ALBUMS+=("kuro")
ALBUM_NAMES+=("STUDIO KURO — Avant-Garde")
TAGS+=("showcase,fashion,album,kuro,avantgarde,conceptual")

NAMES+=("album-kuro-decon")
PROMPTS+=("STUDIO KURO deconstructed fashion, a model in a deliberately unfinished blazer with exposed seams, raw edges, and one sleeve removed to reveal the construction underneath, contrasted with perfectly tailored wide-leg trousers in jet black, standing in an empty white gallery space, the garment existing between chaos and precision, a small KURO label hanging from an exposed thread, conceptual fashion photography, Yohji Yamamoto aesthetic")
RATIOS+=("9:16")
ALBUMS+=("kuro")
ALBUM_NAMES+=("STUDIO KURO — Avant-Garde")
TAGS+=("showcase,fashion,album,kuro,avantgarde,decon")

NAMES+=("album-kuro-movement")
PROMPTS+=("STUDIO KURO movement study, a dancer-model in a flowing all-black KURO ensemble performing a contemporary dance move in a pure white studio, fabric creating dramatic arcs and shapes in the air, long exposure technique capturing motion trails of the garment, the static body contrasting with the dynamic fabric, artistic fashion meets performance art, museum-quality photography, black-on-white minimalism")
RATIOS+=("16:9")
ALBUMS+=("kuro")
ALBUM_NAMES+=("STUDIO KURO — Avant-Garde")
TAGS+=("showcase,fashion,album,kuro,avantgarde,movement")

NAMES+=("album-kuro-exhibition")
PROMPTS+=("STUDIO KURO exhibition installation, three mannequins displaying avant-garde garments in a dark gallery space, each lit by a single precise spotlight from above: a sculptural origami-folded jacket, a dress made of layered geometric panels, and an architectural coat with impossible proportions, the KURO logo projected in light on the gallery floor, fashion as art installation, museum exhibition photography, dramatic theatrical lighting")
RATIOS+=("16:9")
ALBUMS+=("kuro")
ALBUM_NAMES+=("STUDIO KURO — Avant-Garde")
TAGS+=("showcase,fashion,album,kuro,avantgarde,exhibition")

# ═══════════════════════════════════════════════════════════════════════
# ALBUM 9: CÔTE D'OR — Luxury Jewelry & Accessories
# Brand: Refined "CÔTE D'OR" in gold serif, dark velvet & gold palette
# ═══════════════════════════════════════════════════════════════════════

NAMES+=("album-cote-necklace")
PROMPTS+=("CÔTE D'OR fine jewelry campaign, close-up of a models neck and collarbone wearing a stunning layered gold statement necklace with ruby and emerald cabochon stones, the CÔTE D'OR brand name engraved on a tiny gold tag at the clasp, against her bare skin with flawless lighting, dark velvety background, dramatic warm spotlight creating brilliant reflections on the gold, Cartier-level luxury jewelry advertising photography")
RATIOS+=("9:16")
ALBUMS+=("cote-dor")
ALBUM_NAMES+=("CÔTE D'OR — Jewelry")
TAGS+=("showcase,fashion,album,cotedor,jewelry,necklace")

NAMES+=("album-cote-collection")
PROMPTS+=("CÔTE D'OR collection display, an exquisite arrangement of luxury jewelry pieces on dark navy velvet: a diamond tennis bracelet, sculptural gold hoop earrings, a cocktail ring with a large sapphire, pearl drop pendant necklace, and a slim gold bangle, all positioned with museum-like precision, the CÔTE D'OR logo embossed in gold on the velvet display tray, warm directional lighting creating sparkle and depth, high-end jewelry catalog photography")
RATIOS+=("1:1")
ALBUMS+=("cote-dor")
ALBUM_NAMES+=("CÔTE D'OR — Jewelry")
TAGS+=("showcase,fashion,album,cotedor,jewelry,collection")

NAMES+=("album-cote-handbag")
PROMPTS+=("CÔTE D'OR luxury handbag campaign, a structured mini bag in deep emerald green crocodile-embossed leather with 18k gold chain strap and the iconic CÔTE D'OR clasp in the shape of a golden lion, photographed on a black marble surface with a single orchid, dramatic chiaroscuro lighting reminiscent of Vermeer, the brand name visible on the gold hardware, ultra-premium accessories photography")
RATIOS+=("1:1")
ALBUMS+=("cote-dor")
ALBUM_NAMES+=("CÔTE D'OR — Jewelry")
TAGS+=("showcase,fashion,album,cotedor,accessories,handbag")

NAMES+=("album-cote-watch")
PROMPTS+=("CÔTE D'OR timepiece campaign, an exquisite rose gold watch with mother-of-pearl dial surrounded by a bezel of pavé diamonds, on a models wrist with a subtle gold bracelet, the CÔTE D'OR name on the watch dial in refined serif type, her hand resting on dark velvet, extreme macro showing the diamond detail and dial craftsmanship, warm intimate lighting, luxury horlogerie advertising quality")
RATIOS+=("9:16")
ALBUMS+=("cote-dor")
ALBUM_NAMES+=("CÔTE D'OR — Jewelry")
TAGS+=("showcase,fashion,album,cotedor,watch,luxury")

NAMES+=("album-cote-campaign")
PROMPTS+=("CÔTE D'OR brand campaign hero shot, a model in an elegant black dress wearing the full CÔTE D'OR jewelry collection: layered gold necklaces, statement earrings, and stacking rings, photographed against a deep navy background with warm golden lighting from the side, the CÔTE D'OR wordmark in elegant gold typography at the bottom center, her expression confident and regal, luxury brand campaign level, Vogue Jewelry supplement quality")
RATIOS+=("16:9")
ALBUMS+=("cote-dor")
ALBUM_NAMES+=("CÔTE D'OR — Jewelry")
TAGS+=("showcase,fashion,album,cotedor,jewelry,campaign")

# ═══════════════════════════════════════════════════════════════════════
# ALBUM 10: RÉTRO REVIVAL — Vintage / Retro Fashion
# Brand: Retro "RÉTRO" in 70s typography, warm film tones, vintage styling
# ═══════════════════════════════════════════════════════════════════════

NAMES+=("album-retro-70s")
PROMPTS+=("RÉTRO REVIVAL vintage fashion editorial, a model in authentic 1970s inspired outfit: high-waisted flared denim jeans, a rust-orange suede fringe jacket, platform boots, and oversized round tinted sunglasses, standing in front of a classic American muscle car in a dusty desert setting, the RÉTRO brand logo in groovy retro 70s typography on a vintage-style patch on the jacket, warm film grain, golden hour, shot in the style of 1970s Vogue")
RATIOS+=("9:16")
ALBUMS+=("retro")
ALBUM_NAMES+=("RÉTRO REVIVAL — Vintage")
TAGS+=("showcase,fashion,album,retro,vintage,70s")

NAMES+=("album-retro-diner")
PROMPTS+=("RÉTRO REVIVAL 1950s diner editorial, a model in a classic polka-dot swing dress in cherry red with a white Peter Pan collar, cat-eye sunglasses pushed up on her head, sitting at a chrome diner counter with a milkshake, vintage jukebox visible in the background with a RÉTRO sticker on it, warm Kodachrome color palette, authentic mid-century American aesthetic, pin-up meets modern fashion photography")
RATIOS+=("16:9")
ALBUMS+=("retro")
ALBUM_NAMES+=("RÉTRO REVIVAL — Vintage")
TAGS+=("showcase,fashion,album,retro,vintage,50s")

NAMES+=("album-retro-disco")
PROMPTS+=("RÉTRO REVIVAL disco era editorial, a model in a shimmering silver halter jumpsuit with wide bell-bottom legs, platform shoes, and large hoop earrings, dancing under a disco ball in a vintage nightclub with colored spotlights, the RÉTRO logo in neon script on the wall behind, motion blur on her dancing body, 1970s disco fever atmosphere, Studio 54 energy, warm film photography with light leaks and flares")
RATIOS+=("16:9")
ALBUMS+=("retro")
ALBUM_NAMES+=("RÉTRO REVIVAL — Vintage")
TAGS+=("showcase,fashion,album,retro,vintage,disco")

NAMES+=("album-retro-vintageshop")
PROMPTS+=("RÉTRO REVIVAL vintage shop editorial, a model browsing through racks of curated vintage clothing in a charming boutique, wearing a mix of decades: a 1960s mod mini skirt with a 1980s oversized blazer with padded shoulders, the shop has exposed brick walls with a hand-painted RÉTRO REVIVAL sign above the entrance, warm incandescent lighting, eclectic vintage atmosphere, lifestyle fashion photography with authentic character")
RATIOS+=("9:16")
ALBUMS+=("retro")
ALBUM_NAMES+=("RÉTRO REVIVAL — Vintage")
TAGS+=("showcase,fashion,album,retro,vintage,shop")

# ═══════════════════════════════════════════════════════════════════════
# SUBMIT ALL IMAGE JOBS
# ═══════════════════════════════════════════════════════════════════════
TOTAL=${#NAMES[@]}
declare -a JOBIDS

echo "═══════════════════════════════════════════════════════════════"
echo "  FASHION ALBUMS — Generating $TOTAL images across 10 albums"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  Albums:"
echo "   1. MAISON ÉLARA — Haute Couture"
echo "   2. NOIR TOKYO — Streetwear"
echo "   3. CASA VERANO — Resort & Summer"
echo "   4. ATELIER BLANC — Bridal & Evening"
echo "   5. VOSS ACTIVE — Sportswear"
echo "   6. HERITAGE 1924 — Menswear"
echo "   7. TERRA ECO — Sustainable Fashion"
echo "   8. STUDIO KURO — Avant-Garde"
echo "   9. CÔTE D'OR — Jewelry & Accessories"
echo "  10. RÉTRO REVIVAL — Vintage"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

CURRENT_ALBUM=""
for i in "${!NAMES[@]}"; do
  ALBUM="${ALBUMS[$i]}"
  if [ "$ALBUM" != "$CURRENT_ALBUM" ]; then
    echo ""
    echo "  ── ${ALBUM_NAMES[$i]} ──"
    CURRENT_ALBUM="$ALBUM"
  fi

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
echo "═══════════════════════════════════════════════════════════════"
echo "  Polling $TOTAL images..."
echo "═══════════════════════════════════════════════════════════════"
echo ""

DONE=0
FAILED=0
for i in "${!NAMES[@]}"; do
  JID="${JOBIDS[$i]}"
  NAME="${NAMES[$i]}"
  [ -z "$JID" ] && echo "  ❌ $NAME: no job ID" && FAILED=$((FAILED+1)) && continue

  for attempt in $(seq 1 90); do
    sleep 5
    SR=$(curl -s "$IMG_API/$JID" -H "Authorization: $TOKEN")
    ST=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)

    if [ "$ST" = "done" ]; then
      URL=$(echo "$SR" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['result']['images'][0])" 2>/dev/null)
      DONE=$((DONE+1))
      echo "  ✅ [$DONE/$TOTAL] $NAME → ${URL:0:80}..."
      echo "$NAME|$URL|${RATIOS[$i]}|${ALBUMS[$i]}|${ALBUM_NAMES[$i]}" >> "$RESULTS_FILE"

      # ── Save to Explorer ──
      ALBUM_DISPLAY="${ALBUM_NAMES[$i]}"
      TLIST="${TAGS[$i]}"
      PROMPT="${PROMPTS[$i]}"
      PROMPT_ESC=$(echo "$PROMPT" | sed 's/"/\\"/g')
      IFS=',' read -ra TAG_ARR <<< "$TLIST"
      TAG_JSON=$(printf '"%s",' "${TAG_ARR[@]}")
      TAG_JSON="[${TAG_JSON%,}]"

      EXPLORER_BODY="{\"title\":\"$ALBUM_DISPLAY — $(echo $NAME | sed 's/album-[a-z]*-//g')\",\"type\":\"image\",\"prompt\":\"$PROMPT_ESC\",\"thumbnailUrl\":\"$URL\",\"mediaUrl\":\"$URL\",\"model\":\"google_image_gen_4_5\",\"tags\":$TAG_JSON,\"categories\":[\"showcase\",\"fashion\",\"album\"],\"status\":\"published\"}"

      EXPLORER_R=$(curl -s -X POST "$EXPLORER_API" \
        -H "Content-Type: application/json" \
        -H "Authorization: $EXPLORER_TOKEN" \
        -d "$EXPLORER_BODY")
      EXPLORER_ID=$(echo "$EXPLORER_R" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('_id','n/a'))" 2>/dev/null)
      echo "    → Explorer: $EXPLORER_ID"

      break
    elif [ "$ST" = "failed" ] || [ "$ST" = "error" ]; then
      echo "  ❌ $NAME FAILED"
      FAILED=$((FAILED+1))
      break
    else
      printf "  ⏳ %s: %s (%d/90)\r" "$NAME" "$ST" "$attempt"
    fi
  done
done

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  DONE: $DONE/$TOTAL OK, $FAILED failed"
echo "  Results: $RESULTS_FILE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
cat "$RESULTS_FILE"
echo ""
echo "Download all images:"
echo 'while IFS="|" read -r name url ratio album album_name; do'
echo '  curl -L -o "public/assets/showcase/${name}.webp" "$url"'
echo 'done < /tmp/fashion_albums_results.txt'
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Next: Update src/constants/showcase-cdn.ts with album data"
echo "═══════════════════════════════════════════════════════════════"
