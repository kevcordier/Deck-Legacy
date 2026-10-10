import { createContext } from 'react';

export type AuthUser = {
  id: string;
  email: string | null;
  isAnonymous: boolean;
};

/**
 * `disabled`: Supabase is not configured (offline-only build). `offline`: no session could be
 * opened yet; the game stays playable and the session is retried in the background.
 */
export type AuthStatus = 'loading' | 'ready' | 'offline' | 'disabled';

export type AuthContextType = {
  status: AuthStatus;
  user: AuthUser | null;
  /**
   * Turns the current guest account into a registered one (email + password); its kingdoms are
   * kept. Email confirmation is off: the session is refreshed so the API sees the account.
   */
  createAccount: (email: string, password: string) => Promise<void>;
  /** Changes the password of the signed-in account. */
  setPassword: (password: string) => Promise<void>;
  /** Signs in to an existing account; the current anonymous progress stays on the old account. */
  signIn: (email: string, password: string) => Promise<void>;
  /** Signs out and continues as a new guest. */
  signOut: () => Promise<void>;
  /** Deletes the account and its data on the server, then continues as a new guest. */
  deleteAccount: () => Promise<void>;
  retry: () => void;
};

const unavailable = () => Promise.reject(new Error('Accounts are not configured'));

export const AuthContext = createContext<AuthContextType>({
  status: 'disabled',
  user: null,
  createAccount: unavailable,
  setPassword: unavailable,
  signIn: unavailable,
  signOut: unavailable,
  deleteAccount: unavailable,
  retry: () => undefined,
});
