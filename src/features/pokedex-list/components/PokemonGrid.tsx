import { FlashList, type ViewToken } from '@shopify/flash-list';
import { useCallback } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { extractIdFromUrl } from '../../../api/pokemon-id';
import type { NamedApiResource } from '../../../api/schemas';
import { useStatsStore } from '../../../state/statsStore';
import { PokemonGridItem } from './PokemonGridItem';

interface PokemonGridProps {
  items: NamedApiResource[];
  onItemPress: (name: string) => void;
  onEndReached: () => void;
  isFetchingNextPage: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 40 };

export function PokemonGrid({
  items,
  onItemPress,
  onEndReached,
  isFetchingNextPage,
  refreshing,
  onRefresh,
}: PokemonGridProps) {
  const setVisibleIds = useStatsStore((state) => state.setVisibleIds);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<NamedApiResource>[] }) => {
      const ids = viewableItems
        .filter((v) => v.item !== undefined)
        .map((v) => extractIdFromUrl(v.item.url));
      setVisibleIds(ids);
    },
    [setVisibleIds],
  );

  const renderItem = useCallback(
    ({ item }: { item: NamedApiResource }) => (
      <PokemonGridItem name={item.name} url={item.url} onPress={onItemPress} />
    ),
    [onItemPress],
  );

  return (
    <FlashList
      data={items}
      keyExtractor={(item) => item.name}
      renderItem={renderItem}
      numColumns={2}
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={VIEWABILITY_CONFIG}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      removeClippedSubviews
      ListFooterComponent={
        isFetchingNextPage ? (
          <View className="py-4">
            <ActivityIndicator />
          </View>
        ) : null
      }
    />
  );
}
