import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const mysteriousCave: CardDef = {
  id: 50,
  name: 'Mysterious Cave',
  states: [
    {
      id: 1,
      name: 'Mysterious Cave',
      illustration: 'cards/50_1.jpg',
      tags: [CardTag.LAND],
      upgrade: [
        {
          cost: {
            discard: [
              {
                pickNumber: 1,
                tags: [CardTag.PERSON],
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Dungeon',
      illustration: 'cards/50_2.jpg',
      tags: [CardTag.LAND],
      glory: { amount: 2 },
      upgrade: [
        {
          cost: {
            discard: [
              {
                pickNumber: 2,
                pickMin: 2,
                tags: [CardTag.PERSON],
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Lost Civilization',
      tags: [CardTag.LAND],
      illustration: 'cards/50_3.jpg',
      glory: { amount: 5 },
      actions: [
        {
          id: '50-3-1',
          limitedTime: 1,
          cost: {
            discard: [
              {
                pickNumber: 6,
                pickMin: 6,
                scope: [TargetScope.FRIENDLY],
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [108],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.IRON]: 2,
                [ResourceType.GOLD]: 1,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Treasures',
      illustration: 'cards/50_4.jpg',
      tags: [CardTag.ITEM, CardTag.LOOT],
      glory: { amount: 8 },
      productions: [
        {
          [ResourceType.GOLD]: 2,
        },
      ],
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
  ],
};
