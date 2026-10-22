import { equipAction } from './equipAction';
import { isEquipped } from './isEquipped';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

const { GOLD, WOOD, IRON, SCIENCE } = ResourceType;
const WAGON = 343;
const TAGS = [CardTag.ITEM, CardTag.WAGON];

/** End of turn (equipped): make up to 2 persons stay in play. */
const keepPersons = (id: string): CardAction => ({
  id,
  trigger: Trigger.END_OF_TURN,
  optional: true,
  condition: isEquipped(WAGON),
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.ADD_BOARD_EFFECT,
      cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickMin: 0, pickMax: 2 },
      effect: CardPassives[PassiveType.STAY_IN_PLAY],
    },
  ],
});

/** Wagon (Foundations 152): a land's equipment carrying persons. */
export const wagon: CardDef = {
  id: 325,
  name: 'Wagon',
  states: [
    {
      id: 1,
      name: 'Wagon',
      tags: TAGS,
      equip: CardTag.LAND,
      actions: [equipAction('325-1-1', CardTag.LAND, WAGON), keepPersons('325-1-2')],
      upgrade: [{ cost: { resources: [{ [WOOD]: 2, [IRON]: 1, [SCIENCE]: 1 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Fancy Wagon',
      tags: TAGS,
      equip: CardTag.LAND,
      productions: [{ [GOLD]: 2 }],
      glory: { amount: 2 },
      actions: [equipAction('325-2-1', CardTag.LAND, WAGON), keepPersons('325-2-2')],
    },
  ],
};
