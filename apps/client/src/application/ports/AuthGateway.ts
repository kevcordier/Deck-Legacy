import type { AuthUser } from '@domain/account/AuthUser';

/** The identity provider (Supabase Auth): session, sign-in, account creation. */
export interface AuthGateway {
  /** The user of the session saved on the device; throws when it cannot be reached (offline). */
  currentUser(): Promise<AuthUser | null>;
  /** Called with the user whenever a session opens or refreshes. */
  onUserChange(listener: (user: AuthUser) => void): () => void;
  /** Access token of the current session, for API requests. */
  accessToken(): Promise<string | null>;
  /**
   * Creates a registered account, or upgrades an older guest session; returns the user when
   * a session is open.
   */
  createAccount(email: string, password: string): Promise<AuthUser | null>;
  setPassword(password: string): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  /** Forgets the session on this device only (the account no longer exists on the server). */
  forgetSession(): Promise<void>;
}
