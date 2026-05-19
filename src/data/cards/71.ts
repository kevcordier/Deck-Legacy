import { ActionEffectType, CardTag, PassiveType, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const dubbing: CardDef = {
  id: 71,
  name: 'Dubbing',
  states: [
    {
      id: 1,
      name: 'Dubbing',
      tags: [CardTag.EVENT],
      illustration: 'cards/71_1.jpg',
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '71-1-1',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              stickers: { ids: [1, 5, 11], pickNumber: 3 },
              cards: {
                tags: [CardTag.PERSON],
              },
            },
            {
              id: 4,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Renovation',
      illustration: 'cards/71_2.jpg',
      tags: [CardTag.EVENT],
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '71-2-1',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              stickers: { ids: [2, 3] },
              cards: {
                tags: [CardTag.BUILDING],
              },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_STICKER,
              stickers: { ids: [4, 6] },
              cards: {
                scope: [TargetScope.LAST_SELECTED],
              },
            },
            {
              id: 3,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
            },
          ],
        },
      ],
    },
  ],
};
