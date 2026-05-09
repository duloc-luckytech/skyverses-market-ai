#!/usr/bin/env python3
"""
Submit remaining showcase video jobs and poll/download results.
Skips videos that already exist locally (>100KB).
Tracks previously submitted jobs by their IDs.
"""

import json, os, sys, time, urllib.request, urllib.error

IMG_API = "https://api.skyverses.com/api-client/external/image-task"
VID_API = "https://api.skyverses.com/api-client/external/video-task"
TOKEN = "Bearer skv_cbb360d3c039ffb0ebb494e8536a9730a9faa4acde25d44be11a8087b65a230b"
REF_MAP_FILE = "/tmp/showcase_retry_ref_map.txt"
RESULTS_FILE = "/tmp/showcase_retry_results.txt"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
ASSETS_DIR = os.path.join(PROJECT_DIR, "public", "assets", "showcase")
os.makedirs(ASSETS_DIR, exist_ok=True)

# Load reference image map
ref_map = {}
with open(REF_MAP_FILE) as f:
    for line in f:
        line = line.strip()
        if "|" in line:
            name, url = line.split("|", 1)
            ref_map[name] = url

print(f"Loaded {len(ref_map)} reference images", flush=True)

# ─── VIDEO DEFINITIONS ───
VIDEOS = [
    # KORA (3)
    ("veo3-kora-intro", "image-to-video",
     "Slow cinematic push-in through misty tropical jungle at dawn, camera glides between massive tree trunks, the young anime warrior girl with wild green hair and bone armor turns her head toward camera and grins, then leaps down from a branch and lands in a combat stance gripping her massive bone club, leaves scatter on impact. Audio: jungle birds, rustling leaves, thud of landing, low tribal drum beat begins. No subtitles.",
     ["bp-kora-hero"]),
    ("veo3-kora-idle", "image-to-video",
     "Medium close-up of the young jungle warrior girl sitting on a mossy stone ruin at sunset, bone club resting beside her, she gently pets a small panda cub sleeping in her lap, fireflies appearing, warm golden light, she looks up with a peaceful smile, wind gently moving her green hair, quiet contemplative moment. Audio: evening breeze, distant waterfall, crickets, cub snoring, bamboo flute melody. No subtitles.",
     ["bp-kora-3d"]),
    ("veo3-kora-combat", "ingredient",
     "Dynamic tracking shot following a young jungle warrior girl with green hair and bone armor as she charges toward a giant panda creature in a forest clearing, she swings her massive bone club in a wide arc, the panda blocks and roars, she rolls under a counterswipe and strikes upward sending leaves and debris exploding, camera circles them during the clash, sunlight flashing through canopy. Audio: heavy club impacts, panda roar, battle cry, intense tribal percussion. No subtitles.",
     ["bp-kora-hero", "bp-kora-turnaround", "bp-kora-3d"]),

    # ZERO (3)
    ("veo3-zero-launch", "image-to-video",
     "Dramatic vertical tracking shot of a white and crimson bipedal mech launching from underground hangar, hydraulic clamps releasing with steam, the mech rises through armored blast doors opening in sequence, camera follows from below as it emerges into rain-soaked night cityscape, thrusters ignite with blue flame as it takes a thundering step onto cracked asphalt. Audio: hydraulic hiss, blast doors grinding, klaxon alarm, rain on metal, booming footfall, jet engine whine. No subtitles.",
     ["bp-zero-hero"]),
    ("veo3-zero-combat", "ingredient",
     "Wide cinematic shot of a white and crimson mech sprinting through a destroyed city, dodging missile impacts that explode buildings, the mech slides behind a toppled skyscraper then leans out firing its plasma cannon in a sustained blue beam cutting through an enemy mech, sparks and molten metal flying, camera shakes with each explosion. Audio: thundering footsteps, missiles whistling and exploding, plasma cannon whine and discharge, emergency sirens. No subtitles.",
     ["bp-zero-hero", "bp-zero-turnaround", "bp-zero-pilot"]),
    ("veo3-zero-cockpit", "image-to-video",
     "Interior cockpit POV from the pilot's perspective inside a combat mech, holographic HUD with target lock warnings, pilot's gloved hands grip control sticks, through rain-streaked windshield an enemy mech charges toward camera, pilot slams a red button and missiles launch from shoulder pods, explosions flash outside. Audio: cockpit hum, rain on glass, warning alarms, tense breathing, missile launch whoosh, muffled explosions, calm AI voice saying target acquired. No subtitles.",
     ["bp-zero-cockpit"]),

    # MALACHAR (2)
    ("veo3-malachar-awaken", "image-to-video",
     "Slow dolly-in approaching a massive bone throne in a dark cathedral, a skeletal king sits motionless wreathed in ghostly green flames, as camera gets closer the green flames in eye sockets suddenly flare bright, the skeletal hand tightens around the serrated greatsword, jaw opens releasing an echoing roar, the cathedral shakes and dust falls, candles extinguish in a wave. Audio: eerie silence, dripping water, grinding bone on metal, deep otherworldly roar, chains rattling, dark orchestral swell. No subtitles.",
     ["bp-malachar-hero"]),
    ("veo3-malachar-fight", "ingredient",
     "Epic wide shot of a small armored warrior dodging massive sword swings from a colossal skeletal king boss in a ruined cathedral, the boss brings greatsword down splitting the stone floor, green spectral fire erupts from the crack, the warrior rolls and counterattacks at the ankle, boss staggers then sweeps his cape sending a ghostly energy wave across the arena, dramatic scale contrast. Audio: massive sword impacts, stone splitting, warrior grunt, spectral whoosh, epic orchestral battle music with choir. No subtitles.",
     ["bp-malachar-hero", "bp-malachar-turnaround", "bp-malachar-3d"]),

    # VIPER (3)
    ("veo3-viper-explosion", "image-to-video",
     "Cinematic slow-motion of a female agent in black tactical suit walking toward camera as a massive explosion erupts behind her on rain-soaked Tokyo street at night, debris and fire billowing in slow-mo, dark hair whipping forward from shockwave, neon signs reflecting in puddles, she does not look back, teal and orange color grading, anamorphic lens flare. Audio: muffled explosion in slow motion, glass shattering, rain pattering, steady boot steps, bass-heavy cinematic score. No subtitles.",
     ["bp-viper-hero"]),
    ("veo3-viper-bike", "text-to-video",
     "Low tracking shot following a female agent on a sleek black motorcycle weaving through Tokyo traffic at high speed at night, leaning hard into turns with sparks from knee slider, two black SUVs give chase smashing through parked cars, she accelerates and launches off a raised intersection, bike goes airborne in slow motion with neon city lights streaking below, lands hard and continues racing. Audio: high-revving motorcycle engine, screeching tires, crashing metal, wind rushing, momentary silence airborne, hard landing impact. No subtitles.",
     []),
    ("veo3-viper-fight", "text-to-video",
     "Intense hand-to-hand fight in a dimly lit elevator, a female agent exchanges rapid strikes with two attackers in suits, she deflects a punch and slams him into the wall denting the panels, spins and delivers a spinning back elbow to the second, camera locked inside the tight space capturing every impact, overhead fluorescent light swings creating flashing shadows. Audio: thuds of fists hitting body and wall, fabric tearing, metallic denting, heavy breathing, elevator ding as doors open. No subtitles.",
     []),

    # KODA (2)
    ("veo3-koda-barista", "text-to-video",
     "Charming 3D animated short of a young female barista with a high bun hairstyle working in a cozy coffee shop, she gracefully steams milk creating a perfect swirl, pours latte art forming a rosetta pattern, camera follows her hands in close-up then pulls back to show her proud smile as she places the cup on the counter, warm morning sunlight through cafe windows, Pixar quality with soft lighting. Audio: espresso machine hissing, milk steaming, gentle pour, cafe chatter, acoustic guitar, a satisfied hum. No subtitles.",
     []),
    ("veo3-koda-morning", "text-to-video",
     "3D animated morning routine montage of a cute barista character opening her coffee shop, she flips the door sign to Open, wipes down the espresso machine, arranges pastries in the display case, grinds fresh coffee beans and inhales the aroma with closed eyes and blissful smile, smooth continuous dolly through the cafe, warm golden morning light growing brighter. Audio: keys jingling, door chime bell, cloth wiping metal, coffee grinder, barista humming, birds chirping, gentle piano. No subtitles.",
     []),

    # TACO (2)
    ("veo3-taco-assembly", "text-to-video",
     "Fast-paced overhead close-up cooking montage of street taco assembly, hands warm corn tortillas on a hot griddle with visible sizzle, lay down juicy carne asada sliced with a sharp knife, add diced onion and fresh cilantro, spoon bright red salsa, finish by squeezing a lime wedge with juice dripping in slow motion, camera stays directly overhead, each step transitions with quick cut, dramatic food lighting. Audio: sizzling meat, knife chopping, salsa spooning, lime squeeze, street market ambiance, upbeat Latin guitar. No subtitles.",
     []),
    ("veo3-taco-hero", "text-to-video",
     "Slow cinematic dolly approaching a beautifully assembled trio of street tacos on a rustic wooden board, camera starts low at table level and slowly rises revealing the arrangement, steam rising from grilled meat, a hand squeezes a lime wedge releasing golden spray in backlight, garnishes of cilantro and radish in sharp detail, shallow depth of field. Audio: street food market bustle, distant mariachi music, nearby grill sizzle, lime squeeze, murmur of appreciation. No subtitles.",
     []),

    # MIRA (3)
    ("veo3-mira-build", "image-to-video",
     "Stop-motion style animation of a clay social media profile being assembled piece by piece on a black surface, tiny clay hands place each element one by one: first the avatar frame pops down, then clay text appears letter by letter, clay icons slide into position, a pink clay castle grows from nothing on the right side, stars and butterflies flutter in from the edges, the verified badge stamps down with a satisfying press, each piece makes a soft clay squish sound, warm workshop lighting, overhead camera, charming handcrafted aesthetic. Audio: soft clay squishing sounds, gentle tapping, a playful xylophone melody, satisfying pop sounds as each element lands. No subtitles.",
     ["bp-mira-hero"]),
    ("veo3-mira-crafting", "ingredient",
     "Close-up stop-motion animation of hands sculpting tiny clay social media elements on a wooden worktable, fingers roll colorful polymer clay into small balls then press and shape them into a heart icon, a star, a speech bubble, and a castle turret, each piece is carefully painted with a tiny brush, then placed onto a clay profile board, camera moves between macro close-ups of the sculpting and wider shots of the growing artwork, warm desk lamp lighting. Audio: clay squishing, brush strokes, gentle humming, soft piano background music, satisfying clicking as pieces snap into place. No subtitles.",
     ["bp-mira-hero", "bp-mira-details", "bp-mira-3d"]),
    ("veo3-mira-reveal", "text-to-video",
     "A completed clay art social media profile displayed on a slowly rotating wooden turntable, the entire Twitter profile page recreated in colorful polymer clay with a tiny avatar girl, clay text, clay icons, decorated with a pink castle, stars, butterflies and dreamcatcher, camera slowly orbits around the piece showing all the 3D depth and handcrafted details from every angle, soft studio lighting with warm key light and cool fill, shallow depth of field blurring the background, museum display presentation. Audio: soft ambient music, gentle turntable motor hum, occasional sparkle sound effects highlighting details. No subtitles.",
     []),

    # HAYABUSA (2)
    ("veo3-hayabusa-drift", "image-to-video",
     "Low tracking shot of a futuristic Japanese street racing car drifting sideways through a neon-lit Tokyo intersection at night, tires smoking white clouds illuminated by neon, embedded LED strips glowing electric blue, camera at ground level capturing front wheel angle and smoke, wet road reflects all neon creating mirror surface, other cars braking in background. Audio: screaming engine, screeching tires, rubber smoke hissing, turbo blow-off, crowd cheering, synthwave pulse. No subtitles.",
     ["bp-hayabusa-hero"]),
    ("veo3-hayabusa-race", "ingredient",
     "Cinematic aerial tracking following a pack of 4 futuristic racing cars blasting through an elevated highway between neon skyscrapers at night, the lead car in electric blue pulls ahead then brakes hard for a hairpin, the second car attempts inside overtake, body panels nearly touching, sparks as they clip, cherry blossom petals across the track. Audio: multiple engines in chorus, wind rushing, tire squeals, carbon panels cracking, crowd roar, electronic race music. No subtitles.",
     ["bp-hayabusa-hero", "bp-hayabusa-turnaround"]),

    # RYUJI (3)
    ("veo3-ryuji-cover", "image-to-video",
     "An anime magazine cover comes to life, the printed blonde character in black and yellow streetwear slowly starts breathing, then lifts his head and looks directly at camera with a confident smirk, he adjusts his hoodie collar and runs his hand through his spiky hair, the magazine typography and Japanese text elements flutter and animate around him like floating graphic design elements, the white background subtly shifts to reveal a Tokyo street scene behind him, cinematic transition from 2D print to living character. Audio: paper rustling, a stylish whoosh as elements animate, city ambiance fading in, a cool hip-hop beat drops. No subtitles.",
     ["bp-ryuji-hero"]),
    ("veo3-ryuji-walk", "ingredient",
     "Cinematic tracking shot of a cool blonde anime character in black and yellow streetwear walking confidently down a neon-lit Tokyo alley at night, hands in hoodie pockets, camera follows from a low angle as he passes glowing shop signs and vending machines, his reflection visible in rain puddles on the ground, he pauses to light a cigarette and the flame briefly illuminates his face, smoke trailing into the neon-lit air, manga-style speed lines briefly flash during a dramatic head turn, stylish urban atmosphere. Audio: confident footsteps on wet ground, distant city traffic, lighter click and flame, lo-fi hip-hop beat, muffled Japanese conversation from a nearby izakaya. No subtitles.",
     ["bp-ryuji-hero", "bp-ryuji-turnaround", "bp-ryuji-poster"]),
    ("veo3-ryuji-action", "text-to-video",
     "Dynamic anime fight scene in a Tokyo back alley at night, a blonde character in black and yellow streetwear dodges a punch with a smooth lean back, then delivers a spinning kick that sends his opponent flying into stacked crates, camera whips around to follow the action with manga-style impact frames flashing on each hit, yellow energy effects on his kicks, the scene freezes momentarily on the final kick with bold Japanese onomatopoeia text appearing on screen, then resumes as the opponent crashes, stylish anime action choreography. Audio: rapid whooshing kicks, heavy impacts, crates breaking, dramatic orchestral hit on freeze frame, Japanese shout, intense drum and bass soundtrack. No subtitles.",
     []),

    # FASHION — Couture (2)
    ("fashion-couture-walk", "image-to-video",
     "A model walks slowly down a haute couture runway, her golden silk gown flowing and catching the spotlight with every step, the fabric ripples like liquid gold, camera follows in slow motion tracking shot, audience watches in awe from shadowed seats, dramatic fog and volumetric lighting, cinematic fashion film, 4K. Audio: heels clicking on marble, gentle fabric rustling, ambient orchestral music, camera shutters. No subtitles.",
     ["fashion-couture-hero"]),
    ("fashion-couture-atelier", "image-to-video",
     "Inside a Parisian haute couture atelier, skilled hands meticulously sewing crystals onto fabric, needle piercing through velvet, thread being pulled taut, camera moves in extreme close-up showing the precision of each stitch, pull back to reveal the full magnificent gown on a dress form, warm golden workshop lighting. Audio: needle through fabric, soft classical music, clock ticking, thread snipping. No subtitles.",
     ["fashion-couture-detail"]),

    # FASHION — Runway (2)
    ("fashion-runway-show", "image-to-video",
     "A dramatic fashion runway show, models emerge one by one from a fog-filled entrance walking with confidence, each wearing a different striking outfit, camera captures from the front row perspective, spotlights sweep across the catwalk, audience reactions visible in background, fast-paced editing between different models, electric fashion week atmosphere. Audio: driving electronic music, heels on runway, camera shutters clicking rapidly, crowd murmuring in excitement. No subtitles.",
     ["fashion-runway-hero"]),
    ("fashion-runway-finale", "ingredient",
     "Fashion show finale moment, the designer walks out to thunderous applause flanked by all models in a grand procession, confetti falls from above, models break formation and celebrate, hugging each other and the designer, emotional culmination of the show, cinematic slow motion mixed with real-time, golden confetti catching spotlight. Audio: massive applause, cheering, emotional orchestral music swelling, confetti rustling. No subtitles.",
     ["fashion-runway-hero", "fashion-runway-lineup"]),

    # FASHION — Streetwear (2)
    ("fashion-street-walk", "image-to-video",
     "A young model walks confidently through neon-lit Tokyo streets at night, wearing oversized designer streetwear, camera follows in smooth tracking shot, neon reflections dance on wet pavement, the model stops to check their phone then continues with swag, passersby turn to look, urban fashion film aesthetic. Audio: footsteps on wet concrete, muffled Japanese city sounds, lo-fi hip-hop beat, distant traffic. No subtitles.",
     ["fashion-street-hero"]),
    ("fashion-street-crew", "ingredient",
     "A crew of diverse young models in coordinated streetwear walking together on a rooftop at golden hour, city skyline behind them, they pose individually then together for an invisible camera, laughing and showing off outfits, drone shot pulling up and away to reveal the full rooftop scene, golden light wrapping around silhouettes. Audio: wind on rooftop, distant city traffic, upbeat trap beat, laughter and conversation. No subtitles.",
     ["fashion-street-hero", "fashion-street-group", "fashion-street-detail"]),

    # FASHION — Accessories (2)
    ("fashion-accessories-reveal", "image-to-video",
     "Cinematic product reveal of a luxury handbag, starting in darkness then a single spotlight slowly illuminates the bag on a rotating marble pedestal, camera orbits around showing every angle, gold hardware catches light creating lens flares, silk lining is briefly visible as the bag opens slightly, premium product film. Audio: elegant piano notes, soft mechanical rotation, leather creaking subtly, dramatic orchestral swell at full reveal. No subtitles.",
     ["fashion-accessories-hero"]),
    ("fashion-jewelry-campaign", "image-to-video",
     "A models hand slowly reaches for a statement gold necklace displayed on black velvet, her fingers gently lift it revealing prismatic light refractions from the gemstones, she clasps it around her neck, camera pushes in to extreme close-up showing the intricate metalwork against her skin, luxury jewelry campaign film. Audio: delicate chain links touching, soft ambient tones, heartbeat-like bass, shimmering high-frequency sparkle sounds. No subtitles.",
     ["fashion-accessories-jewelry"]),

    # FASHION — Editorial (3)
    ("fashion-editorial-wind", "image-to-video",
     "A model in a flowing sculptural dress stands in an abandoned baroque palace as wind suddenly blows through broken windows, her dress billows dramatically like wings, golden dust particles swirl in sunbeams, she turns slowly toward camera with an intense gaze, hair flowing, fabric dancing, cinematic fashion film with slow motion. Audio: wind howling through old building, fabric flapping, dust settling, ethereal ambient music. No subtitles.",
     ["fashion-editorial-hero"]),
    ("fashion-editorial-noir", "image-to-video",
     "Film noir fashion scene, a model in a sleek black evening gown walks through a dimly lit corridor, her silhouette casting long dramatic shadows on the wall, she pauses at a window where venetian blind shadows stripe across her face, slowly turns with a mysterious expression, smoke curls through the frame, black and white with gold tinting. Audio: heels echoing in empty corridor, distant jazz saxophone, venetian blinds clicking, atmospheric noir soundtrack. No subtitles.",
     ["fashion-editorial-noir"]),
    ("fashion-montage", "text-to-video",
     "A rapid-cut fashion montage combining all styles: haute couture gown spinning in slow motion, streetwear crew walking in urban night, luxury accessories gleaming under spotlight, runway models strutting in sequence, editorial poses in dramatic locations, all cut to a driving beat, each shot lasting 1-2 seconds, building intensity toward a finale of all elements overlapping, premium fashion brand campaign film. Audio: building electronic beat, fabric whooshes, camera clicks, heels, crescendo to climactic drop. No subtitles.",
     []),
]

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) skyverses-retry/1.0"

