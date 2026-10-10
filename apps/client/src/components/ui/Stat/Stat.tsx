import { Text } from '@components/ui/Text/Text';
import { View } from 'react-native';

type StatProps = {
  readonly label: string;
  readonly value: number | string;
};

export function Stat({ label, value }: StatProps) {
  return (
    <View className="items-start justify-center gap-1">
      <Text className="text-xs">{label}</Text>
      <Text className="text-ink/80 font-display text-sm font-semibold">{value}</Text>
    </View>
  );
}
