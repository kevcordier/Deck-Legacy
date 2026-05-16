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

export function tCardName(t: TFunction, stateName = ''): string {
  return t(`names.${stateName}`, { ns: 'cards' });
}

export function tCardActionLabel(
  t: TFunction,
  actionId: string,
  accumulated?: number,
): React.ReactNode {
  return renderTextWithIcons(
    t(`actions.${actionId}`, {
      ns: 'cards',
      accumulated,
      ...ICON_PASSTHROUGH,
    }),
  );
}

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

export function tCardGloryLabel(t: TFunction, cardId = 0, stateId = 0): React.ReactNode {
  return renderTextWithIcons(
    t(`glory.${cardId}-${stateId}`, {
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
    t(`tracks.${cardId}-${stateId}-${idx}`, {
      ns: 'cards',
    }),
  );
}

export function tCardDescription(t: TFunction, cardId = 0, stateId = 0, idx = 0): string {
  return t(`descriptions.${cardId}-${stateId}-${idx}`, {
    ns: 'cards',
  });
}

export function tCardTag(t: TFunction, tag: string): string {
  return t(`tags.${tag}`, { ns: 'cards' });
}

export function tCardParchmentText(t: TFunction, cardId = 0): string {
  return t(`texts.${cardId}`, { ns: 'cards', ...ICON_PASSTHROUGH });
}
