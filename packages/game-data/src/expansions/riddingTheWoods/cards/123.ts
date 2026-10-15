import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardSelector, Condition } from '@deck-legacy/engine/domain/types';

const lady: CardSelector = {
  name: 'A Certain Lady',
  scope: [TargetScope.DECK, TargetScope.DISCARD, TargetScope.BOARD],
};
const ladyFound: Condition = { type: 'cardCount', cards: lady, min: 1 };

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
          // If A Certain Lady is in the deck, the discard pile or in play: destroy her and upgrade.
          // Otherwise destroy this. The upgrade comes first so that the lady is still there when
          // the second effect checks her absence.
          id: '123-1-3',
          trigger: Trigger.ON_TRACK_END,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              condition: ladyFound,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [2] },
            },
            {
              id: 2,
              type: ActionEffectType.DESTROY_CARD,
              condition: { type: 'not', condition: ladyFound },
              cards: { scope: [TargetScope.SELF] },
            },
            {
              id: 3,
              type: ActionEffectType.DESTROY_CARD,
              condition: ladyFound,
              cards: { ...lady, autoPick: true },
            },
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
