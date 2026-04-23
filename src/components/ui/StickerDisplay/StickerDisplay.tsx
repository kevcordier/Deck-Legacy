import { Glory } from '@components/ui/Glory/Glory';
import { PassifIcon } from '@components/ui/Icon/icon';
import { ResourcePill } from '@components/ui/ResourcePill/ResourcePill';
import { Tag } from '@components/ui/Tag/Tag';
import type { Sticker } from '@engine/domain/types';
import { useTranslation } from 'react-i18next';

type StickerProps = {
  readonly sticker: Sticker;
  readonly size: 'sm' | 'md' | 'lg';
  readonly className?: string;
};

export const StickerDisplay = ({ sticker, size, className }: StickerProps) => {
  const { t } = useTranslation();
  if (sticker.production) {
    return <ResourcePill resource={sticker.production} size={size} className={className} />;
  } else if (sticker.glory) {
    return <Glory glory={sticker.glory} className={className} />;
  } else if (sticker.effectId === 'stays_in_play') {
    return (
      <span
        className={`font-body! text-base-ink rounded-md bg-white/60 px-3! py-2! text-xs backdrop-blur-sm @3xs:text-lg ${className}`}
      >
        <PassifIcon className="size-3 @3xs:size-6" /> {t('card.stayInPlay')}
      </span>
    );
  } else if (sticker.tags) {
    return <Tag label={sticker.tags[0]} className={className} />;
  }
  return <span className={`italic ${className}`}>{sticker.label}</span>;
};
