import {
  ActionEffectType,
  CardTag,
  PassiveType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const keeperOfSecrets: CardDef = {
  id: 146,
  name: 'Keeper of Secrets',
  states: [
    {
      id: 1,
      name: 'Keeper of Secrets',
      tags: [CardTag.ENEMY],
      negative: true,
      illustration: 'cards/146_1.jpg',
      actions: [
        {
          id: '146-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { scope: [TargetScope.BOARD], autoPick: true },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'The Chase',
      tags: [CardTag.EVENT],
      negative: true,
      illustration: 'cards/146_2.jpg',
      actions: [
        {
          // green track
          id: '146-2-1',
          cost: {
            discard: [{ scope: [TargetScope.BOARD, TargetScope.FRIENDLY], pickNumber: 6 }],
          },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        {
          // shortcut: the red track (3 boxes) is the card's accumulation because a state has only
          // one track; when another card needs a second track, support several tracks per state.
          id: '146-2-3',
          trigger: Trigger.END_OF_TURN,
          condition: { type: 'accumulation', max: 1 },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_CUMULATED,
              cards: { scope: [TargetScope.SELF] },
              value: 1,
            },
          ],
        },
        {
          id: '146-2-4',
          trigger: Trigger.END_OF_TURN,
          condition: { type: 'accumulation', min: 2 },
          actionEffects: [
            { id: 1, type: ActionEffectType.DESTROY_CARD, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
      track: {
        inOrder: true,
        steps: [
          ...[1, 2].map(id => ({ id })),
          {
            id: 3,
            effects: [
              {
                id: 1,
                type: ActionEffectType.UPGRADE_CARD,
                cards: { scope: [TargetScope.SELF] },
                states: { ids: [3] },
              },
            ],
          },
        ],
      },
    },
    {
      id: 3,
      name: 'Ether Connector',
      tags: [CardTag.ARTIFACT],
      permanent: true,
      illustration: 'cards/146_3.jpg',
      glory: { amount: 10 },
      passives: [{ id: '146-3-1', type: PassiveType.CANT_BE_DESTROYED }],
    },
  ],
};
