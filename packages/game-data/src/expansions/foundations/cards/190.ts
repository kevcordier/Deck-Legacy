import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

/** When played, blocks all friendly cards that stay in play (released when this leaves play). */
const blockStayingCards = (id: string): CardAction => ({
  id,
  trigger: Trigger.ON_PLAY,
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.BLOCK_CARD,
      cards: {
        scope: [TargetScope.BOARD, TargetScope.STAYING, TargetScope.FRIENDLY],
        autoPick: true,
      },
    },
  ],
});

/** Spend 2 {resource} to cross out 1 sword from the upgrade cost of this card. */
const lowerUpgradeCost = (id: string, resource: ResourceType): CardAction => ({
  id,
  unlimited: true,
  cost: { resources: [{ [resource]: 2 }] },
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
      resourceScopes: ['upgradeCost'],
      resources: { [ResourceType.WEAPON]: 1 },
      cards: { scope: [TargetScope.SELF] },
    },
  ],
});

// The two green boxes of the second side: the middle column of its 2 × 5 grid.
const GREEN_STEPS = [3, 8];

/** Siege Tower (Foundations 17). */
export const siegeTower: CardDef = {
  id: 190,
  name: 'Siege Tower',
  states: [
    {
      id: 1,
      name: 'Siege Tower',
      tags: [CardTag.ENEMY],
      negative: true,
      glory: { amount: -5 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        blockStayingCards('190-1-1'),
        lowerUpgradeCost('190-1-2', ResourceType.WEAPON),
        lowerUpgradeCost('190-1-3', ResourceType.STONE),
      ],
      upgrade: [{ cost: { resources: [{ [ResourceType.WEAPON]: 12 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Siege Tower',
      tags: [CardTag.ENEMY],
      negative: true,
      glory: { amount: -3 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      track: {
        inOrder: false,
        steps: Array.from({ length: 10 }, (_, i) => ({ id: i + 1 })),
      },
      actions: [
        blockStayingCards('190-2-1'),
        {
          id: '190-2-2',
          unlimited: true,
          cost: { resources: [{ [ResourceType.WEAPON]: 3 }] },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        {
          id: '190-2-3',
          cost: { resources: [{ [ResourceType.STONE]: 3 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: { scope: [TargetScope.SELF] },
              steps: { ids: GREEN_STEPS },
            },
          ],
        },
        {
          id: '190-2-4',
          trigger: Trigger.ON_TRACK_END,
          actionEffects: [
            { id: 1, type: ActionEffectType.DESTROY_CARD, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
    },
  ],
};
