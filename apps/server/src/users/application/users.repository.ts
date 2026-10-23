import type { AuthUser } from '../../auth/domain/auth-user';
import type { UserProfile } from './models/user-profile';

/** Storage of player accounts; the Nest injection token is the class itself. */
export abstract class UsersRepository {
  /** Creates the user on first sight and keeps email / anonymous flag up to date. */
  abstract saveIdentity(user: AuthUser): Promise<void>;

  abstract getProfile(userId: string): Promise<UserProfile>;

  abstract setDisplayName(userId: string, displayName: string): Promise<void>;

  /**
   * Deletes the user; games, events and scores follow by cascade. `beforeCommit` runs in the same
   * transaction: when it throws, nothing is deleted.
   */
  abstract delete(userId: string, beforeCommit: () => Promise<void>): Promise<void>;
}
