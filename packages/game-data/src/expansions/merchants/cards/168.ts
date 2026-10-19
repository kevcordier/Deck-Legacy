import {
  ActionEffectType,
  CardTag,
  Options,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardDef, Passive } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

// Its own time effect stays usable: a card's option block never blocks itself.
const noPlay = (id: string): Passive => ({
  ...CardPassives[PassiveType.DESACTIVATE_OPTION],
  id,
  options: [Options.ADVANCE, Options.PLAY_CARD, Options.UPGRADE, Options.END_TURN_ACTION],
});

const self = { scope: [TargetScope.SELF] };
const toBoss: ActionEffect = {
  id: 1,
  type: ActionEffectType.UPGRADE_CARD,
  cards: self,
  states: { ids: [2] },
};
const destroySelf: ActionEffect = { id: 1, type: ActionEffectType.DESTROY_CARD, cards: self };
const weapons = (amount: number) => ({ resources: [{ [ResourceType.WEAPON]: amount }] });

export const brigands: CardDef = {
  id: 168,
  name: 'Brigands',
  states: [
    {
      id: 1,
      name: 'Brigands',
      tags: [CardTag.ENEMY],
      negative: true,
      passives: [noPlay('168-1-1')],
      actions: [
        {
          id: '168-1-2',
          cost: {
            destroy: {
              scope: [TargetScope.BOARD, TargetScope.FRIENDLY],
              produces: Object.values(ResourceType),
              pickNumber: 2,
            },
          },
          actionEffects: [toBoss],
        },
        { id: '168-1-3', endsTurn: true, defeat: true, cost: weapons(8), actionEffects: [toBoss] },
      ],
    },
    {
      id: 2,
      name: 'Brigand Boss',
      tags: [CardTag.ENEMY],
      negative: true,
      passives: [noPlay('168-2-1')],
      actions: [
        {
          id: '168-2-2',
          defeat: true,
          cost: {
            destroy: {
              scope: [TargetScope.BOARD, TargetScope.FRIENDLY],
              having: { minProduction: 3 },
              pickNumber: 1,
            },
          },
          actionEffects: [destroySelf],
        },
        { id: '168-2-3', defeat: true, cost: weapons(10), actionEffects: [destroySelf] },
      ],
    },
  ],
};
