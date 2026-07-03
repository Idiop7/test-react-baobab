import { evolutionChainSchema } from './evolution-chain.schema';

describe('evolutionChainSchema', () => {
  it('parses a recursive multi-stage evolution chain', () => {
    const raw = {
      id: 1,
      chain: {
        species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
        evolves_to: [
          {
            species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
            evolves_to: [
              {
                species: {
                  name: 'venusaur',
                  url: 'https://pokeapi.co/api/v2/pokemon-species/3/',
                },
                evolves_to: [],
              },
            ],
          },
        ],
      },
    };

    const result = evolutionChainSchema.parse(raw);
    expect(result.chain.species.name).toBe('bulbasaur');
    expect(result.chain.evolves_to[0]?.species.name).toBe('ivysaur');
    expect(result.chain.evolves_to[0]?.evolves_to[0]?.species.name).toBe('venusaur');
  });

  it('parses a chain with no evolutions', () => {
    const raw = {
      id: 2,
      chain: {
        species: { name: 'tauros', url: 'https://pokeapi.co/api/v2/pokemon-species/128/' },
        evolves_to: [],
      },
    };

    expect(() => evolutionChainSchema.parse(raw)).not.toThrow();
  });

  it('rejects a chain node missing species', () => {
    const invalid = { id: 3, chain: { evolves_to: [] } };
    expect(() => evolutionChainSchema.parse(invalid)).toThrow();
  });
});
