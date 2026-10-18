import type { CardInstance, ExpansionConfig } from '@deck-legacy/engine/domain/types';
import { cardNumber } from '@domain/card/cardNumber';
import { expansionOfInstance } from '@domain/card/expansionOfInstance';
import { describe, expect, it } from 'vitest';

const expansion = (ids: number[]): ExpansionConfig => ({
  purge: { permanent: 1, purge: 12 },
  campaign: ids.map(id => ({ id, cardId: id })),
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

describe('cardNumber', () => {
  it('reads the printed number of an expansion card from its deck entry', () => {
    const woods: ExpansionConfig = {
      ...expansion([]),
      campaign: [
        { id: 139, cardId: 1, number: 1 },
        { id: 140, cardId: 2, number: 2 },
      ],
    };

    expect(cardNumber(140, { ...expansions, 'Ridding the Woods': woods })).toEqual({
      expansion: 'Ridding the Woods',
      number: 2,
    });
  });

  it('keeps the global number of base and campaign cards', () => {
    expect(cardNumber(136, expansions)).toEqual({ expansion: 'Prosperity', number: 136 });
    expect(cardNumber(10, expansions)).toEqual({ expansion: undefined, number: 10 });
  });

  it('reads the expansion and number recorded on the instance', () => {
    const instance = { expansion: 'Ridding the Woods', expansionId: 3 } as CardInstance;

    expect(cardNumber(141, expansions, instance)).toEqual({
      expansion: 'Ridding the Woods',
      number: 3,
    });
  });
});
