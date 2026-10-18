import { SupabaseAuthGateway } from '@infrastructure/supabase/SupabaseAuthGateway';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({
  getSession: vi.fn(),
  signUp: vi.fn(),
  updateUser: vi.fn(),
  refreshSession: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChange: vi.fn(),
}));
vi.mock('@infrastructure/supabase/getSupabase', () => ({ getSupabase: () => ({ auth }) }));

const session = (isAnonymous = false) => ({
  access_token: 'tok',
  user: { id: 'u1', email: isAnonymous ? undefined : 'a@b.c', is_anonymous: isAnonymous },
});

const gateway = new SupabaseAuthGateway();

beforeEach(() => {
  for (const fn of Object.values(auth)) fn.mockReset();
});

describe('SupabaseAuthGateway', () => {
  it('reads the user and the access token of the saved session', async () => {
    auth.getSession.mockResolvedValue({ data: { session: session() } });

    await expect(gateway.currentUser()).resolves.toEqual({
      id: 'u1',
      email: 'a@b.c',
      isAnonymous: false,
    });
    await expect(gateway.accessToken()).resolves.toBe('tok');
  });

  it('signs up a new account', async () => {
    auth.getSession.mockResolvedValue({ data: { session: null } });
    auth.signUp.mockResolvedValue({ data: { session: session() }, error: null });

    await expect(gateway.createAccount('a@b.c', 'Secret12')).resolves.toMatchObject({ id: 'u1' });
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it('upgrades an older guest session, then refreshes its token', async () => {
    auth.getSession.mockResolvedValue({ data: { session: session(true) } });
    auth.updateUser.mockResolvedValue({ error: null });
    auth.refreshSession.mockResolvedValue({ data: { session: session() }, error: null });

    await expect(gateway.createAccount('a@b.c', 'Secret12')).resolves.toMatchObject({
      isAnonymous: false,
    });
    expect(auth.updateUser).toHaveBeenCalledWith({ email: 'a@b.c', password: 'Secret12' });
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it('throws the errors of Supabase', async () => {
    const error = new Error('auth.invalid');
    auth.signInWithPassword.mockResolvedValue({ error });
    auth.updateUser.mockResolvedValue({ error });

    await expect(gateway.signIn('a@b.c', 'x')).rejects.toBe(error);
    await expect(gateway.setPassword('x')).rejects.toBe(error);
  });

  it('notifies opened sessions only, and forgets the local session', async () => {
    const unsubscribe = vi.fn();
    let callback: ((event: string, value: unknown) => void) | undefined;
    auth.onAuthStateChange.mockImplementation(cb => {
      callback = cb;
      return { data: { subscription: { unsubscribe } } };
    });
    const listener = vi.fn();

    const stop = gateway.onUserChange(listener);
    callback?.('SIGNED_OUT', null);
    callback?.('SIGNED_IN', session());
    stop();
    await gateway.forgetSession();

    expect(listener).toHaveBeenCalledOnce();
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });
});
