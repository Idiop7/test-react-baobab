import { pokemonDetailSchema } from './pokemon-detail.schema';

function buildValidPokemon() {
  return {
    id: 25,
    name: 'pikachu',
    height: 4,
    weight: 60,
    order: 35,
    base_experience: 112,
    sprites: {
      front_default: 'https://example.com/pikachu.png',
      other: {
        'official-artwork': { front_default: 'https://example.com/pikachu-art.png' },
      },
    },
    stats: [
      { base_stat: 35, effort: 0, stat: { name: 'hp', url: 'https://pokeapi.co/api/v2/stat/1/' } },
      {
        base_stat: 55,
        effort: 0,
        stat: { name: 'attack', url: 'https://pokeapi.co/api/v2/stat/2/' },
      },
    ],
    types: [{ slot: 1, type: { name: 'electric', url: 'https://pokeapi.co/api/v2/type/13/' } }],
    moves: [{ move: { name: 'thunder-shock', url: 'https://pokeapi.co/api/v2/move/84/' } }],
    species: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
  };
}

describe('pokemonDetailSchema', () => {
  it('parses a valid PokéAPI pokemon detail payload', () => {
    const result = pokemonDetailSchema.parse(buildValidPokemon());
    expect(result.name).toBe('pikachu');
    expect(result.stats).toHaveLength(2);
  });

  it('ignores unknown fields instead of throwing', () => {
    const withExtra = { ...buildValidPokemon(), held_items: [], game_indices: [] };
    expect(() => pokemonDetailSchema.parse(withExtra)).not.toThrow();
  });

  it('rejects a payload with the wrong type for a known field', () => {
    const invalid = { ...buildValidPokemon(), stats: 'not-an-array' };
    expect(() => pokemonDetailSchema.parse(invalid)).toThrow();
  });

  it('rejects a payload missing the types field entirely', () => {
    const { types: _types, ...withoutTypes } = buildValidPokemon();
    expect(() => pokemonDetailSchema.parse(withoutTypes)).toThrow();
  });
});
