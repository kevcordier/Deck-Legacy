import { makeInstance, makeState } from './fixtures';
import { isFlowCommandAllowed } from '@engine/application/session/input/isFlowCommandAllowed';
import { BlockCardStrategy } from '@engine/domain/cardAction/BlockCardStrategy';
import { DiscoverCardStrategy } from '@engine/domain/cardAction/DiscoverCardStrategy';
import { UnblockCardStrategy } from '@engine/domain/cardAction/UnblockCardStrategy';
import { resolveActionEffect } from '@engine/domain/effects/resolveActionEffect';
import {
  ActionEffectType,
  CardTag,
  GameEventType,
  PassiveType,
  Phase,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import { RoundStartedStrategy } from '@engine/domain/gameEvent/RoundStartedStrategy';
import type { CardAction, CardDef, RoundStartedEvent } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const land: CardDef = {
  id: 1,
  name: 'Land',
  states: [{ id: 1, name: 'Land', tags: [CardTag.LAND] }],
};
const onDiscover: CardAction = { id: 'discover', trigger: Trigger.ON_DISCOVER, actionEffects: [] };
const onRound: CardAction = { id: 'round', trigger: Trigger.START_OF_ROUND, actionEffects: [] };
const curse: CardDef = {
  id: 2,
  name: 'Curse',
  states: [{ id: 1, name: 'Curse', tags: [CardTag.PERMANENT], actions: [onDiscover, onRound] }],
};
const defs = { 1: land, 2: curse };
const instances = Object.fromEntries(
  [1, 2, 3, 4].map(id => [id, makeInstance({ id, cardId: 1, stateId: 1 })]),
);

describe('Cards picked at random', () => {
  it('picks the asked number, the same way for the same game', () => {
    const state = makeState({ seed: 'seed', drawPile: [1, 2, 3, 4], instances });
    const effect = {
      id: 1,
      type: ActionEffectType.BLOCK_CARD,
      cards: { scope: [TargetScope.DECK], tags: [CardTag.LAND], random: true, pickNumber: 3 },
    };
    const [first] = resolveActionEffect(effect, 9, state, defs, {});
    const [again] = resolveActionEffect(effect, 9, state, defs, {});
    expect(first.instanceIds).toHaveLength(3);
    expect(again.instanceIds).toEqual(first.instanceIds);
  });
});

describe('A permanent blocking cards', () => {
  it('holds them on the board, out of the deck and the discard pile', () => {
    const state = makeState({ permanents: [9], drawPile: [1, 2], discardPile: [3], instances });
    const result = new BlockCardStrategy().apply(state, {
      id: 'x',
      type: ActionEffectType.BLOCK_CARD,
      sourceInstanceId: 9,
      instanceIds: [1, 3],
    });
    expect(result.board).toEqual([1, 3]);
    expect(result.drawPile).toEqual([2]);
    expect(result.discardPile).toEqual([]);
  });

  it('releases the cards it blocks', () => {
    const state = makeState({
      boardEffects: { 9: [{ id: 'block', type: PassiveType.BLOCK, cards: { ids: [1, 3] } }] },
    });
    const result = new UnblockCardStrategy().apply(state, {
      id: 'x',
      type: ActionEffectType.UNBLOCK_CARD,
      sourceInstanceId: 9,
      instanceIds: [3],
    });
    expect(result.boardEffects[9][0].cards?.ids).toEqual([1]);
  });
});

describe('Discovery and round start triggers', () => {
  const cursed = { ...instances, 7: makeInstance({ id: 7, cardId: 2, stateId: 1 }) };

  it('queues the "when discovered" effect of a discovered card', () => {
    const state = makeState({ discoveryPile: [7], instances: cursed });
    const result = new DiscoverCardStrategy(defs).apply(state, {
      id: 'x',
      type: ActionEffectType.DISCOVER_CARD,
      sourceInstanceId: 1,
      instanceIds: [7],
    });
    expect(Object.values(result.triggerPile).map(entry => entry.effectDef.id)).toEqual([
      'discover',
    ]);
  });

  it('queues the "start of round" effects of the permanents, and waits for them', () => {
    const state = makeState({ permanents: [7], instances: cursed });
    const event: RoundStartedEvent = {
      id: 'e',
      type: GameEventType.ROUND_STARTED,
      timestamp: 0,
      round: 2,
      lastAddedCards: [],
      newDrawPile: [1, 2],
    };
    const result = new RoundStartedStrategy(defs, {}).apply(state, event);
    expect(Object.values(result.triggerPile).map(entry => entry.effectDef.id)).toEqual(['round']);
    expect(result.phase).toBe(Phase.ROUND_START);
    expect(isFlowCommandAllowed({ type: 'startTurn' }, result, false)).toBe(false);
    expect(isFlowCommandAllowed({ type: 'startTurn' }, { ...result, triggerPile: {} }, false)).toBe(
      true,
    );
  });
});
