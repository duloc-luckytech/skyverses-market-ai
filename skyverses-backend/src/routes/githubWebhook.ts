import { Router, Request, Response } from "express";
import crypto from "crypto";
import { exec } from "child_process";
import { DeployLog } from "../models/DeployLog";

const router = Router();
const SECRET = process.env.GITHUB_WEBHOOK_SECRET!;

/**
 * GitHub Webhook — Single deploy.sh handles everything
 * FE:5300 | CMS:5301 | API:5302
 */
router.post("/github", (req: Request, res: Response) => {
  if (!Buffer.isBuffer(req.body)) {
    console.error("❌ Body is not Buffer");
    return res.status(400).json({ message: "Invalid body type" });
  }

  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  if (!signature) {
    return res.status(401).json({ message: "Missing signature" });
  }

  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(req.body);
  const digest = "sha256=" + hmac.digest("hex");

  if (signature !== digest) {
    console.error("❌ Invalid GitHub signature");
    return res.status(401).json({ message: "Invalid signature" });
  }

  const payload = JSON.parse(req.body.toString("utf8"));
  const branch = payload?.ref;
  const event = req.headers["x-github-event"];

  if (event === "push" && branch === "refs/heads/main") {
    console.log("🚀 GitHub push detected → Running deploy.sh...");

    const startTime = Date.now();

    const log = new DeployLog({
      source: "github",
      branch: "main",
      commitId: payload?.after,
      commitMessage: payload?.head_commit?.message,
      status: "RUNNING",
      triggeredBy: payload?.pusher?.name,
    });

    log.save();

    exec(
      'bash -lc "/root/skyverses-market-ai/deploy.sh"',
      { timeout: 300000 }, // 5 min timeout
      async (error, stdout, stderr) => {
        const durationMs = Date.now() - startTime;

        if (error) {
          await DeployLog.findByIdAndUpdate(log._id, {
            status: "FAILED",
            stdout,
            stderr,
            errorMessage: error.message,
            durationMs,
          });
          console.error("❌ Deploy error:", error.message);
          return;
        }

        await DeployLog.findByIdAndUpdate(log._id, {
          status: "SUCCESS",
          stdout,
          stderr,
          durationMs,
        });

        console.log(`✅ Deploy finished (${Math.round(durationMs / 1000)}s)`);
      }
    );
  }

  res.json({ success: true });
});

// CMS webhook → same deploy.sh (builds everything)
router.post("/github-cms", (req: Request, res: Response) => {
  if (!Buffer.isBuffer(req.body)) {
    return res.status(400).json({ message: "Invalid body type" });
  }

  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  if (!signature) {
    return res.status(401).json({ message: "Missing signature" });
  }

  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(req.body);
  const digest = "sha256=" + hmac.digest("hex");

  if (signature !== digest) {
    return res.status(401).json({ message: "Invalid signature" });
  }

  const payload = JSON.parse(req.body.toString("utf8"));
  const branch = payload?.ref;
  const event = req.headers["x-github-event"];

  if (event === "push" && branch === "refs/heads/main") {
    console.log("🚀 GitHub CMS push detected → Running deploy.sh...");

    const startTime = Date.now();

    const log = new DeployLog({
      source: "github",
      branch: "main",
      commitId: payload?.after,
      commitMessage: payload?.head_commit?.message,
      status: "RUNNING",
      triggeredBy: payload?.pusher?.name,
      repo: "cms",
    });

    log.save();

    exec(
      'bash -lc "/root/skyverses-market-ai/deploy.sh"',
      { timeout: 300000 },
      async (error, stdout, stderr) => {
        const durationMs = Date.now() - startTime;

        if (error) {
          await DeployLog.findByIdAndUpdate(log._id, {
            status: "FAILED",
            stdout,
            stderr,
            errorMessage: error.message,
            durationMs,
          });
          console.error("❌ CMS Deploy error:", error.message);
          return;
        }

        await DeployLog.findByIdAndUpdate(log._id, {
          status: "SUCCESS",
          stdout,
          stderr,
          durationMs,
        });

        console.log(`✅ CMS Deploy finished (${Math.round(durationMs / 1000)}s)`);
      }
    );
  }

  res.json({ success: true });
});

export default router;
