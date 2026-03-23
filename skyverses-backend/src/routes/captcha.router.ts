// routes/captcha.router.ts
import { Router } from "express";
import CaptchaToken from "../models/CaptchaToken.model";

const router = Router();

/**
 * 1️⃣ Lưu captcha token (sau khi FE gọi grecaptcha.execute)
 */
router.post("/store", async (req, res) => {
  const { tokenCaptcha } = req.body;

  if (!tokenCaptcha) {
    return res.status(400).json({ error: "Missing email or tokenCaptcha" });
  }

  await CaptchaToken.create({
    tokenCaptcha,
  });

  return res.json({ ok: true });
});

export default router;
