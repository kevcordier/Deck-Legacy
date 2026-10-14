import { prisonerState } from './124';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const rebelliousMonk: CardDef = {
  id: 139,
  name: 'Rebellious Monk',
  states: [
    {
      id: 1,
      name: 'Rebellious Monk',
      tags: [CardTag.ENEMY],
      negative: true,
      illustration: 'cards/139_1.jpg',
      glory: { amount: -2 },
      actions: [
        {
          id: '139-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.BLOCK_CARD,
              cards: { scope: [TargetScope.BOARD, TargetScope.FRIENDLY], pickNumber: 3 },
            },
          ],
        },
        {
          // "Spend to upgrade", not a defeat
          id: '139-1-2',
          endsTurn: true,
          cost: { resources: [{ [ResourceType.GOODS]: 4 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    prisonerState(139),
  ],
};
