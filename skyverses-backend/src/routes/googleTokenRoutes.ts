import express, { Request, Response } from "express";
import { authenticate } from "./auth";
import { fetchSessionFromCookie } from "../utils/fetchSessionFromCookie";

import GoogleToken, {
  IGoogleToken,
  GoogleTokenDoc,
} from "../models/GoogleTokenModel";
import { hasAccess, getRoleBasedFilters } from "../utils/roleHelpers";
import UserModel from "../models/UserModel";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Quản lý Google Token cho Google Labs / AI Video
 */
/**
 * @swagger
 * /google-tokens:
 *   get:
 *     summary: Lấy danh sách Google Tokens (có phân trang, search, filter)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Trang hiện tại (mặc định 1)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Số item mỗi trang (mặc định 20)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm theo email (contains)
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Lọc token đang active hay không
 *       - in: query
 *         name: slotStatus
 *         schema:
 *           type: string
 *           enum: [available, full]
 *         description: Lọc token còn slot trống (available) hoặc đã đầy slot (full)
 *     responses:
 *       200:
 *         description: Trả về danh sách Google tokens kèm phân trang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                 totalItems:
 *                   type: number
 *                 totalPages:
 *                   type: number
 *                 page:
 *                   type: number
 *                 pageSize:
 *                   type: number
 */
router.get("/", authenticate, async (req: any, res: Response) => {
  try {
    let {
      page = 1,
      pageSize = 20,
      search = "",
      isActive,
      slotStatus,
      sortBy = "updatedAt", // type | slot | credits | updatedAt
      sortDir = "desc", // asc | desc
    } = req.query as any;

    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    const sortDirNum = sortDir === "desc" ? -1 : 1;

    const { role } = req.user;
    if (!hasAccess(role))
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền" });

    /* -------------------- 🔹 Match -------------------- */
    const match: any = {};
    if (search) match.email = { $regex: search, $options: "i" };
    if (isActive === "true") match.isActive = true;
    if (isActive === "false") match.isActive = false;

    // ✅ Lọc theo trạng thái slot
    if (slotStatus === "available") {
      match.$expr = { $lt: ["$assigned", "$slot"] };
    } else if (slotStatus === "full") {
      match.$expr = { $gte: ["$assigned", "$slot"] };
    }

    /* -------------------- 🔹 Pipeline -------------------- */
    const aggregatePipeline: any[] = [
      { $match: match },
      {
        $addFields: {
          typeOrder: { $cond: [{ $eq: ["$type", "vip"] }, 1, 2] },
        },
      },
    ];

    // ✅ Sort linh hoạt (bao gồm credits)
    if (sortBy === "type") {
      aggregatePipeline.push({ $sort: { typeOrder: 1, updatedAt: -1 } });
    } else if (sortBy === "slot") {
      aggregatePipeline.push({ $sort: { slot: sortDirNum, updatedAt: -1 } });
    } else if (sortBy === "credits") {
      aggregatePipeline.push({ $sort: { credits: sortDirNum, updatedAt: -1 } });
    } else {
      aggregatePipeline.push({ $sort: { updatedAt: sortDirNum } });
    }

    aggregatePipeline.push({ $skip: skip });
    aggregatePipeline.push({ $limit: pageSize });

    // ✅ Lookup sang User (giữ ObjectId an toàn)
    aggregatePipeline.push({
      $lookup: {
        from: "users",
        localField: "userIds",
        foreignField: "_id",
        as: "users",
      },
    });

    /* -------------------- 🔹 Query song song -------------------- */
    const [tokens, totalItems] = await Promise.all([
      GoogleToken.aggregate(aggregatePipeline),
      GoogleToken.countDocuments(match),
    ]);

    /* -------------------- 🔹 Response chuẩn -------------------- */
    return res.json({
      success: true,
      data: tokens,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error("❌ GET /google-tokens:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi server khi lấy danh sách token.",
    });
  }
});
/**
 * @swagger
 * /google-tokens/{id}:
 *   put:
 *     summary: Cập nhật token Google theo ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của Google token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessToken:
 *                 type: string
 *                 example: ya29.a0ATi6K2...
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               note:
 *                 type: string
 *                 example: Token mới ngày 2025-11-01
 *     responses:
 *       200:
 *         description: Cập nhật token thành công
 *       404:
 *         description: Không tìm thấy token
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Các field cho phép cập nhật
    const allowFields = [
      "accessToken",
      "isActive",
      "note",
      "type",
      "slot",
      "assigned",
      "userIds",
    ];

    const $set: Partial<any> = {};

    for (const key of allowFields) {
      if (typeof req.body[key] !== "undefined") {
        $set[key] = req.body[key];
      }
    }

    if (Object.keys($set).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có dữ liệu hợp lệ để cập nhật.",
      });
    }

    const updated = await GoogleToken.findByIdAndUpdate(
      id,
      { $set },
      { new: true }
    ).lean<IGoogleToken | null>();

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy token.",
      });
    }

    res.json({
      success: true,
      message: "✅ Cập nhật  thành công",
      token: updated,
    });
  } catch (error) {
    console.error("❌ PUT /google-tokens/:id:", error);
    res.status(500).json({ error: "Lỗi server khi cập nhật token." });
  }
});

/**
 * @swagger
 * /google-tokens:
 *   post:
 *     summary: Thêm mới Google Token
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, accessToken, note]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: "optional"
 *               accessToken:
 *                 type: string
 *                 example: ya29.a0AT...
 *               note:
 *                 type: string
 *                 example: Token cho tài khoản #1
 *     responses:
 *       201:
 *         description: Tạo token thành công
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { email, password, accessToken, note } =
      req.body as Partial<IGoogleToken>;
    if (!email || !accessToken || !note) {
      return res
        .status(400)
        .json({ error: "Thiếu dữ liệu bắt buộc (email, accessToken, note)." });
    }

    const newToken = await GoogleToken.create({
      email,
      password,
      accessToken,
      note,
    });

    res.status(201).json({ success: true, token: newToken });
  } catch (error) {
    console.error("❌ POST /google-tokens:", error);
    res.status(500).json({ error: "Lỗi server khi thêm mới token." });
  }
});

/**
 * @swagger
 * /google-tokens/delete-mutil:
 *   delete:
 *     summary: Xóa nhiều Google Token
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["6755e20df8dc6c1a12345678", "6755e20df8dc6c1a98765432"]
 *     responses:
 *       200:
 *         description: Xóa token thành công
 *       400:
 *         description: Danh sách ID không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.delete("/delete-mutil", async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Danh sách 'ids' không hợp lệ." });
    }

    const result = await GoogleToken.deleteMany({
      _id: { $in: ids },
    });

    return res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `🗑️ Đã xóa ${result.deletedCount} token.`,
    });
  } catch (error) {
    console.error("❌ DELETE /google-tokens/delete-mutil:", error);
    res.status(500).json({ error: "Lỗi server khi xóa nhiều token." });
  }
});

/**
 * @swagger
 * /google-tokens/my-token:
 *   get:
 *     summary: Lấy token Google thuộc về user đang đăng nhập
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về Google Token của owner
 */
router.get("/my-token", authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: missing userId",
      });
    }

    // ⭐ Tìm token có ownerId = userId
    const token = await GoogleToken.findOne({ ownerId: userId }).lean();

    return res.json(token || null);
  } catch (err: any) {
    console.error("❌ GET /google-tokens/my-token:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy token của user",
    });
  }
});

