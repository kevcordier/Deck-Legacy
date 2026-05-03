import { renderTextWithIcons } from '@helpers/renderHelpers';
import type { TFunction } from 'i18next';
import type React from 'react';

// Pass {{resource}} tokens as literal values so that i18next leaves them unchanged;
// renderTextWithIcons then converts them into icons.
export const ICON_PASSTHROUGH = {
  gold: '{{gold}}',
  wood: '{{wood}}',
  stone: '{{stone}}',
  iron: '{{iron}}',
  weapon: '{{weapon}}',
  goods: '{{goods}}',
  glory: '{{glory}}',
  time: '{{time}}',
  passif: '{{passif}}',
  destroy: '{{destroy}}',
  trigger: '{{trigger}}',
};

export function tCardName(t: TFunction, cardId = 0, stateId = 0): React.ReactNode {
  return renderTextWithIcons(t(`names.${cardId}_${stateId}`, { ns: 'cards' }));
}

export function tCardActionLabel(
  t: TFunction,
  cardId = 0,
  stateId = 0,
  idx: string | number = '0',
  accumulated?: number,
): React.ReactNode {
  return renderTextWithIcons(
    t(`labels.${cardId}_${stateId}_a${idx}`, {
      ns: 'cards',
      accumulated,
      ...ICON_PASSTHROUGH,
    }),
  );
}

export function tCardPassiveLabel(
  t: TFunction,
  cardId = 0,
  stateId = 0,
  idx: string | number = '0',
  accumulated?: number,
): React.ReactNode {
  return renderTextWithIcons(
    t(`labels.${cardId}_${stateId}_p${idx}`, {
      ns: 'cards',
      ...ICON_PASSTHROUGH,
      accumulated,
    }),
  );
}

export function tCardGloryLabel(t: TFunction, cardId = 0, stateId = 0): React.ReactNode {
  return renderTextWithIcons(
    t(`labels.${cardId}_${stateId}_g0`, {
      ns: 'cards',
      ...ICON_PASSTHROUGH,
    }),
  );
}

export function tCardTrackAction(
  t: TFunction,
  cardId = 0,
  stateId = 0,
  idx: string | number = '0',
): React.ReactNode {
  return renderTextWithIcons(
    t(`labels.${cardId}_${stateId}_t${idx}`, {
      ns: 'cards',
    }),
  );
}

export function tCardDescription(t: TFunction, cardId = 0, stateId = 0, idx = 0): string {
  return t(`labels.${cardId}_${stateId}_d${idx}`, {
    ns: 'cards',
  });
}

export function tCardTag(t: TFunction, tag: string): string {
  return t(`tags.${tag}`, { ns: 'cards' });
}

export function tCardParchmentText(t: TFunction, cardId = 0): string {
  return t(`texts.${cardId}`, { ns: 'cards', ...ICON_PASSTHROUGH });
}
