import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config, logger } from './config';

export default async function globalSetup() {
  logger.info('Connecting to MongoDB...');

  const mongod = await MongoMemoryServer.create();
  const uri = config.nodeEnv === 'development' ? config.mongoDBUriTestDB : config.mongoDBUriProdTestDB;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 60000 });
  (global as any).__MONGOD__ = mongod;
  
  logger.info('Connected to MongoDB');
}