def api_post(url, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", TOKEN)
    req.add_header("User-Agent", UA)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def api_get(url):
    req = urllib.request.Request(url)
    req.add_header("Authorization", TOKEN)
    req.add_header("User-Agent", UA)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def download_file(url, path):
    req = urllib.request.Request(url)
    req.add_header("User-Agent", UA)
    with urllib.request.urlopen(req) as resp:
        with open(path, "wb") as f:
            while True:
                chunk = resp.read(65536)
                if not chunk:
                    break
                f.write(chunk)

# ─── PHASE 2: Submit jobs ───
print(f"\n{'='*50}", flush=True)
print(f"  PHASE 2: Submitting {len(VIDEOS)} video jobs", flush=True)
print(f"{'='*50}\n", flush=True)

job_ids = {}  # name -> job_id
skipped = set()

for idx, (name, vtype, prompt, refs) in enumerate(VIDEOS):
    num = f"[{idx+1}/{len(VIDEOS)}]"

    # Skip if already downloaded
    out_path = os.path.join(ASSETS_DIR, f"{name}.mp4")
    if os.path.exists(out_path) and os.path.getsize(out_path) > 100_000:
        size = os.path.getsize(out_path)
        print(f"  {num} SKIP {name} (already downloaded, {size:,} bytes)", flush=True)
        skipped.add(name)
        continue

    # Resolve ref image URLs
    img_urls = []
    for r in refs:
        if r in ref_map:
            img_urls.append(ref_map[r])

    # Fallback to text-to-video if refs missing
    actual_type = vtype
    if vtype != "text-to-video" and not img_urls:
        print(f"  WARN: {name} -> fallback to text-to-video (no refs)", flush=True)
        actual_type = "text-to-video"

    # Build payload
    payload = {
        "type": actual_type,
        "prompt": prompt,
        "duration": 5,
        "aspectRatio": "16:9",
        "resolution": "720p",
        "mode": "relaxed",
        "engine": {"provider": "fxflow", "model": "veo_3_generate"}
    }
    if actual_type == "image-to-video" and img_urls:
        payload["startImage"] = img_urls[0]
    elif actual_type == "ingredient" and img_urls:
        payload["images"] = img_urls[:3]

    badge = {"text-to-video": "TXT", "image-to-video": "IMG", "ingredient": "ING"}.get(actual_type, "???")

    try:
        r = api_post(VID_API, payload)
        jid = r["data"]["jobId"]
        job_ids[name] = jid
        print(f"  {num} [{badge}] {name} -> {jid}", flush=True)
    except Exception as e:
        print(f"  {num} ERROR {name}: {e}", flush=True)

    time.sleep(2)

# ─── PHASE 3: Poll & download ───
print(f"\n{'='*50}", flush=True)
print(f"  PHASE 3: Polling & downloading {len(job_ids)} videos", flush=True)
print(f"{'='*50}\n", flush=True)

done_count = len(skipped)
fail_count = 0
total = len(VIDEOS)

results_f = open(RESULTS_FILE, "a")

for name, jid in job_ids.items():
    for attempt in range(1, 121):
        time.sleep(10)
        try:
            sr = api_get(f"{VID_API}/{jid}")
            st = sr["data"]["status"]
        except Exception as e:
            print(f"  ... {name}: poll error ({attempt}/120)", flush=True)
            continue

        if st == "done":
            video_url = sr["data"]["result"].get("videoUrl", "")
            out_path = os.path.join(ASSETS_DIR, f"{name}.mp4")
            print(f"  Downloading {name}...", flush=True)
            try:
                download_file(video_url, out_path)
                fsize = os.path.getsize(out_path)
                if fsize > 10_000:
                    done_count += 1
                    print(f"  OK [{done_count}/{total}] {name} ({fsize:,} bytes)", flush=True)
                    results_f.write(f"{name}|/assets/showcase/{name}.mp4|{video_url}\n")
                else:
                    print(f"  WARN: {name} too small ({fsize} bytes)", flush=True)
                    fail_count += 1
            except Exception as e:
                print(f"  DOWNLOAD ERROR {name}: {e}", flush=True)
                fail_count += 1
            break
        elif st in ("failed", "error"):
            err = sr["data"].get("error", {}).get("userMessage", "unknown")
            print(f"  FAIL {name}: {err}", flush=True)
            fail_count += 1
            break
        else:
            sys.stdout.write(f"  ... {name}: {st} ({attempt}/120)\r")
            sys.stdout.flush()

results_f.close()

print(f"\n{'='*50}", flush=True)
print(f"  DONE: {done_count}/{total} videos OK, {fail_count} failed", flush=True)
print(f"  Results: {RESULTS_FILE}", flush=True)
print(f"  Videos: {ASSETS_DIR}", flush=True)
print(f"{'='*50}", flush=True)
