import { ActionEffectType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const tradeRelations: CardDef = {
  id: 101,
  name: 'Trade Relations',
  states: [
    {
      id: 1,
      name: 'Trade Relations',
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/fc6f65dd-c0c9-4d80-a734-53757a11a5ad/450x%3Cauto%3E_so',
      permanent: true,
      actions: [
        {
          id: '101-1-1',
          unlimited: true,
          cost: {
            resources: [
              {
                goods: 3,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  { gold: 1 },
                  { wood: 1 },
                  { stone: 1 },
                  { iron: 1 },
                  { weapon: 1 },
                  { goods: 1 },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
