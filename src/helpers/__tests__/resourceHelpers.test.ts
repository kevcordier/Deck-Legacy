import React from 'react';
import { getResMeta, renderTextWithIcons } from '@helpers/renderHelpers';
import { describe, it, expect } from 'vitest';

// — getResMeta —

describe('getResMeta', () => {
  it('returns known meta for gold', () => {
    const meta = getResMeta('gold');
    expect(meta.cls).toBe('color:gold');
    expect(meta.label).toBe('resources.gold');
  });

  it('returns correct meta for each known resource', () => {
    expect(getResMeta('wood').label).toBe('resources.wood');
    expect(getResMeta('stone').label).toBe('resources.stone');
    expect(getResMeta('iron').label).toBe('resources.iron');
    expect(getResMeta('weapon').label).toBe('resources.weapon');
    expect(getResMeta('goods').label).toBe('resources.goods');
    expect(getResMeta('glory').label).toBe('resources.glory');
  });

  it('returns an icon component for every known resource', () => {
    const known = ['gold', 'wood', 'stone', 'iron', 'weapon', 'goods', 'glory'];
    for (const key of known) {
      expect(getResMeta(key).icon).toBeDefined();
    }
  });

  it('returns fallback meta for an unknown key', () => {
    const meta = getResMeta('unknown_resource');
    expect(meta.cls).toBe('color:gold');
    expect(meta.label).toBe('unknown_resource');
  });
});

// — renderTextWithIcons —

describe('renderTextWithIcons', () => {
  it('returns the plain string unchanged when no tokens are present', () => {
    expect(renderTextWithIcons('hello world')).toBe('hello world');
  });

  it('returns a React fragment for empty input', () => {
    expect(React.isValidElement(renderTextWithIcons(''))).toBe(true);
  });

  it('returns a React element when the text contains a single token', () => {
    const result = renderTextWithIcons('{{gold}}');
    expect(React.isValidElement(result)).toBe(true);
  });

  it('returns a React fragment when text has mixed content and tokens', () => {
    const result = renderTextWithIcons('Gain {{wood}} now');
    expect(React.isValidElement(result)).toBe(true);
  });

  it('handles a token at the start of the string', () => {
    const result = renderTextWithIcons('{{stone}} mined');
    expect(React.isValidElement(result)).toBe(true);
  });

  it('handles a token at the end of the string', () => {
    const result = renderTextWithIcons('Earn {{iron}}');
    expect(React.isValidElement(result)).toBe(true);
  });

  it('handles multiple tokens in the same string', () => {
    const result = renderTextWithIcons('{{gold}} and {{wood}}');
    expect(React.isValidElement(result)).toBe(true);
  });

  it('recognises all known resource tokens', () => {
    const tokens = ['gold', 'wood', 'stone', 'iron', 'weapon', 'goods', 'glory'];
    for (const token of tokens) {
      const result = renderTextWithIcons(`{{${token}}}`);
      expect(React.isValidElement(result)).toBe(true);
    }
  });
});
