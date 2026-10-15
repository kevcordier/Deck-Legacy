import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardState } from '@deck-legacy/engine/domain/types';

/** Back of the Ridding the Woods bandits: escapes when 2 enemies are in play. */
export const prisonerState = (cardId: number): CardState => ({
  id: 2,
  name: 'Prisoner',
  tags: [CardTag.STATE],
  negative: true,
  illustration: `cards/124_2.jpg`,
  glory: { amount: 2 },
  actions: [
    {
      id: `${cardId}-2-1`,
      trigger: Trigger.ON_PLAY,
      condition: {
        type: 'cardCount',
        cards: { scope: [TargetScope.BOARD, TargetScope.DRAWN], tags: [CardTag.ENEMY] },
        min: 2,
      },
      actionEffects: [
        {
          id: 1,
          type: ActionEffectType.UPGRADE_CARD,
          cards: { scope: [TargetScope.SELF] },
          states: { ids: [1] },
        },
      ],
    },
    {
      id: `${cardId}-2-2`,
      trigger: Trigger.ON_PURGE_SELECTION,
      optional: true,
      actionEffects: [
        {
          id: 1,
          type: ActionEffectType.ADD_TO_PURGE,
          cards: {
            name: 'Prisoner',
            scope: [TargetScope.DECK, TargetScope.DISCARD, TargetScope.BOARD, TargetScope.SELF],
            pickMin: 0,
            pickMax: 2,
          },
        },
      ],
    },
  ],
});

export const hoodedBandit: CardDef = {
  id: 124,
  name: 'Bandit',
  states: [
    {
      id: 1,
      name: 'Bandit',
      tags: [CardTag.ENEMY],
      negative: true,
      illustration: 'cards/124_1.jpg',
      glory: { amount: -2 },
      actions: [
        {
          id: `124-1-1`,
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { scope: [TargetScope.BOARD], produces: [ResourceType.WOOD], autoPick: true },
            },
          ],
        },
        {
          id: `124-1-2`,
          endsTurn: true,
          defeat: true,
          cost: { resources: [{ [ResourceType.WEAPON]: 3 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    prisonerState(124),
  ],
};
