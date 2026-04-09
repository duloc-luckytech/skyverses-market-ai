/**
 * Gen Social Banner AI — Product Image Generator
 * ───────────────────────────────────────────────
 * 1. Tìm product "social-banner-ai" từ GET /market
 * 2. Tạo ảnh AI qua /api-client/external/image-task
 * 3. Poll đến khi done
 * 4. Upload lên Cloudflare CDN
 * 5. Update product imageUrl via PUT /market/:id
 *
 * Run: node gen-social-banner-image.mjs
 */

const API_BASE = 'https://api.skyverses.com';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM4ZDhjYWQ4MWZhNWRlN2JkMTA2MTYiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHNreXZlcnNlcy5jb20iLCJpYXQiOjE3NzU0OTIzOTQsImV4cCI6MTc3NjA5NzE5NH0.3c7nZ2JOFwDtaw6cn9zg7xnA6HyUohbC6jpQ4Q_mUZI';
const SKV_API_TOKEN = 'skv_cbb360d3c039ffb0ebb494e8536a9730a9faa4acde25d44be11a8087b65a230b';
const CF_ACCOUNT_ID = 'cf3d665aec0eda633986d008ba66c967';
const CF_API_TOKEN = 'cfut_EqsuFJ2hEEz1Gkm5596aLAfnnLyn6sGzYuVDXFZjb59c46b5';
const CF_DELIVERY_URL = 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA';

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 120;

// ── AI image prompt for Social Banner AI product ──────────────────────────────
const BANNER_PROMPT = `A premium social media banner creation studio — multiple platform windows side by side 
showing the same brand banner adapted for X (Twitter), Facebook, Instagram Story, and LinkedIn. 
Each banner auto-fits the correct dimensions: X cover 1500×500, Facebook post 1200×630, Instagram story 1080×1920. 
Glowing UI with platform logos, AI-generated poster designs visible in each canvas. 
Dark premium tech interface, brand-blue and purple gradient accents, holographic layout guides, 
pixel dimension labels floating in golden text. Cinematic 4K quality, ultra professional.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

// ─── Step 1: Find the product ─────────────────────────────────────────────────
async function findProduct() {
  console.log('📦 Fetching products from /market...');
  const result = await fetchJSON(`${API_BASE}/market`);
  if (!result.success) throw new Error('Failed to fetch products');

  const product = result.data.find(p => p.slug === 'social-banner-ai');
  if (!product) {
    throw new Error('❌ Product "social-banner-ai" not found. Run seed-social-banner.mjs first.');
  }
  console.log(`   ✅ Found: ${product.name?.en} (_id: ${product._id})`);
  return product;
}

// ─── Step 2: Create image task ────────────────────────────────────────────────
async function createImageTask(prompt) {
  console.log('\n🎨 Creating AI image task...');
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

  console.log(`   🚀 Job created: ${result.data.jobId}`);
  return result.data.jobId;
}

// ─── Step 3: Poll until done ──────────────────────────────────────────────────
async function pollUntilDone(jobId) {
  console.log(`\n⏳ Polling job ${jobId}...`);
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS);

    const result = await fetchJSON(`${API_BASE}/api-client/external/image-task/${jobId}`, {
      headers: { 'Authorization': `Bearer ${SKV_API_TOKEN}` },
    });

    if (!result.success) {
      process.stdout.write(`   ⚠️  Poll error, retrying... (${attempt + 1}/${MAX_POLL_ATTEMPTS})\r`);
      continue;
    }

    const { status, result: jobResult, progress } = result.data;
    const pct = progress ? ` (${Math.round(progress * 100)}%)` : '';

    if (status === 'done' && jobResult?.images?.length) {
      console.log(`\n   ✅ Image ready!`);
      return jobResult.images[0];
    }

    if (status === 'error' || status === 'reject') {
      throw new Error(`Job ${jobId} failed with status: ${status}`);
    }

    process.stdout.write(`   ⏳ ${status}${pct} (${attempt + 1}/${MAX_POLL_ATTEMPTS})          \r`);
  }

  throw new Error(`Job ${jobId} timed out`);
}

// ─── Step 4: Upload to Cloudflare ─────────────────────────────────────────────
async function uploadToCloudflare(imageUrl, metadata = {}) {
  console.log('\n☁️  Uploading to Cloudflare CDN...');
  const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1`;

  const formData = new FormData();
  formData.append('url', imageUrl);
  formData.append('metadata', JSON.stringify({
    source: 'skyverses_market_product',
    ...metadata,
  }));

  const res = await fetch(cfUrl, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${CF_API_TOKEN}` },
    body: formData,
  });

  const result = await res.json();
  if (!result.success) {
    console.warn('   ⚠️  Cloudflare upload failed, using Skyverses URL as fallback');
    console.warn('   Errors:', result.errors);
    return { success: false, imageUrl };
  }

  const cfImageId = result.result.id;
  const deliveryUrl = `${CF_DELIVERY_URL}/${cfImageId}/public`;
  console.log(`   ✅ Cloudflare CDN: ${deliveryUrl}`);
  return { success: true, imageUrl: deliveryUrl, cfImageId };
}

// ─── Step 5: Update product imageUrl ─────────────────────────────────────────
async function updateProductImage(productId, imageUrl) {
  console.log('\n💾 Updating product imageUrl in database...');
  const result = await fetchJSON(`${API_BASE}/market/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify({ imageUrl }),
  });

  if (!result.success) {
    throw new Error(`Update failed: ${result.message || JSON.stringify(result)}`);
  }

  console.log(`   ✅ Product updated!`);
  return result.data;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   🎨 Social Banner AI — Product Image Generator      ║');
  console.log('║   AI → Cloudflare CDN → Market DB                    ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // 1. Find product
  const product = await findProduct();

  // 2. Create AI image task
  const jobId = await createImageTask(BANNER_PROMPT);

  // 3. Poll until done
  const skvImageUrl = await pollUntilDone(jobId);
  console.log(`\n   📸 Skyverses URL: ${skvImageUrl.substring(0, 80)}...`);

  // 4. Upload to Cloudflare
  const cfResult = await uploadToCloudflare(skvImageUrl, {
    productId: product.id || product._id,
    productSlug: 'social-banner-ai',
    jobId,
  });

  const finalUrl = cfResult.success ? cfResult.imageUrl : skvImageUrl;
  const source = cfResult.success ? 'Cloudflare CDN' : 'Skyverses (fallback)';

  // 5. Update product
  await updateProductImage(product._id, finalUrl);

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   ✅ DONE                                             ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║   Source: ${source.padEnd(43)}║`);
  console.log(`║   URL: ${finalUrl.substring(0, 46).padEnd(46)}║`);
  console.log('╚══════════════════════════════════════════════════════╝');
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});
