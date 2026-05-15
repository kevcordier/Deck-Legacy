import { Button } from '@components/ui/Button/Button';
import { StickerDisplay } from '@components/ui/StickerDisplay/StickerDisplay';
import type { Sticker } from '@engine/domain/types';

interface StickerChoiceProps {
  readonly options: Sticker[];
  readonly disabled?: boolean;
  readonly onSelect: (stickerIds: number[]) => void;
  readonly className?: string;
}

export function StickerChoice({
  options,
  disabled = false,
  onSelect,
  className,
}: StickerChoiceProps) {
  return (
    <div className={`flex items-center gap-2 p-2 flex-wrap justify-center ${className}`}>
      {options.map(sticker => {
        return (
          <Button
            key={sticker.id}
            onClick={() => onSelect([sticker.id])}
            variant="text"
            disabled={disabled}
            className="transition-transform hover:scale-[1.02]"
          >
            <StickerDisplay sticker={sticker} />
          </Button>
        );
      })}
    </div>
  );
}
