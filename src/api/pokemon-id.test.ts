import { extractIdFromUrl, officialArtworkUrl } from './pokemon-id';

describe('extractIdFromUrl', () => {
  it('extracts the trailing numeric id from a PokéAPI resource url', () => {
    expect(extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
  });

  it('works without a trailing slash', () => {
    expect(extractIdFromUrl('https://pokeapi.co/api/v2/pokemon-species/1')).toBe(1);
  });

  it('throws when the url has no numeric id segment', () => {
    expect(() => extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/not-a-number/')).toThrow();
  });
});

describe('officialArtworkUrl', () => {
  it('builds a sprite url from an id', () => {
    expect(officialArtworkUrl(25)).toContain('/25.png');
  });
});
