import { hasStepsLeft } from './hasStepsLeft';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const PILLAR_HALL = 311;
/** The boxes marked, kept on the card. */
const perBox = (amount: number) => ({ amount, accumulation: true });

/** Pillar Hall (Foundations 120): Golden Pillars destroyed to mark its boxes. */
export const pillarHall: CardDef = {
  id: 293,
  name: 'Pillar Hall',
  states: [
    {
      id: 1,
      name: 'Pillar Hall',
      tags: [CardTag.BUILDING],
      glory: { amount: 0, valuePerElement: perBox(25) },
      track: {
        inOrder: true,
        steps: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
      },
      passives: [
        {
          // +1 gold production for each box
          id: '293-1-1',
          type: PassiveType.ADJUST_PRODUCTION,
          cards: { scope: [TargetScope.SELF] },
          resources: { [ResourceType.GOLD]: 1 },
          valuePerElement: perBox(1),
        },
      ],
      actions: [
        {
          id: '293-1-1',
          endsTurn: true,
          condition: hasStepsLeft(PILLAR_HALL),
          cost: { destroy: { name: 'Golden Pillar', pickNumber: 1 } },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
            {
              id: 2,
              type: ActionEffectType.ADD_CUMULATED,
              cards: { scope: [TargetScope.SELF] },
              value: 1,
            },
          ],
        },
        {
          // When purged, save 1 other card from being purged for each box
          id: '293-1-2',
          trigger: Trigger.ON_PURGE,
          condition: { type: 'accumulation', min: 1 },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.SAVE_FROM_PURGE,
              cards: { scope: [TargetScope.PURGE_SELECTED, TargetScope.FRIENDLY], pickNumber: 1 },
              repeat: 'accumulation',
            },
          ],
        },
      ],
    },
  ],
};
