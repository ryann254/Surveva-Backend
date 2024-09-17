import mongoose from 'mongoose';
import { config, logger } from './config';

beforeAll(async () => {
  // Check if MongoDB is connected, if not, connect
  if (mongoose.connection.readyState !== 1) {
    try {
      const uri = config.nodeEnv === 'development' ? config.mongoDBUriTestDB : config.mongoDBUriProdTestDB;
      await mongoose.connect(uri);
      logger.info('Connected to MongoDB in Setup File');
    } catch (error) {
      logger.error('Failed to connect to MongoDB in Setup File', error);
      throw error;
    }
  }
});

afterAll(async () => {
  // No need to disconnect here as it will be handled by globalTeardown
});
