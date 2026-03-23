// editImagePipeline.ts
// FULL PIPELINE = UPLOAD BASE64 → GET mediaIdEdit → batchGenerateImages → DONE

import axios from "axios";
import dotenv from "dotenv";
import ImageOwnerModel from "../models/ImageOwnerModel";
import ImageBase64Model from "../models/ImageBase64Model";
import GoogleTokenModel from "../models/GoogleTokenModel";
import UserModel from "../models/UserModel";

dotenv.config();

const REQUEST_TIMEOUT = 90000;
const RETRY_LIMIT = 3;
const MAX_CONCURRENT = 2;

/* -------------------------------------------------------
   SAFE AXIOS POST
--------------------------------------------------------- */
async function safeAxiosPost(
  url: string,
  data: any,
  options: any,
  retries = RETRY_LIMIT
) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.post(url, data, {
        ...options,
        timeout: REQUEST_TIMEOUT,
      });
    } catch (err: any) {
      const code = err.code || "";
      if (["ECONNRESET", "ETIMEDOUT"].includes(code)) {
        console.warn(`⚠️ Retry ${i + 1}/${retries} (${code})`);
        await new Promise((r) => setTimeout(r, 1200));
        continue;
      }
      throw err;
    }
  }
  throw new Error("❌ Request failed after max retries.");
}

/* -------------------------------------------------------
   STEP 1 — UPLOAD BASE64 → GET mediaIdEdit
--------------------------------------------------------- */
async function uploadEditImage(record: any, tokenDoc: any) {
  const base64Doc = await ImageBase64Model.findOne({ imageId: record._id });
  if (!base64Doc?.base64) {
    console.log(`⚠️ Missing base64 for ${record._id}`);
    return false;
  }


  record.status = "processing-upload";
  await record.save();

  const payload = {
    clientContext: {
      sessionId: String(Date.now()),
      tool: "ASSET_MANAGER",
    },
    imageInput: {
      mimeType: "image/jpeg",
      rawImageBytes: base64Doc.base64,
      isUserUploaded: true,
    },
  };

  const res = await safeAxiosPost(
    "https://aisandbox-pa.googleapis.com/v1:uploadUserImage",
    payload,
    {
      headers: {
        Authorization: `Bearer ${tokenDoc.accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  /* ---------------- READ CORRECT FIELDS ---------------- */
  const mediaObj = res?.data;

  const mediaIdEdit = mediaObj?.mediaGenerationId?.mediaGenerationId;

  const width = mediaObj?.mediaGenerationId?.width || null;
  const height = mediaObj?.mediaGenerationId?.height || null;

  if (!mediaIdEdit) {
    throw new Error("❌ uploadUserImage returned NO mediaIdEdit.");
  }

  /* ---------------- SAVE TO DATABASE ---------------- */
  record.mediaIdEdit = mediaIdEdit;
  record.width = width;
  record.height = height;
  record.status = "ready";
  record.updatedAt = new Date();
  await record.save();

  await ImageBase64Model.deleteOne({ imageId: record._id });

  console.log(`✅ UPLOADED → mediaIdEdit: ${mediaIdEdit}`);

  return true;
}

/* -------------------------------------------------------
   STEP 2 — batchGenerateImages (flowMedia)
--------------------------------------------------------- */
async function generateEditImage(record: any, tokenDoc: any) {
  if (!record.mediaIdEdit) {
    throw new Error("❌ Missing mediaIdEdit before flowMedia!");
  }

  const url = `https://aisandbox-pa.googleapis.com/v1/projects/${tokenDoc.workflowId}/flowMedia:batchGenerateImages`;

  const payload = {
    requests: [
      {
        clientContext: {
          sessionId: `;${Date.now()}`,
        },
        seed: 643144,
        imageModelName: "GEM_PIX",
        imageAspectRatio: "IMAGE_ASPECT_RATIO_LANDSCAPE",
        prompt: record.prompt,
        imageInputs: [
          {
            name: record.mediaIdEdit,
            imageInputType: "IMAGE_INPUT_TYPE_BASE_IMAGE",
          },
        ],
      },
    ],
  };

  const res = await safeAxiosPost(url, payload, {
    headers: {
      Authorization: `Bearer ${tokenDoc.accessToken}`,
      "Content-Type": "text/plain;charset=UTF-8",
      Origin: "https://labs.google",
    },
  });

  const mediaObj = res?.data?.media?.[0];

  const fifeUrl = mediaObj?.image?.generatedImage?.fifeUrl || null;
  const mediaGenerationId =
    mediaObj?.image?.generatedImage?.mediaGenerationId || null;

  if (!fifeUrl && !mediaGenerationId) {
    throw new Error("❌ flowMedia returned no output");
  }

  record.mediaId = mediaGenerationId;
  record.imageUrl = fifeUrl;
  record.status = "done";
  record.updatedAt = new Date();

  await record.save();

  return true;
}

/* -------------------------------------------------------
   MAIN PIPELINE = upload → generate
--------------------------------------------------------- */
export async function editImagePipeline() {
  const processingMap = new Map<string, number>();

  // Count jobs running by email
  const running = await ImageOwnerModel.find({
    type: "edit-image",
    status: { $in: ["processing-upload", "processing"] },
  });

  for (const r of running) {
    const email = r.googleEmail || '';
    const count = processingMap.get(email) || 0;
    processingMap.set(email, count + 1);
  }

  // Get pending + ready items
  const list = await ImageOwnerModel.find({
    type: "edit-image",
    status: { $in: ["pending", "ready"] },
  })
    .sort({ createdAt: 1 })
    .limit(30);

  const tasks = list.map((record: any) =>
    (async () => {
      try {
        const user = await UserModel.findById(record.userId).lean();
        if (!user?.googleId) return;

        const tokenDoc = await GoogleTokenModel.findById(user.googleId);
        if (!tokenDoc?.isActive) return;

        const email = tokenDoc.email;

        const runningCount = processingMap.get(email) || 0;
        if (runningCount >= MAX_CONCURRENT) return;
        processingMap.set(email, runningCount + 1);

        /* ---- STEP 1: upload ---- */
        if (record.status === "pending") {
          await uploadEditImage(record, tokenDoc);
        }

        /* ---- STEP 2: generate ---- */
        if (record.status === "ready") {
          record.status = "processing";
          await record.save();
          await generateEditImage(record, tokenDoc);
        }
      } catch (err: any) {
        record.status = "fail";
        record.errorMessage = err?.message || "Unknown error";
        record.retryCount = (record.retryCount || 0) + 1;
        await record.save();
      }
    })()
  );

  await Promise.allSettled(tasks);
}

/* -------------------------------------------------------
   CRON
--------------------------------------------------------- */
let isRunning = false;

setInterval(async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    await editImagePipeline();
  } catch (err) {
    console.error("⚠️ editImagePipeline ERROR:", err);
  }

  isRunning = false;
}, 20000); // chạy mỗi 6 giây
