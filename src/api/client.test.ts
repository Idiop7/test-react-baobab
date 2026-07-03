import { NetworkError } from '../domain/async-state';
import { fetchJson } from './client';

describe('fetchJson', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns the parsed JSON body on a 2xx response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ hello: 'world' }),
    }) as unknown as typeof fetch;

    await expect(fetchJson('https://example.com')).resolves.toEqual({ hello: 'world' });
  });

  it('wraps a rejected fetch promise (e.g. no connectivity) into a NetworkError', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;

    await expect(fetchJson('https://example.com')).rejects.toBeInstanceOf(NetworkError);
  });

  it('throws a NetworkError on a non-2xx response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({}),
    }) as unknown as typeof fetch;

    await expect(fetchJson('https://example.com')).rejects.toBeInstanceOf(NetworkError);
  });
});
