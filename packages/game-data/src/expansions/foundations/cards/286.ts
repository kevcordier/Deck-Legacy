import { LADY } from './romanceConstants';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef } from '@deck-legacy/engine/domain/types';

const W = ResourceType.WEAPON;
const TAGS = [CardTag.PERSON, CardTag.KNIGHT];

/** "When played, put up to N cards in play at the bottom of your deck." */
const toBottom = (id: string, pickMin: number, pickMax: number): CardAction => ({
  id,
  trigger: Trigger.ON_PLAY,
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.PLACE_CARD_IN_PILE,
      position: 'bottom',
      cards: { scope: [TargetScope.BOARD, TargetScope.SELF], pickMin, pickMax },
    },
  ],
});

/** Sir Tristan (Foundations 113). */
export const sirTristan: CardDef = {
  id: 286,
  name: 'Sir Tristan',
  states: [
    {
      id: 1,
      name: 'Sir Tristan',
      tags: TAGS,
      productions: [{ [W]: 1 }],
      actions: [toBottom('286-1-1', 1, 1)],
      upgrade: [{ cost: { discard: [{ ...LADY, pickNumber: 1 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Sir Tristan',
      tags: TAGS,
      productions: [{ [W]: 2 }],
      glory: { amount: 4 },
      actions: [toBottom('286-2-1', 0, 2)],
    },
  ],
};
