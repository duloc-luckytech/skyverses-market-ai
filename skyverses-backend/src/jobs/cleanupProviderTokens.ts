import cron from "node-cron";
import ProviderToken from "../models/ProviderToken.model";

/**
 * Job to delete ProviderTokens with 0 credits
 * Runs every 5 minutes
 */
async function cleanupEmptyCreditTokens() {
    try {
        // Delete all ProviderTokens where credits is 0
        const result = await ProviderToken.deleteMany({
            credits: 0,
            provider: 'labs'
        });

        if (result.deletedCount > 0) {
            console.log(`[CLEANUP] Deleted ${result.deletedCount} ProviderTokens with 0 credits.`);
        }
    } catch (error) {
        console.error("[CLEANUP ERROR] Failed to cleanup ProviderTokens:", error);
    }
}

// Schedule the job to run every 5 minutes
// Cron expression for "every 5 minutes": */5 * * * *
cron.schedule("*/5 * * * *", async () => {
    console.log("⏳ [CRON] Running cleanupEmptyCreditTokens (every 5 minutes)...");
    await cleanupEmptyCreditTokens();
});

console.log("🚀 Job cleanupEmptyCreditTokens initialized (5m interval)");
