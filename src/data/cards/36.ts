import { ActionEffectType, CardTag, Options, PassiveType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const darkKnight: CardDef = {
  id: 36,
  name: 'Dark Knight',
  states: [
    {
      id: 1,
      name: 'Dark Knight',
      tags: [CardTag.ENEMY],
      negative: true,
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/902c58f5-4166-4cc0-b8a7-a7e3d49b393e/450x%3Cauto%3E_so',
      glory: { amount: -3 },
      passives: [
        {
          ...CardPassives[PassiveType.DESACTIVATE_OPTION],
          id: '36-1-1',
          options: [Options.ADVANCE, Options.UPGRADE, Options.END_TURN_ACTION],
        },
      ],
      actions: [
        {
          id: '36-1-1',
          cost: {
            resources: [
              {
                weapon: 3,
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
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/d1b64167-814b-4b1f-a566-ab7bf6dbbece/anim=false,width=450,optimized=true/ComfyUI_00709_.jpeg',
      actions: [
        {
          id: '36-2-1',
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
                weapon: 2,
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
                iron: 1,
                weapon: 1,
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
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/10d909fa-c209-43cd-8573-295aeb0e6cd1/anim=false,width=450,optimized=true/63M5TW26RTB2P2QKNHJ1RP8AJ0.jpeg',
      productions: [
        {
          weapon: 1,
        },
      ],
      glory: { amount: 3 },
      actions: [
        {
          id: '36-3-1',
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
                weapon: 3,
              },
            },
          ],
        },
      ],
    },
  ],
};
