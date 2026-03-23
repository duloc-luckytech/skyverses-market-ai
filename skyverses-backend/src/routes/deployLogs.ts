import { Router, Request, Response } from "express";
import { DeployLog } from "../models/DeployLog";

const router = Router();
router.get("/logs", async (req, res) => {
  const { status, branch, limit = 20, offset = 0 } = req.query;

  const query: any = {};
  if (status) query.status = status;
  if (branch) query.branch = branch;

  const logs = await DeployLog.find(query)
    .sort({ createdAt: -1 })
    .skip(Number(offset))
    .limit(Number(limit))
    .select("-stdout -stderr"); // list view không cần full trace

  const total = await DeployLog.countDocuments(query);

  res.json({
    success: true,
    total,
    data: logs,
  });
});
export default router;
