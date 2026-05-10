import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const backstabber: CardDef = {
  id: 79,
  name: 'Backstabber',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Backstabber',
      tags: [CardTag.ENEMY],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/bb01de98-17f8-4ba8-a4f5-2022f8e65283/450x%3Cauto%3E_so',
      negative: true,
      glory: { amount: -4 },
      actions: [
        {
          id: '79-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: {
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
                pickNumber: 2,
              },
            },
          ],
        },
        {
          id: '79-1-2',
          cost: {
            resources: [
              {
                [ResourceType.WEAPON]: 4,
              },
            ],
            destroy: {
              scope: [TargetScope.SELF],
            },
          },
          actionEffects: [],
        },
      ],
    },
    {
      id: 2,
      name: 'Blood Curse',
      tags: [CardTag.EVENT],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/6ee6709b-a957-43ef-917d-ff09745cc860/450x%3Cauto%3E_so',
      negative: true,
      passives: [
        {
          id: '79-2-1',
          type: PassiveType.SET_GAME_PARAMETER,
          parameters: {
            advanceCardDrawn: 4,
          },
        },
      ],
    },
  ],
};
