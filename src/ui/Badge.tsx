import { Text, View } from 'react-native';
import { colorForType } from './typeColors';

export function TypeBadge({ typeName }: { typeName: string }) {
  return (
    <View
      className="mr-1 rounded-full px-2 py-0.5"
      style={{ backgroundColor: colorForType(typeName) }}
    >
      <Text className="text-xs font-semibold uppercase text-white">{typeName}</Text>
    </View>
  );
}
