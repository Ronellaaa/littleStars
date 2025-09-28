import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let connectionPromise;
let memoryServer;

export const connectDB = async () => {
  if (connectionPromise) {
    return connectionPromise;
  }

  mongoose.set("strictQuery", true);

  const options = {};
  if (process.env.MONGO_DB_NAME) {
    options.dbName = process.env.MONGO_DB_NAME;
  }

  connectionPromise = (async () => {
    let mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      memoryServer = await MongoMemoryServer.create();
      mongoUri = memoryServer.getUri();
      if (process.env.NODE_ENV !== "production") {
        console.warn("MONGO_URI is not set. Using in-memory MongoDB instance.");
      }
    }

    try {
      const conn = await mongoose.connect(mongoUri, options);
      const details = memoryServer ? `${conn.connection.host} (in-memory)` : conn.connection.host;
      console.log(`MongoDB connected: ${details}`);
      return conn;
    } catch (error) {
      console.error(`MongoDB connection error: ${error.message}`);
      if (memoryServer) {
        await memoryServer.stop();
        memoryServer = null;
      }
      throw error;
    }
  })()
    .catch((error) => {
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
};

export const disconnectDB = async () => {
  await connectionPromise?.catch(() => undefined);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
  connectionPromise = null;
};
