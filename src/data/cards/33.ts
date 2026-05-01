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
  chooseState: true,
  states: [
    {
      id: 1,
      name: 'Field Worker',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/afa4cf05-2f0a-4ac7-bc90-bd9d3f2f5832/anim=false,width=450,optimized=true/ComfyUI_00998_.jpeg',
      actions: [
        {
          id: '8-1-1',
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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/96ee65fa-2771-4215-9a7c-5c7cacfac93d/original=true,quality=90/00013-3241185053.jpeg',
      glory: { amount: 1 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '21-1-1',
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
              },
              effect: CardPassives[PassiveType.STAY_IN_PLAY],
              pickMin: 0,
              pickMax: 1,
            },
          ],
        },
      ],
    },
  ],
};
