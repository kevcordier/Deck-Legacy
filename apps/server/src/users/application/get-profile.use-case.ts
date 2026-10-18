import type { UserProfile } from './models/user-profile';
import { UsersRepository } from './users.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetProfileUseCase {
  constructor(private readonly users: UsersRepository) {}

  execute(userId: string): Promise<UserProfile> {
    return this.users.getProfile(userId);
  }
}
