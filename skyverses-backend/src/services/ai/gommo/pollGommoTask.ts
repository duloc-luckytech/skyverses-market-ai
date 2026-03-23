// services/ai/gommo/pollGommoTask.ts
import axios from "axios";
import VideoJobModel from "../../../models/VideoJobModel";

/* ======================================================
   TYPES
====================================================== */

export type GommoTaskStatus =
  | "MEDIA_GENERATION_STATUS_PENDING"
  | "MEDIA_GENERATION_STATUS_ACTIVE"
  | "MEDIA_GENERATION_STATUS_PROCESSING"
  | "MEDIA_GENERATION_STATUS_SUCCESSFUL"
  | "MEDIA_GENERATION_STATUS_FAILED"
  | "UNKNOWN";

export interface GommoPollResult {
  videoId: string; // id_base
  status: GommoTaskStatus;
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: any;
  raw?: any;
}

/* ======================================================
   🟢 POLL GOMMO TASK (BROWSER-LIKE)
====================================================== */
export async function pollGommoTask(
  videoId: string,      // id_base
  accessToken: string,
  jobId?: string
): Promise<GommoPollResult> {
  try {
    /* ================= BODY ================= */
    const body = new URLSearchParams({
      access_token: accessToken,
      domain: "aivideoauto.com",
      videoId,
    }).toString();

    /* ================= REQUEST ================= */
    const res = await axios.post(
      "https://api.gommo.net/ai/video",
      body,
      {
        timeout: 60_000,
        headers: {
          // core
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "*/*",

          // browser-like (QUAN TRỌNG)
          "Origin": "https://aivideoauto.com",
          "Referer": "https://aivideoauto.com/",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",

          // UA
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
            "AppleWebKit/537.36 (KHTML, like Gecko) " +
            "Chrome/143.0.0.0 Safari/537.36",

          // sec headers (optional nhưng nên có)
          "Sec-Fetch-Site": "cross-site",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Dest": "empty",
        },
      }
    );

    const data = res.data;
    console.log("🟢 pollGommoTask >>", data?.videoInfo);

    const status = data?.videoInfo?.status as GommoTaskStatus;

    if (!status) {
      return {
        videoId,
        status: "UNKNOWN",
        raw: data,
      };
    }

    /* ================= FAILED ================= */
    if (status === "MEDIA_GENERATION_STATUS_FAILED") {
      if (jobId) {
        await VideoJobModel.findByIdAndUpdate(jobId, {
          status: "reject",
          errorReason: "GOMMO_FAILED",
          errorMessage: data?.error || data,
          errorStartedAt: new Date(),
          $inc: { errorCount: 1 },
        });
      }

      return {
        videoId,
        status,
        error: data?.error,
        raw: data,
      };
    }

    /* ================= SUCCESS ================= */
    if (status === "MEDIA_GENERATION_STATUS_SUCCESSFUL") {
      return {
        videoId,
        status,
        videoUrl: data?.videoInfo?.download_url,   // ⚠️ có thể null vài poll đầu
        thumbnailUrl: data?.videoInfo?.thumbnail_url,
        raw: data,
      };
    }

    /* ================= PENDING / ACTIVE / PROCESSING ================= */
    if (
      status === "MEDIA_GENERATION_STATUS_PENDING" ||
      status === "MEDIA_GENERATION_STATUS_ACTIVE" ||
      status === "MEDIA_GENERATION_STATUS_PROCESSING"
    ) {
      return {
        videoId,
        status,
        raw: data,
      };
    }

    /* ================= UNKNOWN ================= */
    return {
      videoId,
      status: "UNKNOWN",
      raw: data,
    };
  } catch (err: any) {
    if (jobId) {
      await VideoJobModel.findByIdAndUpdate(jobId, {
        status: "reject",
        errorReason: "GOMMO_POLL_ERROR",
        errorMessage: err?.response?.data || err?.message,
        errorStartedAt: new Date(),
        $inc: { errorCount: 1 },
      });
    }

    return {
      videoId,
      status: "UNKNOWN",
      error: err?.response?.data || err?.message,
    };
  }
}