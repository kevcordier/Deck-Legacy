import { flipTo } from './flipTo';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Obsession / Failed Experiment (Foundations 48). */
export const obsession: CardDef = {
  id: 221,
  name: 'Obsession',
  states: [
    {
      id: 1,
      name: 'Obsession',
      tags: [CardTag.EVENT],
      actions: [
        {
          // A science sticker on 1 person, replacing another production
          id: '221-1-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
              resourceScopes: ['production'],
              resources: { choice: [{ any: 1 }] },
              cards: {
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
                produces: Object.values(ResourceType),
                pickNumber: 1,
              },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_STICKER,
              cards: { scope: [TargetScope.LAST_SELECTED] },
              stickers: { ids: [62] },
            },
            flipTo(3, 2),
          ],
        },
        { id: '221-1-2', trigger: Trigger.END_OF_TURN, actionEffects: [flipTo(1, 2)] },
      ],
    },
    {
      id: 2,
      name: 'Failed Experiment',
      tags: [CardTag.EVENT],
      negative: true,
      actions: [
        {
          id: '221-2-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { scope: [TargetScope.BOARD, TargetScope.FRIENDLY], pickNumber: 2 },
            },
            flipTo(2, 1),
          ],
        },
      ],
    },
  ],
};
