import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardSelector, Condition, StepDef } from '@deck-legacy/engine/domain/types';

const emptyStep = (id: number): StepDef => ({ id });
const duringRiddingTheWoods: Condition = { type: 'expansionActive', name: 'Ridding the Woods' };
const enemiesJustPlayed: CardSelector = { scope: [TargetScope.DRAWN], tags: [CardTag.ENEMY] };
const ladyJustPlayed: Condition = { type: 'justPlayed' };

export const aCertainLady: CardDef = {
  id: 122,
  name: 'A Certain Lady',
  states: [
    {
      id: 1,
      name: 'A Certain Lady',
      tags: [CardTag.PERSON, CardTag.LADY],
      illustration: 'cards/122_1.jpg',
      glory: { amount: 6 },
      actions: [
        {
          // When she or an enemy is played: mark 1 step per enemy in play with her.
          id: '122-1-1',
          trigger: Trigger.ON_PLAY,
          triggeredBy: enemiesJustPlayed,
          condition: {
            type: 'and',
            conditions: [
              duringRiddingTheWoods,
              {
                type: 'cardCount',
                cards: { scope: [TargetScope.BOARD, TargetScope.DRAWN], tags: [CardTag.ENEMY] },
                min: 1,
              },
            ],
          },
          actionEffects: [
            {
              // she has just been played: every enemy in play counts
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              condition: ladyJustPlayed,
              cards: { scope: [TargetScope.SELF] },
              valuePerElement: {
                amount: 1,
                cards: { scope: [TargetScope.BOARD], tags: [CardTag.ENEMY] },
              },
            },
            {
              // she was already in play: only the enemies just played count
              id: 2,
              type: ActionEffectType.TRACK_ADVANCE,
              condition: { type: 'not', condition: ladyJustPlayed },
              cards: { scope: [TargetScope.SELF] },
              valuePerElement: { amount: 1, cards: enemiesJustPlayed },
            },
          ],
        },
      ],
      track: {
        inOrder: true,
        steps: [
          emptyStep(1),
          emptyStep(2),
          emptyStep(3),
          {
            id: 4,
            effects: [
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
    },
    {
      id: 2,
      name: 'Rogue Lady',
      tags: [CardTag.ENEMY],
      negative: true,
      illustration: 'cards/122_2.jpg',
      glory: { amount: -3 },
      actions: [
        {
          id: '122-2-1',
          trigger: Trigger.ON_PLAY,
          // "If you do": only when a card in play produces gold
          condition: {
            type: 'cardCount',
            cards: { scope: [TargetScope.BOARD, TargetScope.DRAWN], produces: [ResourceType.GOLD] },
            min: 1,
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
              resourceScopes: ['production'],
              resources: { [ResourceType.GOLD]: 1 },
              cards: { scope: [TargetScope.BOARD], produces: [ResourceType.GOLD], pickNumber: 1 },
            },
            {
              id: 2,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: { scope: [TargetScope.SELF] },
            },
          ],
        },
      ],
      track: {
        inOrder: true,
        steps: [
          emptyStep(5),
          emptyStep(6),
          emptyStep(7),
          emptyStep(8),
          emptyStep(9),
          {
            id: 10,
            effects: [
              {
                id: 1,
                type: ActionEffectType.DESTROY_CARD,
                cards: { scope: [TargetScope.SELF] },
              },
            ],
          },
        ],
      },
    },
  ],
};
