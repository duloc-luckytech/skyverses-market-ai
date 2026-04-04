// ✅ routes/index.ts
import { Router } from "express";
import googleAuthRoute from "./auth";
import userRoute from "./user";
import configRoute from "./config";
import planRouter from "./upgradePlan";
import bankRoutes from "./bank";
import webhookRoutes from "./webhook";
import videoRoutes from "./video";
import videoV2Routes from "./videoJobs";
import pricingRoutes from "./pricing.router";

import googleTokenRoutes from "./googleTokenRoutes";
import uploadMediaRoute from "./uploadMedia";
import guideVideoRoute from "./guideVideoRoute";
import templateRoute from "./template";

import dashboardRoutes from "./dashboard";
import customerRoutes from "./customer";
import emailRoutes from "./email";
import projectRoutes from "./project";
import affiliateRoutes from "./affiliate";
import importAiPromptRoutes from "./importAiPrompt";
import couponRoutes from "./coupon";
import aiRoutes from "./ai";
import metaPromptRoutes from "./metaPrompt";
import marketplaceRoutes from "./marketplace";
import shopRoutes from "./shop";
import creditRoutes from "./credit.router";
import marketRoutes from "./market";
import explorerMediaRoutes from "./explorerMedia.router";
import imageRoutes from "./imageJobs";
import audioRoutes from "./audio";
import fxflowRoutes from "./fxflow";
import grokRoutes from "./grok";
import upscaleJobRoutes from "./upscaleJobs";

import providerTokenRoutes from "./providerToken";
import aiModelRoutes from "./aiModel.admin";
import categoryRoutes from "./category.route";
import runninghubRoutes from "./runninghub";
import deploybRoutes from "./deployLogs";
import apiClientRoutes from "./apiClient";
import productSubmissionRoutes from "./productSubmission";
import express from "express";

const router = Router();

router.use("/category", categoryRoutes);

router.use("/ai", aiRoutes);
router.use("/deploy", deploybRoutes);
// Grouped logically
router.use("/providerToken", providerTokenRoutes);
router.use("/credits", creditRoutes);
router.use("/ai-model", aiModelRoutes);

router.use("/image-jobs", imageRoutes);
router.use("/image", upscaleJobRoutes);
router.use("/runninghub", runninghubRoutes);
router.use("/fxflow", fxflowRoutes);
router.use("/grok", grokRoutes);
router.use("/audio", audioRoutes);
router.use("/explorer", explorerMediaRoutes);
router.use("/market", marketRoutes);
router.use("/auth", googleAuthRoute);
router.use("/shop", shopRoutes);
router.use("/user", userRoute);
router.use("/config", configRoute);
router.use("/plan", planRouter);
router.use("/bank", bankRoutes);
router.use("/pricing", pricingRoutes);
router.use("/webhook", webhookRoutes);
router.use("/video", videoRoutes);
router.use("/video-jobs", videoV2Routes);

router.use("/affiliate", affiliateRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/meta-prompt-template", metaPromptRoutes);

router.use("/template", templateRoute);
router.use("/project", projectRoutes);
router.use(importAiPromptRoutes);
router.use("/email", emailRoutes);

router.use("/google-tokens", googleTokenRoutes);
router.use("/guide-videos", guideVideoRoute);

router.use("/customer", customerRoutes);

router.use("/coupon", couponRoutes);

// API Client Management
router.use("/api-client", apiClientRoutes);

// Product Submissions
router.use("/product-submission", productSubmissionRoutes);

// Upload
router.use(uploadMediaRoute);

// Demo QR
router.get("/plan/qr-payment", (req, res) => {
  res.json({
    qrUrl:
      "https://img.vietqr.io/image/VCB-123456789-compact.png?amount=50000&addInfo=NEOVIDEO123",
    bankName: "Vietcombank",
    accountNumber: "123456789",
    accountName: "NGUYEN VAN A",
    amount: 50000,
    note: "NEOVIDEO123",
  });
});

router.use("/marketplace", marketplaceRoutes);

router.get("/test", (req, res) => {
  res.json({ message: "hi" });
});

export default router;
