import { renderTextWithIcons } from '@components/ui/Icon/renderTextWithIcons';
import type { TFunction } from 'i18next';
import type React from 'react';

export function tCardTrackAction(
  t: TFunction,
  cardId = 0,
  stateId = 0,
  idx: string | number = '0',
  wrapIcon?: Parameters<typeof renderTextWithIcons>[1],
): React.ReactNode {
  return renderTextWithIcons(
    t(`tracks.${cardId}-${stateId}-${idx}`, {
      ns: 'cards',
    }),
    wrapIcon,
  );
}
