import { MongoClient } from "mongodb";

const SOURCE_URI = "mongodb+srv://admin:bZsBWEVG1cvtgp0O@cluster0.vmajqc.mongodb.net";
const TARGET_URI = "mongodb://sky_user2:duloc123@209.74.65.102:27017";
const DB_NAME = "skyverses-dev";

// collections không sync (tuỳ chọn)
const EXCLUDE_COLLECTIONS = ["system.profile"];

async function syncAllCollections() {
  const sourceClient = new MongoClient(SOURCE_URI);
  const targetClient = new MongoClient(TARGET_URI);

  await sourceClient.connect();
  await targetClient.connect();

  const sourceDb = sourceClient.db(DB_NAME);
  const targetDb = targetClient.db(DB_NAME);

  const collections = await sourceDb.listCollections().toArray();

  console.log(`🔍 Found ${collections.length} collections`);

  for (const col of collections) {
    const colName = col.name;

    if (EXCLUDE_COLLECTIONS.includes(colName)) {
      console.log(`⏭ Skip collection: ${colName}`);
      continue;
    }

    console.log(`🔄 Syncing collection: ${colName}`);

    const sourceCol = sourceDb.collection(colName);
    const targetCol = targetDb.collection(colName);

    // xoá dữ liệu cũ
    await targetCol.deleteMany({});

    const cursor = sourceCol.find({});
    let count = 0;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      if (!doc) continue;

      await targetCol.insertOne(doc);
      count++;

      if (count % 1000 === 0) {
        console.log(`   ✅ ${colName}: ${count} docs`);
      }
    }

    console.log(`🎉 Done ${colName}: ${count} docs`);
  }

  await sourceClient.close();
  await targetClient.close();

  console.log("🚀 All collections synced successfully");
}

syncAllCollections().catch((err) => {
  console.error("❌ Sync failed:", err);
  process.exit(1);
});