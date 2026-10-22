import { LADY } from './romanceConstants';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef, CardState } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

const { GOLD, WOOD, STONE, IRON, WEAPON } = ResourceType;
const TAGS = [CardTag.PERSON, CardTag.KNIGHT];
const SIDE_A = [1, 2, 3, 4, 5, 6];
const SIDE_B = [11, 12, 13, 14, 15, 16];
const forEachBox = { amount: 1, markedSteps: true };

/** "When you upgrade to the other side, mark 1 box there" (its boxes: `otherSide`). */
const markOtherSide = (id: string, otherSide: number[]): CardAction => ({
  id,
  trigger: Trigger.ON_UPGRADE,
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.TRACK_ADVANCE,
      cards: { scope: [TargetScope.SELF] },
      steps: { pickNumber: 1, ids: otherSide },
    },
  ],
});

const side = (
  stateId: number,
  steps: number[],
  otherSide: number[],
  action: CardAction,
): CardState => ({
  id: stateId,
  name: 'Valiant Prince',
  tags: TAGS,
  productions: [{ [WEAPON]: 1 }],
  track: { inOrder: true, steps: steps.map(id => ({ id })) },
  actions: [action, markOtherSide(`299-${stateId}-2`, otherSide)],
  // Both ways: 2 iron and 1 lady
  upgrade: [
    {
      cost: { resources: [{ [IRON]: 2 }], discard: [{ ...LADY, pickNumber: 1 }] },
      upgradeTo: 3 - stateId,
    },
  ],
});

/** Valiant Prince (Foundations 126): a knight turning from one side to the other. */
export const valiantPrince: CardDef = {
  id: 299,
  name: 'Valiant Prince',
  states: [
    side(1, SIDE_A, SIDE_B, {
      // End of turn: discard this to make 1 other card stay in play for each box here
      id: '299-1-1',
      trigger: Trigger.END_OF_TURN,
      optional: true,
      cost: { discard: [{ scope: [TargetScope.SELF] }] },
      actionEffects: [
        {
          id: 1,
          type: ActionEffectType.ADD_BOARD_EFFECT,
          cards: { scope: [TargetScope.BOARD], pickMin: 0, pickMax: 1 },
          effect: CardPassives[PassiveType.STAY_IN_PLAY],
          repeat: 'valuePerElement',
          valuePerElement: forEachBox,
        },
      ],
    }),
    side(2, SIDE_B, SIDE_A, {
      // For each box here, gain 1 gold, wood or stone
      id: '299-2-1',
      actionEffects: [
        {
          id: 1,
          type: ActionEffectType.ADD_RESOURCES,
          resources: { choice: [{ [GOLD]: 1 }, { [WOOD]: 1 }, { [STONE]: 1 }] },
          repeat: 'valuePerElement',
          valuePerElement: forEachBox,
        },
      ],
    }),
  ],
};
