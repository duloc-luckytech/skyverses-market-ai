import { Router, Request, Response } from "express";
import crypto from "crypto";
import { exec } from "child_process";
import { DeployLog } from "../models/DeployLog";

const router = Router();
const SECRET = process.env.GITHUB_WEBHOOK_SECRET!;

/* ═══════════════════════════════════════════════════
   FE + BE Deploy (main repo push)
═══════════════════════════════════════════════════ */
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
    console.log("🚀 GitHub push detected → Deploying FE + BE...");

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

    // Deploy FE
    exec(
      'bash -lc "/root/skyverses-market-ai/skyverses-backend/deploy.sh"',
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
          console.error("❌ FE Deploy error:", error.message);
        } else {
          console.log("✅ FE Deploy finished");
        }

        // Deploy BE (after FE, same git pull already done)
        exec(
          'bash -lc "/root/skyverses-market-ai/skyverses-backend/deploy-be.sh"',
          async (beError, beStdout, beStderr) => {
            const totalDuration = Date.now() - startTime;

            if (beError) {
              await DeployLog.findByIdAndUpdate(log._id, {
                status: "PARTIAL",
                stdout: stdout + "\n--- BE ---\n" + beStdout,
                stderr: stderr + "\n--- BE ---\n" + beStderr,
                errorMessage: `FE: ${error ? "FAIL" : "OK"} | BE: ${beError.message}`,
                durationMs: totalDuration,
              });
              console.error("❌ BE Deploy error:", beError.message);
            } else {
              await DeployLog.findByIdAndUpdate(log._id, {
                status: error ? "PARTIAL" : "SUCCESS",
                stdout: stdout + "\n--- BE ---\n" + beStdout,
                stderr: stderr + "\n--- BE ---\n" + beStderr,
                durationMs: totalDuration,
              });
              console.log("✅ BE Deploy finished");
            }
          }
        );
      }
    );
  }

  res.json({ success: true });
});

/* ═══════════════════════════════════════════════════
   CMS Deploy
═══════════════════════════════════════════════════ */
router.post("/github-cms", (req: Request, res: Response) => {
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
    console.log("🚀 GitHub push detected → Deploying CMS...");

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
      'bash -lc "/root/skyverses-market-ai/skyverses-backend/deploy-cms.sh"',
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

        console.log("✅ CMS Deploy finished");
      }
    );
  }

  res.json({ success: true });
});

export default router;
