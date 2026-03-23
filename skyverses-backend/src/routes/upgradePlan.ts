// routes/user/upgradePlan.ts
import express from "express";
import User from "../models/UserModel";
import { ActiveCode, ActiveCodeGroup } from "../models/ActiveCodeModel"; // ✅ thêm model mã kích hoạt
import { authenticate } from "./auth";
import mongoose from "mongoose";
import { Transaction, BankTransaction } from "../models/BankTransactionModel"; // thêm nếu chưa có
import GoogleToken from "../models/GoogleTokenModel";
import moment from "moment";
// routes/planRoutes.ts
import Plan from "../models/PlanModel";
import Coupon from "../models/Coupon";
import { MAX_VIDEO_PLAN } from "../constanst/plans";
// ✅ Cấu hình ngân hàng thật

const BANK_INFO = {
  bankName: process.env.BANK_INFO_NAME,
  bankCode: process.env.BANK_INFO_CODE,
  accountNumber: process.env.BANK_INFO_ACCOUNT_NUMBER,
  accountName: process.env.BANK_INFO_ACCOUNT_NAME,
};
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Quản lý gói VIP (Plans)
 */

/**
 * @swagger
 * /plan/list:
 *   get:
 *     summary: Lấy danh sách tất cả các gói VIP
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Danh sách các gói hiện tại
 */
router.get("/list", async (_req, res) => {
  const plans = await Plan.find().sort({ price: 1 });

  res.json(plans);
});

/**
 * @swagger
 * /plan/update/{key}:
 *   put:
 *     summary: Cập nhật thông tin gói VIP
 *     tags: [Admin]
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         description: Mã gói (free, plan1, plan2, plan3)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: string
 *               maxDuration:
 *                 type: number
 *               maxPrompt:
 *                 type: number
 *               videoPerMinute:
 *                 type: number
 *               expire:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy gói
 */
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // ===== Validate ID =====
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "ID không hợp lệ" });
    }

    // ===== Validate key unique nếu có truyền key =====
    if (updates.key) {
      const exists = await Plan.findOne({
        key: updates.key,
        _id: { $ne: id }, // exclude current plan
      });

      if (exists) {
        return res.status(400).json({
          error: `Key '${updates.key}' đã tồn tại trong gói '${exists.title}'`,
        });
      }
    }

    // ===== Đảm bảo object con tồn tại (để tránh lỗi undefined khi merge) =====
    const safeUpdates = {
      ...updates,
      textToVideo: {
        maxPrompt: updates?.textToVideo?.maxPrompt ?? undefined,
        maxVideosPerRequest:
          updates?.textToVideo?.maxVideosPerRequest ?? undefined,
      },
      imageToVideo: {
        maxPrompt: updates?.imageToVideo?.maxPrompt ?? undefined,
        maxVideosPerRequest:
          updates?.imageToVideo?.maxVideosPerRequest ?? undefined,
      },
      startEndFrame: {
        maxPrompt: updates?.startEndFrame?.maxPrompt ?? undefined,
        maxVideosPerRequest:
          updates?.startEndFrame?.maxVideosPerRequest ?? undefined,
      },
      characterSync: {
        maxPrompt: updates?.characterSync?.maxPrompt ?? undefined,
        maxVideosPerRequest:
          updates?.characterSync?.maxVideosPerRequest ?? undefined,
      },
    };

    // Loại bỏ undefined để không ghi đè sai structure
    Object.keys(safeUpdates).forEach((k) => {
      if (safeUpdates[k] && typeof safeUpdates[k] === "object") {
        Object.keys(safeUpdates[k]).forEach((sub) => {
          if (safeUpdates[k][sub] === undefined) {
            delete safeUpdates[k][sub];
          }
        });
      }
    });

    // ===== Update DB =====
    const plan = await Plan.findByIdAndUpdate(id, safeUpdates, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return res.status(404).json({ error: "Không tìm thấy gói" });
    }

    // ===== Response =====
    return res.json({
      success: true,
      message: `Đã cập nhật gói '${plan.title}' thành công.`,
      plan,
    });
  } catch (error) {
    console.error("❌ Update plan error:", error);
    return res.status(500).json({ error: "Lỗi server khi cập nhật gói" });
  }
});

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: Các API liên quan đến nâng cấp và kích hoạt gói người dùng
 */

