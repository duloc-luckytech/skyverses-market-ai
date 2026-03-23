// services/wan/pollWanTask.ts
import axios from "axios";

export type WanTaskStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED"
  | "UNKNOWN";

export interface WanPollResult {
  taskId: string;
  status: WanTaskStatus;
  videoUrl?: string;
  submitTime?: string;
  scheduledTime?: string;
  endTime?: string;
  usage?: {
    duration?: number;
    outputVideoDuration?: number;
    resolution?: number;
    videoCount?: number;
  };
  error?: any;
  raw?: any;
}

/* ======================================================
   🟣 POLL + AUTO UPDATE JOB IF FAILED / CANCELED
====================================================== */
export async function pollWanTask(
  taskId: string,
  apiKey: string,
  jobId?: string // ⭐ optional nhưng nên truyền
): Promise<WanPollResult> {
  try {
    const res = await axios.get(
      `https://dashscope-intl.aliyuncs.com/api/v1/tasks/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 60_000,
      }
    );
    console.log("pollWanTask res.data>>", res.data);
    const output = res.data?.output;

    if (!output || !output.task_status) {
      return {
        taskId,
        status: "UNKNOWN",
        raw: res.data,
      };
    }

    const status = output.task_status as WanTaskStatus;

    /* ================= FAILED / CANCELED ================= */
    if (status === "FAILED" || status === "CANCELED") {
      return {
        taskId: output.task_id,
        status,
        raw: res.data,
      };
    }

    /* ================= SUCCEEDED ================= */
    if (status === "SUCCEEDED") {
      return {
        taskId: output.task_id,
        videoUrl: output.video_url,
        status,
        raw: res.data,
      };
    }

    /* ================= PENDING / RUNNING ================= */
    if (status === "PENDING" || status === "RUNNING") {
      return {
        taskId: output.task_id,
        status,
      };
    }

    /* ================= UNKNOWN ================= */
    return {
      taskId,
      status: "UNKNOWN",
      raw: res.data,
    };
  } catch (err: any) {
    return {
      taskId,
      status: "UNKNOWN",
      error: err?.response?.data || err?.message,
    };
  }
}
