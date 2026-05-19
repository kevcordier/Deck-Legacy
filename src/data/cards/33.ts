import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const fieldWorker2: CardDef = {
  id: 33,
  name: 'Field Worker',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Field Worker',
      tags: [CardTag.PERSON],
      illustration: 'cards/33_1.jpg',
      actions: [
        {
          id: '33-1-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                cards: {
                  scope: [TargetScope.BOARD],
                  tags: [CardTag.LAND],
                  produces: [
                    ResourceType.GOLD,
                    ResourceType.WOOD,
                    ResourceType.STONE,
                    ResourceType.IRON,
                    ResourceType.WEAPON,
                    ResourceType.GOODS,
                  ],
                },
              },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Storage',
      tags: [CardTag.BUILDING],
      illustration: 'cards/33_2.jpg',
      glory: { amount: 1 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '33-2-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          cost: {
            discard: [
              {
                scope: [TargetScope.SELF],
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_BOARD_EFFECT,
              cards: {
                scope: [TargetScope.BOARD],
                pickMin: 0,
                pickMax: 1,
              },
              effect: CardPassives[PassiveType.STAY_IN_PLAY],
            },
          ],
        },
      ],
    },
  ],
};
