import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePokemonListQuery } from '../../api/queries';
import { assertUnreachable } from '../../domain/async-state';
import { toAsyncState } from '../../lib/toAsyncState';
import type { RootStackParamList } from '../../navigation/types';
import { OfflineBanner } from '../../ui/OfflineBanner';
import { PokemonGrid } from './components/PokemonGrid';
import { useStatsTicker } from './hooks/useStatsTicker';

type Props = NativeStackScreenProps<RootStackParamList, 'PokedexList'>;

export function PokedexListScreen({ navigation }: Props) {
  useStatsTicker(500);
  const [search, setSearch] = useState('');
  const listQuery = usePokemonListQuery(24);
  const asyncState = toAsyncState(listQuery);

  const allItems = useMemo(
    () => listQuery.data?.pages.flatMap((page) => page.results) ?? [],
    [listQuery.data],
  );

  const filteredItems = useMemo(() => {
    if (!search.trim()) return allItems;
    const query = search.trim().toLowerCase();
    return allItems.filter((item) => item.name.includes(query));
  }, [allItems, search]);

  const handleItemPress = (name: string) => navigation.navigate('PokemonDetails', { pokemonName: name });

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {asyncState.status === 'offline-cached' && <OfflineBanner />}

      <View className="px-3 pb-2 pt-1">
        <Text className="mb-2 text-2xl font-bold text-gray-900">Grille de Combat</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un Pokémon..."
          placeholderTextColor="#9CA3AF"
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {renderBody()}
    </SafeAreaView>
  );

  function renderBody() {
    switch (asyncState.status) {
      case 'idle':
      case 'loading':
        return (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-400">Chargement du Pokédex…</Text>
          </View>
        );
      case 'error':
        return (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-red-500">{asyncState.error.message}</Text>
          </View>
        );
      case 'success':
      case 'offline-cached':
        return (
          <PokemonGrid
            items={filteredItems}
            onItemPress={handleItemPress}
            onEndReached={() => {
              if (listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
                listQuery.fetchNextPage();
              }
            }}
            isFetchingNextPage={listQuery.isFetchingNextPage}
            refreshing={listQuery.isRefetching}
            onRefresh={() => listQuery.refetch()}
          />
        );
      default:
        return assertUnreachable(asyncState);
    }
  }
}
