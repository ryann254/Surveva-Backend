import mongoose from 'mongoose';
import { logger } from './config';

export default async function globalTeardown() {
  logger.info('Disconnecting from MongoDB...');

  await mongoose.disconnect();
  const mongod = (global as any).__MONGOD__;
  if (mongod) await mongod.stop();
  
  logger.info('Disconnected from MongoDB');
}