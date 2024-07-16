import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']),
  mongoDBUri: z.string(),
  amplitudeSendAnalyticsUrl: z.string(),
  amplitudeDeleteAnalyticsUrl: z.string(),
  amplitudeApiKey: z.string(),
  amplitudeSecretKey: z.string(),
});

const config = envSchema.parse({
  nodeEnv: process.env.NODE_ENV,
  mongoDBUri: process.env.MONGODB_URI,
  amplitudeSendAnalyticsUrl: process.env.AMPLITUDE_SEND_ANALYTICS_URL,
  amplitudeDeleteAnalyticsUrl: process.env.AMPLITUDE_DELETE_ANALYTICS_URL,
  amplitudeApiKey: process.env.AMPLITUDE_API_KEY,
  amplitudeSecretKey: process.env.AMPLITUDE_SECRET_KEY,
});

export default config;
