import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

const makeWoodStep = (id: number, wood: number) => ({
  id,
  cost: { resources: [{ [ResourceType.WOOD]: wood }] },
});

const makeArkStep = (id: number) => ({
  id,
  effects: [
    {
      id: 1,
      type: ActionEffectType.ADD_CUMULATED,
      cards: { scope: [TargetScope.SELF] },
      accumulated: 1,
    },
  ],
});

export const buildAnArk: CardDef = {
  id: 76,
  name: 'Build an Ark',
  states: [
    {
      id: 1,
      name: 'Build an Ark',
      permanent: true,
      actions: [
        {
          id: '76-1-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: {
                scope: [TargetScope.SELF],
              },
            },
          ],
        },
      ],
      track: {
        inOrder: true,
        steps: [
          makeWoodStep(1, 2),
          makeWoodStep(2, 4),
          makeWoodStep(3, 6),
          makeWoodStep(4, 8),
          {
            id: 5,
            cost: { resources: [{ [ResourceType.WOOD]: 10 }] },
            effects: [
              {
                id: 1,
                type: ActionEffectType.UPGRADE_CARD,
                cards: {
                  scope: [TargetScope.SELF],
                },
                states: [2],
              },
            ],
          },
        ],
      },
    },
    {
      id: 2,
      name: 'The Ark',
      tags: [CardTag.SEAFARING, CardTag.SHIP],
      glory: {
        amount: 24,
        valuePerElement: {
          amount: 2,
          accumulation: true,
        },
      },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '76-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: {
                scope: [TargetScope.SELF],
              },
              valuePerElement: {
                amount: 0.5,
                cards: {
                  scope: [TargetScope.BOARD],
                  tags: [CardTag.PERSON],
                },
              },
            },
          ],
        },
      ],
      track: {
        inOrder: false,
        steps: [
          makeArkStep(1),
          makeArkStep(2),
          makeArkStep(3),
          makeArkStep(4),
          makeArkStep(5),
          makeArkStep(6),
          makeArkStep(7),
          makeArkStep(8),
          makeArkStep(9),
          makeArkStep(10),
          makeArkStep(11),
          makeArkStep(12),
          makeArkStep(13),
          makeArkStep(14),
          makeArkStep(15),
          makeArkStep(16),
        ],
      },
    },
  ],
};
