import mongoose from 'mongoose';
import { logger } from './config';

export default async function globalTeardown() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB in globalTeardown');
  }
}