import mongoose from "mongoose";
import VideoJobModel from "../models/VideoJobModel";
import { makeSlug } from "../utils/makeSlug";
async function run() {
  // Lấy từng job theo batch để không load hết vào RAM
  const cursor = VideoJobModel.find({}, { prompt: 1 }).cursor();

  const bulkOps: any[] = [];
  let count = 0;
  let updated = 0;

  for (let job = await cursor.next(); job != null; job = await cursor.next()) {
    count++;

    const slug = makeSlug(job.prompt || "");

    bulkOps.push({
      updateOne: {
        filter: { _id: job._id },
        update: { $set: { promptSlug: slug } },
      },
    });

    // 🚀 Mỗi 1000 records → flush bulk
    if (bulkOps.length >= 1000) {
      await VideoJobModel.bulkWrite(bulkOps, { ordered: false });
      updated += bulkOps.length;
      console.log(`✔ Updated ${updated} records...`);
      bulkOps.length = 0;
    }
  }

  // Flush phần còn lại
  if (bulkOps.length > 0) {
    await VideoJobModel.bulkWrite(bulkOps, { ordered: false });
    updated += bulkOps.length;
  }

  console.log("🎉 DONE!");
  console.log(`Total scanned: ${count}`);
  console.log(`Total updated: ${updated}`);

  await mongoose.disconnect();
  console.log("🔌 Disconnected");
}

setTimeout(() => {
  run();
}, 10000);
