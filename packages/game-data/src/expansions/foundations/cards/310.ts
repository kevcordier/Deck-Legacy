import { crossOutProduction } from './crossOutProduction';
import { destroySelf } from './destroySelf';
import { flipTo } from './flipTo';
import { highestMarked } from './highestMarked';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const LADY_ELARA = 328;
const THORNFIELD = [3, 7, 12, 20, 30];

/** Lady Elara / House of Thornfield (Foundations 137): a side chosen when discovered. */
export const ladyElara: CardDef = {
  id: 310,
  name: 'Lady Elara',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Lady Elara',
      tags: [CardTag.PERSON, CardTag.LADY],
      glory: { amount: 0, emptyValues: 6 },
      // The 6 medals: a box marked for each one written
      track: { inOrder: true, steps: [1, 2, 3, 4, 5, 6].map(id => ({ id })) },
      actions: [
        {
          // Cross out all glory on 1 person to write that amount +2 here
          id: '310-1-1',
          condition: {
            type: 'cardCount',
            cards: { ids: [LADY_ELARA], scope: [TargetScope.SELF, TargetScope.WITH_TRACK] },
            min: 1,
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_CUMULATED,
              value: 0,
              // By default an effect targets the cards in play
              cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickNumber: 1 },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_GLORY,
              cards: { scope: [TargetScope.SELF] },
              valuePerElement: {
                amount: 1,
                glory: true,
                plus: 2,
                cards: { scope: [TargetScope.LAST_SELECTED] },
              },
              keepSelection: true,
            },
            {
              id: 3,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: { scope: [TargetScope.SELF] },
              keepSelection: true,
            },
            {
              id: 4,
              type: ActionEffectType.CROSS_OUT_GLORY,
              cards: { scope: [TargetScope.LAST_SELECTED] },
            },
          ],
        },
        {
          // When purged, you may turn her instead (her glory still counts in the purge)
          id: '310-1-2',
          trigger: Trigger.ON_PURGE,
          optional: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.SAVE_FROM_PURGE,
              cards: { scope: [TargetScope.SELF] },
              keepGlory: true,
            },
            flipTo(2, 2),
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'House of Thornfield',
      tags: [CardTag.BUILDING],
      ...highestMarked(THORNFIELD),
      actions: [
        {
          // When played, cross out 1 production on 1 land in play; if you do, mark 1 box
          id: '310-2-1',
          trigger: Trigger.ON_PLAY,
          condition: {
            type: 'cardCount',
            cards: {
              scope: [TargetScope.BOARD],
              tags: [CardTag.LAND],
              produces: Object.values(ResourceType),
            },
            min: 1,
          },
          actionEffects: [
            crossOutProduction(1, { scope: [TargetScope.BOARD], tags: [CardTag.LAND] }),
            { id: 2, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        { id: '310-2-2', trigger: Trigger.ON_TRACK_END, actionEffects: [destroySelf(1)] },
      ],
    },
  ],
};
