import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const wildGrass: CardDef = {
  id: 1,
  name: 'Wild Grass',
  states: [
    {
      id: 1,
      name: 'Wild Grass',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/6d09374f-b960-4b6b-a2b7-27402db0dc25/width=450,quality=90/01612-3845234348.jpeg',
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
    },
    {
      id: 2,
      name: 'Plains',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/ea5be381-3332-462c-b5aa-bf8e03a75814/width=450,quality=90/32A3CA7B52F85F1F6336A4F00BA8A0AEA3AD12AF2B49E2F45F8245CF1A6235C9.jpeg',
      actions: [
        {
          id: '1-2-1',
          cost: {
            discard: {
              scope: [TargetScope.FRIENDLY],
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                [ResourceType.GOLD]: 2,
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
                [ResourceType.GOLD]: 3,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
    },
    {
      id: 3,
      name: 'Farmlands',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/1ccb9805-79c6-4fbf-9956-1f836a249e5c/width=450,quality=90/HZ283XYYHS6XG3QG47CT1B0EJ0.jpeg',
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 3,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
      productions: [
        {
          [ResourceType.GOLD]: 2,
        },
      ],
    },
    {
      id: 4,
      name: 'Food Barns',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/69f4028b-f52a-4243-afcc-55a038210221/width=450,quality=90/00040-1126433715.jpeg',
      glory: { amount: 3 },
      productions: [
        {
          [ResourceType.GOLD]: 2,
        },
      ],
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
  ],
};
