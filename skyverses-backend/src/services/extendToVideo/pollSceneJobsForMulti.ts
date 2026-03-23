// cron/multi/multiPoll.ts
import VideoJobModel from "../../models/VideoJobModel";
import GoogleTokenModel from "../../models/GoogleTokenModel";
import { pollVideoUniversal } from "../../utils/pollVideoUniversal";

const MULTI_TYPES = ["multi-scene-initial", "multi-scene-extend"];
const MAX_ERROR_RETRY = 5;

export async function multiPoll() {
  const jobs = await VideoJobModel.find({
    type: { $in: MULTI_TYPES },
    status: { $in: ["processing", "error"] },
    operationName: { $exists: true, $ne: null } 
  })
    .sort({ sentProcessAt: 1 })
    .limit(200)
    .lean();

  if (!jobs.length) return;

  for (const job of jobs) {
    const jobId = job._id.toString();

    try {
      /* ------------------------------------------------------
       * ALWAYS USE TOKEN FROM SCENE 0
       * ---------------------------------------------------- */
      let rootTokenId = job.sentTokenId;

      if (!rootTokenId) {
        const root = await VideoJobModel.findOne({
          groupName: job.groupName,
          sceneIndex: 0,
        }).lean();

        rootTokenId = root?.sentTokenId;
      }

      if (!rootTokenId) {
        console.error(`❌ Missing sentTokenId for job ${jobId}`);
        continue;
      }

      const tokenDoc = await GoogleTokenModel.findById(rootTokenId).lean();
      if (!tokenDoc?.accessToken) continue;

      const token = tokenDoc.accessToken;

      /* ------------------------------------------------------
       * POLL GOOGLE LABS
       * ---------------------------------------------------- */
      const result = await pollVideoUniversal({
        operations: job?.listOperations,
        token,
        jobId
      } as any);

      const done = result.completed?.[0];

      /* ------------------------------------------------------
       * CASE 1: DONE (detect all types)
       * ---------------------------------------------------- */
      if (done?.mediaGenerationId) {
        const mediaId = done.mediaGenerationId;
        const fileUrl = done.fileUrl;

        await VideoJobModel.findByIdAndUpdate(jobId, {
          status: "done",
          mediaVideoId: mediaId,
          fileUrl,
          progress: 100,
          resulst:result,
          completedAt: new Date(),
        });

        console.log(`✅ Scene DONE: ${jobId}`);

        /* ------------------------------------------------------
         * UNLOCK NEXT SCENE IF EXISTS
         * ---------------------------------------------------- */
        const next = await VideoJobModel.findOne({
          previousJobId: jobId,
          status: "blocked", // only blocked scenes
        }).lean();

        if (next) {
          await VideoJobModel.findByIdAndUpdate(next._id, {
            status: "queued",
            operationName: null,
            sceneId: null,
            clipId: null,
            errorCount: 0,
            updatedAt: new Date(),
          });

          console.log(
            `🔓 Unblocked next scene → ${next._id.toString()} (from ${jobId})`
          );
        }

        continue;
      }

      /* ------------------------------------------------------
       * CASE 2: FAILED
       * ---------------------------------------------------- */
      if (result.failed?.length) {
        const reason = result.failed[0]?.reason || "Unknown";

        console.warn(`⚠️ Scene FAIL (${jobId}): ${reason}`);

        if ((job.errorCount || 0) + 1 >= MAX_ERROR_RETRY) {
          await VideoJobModel.findByIdAndUpdate(jobId, {
            status: "reject",
            refunded: true,
            refundedAt: new Date(),
            errorReason: "TIMEOUT_EXCEEDED",
            $inc: { errorCount: 1 },
          });

          // Abort ENTIRE chain
          await VideoJobModel.updateMany(
            {
              groupName: job.groupName,
              status: { $in: ["queued", "blocked", "pending"] },
            },
            {
              status: "abort-by-failure",
              errorReason: `Scene ${job.sceneIndex} failed`,
            }
          );

          console.error(
            `⛔ Chain ${job.groupName} aborted — scene ${job.sceneIndex} failed`
          );

          continue;
        }

        await VideoJobModel.findByIdAndUpdate(jobId, {
          status: "error",
          errorReason: reason,
          $inc: { errorCount: 1 },
        });

        continue;
      }
    } catch (err: any) {
      console.error(`❌ multiPoll error (${jobId}):`, err.message);
    }
  }
}

setInterval(multiPoll, 12000);
