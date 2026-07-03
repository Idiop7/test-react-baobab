/**
 * Discriminated union representing the lifecycle of any async resource in the app.
 * Screens must exhaustively switch on `status` instead of juggling loose
 * `isLoading` / `isError` booleans, which is the pattern required by the spec.
 */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'offline-cached'; data: T }
  | { status: 'error'; error: AppError };

export class AppError extends Error {
  readonly cause?: unknown;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'AppError';
    this.cause = options?.cause;
  }
}

export class ApiValidationError extends AppError {
  constructor(message: string, cause: unknown) {
    super(message, { cause });
    this.name = 'ApiValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'NetworkError';
  }
}

export function isSuccessLike<T>(
  state: AsyncState<T>,
): state is Extract<AsyncState<T>, { data: T }> {
  return state.status === 'success' || state.status === 'offline-cached';
}

/** Exhaustiveness helper for `switch` statements over `AsyncState['status']`. */
export function assertUnreachable(value: never): never {
  throw new Error(`Unhandled AsyncState status: ${JSON.stringify(value)}`);
}
