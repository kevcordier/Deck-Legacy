import type { AuthUser } from '../../auth/domain/auth-user';
import { UsersRepository } from './users.repository';
import { Injectable } from '@nestjs/common';

const KNOWN_USERS_LIMIT = 10_000;

/** Records the signed-in user, once per identity change (called by `AuthGuard` on every request). */
@Injectable()
export class EnsureUserUseCase {
  /** Last identity written to the database, per user id, to avoid one upsert per request. */
  private readonly known = new Map<string, string>();

  constructor(private readonly users: UsersRepository) {}

  async execute(user: AuthUser): Promise<void> {
    const fingerprint = `${user.email ?? ''}|${user.isAnonymous}`;
    if (this.known.get(user.id) === fingerprint) return;

    await this.users.saveIdentity(user);

    if (this.known.size >= KNOWN_USERS_LIMIT) this.known.clear();
    this.known.set(user.id, fingerprint);
  }

  /** Forgets a deleted user, so a new account with the same id is recorded again. */
  forget(userId: string): void {
    this.known.delete(userId);
  }
}
