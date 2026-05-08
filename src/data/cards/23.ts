import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const entrepreneur: CardDef = {
  id: 23,
  name: 'Entrepreneur',
  states: [
    {
      id: 1,
      name: 'Entrepreneur',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/d7c69dcb-0a2e-435a-834e-3616f02d6cd7/anim=false,width=450,optimized=true/A0F7F3B499E9121F34B75C4B3ED4AB66E54E2F588A13ACC50BED2D51BD64D154.jpeg',
      productions: [
        {
          goods: 1,
        },
      ],
      actions: [
        {
          id: '23-1-1',
          endsTurn: true,
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [118],
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
                [ResourceType.GOLD]: 1,
                [ResourceType.WOOD]: 3,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Hotel',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/b66bdcad-1447-4784-969a-d8220c83a3c5/anim=false,width=450,optimized=true/91KBWKJQT8P3VFEV8XN8J5SGK0.jpeg',
      productions: [
        {
          gold: 1,
          goods: 1,
        },
      ],
      actions: [
        {
          id: '23-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                [ResourceType.GOLD]: 1,
              },
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
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 1,
                [ResourceType.WOOD]: 1,
                [ResourceType.STONE]: 1,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Cozy Pub',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/d436239c-dd0f-40ba-89b7-14a4468872af/anim=false,width=450,optimized=true/XW60T5ASSAXCQ55PFHCZ6E6NN0.jpeg',
      productions: [
        {
          goods: 2,
        },
      ],
      actions: [
        {
          id: '23-3-1',
          limitedTime: 1,
          cost: {
            discard: [
              {
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [92],
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
                [ResourceType.GOODS]: 2,
                [ResourceType.WOOD]: 2,
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Tavern',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/90ba25c2-95e8-4416-83b7-52894e5daab7/anim=false,width=450,optimized=true/HYMYGCVJF1HVDN83MQGXT92Y50.jpeg',
      productions: [
        {
          goods: 2,
          gold: 2,
        },
      ],
      actions: [
        {
          id: '23-4-1',
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [87],
              },
            },
          ],
        },
      ],
    },
  ],
};
