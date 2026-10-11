import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, Condition, StepDef } from '@deck-legacy/engine/domain/types';

const emptyStep = (id: number): StepDef => ({ id });
const duringRiddingTheWoods: Condition = { type: 'expansionActive', name: 'Ridding the Woods' };

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
      passives: [
        {
          id: '122-1-3',
          type: PassiveType.ADD_TRIGGER,
          condition: duringRiddingTheWoods,
          trigger: {
            id: '122-1-3',
            type: Trigger.ON_PLAY,
            cards: { scope: [TargetScope.DRAWN], tags: [CardTag.ENEMY] },
            actions: [
              {
                id: 1,
                type: ActionEffectType.TRACK_ADVANCE,
                cards: { scope: [TargetScope.TRIGGER_SOURCE] },
                valuePerElement: {
                  amount: 1,
                  cards: { scope: [TargetScope.DRAWN], tags: [CardTag.ENEMY] },
                },
              },
            ],
          },
        },
      ],
      actions: [
        {
          id: '122-1-1',
          trigger: Trigger.ON_PLAY,
          condition: duringRiddingTheWoods,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: { scope: [TargetScope.SELF] },
              valuePerElement: {
                amount: 1,
                cards: { scope: [TargetScope.BOARD], tags: [CardTag.ENEMY] },
              },
            },
          ],
        },
        {
          id: '122-1-2',
          trigger: Trigger.ON_TRACK_END,
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
      track: { inOrder: true, steps: [emptyStep(1), emptyStep(2), emptyStep(3), emptyStep(4)] },
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
        {
          id: '122-2-2',
          trigger: Trigger.ON_TRACK_END,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: { scope: [TargetScope.SELF] },
            },
          ],
        },
      ],
      track: {
        inOrder: true,
        steps: [1, 2, 3, 4, 5, 6].map(emptyStep),
      },
    },
  ],
};
