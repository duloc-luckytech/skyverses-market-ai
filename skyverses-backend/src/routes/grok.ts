// ✅ routes/grok.ts — Grok External Worker API
// Dùng chung createWorkerRouter() — cùng flow với fxflow
import { createWorkerRouter } from "./workerRouter";

const router = createWorkerRouter("grok");

export default router;
