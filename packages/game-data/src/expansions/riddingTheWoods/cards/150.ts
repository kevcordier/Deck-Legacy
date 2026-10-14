import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef, CardSelector } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

/** End of Turn: discard this to make lands stay in play (same pattern as card 108). */
const keepLands = (id: string, lands: CardSelector): CardAction => ({
  id,
  trigger: Trigger.END_OF_TURN,
  optional: true,
  cost: { discard: [{ scope: [TargetScope.SELF] }] },
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.ADD_BOARD_EFFECT,
      cards: { scope: [TargetScope.BOARD], tags: [CardTag.LAND], ...lands },
      effect: CardPassives[PassiveType.STAY_IN_PLAY],
    },
  ],
});

export const outpostConstruction: CardDef = {
  id: 150,
  name: 'Outpost Construction',
  states: [
    {
      id: 1,
      name: 'Outpost Construction',
      tags: [CardTag.LAND],
      illustration: 'cards/150_1.jpg',
      upgrade: [{ cost: { resources: [{ [ResourceType.WOOD]: 4 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Palisades',
      tags: [CardTag.LAND],
      illustration: 'cards/150_2.jpg',
      actions: [keepLands('150-2-1', { pickMin: 0, pickMax: 2 })],
      upgrade: [{ cost: { resources: [{ [ResourceType.WOOD]: 6 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Forest Outpost',
      tags: [CardTag.LAND],
      illustration: 'cards/150_3.jpg',
      glory: { amount: 3 },
      actions: [keepLands('150-3-1', { pickMin: 0, pickMax: 3 })],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.WOOD]: 4, [ResourceType.STONE]: 4 }] },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Walled Outpost',
      tags: [CardTag.LAND, CardTag.BUILDING, CardTag.WALL],
      illustration: 'cards/150_4.jpg',
      productions: [{ [ResourceType.WEAPON]: 1 }],
      glory: { amount: 5 },
      actions: [
        keepLands('150-4-1', { autoPick: true }),
        {
          id: '150-4-2',
          trigger: Trigger.ON_PURGE,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_GLORY,
              cards: { scope: [TargetScope.SELF] },
              valuePerElement: { amount: 2, cards: { scope: [TargetScope.PURGE_SELECTED] } },
            },
          ],
        },
      ],
    },
  ],
};
