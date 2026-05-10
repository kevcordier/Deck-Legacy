import {
  ICON_PASSTHROUGH,
  tCardActionLabel,
  tCardDescription,
  tCardName,
  tCardPassiveLabel,
  tCardTag,
} from '@helpers/cardI18n';
import type { TFunction } from 'i18next';
import { describe, expect, it, vi } from 'vitest';

const makeT = (translations: Record<string, string> = {}): TFunction =>
  ((key: string, opts?: Record<string, unknown>) => {
    return translations[key] ?? (opts?.defaultValue as string) ?? key;
  }) as unknown as TFunction;

// — tCardName —

describe('tCardName', () => {
  it('builds the correct key using state name and returns the translation', () => {
    const t = makeT({ 'names.Village': 'Village' });
    expect(tCardName(t, 'Village')).toBe('Village');
  });

  it('defaults stateName to empty string', () => {
    const t = makeT({ 'names.': 'Zero' });
    expect(tCardName(t)).toBe('Zero');
  });

  it('passes ns: cards to t', () => {
    const t = vi.fn().mockReturnValue('X') as unknown as TFunction;
    tCardName(t, 'Plains');
    expect(t).toHaveBeenCalledWith('names.Plains', { ns: 'cards' });
  });
});

// — tCardActionLabel —

describe('tCardActionLabel', () => {
  it('builds key with action ID and returns translation', () => {
    const t = makeT({ 'actions.1-2-1': 'Draw' });
    expect(tCardActionLabel(t, '1-2-1')).toBe('Draw');
  });

  it('returns fallback when key is missing', () => {
    const t = makeT();
    expect(tCardActionLabel(t, '5-3-2')).toBe('actions.5-3-2');
  });

  it('passes ICON_PASSTHROUGH values to t', () => {
    const t = vi.fn().mockReturnValue('X') as unknown as TFunction;
    tCardActionLabel(t, '12-1-1', 5);
    expect(t).toHaveBeenCalledWith('actions.12-1-1', {
      accumulated: 5,
      ...ICON_PASSTHROUGH,
      ns: 'cards',
    });
  });
});

// — tCardPassiveLabel —

describe('tCardPassiveLabel', () => {
  it('builds key with passive suffix and returns translation', () => {
    const t = makeT({ 'passives.4_0_p1': 'Passive' });
    expect(tCardPassiveLabel(t, '4_0_p1', 1)).toBe('Passive');
  });

  it('returns fallback when key is missing', () => {
    const t = makeT();
    expect(tCardPassiveLabel(t, '0_0_p0', 0)).toBe('passives.0_0_p0');
  });

  it('passes ICON_PASSTHROUGH values to t', () => {
    const t = vi.fn().mockReturnValue('X') as unknown as TFunction;
    tCardPassiveLabel(t, '1_2_p0', 0);
    expect(t).toHaveBeenCalledWith('passives.1_2_p0', {
      accumulated: 0,
      ...ICON_PASSTHROUGH,
      ns: 'cards',
    });
  });
});

// — tCardDescription —

describe('tCardDescription', () => {
  it('builds the correct key and returns the description', () => {
    const t = makeT({ 'descriptions.7-1-2': 'Gain 2 gold.' });
    expect(tCardDescription(t, 7, 1, 2)).toBe('Gain 2 gold.');
  });

  it('returns fallback when key is missing', () => {
    const t = makeT();
    expect(tCardDescription(t, 0, 0, 0)).toBe('descriptions.0-0-0');
  });

  it('does not pass ICON_PASSTHROUGH to t', () => {
    const t = vi.fn().mockReturnValue('X') as unknown as TFunction;
    tCardDescription(t, 1, 0, 0);
    expect(t).toHaveBeenCalledWith('descriptions.1-0-0', { ns: 'cards' });
  });
});

// — tCardTag —

describe('tCardTag', () => {
  it('returns the translated tag', () => {
    const t = makeT({ 'tags.person': 'Personne' });
    expect(tCardTag(t, 'person')).toBe('Personne');
  });

  it('returns the raw tag string as fallback', () => {
    const t = makeT();
    expect(tCardTag(t, 'unknown_tag')).toBe('tags.unknown_tag');
  });

  it('passes ns: cards to t', () => {
    const t = vi.fn().mockReturnValue('X') as unknown as TFunction;
    tCardTag(t, 'land');
    expect(t).toHaveBeenCalledWith('tags.land', { ns: 'cards' });
  });
});
