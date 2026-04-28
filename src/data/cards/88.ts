import { CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const missionary: CardDef = {
  id: 88,
  name: 'Missionary',
  states: [
    {
      id: 1,
      name: 'Missionary',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/73000c23-90cb-4924-b674-a885720c9cba/anim=false,width=450,optimized=true/03BKNQ3THTSJ7S8AXBBE9A74H0.jpeg',
    },
  ],
};
