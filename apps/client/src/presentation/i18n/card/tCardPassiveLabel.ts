import { ICON_PASSTHROUGH } from './iconPassthrough';
import { renderTextWithIcons } from '@components/ui/Icon/renderTextWithIcons';
import type { TFunction } from 'i18next';
import type React from 'react';

export function tCardPassiveLabel(
  t: TFunction,
  passiveId: string,
  accumulated?: number,
): React.ReactNode {
  return renderTextWithIcons(
    t(`passives.${passiveId}`, {
      ns: 'cards',
      ...ICON_PASSTHROUGH,
      accumulated,
    }),
  );
}
