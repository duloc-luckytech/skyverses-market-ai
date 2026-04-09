/**
 * gen-social-banner-ai-image.mjs
 * ─────────────────────────────────────────────────────────
 * Generate, upload to Cloudflare CDN, and update DB
 * for the Social Banner AI product.
 *
 * Pipeline: Skyverses AI → Cloudflare CDN → PUT /market/:id
 *
 * Usage:
 *   node gen-social-banner-ai-image.mjs
 *
 * ⚠️ If SKV_API_TOKEN returns 401 → get a new token from CMS Admin > API Clients
 */

const API_BASE = 'https://api.skyverses.com';

// ── Tokens ──
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3NzU0OTIzOTQsImV4cCI6MTc3NjA5NzE5NH0.3c7nZ2JOFwDtaw6cn9zg7xnA6HyUohbC6jpQ4Q_mUZI';
const SKV_API_TOKEN = 'skv_cbb360d3c039ffb0ebb494e8536a9730a9faa4acde25d44be11a8087b65a230b';

// ── Cloudflare Images ──
const CF_ACCOUNT_ID  = 'cf3d665aec0eda633986d008ba66c967';
const CF_API_TOKEN   = 'cfut_EqsuFJ2hEEz1Gkm5596aLAfnnLyn6sGzYuVDXFZjb59c46b5';
const CF_DELIVERY_URL = 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA';

// ── Product ──
const PRODUCT_ID  = '69d72a988519b291d8b17777'; // MongoDB _id từ seed
const PRODUCT_SKU = 'SOCIAL-BANNER-AI';

const BANNER_PROMPT = `A premium social media banner creation studio — multiple platform canvases side by side showing X (Twitter) cover 1500×500, Facebook post 1200×630, Instagram story 1080×1920, and LinkedIn banner 1584×396. Each canvas shows a beautifully designed AI-generated brand banner. Platform logos glowing in the corners. Dark premium interface with brand-blue and purple gradient accents, holographic layout guides, pixel dimension labels floating in golden text around each frame. Cinematic 4K quality, ultra professional.`;

// ── Polling config ──
const POLL_INTERVAL_MS  = 5_000;
const MAX_POLL_ATTEMPTS = 120; // 10 min max

// ─── Helpers ───────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} @ ${url}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

// ─── Step 1: Create image generation task ──────────────────
async function createImageTask() {
  console.log('🚀 Creating image task...');
  const body = {
    prompt: BANNER_PROMPT,
    type: 'text_to_image',
    aspectRatio: '16:9',
    engine: { provider: 'fxflow', model: 'google_image_gen_4_5' },
  };

  const result = await fetchJSON(`${API_BASE}/api-client/external/image-task`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SKV_API_TOKEN}` },
    body: JSON.stringify(body),
  });

  if (!result.success) throw new Error(`Task creation failed: ${result.message}`);
  const jobId = result.data.jobId;
  console.log(`   Job ID: ${jobId}`);
  return jobId;
}

// ─── Step 2: Poll until done ───────────────────────────────
async function pollUntilDone(jobId) {
  console.log('⏳ Polling for result...');
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    await sleep(POLL_INTERVAL_MS);

    const result = await fetchJSON(`${API_BASE}/api-client/external/image-task/${jobId}`, {
      headers: { Authorization: `Bearer ${SKV_API_TOKEN}` },
    });

    if (!result.success) { process.stdout.write(`   ⚠️  Poll ${i + 1}: retry...\r`); continue; }

    const { status, result: jobResult, progress } = result.data;

    if (status === 'done' && jobResult?.images?.length) {
      console.log(`\n   ✅ Done after ${i + 1} polls`);
      return jobResult.images[0];
    }

    if (status === 'error' || status === 'reject') {
      throw new Error(`Job failed: ${result.data.error?.message || status}`);
    }

    const pct = progress ? ` (${Math.round(progress * 100)}%)` : '';
    process.stdout.write(`   ⏳ poll ${i + 1}/${MAX_POLL_ATTEMPTS} — ${status}${pct}          \r`);
  }

  throw new Error('Timed out waiting for image generation');
}

// ─── Step 3: Upload to Cloudflare Images ──────────────────
async function uploadToCloudflare(imageUrl) {
  console.log('☁️  Uploading to Cloudflare Images...');
  const formData = new FormData();
  formData.append('url', imageUrl);
  formData.append('metadata', JSON.stringify({ source: 'skyverses_market_product', productId: PRODUCT_SKU }));

  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    body: formData,
  });

  const result = await res.json();
  if (!result.success) {
    console.warn('   ⚠️  Cloudflare upload failed:', result.errors);
    return imageUrl; // fallback to SKV URL
  }

  const cdnUrl = `${CF_DELIVERY_URL}/${result.result.id}/public`;
  console.log(`   ✅ Cloudflare CDN: ${cdnUrl}`);
  return cdnUrl;
}

// ─── Step 4: Update product in DB ─────────────────────────
async function updateProduct(imageUrl) {
  console.log('💾 Updating product imageUrl in DB...');
  const result = await fetchJSON(`${API_BASE}/market/${PRODUCT_ID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ADMIN_TOKEN}` },
    body: JSON.stringify({ imageUrl }),
  });

  if (!result.success) throw new Error(`Update failed: ${result.message}`);
  console.log('   ✅ Product updated!');
}

// ─── Main ──────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  🎨 Social Banner AI — Image Generator   ║');
  console.log('╚══════════════════════════════════════════╝\n');

  const jobId = await createImageTask();
  const skvUrl = await pollUntilDone(jobId);
  console.log(`   📸 SKV image: ${skvUrl.slice(0, 80)}...`);

  const finalUrl = await uploadToCloudflare(skvUrl);
  await updateProduct(finalUrl);

  console.log('\n✅ All done!');
  console.log(`   Product _id : ${PRODUCT_ID}`);
  console.log(`   Image URL   : ${finalUrl}`);
}

main().catch(err => {
  console.error('\n💥 Fatal:', err.message);
  process.exit(1);
});
