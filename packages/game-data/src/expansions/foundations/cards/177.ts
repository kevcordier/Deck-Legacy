import { INFECTED, INFECTION_MARKED } from './infectionConstants';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardDef } from '@deck-legacy/engine/domain/types';

// Instances of Black Plague, Treatment and Quarantine (Foundations 3–5)
const PLAGUE_PERMANENTS = [194, 195, 196];

/** Takes the infection off persons in play or in Quarantine. */
const cure = (count: number): ActionEffect => ({
  id: 1,
  type: ActionEffectType.REMOVE_STICKER,
  cards: {
    scope: [TargetScope.BOARD, TargetScope.BLOCKED],
    tags: [CardTag.PERSON],
    stickerIds: [INFECTED],
    pickMin: 1,
    pickMax: count,
  },
  stickers: { ids: [INFECTED, INFECTION_MARKED] },
});

/** Treatment (Foundations 4). */
export const treatment: CardDef = {
  id: 177,
  name: 'Treatment',
  states: [
    {
      id: 1,
      name: 'Treatment',
      tags: [CardTag.PERMANENT],
      negative: true,
      actions: [
        {
          id: '177-1-1',
          endsTurn: true,
          cost: { resources: [{ [ResourceType.GOLD]: 3 }] },
          actionEffects: [cure(1)],
        },
        {
          id: '177-1-2',
          endsTurn: true,
          cost: { resources: [{ [ResourceType.GOODS]: 2 }] },
          actionEffects: [cure(1)],
        },
        {
          id: '177-1-3',
          endsTurn: true,
          cost: { resources: [{ [ResourceType.GOLD]: 3, [ResourceType.GOODS]: 2 }] },
          actionEffects: [cure(2)],
        },
        {
          // After the Black Plague, once no card of the kingdom is infected (Quarantine aside)
          id: '177-1-4',
          trigger: Trigger.END_OF_ROUND,
          condition: {
            type: 'and',
            conditions: [
              { type: 'not', condition: { type: 'expansionActive', name: 'The Black Plague' } },
              {
                type: 'cardCount',
                cards: { scope: [TargetScope.ANY], stickerIds: [INFECTED] },
                max: 0,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: { ids: PLAGUE_PERMANENTS, scope: [TargetScope.PERMANENTS], autoPick: true },
            },
          ],
        },
      ],
    },
  ],
};
