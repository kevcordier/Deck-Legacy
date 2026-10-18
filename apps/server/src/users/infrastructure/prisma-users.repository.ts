import type { AuthUser } from '../../auth/domain/auth-user';
import { PrismaService } from '../../prisma/prisma.service';
import type { UserProfile } from '../application/models/user-profile';
import { UsersRepository } from '../application/users.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaUsersRepository extends UsersRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async saveIdentity(user: AuthUser): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      create: { id: user.id, email: user.email, isAnonymous: user.isAnonymous },
      update: { email: user.email, isAnonymous: user.isAnonymous },
    });
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return {
      id: user.id,
      displayName: user.displayName,
      isAnonymous: user.isAnonymous,
      email: user.email,
    };
  }

  async setDisplayName(userId: string, displayName: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { displayName } });
  }

  async delete(userId: string): Promise<void> {
    await this.prisma.user.deleteMany({ where: { id: userId } });
  }
}
