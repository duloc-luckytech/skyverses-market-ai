import express from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel";
import {isSameDay} from '../utils/isSameDay'

import dotenv from "dotenv";
import Plan from "../models/PlanModel";

dotenv.config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "11-aaa-gaxw";

/**
 * @swagger
 * /auth/google-register:
 *   post:
 *     summary: Đăng ký hoặc đăng nhập bằng tài khoản Google
 *     description: Nếu user chưa tồn tại thì tự động tạo mới. Nếu có rồi thì trả về token đăng nhập.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 example: demo@gmail.com
 *               name:
 *                 type: string
 *                 example: Demo User
 *               picture:
 *                 type: string
 *                 example: https://example.com/avatar.png
 *               inviteCode:
 *                 type: string
 *                 example: abc123
 *     responses:
 *       200:
 *         description: JWT token trả về sau khi đăng nhập hoặc đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

function generateInviteCode(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

router.post("/google-register", async (req, res) => {
  try {
    const { email, name, picture, inviteCode: inputInviteCode } = req.body;

    console.log('picture.>',picture)
    if (!email || !name) {
      return res.status(400).json({ message: "⚠️ Missing email or name" });
    }

    // 🔍 Kiểm tra user đã tồn tại
    let user = await UserModel.findOne({ email });

    if (!user) {
      // 🔍 Nếu có mã mời → tìm người mời
      let inviter = null;
      if (inputInviteCode) {
        inviter = await UserModel.findOne({ inviteCode: inputInviteCode });
      }

      // 🔁 Gen mã mời duy nhất
      let newInviteCode = "";
      while (true) {
        newInviteCode = generateInviteCode();
        const existing = await UserModel.findOne({ inviteCode: newInviteCode });
        if (!existing) break;
      }

      // ✅ Tạo user mới — tự động tặng 1000 welcome credit + 100 free images
      user = await UserModel.create({
        email,
        name,
        avatar: picture,
        videoCount: 0,
        inviteCode: newInviteCode,
        inviteFrom: inviter?._id || null,
        role: "user",
        creditBalance: 1000, // ⭐ Welcome credit tự động
        claimWelcomeCredit: true, // ⭐ Đánh dấu đã nhận
        freeImageRemaining: 100, // ⭐ Fix cứng 100 hình miễn phí
      });

      // 📝 Ghi log transaction welcome credit
      try {
        const CreditTransaction = (await import("../models/CreditTransaction.model")).default;
        await CreditTransaction.create({
          userId: user._id,
          type: "WELCOME",
          amount: 1000,
          balanceAfter: 1000,
          source: "system",
          note: "Auto welcome credit on registration",
        });
        console.log(`🎁 [AUTH] New user ${email} → +1000 welcome credits`);
      } catch (txErr) {
        console.error("⚠️ [AUTH] Failed to log welcome credit transaction:", txErr);
      }

      // 🌍 Global Event April 2026 — 50 free images bonus
      const EVENT_END = new Date("2026-04-30T23:59:59+07:00");
      if (new Date() <= EVENT_END) {
        const EVENT_BONUS_FREE_IMAGES = 50;
        try {
          const CreditTransaction = (await import("../models/CreditTransaction.model")).default;
          user.freeImageRemaining = (user.freeImageRemaining || 0) + EVENT_BONUS_FREE_IMAGES;
          user.globalEventBonus2026 = true;
          await user.save();

          await CreditTransaction.create({
            userId: user._id,
            type: "EVENT_BONUS",
            amount: 0,
            balanceAfter: user.creditBalance,
            source: "system",
            note: `🌍 Global Event April 2026 — +${EVENT_BONUS_FREE_IMAGES} ảnh miễn phí`,
            meta: { event: "global_2026_april", freeImages: EVENT_BONUS_FREE_IMAGES },
          });
          console.log(`🌍 [AUTH] Global Event 2026: ${email} → +${EVENT_BONUS_FREE_IMAGES} free images (freeImageRemaining: ${user.freeImageRemaining})`);
        } catch (evtErr) {
          console.error("⚠️ [AUTH] Failed to grant event bonus:", evtErr);
        }
      }
    }

    // 🔐 Tạo JWT token có role
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role || "user", // 👈 thêm role
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        inviteCode: user.inviteCode,
      },
    });
  } catch (err) {
    console.error("❌ [Google Register]", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/* -----------------------------------------
 * 🔐 Middleware xác thực JWT token
 * ----------------------------------------- */
