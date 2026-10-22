import { destroySelf } from './destroySelf';
import { ActionEffectType, CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const tags = [CardTag.EVENT, CardTag.PERMANENT];

/** Cursed Lands (Foundations 33, 43): random lands, then persons, held out of the deck. */
export const cursedLands: CardDef = {
  id: 206,
  name: 'Cursed Lands',
  states: [
    {
      id: 1,
      name: 'Cursed Lands',
      tags,
      negative: true,
      actions: [
        {
          // 3 random lands of the kingdom, blocked until this is upgraded
          id: '206-1-1',
          trigger: Trigger.ON_DISCOVER,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.BLOCK_CARD,
              cards: {
                scope: [TargetScope.ANY],
                tags: [CardTag.LAND],
                random: true,
                pickNumber: 3,
              },
            },
          ],
        },
      ],
      upgrade: [{ cost: { anyResources: 20 }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Haunted Souls',
      tags,
      negative: true,
      actions: [
        {
          // Once: 3 random persons of the deck, after the shuffle
          id: '206-2-1',
          trigger: Trigger.START_OF_ROUND,
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.BLOCK_CARD,
              cards: {
                scope: [TargetScope.DECK],
                tags: [CardTag.PERSON],
                random: true,
                pickNumber: 3,
              },
            },
          ],
        },
        {
          id: '206-2-2',
          endsTurn: true,
          cost: { discard: [{ tags: [CardTag.PERSON], pickNumber: 2 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UNBLOCK_CARD,
              cards: { scope: [TargetScope.BLOCKED_BY_THIS], pickNumber: 1 },
            },
            {
              ...destroySelf(2),
              condition: {
                type: 'cardCount',
                cards: { scope: [TargetScope.BLOCKED_BY_THIS] },
                max: 0,
              },
            },
          ],
        },
      ],
    },
  ],
};