/**
 * @swagger
 * /plan/upgrade-plan:
 *   post:
 *     summary: Nâng cấp gói tài khoản cho người dùng
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planKey
 *             properties:
 *               planKey:
 *                 type: string
 *                 example: plan2
 *     responses:
 *       200:
 *         description: Nâng cấp thành công
 *       400:
 *         description: Thiếu hoặc sai tham số
 *       500:
 *         description: Lỗi server
 */
router.post("/upgrade-plan", authenticate, async (req: any, res) => {
  try {
    const { planKey } = req.body;
    const { userId } = req.user;

    if (!userId || !planKey) {
      return res.status(400).json({ error: "Thiếu userId hoặc planKey." });
    }

    /* -----------------------------------------
     * 🔍 Lấy thông tin plan từ DB
     * ----------------------------------------- */
    let plan = await Plan.findOne({ key: planKey });

    if (!plan) {
      return res.status(404).json({ error: `Không tìm thấy gói: ${planKey}` });
    }

    /* -----------------------------------------
     * 🧮 Tính thời gian hết hạn (expire)
     * ----------------------------------------- */
    const now = new Date();
    const expiresAt = new Date(now.getTime());
    expiresAt.setDate(now.getDate() + (plan.expire || 30));

    /* -----------------------------------------
     * 💾 Cập nhật thông tin user
     * ----------------------------------------- */
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        plan: plan.key,
        planExpiresAt: expiresAt,
        planDetails: {
          title: plan.title,
          price: plan.price,
          maxDuration: plan.maxDuration,
          maxPrompt: plan.maxPrompt,
          videoPerMinute: plan.videoPerMinute,
          expire: plan.expire,
        },
        videoCount: 0,
        videoUsed: 0,
        maxVideo: plan.maxVideo,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Không tìm thấy người dùng." });
    }

    /* -----------------------------------------
     * ✅ Trả phản hồi
     * ----------------------------------------- */
    return res.json({
      success: true,
      message: `🎉 Đã nâng cấp lên gói ${plan.title} thành công!`,
      plan: plan.key,
      expiresAt,
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        plan: updatedUser.plan,
        planExpiresAt: updatedUser.planExpiresAt,
      },
    });
  } catch (err: any) {
    console.error("❌ [POST /plan/upgrade-plan]", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi nâng cấp gói.",
      details: err.message,
    });
  }
});

/**
 * @swagger
 * /plan/request-payment:
 *   post:
 *     summary: Yêu cầu mã QR thanh toán gói nâng cấp
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planKey
 *             properties:
 *               planKey:
 *                 type: string
 *                 example: plan1
 *     responses:
 *       200:
 *         description: Trả về thông tin QR thanh toán
 */
