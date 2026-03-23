import axios from "axios";

/**
 * Create IMAGE job via RunningHub
 * - Text → Image
 * - Dynamic workflow
 * - NO POLL (create only)
 */
export async function createTaskImageRunning(job: any) {
  let payload: any = null;

  try {
    const apiKey = process.env.RUNNINGHUB_API_KEY;
    if (!apiKey) throw new Error("RUNNINGHUB_MISSING_API_KEY");

    const workflowId = "2013456755698700290";
    if (!workflowId) {
      throw new Error("RUNNINGHUB_MISSING_WORKFLOW_ID");
    }

    /* =============================
       BUILD NODE INFO LIST
    ============================== */
    const nodeInfoList = buildNodeInfoList(job);

    /* =============================
       BUILD PAYLOAD
    ============================== */
    payload = {
      apiKey,
      workflowId,
      nodeInfoList,
      addMetadata: true,
    };

    /* =============================
       REQUEST
    ============================== */
    const res = await axios.post(
      "https://www.runninghub.ai/task/openapi/create",
      payload,
      {
        timeout: 60_000,
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Origin: "null",
          Referer: "https://www.runninghub.ai/",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
            "AppleWebKit/537.36 (KHTML, like Gecko) " +
            "Chrome/143.0.0.0 Safari/537.36",
        },
      }
    );

    const data = res.data;

    if (data?.code !== 0 || !data?.data?.taskId) {
      const err: any = new Error("RUNNINGHUB_CREATE_IMAGE_FAILED");
      err.raw = {
        payload,
        response: data,
      };
      throw err;
    }

    const info = data.data;

    /* =============================
       RETURN NORMALIZED RESULT
    ============================== */
    return {
      taskId: info.taskId,
      status: info.taskStatus || "UNKNOWN",
      clientId: info.clientId,
      netWssUrl: info.netWssUrl,
      promptTips: info.promptTips ? safeJsonParse(info.promptTips) : null,
      raw: data,
    };
  } catch (err: any) {
    err.raw = {
      payload,
      response: err?.raw || err?.response?.data,
    };

    console.error("❌ [runRunningHubImageRequest] ERROR", {
      message: err?.message,
      raw: err.raw,
    });

    throw err;
  }
}

/* ======================================================
   NODE INFO LIST BUILDER (DEFAULT + DYNAMIC)
====================================================== */

function buildNodeInfoList(job: any) {
  const {
    batch = 1,
    width = 2048,
    height = 2048,
    seed = Math.floor(Math.random() * 1e15),
  } = job;
  const prompt = job.input?.prompt;

  if (!prompt) {
    throw new Error("RUNNINGHUB_MISSING_PROMPT");
  }

  return [
    // 🔤 PROMPT
    {
      nodeId: "5",
      fieldName: "text",
      fieldValue: String(prompt),
    },

    // 🖼 SIZE + BATCH
    {
      nodeId: "7",
      fieldName: "width",
      fieldValue: String(width),
    },
    {
      nodeId: "7",
      fieldName: "height",
      fieldValue: String(height),
    },
    {
      nodeId: "7",
      fieldName: "batch_size",
      fieldValue: String(batch),
    },

    // 🎛 SAMPLER
    {
      nodeId: "4",
      fieldName: "seed",
      fieldValue: String(seed),
    },
    {
      nodeId: "4",
      fieldName: "steps",
      fieldValue: "6",
    },
    {
      nodeId: "4",
      fieldName: "cfg",
      fieldValue: "1",
    },
    {
      nodeId: "4",
      fieldName: "sampler_name",
      fieldValue: "euler",
    },
    {
      nodeId: "4",
      fieldName: "scheduler",
      fieldValue: "simple",
    },
    {
      nodeId: "4",
      fieldName: "denoise",
      fieldValue: "1",
    },
  ];
}

/* =============================
   SAFE JSON PARSE
============================== */
function safeJsonParse(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}
