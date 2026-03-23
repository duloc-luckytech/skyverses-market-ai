import { pollVideoUniversal } from "../../utils/pollVideoUniversal";
import VideoJobModel from "../../models/VideoJobModel";
import UserModel from "../../models/UserModel";
import GoogleTokenModel from "../../models/GoogleTokenModel";

const MAX_ERROR_RETRY = 10;

/* -----------------------------------------------------
 * 🔹 POLL CÁC JOB EXTEND PENDING
 * --------------------------------------------------- */
export async function pollSceneJobsForExtend() {
  const jobs = await VideoJobModel.find({
    type: "extend-to-video",
    status: "pending",
    operationName: { $exists: true, $ne: null },
  })
    .sort({ updatedAt: 1 })
    .limit(100);

  if (!jobs.length) return;

  const grouped = new Map<string, any[]>();
  for (const job of jobs) {
    if (!job.sentByEmail) continue;
    const list = grouped.get(job.sentByEmail) || [];
    list.push(job);
    grouped.set(job.sentByEmail, list);
  }

  await Promise.allSettled(
    Array.from(grouped.entries()).map(async ([email, list]) => {
      const tokenDoc = await GoogleTokenModel.findOne({
        email,
        isActive: true,
      }).lean();
      if (!tokenDoc?.accessToken) return;
      const token = tokenDoc.accessToken;

      for (const job of list) {
        const {
          _id,
          operationName,
          sceneId,
          userId,
          errorCount = 0,
          listOperations,
        } = job;
        const jobId = _id.toString();

        try {
          console.log(`🔍 [${email}] Polling extend job ${jobId}`);
          const result = await pollVideoUniversal({
            operations: listOperations,
            token,
            jobId,
          });

          const done = result.completed?.[0];
          if (done?.fileUrl) {
            await VideoJobModel.findByIdAndUpdate(jobId, {
              status: "done",
              fileUrl: done.fileUrl,
              mediaVideoId: done.mediaGenerationId,
              progress: 100,
              results: result,
              completedAt: new Date(),
            });
            console.log(`✅ [${email}] Extend job ${jobId} done.`);
          }
        } catch (err: any) {
          console.error(`❌ [${email}] Poll error:`, err.message);
        }
      }
    })
  );

  console.log("🎯 Extend poll round complete.");
}

/* -----------------------------------------------------
 * 🕒 CHẠY ĐỊNH KỲ POLL
 * --------------------------------------------------- */
setInterval(pollSceneJobsForExtend, 20_000);
