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

      if (clipId && sceneId) {
        console.log(
          `🎬 [${email}] ✅ Created scene (try ${attempt}/${MAX_RETRIES}): sceneId=${sceneId},  frames=${startFrame}→${endFrame}`
        );
        return { clipId, sceneId, startFrame, endFrame };
      }

      console.warn(
        `⚠️ [${email}] Missing clipId or sceneId (try ${attempt}/${MAX_RETRIES}) for job ${jobId}`,
        data?.error?.json?.data
      );

      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      } else {
        console.error(
          `❌ [${email}] Failed to get clipId after ${MAX_RETRIES} tries.`
        );
      }
    } catch (err: any) {
      console.error(
        `❌ [${email}] createScene attempt ${attempt} failed:`,
        err
      );
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }

  // Nếu vẫn không thành công
  return {};
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
}) {
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

    const operationName = extendRes.data?.operations?.[0]?.operation?.name;

    return { operationName };
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
