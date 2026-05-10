import { CardTag, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const royalConsort: CardDef = {
  id: 105,
  name: 'Royal Consort',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Royal Consort',
      tags: [CardTag.PERSON, CardTag.LADY],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/8635f5f9-cac9-49eb-b00b-c9a989e6d5a4/450x%3Cauto%3E_so',
      productions: [
        {
          [ResourceType.GOLD]: 1,
          [ResourceType.GOODS]: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Royal Consort',
      tags: [CardTag.PERSON, CardTag.KNIGHT],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/2bc5430b-2038-4b12-800a-3af5921b8929/450x%3Cauto%3E_so',
      productions: [
        {
          [ResourceType.WOOD]: 1,
          [ResourceType.STONE]: 1,
        },
      ],
    },
  ],
};
