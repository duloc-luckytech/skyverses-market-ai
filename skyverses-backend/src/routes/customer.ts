import express from "express";
import mongoose from "mongoose";
import UserModel from "../models/UserModel";
import { Transaction } from "../models/BankTransactionModel";
import { authenticate } from "./auth";
import PlanModel from "../models/PlanModel";
import {
  hasAccess,
  getRoleBasedFilters,
  getDateRange,
  getUserActivityFormat,
  getManagedUserIds,
  getUserFilterByRole,
} from "../utils/roleHelpers";
//
const router = express.Router();

/* ============================================================
   📊 1️⃣ Thống kê tổng quan khách hàng (theo role)
============================================================ */
router.get("/statistic", authenticate, async (req: any, res) => {
  try {
    const currentUser = req.user;

    if (!hasAccess(currentUser.role, ["admin", "master", "sub"])) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền truy cập" });
    }

    const userFilter = getUserFilterByRole(currentUser);

    // Danh sách user thuộc nhóm mình quản lý
    const friends = await UserModel.find(userFilter).select("_id plan").lean();
    const friendIds = friends.map((f) => f._id);

    const totalUsers = friends.length;
    const starterUsers = friends.filter((u) => u.plan === "plan1").length;
    const proUsers = friends.filter((u) => u.plan === "plan2").length;
    const ultUsers = friends.filter((u) => u.plan === "plan3").length;

    // Tổng doanh thu
    const totalRevenueAgg = await Transaction.aggregate([
      {
        $match: {
          status: "success",
          userId: { $in: friendIds },
          planCode: { $in: ["STA", "PRO", "ULT"] },
        },
      },
      { $group: { _id: null, sum: { $sum: "$amount" } } },
    ]);

    const totalRevenue = totalRevenueAgg[0]?.sum || 0;
    const avgRevenue =
      totalUsers > 0 ? Math.round(totalRevenue / totalUsers) : 0;

    res.json({
      success: true,
      totalUsers,
      starterUsers,
      proUsers,
      ultUsers,
      totalRevenue,
      avgRevenue,
      growthRate: 12.5,
    });
  } catch (err) {
    console.error("❌ [GET /customer/statistic]", err);
    res.status(500).json({ success: false, message: "Internal error" });
  }
});

