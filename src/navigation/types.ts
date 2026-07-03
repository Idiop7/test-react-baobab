export type RootStackParamList = {
  PokedexList: undefined;
  PokemonDetails: { pokemonName: string };
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- required shape by react-navigation's typing recipe
    interface RootParamList extends RootStackParamList {}
  }
}
