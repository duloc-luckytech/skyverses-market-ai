import { Router } from "express";
import User from "../models/UserModel";
import AffiliateTransaction from "../models/AffiliateTransaction";
import mongoose from "mongoose";
import AffiliatePayment from "../models/AffiliatePayment";

const router = Router();

/* ======================================================
   📌 CREATE PAYMENT
   POST /affiliate/payment/add
====================================================== */
router.post("/payment/add", async (req: any, res) => {
  try {
    const { affiliateId, amount, note, role, userId } = req.body;

    if (!affiliateId || !amount) {
      return res.status(400).json({
        success: false,
        message: "affiliateId & amount required",
      });
    }

    /* ======================================================
       ⭐ Determine createdBy EMAIL
    ====================================================== */
    let createdByEmail = null;

    if (role === "admin") {
      createdByEmail = "admin";
    } else if (role === "master") {
      // master phải truyền userId → lấy email của user đó
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "Master requires userId",
        });
      }

      const u = await User.findById(userId).select("email");
      if (!u) {
        return res.status(404).json({
          success: false,
          message: "UserId not found",
        });
      }

      createdByEmail = u.email;
    } else {
      return res.status(403).json({
        success: false,
        message: "Only admin/master permitted",
      });
    }

    /* ======================================================
       ⭐ CREATE PAYMENT
    ====================================================== */
    const payment = await AffiliatePayment.create({
      affiliateId,
      amount,
      note: note || "",
      createdBy: createdByEmail, // <-- LƯU EMAIL
    });

    return res.json({
      success: true,
      payment,
    });
  } catch (err) {
    console.error("Payment Add ERROR:", err);
    return res.status(500).json({ success: false });
  }
});

/* ======================================================
   📌 LIST PAYMENT
   GET /affiliate/payment/list?affiliateId=xxxx
====================================================== */
router.get("/payment/list", async (req: any, res) => {
  try {
    const role = String(req.query.role || "").toLowerCase();
    if (!isMasterOrAdmin(role)) {
      return res.status(403).json({ success: false, message: "role required" });
    }

    const affiliateId = req.query.affiliateId;
    if (!affiliateId) {
      return res.status(400).json({
        success: false,
        message: "affiliateId required",
      });
    }

    const list = await AffiliatePayment.find({ affiliateId }).sort({
      createdAt: -1,
    });

    return res.json({ success: true, list });
  } catch (err) {
    console.error("Payment List ERROR:", err);
    return res.status(500).json({ success: false });
  }
});

/* ======================================================
   🧠 Helper
====================================================== */
const isMasterOrAdmin = (role: string = "") =>
  role === "admin" || role === "master";
/* ======================================================
   📌 ROUTE 1 — Lịch sử hoa hồng (GROUP THEO AFFILIATE)
   GET /affiliate/history?role=master&userId=xxxx
====================================================== */
router.get("/history", async (req: any, res) => {
  const role = String(req.query.role || "").toLowerCase();
  const userId = req.query.userId;

  try {
    // role bắt buộc
    if (!isMasterOrAdmin(role)) {
      return res.status(403).json({
        success: false,
        message: "role required",
      });
    }

    const match: any = {};

    // nếu master xem 1 user cụ thể
    if (userId) {
      match.affiliateId = new mongoose.Types.ObjectId(userId);
    }

    // A. GROUP theo affiliate
    const grouped = await AffiliateTransaction.aggregate([
      {
        $group: {
          _id: "$affiliateId",
          totalCommission: { $sum: "$amount" },
          transactions: { $push: "$$ROOT" },
        },
      },

      // Lấy full affiliate info
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "affiliate",
        },
      },
      { $unwind: "$affiliate" },

      { $sort: { totalCommission: -1 } },
    ]);

    // B. POPULATE DETAIL TRANSACTIONS (full info)
    const populated = await Promise.all(
      grouped.map(async (group: any) => {
        const txIds = group.transactions.map((t: any) => t._id);

        let txFull: any = await AffiliateTransaction.find({
          _id: { $in: txIds },
        })
          .populate("fromUserId") // FULL USER INFO
          .populate("affiliateId") // FULL USER INFO
          .sort({ createdAt: -1 });

        // 🔥 Remove sensitive fields
        txFull = txFull.map((tx: any) => {
          if (tx.fromUserId) {
            delete tx.fromUserId.password;
            delete tx.fromUserId.refreshToken;
            delete tx.fromUserId.__v;
          }
          if (tx.affiliateId) {
            delete tx.affiliateId.password;
            delete tx.affiliateId.refreshToken;
            delete tx.affiliateId.__v;
          }
          return tx;
        });

        // Xoá trường nhạy cảm trong affiliate info
        const affiliate = { ...group.affiliate };
        delete affiliate.password;
        delete affiliate.refreshToken;
        delete affiliate.__v;

        return {
          affiliate, // FULL INFO
          totalCommission: group.totalCommission,
          transactions: txFull, // FULL TRANSACTION DETAILS
        };
      })
    );

    return res.json({
      success: true,
      list: populated,
    });
  } catch (err) {
    console.error("Affiliate history error:", err);
    return res.status(500).json({ success: false });
  }
});

