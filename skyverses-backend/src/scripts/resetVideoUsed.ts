
// ==== IMPORT MODEL ====
import User from "../models/UserModel";   // đổi path cho đúng dự án của bạn


// ==== RESET VIDEO USED ====
export async function resetVideoUsed() {
  try {
    const res = await User.updateMany(
      {},
      { $set: { videoUsed: 0 } }
    );

    console.log(`🎉 Đã reset videoUsed cho ${res.modifiedCount} users.`);
  } catch (err) {
    console.error("❌ Lỗi khi reset videoUsed:", err);
  } finally {
  }
}

