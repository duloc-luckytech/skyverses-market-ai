import cron from "node-cron";
import { syncRunningHubTemplates } from "../services/runninghub/syncTemplates";

let isRunning = false;

cron.schedule("*/55 * * * *", async () => {
  if (isRunning) {
    console.warn("⏳ [RunningHub] Previous job still running, skip");
    return;
  }

  isRunning = true;
  console.log("🕒 [RunningHub] Cron triggered");

  try {
    // await syncRunningHubTemplates();
  } catch (err) {
    console.error("❌ [RunningHub Cron]", err);
  } finally {
    isRunning = false;
  }
});
