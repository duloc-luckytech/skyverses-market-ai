import axios from "axios";

/**
 * 🔹 Tạo scene mới từ mediaGenId (clip gốc)
 * Trả về: { clipId, sceneId }
 */
/**
 * 🔹 Tạo scene mới từ mediaGenId (clip gốc)
 * Trả về: { clipId, sceneId, startFrame, endFrame }
 */
export async function createScene({
  token,
  cookieToken,
  projectId,
  mediaGenId,
  email,
  jobId,
  startTime = "0s",
  endTime = "8s",
}: {
  token: string;
  cookieToken: string;
  projectId: string;
  mediaGenId: string;
  email: string;
  jobId: string;
  startTime?: string;
  endTime?: string;
}): Promise<{
  clipId?: string;
  sceneId?: string;
  startFrame?: number;
  endFrame?: number;
}> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 5000;

  const parseSeconds = (t: string) => parseFloat(t.replace("s", "")) || 0;
  const startFrame = Math.floor(parseSeconds(startTime) * 24);
  const endFrame = Math.floor(parseSeconds(endTime) * 24) - 1;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(
        "https://labs.google/fx/api/trpc/project.createScene",
        {
          method: "POST",
          headers: {
            accept: "*/*",
            "content-type": "application/json",
            origin: "https://labs.google",
            referer: "https://labs.google",
            cookie: cookieToken,
          },
          body: JSON.stringify({
            json: {
              projectId: projectId,
              toolName: "PINHOLE",
              scene: {
                sceneName: `Auto Scene - ${new Date().toLocaleTimeString(
                  "vi-VN"
                )}`,
                clips: [
                  {
                    clipId: mediaGenId,
                    startTime,
                    endTime,
                  },
                ],
              },
              aspectRatio: "VIDEO_ASPECT_RATIO_LANDSCAPE",
            },
          }),
        }
      );

      const data = await res.json();

      const clipId = data?.result?.data?.json?.result?.clips?.[0]?.clipId;
      const sceneId = data?.result?.data?.json?.result?.sceneId;

      // 🟢 Thành công
      if (clipId && sceneId) {
        console.log(
          `🎬 [${email}] ✅ Created scene (try ${attempt}/${MAX_RETRIES}): sceneId=${sceneId}, frames=${startFrame}→${endFrame}`
        );

        return { clipId, sceneId, startFrame, endFrame };
      }

      // 🟡 Cảnh báo nhưng không throw, vì còn retry
      console.warn(
        `⚠️ [${email}] Missing clipId or sceneId (try ${attempt}/${MAX_RETRIES}) for job ${jobId}`,
        data?.error?.json?.data
      );

      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    } catch (err: any) {
      console.error(
        `❌ [${email}] createScene attempt ${attempt} failed:`,
        err
      );

      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      } else {
        // 🔥 THROW lỗi thật sự sau attempt cuối
        throw new Error(
          `[${email}] createScene failed after ${MAX_RETRIES} attempts: ${
            err?.message || err
          }`
        );
      }
    }
  }

  // 🔥 Nếu hết 3 lần mà không return → throw lỗi
  throw new Error(
    `[${email}] createScene(): missing clipId/sceneId after ${MAX_RETRIES} attempts.`
  );
}

/**
 * 🔹 Extend video (clipId → mediaExtendId)
 * Trả về: { mediaExtendId, fileUrl } (nếu thành công)
 */
export async function extendVideo({
  token,
  projectId,
  prompt,
  sceneId,
  clipId,
  email,
  jobId,
  startFrame = 168,
  endFrame = 191,
}: {
  token: string;
  projectId: string;
  prompt: string;
  sceneId: string;
  clipId: string;
  email: string;
  jobId: string;
  startFrame?: number;
  endFrame?: number;
}): Promise<{ mediaExtendId: string | null; fileUrl: string | null }> {
  try {
    console.log(`⚙️ [${email}] Extending}`);

    const extendRes = await axios.post(
      "https://aisandbox-pa.googleapis.com/v1/video:batchAsyncGenerateVideoExtendVideo",
      {
        clientContext: {
          projectId: null,
          tool: "PINHOLE",
          userPaygateTier: "PAYGATE_TIER_TWO",
        },
        requests: [
          {
            textInput: { prompt },
            videoInput: {
              mediaId: clipId,
              startFrameIndex: 120, // ✅ dynamic
              endFrameIndex: 191, // ✅ dynamic
            },
            videoModelKey: "veo_3_1_extend_fast_landscape_ultra",
            aspectRatio: "VIDEO_ASPECT_RATIO_LANDSCAPE",
            metadata: { sceneId },
          },
        ],
      },
      {
        headers: {
          "content-type": "text/plain;charset=UTF-8",
          authorization: `Bearer ${token}`,
        },
      }
    );

    const opName = extendRes.data?.operations?.[0]?.operation?.name;
    if (!opName) {
      console.warn(`⚠️ [${email}] No operation name returned for extend.`);
      return { mediaExtendId: null, fileUrl: null };
    }

    // 🕓 Poll kết quả extend
    const { pollResultVideo } = await import("./pollResultVideo");
    const resultExtend = await pollResultVideo({
      operations: [{ sceneId, operationName: opName }],
      token,
      maxAttempts: 30,
      delayMs: 10000,
    });
    const completed = resultExtend?.completed?.[0];
    const mediaExtendId = completed?.mediaGenerationId || null;
    const fileUrl = completed?.fileUrl || null;

    if (!mediaExtendId) {
      console.warn(`⚠️ [${email}] Extend failed for job ${jobId}`);
      return { mediaExtendId: null, fileUrl };
    }

    console.log(`🎞️ [${email}] Extend done → `);

    return { mediaExtendId, fileUrl };
  } catch (err: any) {
    console.error(`❌ [${email}] extendVideo failed:`, err.message);
    return { mediaExtendId: null, fileUrl: null };
  }
}

/**
 * 🔹 Tạo Project mới trên Google Labs (tool = PINHOLE)
 * Trả về: { projectId, projectTitle }
 */
export async function createProject({
  cookieToken,
  title,
  email,
}: any): Promise<{ projectId?: string; projectTitle?: string }> {
  try {
    const projectTitle =
      title || `New Project - ${new Date().toLocaleString("vi-VN")}`;

    const res = await fetch(
      "https://labs.google/fx/api/trpc/project.createProject",
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "content-type": "application/json",
          origin: "https://labs.google",
          referer: "https://labs.google/fx/vi/tools/flow",
          cookie: cookieToken,
        },
        body: JSON.stringify({
          json: {
            projectTitle,
            toolName: "PINHOLE",
          },
        }),
      }
    );

    const data = await res.json();

    const projectId = data?.result?.data?.json?.result?.projectId;
    const projectTitleResp =
      data?.result?.data?.json?.result?.projectInfo?.projectTitle;

    if (!projectId) {

      return {};
    }

    console.log(
      `📁 [${email}] Created projectId=${projectId} (${projectTitleResp})`
    );
    return { projectId, projectTitle: projectTitleResp };
  } catch (err: any) {
    console.error(`❌ [${email}] createProject failed:`, err.message);
    return {};
  }
}
