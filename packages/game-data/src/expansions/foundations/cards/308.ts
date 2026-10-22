import { gainAny } from './gainAny';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardSelector } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

const { GOLD, WOOD, STONE, IRON } = ResourceType;
const landsPlayed: CardSelector = { scope: [TargetScope.DRAWN], tags: [CardTag.LAND] };

/** Baron Arion / Windermere Estate (Foundations 135): a side chosen when discovered. */
export const baronArion: CardDef = {
  id: 308,
  name: 'Baron Arion',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Baron Arion',
      tags: [CardTag.PERSON],
      glory: { amount: -2 },
      actions: [
        {
          id: '308-1-1',
          condition: {
            type: 'cardCount',
            cards: { scope: [TargetScope.BOARD, TargetScope.PERMANENTS, TargetScope.ENEMY] },
            min: 1,
          },
          actionEffects: [gainAny(1, 3)],
        },
      ],
    },
    {
      id: 2,
      name: 'Windermere Estate',
      tags: [CardTag.LAND],
      productions: [{ [GOLD]: 2, [WOOD]: 2, [STONE]: 2, [IRON]: 2 }],
      glory: { amount: 2 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          // When a land is played, discard it (the land; Windermere stays)
          id: '308-2-1',
          trigger: Trigger.ON_PLAY,
          triggeredBy: landsPlayed,
          condition: {
            type: 'and',
            conditions: [
              { type: 'not', condition: { type: 'justPlayed' } },
              { type: 'cardCount', cards: landsPlayed, min: 1 },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { ...landsPlayed, autoPick: true },
            },
          ],
        },
      ],
    },
  ],
};
