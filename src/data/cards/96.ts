import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const stable: CardDef = {
  id: 96,
  name: 'Stable',
  states: [
    {
      id: 1,
      name: 'Stable',
      tags: [CardTag.BUILDING],
      actions: [
        {
          id: '96-1-1',
          endsTurn: true,
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: { ids: [113] },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.WOOD]: 3 }] },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Stable',
      tags: [CardTag.BUILDING],
      actions: [
        {
          id: '96-2-1',
          endsTurn: true,
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: { ids: [114] },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.STONE]: 3 }] },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Large Stable',
      tags: [CardTag.BUILDING],
      actions: [
        {
          id: '96-3-1',
          endsTurn: true,
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: { ids: [115] },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.GOLD]: 4 }] },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Groom',
      tags: [CardTag.PERSON],
      actions: [
        {
          id: '96-4-1',
          trigger: Trigger.ON_PLAY,
          optional: false,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: {
                scope: [TargetScope.DISCARD],
                ids: [113, 114, 115],
              },
            },
          ],
        },
        {
          id: '96-4-2',
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              cards: {
                scope: [TargetScope.BOARD],
                ids: [113, 114, 115],
                having: {
                  minProduction: 0,
                  maxProduction: 3,
                },
              },
              stickers: {
                ids: [1, 2, 3, 4, 5, 6],
                pickNumber: 1,
              },
            },
          ],
        },
      ],
    },
  ],
};
