/**
 * 🔄 Sync Gommo Models → ModelPricingMatrix
 *
 * - Fetch models from Gommo API: POST https://api.gommo.net/ai/models
 * - Supports type: "image" and "video"
 * - Upsert vào collection ModelPricingMatrix với engine = "gommo"
 * - Chạy mỗi 5 giờ + ngay khi server khởi động
 */

import axios from "axios";
import ModelPricingMatrix from "../models/ModelPricingMatrix.model";

const SYNC_INTERVAL = 5 * 60 * 60 * 1000; // 5 hours
const SYNC_TYPES = ["image", "video"] as const;

/* =====================================================
   HELPERS
===================================================== */

function buildPricing(prices: any[]): Record<string, Record<string, number>> {
    const pricing: Record<string, Record<string, number>> = {};
    if (!Array.isArray(prices) || prices.length === 0) {
        return { default: { default: 0 } };
    }
    for (const p of prices) {
        const resolution = p.resolution || "default";
        const key = p.duration || p.mode || "default";
        const price = p.price || 0;
        if (!pricing[resolution]) pricing[resolution] = {};
        pricing[resolution][key] = price;
    }
    return pricing;
}

function normalizeRatios(ratios: any[]): string[] {
    if (!Array.isArray(ratios)) return [];
    return ratios.map((r: any) => {
        const type = typeof r === "string" ? r : r?.type || "";
        return type.replace(/_/g, ":");
    });
}

function extractModes(model: any): string[] {
    if (Array.isArray(model.mode) && model.mode.length > 0) {
        return model.mode.map((m: any) =>
            typeof m === "string" ? m : m?.type || ""
        ).filter(Boolean);
    }
    if (Array.isArray(model.modes) && model.modes.length > 0) {
        return model.modes.map((m: any) =>
            typeof m === "string" ? m : m?.type || ""
        ).filter(Boolean);
    }
    if (Array.isArray(model.prices)) {
        const modes = new Set<string>();
        for (const p of model.prices) {
            if (p.mode) modes.add(p.mode);
        }
        if (modes.size > 0) return Array.from(modes);
    }
    return [];
}

function extractVersion(modelKey: string): string {
    const match = modelKey.match(/(\d+)_(\d+)$/);
    if (match) return `${match[1]}.${match[2]}`;
    const match2 = modelKey.match(/(\d+)$/);
    if (match2) return match2[1];
    return "1.0";
}

/* =====================================================
   CORE SYNC (generic for image/video)
===================================================== */
async function syncGommoModels(type: "image" | "video") {
    const accessToken = process.env.GOMMO_API_KEY;
    if (!accessToken) {
        console.error("❌ [SyncGommo] GOMMO_API_KEY not found");
        return;
    }

    try {
        const body = new URLSearchParams({
            access_token: accessToken,
            domain: "aivideoauto.com",
            type,
        });

        const res = await axios.post(
            "https://api.gommo.net/ai/models",
            body.toString(),
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                timeout: 30_000,
            }
        );

        const models = res.data?.data;
        if (!Array.isArray(models) || models.length === 0) {
            console.warn(`⚠️ [SyncGommo] No ${type} models from Gommo`);
            return;
        }

        let created = 0, updated = 0, skipped = 0;

        for (const m of models) {
            if (!m.model) { skipped++; continue; }

            const modelKey = m.model;
            const pricing = buildPricing(m.prices);
            const aspectRatios = normalizeRatios(m.ratios);
            const modes = extractModes(m);
            const version = extractVersion(modelKey);

            const updateData = {
                tool: type,
                name: m.name || modelKey,
                engine: "gommo",
                modelKey,
                version,
                description: m.description || "",
                mode: modes[0] || "default",
                modes,
                status: "active" as const,
                pricing,
                aspectRatios,
            };

            const result = await ModelPricingMatrix.findOneAndUpdate(
                { engine: "gommo", modelKey, tool: type },
                { $set: updateData },
                { upsert: true, new: true }
            );

            if (result.createdAt?.getTime() === result.updatedAt?.getTime()) {
                created++;
            } else {
                updated++;
            }
        }

        console.log(
            `✅ [SyncGommo] ${type}: ${models.length} fetched → ${created} created, ${updated} updated, ${skipped} skipped`
        );
    } catch (err: any) {
        console.error(`❌ [SyncGommo] ${type} error: ${err.message}`);
    }
}

/* =====================================================
   SYNC ALL TYPES
===================================================== */
async function syncAll() {
    console.log("🔄 [SyncGommo] Syncing models...");
    for (const type of SYNC_TYPES) {
        await syncGommoModels(type);
    }
}

/* =====================================================
   ⏱ Schedule
===================================================== */
setTimeout(() => { syncAll().catch(console.error); }, 5000);
setInterval(() => { syncAll().catch(console.error); }, SYNC_INTERVAL);

console.log("⏱ [SyncGommo] Scheduled: image+video every 5h");
