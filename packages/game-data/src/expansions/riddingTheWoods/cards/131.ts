import { prisonerState } from './124';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const robberVeteran: CardDef = {
  id: 131,
  name: 'Robber Veteran',
  states: [
    {
      id: 1,
      name: 'Robber Veteran',
      tags: [CardTag.ENEMY],
      negative: true,
      illustration: 'cards/131_1.jpg',
      glory: { amount: -2 },
      actions: [
        {
          id: '131-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { scope: [TargetScope.BOARD], produces: [ResourceType.GOLD], autoPick: true },
            },
          ],
        },
        {
          id: '131-1-2',
          defeat: true,
          cost: { resources: [{ [ResourceType.WEAPON]: 5 }] },
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
    prisonerState(131),
  ],
};
