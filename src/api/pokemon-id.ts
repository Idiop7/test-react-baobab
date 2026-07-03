/**
 * PokéAPI resource URLs look like `https://pokeapi.co/api/v2/pokemon/25/`.
 * The trailing numeric segment is the only stable identifier exposed by the
 * list endpoints, so every screen that needs an id/sprite derives it from here.
 */
export function extractIdFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  if (!match) {
    throw new Error(`Unable to extract a numeric id from PokéAPI url: ${url}`);
  }
  return Number(match[1]);
}

export function officialArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}
