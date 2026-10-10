import { makeState } from '../fixtures';
import { SaveFromPurgeStrategy } from '@engine/application/cardAction/SaveFromPurgeStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('SaveFromPurgeStrategy', () => {
  const strategy = new SaveFromPurgeStrategy();

  it('returns original state when purgeState is missing', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.SAVE_FROM_PURGE,
      sourceInstanceId: 1,
    });
    expect(result).toBe(gs);
  });

  it('removes explicit instanceIds from selected purge ids', () => {
    const gs = makeState({
      purgeState: {
        batchSize: 2,
        permanentToPurge: 1,
        shuffledPool: [1, 2, 3],
        completedBatchStarts: [],
        selectedCardIds: [1, 2],
        selectedPermanentIds: [3],
        onPurgeTriggered: false,
        onStartDiscoverIds: [],
      },
    });

    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.SAVE_FROM_PURGE,
      sourceInstanceId: 99,
      instanceIds: [2, 3],
    });

    expect(result.purgeState?.selectedCardIds).toEqual([1]);
    expect(result.purgeState?.selectedPermanentIds).toEqual([]);
  });

  it('selects ids to save from selected pool using payload.value and excludes source', () => {
    const gs = makeState({
      purgeState: {
        batchSize: 3,
        permanentToPurge: 1,
        shuffledPool: [1, 2, 3],
        completedBatchStarts: [],
        selectedCardIds: [1, 2],
        selectedPermanentIds: [3],
        onPurgeTriggered: false,
        onStartDiscoverIds: [],
      },
    });

    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.SAVE_FROM_PURGE,
      sourceInstanceId: 1,
      value: 1,
    });

    expect(result.purgeState?.selectedCardIds).toEqual([1]);
    expect(result.purgeState?.selectedPermanentIds).toEqual([3]);
  });

  it('returns original state when value resolves to no ids to save', () => {
    const gs = makeState({
      purgeState: {
        batchSize: 1,
        permanentToPurge: 0,
        shuffledPool: [1],
        completedBatchStarts: [],
        selectedCardIds: [1],
        selectedPermanentIds: [],
        onPurgeTriggered: false,
        onStartDiscoverIds: [],
      },
    });

    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.SAVE_FROM_PURGE,
      sourceInstanceId: 1,
      value: -1,
    });

    expect(result).toBe(gs);
  });

  it('returns original state when explicit ids are empty and value is undefined', () => {
    const gs = makeState({
      purgeState: {
        batchSize: 1,
        permanentToPurge: 0,
        shuffledPool: [1],
        completedBatchStarts: [],
        selectedCardIds: [1],
        selectedPermanentIds: [],
        onPurgeTriggered: false,
        onStartDiscoverIds: [],
      },
    });

    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.SAVE_FROM_PURGE,
      sourceInstanceId: 1,
    });

    expect(result).toBe(gs);
  });
});
