import { prisonerState } from './124';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const robberSaboteur: CardDef = {
  id: 139,
  name: 'Robber Saboteur',
  states: [
    {
      id: 1,
      name: 'Robber Saboteur',
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
              type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
              resourceScopes: ['production'],
              cards: {
                scope: [TargetScope.BOARD],
                tags: [CardTag.BUILDING],
                produces: Object.values(ResourceType),
                pickNumber: 1,
              },
              resources: { choice: [{ any: 1 }] },
            },
          ],
        },
        {
          id: '139-1-2',
          endsTurn: true,
          defeat: true,
          cost: { resources: [{ [ResourceType.WEAPON]: 3 }] },
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
