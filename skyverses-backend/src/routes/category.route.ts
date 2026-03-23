import express from "express";
import Category from "../models/Category.model";
import { authenticate } from "./auth";

const router = express.Router();

/* =====================================================
   PUBLIC – LIST CATEGORIES
   GET /category?status=active
===================================================== */
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;

    const query: any = {};
    if (status) query.status = status;

    const items = await Category.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: items,
    });
  } catch (err: any) {
    console.error("[CATEGORY_LIST]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* =====================================================
   ADMIN – CREATE CATEGORY
   POST /category
===================================================== */
router.post("/", async (req: any, res) => {
  try {
    const category = await Category.create(req.body);

    return res.json({
      success: true,
      data: category,
    });
  } catch (err: any) {
    console.error("[CATEGORY_CREATE]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* =====================================================
   ADMIN – UPDATE CATEGORY
   PUT /category/:id
===================================================== */
router.put("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.json({
      success: true,
      data: category,
    });
  } catch (err: any) {
    console.error("[CATEGORY_UPDATE]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* =====================================================
   ADMIN – UPDATE SUB CATEGORY
   PUT /category/:id/sub
===================================================== */
router.put("/:id/sub", async (req, res) => {
  try {
    const { subCategories } = req.body;

    if (!Array.isArray(subCategories)) {
      return res.status(400).json({
        success: false,
        message: "subCategories must be an array",
      });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { subCategories },
      { new: true }
    );

    return res.json({
      success: true,
      data: category,
    });
  } catch (err: any) {
    console.error("[SUBCATEGORY_UPDATE]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* =====================================================
   ADMIN – TOGGLE STATUS (active / inactive)
   PATCH /category/:id/status
===================================================== */
router.patch("/:id/status", authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    return res.json({
      success: true,
      data: category,
    });
  } catch (err: any) {
    console.error("[CATEGORY_STATUS]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* =====================================================
   ADMIN – DELETE CATEGORY (SOFT)
   DELETE /category/:id
===================================================== */
router.delete("/:id", authenticate, async (req, res) => {
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        { status: "inactive" },
        { new: true }
      );
  
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
  
      return res.json({
        success: true,
        message: "Category deactivated",
        data: category,
      });
    } catch (err: any) {
      console.error("[CATEGORY_DELETE_SOFT]", err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  });
  
export default router;
