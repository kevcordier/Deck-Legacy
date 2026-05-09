import {
  ActionEffectType,
  CardTag,
  Options,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const darkPrince: CardDef = {
  id: 52,
  name: 'Dark Prince',
  states: [
    {
      id: 1,
      name: 'Dark Prince',
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/1fd6f7fc-7918-4c18-8e7a-5fc7d898aa11/450x%3Cauto%3E_so',
      tags: [CardTag.ENEMY],
      negative: true,
      glory: { amount: -7 },
      passives: [
        {
          ...CardPassives[PassiveType.DESACTIVATE_OPTION],
          options: [Options.ADVANCE, Options.UPGRADE, Options.END_TURN_ACTION],
        },
      ],
      actions: [
        {
          id: '52-1-1',
          cost: {
            resources: [
              {
                [ResourceType.WEAPON]: 4,
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
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Impressed Boy',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/d1b64167-814b-4b1f-a566-ab7bf6dbbece/anim=false,width=450,optimized=true/ComfyUI_00709_.jpeg',
      tags: [CardTag.PERSON],
      actions: [
        {
          id: '52-2-1',
          cost: {
            destroy: {
              scope: [TargetScope.SELF],
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                [ResourceType.WEAPON]: 2,
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.IRON]: 1,
                [ResourceType.WEAPON]: 1,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Squire',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/10d909fa-c209-43cd-8573-295aeb0e6cd1/anim=false,width=450,optimized=true/63M5TW26RTB2P2QKNHJ1RP8AJ0.jpeg',
      tags: [CardTag.PERSON],
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
      glory: { amount: 3 },
      actions: [
        {
          id: '52-3-1',
          cost: {
            destroy: {
              scope: [TargetScope.SELF],
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                [ResourceType.WEAPON]: 3,
              },
            },
          ],
        },
      ],
    },
  ],
};
