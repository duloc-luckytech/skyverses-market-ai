import GoogleTokenModel from "../models/GoogleTokenModel"; // chỉnh lại path theo project của bạn

// -----------------------
// 1️⃣ Danh sách email cần xoá
// -----------------------
const EMAILS:any = [];

// -----------------------
// 2️⃣ Mongo URI
// -----------------------

// -----------------------
// 3️⃣ RUN SCRIPT
// -----------------------
async function start() {
  try {
    const result = await GoogleTokenModel.deleteMany({
      email: { $in: EMAILS },
    });

    console.log(`✅ DONE: Đã xoá ${result.deletedCount} tokens`);
  } catch (err) {
    console.error("❌ ERROR:", err);
  } finally {
  }
}
setTimeout(() => {
  start();
}, 10000);
