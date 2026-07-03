import { NetworkError } from '../domain/async-state';

export const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

/**
 * Thin fetch wrapper. It only guarantees "this is JSON that came back with a
 * 2xx status" — validating the *shape* of that JSON against a Zod schema is
 * the caller's responsibility (see pokeapi.service.ts), so no unvalidated
 * `any` ever leaves the api layer.
 */
export async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (cause) {
    throw new NetworkError(`Request failed: ${url}`, cause);
  }

  if (!response.ok) {
    throw new NetworkError(`Unexpected status ${response.status} for ${url}`);
  }

  return response.json();
}
