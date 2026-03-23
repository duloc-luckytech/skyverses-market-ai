// 📁 jobs/pollTextJobsForExtend.ts
import { pollResultVideo } from "../../utils/pollResultVideo";
import requestUpsample1080p from "../../utils/requestUpsample1080p";
import VideoJobModel from "../../models/VideoJobModel";
import UserModel from "../../models/UserModel";
import GoogleTokenModel from "../../models/GoogleTokenModel";

const MAX_ERROR_RETRY = 10;

export async function pollTextJobsForExtend() {
  const processingJobs = await VideoJobModel.find({
    type: "text-for-extend",
    status: { $in: ["processing", "error"] },  
  })
    .sort({ updatedAt: 1 })
    .limit(100);

  // gom job theo email để poll token hợp lý
  const groupedByEmail = new Map<string, any[]>();
  for (const job of processingJobs) {
    if (!job.sentByEmail) continue;
    const list = groupedByEmail.get(job.sentByEmail) || [];
    list.push(job);
    groupedByEmail.set(job.sentByEmail, list);
  }

  await Promise.allSettled(
    Array.from(groupedByEmail.entries()).map(async ([email, jobs]) => {
      const tokenDoc = await GoogleTokenModel.findOne({
        email,
        isActive: true,
      }).lean();

      if (!tokenDoc?.accessToken) return;

      for (const job of jobs) {
        try {
          const { _id, operationName, sceneId, userId, errorCount = 0, listOperations } = job;
          const jobId = _id.toString();

          console.log(`🔍 [${email}] Polling job ${jobId}`);

          const result = await pollResultVideo({
            operations: [ { sceneId: job.sceneId, operation: { name: job.operationName } }],
            token: tokenDoc.accessToken,
            maxAttempts: 30, // chỉ poll 1 lần/lượt
            delayMs: 10000,
          });

          const completed = result.completed?.[0];
          const fileUrl = completed?.fileUrl;
          const mediaGenId = completed?.mediaGenerationId;

          // Nếu hoàn thành
          if (fileUrl) {
            if (
              job.resolution === "1080p" &&
              mediaGenId &&
              job.didUpsample1080p !== true
            ) {
              console.log(`🎬 [${email}] Upsampling job ${jobId} ...`);

              // ⭐ MARK trước khi gọi API để tránh spam
              await VideoJobModel.findByIdAndUpdate(jobId, {
                didUpsample1080p: true,
              });

              console.log(`🎬 [${email}] Upsampling job ${jobId} ...`);
              try {
                const result1080p = await requestUpsample1080p({
                  mediaGenId,
                  sceneId,
                  token: tokenDoc.accessToken,
                });
                if (result1080p?.fileUrl) {
                  await VideoJobModel.findByIdAndUpdate(jobId, {
                    status: "done",
                    fileUrl: result1080p.fileUrl,
                    progress: 100,
                    mediaVideoId: result1080p.mediaGenerationId,
                    completedAt: new Date(),
                  });

                  continue;
                }
              } catch (err) {
                console.error(`❌ Upsample1080p failed for ${jobId}:`, err);
              }
            }

            await VideoJobModel.findByIdAndUpdate(jobId, {
              status: "done",
              fileUrl,
              progress: 100,
              mediaVideoId: mediaGenId,
              completedAt: new Date(),
            });
            await UserModel.findByIdAndUpdate(userId, {
              lastTextVideoRequestAt: new Date(),
            });

            console.log(`✅ [${email}] Job ${jobId} done.`);
          }

          // Nếu thất bại
          else if (result.failed?.length) {
            const failReason = result.failed[0].reason || "UNKNOWN_REASON";
            await VideoJobModel.findByIdAndUpdate(jobId, {
              status: errorCount + 1 >= MAX_ERROR_RETRY ? "reject" : "error",
              $inc: { errorCount: 1 },
              errorReason: failReason,
              updatedAt: new Date(),
            });
            console.warn(`⚠️ [${email}] Job ${jobId} failed (${failReason})`);
          }
        } catch (err: any) {
          console.error(`❌ [${email}] Poll error:`, err);
        }
      }
    })
  );

  console.log("🎯 Polling round complete.");
}

// 🕒 chạy mỗi 20s
setInterval(() => {
  pollTextJobsForExtend();
}, 20000);
