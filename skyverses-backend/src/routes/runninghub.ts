import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { RunningHubTemplate } from "../models/RunningHubTemplate";
const EXPORT_DIR = path.resolve(process.cwd(), "runninghub/exports");

const router = Router();

/* ======================================================
   GET LIST TEMPLATES
====================================================== */
router.get("/templates", async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const search = String(req.query.search || "");
    const hasFile = req.query.hasFile;

    const skip = (page - 1) * limit;

    const query: any = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (hasFile === "1") {
      query.exportFilePath = { $exists: true };
    }

    if (hasFile === "0") {
      query.exportFilePath = { $exists: false };
    }

    const [items, total] = await Promise.all([
      RunningHubTemplate.find(query)
        .sort({ fetchedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      RunningHubTemplate.countDocuments(query),
    ]);

    return res.json({
      success: true,
      page,
      limit,
      total,
      data: items,
    });
  } catch (err: any) {
    console.error("[GET /templates]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// thư mục export workflow (source)

/* ======================================================
     GET WORKFLOW JSON BY ID (FROM FILESYSTEM)
  ====================================================== */
router.get("/workflow/:workflowId", async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;

    if (!workflowId) {
      return res.status(400).json({
        success: false,
        message: "MISSING_WORKFLOW_ID",
      });
    }

    const filePath = path.join(EXPORT_DIR, `${workflowId}.json`);

    // ✅ check file tồn tại
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "WORKFLOW_FILE_NOT_FOUND",
      });
    }

    // đọc file
    const raw = fs.readFileSync(filePath, "utf-8");

    let json: any;
    try {
      json = JSON.parse(raw);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "INVALID_WORKFLOW_JSON",
      });
    }

    return res.json({
      success: true,
      workflowId,
      data: json,
    });
  } catch (err: any) {
    console.error("[GET /runninghub/workflow/:id]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
export default router;
