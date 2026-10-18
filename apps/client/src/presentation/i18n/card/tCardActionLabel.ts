import { ICON_PASSTHROUGH } from './iconPassthrough';
import { renderTextWithIcons } from '@components/ui/Icon/renderTextWithIcons';
import type { TFunction } from 'i18next';
import type React from 'react';

export function tCardActionLabel(
  t: TFunction,
  actionId: string,
  accumulated?: number,
  wrapIcon?: Parameters<typeof renderTextWithIcons>[1],
): React.ReactNode {
  return renderTextWithIcons(
    t(`actions.${actionId}`, {
      ns: 'cards',
      accumulated,
      ...ICON_PASSTHROUGH,
    }),
    wrapIcon,
  );
}
