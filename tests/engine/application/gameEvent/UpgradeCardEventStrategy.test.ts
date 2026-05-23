import { makeInstance, makeState, makeStickerDefs } from '../fixtures';
import * as cardHelpers from '@engine/application/cardHelpers';
import { UpgradeCardEventStrategy } from '@engine/application/gameEvent/UpgradeCardEventStrategy';
import { ActionEffectType, GameEventType, PassiveType, Trigger } from '@engine/domain/enums';
import type { UpgradeCardEvent } from '@engine/domain/types';
import { describe, expect, it, vi } from 'vitest';

describe('UpgradeCardEventStrategy', () => {
  const multiStateDefs = {
    1: {
      id: 1,
      name: 'C',
      states: [
        { id: 1, name: 'S1' },
        { id: 2, name: 'S2' },
        { id: 3, name: 'S3' },
      ],
    },
  };
  const strategy = new UpgradeCardEventStrategy(multiStateDefs, makeStickerDefs());

  it('updates stateId on the instance', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst }, resources: { gold: 5 } });
    vi.spyOn(cardHelpers, 'getActiveState').mockReturnValue({ id: 3, name: 'S', permanent: false });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.UPGRADE_CARD,
      timestamp: 0,
      cardInstanceId: 1,
      stateId: 3,
      cost: { gold: 3 },
      endTurnTrigger: {},
    } as UpgradeCardEvent);
    expect(result.instances[1].stateId).toBe(3);
    expect(result.board).not.toContain(1);
    expect(result.discardPile).toContain(1);
    // resources are cleared by TurnEndedStrategy, which runs as part of upgrade
  });

  it('move card to permanent area', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    vi.spyOn(cardHelpers, 'getActiveState').mockReturnValue({ id: 3, name: 'S', permanent: true });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.UPGRADE_CARD,
      timestamp: 0,
      cardInstanceId: 1,
      stateId: 3,
      cost: {},
      endTurnTrigger: {},
    } as UpgradeCardEvent);
    expect(result.board).not.toContain(1);
    expect(result.permanents).toContain(1);
  });

  it('replaces boardEffects with passives from upgraded permanent state', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({
      permanents: [1],
      instances: { 1: inst },
      boardEffects: {
        1: [
          {
            id: 'old-passive',
            type: PassiveType.SET_GAME_PARAMETER,
            parameters: { discoverPerRound: 1 },
          },
        ],
      },
    });

    vi.spyOn(cardHelpers, 'getActiveState').mockImplementation(instance =>
      instance.stateId === 1
        ? {
            id: 1,
            name: 'S1',
            permanent: true,
            passives: [
              {
                id: 'old-passive',
                type: PassiveType.SET_GAME_PARAMETER,
                parameters: { discoverPerRound: 1 },
              },
            ],
          }
        : {
            id: 2,
            name: 'S2',
            permanent: true,
            passives: [
              {
                id: 'new-passive',
                type: PassiveType.SET_GAME_PARAMETER,
                parameters: { discoverPerRound: 3 },
              },
            ],
          },
    );

    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.UPGRADE_CARD,
      timestamp: 0,
      cardInstanceId: 1,
      stateId: 2,
      cost: {},
      endTurnTrigger: {},
    } as UpgradeCardEvent);

    expect(result.boardEffects[1]).toEqual([
      {
        id: 'new-passive',
        type: PassiveType.SET_GAME_PARAMETER,
        parameters: { discoverPerRound: 3 },
      },
    ]);
  });

  it('applies discarded and destroyed card costs', () => {
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [1, 2, 3],
      instances: { 1: inst1, 2: inst2, 3: inst3 },
      resources: { gold: 5 },
    });
    vi.spyOn(cardHelpers, 'getActiveState').mockReturnValue({ id: 2, name: 'S', permanent: false });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.UPGRADE_CARD,
      timestamp: 0,
      cardInstanceId: 1,
      stateId: 2,
      cost: { gold: 1 },
      discardedCardIds: [2],
      destroyedCardIds: [3],
      endTurnTrigger: {},
    } as UpgradeCardEvent);

    expect(result.discardPile).toContain(2);
    expect(result.destroyedPile).toContain(3);
    // resources are cleared by TurnEndedStrategy, which runs as part of upgrade
  });

  it('registers ON_UPGRADE triggers from source state', () => {
    const defsWithTrigger = {
      1: {
        id: 1,
        name: 'C',
        states: [
          {
            id: 1,
            name: 'S1',
            actions: [
              {
                id: '1-1-1',
                trigger: Trigger.ON_UPGRADE,
                actionEffects: [
                  {
                    id: 1,
                    type: ActionEffectType.ADD_RESOURCES,
                    resources: { gold: 1 },
                  },
                ],
              },
            ],
          },
          { id: 2, name: 'S2' },
        ],
      },
    } as never;
    const strategyWithTrigger = new UpgradeCardEventStrategy(defsWithTrigger, makeStickerDefs());
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });

    const result = strategyWithTrigger.apply(gs, {
      id: 'e1',
      type: GameEventType.UPGRADE_CARD,
      timestamp: 0,
      cardInstanceId: 1,
      stateId: 2,
      cost: {},
      endTurnTrigger: {},
    } as UpgradeCardEvent);

    expect(Object.keys(result.triggerPile)).toHaveLength(1);
    const trigger = Object.values(result.triggerPile)[0];
    expect(trigger.sourceInstanceId).toBe(1);
    expect(trigger.effectDef.trigger).toBe(Trigger.ON_UPGRADE);
  });

  it('removes upgraded card from permanents when new state is not permanent', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], permanents: [1, 2], instances: { 1: inst } });
    vi.spyOn(cardHelpers, 'getActiveState').mockReturnValue({ id: 2, name: 'S', permanent: false });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.UPGRADE_CARD,
      timestamp: 0,
      cardInstanceId: 1,
      stateId: 2,
      cost: {},
      endTurnTrigger: {},
    } as UpgradeCardEvent);
    expect(result.permanents).not.toContain(1);
    expect(result.permanents).toContain(2);
  });

  it('handles missing pre-upgrade instance when defs include fallback for undefined cardId', () => {
    const defsWithUndefinedFallback = {
      ...multiStateDefs,
      undefined: {
        id: -1,
        name: 'Fallback',
        states: [{ id: 2, name: 'FallbackState', permanent: false }],
      },
    } as unknown as typeof multiStateDefs;
    const strategyWithFallback = new UpgradeCardEventStrategy(
      defsWithUndefinedFallback,
      makeStickerDefs(),
    );
    const gs = makeState({ board: [], instances: {}, triggerPile: {} });

    const result = strategyWithFallback.apply(gs, {
      id: 'e-missing',
      type: GameEventType.UPGRADE_CARD,
      timestamp: 0,
      cardInstanceId: 99,
      stateId: 2,
      cost: {},
      endTurnTrigger: {},
    } as UpgradeCardEvent);

    expect(Object.keys(result.triggerPile)).toHaveLength(0);
    expect(result.instances[99].stateId).toBe(2);
  });
});
