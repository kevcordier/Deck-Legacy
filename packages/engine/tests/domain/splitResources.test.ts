import { makeState } from './fixtures';
import { isValidSplit } from '@engine/application/session/input/isValidSplit';
import { canAffordCost } from '@engine/domain/cards/canAffordCost';
import { resolveCost } from '@engine/domain/costResolver';
import { PendingChoiceType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('Cost of any resources, split by the player', () => {
  const state = makeState({ resources: { gold: 3, wood: 2, stone: 0 } });
  const cost = { anyResources: 4, forUpgrade: true };

  it('is affordable with enough resources in total', () => {
    expect(canAffordCost(cost, 1, state, {}, {})).toBe(true);
    expect(canAffordCost({ anyResources: 6 }, 1, state, {}, {})).toBe(false);
  });

  it('asks the player to split the total among the resources they have', () => {
    const [, pending] = resolveCost(cost, 1, state, {}, {});
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe(PendingChoiceType.SPLIT_RESOURCES);
    expect(pending[0].total).toBe(4);
    expect(pending[0].choices).toEqual([{ gold: 3, wood: 2 }]);
    expect(() => resolveCost({ anyResources: 6 }, 1, state, {}, {})).toThrow();
  });

  it('accepts only the asked total, within the resources available', () => {
    const [, [pending]] = resolveCost(cost, 1, state, {}, {});
    expect(isValidSplit({ gold: 2, wood: 2 }, pending)).toBe(true);
    expect(isValidSplit({ gold: 3 }, pending)).toBe(false);
    expect(isValidSplit({ gold: 1, wood: 3 }, pending)).toBe(false);
    expect(isValidSplit({ gold: 2, stone: 2 }, pending)).toBe(false);
  });
});
