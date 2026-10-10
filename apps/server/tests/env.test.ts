import { loadConfig } from '../src/config/env';
import { describe, expect, it } from 'vitest';

const base = {
  DATABASE_URL: 'postgresql://x',
  SUPABASE_URL: 'https://p.supabase.co',
};

describe('loadConfig', () => {
  it('parses origins and defaults', () => {
    const config = loadConfig({ ...base, CORS_ORIGINS: 'https://a, https://b ,' });

    expect(config.PORT).toBe(3000);
    expect(config.corsOrigins).toEqual(['https://a', 'https://b']);
    expect(config.SUPABASE_SERVICE_ROLE_KEY).toBeUndefined();
  });

  it('never enables development helpers in production', () => {
    const config = loadConfig({
      ...base,
      NODE_ENV: 'production',
      ALLOW_CHEATS: 'true',
    });

    expect(config.allowCheats).toBe(false);
  });

  it('enables development helpers outside production', () => {
    const config = loadConfig({ ...base, ALLOW_CHEATS: '1' });

    expect(config.allowCheats).toBe(true);
  });

  it('reports missing variables', () => {
    expect(() => loadConfig({})).toThrow(/DATABASE_URL/);
  });
});
