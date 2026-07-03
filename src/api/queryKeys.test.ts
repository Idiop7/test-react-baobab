import { queryKeys } from './queryKeys';

describe('queryKeys', () => {
  it('builds stable, distinct keys per query kind and argument', () => {
    expect(queryKeys.pokemonList(24)).toEqual(['pokemon-list', 24]);
    expect(queryKeys.pokemonDetail('pikachu')).toEqual(['pokemon-detail', 'pikachu']);
    expect(queryKeys.pokemonEvolution('pikachu')).toEqual(['pokemon-evolution', 'pikachu']);
  });
});
