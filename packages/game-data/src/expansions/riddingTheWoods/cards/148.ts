import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef } from '@deck-legacy/engine/domain/types';

const landForTwoResources = (id: string, unlimited: boolean): CardAction => ({
  id,
  unlimited,
  cost: { discard: [{ scope: [TargetScope.BOARD], tags: [CardTag.LAND], pickNumber: 1 }] },
  actionEffects: [
    { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { choice: [{ any: 1 }] }, repeat: 2 },
  ],
});

export const sheriff: CardDef = {
  id: 148,
  name: 'Sheriff',
  states: [
    {
      id: 1,
      name: 'Sheriff',
      tags: [CardTag.PERSON],
      illustration: 'cards/148_1.jpg',
      actions: [
        {
          id: '148-1-1',
          unlimited: true,
          cost: { resources: [{ [ResourceType.GOODS]: 3 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
              resourceScopes: ['upgradeCost'],
              resources: { [ResourceType.GOODS]: 1 },
              cards: { scope: [TargetScope.SELF] },
            },
          ],
        },
        landForTwoResources('148-1-2', false),
      ],
      upgrade: [{ cost: { resources: [{ [ResourceType.GOODS]: 12 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Feared Sheriff',
      tags: [CardTag.PERSON],
      illustration: 'cards/148_2.jpg',
      glory: { amount: -12 },
      actions: [landForTwoResources('148-2-1', true)],
    },
  ],
};
