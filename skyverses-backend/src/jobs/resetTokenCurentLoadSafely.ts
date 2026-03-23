import GoogleToken from "../models/GoogleTokenModel";

/**
 * 🧹 Reset token load khi bị âm hoặc rảnh quá lâu
 * Không phụ thuộc VideoJobModel, cực nhẹ & an toàn.
 */
export async function resetTokenLoadSafely() {
  try {
    const tokens = await GoogleToken.find({ isActive: true }).lean();
    if (!tokens.length) return console.log("⏸ No active tokens to reset.");

    let resetCount = 0;

    for (const t of tokens) {
      const { _id, email, currentLoad = 0, lastActiveAt, isBusy, type } = t;

      // ⏱ Giới hạn idle — sau 5 phút thì coi như rảnh
      const idleThreshold = 300_000;
      const lastActiveMs = lastActiveAt ? new Date(lastActiveAt).getTime() : 0;

      const isIdleTooLong =
        !isBusy && lastActiveMs && Date.now() - lastActiveMs > idleThreshold;

      if (currentLoad < 0 || isIdleTooLong) {
        await GoogleToken.updateOne(
          { _id },
          {
            $set: {
              currentLoad: 0,
              isBusy: false,
              lastActiveAt: new Date(),
            },
          }
        );

        resetCount++;
      }
    }
  } catch (err) {
    console.error("❌ resetTokenLoadSafely() failed:", err);
  }
}

setInterval(async () => {
  try {
    await resetTokenLoadSafely();
  } finally {
  }
}, 60_000); // 1 phút
