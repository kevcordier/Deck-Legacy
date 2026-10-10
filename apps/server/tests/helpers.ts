import { type AppConfig, loadConfig } from '../src/config/env';
import { type JWK, SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose';

export const SUPABASE_URL = 'https://project.supabase.test';

export function testConfig(overrides: Record<string, string> = {}): AppConfig {
  return loadConfig({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://unused',
    SUPABASE_URL,
    ...overrides,
  });
}

const KEY_ID = 'test-key';
const signingKeys = generateKeyPair('ES256', { extractable: true });
const foreignKeys = generateKeyPair('ES256');

/** Local stand-in for the Supabase project JWKS, holding the public test signing key. */
export async function testJwks() {
  const jwk: JWK = {
    ...(await exportJWK((await signingKeys).publicKey)),
    kid: KEY_ID,
    alg: 'ES256',
  };
  return createLocalJWKSet({ keys: [jwk] });
}

type TokenOptions = {
  sub: string;
  email?: string;
  isAnonymous?: boolean;
  issuer?: string;
  audience?: string;
  role?: string;
  /** Sign with a key that is not in the project JWKS. */
  foreignKey?: boolean;
};

export async function signToken(options: TokenOptions): Promise<string> {
  const { privateKey } = await (options.foreignKey ? foreignKeys : signingKeys);
  return new SignJWT({
    email: options.email,
    is_anonymous: options.isAnonymous ?? false,
    role: options.role ?? 'authenticated',
  })
    .setProtectedHeader({ alg: 'ES256', kid: KEY_ID })
    .setSubject(options.sub)
    .setIssuer(options.issuer ?? `${SUPABASE_URL}/auth/v1`)
    .setAudience(options.audience ?? 'authenticated')
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey);
}
