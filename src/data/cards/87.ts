import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const fishingShips: CardDef = {
  id: 87,
  name: 'Fishing Ships',
  chooseState: [1, 3],
  states: [
    {
      id: 1,
      name: 'Fishing Ships',
      tags: [CardTag.SEAFARING, CardTag.SHIP],
      illustration: 'cards/87_1.jpg',
      glory: { amount: 2 },
      productions: [{ [ResourceType.GOLD]: 3 }],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 2,
                [ResourceType.GOLD]: 1,
                [ResourceType.IRON]: 1,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: "Fish n' Chips",
      illustration: 'cards/87_2.jpg',
      tags: [CardTag.SEAFARING],
      glory: { amount: 4 },
      productions: [{ [ResourceType.GOLD]: 2, [ResourceType.GOODS]: 2 }],
    },
    {
      id: 3,
      name: 'Fish Quota',
      tags: [CardTag.SEAFARING],
      illustration: 'cards/87_3.jpg',
      glory: { amount: 4 },
      productions: [{ [ResourceType.GOLD]: 2 }],
      actions: [
        {
          id: '87-3-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: {
                scope: [TargetScope.SELF],
              },
            },
          ],
        },
      ],
      track: {
        inOrder: true,
        steps: [
          { id: 1 },
          { id: 2 },
          { id: 3 },
          {
            id: 4,
            effects: [
              {
                id: 1,
                type: ActionEffectType.UPGRADE_CARD,
                cards: {
                  scope: [TargetScope.SELF],
                },
                states: { ids: [4] },
              },
            ],
          },
        ],
      },
    },
    {
      id: 4,
      name: 'Fishing Excellence',
      tags: [CardTag.STATE],
      illustration: 'cards/87_4.jpg',
      permanent: true,
      glory: { amount: 13 },
      passives: [
        CardPassives[PassiveType.STAY_IN_PLAY],
        {
          ...CardPassives[PassiveType.ADJUST_PRODUCTION],
          id: '87-4-1',
          cards: {
            scope: [TargetScope.BOARD],
            tags: [CardTag.SEAFARING],
          },
          resources: {
            [ResourceType.GOLD]: 1,
          },
        },
      ],
    },
  ],
};
