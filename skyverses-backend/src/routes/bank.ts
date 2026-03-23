// routes/bank.ts
import express from "express";
import { BankTransaction } from "../models/BankTransactionModel";

import { authenticate } from "./auth";
import { hasAccess } from "../utils/roleHelpers";
const router = express.Router();

/**
 * @swagger
 * /bank/history:
 *   get:
 *     summary: Lấy danh sách giao dịch ngân hàng đã liên kết user
 *     tags: [Bank]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [IN, OUT] }
 *       - in: query
 *         name: bank
 *         schema: { type: string }
 *       - in: query
 *         name: keyword
 *         schema: { type: string }
 *         description: tìm kiếm theo description hoặc transactionNum
 *     responses:
 *       200:
 *         description: Trả về danh sách giao dịch đã gắn user
 */
router.get("/history", authenticate, async (req: any, res) => {
  try {
    const { role } = req.user;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const { type, bank, keyword } = req.query;

    if (!hasAccess(role, ["admin", "master", "sub"])) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập lịch sử giao dịch.",
      });
    }

    /* ===============================
       BASE MATCH
       ⭐ CHỈ FIB / NEO
    =============================== */
    const match: any = {
      description: { $regex: /(FIB|NEO)/i },
    };

    if (type) match.type = type;
    if (bank) match.bank = bank;

    const pipeline: any[] = [
      { $match: match },

      /* ===============================
         JOIN USER (OPTIONAL)
      =============================== */
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    /* ===============================
       KEYWORD SEARCH
       - description
       - transactionNum
       - user.email
    =============================== */
    if (keyword) {
      pipeline.push({
        $match: {
          $or: [
            { description: { $regex: keyword, $options: "i" } },
            { transactionNum: { $regex: keyword, $options: "i" } },
            { "user.email": { $regex: keyword, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize },
          ],
          total: [{ $count: "count" }],
        },
      }
    );

    const result = await BankTransaction.aggregate(pipeline);
    const data = result[0]?.data || [];
    const total = result[0]?.total?.[0]?.count || 0;

    res.json({ total, page, pageSize, data });
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách giao dịch:", err);
    res.status(500).send("Lỗi server");
  }
});
/**
 * @swagger
 * /bank/check-limit:
 *   get:
 *     summary: Kiểm tra trạng thái giới hạn thanh toán
 *     tags: [Bank]
 *     description: Trả về trạng thái còn slot hay đã đạt giới hạn 100 giao dịch có userId
 *     responses:
 *       200:
 *         description: Kết quả kiểm tra
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 available:
 *                   type: boolean
 *                 totalConfirmed:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 message:
 *                   type: string
 */
router.get("/check-limit", async (req, res) => {
  try {
    const limit = 100000000;

    // Đếm số giao dịch đã có userId (đã liên kết)
    const totalConfirmed = await BankTransaction.countDocuments({
      userId: { $exists: true, $ne: null },
    });

    const available = totalConfirmed < limit;

    res.json({
      success: true,
      available,
      totalConfirmed,
      limit,
      message: available
        ? `✅ Còn ${limit - totalConfirmed} slot thanh toán khả dụng.`
        : "🚫 Đã đạt giới hạn giao dịch, vui lòng thử lại sau.",
    });
  } catch (err: any) {
    console.error("❌ Lỗi check-limit:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
