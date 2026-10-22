import { equipAction } from './equipAction';
import { flipTo } from './flipTo';
import { isEquipped } from './isEquipped';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

const { WOOD, SCIENCE } = ResourceType;
const CHIMNEY = 338;

/** Hole In the Roof (Foundations 147): repaired, then a Chimney for a building. */
export const holeInTheRoof: CardDef = {
  id: 320,
  name: 'Hole In the Roof',
  states: [
    {
      id: 1,
      name: 'Hole In the Roof',
      tags: [CardTag.EVENT],
      negative: true,
      glory: { amount: -2 },
      actions: [
        {
          id: '320-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.BLOCK_CARD,
              cards: { scope: [TargetScope.BOARD], tags: [CardTag.BUILDING], pickNumber: 1 },
            },
          ],
        },
      ],
      upgrade: [{ cost: { resources: [{ [WOOD]: 3 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Repaired Roof',
      tags: [CardTag.STATE],
      // If there are no buildings in play, discard this
      passives: [
        {
          id: '320-2-1',
          type: PassiveType.REQUIRES_IN_PLAY,
          cards: { scope: [TargetScope.BOARD, TargetScope.PERMANENTS], tags: [CardTag.BUILDING] },
        },
      ],
      upgrade: [{ cost: { resources: [{ [SCIENCE]: 3 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Better Idea',
      tags: [CardTag.EVENT],
      actions: [
        {
          id: '320-3-1',
          endsTurn: true,
          cost: {
            discard: [
              { tags: [CardTag.PERSON], produces: [SCIENCE], pickNumber: 1 },
              { tags: [CardTag.BUILDING], pickNumber: 1 },
            ],
          },
          actionEffects: [flipTo(1, 4)],
        },
      ],
    },
    {
      id: 4,
      name: 'Chimney',
      tags: [CardTag.INVENTION],
      equip: CardTag.BUILDING,
      glory: { amount: 14 },
      actions: [
        equipAction('320-4-1', CardTag.BUILDING, CHIMNEY),
        {
          // End of turn: discard (the holder, with this) to make 3 cards stay in play
          id: '320-4-2',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          condition: isEquipped(CHIMNEY),
          actionEffects: [
            { id: 1, type: ActionEffectType.DISCARD_CARD, cards: { scope: [TargetScope.HOLDER] } },
            {
              id: 2,
              type: ActionEffectType.ADD_BOARD_EFFECT,
              cards: { scope: [TargetScope.BOARD], pickMin: 0, pickMax: 3 },
              effect: CardPassives[PassiveType.STAY_IN_PLAY],
            },
          ],
        },
      ],
    },
  ],
};
