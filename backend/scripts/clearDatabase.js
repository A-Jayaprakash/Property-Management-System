const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: require("path").join(__dirname, "../.env") });

const collections = [
  "users",
  "properties",
  "units",
  "tenants",
  "amenities",
  "charges",
  "expensetypes",
  "billingperiods",
  "unitbills",
];

async function clearDatabase() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB Atlas");

  for (const col of collections) {
    try {
      const result = await mongoose.connection.db.collection(col).deleteMany({});
      console.log(`Cleared "${col}": ${result.deletedCount} documents deleted`);
    } catch (err) {
      console.log(`Skipped "${col}": ${err.message}`);
    }
  }

  await mongoose.disconnect();
  console.log("\nDone. Database is empty.");
}

clearDatabase().catch((err) => {
  console.error(err);
  process.exit(1);
});
