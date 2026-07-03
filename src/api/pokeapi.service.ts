import { z } from 'zod';
import { ApiValidationError } from '../domain/async-state';
import { fetchJson, POKEAPI_BASE_URL } from './client';
import { extractIdFromUrl } from './pokemon-id';
import {
  evolutionChainSchema,
  pokemonDetailSchema,
  pokemonListPageSchema,
  pokemonSpeciesSchema,
  type EvolutionChain,
  type EvolutionNode,
  type PokemonDetail,
  type PokemonListPage,
  type PokemonSpecies,
} from './schemas';

/**
 * Every PokéAPI response is parsed with Zod right here, at the boundary
 * between the network and the rest of the app. Nothing downstream ever sees
 * unvalidated data.
 */
function parseOrThrow<T>(schema: z.ZodType<T>, raw: unknown, context: string): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ApiValidationError(`Invalid API payload for ${context}`, result.error);
  }
  return result.data;
}

export async function fetchPokemonListPage(
  params: { limit: number; offset: number },
  signal?: AbortSignal,
): Promise<PokemonListPage> {
  const url = `${POKEAPI_BASE_URL}/pokemon?limit=${params.limit}&offset=${params.offset}`;
  const raw = await fetchJson(url, signal);
  return parseOrThrow(pokemonListPageSchema, raw, 'pokemon list page');
}

export async function fetchPokemonDetail(
  nameOrId: string | number,
  signal?: AbortSignal,
): Promise<PokemonDetail> {
  const url = `${POKEAPI_BASE_URL}/pokemon/${nameOrId}`;
  const raw = await fetchJson(url, signal);
  return parseOrThrow(pokemonDetailSchema, raw, `pokemon detail (${nameOrId})`);
}

export async function fetchPokemonSpecies(
  nameOrId: string | number,
  signal?: AbortSignal,
): Promise<PokemonSpecies> {
  const url = `${POKEAPI_BASE_URL}/pokemon-species/${nameOrId}`;
  const raw = await fetchJson(url, signal);
  return parseOrThrow(pokemonSpeciesSchema, raw, `pokemon species (${nameOrId})`);
}

export async function fetchEvolutionChain(
  url: string,
  signal?: AbortSignal,
): Promise<EvolutionChain> {
  const raw = await fetchJson(url, signal);
  return parseOrThrow(evolutionChainSchema, raw, `evolution chain (${url})`);
}

export interface EvolutionStage {
  id: number;
  name: string;
}

/** Flattens the recursive evolution tree into a linear stage list (handles branching by taking the first path — sufficient for display purposes). */
export function flattenEvolutionChain(node: EvolutionNode): EvolutionStage[] {
  const stages: EvolutionStage[] = [{ id: extractIdFromUrl(node.species.url), name: node.species.name }];
  let current = node;
  while (current.evolves_to.length > 0) {
    const next = current.evolves_to[0];
    if (!next) break;
    current = next;
    stages.push({ id: extractIdFromUrl(current.species.url), name: current.species.name });
  }
  return stages;
}

export async function fetchEvolutionStages(
  pokemon: PokemonDetail,
  signal?: AbortSignal,
): Promise<EvolutionStage[]> {
  const species = await fetchPokemonSpecies(pokemon.species.name, signal);
  const chain = await fetchEvolutionChain(species.evolution_chain.url, signal);
  return flattenEvolutionChain(chain.chain);
}
