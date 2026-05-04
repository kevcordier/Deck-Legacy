import { ActionEffectType, TargetScope } from '@engine/domain/enums';
import type { CardDef, StepDef } from '@engine/domain/types';

const makeStep = (id: number, iron: number, cumulated: number): StepDef => ({
  id,
  cost: { resources: [{ iron }] },
  icon: 'glory',
  effects: [{ id: 1, type: ActionEffectType.SET_CUMULATED, value: cumulated }],
});

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
          makeStep(1, 1, 1),
          makeStep(2, 1, 2),
          makeStep(3, 1, 3),
          makeStep(4, 1, 5),
          makeStep(5, 1, 7),
          makeStep(6, 1, 10),
          makeStep(7, 1, 14),
          makeStep(8, 1, 20),
          makeStep(9, 9, 28),
          makeStep(10, 10, 40),
        ],
      },
    },
  ],
};
