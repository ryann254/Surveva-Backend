import mongoose from 'mongoose';
import { config, logger } from './config';

export default async function globalSetup() {
  if (mongoose.connection.readyState === 0) {
    const uri = config.nodeEnv === 'development' ? config.mongoDBUriTestDB : config.mongoDBUriProdTestDB;
    try {
      await mongoose.connect(uri);
      logger.info('Connected to MongoDB in globalSetup');
    } catch (error) {
      logger.error('Failed to connect to MongoDB in globalSetup', error);
      throw error;
    }
  }
}