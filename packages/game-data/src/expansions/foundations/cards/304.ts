import { hasStepsLeft } from './hasStepsLeft';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const HOUSE = 322;

/** Lord Edric / House of Stonehaven (Foundations 131): a side chosen when discovered. */
export const lordEdric: CardDef = {
  id: 304,
  name: 'Lord Edric',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Lord Edric',
      tags: [CardTag.PERSON],
      actions: [
        {
          // Cross out 1 production on another person in play to add its sticker here
          id: '304-1-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
              resourceScopes: ['production'],
              cards: {
                scope: [TargetScope.BOARD, TargetScope.PERMANENTS],
                tags: [CardTag.PERSON],
                produces: Object.values(ResourceType),
                pickNumber: 1,
              },
              resources: { choice: [{ any: 1 }] },
              stickerHere: true,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'House of Stonehaven',
      tags: [CardTag.BUILDING],
      productions: [{ [ResourceType.GOLD]: 1 }],
      glory: { amount: 0, emptyValues: 6 },
      // The 6 medals: a box marked for each one written
      track: { inOrder: true, steps: [1, 2, 3, 4, 5, 6].map(id => ({ id })) },
      actions: [
        {
          // Destroy 1 friendly card in play: write its glory +7 here, add a sticker of its production
          id: '304-2-1',
          condition: hasStepsLeft(HOUSE),
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_CUMULATED,
              value: 0,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.PERMANENTS, TargetScope.FRIENDLY],
                pickNumber: 1,
              },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_GLORY,
              cards: { scope: [TargetScope.SELF] },
              keepSelection: true,
              valuePerElement: {
                amount: 1,
                glory: true,
                plus: 7,
                cards: { scope: [TargetScope.LAST_SELECTED] },
              },
            },
            {
              id: 3,
              type: ActionEffectType.ADD_STICKER,
              cards: { scope: [TargetScope.SELF] },
              stickers: { producedByLastSelected: true, pickNumber: 1 },
              keepSelection: true,
            },
            {
              id: 4,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: { scope: [TargetScope.SELF] },
              keepSelection: true,
            },
            {
              id: 5,
              type: ActionEffectType.DESTROY_CARD,
              cards: { scope: [TargetScope.LAST_SELECTED] },
            },
          ],
        },
      ],
    },
  ],
};
