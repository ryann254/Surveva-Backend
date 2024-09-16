import mongoose from 'mongoose';

export default async function globalTeardown() {
  await mongoose.disconnect();
  const mongod = (global as any).__MONGOD__;
  if (mongod) await mongod.stop();
}