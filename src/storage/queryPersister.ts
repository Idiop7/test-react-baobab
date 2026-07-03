import type { Persister } from '@tanstack/react-query-persist-client';
import type { PersistedClient } from '@tanstack/query-persist-client-core';
import { queryCacheStorage } from './mmkv';

const CACHE_KEY = 'REACT_QUERY_OFFLINE_CACHE';

/**
 * MMKV is synchronous, so this persister is simpler and faster than the
 * default AsyncStorage-based one shipped with react-query: no promises,
 * no bridge round-trip, just a JSON blob read/written on the JS thread.
 */
export const mmkvPersister: Persister = {
  persistClient: (client: PersistedClient) => {
    queryCacheStorage.set(CACHE_KEY, JSON.stringify(client));
  },
  restoreClient: () => {
    const cached = queryCacheStorage.getString(CACHE_KEY);
    if (!cached) return undefined;
    try {
      return JSON.parse(cached) as PersistedClient;
    } catch {
      queryCacheStorage.remove(CACHE_KEY);
      return undefined;
    }
  },
  removeClient: () => {
    queryCacheStorage.remove(CACHE_KEY);
  },
};
