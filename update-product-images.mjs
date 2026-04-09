/**
 * Update Product Images Script
 * ─────────────────────────────
 * 1. Fetch all 30 products from GET /market
 * 2. Generate tailored AI prompt for each product
 * 3. Create image task via POST /api-client/external/image-task
 * 4. Poll until done via GET /api-client/external/image-task/:jobId
 * 5. Upload result image to Cloudflare Images (persistent CDN)
 * 6. Update product imageUrl via PUT /market/:id
 */

const API_BASE = 'https://api.skyverses.com';

// Admin JWT for market CRUD
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3NzQ3NzA0ODEsImV4cCI6MTc3NTM3NTI4MX0.5sWLqUkzr30pFVNe00dci_wZNO_cTkR1RcpFOGWAfig';

// API Token for external image-task (Bearer apiToken)
const SKV_API_TOKEN = 'skv_cbb360d3c039ffb0ebb494e8536a9730a9faa4acde25d44be11a8087b65a230b';

// Cloudflare Images config
const CF_ACCOUNT_ID = 'cf3d665aec0eda633986d008ba66c967';
const CF_API_TOKEN = 'cfut_EqsuFJ2hEEz1Gkm5596aLAfnnLyn6sGzYuVDXFZjb59c46b5';
const CF_DELIVERY_URL = 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA';

// ─── Polling config ───
const POLL_INTERVAL_MS = 5000;   // 5s between polls
const MAX_POLL_ATTEMPTS = 120;   // 10 min max per job
const CONCURRENCY = 3;           // 3 jobs at a time

// ─── Helpers ───
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

