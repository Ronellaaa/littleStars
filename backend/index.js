import dotenv from "dotenv";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { Activity } from "./models/Activity.js";
import { defaultActivities } from "./data/defaultActivities.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const ensureDefaultActivities = async () => {
  const count = await Activity.countDocuments();
  if (count > 0) {
    return;
  }
  await Activity.insertMany(defaultActivities);
  console.log(`Seeded ${defaultActivities.length} default activities.`);
};

const start = async () => {
  try {
    await connectDB();
    await ensureDefaultActivities();
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`API ready at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

start();
