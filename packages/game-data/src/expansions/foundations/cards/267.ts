import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardSelector } from '@deck-legacy/engine/domain/types';

const swordPersons: CardSelector = {
  scope: [TargetScope.BOARD],
  tags: [CardTag.PERSON],
  produces: [ResourceType.WEAPON],
};

/** Duel (Foundations 94). */
export const duel: CardDef = {
  id: 267,
  name: 'Duel',
  states: [
    {
      id: 1,
      name: 'Duel',
      tags: [CardTag.EVENT],
      negative: true,
      actions: [
        {
          id: '267-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { scope: [TargetScope.TOP_OF_DECK] },
            },
          ],
        },
        {
          id: '267-1-2',
          trigger: Trigger.ON_PLAY,
          condition: { type: 'cardCount', cards: swordPersons, min: 2 },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { ...swordPersons, pickNumber: 2 },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_STICKER,
              cards: { scope: [TargetScope.LAST_SELECTED], pickNumber: 1 },
              stickers: { ids: [8] },
            },
          ],
        },
      ],
    },
  ],
};
