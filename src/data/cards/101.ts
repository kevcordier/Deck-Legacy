import { ActionEffectType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const tradeRelations: CardDef = {
  id: 101,
  name: 'Trade Relations',
  states: [
    {
      id: 1,
      name: 'Trade Relations',
      illustration: 'cards/101_1.jpg',
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
                choice: [{ any: 1 }],
              },
            },
          ],
        },
      ],
    },
  ],
};
