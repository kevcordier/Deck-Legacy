import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef } from '@deck-legacy/engine/domain/types';

const gainAnyResources = (id: string, count: number): CardAction => ({
  id,
  trigger: Trigger.ON_PLAY,
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.ADD_RESOURCES,
      resources: { choice: [{ any: 1 }] },
      repeat: count,
    },
  ],
});

export const powerfulPrince: CardDef = {
  id: 135,
  name: 'Powerful Prince',
  states: [
    {
      id: 1,
      name: 'Powerful Prince',
      tags: [CardTag.PERSON],
      illustration: 'cards/135_1.jpg',
      glory: { amount: -5 },
      actions: [
        {
          id: '135-1-1',
          unlimited: true,
          cost: { resources: [{ [ResourceType.GOLD]: 3 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
              resourceScopes: ['upgradeCost'],
              resources: { [ResourceType.GOLD]: 1 },
              cards: { scope: [TargetScope.SELF] },
            },
          ],
        },
        gainAnyResources('135-1-2', 2),
      ],
      upgrade: [{ cost: { resources: [{ [ResourceType.GOLD]: 18 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Prince _____',
      chooseName: true,
      tags: [CardTag.PERSON],
      illustration: 'cards/135_2.jpg',
      glory: { amount: -12 },
      actions: [
        gainAnyResources('135-2-1', 3),
        {
          id: '135-2-2',
          endsTurn: true,
          // Treasury (Ridding the Woods 28)
          actionEffects: [{ id: 1, type: ActionEffectType.DISCOVER_CARD, cards: { ids: [166] } }],
        },
      ],
    },
  ],
};
