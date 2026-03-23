import { createTaskImageRunning } from "./core/running/createTaskImageRunning";
import ImageJob, { ImageEngineProvider } from "../../../../models/ImageJob";

export async function runVideoRequestForWan(job: any) {
  const provider = job.engine.provider;

  const apiKey = process.env.RUNNINGHUB_API_KEY;

  if (provider === ImageEngineProvider.RUNNING) {
    const info = await createTaskImageRunning(job);

    return {
      taskId: info.taskId,
      accessToken: apiKey,
    };
  }

  /* =====================================================
     UNKNOWN TYPE
  ====================================================== */
  throw new Error(`UNSUPPORTED_VIDEO_TYPE: ${provider}`);
}
