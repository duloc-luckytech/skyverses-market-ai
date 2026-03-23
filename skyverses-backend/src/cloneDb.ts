import mongoose from "mongoose";

const sourceURI = "mongodb+srv://admin:eWQoltJSSSCbILM8@cluster0.o7fk564.mongodb.net/ai_dubbing";
const targetURI = "mongodb+srv://fibus_db_user:j3UMWfhUtT9rVEqc@fibusvideo.atjql7.mongodb.net/fibusvideo";

async function cloneMongoDB() {
  const src:any = await mongoose.createConnection(sourceURI).asPromise();
  const dest:any = await mongoose.createConnection(targetURI).asPromise();

  const collections = await src.db.listCollections().toArray();
  console.log(`🔁 Found ${collections.length} collections`);

  for (const c of collections) {
    const name = c.name;
    const data = await src.db.collection(name).find().toArray();
    if (data.length) {
      await dest.db.collection(name).deleteMany({});
      await dest.db.collection(name).insertMany(data);
      console.log(`✅ Copied ${name}: ${data.length} docs`);
    }
  }

  await src.close();
  await dest.close();
  console.log("🎉 Clone completed!");
}

cloneMongoDB().catch(console.error);