import { makeState } from '../fixtures';
import { ResourceType } from '@engine/domain/enums';
import { getOfferedResources } from '@engine/domain/resources/getOfferedResources';
import { describe, expect, it } from 'vitest';

const BASE = [
  ResourceType.GOLD,
  ResourceType.WOOD,
  ResourceType.STONE,
  ResourceType.IRON,
  ResourceType.WEAPON,
  ResourceType.GOODS,
];

describe('getOfferedResources', () => {
  it('offers the six base resources in a kingdom without foundation', () => {
    expect(getOfferedResources(makeState())).toEqual(BASE);
  });

  it('also offers the resources a foundation unlocked', () => {
    const state = makeState({ unlockedResources: [ResourceType.SCIENCE] });
    expect(getOfferedResources(state)).toEqual([...BASE, ResourceType.SCIENCE]);
  });
});