/* ======================================================
   📌 ROUTE 2 — Mạng lưới F1 / F2
   GET /affiliate/network?role=master&userId=xxxx
====================================================== */
router.get("/network", async (req: any, res) => {
  const role = req.query.role;
  const userId = req.query.userId;

  try {
    // 🔥 admin/master xem toàn hệ thống
    if (isMasterOrAdmin(role)) {
      const f1 = await User.find({ inviteFrom: { $ne: null } });
      const f2 = await User.find({
        inviteFrom: { $in: f1.map((u: any) => u._id) },
      });

      return res.json({
        success: true,
        f1Count: f1.length,
        f2Count: f2.length,
        f1,
        f2,
      });
    }

    // 🔥 admin/master xem network của user bất kỳ
    if (isMasterOrAdmin(role) && userId) {
      const f1 = await User.find({ inviteFrom: userId });

      const f2 = await User.find({
        inviteFrom: { $in: f1.map((u: any) => u._id) },
      });

      return res.json({
        success: true,
        f1Count: f1.length,
        f2Count: f2.length,
        f1,
        f2,
      });
    }

    return res.status(403).json({
      success: false,
      message: "role required",
    });
  } catch (err) {
    console.error("Affiliate network error:", err);
    return res.status(500).json({ success: false });
  }
});

function getBaseUrl() {
  const domain = process.env.DOMAIN_NAME?.toUpperCase();

  if (domain === "NEO") return "https://neovideo.luckytech.io";
  if (domain === "FIB") return "https://ai.fibusvideo.com";

  return "https://neovideo.luckytech.io"; // fallback
}

router.get("/stats", async (req: any, res) => {
  const role = String(req.query.role || "").toLowerCase();

  try {
    if (!isMasterOrAdmin(role)) {
      return res.status(403).json({
        success: false,
        message: "role required",
      });
    }

    // ⭐ Tổng số user có inviteFrom
    const totalRegs = await User.countDocuments({
      inviteFrom: { $ne: null },
    });

    // ⭐ Tổng toàn bộ hoa hồng hệ thống
    const total = await AffiliateTransaction.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    /* ============================================================
       ⭐ Lấy inviteCode của chính user đang gọi API
    ============================================================ */
    let inviteCode = null;
    let inviteLink = null;

    if (req.query?.userId) {
      const me = await User.findById(req.query?.userId).select("inviteCode");

      if (me?.inviteCode) {
        inviteCode = me.inviteCode;
        inviteLink = `${getBaseUrl()}/?invite=${inviteCode}`;
      }
    }

    return res.json({
      success: true,
      totalCommission: total?.[0]?.total || 0,
      registrations: totalRegs,

      // ⭐ Thêm mới — không ảnh hưởng logic cũ
      inviteCode,
      inviteLink,
    });
  } catch (err) {
    console.error("Affiliate stats error:", err);
    return res.status(500).json({ success: false });
  }
});

/* ======================================================
   📌 LIST FRIENDS (F1) + COMMISSION & PAYMENTS
   GET /affiliate/friends?role=master&userId=xxxx
====================================================== */
router.get("/friends", async (req: any, res) => {
  try {
    const role = String(req.query.role || "").toLowerCase();
    const userId =req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId required",
      });
    }

    /* ==========================================================
       1️⃣ Lấy danh sách bạn bè (F1)
    ========================================================== */
    const friends = await User.find({ inviteFrom: userId })
      .select("_id email name createdAt plan")
      .lean();

    const friendIds = friends.map((u) => u._id);

    /* ==========================================================
       2️⃣ Lấy toàn bộ hoa hồng từ các F1
    ========================================================== */
    const commissions = await AffiliateTransaction.aggregate([
      { $match: { affiliateId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$fromUserId",
          totalCommission: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    /* ==========================================================
       3️⃣ Lấy danh sách các khoản thanh toán cho user
    ========================================================== */
    const payments = await AffiliatePayment.find({
      affiliateId: userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    /* ==========================================================
       4️⃣ Gộp dữ liệu
    ========================================================== */
    const final = friends.map((f) => {
      const c = commissions.find((x) => String(x._id) === String(f._id));

      const totalCommission = c?.totalCommission || 0;

      return {
        ...f,
        totalCommission,
        transactions: c?.count || 0,
      };
    });

    const totalCommission = commissions.reduce(
      (sum, x) => sum + x.totalCommission,
      0
    );

    const unpaid = totalCommission - totalPaid;

    return res.json({
      success: true,

      // 👥 Danh sách bạn bè + doanh số từng người
      friends: final,

      // 💵 Tổng doanh số
      totalCommission,

      // 💸 Đã thanh toán
      totalPaid,

      // ⏳ Chưa thanh toán
      unpaid,

      // 📜 Lịch sử thanh toán
      payments,
    });
  } catch (err) {
    console.error("Affiliate friends error:", err);
    return res.status(500).json({ success: false });
  }
});

export default router;
