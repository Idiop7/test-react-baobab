import { memo, useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

/**
 * Width interpolation runs on the UI thread via Reanimated, so the 500ms
 * stat-stress ticks never block the JS thread just to animate a bar.
 */
function StatBarImpl({ label, value, max, color }: StatBarProps) {
  const ratio = useSharedValue(Math.min(1, value / max));

  useEffect(() => {
    ratio.value = withTiming(Math.min(1, value / max), { duration: 350 });
  }, [value, max, ratio]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${ratio.value * 100}%`,
  }));

  return (
    <View className="mb-1 flex-row items-center">
      <Text className="w-16 text-xs text-gray-500">{label}</Text>
      <View className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
        <Animated.View style={[{ height: '100%', backgroundColor: color }, animatedStyle]} />
      </View>
      <Text className="ml-2 w-8 text-right text-xs font-semibold text-gray-700">{value}</Text>
    </View>
  );
}

export const StatBar = memo(StatBarImpl);
