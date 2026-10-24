import { AuthContext, type AuthContextType, type AuthStatus } from './AuthContext';
import type { AuthUser } from '@domain/account/AuthUser';
import { useAppServices } from '@hooks/useAppServices';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

const SESSION_RETRY_MS = 30_000;

function sameUser(a: AuthUser | null, b: AuthUser | null): boolean {
  return a?.id === b?.id && a?.email === b?.email && a?.isAnonymous === b?.isAnonymous;
}

/**
 * Restores the session saved on the device, if any. Without an account, no session is opened
 * and games are only saved on the device; signing in or creating an account syncs them. Guest
 * sessions opened by older versions are kept (so they can still become an account) but never
 * synced (EDR-050).
 */
export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const { auth, accountApi, sync } = useAppServices();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = auth.onUserChange(next => {
      if (cancelled) return;
      setUser(previous => (sameUser(previous, next) ? previous : next));
    });

    void (async () => {
      try {
        const current = await auth.currentUser();
        if (cancelled) return;
        setUser(current);
        setStatus('ready');
      } catch (error) {
        // Usually offline: the game stays playable, the session is retried later.
        console.warn('Could not open a session', error);
        if (cancelled) return;
        setStatus('offline');
        retryTimer = setTimeout(() => setAttempt(a => a + 1), SESSION_RETRY_MS);
      }
    })();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      unsubscribe();
    };
  }, [attempt, auth]);

  const createAccount = useCallback(
    async (email: string, password: string) => {
      setUser(await auth.createAccount(email, password));
    },
    [auth],
  );

  const setPassword = useCallback((password: string) => auth.setPassword(password), [auth]);

  const signIn = useCallback(
    (email: string, password: string) => auth.signIn(email, password),
    [auth],
  );

  const signOut = useCallback(async () => {
    // Last chance to push the moves played offline; what still fails stays on the device.
    await sync.syncNow();
    await auth.signOut();
    sync.forgetAccountKingdoms();
    setUser(null);
  }, [auth, sync]);

  const deleteAccount = useCallback(async () => {
    await accountApi.deleteMe();
    // The user no longer exists on the server: only forget the local session.
    await auth.forgetSession();
    sync.forgetAccountKingdoms(false);
    setUser(null);
  }, [accountApi, auth, sync]);

  const retry = useCallback(() => setAttempt(a => a + 1), []);

  const value = useMemo<AuthContextType>(
    () => ({
      status,
      user,
      createAccount,
      setPassword,
      signIn,
      signOut,
      deleteAccount,
      retry,
    }),
    [status, user, createAccount, setPassword, signIn, signOut, deleteAccount, retry],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
