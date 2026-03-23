import express from "express";
import TemplateJob from "../models/TemplateJobModel";
import { authenticate } from "./auth";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Template
 *     description: API quản lý template AI (image/video)
 */

/* ============================================================
   🧩 Tạo mới template (admin)
   ============================================================ */
router.post("/create",  async (req: any, res) => {
  try {


    const {
      type,
      access = "free",
      name,
      description,
      group,
      prompts = [],
      images = [],
      outputUrl,
      outputMeta,
      tags = [],
    } = req.body;

    if (
      !type ||
      !["image-to-text", "text-to-video", "image-to-video", "scene-builder"].includes(
        type
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Type không hợp lệ" });
    }

    if (!name?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu tên template" });
    }

    const newTemplate = await TemplateJob.create({
      type,
      access,
      name,
      description,
      group,
      prompts,
      images,
      outputUrl,
      outputMeta,
      tags,
      status: "done",
    });

    res.json({ success: true, data: newTemplate });
  } catch (err) {
    console.error("❌ [POST /template/create]", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

/* ============================================================
   📋 Danh sách tất cả template (admin)
   ============================================================ */
router.get("/list",  async (req: any, res) => {
  try {
 

    const { page = 1, pageSize = 10, search = "", type, group, access } =
      req.query as any;

    const filter: any = {};
    if (type) filter.type = type;
    if (group) filter.group = group;
    if (access) filter.access = access;
    if (search?.trim()) filter.name = new RegExp(search, "i");

    const skip = (Number(page) - 1) * Number(pageSize);

    const [data, total] = await Promise.all([
      TemplateJob.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(pageSize))
        .lean(),
      TemplateJob.countDocuments(filter),
    ]);

    res.json({ success: true, total, data });
  } catch (err) {
    console.error("❌ [GET /template/list]", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

/* ============================================================
   🖼️ Danh sách template preview (public)
   ============================================================ */
router.get("/preview-list", async (req: any, res) => {
  try {
    const { page = 1, pageSize = 10, type, group, access, search = "" } =
      req.query as any;

    const filter: any = { status: "done" };
    if (type) filter.type = type;
    if (group) filter.group = group;
    if (access) filter.access = access;
    if (search?.trim()) filter.name = new RegExp(search, "i");

    const skip = (Number(page) - 1) * Number(pageSize);

    const [data, total] = await Promise.all([
      TemplateJob.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(pageSize))
        .select(
          "name type access group description prompts images outputUrl outputMeta tags createdAt"
        )
        .lean(),
      TemplateJob.countDocuments(filter),
    ]);

    const formatted = data.map((t:any) => ({
      id: t._id,
      name: t.name,
      type: t.type,
      access: t.access,
      group: t.group,
      description: t.description,
      tags: t.tags || [],
      createdAt: t.createdAt,
      input: {
        prompts: t.prompts?.map((p: any) => p.text) || [],
        images: t.images?.map((img: any) => ({
          url: img.url,
          role: img.role,
          name: img.name,
        })),
      },
      output: {
        url: t.outputUrl,
        meta: t.outputMeta,
      },
    }));

    res.json({ success: true, total, data: formatted });
  } catch (err) {
    console.error("❌ [GET /template/preview-list]", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

/* ============================================================
   ✏️ Cập nhật template (admin)
   ============================================================ */
router.put("/update/:id",  async (req: any, res) => {
  try {


    const { id } = req.params;
    const updateData = req.body;

    const template = await TemplateJob.findById(id);
    if (!template)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy template" });

    Object.assign(template, updateData);
    await template.save();

    res.json({ success: true, data: template });
  } catch (err) {
    console.error("❌ [PUT /template/update]", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

/* ============================================================
   ❌ Xóa template (admin)
   ============================================================ */
router.delete("/delete/:id",  async (req: any, res) => {
  try {


    const { id } = req.params;
    const template = await TemplateJob.findById(id);
    if (!template)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy template" });

    await template.deleteOne();
    res.json({ success: true, message: "Đã xóa template thành công" });
  } catch (err) {
    console.error("❌ [DELETE /template/delete]", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

export default router;