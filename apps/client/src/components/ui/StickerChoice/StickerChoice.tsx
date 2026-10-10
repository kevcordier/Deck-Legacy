import { StickerDisplay } from '@components/ui/StickerDisplay/StickerDisplay';
import type { Sticker } from '@deck-legacy/engine/domain/types';
import { Pressable, View } from 'react-native';

interface StickerChoiceProps {
  readonly options: Sticker[];
  readonly disabled?: boolean;
  readonly onSelect: (stickerIds: number[]) => void;
  readonly className?: string;
  readonly stickerClassName?: string;
}

export function StickerChoice({
  options,
  disabled = false,
  onSelect,
  className = '',
  stickerClassName,
}: StickerChoiceProps) {
  return (
    <View className={`flex-row flex-wrap items-center justify-center gap-2 p-2 ${className}`}>
      {options.map(sticker => (
        <Pressable
          key={sticker.id}
          onPress={() => onSelect([sticker.id])}
          disabled={disabled}
          accessibilityRole="button"
          className={`rounded p-2 active:opacity-70 ${disabled ? 'opacity-50' : ''}`}
        >
          <StickerDisplay sticker={sticker} className={stickerClassName} />
        </Pressable>
      ))}
    </View>
  );
}
