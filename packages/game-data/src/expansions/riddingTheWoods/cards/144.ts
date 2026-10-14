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
  id: 144,
  name: 'Old Oak Tree',
  states: [
    {
      id: 1,
      name: 'Old Oak Tree',
      // negative land, but not an enemy
      tags: [CardTag.LAND],
      negative: true,
      illustration: 'cards/144_1.jpg',
      actions: [
        {
          id: '144-1-1',
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
          id: '144-1-2',
          cost: { resources: [{ [ResourceType.IRON]: 2 }] },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        {
          id: '144-1-3',
          trigger: Trigger.ON_TRACK_END,
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
      track: { inOrder: true, steps: [1, 2, 3, 4].map(id => ({ id })) },
    },
    {
      id: 2,
      name: 'Stump',
      tags: [CardTag.LAND],
      illustration: 'cards/144_2.jpg',
      actions: [
        {
          id: '144-2-1',
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
      track: {
        inOrder: false,
        steps: [woodStep(1, 2), woodStep(2, 2), woodStep(3, 2), woodStep(4, 3), woodStep(5, 3)],
      },
    },
  ],
};
