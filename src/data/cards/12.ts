import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const eastCliffs: CardDef = {
  id: 12,
  name: 'East Cliffs',
  states: [
    {
      id: 1,
      name: 'East Cliffs',
      tags: [CardTag.LAND],
      illustration: 'cards/12_1.jpg',
      productions: [
        {
          [ResourceType.STONE]: 1,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.STONE]: 3,
              },
            ],
          },
          upgradeTo: 4,
        },
        {
          cost: {
            resources: [
              {
                [ResourceType.STONE]: 1,
                [ResourceType.WOOD]: 1,
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
      name: 'Smithy',
      tags: [CardTag.BUILDING],
      illustration: 'cards/12_2.jpg',
      productions: [
        {
          [ResourceType.IRON]: 1,
        },
      ],
      glory: { amount: 1 },
      actions: [
        {
          id: '12-2-1',
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [90],
              },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [1] },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
                [ResourceType.IRON]: 2,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Arsenal',
      tags: [CardTag.BUILDING],
      illustration: 'cards/12_3.jpg',
      productions: [
        {
          [ResourceType.IRON]: 1,
        },
      ],
      glory: { amount: 4 },
      actions: [
        {
          id: '12-3-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: { [ResourceType.WEAPON]: 1 },
              valuePerElement: {
                amount: 1,
                cards: {
                  scope: [TargetScope.BOARD],
                  tags: [CardTag.PERSON],
                },
              },
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Wall',
      tags: [CardTag.BUILDING, CardTag.WALL],
      illustration: 'cards/12_4.jpg',
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
      glory: { amount: 3 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
  ],
};
