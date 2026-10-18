import type { AppConfig } from '../../config/env';
import { supabaseIssuer } from './supabase-issuer';
import { type JWTVerifyGetKey, createRemoteJWKSet } from 'jose';

/** The project's public signing keys, fetched from Supabase and cached by `jose`. */
export function remoteSupabaseJwks(config: AppConfig): JWTVerifyGetKey {
  return createRemoteJWKSet(new URL(`${supabaseIssuer(config)}/.well-known/jwks.json`));
}
