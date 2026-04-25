import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const inventor: CardDef = {
  id: 26,
  name: 'Inventor',
  states: [
    {
      id: 1,
      name: 'Inventor',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/18085f89-3bad-4888-9cb4-32c721eebf0d/anim=false,width=450,optimized=true/C21NAM6TGTS6YZEJ8DHMKA7GS0?sig=CfDJ8J868rbHQQlNuTOL2qbAsuQfKpQVkcElHnwfFzD9Z6gt-IdkliphPvj2lDyrPnMn80QLqgdQLXxGbaAYY8RnNtsMJpOLTc603RgRWv8fTq-jUopiO0Zx284D_BZ0losdJrNXp7idKRJN5qEERc7rn6DAxf15_8KVwtsDlv3_dBwfP6b7Lj-Sncw6FK26Bxiv_fiTNID9btAJTPrY2xufeGMv2prl8TXCe71kDwyLDiX1Q3F4zg0gvcO8gxnOFxqMvfE1yvrreKmRt6OppUnyDTfdyGlGwxb8l1Sx9dBPXi-I&exp=2026-09-02T11:00:24.jpeg',
      glory: 0,
      passives: [
        {
          id: 'inventor-1',
          type: PassiveType.INCREASE_GLORY,
          valuePerElement: {
            amount: 1,
            glory: 5,
            accumulation: 'accumulation',
          },
        },
      ],
      track: {
        inOrder: true,
        steps: [
          {
            id: 1,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_CUMULATED,
                cards: { scope: [TargetScope.SELF] },
                accumulated: { accumulation: 1 },
              },
            ],
          },
          {
            id: 2,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_CUMULATED,
                cards: { scope: [TargetScope.SELF] },
                accumulated: { accumulation: 1 },
              },
            ],
          },
          {
            id: 3,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_CUMULATED,
                cards: { scope: [TargetScope.SELF] },
                accumulated: { accumulation: 1 },
              },
            ],
          },
        ],
      },
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.GOLD]: 4 }] },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Inspired Inventor',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/d5a2402c-bd71-47ab-acdc-f43171e1b763/anim=false,width=450,optimized=true/ZVEJ5ZYV8JHABTEMYSJECYXCQ0.jpeg?sig=CfDJ8J868rbHQQlNuTOL2qbAsuRbmvmUjzPS_73V6BRqMjkZCMjLKWVVB4HfP0piCaUFVefbKCdbtv9nBrfEv2_ib-Vlec3wfYDOmVhE6myBFER_DQ2X-yVkacA2GkIFIOZePkoZOYxVYt9mWEzjLV2--YY6FtgSlgOpdKBJeRsYEY-9kvhAHSzZ9P-EKp-YlBZc7Y_aCrhHnTo-axQ5Er5M_nByge8ORlVnKKqNIfiqcv9Bjgvzoc4lPKra_XrPX2y5oqpwo0ILZNWEIzSv1_n2EgnJX6SNSvckYC24Lvxg2cvt&exp=2026-09-02T10:59:52.jpeg',
      glory: 0,
      passives: [
        {
          id: 'inventor-1',
          type: PassiveType.INCREASE_GLORY,
          valuePerElement: {
            amount: 1,
            glory: 5,
            accumulation: 'accumulation',
          },
        },
      ],
      actions: [
        {
          id: '26-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: [1],
            },
            {
              id: 2,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: {
                scope: [TargetScope.SELF],
              },
            },
            {
              id: 3,
              type: ActionEffectType.DISCOVER_CARD,
              cards: { ids: [97, 98, 99] },
            },
            {
              id: 4,
              type: ActionEffectType.ADD_RESOURCES,
              valuePerElement: {
                amount: 1,
                resource: [
                  ResourceType.GOLD,
                  ResourceType.WOOD,
                  ResourceType.STONE,
                  ResourceType.IRON,
                  ResourceType.WEAPON,
                  ResourceType.GOODS,
                ],
                accumulation: 'accumulation',
              },
            },
          ],
        },
      ],
    },
  ],
};
