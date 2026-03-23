import express from "express";
import ProviderToken from "../models/ProviderToken.model";
import { authenticate } from "./auth";
import { fetchSessionFromCookie } from "../utils/fetchSessionFromCookie";

const router = express.Router();

/**
 * @swagger
 * /providerToken/update:
 *   post:
 *     summary: Add or update ProviderToken (UPSERT)
 *     description: |
 *       Thêm mới hoặc cập nhật ProviderToken theo provider + email (labs).
 *       - Nếu đã tồn tại → update accessToken / cookieToken
 *       - Nếu chưa có → tạo mới
 *
 *     tags:
 *       - ProviderToken
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [labs, wan]
 *                 example: labs
 *               accessToken:
 *                 type: string
 *                 description: Access token from Labs FX (optional)
 *                 example: ya29.a0AfH6SM...
 *
 *               cookieToken:
 *                 type: string
 *                 description: __Secure-next-auth.session-token value
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *     responses:
 *       200:
 *         description: ProviderToken upserted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 65f0d0c3a9b2a9e4c4c12345
 *                     provider:
 *                       type: string
 *                       example: labs
 *                     email:
 *                       type: string
 *                       example: user@gmail.com
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email is required for labs provider
 *
 *       500:
 *         description: Internal server error
 */
router.post("/update", async (req: any, res) => {
  try {
    const { provider = "labs", cookieToken } = req.body;

    if (!provider || !cookieToken) {
      return res.status(400).json({ message: "Missing provider or cookieToken" });
    }

    /* =====================================================
       READ SESSION FROM COOKIE
    ===================================================== */
    const fullCookie = `__Secure-next-auth.session-token=${cookieToken}`;
    const session = await fetchSessionFromCookie(fullCookie);

    if (!session?.email) {
      return res.status(400).json({
        success: false,
        message: "Không thể đọc email từ cookie Labs. Cookie không hợp lệ!",
      });
    }

    /* =====================================================
       DECIDE isActive BY CREDITS
    ===================================================== */
    const credits = Number(session.credits ?? 0);
    const isActive = credits > 1000;

    /* =====================================================
       BUILD QUERY (IDENTITY)
    ===================================================== */
    const query = {
      provider,
      email: session.email,
    };

    /* =====================================================
       BUILD UPDATE PAYLOAD
    ===================================================== */
    const update: any = {
      provider,
      email: session.email,
      isActive,
      updatedAt: new Date(),
    };

    if (cookieToken) update.cookieToken = cookieToken;
    if (session.accessToken) update.accessToken = session.accessToken;
    if (session.expires) update.expires = session.expires;
    if (session.credits !== undefined) update.credits = credits;

    /* =====================================================
       UPSERT TOKEN (INSERT IF NOT EXISTS)
    ===================================================== */
    const token = await ProviderToken.findOneAndUpdate(
      query,
      {
        $set: update,
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true, // 👈 CHỐT: chưa có thì INSERT
      }
    );

    return res.json({
      success: true,
      data: {
        id: token._id,
        provider: token.provider,
        email: token.email,
        credits: token.credits,
        isActive: token.isActive,
        createdAt: token.createdAt,
        updatedAt: token.updatedAt,
      },
    });
  } catch (err: any) {
    console.error("[ProviderToken] upsert error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /providerToken/list:
 *   get:
 *     summary: Get list of ProviderTokens
 *     tags:
 *       - ProviderToken
 *     parameters:
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *           enum: [labs, wan]
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of provider tokens
 */
router.get("/list", async (req, res) => {
  try {
    const { provider, email, isActive } = req.query;

    const query: any = {};

    if (provider) query.provider = provider;
    if (email) query.email = email;
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const tokens = await ProviderToken.find(query).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: tokens,
    });
  } catch (err) {
    console.error("[ProviderToken] list error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /providerToken/create:
 *   post:
 *     summary: Create new ProviderToken
 *     tags:
 *       - ProviderToken
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider
 *               - email
 *               - cookieToken
 */
router.post("/create", async (req: any, res) => {
  try {
    const { provider = "labs", email } = req.body;

    if (!provider) {
      return res.status(400).json({ message: "Missing provider" });
    }

    if (provider === "labs" && !email) {
      return res.status(400).json({
        message: "email & cookieToken are required for labs provider",
      });
    }

    // Check duplicate
    const existed = await ProviderToken.findOne({
      provider,
      email,
    });

    if (existed) {
      return res.status(409).json({
        message: "ProviderToken already exists",
      });
    }

    const token = await ProviderToken.create({
      provider,
      email,
      isActive: true,
    });

    res.json({
      success: true,
      data: {
        id: token._id,
        provider: token.provider,
        email: token.email,
        createdAt: token.createdAt,
      },
    });
  } catch (err) {
    console.error("[ProviderToken] create error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
