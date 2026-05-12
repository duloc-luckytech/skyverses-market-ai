import "dotenv/config";
import fs from "fs";
import path from "path";
import {
  buildPromptMarketAssetTasks,
  PROMPT_MARKET_BLUEPRINT_STANDARD,
  PromptMarketAssetTask,
} from "./prompt-market-blueprint";

type TaskStatus = "pending" | "processing" | "polling" | "done" | "error" | "failed" | "reject" | "cancelled" | "unknown";

interface AssetStateItem {
  id: string;
  packId: string;
  type: PromptMarketAssetTask["type"];
  role: PromptMarketAssetTask["role"];
  aspectRatio: PromptMarketAssetTask["aspectRatio"];
  prompt: string;
  jobId?: string;
  status?: TaskStatus;
  sourceUrl?: string;
  cloudflareUrl?: string;
  cloudflareUid?: string;
  referenceImages?: string[];
  error?: unknown;
  updatedAt: string;
}

type AssetState = Record<string, AssetStateItem>;

const EXTERNAL_BASE = process.env.SKYVERSES_EXTERNAL_BASE || "https://api.skyverses.com/api-client/external";
const EXTERNAL_TOKEN = process.env.SKYVERSES_EXTERNAL_API_TOKEN || process.env.SKY_EXTERNAL_TOKEN || "";
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID || "";
const CF_IMAGES_TOKEN = process.env.CF_IMAGES_TOKEN || "";
const CF_STREAM_TOKEN = process.env.CF_STREAM_TOKEN || "";
const CF_STREAM_SUBDOMAIN = process.env.CF_STREAM_SUBDOMAIN || "customer-xq04fu0u3x";
const STATE_FILE = process.env.PM_ASSET_STATE_FILE || path.resolve(process.cwd(), "../tmp/prompt-market-assets-state.json");
const RESULT_FILE = process.env.PM_ASSET_RESULT_FILE || path.resolve(process.cwd(), "../tmp/prompt-market-assets-results.json");
const IMAGE_CONCURRENCY = Number(process.env.PM_IMAGE_CONCURRENCY || "6");
const VIDEO_CONCURRENCY = Number(process.env.PM_VIDEO_CONCURRENCY || "3");
const POLL_INTERVAL_MS = Number(process.env.PM_POLL_INTERVAL_MS || "10000");
const MAX_POLLS = Number(process.env.PM_MAX_POLLS || "240");
const MODE = process.env.PM_ASSET_MODE || "all";
const PACK_IDS = (process.env.PM_PACK_IDS || process.env.PM_PACK_ID || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const TASK_ROLES = (process.env.PM_TASK_ROLES || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

if (MODE !== "list" && !EXTERNAL_TOKEN) throw new Error("Missing SKYVERSES_EXTERNAL_API_TOKEN");
if ((MODE === "all" || MODE === "upload") && (!CF_ACCOUNT_ID || !CF_IMAGES_TOKEN || !CF_STREAM_TOKEN)) {
  throw new Error("Missing CF_ACCOUNT_ID, CF_IMAGES_TOKEN, or CF_STREAM_TOKEN");
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => new Date().toISOString();

const ensureParentDir = (file: string) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
};

const readState = (): AssetState => {
  if (!fs.existsSync(STATE_FILE)) return {};
  return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) as AssetState;
};

let state: AssetState = readState();

const saveState = () => {
  ensureParentDir(STATE_FILE);
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
};

const saveResults = () => {
  ensureParentDir(RESULT_FILE);
  const results = Object.values(state)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(({ id, packId, type, role, aspectRatio, jobId, status, sourceUrl, cloudflareUrl, cloudflareUid, referenceImages }) => ({
      id,
      packId,
      type,
      role,
      aspectRatio,
      jobId,
      status,
      sourceUrl,
      cloudflareUrl,
      cloudflareUid,
      referenceImages,
    }));
  fs.writeFileSync(RESULT_FILE, JSON.stringify(results, null, 2));
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { success: false, raw: text };
  }
  if (!response.ok) {
    throw new Error(`${response.status} ${url}: ${text.slice(0, 500)}`);
  }
  return parsed as T;
}

const getVideoReferenceImages = (task: PromptMarketAssetTask): string[] => {
  const referenceRoles = task.referenceRoles || [...PROMPT_MARKET_BLUEPRINT_STANDARD.videoReferenceRoles];

  return Object.values(state)
    .filter((item) => item.packId === task.packId && item.type === "image")
    .filter((item) => referenceRoles.includes(item.role as (typeof referenceRoles)[number]))
    .filter((item) => item.cloudflareUrl || item.sourceUrl)
    .sort(
      (a, b) =>
        referenceRoles.indexOf(a.role as (typeof referenceRoles)[number]) -
        referenceRoles.indexOf(b.role as (typeof referenceRoles)[number])
    )
    .map((item) => item.cloudflareUrl || item.sourceUrl)
    .filter((url): url is string => Boolean(url))
    .slice(0, 4);
};

