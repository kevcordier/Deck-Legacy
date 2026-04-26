import { CardTag, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const loyalty: CardDef = {
  id: 31,
  name: 'Loyalty',
  chooseState: true,
  permanent: true,
  states: [
    {
      id: 1,
      name: 'Loyalty',
      tags: [CardTag.GOAL],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/a6911400-1a99-4454-9c30-d449c13b0260/anim=false,width=450,optimized=true/00160-1296651632.jpeg',
      glory: {
        amount: 25,
        condition: { type: 'cardCount', cards: { tags: [CardTag.ENEMY] }, max: 0 },
      },
    },
    {
      id: 2,
      name: 'Trader',
      tags: [CardTag.GOAL],
      glory: {
        amount: 25,
        condition: { type: 'production', resourceType: ResourceType.GOODS, min: 10 },
      },
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/b7419552-cbe0-48e9-98da-79992a77b26a/anim=false,width=450,optimized=true/00001-2999530579.jpeg',
    },
  ],
};
