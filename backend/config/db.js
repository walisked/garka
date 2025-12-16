import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const conn = await mongoose.connect(uri);
      logger.info(`MongoDB Connected: ${conn.connection.host}`);

      mongoose.connection.on('error', (err) => {
        logger.error(`MongoDB connection error: ${err}`);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        process.exit(0);
      });

      return;
    } catch (error) {
      attempt += 1;
      logger.error(`MongoDB connection attempt ${attempt} failed: ${error.message}`);
      if (attempt < maxRetries) {
        logger.info(`Retrying MongoDB connection in 5s (${attempt}/${maxRetries})`);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }

      logger.warn('MongoDB unavailable after multiple attempts; continuing without DB. Some features will be disabled until DB is available.');
      return;
    }
  }
};

export default connectDB;
