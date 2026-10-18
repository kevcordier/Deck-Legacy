import { InvalidTokenError } from '../src/auth/application/invalid-token.error';
import { SupabaseTokenVerifier } from '../src/auth/infrastructure/supabase-token.verifier';
import { signToken, testConfig, testJwks } from './helpers';
import { beforeAll, describe, expect, it } from 'vitest';

const USER_ID = '7f2d3b9e-1c4a-4e8b-9a6f-2d5c8e1b3a70';

describe('SupabaseTokenVerifier', () => {
  let verifier: SupabaseTokenVerifier;

  beforeAll(async () => {
    verifier = new SupabaseTokenVerifier(testConfig(), await testJwks());
  });

  it('accepts a valid user token', async () => {
    const token = await signToken({ sub: USER_ID, email: 'a@b.c' });

    await expect(verifier.verify(token)).resolves.toEqual({
      id: USER_ID,
      email: 'a@b.c',
      isAnonymous: false,
    });
  });

  it('flags anonymous sessions', async () => {
    const token = await signToken({ sub: USER_ID, isAnonymous: true });

    await expect(verifier.verify(token)).resolves.toMatchObject({
      isAnonymous: true,
      email: null,
    });
  });

  it.each([
    ['a foreign signing key', { foreignKey: true }],
    ['a foreign issuer', { issuer: 'https://evil.test/auth/v1' }],
    ['a wrong audience', { audience: 'anon' }],
    ['a non-user role', { role: 'service_role' }],
  ])('rejects a token with %s', async (_label, overrides) => {
    const token = await signToken({ sub: USER_ID, ...overrides });

    await expect(verifier.verify(token)).rejects.toBeInstanceOf(InvalidTokenError);
  });

  it('rejects garbage', async () => {
    await expect(verifier.verify('not-a-jwt')).rejects.toBeInstanceOf(InvalidTokenError);
  });
});
