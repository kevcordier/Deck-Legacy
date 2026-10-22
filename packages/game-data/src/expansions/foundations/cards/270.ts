import { hasStepsLeft } from './hasStepsLeft';
import { RESOURCE_STICKERS } from './scienceConstants';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardSelector } from '@deck-legacy/engine/domain/types';

const { GOLD, WOOD, GOODS, WEAPON } = ResourceType;
const GODFREY = 288;
const enemyInDiscard: CardSelector = { scope: [TargetScope.DISCARD], tags: [CardTag.ENEMY] };

/** Godfrey (Foundations 97). */
export const godfrey: CardDef = {
  id: 270,
  name: 'Godfrey',
  states: [
    {
      id: 1,
      name: 'Godfrey',
      tags: [CardTag.PERSON],
      productions: [{ [WEAPON]: 1 }],
      upgrade: [{ cost: { resources: [{ [GOODS]: 2, [WOOD]: 2, [GOLD]: 2 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Sir Godfrey',
      tags: [CardTag.PERSON, CardTag.KNIGHT],
      track: { inOrder: true, steps: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] },
      actions: [
        {
          id: '270-2-1',
          trigger: Trigger.ON_PLAY,
          optional: true,
          condition: {
            type: 'and',
            conditions: [
              hasStepsLeft(GODFREY),
              { type: 'cardCount', cards: enemyInDiscard, min: 1 },
            ],
          },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
            {
              id: 2,
              type: ActionEffectType.PLAY_CARD,
              cards: { ...enemyInDiscard, pickNumber: 1 },
            },
            {
              id: 3,
              type: ActionEffectType.ADD_STICKER,
              cards: { scope: [TargetScope.SELF] },
              stickers: { ids: RESOURCE_STICKERS, pickNumber: 1 },
            },
          ],
        },
      ],
    },
  ],
};
