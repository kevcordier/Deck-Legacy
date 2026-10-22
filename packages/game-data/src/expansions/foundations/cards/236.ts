import { hasStepsLeft } from './hasStepsLeft';
import { RESOURCE_STICKERS, SCIENCE_CARDS } from './scienceConstants';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef } from '@deck-legacy/engine/domain/types';

const SC = ResourceType.SCIENCE;
const tags = [CardTag.INVENTION, CardTag.PERMANENT];

/** Spend `spend` science to gain any 1 resource. */
const anyResource = (id: string, spend: number): CardAction => ({
  id,
  unlimited: true,
  cost: { resources: [{ [SC]: spend }] },
  actionEffects: [
    { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { choice: [{ any: 1 }] } },
  ],
});

/** Applied Science / Scientific Progress (Foundations 63). */
export const appliedScience: CardDef = {
  id: 236,
  name: 'Applied Science',
  states: [
    {
      id: 1,
      name: 'Applied Science',
      tags,
      actions: [
        anyResource('236-1-1', 3),
        {
          id: '236-1-2',
          unlimited: true,
          cost: { resources: [{ [SC]: 3 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
              resourceScopes: ['upgradeCost'],
              resources: { [SC]: 1 },
              cards: { scope: [TargetScope.SELF] },
            },
          ],
        },
      ],
      upgrade: [{ cost: { resources: [{ [SC]: 12 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Scientific Progress',
      tags,
      track: { inOrder: true, steps: [1, 2, 3, 4, 5].map(id => ({ id })) },
      actions: [
        anyResource('236-2-1', 2),
        {
          id: '236-2-2',
          endsTurn: true,
          condition: hasStepsLeft(SCIENCE_CARDS.appliedScience),
          cost: { resources: [{ [SC]: 7 }] },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
            {
              id: 2,
              type: ActionEffectType.ADD_STICKER,
              cards: { scope: [TargetScope.ANY, TargetScope.FRIENDLY], pickNumber: 1 },
              stickers: { ids: RESOURCE_STICKERS, pickNumber: 1 },
            },
          ],
        },
      ],
    },
  ],
};
