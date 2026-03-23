import UserModel from "../models/UserModel";

/* ============================================================
   🧩 Lấy danh sách userId mà master/sub quản lý
   ============================================================ */
export async function getManagedUserIds(userId: string): Promise<string[]> {
  if (!userId) return [];
  const friends = await UserModel.find({ inviteFrom: userId }).select("_id");
  return friends.map((f: any) => f._id.toString());
}

/* ============================================================
   🔐 Kiểm tra quyền truy cập hệ thống (dashboard, admin, v.v.)
   ============================================================ */
export function hasAccess(
  role: string,
  allowed: string[] = ["admin", "master", "sub"]
) {
  return allowed.includes(role);
}

/* ============================================================
   🧮 Trả về bộ lọc user theo role hiện tại
   ============================================================ */
export function getUserFilterByRole(user: any) {
  if (!user) return {};
  const { role, _id } = user;

  if (role === "admin") return {}; // admin xem tất cả
  if (role === "master" || role === "sub") return { inviteFrom: _id }; // nhóm được quản lý
  return { _id }; // user thường chỉ xem chính mình
}

/* ============================================================
   🧮 Tạo bộ lọc user & transaction theo role (dùng chung)
   ============================================================ */
export async function getRoleBasedFilters(user: any) {
  const { role, _id: userId } = user;
  let userFilter: any = {};
  let txFilter: any = { status: "success" };

  if (role === "admin" || role === "master") {
    userFilter = {};
  } else if (role === "sub") {
    const managedUserIds = await getManagedUserIds(userId);
    userFilter = { _id: { $in: managedUserIds } };
    txFilter.userId = { $in: managedUserIds };
  } else {
    userFilter = { _id: userId };
    txFilter.userId = userId;
  }

  return { userFilter, txFilter };
}

/* ============================================================
   📆 Hàm tính ngày bắt đầu dựa trên range
   ============================================================ */
export function getDateRange(range: string = "7d") {
  let days = 7;
  let groupFormat = "%d/%m";
  if (range === "24h") {
    days = 1;
    groupFormat = "%Hh";
  } else if (range === "3d") {
    days = 3;
  } else if (range === "30d") {
    days = 30;
  } else if (range === "90d") {
    days = 90;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return { startDate, groupFormat };
}

/* ============================================================
   🕒 Hàm định dạng hoạt động người dùng (ngày / tuần / tháng)
   ============================================================ */
export function getUserActivityFormat(type: string = "day") {
  if (type === "week") return "Tuần %U";
  if (type === "month") return "%m/%Y";
  return "%d/%m";
}
