import type { TFunction } from 'i18next';

// Pass {{resource}} tokens as literal values so that i18next leaves them unchanged;
// renderTextWithIcons then converts them into icons.
const ICON_PASSTHROUGH = {
  gold: '{{gold}}',
  wood: '{{wood}}',
  stone: '{{stone}}',
  iron: '{{iron}}',
  weapon: '{{weapon}}',
  goods: '{{goods}}',
  glory: '{{glory}}',
  time: '{{time}}',
  passif: '{{passif}}',
};

export function tCardName(t: TFunction, cardId = 0, stateId = 0): string {
  return t(`names.${cardId}_${stateId}`, { ns: 'cards' });
}

export function tCardActionLabel(t: TFunction, cardId = 0, stateId = 0, idx = 0): string {
  return t(`labels.${cardId}_${stateId}_a${idx}`, {
    ns: 'cards',
    ...ICON_PASSTHROUGH,
  });
}

export function tCardPassiveLabel(t: TFunction, cardId = 0, stateId = 0, idx = 0): string {
  return t(`labels.${cardId}_${stateId}_p${idx}`, {
    ns: 'cards',
    ...ICON_PASSTHROUGH,
  });
}

export function tCardActionDescription(t: TFunction, cardId = 0, stateId = 0, idx = 0): string {
  return t(`descriptions.${cardId}_${stateId}_a${idx}`, {
    ns: 'cards',
  });
}

export function tCardStateDescription(t: TFunction, cardId = 0, stateId = 0): string {
  return t(`descriptions.${cardId}_${stateId}`, { ns: 'cards' });
}

export function tCardPassiveDescription(t: TFunction, cardId = 0, stateId = 0, idx = 0): string {
  return t(`descriptions.${cardId}_${stateId}_p${idx}`, {
    ns: 'cards',
  });
}

export function tCardTag(t: TFunction, tag: string): string {
  return t(`tags.${tag}`, { ns: 'cards', defaultValue: tag });
}

export function tCardParchmentText(t: TFunction, cardId = 0): string {
  return t(`texts.${cardId}`, { ns: 'cards', ...ICON_PASSTHROUGH });
}
