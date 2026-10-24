import { EnsureUserUseCase } from './ensure-user.use-case';
import { IdentityAdmin } from './identity-admin';
import { UsersRepository } from './users.repository';
import { Injectable } from '@nestjs/common';

/**
 * Deletes the account: the user's data (games, events and scores in cascade) and the identity
 * (its tokens stop working). The identity goes before the data is committed: if the provider
 * refuses, the data stays and the player can try again; if the database fails, the identity stays.
 */
@Injectable()
export class DeleteAccountUseCase {
  constructor(
    private readonly identity: IdentityAdmin,
    private readonly users: UsersRepository,
    private readonly ensureUser: EnsureUserUseCase,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.users.delete(userId, () => this.identity.deleteUser(userId));
    this.ensureUser.forget(userId);
  }
}
