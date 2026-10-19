import {
  ActionEffectType,
  CardTag,
  PassiveType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardDef } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

const toState = (stateId: number, id = 1): ActionEffect => ({
  id,
  type: ActionEffectType.UPGRADE_CARD,
  cards: { scope: [TargetScope.SELF] },
  states: { ids: [stateId] },
});

export const mead: CardDef = {
  id: 165,
  name: 'Mead',
  states: [
    {
      id: 1,
      name: 'Mead',
      tags: [CardTag.ITEM],
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '165-1-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON], autoPick: true },
              },
            },
            toState(2, 2),
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Too Much Mead',
      tags: [CardTag.EVENT],
      negative: true,
      actions: [
        {
          id: '165-2-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [{ id: 1, type: ActionEffectType.LOSE_NEXT_RESOURCES, value: 3 }],
        },
        { id: '165-2-2', trigger: Trigger.END_OF_TURN, actionEffects: [toState(1)] },
      ],
    },
  ],
};
