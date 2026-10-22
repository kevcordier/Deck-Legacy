import { equipAction } from './equipAction';
import { isEquipped } from './isEquipped';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardSelector } from '@deck-legacy/engine/domain/types';

const WHEELBARROW = 336;
const landsAndBuildings: CardSelector = {
  scope: [TargetScope.BOARD, TargetScope.PERMANENTS],
  tags: [CardTag.LAND, CardTag.BUILDING],
};

/** Wheelbarrow (Foundations 145): a person's equipment moving a production. */
export const wheelbarrow: CardDef = {
  id: 318,
  name: 'Wheelbarrow',
  states: [
    {
      id: 1,
      name: 'Wheelbarrow',
      tags: [CardTag.ITEM, CardTag.INVENTION],
      equip: CardTag.PERSON,
      actions: [
        equipAction('318-1-1', CardTag.PERSON, WHEELBARROW),
        {
          // Cross out 1 production on a land / building to add its sticker to another one
          id: '318-1-2',
          condition: isEquipped(WHEELBARROW),
          actionEffects: [
            {
              // The card getting the sticker
              id: 1,
              type: ActionEffectType.ADD_CUMULATED,
              value: 0,
              cards: { ...landsAndBuildings, pickNumber: 1 },
            },
            {
              id: 2,
              type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
              resourceScopes: ['production'],
              cards: { ...landsAndBuildings, produces: Object.values(ResourceType), pickNumber: 1 },
              resources: { choice: [{ any: 1 }] },
              stickerHere: 'lastSelected',
            },
          ],
        },
      ],
    },
  ],
};
