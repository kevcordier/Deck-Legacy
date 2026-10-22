import { ARTISANS_CARDS } from './artisansConstants';
import { flipTo } from './flipTo';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardAction, CardDef } from '@deck-legacy/engine/domain/types';

const { GOLD, GOODS, STONE } = ResourceType;

const discoverOne = (ids: number[]): ActionEffect => ({
  id: 1,
  type: ActionEffectType.DISCOVER_CARD,
  cards: { ids, scope: [TargetScope.DISCOVERY], pickNumber: 1 },
});

const discoverProject = (id: string, ids: number[]): CardAction => ({
  id,
  endsTurn: true,
  condition: { type: 'cardCount', cards: { ids, scope: [TargetScope.DISCOVERY] }, min: 1 },
  actionEffects: [discoverOne(ids)],
});

/** Dreamer (Foundations 111): becomes the Architect of the Golden Pillars. */
export const dreamer: CardDef = {
  id: 284,
  name: 'Dreamer',
  states: [
    {
      id: 1,
      name: 'Dreamer',
      tags: [CardTag.PERSON],
      track: { inOrder: true, steps: [{ id: 1 }, { id: 2 }] },
      actions: [
        {
          id: '284-1-1',
          endsTurn: true,
          cost: { resources: [{ [GOLD]: 2, [GOODS]: 2 }] },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        { id: '284-1-2', trigger: Trigger.ON_TRACK_END, actionEffects: [flipTo(1, 2)] },
      ],
    },
    {
      id: 2,
      name: 'Architect',
      tags: [CardTag.PERSON, CardTag.LADY],
      productions: [{ [STONE]: 1 }],
      glory: { amount: 7 },
      passives: [
        {
          // When you upgrade a building, put it on top of your deck
          id: '284-2-1',
          type: PassiveType.UPGRADED_ON_TOP_OF_DECK,
          cards: { scope: [TargetScope.ANY], tags: [CardTag.BUILDING] },
        },
      ],
      actions: [
        discoverProject('284-2-1', ARTISANS_CARDS.pillars),
        discoverProject('284-2-2', [ARTISANS_CARDS.pillarHall]),
      ],
    },
  ],
};
