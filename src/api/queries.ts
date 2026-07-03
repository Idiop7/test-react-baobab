import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import {
  fetchEvolutionStages,
  fetchPokemonDetail,
  fetchPokemonListPage,
  type EvolutionStage,
} from './pokeapi.service';
import type { PokemonDetail } from './schemas';

const POKEMON_BASE_DATA_STALE_TIME = Infinity; // a pokémon's base stats/types never change server-side

export function usePokemonListQuery(pageSize = 24) {
  return useInfiniteQuery({
    queryKey: queryKeys.pokemonList(pageSize),
    queryFn: ({ pageParam, signal }) =>
      fetchPokemonListPage({ limit: pageSize, offset: pageParam }, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length * pageSize : undefined,
  });
}

export function usePokemonDetailQuery(nameOrId: string) {
  return useQuery({
    queryKey: queryKeys.pokemonDetail(nameOrId),
    queryFn: ({ signal }) => fetchPokemonDetail(nameOrId, signal),
    staleTime: POKEMON_BASE_DATA_STALE_TIME,
    enabled: nameOrId.length > 0,
  });
}

export function usePokemonEvolutionQuery(pokemon: PokemonDetail | undefined) {
  return useQuery<EvolutionStage[]>({
    queryKey: queryKeys.pokemonEvolution(pokemon?.name ?? ''),
    queryFn: ({ signal }) => fetchEvolutionStages(pokemon as PokemonDetail, signal),
    staleTime: POKEMON_BASE_DATA_STALE_TIME,
    enabled: pokemon !== undefined,
  });
}
