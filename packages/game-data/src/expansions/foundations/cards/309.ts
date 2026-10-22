import { RESOURCE_STICKERS } from './scienceConstants';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

/** Baron Roderick / House of Blackwater (Foundations 136): a side chosen when discovered. */
export const baronRoderick: CardDef = {
  id: 309,
  name: 'Baron Roderick',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Baron Roderick',
      tags: [CardTag.PERSON],
      actions: [
        {
          id: '309-1-1',
          cost: { discard: [{ tags: [CardTag.PERSON], pickNumber: 2 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              cards: { scope: [TargetScope.SELF] },
              stickers: { ids: RESOURCE_STICKERS, pickNumber: 1 },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'House of Blackwater',
      tags: [CardTag.BUILDING],
      productions: [{ [ResourceType.GOLD]: 4 }],
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
  ],
};
