import type { AppConfig } from './config/env';
import { isAllowedOrigin } from './is-allowed-origin';
import { createOpenApiDocument } from './openapi';
import { ApiExceptionFilter } from './shared/http/api-exception.filter';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';

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
  // Read-only API description (Swagger UI on /docs, JSON on /docs-json); outside the auth guard.
  SwaggerModule.setup('docs', app, createOpenApiDocument(app));
}
