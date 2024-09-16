import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config, logger } from './config';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  logger.info('Connecting to MongoDB...');
  mongod = await MongoMemoryServer.create();
  const uri = config.nodeEnv === 'development' ? config.mongoDBUriTestDB : config.mongoDBUriProdTestDB;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 60000 });
  logger.info('Connected to MongoDB');
}, 60000);

afterAll(async () => {
  logger.info('Disconnecting from MongoDB...');
  await mongoose.disconnect();
  await mongod.stop();
  logger.info('Disconnected from MongoDB');
});