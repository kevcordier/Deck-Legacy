import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardSelector } from '@deck-legacy/engine/domain/types';

const personDiscarded: CardSelector = { scope: [TargetScope.DISCARDED], tags: [CardTag.PERSON] };

export const alchemist: CardDef = {
  id: 81,
  name: 'Alchemist',
  states: [
    {
      id: 1,
      name: 'Alchemist',
      illustration: 'cards/81_1.jpg',
      tags: [CardTag.PERSON],
      actions: [
        {
          id: '81-1-1',
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [2, 3, 4] },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Potion of Strength',
      tags: [CardTag.POTION, CardTag.ITEM],
      illustration: 'cards/81_2.jpg',
      actions: [
        {
          id: '81-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                [ResourceType.WEAPON]: 3,
              },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [1] },
            },
          ],
        },
      ],
    },
    {
      id: 3,
      name: 'Healing Potion',
      illustration: 'cards/81_3.jpg',
      tags: [CardTag.POTION, CardTag.ITEM],
      actions: [
        {
          // When a person is discarded, you may play it again and reset this.
          id: '81-3-1',
          trigger: Trigger.ON_DISCARD,
          optional: true,
          triggeredBy: personDiscarded,
          // also when this is discarded together with a person
          condition: { type: 'cardCount', cards: personDiscarded, min: 1 },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { ...personDiscarded, pickNumber: 1 },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [1] },
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Love Potion',
      illustration: 'cards/81_4.jpg',
      tags: [CardTag.POTION, CardTag.ITEM],
      actions: [
        {
          id: '81-4-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                [ResourceType.GOODS]: 5,
              },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [1] },
            },
          ],
        },
      ],
    },
  ],
};
