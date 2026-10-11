import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardSelector } from '@deck-legacy/engine/domain/types';

const ladyIn = (scope: TargetScope[]): CardSelector => ({ name: 'A Certain Lady', scope });
const ladyAnywhere = ladyIn([
  TargetScope.DECK,
  TargetScope.BOARD,
  TargetScope.DISCARD,
  TargetScope.PERMANENTS,
]);

export const robbinLeader: CardDef = {
  id: 123,
  name: "Robbin' Leader",
  states: [
    {
      id: 1,
      name: "Robbin' Leader",
      tags: [CardTag.ENEMY],
      negative: true,
      illustration: 'cards/123_1.jpg',
      glory: { amount: -5 },
      passives: [
        { id: '123-1-1', type: PassiveType.RESTRICT_GAIN, resources: { [ResourceType.WEAPON]: 1 } },
      ],
      actions: [
        {
          id: '123-1-2',
          defeat: true,
          cost: { resources: [{ [ResourceType.WEAPON]: 3 }] },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        {
          id: '123-1-3',
          trigger: Trigger.ON_TRACK_END,
          condition: { type: 'cardCount', cards: ladyIn([TargetScope.DECK]), min: 1 },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: { ...ladyIn([TargetScope.DECK]), autoPick: true },
            },
            { id: 2, type: ActionEffectType.SHUFFLE_DECK },
            {
              id: 3,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [2] },
            },
          ],
        },
        {
          id: '123-1-4',
          trigger: Trigger.ON_TRACK_END,
          condition: {
            type: 'and',
            conditions: [
              { type: 'cardCount', cards: ladyAnywhere, min: 1 },
              { type: 'cardCount', cards: ladyIn([TargetScope.DECK]), max: 0 },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: { ...ladyAnywhere, autoPick: true },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [2] },
            },
          ],
        },
        {
          id: '123-1-5',
          trigger: Trigger.ON_TRACK_END,
          condition: { type: 'cardCount', cards: ladyAnywhere, max: 0 },
          actionEffects: [
            { id: 1, type: ActionEffectType.DESTROY_CARD, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
      track: { inOrder: true, steps: [1, 2, 3, 4, 5, 6, 7, 8].map(id => ({ id })) },
    },
    {
      id: 2,
      name: 'Sobbing',
      tags: [CardTag.STATE],
      illustration: 'cards/123_2.jpg',
      passives: [
        {
          id: '123-2-1',
          type: PassiveType.SET_GAME_PARAMETER,
          parameters: { advanceCardDrawn: 4 },
        },
      ],
      actions: [
        {
          id: '123-2-2',
          trigger: Trigger.ON_PURGE,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_GLORY,
              cards: { scope: [TargetScope.SELF] },
              value: -4,
            },
          ],
        },
      ],
    },
  ],
};
