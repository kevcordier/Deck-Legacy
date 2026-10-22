import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef } from '@deck-legacy/engine/domain/types';

const SCIENCE = ResourceType.SCIENCE;

/** Spend 2 science to cross out 1 science in the upgrade cost here. */
const lowerUpgradeCost = (id: string): CardAction => ({
  id,
  unlimited: true,
  cost: { resources: [{ [SCIENCE]: 2 }] },
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
      resourceScopes: ['upgradeCost'],
      resources: { [SCIENCE]: 1 },
      cards: { scope: [TargetScope.SELF] },
    },
  ],
});

/** Brainstorming (Foundations 149): becomes the Industry. */
export const brainstorming: CardDef = {
  id: 322,
  name: 'Brainstorming',
  states: [
    {
      id: 1,
      name: 'Brainstorming',
      tags: [CardTag.EVENT],
      actions: [lowerUpgradeCost('322-1-1')],
      upgrade: [{ cost: { resources: [{ [SCIENCE]: 10 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: "Inventor's Guild",
      tags: [CardTag.BUILDING],
      glory: { amount: 10 },
      actions: [lowerUpgradeCost('322-2-1')],
      upgrade: [{ cost: { resources: [{ [SCIENCE]: 15 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Industry',
      tags: [CardTag.BUILDING, CardTag.INVENTION],
      glory: { amount: 20 },
      actions: [
        {
          // Use the ⌛ effect of a permanent card; this does not end the turn
          id: '322-3-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.USE_CARD_ACTION,
              cards: { scope: [TargetScope.PERMANENTS], pickNumber: 1 },
              usableActions: 'timed',
            },
          ],
        },
      ],
    },
  ],
};
