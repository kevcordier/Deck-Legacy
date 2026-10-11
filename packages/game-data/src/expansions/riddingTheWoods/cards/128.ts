import { prisonerState } from './124';
import {
  ActionEffectType,
  CardTag,
  Options,
  PassiveType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

export const hugeRobber: CardDef = {
  id: 128,
  name: 'Huge Robber',
  states: [
    {
      id: 1,
      name: 'Huge Robber',
      tags: [CardTag.ENEMY],
      negative: true,
      illustration: 'cards/128_1.jpg',
      glory: { amount: -3 },
      passives: [
        {
          ...CardPassives[PassiveType.DESACTIVATE_OPTION],
          id: '128-1-1',
          options: [Options.ADVANCE],
        },
      ],
      actions: [
        {
          id: '128-1-2',
          defeat: true,
          cost: {
            discard: [{ scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickNumber: 4 }],
          },
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
    prisonerState(128),
  ],
};
