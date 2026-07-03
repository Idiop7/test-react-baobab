import { Image, Text, View } from 'react-native';
import { officialArtworkUrl } from '../../../api/pokemon-id';
import type { EvolutionStage } from '../../../api/pokeapi.service';

export function EvolutionRow({ stages }: { stages: EvolutionStage[] }) {
  if (stages.length <= 1) {
    return <Text className="text-sm text-gray-400">Ce Pokémon n&apos;évolue pas.</Text>;
  }

  return (
    <View className="flex-row flex-wrap items-center">
      {stages.map((stage, index) => (
        <View key={stage.id} className="flex-row items-center">
          <View className="items-center">
            <Image source={{ uri: officialArtworkUrl(stage.id) }} className="h-16 w-16" resizeMode="contain" />
            <Text className="text-xs capitalize text-gray-700">{stage.name}</Text>
          </View>
          {index < stages.length - 1 && <Text className="mx-2 text-gray-400">→</Text>}
        </View>
      ))}
    </View>
  );
}
