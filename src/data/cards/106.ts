import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const grandCastle: CardDef = {
  id: 106,
  name: 'Grand Castle',
  states: [
    {
      id: 1,
      name: 'Grand Castle',
      tags: [CardTag.BUILDING],
      glory: { amount: 15 },
      productions: [{ [ResourceType.WEAPON]: 1 }],
      actions: [
        {
          id: '106-1-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { scope: [TargetScope.DISCARD] },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 2,
                [ResourceType.STONE]: 2,
                [ResourceType.IRON]: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Huge Castle',
      tags: [CardTag.BUILDING],
      glory: { amount: 20 },
      productions: [{ [ResourceType.WEAPON]: 2 }],
      actions: [
        {
          id: '106-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { scope: [TargetScope.DISCARD] },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.STONE]: 3,
                [ResourceType.IRON]: 3,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Fortress',
      tags: [CardTag.BUILDING],
      glory: { amount: 25 },
      productions: [{ [ResourceType.WEAPON]: 2 }],
      actions: [
        {
          id: '106-3-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { scope: [TargetScope.DISCARD] },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.STONE]: 4,
                [ResourceType.IRON]: 4,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Impregnable Fortress',
      tags: [CardTag.BUILDING],
      glory: { amount: 30 },
      productions: [{ [ResourceType.WEAPON]: 3 }],
      actions: [
        {
          id: '106-4-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { scope: [TargetScope.DISCARD] },
            },
          ],
        },
        {
          id: '106-4-2',
          trigger: Trigger.ON_DISCARD,
          optional: true,
          cost: {
            discard: [{ scope: [TargetScope.BOARD], tags: [CardTag.WALL], pickNumber: 2 }],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { scope: [TargetScope.SELF] },
            },
          ],
        },
      ],
    },
  ],
};
