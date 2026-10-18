import { ApiError } from '@application/ports/ApiError';
import { accessToken } from '@infrastructure/api/accessToken';
import { api } from '@infrastructure/api/api';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@infrastructure/config/config', () => ({ config: { apiUrl: 'http://api.test' } }));

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => {
  vi.unstubAllGlobals();
  accessToken.provide(() => Promise.resolve(null));
});

describe('api', () => {
  it('sends the access token and returns the data', async () => {
    const fetchMock = vi.fn(async (_request: Request) => json(200, []));
    vi.stubGlobal('fetch', fetchMock);
    accessToken.provide(() => Promise.resolve('tok'));

    await expect(api.listGames()).resolves.toEqual([]);
    const request = fetchMock.mock.calls[0][0];
    expect(request.url).toBe('http://api.test/games');
    expect(request.headers.get('Authorization')).toBe('Bearer tok');
  });

  it('throws an ApiError with the error body', async () => {
    const body = { statusCode: 409, code: 'STALE_VERSION', message: 'stale' };
    vi.stubGlobal('fetch', async () => json(409, body));

    const error = await api.syncGame('g1', { events: [] }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(409);
    expect((error as ApiError).code).toBe('STALE_VERSION');
  });

  it('throws an ApiError with status 0 when the network fails', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new TypeError('offline');
    });
    await expect(api.getMe()).rejects.toMatchObject({ status: 0, message: 'errors.network' });
  });

  it('returns nothing on 204', async () => {
    vi.stubGlobal('fetch', async () => new Response(null, { status: 204 }));
    await expect(api.deleteMe()).resolves.toBeUndefined();
  });
});
