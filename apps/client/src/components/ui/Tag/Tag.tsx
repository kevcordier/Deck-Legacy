import { Text, TextStyle } from '@components/ui/Text/Text';
import { View } from 'react-native';

type TagProps = {
  readonly label: string;
  /** Container classes (background / border). */
  readonly className?: string;
  /** Label classes (color / size), overriding the defaults. */
  readonly textClassName?: string;
};

export function Tag({ label, className = 'bg-black/20', textClassName = '' }: TagProps) {
  return (
    <View className={`self-start rounded px-1 py-0.5 ${className}`}>
      <TextStyle className="font-display text-base-ink text-xs">
        <Text className={textClassName}>{label}</Text>
      </TextStyle>
    </View>
  );
}
