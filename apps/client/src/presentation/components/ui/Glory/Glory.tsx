import { IconColors } from '@components/ui/Icon/iconColors';
import { GloryIcon } from '@components/ui/Icon/icons/GloryIcon';
import { Text } from '@components/ui/Text/Text';
import { View } from 'react-native';

type GloryProps = {
  readonly glory?: number;
  /** Container size classes (defaults to `size-10`). */
  readonly className?: string;
  /** Text size class of the value (defaults to `text-base`). */
  readonly textClassName?: string;
};

export function Glory({ glory, className = 'size-10', textClassName = 'text-base' }: GloryProps) {
  const isNegative = glory !== undefined && glory < 0;
  return (
    <View className={`relative aspect-square items-center justify-center ${className}`}>
      <GloryIcon
        color={IconColors.gold}
        fill="rgba(199, 146, 51, 0.9)"
        className="absolute inset-0 size-full"
      />
      <Text
        className={`font-display font-bold ${isNegative ? 'text-danger' : 'text-ink-card'} ${textClassName}`}
      >
        {glory ?? ''}
      </Text>
    </View>
  );
}