// ─── Upload image URL to Cloudflare Images ───
async function uploadToCloudflare(imageUrl, metadata = {}) {
  const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1`;

  const formData = new FormData();
  formData.append('url', imageUrl);
  formData.append('metadata', JSON.stringify({
    source: 'skyverses_market_product',
    ...metadata,
  }));

  const res = await fetch(cfUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
    },
    body: formData,
  });

  const result = await res.json();

  if (!result.success) {
    console.error('   ⚠️  Cloudflare upload failed:', result.errors);
    return { success: false, imageUrl };
  }

  // Build delivery URL: https://imagedelivery.net/<hash>/<image_id>/public
  const cfImageId = result.result.id;
  const deliveryUrl = `${CF_DELIVERY_URL}/${cfImageId}/public`;

  return { success: true, imageUrl: deliveryUrl, cfImageId };
}

// ─── Generate a tailored prompt per product ───
function buildPrompt(product) {
  const name = product.name?.en || product.slug;
  const tags = (product.tags || []).join(', ');
  const features = (product.features || []).map(f => f.en).filter(Boolean).join(', ');

  const promptMap = {
    'IMAGE-UPSCALE-AI': `A futuristic ultra-high-resolution AI image enhancement studio. A split-screen comparison showing a blurry pixelated photo transforming into crystal-clear 4K detail. Glowing neural network particles flowing across the image. Deep space dark theme with cyan and gold energy streams. Photorealistic, cinematic lighting, 4K quality.`,

    'TET-AI-PRO': `A stunning Vietnamese Lunar New Year (Tết) scene — a beautiful woman in a traditional red and gold Áo dài standing under cherry blossom trees (hoa đào). Festive lanterns, kumquat trees with golden fruits, red and gold decorations. Warm golden lighting, ultra premium quality, cinematic 4K.`,

    'NOEL-AI-PRO': `A magical Christmas winter wonderland scene — a cozy snow-covered village with twinkling fairy lights, a majestic Christmas tree with golden ornaments, soft falling snowflakes. A figure in elegant winter clothing. Warm festive glow, bokeh lights, cinematic 4K quality.`,

    'WEDDING-AI-PRO': `A breathtaking luxury wedding photoshoot — a bride and groom in elegant attire standing in a dreamy garden with soft golden hour sunlight. White flowers, flowing veil, romantic bokeh lights. Ultra premium photography quality, cinematic 4K.`,

    'BIRTHDAY-AI-PRO': `A spectacular birthday celebration scene — a beautiful cake with golden candles, confetti and balloons in elegant rose gold and champagne tones. Festive party atmosphere with bokeh lights. Premium photography, warm golden lighting, cinematic 4K.`,

    'NOCODE-EXPORT': `A futuristic developer workspace showing a website being converted into clean source code. Holographic UI with HTML/CSS code floating in the air, a sleek dark terminal with glowing green lines. Purple and cyan neon accents. Tech utopia aesthetic, cinematic 4K quality.`,

    'AI-AGENT-WORKFLOW': `A futuristic AI workflow orchestration system — interconnected glowing nodes in a dark space, forming an intelligent pipeline. Each node pulses with different colored energy (cyan, purple, gold). Holographic data streams connecting the nodes. Dark tech aesthetic, cinematic 4K.`,

    'BACKGROUND-REMOVE-AI': `A dramatic split-screen visualization of AI background removal — left side shows a product photo with cluttered background, right side shows the same product perfectly isolated on a clean transparent checkered grid. Neural network energy particles at the boundary. Dark premium UI, cinematic 4K.`,

    'MUSIC-GENERATOR': `A futuristic AI music production studio — glowing equalizer bars, holographic waveforms floating in dark space, a sleek synthesizer keyboard with neon accents. Musical notes made of light particles streaming upward. Purple and gold neon atmosphere, cinematic 4K quality.`,

    '3D-SPATIAL-ARCHITECT': `A stunning futuristic 3D architectural visualization — a modern glass skyscraper being constructed from holographic blueprints. AI-generated wireframe models transforming into photorealistic renders. Golden and cyan energy grids in dark space. Premium cinematic 4K quality.`,

    'BANANA-PRO-COMIC': `A dynamic manga/comic book creation scene — vibrant comic panels being generated by AI with consistent characters. Action poses, speech bubbles, dramatic panel layouts with speed lines. Bold colors on dark background. Japanese manga aesthetic meets AI technology, cinematic 4K.`,

    'CHARACTER-SYNC-STUDIO': `A futuristic AI character design studio — 6 images of the same character in different poses and scenes, all perfectly consistent. Holographic interface showing face-lock technology. Glowing identity connection lines between panels. Dark premium tech aesthetic, cinematic 4K.`,

    'FASHION-CENTER-AI': `A premium AI fashion design studio — a virtual runway with AI-generated model wearing a stunning haute couture dress. Holographic fabric swatches and design tools floating around. Elegant lighting with rose gold and white accents. Fashion editorial quality, cinematic 4K.`,

    'POSTER-MARKETING-AI': `A creative marketing poster design workspace — multiple eye-catching posters and banners being auto-generated by AI. Bold typography, vibrant color palettes, and professional layouts. Floating design elements on a sleek dark interface. Premium quality, cinematic 4K.`,

    'PRODUCT-IMAGE': `A professional AI product photography studio — a luxury watch and cosmetic product floating on an elegant marble surface with perfect studio lighting. AI-powered lighting controls and camera angle indicators around it. Clean white and gold aesthetic, cinematic 4K quality.`,

    'TEXT-TO-SPEECH': `A futuristic AI voice synthesis studio — soundwave visualizations of human speech, a glowing microphone in the center with holographic frequency displays. Multiple language flags orbiting around. Dark purple and teal neon accents, cinematic 4K quality.`,

    'VIDEO-ANIMATE-AI': `A dramatic scene of a static photograph transforming into a living animated video — particles of motion energy swirling around the image as it comes to life. Camera movement indicators and timeline controls below. Dark futuristic UI, cyan and gold accents, cinematic 4K.`,

    'AVATAR-SYNC-AI': `A futuristic AI lip-sync avatar studio — a photorealistic digital human face speaking, with visible neural network connections mapping facial muscles and emotions. Audio waveform below synced to mouth movement. Dark tech aesthetic with blue and purple neon, cinematic 4K.`,

    'STUDIO-ARCHITECT-V1': `A professional AI video production command center — multiple floating screens showing different video editing stages: color grading, scene composition, timeline editing. Holographic preview of a cinematic film. Dark premium studio aesthetic, cyan and gold accents, cinematic 4K.`,

    'AI-VOICE-STUDIO': `A premium AI voice recording studio — a professional microphone surrounded by holographic audio waveforms, mixing console with glowing faders. Sound particles flowing through the air. Warm amber and deep purple tones, cinematic 4K quality.`,

    'VOICE-DESIGN-AI': `A futuristic voice design laboratory — a humanoid head silhouette made of sound waves and neural particles. Voice profile cards floating around showing different voice characteristics. Dark space with teal and orange neon accents, cinematic 4K.`,

    'AI-IMAGE-GENERATOR': `A mesmerizing AI art creation scene — a blank canvas transforming into a stunning painting through streams of colorful neural energy particles. Multiple art styles (realistic, anime, oil painting) emerging simultaneously. Vibrant colors on dark background, cinematic 4K.`,

    'AI-VIDEO-GENERATOR': `A cinematic AI video generation scene — a film director's clapboard dissolving into streams of video frames being generated in real-time. Holographic timeline with multiple video clips. Dark premium studio, gold and violet accents, cinematic 4K quality.`,

    'CHARACTER-SYNC-AI': `A futuristic character consistency technology display — the same character rendered perfectly identically across 4 different scenes (city, forest, space, underwater). Glowing face ID lock indicators connecting the images. Dark tech aesthetic, cyan accents, cinematic 4K.`,

    'AI-STYLIST': `A glamorous AI fashion stylist virtual showroom — a holographic mirror showing multiple outfit recommendations on a virtual model. Clothing racks with AI-selected outfits, trend analysis charts floating nearby. Elegant rose gold and black aesthetic, cinematic 4K.`,

    'STORYBOARD-STUDIO': `A cinematic storyboard creation scene — film script text transforming into beautifully drawn storyboard panels. Floating camera angle indicators and shot composition guides. Warm cinematic lighting on dark background, gold film reel accents, cinematic 4K.`,

    'AI-IMAGE-RESTORER': `A dramatic photo restoration scene — a torn, faded vintage family photograph being healed by streams of golden AI energy particles. Cracks filling, colors returning, faces becoming clear. Split before/after view. Warm golden light on dark background, cinematic 4K.`,

    'AI-MUSIC-GENERATOR': `A creative AI music composition scene — a grand piano made of light particles with musical notes and sheet music floating above it. Holographic equalizer and genre selection interface. Deep purple and gold ambient lighting, cinematic 4K quality.`,

    'BAT-DONG-SAN-AI': `A stunning AI real estate visualization — a beautiful modern villa being virtually staged with furniture appearing as holographic projections. Before/after split of empty room vs designer-staged room. Warm golden lighting, luxury real estate aesthetic, cinematic 4K.`,

    'CAPTCHA-VEO3': `A futuristic cybersecurity automation scene — a CAPTCHA challenge being solved in real-time by an AI vision system. Glowing grid patterns, recognition markers highlighting image elements. Matrix-style data streams on dark background, green and cyan neon, cinematic 4K.`,

    'SOCIAL-BANNER-AI': `A premium social media banner creation studio — multiple platform canvases side by side showing X (Twitter) cover 1500×500, Facebook post 1200×630, Instagram story 1080×1920, and LinkedIn banner 1584×396. Each canvas shows a beautifully designed AI-generated brand banner. Platform logos glowing in the corners. Dark premium interface with brand-blue and purple gradient accents, holographic layout guides, pixel dimension labels floating in golden text around each frame. Cinematic 4K quality, ultra professional.`,
  };

  if (promptMap[product.id]) {
    return promptMap[product.id];
  }

  // Fallback
  const desc = product.description?.en || '';
  return `A futuristic premium product showcase for "${name}" — ${desc} Visual elements: ${tags}. Features: ${features}. Dark premium tech aesthetic with glowing accents, holographic UI elements, ultra-high quality cinematic 4K rendering.`;
}

