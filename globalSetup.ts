import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './config';

export default async function globalSetup() {
  const mongod = await MongoMemoryServer.create();
  const uri = config.nodeEnv === 'development' ? config.mongoDBUriTestDB : config.mongoDBUriProdTestDB;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 60000 });
  (global as any).__MONGOD__ = mongod;
}