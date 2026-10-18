import { ICON_PASSTHROUGH } from './iconPassthrough';
import { renderTextWithIcons } from '@components/ui/Icon/renderTextWithIcons';
import type { TFunction } from 'i18next';
import type React from 'react';

export function tCardEffectLabel(
  t: TFunction,
  effectKey: string,
  accumulated?: number,
): React.ReactNode {
  return renderTextWithIcons(
    t(`effect.${effectKey}`, {
      ns: 'cards',
      accumulated,
      ...ICON_PASSTHROUGH,
    }),
  );
}
