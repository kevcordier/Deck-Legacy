import { CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const cityFire: CardDef = {
  id: 49,
  name: 'City Fire',
  states: [
    {
      id: 1,
      name: 'City Fire',
      tags: [CardTag.EVENT],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/9c2e4545-c6f8-44c3-bf7e-ae4ef2200818/anim=false,width=450,optimized=true/7956D5CAAE8DF5A17204CE929425F0996278C18FDA11B7B5EBEB4BCCF3782D47.jpeg',
    },
  ],
};
