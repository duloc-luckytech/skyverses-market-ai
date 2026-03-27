import express from "express";
import UserModel from "../models/UserModel";
import mongoose from "mongoose";
import { authenticate } from "./auth";
import GoogleToken from "../models/GoogleTokenModel";

import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

/**
 * @swagger
 * /user/list-u:
 *   get:
 *     summary: Lấy danh sách tất cả người dùng (Admin)
 *     tags: [Admin]
 *     description: Trả về danh sách toàn bộ người dùng (yêu cầu token admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       email:
 *                         type: string
 *                       name:
 *                         type: string
 *                       plan:
 *                         type: string
 *                       planExpiresAt:
 *                         type: string
 */

router.get("/list-u", async (req: any, res) => {
  try {
    const searchContent = req.query.searchContent ?? "";
    const page = isNaN(req.query.page) ? 1 : Number(req.query.page);
    const pageSize = isNaN(req.query.pageSize)
      ? 20
      : Number(req.query.pageSize);
    const skip = (page - 1) * pageSize;

    // ⬇️ Sort mặc định
    const sortBy = req.query.sortBy || "videoUsed";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // ⬇️ Lấy filter theo plan
    const filterPlan = req.query.plan || ""; // ví dụ: free, plan1, plan2...

    const regexSearch = new RegExp(searchContent, "i");
    const isObjectId = mongoose.Types.ObjectId.isValid(searchContent);

    const baseFilter: any = {};

    // 🔍 Search
    if (searchContent) {
      baseFilter.$or = [
        { email: regexSearch },
        { name: regexSearch },
        ...(isObjectId
          ? [{ _id: new mongoose.Types.ObjectId(searchContent) }]
          : []),
      ];
    }

    // 🎯 THÊM FILTER PLAN
    if (filterPlan) {
      baseFilter.plan = filterPlan;
    }

    const totalItems = await UserModel.countDocuments(baseFilter);

    const pipeline: any[] = [
      { $match: baseFilter },

      {
        $addFields: {
          quotaRatio: {
            $cond: [
              { $eq: ["$maxVideo", 0] },
              0,
              { $divide: ["$videoUsed", "$maxVideo"] },
            ],
          },
        },
      },

      {
        $sort: {
          [sortBy === "quota" ? "quotaRatio" : sortBy]: sortOrder,
        },
      },

      { $skip: skip },
      { $limit: pageSize },

      // ⭐ LOOKUP thêm google email
      {
        $lookup: {
          from: "googletokens", // tên collection
          localField: "googleId",
          foreignField: "_id",
          as: "googleInfo",
        },
      },
      { $unwind: { path: "$googleInfo", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          // ─── Basic Info ───
          email: 1,
          name: 1,
          firstName: 1,
          lastName: 1,
          avatar: 1,
          phone: 1,
          gender: 1,
          birthYear: 1,
          province: 1,

          // ─── Role & System ───
          role: 1,
          inviteCode: 1,
          inviteFrom: 1,
          googleId: 1,
          googleEmail: "$googleInfo.email",
          ownedTools: 1,
          claimWelcomeCredit: 1,
          lastDailyClaimAt: 1,

          // ─── Plan & Quota ───
          plan: 1,
          planExpiresAt: 1,
          videoUsed: 1,
          maxVideo: 1,
          videoCount: 1,

          // ─── Credits & Finance ───
          creditBalance: 1,
          affiliateTotal: 1,
          affiliatePending: 1,
          pendingShopPayment: 1,

          // ─── Career ───
          specialty: 1,
          experienceYears: 1,
          careerDescription: 1,

          // ─── Banking ───
          bankAccountName: 1,
          bankName: 1,
          bankNumber: 1,

          // ─── Onboarding ───
          onboarding: 1,

          // ─── Timestamps ───
          createdAt: 1,
          lastActiveAt: 1,
        },
      },
    ];

    const users = await UserModel.aggregate(pipeline);

    return res.status(200).json({
      data: users,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      page,
      pageSize,
      sortBy,
      sortOrder,
      plan: filterPlan, // trả lại để FE debug
    });
  } catch (error) {
    console.error("❌ [GET /user/list-u]", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
/**
 * @swagger
 * /user/statistic:
 *   get:
 *     summary: Lấy thống kê người dùng (tổng số, VIP, hết hạn)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Trả về thống kê tổng hợp người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 totalUser:
 *                   type: number
 *                 vipUsers:
 *                   type: number
 *                 expiredPlans:
 *                   type: number
 */
router.get("/statistic", async (_req, res) => {
  try {
    // =====================================================
    // ⭐ Tổng người dùng
    // =====================================================
    const totalUser = await UserModel.countDocuments();

    // =====================================================
    // ⭐ Users dùng trial
    // (Tuỳ bạn quy định plan trial là gì → chỉnh lại nếu khác)
    // =====================================================
    const trialUsers = await UserModel.countDocuments({
      plan: "trial",
    });

    // =====================================================
    // ⭐ VIP Users (bất kỳ gói nào không phải free / trial)
    // =====================================================
    const vipTotal = await UserModel.countDocuments({
      plan: { $nin: [null, "free", "trial"] },
    });

    // ⭐ VIP ACTIVE (còn hạn)
    const vipActive = await UserModel.countDocuments({
      plan: { $nin: [null, "free", "trial"] },
      planExpiresAt: { $gte: new Date() },
    });

    // ⭐ VIP EXPIRED
    const vipExpired = await UserModel.countDocuments({
      plan: { $nin: [null, "free", "trial"] },
      planExpiresAt: { $lt: new Date() },
    });

    // =====================================================
    // ⭐ Tổng số video đã tạo
    // =====================================================
    const agg = await UserModel.aggregate([
      {
        $group: {
          _id: null,
          totalVideoCount: { $sum: { $ifNull: ["$videoCount", 0] } },
        },
      },
    ]);
    const totalVideoCount = agg[0]?.totalVideoCount || 0;

    // =====================================================
    return res.json({
      success: true,
      totalUser,
      trialUsers, // ⭐ bạn cần thêm
      vipUsers: vipTotal,
      vipActive,
      vipExpired,
      totalVideoCount,
    });
  } catch (err) {
    console.error("❌ [GET /user/statistic]", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});
/**
 * @swagger
 * /user/update-google-id:
 *   post:
 *     summary: Cập nhật googleId cho user theo userId
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - googleId
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID của người dùng trong hệ thống
 *                 example: "652da06ff74c03c530cbf00a"
 *               googleId:
 *                 type: string
 *                 description: ID của tài khoản Google liên kết
 *                 example: "112345678901234567890"
 *     responses:
 *       200:
 *         description: Cập nhật googleId thành công
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
 *                   example: Đã cập nhật googleId thành công
 *       400:
 *         description: Thiếu thông tin đầu vào
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
 *                   example: Thiếu googleId
 *       500:
 *         description: Lỗi server
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
 *                   example: Lỗi server
 */
router.post("/update-google-id", async (req, res) => {
  try {
    const { googleId, userId } = req.body;

    if (!googleId || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu googleId hoặc userId" });
    }

    // 1️⃣ Cập nhật googleId cho User
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { googleId },
      { new: true }
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy user" });
    }

    // 2️⃣ Tìm GoogleToken tương ứng
    const token: any = await GoogleToken.findById(googleId);
    if (!token) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy GoogleToken" });
    }

    if (token.assigned >= token.slot) {
      return res.status(400).json({
        success: false,
        message: "Token này đã đạt giới hạn slot gán user",
      });
    }

    // 3️⃣ Nếu user chưa nằm trong danh sách userIds thì thêm vào và tăng assigned
    const alreadyAssigned = token.userIds.some(
      (uid: any) => uid.toString() === userId
    );

    if (!alreadyAssigned) {
      token.userIds.push(user._id);
      token.assigned = (token.assigned || 0) + 1;
    }

    await token.save();

    return res.json({
      success: true,
      message: "✅ Đã cập nhật googleId và gán token thành công",
      data: { user, token },
    });
  } catch (err) {
    console.error("❌ [POST /user/update-google-id]", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

/**
 * @swagger
 * /user/list-by-invite:
 *   get:
 *     summary: Lấy danh sách người dùng được mời bởi một user
 *     tags: [Admin]
 *     description: Trả về danh sách user có trường `inviteFrom` = userId truyền vào (yêu cầu token admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người đã mời (inviteFrom)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại (bắt đầu từ 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số lượng kết quả mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách user được mời bởi userId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       email:
 *                         type: string
 *                       name:
 *                         type: string
 *                       avatar:
 *                         type: string
 *                       plan:
 *                         type: string
 *                       planExpiresAt:
 *                         type: string
 *                       createdAt:
 *                         type: string
 */

router.get("/list-by-invite", async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "⚠️ Missing userId" });
    }

    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 20;
    const skip = (pageNumber - 1) * limitNumber;

    // 🔍 Tính tổng số user được mời
    const total = await UserModel.countDocuments({ inviteFrom: userId });

    // 📄 Lấy danh sách user theo trang
    const invitedUsers = await UserModel.find(
      { inviteFrom: userId },
      "_id email name avatar plan planExpiresAt videoCount videoUsed maxVideo createdAt googleId lastActiveAt"
    )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    return res.json({
      success: true,
      total,
      page: pageNumber,
      limit: limitNumber,
      users: invitedUsers,
    });
  } catch (err) {
    console.error("❌ [GET /user/list-by-invite]", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /user/become-agent:
 *   post:
 *     summary: Cập nhật loại tài khoản người dùng (trở thành đại lý / đối tác)
 *     tags: [User]
 *     description: Cho phép user chuyển đổi role thành "master" hoặc "sub"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - role
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "652da06ff74c03c530cbf00a"
 *               role:
 *                 type: string
 *                 enum: [master, sub]
 *                 example: "sub"
 *     responses:
 *       200:
 *         description: Cập nhật thành công role người dùng
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
 *                   example: Đã cập nhật loại tài khoản thành công
 *       400:
 *         description: Thiếu thông tin hoặc role không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.post("/become-agent", authenticate, async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: "Thiếu userId hoặc role",
      });
    }

    const allowedRoles = ["master", "sub"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role không hợp lệ. Chỉ chấp nhận 'master' hoặc 'sub'.",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    if (user.role === role) {
      return res.status(400).json({
        success: false,
        message: `User đã là ${role} rồi.`,
      });
    }

    user.role = role;
    await user.save();

    return res.json({
      success: true,
      message: `✅ Đã cập nhật loại tài khoản thành '${role}'.`,
    });
  } catch (err) {
    console.error("❌ [POST /user/become-agent]", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.put("/update-profile", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.userId; // lấy từ token authenticate

    // List các field được update
    const allowedFields = [
      "firstName",
      "lastName",
      "gender",
      "birthYear",
      "province",
      "phone",
      "specialty",
      "experienceYears",
      "careerDescription",
      "bankAccountName",
      "bankName",
      "bankNumber",
    ];

    const updates: any = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có dữ liệu nào để cập nhật",
      });
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select("-password");

    return res.json({
      success: true,
      message: "Cập nhật hồ sơ thành công!",
      user,
    });
  } catch (err) {
    console.error("❌ [PUT /user/update-profile]", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /user/update-plan-expire:
 *   post:
 *     summary: Admin cập nhật ngày hết hạn gói VIP (planExpiresAt) cho user
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
 *               - userId
 *               - planExpiresAt
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "652da06ff74c03c530cbf00a"
 *               planExpiresAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-12-31T23:59:59.000Z"
 *               plan:
 *                 type: string
 *                 example: "plan1"
 *     responses:
 *       200:
 *         description: Cập nhật thành công ngày hết hạn gói
 */
router.post("/update-plan-expire", authenticate, async (req: any, res) => {
  try {
    const { userId, planExpiresAt, plan } = req.body;

    if (!userId || !planExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "Thiếu userId hoặc planExpiresAt",
      });
    }

    // Validate date
    const parsedDate = new Date(planExpiresAt);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "planExpiresAt không hợp lệ",
      });
    }

    // Update fields
    const updateFields: any = { planExpiresAt: parsedDate };

    const updated = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    return res.json({
      success: true,
      message: "✅ Đã cập nhật planExpiresAt thành công",
      user: updated,
    });
  } catch (err) {
    console.error("❌ [POST /user/update-plan-expire]", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /user/update-gemini-api-key:
 *   put:
 *     summary: User cập nhật Gemini API Key
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - geminiApiKey
 *             properties:
 *               geminiApiKey:
 *                 type: string
 *                 example: "AIzaSyDxxxxxx"
 *     responses:
 *       200:
 *         description: Cập nhật Gemini API Key thành công
 *       400:
 *         description: Thiếu geminiApiKey
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Lỗi server
 */
router.put("/update-gemini-api-key", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.userId; // lấy từ token
    const { geminiApiKey } = req.body;

    if (!geminiApiKey) {
      return res.status(400).json({
        success: false,
        message: "Thiếu geminiApiKey",
      });
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { geminiApiKey } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    return res.json({
      success: true,
      message: "✅ Đã cập nhật Gemini API Key",
      user,
    });
  } catch (err) {
    console.error("❌ [PUT /user/update-gemini-api-key]", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});


router.post("/onboarding", authenticate, async (req: any, res) => {
  const {
    role,
    goals,
    workStyle,
    experienceLevel,
    complete = false,
  } = req.body;

  /* ================= VALID ENUMS ================= */
  const ROLE_ENUM = [
    "creative_director",
    "growth_marketer",
    "ai_architect",
    "studio_founder",
  ];

  const GOAL_ENUM = [
    "ai_image",
    "ai_video",
    "game_assets",
    "prompt_workflow",
    "full_pipeline",
  ];

  const WORKSTYLE_ENUM = ["solo", "small_team", "studio", "hybrid"];
  const EXPERIENCE_ENUM = [
    "beginner",
    "intermediate",
    "advanced",
    "expert",
  ];

  /* ================= VALIDATION ================= */
  if (role && !ROLE_ENUM.includes(role)) {
    return res.status(400).json({ message: "INVALID_ROLE" });
  }

  if (goals) {
    if (!Array.isArray(goals)) {
      return res.status(400).json({ message: "GOALS_MUST_BE_ARRAY" });
    }

    const invalidGoals = goals.filter((g) => !GOAL_ENUM.includes(g));
    if (invalidGoals.length) {
      return res.status(400).json({
        message: "INVALID_GOALS",
        invalidGoals,
      });
    }
  }

  if (workStyle && !WORKSTYLE_ENUM.includes(workStyle)) {
    return res.status(400).json({ message: "INVALID_WORK_STYLE" });
  }

  if (experienceLevel && !EXPERIENCE_ENUM.includes(experienceLevel)) {
    return res.status(400).json({ message: "INVALID_EXPERIENCE_LEVEL" });
  }

  /* ================= UPDATE ================= */
  const update: any = {};

  if (role !== undefined) update["onboarding.role"] = role;
  if (goals !== undefined) update["onboarding.goals"] = goals;
  if (workStyle !== undefined) update["onboarding.workStyle"] = workStyle;
  if (experienceLevel !== undefined)
    update["onboarding.experienceLevel"] = experienceLevel;

  if (complete === true) {
    update["onboarding.completedAt"] = new Date();
  }

  const user = await UserModel.findByIdAndUpdate(
    req.user.userId,
    { $set: update },
    { new: true }
  ).select("onboarding");

  if (!user) {
    return res.status(404).json({ message: "USER_NOT_FOUND" });
  }

  res.json({
    success: true,
    onboarding: user.onboarding,
  });
});
export default router;
