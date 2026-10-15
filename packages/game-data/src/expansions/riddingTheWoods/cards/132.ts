import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardDef } from '@deck-legacy/engine/domain/types';

const playEnemyFromDiscard: ActionEffect = {
  id: 2,
  type: ActionEffectType.PLAY_CARD,
  cards: { scope: [TargetScope.DISCARD], tags: [CardTag.ENEMY], pickNumber: 1 },
};

export const archeryContest: CardDef = {
  id: 132,
  name: 'Archery Contest',
  states: [
    {
      id: 1,
      name: 'Archery Contest',
      tags: [CardTag.EVENT],
      illustration: 'cards/132_1.jpg',
      actions: [
        {
          id: '132-1-1',
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
            playEnemyFromDiscard,
          ],
        },
      ],
      track: {
        inOrder: true,
        steps: [
          ...[1, 2, 3].map(id => ({ id })),
          {
            id: 4,
            effects: [
              {
                id: 1,
                type: ActionEffectType.UPGRADE_CARD,
                cards: { scope: [TargetScope.SELF] },
                states: { ids: [2] },
              },
            ],
          },
        ],
      },
    },
    {
      id: 2,
      name: 'Bait and Trap',
      tags: [CardTag.EVENT],
      illustration: 'cards/132_2.jpg',
      actions: [
        {
          id: '132-2-1',
          condition: {
            type: 'cardCount',
            cards: { scope: [TargetScope.BOARD], tags: [CardTag.LADY] },
            min: 1,
          },
          actionEffects: [
            { ...playEnemyFromDiscard, id: 1 },
            {
              id: 2,
              type: ActionEffectType.ADD_RESOURCES,
              resources: { [ResourceType.WEAPON]: 2 },
            },
          ],
        },
      ],
    },
  ],
};
