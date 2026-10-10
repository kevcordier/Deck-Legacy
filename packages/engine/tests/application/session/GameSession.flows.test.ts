import { DEFAULT_OPTIONS, makeCatalog } from './fixtures';
import { GameSession } from '@engine/application/session/GameSession';
import { PendingChoiceType, Phase } from '@engine/domain/enums';
import type { ResolvedActionEffect } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const WORKSHOP = 9;

function tutorial(options = DEFAULT_OPTIONS) {
  return GameSession.start('tuto', makeCatalog(), options, 'tutorial');
}

describe('card actions', () => {
  it('resolves an action without choices immediately', () => {
    const session = tutorial();

    const error = session.execute({
      type: 'resolveAction',
      instanceId: WORKSHOP,
      actionId: '2_1_1',
    });

    expect(error).toBeUndefined();
    expect(session.getState().resources.wood).toBe(4);
    expect(session.toView().pendingChoices).toBeNull();
  });

  it('keeps an action pending until the player chooses, and can skip it', () => {
    const session = tutorial();
    const events = session.getEvents().length;

    session.execute({ type: 'resolveAction', instanceId: WORKSHOP, actionId: '2_1_2' });
    const pending = session.toView().pendingChoices;

    expect(pending?.[0].type).toBe(PendingChoiceType.CHOOSE_CARD);
    expect(session.getEvents()).toHaveLength(events);

    session.execute({ type: 'skipChoice' });
    expect(session.toView().pendingChoices).toBeNull();
  });

  it('applies the chosen card once the choice is resolved', () => {
    const session = tutorial();
    session.execute({ type: 'resolveAction', instanceId: WORKSHOP, actionId: '2_1_2' });
    const [pending] = session.toView().pendingChoices ?? [];

    const choice = {
      ...(pending as unknown as ResolvedActionEffect),
      instanceIds: [1],
    } as ResolvedActionEffect;
    const error = session.execute({
      type: 'resolvePlayerChoice',
      choice,
      choiceType: pending.type,
    });

    expect(error).toBeUndefined();
    expect(session.getState().board).not.toContain(1);
  });
});

describe('upgrade with a card cost', () => {
  it('waits for the discarded card, then upgrades', () => {
    const session = tutorial();

    session.execute({ type: 'resolveUpgrade', instanceId: WORKSHOP, upgradeTo: 3 });
    expect(session.toView().pendingChoices).not.toBeNull();
    expect(session.getState().instances[WORKSHOP].stateId).toBe(1);

    session.execute({
      type: 'resolvePayCost',
      resolved: { resources: {}, discardedCardIds: [1], destroyedCardIds: [] },
    });

    expect(session.getState().instances[WORKSHOP].stateId).toBe(3);
    expect(session.toView().pendingChoices).toBeNull();
  });

  it('ignores unknown upgrade targets', () => {
    const session = tutorial();
    const events = session.getEvents().length;

    session.execute({ type: 'resolveUpgrade', instanceId: WORKSHOP, upgradeTo: 99 });

    expect(session.getEvents()).toHaveLength(events);
  });
});

describe('turn flow', () => {
  it('ends the turn and starts the next one', () => {
    const session = GameSession.start('g', makeCatalog(), DEFAULT_OPTIONS);
    const turn = session.getState().turn;

    session.execute({ type: 'endTurn' });
    session.execute({ type: 'startTurn' });

    expect(session.getState().turn).toBeGreaterThan(turn);
    expect(session.getVersion()).toBe(2);
  });

  it('advances by drawing cards', () => {
    const session = GameSession.start('g', makeCatalog(), DEFAULT_OPTIONS);
    const board = session.getState().board.length;

    session.execute({ type: 'progress' });

    expect(session.getState().board.length).toBeGreaterThanOrEqual(board);
  });

  it('runs round commands without errors', () => {
    const session = GameSession.start('g', makeCatalog(), DEFAULT_OPTIONS);

    for (const type of ['endRound', 'startRound'] as const) {
      expect(session.execute({ type })).toBeUndefined();
    }
  });

  it('has no campaign segment before the first game over', () => {
    const session = GameSession.start('g', makeCatalog(), DEFAULT_OPTIONS);

    expect(session.getCampaignSegments()).toEqual([]);
  });

  it('ignores campaign and parchment commands outside their phase', () => {
    const session = GameSession.start('g', makeCatalog(), DEFAULT_OPTIONS);
    const events = session.getEvents().length;

    session.execute({ type: 'continueCampaign' });
    session.execute({ type: 'dismissParchment' });

    expect(session.getState().phase).toBe(Phase.PLAYING);
    expect(session.getEvents()).toHaveLength(events);
  });
});

describe('development cheats', () => {
  const cheats = { ...DEFAULT_OPTIONS, allowCheats: true };

  it('moves cards between piles', () => {
    const session = tutorial(cheats);

    session.execute({ type: 'cheat', cheat: { op: 'discardCard', instanceIds: [5] } });
    expect(session.getState().discardPile).toContain(5);

    session.execute({ type: 'cheat', cheat: { op: 'destroyCard', instanceIds: [10] } });
    expect(session.getState().destroyedPile).toContain(10);
  });

  it('changes card state and adds stickers', () => {
    const session = tutorial(cheats);

    session.execute({ type: 'cheat', cheat: { op: 'chooseState', instanceId: 1, stateId: 2 } });
    expect(session.getState().instances[1].stateId).toBe(2);

    session.execute({ type: 'cheat', cheat: { op: 'addSticker', instanceId: 1, stickerId: 1 } });
    expect(Object.values(session.getState().instances[1].stickers).flat()).toContain(1);
  });

  it('draws and discovers cards', () => {
    const session = GameSession.start('g', makeCatalog(), cheats);
    const [drawable] = session.getState().drawPile;

    session.execute({ type: 'cheat', cheat: { op: 'drawCard', instanceIds: [drawable] } });
    session.execute({ type: 'cheat', cheat: { op: 'discoverCard', instanceIds: [11] } });

    expect(session.getState().board).toContain(drawable);
    expect(session.getState().discoveryPile).not.toContain(11);
  });
});
