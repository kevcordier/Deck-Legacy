import { GameEventType } from '@deck-legacy/engine/domain/enums';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
import type { CardInstance, GameEvent, GameState } from '@deck-legacy/engine/domain/types';
import { findUpgradeReveal } from '@presentation/board/findUpgradeReveal';
import { describe, expect, it } from 'vitest';

const instance = (id: number, stateId: number): CardInstance => ({
  id,
  cardId: id,
  stateId,
  stickers: {},
  trackProgress: [],
  cumulated: 0,
  usedActionIds: [],
  glories: [],
  removedResourcesByState: {},
});

const state = (...instances: CardInstance[]): GameState => ({
  ...EMPTY_STATE,
  instances: Object.fromEntries(instances.map(inst => [inst.id, inst])),
});

const upgrade = (cardInstanceId: number, stateId: number) =>
  ({ type: GameEventType.UPGRADE_CARD, cardInstanceId, stateId }) as unknown as GameEvent;

describe('findUpgradeReveal', () => {
  it('returns the last upgraded card before and after its upgrade', () => {
    const previous = state(instance(1, 1), instance(2, 1));
    const next = state(instance(1, 2), instance(2, 3));
    expect(findUpgradeReveal(previous, next, [upgrade(1, 2), upgrade(2, 3)])).toEqual({
      before: instance(2, 1),
      after: instance(2, 3),
    });
  });

  it('returns null without an upgrade (other commands, rewind)', () => {
    const current = state(instance(1, 1));
    const other = { type: GameEventType.TURN_ENDED } as unknown as GameEvent;
    expect(findUpgradeReveal(current, current, [other])).toBeNull();
    expect(findUpgradeReveal(current, current, [])).toBeNull();
  });
});
