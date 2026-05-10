import { ActionEffectType, CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const boulder: CardDef = {
  id: 110,
  name: 'Boulder',
  chooseState: [1, 3],
  states: [
    {
      id: 1,
      name: 'Boulder',
      tags: [CardTag.LAND],
      illustration:
        'https://img.magnific.com/premium-photo/massive-boulder-perched-rocky-terrain-vast-blue-sky-ai_97070-81489.jpg?w=2000',
      productions: [{ stone: 1 }],
      upgrade: [
        {
          cost: { resources: [{ iron: 2 }] },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Boulders',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/e84ae93b-2e74-4bb1-8011-e4235e89734a/450x%3Cauto%3E_so',
      productions: [{ stone: 2 }],
      glory: { amount: 1 },
    },
    {
      id: 3,
      name: 'Mushrooms',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/276f5549-971c-4561-97da-160058e4ec40/450x%3Cauto%3E_so',
      productions: [{ goods: 1 }],
      upgrade: [
        {
          cost: { discard: [{ tags: [CardTag.PERSON], pickNumber: 2 }] },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Mushrooms',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/d49e1336-d917-4a4d-9504-3974e078fda7/450x%3Cauto%3E_so',
      productions: [{ goods: 1 }],
      actions: [
        {
          id: '110-4-1',
          unlimited: true,
          cost: { discard: [{ tags: [CardTag.PERSON] }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: { goods: 2 },
            },
          ],
        },
      ],
    },
  ],
};
