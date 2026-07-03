import { memo, useEffect } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { extractIdFromUrl, officialArtworkUrl } from '../../../api/pokemon-id';
import { usePokemonDetailQuery } from '../../../api/queries';
import { useStatsStore } from '../../../state/statsStore';
import { Skeleton } from '../../../ui/Skeleton';
import { TypeBadge } from '../../../ui/Badge';

interface PokemonGridItemProps {
  name: string;
  url: string;
  onPress: (name: string) => void;
}

function PokemonGridItemImpl({ name, url, onPress }: PokemonGridItemProps) {
  const id = extractIdFromUrl(url);
  const detailQuery = usePokemonDetailQuery(name);
  const registerBaseStats = useStatsStore((state) => state.registerBaseStats);

  // Selector scoped to this item's own id: a stress-test tick only ever
  // changes `liveStats[id]` for visible ids, so off-screen/other cells keep
  // the same object reference and never re-render.
  const liveStats = useStatsStore((state) => state.liveStats[id]);

  useEffect(() => {
    if (!detailQuery.data) return;
    const hp = detailQuery.data.stats.find((s) => s.stat.name === 'hp')?.base_stat ?? 1;
    const attack = detailQuery.data.stats.find((s) => s.stat.name === 'attack')?.base_stat ?? 1;
    registerBaseStats(id, { hp, attack });
  }, [detailQuery.data, id, registerBaseStats]);

  const detail = detailQuery.data;

  return (
    <Pressable
      onPress={() => onPress(name)}
      className="m-1 flex-1 rounded-xl border border-gray-200 bg-white p-2"
      testID={`pokemon-grid-item-${name}`}
    >
      <Image
        source={{ uri: detail?.sprites.other?.['official-artwork']?.front_default ?? officialArtworkUrl(id) }}
        className="h-20 w-full"
        resizeMode="contain"
      />
      <Text className="text-center text-xs text-gray-400">#{id.toString().padStart(3, '0')}</Text>
      <Text className="text-center text-sm font-semibold capitalize text-gray-900">{name}</Text>

      {detail ? (
        <View className="mt-1 flex-row flex-wrap justify-center">
          {detail.types.map((t) => (
            <TypeBadge key={t.type.name} typeName={t.type.name} />
          ))}
        </View>
      ) : (
        <Skeleton className="mt-1 h-4 w-10 self-center" />
      )}

      {liveStats ? (
        <View className="mt-1 flex-row justify-around">
          <Text className="text-[10px] text-red-500">PV {liveStats.hp}</Text>
          <Text className="text-[10px] text-orange-500">ATK {liveStats.attack}</Text>
        </View>
      ) : (
        <Skeleton className="mt-1 h-3 w-full" />
      )}
    </Pressable>
  );
}

function propsAreEqual(prev: PokemonGridItemProps, next: PokemonGridItemProps): boolean {
  return prev.name === next.name && prev.url === next.url;
}

export const PokemonGridItem = memo(PokemonGridItemImpl, propsAreEqual);
