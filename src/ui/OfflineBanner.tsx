import { Text, View } from 'react-native';

export function OfflineBanner() {
  return (
    <View className="bg-amber-500 px-3 py-1.5">
      <Text className="text-center text-xs font-semibold text-white">
        Mode hors-ligne — données en cache
      </Text>
    </View>
  );
}
