import { z } from 'zod';

export const namedApiResourceSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

export const pokemonListPageSchema = z.object({
  count: z.number(),
  next: z.string().url().nullable(),
  previous: z.string().url().nullable(),
  results: z.array(namedApiResourceSchema),
});

export type NamedApiResource = z.infer<typeof namedApiResourceSchema>;
export type PokemonListPage = z.infer<typeof pokemonListPageSchema>;
