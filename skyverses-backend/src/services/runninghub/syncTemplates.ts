import axios from "axios";
import fs from "fs";
import path from "path";
import { RunningHubTemplate } from "../../models/RunningHubTemplate";

/* ======================================================
   CONFIG
====================================================== */

const LIST_API = "https://www.runninghub.ai/api/portal/template/list";

const EXPORT_API = "https://www.runninghub.ai/api/workflow/export";

const PAGE_SIZE = 30;

// thư mục lưu workflow export
const EXPORT_DIR = path.resolve(process.cwd(), "runninghub/exports");

/* ======================================================
   HELPER: ensure folder
====================================================== */

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/* ======================================================
   HELPER: export workflow file
====================================================== */

async function exportWorkflowToFile(workflowId: string): Promise<string> {
  ensureDir(EXPORT_DIR);

  const outputFile = path.join(EXPORT_DIR, `${workflowId}.json`);

  // nếu đã tồn tại thì bỏ qua (tránh spam API)
  if (fs.existsSync(outputFile)) {
    return outputFile;
  }

  console.log(`⬇️ [RunningHub] Export workflow ${workflowId}`);

  const res = await axios.post(
    EXPORT_API,
    { workflowId },
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "content-type": "application/json",
        origin: "https://www.runninghub.ai",
        referer: `https://www.runninghub.ai/post/${workflowId}`,
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      },
      responseType: "stream", // 🔥 rất quan trọng
      timeout: 30000,
    }
  );

  const writer = fs.createWriteStream(outputFile);
  res.data.pipe(writer);

  await new Promise<void>((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  return outputFile;
}

/* ======================================================
   MAIN: sync + export
====================================================== */

export async function syncRunningHubTemplates() {
    console.log("🔄 [RunningHub] Sync FIRST PAGE only");
  
    const current = 1;
    let totalSynced = 0;
    let totalExported = 0;
  
    console.log(`📄 [RunningHub] Fetch page ${current}`);
  
    const res = await axios.post(
      LIST_API,
      {
        size: PAGE_SIZE,
        current,
        tags: [],
        sort: "RECOMMEND",
      },
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json",
          origin: "https://www.runninghub.ai",
          referer: "https://www.runninghub.ai/workflows",
          "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        },
        timeout: 20000,
      }
    );
  
    if (res.data?.code !== 0) {
      throw new Error("RUNNINGHUB_API_ERROR_PAGE_1");
    }
  
    const records = res.data?.data?.records || [];
  
    if (records.length === 0) {
      console.log("🛑 [RunningHub] No records on page 1");
      return;
    }
  
    /* ======================================
       HANDLE RECORDS (PAGE 1 ONLY)
    ====================================== */
  
    for (const item of records) {
      // 1️⃣ upsert template
      await RunningHubTemplate.findOneAndUpdate(
        { templateId: item.id },
        {
          $set: {
            templateId: item.id,
            name: item.name,
            desc: item.desc,
            systemWorkflow: item.systemWorkflow,
  
            publishTime: item.publishTime ? new Date(item.publishTime) : null,
            timestamp: item.timestamp ? Number(item.timestamp) : null,
  
            owner: {
              id: item.owner?.id,
              name: item.owner?.name,
              avatar: item.owner?.avatar,
            },
  
            statistics: {
              likeCount: Number(item.statisticsInfo?.likeCount || 0),
              downloadCount: Number(item.statisticsInfo?.downloadCount || 0),
              useCount: Number(item.statisticsInfo?.useCount || 0),
              pv: Number(item.statisticsInfo?.pv || 0),
              collectCount: Number(item.statisticsInfo?.collectCount || 0),
            },
  
            covers: item.covers || [],
            tags: item.tags || [],
            labels: item.labels || null,
            seq: item.seq ? Number(item.seq) : null,
  
            raw: item,
            fetchedAt: new Date(),
          },
        },
        {
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );
  
      totalSynced++;
  
      // 2️⃣ export workflow file (nếu chưa có)
      try {
        await exportWorkflowToFile(item.id);
        totalExported++;
        await new Promise((r) => setTimeout(r, 800)); // rate limit
      } catch (err) {
        console.warn(`⚠️ [RunningHub] Export failed ${item.id}`, err);
      }
    }
  
    console.log(
      `✅ [RunningHub] DONE (PAGE 1 ONLY)
      - Templates synced: ${totalSynced}
      - Workflows exported: ${totalExported}`
    );
  }