async function submitTask(task: PromptMarketAssetTask): Promise<void> {
  const current = state[task.id];
  if (current?.jobId) return;

  const endpoint = task.type === "image" ? "image-task" : "video-task";
  const referenceImages = task.type === "video" ? getVideoReferenceImages(task) : [];
  if (task.type === "video" && !referenceImages.length) {
    throw new Error(`Video task ${task.id} requires at least one generated image reference from the same pack`);
  }
  const body =
    task.type === "image"
      ? {
          type: "text_to_image",
          prompt: task.prompt,
          aspectRatio: task.aspectRatio,
          engine: { provider: "fxflow", model: "google_image_gen_4_5" },
        }
      : {
          type: "text-to-video",
          prompt: task.prompt,
          startImage: referenceImages[0],
          images: referenceImages,
          aspectRatio: task.aspectRatio,
          duration: 8,
          resolution: "720p",
          mode: "relaxed",
          engine: { provider: "fxflow", model: "veo_3_generate" },
        };

  const result = await fetchJson<{ data?: { jobId?: string; status?: TaskStatus } }>(`${EXTERNAL_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${EXTERNAL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const jobId = result.data?.jobId;
  if (!jobId) throw new Error(`No jobId returned for ${task.id}`);

  state[task.id] = {
    id: task.id,
    packId: task.packId,
    type: task.type,
    role: task.role,
    aspectRatio: task.aspectRatio,
    prompt: task.prompt,
    jobId,
    status: result.data?.status || "pending",
    referenceImages: referenceImages.length ? referenceImages : undefined,
    updatedAt: now(),
  };
  saveState();
  console.log(`SUBMITTED ${task.type} ${task.id} -> ${jobId}`);
}

const getStatusEndpoint = (task: PromptMarketAssetTask, jobId: string) =>
  task.type === "image" ? `${EXTERNAL_BASE}/image-task/${jobId}` : `${EXTERNAL_BASE}/video-task-status/${jobId}`;

const extractSourceUrl = (task: PromptMarketAssetTask, data: Record<string, any>) => {
  if (task.type === "image") {
    return data.result?.images?.[0] || data.result?.thumbnail || data.resultUrl || "";
  }
  return data.result?.videoUrl || data.result?.url || data.result?.videos?.[0] || data.resultUrl || "";
};

async function pollTask(task: PromptMarketAssetTask): Promise<void> {
  const current = state[task.id];
  if (!current?.jobId || current.sourceUrl) return;

  for (let attempt = 1; attempt <= MAX_POLLS; attempt += 1) {
    const result = await fetchJson<{ data?: Record<string, any> }>(getStatusEndpoint(task, current.jobId), {
      headers: { Authorization: `Bearer ${EXTERNAL_TOKEN}` },
    });
    const data = result.data || {};
    const status = (data.status || "unknown") as TaskStatus;

    if (status === "done") {
      const sourceUrl = extractSourceUrl(task, data);
      if (!sourceUrl) throw new Error(`Done without URL for ${task.id}`);
      state[task.id] = { ...state[task.id], status, sourceUrl, updatedAt: now() };
      saveState();
      saveResults();
      console.log(`DONE ${task.id} -> ${sourceUrl}`);
      return;
    }

    if (["error", "failed", "reject", "cancelled"].includes(status)) {
      state[task.id] = { ...state[task.id], status, error: data.error || data, updatedAt: now() };
      saveState();
      console.log(`FAILED ${task.id} -> ${status}`);
      return;
    }

    state[task.id] = { ...state[task.id], status, updatedAt: now() };
    saveState();
    if (attempt === 1 || attempt % 6 === 0) console.log(`POLL ${task.id} ${status} ${attempt}/${MAX_POLLS}`);
    await sleep(POLL_INTERVAL_MS);
  }

  state[task.id] = { ...state[task.id], status: "unknown", error: "Timed out", updatedAt: now() };
  saveState();
}

async function uploadImage(task: PromptMarketAssetTask, sourceUrl: string): Promise<string> {
  const formData = new FormData();
  formData.append("url", sourceUrl);
  formData.append("id", `prompt-market-v5/${task.id}`);

  const result = await fetchJson<{ success?: boolean; result?: { variants?: string[] }; errors?: Array<{ message: string }> }>(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${CF_IMAGES_TOKEN}` },
      body: formData,
    }
  );

  if (result.success) {
    const variants = result.result?.variants || [];
    const url = variants.find((variant) => variant.includes("/public")) || variants[0];
    if (url) return url;
  }

  const duplicate = result.errors?.some((err) => /already exists|duplicate/i.test(err.message));
  if (duplicate) {
    return `https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/prompt-market-v5/${task.id}/public`;
  }
  throw new Error(`Cloudflare image upload failed for ${task.id}: ${JSON.stringify(result.errors || result)}`);
}

