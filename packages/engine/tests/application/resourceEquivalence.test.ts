import { makeState } from './fixtures';
import {
  dedupeResourceOptions,
  getPayableResourceCostVariants,
  getSourceResourceEquivalence,
} from '@engine/application/resourceEquivalence';
import { PassiveType, ResourceType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('resourceEquivalence', () => {
  it('deduplicates identical options and removes empty ones', () => {
    const result = dedupeResourceOptions([{ wood: 1 }, { wood: 1 }, {}, { goods: 1 }]);
    expect(result).toEqual([{ wood: 1 }, { goods: 1 }]);
  });

  it('returns undefined when no equivalence passive is present', () => {
    const gs = makeState({ boardEffects: {} });
    expect(getSourceResourceEquivalence(1, gs, {}, {})).toBeUndefined();
  });

  it('returns groups from RESOURCE_EQUIVALENCE passives', () => {
    const gs = makeState({
      boardEffects: {
        1: [
          {
            id: 'eq',
            type: PassiveType.RESOURCE_EQUIVALENCE,
            resources: { wood: 1, goods: 1 },
          },
        ],
      },
    });

    expect(getSourceResourceEquivalence(1, gs, {}, {})).toEqual({ groups: [['wood', 'goods']] });
  });

  it('without equivalence returns [] when exact cost cannot be paid', () => {
    const result = getPayableResourceCostVariants({ wood: 2 }, { wood: 1 });
    expect(result).toEqual([]);
  });

  it('without equivalence returns the exact cost when payable', () => {
    const result = getPayableResourceCostVariants({ wood: 1 }, { wood: 2 });
    expect(result).toEqual([{ wood: 1 }]);
  });

  it('returns [] when fixed non-equivalent resources cannot be afforded', () => {
    const result = getPayableResourceCostVariants(
      { wood: 1, gold: 1 },
      { wood: 1 },
      { groups: [[ResourceType.WOOD, ResourceType.GOODS]] },
    );
    expect(result).toEqual([]);
  });

  it('keeps fixed cost and allocates equivalent resources', () => {
    const result = getPayableResourceCostVariants(
      { wood: 1, gold: 1 },
      { wood: 1, goods: 1, gold: 1 },
      { groups: [[ResourceType.WOOD, ResourceType.GOODS]] },
    );
    expect(result).toContainEqual({ gold: 1, wood: 1 });
    expect(result).toContainEqual({ gold: 1, goods: 1 });
  });

  it('sanitizes non-positive and non-numeric resources in dedupe', () => {
    const result = dedupeResourceOptions([
      { wood: -1, goods: 0 },
      { wood: Number.NaN },
      { gold: 1 },
      { gold: 1 },
    ]);

    expect(result).toEqual([{ gold: 1 }]);
  });

  it('ignores RESOURCE_EQUIVALENCE passives with less than two usable resources', () => {
    const gs = makeState({
      boardEffects: {
        1: [
          {
            id: 'eq-single',
            type: PassiveType.RESOURCE_EQUIVALENCE,
            resources: { wood: 1 },
          },
          {
            id: 'eq-zero',
            type: PassiveType.RESOURCE_EQUIVALENCE,
            resources: { goods: 0, gold: 0 },
          },
        ],
      },
    });

    expect(getSourceResourceEquivalence(1, gs, {}, {})).toBeUndefined();
  });

  it('ignores RESOURCE_EQUIVALENCE passive entries without resources field', () => {
    const gs = makeState({
      boardEffects: {
        1: [
          {
            id: 'eq-empty',
            type: PassiveType.RESOURCE_EQUIVALENCE,
          },
        ],
      },
    });

    expect(getSourceResourceEquivalence(1, gs, {}, {})).toBeUndefined();
  });

  it('ignores undefined equivalence resource values', () => {
    const gs = makeState({
      boardEffects: {
        1: [
          {
            id: 'eq-undef',
            type: PassiveType.RESOURCE_EQUIVALENCE,
            resources: { wood: undefined as unknown as number, goods: 1 },
          },
        ],
      },
    });

    expect(getSourceResourceEquivalence(1, gs, {}, {})).toBeUndefined();
  });

  it('returns fixed cost only when no resource is required from equivalence groups', () => {
    const result = getPayableResourceCostVariants(
      { iron: 1 },
      { iron: 1, wood: 1, goods: 1 },
      { groups: [[ResourceType.WOOD, ResourceType.GOODS]] },
    );

    expect(result).toEqual([{ iron: 1 }]);
  });

  it('returns [] when required group total cannot be allocated from available resources', () => {
    const result = getPayableResourceCostVariants(
      { wood: 2 },
      { wood: 1, goods: 0 },
      { groups: [[ResourceType.WOOD, ResourceType.GOODS]] },
    );

    expect(result).toEqual([]);
  });

  it('returns [] without equivalence when required resource key is absent', () => {
    const result = getPayableResourceCostVariants({ wood: 1 }, {});
    expect(result).toEqual([]);
  });

  it('uses first matching equivalence group when resources overlap between groups', () => {
    const result = getPayableResourceCostVariants(
      { wood: 1 },
      { wood: 0, goods: 1, gold: 1 },
      {
        groups: [
          [ResourceType.WOOD, ResourceType.GOODS],
          [ResourceType.WOOD, ResourceType.GOLD],
        ],
      },
    );

    expect(result).toEqual([{ goods: 1 }]);
  });
});
