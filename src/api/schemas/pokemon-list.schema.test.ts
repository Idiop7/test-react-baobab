import { pokemonListPageSchema } from './pokemon-list.schema';

describe('pokemonListPageSchema', () => {
  it('parses a valid PokéAPI list page', () => {
    const raw = {
      count: 1302,
      next: 'https://pokeapi.co/api/v2/pokemon?offset=24&limit=24',
      previous: null,
      results: [{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' }],
    };

    const result = pokemonListPageSchema.parse(raw);
    expect(result.results).toHaveLength(1);
    expect(result.results[0]).toEqual(raw.results[0]);
  });

  it('rejects a payload missing required fields', () => {
    const invalid = { count: 1302, results: [{ name: 'bulbasaur' }] };
    expect(() => pokemonListPageSchema.parse(invalid)).toThrow();
  });

  it('rejects a payload where results is not an array', () => {
    const invalid = { count: 1, next: null, previous: null, results: 'not-an-array' };
    expect(() => pokemonListPageSchema.parse(invalid)).toThrow();
  });
});
