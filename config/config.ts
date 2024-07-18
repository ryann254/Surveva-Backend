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
  jwtSecret: z.string(),
  jwtAccessExpirationMinutes: z.string(),
  jwtRefreshExpirationDays: z.string(),
  jwtResetPasswordExpirationMinutes: z.string(),
  jwtVerifyEmailExpirationMinutes: z.string(),
});

const config = envSchema.parse({
  nodeEnv: process.env.NODE_ENV,
  mongoDBUri: process.env.MONGODB_URI,
  amplitudeSendAnalyticsUrl: process.env.AMPLITUDE_SEND_ANALYTICS_URL,
  amplitudeDeleteAnalyticsUrl: process.env.AMPLITUDE_DELETE_ANALYTICS_URL,
  amplitudeApiKey: process.env.AMPLITUDE_API_KEY,
  amplitudeSecretKey: process.env.AMPLITUDE_SECRET_KEY,
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessExpirationMinutes: process.env.JWT_ACCESS_EXPIRATION_MINUTES,
  jwtRefreshExpirationDays: process.env.JWT_REFRESH_EXPIRATION_DAYS,
  jwtResetPasswordExpirationMinutes:
    process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
  jwtVerifyEmailExpirationMinutes:
    process.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
});

export default config;
