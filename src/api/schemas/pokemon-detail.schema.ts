import { z } from 'zod';
import { namedApiResourceSchema } from './pokemon-list.schema';

export const pokemonStatSchema = z.object({
  base_stat: z.number(),
  effort: z.number(),
  stat: namedApiResourceSchema,
});

export const pokemonTypeSlotSchema = z.object({
  slot: z.number(),
  type: namedApiResourceSchema,
});

export const pokemonMoveSchema = z.object({
  move: namedApiResourceSchema,
});

export const pokemonSpritesSchema = z.object({
  front_default: z.string().url().nullable(),
  other: z
    .object({
      'official-artwork': z
        .object({ front_default: z.string().url().nullable() })
        .optional(),
    })
    .optional(),
});

export const pokemonDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  height: z.number(),
  weight: z.number(),
  order: z.number(),
  base_experience: z.number().nullable(),
  sprites: pokemonSpritesSchema,
  stats: z.array(pokemonStatSchema),
  types: z.array(pokemonTypeSlotSchema),
  moves: z.array(pokemonMoveSchema),
  species: namedApiResourceSchema,
});

export type PokemonStat = z.infer<typeof pokemonStatSchema>;
export type PokemonTypeSlot = z.infer<typeof pokemonTypeSlotSchema>;
export type PokemonDetail = z.infer<typeof pokemonDetailSchema>;