// ─── Step 1: Fetch all products ───
async function fetchProducts() {
  console.log('📦 Fetching all products from /market...');
  const result = await fetchJSON(`${API_BASE}/market`);
  if (!result.success) throw new Error('Failed to fetch products');
  console.log(`   Found ${result.data.length} products`);
  return result.data;
}

// ─── Step 2: Create image task ───
async function createImageTask(prompt) {
  const body = {
    prompt,
    type: 'text_to_image',
    aspectRatio: '16:9',
    engine: {
      provider: 'fxflow',
      model: 'google_image_gen_4_5',
    },
  };

  const result = await fetchJSON(`${API_BASE}/api-client/external/image-task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SKV_API_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  if (!result.success) {
    throw new Error(`Task creation failed: ${result.message || JSON.stringify(result)}`);
  }

  return result.data.jobId;
}

// ─── Step 3: Poll until done ───
async function pollUntilDone(jobId) {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS);

    const result = await fetchJSON(`${API_BASE}/api-client/external/image-task/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${SKV_API_TOKEN}`,
      },
    });

    if (!result.success) {
      console.log(`   ⚠️  Poll failed for ${jobId}, retrying...`);
      continue;
    }

    const { status, result: jobResult, progress, error } = result.data;

    if (status === 'done' && jobResult?.images?.length) {
      return jobResult.images[0];
    }

    if (status === 'error' || status === 'reject') {
      throw new Error(`Job ${jobId} failed: ${error?.message || 'Unknown error'}`);
    }

    const progressStr = progress ? ` (${Math.round(progress * 100)}%)` : '';
    process.stdout.write(`   ⏳ ${jobId} — ${status}${progressStr}          \r`);
  }

  throw new Error(`Job ${jobId} timed out after ${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000}s`);
}

// ─── Step 4: Update product imageUrl ───
async function updateProductImage(productId, imageUrl) {
  const result = await fetchJSON(`${API_BASE}/market/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify({ imageUrl }),
  });

  if (!result.success) {
    throw new Error(`Update failed for ${productId}: ${result.message || JSON.stringify(result)}`);
  }

  return result.data;
}

