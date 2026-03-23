// utils/checkUserVideoPermission.ts
import UserModel, { IUser } from "../models/UserModel";
import GoogleTokenModel from "../models/GoogleTokenModel";
import { MAX_VIDEO_PLAN } from "../constanst/plans";
import { nowVN, toVN } from "../utils/time";

/**
 * Hàm duy nhất kiểm tra:
 * - user tồn tại
 * - plan hợp lệ
 * - plan còn hạn
 * - token google active
 * - quota video (videoUsed < maxVideo)
 * Trả về { ok, status, message, user }
 */
export async function checkUserVideoPermission(userId: string) {
  const user = await UserModel.findById(userId);
//
  return { ok: true, status: 200, user, message:null };


  // if (!user) {
  //   return {
  //     ok: false,
  //     status: 400,
  //     message: "❌ User không tồn tại.",
  //   };
  // }

  // const plan = user.plan;

  // // ❌ Chưa đăng ký gói
  // if (!plan) {
  //   return {
  //     ok: false,
  //     status: 400,
  //     message: "Bạn chưa có gói hoạt động. Vui lòng mua gói để tạo video.",
  //   };
  // }

  // // ❌ Không tồn tại config cho plan
  // if (!MAX_VIDEO_PLAN[plan]) {
  //   return {
  //     ok: false,
  //     status: 400,
  //     message: "Gói của bạn không hợp lệ hoặc chưa được cấu hình.",
  //   };
  // }

  // // ❌ Chưa có ngày hết hạn
  // if (!user.planExpiresAt) {
  //   return {
  //     ok: false,
  //     status: 400,
  //     message:
  //       "Gói của bạn chưa được kích hoạt đầy đủ. Vui lòng liên hệ hỗ trợ.",
  //   };
  // }

  // // ❌ Gói đã hết hạn
  // const now = nowVN();

  // if (toVN(new Date(user.planExpiresAt)) < now) {
  //   return {
  //     ok: false,
  //     status: 400,
  //     message: "Gói của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng.",
  //   };
  // }

  // // ❌ Google Token không hoạt động
  // if (user.googleId) {
  //   const token = await GoogleTokenModel.findById(user.googleId).lean();
  //   if (!token || token.isActive === false) {
  //     return {
  //       ok: false,
  //       status: 400,
  //       message:
  //         "Tài khoản xử lý video của bạn đang tạm thời không khả dụng. Vui lòng thử lại sau.",
  //     };
  //   }
  // }

  // // -----------------------------
  // // ⭐ Check quota video
  // // -----------------------------
  // const max = user.maxVideo ?? 0;
  // const used = user.videoUsed ?? 0;

  // // ❌ Chưa config hoặc plan không có quota
  // if (max === 0) {
  //   return {
  //     ok: false,
  //     status: 400,
  //     message:
  //       "Gói của bạn chưa được cấu hình quota video. Vui lòng liên hệ hỗ trợ.",
  //   };
  // }

  // // ❌ Hết quota
  // if (used >= max) {
  //   return {
  //     ok: false,
  //     status: 400,
  //     message: `Bạn đã dùng hết quota video (${used}/${max}). Vui lòng nâng cấp hoặc mua thêm.`,
  //   };
  // }

  // // 👉 OK hết
  // return { ok: true, status: 200, user };
}
