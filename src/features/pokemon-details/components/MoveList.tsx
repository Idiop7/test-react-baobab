import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { PokemonDetail } from '../../../api/schemas';

const INITIAL_VISIBLE_COUNT = 12;

export function MoveList({ moves }: { moves: PokemonDetail['moves'] }) {
  const [expanded, setExpanded] = useState(false);
  const visibleMoves = expanded ? moves : moves.slice(0, INITIAL_VISIBLE_COUNT);

  return (
    <View>
      <View className="flex-row flex-wrap">
        {visibleMoves.map((m) => (
          <View key={m.move.name} className="mb-1.5 mr-1.5 rounded-full bg-gray-100 px-2.5 py-1">
            <Text className="text-xs capitalize text-gray-700">{m.move.name.replace(/-/g, ' ')}</Text>
          </View>
        ))}
      </View>
      {moves.length > INITIAL_VISIBLE_COUNT && (
        <Pressable onPress={() => setExpanded((v) => !v)}>
          <Text className="text-xs font-semibold text-blue-500">
            {expanded ? 'Voir moins' : `Voir les ${moves.length - INITIAL_VISIBLE_COUNT} autres mouvements`}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
