import { ActionEffectType, CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const magistrate: CardDef = {
  id: 42,
  name: 'Magistrate',
  states: [
    {
      id: 1,
      name: 'Magistrate',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/d1a11488-ed4c-48ec-a640-7b583278b62a/anim=false,width=450,optimized=true/generator_import_1769989737224_0.jpeg',
      actions: [
        {
          id: '42-1-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [130],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          upgradeTo: 2,
          cost: {
            resources: [
              {
                stone: 3,
              },
            ],
          },
        },
      ],
    },
    {
      id: 2,
      name: 'Magistrate',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/cc6f038b-22ed-4fd4-9f91-7e808a5792ba/anim=false,width=450,optimized=true/generator_import_1769454863019_0.jpeg',
      actions: [
        {
          id: '42-2-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [131],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          upgradeTo: 3,
          cost: {
            resources: [
              {
                stone: 2,
                iron: 2,
              },
            ],
          },
        },
      ],
    },
    {
      id: 3,
      name: 'Magistrate',
      tags: [CardTag.PERSON],
      glory: { amount: 2 },
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/a84eb667-7835-49a8-b28c-b1ff273d4dc8/anim=false,width=450,optimized=true/generator_import_1769454863068_1.jpeg',
      actions: [
        {
          id: '42-3-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [132],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          upgradeTo: 4,
          cost: {
            resources: [
              {
                stone: 3,
                iron: 2,
              },
            ],
          },
        },
      ],
    },
    {
      id: 4,
      name: 'Strategist',
      tags: [CardTag.PERSON, CardTag.ELDER],
      glory: { amount: 5 },
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/c7149d36-f85c-4e52-9646-0109f3684df5/anim=false,width=450,optimized=true/generator_import_1769454863100_2.jpeg',
      actions: [
        {
          id: '42-4-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: {
                tags: [CardTag.KNIGHT, CardTag.WALL],
              },
            },
          ],
        },
      ],
    },
  ],
};
