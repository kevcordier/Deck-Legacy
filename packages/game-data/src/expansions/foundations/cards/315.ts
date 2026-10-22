import { flipTo } from './flipTo';
import { hasStepsLeft } from './hasStepsLeft';
import { MECHANICS_CARDS } from './mechanicsConstants';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardDef } from '@deck-legacy/engine/domain/types';

const THINKER = 333;
const THINKER_STEPS = Array.from({ length: 10 }, (_, index) => 11 + index);
const { inventions } = MECHANICS_CARDS;

/** "Mark 1 box to do" `effect` (one option of the Thinker). */
const option = (id: number, effect: ActionEffect, condition?: ActionEffect['condition']) => ({
  id,
  type: ActionEffectType.SEQUENCE,
  ...(condition && { condition }),
  effects: [
    {
      id: 1,
      type: ActionEffectType.TRACK_ADVANCE,
      cards: { scope: [TargetScope.SELF] },
      steps: { pickNumber: 1, ids: THINKER_STEPS },
    },
    { ...effect, id: 2 },
  ],
});

/** Tinker (Foundations 142): becomes the Thinker. */
export const tinker: CardDef = {
  id: 315,
  name: 'Tinker',
  states: [
    {
      id: 1,
      name: 'Tinker',
      tags: [CardTag.PERSON],
      productions: [{ [ResourceType.SCIENCE]: 1 }],
      track: { inOrder: true, steps: [1, 2, 3, 4, 5].map(id => ({ id })) },
      actions: [
        {
          id: '315-1-1',
          unlimited: true,
          cost: { resources: [{ [ResourceType.GOLD]: 4 }] },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        { id: '315-1-2', trigger: Trigger.ON_TRACK_END, actionEffects: [flipTo(1, 2)] },
      ],
    },
    {
      id: 2,
      name: 'Thinker',
      tags: [CardTag.PERSON],
      productions: [{ [ResourceType.SCIENCE]: 2 }],
      track: { inOrder: true, steps: THINKER_STEPS.map(id => ({ id })) },
      actions: [
        {
          id: '315-2-1',
          condition: hasStepsLeft(THINKER),
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.CHOOSE_EFFECT,
              effects: [
                option(
                  1,
                  {
                    id: 1,
                    type: ActionEffectType.DISCOVER_CARD,
                    cards: { ids: inventions, scope: [TargetScope.DISCOVERY], pickNumber: 1 },
                  },
                  {
                    type: 'cardCount',
                    cards: { ids: inventions, scope: [TargetScope.DISCOVERY] },
                    min: 1,
                  },
                ),
                option(2, {
                  id: 1,
                  type: ActionEffectType.BOOST_CARD,
                  cards: {
                    scope: [TargetScope.BOARD, TargetScope.PERMANENTS],
                    having: { maxProduction: 2 },
                    pickNumber: 1,
                  },
                }),
                option(3, {
                  id: 1,
                  type: ActionEffectType.PLAY_CARD,
                  cards: { scope: [TargetScope.DISCARD], pickMin: 0, pickMax: 2 },
                }),
              ],
            },
          ],
        },
      ],
    },
  ],
};
