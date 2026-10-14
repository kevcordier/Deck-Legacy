import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, StepDef } from '@deck-legacy/engine/domain/types';

const woodStep = (id: number, wood: number): StepDef => ({
  id,
  effects: [
    { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { [ResourceType.WOOD]: wood } },
  ],
});

export const oldOakTree: CardDef = {
  id: 143,
  name: 'Old Oak Tree',
  states: [
    {
      id: 1,
      name: 'Old Oak Tree',
      // negative land, but not an enemy
      tags: [CardTag.LAND],
      negative: true,
      illustration: 'cards/143_1.jpg',
      actions: [
        {
          id: '143-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { scope: [TargetScope.DISCARD], tags: [CardTag.ENEMY], pickNumber: 1 },
            },
          ],
        },
        {
          id: '143-1-2',
          cost: { resources: [{ [ResourceType.IRON]: 2 }] },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
      track: {
        inOrder: true,
        steps: [
          ...[1, 2, 3].map(id => ({ id })),
          {
            id: 4,
            effects: [
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
    },
    {
      id: 2,
      name: 'Stump',
      tags: [CardTag.LAND],
      illustration: 'cards/143_2.jpg',
      actions: [
        {
          id: '143-2-1',
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
      track: {
        inOrder: false,
        steps: [woodStep(5, 2), woodStep(6, 2), woodStep(7, 2), woodStep(8, 3), woodStep(9, 3)],
      },
    },
  ],
};
