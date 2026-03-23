import mongoose from "mongoose";
import GoogleTokenModel from "../models/GoogleTokenModel";
import { createProject } from "../utils/labsSceneUtils"; // ✅ hàm có sẵn
import cron from "node-cron";

/**
 * 🔹 Quét tất cả token chưa có projectId → tạo project mới và cập nhật
 */
export async function assignProjectsToTokens() {
  const tokens = await GoogleTokenModel.find({
    isActive: true,
    cookieToken: { $exists: true, $ne: "" },
  }).lean();

  if (!tokens.length) {
    console.log("✅ No active tokens found.");
    return;
  }

  const needCreate = tokens.filter((t) => !t.projectId);
  if (!needCreate.length) {
    console.log("✅ All tokens already have projectId.");
    return;
  }

  console.log(`🚀 Found ${needCreate.length} token(s) needing projects...`);

  for (const token of needCreate) {
    try {
      const { email, cookieToken, projectId } = token;

      // 🛑 Nếu token đã có projectId (đề phòng chạy song song)
      if (projectId) {
        console.log(`⏩ Skipped ${email}: already has project ${projectId}`);
        continue;
      }

      const title = `Auto Project - ${new Date().toLocaleString("vi-VN")}`;

      // 🧩 Gọi API tạo project
      const { projectId: newProjectId, projectTitle } = await createProject({
        cookieToken,
        title,
        email,
      });

      if (!newProjectId) {
        continue;
      }

      // ✅ Chỉ update nếu chưa có project
      await GoogleTokenModel.updateOne(
        { _id: token._id, projectId: { $exists: false } },
        {
          projectId: newProjectId,
          projectTitle,
          updatedAt: new Date(),
        }
      );

      console.log(`📁 Updated token ${email} → ${newProjectId}`);
    } catch (err: any) {
      console.error(`❌ Error for token ${token.email}:`, err.message);
    }
  }

  console.log("🎯 Done assigning projects.");
}


cron.schedule("*/15 * * * *", async () => {
  await assignProjectsToTokens();
});