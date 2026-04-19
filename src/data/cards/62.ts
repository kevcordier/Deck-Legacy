import { CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const pirate: CardDef = {
  id: 62,
  name: 'Pirate',
  states: [
    {
      id: 1,
      name: 'Pirate',
      tags: [CardTag.ENEMY],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/b1291a30-cba7-4e4e-c3d3-e6868be5f700/anim=false,width=450,optimized=true/04608-1785735444-Best_A-Zovya_RPG_Artist_Tools_V2.jpeg',
    },
  ],
};
