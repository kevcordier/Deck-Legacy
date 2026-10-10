import { isAllowedOrigin } from '../src/bootstrap';
import { testConfig } from './helpers';
import { describe, expect, it } from 'vitest';

const PAGES = 'https://kevcordier.github.io';

describe('isAllowedOrigin', () => {
  it('allows listed origins and requests without origin', () => {
    const config = testConfig({ CORS_ORIGINS: PAGES });

    expect(isAllowedOrigin(PAGES, config)).toBe(true);
    expect(isAllowedOrigin(undefined, config)).toBe(true);
    expect(isAllowedOrigin('https://evil.test', config)).toBe(false);
  });

  it('allows any localhost port outside production', () => {
    const config = testConfig({ CORS_ORIGINS: PAGES });

    expect(isAllowedOrigin('http://localhost:8082', config)).toBe(true);
    expect(isAllowedOrigin('not a url', config)).toBe(false);
  });

  it('only allows listed origins in production', () => {
    const config = testConfig({ CORS_ORIGINS: PAGES, NODE_ENV: 'production' });

    expect(isAllowedOrigin('http://localhost:8082', config)).toBe(false);
  });

  it('allows every origin when none is configured', () => {
    expect(isAllowedOrigin('https://any.test', testConfig())).toBe(true);
  });
});
