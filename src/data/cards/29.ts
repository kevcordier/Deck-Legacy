import { CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const strengthInNumbers: CardDef = {
  id: 29,
  name: 'Strength in Numbers',
  chooseState: true,
  permanent: true,
  states: [
    {
      id: 1,
      name: 'Strength in Numbers',
      tags: [CardTag.GOAL],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/3615dcc2-a135-4591-9246-1c97dbfc5e82/anim=false,width=450,optimized=true/2026-02-26-02059-FLUX.2-klein-9B-1024x1024-Seed20260226-CFG1-AG0-STEP4.jpeg',
      glory: {
        amount: 0,
        valuePerElement: {
          cards: { scope: [TargetScope.ANY], tags: [CardTag.PERSON] },
          amount: 2,
        },
      },
    },
    {
      id: 2,
      name: 'Military Dominance',
      tags: [CardTag.GOAL],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/4ae44403-0397-4338-9df7-2c582cca25b0/anim=false,width=450,optimized=true/Zim+BigLove_2025-11-30%2017-55-23-0131.jpeg',
      glory: {
        amount: 0,
        valuePerElement: {
          productionTotal: ResourceType.WEAPON,
          amount: 2,
        },
      },
    },
  ],
};
