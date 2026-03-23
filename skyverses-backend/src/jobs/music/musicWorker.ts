// jobs/video/worker.ts
import VideoJob, {
  VideoJobStatus,
  VideoEngineProvider,
  VideoJobType,
} from "../../models/VideoJobModelV2";
import { runEngineRequest } from "./engines/runEngineRequest";
import { runVideoEnginePoll } from "./engines/runEnginePoll";

export async function processVideoJobs() {
  // 1️⃣ REQUEST PHASE
  const requestJob = await VideoJob.findOneAndUpdate(
    {
      status: VideoJobStatus.PENDING,
      type: VideoJobType.TEXT_TO_MUSIC,
      $or: [
        // 🔹 KHÔNG phải FXLAB → OK
        { "engine.provider": { $ne: VideoEngineProvider.FXLAB } },

        // 🔹 LÀ FXLAB nhưng CÓ recaptchaToken → OK
        {
          "engine.provider": VideoEngineProvider.FXLAB,
          recaptchaToken: { $exists: true, $ne: null },
        },
      ],
    },
    {},
    { new: true }
  );

  if (requestJob) {
    try {
      await runEngineRequest(requestJob);
    } catch (err: any) {
      requestJob.status = VideoJobStatus.ERROR;
      requestJob.error = { message: err.message };
      await requestJob.save();
    }
  }

  // 2️⃣ POLL PHASE
  //job.engineResponse.taskId =
  const pollJob = await VideoJob.findOne({
    status: VideoJobStatus.PROCESSING,
    type: VideoJobType.TEXT_TO_MUSIC,
    "engineResponse.taskId": { $exists: true, $ne: null },
  });
  if (pollJob) {
    try {
      await runVideoEnginePoll(pollJob);
    } catch (err: any) {
      pollJob.status = VideoJobStatus.REJECT;
      pollJob.error = { message: err.message };
      await pollJob.save();
    }
  }
}

setInterval(() => {
  processVideoJobs().catch(console.error);

}, 15000);
