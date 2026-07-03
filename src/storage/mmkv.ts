import { createMMKV } from 'react-native-mmkv';

/**
 * Backs the react-query offline cache (see storage/queryPersister.ts).
 * `createMMKV` auto-mocks itself under Jest (`isTest()` checks
 * `JEST_WORKER_ID`), so no manual mock is needed for unit tests.
 */
export const queryCacheStorage = createMMKV({ id: 'pokedex-query-cache' });
