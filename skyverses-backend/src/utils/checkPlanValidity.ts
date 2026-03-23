import UserModel from "../models/UserModel";
import GoogleTokenModel from "../models/GoogleTokenModel";

export async function checkPlanValidity(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    return {
      valid: false,
      status: 400,
      message: "❌ User not found",
    };
  }

  const now = new Date();

  // ❌ Chưa có plan hoặc chưa có ngày hết hạn
  if (!user.plan || !user.planExpiresAt) {
    return {
      valid: false,
      status: 400,
      message:
        "Tài khoản của bạn chưa có gói hoạt động. Vui lòng kích hoạt hoặc nâng cấp để tiếp tục.",
    };
  }

  // ❌ Gói đã hết hạn
  if (new Date(user.planExpiresAt) < now) {
    return {
      valid: false,
      status: 400,
      message:
        "Gói của bạn đã hết hạn. Vui lòng gia hạn hoặc kích hoạt lại để tiếp tục sử dụng.",
    };
  }

    // ❌ Token không hoạt động hoặc bị vô hiệu
    if (user.googleId) {
      const token = await GoogleTokenModel.findById(user.googleId).lean();
      if (!token || token.isActive === false) {
        return {
          valid: false,
          status: 400,
          message:
            "Tài khoản đang tạm thời không khả dụng. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.",
        };
      }
    }

  // ✅ Hợp lệ
  return { valid: true, user, status: 200 };
}