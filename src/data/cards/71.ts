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
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '71-1-1',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              stickerIds: [1, 5, 11],
              cards: {
                tags: [CardTag.PERSON],
              },
              pickNumber: 3,
            },
            {
              id: 4,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: [2],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Renovation',
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
              stickerIds: [2, 3],
              cards: {
                tags: [CardTag.BUILDING],
              },
              pickNumber: 1,
            },
            {
              id: 2,
              type: ActionEffectType.ADD_STICKER,
              stickerIds: [4, 6],
              cards: {
                tags: [CardTag.BUILDING],
              },
              pickNumber: 1,
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
