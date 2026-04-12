import { Button } from '@components/ui/Button/Button';
import { Glory } from '@components/ui/Glory/Glory';
import { PassifIcon } from '@components/ui/Icon/icon';
import { ResourcePill } from '@components/ui/ResourcePill/ResourcePill';
import { Tag } from '@components/ui/Tag/Tag';
import type { Sticker } from '@engine/domain/types';
import { useTranslation } from 'react-i18next';

interface StickerChoiceProps {
  options: Sticker[];
  disabled?: boolean;
  onSelect: (stickerId: number) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function StickerChoice({
  options,
  disabled = false,
  onSelect,
  size = 'md',
}: StickerChoiceProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      {options.map(sticker => {
        const content = () => {
          if (sticker.production) {
            return <ResourcePill resource={sticker.production} size={size} />;
          } else if (sticker.glory) {
            return <Glory glory={sticker.glory} />;
          } else if (sticker.effectId === 'stays_in_play') {
            return (
              <span className="font-body! text-base-ink rounded-md bg-white/60 px-3! py-2! text-xs backdrop-blur-sm @3xs/card:text-lg">
                <PassifIcon className="size-3 @3xs/card:size-6" /> {t('card.stayInPlay')}
              </span>
            );
          } else if (sticker.tags) {
            return <Tag label={sticker.tags[0]} />;
          }
          return <span className="italic">{sticker.label}</span>;
        };
        return (
          <Button
            key={sticker.id}
            onClick={() => onSelect(sticker.id)}
            variant="text"
            disabled={disabled}
            className="transition-transform hover:scale-[1.02]"
          >
            {content()}
          </Button>
        );
      })}
    </div>
  );
}
