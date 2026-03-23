// routes/metaTemplate.ts
import express from "express";
import MetaPromptTemplate from "../models/MetaPromptTemplate";

const router = express.Router();

/* ============================================================
   1) LIST TEMPLATES
=============================================================== */
router.get("/list", async (req, res) => {
  try {
    const { keyword, isActive } = req.query;

    const match: any = {};

    if (keyword) {
      match.name = { $regex: keyword as string, $options: "i" };
    }

    if (isActive !== undefined) {
      match.isActive = isActive === "true";
    }

    const templates = await MetaPromptTemplate.aggregate([
      { $match: match },

      // ⭐ Add trường rulesCount để sort
      {
        $addFields: {
          rulesCount: { $size: "$rules" },
        },
      },

      // ⭐ Sort: nhiều rules lên đầu
      {
        $sort: { rulesCount: -1, updatedAt: -1 },
      },
    ]);

    res.json({ success: true, templates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách template" });
  }
});

/* ============================================================
   2) GET ACTIVE
=============================================================== */
router.get("/active", async (req, res) => {
  try {
    const active = await MetaPromptTemplate.findOne({ isActive: true });

    res.json({ success: true, template: active });
  } catch (err) {
    res.status(500).json({ error: "Không lấy được template active" });
  }
});

/* ============================================================
   3) DETAIL
=============================================================== */
router.get("/:id", async (req, res) => {
  try {
    const template = await MetaPromptTemplate.findById(req.params.id);
    if (!template)
      return res.status(404).json({ error: "Không tìm thấy template" });

    res.json({ success: true, template });
  } catch (err) {
    res.status(500).json({ error: "Không lấy được template" });
  }
});

/* ============================================================
   4) CREATE
=============================================================== */
router.post("/create", async (req, res) => {
  try {
    const { name, role, rules, outputFormat, isActive } = req.body;

    if (!name || !role || !rules?.length || !outputFormat) {
      return res.status(400).json({ error: "Thiếu dữ liệu" });
    }

    if (isActive) {
      await MetaPromptTemplate.updateMany({}, { isActive: false });
    }

    const template = await MetaPromptTemplate.create({
      name,
      role,
      rules,
      outputFormat,
      isActive: !!isActive,
    });

    res.json({ success: true, template });
  } catch (err) {
    res.status(500).json({ error: "Không tạo được template" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, role, outputFormat, isActive, styles, tones, pacings } =
      req.body;

    const template = await MetaPromptTemplate.findById(req.params.id);
    if (!template)
      return res.status(404).json({ error: "Template không tồn tại" });

    // ===========================
    // UPDATE FIELDS CƠ BẢN
    // ===========================
    if (name !== undefined) template.name = name;
    if (role !== undefined) template.role = role;
    if (outputFormat !== undefined) template.outputFormat = outputFormat;

    // ===========================
    // UPDATE FIELDS ARRAY MỚI
    // ===========================
    if (Array.isArray(styles)) template.styles = styles;
    if (Array.isArray(tones)) template.tones = tones;
    if (Array.isArray(pacings)) template.pacings = pacings;

    // ===========================
    // ACTIVE / INACTIVE
    // ===========================
    if (typeof isActive === "boolean") {
      template.isActive = isActive;
    }

    await template.save();

    res.json({ success: true, template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Không cập nhật template" });
  }
});
/* ============================================================
   6) UPDATE ALL RULES
=============================================================== */
router.put("/:id/rules", async (req, res) => {
  try {
    const { rules } = req.body;

    if (!rules || !rules.length)
      return res.status(400).json({ error: "Rules không hợp lệ" });

    const template = await MetaPromptTemplate.findById(req.params.id);
    if (!template)
      return res.status(404).json({ error: "Template không tồn tại" });

    template.rules = rules;
    await template.save();

    res.json({ success: true, template });
  } catch (err) {
    res.status(500).json({ error: "Không cập nhật rules" });
  }
});

/* ============================================================
   7) ADD RULE
=============================================================== */
router.post("/:id/rules/add", async (req, res) => {
  try {
    const { rule } = req.body;

    const template = await MetaPromptTemplate.findById(req.params.id);
    if (!template)
      return res.status(404).json({ error: "Template không tồn tại" });

    template.rules.push(rule);
    await template.save();

    res.json({ success: true, template });
  } catch (err) {
    res.status(500).json({ error: "Không thêm rule" });
  }
});

/* ============================================================
   8) REMOVE RULE BY INDEX
=============================================================== */
router.post("/:id/rules/remove", async (req, res) => {
  try {
    const { index } = req.body;

    const template = await MetaPromptTemplate.findById(req.params.id);
    if (!template)
      return res.status(404).json({ error: "Template không tồn tại" });

    template.rules.splice(index, 1);
    await template.save();

    res.json({ success: true, template });
  } catch (err) {
    res.status(500).json({ error: "Không xoá rule" });
  }
});

/* ============================================================
   9) UPDATE RULE BY INDEX
=============================================================== */
router.post("/:id/rules/update", async (req, res) => {
  try {
    const { index, rule } = req.body;

    const template = await MetaPromptTemplate.findById(req.params.id);
    if (!template)
      return res.status(404).json({ error: "Template không tồn tại" });

    template.rules[index] = rule;
    await template.save();

    res.json({ success: true, template });
  } catch (err) {
    res.status(500).json({ error: "Không cập nhật rule" });
  }
});

/* ============================================================
   10) ACTIVATE TEMPLATE
=============================================================== */
router.post("/activate", async (req, res) => {
  try {
    const { id } = req.body;

    await MetaPromptTemplate.updateMany({}, { isActive: false });

    const template = await MetaPromptTemplate.findById(id);
    if (!template)
      return res.status(404).json({ error: "Template không tồn tại" });

    template.isActive = true;
    await template.save();

    res.json({ success: true, template });
  } catch (err) {
    res.status(500).json({ error: "Không active template" });
  }
});

/* ============================================================
   11) CLONE TEMPLATE
=============================================================== */
router.post("/clone", async (req, res) => {
  try {
    const { id } = req.body;

    const template = await MetaPromptTemplate.findById(id);
    if (!template)
      return res.status(404).json({ error: "Template không tồn tại" });

    const clone = await MetaPromptTemplate.create({
      name: template.name + " (Copy)",
      role: template.role,
      rules: [...template.rules],
      outputFormat: template.outputFormat,
      isActive: false,
    });

    res.json({ success: true, template: clone });
  } catch (err) {
    res.status(500).json({ error: "Không clone template" });
  }
});

/* ============================================================
   12) REMOVE TEMPLATE
=============================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const template = await MetaPromptTemplate.findById(req.params.id);
    if (!template)
      return res.status(404).json({ error: "Template không tồn tại" });

    if (template.isActive) {
      return res.status(400).json({
        error: "Không thể xoá template đang active",
      });
    }

    await template.deleteOne();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Không xoá template" });
  }
});

/* ============================================================
   13) VALIDATE FORMAT
=============================================================== */
router.post("/validate-format", (req, res) => {
  try {
    const { format } = req.body;

    JSON.parse(format.replace(/```json|```/g, ""));

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Output format không phải JSON hợp lệ" });
  }
});

/* ============================================================
   14) VALIDATE RULES
=============================================================== */
router.post("/validate-rules", (req, res) => {
  const { rules } = req.body;

  if (!rules || !rules.length)
    return res.status(400).json({ error: "Rules không hợp lệ" });

  for (const r of rules) {
    if (typeof r !== "string" || !r.trim()) {
      return res.status(400).json({
        error: "Rule phải là chuỗi không rỗng",
      });
    }
  }

  res.json({ success: true });
});

export default router;
