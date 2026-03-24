import type { TFunction } from 'i18next';

// Pass {{resource}} tokens as literal values so that i18next leaves them unchanged;
// renderTextWithIcons then converts them into icons.
const ICON_PASSTHROUGH = {
  gold: '{{gold}}',
  wood: '{{wood}}',
  stone: '{{stone}}',
  iron: '{{iron}}',
  sword: '{{sword}}',
  goods: '{{goods}}',
  glory: '{{glory}}',
};

export function tCardName(t: TFunction, cardId: number, stateId: number, fallback: string): string {
  return t(`names.${cardId}_${stateId}`, { ns: 'cards', defaultValue: fallback });
}

export function tCardActionLabel(
  t: TFunction,
  cardId: number,
  stateId: number,
  idx: number,
  fallback: string,
): string {
  return t(`labels.${cardId}_${stateId}_a${idx}`, {
    ns: 'cards',
    defaultValue: fallback,
    ...ICON_PASSTHROUGH,
  });
}

export function tCardPassiveLabel(
  t: TFunction,
  cardId: number,
  stateId: number,
  idx: number,
  fallback: string,
): string {
  return t(`labels.${cardId}_${stateId}_p${idx}`, {
    ns: 'cards',
    defaultValue: fallback,
    ...ICON_PASSTHROUGH,
  });
}

export function tCardActionDescription(
  t: TFunction,
  cardId: number,
  stateId: number,
  idx: number,
): string {
  return t(`descriptions.${cardId}_${stateId}_a${idx}`, { ns: 'cards', defaultValue: '' });
}

export function tCardPassiveDescription(
  t: TFunction,
  cardId: number,
  stateId: number,
  idx: number,
): string {
  return t(`descriptions.${cardId}_${stateId}_p${idx}`, { ns: 'cards', defaultValue: '' });
}

export function tCardTag(t: TFunction, tag: string): string {
  return t(`tags.${tag}`, { ns: 'cards', defaultValue: tag });
}