// ─── Process a single product ───
async function processProduct(product, index, total) {
  const name = product.name?.en || product.slug;
  const prefix = `[${index + 1}/${total}]`;

  try {
    console.log(`\n${prefix} 🎨 ${name} (${product.id})`);

    // 1. Build prompt
    const prompt = buildPrompt(product);
    console.log(`${prefix}   📝 Prompt: ${prompt.substring(0, 80)}...`);

    // 2. Create task
    const jobId = await createImageTask(prompt);
    console.log(`${prefix}   🚀 Job created: ${jobId}`);

    // 3. Poll until done
    const skvImageUrl = await pollUntilDone(jobId);
    console.log(`${prefix}   ✅ Skyverses image ready: ${skvImageUrl.substring(0, 60)}...`);

    // 4. Upload to Cloudflare for persistent CDN hosting
    console.log(`${prefix}   ☁️  Uploading to Cloudflare...`);
    const cfResult = await uploadToCloudflare(skvImageUrl, {
      productId: product.id,
      productSlug: product.slug,
      jobId,
    });

    const finalUrl = cfResult.success ? cfResult.imageUrl : skvImageUrl;
    const source = cfResult.success ? 'Cloudflare CDN' : 'Skyverses (fallback)';
    console.log(`${prefix}   ☁️  ${source}: ${finalUrl.substring(0, 60)}...`);

    // 5. Update product
    await updateProductImage(product._id, finalUrl);
    console.log(`${prefix}   💾 Product updated!`);

    return { id: product.id, name, status: 'success', imageUrl: finalUrl, source };
  } catch (err) {
    console.error(`${prefix}   ❌ FAILED: ${err.message}`);
    return { id: product.id, name, status: 'error', error: err.message };
  }
}

// ─── Process with concurrency control ───
async function processWithConcurrency(products, concurrency) {
  const results = [];
  const queue = [...products.map((p, i) => ({ product: p, index: i }))];

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      const result = await processProduct(item.product, item.index, products.length);
      results.push(result);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, products.length) }, () => worker());
  await Promise.all(workers);

  return results;
}

// ─── Main ───
async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   🎨 Skyverses Product Image Generator           ║');
  console.log('║   API → Skyverses AI → Cloudflare CDN → Market   ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');

  // 1. Fetch products
  const products = await fetchProducts();

  // 2. Process all with concurrency
  console.log(`\n🔄 Processing ${products.length} products (${CONCURRENCY} concurrent)...\n`);
  const results = await processWithConcurrency(products, CONCURRENCY);

  // 3. Summary
  const success = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'error');
  const cfCount = success.filter(r => r.source === 'Cloudflare CDN').length;

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   📊 SUMMARY                                     ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║   ✅ Success:    ${String(success.length).padEnd(33)}║`);
  console.log(`║   ☁️  Cloudflare: ${String(cfCount).padEnd(33)}║`);
  console.log(`║   ❌ Failed:     ${String(failed.length).padEnd(33)}║`);
  console.log(`║   📦 Total:      ${String(results.length).padEnd(33)}║`);
  console.log('╚══════════════════════════════════════════════════╝');

  if (failed.length > 0) {
    console.log('\n❌ Failed products:');
    failed.forEach(f => console.log(`   • ${f.name}: ${f.error}`));
  }

  if (success.length > 0) {
    console.log('\n✅ Updated images:');
    success.forEach(s => console.log(`   • ${s.name} [${s.source}]: ${s.imageUrl?.substring(0, 70)}...`));
  }
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
