import { makeState } from '../fixtures';
import { AddToPurgeStrategy } from '@engine/application/cardAction/AddToPurgeStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import type { PurgeState } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const purgeState: PurgeState = {
  batchSize: 1,
  permanentToPurge: 0,
  shuffledPool: [1, 2, 3],
  completedBatchStarts: [],
  selectedCardIds: [1],
  selectedPermanentIds: [],
  onPurgeTriggered: true,
  onStartDiscoverIds: [],
};

const payload = (instanceIds?: number[]) => ({
  id: '9-1',
  type: ActionEffectType.ADD_TO_PURGE,
  sourceInstanceId: 9,
  instanceIds,
});

describe('AddToPurgeStrategy', () => {
  it('adds the chosen cards to the purge selection once', () => {
    const gs = makeState({ purgeState });
    const result = new AddToPurgeStrategy().apply(gs, payload([2, 1]));
    expect(result.purgeState?.selectedCardIds).toEqual([1, 2]);
  });

  it('does nothing without a purge or without chosen cards', () => {
    const noPurge = makeState();
    expect(new AddToPurgeStrategy().apply(noPurge, payload([2]))).toBe(noPurge);
    const gs = makeState({ purgeState });
    expect(new AddToPurgeStrategy().apply(gs, payload())).toBe(gs);
  });
});
