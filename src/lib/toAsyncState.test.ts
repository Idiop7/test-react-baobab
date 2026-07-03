import { AppError } from '../domain/async-state';
import { toAsyncState, type QueryLike } from './toAsyncState';

describe('toAsyncState', () => {
  it('maps a pending query to loading', () => {
    const query: QueryLike<string> = { status: 'pending', data: undefined, error: null, isPaused: false };
    expect(toAsyncState(query)).toEqual({ status: 'loading' });
  });

  it('maps a successful, non-paused query to success', () => {
    const query: QueryLike<string> = { status: 'success', data: 'pikachu', error: null, isPaused: false };
    expect(toAsyncState(query)).toEqual({ status: 'success', data: 'pikachu' });
  });

  it('maps a successful but paused query (offline, serving cache) to offline-cached', () => {
    const query: QueryLike<string> = { status: 'success', data: 'pikachu', error: null, isPaused: true };
    expect(toAsyncState(query)).toEqual({ status: 'offline-cached', data: 'pikachu' });
  });

  it('wraps a plain Error into an AppError for the error state', () => {
    const query: QueryLike<string> = {
      status: 'error',
      data: undefined,
      error: new Error('network down'),
      isPaused: false,
    };
    const result = toAsyncState(query);
    expect(result.status).toBe('error');
    if (result.status === 'error') {
      expect(result.error).toBeInstanceOf(AppError);
      expect(result.error.message).toBe('network down');
    }
  });

  it('passes an existing AppError through unwrapped', () => {
    const original = new AppError('boom');
    const query: QueryLike<string> = { status: 'error', data: undefined, error: original, isPaused: false };
    const result = toAsyncState(query);
    expect(result.status).toBe('error');
    if (result.status === 'error') {
      expect(result.error).toBe(original);
    }
  });
});
