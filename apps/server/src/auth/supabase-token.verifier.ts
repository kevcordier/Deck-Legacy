import { trimTrailingSlashes } from '../common/url';
import { APP_CONFIG, type AppConfig } from '../config/env';
import type { AuthUser } from './auth-user';
import { Inject, Injectable } from '@nestjs/common';
import { type JWTPayload, type JWTVerifyGetKey, createRemoteJWKSet, jwtVerify } from 'jose';

type SupabaseClaims = JWTPayload & {
  email?: string;
  is_anonymous?: boolean;
  role?: string;
};

export class InvalidTokenError extends Error {}

/** Provider of the keys that sign Supabase access tokens (the project JWKS). */
export const SUPABASE_JWKS = Symbol('SUPABASE_JWKS');

export function supabaseIssuer(config: AppConfig): string {
  return `${trimTrailingSlashes(config.SUPABASE_URL)}/auth/v1`;
}

/** The project's public signing keys, fetched from Supabase and cached by `jose`. */
export function remoteSupabaseJwks(config: AppConfig): JWTVerifyGetKey {
  return createRemoteJWKSet(new URL(`${supabaseIssuer(config)}/.well-known/jwks.json`));
}

/** Verifies Supabase Auth access tokens against the project's JWKS (asymmetric signing keys). */
@Injectable()
export class SupabaseTokenVerifier {
  private readonly issuer: string;

  constructor(
    @Inject(APP_CONFIG) config: AppConfig,
    @Inject(SUPABASE_JWKS) private readonly jwks: JWTVerifyGetKey,
  ) {
    this.issuer = supabaseIssuer(config);
  }

  async verify(token: string): Promise<AuthUser> {
    let claims: SupabaseClaims;
    try {
      ({ payload: claims } = await jwtVerify<SupabaseClaims>(token, this.jwks, {
        issuer: this.issuer,
        audience: 'authenticated',
      }));
    } catch (error) {
      throw new InvalidTokenError(error instanceof Error ? error.message : 'Invalid token');
    }

    if (!claims.sub || claims.role !== 'authenticated') {
      throw new InvalidTokenError('Token is not a user session');
    }

    return {
      id: claims.sub,
      email: claims.email ?? null,
      isAnonymous: claims.is_anonymous === true,
    };
  }
}
