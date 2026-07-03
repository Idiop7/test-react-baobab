import { View, type ViewProps } from 'react-native';

export function Skeleton({ className, ...rest }: ViewProps & { className?: string }) {
  return <View className={`animate-pulse rounded-md bg-gray-200 ${className ?? ''}`} {...rest} />;
}
