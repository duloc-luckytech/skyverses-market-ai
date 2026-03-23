// cron/listDriveCron.ts
import cron from "node-cron";
import listDriveFiles from "./jobProccesAccountFx";

cron.schedule("*/15 * * * *", async () => {
  console.log(
    "🔁 Đang chạy job listDriveFiles.ts lúc"
  );
  await listDriveFiles();
});
