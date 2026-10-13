import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().url().refine(
    (url) => ['postgres:', 'postgresql:'].includes(new URL(url).protocol),
    'DATABASE_URL must use postgres:// or postgresql://',
  ),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  // Only report field names; never print connection credentials.
  throw new Error(`Invalid environment: ${result.error.issues.map((issue) => issue.path.join('.')).join(', ')}`);
}

export const env = result.data;
