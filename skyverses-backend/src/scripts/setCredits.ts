// scripts/setCredits.ts — Set credit balance for a user
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const EMAIL = "duloc2708@gmail.com";
const CREDITS = 100000;

async function run() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("✅ Connected to MongoDB");

  const result = await mongoose.connection.db!.collection("users").findOneAndUpdate(
    { email: EMAIL },
    { $set: { creditBalance: CREDITS } },
    { returnDocument: "after" }
  );

  if (result) {
    console.log(`✅ ${EMAIL} → creditBalance = ${result.creditBalance}`);
  } else {
    console.log(`❌ User not found: ${EMAIL}`);
  }

  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
