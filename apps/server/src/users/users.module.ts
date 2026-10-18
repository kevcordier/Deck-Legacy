import { DeleteAccountUseCase } from './application/delete-account.use-case';
import { EnsureUserUseCase } from './application/ensure-user.use-case';
import { GetProfileUseCase } from './application/get-profile.use-case';
import { IdentityAdmin } from './application/identity-admin';
import { UpdateDisplayNameUseCase } from './application/update-display-name.use-case';
import { UsersRepository } from './application/users.repository';
import { PrismaUsersRepository } from './infrastructure/prisma-users.repository';
import { SupabaseIdentityAdmin } from './infrastructure/supabase-identity-admin';
import { UsersController } from './presentation/users.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [UsersController],
  providers: [
    { provide: UsersRepository, useClass: PrismaUsersRepository },
    { provide: IdentityAdmin, useClass: SupabaseIdentityAdmin },
    EnsureUserUseCase,
    GetProfileUseCase,
    UpdateDisplayNameUseCase,
    DeleteAccountUseCase,
  ],
  exports: [EnsureUserUseCase],
})
export class UsersModule {}