export const authenticate = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    const now = Date.now();
    if (
      !req.cookies?.lastActive ||
      now - req.cookies.lastActive > 5 * 60 * 1000
    ) {
      UserModel.updateOne(
        { _id: decoded.userId },
        { $set: { lastActiveAt: new Date() } }
      ).catch(() => {});
      res.cookie("lastActive", now.toString(), { httpOnly: true });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * @swagger
 * /user/info:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     description: Yêu cầu gửi kèm Bearer Token trong header Authorization
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về thông tin người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 66a2bff4b32d19d22b89f771
 *                     email:
 *                       type: string
 *                       example: demo@gmail.com
 *                     name:
 *                       type: string
 *                       example: Demo User
 *                     avatar:
 *                       type: string
 *                       example: https://example.com/avatar.png
 *                     plan:
 *                       type: string
 *                       example: starter
 *                     planExpiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-12-31T00:00:00.000Z
 *       401:
 *         description: Token không hợp lệ hoặc thiếu Authorization header
 *       404:
 *         description: Không tìm thấy user
 */
router.get("/user/info", authenticate, async (req: any, res) => {
  try {
    const user = await UserModel.findById(req.user.userId).lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const lastDailyClaimAt = user?.lastDailyClaimAt || null;

    const canDailyClaim =
      !lastDailyClaimAt ||
      !isSameDay(new Date(lastDailyClaimAt), new Date());

    res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        inviteCode: user.inviteCode,
        inviteFrom: user.inviteFrom,

        creditBalance: user.creditBalance,
        claimWelcomeCredit: user.claimWelcomeCredit || false,
        freeImageRemaining: user.freeImageRemaining || 0,

        // 👇 PLAN INFO
        plan: user.plan || null,
        planExpiresAt: user.planExpiresAt || null,

        // 👇 DAILY CLAIM INFO
        lastDailyClaimAt,
        canDailyClaim,

        // 👇 OPTIONAL: onboarding để FE suggest
        onboarding: user.onboarding || null,
      },
    });
  } catch (err) {
    console.error("❌ [GET /user/info]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     summary: Đăng nhập quản trị viên
 *     tags: [Admin]
 *     description: Xác thực tài khoản admin (username/password = admin/admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin
 *     responses:
 *       200:
 *         description: Trả về token admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *       401:
 *         description: Sai thông tin đăng nhập
 */
router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin đăng nhập" });
  }

  try {
    const email = username.includes("@") ? username : `${username}@skyverses.com`;
    const user: any = await UserModel.findOne({ email, role: "admin" });

    if (!user) {
      return res.status(401).json({ success: false, message: "Tài khoản admin không tồn tại" });
    }

    if (!user.password) {
      return res.status(401).json({ success: false, message: "Tài khoản chưa có mật khẩu" });
    }

    const crypto = require("crypto");
    const [prefix, salt, storedHash] = user.password.split(":");

    if (prefix !== "scrypt" || !salt || !storedHash) {
      return res.status(401).json({ success: false, message: "Định dạng mật khẩu không hợp lệ" });
    }

    const testHash = crypto.scryptSync(password, salt, 64).toString("hex");
    if (testHash !== storedHash) {
      return res.status(401).json({ success: false, message: "Sai mật khẩu" });
    }

    // ✅ Create JWT with userId (compatible with refreshUserInfo)
    const token = jwt.sign(
      { userId: user._id.toString(), role: "admin", email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      message: "🎉 Đăng nhập admin thành công",
    });
  } catch (err: any) {
    console.error("Admin login error:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

export default router;
