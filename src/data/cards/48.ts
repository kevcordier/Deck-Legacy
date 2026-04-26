import { CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const assassin: CardDef = {
  id: 48,
  name: 'Assassin',
  states: [
    {
      id: 1,
      name: 'Assassin',
      tags: [CardTag.ENEMY],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/a34eebe4-d52c-4f21-811c-688ff14c440b/anim=false,width=450,optimized=true/J48J5DR9Z0YSGWZYXZHYJGXKV0.jpeg',
    },
  ],
};
