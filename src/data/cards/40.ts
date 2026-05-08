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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/1a9d0128-b1ff-4cb3-bc7f-6f436c3c1a72/anim=false,width=450,optimized=true/7E42DFE164030F49FF7F13152FF659F580F126CB795D6862F655470E42F74FE4.jpeg',
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
          id: '40-2-1',
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
          id: '40-3-1',
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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/7fe6e5da-4198-48af-a7f5-233623f15096/anim=false,width=450,optimized=true/00000-3318507171.jpeg',
      tags: [CardTag.BUILDING],
      glory: { amount: 15 },
    },
  ],
};
