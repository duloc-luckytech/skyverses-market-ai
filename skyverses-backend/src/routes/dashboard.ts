import express from "express";
import { authenticate } from "./auth";
import UserModel from "../models/UserModel";
import { Transaction } from "../models/BankTransactionModel";
import {
  hasAccess,
  getRoleBasedFilters,
  getDateRange,
  getUserActivityFormat,
} from "../utils/roleHelpers";
export const TX_PREFIXES = ["FIB", "NEO"];
const prefixRegex = new RegExp(`^(${TX_PREFIXES.join("|")})`, "i");
const router = express.Router();

/* ============================================================
   📊 /dashboard/statistic
   ============================================================ */
router.get("/statistic", authenticate, async (req: any, res) => {
  try {
    const { role } = req.user;
    if (!hasAccess(role)) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền",
      });
    }

    const { userFilter, txFilter } = await getRoleBasedFilters(req.user);

    /* =====================================================
     * ⚡ 1) Count users (để riêng vì cực nhẹ & dùng index)
     * ===================================================== */
    const [totalUsers, totalActiveCodes, onlineUsers] = await Promise.all([
      UserModel.countDocuments(userFilter),

      UserModel.countDocuments({
        ...userFilter,
        plan: { $in: ["plan1", "plan2", "plan3", "trial"] },
      }),

      UserModel.countDocuments({
        ...userFilter,
        lastActiveAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
      }),
    ]);

    /* =====================================================
     * ⚡ 2) SUPER AGGREGATE: Transaction → all statistics
     * Chỉ 1 aggregate duy nhất!
     * ===================================================== */
    const txAgg = await Transaction.aggregate([
      {
        $match: {
          ...txFilter,
          status: "success",
        },
      },

      {
        $facet: {
          // ⭐ Doanh thu theo planCode (STA, PRO, TRI)
          revenueByPlan: [
            { $match: { planCode: { $in: ["STA", "PRO", "TRI"] } } },
            {
              $group: {
                _id: "$planCode",
                totalRevenue: { $sum: "$amount" },
              },
            },
          ],

          // ⭐ Real Direct Payment (note bắt đầu bằng FIB)
          direct: [
            {
              $match: {
                note: { $regex: prefixRegex },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
              },
            },
          ],

          // ⭐ Real Paid Code (group "User Paid")
          paidCode: [
            {
              $match: {
                note: /^CODE-/i,
              },
            },
            {
              $project: {
                amount: 1,
                cleanCode: {
                  $substr: [
                    "$note",
                    5,
                    { $subtract: [{ $strLenCP: "$note" }, 5] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "activecodes",
                localField: "cleanCode",
                foreignField: "code",
                as: "codeInfo",
              },
            },
            { $unwind: "$codeInfo" },
            {
              $lookup: {
                from: "activecodegroups",
                localField: "codeInfo.groupId",
                foreignField: "_id",
                as: "groupInfo",
              },
            },
            { $unwind: "$groupInfo" },
            { $match: { "groupInfo.name": "User Paid" } },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
              },
            },
          ],
        },
      },
    ]);

    const result = txAgg[0] || {};

    const revenueByPlan = result.revenueByPlan || [];
    const realDirectRevenue = result.direct?.[0]?.total || 0;
    const realPaidCodeRevenue = result.paidCode?.[0]?.total || 0;

    const totalRevenue = revenueByPlan.reduce(
      (sum, r) => sum + (r.totalRevenue || 0),
      0
    );

    const realRevenue = realDirectRevenue + realPaidCodeRevenue;

    return res.json({
      success: true,

      totalUsers,
      totalActiveCodes,
      onlineUsers,

      revenueByPlan,
      totalRevenue,
      totalProfit: Math.round(totalRevenue),

      realDirectRevenue,
      realPaidCodeRevenue,

      realRevenue, // ⭐ Tổng thực thu
    });
  } catch (err: any) {
    console.error("❌ [GET /dashboard/statistic]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/* ============================================================
   💰 /dashboard/revenue-detail
   ============================================================ */
router.get("/revenue-detail", authenticate, async (req: any, res) => {
  try {
    const { role } = req.user;
    if (!hasAccess(role))
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền" });

    const { txFilter } = await getRoleBasedFilters(req.user);

    const data = await Transaction.aggregate([
      { $match: txFilter },
      {
        $group: {
          _id: "$planCode",
          revenue: { $sum: "$amount" },
          users: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          plan: "$_id",
          users: { $size: "$users" },
          revenue: 1,
          profit: { $round: [{ $multiply: ["$revenue", 0.93] }, 0] },
          _id: 0,
        },
      },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ [GET /dashboard/revenue-detail]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/* ============================================================
   📈 /dashboard/revenue-trend
   ============================================================ */
router.get("/revenue-trend", authenticate, async (req: any, res) => {
  try {
    const { role } = req.user;
    const { range = "7d" } = req.query;
    if (!hasAccess(role))
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền" });

    const { startDate, groupFormat } = getDateRange(range);
    const { txFilter } = await getRoleBasedFilters(req.user);

    const data = await Transaction.aggregate([
      { $match: { ...txFilter, verifiedAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: "$verifiedAt",
              timezone: "Asia/Ho_Chi_Minh",
            },
          },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { label: "$_id", revenue: 1, _id: 0 } },
    ]);

    res.json({ success: true, range, data });
  } catch (err) {
    console.error("❌ [GET /dashboard/revenue-trend]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/* ============================================================
   👥 /dashboard/user-activity
   ============================================================ */
router.get("/user-activity", authenticate, async (req: any, res) => {
  try {
    const { role } = req.user;
    const { type = "day" } = req.query;
    if (!hasAccess(role))
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền" });

    const format = getUserActivityFormat(type);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    const { userFilter } = await getRoleBasedFilters(req.user);
    const data = await UserModel.aggregate([
      { $match: { ...userFilter, lastActiveAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format, date: "$lastActiveAt" } },
          joined: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { label: "$_id", joined: 1, _id: 0 } },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ [GET /dashboard/user-activity]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/transaction/fib", authenticate, async (req: any, res) => {
  try {
    const { role } = req.user;
    if (!hasAccess(role)) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền" });
    }

    const { txFilter } = await getRoleBasedFilters(req.user);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const match = {
      ...txFilter,
      status: "success",
      note: { $regex: prefixRegex },
    };

    const pipeline: any[] = [
      { $match: match },

      // 🔗 JOIN User
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },

      { $sort: { createdAt: -1 } },

      // Pagination
      { $skip: (page - 1) * limit },
      { $limit: limit },

      // Only needed fields
      {
        $project: {
          _id: 1,
          amount: 1,
          note: 1,
          createdAt: 1,

          // user
          "userInfo._id": 1,
          "userInfo.email": 1,
          "userInfo.name": 1,
          "userInfo.plan": 1,
          "userInfo.createdAt": 1,
        },
      },
    ];

    const countPipeline = [{ $match: match }, { $count: "total" }];

    const [items, totalRes] = await Promise.all([
      Transaction.aggregate(pipeline),
      Transaction.aggregate(countPipeline),
    ]);

    const total = totalRes?.[0]?.total || 0;

    return res.json({
      success: true,
      data: items,
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error("❌ GET /transaction/fib", err);
    return res.status(500).json({ success: false });
  }
});

router.get("/transaction/code-paid", authenticate, async (req: any, res) => {
  try {
    const { role } = req.user;
    if (!hasAccess(role)) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền",
      });
    }

    const { txFilter } = await getRoleBasedFilters(req.user);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const pipeline: any[] = [
      {
        $match: {
          ...txFilter,
          status: "success",
          note: /^CODE-/i,
        },
      },

      // Tạo cleanCode = phần sau CODE-
      {
        $project: {
          amount: 1,
          note: 1,
          userId: 1,
          createdAt: 1,
          cleanCode: {
            $substr: ["$note", 5, { $subtract: [{ $strLenCP: "$note" }, 5] }],
          },
        },
      },

      // JOIN ActiveCode
      {
        $lookup: {
          from: "activecodes",
          localField: "cleanCode",
          foreignField: "code",
          as: "codeInfo",
        },
      },
      { $unwind: "$codeInfo" },

      // JOIN Group
      {
        $lookup: {
          from: "activecodegroups",
          localField: "codeInfo.groupId",
          foreignField: "_id",
          as: "groupInfo",
        },
      },
      { $unwind: "$groupInfo" },

      // Lọc User Paid
      {
        $match: {
          "groupInfo.name": "User Paid",
        },
      },

      // JOIN UserModel
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },

      { $sort: { createdAt: -1 } },

      { $skip: (page - 1) * limit },
      { $limit: limit },

      {
        $project: {
          _id: 1,
          amount: 1,
          note: 1,
          createdAt: 1,

          // user info
          "userInfo._id": 1,
          "userInfo.email": 1,
          "userInfo.name": 1,
          "userInfo.plan": 1,
          "userInfo.createdAt": 1,

          // code info
          "codeInfo.code": 1,
          "codeInfo.plan": 1,
          "codeInfo.days": 1,
          "groupInfo.name": 1,
        },
      },
    ];

    // Count
    const countPipeline = [
      {
        $match: {
          ...txFilter,
          status: "success",
          note: /^CODE-/i,
        },
      },

      {
        $project: {
          cleanCode: {
            $substr: ["$note", 5, { $subtract: [{ $strLenCP: "$note" }, 5] }],
          },
        },
      },

      {
        $lookup: {
          from: "activecodes",
          localField: "cleanCode",
          foreignField: "code",
          as: "codeInfo",
        },
      },
      { $unwind: "$codeInfo" },

      {
        $lookup: {
          from: "activecodegroups",
          localField: "codeInfo.groupId",
          foreignField: "_id",
          as: "groupInfo",
        },
      },
      { $unwind: "$groupInfo" },

      { $match: { "groupInfo.name": "User Paid" } },

      { $count: "total" },
    ];

    const [items, totalRes] = await Promise.all([
      Transaction.aggregate(pipeline),
      Transaction.aggregate(countPipeline),
    ]);

    const total = totalRes?.[0]?.total || 0;

    res.json({
      success: true,
      data: items,
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error("❌ GET /transaction/code-paid", err);
    return res.status(500).json({ success: false });
  }
});
export default router;
