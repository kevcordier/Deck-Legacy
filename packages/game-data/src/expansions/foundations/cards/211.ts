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
import type { ActionEffect, CardDef } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

/** Cross out 1 gold production on a card of the kingdom (7 times: "a total of 7"). */
const crossOutGold = (id: number): ActionEffect => ({
  id,
  type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
  resourceScopes: ['production'],
  resources: { [ResourceType.GOLD]: 1 },
  cards: {
    scope: [TargetScope.BOARD, TargetScope.DECK, TargetScope.DISCARD],
    produces: [ResourceType.GOLD],
    pickNumber: 1,
  },
});

/** Rats / Famine (Foundations 38). */
export const ratsFamine: CardDef = {
  id: 211,
  name: 'Rats',
  states: [
    {
      id: 1,
      name: 'Rats',
      tags: [CardTag.ENEMY],
      negative: true,
      glory: { amount: -2 },
      actions: [
        {
          id: '211-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { scope: [TargetScope.TOP_OF_DECK], pickNumber: 3 },
            },
          ],
        },
        {
          id: '211-1-2',
          trigger: Trigger.END_OF_TURN,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.CHOOSE_EFFECT,
              effects: [
                {
                  id: 1,
                  type: ActionEffectType.DISCARD_CARD,
                  cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickNumber: 2 },
                },
                flipTo(2, 2),
              ],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Famine',
      tags: [CardTag.EVENT],
      negative: true,
      glory: { amount: -2 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '211-2-1',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.CHOOSE_EFFECT,
              effects: [
                {
                  id: 1,
                  type: ActionEffectType.SEQUENCE,
                  effects: [1, 2, 3, 4, 5, 6, 7].map(crossOutGold),
                },
                {
                  id: 2,
                  type: ActionEffectType.DESTROY_CARD,
                  cards: {
                    scope: [TargetScope.ANY],
                    tags: [CardTag.PERSON, CardTag.LIVESTOCK],
                    pickNumber: 2,
                  },
                },
              ],
            },
            destroySelf(2),
          ],
        },
      ],
    },
  ],
};
