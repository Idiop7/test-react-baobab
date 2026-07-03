import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePokemonDetailQuery, usePokemonEvolutionQuery } from '../../api/queries';
import { officialArtworkUrl } from '../../api/pokemon-id';
import { assertUnreachable } from '../../domain/async-state';
import { toAsyncState } from '../../lib/toAsyncState';
import type { RootStackParamList } from '../../navigation/types';
import { TypeBadge } from '../../ui/Badge';
import { OfflineBanner } from '../../ui/OfflineBanner';
import { StatBar } from '../../ui/StatBar';
import { colorForType } from '../../ui/typeColors';
import { EvolutionRow } from './components/EvolutionRow';
import { MoveList } from './components/MoveList';

type Props = NativeStackScreenProps<RootStackParamList, 'PokemonDetails'>;

const STAT_MAX = 200;

export function PokemonDetailsScreen({ route }: Props) {
  const { pokemonName } = route.params;
  const detailQuery = usePokemonDetailQuery(pokemonName);
  const detailState = toAsyncState(detailQuery);
  const evolutionQuery = usePokemonEvolutionQuery(detailQuery.data);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {detailState.status === 'offline-cached' && <OfflineBanner />}
      {renderBody()}
    </SafeAreaView>
  );

  function renderBody() {
    switch (detailState.status) {
      case 'idle':
      case 'loading':
        return (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-400">Chargement…</Text>
          </View>
        );
      case 'error':
        return (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-red-500">{detailState.error.message}</Text>
          </View>
        );
      case 'success':
      case 'offline-cached': {
        const pokemon = detailState.data;
        const primaryColor = colorForType(pokemon.types[0]?.type.name ?? 'normal');
        return (
          <ScrollView className="flex-1 px-4" contentContainerClassName="pb-10">
            <View className="items-center py-4">
              <Image
                source={{
                  uri: pokemon.sprites.other?.['official-artwork']?.front_default ?? officialArtworkUrl(pokemon.id),
                }}
                className="h-40 w-40"
                resizeMode="contain"
              />
              <Text className="text-xs text-gray-400">#{pokemon.id.toString().padStart(3, '0')}</Text>
              <Text className="text-2xl font-bold capitalize text-gray-900">{pokemon.name}</Text>
              <View className="mt-2 flex-row">
                {pokemon.types.map((t) => (
                  <TypeBadge key={t.type.name} typeName={t.type.name} />
                ))}
              </View>
            </View>

            <Section title="Statistiques de base">
              {pokemon.stats.map((stat) => (
                <StatBar
                  key={stat.stat.name}
                  label={stat.stat.name}
                  value={stat.base_stat}
                  max={STAT_MAX}
                  color={primaryColor}
                />
              ))}
            </Section>

            <Section title="Évolutions">
              {evolutionQuery.data ? (
                <EvolutionRow stages={evolutionQuery.data} />
              ) : (
                <Text className="text-sm text-gray-400">Chargement des évolutions…</Text>
              )}
            </Section>

            <Section title={`Mouvements (${pokemon.moves.length})`}>
              <MoveList moves={pokemon.moves} />
            </Section>
          </ScrollView>
        );
      }
      default:
        return assertUnreachable(detailState);
    }
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-base font-semibold text-gray-800">{title}</Text>
      {children}
    </View>
  );
}
