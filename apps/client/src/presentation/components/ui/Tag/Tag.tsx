import { Text } from '@components/ui/Text/Text';
import { TextStyle } from '@components/ui/Text/TextStyle';
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
      <TextStyle className="font-display text-ink-card text-xs">
        <Text className={textClassName}>{label}</Text>
      </TextStyle>
    </View>
  );
}
