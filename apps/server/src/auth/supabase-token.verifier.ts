import { APP_CONFIG } from '../config/app-config.token';
import type { AppConfig } from '../config/env';
import type { AuthUser } from './auth-user';
import { InvalidTokenError } from './invalid-token.error';
import { supabaseIssuer } from './supabase-issuer';
import { SUPABASE_JWKS } from './supabase-jwks.token';
import { Inject, Injectable } from '@nestjs/common';
import { type JWTPayload, type JWTVerifyGetKey, jwtVerify } from 'jose';

type SupabaseClaims = JWTPayload & {
  email?: string;
  is_anonymous?: boolean;
  role?: string;
};

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
