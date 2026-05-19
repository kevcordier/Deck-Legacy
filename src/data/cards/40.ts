import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const royalArchitect: CardDef = {
  id: 40,
  name: 'Royal Architect',
  states: [
    {
      id: 1,
      name: 'Royal Architect',
      tags: [CardTag.PERSON],
      illustration: 'cards/40_1.jpg',
      productions: [
        {
          stone: 1,
        },
      ],
      actions: [
        {
          id: '40-1-1',
          limitedTime: 1,
          cost: {
            destroy: {
              name: 'Castle',
              scope: [TargetScope.BOARD],
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [123],
              },
            },
          ],
        },
        {
          id: '40-1-2',
          limitedTime: 1,
          cost: {
            destroy: {
              name: 'Diamond Mine',
              scope: [TargetScope.BOARD],
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [124],
              },
            },
          ],
        },
        {
          id: '40-1-3',
          limitedTime: 1,
          cost: {
            destroy: {
              name: 'Temple',
              scope: [TargetScope.BOARD],
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [125],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          upgradeTo: 2,
          cost: {
            destroy: {
              name: 'Stone Bridge',
              scope: [TargetScope.BOARD],
            },
          },
        },
      ],
    },
    {
      id: 2,
      name: 'Bridge of Marvel',
      illustration: 'cards/40_2.jpg',
      tags: [CardTag.BUILDING],
      glory: { amount: 15 },
    },
  ],
};
