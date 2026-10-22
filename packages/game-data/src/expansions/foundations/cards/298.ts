import { destroySelf } from './destroySelf';
import { NOBLES_CARDS } from './noblesConstants';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Noble Houses (Foundations 125): 6 gold for each house discovered, in order. */
export const nobleHouses: CardDef = {
  id: 298,
  name: 'Noble Houses',
  states: [
    {
      id: 1,
      name: 'Noble Houses',
      tags: [CardTag.PERMANENT],
      track: {
        inOrder: true,
        steps: NOBLES_CARDS.houses.map((houseId, index) => ({
          id: index + 1,
          effects: [{ id: 1, type: ActionEffectType.DISCOVER_CARD, cards: { ids: [houseId] } }],
        })),
      },
      actions: [
        {
          id: '298-1-1',
          endsTurn: true,
          cost: { resources: [{ [ResourceType.GOLD]: 6 }] },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        { id: '298-1-2', trigger: Trigger.ON_TRACK_END, actionEffects: [destroySelf(1)] },
      ],
    },
  ],
};
