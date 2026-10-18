import { ICON_PASSTHROUGH } from './iconPassthrough';
import { renderTextWithIcons } from '@components/ui/Icon/renderTextWithIcons';
import type { TFunction } from 'i18next';
import type React from 'react';

export function tCardGloryLabel(t: TFunction, cardId = 0, stateId = 0): React.ReactNode {
  return renderTextWithIcons(
    t(`glory.${cardId}-${stateId}`, {
      ns: 'cards',
      ...ICON_PASSTHROUGH,
    }),
  );
}
