import { ActionEffectType, CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const envoy: CardDef = {
  id: 39,
  name: 'Envoy',
  states: [
    {
      id: 1,
      name: 'Envoy',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/909df2a3-2abd-446c-a14a-c549b87898ec/anim=false,width=450,optimized=true/a%20man%20who%20is%20a%20merchant%201%204%20extremely%20detailed%20hyperrealistic%20masterpiece%20best%20quality%20high%20resolution%20uncompressed%20raw%20photo%200-3940479017-20230602161401.jpeg',
      actions: [
        {
          id: '39-1-1',
          endsTurn: true,
          cost: {
            resources: [
              {
                gold: 3,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [119],
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
                gold: 3,
              },
            ],
          },
        },
      ],
    },
    {
      id: 2,
      name: 'Emissary',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/8c874d41-51ea-4167-905b-b013b7c39a31/anim=false,width=450,optimized=true/noble%20man%202%20thisisreal.jpeg',
      glory: { amount: 1 },
      actions: [
        {
          id: '39-2-1',
          endsTurn: true,
          cost: {
            resources: [
              {
                gold: 3,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [120],
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
                gold: 6,
              },
            ],
          },
        },
      ],
    },
    {
      id: 3,
      name: 'Diplomat',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/2ad23bf2-028b-4f89-8f11-4d18c62e56f3/anim=false,width=450,optimized=true/noble%20man%205%20photoMovieX.jpeg',
      glory: { amount: 2 },
      actions: [
        {
          id: '39-3-1',
          endsTurn: true,
          cost: {
            resources: [
              {
                gold: 3,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [121],
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
                gold: 6,
              },
            ],
          },
        },
      ],
    },
    {
      id: 4,
      name: 'Ambassador',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/a38fe4ba-0f77-4641-b7f0-794175c8fb23/anim=false,width=450,optimized=true/noble%20man%204%20photoMovieX.jpeg',
      glory: { amount: 5 },
      actions: [
        {
          id: '39-4-1',
          endsTurn: true,
          cost: {
            resources: [
              {
                gold: 3,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [122],
              },
            },
          ],
        },
      ],
    },
  ],
};
