import { crossOutProduction } from './crossOutProduction';
import { destroySelf } from './destroySelf';
import { flipTo } from './flipTo';
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

// "From your deck" at the end of the round: the draw pile and the discard pile.
const yourDeck = [TargetScope.DECK, TargetScope.DISCARD];

/** Hurricane / Erosion (Foundations 39). */
export const hurricane: CardDef = {
  id: 212,
  name: 'Hurricane',
  states: [
    {
      id: 1,
      name: 'Hurricane',
      tags: [CardTag.EVENT],
      negative: true,
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '212-1-1',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: { scope: yourDeck, tags: [CardTag.BUILDING], pickNumber: 1 },
            },
            {
              id: 2,
              type: ActionEffectType.DESTROY_CARD,
              cards: { scope: yourDeck, tags: [CardTag.PERSON], pickNumber: 1 },
            },
            flipTo(3, 2),
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Erosion',
      tags: [CardTag.EVENT],
      negative: true,
      track: { inOrder: true, steps: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] },
      actions: [
        {
          id: '212-2-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              // "If you do": a building in play has a production to cross out
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: { scope: [TargetScope.SELF] },
              condition: {
                type: 'cardCount',
                cards: {
                  scope: [TargetScope.BOARD],
                  tags: [CardTag.BUILDING],
                  produces: Object.values(ResourceType),
                },
                min: 1,
              },
            },
            crossOutProduction(2, { scope: [TargetScope.BOARD], tags: [CardTag.BUILDING] }),
          ],
        },
        { id: '212-2-2', trigger: Trigger.ON_TRACK_END, actionEffects: [destroySelf(1)] },
      ],
    },
  ],
};
