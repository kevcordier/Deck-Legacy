import { destroySelf } from './destroySelf';
import { flipTo } from './flipTo';
import { KNIGHT_WITHOUT_SCARF } from './romanceConstants';
import { ActionEffectType, CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type {
  ActionEffect,
  CardAction,
  CardSelector,
  CardState,
  Condition,
  Cost,
  StepDef,
} from '@deck-legacy/engine/domain/types';

type Quest = {
  cardId: number;
  name: string;
  /** Enemy (Cursed Hag) instead of a quest event. */
  enemy?: boolean;
  /** Boxes marked by the quest's own action (green / grey), if any. */
  tasks?: StepDef[];
  taskAction?: Omit<CardAction, 'id'>;
  /** Boxes marked at the end of each turn; the last one destroys the quest. */
  timer: number[];
  /** The rescue: its extra cost besides the knight without a scarf, and its condition. */
  rescue: { cost?: Cost; discard?: CardSelector[]; condition?: Condition };
  scarf: number;
  /** Extra end-of-turn effect (Hostage crosses out a medal instead of marking a timer box). */
  endOfTurn?: CardAction;
  /** Boxes in any order (Hostage's medals); in order by default. */
  anyOrder?: boolean;
};

/**
 * A quest (Foundations 99–104): rescue the lady with a knight without a scarf, who gets hers, and
 * the card turns to the lady; the end-of-turn boxes run out and destroy it.
 */
export function quest({
  cardId,
  name,
  enemy,
  tasks = [],
  taskAction,
  timer,
  rescue,
  scarf,
  endOfTurn,
  anyOrder,
}: Quest): CardState {
  const last = timer.at(-1);
  const steps: StepDef[] = [
    ...tasks,
    ...timer.map(id => ({ id, ...(id === last && { effects: [destroySelf(1)] }) })),
  ];
  const giveScarf: ActionEffect = {
    id: 1,
    type: ActionEffectType.ADD_STICKER,
    cards: { scope: [TargetScope.DISCARDED], tags: [CardTag.KNIGHT], autoPick: true },
    stickers: { ids: [scarf] },
  };
  const markTimer: CardAction = {
    id: `${cardId}-1-3`,
    trigger: Trigger.END_OF_TURN,
    condition: { type: 'not', condition: { type: 'stepsMarked', ids: timer } },
    actionEffects: [
      {
        id: 1,
        type: ActionEffectType.TRACK_ADVANCE,
        cards: { scope: [TargetScope.SELF] },
        steps: { pickNumber: 1, ids: timer },
      },
    ],
  };
  return {
    id: 1,
    name,
    tags: enemy ? [CardTag.ENEMY] : [CardTag.EVENT, CardTag.QUEST],
    negative: true,
    track: { inOrder: !anyOrder, steps },
    actions: [
      ...(taskAction ? [{ ...taskAction, id: `${cardId}-1-1` }] : []),
      {
        id: `${cardId}-1-2`,
        endsTurn: true,
        ...(rescue.condition && { condition: rescue.condition }),
        cost: {
          ...rescue.cost,
          discard: [...(rescue.discard ?? []), { ...KNIGHT_WITHOUT_SCARF, pickNumber: 1 }],
        },
        actionEffects: [giveScarf, flipTo(2, 2)],
      },
      endOfTurn ?? markTimer,
    ],
  };
}
