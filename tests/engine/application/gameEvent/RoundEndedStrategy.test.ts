import { makeDef, makeDefs, makeInstance, makeState, makeStickerDefs } from '../fixtures';
import { RoundEndedStrategy } from '@engine/application/gameEvent/RoundEndedStrategy';
import { ActionEffectType, Trigger } from '@engine/domain/enums';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

describe('RoundEndedStrategy', () => {
  const strategy = new RoundEndedStrategy(makeDefs(), makeStickerDefs());

  it('sets phase to PREROUND', () => {
    const gs = makeState();
    const result = strategy.apply(gs);
    expect(result.phase).toBe(Phase.ROUND_END);
  });

  it('moves board cards to discardPile', () => {
    const inst = makeInstance({ id: 10, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [10], instances: { 10: inst } });
    const result = strategy.apply(gs);
    expect(result.board).toEqual([]);
    expect(result.discardPile).toContain(10);
  });

  it('discovers up to 2 cards from discoveryPile', () => {
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({
      discoveryPile: [1, 2, 3],
      instances: { 1: inst1, 2: inst2, 3: inst3 },
    });
    const result = strategy.apply(gs);
    expect(result.discoveryPile).toEqual([1, 2, 3]);
  });

  it('adds END_OF_ROUND triggers from permanent cards', () => {
    const action = {
      id: 'perm-1-eor',
      trigger: Trigger.END_OF_ROUND,
      actionEffects: [{ id: 1, type: ActionEffectType.ADD_RESOURCES }],
    };
    const permanentDef = makeDef({
      id: 2,
      states: [{ id: 1, name: 'Permanent State', permanent: true, actions: [action] }],
    });
    const permInst = makeInstance({ id: 5, cardId: 2, stateId: 1 });
    const strat = new RoundEndedStrategy({ 2: permanentDef }, makeStickerDefs());
    const gs = makeState({
      permanents: [5],
      instances: { 5: permInst },
      triggerPile: {},
    });
    const result = strat.apply(gs);
    const triggers = Object.values(result.triggerPile);
    expect(triggers.length).toBeGreaterThan(0);
    expect(triggers[0].sourceInstanceId).toBe(5);
    expect(triggers[0].effectDef.trigger).toBe(Trigger.END_OF_ROUND);
  });

  it('adds END_OF_ROUND triggers from board cards', () => {
    const action = {
      id: 'board-1-eor',
      trigger: Trigger.END_OF_ROUND,
      actionEffects: [{ id: 1, type: ActionEffectType.ADD_RESOURCES }],
    };
    const cardDef = makeDef({
      id: 3,
      states: [{ id: 1, name: 'Board State', actions: [action] }],
    });
    const boardInst = makeInstance({ id: 7, cardId: 3, stateId: 1 });
    const strat = new RoundEndedStrategy({ 3: cardDef }, makeStickerDefs());
    const gs = makeState({
      board: [7],
      instances: { 7: boardInst },
      triggerPile: {},
    });
    const result = strat.apply(gs);
    const triggers = Object.values(result.triggerPile);
    expect(triggers.length).toBeGreaterThan(0);
    expect(triggers[0].sourceInstanceId).toBe(7);
  });

  it('does not add triggers for non-END_OF_ROUND actions', () => {
    const action = {
      id: 'perm-1-eot',
      trigger: Trigger.END_OF_TURN,
      actionEffects: [{ id: 1, type: ActionEffectType.ADD_RESOURCES }],
    };
    const permanentDef = makeDef({
      id: 4,
      states: [{ id: 1, name: 'Perm', permanent: true, actions: [action] }],
    });
    const permInst = makeInstance({ id: 9, cardId: 4, stateId: 1 });
    const strat = new RoundEndedStrategy({ 4: permanentDef }, makeStickerDefs());
    const gs = makeState({
      permanents: [9],
      instances: { 9: permInst },
      triggerPile: {},
    });
    const result = strat.apply(gs);
    expect(Object.keys(result.triggerPile).length).toBe(0);
  });
});
