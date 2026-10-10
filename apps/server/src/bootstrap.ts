import { ApiExceptionFilter } from './common/api-exception.filter';
import type { AppConfig } from './config/env';
import type { NestExpressApplication } from '@nestjs/platform-express';

/**
 * Origins allowed to call the API: the configured list (all origins when empty), plus any
 * `localhost` port outside production, since the Expo dev server may not run on 8081.
 */
export function isAllowedOrigin(origin: string | undefined, config: AppConfig): boolean {
  if (!origin || config.corsOrigins.length === 0) return true;
  if (config.corsOrigins.includes(origin)) return true;
  if (config.NODE_ENV === 'production') return false;
  try {
    return new URL(origin).hostname === 'localhost';
  } catch {
    return false;
  }
}

/** Shared HTTP setup for `main.ts` and end-to-end tests. */
export function configureApp(app: NestExpressApplication, config: AppConfig): void {
  app.enableCors({
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin, config)),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  });
  app.useBodyParser('json', { limit: '20mb' });
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();
}
