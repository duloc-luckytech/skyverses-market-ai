// ✅ jobs/index.ts
import "./video/videoWorker";
import "./image/imageWorker";
import "./music/musicWorker";
import "./syncGommoPublicVideos";
import "./syncGommoPublicImages";
import "./syncRunningHubTemplates";
import "./cleanupProviderTokens";
import "./syncGommoImageModels";

console.log("🧩 All background jobs initialized");

