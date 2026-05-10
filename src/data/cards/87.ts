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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/4129aea6-3683-4e86-a115-32b448434dd2/450x%3Cauto%3E_so',
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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/38aa8113-4d2e-4228-bef6-da8a5d9258f9/450x%3Cauto%3E_so',
      tags: [CardTag.SEAFARING],
      glory: { amount: 4 },
      productions: [{ [ResourceType.GOLD]: 2, [ResourceType.GOODS]: 2 }],
    },
    {
      id: 3,
      name: 'Fish Quota',
      tags: [CardTag.SEAFARING],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/ba2ab390-abb6-4d55-9e2c-298708b773dd/450x%3Cauto%3E_so',
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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/0ac0a398-59c8-48b4-9917-6d5188b564b1/450x%3Cauto%3E_so',
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
