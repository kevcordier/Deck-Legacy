import { AppModule } from '../src/app.module';
import { SUPABASE_JWKS } from '../src/auth/infrastructure/supabase-jwks.token';
import { APP_CONFIG } from '../src/config/app-config.token';
import type { AppConfig } from '../src/config/env';
import { GameValidator } from '../src/games/application/game-validator';
import { PrismaService } from '../src/prisma/prisma.service';
import { testConfig } from './helpers';
import { GameSession } from '@deck-legacy/engine/application/session/GameSession';
import type { GameEvent } from '@deck-legacy/engine/domain/types';
import { Test } from '@nestjs/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('AppModule', () => {
  it('reads its configuration from the environment and fetches the Supabase keys', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://unused');
    vi.stubEnv('SUPABASE_URL', 'https://project.supabase.test//');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    expect(moduleRef.get<AppConfig>(APP_CONFIG).DATABASE_URL).toBe('postgresql://unused');
    expect(moduleRef.get(SUPABASE_JWKS)).toBeTypeOf('function');
  });
});

describe('PrismaService', () => {
  it('connects lazily and disconnects when the module stops', async () => {
    const prisma = new PrismaService(testConfig());

    await expect(prisma.onModuleDestroy()).resolves.toBeUndefined();
  });
});

describe('GameValidator', () => {
  it('lets unexpected engine errors through', () => {
    vi.spyOn(GameSession, 'verify').mockImplementation(() => {
      throw new Error('boom');
    });
    const events = [{ id: 'e1', type: 'GAME_STARTED' }] as unknown as GameEvent[];

    expect(() =>
      new GameValidator(testConfig()).validate({ events, fromSeq: 0, name: '', cardNames: {} }),
    ).toThrow('boom');
  });
});
