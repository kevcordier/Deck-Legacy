import { makeInstance, makeState } from '../fixtures';
import { GameAggregate } from '@engine/domain/aggregates/GameAggregate';
import {
  ActionEffectType,
  CardTag,
  PendingChoiceType,
  Phase,
  TargetScope,
} from '@engine/domain/enums';
import type { CardAction, CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const person = (id: number, productions: CardDef['states'][0]['productions']): CardDef => ({
  id,
  name: `P${id}`,
  states: [{ id: 1, name: `P${id}`, tags: [CardTag.PERSON], productions }],
});
const defs: Record<number, CardDef> = {
  1: person(1, [{ gold: 1 }]),
  2: person(2, [{ wood: 1 }, { stone: 1 }]),
  3: {
    id: 3,
    name: 'Land',
    states: [{ id: 1, name: 'Land', tags: [CardTag.LAND], productions: [{ gold: 5 }] }],
  },
  4: { id: 4, name: 'Mead', states: [{ id: 1, name: 'Mead' }] },
};
const mead: CardAction = {
  id: 'mead',
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.ADD_RESOURCES,
      resources: { cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON], autoPick: true } },
    },
  ],
};

describe("gain each card's production (autoPick)", () => {
  it('adds every production and asks only for the cards with several', () => {
    const instances = Object.fromEntries(
      [1, 2, 3, 4].map(id => [id, makeInstance({ id, cardId: id })]),
    );
    const agg = new GameAggregate(
      'g',
      makeState({ board: [1, 2, 3, 4], instances, phase: Phase.PLAYING, round: 1, turn: 1 }),
      defs,
      {},
    );

    agg.cardAction(mead, 4);
    const [choice] = agg.getCurrentCardAction()?.getPendingChoices() ?? [];
    expect(choice.type).toBe(PendingChoiceType.CHOOSE_RESOURCE);
    expect(choice.choices).toEqual([{ wood: 1 }, { stone: 1 }]);

    const gs = agg.resolveCardActionChoice(
      { id: choice.id, type: choice.kind, sourceInstanceId: 4, resources: { stone: 1 } },
      choice.type,
    );
    expect(gs.resources).toEqual({ gold: 1, stone: 1 });
  });
});
