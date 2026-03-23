import GoogleToken from "../models/GoogleTokenModel";
import User from "../models/UserModel";
import mongoose from "mongoose";
import cron from "node-cron";

type OID = mongoose.Types.ObjectId;

/* ============================================================
   ⭐ CONSTANTS
=============================================================== */

const MAX_SLOT = Number(process.env.LIMIT_VIDEO_ASSIGN_TOKEN) || 3;

const MIN_CREDIT = 110;

/* ============================================================
   ⭐ HELPERS
=============================================================== */

/**
 * Sync assigned only when mismatch
 * (avoid overwrite race)
 */
async function syncTokenAssignedIfMismatch() {
  const tokens = await GoogleToken.find();
  for (const tk of tokens) {
    const real = tk.userIds.length;
    if (tk.assigned !== real) {
      tk.assigned = real;
      await tk.save();
    }
  }
}

/* ============================================================
   ⭐ Remove users khỏi tất cả token (batch)
=============================================================== */
async function removeUsersFromAllTokens(userIds: OID[]) {
  if (!userIds.length) return;

  await GoogleToken.updateMany(
    { userIds: { $in: userIds } },
    { $pull: { userIds: { $in: userIds } } }
  );

  await syncTokenAssignedIfMismatch();
}

/* ============================================================
   ⭐ Assign user vào token (ATOMIC)
=============================================================== */
async function assignUserToToken(userId: OID, tokenId: OID) {
  const res = await GoogleToken.updateOne(
    {
      _id: tokenId,
      isActive: true,
      credits: { $gt: MIN_CREDIT },
      $expr: { $lt: ["$assigned", "$slot"] },
      userIds: { $ne: userId },
    },
    {
      $push: { userIds: userId },
      $inc: { assigned: 1 },
    }
  );

  if (res.modifiedCount === 0) return false;

  await User.updateOne({ _id: userId }, { googleId: tokenId });

  return true;
}

/* ============================================================
   ⭐ Pick token rảnh + auto-scale (ATOMIC & SAFE)
=============================================================== */
async function pickNewTokenAutoScale(maxSlot = MAX_SLOT) {
  // 1️⃣ Token còn slot
  const freeToken = await GoogleToken.findOne({
    isActive: true,
    credits: { $gt: MIN_CREDIT },
    $expr: { $lt: ["$assigned", "$slot"] },
  }).sort({ assigned: 1 });

  if (freeToken) return freeToken;

  // 2️⃣ Auto-scale slot (ATOMIC)
  const scaled = await GoogleToken.findOneAndUpdate(
    {
      isActive: true,
      credits: { $gt: MIN_CREDIT },
      slot: { $lt: maxSlot },
    },
    { $inc: { slot: 1 } },
    { sort: { assigned: 1 }, new: true }
  );

  if (!scaled) return null;

  console.log(`⚠️ Auto-scale slot: ${scaled.email} → ${scaled.slot}`);

  return scaled;
}

/* ============================================================
   ⭐ MAIN REDISTRIBUTE — TOKEN ONLY
=============================================================== */
/* ============================================================
   ⭐ MAIN REDISTRIBUTE — V7 (ADD CREDIT CHECK)
=============================================================== */
export async function redistributeGoogleTokens() {
  const now = new Date(); // UTC

  /* -----------------------------------------------------
      1️⃣ Lấy user còn plan hợp lệ
  ------------------------------------------------------- */
  const users: any[] = await User.find({
    plan: { $ne: null },
    planExpiresAt: { $gt: now },
  }).select("_id googleId");

  if (!users.length) {
    console.log("⚠️ No active users.");
    return;
  }

  const userIds = users.map((u) => u._id);

  /* -----------------------------------------------------
      2️⃣ Detect stuck users (TOKEN PROBLEM ONLY)
  ------------------------------------------------------- */
  const tokens = await GoogleToken.find().lean();
  const tokenMap = new Map(tokens.map((t) => [t._id.toString(), t]));

  const stuckUsers: OID[] = [];

  for (const u of users) {
    if (!u.googleId) continue;

    const tk = tokenMap.get(u.googleId.toString());
    if (!tk) {
      stuckUsers.push(u._id);
      continue;
    }

    if (
      !tk.isActive ||
      tk.credits <= MIN_CREDIT ||
      tk.assigned > tk.slot ||
      tk.assigned !== tk.userIds.length
    ) {
      stuckUsers.push(u._id);
    }
  }

  if (stuckUsers.length) {
    console.log(`⚠️ ${stuckUsers.length} stuck users → detach token`);

    await removeUsersFromAllTokens(stuckUsers);
    await User.updateMany(
      { _id: { $in: stuckUsers } },
      { $unset: { googleId: "" } }
    );
  }

  /* -----------------------------------------------------
      3️⃣ Find users missing valid token
  ------------------------------------------------------- */
  const activeTokenIds = (
    await GoogleToken.find({
      isActive: true,
      credits: { $gt: MIN_CREDIT },
    }).select("_id")
  ).map((t) => t._id);

  const missingUsers: any[] = await User.find({
    _id: { $in: userIds },
    $or: [{ googleId: null }, { googleId: { $nin: activeTokenIds } }],
  }).select("_id");

  if (!missingUsers.length) {
    console.log("✔ All users already assigned.");
    return;
  }

  console.log(`⚠️ Assign token for ${missingUsers.length} users`);

  /* -----------------------------------------------------
      4️⃣ Assign token
  ------------------------------------------------------- */
  for (const u of missingUsers) {
    const token: any = await pickNewTokenAutoScale();
    if (!token) {
      console.log("🚫 No token available");
      break;
    }

    await assignUserToToken(u._id, token._id);
  }

  console.log("🎉 Redistribute complete");
}

/* ============================================================
   ⭐ CRON — every 10 minutes (mutex)
=============================================================== */
let running = false;

cron.schedule("*/10 * * * *", async () => {
  if (running) {
    console.log("⚠️ Skip — job still running");
    return;
  }

  running = true;
  try {
    await redistributeGoogleTokens();
  } catch (e) {
    console.error("❌ Redistribute error:", e);
  } finally {
    running = false;
  }
});
