import { destroySelf } from './destroySelf';
import { RESOURCE_STICKERS } from './scienceConstants';
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

const WISHING_WELL = 320;

const stickerOnBlocked = (id: number): ActionEffect => ({
  id,
  type: ActionEffectType.ADD_STICKER,
  cards: { scope: [TargetScope.BLOCKED_BY_THIS] },
  stickers: { ids: RESOURCE_STICKERS, pickNumber: 1 },
});

/** Steward / Wishing Well (Foundations 129): a side chosen when discovered. */
export const steward: CardDef = {
  id: 302,
  name: 'Steward',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Steward',
      tags: [CardTag.PERSON],
      productions: [{ [ResourceType.GOLD]: 1 }],
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '302-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.BLOCK_CARD,
              cards: { scope: [TargetScope.BOARD], tags: [CardTag.BUILDING], pickNumber: 1 },
            },
          ],
        },
        {
          // {{destroy}}: add any 2 resource stickers to the blocked building
          id: '302-1-2',
          condition: { type: 'cardCount', cards: { scope: [TargetScope.BLOCKED_BY_THIS] }, min: 1 },
          actionEffects: [stickerOnBlocked(1), stickerOnBlocked(2), destroySelf(3)],
        },
      ],
    },
    {
      id: 2,
      name: 'Wishing Well',
      tags: [CardTag.LAND],
      track: {
        inOrder: true,
        steps: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5, effects: [destroySelf(1)] }],
      },
      actions: [
        {
          // End of turn: mark 1 box to play any 1 card from the discard pile, staying in play
          id: '302-2-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          condition: {
            type: 'and',
            conditions: [
              {
                type: 'cardCount',
                cards: { ids: [WISHING_WELL], scope: [TargetScope.SELF, TargetScope.WITH_TRACK] },
                min: 1,
              },
              { type: 'cardCount', cards: { scope: [TargetScope.DISCARD] }, min: 1 },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { scope: [TargetScope.DISCARD], pickNumber: 1 },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_BOARD_EFFECT,
              cards: { scope: [TargetScope.LAST_SELECTED] },
              effect: CardPassives[PassiveType.STAY_IN_PLAY],
            },
            { id: 3, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
    },
  ],
};
