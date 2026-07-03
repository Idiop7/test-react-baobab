import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PokedexListScreen } from '../features/pokedex-list/PokedexListScreen';
import { PokemonDetailsScreen } from '../features/pokemon-details/PokemonDetailsScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PokedexList" component={PokedexListScreen} />
        <Stack.Screen
          name="PokemonDetails"
          component={PokemonDetailsScreen}
          options={{ headerShown: true, title: '', headerBackTitle: 'Retour' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
