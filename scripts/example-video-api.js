/**
 * ============================================================
 * Skyverses External API — Video Generation Example
 * ============================================================
 *
 * Hướng dẫn sử dụng:
 * 1. Điền API_TOKEN và BASE_URL
 * 2. Chạy: node example-video-api.js
 *
 * Flow:
 *   POST /api-client/external/video-task  → nhận jobId ngay lập tức
 *   GET  /api-client/external/video-task-status/:jobId  → poll đến khi done
 * ============================================================
 */

const API_TOKEN = "skv_YOUR_TOKEN_HERE";       // 🔑 Thay bằng token của bạn
const BASE_URL  = "https://api.skyverses.io";   // 🌐 Thay bằng domain thực tế

const HEADERS = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${API_TOKEN}`,
};

// ============================================================
// 1️⃣  TẠO VIDEO TASK
//     POST /api-client/external/video-task
// ============================================================
async function createVideoTask(payload) {
  const res = await fetch(`${BASE_URL}/api-client/external/video-task`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!data.success) throw new Error(`Create failed: ${data.message}`);
  return data.data; // { jobId, status, type, engine, owner, createdAt }
}

// ============================================================
// 2️⃣  POLL TRẠNG THÁI VIDEO TASK
//     GET /api-client/external/video-task-status/:jobId
// ============================================================
async function pollVideoStatus(jobId) {
  const res = await fetch(`${BASE_URL}/api-client/external/video-task-status/${jobId}`, {
    headers: HEADERS,
  });
  const data = await res.json();
  if (!data.success) throw new Error(`Poll failed: ${data.message}`);
  return data; // { success, phase, data: { status, result, ... } }
}

// ============================================================
// 3️⃣  VÒNG LẶP POLL CHO ĐẾN KHI DONE
// ============================================================
async function waitForVideo(jobId, { intervalMs = 5000, timeoutMs = 600_000 } = {}) {
  const deadline = Date.now() + timeoutMs;

  console.log(`\n⏳ Polling jobId: ${jobId} ...`);

  while (Date.now() < deadline) {
    const res = await pollVideoStatus(jobId);
    const { phase, data } = res;
    const status = data?.status;

    console.log(`   [${new Date().toISOString()}] phase=${phase} status=${status}`);

    if (phase === "video" && status === "done") {
      console.log(`\n✅ Video DONE!`);
      console.log(`   URL: ${data.result?.videoUrl}`);
      return data;
    }

    if (phase === "video" && status === "error") {
      throw new Error(`Video generation failed: ${data.error?.message || "unknown"}`);
    }

    await sleep(intervalMs);
  }

  throw new Error(`Timeout after ${timeoutMs / 1000}s`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ============================================================
// ✅  VÍ DỤ 1: Text-to-Video (không có ảnh)
// ============================================================
async function example_textToVideo() {
  console.log("\n============================");
  console.log("📹  Example 1: Text-to-Video");
  console.log("============================");

  const task = await createVideoTask({
    prompt: "A product flying through a galaxy with sparkles and light trails",
    duration: 5,
    aspectRatio: "16:9",   // "16:9" | "9:16" | "1:1"
    resolution: "720p",
    mode: "relaxed",        // "fast" | "relaxed" | "quality"
  });

  console.log(`🎬 Created jobId: ${task.jobId}  type: ${task.type}`);
  const result = await waitForVideo(task.jobId);
  console.log(`🎥 Result:`, result.result);
}

// ============================================================
// ✅  VÍ DỤ 2: Image-to-Video (startImage là URL ảnh)
// ============================================================
async function example_imageToVideo() {
  console.log("\n================================");
  console.log("🖼️   Example 2: Image-to-Video");
  console.log("================================");

  const task = await createVideoTask({
    prompt: "The product glows and rotates gently in a dark studio, premium lighting",
    startImage: "https://example.com/your-product-image.jpg",  // 🔗 URL ảnh sản phẩm
    duration: 5,
    aspectRatio: "9:16",   // portrait
    resolution: "720p",
    mode: "relaxed",
  });

  console.log(`🎬 Created jobId: ${task.jobId}  type: ${task.type}`);
  const result = await waitForVideo(task.jobId);
  console.log(`🎥 Result:`, result.result);
}

// ============================================================
// ✅  VÍ DỤ 3: Start + End Image (bookend style)
// ============================================================
async function example_startEndVideo() {
  console.log("\n======================================");
  console.log("🎞️   Example 3: Start-End Image Video");
  console.log("======================================");

  const task = await createVideoTask({
    prompt: "Smooth transition between two product angles",
    type: "start-end-image",
    startImage: "https://example.com/product-front.jpg",
    endImage:   "https://example.com/product-back.jpg",
    duration: 5,
    aspectRatio: "16:9",
    resolution: "720p",
  });

  console.log(`🎬 Created jobId: ${task.jobId}  type: ${task.type}`);
  const result = await waitForVideo(task.jobId);
  console.log(`🎥 Result:`, result.result);
}

// ============================================================
// ✅  VÍ DỤ 4: Chỉ list danh sách video tasks của tôi
// ============================================================
async function example_listMyTasks() {
  console.log("\n==========================");
  console.log("📋  Example 4: List Tasks");
  console.log("==========================");

  const res = await fetch(`${BASE_URL}/api-client/external/video-tasks?page=1&limit=10`, {
    headers: HEADERS,
  });
  const data = await res.json();
  console.log(`Total: ${data.pagination?.total}  Page: ${data.pagination?.page}`);
  for (const job of data.data || []) {
    console.log(`  - [${job.status}] ${job._id}  type=${job.type}  ${job.createdAt}`);
  }
}

// ============================================================
// 🚀  CHẠY
// ============================================================
(async () => {
  try {
    // Chọn example bạn muốn chạy:
    await example_textToVideo();
    // await example_imageToVideo();
    // await example_startEndVideo();
    // await example_listMyTasks();
  } catch (err) {
    console.error("\n❌ Error:", err.message);
    process.exit(1);
  }
})();
