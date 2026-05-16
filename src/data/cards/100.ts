import { ActionEffectType, CardTag, PassiveType, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const aricBlackwood: CardDef = {
  id: 100,
  name: 'Aric Blackwood',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Aric Blackwood',
      tags: [CardTag.PERSON],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/c346794d-fd73-41d8-9cf8-40b40797c6da/450x%3Cauto%3E_so',
      productions: [{ gold: 2 }],
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '100-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { scope: [TargetScope.BOARD], pickNumber: 1 },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Eadric Shadowstrike',
      tags: [CardTag.PERSON],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/defdd1ac-0910-4b3f-a237-b886336485bb/450x%3Cauto%3E_so',
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '100-2-1',
          cost: {
            discard: [{ scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickNumber: 1 }],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: { weapon: 3 },
            },
          ],
        },
      ],
    },
  ],
};
