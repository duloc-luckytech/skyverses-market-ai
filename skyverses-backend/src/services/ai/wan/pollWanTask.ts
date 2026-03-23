// services/wan/pollWanTask.ts
import axios from "axios";
import VideoJobModel from "../../../models/VideoJobModel";

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
    console.log('pollWanTask res.data>>',res.data)
    const output = res.data?.output;
    const usage = res.data?.usage;

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
      if (jobId) {
        await VideoJobModel.findByIdAndUpdate(jobId, {
          status: "reject",
          errorReason: status,
          errorMessage: output?.error || output,
          errorStartedAt: new Date(),
          $inc: { errorCount: 1 },
        });
      }

      return {
        taskId: output.task_id,
        status,
        submitTime: output.submit_time,
        scheduledTime: output.scheduled_time,
        endTime: output.end_time,
        error: output?.error,
        raw: res.data,
      };
    }

    /* ================= SUCCEEDED ================= */
    if (status === "SUCCEEDED") {
      return {
        taskId: output.task_id,
        status,
        videoUrl: output.video_url,
        submitTime: output.submit_time,
        scheduledTime: output.scheduled_time,
        endTime: output.end_time,
        usage: {
          duration: usage?.duration,
          outputVideoDuration: usage?.output_video_duration,
          resolution: usage?.SR,
          videoCount: usage?.video_count,
        },
        raw: res.data,
      };
    }

    /* ================= PENDING / RUNNING ================= */
    if (status === "PENDING" || status === "RUNNING") {
      return {
        taskId: output.task_id,
        status,
        submitTime: output.submit_time,
        scheduledTime: output.scheduled_time,
        raw: res.data,
      };
    }

    /* ================= UNKNOWN ================= */
    return {
      taskId,
      status: "UNKNOWN",
      raw: res.data,
    };
  } catch (err: any) {
    // ❗ network / 404 / timeout
    if (jobId) {
      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "reject",
        errorReason: "WAN_POLL_ERROR",
        errorMessage: err?.response?.data || err?.message,
        errorStartedAt: new Date(),
        $inc: { errorCount: 1 },
      });
    }

    return {
      taskId,
      status: "UNKNOWN",
      error: err?.response?.data || err?.message,
    };
  }
}