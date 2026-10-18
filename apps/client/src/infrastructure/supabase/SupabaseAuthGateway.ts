import { getSupabase } from './getSupabase';
import type { AuthGateway } from '@application/ports/AuthGateway';
import type { AuthUser } from '@domain/account/AuthUser';
import type { Session } from '@supabase/supabase-js';

function toAuthUser(session: Session | null): AuthUser | null {
  if (!session) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? null,
    isAnonymous: session.user.is_anonymous === true,
  };
}

/** Supabase Auth: the session is saved in AsyncStorage (`localStorage` on web). */
export class SupabaseAuthGateway implements AuthGateway {
  async currentUser(): Promise<AuthUser | null> {
    const { data } = await getSupabase().auth.getSession();
    return toAuthUser(data.session);
  }

  onUserChange(listener: (user: AuthUser) => void): () => void {
    const { data } = getSupabase().auth.onAuthStateChange((_event, session) => {
      const user = toAuthUser(session);
      if (user) listener(user);
    });
    return () => data.subscription.unsubscribe();
  }

  async accessToken(): Promise<string | null> {
    const { data } = await getSupabase().auth.getSession();
    return data.session?.access_token ?? null;
  }

  async createAccount(email: string, password: string): Promise<AuthUser | null> {
    const supabase = getSupabase();
    const { data: current } = await supabase.auth.getSession();
    if (!current.session?.user.is_anonymous) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return toAuthUser(data.session);
    }
    // Guest session from an older version: email and password in one request, Supabase accepts
    // a password for a guest only with it.
    const { error } = await supabase.auth.updateUser({ email, password });
    if (error) throw error;
    // The current access token still describes a guest: refresh it so the API sees the account.
    const { data, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) throw refreshError;
    return toAuthUser(data.session);
  }

  async setPassword(password: string): Promise<void> {
    const { error } = await getSupabase().auth.updateUser({ password });
    if (error) throw error;
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    await getSupabase().auth.signOut();
  }

  async forgetSession(): Promise<void> {
    await getSupabase().auth.signOut({ scope: 'local' });
  }
}
