import {
  ICON_PASSTHROUGH,
  tCardActionDescription,
  tCardActionLabel,
  tCardName,
  tCardPassiveDescription,
  tCardPassiveLabel,
  tCardStateDescription,
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
  it('builds the correct key and returns the translation', () => {
    const t = makeT({ 'names.3_2': 'Village' });
    expect(tCardName(t, 3, 2)).toBe('Village');
  });

  it('defaults cardId, stateId to 0', () => {
    const t = makeT({ 'names.0_0': 'Zero' });
    expect(tCardName(t)).toBe('Zero');
  });

  it('passes ns: cards to t', () => {
    const t = vi.fn().mockReturnValue('X') as unknown as TFunction;
    tCardName(t, 5, 1);
    expect(t).toHaveBeenCalledWith('names.5_1', { ns: 'cards' });
  });
});

// — tCardActionLabel —

describe('tCardActionLabel', () => {
  it('builds key with action suffix and returns translation', () => {
    const t = makeT({ 'labels.2_1_a0': 'Draw' });
    expect(tCardActionLabel(t, 2, 1, 0)).toBe('Draw');
  });

  it('returns fallback when key is missing', () => {
    const t = makeT();
    expect(tCardActionLabel(t, 1, 0, 0)).toBe('labels.1_0_a0');
  });

  it('passes ICON_PASSTHROUGH values to t', () => {
    const t = vi.fn().mockReturnValue('X') as unknown as TFunction;
    tCardActionLabel(t, 1, 2, 3);
    expect(t).toHaveBeenCalledWith('labels.1_2_a3', {
      ...ICON_PASSTHROUGH,
      ns: 'cards',
    });
  });
});

// — tCardPassiveLabel —

describe('tCardPassiveLabel', () => {
  it('builds key with passive suffix and returns translation', () => {
    const t = makeT({ 'labels.4_0_p1': 'Passive' });
    expect(tCardPassiveLabel(t, 4, 0, 1)).toBe('Passive');
  });

  it('returns fallback when key is missing', () => {
    const t = makeT();
    expect(tCardPassiveLabel(t, 0, 0, 0)).toBe('labels.0_0_p0');
  });

  it('passes ICON_PASSTHROUGH values to t', () => {
    const t = vi.fn().mockReturnValue('X') as unknown as TFunction;
    tCardPassiveLabel(t, 1, 2, 0);
    expect(t).toHaveBeenCalledWith('labels.1_2_p0', {
      ...ICON_PASSTHROUGH,
      ns: 'cards',
    });
  });
});

// — tCardActionDescription —

describe('tCardActionDescription', () => {
  it('builds the correct key and returns the description', () => {
    const t = makeT({ 'descriptions.7_1_a2': 'Gain 2 gold.' });
    expect(tCardActionDescription(t, 7, 1, 2)).toBe('Gain 2 gold.');
  });

  it('returns fallback when key is missing', () => {
    const t = makeT();
    expect(tCardActionDescription(t, 0, 0, 0)).toBe('descriptions.0_0_a0');
  });

  it('does not pass ICON_PASSTHROUGH to t', () => {
    const t = vi.fn().mockReturnValue('X') as unknown as TFunction;
    tCardActionDescription(t, 1, 0, 0);
    expect(t).toHaveBeenCalledWith('descriptions.1_0_a0', { ns: 'cards' });
  });
});

// — tCardStateDescription —

describe('tCardStateDescription', () => {
  it('builds key without action/passive suffix', () => {
    const t = makeT({ 'descriptions.3_0': 'State desc.' });
    expect(tCardStateDescription(t, 3, 0)).toBe('State desc.');
  });

  it('returns fallback when key is missing', () => {
    const t = makeT();
    expect(tCardStateDescription(t, 0, 0)).toBe('descriptions.0_0');
  });

  it('passes ns: cards to t', () => {
    const t = vi.fn().mockReturnValue('X') as unknown as TFunction;
    tCardStateDescription(t, 2, 1);
    expect(t).toHaveBeenCalledWith('descriptions.2_1', { ns: 'cards' });
  });
});

// — tCardPassiveDescription —

describe('tCardPassiveDescription', () => {
  it('builds key with passive suffix', () => {
    const t = makeT({ 'descriptions.5_2_p0': 'Passive desc.' });
    expect(tCardPassiveDescription(t, 5, 2, 0)).toBe('Passive desc.');
  });

  it('returns fallback when key is missing', () => {
    const t = makeT();
    expect(tCardPassiveDescription(t, 0, 0, 0)).toBe('descriptions.0_0_p0');
  });

  it('does not pass ICON_PASSTHROUGH to t', () => {
    const t = vi.fn().mockReturnValue('X') as unknown as TFunction;
    tCardPassiveDescription(t, 3, 1, 2);
    expect(t).toHaveBeenCalledWith('descriptions.3_1_p2', { ns: 'cards' });
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
    expect(tCardTag(t, 'unknown_tag')).toBe('unknown_tag');
  });

  it('passes ns: cards to t', () => {
    const t = vi.fn().mockReturnValue('X') as unknown as TFunction;
    tCardTag(t, 'land');
    expect(t).toHaveBeenCalledWith('tags.land', { ns: 'cards', defaultValue: 'land' });
  });
});
