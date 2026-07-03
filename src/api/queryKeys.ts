export const queryKeys = {
  pokemonList: (pageSize: number) => ['pokemon-list', pageSize] as const,
  pokemonDetail: (nameOrId: string) => ['pokemon-detail', nameOrId] as const,
  pokemonEvolution: (nameOrId: string) => ['pokemon-evolution', nameOrId] as const,
};
