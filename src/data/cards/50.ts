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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/1abacec8-9163-4d96-8da2-82ce34548b84/anim=false,width=450,optimized=true/25050-1999826796-cave%20interior,.jpeg',
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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/5b87faae-13c8-4b78-bfe7-651dbc2af79c/anim=false,width=450,optimized=true/DH3R578WN8HR6T2MFXZ6TDM4Y0.jpeg',
      tags: [CardTag.LAND],
      glory: { amount: 2 },
      upgrade: [
        {
          cost: {
            discard: [
              {
                pickNumber: 2,
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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/b85d6851-18b0-45e2-89f1-47686e30740d/450x%3Cauto%3E_so',
      glory: { amount: 5 },
      actions: [
        {
          id: '50-3-1',
          limitedTime: 1,
          cost: {
            discard: [
              {
                pickNumber: 6,
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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/388930e2-17ce-4c3d-987c-9cc3a50ea113/anim=false,width=450,optimized=true/3FFF39EFBB9C45880218D3332E3AB9D453D03081B35327DFD3AD7CAFA6C2B1F1.jpeg',
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
