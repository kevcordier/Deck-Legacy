import type { AppConfig } from './config/env';

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
