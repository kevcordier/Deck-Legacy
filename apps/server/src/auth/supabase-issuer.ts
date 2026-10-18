import type { AppConfig } from '../config/env';
import { trimTrailingSlashes } from '../shared/trim-trailing-slashes';

/** Issuer of the project's access tokens. */
export function supabaseIssuer(config: AppConfig): string {
  return `${trimTrailingSlashes(config.SUPABASE_URL)}/auth/v1`;
}
