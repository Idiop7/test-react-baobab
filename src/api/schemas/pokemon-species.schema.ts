import { z } from 'zod';

export const pokemonSpeciesSchema = z.object({
  id: z.number(),
  name: z.string(),
  evolution_chain: z.object({ url: z.string().url() }),
});

export type PokemonSpecies = z.infer<typeof pokemonSpeciesSchema>;
