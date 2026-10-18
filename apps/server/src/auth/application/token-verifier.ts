import type { AuthUser } from '../domain/auth-user';

/** Checks an access token and returns its user; throws `InvalidTokenError` otherwise. */
export abstract class TokenVerifier {
  abstract verify(token: string): Promise<AuthUser>;
}
