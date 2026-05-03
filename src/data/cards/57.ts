import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const sickness: CardDef = {
  id: 57,
  name: 'Sickness',
  states: [
    {
      id: 1,
      name: 'Sickness',
      tags: [CardTag.EVENT],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/5a211c23-0280-4b2e-8651-9cecebd9720e/anim=false,width=450,optimized=true/75ABN8H4M4DQQGEGSCM0PY0CV0.jpeg',
      negative: true,
      glory: { amount: -8 },
      actions: [
        {
          id: '57-1-1',
          trigger: Trigger.ON_PLAY,
          optional: false,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: {
                scope: [TargetScope.TOP_OF_DECK],
                pickNumber: 2,
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 1,
              },
            ],
          },
          upgradeTo: 2,
        },
        {
          cost: {
            resources: [
              {
                [ResourceType.GOODS]: 7,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 2,
      name: 'Crippled',
      tags: [CardTag.STATE],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/2625fc43-b380-430d-bb5a-50757a03a093/anim=false,width=450,optimized=true/GCW6V2JQD7S95Q4SJEJ3KPN780.jpeg',
      permanent: true,
      glory: { amount: -2 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
    {
      id: 3,
      name: 'Feast',
      tags: [CardTag.EVENT],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/95a499f3-2251-4ec3-a08a-9df9f1255f7f/anim=false,width=450,optimized=true/00157-3751329134.jpeg',
      glory: { amount: 2 },
      actions: [
        {
          id: '57-3-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  { [ResourceType.GOLD]: 1 },
                  { [ResourceType.WOOD]: 1 },
                  { [ResourceType.STONE]: 1 },
                  { [ResourceType.IRON]: 1 },
                  { [ResourceType.WEAPON]: 1 },
                  { [ResourceType.GOODS]: 1 },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
