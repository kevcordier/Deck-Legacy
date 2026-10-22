import { flipTo } from './flipTo';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Rust / Mechanical Failure (Foundations 150): negative on both sides. */
export const rust: CardDef = {
  id: 323,
  name: 'Rust',
  states: [
    {
      id: 1,
      name: 'Rust',
      tags: [CardTag.EVENT],
      negative: true,
      actions: [
        {
          id: '323-1-1',
          cost: { resources: [{ [ResourceType.GOODS]: 3 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: { [ResourceType.SCIENCE]: 1 },
            },
          ],
        },
        { id: '323-1-2', trigger: Trigger.END_OF_TURN, actionEffects: [flipTo(1, 2)] },
      ],
    },
    {
      id: 2,
      name: 'Mechanical Failure',
      tags: [CardTag.EVENT],
      negative: true,
      actions: [
        {
          id: '323-2-1',
          trigger: Trigger.ON_PLAY,
          condition: {
            type: 'cardCount',
            cards: {
              scope: [TargetScope.BOARD, TargetScope.PERMANENTS],
              tags: [CardTag.INVENTION],
            },
            min: 1,
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { scope: [TargetScope.BOARD, TargetScope.FRIENDLY], pickNumber: 4 },
            },
            flipTo(2, 1),
          ],
        },
      ],
    },
  ],
};
