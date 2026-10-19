import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, StepDef } from '@deck-legacy/engine/domain/types';

const weaponsStep = (id: number, weapons: number): StepDef => ({
  id,
  effects: [
    { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { [ResourceType.WEAPON]: weapons } },
  ],
});

export const vikingWarrior: CardDef = {
  id: 164,
  name: 'Viking Warrior',
  states: [
    {
      id: 1,
      name: 'Viking Warrior',
      tags: [CardTag.PERSON],
      actions: [
        {
          id: '164-1-1',
          cost: { resources: [{ [ResourceType.GOLD]: 2 }] },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        {
          id: '164-1-2',
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
      track: {
        inOrder: false,
        steps: [weaponsStep(1, 3), weaponsStep(2, 2), weaponsStep(3, 2), weaponsStep(4, 1)],
      },
    },
    {
      id: 2,
      name: 'Viking Veteran',
      tags: [CardTag.PERSON],
      productions: [{ [ResourceType.WEAPON]: 2 }],
      glory: { amount: 5 },
    },
  ],
};
