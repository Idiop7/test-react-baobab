import { z } from 'zod';
import { namedApiResourceSchema } from './pokemon-list.schema';

export interface EvolutionNode {
  species: z.infer<typeof namedApiResourceSchema>;
  evolves_to: EvolutionNode[];
}

// z.lazy is required because the PokéAPI evolution chain is a recursive tree.
export const evolutionNodeSchema: z.ZodType<EvolutionNode> = z.lazy(() =>
  z.object({
    species: namedApiResourceSchema,
    evolves_to: z.array(evolutionNodeSchema),
  }),
);

export const evolutionChainSchema = z.object({
  id: z.number(),
  chain: evolutionNodeSchema,
});

export type EvolutionChain = z.infer<typeof evolutionChainSchema>;
