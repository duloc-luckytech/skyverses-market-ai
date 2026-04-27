// ✅ routes/index.ts — Cleaned up: removed 14 dead routes
import { Router } from "express";
import googleAuthRoute from "./auth";
import userRoute from "./user";
import configRoute from "./config";
import webhookRoutes from "./webhook";
import videoRoutes from "./video";
import videoV2Routes from "./videoJobs";
import pricingRoutes from "./pricing.router";

import uploadMediaRoute from "./uploadMedia";

import customerRoutes from "./customer";
import aiRoutes from "./ai";
import creditRoutes from "./credit.router";
import marketRoutes from "./market";
import explorerMediaRoutes from "./explorerMedia.router";
import imageRoutes from "./imageJobs";
import audioRoutes from "./audio";
import fxflowRoutes from "./fxflow";
import grokRoutes from "./grok";
import upscaleJobRoutes from "./upscaleJobs";
import editImageJobRoutes from "./editImageJobs";

import providerTokenRoutes from "./providerToken";
import aiModelRoutes from "./aiModel.admin";
import categoryRoutes from "./category.route";
import runninghubRoutes from "./runninghub";
import deploybRoutes from "./deployLogs";
import apiClientRoutes from "./apiClient";
import productSubmissionRoutes from "./productSubmission";
import blogRoutes from "./blog";
import adminTaskRoutes from "./adminTasks";

const router = Router();

// ─── Core ───
router.use("/auth", googleAuthRoute);
router.use("/user", userRoute);
router.use("/config", configRoute);
router.use("/credits", creditRoutes);
router.use("/pricing", pricingRoutes);
router.use("/webhook", webhookRoutes);

// ─── AI Generation ───
router.use("/ai", aiRoutes);
router.use("/image-jobs", imageRoutes);
router.use("/image", upscaleJobRoutes);
router.use("/video", videoRoutes);
router.use("/video-jobs", videoV2Routes);
router.use("/audio", audioRoutes);
router.use("/edit-image-jobs", editImageJobRoutes);

// ─── External Workers ───
router.use("/fxflow", fxflowRoutes);
router.use("/grok", grokRoutes);

// ─── Content & Media ───
router.use("/explorer", explorerMediaRoutes);
router.use("/market", marketRoutes);
router.use("/blog", blogRoutes);
router.use("/runninghub", runninghubRoutes);
router.use("/category", categoryRoutes);
router.use(uploadMediaRoute);

// ─── Admin ───
router.use("/ai-model", aiModelRoutes);
router.use("/providerToken", providerTokenRoutes);
router.use("/deploy", deploybRoutes);
router.use("/customer", customerRoutes);
router.use("/api-client", apiClientRoutes);
router.use("/product-submission", productSubmissionRoutes);
router.use("/admin-tasks", adminTaskRoutes);

export default router;
