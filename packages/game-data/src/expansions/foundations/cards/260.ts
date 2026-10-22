import { SCIENCE } from './scienceConstants';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

const TAGS = [CardTag.INVENTION, CardTag.PERMANENT];

/** "End of turn: spend any number of science; for every `per` spent, make any 1 card stay in play." */
const keepInPlay = (id: string, per: number): CardAction => ({
  id,
  trigger: Trigger.END_OF_TURN,
  optional: true,
  cost: { resources: [{ [SCIENCE]: 'any' }] },
  amountPer: per,
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.ADD_BOARD_EFFECT,
      cards: { scope: [TargetScope.BOARD], pickNumber: 1 },
      effect: CardPassives[PassiveType.STAY_IN_PLAY],
    },
  ],
});

/** Spend 7 science to add sticker 7 (stays in play) to 1 card of the kind, once. */
const stayingSticker = (id: string, tag: CardTag): CardAction => ({
  id,
  endsTurn: true,
  limitedTime: 1,
  cost: { resources: [{ [SCIENCE]: 7 }] },
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.ADD_STICKER,
      cards: { scope: [TargetScope.ANY], tags: [tag], pickNumber: 1 },
      stickers: { ids: [7] },
    },
  ],
});

/** Theology of Science (Foundations 87). */
export const theologyOfScience: CardDef = {
  id: 260,
  name: 'Theology of Science',
  states: [
    {
      id: 1,
      name: 'Theology of Science',
      tags: TAGS,
      actions: [keepInPlay('260-1-1', 3)],
      upgrade: [{ cost: { resources: [{ [SCIENCE]: 9 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Logos of Creation',
      tags: TAGS,
      actions: [
        keepInPlay('260-2-1', 2),
        stayingSticker('260-2-2', CardTag.LAND),
        stayingSticker('260-2-3', CardTag.BUILDING),
        stayingSticker('260-2-4', CardTag.PERSON),
      ],
    },
  ],
};