/**
 * @swagger
 * /google-tokens/{id}:
 *   delete:
 *     summary: Xóa Google Token
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: ID của Google Token cần xóa
 *     responses:
 *       200:
 *         description: Xóa token thành công
 *       404:
 *         description: Không tìm thấy token
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await GoogleToken.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ error: "Không tìm thấy token." });

    res.json({ success: true, message: "🗑️ Đã xóa token thành công" });
  } catch (error) {
    console.error("❌ DELETE /google-tokens/:id:", error);
    res.status(500).json({ error: "Lỗi server khi xóa token." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const token = await GoogleToken.findById(req.params.id).lean();
    if (!token) return res.status(404).json(null);
    res.json(token);
  } catch (error) {
    console.error("❌ GET /google-tokens/:id:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

/**
 * @swagger
 * /google-tokens/reassign-user:
 *   post:
 *     summary: Chuyển user sang token khác
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, newTokenId]
 *             properties:
 *               userId:
 *                 type: string
 *               newTokenId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đổi token cho user thành công
 */
router.post("/reassign-user", authenticate, async (req: any, res: Response) => {
  try {
    const { userId, newTokenId } = req.body;

    if (!userId || !newTokenId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu userId hoặc newTokenId",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User không tồn tại" });
    }

    const newToken = await GoogleToken.findById(newTokenId);
    if (!newToken) {
      return res
        .status(404)
        .json({ success: false, message: "Token mới không tồn tại" });
    }

    // Tìm token cũ
    let oldToken = null;
    if (user.googleId) {
      oldToken = await GoogleToken.findById(user.googleId);
    }

    /* -----------------------------------------
     * 1️⃣ XÓA USER KHỎI TOKEN CŨ (NẾU CÓ)
     * ----------------------------------------- */
    if (oldToken) {
      await GoogleToken.findByIdAndUpdate(oldToken._id, {
        $pull: { userIds: user._id },
        $inc: { assigned: -1 },
      });
    }

    /* -----------------------------------------
     * 2️⃣ THÊM USER VÀO TOKEN MỚI
     * ----------------------------------------- */
    await GoogleToken.findByIdAndUpdate(newTokenId, {
      $addToSet: { userIds: user._id },
      $inc: { assigned: 1 },
    });

    /* -----------------------------------------
     * 3️⃣ CẬP NHẬT LẠI USER → trỏ sang token mới
     * ----------------------------------------- */
    user.googleId = newTokenId;
    await user.save();

    return res.json({
      success: true,
      message: "Đã chuyển user sang token mới",
    });
  } catch (error: any) {
    console.error("❌ POST /google-tokens/reassign-user:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi đổi token",
      error: error.message,
    });
  }
});
router.post("/assign-owner-by-cookie", authenticate, async (req: any, res) => {
  try {
    const { cookieToken } = req.body;
    const userId = req.user.userId;

    if (!cookieToken) {
      return res.status(400).json({ message: "Missing cookieToken" });
    }

    const fullCookie = `__Secure-next-auth.session-token=${cookieToken}`;

    // ⭐ Fetch session từ Google Labs
    const session = await fetchSessionFromCookie(fullCookie);
    if (!session?.email) {
      return res.status(400).json({
        success: false,
        message: "Không thể đọc email từ cookie Labs. Cookie không hợp lệ!",
      });
    }

    // ⭐ Lấy user
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User không tồn tại" });
    }

    /* ---------------------------------------------------------
     * CHECK PLAN ACTIVE
     * ------------------------------------------------------ */
    let userPlanIsActive = true;

    if (!user.plan || !user.planExpiresAt) {
      userPlanIsActive = false;
    } else {
      const now = Date.now();
      const expireTime = new Date(user.planExpiresAt).getTime();
      userPlanIsActive = expireTime > now;
    }

    const finalIsActive =
      session.isActive === true && userPlanIsActive === true;

    /* ---------------------------------------------------------
     * UPSERT TOKEN MỚI THEO EMAIL
     * ------------------------------------------------------ */
    let newToken = await GoogleToken.findOneAndUpdate(
      { email: session.email },
      {
        ownerId: userId,
        accessToken: session.accessToken,
        cookieToken: fullCookie,
        expires: session.expires,
        credits: session.credits,
        isActive: finalIsActive,
        codeError: session.error ?? "",
        updatedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    /* ---------------------------------------------------------
     * ⭐ REMOVE userId + ownerId khỏi mọi token cũ (trừ token mới)
     * ------------------------------------------------------ */
    await GoogleToken.updateMany(
      {
        _id: { $ne: newToken._id }, // tất cả token trừ token mới
        $or: [{ userIds: userId }, { ownerId: userId }],
      },
      {
        $pull: { userIds: userId },
        $set: { ownerId: null },
        $inc: { assigned: -1, slot: -1 },
      }
    );

    /* ---------------------------------------------------------
     * ⭐ ADD userId vào token mới nếu chưa có
     * ------------------------------------------------------ */
    const alreadyAssigned = newToken.userIds?.some(
      (id) => id.toString() === userId.toString()
    );

    if (!alreadyAssigned) {
      newToken = await GoogleToken.findByIdAndUpdate(
        newToken._id,
        {
          $addToSet: { userIds: userId },
          $inc: { assigned: 1, slot: 1 },
        },
        { new: true }
      );
    }

    /* ---------------------------------------------------------
     * ⭐ GÁN TOKEN MỚI CHO USER + LƯU fxlabAccessToken
     * ------------------------------------------------------ */
    await UserModel.findByIdAndUpdate(
      userId,
      {
        googleId: newToken._id,
        fxlabAccessToken: session.accessToken, // ⭐ NEW
        fxlabAccessTokenExpires: session.expires,
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Token assigned successfully, cleaned up old tokens",
      token: newToken,
      fxlabAccessToken: session.accessToken, // ⭐ tiện FE cach
      fxlabAccessTokenExpires: session.expires, // ⭐ NEW
    });
  } catch (err: any) {
    console.error("❌ assign-owner-by-cookie error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Error fetching token session",
    });
  }
});

export default router;
