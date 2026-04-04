// ✅ routes/fxflow.ts — FXFlow External Worker API
// Thin wrapper: dùng createWorkerRouter() từ workerRouter.ts
// Giữ backward-compatible exports cho các file khác import
import { createWorkerRouter, getOrAssignOwnerForUser, getProviderConfig } from "./workerRouter";

// ✅ Re-export cho backward compatibility
// (imageJobs.ts, upscaleJobs.ts, apiClient.ts import { getOrAssignOwnerForUser } from "./fxflow")
export { getOrAssignOwnerForUser, getProviderConfig };

// ✅ Tạo router cho fxflow provider
const router = createWorkerRouter("fxflow");

export default router;
