import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().default('http://localhost:4200'),
  FIREBASE_PROJECT_ID: z.string().min(1).optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1).optional(),
  FIREBASE_SERVICE_ACCOUNT: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export function isFirebaseConfigured(): boolean {
  if (!env.FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID === 'your-project-id') {
    return false;
  }

  if (env.FIREBASE_SERVICE_ACCOUNT) {
    return true;
  }

  if (!env.GOOGLE_APPLICATION_CREDENTIALS) {
    return false;
  }

  return existsSync(resolve(env.GOOGLE_APPLICATION_CREDENTIALS));
}
