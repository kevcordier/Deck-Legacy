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
   * Creates a registered account (email + password), or upgrades an older guest session; the
   * kingdoms of the device are kept and synced. Email confirmation is off.
   */
  createAccount: (email: string, password: string) => Promise<void>;
  /** Changes the password of the signed-in account. */
  setPassword: (password: string) => Promise<void>;
  /** Signs in to an existing account; unsynced kingdoms of the device are added to it. */
  signIn: (email: string, password: string) => Promise<void>;
  /** Signs out and continues without an account (local saves only). */
  signOut: () => Promise<void>;
  /** Deletes the account and its data on the server, then continues without an account. */
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
