import express, { RequestHandler } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { swaggerOptions } from "./swagger";
import apiRoutes from "./routes";
import { seedAdmin } from "./scripts/seedAdmin";
// import githubWebhookRoutes from "./routes/githubWebhook"; // 🔒 Temporarily disabled
// import './scripts/seedCategories'
// import './scripts/asynsDataMongo' // ✅ Migration completed — disabled to avoid duplicate key errors
dotenv.config();

const app = express();
app.set("trust proxy", true);

// 🔒 GitHub Webhook — Temporarily disabled
// app.use(
//   "/webhook/github",
//   express.raw({ type: "application/json" })
// );
// app.use(
//   "/webhook/github-cms",
//   express.raw({ type: "application/json" })
// );
// app.use("/webhook", githubWebhookRoutes);


/* ---------------------------- Middleware Setup ---------------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// const corsOptions = {
//   origin: [
//     "http://localhost:5173",
//     "http://localhost:3001",

//   ],
//   credentials: true,
// };
// //

app.use(cors({
  origin: true,          // ⭐ cho phép mọi origin
  credentials: true,     // cho phép cookie / authorization header
}));

/* ----------------------------- Swagger Setup ----------------------------- */
const specs = swaggerJSDoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

/* ----------------------------- Mongo + Server Init ----------------------------- */

(async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI!;
    mongoose.set("strictQuery", true);

    console.log("⏳ Connecting to MongoDB...");

    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 20,               // ⭐ TỐI ƯU
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      retryWrites: false,            // ⭐ tránh treo request
      readPreference: "primary",
    });

    console.log("✅ MongoDB connected!");

    /* ------------------------------ Seed Admin ------------------------------ */
    // await seedAdmin(); // ✅ Đã reset xong — uncomment khi cần reset lại

    /* ------------------------------ Routes ------------------------------ */
    app.use(apiRoutes);


    /* ------------------------------ Static ------------------------------ */
    app.use("/final", express.static("outputs"));

    /* ------------------------------ Jobs ------------------------------ */
    if (process.env.NODE_ENV === "production") {
      console.log("🧠 Initializing background jobs...");
      await import("./jobs");
      console.log("✅ Jobs initialized successfully");
    } else {
      console.log("⚙️ Skipping background jobs (dev mode)");
    }

    /* ------------------------------ Start Server ------------------------------ */
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 NeoVideo API running at: http://localhost:${PORT}`);
    });

  } catch (err: any) {
    console.error("❌ Failed to start server due to MongoDB error:", err.message);
    process.exit(1);
  }
})();