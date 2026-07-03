import { AppError, type AsyncState } from '../domain/async-state';

export interface QueryLike<T> {
  status: 'pending' | 'error' | 'success';
  data: T | undefined;
  error: Error | null;
  isPaused: boolean;
}

/**
 * Adapts a react-query result into the app-wide AsyncState discriminated
 * union so screens pattern-match on `status` instead of reading loose
 * `isLoading`/`isError`/`data` fields independently.
 */
export function toAsyncState<T>(query: QueryLike<T>): AsyncState<T> {
  if (query.status === 'pending') {
    return { status: 'loading' };
  }

  if (query.status === 'error') {
    const error =
      query.error instanceof AppError
        ? query.error
        : new AppError(query.error?.message ?? 'Unknown error', { cause: query.error });
    return { status: 'error', error };
  }

  // status === 'success' — TS can't narrow query.data to non-undefined from status alone.
  const data = query.data as T;
  return query.isPaused ? { status: 'offline-cached', data } : { status: 'success', data };
}
