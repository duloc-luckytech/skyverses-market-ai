import AiPrompt from "../models/AiPrompt";
import { saveLocalPromptImage } from "../services/prompt";
import cron from "node-cron";

export async function processPromptExamples() {
  // Lấy tối đa 200 item để xử lý nhanh
  const items = await AiPrompt.find({
    exampleStatus: "processing",
  }).limit(200);

  if (!items.length) return;

  console.log(`⚡ Processing ${items.length} prompt items...`);

  // Chạy song song toàn bộ items → không giới hạn
  const tasks = items.map(async (item) => {
    try {
      // mark pending trước khi xử lý
      await AiPrompt.updateOne(
        { _id: item._id },
        { exampleStatus: "pending" }
      );

      const newUrls: string[] = [];

      // Xử lý toàn bộ hình song song không giới hạn
      const innerTasks = item.localExamples.map(async (url: string) => {
        const localPath = await saveLocalPromptImage(url);
        newUrls.push(localPath);
      });

      // Chờ tất cả hình xong
      await Promise.all(innerTasks);

      // Update DB
      await AiPrompt.updateOne(
        { _id: item._id },
        {
          examples: newUrls,
          exampleStatus: "done",
        }
      );

      console.log(`✔ Done ${item._id}`);
    } catch (e) {
      console.error(`❌ Error processing ${item._id}`, e);

      await AiPrompt.updateOne(
        { _id: item._id },
        { exampleStatus: "error" }
      );
    }
  });

  await Promise.all(tasks);

  console.log("🔥 Completed batch!");
}

// Cron chạy mỗi phút
cron.schedule("*/5 * * * *", async () => {
  console.log("⏱️ Cron: processPromptExamples đang chạy...");
  await processPromptExamples();
});