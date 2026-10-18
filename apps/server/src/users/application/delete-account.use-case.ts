import { EnsureUserUseCase } from './ensure-user.use-case';
import { IdentityAdmin } from './identity-admin';
import { UsersRepository } from './users.repository';
import { Injectable } from '@nestjs/common';

/**
 * Deletes the account: the identity first (its tokens stop working), then the user's data
 * (games, events and scores are deleted in cascade).
 */
@Injectable()
export class DeleteAccountUseCase {
  constructor(
    private readonly identity: IdentityAdmin,
    private readonly users: UsersRepository,
    private readonly ensureUser: EnsureUserUseCase,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.identity.deleteUser(userId);
    await this.users.delete(userId);
    this.ensureUser.forget(userId);
  }
}