router.post("/request-payment", authenticate, async (req: any, res) => {
  try {
    const { planKey } = req.body;
    const userId = req.user?.userId;

    // 🕒 Tạo timestamp ngắn gọn dạng MMDDHHmm (vd: 11102245 = 10/11 22:45)
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const timestamp = `${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(
      now.getHours()
    )}${pad(now.getMinutes())}`;

    if (!userId || !planKey) {
      return res.status(400).json({
        success: false,
        message: "Thiếu userId hoặc planKey.",
      });
    }

    /* ---------------------------------------------
     * 🔍 Lấy thông tin gói từ DB hoặc fallback từ PLANS
     * --------------------------------------------- */
    const plan = await Plan.findOne({ key: planKey });
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: `Gói '${planKey}' không tồn tại.`,
      });
    }

    /* ---------------------------------------------
     * 💰 Tạo thông tin thanh toán
     * --------------------------------------------- */
    const amount = parseInt(plan.discountPrice.replace(/\D/g, "")) || 0;
    const note = `${
      process.env.DOMAIN_NAME
    }${plan?.code?.toUpperCase()}${userId}${timestamp}`; // nội dung chuyển khoản duy nhất
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // hết hạn sau 30 phút

    // ✅ Tạo QR thật theo chuẩn VietQR (scan được bằng mọi app ngân hàng)
    const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankCode}-${
      BANK_INFO.accountNumber
    }-compact.png?amount=${amount}&addInfo=${encodeURIComponent(note)}`;

    /* ---------------------------------------------
     * 💾 Ghi trạng thái pendingPayment cho user
     * --------------------------------------------- */
    await User.findByIdAndUpdate(userId, {
      pendingPayment: {
        planKey: plan.key,
        note,
        amount,
        expiresAt,
        createdAt: new Date(),
      },
    });

    /* ---------------------------------------------
     * ✅ Gửi phản hồi cho frontend
     * --------------------------------------------- */
    return res.json({
      success: true,
      message: "Tạo QR thanh toán thành công.",
      qrUrl, // ảnh QR real có thể scan
      bankName: BANK_INFO.bankName,
      accountNumber: BANK_INFO.accountNumber,
      accountName: BANK_INFO.accountName,
      amount,
      note,
      expiresAt,
    });
  } catch (err: any) {
    console.error("❌ [POST /plan/request-payment]", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo QR thanh toán.",
      details: err.message,
    });
  }
});
/**
 * @swagger
 * /plan/confirm-payment:
 *   post:
 *     summary: Ghi nhận người dùng xác nhận đã chuyển khoản
 *     tags: [Plan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planCode:
 *                 type: string
 *                 example: PRO
 *               note:
 *                 type: string
 *                 example: FIBUSPLAN1_65ab12ef
 *               amount:
 *                 type: number
 *                 example: 200000
 *     responses:
 *       200:
 *         description: Xác nhận thanh toán pending thành công
 */

router.post("/confirm-payment", authenticate, async (req: any, res) => {
  try {
    const { planKey, note, amount } = req.body;
    const userId = req.user?.userId;

    if (!userId || !planKey || !note || !amount) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu (planCode, note, amount).",
      });
    }

    // ✅ Kiểm tra user tồn tại
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy user." });
    }

    // ✅ Kiểm tra gói hợp lệ
    const plan = await Plan.findOne({ key: planKey });
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Gói không hợp lệ." });
    }

    // ✅ Kiểm tra nếu đã có giao dịch trùng note
    const existedTx = await Transaction.findOne({ note });
    if (existedTx) {
      return res.status(400).json({
        success: false,
        message: "Giao dịch này đã được ghi nhận trước đó.",
      });
    }

    // ✅ Tạo transaction pending
    const txRecord = await Transaction.create({
      userId,
      planCode: plan.code,
      note,
      amount,
      status: "pending", // chờ webhook xác nhận
      createdAt: new Date(),
    });

    console.log(
      `💾 [confirm-payment] Created pending tx ${txRecord._id} for ${user.email}`
    );

    return res.json({
      success: true,
      message:
        "✅ Đã ghi nhận xác nhận thanh toán. Vui lòng đợi hệ thống đối soát.",
      transactionId: txRecord._id,
      note,
    });
  } catch (err: any) {
    console.error("❌ [POST /plan/confirm-payment]", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xác nhận thanh toán.",
      details: err.message,
    });
  }
});

/**
 * @swagger
 * /plan/.-codes:
 *   get:
 *     summary: Lấy danh sách mã kích hoạt (Active Codes)
 *     description: Admin có thể xem toàn bộ mã kích hoạt với phân trang và tìm kiếm.
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Trang hiện tại (mặc định 1)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           example: 20
 *         description: Số lượng item mỗi trang (mặc định 20)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: VIP
 *         description: Tìm kiếm theo mã code, plan hoặc usedBy
 *     responses:
 *       200:
 *         description: Trả về danh sách mã kích hoạt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 pageSize:
 *                   type: integer
 *                   example: 20
 *                 totalItems:
 *                   type: integer
 *                   example: 120
 *                 totalPages:
 *                   type: integer
 *                   example: 6
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                         example: VIP1A92XQ
 *                       plan:
 *                         type: string
 *                         example: vip1
 *                       days:
 *                         type: integer
 *                         example: 30
 *                       isUsed:
 *                         type: boolean
 *                         example: false
 *                       usedBy:
 *                         type: string
 *                         example: 671a95d5b882b9dbf299a021
 *                       usedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-10-31T09:21:45.000Z
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-10-30T08:55:00.000Z
 *       500:
 *         description: Lỗi server
 */
router.get("/active-codes", async (req: any, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const search = (req.query.search || "").trim();
    const isUsed = req.query.isUsed ?? "all"; // all | true | false
    const groupId = req.query.groupId || null;

    const filter: any = {};

    /* --------------------------------------------
     * 🔍 SEARCH (code, plan, user, group name)
     * -------------------------------------------- */
    if (search) {
      const regex = new RegExp(search, "i");
      const isObjectId = mongoose.Types.ObjectId.isValid(search);
      const orConditions: any[] = [{ code: regex }, { plan: regex }];

      // Tìm theo người dùng
      const users = await User.find(
        {
          $or: [{ email: regex }, { name: regex }],
        },
        { _id: 1 }
      ).lean();
      if (users.length > 0) {
        orConditions.push({
          usedBy: { $in: users.map((u) => u._id) },
        });
      }

      // Tìm theo group name
      const groups: any = await ActiveCodeGroup.find(
        { name: regex },
        { _id: 1 }
      ).lean();
      if (groups.length > 0) {
        orConditions.push({
          groupId: { $in: groups.map((g: any) => g._id) },
        });
      }

      if (isObjectId) {
        orConditions.push({ usedBy: new mongoose.Types.ObjectId(search) });
      }

      filter.$or = orConditions;
    }

    /* --------------------------------------------
     * 🧩 FILTERS
     * -------------------------------------------- */
    if (isUsed === "true") filter.isUsed = true;
    else if (isUsed === "false") filter.isUsed = false;
    if (groupId) filter.groupId = groupId;

    /* --------------------------------------------
     * 📦 QUERY MAIN DATA
     * -------------------------------------------- */
    const totalItems = await ActiveCode.countDocuments(filter);

    const codes = await ActiveCode.find(filter)
      .sort({ usedAt: -1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate("groupId", "name description") // ✅ Lấy thông tin group
      .lean();

    /* --------------------------------------------
     * 👤 FETCH USERS MAP
     * -------------------------------------------- */
    const usedUserIds = codes
      .filter((c: any) => c.usedBy)
      .map((c: any) => c.usedBy.toString());

    let userMap: any = {};
    if (usedUserIds.length > 0) {
      const users = await User.find(
        { _id: { $in: usedUserIds } },
        { name: 1, email: 1 }
      ).lean();
      userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));
    }

    /* --------------------------------------------
     * 🧾 FORMAT OUTPUT
     * -------------------------------------------- */
    const formatted = codes.map((c: any) => ({
      code: c.code,
      plan: c.plan,
      days: c.days,
      isUsed: c.isUsed,
      usedBy: c.usedBy,
      usedName: c.usedBy ? userMap[c.usedBy.toString()]?.name ?? null : null,
      usedEmail: c.usedBy ? userMap[c.usedBy.toString()]?.email ?? null : null,
      usedAt: c.usedAt,
      createdAt: c.createdAt,
      group: c.groupId
        ? {
            _id: c.groupId._id,
            name: c.groupId.name,
            description: c.groupId.description,
          }
        : null,
    }));

    /* --------------------------------------------
     * 📊 GLOBAL COUNTS
     * -------------------------------------------- */
    const usedCount = await ActiveCode.countDocuments({ isUsed: true });
    const unusedCount = await ActiveCode.countDocuments({ isUsed: false });

    res.json({
      success: true,
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      usedCount,
      unusedCount,
      data: formatted,
    });
  } catch (err: any) {
    console.error("❌ [GET /plan/active-codes]", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      details: err.message,
    });
  }
});
/**
 * @swagger
 * /plan/generate-codes:
 *   post:
 *     summary: Sinh hàng loạt mã kích hoạt (Admin)
 *     description: API dùng để sinh ra danh sách mã kích hoạt mới cho các gói Free / VIP. Mỗi mã là duy nhất và có thời hạn theo loại gói.
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plan
 *               - count
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [free, vip1, vip2, vip3]
 *                 example: vip1
 *               count:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 500
 *                 example: 50
 *     responses:
 *       200:
 *         description: Trả về danh sách mã đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 createdCount:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                       plan:
 *                         type: string
 *                       days:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 */
router.post("/generate-codes", async (req: any, res) => {
  try {
    const { plan, count, groupId } = req.body;

    if (!plan)
      return res
        .status(400)
        .json({ success: false, message: "❌ Thiếu tên gói (plan)" });

    const planDoc = await Plan.findOne({ key: plan });
    if (!planDoc)
      return res.status(400).json({
        success: false,
        message: `❌ Gói '${plan}' không tồn tại trong hệ thống.`,
      });

    const total = Math.min(Number(count) || 0, 500);
    if (total <= 0)
      return res.status(400).json({
        success: false,
        message: "⚠️ Số lượng mã tạo phải lớn hơn 0.",
      });

    const days = planDoc.expire || 1;

    // 🧩 Kiểm tra group nếu có
    let group = null;
    if (groupId) {
      group = await ActiveCodeGroup.findById(groupId);
      if (!group)
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy nhóm (groupId).",
        });
    }

    // 🔢 Hàm random code an toàn
    const generateCode = (prefix: string) => {
      const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let randomPart = "";
      for (let i = 0; i < 8; i++) {
        randomPart += charset[Math.floor(Math.random() * charset.length)];
      }
      return `${prefix}-${randomPart}`;
    };

    // 🏗️ Sinh code mới
    const codesToInsert: any[] = [];
    const codeSet = new Set<string>();
    for (let i = 0; i < total; i++) {
      let code: string;
      do {
        code = generateCode(planDoc.key.toUpperCase());
      } while (codeSet.has(code));
      codeSet.add(code);

      codesToInsert.push({
        code,
        plan: planDoc.key,
        days,
        groupId: group?._id || null,
        isUsed: false,
        createdAt: new Date(),
      });
    }

    // 💾 Lưu
    const result = await ActiveCode.insertMany(codesToInsert);

    // 📊 Cập nhật group nếu có
    if (group) {
      await ActiveCodeGroup.findByIdAndUpdate(group._id, {
        $inc: { totalCodes: result.length },
      });
    }

    console.log(
      `✅ [GenerateCodes] Created ${result.length} codes for ${planDoc.key}${
        group ? ` in group ${group.name}` : ""
      }`
    );

    res.json({
      success: true,
      createdCount: result.length,
      plan: planDoc.key,
      days,
      groupId: group?._id || null,
      data: result.map((r: any) => ({
        code: r.code,
        plan: r.plan,
        days: r.days,
        groupId: r.groupId,
        createdAt: r.createdAt,
      })),
    });
  } catch (err: any) {
    console.error("❌ [POST /plan/generate-codes]", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo mã kích hoạt.",
      details: err.message,
    });
  }
});

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Quản lý các gói VIP (Plans)
 */

/**
 * @swagger
 * /plan/create:
 *   post:
 *     summary: Tạo mới một gói VIP
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 example: plan4
 *               title:
 *                 type: string
 *                 example: VIP 4
 *               price:
 *                 type: string
 *                 example: 999,000 VND
 *               badge:
 *                 type: string
 *                 example: Hot
 *               expire:
 *                 type: number
 *                 example: 30
 *               maxPrompt:
 *                 type: number
 *                 example: 299
 *               maxDuration:
 *                 type: number
 *                 example: 8
 *               videoPerMinute:
 *                 type: number
 *                 example: 9
 *     responses:
 *       200:
 *         description: Gói được tạo thành công
 */
router.post("/create", async (req, res) => {
  try {
    const existing = await Plan.findOne({ key: req.body.key });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Mã gói đã tồn tại" });
    }

    const plan = await Plan.create(req.body);
    res.json({ success: true, plan });
  } catch (err: any) {
    console.error("❌ [POST /plan/create]", err);
    res.status(500).json({
      success: false,
      message: "Không thể tạo gói mới",
      error: err.message,
    });
  }
});

/**
 * @swagger
 * /plan/delete/{id}:
 *   delete:
 *     summary: Xóa gói VIP
 *     tags: [Admin]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của gói
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy gói
 */
router.delete("/delete/:id", async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);

    if (!plan)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy gói" });

    res.json({
      success: true,
      message: `Đã xoá gói '${plan.title}' thành công.`,
    });
  } catch (err: any) {
    console.error("❌ [DELETE /plan/delete/:id]", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xoá gói",
      error: err.message,
    });
  }
});

/**
 * @swagger
 * /plan/activate:
 *   post:
 *     summary: Kích hoạt gói người dùng bằng mã code
 *     tags:
 *       - Plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: ABC123
 *                 description: Mã kích hoạt gói
 *     responses:
 *       200:
 *         description: Kích hoạt thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: ✅ Kích hoạt thành công!
 *                 plan:
 *                   type: string
 *                   example: plan1
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-12-01T00:00:00.000Z
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ hoặc hết slot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Code không hợp lệ hoặc đã được sử dụng.
 *       500:
 *         description: Lỗi hệ thống
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Lỗi hệ thống.
 */
router.post("/activate", authenticate, async (req: any, res) => {
  try {
    const inputCode = (req.body.code || "").trim().toUpperCase();
    const userId = req.user.userId;

    if (!inputCode) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập mã code.",
      });
    }

    /* ===================================================================
        1. Nếu code dạng "COUPON-XXXXX" → xử lý coupon
    ====================================================================== */
    if (inputCode.startsWith("COUPON-")) {
      const couponCode = inputCode;

      const coupon = await Coupon.findOne({ code: couponCode });

      if (!coupon)
        return res
          .status(400)
          .json({ success: false, message: "Coupon không tồn tại." });

      if (coupon.expireAt < new Date())
        return res
          .status(400)
          .json({ success: false, message: "Coupon đã hết hạn." });

      if (coupon.isUsed)
        return res
          .status(400)
          .json({ success: false, message: "Coupon đã được sử dụng." });

      // Mark as used
      coupon.isUsed = true;
      coupon.usedBy = userId;
      coupon.usedAt = new Date();
      await coupon.save();

      // Update user maxVideo
      const user: any = await User.findById(userId);
      user.maxVideo += coupon.videoAmount;
      await user.save();

      return res.json({
        success: true,
        type: "coupon",
        message: "🎉 Sử dụng coupon thành công!",
        addedVideo: coupon.videoAmount,
        newMaxVideo: user.maxVideo,
      });
    }

    /* ===================================================================
        2. Xử lý mã kích hoạt gói (ActiveCode truyền thống)
    ====================================================================== */

    const code = await ActiveCode.findOne({ code: inputCode });
    if (!code || code.isUsed) {
      return res.status(400).json({
        success: false,
        message: "Code không hợp lệ hoặc đã được sử dụng.",
      });
    }

    const plan = code.plan;
    const days = code.days || 30;

    // Xác định loại token cần lấy
    const isVipPlan = [
      "plan1",
      "plan2",
      "plan3",
      "pro",
      "vip",
      "trial",
    ].includes(plan);
    const typeToFind = isVipPlan ? "vip" : "free";

    // Lock slot trong GoogleToken
    const availableToken = await GoogleToken.findOneAndUpdate(
      {
        type: typeToFind,
        isActive: true,
        $expr: { $lt: ["$assigned", "$slot"] },
      },
      {
        $inc: { assigned: 1 },
        $addToSet: { userIds: new mongoose.Types.ObjectId(userId) },
      },
      { new: true }
    );

    if (!availableToken) {
      return res.status(400).json({
        success: false,
        message: "❌ Không còn token khả dụng cho gói này.",
      });
    }

    // ⏳ Tính ngày hết hạn
    const planExpiresAt = moment().add(days, "days").toDate();

    // Lấy config maxVideo theo plan
    const planConfig = MAX_VIDEO_PLAN[plan];

    // Build object update
    const updateData: any = {
      plan: plan,
      planExpiresAt,
      googleId: availableToken._id,
    };

    // Nếu có config maxVideo thì update
    if (planConfig?.maxVideo) {
      updateData.maxVideo = planConfig.maxVideo;
    }

    // Update user
    await User.findByIdAndUpdate(userId, updateData);

    // ✅ Đánh dấu code đã dùng
    await ActiveCode.findByIdAndUpdate(code._id, {
      isUsed: true,
      usedBy: userId,
      usedAt: new Date(),
    });

    // 💰 Ghi log giao dịch
    const planDoc = await Plan.findOne({ key: code.plan });
    const price = planDoc?.price ? parseFloat(planDoc.price) * 1000 : 0;

    await BankTransaction.create([
      {
        transactionId: `CODE-${code.code}`,
        transactionNum: `ACT-${Date.now()}`,
        type: "active_code",
        amount: price,
        description: `Kích hoạt bằng mã ${
          code.code
        } (${code.plan.toUpperCase()}, ${code.days} ngày)`,
        date: new Date(),
        bank: "ActiveCode",
        accountNumber: userId,
        userId,
        raw: {
          code: code.code,
          plan: code.plan,
          days: code.days,
          usedBy: userId,
        },
      },
    ]);
    return res.json({
      success: true,
      type: "plan",
      message: "✅ Kích hoạt plan thành công!",
      plan,
      expiresAt: planExpiresAt,
      assignedToken: {
        id: availableToken._id,
        email: availableToken.email,
        type: availableToken.type,
        assigned: availableToken.assigned,
        slot: availableToken.slot,
      },
    });
  } catch (err) {
    console.error("❌ [POST /plan/activate]", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống.",
    });
  }
});

/**
 * @swagger
 * /plan/create-group:
 *   post:
 *     summary: Tạo mới một nhóm mã kích hoạt (Active Code Group)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - plan
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Chiến dịch Tết 2025"
 *               description:
 *                 type: string
 *                 example: "Mã dành cho khách VIP tháng 2"
 *     responses:
 *       200:
 *         description: Nhóm được tạo thành công
 */
router.post("/create-group", async (req: any, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user?.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tên nhóm hoặc gói plan.",
      });
    }

    const group = await ActiveCodeGroup.create({
      name,
      description,
      createdBy: userId,
    });

    res.json({
      success: true,
      message: "Tạo nhóm thành công!",
      group,
    });
  } catch (err: any) {
    console.error("❌ [POST /plan/create-group]", err);
    res.status(500).json({
      success: false,
      message: "Không thể tạo nhóm.",
      error: err.message,
    });
  }
});
/**
 * @swagger
 * /plan/groups:
 *   get:
 *     summary: Lấy danh sách nhóm mã kích hoạt (Active Code Groups)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "Tết"
 *         description: Tìm theo tên nhóm
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           example: 20
 *     responses:
 *       200:
 *         description: Danh sách nhóm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 groups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "672b91331fbc3f4ef3ff772a"
 *                       name:
 *                         type: string
 *                         example: "Chiến dịch Tết 2025"
 */
router.get("/groups", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 50;
    const search: any = req.query.search;

    const filter: any = {};
    if (search) filter.name = new RegExp(search, "i");

    const totalItems = await ActiveCodeGroup.countDocuments(filter);

    const groups = await ActiveCodeGroup.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    res.json({
      success: true,
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      groups,
    });
  } catch (err: any) {
    console.error("❌ [GET /plan/groups]", err);
    res.status(500).json({
      success: false,
      message: "Không thể tải danh sách nhóm.",
      error: err.message,
    });
  }
});
export default router;
