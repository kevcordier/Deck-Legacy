import { z } from 'zod';

const booleanFlag = z
  .enum(['true', 'false', '1', '0', ''])
  .optional()
  .transform(value => value === 'true' || value === '1');

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().min(1),
    SUPABASE_URL: z.url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    CORS_ORIGINS: z.string().default(''),
    ALLOW_CHEATS: booleanFlag,
  })
  .transform(env => {
    const isProduction = env.NODE_ENV === 'production';
    return {
      ...env,
      // An empty value in .env means "not set".
      // Server-side secret, only used to delete accounts (Supabase admin API).
      SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY?.length
        ? env.SUPABASE_SERVICE_ROLE_KEY
        : undefined,
      corsOrigins: env.CORS_ORIGINS.split(',')
        .map(origin => origin.trim())
        .filter(origin => origin.length > 0),
      // Accept games played with the development cheat panel; never in production.
      allowCheats: !isProduction && env.ALLOW_CHEATS,
    };
  });

export type AppConfig = z.infer<typeof envSchema>;

/** Parses and validates environment variables; throws with a readable message when invalid. */
export function loadConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  return result.data;
}
