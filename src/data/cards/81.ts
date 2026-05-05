import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const alchemist: CardDef = {
  id: 81,
  name: 'Alchemist',
  states: [
    {
      id: 1,
      name: 'Alchemist',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/854c1bce-03e5-4da3-ba20-4723eeee2863/anim=false,width=450,optimized=true/76490C94706CDDCC2B465B442DEA62AC5350799B4B243728BAF049F9B08D93E6.jpeg',
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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/4091841e-29fe-4a47-aca0-0a1eae3ed1ff/450x%3Cauto%3E_so',
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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/115e7a7a-28fe-4dcb-b282-aafa4233a344/450x%3Cauto%3E_so',
      tags: [CardTag.POTION, CardTag.ITEM],
      passives: [
        {
          id: '81-3-1',
          type: PassiveType.ADD_TRIGGER,
          trigger: {
            type: Trigger.ON_DISCARD,
            cards: {
              scope: [TargetScope.DISCARDED],
              tags: [CardTag.PERSON],
            },
            actions: [
              {
                id: 1,
                type: ActionEffectType.PLAY_CARD,
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
              {
                id: 2,
                type: ActionEffectType.UPGRADE_CARD,
                cards: {
                  scope: [TargetScope.TRIGGER_SOURCE],
                },
                states: { ids: [1] },
              },
            ],
          },
        },
      ],
    },
    {
      id: 4,
      name: 'Love Potion',
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/ec0654f9-4201-42ae-9bf0-ee55819dda79/450x%3Cauto%3E_so',
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
