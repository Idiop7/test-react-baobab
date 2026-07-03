import { ApiValidationError, NetworkError } from '../domain/async-state';
import {
  fetchEvolutionChain,
  fetchEvolutionStages,
  fetchPokemonDetail,
  fetchPokemonListPage,
  fetchPokemonSpecies,
  flattenEvolutionChain,
} from './pokeapi.service';
import type { EvolutionNode, PokemonDetail } from './schemas';

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  }) as unknown as typeof fetch;
}

describe('flattenEvolutionChain', () => {
  it('flattens a linear multi-stage chain into an ordered stage list', () => {
    const chain: EvolutionNode = {
      species: { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon-species/4/' },
      evolves_to: [
        {
          species: { name: 'charmeleon', url: 'https://pokeapi.co/api/v2/pokemon-species/5/' },
          evolves_to: [
            {
              species: { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon-species/6/' },
              evolves_to: [],
            },
          ],
        },
      ],
    };

    expect(flattenEvolutionChain(chain)).toEqual([
      { id: 4, name: 'charmander' },
      { id: 5, name: 'charmeleon' },
      { id: 6, name: 'charizard' },
    ]);
  });

  it('returns a single stage for a pokémon that never evolves', () => {
    const chain: EvolutionNode = {
      species: { name: 'tauros', url: 'https://pokeapi.co/api/v2/pokemon-species/128/' },
      evolves_to: [],
    };
    expect(flattenEvolutionChain(chain)).toEqual([{ id: 128, name: 'tauros' }]);
  });
});

describe('fetchPokemonListPage', () => {
  afterEach(() => jest.restoreAllMocks());

  it('validates and returns a well-formed response', async () => {
    mockFetchOnce({
      count: 1,
      next: null,
      previous: null,
      results: [{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' }],
    });

    const page = await fetchPokemonListPage({ limit: 24, offset: 0 });
    expect(page.results[0]?.name).toBe('bulbasaur');
  });

  it('throws ApiValidationError when the API returns a malformed payload', async () => {
    mockFetchOnce({ count: 1, results: 'not-an-array' });
    await expect(fetchPokemonListPage({ limit: 24, offset: 0 })).rejects.toBeInstanceOf(
      ApiValidationError,
    );
  });

  it('throws NetworkError on a non-2xx response', async () => {
    mockFetchOnce({}, false, 503);
    await expect(fetchPokemonListPage({ limit: 24, offset: 0 })).rejects.toBeInstanceOf(
      NetworkError,
    );
  });
});

describe('fetchPokemonDetail', () => {
  afterEach(() => jest.restoreAllMocks());

  it('rejects when a required field is missing from the payload', async () => {
    mockFetchOnce({ id: 1, name: 'bulbasaur' });
    await expect(fetchPokemonDetail('bulbasaur')).rejects.toBeInstanceOf(ApiValidationError);
  });
});

describe('fetchPokemonSpecies', () => {
  afterEach(() => jest.restoreAllMocks());

  it('validates and returns the evolution chain url', async () => {
    mockFetchOnce({
      id: 1,
      name: 'bulbasaur',
      evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/1/' },
    });
    const species = await fetchPokemonSpecies('bulbasaur');
    expect(species.evolution_chain.url).toContain('evolution-chain');
  });
});

describe('fetchEvolutionChain', () => {
  afterEach(() => jest.restoreAllMocks());

  it('validates and returns the recursive chain', async () => {
    mockFetchOnce({
      id: 1,
      chain: {
        species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
        evolves_to: [],
      },
    });
    const chain = await fetchEvolutionChain('https://pokeapi.co/api/v2/evolution-chain/1/');
    expect(chain.chain.species.name).toBe('bulbasaur');
  });
});

describe('fetchEvolutionStages', () => {
  afterEach(() => jest.restoreAllMocks());

  it('composes species + evolution-chain lookups into a flat stage list', async () => {
    const pokemon = { name: 'bulbasaur', species: { name: 'bulbasaur' } } as PokemonDetail;

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: 1,
            name: 'bulbasaur',
            evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/1/' },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: 1,
            chain: {
              species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
              evolves_to: [
                {
                  species: {
                    name: 'ivysaur',
                    url: 'https://pokeapi.co/api/v2/pokemon-species/2/',
                  },
                  evolves_to: [],
                },
              ],
            },
          }),
      }) as unknown as typeof fetch;

    const stages = await fetchEvolutionStages(pokemon);
    expect(stages).toEqual([
      { id: 1, name: 'bulbasaur' },
      { id: 2, name: 'ivysaur' },
    ]);
  });
});
