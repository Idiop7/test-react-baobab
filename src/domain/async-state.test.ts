import { AppError, ApiValidationError, NetworkError, assertUnreachable, isSuccessLike } from './async-state';

describe('isSuccessLike', () => {
  it('is true for success and offline-cached states', () => {
    expect(isSuccessLike({ status: 'success', data: 1 })).toBe(true);
    expect(isSuccessLike({ status: 'offline-cached', data: 1 })).toBe(true);
  });

  it('is false for idle, loading and error states', () => {
    expect(isSuccessLike({ status: 'idle' })).toBe(false);
    expect(isSuccessLike({ status: 'loading' })).toBe(false);
    expect(isSuccessLike({ status: 'error', error: new AppError('x') })).toBe(false);
  });
});

describe('assertUnreachable', () => {
  it('throws, documenting an impossible branch', () => {
    // @ts-expect-error intentionally passing a non-never value to exercise the runtime guard
    expect(() => assertUnreachable('unexpected')).toThrow();
  });
});

describe('error classes', () => {
  it('ApiValidationError carries the original cause', () => {
    const cause = new Error('bad shape');
    const error = new ApiValidationError('invalid payload', cause);
    expect(error.name).toBe('ApiValidationError');
    expect(error.cause).toBe(cause);
    expect(error).toBeInstanceOf(AppError);
  });

  it('NetworkError is constructible without a cause', () => {
    const error = new NetworkError('offline');
    expect(error.name).toBe('NetworkError');
    expect(error.message).toBe('offline');
  });
});
