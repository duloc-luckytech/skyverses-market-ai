import axios from "axios";

/**
 * ============================================================
 * 🔹 Gửi request CONCAT có hỗ trợ trim (start / end)
 * ============================================================
 * segments = [
 *   { mediaId: "abc", start: 1.2, end: 6.5 },
 *   { mediaId: "xyz", start: 0.0, end: 8.0 }
 * ]
 */
export async function runConcatenateVideos({
  token,
  cookieToken,
  projectId,
  segments,
}: {
  token: string;
  cookieToken: string;
  projectId: string;
  segments: {
    mediaId: string;
    start: number;
    end: number;
    lengthNanos: number;
  }[];
}) {
  if (!segments || !Array.isArray(segments) || segments.length < 1)
    throw new Error("Segments must contain at least 1 item");

  // ⭐ Convert segments → inputVideos
  const inputVideos = segments.map((seg) => ({
    mediaGenerationId: seg.mediaId,
    lengthNanos: 8000,
    startTimeOffset: `${Number(seg.start).toFixed(9)}s`,
    endTimeOffset: `${Number(seg.end).toFixed(9)}s`,
  }));

  const concatBody = {
    json: {
      requestInput: {
        inputVideos,
      },
    },
  };
  console.log('concatBody..',concatBody)

  // ⭐ Gửi request concat lên Google Labs
  const concatRes = await axios.post(
    "https://labs.google/fx/api/trpc/videoFx.runConcatenateVideos",
    concatBody,
    {
      headers: {
        accept: "*/*",
        "content-type": "application/json",
        origin: "https://labs.google",
        referer: `https://labs.google/fx/vi/tools/flow/project/${projectId}`,
        cookie: cookieToken,
      },
    }
  );

  const operationName =
    concatRes.data?.result?.data?.json?.result?.operation?.operation?.name;

  if (!operationName)
    throw new Error("Missing operationName from Labs response");

  return operationName;
}

/**
 * ============================================================
 * 🔹 Poll trạng thái concat cho đến khi có encodedVideo
 * ============================================================
 */
export async function pollConcatenationStatus({
  token,
  email,
  jobId,
  operationName,
  maxAttempts = 60, // 10 phút
  delayMs = 10_000, // 10s
}: {
  token: string;
  email: string;
  jobId: string;
  operationName: string;
  maxAttempts?: number;
  delayMs?: number;
}): Promise<{ encodedVideo?: string; status?: string }> {
  let encodedVideo: string | undefined;
  let status: string | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const statusRes = await axios.post(
      "https://aisandbox-pa.googleapis.com/v1:runVideoFxCheckConcatenationStatus",
      {
        operation: {
          operation: { name: operationName },
        },
      },
      {
        headers: {
          "content-type": "text/plain;charset=UTF-8",
          authorization: `Bearer ${token}`,
        },
      }
    );

    const data = statusRes.data;

    status = data?.status || data?.json?.result?.status || "UNKNOWN";
    encodedVideo =
      data?.encodedVideo || data?.json?.result?.encodedVideo || undefined;

    console.log(
      `🔁 [${email}] pollConcat(${jobId}) — attempt ${attempt}/${maxAttempts} → ${status}`
    );

    if (encodedVideo) {
      console.log(
        `🎬 [${email}] Encoded video ready! prefix: ${encodedVideo.slice(
          0,
          100
        )}...`
      );
      return {
        encodedVideo,
        status: "MEDIA_GENERATION_STATUS_SUCCESSFUL",
      };
    }

    if (
      status === "MEDIA_GENERATION_STATUS_FAILED" ||
      status === "MEDIA_GENERATION_STATUS_REJECTED"
    ) {
      console.warn(`❌ [${email}] Concat failed`, data);
      return { status };
    }

    await new Promise((r) => setTimeout(r, delayMs));
  }

  console.warn(`⚠️ [${email}] No encodedVideo after ${maxAttempts} attempts`);
  return { encodedVideo: undefined, status };
}
