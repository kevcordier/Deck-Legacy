import { APP_CONFIG } from '../config/app-config.token';
import { type AppConfig } from '../config/env';
import { UsersModule } from '../users/users.module';
import { TokenVerifier } from './application/token-verifier';
import { remoteSupabaseJwks } from './infrastructure/remote-supabase-jwks';
import { SUPABASE_JWKS } from './infrastructure/supabase-jwks.token';
import { SupabaseTokenVerifier } from './infrastructure/supabase-token.verifier';
import { AuthGuard } from './presentation/auth.guard';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [UsersModule],
  providers: [
    {
      provide: SUPABASE_JWKS,
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => remoteSupabaseJwks(config),
    },
    { provide: TokenVerifier, useClass: SupabaseTokenVerifier },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [TokenVerifier],
})
export class AuthModule {}
