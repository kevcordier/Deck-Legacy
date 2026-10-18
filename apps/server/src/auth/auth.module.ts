import { APP_CONFIG } from '../config/app-config.token';
import { type AppConfig } from '../config/env';
import { UsersModule } from '../users/users.module';
import { AuthGuard } from './auth.guard';
import { remoteSupabaseJwks } from './remote-supabase-jwks';
import { SUPABASE_JWKS } from './supabase-jwks.token';
import { SupabaseTokenVerifier } from './supabase-token.verifier';
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
    SupabaseTokenVerifier,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [SupabaseTokenVerifier],
})
export class AuthModule {}
