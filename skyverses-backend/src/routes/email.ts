import { Router } from "express";
import { EmailTemplateModel, EmailLogModel } from "../models/EmailModel";
import UserModel from "../models/UserModel";
import Mustache from "mustache";
import { sendEmailResend } from "../services/email/resendEmail";

const router = Router();

/* ============================================================
   📌 TEMPLATE CRUD
============================================================ */

// CREATE
router.post("/template/add", async (req, res) => {
  try {
    const { name, subject, html, description } = req.body;

    if (!name || !subject || !html)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const exist = await EmailTemplateModel.findOne({ name });
    if (exist)
      return res
        .status(400)
        .json({ success: false, message: "Template name already exists" });

    const saved = await EmailTemplateModel.create({
      name,
      subject,
      html,
      description,
      isActive: true,
    });

    res.json({ success: true, data: saved });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

// UPDATE
router.put("/template/update/:name", async (req, res) => {
  try {
    const updated = await EmailTemplateModel.findOneAndUpdate(
      { name: req.params.name },
      req.body,
      { new: true }
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });

    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

// LIST
router.get("/template/list", async (req, res) => {
  const templates = await EmailTemplateModel.find().sort({ createdAt: -1 });
  res.json({ success: true, data: templates });
});

// DELETE
router.delete("/template/delete/:name", async (req, res) => {
  const deleted = await EmailTemplateModel.findOneAndDelete({
    name: req.params.name,
  });

  if (!deleted)
    return res
      .status(404)
      .json({ success: false, message: "Template not found" });

  res.json({ success: true });
});

/* ============================================================
   📌 SEND EMAIL (ONE)
============================================================ */
router.post("/send-one", async (req, res) => {
  try {
    const { userId, templateName, variables = {} } = req.body;

    if (!userId || !templateName)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const user = await UserModel.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const template = await EmailTemplateModel.findOne({ name: templateName });
    if (!template)
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });

    const html = Mustache.render(template.html, {
      name: user.name || "",
      email: user.email,
      plan: user.plan,
      ...variables,
    });

    const result = await sendEmailResend({
      to: user.email,
      subject: template.subject,
      html,
      userId: user._id,
      templateName,
      type: "single",
    });

    res.json({ success: true, data: result });
  } catch (e) {
    console.error("send-one error", e);
    res.status(500).json({ success: false });
  }
});

/* ============================================================
   📌 SEND MANY
============================================================ */
router.post("/send-many", async (req, res) => {
  try {
    const { userIds, templateName, variables = {} } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0)
      return res.status(400).json({ success: false, message: "Missing userIds" });

    const template = await EmailTemplateModel.findOne({ name: templateName });
    if (!template)
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });

    const users = await UserModel.find({ _id: { $in: userIds } });
    let sent = 0;

    for (const user of users) {
      const html = Mustache.render(template.html, {
        name: user.name || "",
        email: user.email,
        plan: user.plan,
        ...variables,
      });

      const result = await sendEmailResend({
        to: user.email,
        subject: template.subject,
        html,
        userId: user._id,
        templateName,
        type: "bulk",
      });

      if (result.success) sent++;
    }

    res.json({ success: true, total: users.length, sent });
  } catch (e) {
    console.error("send-many error", e);
    res.status(500).json({ success: false });
  }
});

/* ============================================================
   📌 BROADCAST (TẤT CẢ USER)
============================================================ */
router.post("/broadcast", async (req, res) => {
  try {
    const { templateName, variables = {} } = req.body;

    const template = await EmailTemplateModel.findOne({ name: templateName });
    if (!template)
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });

    const users = await UserModel.find({});
    let sent = 0;

    for (const user of users) {
      const html = Mustache.render(template.html, {
        name: user.name || "",
        email: user.email,
        plan: user.plan,
        ...variables,
      });

      const result = await sendEmailResend({
        to: user.email,
        subject: template.subject,
        html,
        userId: user._id,
        templateName,
        type: "broadcast",
      });

      if (result.success) sent++;
    }

    res.json({ success: true, total: users.length, sent });
  } catch (e) {
    console.error("broadcast error", e);
    res.status(500).json({ success: false });
  }
});

/* ============================================================
   📌 LOGS + FILTER (khớp frontend)
============================================================ */
router.get("/logs", async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      email,
      templateName,
      status,
    } = req.query as any;

    const filter: any = {};

    if (email) filter.to = new RegExp(email, "i");
    if (templateName) filter.templateName = templateName;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(pageSize);

    const [logs, total] = await Promise.all([
      EmailLogModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(pageSize)),
      EmailLogModel.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: logs,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

export default router;