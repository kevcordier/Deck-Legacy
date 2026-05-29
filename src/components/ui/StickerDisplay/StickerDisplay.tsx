import { Glory } from '@components/ui/Glory/Glory';
import { PassifIcon } from '@components/ui/Icon/icon';
import { ResourcePill } from '@components/ui/ResourcePill/ResourcePill';
import { Tag } from '@components/ui/Tag/Tag';
import type { Sticker } from '@engine/domain/types';
import { useTranslation } from 'react-i18next';

type StickerProps = {
  readonly sticker: Sticker;
  readonly className?: string;
};

export const StickerDisplay = ({ sticker, className }: StickerProps) => {
  const { t } = useTranslation();
  const stickerClass = 'rounded-md bg-white/70 border-2 border-danger p-1';
  const iconClass = `${stickerClass} ${className ?? 'size-10'}`;

  // emptyValues stickers are gameplay-only and intentionally hidden in UI.
  if (sticker.additionalGlory && !sticker.production && !sticker.glory && !sticker.effectId) {
    return null;
  }

  if (sticker.production) {
    return <ResourcePill resource={sticker.production} className={iconClass} />;
  } else if (sticker.glory) {
    return <Glory glory={sticker.glory} className={`text-md ${iconClass}`} />;
  } else if (sticker.effectId === 'stays_in_play') {
    return (
      <span
        className={`font-body! text-base-ink rounded-md bg-white/60 px-2! py-1! text-xs backdrop-blur-sm @3xs:text-lg ${stickerClass}`}
      >
        <PassifIcon className="size-3 @3xs:size-6" /> {t('passives.stay_in_play', { ns: 'cards' })}
      </span>
    );
  } else if (sticker.tags) {
    return <Tag label={sticker.tags[0]} className={stickerClass} />;
  }
  return <span className={`italic ${stickerClass}`}>{sticker.label}</span>;
};
