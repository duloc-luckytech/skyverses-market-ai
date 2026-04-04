import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { swaggerOptions } from "./swagger";
import apiRoutes from "./routes";
dotenv.config();

const app = express();
app.set("trust proxy", true);

/* ---------------------------- Middleware Setup ---------------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cors({
  origin: true,
  credentials: true,
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
      maxPoolSize: 20,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      retryWrites: false,
      readPreference: "primary",
    });

    console.log("✅ MongoDB connected!");

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