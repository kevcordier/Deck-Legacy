import type { ExpansionConfig } from '@deck-legacy/engine/domain/types';
import { expansionOfInstance } from '@helpers/expansionIcon';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@components/ui/Icon/icon', () => import('./iconMock'));

const expansion = (ids: number[]): ExpansionConfig => ({
  purge: { permanent: 1, purge: 12 },
  deck: ids.map(id => ({ id, cardId: id })),
});

const expansions = { Prosperity: expansion([136]), 'The Water Mill': expansion([137, 139]) };

describe('expansionOfInstance', () => {
  it('returns the expansion whose deck brings the instance', () => {
    expect(expansionOfInstance(136, expansions)).toBe('Prosperity');
    expect(expansionOfInstance(139, expansions)).toBe('The Water Mill');
  });

  it('returns undefined for a base deck instance', () => {
    expect(expansionOfInstance(10, expansions)).toBeUndefined();
  });
});
