import { ActionEffectType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const jewellery: CardDef = {
  id: 75,
  name: 'Jewellery',
  states: [
    {
      id: 1,
      name: 'Jewellery',
      permanent: true,
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/eb9635cf-7001-4953-8d97-136356f157f6/anim=false,width=450,optimized=true/382213-2964142985-JEWELLERY%20%20SILVER%20RING%20FANTASY%20ART%20BW%20%20GEMSTONES%20QUEEN%20GREECE%20%20ANCIENT%20STYLE%20EARRINGS%20BRACELETS%20GOLD%20FANTASTIC.jpeg',
      glory: { amount: 0, valuePerElement: { accumulation: true, amount: 1 } },
      actions: [
        {
          id: '75-1-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: {
                scope: [TargetScope.SELF],
              },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                goods: 5,
              },
            },
          ],
        },
      ],
      track: {
        inOrder: true,
        steps: [
          {
            id: 1,
            cost: { resources: [{ iron: 1 }] },
            icon: 'glory',
            effects: [{ id: 1, type: ActionEffectType.SET_CUMULATED, accumulated: 1 }],
          },
          {
            id: 2,
            cost: { resources: [{ iron: 1 }] },
            icon: 'glory',
            effects: [{ id: 1, type: ActionEffectType.SET_CUMULATED, accumulated: 2 }],
          },
          {
            id: 3,
            cost: { resources: [{ iron: 1 }] },
            icon: 'glory',
            effects: [{ id: 1, type: ActionEffectType.SET_CUMULATED, accumulated: 3 }],
          },
          {
            id: 4,
            cost: { resources: [{ iron: 1 }] },
            icon: 'glory',
            effects: [{ id: 1, type: ActionEffectType.SET_CUMULATED, accumulated: 5 }],
          },
          {
            id: 5,
            cost: { resources: [{ iron: 1 }] },
            icon: 'glory',
            effects: [{ id: 1, type: ActionEffectType.SET_CUMULATED, accumulated: 7 }],
          },
          {
            id: 6,
            cost: { resources: [{ iron: 1 }] },
            icon: 'glory',
            effects: [{ id: 1, type: ActionEffectType.SET_CUMULATED, accumulated: 10 }],
          },
          {
            id: 7,
            cost: { resources: [{ iron: 1 }] },
            icon: 'glory',
            effects: [{ id: 1, type: ActionEffectType.SET_CUMULATED, accumulated: 14 }],
          },
          {
            id: 8,
            cost: { resources: [{ iron: 1 }] },
            icon: 'glory',
            effects: [{ id: 1, type: ActionEffectType.SET_CUMULATED, accumulated: 20 }],
          },
          {
            id: 9,
            cost: { resources: [{ iron: 9 }] },
            icon: 'glory',
            effects: [{ id: 1, type: ActionEffectType.SET_CUMULATED, accumulated: 28 }],
          },
          {
            id: 10,
            cost: { resources: [{ iron: 10 }] },
            icon: 'glory',
            effects: [{ id: 1, type: ActionEffectType.SET_CUMULATED, accumulated: 40 }],
          },
        ],
      },
    },
  ],
};
