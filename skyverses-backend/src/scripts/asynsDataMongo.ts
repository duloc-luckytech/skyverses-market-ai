import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const SOURCE_URI ="mongodb+srv://admin:bZsBWEVG1cvtgp0O@cluster0.vmajqc.mongodb.net/youtube-ai"
const TARGET_URI ="mongodb+srv://admin2:wKba7yb5XuaPj5Dq@skyverses.jmgwhs.mongodb.net/youtube-ai"

const BATCH_SIZE = 500;

async function migrate() {
  console.log("🚀 Starting migration...");

  const sourceClient = new MongoClient(SOURCE_URI);
  const targetClient = new MongoClient(TARGET_URI);

  try {
    await sourceClient.connect();
    await targetClient.connect();

    console.log("✅ Connected to both databases");

    const sourceDb = sourceClient.db();
    const targetDb = targetClient.db();

    const collections = await sourceDb.listCollections().toArray();

    console.log(`📚 Found ${collections.length} collections`);

    for (const col of collections) {
      const collectionName = col.name;

      if (collectionName.startsWith("system.")) {
        console.log(`⏭ Skipping system collection: ${collectionName}`);
        continue;
      }

      console.log(`\n📦 Migrating collection: ${collectionName}`);

      const sourceCollection = sourceDb.collection(collectionName);
      const targetCollection = targetDb.collection(collectionName);

      const totalDocs = await sourceCollection.countDocuments();
      console.log(`🔢 Total documents: ${totalDocs}`);

      let processed = 0;

      const cursor = sourceCollection.find();

      while (await cursor.hasNext()) {
        const batch: any[] = [];

        for (let i = 0; i < BATCH_SIZE; i++) {
          const doc = await cursor.next();
          if (!doc) break;
          batch.push(doc);
        }

        if (batch.length > 0) {
          await targetCollection.insertMany(batch, { ordered: false });
          processed += batch.length;
          console.log(`   ➜ Inserted ${processed}/${totalDocs}`);
        }
      }

      console.log(`✅ Done collection: ${collectionName}`);
    }

    console.log("\n🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration error:", error);
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

migrate();