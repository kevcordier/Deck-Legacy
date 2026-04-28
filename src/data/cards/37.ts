import { ActionEffectType, CardTag, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const camp: CardDef = {
  id: 37,
  name: 'Camp',
  states: [
    {
      id: 1,
      name: 'Camp',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/24749212-1658-4666-a72d-78de8dfd795d/anim=false,width=450,optimized=true/Gemini_Generated_Image_7ukp8m7ukp8m7ukp.jpeg',
      upgrade: [
        {
          cost: {
            resources: [{ [ResourceType.GOLD]: 1, [ResourceType.WOOD]: 1, [ResourceType.IRON]: 1 }],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Training Grounds',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/4d3011bb-0810-4e03-aac2-cc98a55a95a6/anim=false,width=450,optimized=true/ComfyUI_00601_.jpeg',
      glory: {
        amount: 1,
      },
      actions: [
        {
          id: '37_2_1',
          cost: {
            resources: [{ [ResourceType.GOLD]: 1 }],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                [ResourceType.WEAPON]: 1,
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [{ [ResourceType.IRON]: 2 }],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Sir ___',
      chooseName: true,
      tags: [CardTag.PERSON, CardTag.KNIGHT],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/e880fa00-c376-45c9-9455-ca39c8bf4747/anim=false,width=450,optimized=true/00049-[nightvisionXLPhotorealisticPortrait_v0743ReleaseBakedvae]-[DPM++%202M%20SDE%20Heun%20Karras]-2768784185-30-7-20231105193945.jpeg',
      productions: [
        {
          [ResourceType.WEAPON]: 2,
        },
      ],
      glory: {
        amount: 3,
      },
    },
  ],
};