async function copyVideoToStream(task: PromptMarketAssetTask, sourceUrl: string): Promise<string> {
  const copy = await fetchJson<{ success?: boolean; result?: { uid?: string }; errors?: Array<{ message: string }> }>(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/copy`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_STREAM_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: sourceUrl, meta: { name: task.id, source: "prompt-market-v5" } }),
    }
  );
  const uid = copy.result?.uid;
  if (!copy.success || !uid) throw new Error(`Cloudflare stream copy failed for ${task.id}: ${JSON.stringify(copy.errors || copy)}`);
  return uid;
}

async function createVideoDownload(uid: string): Promise<string> {
  const download = await fetchJson<{ result?: { default?: { url?: string } } }>(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/${uid}/downloads`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_STREAM_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    }
  );
  return download.result?.default?.url || `https://${CF_STREAM_SUBDOMAIN}.cloudflarestream.com/${uid}/downloads/default.mp4`;
}

async function uploadTask(task: PromptMarketAssetTask): Promise<void> {
  const current = state[task.id];
  if (!current?.sourceUrl || current.cloudflareUrl) return;

  if (task.type === "image") {
    const cloudflareUrl = await uploadImage(task, current.sourceUrl);
    state[task.id] = { ...current, cloudflareUrl, updatedAt: now() };
    console.log(`UPLOADED image ${task.id} -> ${cloudflareUrl}`);
  } else {
    const cloudflareUid = current.cloudflareUid || await copyVideoToStream(task, current.sourceUrl);
    state[task.id] = { ...current, cloudflareUid, updatedAt: now() };
    saveState();

    try {
      const cloudflareUrl = await createVideoDownload(cloudflareUid);
      state[task.id] = { ...state[task.id], cloudflareUrl, updatedAt: now() };
      console.log(`UPLOADED video ${task.id} -> ${cloudflareUrl}`);
    } catch (error) {
      state[task.id] = { ...state[task.id], error, updatedAt: now() };
      console.log(`STREAM_WAIT video ${task.id} -> ${cloudflareUid}`);
    }
  }
  saveState();
  saveResults();
}

async function runPool<T>(items: T[], concurrency: number, worker: (item: T) => Promise<void>) {
  let index = 0;
  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (index < items.length) {
      const item = items[index++];
      try {
        await worker(item);
      } catch (error) {
        console.error(error);
      }
    }
  });
  await Promise.all(workers);
}

async function main() {
  let tasks = buildPromptMarketAssetTasks();
  if (PACK_IDS.length) {
    const allowedPackIds = new Set(PACK_IDS);
    tasks = tasks.filter((task) => allowedPackIds.has(task.packId));
  }
  if (TASK_ROLES.length) {
    const allowedRoles = new Set(TASK_ROLES);
    tasks = tasks.filter((task) => allowedRoles.has(task.role));
  }
  const imageTasks = tasks.filter((task) => task.type === "image");
  const videoTasks = tasks.filter((task) => task.type === "video");

  console.log(`Prompt Market assets: ${tasks.length} tasks (${imageTasks.length} images, ${videoTasks.length} videos)`);
  if (PACK_IDS.length) console.log(`Pack filter: ${PACK_IDS.join(", ")}`);
  if (TASK_ROLES.length) console.log(`Role filter: ${TASK_ROLES.join(", ")}`);
  console.log(`State: ${STATE_FILE}`);
  console.log(`Results: ${RESULT_FILE}`);

  if (MODE === "list") {
    tasks.forEach((task) => {
      console.log(`${task.id} | ${task.type} | ${task.role} | ${task.aspectRatio}`);
    });
    return;
  }

  if (MODE === "submit" || MODE === "all") {
    await runPool(imageTasks, IMAGE_CONCURRENCY, submitTask);
    await runPool(videoTasks, VIDEO_CONCURRENCY, submitTask);
  }

  if (MODE === "poll" || MODE === "all") {
    await runPool(imageTasks, IMAGE_CONCURRENCY, pollTask);
    await runPool(videoTasks, VIDEO_CONCURRENCY, pollTask);
  }

  if (MODE === "upload" || MODE === "all") {
    await runPool(imageTasks, IMAGE_CONCURRENCY, uploadTask);
    await runPool(videoTasks, VIDEO_CONCURRENCY, uploadTask);
  }

  saveResults();
  const taskIds = new Set(tasks.map((task) => task.id));
  const scopedState = Object.values(state).filter((item) => taskIds.has(item.id));
  const done = scopedState.filter((item) => item.sourceUrl).length;
  const uploaded = scopedState.filter((item) => item.cloudflareUrl).length;
  console.log(`Complete. Generated: ${done}/${tasks.length}. Uploaded: ${uploaded}/${tasks.length}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