/* ============================================================
   📋 2️⃣ Danh sách khách hàng (lọc + tìm kiếm + phân trang)
============================================================ */
router.get("/list", authenticate, async (req: any, res) => {
  try {
    const currentUser = req.user;
    if (!hasAccess(currentUser.role, ["admin", "master", "sub"])) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền truy cập" });
    }

    const userFilter = getUserFilterByRole(currentUser);

    const {
      page = 1,
      pageSize = 10,
      search = "",
      plan = "all",
      period = "all",
    } = req.query as any;

    const filter: any = { ...userFilter };

    // 🔍 Tìm kiếm
    if (search.trim()) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }

    // 🕒 Lọc theo thời gian
    if (period !== "all") {
      const now = new Date();
      let start: Date | null = null;
      if (period === "month")
        start = new Date(now.setMonth(now.getMonth() - 1));
      if (period === "3month")
        start = new Date(now.setMonth(now.getMonth() - 3));
      if (period === "6month")
        start = new Date(now.setMonth(now.getMonth() - 6));
      if (start) filter.createdAt = { $gte: start };
    }

    // 💰 Lọc user có giao dịch
    const txMatch: any = { status: "success" };
    if (plan !== "all") txMatch.planCode = plan === "plan1" ? "STA" : "PRO";

    const userTxAgg = await Transaction.aggregate([
      { $match: txMatch },
      {
        $group: {
          _id: "$userId",
          totalRevenue: { $sum: "$amount" },
          lastPlan: { $last: "$planCode" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    const allUserIds = userTxAgg.map((t) => t._id);
    if (allUserIds.length === 0)
      return res.json({ success: true, total: 0, data: [] });

    const users = await UserModel.find({ ...filter, _id: { $in: allUserIds } })
      .lean()
      .exec();

    const revenueMap = Object.fromEntries(
      userTxAgg.map((r) => [
        r._id.toString(),
        { revenue: r.totalRevenue, planCode: r.lastPlan },
      ])
    );

    const result = users.map((u) => ({
      ...u,
      revenue: revenueMap[u._id.toString()]?.revenue || 0,
      planCode: revenueMap[u._id.toString()]?.planCode || null,
    }));

    // 🔽 Sort theo gói
    const planPriority = ["PRO", "STA", null, undefined];
    result.sort((a, b) => {
      const aIndex = planPriority.indexOf(a.planCode);
      const bIndex = planPriority.indexOf(b.planCode);
      const safeA = aIndex === -1 ? planPriority.length : aIndex;
      const safeB = bIndex === -1 ? planPriority.length : bIndex;
      if (safeA === safeB) return b.revenue - a.revenue;
      return safeA - safeB;
    });

    const start = (Number(page) - 1) * Number(pageSize);
    const paginated = result.slice(start, start + Number(pageSize));

    res.json({ success: true, total: result.length, data: paginated });
  } catch (err) {
    console.error("❌ [GET /customer/list]", err);
    res.status(500).json({ success: false, message: "Internal error" });
  }
});

/* ============================================================
   📈 3️⃣ Biểu đồ khách hàng & doanh thu (theo nhóm)
============================================================ */
router.get("/chart", authenticate, async (req: any, res) => {
  try {
    const currentUser = req.user;
    if (!hasAccess(currentUser.role, ["admin", "master", "sub"])) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền truy cập" });
    }

    const userFilter = getUserFilterByRole(currentUser);

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const usersByMonth = await UserModel.aggregate([
      { $match: { ...userFilter, createdAt: { $gte: start } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          users: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const friendIds = (
      await UserModel.find(userFilter).select("_id").lean()
    ).map((f) => f._id);

    const revenueByMonth = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: start },
          status: "success",
          userId: { $in: friendIds },
          planCode: { $in: ["STA", "PRO", "ULT"] },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          revenue: { $sum: "$discountPrice" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const starterUsers = await UserModel.countDocuments({
      ...userFilter,
      plan: "plan1",
    });
    const proUsers = await UserModel.countDocuments({
      ...userFilter,
      plan: "plan2",
    });
    const ultUsers = await UserModel.countDocuments({
      ...userFilter,
      plan: "plan3",
    });

    res.json({
      success: true,
      planRatio: [
        { name: "Starter", value: starterUsers },
        { name: "Pro", value: proUsers },
        { name: "Ultimate", value: ultUsers },
      ],
      newUsersByMonth: usersByMonth.map((m) => ({
        month: `Tháng ${m._id.month}`,
        users: m.users,
      })),
      revenueByMonth: revenueByMonth.map((m) => ({
        month: `Tháng ${m._id.month}`,
        revenue: m.revenue,
      })),
    });
  } catch (err) {
    console.error("❌ [GET /customer/chart]", err);
    res.status(500).json({ success: false, message: "Internal error" });
  }
});

/* ============================================================
   🧾 4️⃣ Lịch sử mua gói của 1 khách hàng
============================================================ */
router.get("/history/:userId", authenticate, async (req: any, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    if (!hasAccess(currentUser.role, ["admin", "master", "sub"])) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền" });
    }

    const userFilter = getUserFilterByRole(currentUser);
    const target = await UserModel.findOne({ _id: userId, ...userFilter });
    if (!target) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền truy cập" });
    }

    const txs = await Transaction.find({
      userId,
      status: "success",
      planCode: { $exists: true, $ne: null },
    })
      .sort({ createdAt: -1 })
      .lean();

    const data = txs.map((t:any) => ({
      plan: t.planName || t.planCode || "N/A",
      price: t.discountPrice || t.amount || 0,
      purchasedAt: t.createdAt,
      expiredAt: t.expiredAt,
      status:
        t.expiredAt && new Date(t.expiredAt) > new Date()
          ? "Còn hạn"
          : t.expiredAt
            ? "Hết hạn"
            : "Active",
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ [GET /customer/history/:userId]", err);
    res.status(500).json({ success: false, message: "Internal error" });
  }
});

/* ============================================================
   👤 5️⃣ Chi tiết 1 khách hàng (thông tin + doanh thu + lịch sử)
============================================================ */

router.get("/detail/:userId", authenticate, async (req: any, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    // 🔐 Kiểm tra quyền truy cập cơ bản
    if (!hasAccess(currentUser.role, ["admin", "master", "sub"])) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền truy cập" });
    }

    // 🧩 Áp dụng filter theo role
    const userFilter = getUserFilterByRole(currentUser);

    // Kiểm tra người dùng mục tiêu có nằm trong phạm vi quản lý không
    const target = await UserModel.findOne({
      _id: userId,
      ...userFilter,
    }).lean();

    if (!target) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập khách hàng này",
      });
    }

    /* ============================================================
           💰 Lấy toàn bộ giao dịch hợp lệ (để tính nhiều gói)
        ============================================================ */
    const txs = await Transaction.find({
      userId,
      status: "success",
      planCode: { $exists: true, $ne: null },
    })
      .sort({ createdAt: 1 }) // 👈 Sắp theo thứ tự cũ -> mới để cộng dồn expire
      .lean();

    const totalRevenue = txs.reduce((s, t) => s + (t.amount || 0), 0);
    const planCodes = [...new Set(txs.map((t) => t.planCode).filter(Boolean))];

    // 📦 Lấy thông tin Plan tương ứng
    const planDocs = await PlanModel.find({ code: { $in: planCodes } }).lean();
    const planMap = Object.fromEntries(planDocs.map((p: any) => [p.code, p]));

    // 🧮 Gom giao dịch theo planCode để cộng dồn thời hạn
    const planTxMap: Record<string, any[]> = {};
    txs.forEach((tx) => {
      if (!planTxMap[tx.planCode]) planTxMap[tx.planCode] = [];
      planTxMap[tx.planCode].push(tx);
    });

    // 🧾 Danh sách lịch sử mua (có cộng dồn expire)
    const txList: any[] = [];

    for (const [planCode, planTxs] of Object.entries(planTxMap)) {
      const planInfo = planMap[planCode] || {};
      const expireMonths = Number(planInfo.expire || 0);
      let currentExpire: Date | null = null;

      for (const t of planTxs) {
        const purchasedAt = new Date(t.createdAt);

        // Nếu gói trước còn hạn thì cộng dồn thời gian
        const startDate =
          currentExpire && currentExpire > purchasedAt
            ? new Date(currentExpire)
            : purchasedAt;

        const expiredAt: any = expireMonths
          ? new Date(
              new Date(startDate).setMonth(startDate.getMonth() + expireMonths)
            )
          : null;

        currentExpire = expiredAt;

        txList.push({
          planCode,
          planTitle: planInfo.title || planCode,
          price: Number(planInfo.price || t.amount || 0),
          discountPrice: Number(t.discountPrice || t.amount || 0),
          purchasedAt,
          expiredAt,
          status: expiredAt && expiredAt > new Date() ? "Còn hạn" : "Hết hạn",
        });
      }
    }

    // 🔁 Sắp xếp ngược lại (mới nhất lên đầu)
    txList.sort((a, b) => (b.purchasedAt > a.purchasedAt ? 1 : -1));

    // 📊 Tổng hợp theo từng gói
    const planSummary = planCodes.map((code) => {
      const plan = planMap[code];
      const txOfPlan = txList.filter((x) => x.planCode === code);
      const totalOfPlan = txOfPlan.reduce((s, x) => s + x.discountPrice, 0);
      return {
        code,
        title: plan?.title || code,
        count: txOfPlan.length,
        totalRevenue: totalOfPlan,
        lastPurchase: txOfPlan.at(-1)?.purchasedAt,
        lastExpire: txOfPlan.at(-1)?.expiredAt,
      };
    });

    /* ============================================================
           🧩 Trả dữ liệu chi tiết
        ============================================================ */
    res.json({
      success: true,
      data: {
        user: {
          _id: target._id,
          name: target.name,
          email: target.email,
          plan: target.plan,
          createdAt: target.createdAt,
          lastActiveAt: target.lastActiveAt,
        },
        totalRevenue,
        planSummary,
        recentTxs: txList.slice(0, 5),
      },
    });
  } catch (err) {
    console.error("❌ [GET /customer/detail/:userId]", err);
    res.status(500).json({ success: false, message: "Internal error" });
  }
});
export default router;
