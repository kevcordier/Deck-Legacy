import {
  AuthContext,
  type AuthContextType,
  type AuthStatus,
  type AuthUser,
} from '@contexts/AuthContext';
import { api, setAccessTokenProvider } from '@services/api';
import { getSupabase } from '@services/supabase';
import { forgetAccountKingdoms } from '@services/sync';
import type { Session } from '@supabase/supabase-js';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

const SESSION_RETRY_MS = 30_000;

function toAuthUser(session: Session | null): AuthUser | null {
  if (!session) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? null,
    isAnonymous: session.user.is_anonymous === true,
  };
}

/**
 * Restores the Supabase session saved on the device, if any. Without an account, no session is
 * opened and games are only saved on the device; signing in or creating an account syncs them.
 * Guest sessions opened by older versions are kept (so they can still become an account) but
 * never synced (EDR-050).
 */
export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const supabase = getSupabase();
    setAccessTokenProvider(async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    });

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled || !session) return;
      setUser(previous => {
        const next = toAuthUser(session);
        const unchanged =
          previous?.id === next?.id &&
          previous?.email === next?.email &&
          previous?.isAnonymous === next?.isAnonymous;
        return unchanged ? previous : next;
      });
    });

    void (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        setUser(toAuthUser(data.session));
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
      subscription.subscription.unsubscribe();
    };
  }, [attempt]);

  const createAccount = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase();
    const { data: current } = await supabase.auth.getSession();
    if (!current.session?.user.is_anonymous) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setUser(toAuthUser(data.session));
      return;
    }
    // Guest session from an older version: email and password in one request, Supabase accepts
    // a password for a guest only with it.
    const { error } = await supabase.auth.updateUser({ email, password });
    if (error) throw error;
    // The current access token still describes a guest: refresh it so the API sees the account.
    const { data, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) throw refreshError;
    setUser(toAuthUser(data.session));
  }, []);

  const setPassword = useCallback(async (password: string) => {
    const { error } = await getSupabase().auth.updateUser({ password });
    if (error) throw error;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
    forgetAccountKingdoms();
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    await api.deleteMe();
    const supabase = getSupabase();
    // The user no longer exists on the server: only forget the local session.
    await supabase.auth.signOut({ scope: 'local' });
    forgetAccountKingdoms();
    setUser(null);
  }, []);

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
