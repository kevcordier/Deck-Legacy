import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const smallSchool: CardDef = {
  id: 102,
  name: 'Small School',
  states: [
    {
      id: 1,
      name: 'Small School',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/cf93443d-8613-45de-9eea-c63b6553e7bf/anim=false,width=450,optimized=true/00685-1413628283-oil%20painting%20with%20thick%20strokes%20of%20scene%20from%20plague%20tale%20game,%20medieval,_young%2014%20years%20old%20girl%20Amicia%20de%20Rune,%20standing,%20from.jpeg',
      tags: [CardTag.BUILDING],
      actions: [
        {
          id: '102-1-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
              },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'School',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/63af9abc-ffd0-404d-afff-561909573b71/anim=false,width=450,optimized=true/00679-3188065745-oil%20painting%20with%20thick%20strokes%20of%20scene%20from%20plague%20tale%20game,%20medieval,_young%2014%20years%20old%20girl%20Amicia%20de%20Rune,%20standing,%20from.jpeg',
      tags: [CardTag.BUILDING],
      actions: [
        {
          id: '102-2-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
              },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [3] },
            },
          ],
        },
      ],
    },
    {
      id: 3,
      name: 'Prominent School',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/b30c7000-0dd6-4da8-8407-f4db47463e4c/anim=false,width=450,optimized=true/00697-2799986538-oil%20painting%20with%20thick%20strokes%20of%20scene%20from%20plague%20tale%20game,%20medieval,_young%2014%20years%20old%20girl%20Amicia%20de%20Rune,%20standing,%20from.jpeg',
      tags: [CardTag.BUILDING],
      glory: { amount: 4 },
      actions: [
        {
          id: '102-3-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              cards: {
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
              },
              stickers: { ids: [1, 2, 3, 4, 5, 6] },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [4] },
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Renowned School',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/33ccedc3-4b59-4bc4-9e33-9a9ac84a7b6c/anim=false,width=450,optimized=true/00688-2570345053-oil%20painting%20with%20thick%20strokes%20of%20scene%20from%20plague%20tale%20game,%20medieval,_young%2014%20years%20old%20girl%20Amicia%20de%20Rune,%20standing,%20from.jpeg',
      tags: [CardTag.BUILDING],
      glory: { amount: 6 },
      actions: [
        {
          id: '102-4-1',
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              cards: {
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
              },
              stickers: { ids: [1, 2, 3, 4, 5, 6] },
            },
          ],
        },
      ],
    },
  ],
};
