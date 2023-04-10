import mongoose, { ConnectOptions } from "mongoose";
import { botEnv } from "../env/config";
import { Logger } from "node-colorful-logger";

const logger = new Logger();

async function connectToDatabase() {
  try {
    const db = await mongoose.connect(botEnv.MONGO_URI);
    logger.info("Connected to database");
    return db;
  } catch (error) {
    logger.error(error as string);
  }
}

export default connectToDatabase;
