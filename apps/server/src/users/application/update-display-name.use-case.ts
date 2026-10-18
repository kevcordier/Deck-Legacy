import type { UserProfile } from './models/user-profile';
import { UsersRepository } from './users.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateDisplayNameUseCase {
  constructor(private readonly users: UsersRepository) {}

  async execute(userId: string, displayName: string): Promise<UserProfile> {
    await this.users.setDisplayName(userId, displayName);
    return this.users.getProfile(userId);
  }
}
