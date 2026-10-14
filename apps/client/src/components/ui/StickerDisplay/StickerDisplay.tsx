import { Glory } from '@components/ui/Glory/Glory';
import { PassifIcon } from '@components/ui/Icon/icon';
import { ResourcePill } from '@components/ui/ResourcePill/ResourcePill';
import { Tag } from '@components/ui/Tag/Tag';
import { Text } from '@components/ui/Text/Text';
import type { Sticker } from '@deck-legacy/engine/domain/types';
import { tCardTag } from '@helpers/cardI18n';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

type StickerProps = {
  readonly sticker: Sticker;
  /** Size classes of the sticker (defaults to `size-10`). */
  readonly className?: string;
  /** Larger label for the "stays in play" sticker (large cards). */
  readonly large?: boolean;
};

const STICKER_CLASS = 'rounded-md bg-white/70 border-2 border-danger p-1';

export const StickerDisplay = ({ sticker, className = 'size-10', large = false }: StickerProps) => {
  const { t } = useTranslation();

  // emptyValues stickers are gameplay-only and intentionally hidden in UI.
  if (sticker.additionalGlory && !sticker.production && !sticker.glory && !sticker.effectId) {
    return null;
  }

  if (sticker.production) {
    return (
      <View className={`${STICKER_CLASS} ${className}`}>
        <ResourcePill resource={sticker.production} className="size-full" />
      </View>
    );
  }
  if (sticker.glory) {
    return (
      <View className={`${STICKER_CLASS} ${className}`}>
        <Glory glory={sticker.glory} className="size-full" textClassName="text-sm" />
      </View>
    );
  }
  if (sticker.effectId === 'stays_in_play') {
    return (
      <View className={`${STICKER_CLASS} flex-row items-center gap-1 px-2 py-1`}>
        <PassifIcon className={large ? 'size-6 text-ink-card' : 'size-3 text-ink-card'} />
        <Text className={`text-ink-card ${large ? 'text-lg' : 'text-xs'}`}>
          {t('passives.stay_in_play', { ns: 'cards' })}
        </Text>
      </View>
    );
  }
  if (sticker.tags) {
    return <Tag label={tCardTag(t, sticker.tags[0])} className={STICKER_CLASS} />;
  }
  return (
    <View className={STICKER_CLASS}>
      <Text className="font-body-italic">{sticker.label}</Text>
    </View>
  );
};
